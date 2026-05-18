import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { magloopCalc } from '../../calc/magloop';
import type { useCalculator } from '../../hooks/useCalculator';

type Calc = ReturnType<typeof useCalculator>;
interface Props { calc: Calc; }

const MONO = 'Share Tech Mono';
const GRID = 'rgba(48,54,61,0.8)';
const TICK = { color: '#8b949e', font: { family: MONO, size: 9 } };

function makeOpts(yLabel: string, yColor: string): any {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: TICK, grid: { color: GRID }, title: { display: true, text: yLabel, color: yColor, font: { family: MONO, size: 9 } } },
      x: { ticks: { ...TICK, maxTicksLimit: 10 }, grid: { color: GRID }, title: { display: true, text: 'Diameter (m)', color: '#8b949e', font: { family: MONO, size: 9 } } },
    },
  };
}

export default function TabOptimizer({ calc }: Props) {
  const { inputs, results } = calc;

  const N = 60;
  const diams = Array.from({ length: N }, (_, i) => 0.2 + (3.0 - 0.2) * i / (N - 1));
  const sweep = useMemo(
    () => diams.map(d => magloopCalc({ ...inputs, loopDiameterM: d })),
    [inputs]
  );

  const labels = diams.map(d => d.toFixed(2));
  const etas = sweep.map(r => r.eta);
  const qs = sweep.map(r => r.Q);
  const vcaps = sweep.map(r => r.VcapKV);
  const bws = sweep.map(r => r.BWkHz);

  const curIdx = Math.round((inputs.loopDiameterM - 0.2) / (3.0 - 0.2) * (N - 1));
  const ci = Math.max(0, Math.min(N - 1, curIdx));
  function markerAt<T>(arr: T[]): (T | null)[] {
    return arr.map((v, i) => i === ci ? v : null);
  }

  const maxEtaIdx = etas.indexOf(Math.max(...etas));
  const maxQIdx = qs.indexOf(Math.max(...qs));
  const minVcapIdx = vcaps.indexOf(Math.min(...vcaps.filter(v => v > 0)));
  const maxBwIdx = bws.indexOf(Math.max(...bws));

  function mkDataset(data: (number|null)[], color: string, fill = true) {
    return { data, borderColor: color, backgroundColor: color + (fill ? '22' : ''), fill, tension: 0.3, pointRadius: 0 };
  }
  function mkMarker(data: (number|null)[], color: string) {
    return { data, borderColor: color, backgroundColor: color, pointRadius: 7, showLine: false };
  }
  function mkOptMarker(arr: number[], idx: number, color: string) {
    return { data: arr.map((v, i) => i === idx ? v : null), borderColor: color, backgroundColor: color, pointRadius: 9, showLine: false, pointStyle: 'star' };
  }

  return (
    <div>
      <div className="section-title">Ontwerp Optimizer — Diameter Sweep</div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 12 }}>
        Sweep van 0.2 tot 3.0m diameter bij huidige frequentie ({inputs.fMHz.toFixed(3)} MHz) en geleider. Rode stip = huidig, ster = optimum.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 16 }}>
        {[
          {
            label: 'Max η — Hoogste efficiëntie',
            d: diams[maxEtaIdx], val: etas[maxEtaIdx]?.toFixed(2) + ' %', color: '#3fb950',
            explain: 'De grootst mogelijke lus levert hier de beste efficiëntie: R_rad groeit met D⁴ terwijl R_loop slechts ∝ D toeneemt. Kies dit als zendprestaties prioriteit hebben. Let op: V_cap stijgt ook — controleer condensatorrating!',
          },
          {
            label: 'Max Q — Scherpste selectiviteit',
            d: diams[maxQIdx], val: 'Q = ' + Math.round(qs[maxQIdx]).toString(), color: '#58a6ff',
            explain: 'Hoge Q = smalle bandbreedte = beste ruisonderdrukking voor ontvangst. BW = f/Q. Kleine diameter geeft hogere Q maar ten koste van efficiëntie. Ideaal voor RX-gebruik of contestantennes waarbij signaalscheiding belangrijk is.',
          },
          {
            label: 'Min V_cap — Laagste condensatorbelasting',
            d: diams[minVcapIdx], val: vcaps[minVcapIdx]?.toFixed(2) + ' kV RMS', color: '#d2a8ff',
            explain: 'Smaller diameter → lagere inductantie L → lagere X_L → lagere reactieve spanning V_cap = I·X_L. Gebruik dit punt als je condensator een beperkte spanningsrating heeft, of als je hoog vermogen wil zenden zonder dure HV-condensator.',
          },
          {
            label: 'Max BW — Breedste bandbreedte',
            d: diams[maxBwIdx], val: bws[maxBwIdx]?.toFixed(2) + ' kHz', color: '#ffa657',
            explain: 'Hogere BW = minder kritische afstemming = makkelijker in gebruik. BW = f/Q, dus lage Q geeft brede BW. Handig voor SSB of als je niet elke kHz wil hercalibreren. Kost wel efficiëntie. Overweeg een motorische condensator bij BW < 3 kHz.',
          },
        ].map(item => (
          <div key={item.label} className="stat-card" style={{ cursor: 'default' }}>
            <span className="stat-label" style={{ fontSize: 9 }}>{item.label}</span>
            <span className="stat-val" style={{ fontSize: 20, color: item.color }}>{item.d?.toFixed(2)} m</span>
            <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: MONO }}>{item.val}</span>
            <div style={{ marginTop: 6, fontSize: 10, color: 'var(--muted)', lineHeight: 1.5, borderTop: '1px solid var(--border)', paddingTop: 6 }}>
              {item.explain}
            </div>
          </div>
        ))}
      </div>

      <div className="chart-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: MONO, color: '#3fb950', marginBottom: 4 }}>
            Efficiëntie η (%) — huidig: {results.eta.toFixed(2)}%
          </div>
          <div className="chart-row-height" style={{ height: 160 }}>
            <Line data={{ labels, datasets: [mkDataset(etas, '#3fb950'), mkMarker(markerAt(etas), '#f78166'), mkOptMarker(etas, maxEtaIdx, '#3fb950')] }} options={makeOpts('η (%)', '#3fb950')} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontFamily: MONO, color: '#58a6ff', marginBottom: 4 }}>
            Q-Factor — huidig: {Math.round(results.Q)}
          </div>
          <div className="chart-row-height" style={{ height: 160 }}>
            <Line data={{ labels, datasets: [mkDataset(qs, '#58a6ff'), mkMarker(markerAt(qs), '#f78166'), mkOptMarker(qs, maxQIdx, '#58a6ff')] }} options={makeOpts('Q', '#58a6ff')} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontFamily: MONO, color: '#d2a8ff', marginBottom: 4 }}>
            V_cap (kV) — huidig: {results.VcapKV.toFixed(2)} kV
          </div>
          <div className="chart-row-height" style={{ height: 160 }}>
            <Line data={{ labels, datasets: [mkDataset(vcaps, '#d2a8ff'), mkMarker(markerAt(vcaps), '#f78166'), mkOptMarker(vcaps, minVcapIdx, '#d2a8ff')] }} options={makeOpts('V_cap (kV)', '#d2a8ff')} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontFamily: MONO, color: '#ffa657', marginBottom: 4 }}>
            Bandbreedte BW (kHz) — huidig: {results.BWkHz.toFixed(2)} kHz
          </div>
          <div className="chart-row-height" style={{ height: 160 }}>
            <Line data={{ labels, datasets: [mkDataset(bws, '#ffa657'), mkMarker(markerAt(bws), '#f78166'), mkOptMarker(bws, maxBwIdx, '#ffa657')] }} options={makeOpts('BW (kHz)', '#ffa657')} />
          </div>
        </div>
      </div>

      <div className="info-box" style={{ marginTop: 16, fontSize: 10, fontFamily: MONO }}>
        <div style={{ color: 'var(--c-primary)', marginBottom: 6 }}>DESIGN RICHTLIJNEN</div>
        <div>• Grotere lus: hogere η en Q, maar hogere V_cap — kies condensator navenant</div>
        <div>• Hogere frequentie: η stijgt sterk (R_rad ∝ f⁴) — meest effect op korte banden</div>
        <div>• Praktisch maximum diameter: begrensd door beschikbare ruimte en V_cap rating</div>
        <div>• Huidige lus: {inputs.loopDiameterM.toFixed(2)} m — η={results.eta.toFixed(2)}%, Q={Math.round(results.Q)}, V_cap={results.VcapKV.toFixed(2)} kV @ {inputs.txPowerW} W</div>
      </div>
    </div>
  );
}
