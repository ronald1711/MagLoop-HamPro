import { C0 } from './constants';
import type { CalcResult } from './magloop';

export interface FriisInputs {
  distanceKm: number;
  rxGainDbi: number;
  plf: number;
  feedLossDb: number;
}

export interface FriisResult {
  Pt_W: number;
  feedLoss_dB: number;
  Gt_dBi: number;
  FSPL_dB: number;
  PLF_dB: number;
  Gr_dBi: number;
  Pr_dBm: number;
  Pr_W: number;
  Efield: number;
}

export function friisCalc(r: CalcResult, txPowerW: number, inp: FriisInputs): FriisResult {
  const lambda = r.lambda;
  const dist_m = inp.distanceKm * 1000;
  const FSPL_dB = 20 * Math.log10(4 * Math.PI * dist_m / lambda);
  const PLF_dB = inp.plf > 0 ? 10 * Math.log10(inp.plf) : -99;
  const Pr_dBm =
    10 * Math.log10(txPowerW * 1000) - inp.feedLossDb + r.G_dBi -
    FSPL_dB + (inp.plf > 0 ? PLF_dB : -60) + inp.rxGainDbi;
  const Pr_W = Math.pow(10, (Pr_dBm - 30) / 10);
  const Pt_eff = txPowerW * Math.pow(10, r.G_dBi / 10) * Math.pow(10, -inp.feedLossDb / 10);
  const Efield = Math.sqrt(60 * Pt_eff) / dist_m;
  return { Pt_W: txPowerW, feedLoss_dB: inp.feedLossDb, Gt_dBi: r.G_dBi,
    FSPL_dB, PLF_dB, Gr_dBi: inp.rxGainDbi, Pr_dBm, Pr_W, Efield };
}

export function friisRangeCurve(r: CalcResult, txPowerW: number, inp: FriisInputs) {
  const lambda = r.lambda;
  const distances = [0.1,0.5,1,2,5,10,20,50,100,200,500,1000];
  const PLF_dB = inp.plf > 0 ? 10 * Math.log10(inp.plf) : -60;
  const data = distances.map(d => {
    const FSPL = 20 * Math.log10(4 * Math.PI * d * 1000 / lambda);
    return 10*Math.log10(txPowerW*1000) - inp.feedLossDb + r.G_dBi - FSPL + PLF_dB + inp.rxGainDbi;
  });
  return { labels: distances.map(d => d >= 1 ? d+'km' : d*1000+'m'), data };
}
