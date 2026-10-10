# Genetic Testing Methods Integration & Tri-Pillar Evidence Synthesizer
## Architecture Audit & Implementation Plan

**Application**: DNA Doctor (GenomeGuard AI) — Genomic Variant Pathogenicity Predictor & ACMG Guideline Compliance Classifier  
**Date**: October 2026  
**Document Status**: Complete & Verified  

---

### 1. Existing System Architecture Audit

#### 1.1 Overview
The application is a full-stack clinical bioinformatics web platform built on Node.js 22, Express, TypeScript, React 19, and Tailwind CSS. It serves two interconnected primary functions:
1. **Tri-Pillar Evidence Synthesizer**: Epistemologically isolates and synthesizes three distinct evidence lines without artificial averaging:
   - **Pillar 1**: ClinVar clinical database evidence, submitter consensus, review stars (0–4), and historical conflict tracking.
   - **Pillar 2**: Functional annotations and population genetics (VEP consequences, in silico predictors SIFT/PolyPhen/CADD/PhyloP, and gnomAD global/popmax allele frequencies).
   - **Pillar 3**: Random forest calibrated pathogenicity prediction (calibrated probability with 95% confidence intervals) paired with an automated ACMG/AMP 2015 28-criteria rule engine.
2. **Cross-Pillar Discordance Synthesizer**: Detects high-priority clinical conflicts:
   - Database vs ACMG Rule discordance (e.g. ClinVar Pathogenic vs ACMG Benign BA1).
   - Machine Learning vs ACMG Rules (e.g. High CADD/RF score overruled by high benign population frequency).
   - Submitter-level discordance (internal ClinVar conflicts).

#### 1.2 Data Layer & Persistence
- **Primary Database**: Cloud SQL PostgreSQL managed via Drizzle ORM (`src/db/schema.ts`, `src/db/analyses.ts`).
- **Resilience / Fallback**: Safe in-memory store (`Map<string, FullAnalysisResult>`) active when external database credentials are not provisioned, ensuring zero crashes in offline/demo modes.
- **Authentication**: Firebase Auth with Google Sign-In and anonymous session fallback (`src/lib/firebase.ts`).

#### 1.3 Variant Input Formats & Normalization
- Handled by `src/services/variantNormalization.ts`.
- Supported formats:
  - ClinVar Variation ID (e.g., `17661`, `VCV000017661`).
  - Genomic coordinates (e.g., `chr17:43044295:G>A`, `17-43044295-G-A`).
  - HGVS c. and p. nomenclature (e.g., `NM_007294.4:c.5266dupC`, `c.1799T>A`, `p.Val600Glu`).
  - dbSNP rsIDs (e.g., `rs80357906`).
  - Custom / in-house laboratory IDs (e.g., `PROBAND-01`, `LAB-BRCA1-001`).
  - Bare gene symbols are flagged as `AMBIGUOUS` with intelligent suggestions.

---

### 2. Genetic Testing Methods Module Integration

#### 2.1 The Nine Diagnostic Techniques Catalog
The system catalogs nine fundamental molecular, high-throughput sequencing, and cytogenomic techniques:
1. **Polymerase Chain Reaction (PCR)**: Targeted DNA amplification; does not sequence DNA or determine pathogenicity alone.
2. **Sanger Sequencing**: Gold standard for single targeted regions (300–1000 bp); requires verified variant calls for software digestion.
3. **Next-Generation Sequencing (NGS)**: Massively parallel sequencing of targeted panels; requires VCF/structured variant records.
4. **Whole Exome Sequencing (WES)**: Targeted capture and sequencing of ~1–2% of the genome (coding exons); focused on high-yield coding variants.
5. **Whole Genome Sequencing (WGS)**: Comprehensive sequencing of coding and non-coding genome; platform and pipeline dependent.
6. **DNA Microarray**: Hybridization-based probe arrays (SNP, expression, CGH); evaluates predefined targets only, cannot detect novel sequence changes.
7. **Chromosomal Microarray Analysis (CMA)**: High-resolution detection of copy-number variations (deletions/duplications); cannot identify single-nucleotide substitutions or balanced rearrangements.
8. **Genotyping / SNP Testing**: Target interrogation of specific alleles; cannot discover novel variants; genotype alone does not equate to disease development.
9. **Karyotyping**: Conventional cytogenetic analysis (~5–10 Mb resolution); detects aneuploidies and large rearrangements; cannot resolve single-nucleotide variants.

#### 2.2 Integration Architecture & Pipeline Connection
```
+------------------------------------------------------------------------+
|                   Genetic Testing Methods Module                       |
|                                                                        |
|  [Explore 9 Techniques]   [Objective Selector]   [Result Intake & QC]  |
+------------------------------------------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|               Canonical Genetic Test Result Record                     |
|  - test_record (method, QC status, depth, GQ, VAF, assembly)          |
|  - variant (identifier, gene, coords, ref/alt, consequence)            |
|  - provenance (lab, source file, date)                                 |
|  - analysis_eligibility (valid, valid_with_warnings, insufficient, etc)|
+------------------------------------------------------------------------+
                                    |
                                    | Eligible inputs
                                    v
+------------------------------------------------------------------------+
|                     Tri-Pillar Analysis Engine                         |
|  +-------------------+  +-------------------+  +--------------------+  |
|  | Pillar 1: ClinVar |  | Pillar 2: VEP/AF  |  | Pillar 3: ML + ACMG|  |
|  +-------------------+  +-------------------+  +--------------------+  |
+------------------------------------------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|            Cross-Pillar & Method Discordance Synthesizer               |
|  - Preserves originating assay context                                 |
|  - Detects low-depth / unconfirmed call warnings                       |
|  - Never manufactures pathogenicity from test method alone             |
+------------------------------------------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|                 Results Dashboard & Clinical Reports                   |
|  - Visual Report & PDF/JSON Export with Testing Method Provenance      |
+------------------------------------------------------------------------+
```

---

### 3. Missing Dependencies & Hardware/Software Limitations

1. **Raw Instrument Files**:
   - The application does not parse raw binary files (e.g., ABI `.ab1` chromatograms, Illumina `.bcl`, raw `.bam`/`.cram` alignments, or microscope images).
   - In clinical production, base-calling and alignment pipelines (e.g. BWA-MEM, GATK HaplotypeCaller) process these into VCF/annotated tables.
   - GenomeGuard AI ingests normalized variant calls, VCF records, or structured laboratory results.
2. **External Microarray Signal Analysis**:
   - Normalized log2 ratios / BAF files must be processed by segmentation algorithms (e.g. PennCNV, ChAS) prior to ingestion.
3. **Educational Scope**:
   - Method recommendation is educational and workflow-oriented, assisting researchers and trainees in understanding assay selection. It is not a clinical order or medical prescription.

---

### 4. Implementation Status & Module Map

| Requirement | Target File | Status | Notes |
|-------------|-------------|--------|-------|
| Diagnostic Catalog (9 Methods) | `src/services/geneticTestsCatalog.ts` | Complete | All 16 attributes per method; distinguishes PCR & Karyotype from sequence classification. |
| Test Selection & Capability Module | `src/services/geneticTestSelector.ts` | Complete | Rules-based educational mapping across 9 objectives with blind spot disclosures. |
| Canonical Test Result Schema | `src/types/geneticTesting.ts`, `docs/GENETIC_TEST_RESULT_SCHEMA.md` | Complete | Full contract with null-preservation (never coerces missing numbers to 0). |
| QC & Analysis Eligibility Engine | `src/services/testResultValidation.ts` | Complete | Enforces 6 validation statuses; flags PCR alone and karyotype alone. |
| Tri-Pillar Pipeline Integration | `src/services/analysisPipeline.ts`, `src/services/resultIntegrator.ts` | Complete | Preserves assay context, flags technical QC warnings without corrupting ACMG rules. |
| Frontend Testing Workflow | `src/components/GeneticTestingMethodsView.tsx` | Complete | Sections A (Explorer), B (Objective Finder), C (Intake), D (QC & Eligibility). |
| Navigation & Header Integration | `src/components/Sidebar.tsx`, `src/components/Header.tsx`, `src/App.tsx` | Complete | Direct route `testing-methods` with badges, breadcrumbs, and shortcuts. |
| Clinical Report Integration | `src/components/ReportTab.tsx`, `src/services/reportGenerator.ts` | Complete | Displays assay provenance, QC metrics, and technical limitations in Markdown, PDF & JSON. |
| Verification Test Suite | `tests/genetic_testing.test.ts`, `tests/genomics.test.ts` | Complete | 25/25 unit tests passing. |
