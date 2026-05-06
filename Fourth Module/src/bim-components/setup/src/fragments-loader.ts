import * as OBC from "@thatopen/components"
import fragmentsWorkerUrl from "@thatopen/fragments/dist/Worker/worker.mjs?url"

export const setupFragmentsManager = (components: OBC.Components, world: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBC.SimpleRenderer>) => {
  const fragments = components.get(OBC.FragmentsManager);
  fragments.init(fragmentsWorkerUrl);

  fragments.list.onItemSet.add(async ({ value: model }) => {

    const finder = components.get(OBC.ItemsFinder)
    for (const [, query] of finder.list) {
      query.clearCache()
    }

    model.useCamera(world.camera.three);


    world.scene.three.add(model.object);
    await fragments.core.update(true);
  })

  world.camera.controls.addEventListener("rest", async () => {
    await fragments.core.update(true);
  });
}