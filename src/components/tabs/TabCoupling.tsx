import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { vswrCurve } from '../../calc/magloop';
import type { useCalculator } from '../../hooks/useCalculator';

type Calc = ReturnType<typeof useCalculator>;
interface Props { calc: Calc; }
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="coupling-row"><span className="coupling-key">{k}</span><span className="coupling-val">{v}</span></div>;
}
function Badge({ color, text }: { color: string; text: string }) {
  return <span style={{ background: color + '22', color, border: `1px solid ${color}55`, borderRadius: 4, padding: '1px 6px', fontSize: 10, fontFamily: 'Share Tech Mono' }}>{text}</span>;
}

type Method = 'faraday' | 'capacitive' | 'gamma';

const METHODS: { id: Method; label: string; badge: string; color: string }[] = [
  { id: 'faraday',    label: 'Faraday (inductief)',     badge: 'AANBEVOLEN', color: 'var(--c-success)' },
  { id: 'capacitive', label: 'Capacitieve koppeling',   badge: 'ALTERNATIEF', color: 'var(--c-primary)' },
  { id: 'gamma',      label: 'Gamma match',              badge: 'COMPACT',    color: 'var(--c-warn)' },
];

const OPTS: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => `VSWR: ${context.parsed.y.toFixed(2)}`
      }
    }
  },
  scales: {
    y: {
      min: 1.0,
      max: 10.0,
      ticks: { color: "#8b949e", font: { family: "Share Tech Mono", size: 10 } },
      grid: { color: "rgba(48,54,61,0.8)" },
      title: { display: true, text: "VSWR", color: "#8b949e", font: { family: "Share Tech Mono", size: 9 } }
    },
    x: {
      ticks: { color: "#8b949e", font: { family: "Share Tech Mono", size: 9 }, maxTicksLimit: 7 },
      grid: { color: "rgba(48,54,61,0.8)" },
      title: { display: true, text: "Frequentie (MHz)", color: "#8b949e", font: { family: "Share Tech Mono", size: 9 } }
    },
  },
};

export default function TabCoupling({ calc }: Props) {
  const { results: r, inputs } = calc;
  const [method, setMethod] = useState<Method>('faraday');

  // Faraday optimal diameter for 50Ω match
  const coupDiam_opt = r.coupDiam; // D/5 default
  const coupDiam_50 = r.Zin_res > 50 ? r.coupDiam * Math.sqrt(50 / r.Zin_res) * Math.sqrt(r.Zin_res / 50) : r.coupDiam;
  const Z_coup_d5 = (r.coupDiam / (r.coupDiam * 5)) ** 2 * r.Zin_res; // (d_coup/D)² × Zin
  const coupDiam_match = Math.sqrt(50 / r.Zin_res) * r.coupDiam * 5;

  // Gamma match: fractional position along loop where impedance = 50Ω
  const gammaPos_m = r.coupDiam * 5 * Math.sqrt(50 / r.Zin_res) / Math.PI;

  const curve = vswrCurve(inputs, r, 100);

  const chartData = {
    labels: curve.map(p => p.fMHz.toFixed(4)),
    datasets: [
      {
        label: "VSWR",
        borderColor: "#58a6ff",
        backgroundColor: "rgba(88,166,255,0.05)",
        fill: true,
        tension: 0.2,
        data: curve.map(p => p.vswr),
        pointRadius: 0,
      }
    ]
  };

  return (
    <div>
      <div className="section-title">Koppelingslus &amp; Voedingsmethode</div>

      {/* Method selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {METHODS.map(m => (
          <button key={m.id}
            onClick={() => setMethod(m.id)}
            aria-pressed={method === m.id}
            aria-label={`${m.label} — ${m.badge}`}
            style={{
              flex: 1, padding: '8px 6px', borderRadius: 6, cursor: 'pointer', border: `1px solid ${method === m.id ? m.color : 'var(--border)'}`,
              background: method === m.id ? m.color + '18' : 'var(--surface)', color: method === m.id ? m.color : 'var(--muted)',
              fontFamily: 'Share Tech Mono', fontSize: 10, transition: 'all 0.15s'
            }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 8, opacity: 0.8 }} aria-hidden="true">{m.badge}</div>
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        <div>
          {method === 'faraday' && (
            <div className="coupling-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, width: "100%" }}>
              <div className="coupling-card" style={{ width: "100%" }}>
                <h4>Faraday / Inductieve koppeling</h4>
                <Row k="Principe" v="Magnetisch inductief gekoppelde kleine lus binnen de hoofdlus" />
                <Row k="Diameter standaard (D/5)" v={<span style={{ color: 'var(--c-primary)' }}>{(r.coupDiam * 100).toFixed(1)} cm</span>} />
                <Row k="Diameter voor 50Ω match" v={<span style={{ color: 'var(--c-success)' }}>{(coupDiam_match * 100).toFixed(1)} cm</span>} />
                <Row k="Afstand tot hoofdlus" v="1–3 cm (afstelbaar)" />
                <Row k="Galvanische scheiding" v={<Badge color="var(--c-success)" text="JA — geen common mode" />} />
                <Row k="Multi-band" v={<Badge color="var(--c-success)" text="JA — zelfde koppellus" />} />
                <Row k="Extra afstemknop" v={<Badge color="var(--c-success)" text="GEEN" />} />
                <Row k="Common-mode isolatie" v="Uitstekend — coax-mantelstroom <1 mA typisch" />
              </div>
              <div className="coupling-card" style={{ width: "100%" }}>
                <h4>Impedantietransformatie</h4>
                <Row k="Z_in resonantie" v={`${Math.round(r.Zin_res)} Ω`} />
                <Row k="Transformatie n²" v={`${r.transN2.toFixed(1)}:1`} />
                <Row k="Lusstroom I_a" v={`${r.Ia.toFixed(2)} A`} />
                <Row k="Magnetisch moment m" v={`${r.magMoment.toFixed(3)} A·m²`} />
                <div style={{ marginTop: 10, padding: 8, background: 'var(--surface)', borderRadius: 4, fontSize: 10, color: 'var(--muted)', fontFamily: 'Share Tech Mono' }}>
                  <div style={{ color: 'var(--c-primary)', marginBottom: 4 }}>FORMULE</div>
                  <div>Z_coup ≈ (d_coup/D)² × Z_in</div>
                  <div style={{ marginTop: 4 }}>Voor 50Ω: d_coup = D × √(50/Z_in) = {(coupDiam_match * 100).toFixed(0)} cm</div>
                  <div style={{ marginTop: 4 }}>Begin met D/5 = {(coupDiam_opt * 100).toFixed(0)} cm, stel afstand in voor SWR minimum</div>
                </div>
              </div>
            </div>
          )}

          {method === 'capacitive' && (
            <div className="coupling-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, width: "100%" }}>
              <div className="coupling-card" style={{ width: "100%" }}>
                <h4>Capacitieve koppeling (Army / Paterson)</h4>
                <Row k="Principe" v="Split in hoofdlus → twee halve lussen capacitief gekoppeld" />
                <Row k="Koppelcondensator" v="10–100 pF variabel (afstelbaar)" />
                <Row k="Galvanische scheiding" v={<Badge color="var(--c-warn)" text="GEDEELTELIJK" />} />
                <Row k="Multi-band" v={<Badge color="var(--c-warn)" text="NEE — per band afstemmen" />} />
                <Row k="Extra afstemknop" v={<Badge color="var(--c-danger)" text="JA — koppelcondensator" />} />
                <Row k="Voordeel" v="Compacter dan Faraday voor kleine lusdiameters" />
              </div>
              <div className="coupling-card" style={{ width: "100%" }}>
                <h4>Werkingsprincipe</h4>
                <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.8 }}>
                  <p>De hoofdlus wordt op één punt gesplit. Aan beide kanten van de spleet worden aftakkingen gemaakt die via een variabele condensator worden verbonden met de coax.</p>
                  <p>De koppelcondensator regelt de impedantietransformatie. Bij lagere waarden stijgt de impedantie, bij hogere daalt deze.</p>
                  <p><strong style={{ color: 'var(--c-warn)' }}>Nadeel:</strong> vereist twee afstemelementen (C_tune + C_coup). Minder galvanische isolatie dan Faraday. Niet aanbevolen voor QRO.</p>
                  <div style={{ marginTop: 8, fontFamily: 'Share Tech Mono', fontSize: 9, color: 'var(--c-primary)' }}>
                    Z_in = {Math.round(r.Zin_res)} Ω → koppelcapaciteit ≈ 1/(ω×√(Z_in×50)) = {(1/(r.XL/r.L_uH/1e-6*Math.sqrt(r.Zin_res*50))*1e12).toFixed(1)} pF
                  </div>
                </div>
              </div>
            </div>
          )}

          {method === 'gamma' && (
            <div className="coupling-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, width: "100%" }}>
              <div className="coupling-card" style={{ width: "100%" }}>
                <h4>Gamma Match</h4>
                <Row k="Principe" v="Directe aftakking op de hoofdlus op punt waar Z ≈ 50 Ω" />
                <Row k="Tapppunt positie" v={<span style={{ color: 'var(--c-warn)' }}>{(gammaPos_m * 100).toFixed(1)} cm vanaf voedingspunt</span>} />
                <Row k="Gamma arm lengte" v="Typisch 15–30% van lusomtrek" />
                <Row k="Galvanische scheiding" v={<Badge color="var(--c-danger)" text="GEEN — DC-verbonden" />} />
                <Row k="Multi-band" v={<Badge color="var(--c-danger)" text="NEE" />} />
                <Row k="Extra afstemknop" v={<Badge color="var(--c-danger)" text="JA — gamma condensator" />} />
                <Row k="Voordeel" v="Zeer compact, geen aparte lus nodig" />
              </div>
              <div className="coupling-card" style={{ width: "100%" }}>
                <h4>Gamma Match berekening</h4>
                <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.8 }}>
                  <p>Het gamma-punt is de positie langs de lus waar de weerstand gelijk is aan de bronimpedantie (50 Ω). De reactantie wordt weggestemd met de gamma-condensator.</p>
                  <p>Tappositie ≈ {(gammaPos_m * 100).toFixed(0)} cm langs de lus vanaf het voedingspunt.</p>
                  <p><strong style={{ color: 'var(--c-warn)' }}>Nadeel:</strong> geen galvanische scheiding → common-mode stroom op coaxmantel. Ferrite bead choker vereist. Gevoelig voor verstelling bij aanraking.</p>
                  <div style={{ marginTop: 8, fontFamily: 'Share Tech Mono', fontSize: 9, color: 'var(--c-primary)' }}>
                    Approx: pos = (D/π) × √(50/Z_in) = {(gammaPos_m * 100).toFixed(0)} cm
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="coupling-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h4>VSWR vs Frequentie Offset</h4>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: 'var(--muted)', marginBottom: 8 }}>
            Sweep bereik: ±5 × Bandbreedte (±{(r.BWkHz * 5).toFixed(1)} kHz) &bull; Bandbreedte: {r.BWkHz.toFixed(2)} kHz
          </div>
          <div style={{ flex: 1, minHeight: 220, height: '100%', maxHeight: 350 }}>
            <Line data={chartData} options={OPTS} />
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="info-box" style={{ marginTop: 14 }}>
        <div style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: 'var(--c-primary)', marginBottom: 8 }}>VERGELIJKINGSTABEL</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, fontFamily: 'Share Tech Mono' }}>
          <caption className="sr-only">Vergelijking van koppelingmethoden: galvanische scheiding, multiband-geschiktheid, aantal afstemknoppen, QRO-geschiktheid en aanbeveling</caption>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th scope="col" style={{ textAlign: 'left', padding: '3px 6px' }}>Methode</th>
              <th scope="col" style={{ textAlign: 'center', padding: '3px 4px' }}>Galv. sch.</th>
              <th scope="col" style={{ textAlign: 'center', padding: '3px 4px' }}>Multi-band</th>
              <th scope="col" style={{ textAlign: 'center', padding: '3px 4px' }}>Knoppen</th>
              <th scope="col" style={{ textAlign: 'center', padding: '3px 4px' }}>QRO</th>
              <th scope="col" style={{ textAlign: 'left', padding: '3px 4px' }}>Aanbeveling</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Faraday', galv: '✓', multi: '✓', knobs: '1', qro: '✓', rec: 'Beste keuze', color: 'var(--c-success)' },
              { name: 'Capacitief', galv: '~', multi: '✗', knobs: '2', qro: '~', rec: 'QRP alternatief', color: 'var(--c-primary)' },
              { name: 'Gamma', galv: '✗', multi: '✗', knobs: '2', qro: '✗', rec: 'Compact, choker!', color: 'var(--c-warn)' },
              { name: 'Ferriet trafo', galv: '✓', multi: '✓', knobs: '1', qro: '✗', rec: 'Max 100W', color: 'var(--muted)' },
            ].map(row => (
              <tr key={row.name} style={{ borderBottom: '1px solid var(--border)', background: method === row.name.toLowerCase().replace(' ', '') ? row.color + '11' : undefined }}>
                <th scope="row" style={{ padding: '3px 6px', color: row.color, textAlign: 'left', fontWeight: 'normal' }}>{row.name}</th>
                <td style={{ textAlign: 'center', padding: '3px 4px', color: row.galv === '✓' ? 'var(--c-success)' : row.galv === '✗' ? 'var(--c-danger)' : 'var(--c-warn)' }}>{row.galv}</td>
                <td style={{ textAlign: 'center', padding: '3px 4px', color: row.multi === '✓' ? 'var(--c-success)' : 'var(--c-danger)' }}>{row.multi}</td>
                <td style={{ textAlign: 'center', padding: '3px 4px' }}>{row.knobs}</td>
                <td style={{ textAlign: 'center', padding: '3px 4px', color: row.qro === '✓' ? 'var(--c-success)' : row.qro === '✗' ? 'var(--c-danger)' : 'var(--c-warn)' }}>{row.qro}</td>
                <td style={{ padding: '3px 4px', color: 'var(--muted)' }}>{row.rec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
