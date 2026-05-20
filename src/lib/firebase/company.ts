import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type {
  CapabilityProfile,
  Company,
  CompanyOnboardingInput,
  StaffMember,
  UserProfile,
} from "@/types/core";
import type { User } from "firebase/auth";

function nowFields() {
  return {
    updatedAt: serverTimestamp(),
  };
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(getFirebaseDb(), "userProfiles", uid));

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as UserProfile;
}

export async function getCompany(companyId: string) {
  const snapshot = await getDoc(doc(getFirebaseDb(), "companies", companyId));

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as Company;
}

export async function getCapabilityProfile(companyId: string) {
  const snapshot = await getDoc(
    doc(getFirebaseDb(), "capabilityProfiles", companyId),
  );

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as CapabilityProfile;
}

export async function listStaffMembers(companyId: string) {
  const snapshot = await getDocs(
    query(
      collection(getFirebaseDb(), "staffMembers"),
      where("companyId", "==", companyId),
    ),
  );

  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as StaffMember,
  );
}

export async function createInitialCompany(user: User, input: CompanyOnboardingInput) {
  const db = getFirebaseDb();
  const companyId = crypto.randomUUID();
  const userEmail = user.email ?? input.mainContactEmail;
  const userName = input.mainContactName || user.displayName || userEmail;

  await setDoc(doc(db, "companies", companyId), {
    name: input.companyName,
    shopType: input.shopType,
    mainContactName: input.mainContactName,
    mainContactEmail: input.mainContactEmail,
    timezone: input.timezone,
    ownerUid: user.uid,
    memberUids: [user.uid],
    createdAt: serverTimestamp(),
    ...nowFields(),
  });

  const batch = writeBatch(db);

  batch.set(doc(db, "userProfiles", user.uid), {
    uid: user.uid,
    email: userEmail,
    displayName: userName,
    role: "manager",
    companyId,
    createdAt: serverTimestamp(),
    ...nowFields(),
  });

  batch.set(doc(db, "capabilityProfiles", companyId), {
    companyId,
    machines: input.machines,
    materialsSupported: input.materialsSupported,
    materialsAvoided: input.materialsAvoided,
    inHouseProcesses: input.inHouseProcesses,
    outsideProcesses: input.outsideProcesses,
    inspectionEquipment: input.inspectionEquipment,
    certifications: input.certifications,
    preferredWork: input.preferredWork,
    workToAvoid: input.workToAvoid,
    toleranceComfort: input.toleranceComfort,
    notes: input.notes,
    createdAt: serverTimestamp(),
    ...nowFields(),
  });

  batch.set(doc(db, "staffMembers", `${companyId}_${user.uid}`), {
    companyId,
    name: userName,
    email: userEmail,
    role: "manager",
    createdAt: serverTimestamp(),
    ...nowFields(),
  });

  input.staff.forEach((staffMember) => {
    if (!staffMember.name.trim() && !staffMember.email.trim()) {
      return;
    }

    batch.set(doc(db, "staffMembers", crypto.randomUUID()), {
      companyId,
      name: staffMember.name.trim(),
      email: staffMember.email.trim(),
      role: staffMember.role,
      createdAt: serverTimestamp(),
      ...nowFields(),
    });
  });

  await batch.commit();

  return companyId;
}

export async function updateCapabilityProfile(
  companyId: string,
  input: Omit<CapabilityProfile, "id" | "companyId" | "createdAt" | "updatedAt">,
) {
  await updateDoc(doc(getFirebaseDb(), "capabilityProfiles", companyId), {
    ...input,
    ...nowFields(),
  });
}
