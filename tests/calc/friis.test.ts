import { describe, it, expect } from 'vitest';
import { friisCalc, friisRangeCurve } from '../../src/calc/friis';
import type { FriisInputs } from '../../src/calc/friis';
import { magloopCalc } from '../../src/calc/magloop';

const r = magloopCalc({
  fMHz: 14.15, loopDiameterM: 1.0, shape: 'circle',
  conductorId: 'cu_tube_22', turns: 1, spacingRatio: 3.0,
  txPowerW: 100, extLossOhm: 0, height: 1.5, groundType: 'free',
});

const BASE: FriisInputs = { distanceKm: 10, rxGainDbi: 1.76, plf: 1.0, feedLossDb: 0 };

describe('friisCalc', () => {
  it('returns finite values for normal inputs', () => {
    const f = friisCalc(r, 100, BASE);
    expect(isFinite(f.Pr_dBm)).toBe(true);
    expect(isFinite(f.Pr_W)).toBe(true);
    expect(isFinite(f.FSPL_dB)).toBe(true);
    expect(isFinite(f.Efield)).toBe(true);
  });

  it('increasing distance lowers received power', () => {
    const close = friisCalc(r, 100, { ...BASE, distanceKm: 1 });
    const far   = friisCalc(r, 100, { ...BASE, distanceKm: 100 });
    expect(far.Pr_dBm).toBeLessThan(close.Pr_dBm);
  });

  it('quadrupling TX power raises Pr_dBm by 6 dB', () => {
    const r100 = friisCalc(r, 100, BASE);
    const r400 = friisCalc(r, 400, BASE);
    expect(r400.Pr_dBm).toBeCloseTo(r100.Pr_dBm + 6, 1);
  });

  it('feed loss subtracts dB-for-dB from Pr_dBm', () => {
    const no   = friisCalc(r, 100, { ...BASE, feedLossDb: 0 });
    const with3 = friisCalc(r, 100, { ...BASE, feedLossDb: 3 });
    expect(with3.Pr_dBm).toBeCloseTo(no.Pr_dBm - 3, 1);
  });

  it('FSPL identity: FSPL = 20·log10(4πd/λ)', () => {
    const dist_m = BASE.distanceKm * 1000;
    const f = friisCalc(r, 100, BASE);
    expect(f.FSPL_dB).toBeCloseTo(20 * Math.log10(4 * Math.PI * dist_m / r.lambda), 8);
  });

  it('PLF_dB = 0 when plf = 1 (perfect polarisation alignment)', () => {
    const f = friisCalc(r, 100, { ...BASE, plf: 1.0 });
    expect(f.PLF_dB).toBeCloseTo(0, 8);
  });

  it('plf = 0 returns -99 sentinel in PLF_dB field', () => {
    const f = friisCalc(r, 100, { ...BASE, plf: 0 });
    expect(f.PLF_dB).toBe(-99);
  });

  it('plf = 0 uses -60 dB (not -99) in Pr_dBm calculation — documents the sentinel gap', () => {
    const f0 = friisCalc(r, 100, { ...BASE, plf: 0   });
    const f1 = friisCalc(r, 100, { ...BASE, plf: 1.0 });
    // PLF_dB returned is -99, but the calculation internally uses -60
    expect(f1.Pr_dBm - f0.Pr_dBm).toBeCloseTo(60, 1);
  });

  it('Pr_W matches Pr_dBm: W = 10^((dBm-30)/10)', () => {
    const f = friisCalc(r, 100, BASE);
    expect(f.Pr_W).toBeCloseTo(Math.pow(10, (f.Pr_dBm - 30) / 10), 10);
  });

  it('Efield > 0 for positive TX power', () => {
    expect(friisCalc(r, 100, BASE).Efield).toBeGreaterThan(0);
  });

  it('passes Pt_W and feedLoss_dB through unchanged', () => {
    const f = friisCalc(r, 75, { ...BASE, feedLossDb: 2 });
    expect(f.Pt_W).toBe(75);
    expect(f.feedLoss_dB).toBe(2);
  });
});

describe('friisRangeCurve', () => {
  it('returns 12 labels and 12 data points', () => {
    const { labels, data } = friisRangeCurve(r, 100, BASE);
    expect(labels.length).toBe(12);
    expect(data.length).toBe(12);
  });

  it('received power decreases monotonically with distance', () => {
    const { data } = friisRangeCurve(r, 100, BASE);
    for (let i = 1; i < data.length; i++) {
      expect(data[i]).toBeLessThan(data[i - 1]);
    }
  });

  it('first label is 100m, last label is 1000km', () => {
    const { labels } = friisRangeCurve(r, 100, BASE);
    expect(labels[0]).toBe('100m');
    expect(labels[labels.length - 1]).toBe('1000km');
  });

  it('all data values are finite', () => {
    const { data } = friisRangeCurve(r, 100, BASE);
    data.forEach(v => expect(isFinite(v)).toBe(true));
  });

  it('curve value at 10 km matches friisCalc at the same distance', () => {
    // distances[5] = 10 km
    const curve   = friisRangeCurve(r, 100, BASE);
    const direct  = friisCalc(r, 100, { ...BASE, distanceKm: 10 });
    expect(curve.data[5]).toBeCloseTo(direct.Pr_dBm, 4);
  });
});
