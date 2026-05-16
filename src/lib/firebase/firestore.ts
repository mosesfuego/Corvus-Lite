import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirebaseDb } from "./client";

type FirestoreWrite = Record<string, unknown>;

export async function upsertDocument(
  collectionPath: string,
  id: string,
  data: FirestoreWrite,
) {
  await setDoc(doc(getFirebaseDb(), collectionPath, id), data, { merge: true });
}

export async function getDocument<T = DocumentData>(
  collectionPath: string,
  id: string,
) {
  const snapshot = await getDoc(doc(getFirebaseDb(), collectionPath, id));

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as T & { id: string };
}

export async function listCompanyDocuments<T = DocumentData>(
  collectionPath: string,
  companyId: string,
  maxCount = 25,
) {
  const constraints: QueryConstraint[] = [
    where("companyId", "==", companyId),
    orderBy("updatedAt", "desc"),
    limit(maxCount),
  ];

  const snapshot = await getDocs(
    query(collection(getFirebaseDb(), collectionPath), ...constraints),
  );

  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as T & { id: string },
  );
}
