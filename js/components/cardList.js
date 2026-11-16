/**
 * Card List Component - Renders the filterable, searchable list of case study cards
 * with Paper tabs, Confidence filters, mastery tracker, and synced selection state.
 */
import { EDEXCEL_PAPERS } from '../data/initialData.js';
import { StorageService } from '../services/storage.js';

export class CardList {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.onSelect = options.onSelect || (() => {});
    this.onFlyTo = options.onFlyTo || (() => {});
    this.onDelete = options.onDelete || (() => {});
    this.onConfidenceChanged = options.onConfidenceChanged || (() => {});
    
    this.searchQuery = '';
    this.selectedCategory = 'All'; // 'All' | 'Physical' | 'Human'
    this.selectedPaper = 'All'; // 'All' | 'Paper 1' | 'Paper 2' | 'Paper 3'
    this.selectedConfidence = 'All'; // 'All' | 'needs-work' | 'reviewing' | 'mastered'
    this.selectedTopic = 'All';
    this.selectedId = null;
    this.caseStudies = [];
    this.examBlurActive = false;
  }

  setData(caseStudies, selectedId = null) {
    this.caseStudies = caseStudies;
    this.selectedId = selectedId;
    this.render();
  }

  setSelected(id) {
    this.selectedId = id;
    this.render();
    
    // Auto-scroll card into view if exists
    const cardEl = document.querySelector(`[data-card-id="${id}"]`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  setExamBlur(isActive) {
    this.examBlurActive = isActive;
    this.render();
  }

  setFilters(category, topic, query, paper, confidence) {
    if (category !== undefined) this.selectedCategory = category;
    if (topic !== undefined) this.selectedTopic = topic;
    if (query !== undefined) this.searchQuery = query.toLowerCase().trim();
    if (paper !== undefined) this.selectedPaper = paper;
    if (confidence !== undefined) this.selectedConfidence = confidence;
    this.render();
  }

  getFilteredStudies() {
    return this.caseStudies.filter(study => {
      // Category filter
      if (this.selectedCategory !== 'All' && study.category !== this.selectedCategory) {
        return false;
      }

      // Paper filter (Paper 1 / Paper 2 / Paper 3)
      if (this.selectedPaper && this.selectedPaper !== 'All') {
        if (this.selectedPaper === 'Paper 1' && !EDEXCEL_PAPERS['Paper 1'].includes(study.topic)) {
          return false;
        }
        if (this.selectedPaper === 'Paper 2' && !EDEXCEL_PAPERS['Paper 2'].includes(study.topic)) {
          return false;
        }
        if (this.selectedPaper === 'Paper 3' && (!study.synopticLinks || study.synopticLinks.length === 0)) {
          return false;
        }
      }

      // Confidence filter
      if (this.selectedConfidence && this.selectedConfidence !== 'All') {
        const ratings = StorageService.getConfidenceRatings();
        const curRating = ratings[study.id] || 'needs-work';
        if (curRating !== this.selectedConfidence) {
          return false;
        }
      }

      // Topic filter
      if (this.selectedTopic !== 'All' && study.topic !== this.selectedTopic) {
        return false;
      }

      // Search query
      if (this.searchQuery) {
        const textToMatch = [
          study.title,
          study.country,
          study.topic,
          study.summary,
          ...(study.synopticLinks || []),
          ...(study.stats || []),
          study.causes || '',
          study.management || '',
          ...(study.evaluation?.strengths || []),
          ...(study.evaluation?.limitations || [])
        ].join(' ').toLowerCase();

        if (!textToMatch.includes(this.searchQuery)) {
          return false;
        }
      }

      return true;
    });
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const filtered = this.getFilteredStudies();
    const ratings = StorageService.getConfidenceRatings();

    // Render mastery counts
    const totalCount = this.caseStudies.length;
    let masteredCount = 0;
    let reviewingCount = 0;
    let needsWorkCount = 0;

    this.caseStudies.forEach(s => {
      const r = ratings[s.id] || 'needs-work';
      if (r === 'mastered') masteredCount++;
      else if (r === 'reviewing') reviewingCount++;
      else needsWorkCount++;
    });

    const masteredPct = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

    const masteryBannerHtml = `
      <div class="p-3 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm flex flex-col gap-2 mb-3">
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5 font-bold">
            <span>🎯 Exam Mastery:</span>
            <span class="text-emerald-400 font-extrabold">${masteredCount}/${totalCount} Mastered (${masteredPct}%)</span>
          </div>
          <div class="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
            <span title="Mastered" class="flex items-center gap-0.5">🟢 ${masteredCount}</span>
            <span title="Reviewing" class="flex items-center gap-0.5">🟡 ${reviewingCount}</span>
            <span title="Needs Work" class="flex items-center gap-0.5">🔴 ${needsWorkCount}</span>
          </div>
        </div>
        <div class="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden flex">
          <div class="bg-emerald-500 h-full transition-all duration-300" style="width: ${totalCount ? (masteredCount/totalCount)*100 : 0}%"></div>
          <div class="bg-amber-400 h-full transition-all duration-300" style="width: ${totalCount ? (reviewingCount/totalCount)*100 : 0}%"></div>
          <div class="bg-rose-500 h-full transition-all duration-300" style="width: ${totalCount ? (needsWorkCount/totalCount)*100 : 0}%"></div>
        </div>
      </div>
    `;

    if (filtered.length === 0) {
      container.innerHTML = `
        ${masteryBannerHtml}
        <div class="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          <svg class="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <p class="text-sm font-semibold text-slate-600 mb-1">No matching case studies</p>
          <p class="text-xs text-slate-400 max-w-xs mx-auto">
            Try adjusting your search keywords, clearing your topic filter, or resetting paper/confidence filters.
          </p>
          <button id="clear-filters-btn" class="mt-4 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition">
            Reset All Filters
          </button>
        </div>
      `;

      const resetBtn = container.querySelector('#clear-filters-btn');
      if (resetBtn) {
        resetBtn.onclick = () => {
          this.selectedCategory = 'All';
          this.selectedPaper = 'All';
          this.selectedConfidence = 'All';
          this.selectedTopic = 'All';
          this.searchQuery = '';
          const searchInput = document.getElementById('search-input');
          const topicSelect = document.getElementById('topic-filter');
          if (searchInput) searchInput.value = '';
          if (topicSelect) topicSelect.value = 'All';
          window.edexcelApp.syncFilterTabs();
          this.render();
        };
      }
      return;
    }

    const cardsHtml = filtered.map(study => {
      const isSelected = study.id === this.selectedId;
      const isPhysical = study.category === 'Physical';
      const curRating = ratings[study.id] || 'needs-work';

      const borderClass = isSelected 
        ? (isPhysical ? 'border-emerald-500 ring-2 ring-emerald-400/40 bg-emerald-50/20' : 'border-indigo-500 ring-2 ring-indigo-400/40 bg-indigo-50/20')
        : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-md';

      const badgeClass = isPhysical
        ? 'bg-emerald-100/80 text-emerald-800'
        : 'bg-indigo-100/80 text-indigo-800';

      const statsCount = study.stats?.length || 0;
      const evalTotal = (study.evaluation?.strengths?.length || 0) + (study.evaluation?.limitations?.length || 0);

      return `
        <div data-card-id="${study.id}" class="group relative rounded-xl border p-4 cursor-pointer transition-all duration-200 ${borderClass}">
          
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${badgeClass}">
                <span class="w-1.5 h-1.5 rounded-full ${isPhysical ? 'bg-emerald-500' : 'bg-indigo-500'}"></span>
                ${study.category}
              </span>
              <span class="text-[11px] font-medium text-slate-500 truncate max-w-[170px]" title="${study.topic}">
                ${study.topic}
              </span>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <button class="pin-fly-btn p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition" 
                      title="Center on map" data-lat="${study.lat}" data-lng="${study.lng}">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </button>
              <button class="card-delete-btn p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition" 
                      title="Delete case study" data-id="${study.id}">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>

          <h3 class="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition leading-snug mb-1">
            ${study.title}
          </h3>

          <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <span>📍</span>
            <span class="truncate">${study.country}</span>
          </div>

          <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            ${study.summary}
          </p>

          <!-- Metrics and Confidence Traffic Light Footer -->
          <div class="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2.5 border-t border-slate-100 gap-2">
            <div class="flex items-center gap-2">
              <span class="flex items-center gap-1 font-medium ${this.examBlurActive ? 'text-amber-600' : 'text-slate-600'}">
                📊 ${statsCount}
              </span>
              <span class="flex items-center gap-1 font-medium text-purple-600">
                ⚖️ ${evalTotal} AO2
              </span>
            </div>

            <!-- Recall Confidence Selector -->
            <div class="confidence-picker flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200" data-study-id="${study.id}">
              <button class="conf-btn px-1.5 py-0.5 rounded text-[10px] font-bold transition ${curRating === 'needs-work' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'}" data-rating="needs-work" title="Needs Work">🔴</button>
              <button class="conf-btn px-1.5 py-0.5 rounded text-[10px] font-bold transition ${curRating === 'reviewing' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'}" data-rating="reviewing" title="Reviewing">🟡</button>
              <button class="conf-btn px-1.5 py-0.5 rounded text-[10px] font-bold transition ${curRating === 'mastered' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'}" data-rating="mastered" title="Mastered">🟢</button>
            </div>

            <span class="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Revise &rarr;
            </span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `${masteryBannerHtml}<div class="space-y-3">${cardsHtml}</div>`;

    // Attach card click handlers
    container.querySelectorAll('[data-card-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        // If clicking confidence button
        const confBtn = e.target.closest('.conf-btn');
        if (confBtn) {
          e.stopPropagation();
          const rating = confBtn.dataset.rating;
          const studyId = confBtn.closest('.confidence-picker')?.dataset.studyId;
          if (studyId && rating) {
            StorageService.setConfidenceRating(studyId, rating);
            this.onConfidenceChanged(studyId, rating);
            this.render();
          }
          return;
        }

        // If clicking delete button
        if (e.target.closest('.card-delete-btn')) {
          e.stopPropagation();
          const btn = e.target.closest('.card-delete-btn');
          const id = btn.dataset.id;
          this.onDelete(id);
          return;
        }

        // If clicking the pin button specifically, just fly to it
        if (e.target.closest('.pin-fly-btn')) {
          e.stopPropagation();
          const btn = e.target.closest('.pin-fly-btn');
          const lat = parseFloat(btn.dataset.lat);
          const lng = parseFloat(btn.dataset.lng);
          this.onFlyTo(lat, lng);
          return;
        }

        const id = el.dataset.cardId;
        this.onSelect(id);
      });
    });
  }
}
