import * as OBC from "@thatopen/components"

export const setupFragmentsManager = (components: OBC.Components, world: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBC.SimpleRenderer>) => {
  const fragments = components.get(OBC.FragmentsManager);
  fragments.init("/node_modules/@thatopen/fragments/dist/Worker/worker.mjs");

  fragments.list.onItemSet.add(async ({ value: model }) => {

    model.useCamera(world.camera.three);


    world.scene.three.add(model.object);
    await fragments.core.update(true);
  })

  world.camera.controls.addEventListener("rest", async () => {
    await fragments.core.update(true);
  });
}