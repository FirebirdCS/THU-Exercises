import * as OBC from "@thatopen/components"
import fragmentsWorkerUrl from "@thatopen/fragments/dist/Worker/worker.mjs?url"

export const setupFragmentsManager = (
  components: OBC.Components,
  world: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBC.SimpleRenderer>,
  isTorndown: () => boolean = () => false,
) => {
  const fragments = components.get(OBC.FragmentsManager);
  fragments.init(fragmentsWorkerUrl);

  fragments.list.onItemSet.add(async ({ value: model }) => {
    // The page can unmount (e.g. logout) while a model is still loading.
    // Once the engine is disposed, touching `fragments.core` throws an
    // unhandled rejection, so bail out / swallow it during teardown.
    if (isTorndown()) return;
    try {
      const finder = components.get(OBC.ItemsFinder)
      for (const [, query] of finder.list) {
        query.clearCache()
      }

      model.useCamera(world.camera.three);

      world.scene.three.add(model.object);
      await fragments.core.update(true);
    } catch (e) {
      if (!isTorndown()) throw e
    }
  })

  world.camera.controls.addEventListener("rest", async () => {
    if (isTorndown()) return;
    try {
      await fragments.core.update(true);
    } catch (e) {
      if (!isTorndown()) throw e
    }
  });
}