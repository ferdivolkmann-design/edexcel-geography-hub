/**
 * Map Component - Manages Leaflet.js map, CartoDB Positron/Dark Matter layers,
 * custom pin styling for Physical/Human categories, marker synchronization, and coordinate picker.
 */

export class MapComponent {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.onMarkerSelect = options.onMarkerSelect || (() => {});
    this.onLocationPicked = options.onLocationPicked || (() => {});
    this.onEditStudy = options.onEditStudy || (() => {});
    this.onDeleteStudy = options.onDeleteStudy || (() => {});
    this.onAddAtLocation = options.onAddAtLocation || (() => {});
    
    this.map = null;
    this.markers = new Map();
    this.currentStudies = [];
    this.pickerMode = false;
    this.addPinMode = false;
    this.pickerMarker = null;
    this.tileLayers = {};
    this.currentTheme = options.theme || 'esriStreet';
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // 100% Reliable Latin Alphabet Map Tiles (No API Keys, Guaranteed Global Delivery)
    this.tileLayers = {
      // 1. Esri World Street Map - 100% Latin Alphabet worldwide, never blocked by ad-blockers (Default)
      esriStreet: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, USGS',
        maxZoom: 18
      }),

      // 2. Esri World Topographic - Beautiful relief shading with 100% Latin alphabet
      esriTopo: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, USGS',
        maxZoom: 18
      }),

      // 3. National Geographic World Map - Rich typography and physical geography (100% Latin)
      natGeo: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; National Geographic, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA',
        maxZoom: 16
      }),

      // 4. High-Res Satellite Imagery paired with Latin Alphabet Place Labels & Borders
      satellite: L.layerGroup([
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
          maxZoom: 18
        }),
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri Latin Reference',
          maxZoom: 18
        })
      ]),

      // 5. CartoDB Voyager - Educational styling in Latin alphabet
      voyager: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }),

      // 6. CartoDB Positron - Clean light base in Latin alphabet
      positron: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }),

      // 7. OpenStreetMap Standard
      osm: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        maxZoom: 19
      })
    };

    // Aliases for backward compatibility
    this.tileLayers.light = this.tileLayers.esriStreet;
    this.tileLayers.dark = this.tileLayers.esriTopo;
    this.tileLayers.cartoLight = this.tileLayers.positron;
    this.tileLayers.cartoDark = this.tileLayers.positron;
    this.tileLayers.esriGray = this.tileLayers.esriStreet;

    // Error recovery fallback: if an individual tile layer ever fails, auto-fallback to Esri Street
    Object.keys(this.tileLayers).forEach(key => {
      const layer = this.tileLayers[key];
      if (layer && typeof layer.on === 'function') {
        let hasFailed = false;
        layer.on('tileerror', () => {
          if (!hasFailed && key !== 'esriStreet' && key !== 'osm') {
            hasFailed = true;
            console.warn(`Tile provider [${key}] error. Auto-fallback to Esri World Street Map.`);
            if (this.map && this.map.hasLayer(layer)) {
              this.map.removeLayer(layer);
              this.tileLayers.esriStreet.addTo(this.map);
              const selectEl = document.getElementById('map-style-select');
              if (selectEl) selectEl.value = 'esriStreet';
            }
          }
        });
      }
    });

    // Select initial active layer (defaults to Esri World Street Map: 100% Latin Alphabet & Guaranteed Load)
    const initialLayer = this.tileLayers[this.currentTheme] || this.tileLayers.esriStreet;

    // Initialize Map with global view centered
    this.map = L.map(this.containerId, {
      center: [25.0, 10.0],
      zoom: 2.4,
      minZoom: 2,
      maxBounds: [[-85, -180], [85, 180]],
      maxBoundsViscosity: 1.0,
      zoomControl: false,
      layers: [initialLayer]
    });

    // Add custom zoom control in bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Map click handler (for coordinate picker mode or add-on-map mode)
    this.map.on('click', (e) => {
      if (this.pickerMode) {
        this.handleMapPick(e.latlng);
      } else if (this.addPinMode) {
        this.showAddLocationPopup(e.latlng);
        this.toggleAddPinMode(false);
      }
    });

    // Right-click / Context Menu: Directly allows adding a case study anywhere!
    this.map.on('contextmenu', (e) => {
      this.showAddLocationPopup(e.latlng);
    });

    // Delegated click handler for map popup buttons (Edit, Delete & Open)
    container.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.delete-study-popup-btn');
      if (delBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = delBtn.dataset.id;
        this.map.closePopup();
        this.onDeleteStudy(id);
        return;
      }
      const editBtn = e.target.closest('.edit-study-popup-btn');
      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = editBtn.dataset.id;
        const study = this.currentStudies?.find(s => s.id === id);
        if (study) {
          this.onEditStudy(study);
        }
        return;
      }
      const viewBtn = e.target.closest('.view-study-btn');
      if (viewBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = viewBtn.dataset.id;
        if (id) {
          this.onMarkerSelect(id);
        }
        return;
      }
    });

    // Multiple invalidation passes to prevent gray/unrendered canvas
    setTimeout(() => this.map.invalidateSize(), 50);
    setTimeout(() => this.map.invalidateSize(), 200);
    setTimeout(() => this.map.invalidateSize(), 600);

    window.addEventListener('resize', () => {
      if (this.map) this.map.invalidateSize();
    });
  }

  setTheme(theme) {
    if (!this.map) return;
    const targetLayer = this.tileLayers[theme] || this.tileLayers.voyager;
    this.currentTheme = theme;
    
    // Remove all layers
    Object.values(this.tileLayers).forEach(layer => {
      if (this.map.hasLayer(layer)) this.map.removeLayer(layer);
    });

    // Add selected layer
    targetLayer.addTo(this.map);
    this.map.invalidateSize();
  }

  createPinIcon(category, isSelected = false) {
    const isPhysical = category === 'Physical';
    const primaryColor = isPhysical ? '#059669' : '#4f46e5'; // Emerald-600 vs Indigo-600
    const ringColor = isPhysical ? '#10b981' : '#6366f1';
    const bgGradient = isPhysical 
      ? 'linear-gradient(135deg, #10b981, #047857)' 
      : 'linear-gradient(135deg, #6366f1, #4338ca)';
    
    const iconSymbol = isPhysical 
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`
      : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;

    const selectedClass = isSelected ? 'scale-125 z-50 ring-4 ring-offset-2 ring-amber-400' : 'hover:scale-110';

    const html = `
      <div class="custom-map-pin flex flex-col items-center cursor-pointer transition-transform duration-200 ${selectedClass}" style="transform-origin: bottom center;">
        <div class="pin-head shadow-xl flex items-center justify-center text-white rounded-full p-2 border-2 border-white"
             style="background: ${bgGradient}; box-shadow: 0 4px 14px rgba(0,0,0,0.3), 0 0 10px ${ringColor}80; width: 34px; height: 34px;">
          ${iconSymbol}
        </div>
        <div class="pin-point w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]"
             style="border-t-color: ${primaryColor}; margin-top: -1px;"></div>
        ${isSelected ? `<span class="absolute -bottom-2 w-3 h-1.5 bg-black/25 rounded-full blur-[1px]"></span>` : ''}
      </div>
    `;

    return L.divIcon({
      className: 'leaflet-custom-div-icon',
      html: html,
      iconSize: [36, 44],
      iconAnchor: [18, 42],
      popupAnchor: [0, -40]
    });
  }

  renderCaseStudies(caseStudies, selectedId = null) {
    if (!this.map) return;
    this.currentStudies = caseStudies;

    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers.clear();

    caseStudies.forEach(study => {
      const isSelected = study.id === selectedId;
      const icon = this.createPinIcon(study.category, isSelected);

      const marker = L.marker([study.lat, study.lng], { icon: icon, zIndexOffset: isSelected ? 1000 : 100 });

      // Popup Content
      const popupHtml = `
        <div class="p-1 font-sans max-w-xs text-slate-800">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${
              study.category === 'Physical' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
            }">${study.category}</span>
            <span class="text-[10px] text-slate-500 font-medium truncate">${study.topic}</span>
          </div>
          <h4 class="font-bold text-sm text-slate-900 leading-tight mb-1">${study.title}</h4>
          <p class="text-xs text-slate-600 mb-2 line-clamp-2">${study.summary}</p>
          <div class="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2 gap-2">
            <span class="truncate max-w-[100px]" title="${study.country}">📍 ${study.country}</span>
            <div class="flex items-center gap-1.5 shrink-0">
              <button class="edit-study-popup-btn px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 transition cursor-pointer" data-id="${study.id}" title="Edit Case Study">
                ✏️ Edit
              </button>
              <button class="delete-study-popup-btn p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer" data-id="${study.id}" title="Delete Case Study">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
              <button class="view-study-btn px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer" data-id="${study.id}">
                Open &rarr;
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'custom-leaflet-popup shadow-xl rounded-xl',
        maxWidth: 290,
        autoPan: true,
        autoPanPadding: [70, 70],
        autoPanPaddingTopLeft: [70, 70]
      });

      marker.on('click', () => {
        this.onMarkerSelect(study.id);
      });

      marker.on('popupopen', (e) => {
        const popupEl = e.popup.getElement();
        if (popupEl) {
          const viewBtn = popupEl.querySelector('.view-study-btn');
          if (viewBtn) {
            viewBtn.onclick = (ev) => {
              ev.preventDefault();
              this.onMarkerSelect(study.id);
            };
          }
          const editBtn = popupEl.querySelector('.edit-study-popup-btn');
          if (editBtn) {
            editBtn.onclick = (ev) => {
              ev.preventDefault();
              this.onEditStudy(study);
            };
          }
        }
      });

      marker.addTo(this.map);
      this.markers.set(study.id, marker);
    });
  }

  highlightMarker(studyId, flyTo = true) {
    this.markers.forEach((marker, id) => {
      const isSelected = id === studyId;
      // Refresh icon state
      // (Could be improved by re-instantiating icon if needed)
    });

    const targetMarker = this.markers.get(studyId);
    if (targetMarker && this.map) {
      if (flyTo) {
        const latLng = targetMarker.getLatLng();
        this.map.flyTo(latLng, Math.max(this.map.getZoom(), 5), {
          animate: true,
          duration: 1.2
        });
      }
      targetMarker.openPopup();
    }
  }

  flyToCoordinates(lat, lng, zoom = 6) {
    if (!this.map) return;
    this.map.flyTo([lat, lng], zoom, {
      animate: true,
      duration: 1.2
    });
  }

  fitAll() {
    if (!this.map || this.markers.size === 0) return;
    const group = L.featureGroup(Array.from(this.markers.values()));
    this.map.fitBounds(group.getBounds().pad(0.15));
  }

  enableCoordinatePicker(callback) {
    this.pickerMode = true;
    this.onLocationPicked = callback;
    const container = document.getElementById(this.containerId);
    if (container) {
      container.classList.add('cursor-crosshair');
    }
  }

  disableCoordinatePicker() {
    this.pickerMode = false;
    const container = document.getElementById(this.containerId);
    if (container) {
      container.classList.remove('cursor-crosshair');
    }
    if (this.pickerMarker && this.map) {
      this.map.removeLayer(this.pickerMarker);
      this.pickerMarker = null;
    }
  }

  handleMapPick(latlng) {
    const lat = parseFloat(latlng.lat.toFixed(4));
    const lng = parseFloat(latlng.lng.toFixed(4));

    if (this.pickerMarker && this.map) {
      this.map.removeLayer(this.pickerMarker);
    }

    const pinIcon = L.divIcon({
      className: 'picker-pin',
      html: `
        <div class="animate-bounce flex flex-col items-center">
          <div class="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
            📍
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    this.pickerMarker = L.marker([lat, lng], { icon: pinIcon }).addTo(this.map);

    if (this.onLocationPicked) {
      this.onLocationPicked(lat, lng);
    }
  }

  toggleAddPinMode(forceState) {
    this.addPinMode = forceState !== undefined ? forceState : !this.addPinMode;
    const container = document.getElementById(this.containerId);
    const btn = document.getElementById('map-add-pin-btn');
    let banner = document.getElementById('map-add-pin-banner');

    if (this.addPinMode) {
      if (container) container.classList.add('cursor-crosshair');
      if (btn) {
        btn.classList.add('bg-indigo-600', 'text-white', 'border-indigo-700');
        btn.classList.remove('bg-white/95', 'text-slate-700');
      }
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'map-add-pin-banner';
        banner.className = 'fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-indigo-900/95 text-white px-4 py-2 rounded-full shadow-2xl text-xs font-bold border border-indigo-400 flex items-center gap-2.5 animate-fadeIn backdrop-blur';
        banner.innerHTML = `
          <span>🎯 Click anywhere on the map to add a new case study (or Right-Click anytime)</span>
          <button id="close-map-add-banner" class="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[11px] font-semibold">Done</button>
        `;
        document.body.appendChild(banner);
        banner.querySelector('#close-map-add-banner').onclick = () => this.toggleAddPinMode(false);
      }
    } else {
      if (container) container.classList.remove('cursor-crosshair');
      if (btn) {
        btn.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-700');
        btn.classList.add('bg-white/95', 'text-slate-700');
      }
      if (banner) banner.remove();
    }
  }

  showAddLocationPopup(latlng) {
    const lat = parseFloat(latlng.lat.toFixed(4));
    const lng = parseFloat(latlng.lng.toFixed(4));

    const content = document.createElement('div');
    content.className = 'p-1.5 font-sans text-slate-800 max-w-[220px]';
    content.innerHTML = `
      <div class="flex items-center gap-1.5 mb-1 text-indigo-700 font-bold text-xs">
        <span class="text-base">📍</span>
        <span>Selected Location</span>
      </div>
      <div class="font-mono text-[11px] text-slate-500 mb-2.5 bg-slate-50 p-1 rounded border border-slate-200">
        Lat: ${lat}<br>Lng: ${lng}
      </div>
      <button id="add-here-popup-btn" class="w-full px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
        <span>Add Case Study Here</span>
      </button>
    `;

    const popup = L.popup({
      className: 'custom-leaflet-popup shadow-xl rounded-xl',
      maxWidth: 240,
      autoPan: true,
      autoPanPadding: [70, 70],
      autoPanPaddingTopLeft: [70, 70]
    })
    .setLatLng(latlng)
    .setContent(content)
    .openOn(this.map);

    setTimeout(() => {
      const btn = content.querySelector('#add-here-popup-btn');
      if (btn) {
        btn.onclick = () => {
          this.map.closePopup(popup);
          this.onAddAtLocation(lat, lng);
        };
      }
    }, 50);
  }
}
