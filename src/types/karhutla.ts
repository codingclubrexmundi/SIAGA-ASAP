export type IspuCategory =
  | 'Baik'
  | 'Sedang'
  | 'Tidak Sehat'
  | 'Sangat Tidak Sehat'
  | 'Berbahaya';

export interface IspuCategoryMeta {
  category: IspuCategory;
  rangeLabel: string;
  minScore: number;
  maxScore: number;
  hexColor: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  shortWarning: string;
  publicGuidance: string;
  vulnerableGuidance: string;
}

export interface HotspotPoint {
  id: string;
  label: string;
  x: number; // Percentage coordinate 0-100 on the regional SVG canvas
  y: number;
  confidence: 'Tinggi (92%)' | 'Tinggi (88%)' | 'Sedang (75%)' | 'Tinggi (95%)';
  peatlandDepth: string;
  detectedTime: string;
  fireRadiusKm: number;
}

export interface AffectedDistrict {
  id: string;
  name: string;
  type: 'Kecamatan' | 'Kabupaten';
  x: number; // Center X (0-100) on regional SVG map
  y: number; // Center Y (0-100) on regional SVG map
  polygonPoints: string; // SVG polygon points inside 800x480 viewBox
  baseIspu: number;
  affectedPopulation: number;
  vulnerableCount: number;
  visibilityMeters: number;
  nearestHealthPost: {
    name: string;
    address: string;
    distanceKm: number;
    oxygenStockStatus: 'Tersedia Cukup' | 'Terbatas - Siaga' | 'Prioritas Darurat';
    phone: string;
  };
}

export interface SmokePlumeConfig {
  id: string;
  originName: string;
  cx: number; // 0-800 viewBox
  cy: number; // 0-480 viewBox
  rx: number;
  ry: number;
  rotationDeg: number;
  coreDensity: number; // 0.3 to 0.9
}

export interface RegionMonitoringData {
  id: string;
  cityName: string;
  province: string;
  island: 'Kalimantan' | 'Sumatera';
  coordinatesLabel: string;
  stationName: string;
  baseIspu: number;
  basePm25: number; // µg/m³
  basePm10: number; // µg/m³
  baseCo: number;   // mg/m³
  baseO3: number;   // µg/m³
  baseSo2: number;  // µg/m³
  windSpeedKmh: number;
  windDirection: string;
  windAngleDeg: number;
  temperatureC: number;
  humidityPct: number;
  baseVisibilityMeters: number;
  alertHeadline: string;
  alertDetail: string;
  hourlyMultipliers: number[]; // 24 multipliers for hours 00:00 to 23:00
  hotspots: HotspotPoint[];
  smokePlumes: SmokePlumeConfig[];
  districts: AffectedDistrict[];
}

export interface ComputedHourlyDistrict extends AffectedDistrict {
  currentIspu: number;
  currentCategory: IspuCategoryMeta;
  currentVisibilityMeters: number;
}

export interface ComputedHourlySnapshot {
  hour: number;
  hourFormatted: string;
  multiplier: number;
  ispuScore: number;
  categoryMeta: IspuCategoryMeta;
  pm25: number;
  pm10: number;
  co: number;
  o3: number;
  so2: number;
  visibilityMeters: number;
  windSpeedKmh: number;
  smokeRadiusScale: number;
  districts: ComputedHourlyDistrict[];
}

export type VulnerabilityGroup =
  | 'dewasa_sehat'
  | 'anak_lansia'
  | 'ibu_hamil'
  | 'asma_ispa'
  | 'pekerja_lapangan';

export type ActivityIntensity = 'ringan' | 'sedang' | 'berat';

export interface HealthAssessmentInput {
  group: VulnerabilityGroup;
  outdoorDurationHours: number;
  activityIntensity: ActivityIntensity;
  symptoms: string[];
}

export interface HealthAssessmentResult {
  riskScore: number; // 0 - 100
  riskLevel: 'Rendah' | 'Waspada' | 'Tinggi' | 'Sangat Tinggi' | 'Darurat Medis';
  riskColorHex: string;
  recommendedMask: string;
  maskFiltrationSpec: string;
  maxSafeOutdoorMinutes: number;
  summaryAdvice: string;
  actionSteps: string[];
  requiresImmediateMedicalConsult: boolean;
}

export type ProtectionPhase = 'dalam_ruang' | 'luar_ruang' | 'pertolongan_pertama';

export interface ProtectionGuideItem {
  id: string;
  phase: ProtectionPhase;
  stepNumber: string;
  title: string;
  description: string;
  criticalNote: string;
  targetAudience: string;
}

export interface ChecklistItem {
  id: string;
  category: 'Ruang Bersih (Clean Air Room)' | 'Logistik & Medis Keluarga' | 'Evakuasi & Komunikasi';
  label: string;
  detail: string;
  priority: 'Wajib' | 'Penting';
}

export interface AssetAttribution {
  id: string;
  category: string;
  sourceName: string;
  usageDescription: string;
  licenseOrStandard: string;
  referenceUrl: string;
}
