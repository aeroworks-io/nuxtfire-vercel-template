import firebase from 'firebase/app'
import 'firebase/firestore'
import DocumentReference = firebase.firestore.DocumentReference
import CollectionReference = firebase.firestore.CollectionReference
import Timestamp = firebase.firestore.Timestamp

const staticSymbol = '__static__'

interface StaticReferenceBase {
  [staticSymbol]: true
}

interface StaticDocumentReference extends StaticReferenceBase {
  type: 'document'
  path: string
}

interface StaticCollectionReference extends StaticReferenceBase {
  type: 'collection'
  path: string
}

interface ReferenceTypeMap {
  document: DocumentReference
  collection: CollectionReference
}

type StaticReference = StaticDocumentReference | StaticCollectionReference
type Reference = DocumentReference | CollectionReference

export function isStatic(obj: any): obj is StaticReference {
  return obj?.[staticSymbol]
}

export function isDocumentReference(obj: any): obj is DocumentReference {
  return obj instanceof DocumentReference || (obj && obj.firebase && obj.collection)
}

export function isCollectionReference(obj: any): obj is CollectionReference {
  return obj instanceof CollectionReference || (obj && obj.firebase && obj.doc)
}

export function isTimestamp(obj: any): obj is Timestamp {
  return obj && obj.toDate
}

export function isDate(obj: any): obj is Date {
  return obj && obj?.toTimeString
}

/**
 * Firestoreのデータから再起的にReferenceを取り除く（StaticReferenceに置き換える）
 * @param obj
 */
export function serialize<T>(obj: T): T {
  if (typeof obj !== 'object' || !obj) return obj as any
  if (isDocumentReference(obj)) return { [staticSymbol]: true, type: 'document', path: obj.path } as any
  if (isCollectionReference(obj)) return { [staticSymbol]: true, type: 'collection', path: obj.path } as any
  if (isStatic(obj)) return obj as any
  if (isTimestamp(obj)) return obj.toDate() as any
  if (isDate(obj)) return obj as any
  if (Array.isArray(obj)) return obj.map(serialize) as any
  return Object.entries(obj)
    .map(([key, value]) => [key, serialize(value)])
    .reduce((res, [key, value]) => ({ ...res, [key]: value }), {}) as any
}

/**
 * StaticReferenceになっている物をもとに戻す。
 * @param obj
 */
export function deserialize<T>(obj: T): T {
  if (typeof obj !== 'object' || !obj) return obj as any
  if (isStatic(obj)) return getReference(obj) as any
  if (isCollectionReference(obj) || isDocumentReference(obj)) return obj as any
  if (isDate(obj)) return Timestamp.fromDate((obj as any) as Date) as any
  if (isTimestamp(obj)) return obj as any
  if (Array.isArray(obj)) return obj.map(serialize) as any
  const result: any = {}
  for (const [key, value] of Object.entries(obj)) {
    result[key] = deserialize(value)
  }
  return result
}

type CoalesceRef<T extends StaticReference | Reference> = T extends StaticReference ? ReferenceTypeMap[T['type']] : T

/**
 * StaticReference・Referenceを気にせずにアクセスするためのやつ
 * @param ref
 */
export function getReference<T extends StaticReference | Reference>(ref: T): CoalesceRef<T> | undefined {
  if (isStatic(ref)) {
    if (ref.type === 'document') return firebase.firestore().doc(ref.path) as CoalesceRef<T>
    if (ref.type === 'collection') return firebase.firestore().collection(ref.path) as CoalesceRef<T>
  }
  return ref as CoalesceRef<T>
}
