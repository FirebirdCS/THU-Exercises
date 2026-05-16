import { v4 as uuidv4 } from "uuid"
import * as Firestore from "firebase/firestore"
import {
  ref as storageRef,
  uploadBytes,
  getBytes,
  deleteObject,
} from "firebase/storage"
import { firestoreDB, storage, auth } from "./index"

export type ModelSourceFormat = "ifc" | "frag"

export interface IModelMetadata {
  /** Document id, also the model id used by the fragments engine. */
  id: string
  /** Human friendly name (original file name without extension). */
  name: string
  /** File name stored in Cloud Storage, e.g. `<id>.frag`. */
  fileName: string
  /** Full Cloud Storage path. */
  storagePath: string
  /** File size in bytes of the stored `.frag`. */
  size: number
  /** Original format the user uploaded. IFC files are converted to `.frag`. */
  sourceFormat: ModelSourceFormat
  /** When the model was uploaded. */
  uploadedAt: Date
  /** Email (or uid) of the user that uploaded it. */
  uploadedBy: string
}

const modelsCollectionPath = (projectId: string) =>
  `projects/${projectId}/models`

const modelStoragePath = (projectId: string, modelId: string) =>
  `projects/${projectId}/models/${modelId}.frag`

interface UploadModelParams {
  /** Display name (original file name without extension). */
  name: string
  /** The `.frag` data to store. For IFC uploads this is the converted buffer. */
  buffer: ArrayBuffer
  /** Original format the user picked. */
  sourceFormat: ModelSourceFormat
}

/**
 * Uploads a model's `.frag` data to Cloud Storage and writes its metadata
 * document to Firestore under the given project.
 */
export async function uploadProjectModel(
  projectId: string,
  params: UploadModelParams,
): Promise<IModelMetadata> {
  const { name, buffer, sourceFormat } = params
  const id = uuidv4()
  const fileName = `${id}.frag`
  const path = modelStoragePath(projectId, id)

  const fileRef = storageRef(storage, path)
  await uploadBytes(fileRef, new Uint8Array(buffer), {
    contentType: "application/octet-stream",
  })

  const uploadedBy = auth.currentUser?.email ?? auth.currentUser?.uid ?? "unknown"

  const docRef = Firestore.doc(firestoreDB, modelsCollectionPath(projectId), id)
  await Firestore.setDoc(docRef, {
    name,
    fileName,
    storagePath: path,
    size: buffer.byteLength,
    sourceFormat,
    uploadedAt: Firestore.serverTimestamp(),
    uploadedBy,
  })

  return {
    id,
    name,
    fileName,
    storagePath: path,
    size: buffer.byteLength,
    sourceFormat,
    uploadedAt: new Date(),
    uploadedBy,
  }
}

/** Reads the metadata of every model stored for a project. */
export async function getProjectModels(
  projectId: string,
): Promise<IModelMetadata[]> {
  const collection = Firestore.collection(
    firestoreDB,
    modelsCollectionPath(projectId),
  )
  const snapshot = await Firestore.getDocs(collection)
  const models: IModelMetadata[] = []
  for (const doc of snapshot.docs) {
    const data = doc.data()
    const uploadedAt = data.uploadedAt as Firestore.Timestamp | undefined
    models.push({
      id: doc.id,
      name: data.name,
      fileName: data.fileName,
      storagePath: data.storagePath,
      size: data.size,
      sourceFormat: data.sourceFormat,
      uploadedAt: uploadedAt ? uploadedAt.toDate() : new Date(),
      uploadedBy: data.uploadedBy ?? "unknown",
    })
  }
  return models
}

/** Downloads a stored `.frag` file as an ArrayBuffer ready for the engine. */
export async function downloadProjectModel(
  storagePath: string,
): Promise<ArrayBuffer> {
  const fileRef = storageRef(storage, storagePath)
  return getBytes(fileRef)
}

/** Removes a model from both Cloud Storage and Firestore. */
export async function deleteProjectModel(
  projectId: string,
  modelId: string,
  storagePath: string,
) {
  await deleteObject(storageRef(storage, storagePath))
  await Firestore.deleteDoc(
    Firestore.doc(firestoreDB, modelsCollectionPath(projectId), modelId),
  )
}

/**
 * Removes every stored model (Cloud Storage file + Firestore metadata) of a
 * project. Used when the whole project is deleted.
 *
 * Resilient on purpose: a failure on one model (e.g. the file is already
 * gone) is logged and the rest still get cleaned up. Returns how many
 * metadata documents were removed.
 */
export async function deleteAllProjectModels(
  projectId: string,
): Promise<number> {
  const models = await getProjectModels(projectId)
  let removed = 0
  for (const model of models) {
    try {
      await deleteObject(storageRef(storage, model.storagePath))
    } catch (e) {
      // File may already be missing; still drop the metadata below.
      console.error(
        `No se pudo eliminar el archivo "${model.storagePath}"`,
        e,
      )
    }
    try {
      await Firestore.deleteDoc(
        Firestore.doc(firestoreDB, modelsCollectionPath(projectId), model.id),
      )
      removed++
    } catch (e) {
      console.error(
        `No se pudo eliminar el metadato del modelo "${model.id}"`,
        e,
      )
    }
  }
  return removed
}

/**
 * Deletes the stored model whose display name matches `name`. The fragments
 * engine identifies models by this name (it is the `modelId` we load them
 * with), so this is what we get from the models panel's delete button.
 *
 * Returns `true` if a matching model was found and removed.
 */
export async function deleteProjectModelByName(
  projectId: string,
  name: string,
): Promise<boolean> {
  const models = await getProjectModels(projectId)
  const match = models.find((model) => model.name === name)
  if (!match) return false
  await deleteProjectModel(projectId, match.id, match.storagePath)
  return true
}
