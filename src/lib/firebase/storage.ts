import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseStorage } from "./client";

export async function uploadCompanyFile(params: {
  companyId: string;
  file: File;
  pathPrefix?: string;
}) {
  const safeName = params.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = [
    "companies",
    params.companyId,
    params.pathPrefix ?? "uploads",
    `${Date.now()}-${safeName}`,
  ].join("/");

  const fileRef = ref(getFirebaseStorage(), storagePath);
  await uploadBytes(fileRef, params.file);
  const downloadUrl = await getDownloadURL(fileRef);

  return {
    downloadUrl,
    name: params.file.name,
    size: params.file.size,
    storagePath,
    type: params.file.type,
  };
}
