// src/types/geneticTesting.ts
// Canonical Schema and Type Definitions for Genetic Testing Methods

export type GeneticTestMethodId =
  | 'pcr'
  | 'sanger'
  | 'ngs'
  | 'wes'
  | 'wgs'
  | 'microarray'
  | 'cma'
  | 'genotyping'
  | 'karyotyping';

export type MethodCategory =
  | 'Targeted Amplification'
  | 'Targeted Sequencing'
  | 'High-Throughput Sequencing'
  | 'Array-Based Cytogenomics'
  | 'Targeted Allele Testing'
  | 'Classical Cytogenetics';

export type QualityAssessmentStatus = 'passed' | 'marginal' | 'failed' | 'not_assessed';

export type ValidationStatus =
  | 'valid'
  | 'valid_with_warnings'
  | 'insufficient_input'
  | 'invalid_input'
  | 'unsupported_format'
  | 'not_assessable';

export type InputDataFormat =
  | 'CLINVAR_ID'
  | 'HGVS'
  | 'COORDINATES'
  | 'VCF_SNIPPET'
  | 'GENE_SYMBOL'
  | 'STRUCTURED_MANUAL'
  | 'CUSTOM_ID'
  | 'UNSUPPORTED';

export type TrioZygosityType =
  | 'HETEROZYGOUS'
  | 'HOMOZYGOUS_ALT'
  | 'HOMOZYGOUS_REF_WILDTYPE'
  | 'HEMIZYGOUS'
  | 'UNKNOWN';

// --- CATALOG DATA MODEL ---
export interface GeneticTestCatalogEntry {
  testId: GeneticTestMethodId;
  name: string;
  fullForm: string;
  category: MethodCategory;
  description: string;
  mainPurpose: string;
  biologicalMaterial: string;
  generalWorkflow: string[];
  detectableGeneticChanges: string[];
  typicalUseCases: string[];
  advantages: string[];
  limitations: string[];
  outputProduced: string;
  canBeConsumedBySoftware: boolean;
  softwareConsumptionDetails: string;
  requiredInputFormat: string;
  validationRequirements: string[];
  interpretationWarnings: string[];
  educationalNotes: string;
}

// --- OBJECTIVE SELECTOR TYPES ---
export type ClinicalObjectiveId =
  | 'single_gene_known'
  | 'confirm_sequence'
  | 'multiple_genes_panel'
  | 'coding_regions_exome'
  | 'broad_coding_noncoding'
  | 'predefined_snps'
  | 'copy_number_variations'
  | 'chromosome_abnormalities'
  | 'interpret_existing_result';

export interface ObjectiveRecommendation {
  objectiveId: ClinicalObjectiveId;
  title: string;
  userQueryDescription: string;
  primaryMethods: GeneticTestMethodId[];
  secondaryMethods: GeneticTestMethodId[];
  rationale: string;
  whatItMayMiss: string[];
  requiredInputData: string[];
  educationalDisclaimer: string;
  canSoftwareIngestResult: boolean;
  softwareWorkflowGuide: string;
}

// --- CANONICAL GENETIC TEST RESULT SCHEMA ---
export interface CanonicalTestRecord {
  test_id: string;
  method: GeneticTestMethodId;
  method_display_name: string;
  method_version: string | null;
  laboratory_source: string | null;
  test_date: string | null;
  input_format: InputDataFormat;
  quality_status: QualityAssessmentStatus;
  quality_notes: string[];
  genome_assembly: 'GRCh38' | 'GRCh37' | null;
  transcript: string | null;
  // Specific quality metrics (Preserve null when missing - never coerce to 0)
  read_depth?: number | null;
  genotype_quality?: number | null;
  allele_fraction?: number | null;
  target_gene?: string | null;
  zygosity?: TrioZygosityType | null;
}

export interface CanonicalVariantRecord {
  identifier: string | null;
  gene: string | null;
  chromosome: string | null;
  position: number | null;
  reference_allele: string | null;
  alternate_allele: string | null;
  consequence: string | null;
  hgvsc?: string | null;
  hgvsp?: string | null;
  clinvar_variation_id?: string | null;
  dbsnp_rsid?: string | null;
}

export interface CanonicalProvenanceRecord {
  source_file: string | null;
  source_record_id: string | null;
  source_url: string | null;
  retrieved_at: string | null;
}

export interface CanonicalAnalysisEligibility {
  eligible: boolean;
  validation_status: ValidationStatus;
  reasons: string[];
  warnings: string[];
  missing_fields: string[];
  recommended_next_steps: string[];
}

export interface CanonicalGeneticTestResult {
  test_record: CanonicalTestRecord;
  variant: CanonicalVariantRecord;
  provenance: CanonicalProvenanceRecord;
  analysis_eligibility: CanonicalAnalysisEligibility;
}

// Client submission payload for validation & intake
export interface GeneticTestSubmissionPayload {
  method: GeneticTestMethodId;
  rawInput: string;
  assembly?: 'GRCh38' | 'GRCh37';
  laboratorySource?: string;
  testDate?: string;
  readDepth?: number | null;
  genotypeQuality?: number | null;
  alleleFraction?: number | null;
  zygosity?: TrioZygosityType;
  geneSymbol?: string;
  transcript?: string;
  sourceFileName?: string;
  notes?: string;
}
