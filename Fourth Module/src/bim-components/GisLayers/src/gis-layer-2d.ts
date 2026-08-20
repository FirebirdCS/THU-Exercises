import {
    Viewer,
    SceneMode,
    OpenStreetMapImageryProvider,
    Cartographic,
    Math as CesiumMath,
    Cartesian3,
    Entity,
    Color,
    ScreenSpaceEventHandler,
    defined,
    ScreenSpaceEventType,
  } from "cesium";
  import * as FRAGS from "@thatopen/fragments";
  
  export class GisLayer2d {
  
      container = document.createElement("div");
      private _marker?: Entity;
      private _viewer?: Viewer;
  
      onCoordinatesSelectedInMap = new FRAGS.Event<{
          longitude: number;
          latitude: number;
      }>();
  
      constructor() {
          this.container.style.height = "20rem";
          this.container.style.width = "100%";
          this.container.style.height = "19rem";
          this.container.style.borderRadius = "0.5rem";
          this.container.style.overflow = "clip";
          this.container.style.margin = "0";
          this.container.style.padding = "0";
          this.container.innerText = "Porfavor ingresa un token de Ces!";
      }
  
      dispose() {
          if(this._viewer) {
              this._viewer.destroy();
          }
      }
  
      setMarkerPosition(longitude: number, latitude: number) {
          this._setMarkerPosition(Cartesian3.fromDegrees(longitude, latitude));
      }
  
      notifyTokenChanged() {
  
          if (this._viewer) {
              this._viewer.destroy();
          }
  
          this.container.innerText = "";
  
          this._viewer = new Viewer(this.container, {
              sceneMode: SceneMode.SCENE2D,
              animation: false,
              timeline: false,
              baseLayerPicker: false,
              geocoder: true,
              homeButton: false,
              infoBox: false,
              scene3DOnly: false,
              navigationHelpButton: false,
              vrButton: false,
              fullscreenButton: false,
          });
  
          this._viewer.imageryLayers.removeAll();
  
          this._viewer.imageryLayers.addImageryProvider(
              new OpenStreetMapImageryProvider({
                  url: "https://a.tile.openstreetmap.org/",
              })
          );
  
          this._marker = this._viewer.entities.add({
              position: Cartesian3.fromDegrees(-122.4194, 37.7749),
              point: {
                  pixelSize: 10,
                  color: new Color(0.3137, 0.7137, 0.9019, 1.0),
                  outlineColor: Color.WHITE,
                  outlineWidth: 2,
              },
          });
  
          const handler = new ScreenSpaceEventHandler(this._viewer.canvas);
  
          handler.setInputAction((click: any) => {
              const cartesian = this._viewer!.scene.pickPosition(click.position);
              if (defined(cartesian)) {
                  this._setMarkerPosition(cartesian);
                  const cartographic = Cartographic.fromCartesian(cartesian);
                  const longitude = CesiumMath.toDegrees(cartographic.longitude);
                  const latitude = CesiumMath.toDegrees(cartographic.latitude);
                  this.onCoordinatesSelectedInMap.trigger({ longitude, latitude });
              }
          }, ScreenSpaceEventType.LEFT_CLICK);
  
      }
  
      private _setMarkerPosition(value: Cartesian3) {
          if (!this._marker) {
              throw new Error("Marker not initialized!");
          }
          (this._marker.position as any) = value;
      }
    
  }