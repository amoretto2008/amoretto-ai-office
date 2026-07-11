export type SignaturePhrases = {
  opening: string;
  anchor: string;
  postClosing: string;
  reviewClosing: string;
};

export type BusinessProfile = {
  id: string;
  name: string;
  reading: string;
  area: string;
  address: string;
  industry: string;
  style: string;
  values: string[];
  mainAppeals: string[];
  priorityMeoKeywords: string[];
  meoKeywords: string[];
  prohibitedExpressions: string[];
  preferredExpressions: string[];
  signaturePhrases: SignaturePhrases;
};
