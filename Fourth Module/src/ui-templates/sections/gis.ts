import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import { GisLayers, getModelGeoReference } from "src/bim-components";
import type { GisProvider } from "src/bim-components";
import { appIcons } from "src/index";

export interface GisPanelState {
    components: OBC.Components;
}

let onMapUpdate: any;

export const gisPanelTemplate: BUI.StatefullComponent<GisPanelState> = (
    state
) => {
    const { components } = state;
    const worlds = components.get(OBC.Worlds)
    const world = worlds.list.values().next().value as OBC.SimpleWorld;
    const camera = world.camera.three as THREE.PerspectiveCamera;
	const gisLayers = components.get(GisLayers);
	const tokenId = "that-open-cesium-token";

    const longitudeInput = BUI.Component.create<BUI.NumberInput>(() => {
	    return BUI.html`
	  <bim-number-input style="max-height: min-content; min-width: 0; flex: 1;" pref="Longitud"
	  slider value="0" min="-180" max="180" step="0.0001">
	  </bim-number-input>
	`;
	});

    const latitudeInput = BUI.Component.create<BUI.NumberInput>(() => {
	    return BUI.html`
	  <bim-number-input style="max-height: min-content; min-width: 0; flex: 1;" pref="Latitud"
	   slider value="0" min="-90" max="90" step="0.0001">
	  </bim-number-input>
	`;
	});

    const heightInput = BUI.Component.create<BUI.NumberInput>(() => {
	    return BUI.html`
	  <bim-number-input style="max-height: min-content;" pref="Altura"
	  slider value="0" min="-500" max="5000" step="1" suffix=" m">
	  </bim-number-input>
	`;
	});

	const enableInput = BUI.Component.create<BUI.Selector>(() => {
		return BUI.html`
			<bim-selector class="disabled">
				<bim-option label="On" value="${true}"></bim-option>
				<bim-option label="Off" value="${false}" checked></bim-option>
			</bim-selector>
		`;
	});

	const updateEnableInput = (enable: boolean) => {
		if (enable) {
			enableInput.classList.remove("disabled");
		} else {
			enableInput.classList.add("disabled");
		}
	}

	const providerInput = BUI.Component.create<BUI.Selector>(() => {
		return BUI.html`
			<bim-selector>
				<bim-option label="Satélite" value="satellite" ${gisLayers.layer3d.provider === "satellite" ? "checked" : ""}></bim-option>
				<bim-option label="Google 3D" value="google" ${gisLayers.layer3d.provider === "google" ? "checked" : ""}></bim-option>
			</bim-selector>
		`;
	});

	const onProviderChange = (e: Event) => {
		const selector = e.target as BUI.Selector;
		gisLayers.layer3d.provider = selector.value as GisProvider;
	}

	providerInput.addEventListener("change", onProviderChange);

    const onInputToken = (e: Event) => {
	    const input = e.target as BUI.TextInput;
	    const token = input.value;
		updateEnableInput(token.length > 0);
		gisLayers.cesiumToken = token;
		localStorage.setItem(tokenId, token);
	};

    const onEnable = (e: Event) => {
	    const selector = e.target as BUI.Selector;
		gisLayers.layer3d.enabled = selector.value;
	};

    const onLongLatChanged = () => {
	    const longitude = longitudeInput.value;
	    const latitude = latitudeInput.value;
		gisLayers.layer2d.setMarkerPosition(longitude, latitude);
		gisLayers.layer3d.longitude = longitude;
		gisLayers.layer3d.latitude = latitude;
		gisLayers.layer3d.updateMapPosition();
	}

    const onHeightChanged = (e: Event) => {
	    const input = e.target as BUI.NumberInput;
	    gisLayers.layer3d.height = input.value;
		gisLayers.layer3d.updateMapPosition();
	}

    const onRotationChanged = (e: Event) => {
	    const input = e.target as BUI.NumberInput;
	    gisLayers.layer3d.rotation = input.value * THREE.MathUtils.DEG2RAD;
		gisLayers.layer3d.updateMapPosition();
	}

    const onCameraRangeChanged = (e: Event) => {
	    const input = e.target as BUI.NumberInput;
	    camera.far = input.value;
	    camera.updateProjectionMatrix();
	}

	const locationStatus = BUI.Component.create<BUI.Label>(() => {
		return BUI.html`<bim-label style="white-space: normal;"></bim-label>`;
	});
	locationStatus.style.display = "none";

	const setStatus = (message: string) => {
		locationStatus.textContent = message;
		locationStatus.style.display = message ? "block" : "none";
	}

	const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

	const applyGeoReference = (longitude: number, latitude: number, elevation?: number) => {
		longitudeInput.value = round6(longitude);
		latitudeInput.value = round6(latitude);
		// These are plain fields; setting them now means the map will initialize
		// at the model's location even if the Cesium token is entered later
		// (notifyTokenChanged seeds the reorientation plugin from them).
		gisLayers.layer3d.longitude = longitude;
		gisLayers.layer3d.latitude = latitude;
		// Use the model's reference elevation as the ellipsoidal height so the
		// map's terrain lines up with the models instead of floating above them.
		if (elevation !== undefined) {
			heightInput.value = elevation;
			gisLayers.layer3d.height = elevation;
		}
		try {
			gisLayers.layer2d.setMarkerPosition(longitude, latitude);
			gisLayers.layer3d.updateMapPosition();
		} catch {
			// Map not initialized yet (no Cesium token). Coordinates are stored
			// and will be applied automatically once the token is entered.
		}
	}

	const onUseModelLocation = async () => {
		setStatus("Buscando ubicación en el modelo...");
		try {
			const geoRef = await getModelGeoReference(components);
			if (!geoRef) {
				setStatus(
					"El modelo no tiene coordenadas georreferenciadas (IfcSite sin RefLatitude/RefLongitude)."
				);
				return;
			}
			applyGeoReference(geoRef.longitude, geoRef.latitude, geoRef.elevation);
			setStatus(
				`Ubicación del modelo: ${geoRef.latitude.toFixed(6)}, ${geoRef.longitude.toFixed(6)}`
			);
		} catch (error) {
			console.error("No se pudo leer la georreferenciación del modelo", error);
			setStatus("No se pudo leer la georreferenciación del modelo.");
		}
	}

    longitudeInput.addEventListener("change", onLongLatChanged);
	latitudeInput.addEventListener("change", onLongLatChanged);
	heightInput.addEventListener("change", onHeightChanged);
	enableInput.addEventListener("change", onEnable);

	const previousToken = localStorage.getItem(tokenId) || "";
	updateEnableInput(previousToken.length > 0);
	if(previousToken.length) {
		gisLayers.cesiumToken = previousToken;
	}

	if (onMapUpdate) {
		gisLayers.layer2d.onCoordinatesSelectedInMap.remove(onMapUpdate);
	}

	onMapUpdate = (data: { longitude: number, latitude: number }) => {
		const { longitude, latitude } = data;
		const factor = 1e6;
		longitudeInput.value = Math.round(longitude * factor) / factor;
		latitudeInput.value = Math.round(latitude * factor) / factor;
	}

	gisLayers.layer2d.onCoordinatesSelectedInMap.add(onMapUpdate);

    return BUI.html`
	<bim-panel-section fixed label="GIS">

        <div style="display: flex; gap: 0.5rem;">

			${enableInput}

            <bim-text-input 
				value="${previousToken}"
				style="max-height: min-content;" @input=${onInputToken} 
				placeholder="Ingresa token de Cesium..." debounce="200">
			</bim-text-input>

        </div>

        <div style="display: flex; gap: 0.5rem; min-width: 0;">

			${longitudeInput}

			${latitudeInput}

		</div>

        ${heightInput}

        <bim-button
				label="Usar ubicación del modelo"
				icon="${appIcons.FOCUS}"
				style="flex: 0; max-height: min-content;"
				@click=${onUseModelLocation}>
			</bim-button>

			${locationStatus}

        <div style="display: flex; gap: 0.5rem; align-items: center;">
				<bim-label>Proveedor:</bim-label>
				${providerInput}
			</div>

        <bim-number-input style="max-height: min-content;" pref="Rango de camara"
			slider value="${camera.far}" min="100" max="10000" step="50" @change=${onCameraRangeChanged}>
		</bim-number-input>

        <bim-number-input
			style="max-height: min-content;" pref="Rotacion"
			slider value="0" min="0" max="360" @change=${onRotationChanged}>
		</bim-number-input>
		${gisLayers.layer2d.container}
	
	</bim-panel-section>`;
};