// src/services/geneticTestSelector.ts
// Rules-based educational test selection and clinical objective mapping engine

import { ClinicalObjectiveId, ObjectiveRecommendation, GeneticTestMethodId } from '../types/geneticTesting.ts';

export const CLINICAL_OBJECTIVES_RECOMMENDATIONS: Record<ClinicalObjectiveId, ObjectiveRecommendation> = {
  single_gene_known: {
    objectiveId: 'single_gene_known',
    title: 'Investigate a Known Single-Gene Variant',
    userQueryDescription:
      'The patient or family has a specific suspected gene disorder with low genetic heterogeneity (e.g. Achondroplasia in FGFR3, or targeted testing for a known familial pathogenic variant).',
    primaryMethods: ['sanger'],
    secondaryMethods: ['pcr', 'ngs'],
    rationale:
      'Sanger sequencing is the gold standard for targeted single-gene and single-exon testing. It provides direct, highly accurate base calling with visual trace inspection at minimal cost when a single locus is under investigation. PCR is utilized upstream to amplify the target region.',
    whatItMayMiss: [
      'Mutations in other regions of the gene outside the amplified target.',
      'Mutations in alternative disease genes if the clinical diagnosis is genetically heterogeneous.',
      'Large multi-exon deletions or duplications (which require MLPA, qPCR, or CMA).',
      'Low-level somatic mosaicism (<15–20% VAF).',
    ],
    requiredInputData: [
      'Target gene symbol and specific exon or genomic coordinates.',
      'RefSeq transcript accession (e.g., NM_000142.5).',
      'Biological specimen for DNA extraction.',
    ],
    educationalDisclaimer:
      'Educational guide only. Choice of assay depends on institutional clinical protocols, turnaround urgency, and familial segregation status.',
    canSoftwareIngestResult: true,
    softwareWorkflowGuide:
      'Enter the verified Sanger base call as HGVS cDNA notation (e.g., c.1138G>A) or genomic coordinates in the Intake tab to trigger the Tri-Pillar evidence engine.',
  },

  confirm_sequence: {
    objectiveId: 'confirm_sequence',
    title: 'Confirm a Previously Identified Sequence Change',
    userQueryDescription:
      'An NGS panel or exome sequencing detected a putative candidate variant that requires orthogonal analytical validation prior to clinical reporting.',
    primaryMethods: ['sanger'],
    secondaryMethods: ['pcr'],
    rationale:
      'Orthogonal Sanger sequencing independently validates that candidate NGS calls are not bioinformatic alignment artifacts, PCR duplicate biases, or strand-specific chemistry errors. It provides indisputable electropherogram traces.',
    whatItMayMiss: [
      'Does not provide broader genomic context beyond the immediate amplicon.',
      'Low-frequency somatic mosaicism that falls beneath the Sanger electropherogram detection threshold (~15%).',
    ],
    requiredInputData: [
      'Exact genomic coordinate and flanking sequence for primer design.',
      'Original NGS variant call (VCF record or HGVS string).',
    ],
    educationalDisclaimer:
      'Many high-coverage clinical NGS pipelines no longer routinely require Sanger confirmation for high-quality calls (e.g. depth >30x, VAF ~50%), but Sanger confirmation remains common practice for unusual variants and indels.',
    canSoftwareIngestResult: true,
    softwareWorkflowGuide:
      'Confirm the call in your laboratory, then input the verified variant into GenomeGuard AI to synthesize ClinVar consensus and automated ACMG classification.',
  },

  multiple_genes_panel: {
    objectiveId: 'multiple_genes_panel',
    title: 'Examine Multiple Disease-Associated Genes (Panel)',
    userQueryDescription:
      'The patient presents with a phenotype associated with multiple known genes (e.g. hereditary breast/ovarian cancer, hypertrophic cardiomyopathy, hereditary neuropathy, or epilepsy).',
    primaryMethods: ['ngs'],
    secondaryMethods: ['sanger', 'wes'],
    rationale:
      'Targeted Next-Generation Sequencing (NGS) gene panels multiplex tens to hundreds of genes in parallel with deep coverage (>200x). This yields high diagnostic sensitivity across all known etiology genes simultaneously while keeping cost and VUS burden manageable.',
    whatItMayMiss: [
      'Genes not included on the targeted panel design.',
      'Deep non-coding intronic variants unless specifically captured by tailored probes.',
      'Balanced structural rearrangements and complex repetitive loci (pseudogene regions).',
    ],
    requiredInputData: [
      'Patient clinical phenotype and pedigree.',
      'High-quality genomic DNA.',
      'Selection of accredited disease-specific gene panel.',
    ],
    educationalDisclaimer:
      'Gene panel composition changes as new disease associations are published. Review panel content against current clinical guidelines.',
    canSoftwareIngestResult: true,
    softwareWorkflowGuide:
      'Export the candidate variant calls from your NGS VCF file. Paste the coordinates, VCF record, or HGVS nomenclature into GenomeGuard AI.',
  },

  coding_regions_exome: {
    objectiveId: 'coding_regions_exome',
    title: 'Explore Coding-Region Variants Across the Exome (WES)',
    userQueryDescription:
      'The patient has an undiagnosed complex or syndromic condition (e.g. unexplained developmental delay, dysmorphic features, or negative multi-gene panel testing).',
    primaryMethods: ['wes'],
    secondaryMethods: ['ngs', 'wgs', 'cma'],
    rationale:
      'Whole Exome Sequencing (WES) captures the ~20,000 human protein-coding genes where ~85% of known disease-causing mutations reside. It is ideal for genetically heterogeneous or atypical presentations, particularly when conducted as a patient-parent Trio.',
    whatItMayMiss: [
      'Non-coding regulatory promoters, enhancers, and deep-intronic variants.',
      'Exons with poor capture efficiency or extreme GC content (3–5% of exome).',
      'Structural variants, balanced translocations, and repeat expansions.',
    ],
    requiredInputData: [
      'High-quality genomic DNA from proband and ideally biological parents (Trio).',
      'Detailed phenotypic HPO terms for variant prioritization.',
    ],
    educationalDisclaimer:
      'WES carries a substantial rate of Variants of Uncertain Significance (VUS) and potential for incidental secondary findings in medically actionable genes.',
    canSoftwareIngestResult: true,
    softwareWorkflowGuide:
      'Use GenomeGuard AI\'s Trio Inheritance Mode in the Clinical Workbench to upload child and parental genotypes to automatically detect de novo and recessive segregation.',
  },

  broad_coding_noncoding: {
    objectiveId: 'broad_coding_noncoding',
    title: 'Explore Coding and Non-Coding Variants Broadly (WGS)',
    userQueryDescription:
      'Comprehensive genomic assessment for undiagnosed patients where exome and microarray were uninformative, or for critically ill infants requiring rapid unified diagnosis.',
    primaryMethods: ['wgs'],
    secondaryMethods: ['wes', 'cma'],
    rationale:
      'Whole Genome Sequencing (WGS) covers coding and non-coding regions with uniform, PCR-free coverage. It uniquely detects deep intronic splice variants, structural variants (SVs), copy-number variants (CNVs), and mitochondrial DNA in a single assay.',
    whatItMayMiss: [
      'Complex centromeric/telomeric repeats and tandem repeat expansions without specialized long-read protocols.',
      'Accurate clinical interpretation of millions of non-coding variants where biological consequences remain poorly characterized.',
    ],
    requiredInputData: [
      'High-molecular-weight genomic DNA.',
      'Extensive computational bioinformatics and data storage infrastructure (~100 GB/sample).',
    ],
    educationalDisclaimer:
      'WGS is the most comprehensive genomic test, but generating data does not guarantee clinical diagnosis; variant filtering and functional curation are the primary bottlenecks.',
    canSoftwareIngestResult: true,
    softwareWorkflowGuide:
      'Filter your WGS VCF down to candidate prioritized variants, then enter the genomic coordinates into GenomeGuard AI for multi-pillar assessment.',
  },

  predefined_snps: {
    objectiveId: 'predefined_snps',
    title: 'Examine Selected Known SNPs or Pharmacogenomic Targets',
    userQueryDescription:
      'Targeted evaluation of common population variants, pharmacogenomic alleles (e.g. CYP2C19, TPMT, DPYD), or risk-associated SNPs.',
    primaryMethods: ['genotyping', 'microarray'],
    secondaryMethods: ['sanger', 'pcr'],
    rationale:
      'Targeted genotyping assays (e.g. TaqMan, MALDI-TOF) or SNP beadchips provide rapid, inexpensive, and highly accurate identification of predefined alleles without the expense of sequencing uninformative regions.',
    whatItMayMiss: [
      'Any novel, rare, or private mutations in the gene not included on the assay panel.',
      'Full sequence context, novel indels, or structural rearrangements.',
    ],
    requiredInputData: [
      'Target SNP identifier (e.g. rs1799983, rs429358) or specific allele.',
      'Standard DNA sample from blood or saliva.',
    ],
    educationalDisclaimer:
      'Genotype does not guarantee phenotype. Carrier status or risk SNP presence does not guarantee clinical disease manifestation.',
    canSoftwareIngestResult: true,
    softwareWorkflowGuide:
      'Enter the dbSNP rsID or genomic coordinate in the Intake console to assess population allele frequency (gnomAD) and ClinVar records.',
  },

  copy_number_variations: {
    objectiveId: 'copy_number_variations',
    title: 'Investigate Potential Copy-Number Changes (Microdeletions/Duplications)',
    userQueryDescription:
      'Patient presents with unexplained developmental delay, autism spectrum disorder, or multiple congenital anomalies with suspected chromosomal imbalance.',
    primaryMethods: ['cma'],
    secondaryMethods: ['wgs', 'karyotyping', 'pcr'],
    rationale:
      'Chromosomal Microarray Analysis (CMA) is the frontline clinical recommendation for developmental delay and dysmorphism. It surveys the entire genome for gains and losses down to ~20–50 kb resolution without requiring live dividing cells.',
    whatItMayMiss: [
      'Single-nucleotide point mutations and small indels.',
      'Truly balanced chromosomal translocations or inversions (since no net DNA is lost or gained).',
      'Low-level cellular mosaicism (<10–15%).',
    ],
    requiredInputData: [
      'Patient DNA sample.',
      'Parental samples if candidate CNV is detected to evaluate de novo vs inherited status.',
    ],
    educationalDisclaimer:
      'CMA does not evaluate gene sequence integrity. A normal CMA does not rule out monogenic mutations.',
    canSoftwareIngestResult: true,
    softwareWorkflowGuide:
      'Input the CNV genomic coordinates or ClinVar CNV ID into the Intake tab to assess dosage sensitivity, ClinGen haploinsufficiency, and triplosensitivity.',
  },

  chromosome_abnormalities: {
    objectiveId: 'chromosome_abnormalities',
    title: 'Investigate Chromosome-Number or Large Structural Abnormalities',
    userQueryDescription:
      'Suspected major aneuploidy (e.g. Trisomy 21 Down syndrome), recurrent miscarriages, infertility, or hematologic malignancy translocations.',
    primaryMethods: ['karyotyping'],
    secondaryMethods: ['cma', 'pcr'],
    rationale:
      'Conventional G-banded karyotyping provides a direct whole-genome microscopic overview of metaphase chromosomes. It is the premier method for identifying whole-chromosome aneuploidies and balanced translocations/inversions.',
    whatItMayMiss: [
      'Submicroscopic microdeletions and microduplications (<5–10 Mb).',
      'All single-gene mutations and nucleotide sequence changes.',
      'Requires viable, dividing living cell culture.',
    ],
    requiredInputData: [
      'Viable nucleated cells (fresh heparinized blood or bone marrow).',
      'PHA stimulation and 48–72 hour cell culture.',
    ],
    educationalDisclaimer:
      'Karyotyping resolution is limited to 5–10 megabases. A normal karyotype cannot exclude microdeletion syndromes or single-gene disorders.',
    canSoftwareIngestResult: false,
    softwareWorkflowGuide:
      'Karyotype results produce ISCN formulas (e.g. 47,XY,+21). To analyze specific genes implicated in rearrangements, convert the breakpoints or candidate loci to genomic coordinates for software ingestion.',
  },

  interpret_existing_result: {
    objectiveId: 'interpret_existing_result',
    title: 'Interpret an Already Available Genetic Test Result',
    userQueryDescription:
      'You already possess a laboratory report or variant call from an NGS panel, exome, Sanger test, or microarray and want to run multi-pillar clinical evidence synthesis.',
    primaryMethods: ['ngs', 'wes', 'sanger', 'wgs', 'genotyping', 'cma'],
    secondaryMethods: ['pcr', 'microarray', 'karyotyping'],
    rationale:
      'GenomeGuard AI connects structured test results directly to ClinVar evidence, in-silico predictors (SIFT/PolyPhen/CADD), population frequencies (gnomAD), and automated ACMG 2015 rules.',
    whatItMayMiss: [
      'Software synthesis depends on the accuracy of the input variant and annotations; clinical interpretation must be reviewed by a certified clinical geneticist or molecular pathologist.',
    ],
    requiredInputData: [
      'Variant identifier (ClinVar ID, HGVS notation, dbSNP rsID, or genomic coordinates).',
      'Source testing method context and genome assembly (GRCh38/GRCh37).',
    ],
    educationalDisclaimer:
      'Results are for research, training, and clinical decision support. They do not constitute formal medical diagnosis.',
    canSoftwareIngestResult: true,
    softwareWorkflowGuide:
      'Proceed directly to the Intake and QC Validation section in this module or the Clinical Workbench to run full Tri-Pillar analysis.',
  },
};

export function selectMethodsForObjective(objectiveId: ClinicalObjectiveId): ObjectiveRecommendation {
  return CLINICAL_OBJECTIVES_RECOMMENDATIONS[objectiveId] || CLINICAL_OBJECTIVES_RECOMMENDATIONS.interpret_existing_result;
}
