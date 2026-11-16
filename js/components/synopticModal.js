/**
 * Paper 3 Synoptic Link Visualizer Component
 * Visualizes Edexcel Paper 3 Synoptic Framework: Players, Attitudes, Actions & Futures
 * with cross-topic connection matrix between Physical and Human case studies.
 */

export class SynopticModal {
  constructor(options = {}) {
    this.onSelectStudy = options.onSelectStudy || (() => {});
    this.caseStudies = [];
  }

  open(caseStudies) {
    this.caseStudies = caseStudies;
    this.render();
  }

  close() {
    const container = document.getElementById('synoptic-modal-container');
    if (container) container.innerHTML = '';
  }

  render() {
    const container = document.getElementById('synoptic-modal-container');
    if (!container) return;

    // Filter studies that have synoptic links defined
    const synopticStudies = this.caseStudies.filter(s => s.synopticLinks && s.synopticLinks.length > 0);

    container.innerHTML = `
      <div class="fixed inset-0 z-[100000] overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
          
          <!-- Header -->
          <div class="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-amber-950">
                  Paper 3 Synoptic Matrix (20% of A-Level)
                </span>
                <span class="text-xs text-indigo-200 font-medium">Cross-Theme Linkage & Evaluation</span>
              </div>
              <h2 class="text-base sm:text-lg font-bold leading-snug">
                Edexcel Synoptic Investigation Framework
              </h2>
            </div>

            <button id="synoptic-close-btn" class="p-2 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
            
            <!-- The 4 Core Synoptic Pillars (Edexcel Specification Criterion) -->
            <div>
              <h3 class="text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                <span>🏛️</span> The 4 Pillars of Edexcel Paper 3 Analysis
              </h3>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                
                <div class="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200">
                  <span class="font-extrabold text-xs text-indigo-950 block mb-1">1. Players</span>
                  <p class="text-[11px] text-slate-600 leading-relaxed">
                    TNCs, national governments, local residents, IGOs (UN, World Bank), environmental NGOs.
                  </p>
                </div>

                <div class="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                  <span class="font-extrabold text-xs text-purple-950 block mb-1">2. Attitudes</span>
                  <p class="text-[11px] text-slate-600 leading-relaxed">
                    Economic profit vs conservationist preservation; technocentric vs ecocentric worldviews.
                  </p>
                </div>

                <div class="p-3 rounded-xl bg-sky-50/70 border border-sky-200">
                  <span class="font-extrabold text-xs text-sky-950 block mb-1">3. Actions</span>
                  <p class="text-[11px] text-slate-600 leading-relaxed">
                    Hard vs soft engineering, top-down state schemes vs bottom-up community initiatives.
                  </p>
                </div>

                <div class="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span class="font-extrabold text-xs text-emerald-950 block mb-1">4. Futures</span>
                  <p class="text-[11px] text-slate-600 leading-relaxed">
                    Long-term sustainability, climate tipping points, alternative geopolitical scenarios.
                  </p>
                </div>

              </div>
            </div>

            <!-- Cross-Theme Case Study Connections -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span>🔗</span> Case Studies with Cross-Topic Synoptic Links
                </h3>
                <span class="text-[11px] text-slate-500 font-semibold">${synopticStudies.length} interconnected studies</span>
              </div>

              <div class="space-y-3">
                ${synopticStudies.map(study => {
                  const isPhysical = study.category === 'Physical';
                  return `
                    <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-indigo-300 hover:bg-white transition-all shadow-xs">
                      <div class="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPhysical ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                            }">
                              ${study.category}: ${study.topic}
                            </span>
                            <span class="text-[11px] text-slate-500 font-medium">📍 ${study.country}</span>
                          </div>
                          <h4 class="font-bold text-sm text-slate-900 leading-snug">
                            ${study.title}
                          </h4>
                        </div>

                        <button class="synoptic-jump-btn px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition shrink-0 cursor-pointer" data-id="${study.id}">
                          Open Notes &rarr;
                        </button>
                      </div>

                      <div class="mt-2.5 pt-2.5 border-t border-slate-200/80">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-purple-900 block mb-1">
                          ⚡ Synoptic Links to Other Edexcel Topics:
                        </span>
                        <ul class="space-y-1 text-xs text-slate-700">
                          ${study.synopticLinks.map(link => `
                            <li class="flex items-start gap-1.5 leading-relaxed">
                              <span class="text-purple-600 font-bold mt-0.5">↳</span>
                              <span>${link}</span>
                            </li>
                          `).join('')}
                        </ul>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>In Paper 3, referencing players and attitudes across physical and human geography guarantees Level 4/5 AO2 marks.</span>
            <button id="synoptic-done-btn" class="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition">
              Close Matrix
            </button>
          </div>

        </div>
      </div>
    `;

    // Hook events
    container.querySelector('#synoptic-close-btn').onclick = () => this.close();
    container.querySelector('#synoptic-done-btn').onclick = () => this.close();

    container.querySelectorAll('.synoptic-jump-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        this.close();
        this.onSelectStudy(id);
      };
    });
  }
}
