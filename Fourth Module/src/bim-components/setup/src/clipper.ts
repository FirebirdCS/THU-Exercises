import * as THREE from "three"
import * as OBC from "@thatopen/components"

export const setupClipper = (
  components: OBC.Components,
  world: OBC.World,
  viewport: HTMLElement,
) => {
  const clipper = components.get(OBC.Clipper)

  clipper.enabled = true
  clipper.config.color = new THREE.Color("#202932")
  clipper.config.opacity = 0.2
  clipper.config.size = 5
  // Scale each plane to the scene bounds; otherwise size=5 is tiny on a
  // building-scale IFC and the plane helper becomes hard to hit on hover-delete.
  clipper.autoScalePlanes = true

  // Bump the raycaster's line/point thresholds so the plane's thin arrow
  // indicator is easier to land on when pressing Delete/Backspace.
  const raycaster = components.get(OBC.Raycasters).get(world)
  raycaster.three.params.Line = { ...raycaster.three.params.Line, threshold: 0.5 }
  raycaster.three.params.Points = { ...raycaster.three.params.Points, threshold: 0.5 }

  // Double-click creates a plane (single click is reserved for selection so
  // the highlighter and the clipper don't fight over the same gesture).
  viewport.addEventListener("dblclick", () => {
    if (!clipper.enabled) return
    clipper.create(world)
  })

  // Keydown is bound to window so Delete/Backspace works without the
  // viewport being focused. Guarded by clipper.enabled so it's a no-op
  // whenever the user hasn't activated the tool from the toolbar.
  window.addEventListener("keydown", (event) => {
    if (!clipper.enabled) return
    if (event.code !== "Delete" && event.code !== "Backspace") return
    clipper.delete(world)
  })
}
