import * as OBC from "@thatopen/components";
import { Ion } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { GisLayer2d, GisLayer3d } from "./src";

export * from "./src";

export class GisLayers extends OBC.Component {
	static uuid = "85782b7e-319b-495a-aa98-fa061ec37ed7" as const;
	enabled = true;

    layer3d: GisLayer3d;
    layer2d: GisLayer2d;
	private _cesiumToken: string | null = null;

    get cesiumToken(): string {
		if(!this._cesiumToken) {
			throw new Error("Cesium token not initialized!");
		}
		return this._cesiumToken;
	}

    set cesiumToken(value: string) {
		this._cesiumToken = value;
		Ion.defaultAccessToken = value;
		this.layer3d.notifyTokenChanged();
        this.layer2d.notifyTokenChanged();
		this.layer2d.setMarkerPosition(this.layer3d.longitude, this.layer3d.latitude);
	}

    constructor(components: OBC.Components) {
		super(components);
		(window as any).CESIUM_BASE_URL = "/public/resources/cesium";
		this.layer3d = new GisLayer3d(components);
        this.layer2d = new GisLayer2d();
		this.layer2d.onCoordinatesSelectedInMap.add(({ longitude, latitude }) => {
			this.layer3d.longitude = longitude;
			this.layer3d.latitude = latitude;
			this.layer3d.updateMapPosition();
		});
	}

}