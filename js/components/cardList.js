/**
 * Card List Component - Renders the filterable, searchable list of case study cards
 * with category tabs, topic pills, and synced selection state.
 */

export class CardList {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.onSelect = options.onSelect || (() => {});
    this.onFlyTo = options.onFlyTo || (() => {});
    this.onDelete = options.onDelete || (() => {});
    
    this.searchQuery = '';
    this.selectedCategory = 'All'; // 'All' | 'Physical' | 'Human'
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

  setFilters(category, topic, query) {
    if (category !== undefined) this.selectedCategory = category;
    if (topic !== undefined) this.selectedTopic = topic;
    if (query !== undefined) this.searchQuery = query.toLowerCase().trim();
    this.render();
  }

  getFilteredStudies() {
    return this.caseStudies.filter(study => {
      // Category filter
      if (this.selectedCategory !== 'All' && study.category !== this.selectedCategory) {
        return false;
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

    // Render counts
    const totalCount = this.caseStudies.length;
    const physCount = this.caseStudies.filter(s => s.category === 'Physical').length;
    const humCount = this.caseStudies.filter(s => s.category === 'Human').length;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-400">
          <svg class="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <p class="text-sm font-semibold text-slate-600 mb-1">No matching case studies</p>
          <p class="text-xs text-slate-400 max-w-xs mx-auto">
            Try adjusting your search keywords, clearing your topic filter, or adding a new case study.
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

    container.innerHTML = filtered.map(study => {
      const isSelected = study.id === this.selectedId;
      const isPhysical = study.category === 'Physical';

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

          <!-- Metrics Footer -->
          <div class="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <div class="flex items-center gap-2.5">
              <span class="flex items-center gap-1 font-medium ${this.examBlurActive ? 'text-amber-600' : 'text-slate-600'}">
                📊 ${statsCount} Stats
              </span>
              <span class="flex items-center gap-1 font-medium text-purple-600">
                ⚖️ ${evalTotal} AO2 Points
              </span>
            </div>

            <span class="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Revise &rarr;
            </span>
          </div>
        </div>
      `;
    }).join('');

    // Attach card click handlers
    container.querySelectorAll('[data-card-id]').forEach(el => {
      el.addEventListener('click', (e) => {
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
