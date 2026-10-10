// tests/genetic_testing.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GENETIC_TESTS_CATALOG } from '../src/services/geneticTestsCatalog.ts';
import { selectMethodsForObjective } from '../src/services/geneticTestSelector.ts';
import { validateAndAssembleTestResult } from '../src/services/testResultValidation.ts';
import { executeVariantAnalysis } from '../src/services/analysisPipeline.ts';
import { generateMarkdownReport } from '../src/services/reportGenerator.ts';

describe('Stage 2: Genetic Testing Methods Catalog', () => {
  it('contains all nine required diagnostic techniques', () => {
    const requiredKeys = ['pcr', 'sanger', 'ngs', 'wes', 'wgs', 'microarray', 'cma', 'genotyping', 'karyotyping'];
    for (const key of requiredKeys) {
      assert.ok(GENETIC_TESTS_CATALOG[key as keyof typeof GENETIC_TESTS_CATALOG], `Missing catalog entry for ${key}`);
    }
    assert.strictEqual(Object.keys(GENETIC_TESTS_CATALOG).length, 9);
  });

  it('correctly models PCR as an amplification technique that cannot classify variants alone', () => {
    const pcr = GENETIC_TESTS_CATALOG.pcr;
    assert.strictEqual(pcr.canBeConsumedBySoftware, false);
    assert.ok(pcr.mainPurpose.toLowerCase().includes('amplification'));
    assert.ok(pcr.generalWorkflow.length >= 6);
    assert.ok(pcr.interpretationWarnings.some((w) => w.includes('Do NOT automatically generate a variant classification')));
  });

  it('differentiates CMA copy-number variation from single-nucleotide point mutations', () => {
    const cma = GENETIC_TESTS_CATALOG.cma;
    assert.ok(cma.limitations.some((l) => l.includes('single-nucleotide point mutations') || l.includes('balanced chromosomal rearrangements')));
    assert.ok(cma.advantages.some((a) => a.includes('resolution')));
  });

  it('verifies that karyotyping operates at chromosome level and cannot resolve SNVs', () => {
    const karyo = GENETIC_TESTS_CATALOG.karyotyping;
    assert.strictEqual(karyo.canBeConsumedBySoftware, false);
    assert.ok(karyo.limitations.some((l) => l.includes('megabases')));
  });
});

describe('Stage 3: Test Selection and Capability Module', () => {
  it('recommends Sanger sequencing for single-gene and confirmation objectives', () => {
    const rec1 = selectMethodsForObjective('single_gene_known');
    assert.ok(rec1.primaryMethods.includes('sanger'));
    assert.ok(rec1.whatItMayMiss.length > 0);

    const rec2 = selectMethodsForObjective('confirm_sequence');
    assert.ok(rec2.primaryMethods.includes('sanger'));
  });

  it('recommends NGS multi-gene panels for investigating multiple candidate genes', () => {
    const rec = selectMethodsForObjective('multiple_genes_panel');
    assert.ok(rec.primaryMethods.includes('ngs'));
  });

  it('recommends CMA for copy-number changes and Karyotyping for chromosome-number abnormalities', () => {
    const cmaRec = selectMethodsForObjective('copy_number_variations');
    assert.ok(cmaRec.primaryMethods.includes('cma'));

    const karyoRec = selectMethodsForObjective('chromosome_abnormalities');
    assert.ok(karyoRec.primaryMethods.includes('karyotyping'));
  });
});

describe('Stage 5 & 6: Canonical Schema & Quality Control Eligibility Engine', () => {
  it('flags unsequenced PCR result as insufficient_input and ineligible for variant analysis', () => {
    const result = validateAndAssembleTestResult({
      method: 'pcr',
      rawInput: 'BRCA1_Amplicon_Band_320bp',
      geneSymbol: 'BRCA1',
    });

    assert.strictEqual(result.analysis_eligibility.eligible, false);
    assert.strictEqual(result.analysis_eligibility.validation_status, 'insufficient_input');
    assert.ok(result.analysis_eligibility.reasons[0].includes('PCR alone does not generate a DNA sequence'));
  });

  it('flags karyotype formula without molecular coordinates as not_assessable', () => {
    const result = validateAndAssembleTestResult({
      method: 'karyotyping',
      rawInput: '47,XY,+21',
    });

    assert.strictEqual(result.analysis_eligibility.eligible, false);
    assert.strictEqual(result.analysis_eligibility.validation_status, 'not_assessable');
    assert.ok(result.analysis_eligibility.reasons.some((r) => r.includes('nucleotide resolution')));
  });

  it('rejects raw binary filenames without processed variant records', () => {
    const result = validateAndAssembleTestResult({
      method: 'sanger',
      rawInput: '',
      sourceFileName: 'trace_exon11.ab1',
    });

    assert.strictEqual(result.analysis_eligibility.eligible, false);
    assert.strictEqual(result.analysis_eligibility.validation_status, 'unsupported_format');
  });

  it('parses standard VCF lines and normalizes coordinates', () => {
    const vcfLine = 'chr17\t43044295\trs80357906\tG\tA\t100\tPASS\tDP=50';
    const result = validateAndAssembleTestResult({
      method: 'ngs',
      rawInput: vcfLine,
      assembly: 'GRCh38',
    });

    assert.strictEqual(result.test_record.input_format, 'VCF_SNIPPET');
    assert.strictEqual(result.variant.chromosome, '17');
    assert.strictEqual(result.variant.position, 43044295);
    assert.strictEqual(result.variant.reference_allele, 'G');
    assert.strictEqual(result.variant.alternate_allele, 'A');
    assert.strictEqual(result.analysis_eligibility.eligible, true);
  });

  it('strictly preserves null for missing numeric quality fields without coercing to zero', () => {
    const result = validateAndAssembleTestResult({
      method: 'sanger',
      rawInput: 'chr17:43044295:G>A',
      readDepth: null,
      genotypeQuality: null,
      alleleFraction: null,
    });

    assert.strictEqual(result.test_record.read_depth, null);
    assert.strictEqual(result.test_record.genotype_quality, null);
    assert.strictEqual(result.test_record.allele_fraction, null);
    assert.notStrictEqual(result.test_record.read_depth, 0);
  });

  it('detects low read depth and flags valid_with_warnings and marginal quality', () => {
    const result = validateAndAssembleTestResult({
      method: 'ngs',
      rawInput: 'chr17:43044295:G>A',
      readDepth: 8, // Low depth <20x
      genotypeQuality: 99,
      alleleFraction: 0.5,
    });

    assert.strictEqual(result.analysis_eligibility.eligible, true);
    assert.strictEqual(result.analysis_eligibility.validation_status, 'valid_with_warnings');
    assert.strictEqual(result.test_record.quality_status, 'marginal');
    assert.ok(result.analysis_eligibility.warnings.some((w) => w.includes('depth')));
  });
});

describe('Stage 4 & 7: Tri-Pillar Engine Integration with Testing Context', () => {
  it('preserves originating genetic test context in execution log and synthesis', async () => {
    const testContext = validateAndAssembleTestResult({
      method: 'ngs',
      rawInput: '17661',
      assembly: 'GRCh38',
      laboratorySource: 'Test Center',
      readDepth: 120,
      genotypeQuality: 99,
      alleleFraction: 0.50,
      zygosity: 'HETEROZYGOUS',
    });

    const analysis = await executeVariantAnalysis(
      '17661',
      'GRCh38',
      'test-user',
      {},
      undefined,
      testContext
    );

    assert.ok(analysis.geneticTestContext, 'geneticTestContext must be attached to FullAnalysisResult');
    assert.strictEqual(analysis.geneticTestContext?.test_record.method, 'ngs');
    assert.strictEqual(analysis.geneticTestContext?.test_record.read_depth, 120);
    assert.ok(analysis.executionLog.some((l) => l.step.includes('Genetic Testing Method Intake')));

    const markdown = generateMarkdownReport(analysis);
    assert.ok(markdown.includes('ORIGINATING GENETIC TESTING METHOD & TECHNICAL QC'));
    assert.ok(markdown.includes('Next-Generation Sequencing'));
  });
});
