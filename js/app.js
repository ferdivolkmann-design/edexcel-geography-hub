/**
 * Application Orchestrator - Edexcel A-Level Geography Case Study Hub
 */
import { EDEXCEL_TOPICS } from './data/initialData.js';
import { StorageService } from './services/storage.js';
import { MapComponent } from './components/map.js';
import { CardList } from './components/cardList.js';
import { DetailDrawer } from './components/detailDrawer.js';
import { StudyModal } from './components/modal.js';
import { ExamModal } from './components/examModal.js';
import { FlashcardsModal } from './components/flashcards.js';
import { CheatSheetModal } from './components/cheatSheet.js';
import { SynopticModal } from './components/synopticModal.js';

class EdexcelApp {
  constructor() {
    this.caseStudies = [];
    this.selectedStudyId = null;
    this.examBlurActive = false;
    this.currentTheme = 'esriStreet'; // Default to Esri World Street Map (100% Latin Alphabet & Guaranteed Delivery)
    this.sidebarState = 'normal'; // 'normal' | 'expanded' | 'minimized'

    this.map = null;
    this.cardList = null;
    this.detailDrawer = null;
    this.modal = null;
    this.examModal = null;
    this.flashcardsModal = null;
    this.cheatSheetModal = null;
    this.synopticModal = null;
  }

  init() {
    // 1. Load data from localStorage
    this.caseStudies = StorageService.getCaseStudies();
    if (this.caseStudies.length > 0) {
      this.selectedStudyId = this.caseStudies[0].id;
    }

    // 2. Initialize UI Components
    this.initMap();
    this.initCardList();
    this.initDetailDrawer();
    this.initModal();
    this.initExamModals();

    // 3. Populate Topic Filter Dropdown
    this.populateTopicFilter();

    // 4. Bind Global Event Handlers
    this.bindHeaderActions();
    this.syncFilterTabs();

    // 5. Initial Render
    this.updateAllViews();

    // Start on Main Menu where all case studies and search options are
    this.showMainMenu();

    console.log('Edexcel Geography Hub initialized with', this.caseStudies.length, 'case studies.');
  }

  initMap() {
    this.map = new MapComponent('map-container', {
      theme: this.currentTheme,
      onMarkerSelect: (id) => this.selectCaseStudy(id, false),
      onEditStudy: (study) => this.modal.open(study),
      onDeleteStudy: (id) => this.confirmDelete(id),
      onAddAtLocation: (lat, lng) => this.openAddModalAt(lat, lng),
      onLocationPicked: (lat, lng) => {
        // Picked from map
      }
    });
    this.map.init();
  }

  async openAddModalAt(lat, lng) {
    let country = '';
    try {
      const geo = await GeocodingService.reverse(lat, lng);
      if (geo) {
        country = geo;
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    }

    this.modal.open({
      _isNew: true,
      category: 'Physical',
      topic: EDEXCEL_TOPICS.Physical[0],
      title: '',
      country: country || `${lat}, ${lng}`,
      lat: lat,
      lng: lng,
      synopticLinks: [],
      summary: '',
      stats: [],
      causes: '',
      impacts: { social: '', economic: '', environmental: '' },
      management: '',
      evaluation: { strengths: [], limitations: [] },
      examTips: ''
    });
  }

  initCardList() {
    this.cardList = new CardList('case-study-list-container', {
      onSelect: (id) => this.selectCaseStudy(id, true),
      onFlyTo: (lat, lng) => this.map.flyToCoordinates(lat, lng, 6),
      onDelete: (id) => this.confirmDelete(id),
      onConfidenceChanged: () => {
        this.syncFilterTabs();
      }
    });
  }

  initDetailDrawer() {
    this.detailDrawer = new DetailDrawer('study-detail-container', {
      onBackToMenu: () => {
        this.showMainMenu();
      },
      onClose: () => {
        this.showMainMenu();
      },
      onEdit: (study) => {
        this.modal.open(study);
      },
      onDelete: (id) => {
        this.confirmDelete(id);
      },
      onFlyTo: (lat, lng) => {
        this.map.flyToCoordinates(lat, lng, 7);
      },
      onToggleExpand: () => {
        this.toggleSidebarExpand();
      },
      onMinimize: () => {
        this.setSidebarState('minimized');
      },
      onOpenExamPractice: (study) => {
        this.examModal.open(study);
      },
      onConfidenceChanged: () => {
        this.cardList.render();
        this.syncFilterTabs();
      }
    });
  }

  initExamModals() {
    this.examModal = new ExamModal({
      onSaveNote: (studyId, note) => {
        StorageService.setStudentNote(studyId, note);
        this.showToast('Essay scratchpad plan saved!');
      }
    });

    this.flashcardsModal = new FlashcardsModal({
      onConfidenceChanged: () => {
        this.cardList.render();
        this.syncFilterTabs();
      }
    });

    this.cheatSheetModal = new CheatSheetModal();

    this.synopticModal = new SynopticModal({
      onSelectStudy: (id) => {
        this.synopticModal.close();
        this.selectCaseStudy(id, true);
      }
    });
  }

  initModal() {
    this.modal = new StudyModal({
      onSave: (studyData, isEditing) => {
        if (isEditing) {
          const idx = this.caseStudies.findIndex(s => s.id === studyData.id);
          if (idx !== -1) {
            this.caseStudies[idx] = studyData;
          }
        } else {
          this.caseStudies.unshift(studyData);
          this.selectedStudyId = studyData.id;
        }
        StorageService.saveCaseStudies(this.caseStudies);
        this.updateAllViews();
        this.selectCaseStudy(studyData.id, true);
        this.showToast(isEditing ? 'Case study updated!' : 'New case study added!');
      },
      onDelete: (id) => {
        this.confirmDelete(id);
      },
      onRequestMapPick: (isPicking, callback) => {
        if (isPicking) {
          this.map.enableCoordinatePicker(callback);
        } else {
          this.map.disableCoordinatePicker();
        }
      }
    });
  }

  populateTopicFilter() {
    const topicSelect = document.getElementById('topic-filter');
    if (!topicSelect) return;

    let html = `<option value="All">All Edexcel Topics</option>`;
    html += `<optgroup label="Physical Geography">`;
    EDEXCEL_TOPICS.Physical.forEach(t => {
      html += `<option value="${t}">${t}</option>`;
    });
    html += `</optgroup>`;
    html += `<optgroup label="Human Geography">`;
    EDEXCEL_TOPICS.Human.forEach(t => {
      html += `<option value="${t}">${t}</option>`;
    });
    html += `</optgroup>`;

    topicSelect.innerHTML = html;
  }

  bindHeaderActions() {
    // Active Recall Toggle
    const blurToggleBtn = document.getElementById('toggle-exam-blur');
    if (blurToggleBtn) {
      blurToggleBtn.onclick = () => this.toggleExamBlur();
    }

    // Flashcard Recall Trainer
    const fcBtn = document.getElementById('header-flashcards-btn');
    if (fcBtn) {
      fcBtn.onclick = () => {
        const filtered = this.cardList.getFilteredStudies();
        this.flashcardsModal.open(filtered.length > 0 ? filtered : this.caseStudies);
      };
    }

    // Exam Morning Cheat Sheet
    const csBtn = document.getElementById('header-cheatsheet-btn');
    if (csBtn) {
      csBtn.onclick = () => {
        this.cheatSheetModal.open(this.caseStudies);
      };
    }

    // Paper 3 Synoptic Matrix
    const synopticBtn = document.getElementById('header-synoptic-btn');
    if (synopticBtn) {
      synopticBtn.onclick = () => {
        this.synopticModal.open(this.caseStudies);
      };
    }

    // Add Case Study Button
    const addBtn = document.getElementById('add-study-btn');
    if (addBtn) {
      addBtn.onclick = () => this.modal.open();
    }

    // Direct Map Add Pin Button
    const mapAddBtn = document.getElementById('map-add-pin-btn');
    if (mapAddBtn) {
      mapAddBtn.onclick = () => {
        this.map.toggleAddPinMode();
      };
    }

    // JSON Export
    const exportJsonBtn = document.getElementById('export-json-btn');
    if (exportJsonBtn) {
      exportJsonBtn.onclick = () => {
        StorageService.exportJSON(this.caseStudies);
        this.showToast('JSON export downloaded!');
      };
    }

    // Markdown Export
    const exportMdBtn = document.getElementById('export-md-btn');
    if (exportMdBtn) {
      exportMdBtn.onclick = () => {
        StorageService.exportMarkdown(this.caseStudies);
        this.showToast('Revision Guide Markdown exported!');
      };
    }

    // JSON Import
    const importInput = document.getElementById('import-json-input');
    const importBtn = document.getElementById('import-json-btn');
    if (importBtn && importInput) {
      importBtn.onclick = () => importInput.click();
      importInput.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          const result = StorageService.importJSON(content);
          if (result.success) {
            this.caseStudies = result.data;
            if (this.caseStudies.length > 0) {
              this.selectedStudyId = this.caseStudies[0].id;
            }
            this.updateAllViews();
            this.showToast(`Successfully imported ${result.count} case studies!`);
          } else {
            alert('Failed to import JSON: ' + result.error);
          }
          importInput.value = '';
        };
        reader.readAsText(file);
      };
    }

    // Reset Default Data
    const resetBtn = document.getElementById('reset-defaults-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('Reset to standard Edexcel specification sample case studies? Any unsaved custom entries will be replaced.')) {
          this.caseStudies = StorageService.resetToDefault();
          if (this.caseStudies.length > 0) {
            this.selectedStudyId = this.caseStudies[0].id;
          }
          this.updateAllViews();
          this.showToast('Reset to original Edexcel case studies!');
        }
      };
    }

    // Map Theme Switcher
    const themeSelect = document.getElementById('map-style-select');
    if (themeSelect) {
      themeSelect.onchange = (e) => {
        this.currentTheme = e.target.value;
        this.map.setTheme(this.currentTheme);
      };
    }

    // Search and Filters
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.cardList.setFilters(undefined, undefined, e.target.value);
      };
    }

    const topicFilter = document.getElementById('topic-filter');
    if (topicFilter) {
      topicFilter.onchange = (e) => {
        this.cardList.setFilters(undefined, e.target.value, undefined);
      };
    }

    // Edexcel Paper Tabs (All / Paper 1 / Paper 2 / Paper 3)
    const paperTabs = document.querySelectorAll('.paper-tab-btn');
    paperTabs.forEach(btn => {
      btn.onclick = () => {
        const paper = btn.dataset.paper;
        this.cardList.setFilters(undefined, undefined, undefined, paper, undefined);
        this.syncFilterTabs();
      };
    });

    // Confidence Level Filter
    const confFilter = document.getElementById('confidence-filter');
    if (confFilter) {
      confFilter.onchange = (e) => {
        this.cardList.setFilters(undefined, undefined, undefined, undefined, e.target.value);
      };
    }

    // Category Tabs (All / Physical / Human)
    const tabBtns = document.querySelectorAll('.cat-tab-btn');
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        const cat = btn.dataset.category;
        this.cardList.setFilters(cat, undefined, undefined);
        this.syncFilterTabs();
      };
    });

    // Mobile Navigation Switcher (Map vs Case Studies List)
    const mobMapBtn = document.getElementById('mob-tab-map');
    const mobListBtn = document.getElementById('mob-tab-list');
    if (mobMapBtn && mobListBtn) {
      mobMapBtn.onclick = () => this.toggleMobileView('map');
      mobListBtn.onclick = () => this.toggleMobileView('list');
    }

    // Sidebar Expand & Minimize Controls
    const expandBtn = document.getElementById('sidebar-expand-btn');
    if (expandBtn) {
      expandBtn.onclick = () => this.toggleSidebarExpand();
    }

    const minimizeBtn = document.getElementById('sidebar-minimize-btn');
    if (minimizeBtn) {
      minimizeBtn.onclick = () => this.setSidebarState('minimized');
    }

    const floatingOpenBtn = document.getElementById('floating-open-sidebar-btn');
    if (floatingOpenBtn) {
      floatingOpenBtn.onclick = () => this.setSidebarState('normal');
    }

    const headerSidebarBtn = document.getElementById('header-toggle-sidebar');
    if (headerSidebarBtn) {
      headerSidebarBtn.onclick = () => {
        if (this.sidebarState === 'minimized') {
          this.setSidebarState('normal');
        } else {
          this.setSidebarState('minimized');
        }
      };
    }
  }

  toggleExamBlur() {
    this.examBlurActive = !this.examBlurActive;
    
    // Update button visual state
    const btn = document.getElementById('toggle-exam-blur');
    const statusTag = document.getElementById('exam-blur-tag');
    if (btn) {
      if (this.examBlurActive) {
        btn.classList.add('bg-amber-500', 'text-white', 'border-amber-600', 'shadow-md');
        btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-300');
        if (statusTag) {
          statusTag.textContent = 'ON';
          statusTag.className = 'ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-amber-700 text-white font-black';
        }
        this.showToast('Active Recall Mode ON: Stats & AO2 points blurred!');
      } else {
        btn.classList.remove('bg-amber-500', 'text-white', 'border-amber-600', 'shadow-md');
        btn.classList.add('bg-white', 'text-slate-700', 'border-slate-300');
        if (statusTag) {
          statusTag.textContent = 'OFF';
          statusTag.className = 'ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-700 font-bold';
        }
        this.showToast('Active Recall Mode OFF: All fields revealed.');
      }
    }

    // Propagate to drawer and card list
    this.detailDrawer.setExamBlur(this.examBlurActive);
    this.cardList.setExamBlur(this.examBlurActive);
  }

  syncFilterTabs() {
    const curPaper = this.cardList.selectedPaper || 'All';
    const paperTabs = document.querySelectorAll('.paper-tab-btn');
    paperTabs.forEach(btn => {
      if (btn.dataset.paper === curPaper) {
        btn.className = 'paper-tab-btn px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-600 text-white shadow-xs transition shrink-0 cursor-pointer';
      } else {
        btn.className = 'paper-tab-btn px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-200 transition shrink-0 cursor-pointer';
      }
    });

    const curCat = this.cardList.selectedCategory;
    const tabBtns = document.querySelectorAll('.cat-tab-btn');
    tabBtns.forEach(btn => {
      if (btn.dataset.category === curCat) {
        btn.className = 'cat-tab-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-sm transition';
      } else {
        btn.className = 'cat-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition';
      }
    });

    // Update counts
    const physCount = this.caseStudies.filter(s => s.category === 'Physical').length;
    const humCount = this.caseStudies.filter(s => s.category === 'Human').length;
    const totalCount = this.caseStudies.length;

    const totalEl = document.getElementById('count-total');
    const physEl = document.getElementById('count-phys');
    const humEl = document.getElementById('count-hum');
    const badgeEl = document.getElementById('directory-count-badge');
    if (totalEl) totalEl.textContent = totalCount;
    if (physEl) physEl.textContent = physCount;
    if (humEl) humEl.textContent = humCount;
    if (badgeEl) badgeEl.textContent = `${totalCount}`;
  }

  selectCaseStudy(id, flyTo = true) {
    // If the sidebar is currently minimized, automatically open it back up
    if (this.sidebarState === 'minimized') {
      this.setSidebarState('normal');
    }

    this.selectedStudyId = id;
    const study = this.caseStudies.find(s => s.id === id);
    if (!study) return;

    // Update Card List selection
    this.cardList.setSelected(id);

    // Update Map Marker
    this.map.highlightMarker(id, flyTo);

    // Update Detail Drawer
    this.detailDrawer.render(study);

    // Make the case study take up the WHOLE of the tab!
    this.showCaseStudyView();

    // Mobile: switch to drawer view when a study is selected
    if (window.innerWidth < 1024) {
      this.toggleMobileView('drawer');
    }
  }

  showMainMenu() {
    this.tabMode = 'menu';
    const directoryView = document.getElementById('directory-view');
    const detailPane = document.getElementById('study-detail-pane');
    if (directoryView && detailPane) {
      directoryView.classList.remove('hidden');
      detailPane.classList.add('hidden');
    }
    // Also scroll directory view to top
    const cardListPane = document.getElementById('case-study-list-pane');
    if (cardListPane) {
      cardListPane.scrollTop = 0;
    }
  }

  showCaseStudyView() {
    this.tabMode = 'study';
    const directoryView = document.getElementById('directory-view');
    const detailPane = document.getElementById('study-detail-pane');
    if (directoryView && detailPane) {
      directoryView.classList.add('hidden');
      detailPane.classList.remove('hidden');
    }
    // Scroll study detail to top
    if (detailPane) {
      detailPane.scrollTop = 0;
    }
    const container = document.getElementById('study-detail-container');
    if (container) {
      const scrollable = container.querySelector('.overflow-y-auto');
      if (scrollable) scrollable.scrollTop = 0;
    }
  }

  setSidebarState(state) {
    this.sidebarState = state;
    const rightCol = document.getElementById('right-column');
    const floatingBtn = document.getElementById('floating-open-sidebar-btn');
    const expandText = document.getElementById('sidebar-expand-text');
    const headerLabel = document.getElementById('header-sidebar-label');

    if (!rightCol) return;

    if (state === 'minimized') {
      rightCol.classList.add('sidebar-minimized');
      rightCol.classList.remove('sidebar-expanded');
      if (floatingBtn) floatingBtn.classList.remove('hidden');
      if (headerLabel) headerLabel.textContent = 'Show Tab';
      this.showToast('Case studies tab minimized. Map is full screen!');
    } else if (state === 'expanded') {
      rightCol.classList.add('sidebar-expanded');
      rightCol.classList.remove('sidebar-minimized');
      if (floatingBtn) floatingBtn.classList.add('hidden');
      if (expandText) expandText.textContent = 'Split';
      if (headerLabel) headerLabel.textContent = 'Side Tab';
      this.showToast('Case studies tab expanded to wide reading mode.');
    } else {
      // Normal split
      rightCol.classList.remove('sidebar-minimized', 'sidebar-expanded');
      if (floatingBtn) floatingBtn.classList.add('hidden');
      if (expandText) expandText.textContent = 'Expand';
      if (headerLabel) headerLabel.textContent = 'Side Tab';
    }

    // Invalidate Leaflet map size across animation frames
    setTimeout(() => this.map?.map?.invalidateSize(), 50);
    setTimeout(() => this.map?.map?.invalidateSize(), 150);
    setTimeout(() => this.map?.map?.invalidateSize(), 350);
  }

  toggleSidebarExpand() {
    if (this.sidebarState === 'expanded') {
      this.setSidebarState('normal');
    } else {
      this.setSidebarState('expanded');
    }
  }

  updateAllViews() {
    this.map.renderCaseStudies(this.caseStudies, this.selectedStudyId);
    this.cardList.setData(this.caseStudies, this.selectedStudyId);
    
    const selectedStudy = this.caseStudies.find(s => s.id === this.selectedStudyId) || this.caseStudies[0];
    if (selectedStudy) {
      this.selectedStudyId = selectedStudy.id;
      this.detailDrawer.render(selectedStudy);
    } else {
      this.detailDrawer.render(null);
    }

    this.syncFilterTabs();
  }

  showConfirmDialog({ title, message, confirmText = 'Delete', confirmClass = 'bg-rose-600 hover:bg-rose-700', onConfirm }) {
    const existing = document.getElementById('app-confirm-dialog');
    if (existing) existing.remove();

    const dialogEl = document.createElement('div');
    dialogEl.id = 'app-confirm-dialog';
    dialogEl.className = 'fixed inset-0 z-[100001] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn';
    dialogEl.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">${title}</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">${message}</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button id="confirm-dialog-cancel" class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer">
            Cancel
          </button>
          <button id="confirm-dialog-ok" class="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs transition cursor-pointer shadow-sm ${confirmClass}">
            ${confirmText}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(dialogEl);

    dialogEl.querySelector('#confirm-dialog-cancel').onclick = () => dialogEl.remove();
    dialogEl.querySelector('#confirm-dialog-ok').onclick = () => {
      dialogEl.remove();
      if (typeof onConfirm === 'function') onConfirm();
    };
  }

  confirmDelete(id) {
    const study = this.caseStudies.find(s => s.id === id);
    if (!study) return;

    this.showConfirmDialog({
      title: 'Delete Case Study',
      message: `Are you sure you want to delete "${study.title}"? This will remove all associated facts, statistics, and evaluation points.`,
      confirmText: 'Delete Case Study',
      confirmClass: 'bg-rose-600 hover:bg-rose-700 text-white',
      onConfirm: () => {
        this.caseStudies = this.caseStudies.filter(s => s.id !== id);
        StorageService.saveCaseStudies(this.caseStudies);
        this.selectedStudyId = this.caseStudies[0]?.id || null;
        this.updateAllViews();
        this.showToast(`Deleted "${study.title}"`);
      }
    });
  }

  toggleMobileView(view) {
    const mapPane = document.getElementById('map-column');
    const sidePane = document.getElementById('right-column');
    const mobMapBtn = document.getElementById('mob-tab-map');
    const mobListBtn = document.getElementById('mob-tab-list');

    if (!mapPane || !sidePane) return;

    if (view === 'map') {
      mapPane.classList.remove('hidden');
      sidePane.classList.add('hidden');
      if (mobMapBtn) mobMapBtn.classList.add('bg-indigo-600', 'text-white');
      if (mobMapBtn) mobMapBtn.classList.remove('text-slate-600');
      if (mobListBtn) mobListBtn.classList.remove('bg-indigo-600', 'text-white');
      if (mobListBtn) mobListBtn.classList.add('text-slate-600');
      setTimeout(() => this.map?.map?.invalidateSize(), 150);
    } else if (view === 'list' || view === 'drawer') {
      mapPane.classList.add('hidden');
      sidePane.classList.remove('hidden');
      if (mobListBtn) mobListBtn.classList.add('bg-indigo-600', 'text-white');
      if (mobListBtn) mobListBtn.classList.remove('text-slate-600');
      if (mobMapBtn) mobMapBtn.classList.remove('bg-indigo-600', 'text-white');
      if (mobMapBtn) mobMapBtn.classList.add('text-slate-600');
    }
  }

  showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.className = 'fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl transition-all duration-300 transform translate-y-12 opacity-0 flex items-center gap-2 border border-slate-700';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    toast.classList.remove('translate-y-12', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.add('translate-y-12', 'opacity-0');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3000);
  }
}

// Global hook
window.addEventListener('DOMContentLoaded', () => {
  window.edexcelApp = new EdexcelApp();
  window.edexcelApp.init();
});
