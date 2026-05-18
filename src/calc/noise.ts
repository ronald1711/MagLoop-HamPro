import type { CalcResult } from './magloop';

export interface NoiseResult {
  TA: number; Tohm: number; Tscene: number; NF_dB: number;
}

export function noiseCalc(r: CalcResult, tScene: number): NoiseResult {
  const Tphys = 290;
  const eta = r.eta_fraction;
  const TA = eta * tScene + (1 - eta) * Tphys;
  const Tohm = (1 - eta) * Tphys;
  const NF_dB = 10 * Math.log10(1 + TA / 290);
  return { TA, Tohm, Tscene: tScene, NF_dB };
}

export function noiseCurve(tScene: number) {
  const etaVals = Array.from({ length: 21 }, (_, i) => i * 5);
  const data = etaVals.map(e => (e / 100) * tScene + (1 - e / 100) * 290);
  return { labels: etaVals.map(e => e + '%'), data };
}
