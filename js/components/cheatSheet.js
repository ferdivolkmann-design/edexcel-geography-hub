/**
 * Printable Exam Morning Cheat Sheet Component
 * Generates a clean, dense, printable revision table of all Edexcel case studies
 * with place-specific statistics, causes, categorized impacts, and AO2 points.
 */
import { EDEXCEL_PAPERS } from '../data/initialData.js';

export class CheatSheetModal {
  constructor() {
    this.caseStudies = [];
    this.selectedPaper = 'All'; // 'All' | 'Paper 1' | 'Paper 2'
  }

  open(caseStudies) {
    this.caseStudies = caseStudies;
    this.selectedPaper = 'All';
    this.render();
  }

  close() {
    const container = document.getElementById('cheat-sheet-modal-container');
    if (container) container.innerHTML = '';
  }

  setPaperFilter(paper) {
    this.selectedPaper = paper;
    this.render();
  }

  getFilteredStudies() {
    if (this.selectedPaper === 'All') return this.caseStudies;
    const allowedTopics = EDEXCEL_PAPERS[this.selectedPaper] || [];
    return this.caseStudies.filter(s => allowedTopics.includes(s.topic));
  }

  printSheet() {
    window.print();
  }

  render() {
    const container = document.getElementById('cheat-sheet-modal-container');
    if (!container) return;

    const filtered = this.getFilteredStudies();

    container.innerHTML = `
      <div class="fixed inset-0 z-[100000] overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden animate-scaleUp">
          
          <!-- Sticky Modal Header (Hidden during actual printing) -->
          <div class="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div>
              <div class="flex items-center gap-2 mb-0.5">
                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                  ⚡ Exam Morning Quick Sheet
                </span>
                <span class="text-xs text-slate-500 font-semibold">Specification 9GE0 High-Yield Summary</span>
              </div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900">
                1-Page Printable Case Study Revision Cheat Sheet
              </h2>
            </div>

            <!-- Filters & Print Action -->
            <div class="flex items-center gap-2">
              <div class="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
                <button id="cs-filter-all" class="px-2.5 py-1 rounded-md transition ${this.selectedPaper === 'All' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'}">All</button>
                <button id="cs-filter-p1" class="px-2.5 py-1 rounded-md transition ${this.selectedPaper === 'Paper 1' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'}">Paper 1 (Physical)</button>
                <button id="cs-filter-p2" class="px-2.5 py-1 rounded-md transition ${this.selectedPaper === 'Paper 2' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'}">Paper 2 (Human)</button>
              </div>

              <button id="cs-print-btn" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                <span>Print / Save PDF</span>
              </button>

              <button id="cs-close-btn" class="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <!-- Printable Document Container -->
          <div id="printable-cheat-sheet" class="flex-1 overflow-y-auto p-4 sm:p-6 bg-white text-slate-900 font-sans print:p-0 print:m-0">
            
            <!-- Document Header -->
            <div class="mb-4 pb-3 border-b-2 border-slate-900 flex items-center justify-between">
              <div>
                <h1 class="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                  Pearson Edexcel A-Level Geography (9GE0)
                </h1>
                <p class="text-xs text-slate-600 font-bold uppercase tracking-wider">
                  Master Revision Cheat Sheet • High-Yield Statistics (AO1) & Evaluative Judgments (AO2)
                </p>
              </div>
              <div class="text-right text-[11px] text-slate-500 font-mono">
                <span>Filter: <strong>${this.selectedPaper}</strong></span> • <span>${filtered.length} Case Studies</span>
              </div>
            </div>

            <!-- Dense Cheat Sheet Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                    <th class="p-2.5 border border-slate-800 w-[18%]">Case Study & Paper</th>
                    <th class="p-2.5 border border-slate-800 w-[24%]">Place-Specific Stats (AO1)</th>
                    <th class="p-2.5 border border-slate-800 w-[24%]">Causes & Impacts (Soc/Econ/Env)</th>
                    <th class="p-2.5 border border-slate-800 w-[24%]">AO2 Successes vs Limitations</th>
                    <th class="p-2.5 border border-slate-800 w-[10%]">Top Examiner Tip</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  ${filtered.map((s, idx) => {
                    const isPhysical = s.category === 'Physical';
                    const paperBadge = isPhysical ? 'Paper 1 (Physical)' : 'Paper 2 (Human)';
                    const bgRow = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';

                    const impactsText = typeof s.impacts === 'object' 
                      ? [
                          s.impacts.social ? `<strong>Soc:</strong> ${s.impacts.social}` : '',
                          s.impacts.economic ? `<strong>Econ:</strong> ${s.impacts.economic}` : '',
                          s.impacts.environmental ? `<strong>Env:</strong> ${s.impacts.environmental}` : ''
                        ].filter(Boolean).join('<br>')
                      : s.impacts || '';

                    return `
                      <tr class="${bgRow} align-top text-[11px] leading-relaxed">
                        
                        <!-- Col 1: Title & Location -->
                        <td class="p-2.5 border border-slate-200">
                          <span class="inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase mb-1 ${
                            isPhysical ? 'bg-emerald-100 text-emerald-900' : 'bg-indigo-100 text-indigo-900'
                          }">${paperBadge}</span>
                          <h4 class="font-extrabold text-xs text-slate-900 leading-snug mb-1">${s.title}</h4>
                          <span class="text-slate-500 font-semibold block text-[10px]">📍 ${s.country}</span>
                          <span class="text-slate-400 block text-[9px] mt-0.5 font-medium">${s.topic}</span>
                        </td>

                        <!-- Col 2: AO1 Hard Stats -->
                        <td class="p-2.5 border border-slate-200">
                          <ul class="space-y-1 text-slate-800">
                            ${s.stats.slice(0, 4).map(st => `<li>• ${st}</li>`).join('')}
                          </ul>
                        </td>

                        <!-- Col 3: Causes & Impacts -->
                        <td class="p-2.5 border border-slate-200">
                          ${s.causes ? `<div class="mb-1.5"><span class="font-bold text-slate-900">Cause:</span> <span class="text-slate-700">${s.causes.slice(0, 160)}...</span></div>` : ''}
                          <div class="text-slate-700 pt-1 border-t border-slate-100">${impactsText}</div>
                        </td>

                        <!-- Col 4: AO2 Evaluation Points -->
                        <td class="p-2.5 border border-slate-200">
                          <div class="mb-1 text-emerald-900">
                            <span class="font-bold text-[10px] text-emerald-800 uppercase block">✅ Strengths:</span>
                            <span>${s.evaluation.strengths[0] || 'High policy success'}</span>
                          </div>
                          <div class="text-rose-900 pt-1 border-t border-slate-100">
                            <span class="font-bold text-[10px] text-rose-800 uppercase block">❌ Limitations:</span>
                            <span>${s.evaluation.limitations[0] || 'Externalities & high costs'}</span>
                          </div>
                        </td>

                        <!-- Col 5: Top Tip -->
                        <td class="p-2.5 border border-slate-200 text-indigo-950 font-medium italic text-[10px] leading-snug">
                          ${s.examTips || 'Evaluate long-term vs short-term sustainability.'}
                        </td>

                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <!-- Footer Notes -->
            <div class="mt-4 pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>Prepared for Pearson Edexcel A-Level Geography (9GE0) Papers 1, 2 & 3.</span>
              <span>Edexcel Geography Case Study Hub • ${new Date().toLocaleDateString()}</span>
            </div>

          </div>

        </div>
      </div>
    `;

    // Hook events
    container.querySelector('#cs-close-btn').onclick = () => this.close();
    container.querySelector('#cs-print-btn').onclick = () => this.printSheet();

    container.querySelector('#cs-filter-all').onclick = () => this.setPaperFilter('All');
    container.querySelector('#cs-filter-p1').onclick = () => this.setPaperFilter('Paper 1');
    container.querySelector('#cs-filter-p2').onclick = () => this.setPaperFilter('Paper 2');
  }
}
