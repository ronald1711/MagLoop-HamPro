import type { CalcResult } from "../calc/magloop";
interface Props { results: CalcResult; }
interface CardDef {
  id: string; label: string; value: (r: CalcResult) => string;
  color: string; formula: string; tip: string;
}
const CARDS: CardDef[] = [
  { id:"eta",   label:"Efficientie %",    color:"var(--c-success)",
    formula:"eta = R_rad / R_tot * 100%",
    tip:"Percentage vermogen uitgestraald.",
    value: r => r.eta.toFixed(2)+"%" },
  { id:"cap",   label:"C_tune (pF)",       color:"var(--c-primary)",
    formula:"C_req = C_ideal − C_cable − C_self",
    tip:"Benodigde afstemcapaciteit na aftrek van kabelcapaciteit (C_cable) en structurele zelf-capaciteit (C_self). Op 15m/10m kan dit significant afwijken van C_ideal.",
    value: r => r.CpF_req <= 0 ? "ONMOGELIJK" : r.CpF_req.toFixed(1) },
  { id:"vcap",  label:"Vcap (kV)",        color:"var(--c-warn)",
    formula:"V = I * X_L",
    tip:"RMS spanning over de condensator bij TX-vermogen.",
    value: r => r.VcapKV.toFixed(2) },
  { id:"bw",    label:"Bandbreedte (kHz)",color:"var(--c-danger)",
    formula:"BW = f / Q",
    tip:"Scherpte van de afstemming.",
    value: r => r.BWkHz.toFixed(2) },
  { id:"q",     label:"Q Factor",         color:"var(--muted)",
    formula:"Q = X_L / R_tot",
    tip:"Hoge Q = smal maar efficient.",
    value: r => Math.round(r.Q).toString() },
  { id:"gain",  label:"Gain G (dBi)",     color:"var(--c-success)",
    formula:"G = eta * D0 (Balanis 2-46)",
    tip:"Absolute gain t.o.v. isotrope straler.",
    value: r => r.G_dBi.toFixed(2)+" dBi" },
  { id:"dir",   label:"Directiviteit D0", color:"var(--c-success)",
    formula:"D0 = 1.5 = 1.76 dBi (Balanis 5-31)",
    tip:"Richtkarakteristiek kleine lus.",
    value: r => r.regime==="small"?"1.76 dBi":r.D0_dBi.toFixed(2)+" dBi" },
  { id:"safe",  label:"Veiligheidsafst.",  color:"var(--c-warn)",
    formula:"R = ∛(m / 4π·H_lim)  [ICNIRP 0.073 A/m]",
    tip:"Minimale veiligheidsafstand op basis van H-veld (ICNIRP 1998 algemene bevolking, 3-30 MHz). Nabij-veld formule: R=∛(m/4π×0.073). Houd 1.5× veiligheidsmarge aan.",
    value: r => r.safeDistM.toFixed(1) + " m" },
  { id:"hpbw",  label:"HPBW",             color:"var(--muted)",
    formula:"HPBW = 90 deg voor sin2-patroon",
    tip:"Half-power beamwidth van de kleine lus (sin²-patroon). Altijd 90° voor een kleine lus in vrije ruimte.",
    value: () => "90 deg" },
];
export default function KpiDashboard({ results }: Props) {
  return (
    <div className="dashboard-grid">
      {CARDS.map(card => {
        const isGain = card.id === "gain";
        const gainColor = isGain
          ? (results.G_dBi > 0 ? "var(--c-success)" : results.G_dBi > -10 ? "var(--c-warn)" : "var(--c-danger)")
          : undefined;
        return (
          <div key={card.id} className="stat-card"
            style={{ borderBottom: "3px solid "+card.color }}
            title={card.tip}>
            <div className="stat-formula">{card.formula}</div>
            <span className="stat-label">{card.label}</span>
            <span className="stat-val" style={gainColor ? { color: gainColor } : undefined}>
              {card.value(results)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
