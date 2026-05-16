import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components"
import { toast } from "react-toastify";
import { appIcons } from "src/index";
import { uploadProjectModel } from "@db/models";

export interface LoadModelBtnState {
  components: OBC.Components
  /** Project the uploaded model will be stored under. */
  projectId: string
}

export const loadModelBtnTemplate: BUI.StatefullComponent<LoadModelBtnState> = (
  state,
) => {
  const { components, projectId } = state

  const onLoadIfc = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.accept = ".ifc";

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      const name = file.name.replace(/\.ifc$/i, "");

      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const ifcLoader = components.get(OBC.IfcLoader)

      const loadingToast = toast.loading(`Procesando "${name}"...`);
      try {
        const model = await ifcLoader.load(
          bytes,
          true, // automatically coordinate (position) the model relative to others
          name, // ID with which the model will be loaded into memory
        );

        // Convert the loaded IFC to the compact .frag format and store it,
        // so future sessions load the much smaller file from the cloud.
        const fragBuffer = await model.getBuffer(false);
        await uploadProjectModel(projectId, {
          name,
          buffer: fragBuffer,
          sourceFormat: "ifc",
        });

        toast.update(loadingToast, {
          render: `"${name}" cargado y guardado en la nube`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } catch (error) {
        console.error(error);
        toast.update(loadingToast, {
          render: `Error al cargar "${name}"`,
          type: "error",
          isLoading: false,
          autoClose: 4000,
        });
      }
    })

    input.click();
  }

  const onLoadFrag = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.accept = ".frag";

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      const name = file.name.replace(/\.frag$/i, "");

      const buffer = await file.arrayBuffer();

      const loadingToast = toast.loading(`Cargando "${name}"...`);
      try {
        const fragments = components.get(OBC.FragmentsManager)
        await fragments.core.load(buffer, { modelId: name })

        await uploadProjectModel(projectId, {
          name,
          buffer,
          sourceFormat: "frag",
        });

        toast.update(loadingToast, {
          render: `"${name}" cargado y guardado en la nube`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } catch (error) {
        console.error(error);
        toast.update(loadingToast, {
          render: `Error al cargar "${name}"`,
          type: "error",
          isLoading: false,
          autoClose: 4000,
        });
      }
    })

    input.click();
  }

  return BUI.html`<bim-button icon=${appIcons.ADD}>
  <bim-context-menu>
  <bim-button class="transparent" @click=${onLoadIfc} label="Cargar IFC"></bim-button>
  <bim-button class="transparent" @click=${onLoadFrag} label="Cargar FRAG"></bim-button>
  </bim-context-menu></bim-button>`
}
