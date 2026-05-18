import { useState } from 'react';
import type { CalcResult } from '../../calc/magloop';

interface Props { results: CalcResult; }

interface CheckItem {
  id: string;
  text: string;
  detail?: string;
  level: 'ok' | 'warn' | 'danger';
  dynamic?: (r: CalcResult) => string | undefined;
}

interface Section {
  title: string;
  items: CheckItem[];
}

const SECTIONS: Section[] = [
  {
    title: 'Mechanische constructie',
    items: [
      { id: 'm1', text: 'Lus is perfecte cirkel of vierkant (geen knikken)', detail: 'Onregelmatigheden in de vorm verhogen R_loop via ongelijke stroomverdeling.', level: 'warn' },
      { id: 'm2', text: 'Minimale lusdiameter ≥ 0.5m voor HF-gebruik', detail: 'Kleine lussen hebben lage efficiency op lagere banden.', level: 'warn' },
      { id: 'm3', text: 'Geleider bevestigd met UV-stabiele kunststof houders', detail: 'Vermijd metalen beugels in het nabij-veld — verhogen R_loop via inductieve koppeling.', level: 'ok' },
      { id: 'm4', text: 'Cellflex coax: buigradius ≥ 25 cm gerespecteerd', detail: 'Kleinere buigradius beschadigt het aluminium buitenscherm onherstelbaar.', level: 'warn' },
      { id: 'm5', text: 'Condensator behuizing waterdicht (IP54+) voor outdoor', detail: 'Vochtigheid verlaagt doorslag-spanning en veroorzaakt oxidatie op contacten.', level: 'danger' },
    ],
  },
  {
    title: 'Geleider & Verbindingen',
    items: [
      { id: 'g1', text: 'Alle RF-verbindingen zijn gesoldeerd of gelast', detail: 'Schroefklemmen: overgangsWeerstand 50–200 mΩ bij oxidatie → direct meetbare Q-verlies.', level: 'danger' },
      { id: 'g2', text: 'Aluminium: Noalox/Penetrox contactpasta + RVS bout', detail: 'Al-oxidelaag heeft R ≈ 10–100 Ω. Pasta breekt laag door en voorkomt hergroei.', level: 'danger' },
      { id: 'g3', text: 'Kopperingslus diameter afgestemd voor SWR ≤ 1.5:1', detail: 'Begin met D/5, pas afstand van hoofdlus aan (1–5 cm) voor minimum SWR.', level: 'ok' },
      { id: 'g4', text: 'Coaxkabel heeft ferrite bead choker (FT240-43, 5–10 beads)', detail: 'Zonder choker loopt RF-stroom op de coaxmantel terug → storingen en meetfouten.', level: 'warn' },
      { id: 'g5', text: 'Conductoroppervlak is schoon en oxidatievrij', detail: 'Oxidatielaag op Cu: <5 µm effect. Op Al: direct probleem.', level: 'ok' },
    ],
  },
  {
    title: 'Condensator',
    items: [
      { id: 'c1', text: 'Condensator V-rating ≥ V_cap (RMS) × 1.5 × √2 (piek)', detail: 'Veiligheidsfactor 1.5 op de piekspanning. Lees de spec-sheet.', level: 'danger', dynamic: r => `Vereist: ≥ ${(r.VcapKV * 1.5 * 1.414).toFixed(1)} kV piek (bij ${r.txPowerEffective}W)` },
      { id: 'c2', text: 'C-bereik condensator dekt C_tune_req', detail: 'Controleer of de maximale capaciteit van de condensator bereikbaar is.', level: 'warn', dynamic: r => `C_req = ${r.CpF_req > 0 ? r.CpF_req.toFixed(1) : 'ONMOGELIJK'} pF` },
      { id: 'c3', text: 'Condensator as is RF-geïsoleerd (Teflon/ceramiek lager)', detail: 'Metalen as geleidt RF naar motorbehuizing → verliezen en storingen.', level: 'warn' },
      { id: 'c4', text: 'Motorbekabeling heeft ferrite beads', detail: 'Motordraden lopen in het RF-veld → pickupen RF en storen de motor.', level: 'warn' },
      { id: 'c5', text: 'Condensator mechanisch stabiel bij windbelasting', detail: 'Trillingen veroorzaken detuning. Gebruik stijve bevestiging.', level: 'ok' },
    ],
  },
  {
    title: 'Meting & Afstemming',
    items: [
      { id: 'a1', text: 'SWR gemeten met antenne in uiteindelijke positie', detail: 'Omgeving (muren, metaal) beïnvloedt afstemming significant.', level: 'ok' },
      { id: 'a2', text: 'Resonantiefrequentie gecontroleerd met VNA of dip-meter', detail: 'SWR-meter alleen is onvoldoende — meet R + jX om echt op resonantie te zijn.', level: 'warn' },
      { id: 'a3', text: 'Bandbreedte gemeten en overeenkomend met berekening', detail: 'Te smalle BW wijst op te hoge Q (goed!) of verborgen verlies (slecht!).', level: 'ok', dynamic: r => `Verwacht: ${r.BWkHz.toFixed(2)} kHz BW` },
      { id: 'a4', text: 'Handeffect gecontroleerd (afstand verandert niet SWR)', detail: 'Hand binnen 30 cm van de lus → capacitief detunen. Normaal bij hoge Q.', level: 'ok', dynamic: r => r.BWkHz < 5 ? 'Extra kritisch bij BW < 5 kHz' : undefined },
    ],
  },
  {
    title: 'Veiligheid',
    items: [
      { id: 'v1', text: 'Veiligheidsafstand gerespecteerd tijdens TX', detail: 'ICNIRP H-veld limiet. Staat nooit in het nabij-veld van een zendende lus.', level: 'danger', dynamic: r => `Min. ${(r.safeDistM * 1.5).toFixed(1)} m afstand (×1.5 marge bij ${r.txPowerEffective}W)` },
      { id: 'v2', text: 'Condensator nooit aanraken tijdens TX', detail: 'V_cap kan honderden tot duizenden volt zijn. RF-verbrandingen zijn ernstig.', level: 'danger', dynamic: r => `V_cap = ${r.VcapKV.toFixed(2)} kV RMS = ${(r.VcapKV*1.414).toFixed(2)} kV piek` },
      { id: 'v3', text: 'Indoor gebruik: TX > 10W alleen met voldoende ruimte', detail: 'Kleine ruimtes: H-veld boven ICNIRP limiet mogelijk. Open raam of gebruik QRP.', level: 'danger', dynamic: r => `Veiligheidszone r = ${(r.safeDistM * 1.5).toFixed(1)} m` },
      { id: 'v4', text: 'Lus niet in de buurt van metalen gas- of waterleidingen', detail: 'Geïnduceerde stromen in leidingen → brand- of korrosierisico bij hoog vermogen.', level: 'danger' },
      { id: 'v5', text: 'Bij onweer: antenne losgekoppeld van zender', detail: 'Open lus met hoge Q is een goede onweersvanger.', level: 'danger' },
    ],
  },
];

const LEVEL_STYLE: Record<string, { bg: string; border: string; icon: string }> = {
  ok:     { bg: 'rgba(63,185,80,0.06)',   border: 'var(--c-success)', icon: '○' },
  warn:   { bg: 'rgba(210,153,34,0.06)',  border: 'var(--c-warn)',    icon: '△' },
  danger: { bg: 'rgba(248,81,73,0.06)',   border: 'var(--c-danger)',  icon: '⚠' },
};

export default function TabBuild({ results }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setChecked(c => ({ ...c, [id]: !c[id] }));
  const toggleExp = (id: string) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const totalItems = SECTIONS.flatMap(s => s.items).length;
  const doneItems = Object.values(checked).filter(Boolean).length;
  const dangerItems = SECTIONS.flatMap(s => s.items).filter(i => i.level === 'danger' && !checked[i.id]).length;
  const pct = Math.round(doneItems / totalItems * 100);

  return (
    <div>
      <div className="section-title">Constructie Checklist</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ flex: 1, background: 'var(--border)', borderRadius: 4, height: 8 }}>
          <div style={{ width: `${pct}%`, background: pct === 100 ? 'var(--c-success)' : 'var(--c-primary)', height: 8, borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: 'var(--c-primary)', whiteSpace: 'nowrap' }}>
          {doneItems}/{totalItems} ({pct}%)
        </span>
        {dangerItems > 0 && (
          <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: 'var(--c-danger)', whiteSpace: 'nowrap' }}>
            ⚠ {dangerItems} veiligheids-items open
          </span>
        )}
        <button onClick={() => setChecked({})}
          style={{ fontSize: 9, padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', color: 'var(--muted)', fontFamily: 'Share Tech Mono' }}>
          Reset
        </button>
      </div>

      {SECTIONS.map(section => (
        <div key={section.title} style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: 'var(--c-primary)', marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid var(--border)' }}>
            {section.title}
          </div>
          {section.items.map(item => {
            const done = !!checked[item.id];
            const open = !!expanded[item.id];
            const style = LEVEL_STYLE[item.level];
            const dynamicText = item.dynamic?.(results);
            return (
              <div key={item.id} style={{ border: `1px solid ${done ? 'var(--border)' : style.border}`, borderRadius: 5, marginBottom: 5, background: done ? 'rgba(0,0,0,0.1)' : style.bg, opacity: done ? 0.6 : 1, transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={done} onChange={() => toggle(item.id)}
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--c-primary)' }} />
                  <span style={{ flex: 1, fontSize: 11, textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--muted)' : 'var(--text)' }}>
                    <span style={{ color: done ? 'var(--muted)' : (item.level === 'danger' ? 'var(--c-danger)' : item.level === 'warn' ? 'var(--c-warn)' : 'var(--c-success)'), marginRight: 6 }}>{style.icon}</span>
                    {item.text}
                  </span>
                  {dynamicText && !done && (
                    <span style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: item.level === 'danger' ? 'var(--c-danger)' : 'var(--c-warn)', whiteSpace: 'nowrap' }}>{dynamicText}</span>
                  )}
                  {(item.detail) && (
                    <span onClick={e => { e.stopPropagation(); toggleExp(item.id); }}
                      style={{ color: 'var(--muted)', fontSize: 10, cursor: 'pointer', padding: '0 4px' }}>
                      {open ? '▲' : '▼'}
                    </span>
                  )}
                </div>
                {open && item.detail && (
                  <div style={{ padding: '0 10px 8px 36px', fontSize: 10, color: 'var(--muted)', lineHeight: 1.6 }}>
                    {item.detail}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div className="info-box" style={{ marginTop: 8, fontSize: 10, fontFamily: 'Share Tech Mono' }}>
        <div style={{ color: 'var(--c-primary)', marginBottom: 4 }}>HUIDIGE KRITIEKE PARAMETERS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <div>V_cap RMS: {results.VcapKV.toFixed(2)} kV → piek: {(results.VcapKV * 1.414).toFixed(2)} kV</div>
          <div>Min. veiligheidsafstand: {(results.safeDistM * 1.5).toFixed(1)} m (×1.5 marge)</div>
          <div>C_req: {results.CpF_req > 0 ? results.CpF_req.toFixed(1) + ' pF' : 'ONMOGELIJK'}</div>
          <div>Bandbreedte: {results.BWkHz.toFixed(2)} kHz</div>
        </div>
      </div>
    </div>
  );
}
