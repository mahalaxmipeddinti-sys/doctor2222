// src/services/testResultValidation.ts
// Quality Control, Canonical Record Assembly, and Analysis Eligibility Engine

import {
  CanonicalGeneticTestResult,
  GeneticTestSubmissionPayload,
  GeneticTestMethodId,
  ValidationStatus,
  InputDataFormat,
  QualityAssessmentStatus,
  CanonicalTestRecord,
  CanonicalVariantRecord,
  CanonicalProvenanceRecord,
  CanonicalAnalysisEligibility,
} from '../types/geneticTesting.ts';
import { GENETIC_TESTS_CATALOG } from './geneticTestsCatalog.ts';
import { normalizeVariantInput } from './variantNormalization.ts';

/**
 * Validates laboratory testing submission payloads, runs QC checks,
 * enforces technical guardrails, and builds the CanonicalGeneticTestResult.
 */
export function validateAndAssembleTestResult(
  payload: GeneticTestSubmissionPayload
): CanonicalGeneticTestResult {
  const methodId = payload.method?.toLowerCase() as GeneticTestMethodId;
  const rawInput = (payload.rawInput || '').trim();
  const assembly = payload.assembly || 'GRCh38';

  const reasons: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];
  const nextSteps: string[] = [];
  const qualityNotes: string[] = [];

  const testId = `gtr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const catalogEntry = GENETIC_TESTS_CATALOG[methodId];

  // 1. Check if method is recognized
  if (!catalogEntry) {
    return {
      test_record: {
        test_id: testId,
        method: methodId || 'ngs',
        method_display_name: 'Unrecognized Method',
        method_version: null,
        laboratory_source: payload.laboratorySource || null,
        test_date: payload.testDate || null,
        input_format: 'UNSUPPORTED',
        quality_status: 'failed',
        quality_notes: ['The specified genetic testing method is unrecognized by the system.'],
        genome_assembly: assembly,
        transcript: null,
        read_depth: null,
        genotype_quality: null,
        allele_fraction: null,
        zygosity: null,
      },
      variant: {
        identifier: rawInput || null,
        gene: null,
        chromosome: null,
        position: null,
        reference_allele: null,
        alternate_allele: null,
        consequence: null,
      },
      provenance: {
        source_file: payload.sourceFileName || null,
        source_record_id: null,
        source_url: null,
        retrieved_at: new Date().toISOString(),
      },
      analysis_eligibility: {
        eligible: false,
        validation_status: 'unsupported_format',
        reasons: [`Unrecognized testing method '${payload.method}'.`],
        warnings: [],
        missing_fields: ['recognized_method'],
        recommended_next_steps: ['Select one of the 9 supported genetic testing techniques.'],
      },
    };
  }

  // 2. Specific Method Constraints: PCR alone
  if (methodId === 'pcr') {
    return {
      test_record: {
        test_id: testId,
        method: 'pcr',
        method_display_name: catalogEntry.name,
        method_version: null,
        laboratory_source: payload.laboratorySource || null,
        test_date: payload.testDate || null,
        input_format: 'STRUCTURED_MANUAL',
        quality_status: 'not_assessed',
        quality_notes: [
          'PCR is an enzymatic DNA amplification technique, not an end-point nucleotide sequencing method.',
        ],
        genome_assembly: assembly,
        transcript: payload.transcript || null,
        read_depth: null,
        genotype_quality: null,
        allele_fraction: null,
        target_gene: payload.geneSymbol || null,
        zygosity: payload.zygosity || null,
      },
      variant: {
        identifier: rawInput || null,
        gene: payload.geneSymbol || null,
        chromosome: null,
        position: null,
        reference_allele: null,
        alternate_allele: null,
        consequence: null,
      },
      provenance: {
        source_file: payload.sourceFileName || null,
        source_record_id: null,
        source_url: null,
        retrieved_at: new Date().toISOString(),
      },
      analysis_eligibility: {
        eligible: false,
        validation_status: 'insufficient_input',
        reasons: [
          'PCR alone does not generate a DNA sequence or determine variant pathogenicity.',
          'An amplified product must be sequenced (e.g. Sanger or NGS) or genotyped to identify specific nucleotide changes.',
        ],
        warnings: [
          'Do not automatically generate a variant pathogenicity classification from an unsequenced PCR result.',
        ],
        missing_fields: ['sequencing_data', 'nucleotide_alteration', 'genomic_coordinates'],
        recommended_next_steps: [
          'Perform Sanger sequencing or targeted NGS on the PCR amplicon.',
          'Submit the resulting verified variant call or coordinate once sequenced.',
        ],
      },
    };
  }

  // 3. Specific Method Constraints: Karyotyping alone without molecular coordinates
  if (methodId === 'karyotyping') {
    const hasCoordinates = /chr([0-9]{1,2}|[XYM]):\d+/i.test(rawInput);
    if (!hasCoordinates && !/^\d{4,9}$/.test(rawInput)) {
      return {
        test_record: {
          test_id: testId,
          method: 'karyotyping',
          method_display_name: catalogEntry.name,
          method_version: null,
          laboratory_source: payload.laboratorySource || null,
          test_date: payload.testDate || null,
          input_format: 'STRUCTURED_MANUAL',
          quality_status: 'passed',
          quality_notes: [
            'Conventional G-banded karyotyping evaluates macroscopic chromosomal cytology (~5–10 Mb resolution).',
          ],
          genome_assembly: assembly,
          transcript: null,
          read_depth: null,
          genotype_quality: null,
          allele_fraction: null,
          target_gene: payload.geneSymbol || null,
          zygosity: payload.zygosity || null,
        },
        variant: {
          identifier: rawInput || null,
          gene: payload.geneSymbol || null,
          chromosome: null,
          position: null,
          reference_allele: null,
          alternate_allele: null,
          consequence: null,
        },
        provenance: {
          source_file: payload.sourceFileName || null,
          source_record_id: null,
          source_url: null,
          retrieved_at: new Date().toISOString(),
        },
        analysis_eligibility: {
          eligible: false,
          validation_status: 'not_assessable',
          reasons: [
            'Conventional karyotyping evaluates whole-chromosome morphology and large rearrangements (>5–10 Mb).',
            'GenomeGuard AI evaluates molecular nucleotide-level and single-gene variants. Macro-cytogenetic formulas cannot be evaluated at nucleotide resolution without mapped molecular breakpoints.',
          ],
          warnings: [
            'A normal karyotype does NOT rule out submicroscopic microdeletions or monogenic mutations.',
          ],
          missing_fields: ['molecular_breakpoint_coordinates', 'gene_symbol'],
          recommended_next_steps: [
            'If a specific translocation breakpoint or gene disruption was characterized, enter the affected gene symbol or genomic coordinates.',
            'Consider Chromosomal Microarray (CMA) or WGS for higher molecular resolution.',
          ],
        },
      };
    }
  }

  // 4. Raw File Format Guardrails (Prevent claiming raw binary parser when structured input is needed)
  const isBinaryOrRawFileName =
    payload.sourceFileName &&
    /\.(ab1|bam|cram|fastq|fq|bcl|cel|idat)$/i.test(payload.sourceFileName);

  if (isBinaryOrRawFileName && !rawInput) {
    return {
      test_record: {
        test_id: testId,
        method: methodId,
        method_display_name: catalogEntry.name,
        method_version: null,
        laboratory_source: payload.laboratorySource || null,
        test_date: payload.testDate || null,
        input_format: 'UNSUPPORTED',
        quality_status: 'failed',
        quality_notes: [
          `Raw binary instrument format (${payload.sourceFileName}) detected.`,
        ],
        genome_assembly: assembly,
        transcript: null,
        read_depth: null,
        genotype_quality: null,
        allele_fraction: null,
        zygosity: null,
      },
      variant: {
        identifier: null,
        gene: null,
        chromosome: null,
        position: null,
        reference_allele: null,
        alternate_allele: null,
        consequence: null,
      },
      provenance: {
        source_file: payload.sourceFileName || null,
        source_record_id: null,
        source_url: null,
        retrieved_at: new Date().toISOString(),
      },
      analysis_eligibility: {
        eligible: false,
        validation_status: 'unsupported_format',
        reasons: [
          `Raw instrument files (${payload.sourceFileName}) must be processed by secondary alignment and variant calling pipelines (e.g. BWA, GATK) prior to ingestion.`,
          'The application accepts normalized variant calls, VCF records, or structured coordinates, not raw binary instrument files.',
        ],
        warnings: [
          'Do not attempt to upload raw binary sequencing files directly.',
        ],
        missing_fields: ['processed_variant_record'],
        recommended_next_steps: [
          'Extract the verified variant call from your laboratory report or VCF file.',
          'Submit the variant identifier (ClinVar ID, HGVS, or coordinate string).',
        ],
      },
    };
  }

  // 5. Empty Input Check
  if (!rawInput) {
    return {
      test_record: {
        test_id: testId,
        method: methodId,
        method_display_name: catalogEntry.name,
        method_version: null,
        laboratory_source: payload.laboratorySource || null,
        test_date: payload.testDate || null,
        input_format: 'STRUCTURED_MANUAL',
        quality_status: 'not_assessed',
        quality_notes: ['No variant query string or record was provided.'],
        genome_assembly: assembly,
        transcript: null,
        read_depth: null,
        genotype_quality: null,
        allele_fraction: null,
        zygosity: null,
      },
      variant: {
        identifier: null,
        gene: payload.geneSymbol || null,
        chromosome: null,
        position: null,
        reference_allele: null,
        alternate_allele: null,
        consequence: null,
      },
      provenance: {
        source_file: payload.sourceFileName || null,
        source_record_id: null,
        source_url: null,
        retrieved_at: new Date().toISOString(),
      },
      analysis_eligibility: {
        eligible: false,
        validation_status: 'insufficient_input',
        reasons: ['Required variant details have not yet been supplied.'],
        warnings: [],
        missing_fields: ['variant_input'],
        recommended_next_steps: [
          'Enter a ClinVar Variation ID, HGVS expression, genomic coordinates, or VCF line.',
        ],
      },
    };
  }

  // 6. Detect Input Format & Parse
  let detectedFormat: InputDataFormat = 'STRUCTURED_MANUAL';
  let parsedVcfLine: {
    chrom?: string;
    pos?: number;
    id?: string;
    ref?: string;
    alt?: string;
    qual?: number;
    info?: Record<string, string>;
  } | null = null;

  // Check if input is a VCF line: e.g. "chr17  43044295  rs80357906  G  A  100  PASS  DP=45;AF=0.5"
  const vcfTokens = rawInput.split(/[\t\s]+/);
  if (vcfTokens.length >= 5 && /^(chr)?([0-9]{1,2}|[XYM]|MT)$/i.test(vcfTokens[0]) && /^\d+$/.test(vcfTokens[1])) {
    detectedFormat = 'VCF_SNIPPET';
    const qualNum = Number(vcfTokens[5]);
    parsedVcfLine = {
      chrom: vcfTokens[0].replace(/^chr/i, ''),
      pos: parseInt(vcfTokens[1], 10),
      id: vcfTokens[2] !== '.' ? vcfTokens[2] : undefined,
      ref: vcfTokens[3].toUpperCase(),
      alt: vcfTokens[4].toUpperCase(),
      qual: !isNaN(qualNum) ? qualNum : undefined,
    };
  } else if (/^\d{4,9}$/.test(rawInput) || /^VCV\d+/i.test(rawInput)) {
    detectedFormat = 'CLINVAR_ID';
  } else if (/(?:c|p|g)\.[0-9A-Za-z_+*><-]+/.test(rawInput)) {
    detectedFormat = 'HGVS';
  } else if (/^(?:chr)?[0-9XYM]+[:\-_]\d+[:\-_][ACGTN]+/i.test(rawInput)) {
    detectedFormat = 'COORDINATES';
  } else if (/^rs\d+$/i.test(rawInput)) {
    detectedFormat = 'CUSTOM_ID';
  } else if (/^[A-Za-z0-9_-]{2,10}$/.test(rawInput) && isNaN(Number(rawInput))) {
    detectedFormat = 'GENE_SYMBOL';
  }

  // Normalize variant representation using existing variant normalizer
  const normalized = parsedVcfLine
    ? normalizeVariantInput(
        `chr${parsedVcfLine.chrom}:${parsedVcfLine.pos}:${parsedVcfLine.ref}>${parsedVcfLine.alt}`,
        assembly
      )
    : normalizeVariantInput(rawInput, assembly);

  // 7. Validate Variant Characteristics & Reference Allele
  if (normalized.validationStatus === 'INVALID') {
    return {
      test_record: {
        test_id: testId,
        method: methodId,
        method_display_name: catalogEntry.name,
        method_version: null,
        laboratory_source: payload.laboratorySource || null,
        test_date: payload.testDate || null,
        input_format: detectedFormat,
        quality_status: 'failed',
        quality_notes: normalized.validationWarnings,
        genome_assembly: assembly,
        transcript: payload.transcript || null,
        read_depth: payload.readDepth ?? null,
        genotype_quality: payload.genotypeQuality ?? null,
        allele_fraction: payload.alleleFraction ?? null,
        zygosity: payload.zygosity || null,
      },
      variant: {
        identifier: rawInput,
        gene: payload.geneSymbol || null,
        chromosome: null,
        position: null,
        reference_allele: null,
        alternate_allele: null,
        consequence: null,
      },
      provenance: {
        source_file: payload.sourceFileName || null,
        source_record_id: null,
        source_url: null,
        retrieved_at: new Date().toISOString(),
      },
      analysis_eligibility: {
        eligible: false,
        validation_status: 'invalid_input',
        reasons: normalized.validationWarnings,
        warnings: [],
        missing_fields: ['valid_variant_syntax'],
        recommended_next_steps: [
          'Verify syntax against HGVS specifications or standard coordinate format (chr:pos:ref>alt).',
        ],
      },
    };
  }

  if (normalized.validationStatus === 'AMBIGUOUS' && detectedFormat === 'GENE_SYMBOL') {
    return {
      test_record: {
        test_id: testId,
        method: methodId,
        method_display_name: catalogEntry.name,
        method_version: null,
        laboratory_source: payload.laboratorySource || null,
        test_date: payload.testDate || null,
        input_format: 'GENE_SYMBOL',
        quality_status: 'marginal',
        quality_notes: normalized.validationWarnings,
        genome_assembly: assembly,
        transcript: payload.transcript || null,
        read_depth: payload.readDepth ?? null,
        genotype_quality: payload.genotypeQuality ?? null,
        allele_fraction: payload.alleleFraction ?? null,
        target_gene: rawInput.toUpperCase(),
        zygosity: payload.zygosity || null,
      },
      variant: {
        identifier: rawInput,
        gene: rawInput.toUpperCase(),
        chromosome: null,
        position: null,
        reference_allele: null,
        alternate_allele: null,
        consequence: null,
      },
      provenance: {
        source_file: payload.sourceFileName || null,
        source_record_id: null,
        source_url: null,
        retrieved_at: new Date().toISOString(),
      },
      analysis_eligibility: {
        eligible: false,
        validation_status: 'insufficient_input',
        reasons: [
          `The gene symbol '${rawInput}' alone does not specify a distinct nucleotide alteration.`,
        ],
        warnings: normalized.validationWarnings,
        missing_fields: ['specific_mutation_or_coordinate'],
        recommended_next_steps: [
          `Provide a specific mutation in ${rawInput} (e.g. ClinVar ID, cDNA HGVS, or genomic position).`,
        ],
      },
    };
  }

  // 8. Quality Control Metrics Assessment (Depth, GQ, VAF)
  let qualityStatus: QualityAssessmentStatus = 'passed';

  // Read depth validation (if supplied)
  const depth = payload.readDepth ?? (parsedVcfLine?.qual !== undefined ? undefined : null);
  if (depth !== null && depth !== undefined) {
    if (depth < 0) {
      warnings.push(`Read depth (${depth}) cannot be negative.`);
      qualityStatus = 'failed';
    } else if ((methodId === 'ngs' || methodId === 'wes' || methodId === 'wgs') && depth < 20) {
      warnings.push(`Low sequencing read depth (${depth}x < 20x threshold). Potential technical calling uncertainty.`);
      qualityStatus = 'marginal';
    } else {
      qualityNotes.push(`Verified read depth: ${depth}x.`);
    }
  } else if (methodId === 'ngs' || methodId === 'wes' || methodId === 'wgs') {
    missingFields.push('read_depth');
    qualityNotes.push('Read depth metric not provided in submission; proceeding with standard assumptions.');
  }

  // Genotype Quality (GQ) validation
  const gq = payload.genotypeQuality ?? null;
  if (gq !== null && gq !== undefined) {
    if (gq < 0 || gq > 99) {
      warnings.push(`Phred genotype quality (${gq}) outside valid range [0, 99].`);
      qualityStatus = 'marginal';
    } else if (gq < 20) {
      warnings.push(`Marginal Phred genotype quality (${gq} < 20). Elevated probability of erroneous genotype call.`);
      qualityStatus = 'marginal';
    } else {
      qualityNotes.push(`Genotype quality GQ: ${gq}.`);
    }
  }

  // Variant Allele Fraction (VAF) validation
  const vaf = payload.alleleFraction ?? null;
  if (vaf !== null && vaf !== undefined) {
    if (vaf < 0 || vaf > 1.0) {
      warnings.push(`Variant allele fraction (${vaf}) must be between 0.0 and 1.0.`);
      qualityStatus = 'failed';
    } else if (vaf < 0.20 && payload.zygosity === 'HETEROZYGOUS') {
      warnings.push(`Low VAF (${(vaf * 100).toFixed(1)}%) for heterozygous call. Suggests potential somatic mosaicism or subclonal artifact.`);
      qualityStatus = 'marginal';
    } else {
      qualityNotes.push(`Allele fraction (VAF): ${(vaf * 100).toFixed(1)}%.`);
    }
  }

  // Nucleotide validity check for SNVs
  if (normalized.referenceAllele && normalized.alternateAllele) {
    const validBases = /^[ACGTN]+$/i;
    if (!validBases.test(normalized.referenceAllele) || !validBases.test(normalized.alternateAllele)) {
      reasons.push('Alleles contain non-standard IUPAC base symbols.');
      return {
        test_record: {
          test_id: testId,
          method: methodId,
          method_display_name: catalogEntry.name,
          method_version: null,
          laboratory_source: payload.laboratorySource || null,
          test_date: payload.testDate || null,
          input_format: detectedFormat,
          quality_status: 'failed',
          quality_notes: ['Invalid base characters detected.'],
          genome_assembly: assembly,
          transcript: payload.transcript || null,
          read_depth: depth,
          genotype_quality: gq,
          allele_fraction: vaf,
          zygosity: payload.zygosity || null,
        },
        variant: {
          identifier: rawInput,
          gene: payload.geneSymbol || normalized.geneSymbol || null,
          chromosome: normalized.chromosome || null,
          position: normalized.position || null,
          reference_allele: normalized.referenceAllele || null,
          alternate_allele: normalized.alternateAllele || null,
          consequence: null,
        },
        provenance: {
          source_file: payload.sourceFileName || null,
          source_record_id: null,
          source_url: null,
          retrieved_at: new Date().toISOString(),
        },
        analysis_eligibility: {
          eligible: false,
          validation_status: 'invalid_input',
          reasons: ['Alleles must be standard DNA bases (A, C, G, T).'],
          warnings: [],
          missing_fields: [],
          recommended_next_steps: ['Correct non-standard allele characters.'],
        },
      };
    }
  }

  // 9. Synthesize Eligibility Status
  const isEligible = qualityStatus !== 'failed' && normalized.validationStatus === 'VALID';
  const validationStatus: ValidationStatus =
    warnings.length > 0 ? 'valid_with_warnings' : 'valid';

  if (warnings.length === 0) {
    reasons.push('Input passes all technical syntax, coordinate, and quality validations.');
    nextSteps.push('Eligible for immediate execution through Tri-Pillar clinical evidence pipeline.');
  } else {
    reasons.push('Input meets minimum computational criteria for Tri-Pillar analysis with technical caveats.');
    nextSteps.push('Review technical warnings before finalizing clinical report.');
  }

  // Method-specific educational notes added to quality notes
  qualityNotes.push(`Originating assay: ${catalogEntry.name} (${catalogEntry.fullForm}).`);
  if (!catalogEntry.canBeConsumedBySoftware) {
    warnings.push(
      `${catalogEntry.name} results were adapted to structured coordinates for software evaluation. Note: ${catalogEntry.limitations[0]}`
    );
  }

  const testRecord: CanonicalTestRecord = {
    test_id: testId,
    method: methodId,
    method_display_name: catalogEntry.name,
    method_version: null,
    laboratory_source: payload.laboratorySource || null,
    test_date: payload.testDate || null,
    input_format: detectedFormat,
    quality_status: qualityStatus,
    quality_notes: qualityNotes,
    genome_assembly: assembly,
    transcript: payload.transcript || null,
    read_depth: depth,
    genotype_quality: gq,
    allele_fraction: vaf,
    target_gene: payload.geneSymbol || normalized.geneSymbol || null,
    zygosity: payload.zygosity || null,
  };

  const variantRecord: CanonicalVariantRecord = {
    identifier: normalized.normalizedRepresentation,
    gene: payload.geneSymbol || normalized.geneSymbol || null,
    chromosome: normalized.chromosome || null,
    position: normalized.position || null,
    reference_allele: normalized.referenceAllele || null,
    alternate_allele: normalized.alternateAllele || null,
    consequence: null,
    hgvsc: normalized.hgvsc || null,
    hgvsp: normalized.hgvsp || null,
    clinvar_variation_id: normalized.inputType === 'clinvar_id' ? rawInput.replace(/^VCV/i, '') : null,
    dbsnp_rsid: normalized.dbsnpRsid || null,
  };

  const provenanceRecord: CanonicalProvenanceRecord = {
    source_file: payload.sourceFileName || null,
    source_record_id: null,
    source_url: null,
    retrieved_at: new Date().toISOString(),
  };

  const analysisEligibility: CanonicalAnalysisEligibility = {
    eligible: isEligible,
    validation_status: validationStatus,
    reasons,
    warnings,
    missing_fields: missingFields,
    recommended_next_steps: nextSteps,
  };

  return {
    test_record: testRecord,
    variant: variantRecord,
    provenance: provenanceRecord,
    analysis_eligibility: analysisEligibility,
  };
}
