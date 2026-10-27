import {
  IspuCategoryMeta,
  RegionMonitoringData,
  ComputedHourlySnapshot,
  HealthAssessmentInput,
  HealthAssessmentResult,
  ChecklistItem,
} from '../types/karhutla';

export const ISPU_CATEGORIES: IspuCategoryMeta[] = [
  {
    category: 'Baik',
    rangeLabel: '0 – 50',
    minScore: 0,
    maxScore: 50,
    hexColor: '#16A34A',
    bgClass: 'bg-emerald-600',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-300',
    shortWarning: 'Udara Bersih & Aman',
    publicGuidance: 'Sangat aman untuk seluruh kegiatan luar ruangan dan olahraga.',
    vulnerableGuidance: 'Tidak ada pembatasan aktivitas bagi kelompok sensitif.',
  },
  {
    category: 'Sedang',
    rangeLabel: '51 – 100',
    minScore: 51,
    maxScore: 100,
    hexColor: '#0284C7',
    bgClass: 'bg-sky-600',
    textClass: 'text-sky-700',
    borderClass: 'border-sky-300',
    shortWarning: 'Waspada Bagi Kelompok Sangat Sensitif',
    publicGuidance: 'Masih dapat diterima untuk aktivitas luar ruang normal.',
    vulnerableGuidance: 'Penderita asma/ISPA disarankan membawa masker dan inhaler saat beraktivitas di luar.',
  },
  {
    category: 'Tidak Sehat',
    rangeLabel: '101 – 200',
    minScore: 101,
    maxScore: 200,
    hexColor: '#D97706',
    bgClass: 'bg-amber-600',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-300',
    shortWarning: 'Merugikan Kesehatan Kelompok Rentan',
    publicGuidance: 'Kurangi aktivitas fisik berat di luar ruangan dan wajib gunakan masker KN95/N95.',
    vulnerableGuidance: 'Anak-anak, lansia, dan ibu hamil harus membatasi waktu di luar ruangan.',
  },
  {
    category: 'Sangat Tidak Sehat',
    rangeLabel: '201 – 300',
    minScore: 201,
    maxScore: 300,
    hexColor: '#DC2626',
    bgClass: 'bg-red-600',
    textClass: 'text-red-700',
    borderClass: 'border-red-300',
    shortWarning: 'Bahaya Tinggi Paparan Asap Pekat',
    publicGuidance: 'Hindari segala bentuk olahraga dan aktivitas luar ruang yang tidak mendesak. Gunakan respirator N95.',
    vulnerableGuidance: 'Wajib tetap berada di dalam ruang bersih (Clean Air Room) dengan ventilasi tertutup.',
  },
  {
    category: 'Berbahaya',
    rangeLabel: '> 300',
    minScore: 301,
    maxScore: 999,
    hexColor: '#7F1D1D',
    bgClass: 'bg-rose-950',
    textClass: 'text-rose-900',
    borderClass: 'border-rose-400',
    shortWarning: 'Darurat Krisis Kualitas Udara Karhutla',
    publicGuidance: 'Kondisi darurat kesehatan publik. Seluruh warga dilarang beraktivitas di luar ruangan tanpa pelindung N95 ketat.',
    vulnerableGuidance: 'Prioritaskan evakuasi kelompok rentan ke Rumah Singgah Bebas Asap apabila ruang rumah terpapar asap.',
  },
];

export function getIspuCategoryInfo(ispuScore: number): IspuCategoryMeta {
  const normalized = Math.max(0, Math.round(ispuScore));
  for (const meta of ISPU_CATEGORIES) {
    if (normalized >= meta.minScore && normalized <= meta.maxScore) {
      return meta;
    }
  }
  return ISPU_CATEGORIES[ISPU_CATEGORIES.length - 1];
}

export function formatHourLabel(hour: number): string {
  const safeHour = ((Math.floor(hour) % 24) + 24) % 24;
  return `${String(safeHour).padStart(2, '0')}:00 WIB`;
}

export function calculateHourlyReading(
  region: RegionMonitoringData,
  hour: number
): ComputedHourlySnapshot {
  const safeHour = ((Math.floor(hour) % 24) + 24) % 24;
  const multiplier = region.hourlyMultipliers[safeHour] ?? 1.0;

  const ispuScore = Math.round(region.baseIspu * multiplier);
  const categoryMeta = getIspuCategoryInfo(ispuScore);

  const pm25 = Number((region.basePm25 * multiplier).toFixed(1));
  const pm10 = Number((region.basePm10 * multiplier).toFixed(1));
  const co = Number((region.baseCo * multiplier).toFixed(1));
  const o3 = Number((region.baseO3 * (0.9 + (multiplier - 0.7) * 0.4)).toFixed(1));
  const so2 = Number((region.baseSo2 * multiplier).toFixed(1));

  // Visibility inversely scales with multiplier
  const rawVisibility = Math.round(region.baseVisibilityMeters / Math.pow(multiplier, 1.35));
  const visibilityMeters = Math.max(120, Math.min(8000, rawVisibility));

  const windVariation = safeHour >= 12 && safeHour <= 17 ? 1.18 : 0.92;
  const windSpeedKmh = Math.round(region.windSpeedKmh * windVariation);

  const smokeRadiusScale = Number((0.75 + (multiplier - 0.65) * 0.85).toFixed(2));

  const districts = region.districts.map((dist) => {
    const currentIspu = Math.round(dist.baseIspu * multiplier);
    const currentCategory = getIspuCategoryInfo(currentIspu);
    const currentVisibilityMeters = Math.max(
      100,
      Math.round(dist.visibilityMeters / Math.pow(multiplier, 1.25))
    );
    return {
      ...dist,
      currentIspu,
      currentCategory,
      currentVisibilityMeters,
    };
  });

  return {
    hour: safeHour,
    hourFormatted: formatHourLabel(safeHour),
    multiplier,
    ispuScore,
    categoryMeta,
    pm25,
    pm10,
    co,
    o3,
    so2,
    visibilityMeters,
    windSpeedKmh,
    smokeRadiusScale,
    districts,
  };
}

export function assessPersonalHealthRisk(
  input: HealthAssessmentInput,
  currentIspu: number,
  currentPm25: number
): HealthAssessmentResult {
  const groupMultiplierMap: Record<HealthAssessmentInput['group'], number> = {
    dewasa_sehat: 1.0,
    pekerja_lapangan: 1.2,
    anak_lansia: 1.45,
    ibu_hamil: 1.5,
    asma_ispa: 1.75,
  };

  const intensityMultiplierMap: Record<HealthAssessmentInput['activityIntensity'], number> = {
    ringan: 1.0,
    sedang: 1.25,
    berat: 1.55,
  };

  const groupFactor = groupMultiplierMap[input.group] ?? 1.0;
  const intensityFactor = intensityMultiplierMap[input.activityIntensity] ?? 1.0;
  const durationHours = Math.max(0, Math.min(12, input.outdoorDurationHours));

  // Base exposure index from ISPU and PM2.5
  const airSeverityBase = (currentIspu / 350) * 55 + (currentPm25 / 250) * 20;
  const durationPenalty = durationHours * 4.5 * intensityFactor;
  const symptomPenalty = input.symptoms.length * 7;

  const rawScore = (airSeverityBase + durationPenalty) * groupFactor + symptomPenalty;
  const riskScore = Math.max(5, Math.min(100, Math.round(rawScore)));

  let riskLevel: HealthAssessmentResult['riskLevel'] = 'Rendah';
  let riskColorHex = '#16A34A';
  let recommendedMask = 'Masker Medis 3-Ply (Opsional di Luar Ruang)';
  let maskFiltrationSpec = 'Efisiensi saring partikel umum >70%';
  let maxSafeOutdoorMinutes = 240;

  if (riskScore >= 82 || currentIspu >= 301) {
    riskLevel = 'Darurat Medis';
    riskColorHex = '#7F1D1D';
    recommendedMask = 'Respirator N95 / KN95 Ketat (Wajib Penuh)';
    maskFiltrationSpec = 'Filtrasi >= 95% partikel PM2.5 (Standar NIOSH N95 / GB2626)';
    maxSafeOutdoorMinutes = input.group === 'asma_ispa' || input.group === 'ibu_hamil' ? 0 : 15;
  } else if (riskScore >= 62 || currentIspu >= 201) {
    riskLevel = 'Sangat Tinggi';
    riskColorHex = '#DC2626';
    recommendedMask = 'Respirator N95 / KN95 Wajib';
    maskFiltrationSpec = 'Filtrasi >= 95% partikel halus asap gambut (<2.5 mikron)';
    maxSafeOutdoorMinutes = input.group === 'dewasa_sehat' ? 30 : 10;
  } else if (riskScore >= 40 || currentIspu >= 101) {
    riskLevel = 'Tinggi';
    riskColorHex = '#D97706';
    recommendedMask = 'Masker KN95 / KF94 Berlapis Rapat';
    maskFiltrationSpec = 'Filtrasi >= 94% aerosol & partikel kabut asap';
    maxSafeOutdoorMinutes = input.group === 'dewasa_sehat' ? 60 : 25;
  } else if (riskScore >= 22 || currentIspu >= 51) {
    riskLevel = 'Waspada';
    riskColorHex = '#0284C7';
    recommendedMask = 'Masker Medis 3-Ply atau KF94';
    maskFiltrationSpec = 'Perlindungan dasar debu dan partikel sedang';
    maxSafeOutdoorMinutes = 120;
  }

  const requiresImmediateMedicalConsult =
    input.symptoms.includes('sesak_napas') ||
    (input.group === 'asma_ispa' && currentIspu >= 201 && input.symptoms.length > 0);

  const actionSteps: string[] = [];

  if (maxSafeOutdoorMinutes === 0) {
    actionSteps.push(
      'Tetap berada 100% di dalam Ruang Bersih (Clean Air Room) dengan pintu dan ventilasi tertutup rapat.'
    );
  } else {
    actionSteps.push(
      `Batasi durasi keluar ruangan maksimal ${maxSafeOutdoorMinutes} menit dan hindari aktivitas fisik berat.`
    );
  }

  actionSteps.push(
    `Gunakan ${recommendedMask} setiap kali membuka pintu keluar atau berkendara.`
  );

  if (input.group === 'asma_ispa') {
    actionSteps.push(
      'Siapkan inhaler bronkodilator (reliever) di saku dan pantau saturasi oksigen (SpO2 >= 95%).'
    );
  } else if (input.group === 'ibu_hamil' || input.group === 'anak_lansia') {
    actionSteps.push(
      'Nyalakan penjernih udara (HEPA H13) di kamar tidur untuk mencegah hipoksia ringan dan iritasi saluran napas.'
    );
  }

  if (input.symptoms.length > 0) {
    actionSteps.push(
      'Bilas rongga hidung dengan larutan NaCl 0,9% serta teteskan air mata buatan steril untuk meredakan iritasi.'
    );
  }

  if (requiresImmediateMedicalConsult) {
    actionSteps.push(
      'PERHATIAN MEDIS: Gejala sesak napas pada kondisi asap pekat memerlukan pemeriksaan segera di Posko Oksigen / Puskesmas terdekat.'
    );
  }

  const summaryAdvice =
    maxSafeOutdoorMinutes === 0
      ? 'Kondisi udara sangat membahayakan profil kesehatan Anda. Dilarang beraktivitas di luar ruangan.'
      : `Pada tingkat ISPU ${currentIspu} (${currentPm25} µg/m³ PM2.5), batas paparan luar ruang Anda adalah ${maxSafeOutdoorMinutes} menit menggunakan ${recommendedMask}.`;

  return {
    riskScore,
    riskLevel,
    riskColorHex,
    recommendedMask,
    maskFiltrationSpec,
    maxSafeOutdoorMinutes,
    summaryAdvice,
    actionSteps,
    requiresImmediateMedicalConsult,
  };
}

export function calculateChecklistProgress(
  items: ChecklistItem[],
  completedIds: string[]
): {
  completedCount: number;
  totalCount: number;
  percentage: number;
  statusLabel: string;
} {
  const totalCount = items.length;
  if (totalCount === 0) {
    return {
      completedCount: 0,
      totalCount: 0,
      percentage: 0,
      statusLabel: 'Belum Siap',
    };
  }

  const validSet = new Set(completedIds);
  const completedCount = items.filter((item) => validSet.has(item.id)).length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  let statusLabel = 'Kesiapsiagaan Awal';
  if (percentage === 100) {
    statusLabel = 'Siaga Penuh (Ruang Bersih Siap)';
  } else if (percentage >= 65) {
    statusLabel = 'Cukup Siap';
  } else if (percentage >= 30) {
    statusLabel = 'Perlu Dilengkapi';
  } else {
    statusLabel = 'Rentan Paparan Asap';
  }

  return {
    completedCount,
    totalCount,
    percentage,
    statusLabel,
  };
}
