import { useEffect, useRef, useState, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import {
  Flame,
  Building2,
  Phone,
  Navigation,
  Compass,
  Search,
  X,
  ExternalLink,
  Copy,
  Check,
  Layers,
  MapPin,
  ShieldAlert,
  Radio,
  Share2,
} from 'lucide-react';
import { CityLocation } from '../services/weatherApi';
import {
  VERIFIED_EMERGENCY_FACILITIES,
  NATIONWIDE_HOTSPOTS,
  EmergencyFacility,
  HotspotData,
} from '../data/realEmergencyFacilities';

export type BasemapProvider = 'google-hybrid' | 'google-roads' | 'google-terrain' | 'esri-dark' | 'osm';

interface BasemapConfig {
  id: BasemapProvider;
  name: string;
  category: string;
  tiles: string[];
  maxzoom: number;
}

const BASEMAP_PROVIDERS: BasemapConfig[] = [
  {
    id: 'google-hybrid',
    name: 'Google Satelit Hybrid',
    category: 'Google Maps (Bebas Watermark)',
    tiles: ['https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'],
    maxzoom: 20,
  },
  {
    id: 'google-roads',
    name: 'Google Maps Jalan',
    category: 'Google Maps Standar',
    tiles: ['https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'],
    maxzoom: 20,
  },
  {
    id: 'google-terrain',
    name: 'Google Relief Topografi',
    category: 'Google Maps Relief',
    tiles: ['https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'],
    maxzoom: 20,
  },
  {
    id: 'esri-dark',
    name: 'Esri Dark Canvas (Malam/Taktis)',
    category: 'Esri GIS (Bebas Watermark)',
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'],
    maxzoom: 18,
  },
  {
    id: 'osm',
    name: 'OpenStreetMap Standar',
    category: 'Open Data',
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    maxzoom: 19,
  },
];

interface MapLibreViewProps {
  city: CityLocation;
  aqi: number;
  categoryHex: string;
  isCompact?: boolean;
  selectedFacilityId?: string | null;
  onFacilitySelected?: (facility: EmergencyFacility | null) => void;
}

export function MapLibreView({
  city,
  aqi,
  categoryHex,
  isCompact = false,
  selectedFacilityId = null,
  onFacilitySelected,
}: MapLibreViewProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  // Markers storage
  const cityMarkerRef = useRef<maplibregl.Marker | null>(null);
  const hotspotMarkersRef = useRef<{ id: string; marker: maplibregl.Marker; el: HTMLElement }[]>([]);
  const facilityMarkersRef = useRef<{ id: string; marker: maplibregl.Marker; el: HTMLElement }[]>([]);

  // State
  const [activeProvider, setActiveProvider] = useState<BasemapProvider>('google-hybrid');
  const [filterType, setFilterType] = useState<'all' | 'hotspots' | 'hospitals' | 'emergency'>('all');
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotData | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<EmergencyFacility | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCopiedGps, setIsCopiedGps] = useState(false);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  // Synchronize external facility selection
  useEffect(() => {
    if (selectedFacilityId) {
      const found = VERIFIED_EMERGENCY_FACILITIES.find((f) => f.id === selectedFacilityId);
      if (found) {
        setSelectedFacility(found);
        setSelectedHotspot(null);
        if (mapInstance.current) {
          mapInstance.current.flyTo({
            center: found.coordinates,
            zoom: 13,
            speed: 1.2,
            essential: true,
          });
        }
      }
    }
  }, [selectedFacilityId]);

  // Notify parent of facility selection
  useEffect(() => {
    if (onFacilitySelected) {
      onFacilitySelected(selectedFacility);
    }
  }, [selectedFacility, onFacilitySelected]);

  // 1. Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current) return;

    const initialProvider = BASEMAP_PROVIDERS.find((p) => p.id === activeProvider) || BASEMAP_PROVIDERS[0];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'dynamic-basemap': {
            type: 'raster',
            tiles: initialProvider.tiles,
            tileSize: 256,
          },
        },
        layers: [
          {
            id: 'dynamic-basemap-layer',
            type: 'raster',
            source: 'dynamic-basemap',
            minzoom: 0,
            maxzoom: initialProvider.maxzoom,
          },
        ],
      },
      center: [city.lon, city.lat],
      zoom: isCompact ? 10.5 : 10.2,
      attributionControl: false,
    });

    if (!isCompact) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
      map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
    }

    mapInstance.current = map;

    map.on('load', () => {
      map.resize();
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // 2. Switch Basemap Tiles Dynamically without losing markers
  const switchBasemap = (providerId: BasemapProvider) => {
    setActiveProvider(providerId);
    setIsLayerMenuOpen(false);
    const map = mapInstance.current;
    if (!map) return;

    const config = BASEMAP_PROVIDERS.find((p) => p.id === providerId) || BASEMAP_PROVIDERS[0];

    try {
      if (map.getLayer('dynamic-basemap-layer')) {
        map.removeLayer('dynamic-basemap-layer');
      }
      if (map.getSource('dynamic-basemap')) {
        map.removeSource('dynamic-basemap');
      }

      map.addSource('dynamic-basemap', {
        type: 'raster',
        tiles: config.tiles,
        tileSize: 256,
      });

      map.addLayer(
        {
          id: 'dynamic-basemap-layer',
          type: 'raster',
          source: 'dynamic-basemap',
          minzoom: 0,
          maxzoom: config.maxzoom,
        },
        map.getStyle().layers?.[0]?.id
      );
    } catch {
      // Fallback
    }
  };

  // 3. Render City Pin & Filtered Markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Fly to current selected city when city changes
    map.flyTo({
      center: [city.lon, city.lat],
      zoom: isCompact ? 10.5 : 10.2,
      essential: true,
      speed: 1.1,
    });

    // Update City Pin Marker
    if (cityMarkerRef.current) {
      cityMarkerRef.current.remove();
    }

    const cityEl = document.createElement('div');
    cityEl.className = 'select-none pointer-events-auto cursor-pointer';
    cityEl.innerHTML = `
      <div style="background-color: ${categoryHex}" class="px-2.5 py-1 rounded-full text-white text-xs font-bold shadow-xl border-2 border-white flex items-center gap-1.5 transition-transform hover:scale-105">
        <span class="w-2 h-2 rounded-full bg-white shrink-0"></span>
        <span class="font-sans">${city.name}</span>
        <span class="bg-black/25 px-1.5 py-0.2 rounded text-[10px] font-mono">AQI ${aqi}</span>
      </div>
    `;

    cityMarkerRef.current = new maplibregl.Marker({ element: cityEl })
      .setLngLat([city.lon, city.lat])
      .addTo(map);

    // Render Hotspots with Glowing Beacon Pulse Animation
    hotspotMarkersRef.current.forEach(({ marker }) => marker.remove());
    hotspotMarkersRef.current = [];

    const shouldShowHotspots = filterType === 'all' || filterType === 'hotspots';
    if (shouldShowHotspots) {
      NATIONWIDE_HOTSPOTS.forEach((hs) => {
        const hsEl = document.createElement('div');
        hsEl.style.pointerEvents = 'auto';
        hsEl.style.cursor = 'pointer';
        hsEl.className = 'relative flex items-center justify-center p-1.5';

        const isSelected = selectedHotspot?.id === hs.id;

        hsEl.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-rose-500/40 animate-ping"></span>
            <div style="background: radial-gradient(circle, #EF4444 0%, #B91C1C 100%); border-color: ${
              isSelected ? '#FBBF24' : '#FDE047'
            };" class="relative w-8 h-8 rounded-full border-2 flex items-center justify-center text-white shadow-xl transition-all ${
          isSelected ? 'scale-125 ring-4 ring-amber-400 z-30' : 'hover:scale-115 z-10'
        }">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-200">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
            </div>
          </div>
        `;

        // Direct, non-jitter click handler
        const handleSelect = (e: MouseEvent | TouchEvent) => {
          e.stopPropagation();
          e.preventDefault();
          setSelectedHotspot(hs);
          setSelectedFacility(null);
          map.flyTo({
            center: hs.coordinates,
            zoom: Math.max(map.getZoom(), 11.5),
            speed: 1.1,
          });
        };

        hsEl.addEventListener('click', handleSelect);
        hsEl.addEventListener('touchend', handleSelect);

        const marker = new maplibregl.Marker({ element: hsEl, anchor: 'center' })
          .setLngLat(hs.coordinates)
          .addTo(map);

        hotspotMarkersRef.current.push({ id: hs.id, marker, el: hsEl });
      });
    }

    // Render Hospitals and Emergency Facilities
    facilityMarkersRef.current.forEach(({ marker }) => marker.remove());
    facilityMarkersRef.current = [];

    const shouldShowFacilities =
      filterType === 'all' ||
      (filterType === 'hospitals') ||
      (filterType === 'emergency');

    if (shouldShowFacilities) {
      VERIFIED_EMERGENCY_FACILITIES.forEach((fac) => {
        if (filterType === 'hospitals' && fac.type !== 'hospital') return;
        if (filterType === 'emergency' && fac.type === 'hospital') return;

        const facEl = document.createElement('div');
        facEl.style.pointerEvents = 'auto';
        facEl.style.cursor = 'pointer';
        facEl.className = 'relative flex items-center justify-center p-1';

        const isHosp = fac.type === 'hospital';
        const isFire = fac.type === 'fire_station';
        const isSelected = selectedFacility?.id === fac.id;

        const bgColor = isHosp ? '#0284C7' : isFire ? '#D97706' : '#0F172A';
        const borderColor = isHosp ? '#38BDF8' : isFire ? '#FBBF24' : '#94A3B8';

        facEl.innerHTML = `
          <div style="background-color: ${bgColor}; border-color: ${borderColor};" class="px-2.5 py-1 rounded-lg border-2 text-white text-[11px] font-bold shadow-xl flex items-center gap-1.5 transition-all ${
          isSelected ? 'scale-125 ring-4 ring-sky-300 z-30' : 'hover:scale-110 z-10'
        }">
            <span class="w-2 h-2 rounded-full ${isHosp ? 'bg-sky-300' : isFire ? 'bg-amber-300' : 'bg-emerald-300'} shrink-0"></span>
            <span class="font-sans whitespace-nowrap">${fac.name.split(' ')[0]}</span>
          </div>
        `;

        const handleSelect = (e: MouseEvent | TouchEvent) => {
          e.stopPropagation();
          e.preventDefault();
          setSelectedFacility(fac);
          setSelectedHotspot(null);
          map.flyTo({
            center: fac.coordinates,
            zoom: Math.max(map.getZoom(), 12),
            speed: 1.1,
          });
        };

        facEl.addEventListener('click', handleSelect);
        facEl.addEventListener('touchend', handleSelect);

        const marker = new maplibregl.Marker({ element: facEl, anchor: 'center' })
          .setLngLat(fac.coordinates)
          .addTo(map);

        facilityMarkersRef.current.push({ id: fac.id, marker, el: facEl });
      });
    }
  }, [city, aqi, categoryHex, filterType, selectedHotspot?.id, selectedFacility?.id, isCompact]);

  // Regional Zoom Bounds
  const zoomToRegion = (bounds: [[number, number], [number, number]]) => {
    if (!mapInstance.current) return;
    mapInstance.current.fitBounds(bounds, { padding: 40, maxZoom: 12 });
  };

  // Live Search Filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();

    const matchedHotspots = NATIONWIDE_HOTSPOTS.filter(
      (h) =>
        h.locationName.toLowerCase().includes(q) ||
        h.province.toLowerCase().includes(q) ||
        h.peatlandType.toLowerCase().includes(q)
    ).map((h) => ({ item: h, type: 'hotspot' as const }));

    const matchedFacilities = VERIFIED_EMERGENCY_FACILITIES.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q) ||
        f.province.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q)
    ).map((f) => ({ item: f, type: 'facility' as const }));

    return [...matchedHotspots, ...matchedFacilities].slice(0, 8);
  }, [searchQuery]);

  const handleCopyGps = (coords: [number, number]) => {
    navigator.clipboard.writeText(`${coords[1]}, ${coords[0]}`);
    setIsCopiedGps(true);
    setTimeout(() => setIsCopiedGps(false), 2000);
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-950 font-sans ${
        isCompact ? 'h-64' : 'h-[460px] md:h-[520px] lg:h-[560px]'
      }`}
    >
      {/* MapLibre Canvas */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* TOP CONTROLS & FILTER BAR (Cleanly floating, no overflow clip) */}
      {!isCompact && (
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 pointer-events-none">
          {/* Left: Provider Switcher & Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-xl text-xs">
            {/* Basemap Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold flex items-center gap-1.5 border border-slate-600 transition-colors cursor-pointer"
                title="Pilih Citra Satelit Google / Esri / OSM"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>{BASEMAP_PROVIDERS.find((p) => p.id === activeProvider)?.name}</span>
              </button>

              {isLayerMenuOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2 py-1">
                    Pilih Provider Citra Satelit
                  </div>
                  {BASEMAP_PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => switchBasemap(p.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                        activeProvider === p.id
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className="text-[9px] font-mono opacity-80">{p.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="w-px h-4 bg-slate-700 hidden sm:block" />

            {/* Filter Chips */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Semua ({NATIONWIDE_HOTSPOTS.length + VERIFIED_EMERGENCY_FACILITIES.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterType('hotspots')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  filterType === 'hotspots'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Titik Api ({NATIONWIDE_HOTSPOTS.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('hospitals')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  filterType === 'hospitals'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                <span>RSUD Paru ({VERIFIED_EMERGENCY_FACILITIES.filter((f) => f.type === 'hospital').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('emergency')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  filterType === 'emergency'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>BPBD & Polsek ({VERIFIED_EMERGENCY_FACILITIES.filter((f) => f.type !== 'hospital').length})</span>
              </button>
            </div>
          </div>

          {/* Right: Quick Search Box */}
          <div className="relative pointer-events-auto max-w-xs w-full">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari RSUD, Posko, Titik Api..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xl"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1 max-h-72 overflow-y-auto">
                {searchResults.map(({ item, type }) => {
                  const isHotspot = type === 'hotspot';
                  const title = isHotspot ? (item as HotspotData).locationName : (item as EmergencyFacility).name;
                  const subtitle = isHotspot
                    ? `${(item as HotspotData).province} · ${(item as HotspotData).peatlandType}`
                    : `${(item as EmergencyFacility).city}, ${(item as EmergencyFacility).province}`;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (isHotspot) {
                          setSelectedHotspot(item as HotspotData);
                          setSelectedFacility(null);
                        } else {
                          setSelectedFacility(item as EmergencyFacility);
                          setSelectedHotspot(null);
                        }
                        if (mapInstance.current) {
                          mapInstance.current.flyTo({
                            center: item.coordinates,
                            zoom: 13,
                            speed: 1.2,
                          });
                        }
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors flex items-start gap-2.5 cursor-pointer text-xs"
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                          isHotspot ? 'bg-rose-600 text-white' : 'bg-sky-600 text-white'
                        }`}
                      >
                        {isHotspot ? <Flame className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 truncate">
                        <div className="font-bold text-white truncate">{title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUICK REGION JUMP STRIP (Pill style, non-colliding at top-left below filter bar) */}
      {!isCompact && (
        <div className="absolute top-14 left-2.5 z-10 hidden sm:flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-700/70 shadow-md text-[10px] font-bold text-slate-300">
          <span className="text-slate-400 uppercase font-mono mr-0.5">Fokus:</span>
          <button
            type="button"
            onClick={() =>
              zoomToRegion([
                [95.0, -11.0],
                [141.0, 6.0],
              ])
            }
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors cursor-pointer"
          >
            Seluruh RI
          </button>
          <button
            type="button"
            onClick={() =>
              zoomToRegion([
                [108.0, -4.5],
                [117.5, 4.0],
              ])
            }
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors cursor-pointer"
          >
            Kalimantan
          </button>
          <button
            type="button"
            onClick={() =>
              zoomToRegion([
                [98.0, -5.5],
                [106.0, 5.5],
              ])
            }
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors cursor-pointer"
          >
            Sumatera
          </button>
          <button
            type="button"
            onClick={() =>
              zoomToRegion([
                [119.0, -5.8],
                [125.8, 2.2],
              ])
            }
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors cursor-pointer"
          >
            Sulawesi
          </button>
          <button
            type="button"
            onClick={() =>
              zoomToRegion([
                [136.0, -9.0],
                [141.2, -6.5],
              ])
            }
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors cursor-pointer"
          >
            Papua
          </button>
        </div>
      )}



      {/* DETAIL INSPECTION DRAWER: HOTSPOT (Docked nicely at bottom right, NO OVERLAP with other controls) */}
      {selectedHotspot && (
        <div className="absolute bottom-2.5 left-2.5 right-2.5 md:left-auto md:right-2.5 md:w-[380px] z-30 bg-slate-900/95 backdrop-blur-xl text-white p-3.5 rounded-2xl border-2 border-rose-500/80 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg mt-0.5">
                <Flame className="w-5 h-5 text-amber-200" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-rose-950 text-rose-300 px-1.5 py-0.2 rounded border border-rose-700 font-mono">
                    {selectedHotspot.satellite}
                  </span>
                  <span className="text-[11px] font-bold text-amber-300">
                    {selectedHotspot.confidence}
                  </span>
                </div>
                <h4 className="text-xs font-black text-white leading-tight">
                  {selectedHotspot.locationName}
                </h4>
                <div className="text-[11px] text-slate-300">
                  {selectedHotspot.province} · <strong className="text-emerald-300">{selectedHotspot.peatlandType}</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedHotspot(null)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hotspot Metrics Grid */}
          <div className="grid grid-cols-2 gap-1.5 mt-2.5 p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px]">
            <div>
              <span className="text-[9px] text-slate-400 block">Kekuatan Radiasi (FRP)</span>
              <strong className="text-rose-400 font-mono text-xs">{selectedHotspot.frpMw} MW</strong>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block">Suhu Sensor</span>
              <strong className="text-amber-300 font-mono text-xs">{selectedHotspot.brightnessKelvin} K</strong>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
            <span>{selectedHotspot.detectedDate}</span>
            <span className="text-rose-400 font-bold">{selectedHotspot.status}</span>
          </div>

          {/* Action Buttons: Direct Google Maps & GPS Copy */}
          <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-800">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedHotspot.coordinates[1]},${selectedHotspot.coordinates[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 px-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di Google Maps</span>
            </a>

            <button
              type="button"
              onClick={() => handleCopyGps(selectedHotspot.coordinates)}
              className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isCopiedGps ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopiedGps ? 'Tersalin' : 'Salin GPS'}</span>
            </button>
          </div>
        </div>
      )}

      {/* DETAIL INSPECTION DRAWER: HOSPITAL & POLICE (Docked nicely, NO OVERLAP) */}
      {selectedFacility && (
        <div className="absolute bottom-2.5 left-2.5 right-2.5 md:left-auto md:right-2.5 md:w-[400px] z-30 bg-slate-900/95 backdrop-blur-xl text-white p-3.5 rounded-2xl border-2 border-sky-500/80 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg mt-0.5 ${
                  selectedFacility.type === 'hospital'
                    ? 'bg-sky-600 text-white'
                    : selectedFacility.type === 'fire_station'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-emerald-400'
                }`}
              >
                {selectedFacility.type === 'hospital' ? (
                  <Building2 className="w-5 h-5" />
                ) : (
                  <Radio className="w-5 h-5" />
                )}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                      selectedFacility.type === 'hospital'
                        ? 'bg-sky-950 text-sky-300 border-sky-700'
                        : 'bg-amber-950 text-amber-300 border-amber-700'
                    }`}
                  >
                    {selectedFacility.type === 'hospital'
                      ? 'RSUD Rujukan Paru'
                      : selectedFacility.type === 'fire_station'
                      ? 'Posko Satgas BPBD/Agni'
                      : 'Sentra Kepolisian 110'}
                  </span>
                  {selectedFacility.bedCapacity && (
                    <span className="text-[9px] font-mono bg-slate-800 text-emerald-400 px-1 py-0.2 rounded">
                      {selectedFacility.bedCapacity} TT Bed
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-black text-white leading-tight">{selectedFacility.name}</h4>
                <div className="text-[11px] text-slate-300">{selectedFacility.address}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedFacility(null)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Oxygen and Facility Tags */}
          {selectedFacility.oxygenSupplyStatus && (
            <div className="mt-2.5 p-1.5 bg-emerald-950/60 border border-emerald-700/60 rounded-xl flex items-center justify-between text-[11px] text-emerald-300">
              <span className="font-semibold">Kesiapan Oksigen:</span>
              <strong className="font-bold">{selectedFacility.oxygenSupplyStatus}</strong>
            </div>
          )}

          <div className="flex flex-wrap gap-1 mt-2">
            {selectedFacility.facilities.slice(0, 3).map((fac, idx) => (
              <span
                key={idx}
                className="text-[9px] font-medium bg-slate-800/80 text-slate-200 px-1.5 py-0.2 rounded border border-slate-700"
              >
                {fac}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-800">
            <a
              href={`tel:${selectedFacility.phone.replace(/[^0-9]/g, '')}`}
              className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Hubungi: {selectedFacility.phone.split('/')[0].trim()}</span>
            </a>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.coordinates[1]},${selectedFacility.coordinates[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 px-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              title="Rute Navigasi Google Maps"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Navigasi</span>
            </a>

            <button
              type="button"
              onClick={() => handleCopyGps(selectedFacility.coordinates)}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              title="Salin Koordinat GPS"
            >
              {isCopiedGps ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
