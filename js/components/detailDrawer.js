/**
 * Detail Drawer Component - Renders the full case study study view
 * with interactive Active Recall blur blocks, AO2 evaluation tables,
 * synoptic links, and statistics badges.
 */

import { StorageService } from '../services/storage.js';

export class DetailDrawer {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.onClose = options.onClose || (() => {});
    this.onBackToMenu = options.onBackToMenu || options.onClose || (() => {});
    this.onEdit = options.onEdit || (() => {});
    this.onDelete = options.onDelete || (() => {});
    this.onFlyTo = options.onFlyTo || (() => {});
    this.onToggleExpand = options.onToggleExpand || (() => {});
    this.onMinimize = options.onMinimize || (() => {});
    this.onOpenExamPractice = options.onOpenExamPractice || (() => {});
    this.onConfidenceChanged = options.onConfidenceChanged || (() => {});
    this.examBlurActive = false;
    this.revealedBlocks = new Set(); // tracks which blurred blocks have been revealed
    this.currentStudy = null;
  }

  setExamBlur(isActive) {
    this.examBlurActive = isActive;
    if (!isActive) {
      this.revealedBlocks.clear();
    }
    if (this.currentStudy) {
      this.render(this.currentStudy);
    }
  }

  toggleBlockReveal(blockKey) {
    if (this.revealedBlocks.has(blockKey)) {
      this.revealedBlocks.delete(blockKey);
    } else {
      this.revealedBlocks.add(blockKey);
    }
    if (this.currentStudy) {
      this.render(this.currentStudy);
    }
  }

  revealAllBlocks() {
    if (!this.currentStudy) return;
    this.currentStudy.stats.forEach((_, idx) => this.revealedBlocks.add(`stat-${idx}`));
    this.currentStudy.evaluation.strengths.forEach((_, idx) => this.revealedBlocks.add(`str-${idx}`));
    this.currentStudy.evaluation.limitations.forEach((_, idx) => this.revealedBlocks.add(`lim-${idx}`));
    this.render(this.currentStudy);
  }

  hideAllBlocks() {
    this.revealedBlocks.clear();
    if (this.currentStudy) {
      this.render(this.currentStudy);
    }
  }

  render(study) {
    this.currentStudy = study;
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (!study) {
      container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <h3 class="text-base font-semibold text-slate-700 mb-1">Select a Case Study</h3>
          <p class="text-xs text-slate-500 max-w-xs">
            Click any pin on the interactive map or choose an entry from the revision list to inspect facts, statistics, and 20-mark evaluation points.
          </p>
        </div>
      `;
      return;
    }

    const isPhysical = study.category === 'Physical';
    const badgeColorClass = isPhysical 
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
      : 'bg-indigo-50 text-indigo-700 border-indigo-200';

    const headerBorderClass = isPhysical ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-indigo-500';

    const ratings = StorageService.getConfidenceRatings();
    const curRating = ratings[study.id] || 'needs-work';
    const notesMap = StorageService.getStudentNotes();
    const studentNote = notesMap[study.id] || '';

    // Helper for generating blur block HTML
    const renderBlurItem = (text, key, icon = '•', badge = null) => {
      const isBlurred = this.examBlurActive && !this.revealedBlocks.has(key);
      return `
        <li class="relative group p-2.5 rounded-lg border transition-all duration-200 ${
          isBlurred 
            ? 'bg-amber-50/60 border-amber-200 cursor-pointer hover:bg-amber-100/70 select-none' 
            : 'bg-white border-slate-200/80 hover:border-slate-300'
        }" onclick="window.edexcelApp.detailDrawer.toggleBlockReveal('${key}')">
          <div class="flex items-start gap-2.5">
            <span class="text-xs font-bold text-slate-400 mt-0.5 select-none">${icon}</span>
            <div class="flex-1 ${isBlurred ? 'filter blur-[5px] opacity-40 select-none' : ''}">
              ${badge ? `<span class="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded mr-1.5 ${badge}">${badge}</span>` : ''}
              <span class="text-xs text-slate-800 font-medium leading-relaxed">${text}</span>
            </div>
          </div>
          ${
            isBlurred ? `
            <div class="absolute inset-0 flex items-center justify-center bg-amber-500/10 backdrop-blur-[2px] rounded-lg">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                Click to Reveal Stat
              </span>
            </div>
            ` : ''
          }
        </li>
      `;
    };

    const renderAo2Item = (text, key, type = 'strength') => {
      const isBlurred = this.examBlurActive && !this.revealedBlocks.has(key);
      const isStr = type === 'strength';
      const borderCol = isStr ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/40';
      const tagCol = isStr ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800';
      const tagText = isStr ? 'Strength / Pro' : 'Limitation / Con';

      return `
        <div class="relative group p-3 rounded-xl border transition-all duration-200 ${borderCol} ${
          isBlurred ? 'cursor-pointer hover:opacity-90 select-none' : ''
        }" onclick="window.edexcelApp.detailDrawer.toggleBlockReveal('${key}')">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${tagCol}">${tagText}</span>
            <span class="text-[10px] text-slate-400 font-medium">AO2 Criterion</span>
          </div>
          <div class="${isBlurred ? 'filter blur-[6px] opacity-30 select-none' : ''}">
            <p class="text-xs text-slate-800 leading-relaxed font-medium">${text}</p>
          </div>
          ${
            isBlurred ? `
            <div class="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-xl">
              <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
                isStr ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              } shadow-sm group-hover:scale-105 transition-transform">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                Click to Test AO2 Recall
              </span>
            </div>
            ` : ''
          }
        </div>
      `;
    };

    container.innerHTML = `
      <div class="h-full flex flex-col bg-white">
        <!-- Top Sticky Header for Case Study (Takes up whole tab) -->
        <div class="p-3.5 sm:p-4 border-b border-slate-200 bg-white sticky top-0 z-20 shadow-xs ${headerBorderClass}">
          <div class="flex items-center justify-between gap-2.5 mb-2.5">
            
            <!-- Top Left: Back to Main Menu Button & Badges -->
            <div class="flex flex-wrap items-center gap-2">
              <button id="detail-back-list-btn" 
                      title="Return to Main Menu (All Case Studies)" 
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-300 hover:border-indigo-300 shadow-xs transition-all cursor-pointer group">
                <svg class="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                <span>Main Menu</span>
              </button>

              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${badgeColorClass}">
                <span class="w-1.5 h-1.5 rounded-full ${isPhysical ? 'bg-emerald-500' : 'bg-indigo-500'}"></span>
                ${study.category} Geography
              </span>
              <span class="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                ${study.topic}
              </span>

              <!-- Recall Confidence Selector in Header -->
              <div class="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200" id="detail-conf-picker">
                <button class="detail-conf-btn px-1.5 py-0.5 rounded text-[10px] font-bold transition ${curRating === 'needs-work' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'}" data-rating="needs-work" title="Needs Work">🔴</button>
                <button class="detail-conf-btn px-1.5 py-0.5 rounded text-[10px] font-bold transition ${curRating === 'reviewing' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'}" data-rating="reviewing" title="Reviewing">🟡</button>
                <button class="detail-conf-btn px-1.5 py-0.5 rounded text-[10px] font-bold transition ${curRating === 'mastered' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'}" data-rating="mastered" title="Mastered">🟢</button>
              </div>
            </div>

            <!-- Top Right: Actions & Side Tab Controls -->
            <div class="flex items-center gap-1.5 shrink-0">
              <button id="detail-exam-practice-btn" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center gap-1 cursor-pointer" title="Practice 12 & 20-Mark Exam Questions">
                <span>🎲</span>
                <span class="hidden sm:inline">Practice Essay</span>
              </button>

              <button id="detail-fly-btn" title="Center map here" class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </button>
              <button id="detail-edit-btn" title="Edit Case Study" class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button id="detail-delete-btn" title="Delete Case Study" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>

              <div class="h-4 w-[1px] bg-slate-200 mx-1"></div>

              <button id="detail-expand-btn" title="Toggle Wide Reading View" class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
              </button>
              <button id="detail-minimize-btn" title="Minimize Side Tab (Full-Screen Map)" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <h2 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug mb-1">
            ${study.title}
          </h2>
          <div class="flex items-center gap-3 text-xs text-slate-500">
            <span class="flex items-center gap-1 font-medium text-slate-600">
              📍 ${study.country}
            </span>
            <span class="text-slate-300">•</span>
            <span class="font-mono text-[11px] text-slate-500">
              ${study.lat.toFixed(4)}, ${study.lng.toFixed(4)}
            </span>
          </div>

          <!-- Active Recall Banner if Exam Blur is active -->
          ${
            this.examBlurActive ? `
            <div class="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-300 flex items-center justify-between text-xs text-amber-900 animate-fadeIn">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span class="font-semibold">Active Recall Active:</span>
                <span>Stats & Evaluation points blurred.</span>
              </div>
              <div class="flex items-center gap-1.5 font-bold">
                <button id="blur-reveal-all" class="px-2 py-0.5 rounded bg-amber-600 text-white text-[11px] hover:bg-amber-700 transition">Reveal All</button>
                <button id="blur-hide-all" class="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] hover:bg-slate-300 transition">Hide All</button>
              </div>
            </div>
            ` : ''
          }
        </div>

        <!-- Scrollable Content Area -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">

          <!-- Synoptic Links (Paper 3 / Cross-Theme) -->
          ${
            study.synopticLinks && study.synopticLinks.length > 0 ? `
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                Synoptic Links (Paper 3 & Cross-Topic Integrations)
              </h3>
              <div class="flex flex-wrap gap-2">
                ${study.synopticLinks.map(link => `
                  <div class="px-2.5 py-1.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs font-medium leading-tight flex items-start gap-1.5">
                    <span class="text-indigo-400 font-bold">🔗</span>
                    <span>${link}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''
          }

          <!-- Executive Summary -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm leading-relaxed">
            <span class="font-bold text-slate-900 block mb-1">Executive Specification Overview:</span>
            ${study.summary}
          </div>

          <!-- Hard Place-Specific Statistics (AO1 Knowledge) -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                Place-Specific Statistics & Hard Data (AO1)
              </h3>
              <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                ${study.stats.length} Key Facts
              </span>
            </div>
            <p class="text-[11px] text-slate-500 mb-2.5">
              Specific dates, casualty figures, financial costs, and measurements required to score Level 4 (AO1) in Edexcel essays.
            </p>
            <ul class="space-y-2">
              ${study.stats.map((stat, idx) => renderBlurItem(stat, `stat-${idx}`, `${idx + 1}.`)).join('')}
            </ul>
          </div>

          <!-- Causes & Geographical Processes -->
          ${
            study.causes ? `
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                Causes & Physical / Human Processes
              </h3>
              <div class="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed">
                ${study.causes}
              </div>
            </div>
            ` : ''
          }

          <!-- Impacts & Consequences (Social, Economic, Environmental) -->
          ${
            study.impacts ? `
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                Impacts & Categorised Consequences
              </h3>
              ${
                typeof study.impacts === 'object' ? `
                <div class="grid grid-cols-1 gap-2.5">
                  ${study.impacts.social ? `
                    <div class="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div class="flex items-center gap-1.5 text-xs font-bold text-blue-700 mb-1">
                        <span>👥 Social & Demographic Impacts:</span>
                      </div>
                      <p class="text-xs text-slate-700 leading-relaxed">${study.impacts.social}</p>
                    </div>
                  ` : ''}
                  ${study.impacts.economic ? `
                    <div class="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div class="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-1">
                        <span>💰 Economic & Financial Impacts:</span>
                      </div>
                      <p class="text-xs text-slate-700 leading-relaxed">${study.impacts.economic}</p>
                    </div>
                  ` : ''}
                  ${study.impacts.environmental ? `
                    <div class="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div class="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
                        <span>🌿 Environmental & Ecological Impacts:</span>
                      </div>
                      <p class="text-xs text-slate-700 leading-relaxed">${study.impacts.environmental}</p>
                    </div>
                  ` : ''}
                </div>
                ` : `
                <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  ${study.impacts}
                </div>
                `
              }
            </div>
            ` : ''
          }

          <!-- Management, Governance & Mitigation -->
          ${
            study.management ? `
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                Management, Mitigation & Governance
              </h3>
              <div class="p-3.5 rounded-xl bg-cyan-50/30 border border-cyan-200/70 text-xs sm:text-sm text-slate-800 leading-relaxed">
                ${study.management}
              </div>
            </div>
            ` : ''
          }

          <!-- AO2 Evaluation / 12 & 20 Mark Essay Points -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
                AO2 Evaluation Points (12 & 20-Mark Essays)
              </h3>
              <span class="text-[11px] font-semibold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full">
                Essay Balanced Analysis
              </span>
            </div>
            <p class="text-[11px] text-slate-500 mb-3">
              Explicit counter-arguments, sustainability criteria, and trade-offs required to attain the top grade boundary (AO2).
            </p>

            <div class="grid grid-cols-1 gap-3">
              <div>
                <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <span>✅ Successes, Strengths & Mitigations:</span>
                </h4>
                <div class="space-y-2">
                  ${study.evaluation.strengths.map((str, idx) => renderAo2Item(str, `str-${idx}`, 'strength')).join('')}
                </div>
              </div>

              <div class="pt-2">
                <h4 class="text-xs font-bold text-rose-800 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <span>❌ Limitations, Failures & Externalities:</span>
                </h4>
                <div class="space-y-2">
                  ${study.evaluation.limitations.map((lim, idx) => renderAo2Item(lim, `lim-${idx}`, 'limitation')).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Examiner Tips & AO2 Judgment Guidance -->
          ${
            study.examTips ? `
            <div class="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-base">💡</span>
                <span class="text-xs font-bold text-indigo-950 uppercase tracking-wide">Edexcel Examiner Advice & Synoptic Judgment</span>
              </div>
              <p class="text-xs text-indigo-900 leading-relaxed">
                ${study.examTips}
              </p>
            </div>
            ` : ''
          }

          <!-- Student Personal Scratchpad & Essay Plan -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>📝</span> My Revision Notes & 20-Mark Essay Plan (Auto-saved)
              </span>
              <span id="detail-note-saved-tag" class="text-[11px] font-semibold text-emerald-600 hidden">✅ Saved</span>
            </div>
            <textarea id="detail-student-notes-input" rows="3" placeholder="Draft your personal 20-mark evaluation plan, intro hooks, teacher notes, or mnemonics here..." class="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500 leading-relaxed">${studentNote}</textarea>
          </div>

          <!-- Bottom Action Buttons: Back to Menu, Practice, Edit, and Delete -->
          <div class="pt-6 pb-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button id="detail-bottom-back-btn" class="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              <span>Main Menu</span>
            </button>
            <div class="flex items-center gap-2">
              <button id="detail-bottom-practice-btn" class="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer">
                <span>🎲</span>
                <span>Practice Essay Question</span>
              </button>
              <button id="detail-bottom-edit-btn" class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                <span>Edit Case Study</span>
              </button>
              <button id="detail-bottom-delete-btn" class="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                <span>Delete</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    // Hook events
    const flyBtn = container.querySelector('#detail-fly-btn');
    if (flyBtn) flyBtn.onclick = () => this.onFlyTo(study.lat, study.lng);

    const editBtn = container.querySelector('#detail-edit-btn');
    if (editBtn) editBtn.onclick = () => this.onEdit(study);

    const bottomEditBtn = container.querySelector('#detail-bottom-edit-btn');
    if (bottomEditBtn) bottomEditBtn.onclick = () => this.onEdit(study);

    const practiceBtn = container.querySelector('#detail-exam-practice-btn');
    if (practiceBtn) practiceBtn.onclick = () => this.onOpenExamPractice(study);

    const bottomPracticeBtn = container.querySelector('#detail-bottom-practice-btn');
    if (bottomPracticeBtn) bottomPracticeBtn.onclick = () => this.onOpenExamPractice(study);

    const deleteBtn = container.querySelector('#detail-delete-btn');
    if (deleteBtn) deleteBtn.onclick = () => this.onDelete(study.id);

    const bottomDeleteBtn = container.querySelector('#detail-bottom-delete-btn');
    if (bottomDeleteBtn) bottomDeleteBtn.onclick = () => this.onDelete(study.id);

    const backBtn = container.querySelector('#detail-back-list-btn');
    if (backBtn) backBtn.onclick = () => this.onBackToMenu();

    const bottomBackBtn = container.querySelector('#detail-bottom-back-btn');
    if (bottomBackBtn) bottomBackBtn.onclick = () => this.onBackToMenu();

    const expandBtn = container.querySelector('#detail-expand-btn');
    if (expandBtn) expandBtn.onclick = () => this.onToggleExpand();

    const minBtn = container.querySelector('#detail-minimize-btn');
    if (minBtn) minBtn.onclick = () => this.onMinimize();

    const closeBtn = container.querySelector('#detail-close-btn');
    if (closeBtn) closeBtn.onclick = () => this.onClose();

    const revealAllBtn = container.querySelector('#blur-reveal-all');
    if (revealAllBtn) revealAllBtn.onclick = () => this.revealAllBlocks();

    const hideAllBtn = container.querySelector('#blur-hide-all');
    if (hideAllBtn) hideAllBtn.onclick = () => this.hideAllBlocks();

    // Confidence buttons in header
    container.querySelectorAll('.detail-conf-btn').forEach(btn => {
      btn.onclick = () => {
        const rating = btn.dataset.rating;
        StorageService.setConfidenceRating(study.id, rating);
        this.onConfidenceChanged(study.id, rating);
        this.render(study);
      };
    });

    // Notes scratchpad auto-save
    const notesInput = container.querySelector('#detail-student-notes-input');
    const noteSavedTag = container.querySelector('#detail-note-saved-tag');
    if (notesInput) {
      notesInput.oninput = (e) => {
        const val = e.target.value;
        StorageService.setStudentNote(study.id, val);
        if (noteSavedTag) {
          noteSavedTag.classList.remove('hidden');
          setTimeout(() => noteSavedTag.classList.add('hidden'), 2000);
        }
      };
    }
  }
}
