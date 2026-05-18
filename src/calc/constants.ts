export const MU0 = 4 * Math.PI * 1e-7;
export const EPS0 = 8.854e-12;
export const C0 = 299792458;
export const ETA0 = 376.73;
export const KB = 1.38e-23;

export const BANDS = [1.85, 3.6, 7.1, 10.12, 14.15, 18.1, 21.2, 24.94, 28.5];
export const BAND_NAMES = ['160m', '80m', '40m', '30m', '20m', '17m', '15m', '12m', '10m'];

export interface BandPreset {
  label: string;
  f: number;
  low: number;
  high: number;
}

export const BAND_PRESETS: BandPreset[] = [
  { label: '160m', f: 1.85,  low: 1.8,    high: 2.0    },
  { label: '80m',  f: 3.6,   low: 3.5,    high: 3.8    },
  { label: '40m',  f: 7.1,   low: 7.0,    high: 7.2    },
  { label: '30m',  f: 10.12, low: 10.1,   high: 10.15  },
  { label: '20m',  f: 14.15, low: 14.0,   high: 14.35  },
  { label: '17m',  f: 18.1,  low: 18.068, high: 18.168 },
  { label: '15m',  f: 21.2,  low: 21.0,   high: 21.45  },
  { label: '12m',  f: 24.94, low: 24.89,  high: 24.99  },
  { label: '10m',  f: 28.5,  low: 28.0,   high: 29.7   },
];

export const GND_REFL: Record<string, number> = {
  perfect: 1.0,
  good:    0.82,
  poor:    0.50,
  free:    0.0,
};

export type ConductorCat = 'round_tube' | 'flat_strip' | 'coax_outer' | 'flex_duct';

export interface ConductorDef {
  label: string;
  cat: ConductorCat;
  rho: number;
  circ_eff: number;
  Rs_corr: number;
  max_pwr: number | null;
  C_per_m?: number;
  d_equiv_m: number;
  notes: string[];
}

const _PI = Math.PI;

export const CONDUCTORS: Record<string, ConductorDef> = {
  cu_tube_15:       { label: 'Cu buis 15mm',       cat: 'round_tube', rho: 1.724e-8, circ_eff: _PI*0.015,          Rs_corr: 1.00, max_pwr: null,             d_equiv_m: 0.015,               notes: [] },
  cu_tube_22:       { label: 'Cu buis 22mm',       cat: 'round_tube', rho: 1.724e-8, circ_eff: _PI*0.022,          Rs_corr: 1.00, max_pwr: null,             d_equiv_m: 0.022,               notes: [] },
  al_tube_15:       { label: 'Al buis 15mm',       cat: 'round_tube', rho: 2.650e-8, circ_eff: _PI*0.015,          Rs_corr: 1.00, max_pwr: null,             d_equiv_m: 0.015,               notes: ['al_warning'] },
  al_tube_22:       { label: 'Al buis 22mm',       cat: 'round_tube', rho: 2.650e-8, circ_eff: _PI*0.022,          Rs_corr: 1.00, max_pwr: null,             d_equiv_m: 0.022,               notes: ['al_warning'] },
  al_strip_30x2:    { label: 'Al strip 30x2mm',    cat: 'flat_strip', rho: 2.650e-8, circ_eff: _PI*0.015,          Rs_corr: 1.00, max_pwr: null,             d_equiv_m: 0.030,               notes: ['al_warning', 'strip_crowding'] },
  al_strip_30x4:    { label: 'Al strip 30x4mm',    cat: 'flat_strip', rho: 2.650e-8, circ_eff: _PI*0.015,          Rs_corr: 1.00, max_pwr: null,             d_equiv_m: 0.030,               notes: ['al_warning', 'strip_crowding'] },
  al_strip_50x2:    { label: 'Al strip 50x2mm',    cat: 'flat_strip', rho: 2.650e-8, circ_eff: _PI*0.025,          Rs_corr: 1.00, max_pwr: null,             d_equiv_m: 0.050,               notes: ['al_warning', 'strip_crowding'] },
  al_strip_50x4:    { label: 'Al strip 50x4mm',    cat: 'flat_strip', rho: 2.650e-8, circ_eff: _PI*0.025,          Rs_corr: 1.00, max_pwr: null,             d_equiv_m: 0.050,               notes: ['al_warning', 'strip_crowding'] },
  al_tape_48_25um:  { label: 'Al tape 48mm/25um',  cat: 'flat_strip', rho: 2.650e-8, circ_eff: _PI*0.024,          Rs_corr: 1.30, max_pwr: 1,                d_equiv_m: 0.048,               notes: ['tape_thin', 'al_warning'] },
  al_tape_48_50um:  { label: 'Al tape 48mm/50um',  cat: 'flat_strip', rho: 2.650e-8, circ_eff: _PI*0.024,          Rs_corr: 1.00, max_pwr: 5,                d_equiv_m: 0.048,               notes: ['tape_qrp', 'al_warning'] },
  al_tape_50_25um:  { label: 'Al tape 50mm/25um',  cat: 'flat_strip', rho: 2.650e-8, circ_eff: _PI*0.025,          Rs_corr: 1.30, max_pwr: 1,                d_equiv_m: 0.050,               notes: ['tape_thin', 'al_warning'] },
  al_tape_50_50um:  { label: 'Al tape 50mm/50um',  cat: 'flat_strip', rho: 2.650e-8, circ_eff: _PI*0.025,          Rs_corr: 1.00, max_pwr: 5,                d_equiv_m: 0.050,               notes: ['tape_qrp', 'al_warning'] },
  al_tape_75_25um:  { label: 'Al tape 75mm/25um',  cat: 'flat_strip', rho: 2.650e-8, circ_eff: _PI*0.0375,         Rs_corr: 1.30, max_pwr: 1,                d_equiv_m: 0.075,               notes: ['tape_thin', 'al_warning'] },
  al_tape_75_50um:  { label: 'Al tape 75mm/50um',  cat: 'flat_strip', rho: 2.650e-8, circ_eff: _PI*0.0375,         Rs_corr: 1.00, max_pwr: 5,                d_equiv_m: 0.075,               notes: ['tape_qrp', 'al_warning'] },
  al_tape_100_25um: { label: 'Al tape 100mm/25um', cat: 'flat_strip', rho: 2.650e-8, circ_eff: _PI*0.050,          Rs_corr: 1.30, max_pwr: 1,                d_equiv_m: 0.100,               notes: ['tape_thin', 'al_warning'] },
  al_tape_100_50um: { label: 'Al tape 100mm/50um', cat: 'flat_strip', rho: 2.650e-8, circ_eff: _PI*0.050,          Rs_corr: 1.00, max_pwr: 5,                d_equiv_m: 0.100,               notes: ['tape_qrp', 'al_warning'] },
  cu_tape_50_35um:  { label: 'Cu tape 50mm/35um',  cat: 'flat_strip', rho: 1.724e-8, circ_eff: _PI*0.025,          Rs_corr: 1.15, max_pwr: 5,                d_equiv_m: 0.050,               notes: ['tape_qrp'] },
  rg213:            { label: 'RG213/U',             cat: 'coax_outer', rho: 1.810e-8, circ_eff: _PI*0.01030,        Rs_corr: 1.05, max_pwr: null, C_per_m: 100e-12,  d_equiv_m: 0.01030, notes: ['coax_topo', 'ccable_check'] },
  lmr400:           { label: 'LMR-400',             cat: 'coax_outer', rho: 2.650e-8, circ_eff: _PI*0.01029,        Rs_corr: 1.00, max_pwr: null, C_per_m: 78.4e-12, d_equiv_m: 0.01029, notes: ['al_warning', 'coax_topo', 'ccable_check'] },
  cellflex_78:      { label: 'Cellflex 7/8\"',     cat: 'coax_outer', rho: 1.724e-8, circ_eff: _PI*0.025,          Rs_corr: 1.00, max_pwr: null, C_per_m: 74e-12,   d_equiv_m: 0.025,   notes: ['coax_topo', 'ccable_check', 'large_bend'] },
  ivc_flex_100:     { label: 'IVC flex 100mm',      cat: 'flex_duct',  rho: 2.650e-8, circ_eff: _PI*0.100*0.35,     Rs_corr: 1.00, max_pwr: 10,               d_equiv_m: 0.100,               notes: ['flex_duct_warn'] },
  ivc_flex_125:     { label: 'IVC flex 125mm',      cat: 'flex_duct',  rho: 2.650e-8, circ_eff: _PI*0.125*0.35,     Rs_corr: 1.00, max_pwr: 10,               d_equiv_m: 0.125,               notes: ['flex_duct_warn'] },
};

export type NoteLevel = 'info' | 'warn' | 'danger';

export interface ConductorNote {
  level: NoteLevel;
  text: string;
}

export const CONDUCTOR_NOTES: Record<string, ConductorNote> = {
  al_warning:      { level: 'warn',   text: 'Aluminium: niet soldeerbaar. Gebruik RVS bout + Noalox/Penetrox contactpasta.' },
  strip_crowding:  { level: 'info',   text: 'Stroom crowding aan stripkanten: effectieve circ = π×breedte/2. Dikte heeft geen RF-effect boven ~3× huiddiepte.' },
  tape_thin:       { level: 'danger', text: 'Tape te dun (circa skin depth bij LF): Rs verhoogd x1.3. Max 1W TX vermogen.' },
  tape_qrp:        { level: 'warn',   text: 'Tape-conductor: mechanisch kwetsbaar. Max 5W QRP vermogen aanbevolen.' },
  coax_topo:       { level: 'info',   text: 'Coax als lusgeleider: buitengeleider als RF-geleider (N=1 outer only of N=2 series).' },
  ccable_check:    { level: 'warn',   text: 'C_cable afgetrokken van C_tune_required. Controleer f_min_self_res en C_tune_req bij hoge banden.' },
  large_bend:      { level: 'info',   text: 'Cellflex minimale buigradius 250mm. Praktische lusdiameter minimaal ~0.55m.' },
  flex_duct_warn:  { level: 'danger', text: 'Spiraalnaad verhoogt weerstand 3-10x. Berekening INDICATIEF. Niet aanbevolen voor TX gebruik.' },
  steel_warning:   { level: 'warn',   text: 'Staal: ρ≈1×10⁻⁷ Ω·m (5-6× slechter dan Cu). Hoge verliesWeerstand, lage Q. Alleen voor demonstratie.' },
};
