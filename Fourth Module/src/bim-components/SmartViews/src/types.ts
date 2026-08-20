import * as OBC from "@thatopen/components";

export type ViewColors = {
    queries?: Record<string, Set<string>>;
    items?: Record<string, OBC.ModelIdMap>;
};

export interface ViewExceptions {
    queries?: Set<string>;
    items?:OBC.ModelIdMap;
};

export interface SmartView {
    name: string;
    colors: ViewColors;
    defaultVisibility: boolean;
    visibilityExceptions: ViewExceptions;
}

/* ---------------------------------------------------------------------------
 * Serializable mirrors of the types above. A SmartView holds Sets and
 * ModelIdMaps, neither of which survive JSON.stringify / Firestore. These
 * plain shapes replace every Set with an array and every ModelIdMap with its
 * raw `{ [modelId]: number[] }` form (via OBC.ModelIdMapUtils.toRaw/fromRaw).
 * ------------------------------------------------------------------------- */

export type RawModelIdMap = { [modelId: string]: number[] };

export type ViewColorsJSON = {
    queries?: Record<string, string[]>;
    items?: Record<string, RawModelIdMap>;
};

export interface ViewExceptionsJSON {
    queries?: string[];
    items?: RawModelIdMap;
}

export interface SmartViewJSON {
    name: string;
    colors: ViewColorsJSON;
    defaultVisibility: boolean;
    visibilityExceptions: ViewExceptionsJSON;
}