// src/components/GeneticTestingMethodsView.tsx
// Comprehensive Genetic Testing Methods Explorer, Objective Selector, and Result Intake Module

import React, { useState, useMemo } from 'react';
import {
  GeneticTestMethodId,
  ClinicalObjectiveId,
  GeneticTestCatalogEntry,
  ObjectiveRecommendation,
  CanonicalGeneticTestResult,
  GeneticTestSubmissionPayload,
  TrioZygosityType,
} from '../types/geneticTesting.ts';
import { GENETIC_TESTS_CATALOG } from '../services/geneticTestsCatalog.ts';
import {
  CLINICAL_OBJECTIVES_RECOMMENDATIONS,
  selectMethodsForObjective,
} from '../services/geneticTestSelector.ts';
import { validateAndAssembleTestResult } from '../services/testResultValidation.ts';
import {
  Dna,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Layers,
  FlaskConical,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Info,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Zap,
  Play,
  FileText,
  Sliders,
  Check,
  AlertCircle,
  Eye,
  Microscope,
} from 'lucide-react';

interface GeneticTestingMethodsViewProps {
  onRunAnalysisWithContext: (
    variantInput: string,
    assembly: 'GRCh38' | 'GRCh37',
    context: CanonicalGeneticTestResult
  ) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const GeneticTestingMethodsView: React.FC<GeneticTestingMethodsViewProps> = ({
  onRunAnalysisWithContext,
  onNavigateToTab,
}) => {
  // Navigation sub-tabs within this view
  const [activeSection, setActiveSection] = useState<'catalog' | 'selector' | 'intake'>('catalog');

  // Section A: Catalog State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inspectModalMethod, setInspectModalMethod] = useState<GeneticTestCatalogEntry | null>(null);

  // Section B: Objective Selector State
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<ClinicalObjectiveId>('multiple_genes_panel');

  // Section C & D: Intake & Validation State
  const [intakeMethod, setIntakeMethod] = useState<GeneticTestMethodId>('ngs');
  const [intakeVariantInput, setIntakeVariantInput] = useState<string>('chr17:43044295:G>A');
  const [intakeAssembly, setIntakeAssembly] = useState<'GRCh38' | 'GRCh37'>('GRCh38');
  const [intakeLabSource, setIntakeLabSource] = useState<string>('Genomics Reference Laboratory');
  const [intakeTestDate, setIntakeTestDate] = useState<string>('2026-03-15');
  const [intakeReadDepth, setIntakeReadDepth] = useState<string>('85');
  const [intakeGQ, setIntakeGQ] = useState<string>('99');
  const [intakeVAF, setIntakeVAF] = useState<string>('0.48');
  const [intakeZygosity, setIntakeZygosity] = useState<TrioZygosityType>('HETEROZYGOUS');
  const [intakeGeneSymbol, setIntakeGeneSymbol] = useState<string>('BRCA1');
  const [intakeTranscript, setIntakeTranscript] = useState<string>('NM_007294.4');
  const [intakeFileName, setIntakeFileName] = useState<string>('Patient_01_germline_panel.vcf');
  const [isSubmittingAnalysis, setIsSubmittingAnalysis] = useState<boolean>(false);

  // Filtered catalog list
  const catalogList = useMemo(() => {
    return Object.values(GENETIC_TESTS_CATALOG).filter((entry) => {
      const matchesSearch =
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.fullForm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.detectableGeneticChanges.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || entry.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Current objective recommendation
  const currentRecommendation: ObjectiveRecommendation = useMemo(() => {
    return selectMethodsForObjective(selectedObjectiveId);
  }, [selectedObjectiveId]);

  // Real-time live validation result for Section D
  const validationResult: CanonicalGeneticTestResult = useMemo(() => {
    const depthNum = intakeReadDepth.trim() !== '' ? Number(intakeReadDepth) : null;
    const gqNum = intakeGQ.trim() !== '' ? Number(intakeGQ) : null;
    const vafNum = intakeVAF.trim() !== '' ? Number(intakeVAF) : null;

    const payload: GeneticTestSubmissionPayload = {
      method: intakeMethod,
      rawInput: intakeVariantInput,
      assembly: intakeAssembly,
      laboratorySource: intakeLabSource,
      testDate: intakeTestDate,
      readDepth: isNaN(Number(depthNum)) ? null : depthNum,
      genotypeQuality: isNaN(Number(gqNum)) ? null : gqNum,
      alleleFraction: isNaN(Number(vafNum)) ? null : vafNum,
      zygosity: intakeZygosity,
      geneSymbol: intakeGeneSymbol,
      transcript: intakeTranscript,
      sourceFileName: intakeFileName,
    };

    return validateAndAssembleTestResult(payload);
  }, [
    intakeMethod,
    intakeVariantInput,
    intakeAssembly,
    intakeLabSource,
    intakeTestDate,
    intakeReadDepth,
    intakeGQ,
    intakeVAF,
    intakeZygosity,
    intakeGeneSymbol,
    intakeTranscript,
    intakeFileName,
  ]);

  // Quick preset loader for Section C
  const loadPreset = (presetType: 'ngs_brca1' | 'sanger_braf' | 'wes_cftr' | 'genotype_cyp' | 'cma_22q' | 'pcr_unsequenced') => {
    if (presetType === 'ngs_brca1') {
      setIntakeMethod('ngs');
      setIntakeVariantInput('chr17:43044295:G>A');
      setIntakeGeneSymbol('BRCA1');
      setIntakeAssembly('GRCh38');
      setIntakeReadDepth('112');
      setIntakeGQ('99');
      setIntakeVAF('0.49');
      setIntakeZygosity('HETEROZYGOUS');
      setIntakeFileName('CancerPanel_BRCA1_chr17.vcf');
    } else if (presetType === 'sanger_braf') {
      setIntakeMethod('sanger');
      setIntakeVariantInput('NM_004333.6:c.1799T>A');
      setIntakeGeneSymbol('BRAF');
      setIntakeAssembly('GRCh38');
      setIntakeReadDepth('');
      setIntakeGQ('95');
      setIntakeVAF('');
      setIntakeZygosity('HETEROZYGOUS');
      setIntakeFileName('BRAF_Exon15_Sanger_Trace.ab1');
    } else if (presetType === 'wes_cftr') {
      setIntakeMethod('wes');
      setIntakeVariantInput('7105'); // CFTR F508del
      setIntakeGeneSymbol('CFTR');
      setIntakeAssembly('GRCh38');
      setIntakeReadDepth('80');
      setIntakeGQ('99');
      setIntakeVAF('0.98');
      setIntakeZygosity('HOMOZYGOUS_ALT');
      setIntakeFileName('Trio_Proband_WES.vcf');
    } else if (presetType === 'genotype_cyp') {
      setIntakeMethod('genotyping');
      setIntakeVariantInput('rs4244285'); // CYP2C19*2
      setIntakeGeneSymbol('CYP2C19');
      setIntakeAssembly('GRCh38');
      setIntakeReadDepth('');
      setIntakeGQ('98');
      setIntakeVAF('');
      setIntakeZygosity('HETEROZYGOUS');
      setIntakeFileName('PGx_TaqMan_Report.csv');
    } else if (presetType === 'cma_22q') {
      setIntakeMethod('cma');
      setIntakeVariantInput('chr22:18648855-21465659:DEL');
      setIntakeGeneSymbol('TBX1');
      setIntakeAssembly('GRCh38');
      setIntakeReadDepth('');
      setIntakeGQ('');
      setIntakeVAF('');
      setIntakeZygosity('HETEROZYGOUS');
      setIntakeFileName('CytoScanHD_Array_22q11.chp');
    } else if (presetType === 'pcr_unsequenced') {
      setIntakeMethod('pcr');
      setIntakeVariantInput('BRCA1_Exon20_Amplicon_Positive');
      setIntakeGeneSymbol('BRCA1');
      setIntakeAssembly('GRCh38');
      setIntakeReadDepth('');
      setIntakeGQ('');
      setIntakeVAF('');
      setIntakeZygosity('UNKNOWN');
      setIntakeFileName('Gel_Electrophoresis_320bp.tif');
    }
  };

  const handleExecuteAnalysis = () => {
    if (!validationResult.analysis_eligibility.eligible) return;
    setIsSubmittingAnalysis(true);
    try {
      onRunAnalysisWithContext(intakeVariantInput, intakeAssembly, validationResult);
    } finally {
      setIsSubmittingAnalysis(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Hero & Tab Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <FlaskConical className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Genetic Testing Methods & Intake Engine
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                    9 Diagnostic Modalities
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Explore assay mechanisms, match clinical objectives to testing workflows, and intake laboratory results with quality control into the Tri-Pillar engine.
                </p>
              </div>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveSection('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSection === 'catalog'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Microscope className="w-3.5 h-3.5" />
              <span>Section A: 9 Techniques</span>
            </button>
            <button
              onClick={() => setActiveSection('selector')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSection === 'selector'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Section B: Objective Finder</span>
            </button>
            <button
              onClick={() => setActiveSection('intake')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSection === 'intake'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Sections C & D: Intake & QC</span>
            </button>
          </div>
        </div>

        {/* Section Description Header Banner */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              {activeSection === 'catalog' &&
                'Explore the molecular workflows, detectable changes, advantages, and limitations of all nine diagnostic techniques.'}
              {activeSection === 'selector' &&
                'Rules-based educational mapping between diagnostic clinical objectives and suitable molecular testing techniques.'}
              {activeSection === 'intake' &&
                'Enter or configure a laboratory test result, inspect technical quality indicators, and initiate Tri-Pillar synthesis.'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono shrink-0">
            GenomeGuard AI v1.3 • Canonical Schema Compliant
          </span>
        </div>
      </div>

      {/* =========================================================================
          SECTION A: EXPLORE THE NINE TECHNIQUES
      ========================================================================= */}
      {activeSection === 'catalog' && (
        <div className="space-y-6">
          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search methods by name, detectable changes, or clinical use..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-teal-500/60"
              >
                <option value="all">All Method Categories</option>
                <option value="targeted amplification">Targeted Amplification (PCR)</option>
                <option value="targeted sequencing">Targeted Sequencing (Sanger)</option>
                <option value="high-throughput sequencing">High-Throughput Sequencing (NGS/WES/WGS)</option>
                <option value="array-based cytogenomics">Arrays & Cytogenomics (Microarray/CMA)</option>
                <option value="targeted allele testing">Targeted Allele Testing (Genotyping)</option>
                <option value="classical cytogenetics">Classical Cytogenetics (Karyotyping)</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalogList.map((entry) => (
              <div
                key={entry.testId}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
                        {entry.category}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1 group-hover:text-teal-300 transition-colors">
                        {entry.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">{entry.fullForm}</p>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                        entry.canBeConsumedBySoftware
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                          : 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                      }`}
                      title={entry.softwareConsumptionDetails}
                    >
                      {entry.canBeConsumedBySoftware ? 'Software Supported' : 'Requires Sequencing'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {entry.description}
                  </p>

                  <div className="space-y-1.5 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-slate-400 font-medium">Main Purpose: </span>
                      <span className="text-slate-200">{entry.mainPurpose}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Typical Output: </span>
                      <span className="text-slate-300 font-mono text-[11px]">{entry.outputProduced}</span>
                    </div>
                    <div>
                      <span className="text-rose-400 font-medium">Main Limitation: </span>
                      <span className="text-rose-300/90 text-[11px]">{entry.limitations[0]}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => setInspectModalMethod(entry)}
                    className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Full Workflow & Protocol</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setIntakeMethod(entry.testId);
                      setActiveSection('intake');
                    }}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    Select for Intake
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION B: FIND A SUITABLE METHOD FOR AN OBJECTIVE
      ========================================================================= */}
      {activeSection === 'selector' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Objective Selector Navigation List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 h-fit">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-3">
                Select Analysis Objective
              </h2>

              {Object.values(CLINICAL_OBJECTIVES_RECOMMENDATIONS).map((rec) => {
                const isSelected = selectedObjectiveId === rec.objectiveId;
                return (
                  <button
                    key={rec.objectiveId}
                    onClick={() => setSelectedObjectiveId(rec.objectiveId)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-teal-500/10 border-teal-500/50 text-white shadow-sm'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        isSelected ? 'bg-teal-400' : 'bg-slate-600'
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-slate-100">{rec.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {rec.userQueryDescription}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Objective Details & Recommended Methods */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-5">
                <div className="pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
                      Educational Objective Mapping
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">
                    {currentRecommendation.title}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {currentRecommendation.userQueryDescription}
                  </p>
                </div>

                {/* Primary & Secondary Recommended Methods */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Primary Potentially Relevant Methods
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentRecommendation.primaryMethods.map((mId) => {
                        const entry = GENETIC_TESTS_CATALOG[mId];
                        return (
                          <div
                            key={mId}
                            className="bg-slate-950/80 border border-emerald-900/40 rounded-xl p-3.5 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-emerald-300">{entry.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{entry.category}</span>
                            </div>
                            <p className="text-xs text-slate-300 line-clamp-2">{entry.description}</p>
                            <button
                              onClick={() => {
                                setIntakeMethod(mId);
                                setActiveSection('intake');
                              }}
                              className="w-full text-center text-xs py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 rounded-lg border border-emerald-700/50 transition-colors"
                            >
                              Intake with {entry.name}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {currentRecommendation.secondaryMethods.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Secondary / Complementary Modalities
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {currentRecommendation.secondaryMethods.map((mId) => {
                          const entry = GENETIC_TESTS_CATALOG[mId];
                          return (
                            <span
                              key={mId}
                              className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800"
                            >
                              {entry.name} ({entry.fullForm})
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rationale & Transparent Blind Spots */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Rationale & Clinical Basis
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentRecommendation.rationale}
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      What This Modality May Miss
                    </h4>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {currentRecommendation.whatItMayMiss.map((miss, idx) => (
                        <li key={idx} className="text-rose-300/80">{miss}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Software Workflow Guide */}
                <div className="bg-teal-950/30 border border-teal-800/40 p-4 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-teal-300 font-semibold">
                    <Zap className="w-4 h-4 text-teal-400" />
                    How to Proceed in GenomeGuard AI
                  </div>
                  <p className="text-teal-200/80 leading-relaxed">
                    {currentRecommendation.softwareWorkflowGuide}
                  </p>
                </div>

                {/* Educational Disclaimer */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Educational Disclaimer:</strong> {currentRecommendation.educationalDisclaimer}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTIONS C & D: INTAKE, QUALITY CONTROL & ANALYSIS ELIGIBILITY
      ========================================================================= */}
      {activeSection === 'intake' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SECTION C: LABORATORY INTAKE CONSOLE (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Section C — Laboratory Test Result Intake
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure the originating diagnostic assay and enter structured variant details or VCF lines.
                  </p>
                </div>

                <span className="text-[11px] text-teal-400 font-mono bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/20 shrink-0">
                  Method: {GENETIC_TESTS_CATALOG[intakeMethod]?.name}
                </span>
              </div>

              {/* Sample Presets Bar */}
              <div>
                <span className="text-xs text-slate-400 font-medium block mb-2">
                  Load Realistic Assay Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => loadPreset('ngs_brca1')}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
                  >
                    NGS Panel (BRCA1)
                  </button>
                  <button
                    onClick={() => loadPreset('sanger_braf')}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
                  >
                    Sanger (BRAF V600E)
                  </button>
                  <button
                    onClick={() => loadPreset('wes_cftr')}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
                  >
                    Exome WES (CFTR)
                  </button>
                  <button
                    onClick={() => loadPreset('genotype_cyp')}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
                  >
                    Genotyping (CYP2C19)
                  </button>
                  <button
                    onClick={() => loadPreset('cma_22q')}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
                  >
                    CMA (22q11.2 CNV)
                  </button>
                  <button
                    onClick={() => loadPreset('pcr_unsequenced')}
                    className="text-[11px] px-2.5 py-1 rounded bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-colors"
                    title="Test validation guardrails against unsequenced PCR"
                  >
                    PCR (Unsequenced Test)
                  </button>
                </div>
              </div>

              {/* Form Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Method Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Originating Genetic Testing Method <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={intakeMethod}
                    onChange={(e) => setIntakeMethod(e.target.value as GeneticTestMethodId)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-teal-500/60"
                  >
                    <option value="ngs">Next-Generation Sequencing (Targeted Panel)</option>
                    <option value="sanger">Sanger Sequencing (Capillary Dideoxy)</option>
                    <option value="wes">Whole Exome Sequencing (WES)</option>
                    <option value="wgs">Whole Genome Sequencing (WGS)</option>
                    <option value="genotyping">Genotyping / SNP Testing (TaqMan/Array)</option>
                    <option value="cma">Chromosomal Microarray Analysis (CMA)</option>
                    <option value="microarray">DNA Microarray (Genotyping/Expression)</option>
                    <option value="pcr">PCR (Amplification Only)</option>
                    <option value="karyotyping">Karyotyping (G-Banded Cytogenetics)</option>
                  </select>
                </div>

                {/* Genome Assembly */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Reference Genome Assembly <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={intakeAssembly}
                    onChange={(e) => setIntakeAssembly(e.target.value as 'GRCh38' | 'GRCh37')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-teal-500/60"
                  >
                    <option value="GRCh38">GRCh38 / hg38 (Recommended)</option>
                    <option value="GRCh37">GRCh37 / hg19</option>
                  </select>
                </div>
              </div>

              {/* Main Variant / Result Query Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Variant Identifier, HGVS, Coordinates, or VCF Record <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={intakeVariantInput}
                  onChange={(e) => setIntakeVariantInput(e.target.value)}
                  placeholder="e.g. chr17:43044295:G>A, 17661, c.5266dupC, or standard VCF line"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Accepts ClinVar ID (17661), HGVS (c.1799T&gt;A), Coordinate (chr17:43044295:G&gt;A), or VCF line.
                </span>
              </div>

              {/* Gene & Transcript Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Target Gene Symbol (Optional)
                  </label>
                  <input
                    type="text"
                    value={intakeGeneSymbol}
                    onChange={(e) => setIntakeGeneSymbol(e.target.value)}
                    placeholder="e.g. BRCA1, CFTR, BRAF"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    RefSeq / MANE Transcript (Optional)
                  </label>
                  <input
                    type="text"
                    value={intakeTranscript}
                    onChange={(e) => setIntakeTranscript(e.target.value)}
                    placeholder="e.g. NM_007294.4"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60"
                  />
                </div>
              </div>

              {/* Technical Quality Metrics Section */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-teal-400" />
                    Assay Quality Metrics (Preserves Null If Missing)
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">Never Coerced to 0</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Read Depth (DP)</label>
                    <input
                      type="number"
                      value={intakeReadDepth}
                      onChange={(e) => setIntakeReadDepth(e.target.value)}
                      placeholder="e.g. 85 (x)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500/60"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Genotype Quality (GQ)</label>
                    <input
                      type="number"
                      value={intakeGQ}
                      onChange={(e) => setIntakeGQ(e.target.value)}
                      placeholder="e.g. 99 (Phred)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500/60"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Allele Fraction (VAF)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={intakeVAF}
                      onChange={(e) => setIntakeVAF(e.target.value)}
                      placeholder="e.g. 0.48"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Patient Zygosity</label>
                    <select
                      value={intakeZygosity}
                      onChange={(e) => setIntakeZygosity(e.target.value as TrioZygosityType)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-teal-500/60"
                    >
                      <option value="HETEROZYGOUS">Heterozygous (0/1)</option>
                      <option value="HOMOZYGOUS_ALT">Homozygous Alternate (1/1)</option>
                      <option value="HOMOZYGOUS_REF_WILDTYPE">Homozygous Reference (0/0)</option>
                      <option value="HEMIZYGOUS">Hemizygous (X/Y)</option>
                      <option value="UNKNOWN">Unknown / Not Assessed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Source Laboratory / File</label>
                    <input
                      type="text"
                      value={intakeFileName}
                      onChange={(e) => setIntakeFileName(e.target.value)}
                      placeholder="e.g. Clinical_Panel_Report.vcf"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500/60"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION D: QC VALIDATION & ANALYSIS ELIGIBILITY (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-5 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Section D — Quality Control & Eligibility
                  </h2>
                  <span className="text-[10px] text-slate-500 font-mono">Live Evaluator</span>
                </div>

                {/* Status Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      QC Status:
                    </span>
                    <span
                      className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        validationResult.test_record.quality_status === 'passed'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60'
                          : validationResult.test_record.quality_status === 'marginal'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-700/60'
                          : validationResult.test_record.quality_status === 'failed'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-700/60'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {validationResult.test_record.quality_status}
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      Tri-Pillar Eligibility:
                    </span>
                    <span
                      className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        validationResult.analysis_eligibility.eligible
                          ? 'bg-teal-950/60 text-teal-300 border border-teal-700/60'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-700/60'
                      }`}
                    >
                      {validationResult.analysis_eligibility.validation_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Validation Reasons & Details */}
                <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="font-semibold text-slate-300 block mb-1">
                      Evaluation Reasons:
                    </span>
                    <ul className="space-y-1">
                      {validationResult.analysis_eligibility.reasons.map((r, i) => (
                        <li key={i} className="text-slate-300 flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {validationResult.analysis_eligibility.warnings.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="font-semibold text-amber-400 block mb-1">
                        Technical Warnings & Caveats:
                      </span>
                      <ul className="space-y-1">
                        {validationResult.analysis_eligibility.warnings.map((w, i) => (
                          <li key={i} className="text-amber-300/90 flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResult.analysis_eligibility.missing_fields.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="font-semibold text-slate-400 block mb-1">
                        Missing or Unreported Fields:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {validationResult.analysis_eligibility.missing_fields.map((f, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="font-semibold text-slate-400 block mb-1">
                      Recommended Next Step:
                    </span>
                    <p className="text-slate-300 text-[11px]">
                      {validationResult.analysis_eligibility.recommended_next_steps[0] ||
                        'Ready for clinical evidence synthesis.'}
                    </p>
                  </div>
                </div>

                {/* Canonical Schema Preview Box */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-bold uppercase">
                    <span>Canonical Record Payload</span>
                    <span>JSON Preview</span>
                  </div>
                  <div>Format: {validationResult.test_record.input_format}</div>
                  <div>Method: {validationResult.test_record.method_display_name}</div>
                  <div>
                    Variant: {validationResult.variant.identifier || 'Unresolved'} (Gene:{' '}
                    {validationResult.variant.gene || 'N/A'})
                  </div>
                  <div>Assembly: {validationResult.test_record.genome_assembly}</div>
                </div>
              </div>

              {/* Action Button: Execute Tri-Pillar Analysis */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                {validationResult.analysis_eligibility.eligible ? (
                  <button
                    onClick={handleExecuteAnalysis}
                    disabled={isSubmittingAnalysis}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>
                      {isSubmittingAnalysis
                        ? 'Executing Tri-Pillar Engine...'
                        : 'Run Tri-Pillar Analysis with Assay Context'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-center text-xs text-rose-300 space-y-1">
                    <div className="font-bold flex items-center justify-center gap-1.5 text-rose-400">
                      <XCircle className="w-4 h-4" />
                      Analysis Ineligible
                    </div>
                    <p className="text-[11px] text-rose-300/80">
                      {validationResult.analysis_eligibility.reasons[0] ||
                        'Please resolve the validation requirements above.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FULL WORKFLOW INSPECTION MODAL (All 16 Technique Attributes)
      ========================================================================= */}
      {inspectModalMethod && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
                  {inspectModalMethod.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {inspectModalMethod.name} — Full Clinical Workflow
                </h3>
                <p className="text-xs text-slate-400 font-mono">{inspectModalMethod.fullForm}</p>
              </div>

              <button
                onClick={() => setInspectModalMethod(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-xs">
              <div>
                <h4 className="font-bold text-slate-200 mb-1">Biological Material & Input:</h4>
                <p className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {inspectModalMethod.biologicalMaterial}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-teal-400 mb-1">Detailed Ordered Workflow Steps:</h4>
                <ol className="space-y-1.5 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {inspectModalMethod.generalWorkflow.map((step, idx) => (
                    <li key={idx} className="text-slate-200 leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-emerald-400 mb-1">Advantages:</h4>
                  <ul className="space-y-1 list-disc list-inside text-slate-300">
                    {inspectModalMethod.advantages.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-rose-400 mb-1">Limitations & Blind Spots:</h4>
                  <ul className="space-y-1 list-disc list-inside text-rose-300/90">
                    {inspectModalMethod.limitations.map((lim, i) => (
                      <li key={i}>{lim}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <h4 className="font-bold text-amber-400">Important Interpretation Warnings:</h4>
                <ul className="space-y-1 list-disc list-inside text-amber-300/90">
                  {inspectModalMethod.interpretationWarnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-teal-950/20 p-3 rounded-lg border border-teal-800/40 text-teal-200">
                <span className="font-bold block mb-0.5">Software Consumption Protocol:</span>
                <p>{inspectModalMethod.softwareConsumptionDetails}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setInspectModalMethod(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                Close Workflow
              </button>

              <button
                onClick={() => {
                  setIntakeMethod(inspectModalMethod.testId);
                  setInspectModalMethod(null);
                  setActiveSection('intake');
                }}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold"
              >
                Configure Intake for {inspectModalMethod.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
