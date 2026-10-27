import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getIspuCategoryInfo,
  calculateHourlyReading,
  assessPersonalHealthRisk,
  calculateChecklistProgress,
} from './airQualityEngine';
import { REGIONS_DATA, READINESS_CHECKLIST } from '../data/karhutlaData';

test('getIspuCategoryInfo maps standard Permen LHK ISPU thresholds accurately', () => {
  assert.equal(getIspuCategoryInfo(35).category, 'Baik');
  assert.equal(getIspuCategoryInfo(85).category, 'Sedang');
  assert.equal(getIspuCategoryInfo(160).category, 'Tidak Sehat');
  assert.equal(getIspuCategoryInfo(250).category, 'Sangat Tidak Sehat');
  assert.equal(getIspuCategoryInfo(342).category, 'Berbahaya');
});

test('calculateHourlyReading computes dynamic hourly ISPU, pollutants, and district statuses', () => {
  const palangkaRaya = REGIONS_DATA[0];
  const morningReading = calculateHourlyReading(palangkaRaya, 2); // 02:00 WIB (multiplier 0.68)
  const peakAfternoonReading = calculateHourlyReading(palangkaRaya, 16); // 16:00 WIB (multiplier 1.06)

  assert.equal(morningReading.hourFormatted, '02:00 WIB');
  assert.equal(peakAfternoonReading.hourFormatted, '16:00 WIB');
  assert.ok(
    peakAfternoonReading.ispuScore > morningReading.ispuScore,
    'Peak afternoon ISPU should exceed early morning ISPU'
  );
  assert.ok(
    peakAfternoonReading.visibilityMeters < morningReading.visibilityMeters,
    'Visibility should drop when smoke concentration rises'
  );
  assert.equal(
    peakAfternoonReading.districts.length,
    palangkaRaya.districts.length
  );
});

test('assessPersonalHealthRisk elevates risk and prescribes N95 for vulnerable groups in hazardous air', () => {
  const resultHealthyLow = assessPersonalHealthRisk(
    {
      group: 'dewasa_sehat',
      outdoorDurationHours: 0.5,
      activityIntensity: 'ringan',
      symptoms: [],
    },
    75,
    38
  );

  const resultAsthmaHazardous = assessPersonalHealthRisk(
    {
      group: 'asma_ispa',
      outdoorDurationHours: 2,
      activityIntensity: 'sedang',
      symptoms: ['sesak_napas', 'batuk_kering'],
    },
    342,
    248.4
  );

  assert.ok(resultAsthmaHazardous.riskScore > resultHealthyLow.riskScore);
  assert.equal(resultAsthmaHazardous.riskLevel, 'Darurat Medis');
  assert.equal(resultAsthmaHazardous.maxSafeOutdoorMinutes, 0);
  assert.equal(resultAsthmaHazardous.requiresImmediateMedicalConsult, true);
  assert.ok(resultAsthmaHazardous.recommendedMask.includes('N95'));
});

test('calculateChecklistProgress computes accurate completion percentage and readiness status', () => {
  const emptyProgress = calculateChecklistProgress(READINESS_CHECKLIST, []);
  assert.equal(emptyProgress.percentage, 0);
  assert.equal(emptyProgress.completedCount, 0);

  const allIds = READINESS_CHECKLIST.map((item) => item.id);
  const fullProgress = calculateChecklistProgress(READINESS_CHECKLIST, allIds);
  assert.equal(fullProgress.percentage, 100);
  assert.equal(fullProgress.statusLabel, 'Siaga Penuh (Ruang Bersih Siap)');
});
