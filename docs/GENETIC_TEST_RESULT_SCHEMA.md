# Canonical Genetic Test Result Schema
## Specification & Integration Contract

**Document Version**: 1.0.0  
**Context**: GenomeGuard AI (DNA Doctor) Diagnostic Intake Pipeline  

---

### 1. Schema Overview

The Canonical Genetic Test Result Schema decouples laboratory assay methodology from downstream clinical evidence synthesis. It ensures that regardless of whether a variant was detected via Sanger sequencing, targeted NGS, Whole Exome Sequencing (WES), or a SNP Genotyping array, it is mapped to a standardized, validated data structure that:
1. Retains technical assay context and quality metrics (e.g. read depth, Phred genotype quality, VAF).
2. Differentiates null/missing values from zero (preventing numerical skew).
3. Accurately flags whether an input is eligible for Tri-Pillar clinical analysis.
4. Prevents erroneous conclusions (e.g., assuming a variant from Sanger is inherently pathogenic, or claiming PCR alone provides sequencing).

---

### 2. JSON Schema Representation

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "CanonicalGeneticTestResult",
  "type": "object",
  "required": ["test_record", "variant", "provenance", "analysis_eligibility"],
  "properties": {
    "test_record": {
      "type": "object",
      "required": ["test_id", "method", "method_display_name", "input_format", "quality_status", "quality_notes"],
      "properties": {
        "test_id": { "type": "string" },
        "method": { 
          "type": "string",
          "enum": ["pcr", "sanger", "ngs", "wes", "wgs", "microarray", "cma", "genotyping", "karyotyping"]
        },
        "method_display_name": { "type": "string" },
        "method_version": { "type": ["string", "null"] },
        "laboratory_source": { "type": ["string", "null"] },
        "test_date": { "type": ["string", "null"] },
        "input_format": {
          "type": "string",
          "enum": ["CLINVAR_ID", "HGVS", "COORDINATES", "VCF_SNIPPET", "GENE_SYMBOL", "STRUCTURED_MANUAL", "CUSTOM_ID", "UNSUPPORTED"]
        },
        "quality_status": {
          "type": "string",
          "enum": ["passed", "marginal", "failed", "not_assessed"]
        },
        "quality_notes": { "type": "array", "items": { "type": "string" } },
        "genome_assembly": { "type": ["string", "null"], "enum": ["GRCh38", "GRCh37", null] },
        "transcript": { "type": ["string", "null"] },
        "read_depth": { "type": ["number", "null"] },
        "genotype_quality": { "type": ["number", "null"] },
        "allele_fraction": { "type": ["number", "null"] },
        "target_gene": { "type": ["string", "null"] },
        "zygosity": { 
          "type": ["string", "null"],
          "enum": ["HETEROZYGOUS", "HOMOZYGOUS_ALT", "HOMOZYGOUS_REF_WILDTYPE", "HEMIZYGOUS", "UNKNOWN", null]
        }
      }
    },
    "variant": {
      "type": "object",
      "properties": {
        "identifier": { "type": ["string", "null"] },
        "gene": { "type": ["string", "null"] },
        "chromosome": { "type": ["string", "null"] },
        "position": { "type": ["integer", "null"] },
        "reference_allele": { "type": ["string", "null"] },
        "alternate_allele": { "type": ["string", "null"] },
        "consequence": { "type": ["string", "null"] },
        "hgvsc": { "type": ["string", "null"] },
        "hgvsp": { "type": ["string", "null"] },
        "clinvar_variation_id": { "type": ["string", "null"] },
        "dbsnp_rsid": { "type": ["string", "null"] }
      }
    },
    "provenance": {
      "type": "object",
      "properties": {
        "source_file": { "type": ["string", "null"] },
        "source_record_id": { "type": ["string", "null"] },
        "source_url": { "type": ["string", "null"] },
        "retrieved_at": { "type": ["string", "null"] }
      }
    },
    "analysis_eligibility": {
      "type": "object",
      "required": ["eligible", "validation_status", "reasons", "warnings", "missing_fields", "recommended_next_steps"],
      "properties": {
        "eligible": { "type": "boolean" },
        "validation_status": {
          "type": "string",
          "enum": ["valid", "valid_with_warnings", "insufficient_input", "invalid_input", "unsupported_format", "not_assessable"]
        },
        "reasons": { "type": "array", "items": { "type": "string" } },
        "warnings": { "type": "array", "items": { "type": "string" } },
        "missing_fields": { "type": "array", "items": { "type": "string" } },
        "recommended_next_steps": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
```

---

### 3. Validation Status Definitions

- **`valid`**: Input contains fully resolved variant coordinates or accession, matches genome assembly, passes quality thresholds, and is ready for Tri-Pillar execution.
- **`valid_with_warnings`**: Eligible for pipeline execution, but technical caveats exist (e.g. low read depth <20x, missing genotype quality, or custom laboratory ID).
- **`insufficient_input`**: Incomplete information (e.g. PCR amplification product without DNA sequencing, bare gene symbol without alteration, or missing alternate allele).
- **`invalid_input`**: Format error (e.g. invalid base characters, negative genomic coordinate, malformed HGVS syntax).
- **`unsupported_format`**: File or text format cannot be parsed by the software (e.g. raw `.ab1` binary chromatograms, raw FASTQ, or unsegmented CEL files).
- **`not_assessable`**: The testing modality does not resolve single-nucleotide or targeted genomic loci (e.g. classical G-banded karyotyping without defined genomic breakpoints).

---

### 4. Implementation Rules & Best Practices

1. **Zero vs Null Discipline**: If a test does not report read depth or genotype quality, the field MUST remain `null`. Never default missing numbers to `0`.
2. **Epistemic Modesty**: A status of `valid` indicates only that the data satisfies computational prerequisites, NEVER that the variant is clinically pathogenic.
3. **Assay Context Preservation**: The originating assay is carried through to the final clinical report and Tri-Pillar synthesizer to contextualize false-negative and technical blind spot risks.
