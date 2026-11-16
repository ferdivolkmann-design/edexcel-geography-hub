/**
 * Modal Component - Handles adding and editing case studies
 * with integrated coordinate lookup, map coordinate picker, and Edexcel topic binding.
 */
import { EDEXCEL_TOPICS } from '../data/initialData.js';
import { GeocodingService } from '../services/geocoding.js';

export class StudyModal {
  constructor(options = {}) {
    this.onSave = options.onSave || (() => {});
    this.onDelete = options.onDelete || (() => {});
    this.onRequestMapPick = options.onRequestMapPick || (() => {});
    this.editingStudy = null;
    this.isOpen = false;
  }

  open(study = null) {
    this.editingStudy = study;
    this.isOpen = true;
    this.render();
  }

  close() {
    this.isOpen = false;
    const modalEl = document.getElementById('study-modal-container');
    if (modalEl) modalEl.innerHTML = '';
  }

  setPickedCoordinates(lat, lng) {
    const latInput = document.getElementById('input-lat');
    const lngInput = document.getElementById('input-lng');
    if (latInput) latInput.value = lat;
    if (lngInput) lngInput.value = lng;

    const banner = document.getElementById('modal-pick-banner');
    if (banner) {
      banner.classList.remove('hidden');
      banner.innerHTML = `✅ Selected coordinates: <strong>${lat}, ${lng}</strong>`;
      setTimeout(() => banner.classList.add('hidden'), 3500);
    }
  }

  render() {
    const container = document.getElementById('study-modal-container');
    if (!container) return;

    const s = this.editingStudy || {
      category: 'Physical',
      topic: EDEXCEL_TOPICS.Physical[0],
      title: '',
      country: '',
      lat: '',
      lng: '',
      synopticLinks: [],
      summary: '',
      stats: [],
      causes: '',
      impacts: { social: '', economic: '', environmental: '' },
      management: '',
      evaluation: { strengths: [], limitations: [] },
      examTips: ''
    };

    const isEditing = Boolean(this.editingStudy && this.editingStudy.id && !this.editingStudy._isNew);
    const initialCategory = s.category || 'Physical';
    const topicsForCat = EDEXCEL_TOPICS[initialCategory] || [];

    const statsText = Array.isArray(s.stats) ? s.stats.join('\n') : '';
    const synopticText = Array.isArray(s.synopticLinks) ? s.synopticLinks.join('\n') : '';
    const strengthsText = Array.isArray(s.evaluation?.strengths) ? s.evaluation.strengths.join('\n') : '';
    const limitationsText = Array.isArray(s.evaluation?.limitations) ? s.evaluation.limitations.join('\n') : '';

    const impactsObj = typeof s.impacts === 'object' ? s.impacts : { social: s.impacts || '', economic: '', environmental: '' };

    container.innerHTML = `
      <div class="fixed inset-0 z-[99999] overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
          
          <!-- Header -->
          <div class="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h2 class="text-lg font-bold text-slate-900">
                ${isEditing ? 'Edit Case Study' : 'Add New Edexcel Case Study'}
              </h2>
              <p class="text-xs text-slate-500">
                Specification 9GE0 Schema • Fill place-specific data and AO2 essay criteria
              </p>
            </div>
            <button id="modal-close-btn" class="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Notification Banner for Pick Coordinates -->
          <div id="modal-pick-banner" class="hidden px-4 py-2 bg-emerald-50 text-emerald-800 text-xs border-b border-emerald-200 font-medium"></div>

          <!-- Form Body -->
          <form id="study-form" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
            
            <!-- Category & Topic -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-slate-700 mb-1.5">Specification Domain *</label>
                <div class="grid grid-cols-2 gap-2">
                  <label class="flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${
                    initialCategory === 'Physical' ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200'
                  }">
                    <input type="radio" name="category" value="Physical" ${initialCategory === 'Physical' ? 'checked' : ''} class="accent-emerald-600">
                    <span>Physical Geography</span>
                  </label>
                  <label class="flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${
                    initialCategory === 'Human' ? 'bg-indigo-50 border-indigo-400 text-indigo-800 font-bold' : 'bg-slate-50 border-slate-200'
                  }">
                    <input type="radio" name="category" value="Human" ${initialCategory === 'Human' ? 'checked' : ''} class="accent-indigo-600">
                    <span>Human Geography</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1.5">Edexcel Specification Topic *</label>
                <select id="input-topic" class="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium bg-white">
                  ${topicsForCat.map(t => `<option value="${t}" ${s.topic === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Title & Country -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Case Study Title *</label>
                <input type="text" id="input-title" required value="${s.title}" placeholder="e.g. 2011 Tōhoku Megathrust Earthquake" 
                       class="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-medium">
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Country / Geographic Region *</label>
                <input type="text" id="input-country" required value="${s.country}" placeholder="e.g. Japan (Honshu Island, Tohoku Region)" 
                       class="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-medium">
              </div>
            </div>

            <!-- Coordinates & Map Picker -->
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-800 flex items-center gap-1.5">
                  📍 Geographical Coordinates (Lat / Lng) *
                </span>
                <span class="text-[11px] text-slate-500">Auto-search or click on map</span>
              </div>

              <!-- Quick lookup bar -->
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <input type="text" id="geocode-query" placeholder="Type city or location (e.g. Tokyo, Holderness, Canary Wharf)..." 
                         class="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white">
                  <span class="absolute left-2.5 top-2 text-slate-400">🔍</span>
                </div>
                <button type="button" id="geocode-btn" class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition">
                  Lookup
                </button>
                <button type="button" id="pick-on-map-btn" class="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition flex items-center gap-1">
                  <span>🗺️</span>
                  <span>Pick on Map</span>
                </button>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-0.5">Latitude</label>
                  <input type="number" step="any" id="input-lat" required value="${s.lat}" placeholder="e.g. 38.2970" 
                         class="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs bg-white">
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-0.5">Longitude</label>
                  <input type="number" step="any" id="input-lng" required value="${s.lng}" placeholder="e.g. 142.3730" 
                         class="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs bg-white">
                </div>
              </div>
            </div>

            <!-- Executive Summary -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">Executive Summary / Case Context *</label>
              <textarea id="input-summary" rows="2" required placeholder="Brief 2-3 sentence overview framing the core geographical context..."
                        class="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs leading-relaxed">${s.summary}</textarea>
            </div>

            <!-- Place-Specific Statistics (AO1) -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="font-bold text-slate-700">Place-Specific Statistics & Hard Data (AO1) *</label>
                <span class="text-[11px] text-slate-500">1 statistic per line</span>
              </div>
              <textarea id="input-stats" rows="4" required placeholder="• Mw 9.0 megathrust earthquake at 14:46 JST on 11 March 2011&#10;• 15,899 confirmed deaths; 90%+ drowned&#10;• $235-$300 billion USD damage (World Bank)&#10;• 40.5m peak tsunami run-up at Miyako"
                        class="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-mono text-xs leading-relaxed">${statsText}</textarea>
            </div>

            <!-- Causes & Geographical Processes -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">Causes & Physical / Human Processes</label>
              <textarea id="input-causes" rows="2" placeholder="Plate boundary mechanics, geological lithology, economic drivers, or political factors..."
                        class="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs leading-relaxed">${s.causes || ''}</textarea>
            </div>

            <!-- Impacts Breakdown (Social, Economic, Environmental) -->
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span class="font-bold text-slate-800 block">Impacts & Consequences Breakdown</span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-blue-700 mb-0.5">👥 Social Impacts</label>
                  <textarea id="input-impact-social" rows="2" placeholder="Casualties, displacement, health, community trauma..." class="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white">${impactsObj.social || ''}</textarea>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-amber-700 mb-0.5">💰 Economic Impacts</label>
                  <textarea id="input-impact-econ" rows="2" placeholder="Financial loss, business disruption, infrastructure costs..." class="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white">${impactsObj.economic || ''}</textarea>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-emerald-700 mb-0.5">🌿 Environmental Impacts</label>
                  <textarea id="input-impact-env" rows="2" placeholder="Ecosystem destruction, pollution, habitat loss..." class="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white">${impactsObj.environmental || ''}</textarea>
                </div>
              </div>
            </div>

            <!-- Management, Mitigation & Governance -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">Management, Mitigation & Governance</label>
              <textarea id="input-management" rows="2" placeholder="Hard/soft engineering, government schemes, early warnings, zoning, international aid..."
                        class="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs leading-relaxed">${s.management || ''}</textarea>
            </div>

            <!-- AO2 Evaluation Points (Strengths vs. Limitations) -->
            <div class="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-purple-900 flex items-center gap-1.5">
                  ⚖️ AO2 Evaluation Points (12 & 20-Mark Essays) *
                </span>
                <span class="text-[11px] text-purple-700 font-medium">1 point per line</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-emerald-800 mb-1">
                    ✅ Successes & Strengths (Arguments For)
                  </label>
                  <textarea id="input-eval-strengths" rows="4" required placeholder="• Aseismic building design prevented high-rise collapses&#10;• JMA early warning stopped 27 bullet trains safely&#10;• Strict evacuation drills saved 95% of vulnerable residents"
                            class="w-full p-2.5 rounded-lg border border-emerald-300 focus:ring-2 focus:ring-emerald-500 text-xs leading-relaxed bg-white">${strengthsText}</textarea>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-rose-800 mb-1">
                    ❌ Limitations & Failures (Counter-Arguments)
                  </label>
                  <textarea id="input-eval-limitations" rows="4" required placeholder="• Seawalls created false complacency ('Levee effect')&#10;• Defences engineered for 1-in-100 yr rather than 1-in-1000 yr&#10;• Emergency generators in low-lying basements caused Fukushima meltdown"
                            class="w-full p-2.5 rounded-lg border border-rose-300 focus:ring-2 focus:ring-rose-500 text-xs leading-relaxed bg-white">${limitationsText}</textarea>
                </div>
              </div>
            </div>

            <!-- Synoptic Links (Paper 3) -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="font-bold text-slate-700">Synoptic Links (Cross-Topic Themes)</label>
                <span class="text-[11px] text-slate-500">1 link per line</span>
              </div>
              <textarea id="input-synoptic" rows="2" placeholder="Energy security (shutdown of nuclear reactors increased LNG reliance)&#10;Globalisation (microchip supply shortages in automotive TNCs)"
                        class="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs leading-relaxed">${synopticText}</textarea>
            </div>

            <!-- Examiner Advice / Top Tips -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">💡 Examiner Advice / 20-Mark Essay Tips</label>
              <textarea id="input-tips" rows="2" placeholder="Key tips for essay conclusions, contrasting developed vs developing, or applying sustainability criteria..."
                        class="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs leading-relaxed">${s.examTips || ''}</textarea>
            </div>

          </form>

          <!-- Footer Actions -->
          <div class="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              ${isEditing ? `
                <button type="button" id="modal-delete-btn" class="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  <span>Delete Case Study</span>
                </button>
              ` : `
                <span class="text-xs text-slate-500">* Required fields for Edexcel criteria</span>
              `}
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="modal-cancel-btn" class="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer">
                Cancel
              </button>
              <button type="button" id="modal-submit-btn" class="px-5 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md transition flex items-center gap-1.5 cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <span>${isEditing ? 'Update Case Study' : 'Save Case Study'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    // Category change handler to update topics dropdown
    const catRadios = container.querySelectorAll('input[name="category"]');
    const topicSelect = container.querySelector('#input-topic');
    catRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const cat = e.target.value;
        const topics = EDEXCEL_TOPICS[cat] || [];
        topicSelect.innerHTML = topics.map(t => `<option value="${t}">${t}</option>`).join('');
      });
    });

    // Close button
    container.querySelector('#modal-close-btn').onclick = () => this.close();
    container.querySelector('#modal-cancel-btn').onclick = () => this.close();

    // Delete button in edit mode
    const modalDeleteBtn = container.querySelector('#modal-delete-btn');
    if (modalDeleteBtn && this.editingStudy) {
      modalDeleteBtn.onclick = () => {
        const id = this.editingStudy.id;
        this.close();
        this.onDelete(id);
      };
    }

    // Geocoding Search
    const geocodeBtn = container.querySelector('#geocode-btn');
    const geocodeInput = container.querySelector('#geocode-query');
    const handleGeocode = async () => {
      const q = geocodeInput.value.trim();
      if (!q) return;
      geocodeBtn.textContent = 'Searching...';
      const res = await GeocodingService.search(q);
      geocodeBtn.textContent = 'Lookup';
      if (res) {
        document.getElementById('input-lat').value = res.lat;
        document.getElementById('input-lng').value = res.lng;
        if (!document.getElementById('input-country').value) {
          document.getElementById('input-country').value = res.displayName.split(',').slice(-2).join(',').trim();
        }
        const banner = document.getElementById('modal-pick-banner');
        if (banner) {
          banner.classList.remove('hidden');
          banner.innerHTML = `📍 Located: <strong>${res.displayName}</strong> (${res.lat}, ${res.lng})`;
        }
      } else {
        alert('Could not find coordinates for "' + q + '". Please specify coordinates manually or click "Pick on Map".');
      }
    };
    geocodeBtn.onclick = handleGeocode;
    geocodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleGeocode();
      }
    });

    // Pick on Map button
    container.querySelector('#pick-on-map-btn').onclick = () => {
      // Temporarily minimize modal to allow map clicking
      const modalBox = container.querySelector('.fixed');
      if (modalBox) modalBox.classList.add('opacity-10', 'pointer-events-none');
      
      const banner = document.createElement('div');
      banner.id = 'pick-map-floating-bar';
      banner.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[100000] bg-amber-600 text-white px-5 py-2.5 rounded-full shadow-2xl font-bold text-xs flex items-center gap-3 animate-bounce';
      banner.innerHTML = `
        <span>🎯 Click anywhere on the world map to set pin coordinates</span>
        <button id="cancel-pick-btn" class="px-2 py-0.5 rounded bg-black/20 hover:bg-black/30">Done</button>
      `;
      document.body.appendChild(banner);

      banner.querySelector('#cancel-pick-btn').onclick = () => {
        banner.remove();
        if (modalBox) modalBox.classList.remove('opacity-10', 'pointer-events-none');
        this.onRequestMapPick(false);
      };

      this.onRequestMapPick(true, (lat, lng) => {
        this.setPickedCoordinates(lat, lng);
        banner.remove();
        if (modalBox) modalBox.classList.remove('opacity-10', 'pointer-events-none');
        this.onRequestMapPick(false);
      });
    };

    // Form Submission
    container.querySelector('#modal-submit-btn').onclick = () => {
      this.handleSave();
    };
  }

  handleSave() {
    const title = document.getElementById('input-title').value.trim();
    const country = document.getElementById('input-country').value.trim();
    const lat = parseFloat(document.getElementById('input-lat').value);
    const lng = parseFloat(document.getElementById('input-lng').value);
    const category = document.querySelector('input[name="category"]:checked')?.value || 'Physical';
    const topic = document.getElementById('input-topic').value;
    const summary = document.getElementById('input-summary').value.trim();
    const causes = document.getElementById('input-causes').value.trim();
    const management = document.getElementById('input-management').value.trim();
    const examTips = document.getElementById('input-tips').value.trim();

    const statsRaw = document.getElementById('input-stats').value.trim();
    const stats = statsRaw.split('\n').map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

    const synopticRaw = document.getElementById('input-synoptic').value.trim();
    const synopticLinks = synopticRaw.split('\n').map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

    const strRaw = document.getElementById('input-eval-strengths').value.trim();
    const strengths = strRaw.split('\n').map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

    const limRaw = document.getElementById('input-eval-limitations').value.trim();
    const limitations = limRaw.split('\n').map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

    const social = document.getElementById('input-impact-social').value.trim();
    const economic = document.getElementById('input-impact-econ').value.trim();
    const environmental = document.getElementById('input-impact-env').value.trim();

    // Validation
    if (!title) {
      alert('Please enter a case study title.');
      return;
    }
    if (!country) {
      alert('Please enter a country or region.');
      return;
    }
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please specify valid latitude and longitude coordinates.');
      return;
    }
    if (stats.length === 0) {
      alert('Please include at least one place-specific statistic (AO1).');
      return;
    }
    if (strengths.length === 0 || limitations.length === 0) {
      alert('Please provide at least one Strength and one Limitation for AO2 evaluation.');
      return;
    }

    const isEditing = Boolean(this.editingStudy && this.editingStudy.id && !this.editingStudy._isNew);

    const studyData = {
      id: isEditing ? this.editingStudy.id : `cs-${Date.now()}`,
      title,
      country,
      lat,
      lng,
      category,
      topic,
      summary,
      stats,
      causes,
      impacts: { social, economic, environmental },
      management,
      evaluation: {
        strengths,
        limitations
      },
      synopticLinks,
      examTips
    };

    this.onSave(studyData, isEditing);
    this.close();
  }
}
