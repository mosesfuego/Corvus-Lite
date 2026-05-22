"use client";

import { useCompanyContext } from "@/context/CompanyContext";
import {
  createIssue,
  createJob,
  createRfq,
  listCoreRecords,
  resolveIssue,
  seedDemoCoreData,
  updateJobState,
  type CoreRecords,
  type CreateIssueInput,
  type CreateJobInput,
  type CreateRfqInput,
} from "@/lib/firebase/operations";
import type { Issue, Job, JobStage, JobStatus, RiskLevel } from "@/types/core";
import { useCallback, useEffect, useState } from "react";

const emptyRecords: CoreRecords = {
  customers: [],
  contacts: [],
  machines: [],
  rfqs: [],
  jobs: [],
  issues: [],
  activityEvents: [],
};

export function useCoreRecords() {
  const { company } = useCompanyContext();
  const [records, setRecords] = useState<CoreRecords>(emptyRecords);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!company?.id) {
      setRecords(emptyRecords);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setRecords(await listCoreRecords(company.id));
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to load shop records.",
      );
    } finally {
      setLoading(false);
    }
  }, [company?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function seedDemo() {
    if (!company?.id) {
      return;
    }

    await seedDemoCoreData(company.id);
    await refresh();
  }

  async function addJob(input: CreateJobInput) {
    if (!company?.id) {
      return;
    }

    await createJob(company.id, input);
    await refresh();
  }

  async function addRfq(input: CreateRfqInput) {
    if (!company?.id) {
      return;
    }

    await createRfq(company.id, input);
    await refresh();
  }

  async function setJobState(
    job: Job,
    state: {
      stage?: JobStage;
      status?: JobStatus;
      quantityComplete?: number;
      risk?: RiskLevel;
    },
  ) {
    if (!company?.id) {
      return;
    }

    await updateJobState(company.id, job, state);
    await refresh();
  }

  async function addIssue(input: CreateIssueInput) {
    if (!company?.id) {
      return;
    }

    await createIssue(company.id, input);
    await refresh();
  }

  async function closeIssue(issue: Issue) {
    if (!company?.id) {
      return;
    }

    await resolveIssue(company.id, issue);
    await refresh();
  }

  return {
    ...records,
    addIssue,
    addJob,
    addRfq,
    closeIssue,
    error,
    loading,
    refresh,
    seedDemo,
    setJobState,
  };
}
