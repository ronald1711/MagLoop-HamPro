import { MU0, EPS0, C0, GND_REFL, CONDUCTORS } from './constants';
import type { ConductorCat, ConductorDef } from './constants';

export type LoopShape = 'circle' | 'square';
export type GroundType = 'perfect' | 'good' | 'poor' | 'free';

export interface CalcInputs {
  fMHz: number;
  loopDiameterM: number;
  shape: LoopShape;
  conductorId: string;
  turns: number;
  spacingRatio: number;
  txPowerW: number;
  extLossOhm: number;
  height: number;
  groundType: GroundType;
  customMaterial?: 'cu' | 'al' | 'steel';
  customDiam_mm?: number;
}

export interface CalcStep {
  label: string;
  formula: string;
  value: string;
}

export interface CalcResult {
  L_uH: number;
  area_m2: number;
  perimeter_m: number;
  condLen: number;
  skin_um: number;
  Rs_sq: number;
  circumference_m: number;
  plam: number;
  hLam: number;
  lambda: number;
  rrad_m: number;
  rloop_m: number;
  Rrad: number;
  Rloop: number;
  Re_gnd: number;
  Rtotal: number;
  XL: number;
  CpF: number;
  Q: number;
  BWkHz: number;
  eta: number;
  eta_fraction: number;
  VcapKV: number;
  Ia: number;
  txPowerEffective: number;
  ccable_pF: number;
  C_self_pF: number;
  CpF_req: number;
  f_min_MHz: number;
  conductorCat: ConductorCat;
  D0_dBi: number;
  G_dBi: number;
  G_lin: number;
  Deff_dBi: number;
  Geff_dBi: number;
  gndBoost: number;
  AFmax: number;
  Aem: number;
  le_m: number;
  coupDiam: number;
  Zin_res: number;
  transN2: number;
  magMoment: number;
  regime: 'small' | 'intermediate' | 'large';
  safeDistM: number;
  steps: CalcStep[];
  patternPoints: number[];
}

function j1(x: number): number {
  const x2 = x * x;
  let term = x / 2;
  let sum = term;
  for (let m = 1; m <= 8; m++) {
    term *= -x2 / (4 * m * (m + 1));
    sum += term;
  }
  return sum;
}

export function magloopCalc(p: CalcInputs): CalcResult {
  const steps: CalcStep[] = [];
  const f = p.fMHz * 1e6;
  const omega = 2 * Math.PI * f;
  const lambda = C0 / f;
  const k = 2 * Math.PI / lambda;

  const RHO_MAP: Record<string, number> = { cu: 1.724e-8, al: 2.650e-8, steel: 1.0e-7 };
  const cond: ConductorDef = p.conductorId === 'custom' && p.customDiam_mm
    ? {
        label: `Aangepast ${(p.customMaterial ?? 'cu').toUpperCase()} ⌀${p.customDiam_mm}mm`,
        cat: 'round_tube' as ConductorCat,
        rho: RHO_MAP[p.customMaterial ?? 'cu'] ?? 1.724e-8,
        circ_eff: Math.PI * (p.customDiam_mm / 1000),
        Rs_corr: 1.00,
        max_pwr: null,
        d_equiv_m: p.customDiam_mm / 1000,
        notes: p.customMaterial === 'al' ? ['al_warning'] : p.customMaterial === 'steel' ? ['steel_warning'] : [],
      }
    : CONDUCTORS[p.conductorId] ?? CONDUCTORS['cu_tube_22'];
  const txPower = cond.max_pwr ? Math.min(p.txPowerW, cond.max_pwr) : p.txPowerW;
  const rCond = cond.d_equiv_m / 2;

  steps.push({ label: 'Golflengte λ', formula: 'λ = c / f', value: `${(lambda * 100).toFixed(1)} cm` });

  let area: number, perimeter: number, L: number;
  const rLoop = p.loopDiameterM / 2;

  if (p.shape === 'circle') {
    area = Math.PI * rLoop * rLoop;
    perimeter = 2 * Math.PI * rLoop;
    if (p.turns === 1) {
      L = MU0 * rLoop * (Math.log(8 * rLoop / rCond) - 2);
    } else {
      const sp = p.spacingRatio * cond.d_equiv_m;
      const cl = (p.turns - 1) * sp;
      const kN = 1 / (1 + 0.9 * rLoop / (rLoop + cl / 2));
      L = kN * MU0 * Math.PI * rLoop * rLoop * p.turns * p.turns / (rLoop + cl / 2);
    }
  } else {
    const side = p.loopDiameterM;
    area = side * side;
    perimeter = 4 * side;
    L = p.turns * p.turns * (2 * MU0 * side / Math.PI) * (Math.log(side / rCond) - 0.774) * 0.95;
  }

  const condLen = perimeter * p.turns;
  steps.push({ label: 'Oppervlak A', formula: p.shape === 'circle' ? 'A = π·r²' : 'A = side²', value: `${area.toFixed(4)} m²` });
  steps.push({ label: 'Omtrek perimeter', formula: p.shape === 'circle' ? 'C = 2πr' : 'C = 4·side', value: `${perimeter.toFixed(3)} m` });
  steps.push({ label: 'Inductantie L', formula: p.turns === 1 ? 'L = µ₀r(ln(8r/a)−2)' : 'L = µ₀πr²N²/(r+cl/2)·kN', value: `${(L * 1e6).toFixed(3)} µH` });

  const Clam = perimeter / lambda;
  steps.push({ label: 'Perimeter / λ (Clam)', formula: 'Clam = C / λ', value: Clam.toFixed(4) });

  const delta = Math.sqrt(cond.rho / (Math.PI * f * MU0));
  const Rs_sq = (cond.rho / delta) * cond.Rs_corr;
  const R_per_m = Rs_sq / cond.circ_eff;

  steps.push({ label: 'Huiddiepte δ', formula: 'δ = √(ρ / πfµ₀)', value: `${(delta * 1e6).toFixed(2)} µm` });
  steps.push({ label: 'Oppervlakweerstand Rs', formula: 'Rs = (ρ/δ)·Rs_corr', value: `${(Rs_sq * 1000).toFixed(4)} mΩ/□` });

  const proxF = p.turns > 1 ? (1 + 0.117 * Math.pow(1 / p.spacingRatio, 1.5)) : 1;
  const Rloop = R_per_m * condLen * proxF;

  steps.push({ label: 'Verliesweerstand R_loop', formula: 'R = Rs·L_cond/circ·proxF', value: `${(Rloop * 1000).toFixed(2)} mΩ` });

  let ccable_pF = 0;
  if (cond.cat === 'coax_outer' && cond.C_per_m) {
    ccable_pF = cond.C_per_m * condLen * 1e12;
    steps.push({ label: 'Kabelcapaciteit C_cable', formula: 'C_cable = C_per_m × L_cond', value: `${ccable_pF.toFixed(0)} pF` });
  }

  let Rrad: number;
  if (Clam >= 0.5) {
    Rrad = 60 * Math.PI * Math.PI * Clam;
    steps.push({ label: 'Stralingsweerstand R_rad (grote lus)', formula: 'R_rad = 60π²·C/λ', value: `${(Rrad * 1000).toFixed(2)} mΩ` });
  } else {
    Rrad = 31171 * Math.pow((area * p.turns) / (lambda * lambda), 2);
    steps.push({ label: 'Stralingsweerstand R_rad (kleine lus)', formula: 'R_rad = 31171·(A·N/λ²)²', value: `${(Rrad * 1000).toFixed(4)} mΩ` });
  }

  const hLam = p.height / lambda;
  const Gamma = GND_REFL[p.groundType] ?? 0;
  const Re_gnd =
    p.groundType !== 'free' && hLam < 0.1
      ? Gamma * 0.3 * Math.exp(-hLam / 0.05)
      : 0;

  steps.push({ label: 'Hoogte h/λ', formula: 'hLam = h / λ', value: hLam.toFixed(4) });
  steps.push({ label: 'Grondverlies Re_gnd', formula: 'Re = Γ·0.3·exp(−hLam/0.05) bij hLam<0.1', value: `${Re_gnd.toFixed(4)} Ω` });

  const Rtotal = Rloop + p.extLossOhm + Re_gnd + Rrad;
  steps.push({ label: 'Totaalweerstand R_tot', formula: 'R_tot = R_loop + R_extra + Re_gnd + R_rad', value: `${(Rtotal * 1000).toFixed(3)} mΩ` });

  const XL = omega * L;
  const Q = XL / Rtotal;
  const Ia = Math.sqrt(txPower / Rtotal);
  const VcapKV = (Ia * XL) / 1000;
  const CpF = (1 / (XL * omega)) * 1e12;
  const BWkHz = (f / Q) / 1000;
  const eta = (Rrad / Rtotal) * 100;
  const eta_fraction = Rrad / Rtotal;

  // C_self = ε₀ × D_eff, waarbij D_eff = perimeter/π (= diameter voor cirkels).
  // Geverifieerd via VK3CPU SRF: 0.95m octagon → SRF 37.7 MHz → C_self ≈ 8.3 pF ≈ ε₀×D.
  const C_self_pF = EPS0 * 1e12 * (perimeter / Math.PI);
  // C_cable wordt NIET afgetrokken bij N=1 outer-only: binnengeleider is floating,
  // vormt geen directe shuntpad parallel aan de afstemcondensator.
  // Aftrekken is alleen correct bij N=2 series/parallel (toekomstige topologie-selector).
  const CpF_req = CpF - C_self_pF;

  let f_min_MHz = 0;
  if (cond.cat === 'coax_outer' && ccable_pF > 0) {
    f_min_MHz = 1 / (2 * Math.PI * Math.sqrt(L * ccable_pF * 1e-12)) / 1e6;
  }

  steps.push({ label: 'Reactantie X_L', formula: 'X_L = ωL', value: `${XL.toFixed(1)} Ω` });
  steps.push({ label: 'Q factor', formula: 'Q = X_L / R_tot', value: Q.toFixed(0) });
  steps.push({ label: 'C_tune ideaal', formula: 'C_ideal = 1 / (X_L·ω)', value: `${CpF.toFixed(1)} pF` });
  steps.push({ label: 'Struct. zelf-cap C_self', formula: 'C_self = 0.6 × D_loop [pF]', value: `${C_self_pF.toFixed(2)} pF` });
  steps.push({ label: 'C_tune benodigd', formula: 'C_req = C_ideal − C_self  (N=1: C_cable niet afgetrokken)', value: `${CpF_req.toFixed(1)} pF${CpF_req <= 0 ? ' ← ONMOGELIJK' : CpF_req < 5 ? ' ← ONPRAKTISCH' : ''}` });
  if (f_min_MHz > 0) {
    steps.push({ label: 'Zelfres. freq coax f_min', formula: 'f_min = 1/(2π√(L·C_cable))', value: `${f_min_MHz.toFixed(2)} MHz` });
  }
  steps.push({ label: 'Bandbreedte BW', formula: 'BW = f / Q', value: `${BWkHz.toFixed(2)} kHz` });
  steps.push({ label: 'Lusstroom I_A', formula: 'I = √(P / R_tot)', value: `${Ia.toFixed(2)} A` });
  steps.push({ label: 'Condensatorspanning V_cap', formula: 'V = I·X_L', value: `${VcapKV.toFixed(2)} kV` });
  steps.push({ label: 'Efficiëntie η', formula: 'η = R_rad / R_tot × 100%', value: `${eta.toFixed(2)} %` });

  if (ccable_pF > 0 && (ccable_pF + C_self_pF) > CpF * 0.3) {
    steps.push({ label: 'WAARSCHUWING C_cable+C_self', formula: '(C_cable+C_self) / C_ideal', value: `${((ccable_pF + C_self_pF) / CpF * 100).toFixed(0)}% van C_ideal` });
  }

  const D0_lin = 1.5;
  const G_lin = eta_fraction * D0_lin;
  const G_dBi = 10 * Math.log10(G_lin);
  const D0_dBi = 10 * Math.log10(D0_lin);

  steps.push({ label: 'Directiviteit D₀', formula: 'D₀ = 3/2 = 1.76 dBi (Balanis 5-31)', value: `${D0_dBi.toFixed(2)} dBi` });
  steps.push({ label: 'Gain G', formula: 'G = η × D₀ (Balanis 2-46)', value: `${G_dBi.toFixed(2)} dBi` });

  const AFmax = Gamma > 0 ? Math.abs(2 * Gamma * Math.sin(k * p.height)) : 1;
  const Deff_lin = D0_lin * Math.max(AFmax, 0.01);
  const Deff_dBi = 10 * Math.log10(Deff_lin);
  const Geff_dBi = 10 * Math.log10(eta_fraction * Deff_lin);
  const gndBoost = Deff_dBi - D0_dBi;

  steps.push({ label: 'Array factor AF (grond)', formula: 'AF = 2·Γ·|sin(k·h)|', value: AFmax.toFixed(3) });
  steps.push({ label: 'Effectieve directiviteit D_eff', formula: 'D_eff = D₀ × AF', value: `${Deff_dBi.toFixed(2)} dBi` });

  const Aem = 3 * lambda * lambda / (8 * Math.PI);
  const le_m = k * area * p.turns;
  const coupDiam = p.loopDiameterM / 5;
  const Zin_res = Rtotal + (XL * XL) / Rtotal;
  const transN2 = Zin_res / 50;
  const magMoment = Ia * area * p.turns;

  // EMF safety distance — ICNIRP 1998 general public H-field limit, 3-30 MHz: 0.073 A/m
  // Near-field (r << λ/2π): H ≈ m/(4πr³) → r_NF = ∛(m/4πH_lim)
  // Far-field (r >> λ/2π): H ≈ m·k²/(4πr) → r_FF = m·k²/(4π·H_lim)
  const H_lim = 0.073; // A/m ICNIRP
  const r_NF = Math.cbrt(magMoment / (4 * Math.PI * H_lim));
  const r_FF = magMoment * k * k / (4 * Math.PI * H_lim);
  const safeDistM = Math.max(r_NF, r_FF, 0.3);
  steps.push({ label: 'Veiligheidsafstand (ICNIRP)', formula: 'R = ∛(m/4π·H_lim)  H_lim=0.073 A/m', value: `${safeDistM.toFixed(2)} m` });

  steps.push({ label: 'Max eff. apertuur A_em', formula: 'A_em = 3λ²/(8π) (Balanis 5-32)', value: `${Aem.toFixed(3)} m²` });
  steps.push({ label: 'Eff. vectorlengte ℓ_e', formula: 'ℓe = k·A·N (Balanis 5-40)', value: `${le_m.toFixed(4)} m` });
  steps.push({ label: 'Z_in resonantie', formula: "Z'_in = R_tot + X_L²/R_tot", value: `${Math.round(Zin_res)} Ω` });

  const regime: 'small' | 'intermediate' | 'large' =
    Clam < 0.2 ? 'small' : Clam < 0.5 ? 'intermediate' : 'large';

  const patternPoints: number[] = [];
  const ka = (p.shape === 'circle') ? (2 * Math.PI * rLoop) / lambda : (perimeter / lambda);
  for (let degree = 0; degree <= 360; degree++) {
    const theta_rad = (degree * Math.PI) / 180;
    if (Clam < 0.13) {
      patternPoints.push(Math.pow(Math.sin(theta_rad), 2));
    } else {
      const peak = j1(ka);
      const val = Math.abs(peak) > 1e-6 ? Math.pow(j1(ka * Math.sin(theta_rad)) / peak, 2) : Math.pow(Math.sin(theta_rad), 2);
      patternPoints.push(val);
    }
  }

  return {
    L_uH: L * 1e6, area_m2: area, perimeter_m: perimeter, condLen,
    skin_um: delta * 1e6, Rs_sq, circumference_m: cond.circ_eff, plam: Clam, hLam, lambda,
    rrad_m: Rrad * 1000, rloop_m: Rloop * 1000, Rrad, Rloop, Re_gnd, Rtotal,
    XL, CpF, Q, BWkHz, eta, eta_fraction, VcapKV, Ia,
    txPowerEffective: txPower, ccable_pF, C_self_pF, CpF_req, f_min_MHz, conductorCat: cond.cat,
    D0_dBi, G_dBi, G_lin, Deff_dBi, Geff_dBi, gndBoost, AFmax,
    Aem, le_m, coupDiam, Zin_res, transN2, magMoment, safeDistM,
    regime, steps, patternPoints,
  };
}

export function groundBoostCurve(
  fMHz: number,
  groundType: GroundType,
  points = 100
): { labels: string[]; data: number[] } {
  const lambda = C0 / (fMHz * 1e6);
  const Gamma = GND_REFL[groundType] ?? 0;
  const labels: string[] = [];
  const data: number[] = [];
  for (let i = 0; i < points; i++) {
    const hLam = i / (points - 1);
    const h = hLam * lambda;
    const AF = Math.abs(2 * Gamma * Math.sin(2 * Math.PI * h / lambda));
    const Deff = 1.5 * Math.max(AF, 0.01);
    data.push(10 * Math.log10(Deff) - 10 * Math.log10(1.5));
    labels.push(hLam.toFixed(2) + 'λ');
  }
  return { labels, data };
}

export interface VswrPoint {
  fMHz: number;
  vswr: number;
}

export function vswrCurve(p: CalcInputs, r: CalcResult, points = 100): VswrPoint[] {
  const f0 = p.fMHz * 1e6;
  const BW = r.BWkHz * 1e3;
  const sweepRange = 5 * BW; // Sweep +/- 5 bandwidths
  const startF = Math.max(f0 - sweepRange, 1.8e6);
  const endF = f0 + sweepRange;
  const step = (endF - startF) / (points - 1);

  const curve: VswrPoint[] = [];
  const C_tune = r.CpF * 1e-12;
  const L = r.L_uH * 1e-6;
  const R_tot0 = r.Rtotal;

  for (let i = 0; i < points; i++) {
    const f = startF + i * step;
    const omega = 2 * Math.PI * f;

    // Impedance of series R-L-C loop
    const Z_loop_R = r.Rtotal; // assume Rtotal doesn't change drastically over few kHz
    const Z_loop_X = omega * L - 1 / (omega * C_tune);

    // Input impedance under Faraday loop match
    const omega0 = 2 * Math.PI * f0;
    const M2 = (50 * R_tot0) / (omega0 * omega0);
    const num = omega * omega * M2;
    const denom_mag2 = Z_loop_R * Z_loop_R + Z_loop_X * Z_loop_X;
    
    const Zin_R = (num * Z_loop_R) / denom_mag2;
    const Zin_X = -(num * Z_loop_X) / denom_mag2;

    // Reflection coefficient
    const num_re = Zin_R - 50;
    const num_im = Zin_X;
    const den_re = Zin_R + 50;
    const den_im = Zin_X;

    const num_mag = Math.sqrt(num_re * num_re + num_im * num_im);
    const den_mag = Math.sqrt(den_re * den_re + den_im * den_im);
    const gamma = den_mag > 1e-6 ? num_mag / den_mag : 0;

    let vswr = gamma < 0.999 ? (1 + gamma) / (1 - gamma) : 99.0;
    if (vswr > 10) vswr = 10; // clamp for UI plotting

    curve.push({
      fMHz: f / 1e6,
      vswr: parseFloat(vswr.toFixed(2))
    });
  }
  return curve;
}
