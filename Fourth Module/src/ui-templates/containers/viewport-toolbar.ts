import * as BUI from "@thatopen/ui"
import * as OBC from "@thatopen/components"
import * as OBF from "@thatopen/components-front"
import { appIcons } from "src/index"
import * as THREE from "three"
import * as FRAGS from "@thatopen/fragments"

export interface ViewerToolbarState {
    components: OBC.Components
    world: OBC.World
}

const originalMaterialsData = new Map<
  FRAGS.BIMMaterial,
  { color: number; transparent: boolean; opacity: number; lodOpacity?: number }
>();


export const viewerToolbarTemplate : BUI.StatefullComponent<ViewerToolbarState> = (state) => {
    const { components, world } = state

    let colorInput: BUI.ColorInput | undefined

    const onInputCreated = (e?: Element) => {
        if (!e) return
        colorInput = e as BUI.ColorInput
    }
    
    const onApplyColor = async ({target: button}: {target: BUI.Button}) => {
        if (!colorInput) return
        const { color } = colorInput
        const highlighter = components.get(OBF.Highlighter)
        const selection = highlighter.selection.select;

        if (OBC.ModelIdMapUtils.isEmpty(selection)) return
        button.loading = true
        const modelIdMap = selection.modelIdMap
        for (const modelId in modelIdMap) {
            const model = modelIdMap[modelId]
            if (!model) continue
            model.material.color.set(color)
        }
        if (!highlighter.styles.has(color)) {
            highlighter.styles.set(color, {
                color: new THREE.Color(color),
                opacity: 1,
                renderedFaces: 1,
                transparent: false,
            })
        }
        
        // Apply the custom color first so the elements stay registered as a
        // highlighted selection (under the color's style id), then drop the
        // "select" tint so the chosen color is visible. Order matters: the
        // items must be registered before "select" is cleared so the data
        // panel can keep showing them.
        await highlighter.highlightByID(color, selection, false, false)
        await highlighter.clear("select")

        button.loading = false
        BUI.ContextMenu.removeMenus()
    }

    const onReset = async ({ target }: { target: BUI.Button }) => {
        target.loading = true;
        const highlighter = components.get(OBF.Highlighter)
        await highlighter.clear()
        BUI.ContextMenu.removeMenus()
        target.loading = false;
    };

    const onToggleBackground = ({ target: button }: { target: BUI.Button }) => {
        const [world] = components.get(OBC.Worlds).list.values()
        if (!world?.scene) return
        const scene = world.scene.three as THREE.Scene
        scene.background = scene.background ? null : new THREE.Color("white")
        button.label = scene.background ? "Blanco" : "Transparente"
    }

    const onToggleGrid = ({ target: button }: { target: BUI.Button }) => {
        const grid = components.get(OBC.Grids).list.get(world.uuid)
        if (!grid) return
        grid.three.visible = !grid.three.visible
        button.label = grid.three.visible ? "Ocultar cuadrícula" : "Mostrar cuadrícula"
    }

    const onHide = async ({ target }: { target: BUI.Button }) => {
        const highlighter = components.get(OBF.Highlighter);
        const selection = highlighter.selection.select;
        if (OBC.ModelIdMapUtils.isEmpty(selection)) return;
        target.loading = true;
        const hider = components.get(OBC.Hider);
        const promises = [hider.set(false, selection), highlighter.clear("select")];
        await Promise.all(promises);
        target.loading = false;
    }

    const onIsolate = async ({ target }: { target: BUI.Button }) => {
        const highlighter = components.get(OBF.Highlighter);
        const selection = highlighter.selection.select;
        if (OBC.ModelIdMapUtils.isEmpty(selection)) return;
        target.loading = true;
        const hider = components.get(OBC.Hider);
        await hider.isolate(selection);
        target.loading = false;
    };

    const onShowAll = async ({ target }: { target: BUI.Button }) => {
        target.loading = true;
        const hider = components.get(OBC.Hider);
        await hider.set(true);
        target.loading = false;
    };

    const setModelTransparency = (opacity: number) => {
        const fragments = components.get(OBC.FragmentsManager);
        const materials = [...fragments.core.models.materials.list.values()];
    
        for (const material of materials) {
          if (material.userData.customId) continue;
          let color: number | undefined;
          let lodOpacity: number | undefined
          if ("color" in material) {
            color = material.color.getHex();
          } else {
            color = material.lodColor.getHex();
            lodOpacity = material.uniforms.lodOpacity.value
          }
    
          originalMaterialsData.set(material, {
            color,
            transparent: material.transparent,
            opacity: material.opacity,
            lodOpacity
          });
    
          material.transparent = true;
          if ("color" in material) {
            material.opacity = opacity;
            material.color.setColorName("white");
          } else {
            material.uniforms.lodColor.value.setColorName("white")
            material.uniforms.lodOpacity.value = opacity
          }
          material.needsUpdate = true;
        }
      }
    
      const restoreTransparency = () => {
        for (const [material, data] of originalMaterialsData) {
          const { color, transparent, opacity, lodOpacity } = data;
    
          material.transparent = transparent;
          if ("color" in material) {
            material.opacity = opacity;
            material.color.setHex(color);
          } else {
            material.uniforms.lodColor.value.setHex(color)
            material.uniforms.lodOpacity.value = lodOpacity
          }
          material.needsUpdate = true;
        }
    
        originalMaterialsData.clear();
      }
    
      const onToggleGhost = () => {
        if (originalMaterialsData.size > 0) {
          restoreTransparency();
        }  else {
          setModelTransparency(0.05);
        }
      }

      const onFocus = async ({ target }: { target: BUI.Button }) => {
        if (!(world.camera instanceof OBC.SimpleCamera)) return;
        const highlighter = components.get(OBF.Highlighter)
        const selection = highlighter.selection.select;
        target.loading = true;
        await world.camera.fitToItems(
          OBC.ModelIdMapUtils.isEmpty(selection) ? undefined : selection,
        );
        target.loading = false;
      };

    return BUI.html`<bim-toolbar>
     <bim-toolbar-section label="Visibilidad" icon=${appIcons.SHOW}>
        <bim-button icon=${appIcons.SHOW} label="Mostrar todo" @click=${onShowAll}></bim-button>
        <bim-button icon=${appIcons.TRANSPARENCY} label="Modo fantasma" @click=${onToggleGhost}></bim-button>
      </bim-toolbar-section>
     <bim-toolbar-section label="Selección" icon=${appIcons.SELECT}>
        <bim-button icon=${appIcons.FOCUS} label="Encuadrar" @click=${onFocus}></bim-button>
        <bim-button icon=${appIcons.HIDE} label="Ocultar" @click=${onHide}></bim-button>
        <bim-button icon=${appIcons.ISOLATE} label="Aislar" @click=${onIsolate}></bim-button>
        <bim-button icon=${appIcons.COLORIZE} label="Colorear">
        <bim-context-menu>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
               <bim-color-input ${BUI.ref(onInputCreated)} ></bim-color-input>
               <div style="display: flex; gap: 0.5rem;">
                    <bim-button @click=${onApplyColor} icon=${appIcons.APPLY} label="Aplicar"></bim-button>
                    <bim-button icon=${appIcons.CLEAR} label="Restablecer" @click=${onReset}></bim-buttom>
               </div>
            </div>
        </bim-context-menu>
        </bim-button>
     </bim-toolbar-section>
     <bim-toolbar-section icon=${appIcons.SCENE} label="Escena">
        <bim-button label="Blanco" @click=${onToggleBackground}></bim-button>
        <bim-button icon=${appIcons.GRID} label="Ocultar cuadrícula" @click=${onToggleGrid}></bim-button>
     </bim-toolbar-section>
    </bim-toolbar>`
}