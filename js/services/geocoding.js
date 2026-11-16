/**
 * Geocoding Service - Provides location lookup via OpenStreetMap Nominatim
 * with an offline dictionary of common A-Level Geography locations.
 */

const OFFLINE_LOCATIONS = {
  "japan": { lat: 38.297, lng: 142.373, name: "Tōhoku Region, Japan" },
  "tohoku": { lat: 38.297, lng: 142.373, name: "Tōhoku, Japan" },
  "fukushima": { lat: 37.421, lng: 141.033, name: "Fukushima, Japan" },
  "holderness": { lat: 53.864, lng: -0.138, name: "Holderness Coast, Yorkshire, UK" },
  "mappleton": { lat: 53.864, lng: -0.138, name: "Mappleton, East Yorkshire, UK" },
  "hornsea": { lat: 53.911, lng: -0.166, name: "Hornsea, East Yorkshire, UK" },
  "london docklands": { lat: 51.504, lng: -0.019, name: "Canary Wharf, London Docklands, UK" },
  "canary wharf": { lat: 51.504, lng: -0.019, name: "Canary Wharf, London, UK" },
  "stratford": { lat: 51.543, lng: -0.007, name: "Stratford & Olympic Park, London, UK" },
  "china": { lat: 39.904, lng: 116.407, name: "Beijing, China" },
  "beijing": { lat: 39.904, lng: 116.407, name: "Beijing, China" },
  "gwadar": { lat: 25.126, lng: 62.325, name: "Gwadar Port, Pakistan" },
  "california": { lat: 36.778, lng: -119.417, name: "California, USA" },
  "colorado river": { lat: 36.015, lng: -114.737, name: "Lake Mead / Hoover Dam, USA" },
  "zhengzhou": { lat: 34.757, lng: 113.665, name: "Zhengzhou, Henan, China" },
  "haiti": { lat: 18.594, lng: -72.307, name: "Port-au-Prince, Haiti" },
  "iceland": { lat: 63.633, lng: -19.600, name: "Eyjafjallajökull, Iceland" },
  "philippines": { lat: 11.244, lng: 125.003, name: "Tacloban, Philippines (Typhoon Haiyan)" },
  "sahel": { lat: 14.497, lng: 14.452, name: "Sahel Region, West Africa" },
  "aral sea": { lat: 45.000, lng: 59.000, name: "Aral Sea, Uzbekistan/Kazakhstan" },
  "ethiopia": { lat: 11.214, lng: 35.093, name: "GERD (Grand Ethiopian Renaissance Dam)" }
};

export class GeocodingService {
  /**
   * Search for coordinates by place or country name
   */
  static async search(query) {
    if (!query || query.trim().length < 2) return null;
    const cleanQuery = query.trim().toLowerCase();

    // Check offline dictionary first
    for (const [key, val] of Object.entries(OFFLINE_LOCATIONS)) {
      if (cleanQuery.includes(key) || key.includes(cleanQuery)) {
        return {
          lat: val.lat,
          lng: val.lng,
          displayName: val.name,
          source: 'local'
        };
      }
    }

    // Attempt online lookup via Nominatim
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Geocoding request failed');
      const results = await res.json();
      if (results && results.length > 0) {
        return {
          lat: parseFloat(results[0].lat),
          lng: parseFloat(results[0].lon),
          displayName: results[0].display_name,
          source: 'nominatim'
        };
      }
    } catch (e) {
      console.warn('Online geocoding unavailable or failed:', e);
    }

    return null;
  }

  /**
   * Reverse geocode a coordinate to a place name
   */
  static async reverse(lat, lng) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    } catch (e) {
      console.warn('Reverse geocoding failed:', e);
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
