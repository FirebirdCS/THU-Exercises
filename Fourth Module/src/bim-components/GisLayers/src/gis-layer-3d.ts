import * as THREE from "three";
import * as OBC from "@thatopen/components";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { Ion } from "cesium";

import { TilesRenderer } from "3d-tiles-renderer";

import {
  TilesFadePlugin,
  TileCompressionPlugin,
  GLTFExtensionsPlugin,
  ReorientationPlugin,
  XYZTilesPlugin,
} from "3d-tiles-renderer/plugins";

import {
  CesiumIonAuthPlugin,
} from "3d-tiles-renderer/core/plugins";

// Global satellite imagery (standard XYZ scheme), draped on the ellipsoid.
// Unlike Google's photorealistic 3D Tiles or OSM Buildings, this covers every
// location on Earth and needs no Cesium Ion asset.
const ESRI_WORLD_IMAGERY =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

// "satellite" = global ESRI imagery on the ellipsoid (works anywhere).
// "google"    = Google photorealistic 3D Tiles via Cesium Ion (city coverage only).
export type GisProvider = "satellite" | "google";

export class GisLayer3d {
	latitude: number = 51.50282464311485;
	longitude: number = -0.12729679399810487;
	rotation: number = 0;
	// Ellipsoidal height (meters) of the point that maps to the scene origin.
	// Raising it pulls the map's terrain down to meet models that sit at z=0,
	// fixing the "model is underneath the 3D map" offset (terrain + geoid gap).
	height: number = 0;

    private _enabled = false;
	private _resolutionSet = false;
	private _initialized = false;
	private _provider: GisProvider = "satellite";
	private _reorientationPlugin?: ReorientationPlugin;
	private _tilesRenderer?: TilesRenderer;
	private _updateInterval?: NodeJS.Timeout;
	private _components?: OBC.Components;

    get provider() {
		return this._provider;
	}

    set provider(value: GisProvider) {
		if (value === this._provider) return;
		this._provider = value;
		// Rebuild the tileset with the new provider's plugins. Only possible once
		// the map has been initialized (i.e. a Cesium token has been entered).
		if (this._initialized) this.notifyTokenChanged();
	}

    get enabled() {
		return this._enabled;
	}

    set enabled(value: boolean) {
		this._enabled = value;
		if (!this._initialized) return;
		const world = this.getWorld();
		if (value) {
			world.scene.three.add(this._tilesRenderer!.group);
			this.updateTiles();
		} else {
			world.scene.three.remove(this._tilesRenderer!.group);
		}
	}

    constructor(components: OBC.Components) {
		this._components = components;

		this._updateInterval = setInterval(() => {
			this.updateTiles();
		}, 300);

		const world = this.getWorld();
		world.camera.controls.maxDistance = 100000;
		world.camera.controls.addEventListener("control", () => {
			this.updateTiles();
		});
	}

    dispose() {
		if (this._updateInterval) {
			clearInterval(this._updateInterval);
		}
		if (this._tilesRenderer) {
			this._tilesRenderer.dispose();
		}
	}

    updateMapPosition() {
		if (!this._reorientationPlugin) {
			throw new Error("Reorientation plugin not found!");
		}
		this._reorientationPlugin.transformLatLonHeightToOrigin(
			this.latitude * THREE.MathUtils.DEG2RAD,
			this.longitude * THREE.MathUtils.DEG2RAD,
			this.height,
			this.rotation
		);
		this.updateTiles();
	}

    updateTiles() {
		if (!this._enabled) return;
		if (!this._initialized) return;
		if (!this._resolutionSet) {
			const world = this.getWorld();
			this._tilesRenderer!.setResolutionFromRenderer(
				world.camera.three,
				world.renderer!.three
			);
			this._resolutionSet = true;
		}
		this._tilesRenderer!.update();
	}

    notifyTokenChanged() {

        const world = this.getWorld();

        if (this._tilesRenderer) {
			// Remove the previous tileset from the scene before disposing it,
			// otherwise its (now dead) group lingers when we rebuild — e.g. on
			// a provider switch or a token re-entry.
			world.scene.three.remove(this._tilesRenderer.group);
			this._tilesRenderer.dispose();
		}
		this._tilesRenderer = new TilesRenderer();
		this._resolutionSet = false;

        this._reorientationPlugin = new ReorientationPlugin({
			lat: this.latitude * THREE.MathUtils.DEG2RAD,
			lon: this.longitude * THREE.MathUtils.DEG2RAD,
			height: this.height,
			recenter: true,
		});

        if (this._provider === "google") {
			// Google photorealistic 3D Tiles via Cesium Ion. Real 3D buildings,
			// but coverage is city-by-city (e.g. nothing in Guatemala).
			const cesiumIonPlugin = new CesiumIonAuthPlugin({
				apiToken: Ion.defaultAccessToken,
				assetId: "2275207",
				autoRefreshToken: true,
			});
			const dracoLoader = new DRACOLoader().setDecoderPath("/resources/draco/");
			this._tilesRenderer.registerPlugin(cesiumIonPlugin);
			this._tilesRenderer.registerPlugin(new TileCompressionPlugin());
			this._tilesRenderer.registerPlugin(new TilesFadePlugin());
			this._tilesRenderer.registerPlugin(this._reorientationPlugin);
			this._tilesRenderer.registerPlugin(new GLTFExtensionsPlugin({ dracoLoader }));
		} else {
			// Global satellite imagery as the base tileset, projected onto the
			// ellipsoid. It generates its own tiles (no Cesium Ion endpoint), so
			// it works for any location. No fade plugin here: its screen-door
			// (stippled) fade-in shows up as a glitch while navigating imagery.
			this._tilesRenderer.registerPlugin(
				new XYZTilesPlugin({ url: ESRI_WORLD_IMAGERY, shape: "ellipsoid" })
			);
			this._tilesRenderer.registerPlugin(new TileCompressionPlugin());
			this._tilesRenderer.registerPlugin(this._reorientationPlugin);
		}

        this._tilesRenderer.setCamera(world.camera.three);
		this._tilesRenderer.setResolutionFromRenderer(
			world.camera.three,
			world.renderer!.three
		);

        this._tilesRenderer.addEventListener("load-tileset", () => {
			const sphere = new THREE.Sphere();
			this._tilesRenderer!.getBoundingSphere(sphere);
			world.camera.three.updateProjectionMatrix();
		});

        if (this._enabled) {
			world.scene.three.add(this._tilesRenderer.group);
		}

        this._initialized = true;

	}

    private getWorld() {
		if(!this._components) {
			throw new Error("Components not initialized!")
		}
		const worlds = this._components.get(OBC.Worlds);
		return worlds.list.values().next().value as OBC.SimpleWorld<
			OBC.SimpleScene,
			OBC.OrthoPerspectiveCamera,
			OBC.SimpleRenderer
		>;
	}
}