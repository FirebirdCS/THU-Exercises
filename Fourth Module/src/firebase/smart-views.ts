import * as Firestore from "firebase/firestore"
import { firestoreDB } from "./index"
import type { SmartViewJSON } from "src/bim-components/SmartViews"

const smartViewsCollectionPath = (projectId: string) =>
  `projects/${projectId}/smartViews`

/** A stored smart view: its document id plus the serialized definition. */
export interface StoredSmartView {
  id: string
  json: SmartViewJSON
}

/**
 * Creates or overwrites a smart view document for a project. The document id
 * is the smart view's id so updates from the UI replace the same record.
 */
export async function saveProjectSmartView(
  projectId: string,
  id: string,
  json: SmartViewJSON,
) {
  const docRef = Firestore.doc(
    firestoreDB,
    smartViewsCollectionPath(projectId),
    id,
  )
  await Firestore.setDoc(docRef, json)
}

/** Reads every smart view stored for a project. */
export async function getProjectSmartViews(
  projectId: string,
): Promise<StoredSmartView[]> {
  const collection = Firestore.collection(
    firestoreDB,
    smartViewsCollectionPath(projectId),
  )
  const snapshot = await Firestore.getDocs(collection)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    json: doc.data() as SmartViewJSON,
  }))
}

/** Removes a single smart view document. */
export async function deleteProjectSmartView(projectId: string, id: string) {
  await Firestore.deleteDoc(
    Firestore.doc(firestoreDB, smartViewsCollectionPath(projectId), id),
  )
}

/**
 * Removes every smart view of a project. Used when the whole project is
 * deleted. Resilient on purpose: a failure on one document is logged and the
 * rest still get cleaned up. Returns how many documents were removed.
 */
export async function deleteAllProjectSmartViews(
  projectId: string,
): Promise<number> {
  const views = await getProjectSmartViews(projectId)
  let removed = 0
  for (const view of views) {
    try {
      await deleteProjectSmartView(projectId, view.id)
      removed++
    } catch (e) {
      console.error(
        `No se pudo eliminar la vista inteligente "${view.id}"`,
        e,
      )
    }
  }
  return removed
}
