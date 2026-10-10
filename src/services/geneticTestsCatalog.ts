// src/services/geneticTestsCatalog.ts
// Reusable, structured catalog of the nine primary genetic and cytogenomic testing modalities

import { GeneticTestCatalogEntry, GeneticTestMethodId } from '../types/geneticTesting.ts';

export const GENETIC_TESTS_CATALOG: Record<GeneticTestMethodId, GeneticTestCatalogEntry> = {
  pcr: {
    testId: 'pcr',
    name: 'PCR',
    fullForm: 'Polymerase Chain Reaction',
    category: 'Targeted Amplification',
    description:
      'A molecular biology method used to make millions of copies of a specific, targeted DNA region through enzymatic replication using oligonucleotide primers and thermostable DNA polymerase.',
    mainPurpose:
      'DNA amplification — selectively amplifying exponential copies of a target DNA sequence to allow subsequent analytical assays or detection.',
    biologicalMaterial:
      'Purified genomic DNA (gDNA) or complementary DNA (cDNA) extracted from whole blood, saliva, buccal swabs, tissue biopsies, or amniotic fluid.',
    generalWorkflow: [
      '1. DNA extraction and purification from biological specimen.',
      '2. High-temperature denaturation (typically 94–98°C) to separate double-stranded DNA into single strands.',
      '3. Primer annealing (typically 50–65°C) where synthetic forward and reverse primers bind specifically to flanking regions of the target.',
      '4. DNA extension/elongation (typically 68–72°C) via thermostable DNA polymerase (e.g., Taq or high-fidelity polymerase) synthesizing complementary strands.',
      '5. Repeated cycling (typically 25–40 cycles) yielding exponential geometric amplification.',
      '6. End-point analysis of amplified products via agarose gel electrophoresis, capillary sizing, or real-time fluorescent probes (qPCR).',
    ],
    detectableGeneticChanges: [
      'Presence or absence of targeted genetic amplicons (e.g., pathogen detection, sex determination).',
      'Large insertions or deletions within the amplicon based on product size shift.',
      'Relative gene dosage or copy-number changes when performed via quantitative real-time PCR (qPCR) or droplet digital PCR (ddPCR).',
    ],
    typicalUseCases: [
      'Preliminary target amplification prior to Sanger sequencing or library preparation.',
      'Targeted deletion screening in CFTR or Duchenne Muscular Dystrophy (multiplex PCR).',
      'Clinical pathogen detection (viral load, bacterial diagnosis).',
      'Triplet repeat expansion sizing (repeat-primed PCR for Huntington or Fragile X).',
    ],
    advantages: [
      'Extremely rapid turnaround time (1–3 hours).',
      'Highly sensitive; requires minute quantities of starting DNA (nanogram or picogram scale).',
      'Cost-effective and widely accessible across standard diagnostic laboratories.',
    ],
    limitations: [
      'CRITICAL: PCR alone does NOT sequence DNA base-by-base or determine variant pathogenicity.',
      'Susceptible to contamination artifacts and primer-dimer false positives.',
      'Mutations located under primer binding sites can cause allele dropout (false homozygosity).',
    ],
    outputProduced:
      'Amplification curves (Ct/Cq values in qPCR) or physical amplicons visualized as bands on a gel or peaks on an electropherogram.',
    canBeConsumedBySoftware: false,
    softwareConsumptionDetails:
      'GenomeGuard AI analyzes resolved genomic variants, not raw amplification curves. PCR amplicons must be sequenced (via Sanger or NGS) or genotyped before submitting variant calls to the Tri-Pillar engine.',
    requiredInputFormat:
      'PCR alone produces no direct variant call. Downstream sequencing result (e.g. Sanger HGVS call) is required for software ingestion.',
    validationRequirements: [
      'Primer specificity validation via in-silico PCR.',
      'No-template negative controls and positive calibrator controls.',
      'Verification that amplicon size matches reference expected length.',
    ],
    interpretationWarnings: [
      'Do NOT automatically generate a variant classification from an unsequenced PCR result.',
      'A positive amplification signal indicates target presence, not necessarily clinical pathogenicity.',
      'A negative PCR result may indicate primer mismatch rather than true target absence.',
    ],
    educationalNotes:
      'PCR is an enzymatic tool that prepares or quantifies DNA; it is rarely an end-point variant diagnostic by itself.',
  },

  sanger: {
    testId: 'sanger',
    name: 'Sanger Sequencing',
    fullForm: 'Dideoxy Chain Termination Sequencing',
    category: 'Targeted Sequencing',
    description:
      'The clinical gold standard for single-gene and targeted DNA sequence analysis, reading 300–1000 base pairs with exceptional analytical precision using fluorescently labeled dideoxynucleotides (ddNTPs).',
    mainPurpose:
      'Targeted single-region sequencing — reading the exact nucleotide sequence of a specific amplicon to identify or confirm substitutions, small insertions, and deletions.',
    biologicalMaterial:
      'Targeted PCR amplicons derived from purified genomic DNA (blood, saliva, formal fixed paraffin-embedded [FFPE] tissue, prenatal samples).',
    generalWorkflow: [
      '1. Target preparation: Amplification of specific exon or genomic locus via PCR.',
      '2. Enzymatic clean-up of excess primers and dNTPs (e.g., ExoSAP-IT).',
      '3. Cycle sequencing reaction incorporating a mixture of standard dNTPs and fluorescent dye-labeled chain-terminating ddNTPs (ddATP, ddCTP, ddGTP, ddTTP).',
      '4. Capillary electrophoresis: Denatured fragments are separated by size down to single-nucleotide resolution through a polymer-filled capillary array.',
      '5. Fluorescent signal detection: A laser excites dyes at the capillary window, and a four-color CCD detector records emission traces.',
      '6. Chromatogram generation and base-calling with comparison to reference sequence (RefSeq).',
    ],
    detectableGeneticChanges: [
      'Single Nucleotide Variants (SNVs) and point mutations.',
      'Small insertions, deletions, and indels (<30–50 bp) within the sequenced amplicon.',
      'Heterozygous base changes (observed as overlapping dual peaks in chromatogram traces).',
    ],
    typicalUseCases: [
      'Orthogonal confirmation of next-generation sequencing (NGS) candidate variants.',
      'Targeted familial testing when a specific pathogenic variant is already known in the family.',
      'Single-gene diagnostic evaluation for disorders with limited genetic heterogeneity (e.g., Achondroplasia, Sickle Cell).',
    ],
    advantages: [
      'Gold standard analytical accuracy (>99.9% base calling accuracy per locus).',
      'Transparent, inspectable electropherogram trace quality (Phred quality scores).',
      'Low cost and fast turnaround when querying one or two specific exons.',
    ],
    limitations: [
      'Low throughput; cost and labor scale linearly with each fragment analyzed.',
      'Limited sensitivity for low-frequency somatic mosaicism (typically requires >15–20% variant allele frequency).',
      'Cannot detect large structural rearrangements, balanced inversions, or deep intronic variants outside the amplified window.',
      'Raw chromatograms (.ab1) require expert visual base-calling; chromatogram traces are not pre-normalized variant records.',
    ],
    outputProduced:
      'Chromatogram electropherogram (.ab1 file) and base-called sequence string with Phred quality scores (Q20/Q30).',
    canBeConsumedBySoftware: true,
    softwareConsumptionDetails:
      'GenomeGuard AI directly ingests verified variant calls derived from Sanger sequencing (HGVS nomenclature, ClinVar ID, or genomic coordinates). Note: Raw .ab1 binary chromatograms are not parsed in-browser; users provide verified base-called alterations.',
    requiredInputFormat:
      'HGVS notation (e.g., NM_007294.4:c.5266dupC), genomic coordinates (e.g., chr17:43044295:G>A), or ClinVar ID.',
    validationRequirements: [
      'Bidirectional sequencing (forward and reverse strands) to rule out dye artifacts.',
      'Signal-to-noise ratio >10:1 across the variant site.',
      'Phred base quality score Q >= 30 at the variant coordinate.',
      'Explicit reference transcript (RefSeq accession) for HGVS alignment.',
    ],
    interpretationWarnings: [
      'A variant detected through Sanger sequencing is NOT automatically pathogenic; clinical classification requires Tri-Pillar evidence synthesis.',
      'Overlapping peaks may represent artifactual noise or dye-blobs rather than true heterozygosity unless confirmed bidirectionally.',
      'Failure to detect a variant in a single exon does not exclude disease caused by mutations elsewhere in the gene.',
    ],
    educationalNotes:
      'Sanger sequencing remains the reference standard for validating high-stakes clinical variants before reporting.',
  },

  ngs: {
    testId: 'ngs',
    name: 'Next-Generation Sequencing',
    fullForm: 'High-Throughput / Next-Generation Sequencing (Targeted Panels)',
    category: 'High-Throughput Sequencing',
    description:
      'A massively parallel sequencing technology that simultaneously sequences millions of DNA fragments, allowing comprehensive interrogation of targeted multi-gene panels with deep coverage.',
    mainPurpose:
      'Multi-gene or targeted locus interrogation — simultaneously screening tens to hundreds of disease-associated genes with high depth of coverage.',
    biologicalMaterial:
      'Purified genomic DNA from blood, saliva, tissue biopsies, or cell-free DNA (liquid biopsy).',
    generalWorkflow: [
      '1. High-molecular weight genomic DNA extraction and quality quantification.',
      '2. DNA fragmentation (enzymatic or acoustic shearing).',
      '3. Library preparation: End repair, A-tailing, and ligation of sequencing adapters and sample-specific dual indexes.',
      '4. Target enrichment: Hybridization capture with biotinylated oligonucleotide probes or multiplex amplicon PCR targeting specific genes of interest.',
      '5. Massively parallel sequencing by synthesis (SBS) on flow cells yielding millions of short reads (e.g. 2x150 bp).',
      '6. Bioinformatics pipeline: Demultiplexing, read quality trimming, alignment to reference genome (GRCh38/GRCh37) via BWA-MEM to produce BAM/CRAM files.',
      '7. Variant calling (GATK HaplotypeCaller or DeepVariant) generating structured VCF files.',
      '8. Annotation, filtering, and clinical interpretation.',
    ],
    detectableGeneticChanges: [
      'Single nucleotide variants (SNVs).',
      'Small insertions and deletions (indels up to ~50 bp).',
      'Exon-level copy number variations (CNVs) when coverage depth normalization algorithms are validated.',
      'Low-frequency somatic variants and mosaicism (detectable down to 1–5% VAF with deep >500x coverage).',
    ],
    typicalUseCases: [
      'Hereditary cancer predisposition panels (e.g., 30–80 genes including BRCA1, BRCA2, TP53, Lynch genes).',
      'Cardiomyopathy, arrhythmia, and congenital heart defect panels.',
      'Comprehensive pediatric neurodevelopmental and epilepsy panels.',
    ],
    advantages: [
      'Massive throughput and cost efficiency per base compared to Sanger sequencing.',
      'High read depth (often 100x–1000x) enabling robust quantification of variant allele frequency (VAF).',
      'Simultaneous screening of all known genes associated with a clinical phenotype.',
    ],
    limitations: [
      'Only tests the specific targeted genes included on the panel; cannot detect variants in unprobed genes.',
      'Short reads struggle in repetitive regions, pseudogenes (e.g., PMS2, SMN1), and high GC-content promoters.',
      'Does not reliably detect large balanced structural rearrangements without specialized long-read protocols.',
    ],
    outputProduced:
      'Raw FASTQ reads -> Aligned BAM/CRAM files -> Variant Call Format (VCF) tables with read depth (DP), genotype quality (GQ), and allelic depth (AD).',
    canBeConsumedBySoftware: true,
    softwareConsumptionDetails:
      'GenomeGuard AI natively accepts VCF records, genomic coordinates, HGVS expressions, and structured variant tables generated by NGS pipelines.',
    requiredInputFormat:
      'Standard VCF line, genomic coordinate (chr:pos:ref>alt), ClinVar Variation ID, or HGVS c./p. notation.',
    validationRequirements: [
      'Genome assembly specification (GRCh38 vs GRCh37).',
      'Minimum read depth (typically DP >= 20x for germline, >= 200x for somatic).',
      'Variant allele fraction (VAF ~ 40–60% for germline heterozygotes, >90% for homozygotes).',
      'Phred-scaled genotype quality (GQ >= 30).',
    ],
    interpretationWarnings: [
      'Do not assume NGS panels cover every gene or regulatory locus; negative results only rule out variants in the analyzed regions.',
      'Variants in homologous pseudogene regions require orthogonal Sanger or long-read confirmation.',
      'Technical calling confidence (depth, mapping quality) does not imply biological pathogenicity.',
    ],
    educationalNotes:
      'NGS panels are currently the frontline workhorse in clinical genetics for diseases with multiple candidate genes.',
  },

  wes: {
    testId: 'wes',
    name: 'Whole Exome Sequencing',
    fullForm: 'Whole Exome Sequencing (WES)',
    category: 'High-Throughput Sequencing',
    description:
      'Sequencing focused specifically on the ~1–2% of the human genome that codes for proteins (the exome), which harbors approximately 85% of known disease-causing mutations.',
    mainPurpose:
      'Comprehensive coding-region discovery — interrogating ~20,000 protein-coding genes across the entire human genome to diagnose genetically heterogeneous or unexplained conditions.',
    biologicalMaterial:
      'High-quality genomic DNA extracted from whole blood, buccal cells, or tissue specimens.',
    generalWorkflow: [
      '1. Sample preparation and DNA extraction with rigorous integrity validation (DIN > 7.0).',
      '2. DNA fragmentation into 150–200 bp fragments.',
      '3. Sequencing library preparation with adapter ligation and barcode tagging.',
      '4. Exome capture: Hybridization with a comprehensive panel of synthetic biotinylated RNA/DNA oligonucleotide baits covering ~19,000–20,000 coding genes (~35–45 Mb target).',
      '5. Magnetic streptavidin bead pull-down to enrich for hybridized coding exons while washing away non-coding DNA.',
      '6. High-throughput paired-end sequencing (typically 2x150 bp) aiming for mean target coverage of 80x–120x.',
      '7. Alignment (GRCh38), quality control, variant calling (SNVs/indels), and pedigree-aware filtering (e.g. Trio-WES).',
    ],
    detectableGeneticChanges: [
      'Single nucleotide variants (SNVs) and small indels across coding exons and canonical splice junctions (+/- 2 to 5 bp).',
      'Multi-exon copy number variations (CNVs) using specialized depth-ratio algorithms.',
      'De novo germline mutations when performed as patient-parent trio analysis.',
    ],
    typicalUseCases: [
      'Unexplained pediatric rare diseases, syndromic intellectual disability, and developmental delay.',
      'Atypical clinical presentations where targeted panels were negative or non-diagnostic.',
      'Novel disease-gene discovery in research and translational clinical trials.',
    ],
    advantages: [
      'Examines almost all known protein-coding genes in a single diagnostic test.',
      'Significantly more cost-effective than Whole Genome Sequencing while capturing ~85% of known pathogenic variation.',
      'Data can be re-analyzed in subsequent years as new disease genes are discovered without re-sequencing the patient.',
    ],
    limitations: [
      'Completely misses deep intronic, promoter, 5\'/3\' UTR, and non-coding intergenic regulatory variants.',
      'Capture efficiency varies; 3–5% of coding exons may suffer from inadequate coverage (<10x) due to capture bias or extreme GC content.',
      'High rate of Variants of Uncertain Significance (VUS), requiring careful clinical correlation and family segregation.',
    ],
    outputProduced:
      'Exome VCF files, annotated variant tables, and coverage summary metrics across canonical RefSeq/MANE transcripts.',
    canBeConsumedBySoftware: true,
    softwareConsumptionDetails:
      'GenomeGuard AI ingests exome-derived candidate variants. When family trio inputs are provided (proband + parents), the system automatically assesses de novo and recessive segregation patterns.',
    requiredInputFormat:
      'Genomic coordinates, HGVS nomenclature, or VCF line, paired with optional trio parental genotypes.',
    validationRequirements: [
      'Mean on-target exome coverage >= 80x with >=95% of targeted bases covered at >=20x.',
      'Concordance with biological sex check and identity verification.',
      'Specification of genome assembly (GRCh38 strongly recommended).',
    ],
    interpretationWarnings: [
      'Coverage gaps in specific disease genes (e.g. GC-rich first exons) can cause false negative results.',
      'A negative WES does NOT exclude genetic etiology (non-coding mutations, structural variants, or repeat expansions may be present).',
      'Incidental and secondary findings in medically actionable genes (e.g., ACMG SF v3.2 list) require pre-test genetic counseling.',
    ],
    educationalNotes:
      'Trio-WES (analyzing child and both biological parents simultaneously) increases diagnostic yield by >30% over proband-only sequencing.',
  },

  wgs: {
    testId: 'wgs',
    name: 'Whole Genome Sequencing',
    fullForm: 'Whole Genome Sequencing (WGS)',
    category: 'High-Throughput Sequencing',
    description:
      'Comprehensive sequencing of nearly the entire 3.2 billion base pair human genome, covering coding exons, non-coding introns, regulatory promoters, enhancers, and intergenic regions.',
    mainPurpose:
      'Universal genomic interrogation — sequencing the complete nuclear (and mitochondrial) genome without the bias of target enrichment or capture probes.',
    biologicalMaterial:
      'High-molecular-weight genomic DNA extracted from whole blood or non-degraded tissue.',
    generalWorkflow: [
      '1. High-molecular-weight DNA isolation and stringent purity verification.',
      '2. PCR-free library preparation to minimize amplification bias and GC skew.',
      '3. High-throughput sequencing generating ~90–120 Gb of data per genome (typically 30x–60x mean depth).',
      '4. Bioinformatics alignment to reference genome (GRCh38) utilizing accelerated aligners (BWA-MEM2, DRAGEN).',
      '5. Comprehensive variant calling spanning SNVs, indels, copy number variants (CNVs), and structural variants (SVs, translocations, inversions).',
      '6. Mitochondrial genome assembly and heteroplasmy quantification.',
      '7. Tiered annotation, prioritizing known disease genes, deep-intronic splice disruptors, and structural breakpoints.',
    ],
    detectableGeneticChanges: [
      'Coding and non-coding single nucleotide variants (SNVs).',
      'Deep-intronic variants creating cryptic splice sites.',
      'Small and large structural variants (balanced/unbalanced translocations, inversions, complex rearrangements).',
      'Genome-wide copy number variations (CNVs) with precise breakpoint resolution.',
      'Mitochondrial DNA (mtDNA) variants and heteroplasmy.',
      'Short tandem repeat expansions (when specialized repeat callers such as ExpansionHunter are deployed).',
    ],
    typicalUseCases: [
      'Critically ill infants in neonatal intensive care units (rapid/ultra-rapid WGS).',
      'Patients with suspected genetic conditions who remain undiagnosed after uninformative microarray and exome sequencing.',
      'Comprehensive characterization of complex structural rearrangements.',
    ],
    advantages: [
      'Most comprehensive single genetic test available; minimizes capture bias and provides uniform coverage across GC-rich regions.',
      'Simultaneously identifies SNVs, CNVs, and structural variants in a unified assay.',
      'Enables future re-interrogation of non-coding regulatory elements as genomic knowledge expands.',
    ],
    limitations: [
      'Highest computational storage and bioinformatic analysis requirements (~100 GB per sample).',
      'Generates 3 to 4 million variants per individual, creating a massive clinical interpretation and filtering challenge.',
      'Deep non-coding variant interpretation is currently constrained by limited functional characterization.',
      'Standard short-read WGS may still struggle with highly repetitive centromeric/telomeric regions and complex pseudogenes.',
    ],
    outputProduced:
      'Full genome VCF (SNV/Indel and SV/CNV VCFs), cram alignment files, and structural variant breakpoint calls.',
    canBeConsumedBySoftware: true,
    softwareConsumptionDetails:
      'GenomeGuard AI accepts prioritized candidate variant calls derived from WGS. Users supply specific coordinates, HGVS alterations, or VCF entries for Tri-Pillar clinical evaluation.',
    requiredInputFormat:
      'Genomic coordinates (chr:pos:ref>alt), VCF record, or HGVS nomenclature on GRCh38.',
    validationRequirements: [
      'Mean genome-wide read depth >= 30x with >=90% of the genome covered at >=15x.',
      'Mapping quality and duplication metrics within clinical tolerances.',
      'Validation of candidate structural breakpoints before definitive clinical action.',
    ],
    interpretationWarnings: [
      'Do not assume every WGS test detects every structural or repetitive variant; detection depends on read length, chemistry, and validated callers.',
      'The vast majority of non-coding variants found in WGS are currently of uncertain significance.',
      'Finding a variant does not prove it is the etiology of the patient\'s phenotype without clinical correlation.',
    ],
    educationalNotes:
      'WGS provides the ultimate genomic dataset; the primary hurdle has shifted from sequencing generation to clinical variant curation.',
  },

  microarray: {
    testId: 'microarray',
    name: 'DNA Microarray',
    fullForm: 'DNA Microarray (Genotyping & Expression Arrays)',
    category: 'Array-Based Cytogenomics',
    description:
      'A solid-substrate hybridization platform with thousands to millions of pre-synthesized microscopic DNA probes used to query predefined target sequences, genotypes, or gene expression signals.',
    mainPurpose:
      'Predefined target profiling — measuring fluorescent hybridization intensity across fixed probe locations to evaluate known genotypes, copy numbers, or transcript levels.',
    biologicalMaterial:
      'Genomic DNA (for genotyping/CGH arrays) or total RNA converted to labeled cDNA/cRNA (for gene expression arrays).',
    generalWorkflow: [
      '1. Isolation of high-quality DNA or RNA from biological specimen.',
      '2. Fluorescent labeling of target nucleic acids (e.g., using Cy3/Cy5 or biotin-streptavidin phycoerythrin).',
      '3. Hybridization of labeled targets to a solid glass slide or silicon beadchip containing millions of pre-immobilized probe oligonucleotides.',
      '4. Stringent washing to remove non-specific and unhybridized fragments.',
      '5. High-resolution laser scanning measuring fluorescent intensity emitted at each microscopic probe feature.',
      '6. Bioinformatic signal processing, background subtraction, normalization, and allele/expression intensity quantification.',
    ],
    detectableGeneticChanges: [
      'Genotypes at predefined Single Nucleotide Polymorphism (SNP) loci.',
      'Relative gene expression levels across the transcriptome (expression arrays).',
      'Copy number imbalances across interrogated probe regions (comparative genomic hybridization arrays).',
    ],
    typicalUseCases: [
      'Genome-wide association studies (GWAS) and population cohort biobanking.',
      'Direct-to-consumer genetic ancestry and wellness profiling.',
      'Tumor gene expression profiling for prognostic stratification (e.g., MammaPrint, Oncotype DX).',
    ],
    advantages: [
      'High sample throughput and low cost per sample for known target screening.',
      'Mature, robust, and highly standardized bioinformatic calling pipelines.',
      'Simultaneous evaluation of hundreds of thousands of predefined loci.',
    ],
    limitations: [
      'CRITICAL: Microarrays CANNOT discover arbitrary novel DNA sequence variants; they query ONLY pre-synthesized probe sequences.',
      'Cannot provide nucleotide sequence outside probe positions.',
      'Susceptible to hybridization artifacts caused by secondary structure or uncharacterized adjacent sequence changes.',
    ],
    outputProduced:
      'Probe intensity files (.CEL, .IDAT) processed into genotype calls (.ped/.map, VCF) or log2 expression fold-changes.',
    canBeConsumedBySoftware: true,
    softwareConsumptionDetails:
      'GenomeGuard AI accepts specific genotype calls (rsIDs, genomic coordinates) derived from genotyping arrays for pathogenicity and ACMG evaluation.',
    requiredInputFormat:
      'dbSNP rsID (e.g., rs80357906), genomic coordinate, or ClinVar Variation ID for the specific probed site.',
    validationRequirements: [
      'Array call rate >= 98–99% across the chip.',
      'Probe hybridization signal intensity above background threshold.',
      'Genotype cluster separation quality metric (e.g. GenCall score >= 0.15).',
    ],
    interpretationWarnings: [
      'An ordinary genotyping array does NOT discover new disease-causing mutations; it only assesses predefined targets.',
      'Expression microarray results measure cellular mRNA levels, which fluctuate dynamically and do not directly equal germline DNA sequence changes.',
      'A negative array result only indicates absence of variants at the specific probed positions.',
    ],
    educationalNotes:
      'Microarrays rely on fixed molecular hybridization; what is not on the chip cannot be seen.',
  },

  cma: {
    testId: 'cma',
    name: 'Chromosomal Microarray',
    fullForm: 'Chromosomal Microarray Analysis (CMA / aCGH & SNP-Array)',
    category: 'Array-Based Cytogenomics',
    description:
      'A high-resolution cytogenomic method that scans the entire genome for submicroscopic gains (duplications) and losses (deletions) of genomic material (Copy Number Variants, CNVs).',
    mainPurpose:
      'Copy Number Variant detection — identifying submicroscopic chromosomal deletions and duplications down to tens of kilobases across all chromosomes.',
    biologicalMaterial:
      'High-quality genomic DNA extracted from peripheral blood, prenatal specimens (amniocytes, chorionic villi), or tissue.',
    generalWorkflow: [
      '1. Genomic DNA extraction from patient (and reference control for array-CGH).',
      '2. DNA labeling (fluorescent dye incorporation or enzymatic tagging).',
      '3. Hybridization onto high-density oligonucleotide or combined SNP/oligo microarray platforms (e.g., CytoScan, Affymetrix, Agilent).',
      '4. Laser fluorescence scanning to detect signal intensity at every genomic probe.',
      '5. Computational segmentation analysis: Calculating Log2 intensity ratios (to detect deletions/duplications) and B-Allele Frequency (BAF in SNP arrays).',
      '6. Cytogenetic review: Mapping copy-number anomalies to chromosome bands, size, gene content, and databases of genomic variation (ClinGen, DGV).',
    ],
    detectableGeneticChanges: [
      'Submicroscopic microdeletions and microduplications (typically >= 20–50 kb, significantly finer than karyotyping).',
      'Large chromosomal aneuploidies and unbalanced translocations.',
      'Absence of Heterozygosity (AOH) / Loss of Heterozygosity (LOH) indicating uniparental disomy (UPD) or consanguinity (when using SNP-based arrays).',
    ],
    typicalUseCases: [
      'First-tier clinical diagnostic test for unexplained developmental delay, intellectual disability, autism spectrum disorder, and multiple congenital anomalies.',
      'Prenatal diagnosis following abnormal ultrasound findings with normal karyotype.',
      'Detection of submicroscopic interstitial microdeletion syndromes (e.g., 22q11.2 DiGeorge, 7q11.23 Williams).',
    ],
    advantages: [
      'Approximately 100-fold higher resolution than conventional G-banded karyotyping (~20–50 kb vs 5–10 Mb).',
      'Does not require dividing cells or living cell culture.',
      'Unbiased, objective genome-wide interrogation of copy number status.',
    ],
    limitations: [
      'CRITICAL: CMA CANNOT identify ordinary single-nucleotide point mutations or small indels within genes.',
      'Cannot detect truly balanced chromosomal rearrangements (balanced reciprocal translocations, inversions) because there is no net loss or gain of genetic material.',
      'Cannot determine the physical chromosomal location or orientation of duplicated segments (e.g. tandem duplication vs insertion into another chromosome).',
      'Low-level mosaicism (<10–15%) may be missed.',
    ],
    outputProduced:
      'Cytogenomic call reports detailing genomic coordinates (ISCN nomenclature, e.g., arr[GRCh38] 22q11.21(18648855_21465659)x1), copy number state (loss/gain), and gene list.',
    canBeConsumedBySoftware: true,
    softwareConsumptionDetails:
      'GenomeGuard AI accepts CNV coordinates and genes impacted by chromosomal microdeletions/duplications. Users input genomic coordinates or ClinVar CNV variation IDs.',
    requiredInputFormat:
      'Genomic coordinates (e.g., chr22:18648855-21465659:DEL), gene-level locus, or ClinVar Variation ID for the CNV.',
    validationRequirements: [
      'Log2 ratio deviation passing statistical threshold (typically >= 3 consecutive aberrant probes).',
      'Median absolute pairwise difference (MAPD) quality score <= 0.25.',
      'SNP array B-allele frequency verification to corroborate copy-number changes.',
    ],
    interpretationWarnings: [
      'CMA does NOT replace sequencing; a patient with normal CMA can still have a lethal single-nucleotide mutation.',
      'A normal CMA does not rule out balanced chromosomal translocations that may cause reproductive risks.',
      'Benign copy number polymorphisms are widespread in healthy populations; CNVs must be cross-referenced against population databases (DGV, gnomAD SV).',
    ],
    educationalNotes:
      'CMA revolutionized clinical genetics by replacing karyotyping as the frontline test for developmental delay, but it remains blind to balanced events and point mutations.',
  },

  genotyping: {
    testId: 'genotyping',
    name: 'Genotyping / SNP Testing',
    fullForm: 'Targeted Genotyping & Single Nucleotide Polymorphism (SNP) Testing',
    category: 'Targeted Allele Testing',
    description:
      'Targeted interrogation of specific, known polymorphic genetic positions to determine the exact alleles an individual carries at those defined sites.',
    mainPurpose:
      'Predefined allele discrimination — querying specific known variants to establish homozygous reference, heterozygous, or homozygous alternate genotype status.',
    biologicalMaterial:
      'Purified DNA from blood, saliva, buccal swabs, or dried blood spots.',
    generalWorkflow: [
      '1. DNA extraction and concentration normalization.',
      '2. Target locus interrogation using allele-specific technologies (e.g., TaqMan fluorogenic 5\' nuclease assays, mass spectrometry MALDI-TOF, or targeted bead arrays).',
      '3. Allele-specific primer extension or probe hybridization with differential fluorescent/mass labeling.',
      '4. Signal acquisition and cluster analysis plotting Allele 1 signal versus Allele 2 signal.',
      '5. Automated genotype assignment (e.g., C/C, C/T, or T/T; Ref/Ref, Ref/Alt, Alt/Alt).',
      '6. Quality control filtering based on call confidence metrics.',
    ],
    detectableGeneticChanges: [
      'Targeted Single Nucleotide Polymorphisms (SNPs) and predetermined point mutations.',
      'Common known indels targeted by specific assay probes.',
      'Star (*) allele diplotypes for pharmacogenomic enzymes (e.g., CYP2D6, CYP2C19, TPMT, VKORC1).',
    ],
    typicalUseCases: [
      'Pharmacogenomic profiling to guide drug dosing and avoid adverse drug reactions.',
      'Carrier screening for common population founder mutations (e.g., Tay-Sachs, Cystic Fibrosis common panel).',
      'Targeted screening for known risk alleles (e.g., Factor V Leiden, Prothrombin G20210A, HLA-B*57:01).',
    ],
    advantages: [
      'Exceptionally cost-effective and ultra-high throughput.',
      'Very rapid turnaround time with automated binary/ternary calling.',
      'Highly reproducible results at tested loci.',
    ],
    limitations: [
      'Only tests the specific predetermined alleles designed into the assay; completely blind to any other mutation in the same gene.',
      'Cannot detect novel, private, or rare mutations outside the targeted panel.',
      'Cannot establish full gene sequence or phase (haplotype configuration) without specialized software.',
    ],
    outputProduced:
      'Discrete genotype calls (e.g., rs1799983: G/G, rs1801133: C/T) and call confidence scores.',
    canBeConsumedBySoftware: true,
    softwareConsumptionDetails:
      'GenomeGuard AI directly accepts rsIDs, genomic coordinates, and HGVS nomenclature for targeted SNPs to evaluate clinical evidence and ACMG guidelines.',
    requiredInputFormat:
      'dbSNP rsID (e.g., rs1799983), genomic coordinate (chr:pos:ref>alt), or ClinVar Variation ID.',
    validationRequirements: [
      'Genotype call confidence score >= 95%.',
      'Clear separation from adjacent genotype clusters on scatter plot.',
      'Inclusion of positive homozygous, heterozygous, and wild-type controls.',
    ],
    interpretationWarnings: [
      'CRITICAL: Do NOT infer that an individual will develop a disease from a genotype alone (penetrance, expressivity, and multigenic interactions govern clinical expression).',
      'A negative targeted SNP test only means the specific tested variant was absent; the patient may harbor a different mutation in the exact same gene.',
      'Pharmacogenomic genotypes guide drug selection and metabolism prediction, not monogenic disease diagnosis.',
    ],
    educationalNotes:
      'Genotyping answers whether a specific, predetermined letter is present; it does not read the rest of the book.',
  },

  karyotyping: {
    testId: 'karyotyping',
    name: 'Karyotyping',
    fullForm: 'Conventional G-Banded Cytogenetic Karyotyping',
    category: 'Classical Cytogenetics',
    description:
      'Microscopic examination of full metaphase chromosomes to evaluate chromosome number and gross structural integrity at the whole-genome cytogenetic level.',
    mainPurpose:
      'Chromosome-level structural and numerical analysis — detecting whole-chromosome aneuploidies, polyploidies, and large balanced or unbalanced chromosomal rearrangements.',
    biologicalMaterial:
      'Viable, actively dividing cells from peripheral blood (PHA-stimulated T-lymphocytes), bone marrow aspirates, amniotic fluid, or chorionic villi.',
    generalWorkflow: [
      '1. Short-term cell culture of viable nucleated cells to stimulate cell division.',
      '2. Mitotic arrest: Addition of colchicine or colcemid to arrest dividing cells in metaphase by disrupting the mitotic spindle.',
      '3. Hypotonic treatment (potassium chloride, KCl) causing cells to swell and disperse chromosomes.',
      '4. Chemical fixation with methanol/glacial acetic acid (3:1).',
      '5. Slide dropping and aging to produce well-spread metaphase chromosomes.',
      '6. Giemsa staining (G-banding / GTG banding) producing characteristic light and dark bands reflecting AT- and GC-rich chromatin architecture.',
      '7. High-magnification brightfield microscopy and digital image capture of at least 15–20 metaphase spreads.',
      '8. Chromosome counting, karyotype pairing (homologous chromosomes 1 to 22, X, and Y), and ISCN formula assignment by a certified cytogeneticist.',
    ],
    detectableGeneticChanges: [
      'Numerical chromosome abnormalities (aneuploidy: Trisomy 21, 18, 13; Monosomy X / Turner syndrome; Klinefelter syndrome 47,XXY).',
      'Triploidy and tetraploidy.',
      'Large structural rearrangements (balanced and unbalanced reciprocal translocations, Robertsonian translocations, pericentric and paracentric inversions).',
      'Large chromosomal deletions, duplications, and ring chromosomes larger than 5 to 10 megabases (Mb).',
    ],
    typicalUseCases: [
      'Suspected Down syndrome, Edwards syndrome, or other major aneuploidies.',
      'Investigation of recurrent pregnancy loss and infertility (evaluating balanced parental translocations).',
      'Hematologic malignancies (detecting acquired diagnostic translocations such as the Philadelphia chromosome t(9;22)).',
      'Ambiguous genitalia and disorders of sex development.',
    ],
    advantages: [
      'Genome-wide overview of the entire physical karyotype.',
      'Uniquely identifies truly balanced translocations and inversions that are completely invisible to microarrays and standard short-read NGS.',
      'Detects low-level structural mosaicism by counting multiple independent metaphase cells.',
    ],
    limitations: [
      'CRITICAL: Low analytical resolution (typically ~5–10 megabases / 400–550 bands); cannot identify submicroscopic microdeletions or any single-nucleotide point mutation.',
      'Requires viable, dividing living cells; cannot be performed on dead, fixed, or degraded tissue without successful culture.',
      'Long turnaround time (typically 7–14 days due to culture requirements).',
      'Subjective visual interpretation requiring highly trained cytogenetic specialists.',
    ],
    outputProduced:
      'ISCN karyotype formula (e.g., 46,XX; 47,XY,+21; 46,XX,t(9;22)(q34.1;q11.2)) accompanied by photographic metaphase karyogram images.',
    canBeConsumedBySoftware: false,
    softwareConsumptionDetails:
      'GenomeGuard AI evaluates molecular variants at nucleotide and gene level. Standard karyotyping outputs (metaphase images and whole-chromosome aneuploidies) cannot be directly processed as nucleotide coordinates without mapped molecular breakpoints.',
    requiredInputFormat:
      'Karyotype results describe chromosome-level morphology. For software evaluation, identified translocation breakpoints or genes must be converted to genomic coordinates or ClinVar IDs.',
    validationRequirements: [
      'Analysis of a minimum of 15–20 metaphase spreads to assess potential mosaicism.',
      'Minimum banding resolution of 400–550 bands per haploid set for constitutional blood karyotypes.',
      'Two independent cytogeneticists verifying the karyogram.',
    ],
    interpretationWarnings: [
      'A normal 46,XX or 46,XY karyotype does NOT rule out a genetic condition; it only confirms normal macroscopic chromosome structure and number.',
      'Karyotyping CANNOT detect single-nucleotide variants, small indels, or microdeletions below 5 Mb (e.g. 22q11.2 DiGeorge syndrome is typically missed on routine karyotype).',
      'Balanced translocations in an individual are usually clinically silent for that person, but confer substantial risks for unbalanced offspring or miscarriages.',
    ],
    educationalNotes:
      'Karyotyping is the historical foundation of medical cytogenetics and remains indispensable for finding balanced translocations, but modern molecular tests provide thousands of times higher resolution.',
  },
};
