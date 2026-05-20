"use client";

import { useAuthContext } from "@/context/AuthContext";
import {
  getCapabilityProfile,
  getCompany,
  getUserProfile,
  listStaffMembers,
} from "@/lib/firebase/company";
import type {
  CapabilityProfile,
  Company,
  StaffMember,
  UserProfile,
} from "@/types/core";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type CompanyContextValue = {
  profile: UserProfile | null;
  company: Company | null;
  capabilityProfile: CapabilityProfile | null;
  staff: StaffMember[];
  loading: boolean;
  refreshCompanyContext: () => Promise<void>;
};

const CompanyContext = createContext<CompanyContextValue>({
  profile: null,
  company: null,
  capabilityProfile: null,
  staff: [],
  loading: true,
  refreshCompanyContext: async () => {},
});

export function useCompanyContext() {
  return useContext(CompanyContext);
}

export function CompanyContextProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [capabilityProfile, setCapabilityProfile] =
    useState<CapabilityProfile | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCompanyContext = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setCompany(null);
      setCapabilityProfile(null);
      setStaff([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const nextProfile = await getUserProfile(user.uid);
    setProfile(nextProfile);

    if (!nextProfile?.companyId) {
      setCompany(null);
      setCapabilityProfile(null);
      setStaff([]);
      setLoading(false);
      return;
    }

    const [nextCompany, nextCapabilityProfile, nextStaff] = await Promise.all([
      getCompany(nextProfile.companyId),
      getCapabilityProfile(nextProfile.companyId),
      listStaffMembers(nextProfile.companyId),
    ]);

    setCompany(nextCompany);
    setCapabilityProfile(nextCapabilityProfile);
    setStaff(nextStaff);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refreshCompanyContext();
  }, [refreshCompanyContext]);

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    if (!profile?.companyId && pathname !== "/onboarding") {
      router.replace("/onboarding");
      return;
    }

    if (profile?.companyId && pathname === "/onboarding") {
      router.replace("/command-center");
    }
  }, [loading, pathname, profile?.companyId, router, user]);

  return (
    <CompanyContext.Provider
      value={{
        profile,
        company,
        capabilityProfile,
        staff,
        loading,
        refreshCompanyContext,
      }}
    >
      {loading ? (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">
          Loading shop profile...
        </div>
      ) : (
        children
      )}
    </CompanyContext.Provider>
  );
}
