import * as OBC from "@thatopen/components";

export interface GeoReference {
    /** Decimal degrees, east positive. */
    longitude: number;
    /** Decimal degrees, north positive. */
    latitude: number;
    /** Reference elevation in meters, if present. */
    elevation?: number;
    /** Model the georeference was read from. */
    modelId: string;
}

/**
 * IfcCompoundPlaneAngleMeasure -> decimal degrees.
 * The measure is stored as a list of integers
 * `[degrees, minutes, seconds, millionths-of-a-second]`. The sign is carried
 * by the first non-zero component (normally the degrees).
 */
const compoundAngleToDegrees = (parts: number[]): number | null => {
    if (!parts.length) return null;
    const [deg = 0, min = 0, sec = 0, millionths = 0] = parts;
    const magnitude =
        Math.abs(deg) +
        Math.abs(min) / 60 +
        Math.abs(sec) / 3600 +
        Math.abs(millionths) / (3600 * 1e6);
    const sign = parts.find((p) => p !== 0);
    return sign !== undefined && sign < 0 ? -magnitude : magnitude;
};

/**
 * Attribute values coming from `getItemsData` can be shaped a few different
 * ways depending on the attribute type (a bare array, an array of
 * `{ value }` objects, or `{ value: [...] }`). Normalize any of them to a flat
 * list of numbers.
 */
const toNumberList = (raw: any): number[] | null => {
    if (raw === undefined || raw === null) return null;
    const candidate = Array.isArray(raw) ? raw : raw.value;
    if (!Array.isArray(candidate)) return null;
    const nums = candidate.map((part) =>
        typeof part === "number" ? part : Number(part?.value ?? part)
    );
    if (nums.some((n) => Number.isNaN(n))) return null;
    return nums;
};

/**
 * Reads the real-world location of the loaded model(s) from their IfcSite
 * (`RefLatitude` / `RefLongitude` / `RefElevation`). Returns the first valid
 * georeference found, or `null` when no loaded model carries one — which is
 * common, as many IFC files are modeled at a local origin with no
 * georeferencing at all.
 */
export const getModelGeoReference = async (
    components: OBC.Components
): Promise<GeoReference | null> => {
    const fragments = components.get(OBC.FragmentsManager);

    for (const [modelId, model] of fragments.list) {
        const sites = await model.getItemsOfCategories([/IFCSITE/i]);
        const localIds = Object.values(sites).flat();
        if (!localIds.length) continue;

        const itemsData = await model.getItemsData(localIds);
        for (const data of itemsData) {
            const latParts = toNumberList((data as any)?.RefLatitude);
            const lonParts = toNumberList((data as any)?.RefLongitude);
            if (!latParts || !lonParts) continue;

            const latitude = compoundAngleToDegrees(latParts);
            const longitude = compoundAngleToDegrees(lonParts);
            if (latitude === null || longitude === null) continue;
            // [0, 0] is "null island" — treat an unset site as no georeference.
            if (latitude === 0 && longitude === 0) continue;

            const elevRaw = (data as any)?.RefElevation?.value;
            const elevation = typeof elevRaw === "number" ? elevRaw : undefined;

            return { longitude, latitude, elevation, modelId };
        }
    }

    return null;
};
