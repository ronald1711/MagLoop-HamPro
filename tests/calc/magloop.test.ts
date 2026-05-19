import { describe, it, expect } from 'vitest';
import { magloopCalc, groundBoostCurve } from '../../src/calc/magloop';
import type { CalcInputs } from '../../src/calc/magloop';
import { C0 } from '../../src/calc/constants';

// Clean baseline: free space, no extra loss — maximises formula transparency.
const FREE: CalcInputs = {
  fMHz: 14.15,
  loopDiameterM: 1.0,
  shape: 'circle',
  conductorId: 'cu_tube_22',
  turns: 1,
  spacingRatio: 3.0,
  txPowerW: 100,
  extLossOhm: 0,
  height: 1.5,
  groundType: 'free',
};

describe('magloopCalc', () => {
  describe('golden path — 1m circle @ 14.15 MHz, free space', () => {
    const r = magloopCalc(FREE);

    it('all primary outputs are finite and positive', () => {
      for (const key of ['L_uH', 'Q', 'Rtotal', 'XL', 'CpF', 'BWkHz', 'eta', 'safeDistM'] as const) {
        expect(isFinite(r[key]) && r[key] > 0, `${key} must be finite and positive`).toBe(true);
      }
    });

    it('inductance is approximately 2.45 µH', () => {
      expect(r.L_uH).toBeCloseTo(2.448, 1);
    });

    it('identifies small-loop regime (plam < 0.2)', () => {
      expect(r.regime).toBe('small');
      expect(r.plam).toBeLessThan(0.2);
    });

    it('Q > 100 for a copper-tube loop', () => {
      expect(r.Q).toBeGreaterThan(100);
    });

    it('free-space ground loss is zero', () => {
      expect(r.Re_gnd).toBe(0);
    });

    it('Q identity: Q = XL / Rtotal', () => {
      expect(r.Q).toBeCloseTo(r.XL / r.Rtotal, 8);
    });

    it('efficiency identity: eta_fraction = Rrad / Rtotal', () => {
      expect(r.eta_fraction).toBeCloseTo(r.Rrad / r.Rtotal, 10);
    });

    it('eta = eta_fraction × 100', () => {
      expect(r.eta).toBeCloseTo(r.eta_fraction * 100, 10);
    });

    it('gain identity: G_lin = eta_fraction × 1.5', () => {
      expect(r.G_lin).toBeCloseTo(r.eta_fraction * 1.5, 10);
    });

    it('G_dBi = 10·log10(G_lin)', () => {
      expect(r.G_dBi).toBeCloseTo(10 * Math.log10(r.G_lin), 8);
    });

    it('bandwidth identity: BWkHz = (fMHz × 1000) / Q', () => {
      expect(r.BWkHz).toBeCloseTo((FREE.fMHz * 1000) / r.Q, 8);
    });

    it('capacitor voltage identity: VcapKV = (Ia × XL) / 1000', () => {
      expect(r.VcapKV).toBeCloseTo((r.Ia * r.XL) / 1000, 8);
    });

    it('loop current identity: Ia = sqrt(txPower / Rtotal)', () => {
      expect(r.Ia).toBeCloseTo(Math.sqrt(FREE.txPowerW / r.Rtotal), 8);
    });

    it('Aem = 3λ²/(8π)', () => {
      expect(r.Aem).toBeCloseTo(3 * r.lambda * r.lambda / (8 * Math.PI), 8);
    });

    it('Zin_res = Rtotal + XL²/Rtotal', () => {
      expect(r.Zin_res).toBeCloseTo(r.Rtotal + (r.XL * r.XL) / r.Rtotal, 4);
    });

    it('C_self_pF is positive', () => {
      expect(r.C_self_pF).toBeGreaterThan(0);
    });

    it('CpF_req = CpF − C_self_pF', () => {
      expect(r.CpF_req).toBeCloseTo(r.CpF - r.C_self_pF, 8);
    });

    it('AFmax = 1 for free space (Gamma = 0 clamps to 1)', () => {
      expect(r.AFmax).toBe(1);
    });

    it('steps array is non-empty, each entry has label / formula / value', () => {
      expect(r.steps.length).toBeGreaterThan(5);
      r.steps.forEach(s => {
        expect(s.label.length).toBeGreaterThan(0);
        expect(s.formula.length).toBeGreaterThan(0);
        expect(s.value.length).toBeGreaterThan(0);
      });
    });

    it('no step value contains NaN or Infinity', () => {
      r.steps.forEach(s => {
        expect(s.value, `step "${s.label}" must not contain NaN`).not.toContain('NaN');
        expect(s.value, `step "${s.label}" must not contain Infinity`).not.toContain('Infinity');
      });
    });
  });

  describe('regime transitions', () => {
    it('large loop (C/λ ≥ 0.5) is classified as large', () => {
      // D = 10m → perimeter ≈ 31.4m, λ ≈ 21.2m → Clam ≈ 1.48
      const r = magloopCalc({ ...FREE, loopDiameterM: 10 });
      expect(r.regime).toBe('large');
      expect(r.plam).toBeGreaterThanOrEqual(0.5);
    });

    it('large-loop Rrad (60π²·Clam) is much larger than small-loop value', () => {
      const r = magloopCalc({ ...FREE, loopDiameterM: 10 });
      expect(r.Rrad).toBeGreaterThan(10);
    });

    it('intermediate loop (0.2 ≤ C/λ < 0.5) is classified as intermediate', () => {
      // D = 2m → Clam ≈ 0.30
      const r = magloopCalc({ ...FREE, loopDiameterM: 2.0 });
      expect(r.regime).toBe('intermediate');
      expect(r.plam).toBeGreaterThanOrEqual(0.2);
      expect(r.plam).toBeLessThan(0.5);
    });

    it('regime switches from intermediate to large exactly at C/λ = 0.5 boundary', () => {
      const lambda = C0 / (FREE.fMHz * 1e6);
      const D_boundary = 0.5 * lambda / Math.PI; // diameter giving Clam = 0.5
      const below = magloopCalc({ ...FREE, loopDiameterM: D_boundary * 0.999 });
      const above = magloopCalc({ ...FREE, loopDiameterM: D_boundary * 1.001 });
      expect(below.regime).toBe('intermediate');
      expect(above.regime).toBe('large');
    });
  });

  describe('multi-turn (N > 1)', () => {
    it('N=3 has higher inductance than N=1', () => {
      const r1 = magloopCalc(FREE);
      const r3 = magloopCalc({ ...FREE, turns: 3 });
      expect(r3.L_uH).toBeGreaterThan(r1.L_uH);
    });

    it('N=3 has lower Q than N=1 (proximity + Rrad scales faster than XL)', () => {
      const r1 = magloopCalc(FREE);
      const r3 = magloopCalc({ ...FREE, turns: 3 });
      expect(r3.Q).toBeLessThan(r1.Q);
    });

    it('multi-turn result has no NaN or Infinity in steps', () => {
      const r = magloopCalc({ ...FREE, turns: 3 });
      r.steps.forEach(s => {
        expect(s.value).not.toContain('NaN');
        expect(s.value).not.toContain('Infinity');
      });
    });
  });

  describe('square shape', () => {
    it('area = side²', () => {
      const r = magloopCalc({ ...FREE, shape: 'square' });
      expect(r.area_m2).toBeCloseTo(FREE.loopDiameterM ** 2, 8);
    });

    it('perimeter = 4 × side', () => {
      const r = magloopCalc({ ...FREE, shape: 'square' });
      expect(r.perimeter_m).toBeCloseTo(4 * FREE.loopDiameterM, 8);
    });

    it('produces finite positive Q', () => {
      const r = magloopCalc({ ...FREE, shape: 'square' });
      expect(isFinite(r.Q) && r.Q > 0).toBe(true);
    });
  });

  describe('ground effects', () => {
    it('free space gives Re_gnd = 0 at very low height', () => {
      const r = magloopCalc({ ...FREE, groundType: 'free', height: 0.01 });
      expect(r.Re_gnd).toBe(0);
    });

    it('good ground at h < 0.1λ produces Re_gnd > 0', () => {
      // height = 0.1m, λ ≈ 21.2m → hLam ≈ 0.005 — well inside the 0.1λ threshold
      const r = magloopCalc({ ...FREE, groundType: 'good', height: 0.1 });
      expect(r.Re_gnd).toBeGreaterThan(0);
    });

    it('good ground at h ≥ 0.1λ gives Re_gnd = 0', () => {
      const lambda = C0 / (FREE.fMHz * 1e6);
      const r = magloopCalc({ ...FREE, groundType: 'good', height: 0.105 * lambda });
      expect(r.Re_gnd).toBe(0);
    });

    it('higher reflection coefficient gives higher Re_gnd (perfect > good > poor)', () => {
      const h = 0.5;
      const perfect = magloopCalc({ ...FREE, groundType: 'perfect', height: h });
      const good    = magloopCalc({ ...FREE, groundType: 'good',    height: h });
      const poor    = magloopCalc({ ...FREE, groundType: 'poor',    height: h });
      expect(perfect.Re_gnd).toBeGreaterThan(good.Re_gnd);
      expect(good.Re_gnd).toBeGreaterThan(poor.Re_gnd);
    });

    it('perfect ground at h = λ/4 gives AFmax ≈ 2', () => {
      const lambda = C0 / (FREE.fMHz * 1e6);
      const r = magloopCalc({ ...FREE, groundType: 'perfect', height: lambda / 4 });
      expect(r.AFmax).toBeCloseTo(2, 1);
    });
  });

  describe('power clamping', () => {
    it('conductor with max_pwr clamps txPowerEffective', () => {
      // al_tape_48_25um has max_pwr = 1 W
      const r = magloopCalc({ ...FREE, conductorId: 'al_tape_48_25um', txPowerW: 100 });
      expect(r.txPowerEffective).toBe(1);
    });

    it('conductor without max_pwr passes full txPower through', () => {
      const r = magloopCalc({ ...FREE, txPowerW: 100 });
      expect(r.txPowerEffective).toBe(100);
    });
  });

  describe('custom conductor', () => {
    it('custom copper conductor produces finite positive Q', () => {
      const r = magloopCalc({ ...FREE, conductorId: 'custom', customMaterial: 'cu', customDiam_mm: 30 });
      expect(isFinite(r.Q) && r.Q > 0).toBe(true);
    });

    it('aluminium has higher Rloop than copper at the same diameter', () => {
      const cu = magloopCalc({ ...FREE, conductorId: 'custom', customMaterial: 'cu', customDiam_mm: 22 });
      const al = magloopCalc({ ...FREE, conductorId: 'custom', customMaterial: 'al', customDiam_mm: 22 });
      expect(al.Rloop).toBeGreaterThan(cu.Rloop);
    });

    it('unknown conductorId falls back to cu_tube_22', () => {
      const fallback = magloopCalc({ ...FREE, conductorId: 'nonexistent_xyz' });
      const def      = magloopCalc({ ...FREE, conductorId: 'cu_tube_22' });
      expect(fallback.L_uH).toBeCloseTo(def.L_uH, 8);
    });
  });

  describe('coax conductor', () => {
    it('rg213 produces ccable_pF > 0', () => {
      const r = magloopCalc({ ...FREE, conductorId: 'rg213' });
      expect(r.ccable_pF).toBeGreaterThan(0);
    });

    it('rg213 produces a positive f_min_MHz (self-resonance warning)', () => {
      const r = magloopCalc({ ...FREE, conductorId: 'rg213' });
      expect(r.f_min_MHz).toBeGreaterThan(0);
    });
  });

  describe('safety distance', () => {
    it('safeDistM is at least 0.3 m', () => {
      expect(magloopCalc(FREE).safeDistM).toBeGreaterThanOrEqual(0.3);
    });

    it('higher TX power increases safety distance', () => {
      const hi = magloopCalc({ ...FREE, txPowerW: 100 });
      const lo = magloopCalc({ ...FREE, txPowerW: 10 });
      expect(hi.safeDistM).toBeGreaterThan(lo.safeDistM);
    });
  });
});

describe('groundBoostCurve', () => {
  it('returns the requested number of points (default 100)', () => {
    const { labels, data } = groundBoostCurve(14.15, 'good');
    expect(labels.length).toBe(100);
    expect(data.length).toBe(100);
  });

  it('honours a custom point count', () => {
    const { labels, data } = groundBoostCurve(14.15, 'good', 50);
    expect(labels.length).toBe(50);
    expect(data.length).toBe(50);
  });

  it('labels end with λ suffix', () => {
    const { labels } = groundBoostCurve(14.15, 'good', 10);
    labels.forEach(l => expect(l).toMatch(/λ$/));
  });

  it('all data values are finite', () => {
    const { data } = groundBoostCurve(14.15, 'good');
    data.forEach(v => expect(isFinite(v)).toBe(true));
  });

  it('perfect ground achieves a higher peak boost than good ground', () => {
    const perfect = groundBoostCurve(14.15, 'perfect');
    const good    = groundBoostCurve(14.15, 'good');
    expect(Math.max(...perfect.data)).toBeGreaterThan(Math.max(...good.data));
  });
});
