import { describe, it, expect } from 'vitest';
import { noiseCalc, noiseCurve } from '../../src/calc/noise';
import { magloopCalc } from '../../src/calc/magloop';
import type { CalcResult } from '../../src/calc/magloop';

const r = magloopCalc({
  fMHz: 14.15, loopDiameterM: 1.0, shape: 'circle',
  conductorId: 'cu_tube_22', turns: 1, spacingRatio: 3.0,
  txPowerW: 100, extLossOhm: 0, height: 1.5, groundType: 'free',
});

describe('noiseCalc', () => {
  it('returns finite values', () => {
    const n = noiseCalc(r, 5000);
    expect(isFinite(n.TA)).toBe(true);
    expect(isFinite(n.Tohm)).toBe(true);
    expect(isFinite(n.NF_dB)).toBe(true);
  });

  it('TA identity: TA = η × Tscene + (1 − η) × 290', () => {
    const n = noiseCalc(r, 5000);
    expect(n.TA).toBeCloseTo(r.eta_fraction * 5000 + (1 - r.eta_fraction) * 290, 8);
  });

  it('Tohm identity: Tohm = (1 − η) × 290', () => {
    const n = noiseCalc(r, 5000);
    expect(n.Tohm).toBeCloseTo((1 - r.eta_fraction) * 290, 8);
  });

  it('NF_dB identity: NF = 10·log10(1 + TA/290)', () => {
    const n = noiseCalc(r, 5000);
    expect(n.NF_dB).toBeCloseTo(10 * Math.log10(1 + n.TA / 290), 8);
  });

  it('tScene passes through unchanged', () => {
    expect(noiseCalc(r, 3000).Tscene).toBe(3000);
  });

  it('higher scene temperature increases NF', () => {
    const lo = noiseCalc(r, 300);
    const hi = noiseCalc(r, 10000);
    expect(hi.NF_dB).toBeGreaterThan(lo.NF_dB);
  });

  it('η = 1 (perfect efficiency) makes TA ≈ Tscene', () => {
    const perfect = { ...r, eta_fraction: 1.0 } as CalcResult;
    expect(noiseCalc(perfect, 5000).TA).toBeCloseTo(5000, 8);
  });

  it('η = 0 (zero efficiency) makes TA = 290 K (physical temperature)', () => {
    const zero = { ...r, eta_fraction: 0.0 } as CalcResult;
    expect(noiseCalc(zero, 5000).TA).toBeCloseTo(290, 8);
  });
});

describe('noiseCurve', () => {
  it('returns 21 points (0 % to 100 % in 5 % steps)', () => {
    const { labels, data } = noiseCurve(5000);
    expect(labels.length).toBe(21);
    expect(data.length).toBe(21);
  });

  it('labels run from 0% to 100%', () => {
    const { labels } = noiseCurve(5000);
    expect(labels[0]).toBe('0%');
    expect(labels[labels.length - 1]).toBe('100%');
  });

  it('at 0% efficiency TA = 290 K', () => {
    expect(noiseCurve(5000).data[0]).toBeCloseTo(290, 8);
  });

  it('at 100% efficiency TA = tScene', () => {
    const data = noiseCurve(5000).data;
    expect(data[data.length - 1]).toBeCloseTo(5000, 8);
  });

  it('TA increases with efficiency when tScene > 290 K', () => {
    // Substituting cold ohmic noise (290 K) with hot sky noise (10 000 K) raises TA.
    const { data } = noiseCurve(10000);
    for (let i = 1; i < data.length; i++) {
      expect(data[i]).toBeGreaterThan(data[i - 1]);
    }
  });

  it('TA decreases with efficiency when tScene < 290 K (cold sky)', () => {
    // Quiet sky (50 K) is cooler than the physical resistor — higher η improves noise.
    const { data } = noiseCurve(50);
    for (let i = 1; i < data.length; i++) {
      expect(data[i]).toBeLessThan(data[i - 1]);
    }
  });
});
