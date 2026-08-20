import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { SmartView, SmartViewJSON } from "./src";
import { DataMap } from "@thatopen/fragments";

export class SmartViews extends OBC.Component {
    static uuid = "91c93702-0017-4690-9441-dade32965bbc" as const;
    readonly list = new DataMap<string, SmartView>();
    enabled = true;

    currentState: SmartView = {
        name: "SmartView",
        defaultVisibility: true,
        visibilityExceptions: {},
        colors: {},
      };
    
      addQueryColor(color: string, query: string) {
        let queriesColors = this.currentState.colors.queries;
        if (!queriesColors) {
          queriesColors = {};
          this.currentState.colors.queries = queriesColors;
        }
    
        let queriesList = queriesColors[color];
        if (!queriesList) {
          queriesList = new Set();
          queriesColors[color] = queriesList;
        }
    
        queriesList.add(query);
      }
    
      clone(view = this.currentState) {
        const clone: SmartView = {
          name: view.name,
          defaultVisibility: view.defaultVisibility,
          visibilityExceptions: {},
          colors: {},
        };
    
        if (view.colors.items) {
          clone.colors.items = {}
          for (const [style, map] of Object.entries(view.colors.items)) {
            clone.colors.items[style] = OBC.ModelIdMapUtils.clone(map);
          }
        }
    
        if (view.colors.queries) {
          clone.colors.queries = {};
          for (const [style, names] of Object.entries(view.colors.queries)) {
            const set = new Set<string>();
            for (const name of names) {
              set.add(name)
            };
            clone.colors.queries[style] = set;
          }
        }
    
        if (view.visibilityExceptions.queries) {
          const queries = new Set<string>();
          for (const name of view.visibilityExceptions.queries) {
            queries.add(name);
          }
          clone.visibilityExceptions.queries = queries;
        }
    
        if (view.visibilityExceptions.items) {
          clone.visibilityExceptions.items = OBC.ModelIdMapUtils.clone(
            view.visibilityExceptions.items,
          );
        }
    
        return clone;
      }
    
      saveCurrentState(name: string) {
        const smartView = this.clone();
        smartView.name = name
        const id = OBC.UUID.create()
        this.list.set(id, smartView)
        return { id, smartView }
      }

      /**
       * Overwrites an existing saved view with the current working state,
       * keeping the view's original name. Used by the "update" button so a
       * view can be refreshed after applying it and changing colors.
       */
      updateView(id: string) {
        const existing = this.list.get(id);
        if (!existing) return;
        const updated = this.clone();
        updated.name = existing.name;
        this.list.set(id, updated);
        return updated;
      }

      /* ---------------------------------------------------------------------
       * Serialization. A SmartView holds Sets and ModelIdMaps; these methods
       * convert to/from plain JSON (arrays + raw ModelIdMaps) so views can be
       * stored in Firebase and rebuilt exactly as the user authored them.
       * ------------------------------------------------------------------- */

      serializeView(view: SmartView): SmartViewJSON {
        const json: SmartViewJSON = {
          name: view.name,
          defaultVisibility: view.defaultVisibility,
          colors: {},
          visibilityExceptions: {},
        };

        if (view.colors.queries) {
          json.colors.queries = {};
          for (const [color, names] of Object.entries(view.colors.queries)) {
            json.colors.queries[color] = [...names];
          }
        }

        if (view.colors.items) {
          json.colors.items = {};
          for (const [style, map] of Object.entries(view.colors.items)) {
            json.colors.items[style] = OBC.ModelIdMapUtils.toRaw(map);
          }
        }

        if (view.visibilityExceptions.queries) {
          json.visibilityExceptions.queries = [...view.visibilityExceptions.queries];
        }

        if (view.visibilityExceptions.items) {
          json.visibilityExceptions.items = OBC.ModelIdMapUtils.toRaw(
            view.visibilityExceptions.items,
          );
        }

        return json;
      }

      deserializeView(json: SmartViewJSON): SmartView {
        const view: SmartView = {
          name: json.name,
          defaultVisibility: json.defaultVisibility,
          colors: {},
          visibilityExceptions: {},
        };

        if (json.colors.queries) {
          view.colors.queries = {};
          for (const [color, names] of Object.entries(json.colors.queries)) {
            view.colors.queries[color] = new Set(names);
          }
        }

        if (json.colors.items) {
          view.colors.items = {};
          for (const [style, raw] of Object.entries(json.colors.items)) {
            view.colors.items[style] = OBC.ModelIdMapUtils.fromRaw(raw);
          }
        }

        if (json.visibilityExceptions.queries) {
          view.visibilityExceptions.queries = new Set(
            json.visibilityExceptions.queries,
          );
        }

        if (json.visibilityExceptions.items) {
          view.visibilityExceptions.items = OBC.ModelIdMapUtils.fromRaw(
            json.visibilityExceptions.items,
          );
        }

        return view;
      }

      /** Serializes every stored view, keyed by its id. */
      export(): Record<string, SmartViewJSON> {
        const data: Record<string, SmartViewJSON> = {};
        for (const [id, view] of this.list) {
          data[id] = this.serializeView(view);
        }
        return data;
      }

      /** Rebuilds views from serialized data and adds them to the list. */
      import(data: Record<string, SmartViewJSON>) {
        for (const [id, json] of Object.entries(data)) {
          this.list.set(id, this.deserializeView(json));
        }
      }

      async reset() {
        const highlighter = this.components.get(OBF.Highlighter);
        const hider = this.components.get(OBC.Hider);
        const promises = [highlighter.clear(), hider.set(true)];
        await Promise.all(promises);
    
        this.currentState = {
          name: "SmartView",
          defaultVisibility: true,
          visibilityExceptions: {},
          colors: {},
        };
      }

    
    async apply(view: SmartView) {
        if (!this.enabled) return;
        const { defaultVisibility, visibilityExceptions, colors } = view;

        const highlighter = this.components.get(OBF.Highlighter);
        const hider = this.components.get(OBC.Hider);
        const finder = this.components.get(OBC.ItemsFinder);

        // Reset first (clears highlights + shows everything) so it can't race
        // with the visibility/color operations below. Running it inside the
        // same Promise.all let hider.set(true) fight hider.set(defaultVisibility).
        await this.reset();

        const promises = [hider.set(defaultVisibility)];

        if (visibilityExceptions.items) {
        promises.push(hider.set(!defaultVisibility, visibilityExceptions.items));
        }

        if (visibilityExceptions.queries) {
        const queryPromises: Promise<OBC.ModelIdMap>[] = [];
        for (const name of visibilityExceptions.queries) {
            const finderQuery = finder.list.get(name);
            if (!finderQuery) continue;
            queryPromises.push(finderQuery.test());
        }
        const maps = await Promise.all(queryPromises);
        const map = OBC.ModelIdMapUtils.join(maps);
        promises.push(hider.set(!defaultVisibility, map));
        }

        const colorsMap = new Map<string, OBC.ModelIdMap>();
        const addStyleMap = (color: string, map: OBC.ModelIdMap) => {
        let colorMap = colorsMap.get(color);
        if (!colorMap) {
            colorMap = {};
            colorsMap.set(color, colorMap);
        }
        OBC.ModelIdMapUtils.add(colorMap, map);
        };

        if (colors.queries) {
        for (const [color, queryNames] of Object.entries(colors.queries)) {
            const queryPromises: Promise<OBC.ModelIdMap>[] = []
            for (const name of queryNames) {
            const finderQuery = finder.list.get(name);
            if (!finderQuery) continue;
            queryPromises.push(finderQuery.test())
            }
            const maps = await Promise.all(queryPromises);
            const map = OBC.ModelIdMapUtils.join(maps);
            addStyleMap(color, map);
        }
        }

        if (colors.items) {
        for (const [style, map] of Object.entries(colors.items)) {
            addStyleMap(style, map);
        }
        }

        for (const [color, map] of colorsMap.entries()) {
        if (!highlighter.styles.has(color)) {
            highlighter.styles.set(color, {
            color: new THREE.Color(color),
            renderedFaces: 1,
            opacity: 1,
            transparent: false,
            });
        }
        promises.push(highlighter.highlightByID(color, map));
        }

        await Promise.all(promises);

        this.currentState = this.clone(view);
    }
  
}


export * from "./src";
