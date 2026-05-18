import type { CalcStep } from '../../calc/magloop';

interface Props { steps: CalcStep[]; }

export default function TabSteps({ steps }: Props) {
  return (
    <div>
      <div className="section-title">Berekeningsstappen — Volledige workflow</div>
      <div className="info-box" style={{ marginBottom: 12 }}>
        Elke stap toont de gebruikte formule en de berekende waarde voor de huidige instellingen.
        Rs = oppervlakteweerstand (Ω/□), delta = huiddiepte.
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="steps-table">
          <thead>
            <tr>
              <th className="step-num">#</th>
              <th>Grootheid</th>
              <th>Formule</th>
              <th style={{ textAlign: "right" }}>Waarde</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s, i) => (
              <tr key={i}>
                <td className="step-num">{i + 1}</td>
                <td className="step-label">{s.label}</td>
                <td className="step-formula"><code>{s.formula}</code></td>
                <td className="step-value">{s.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
