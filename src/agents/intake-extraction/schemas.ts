export type IntakeExtractionInput = {
  companyId: string;
  sourceText: string;
  knownCustomerName?: string;
};

export type IntakeExtractionOutput = {
  customerName?: string;
  contactName?: string;
  contactEmail?: string;
  partName?: string;
  partNumber?: string;
  revision?: string;
  quantity?: number;
  material?: string;
  requestedDueDate?: string;
  finishRequirements?: string[];
  certRequirements?: string[];
  missingInfo: string[];
  riskNotes: string[];
  confidence: "low" | "medium" | "high";
};
