import { Line } from 'react-chartjs-2';
import { magloopCalc } from '../../calc/magloop';
import type { useCalculator } from '../../hooks/useCalculator';

type Calc = ReturnType<typeof useCalculator>;
interface Props { calc: Calc; }

const MONO = 'Share Tech Mono';
const GRID = 'rgba(48,54,61,0.8)';
const TICK = { color: '#8b949e', font: { family: MONO, size: 9 } };

function makeOpts(yLabel: string, yColor: string, min?: number): any {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { ...TICK, color: yColor }, grid: { color: GRID }, title: { display: true, text: yLabel, color: yColor, font: { family: MONO, size: 9 } }, min },
      x: { ticks: { ...TICK, maxTicksLimit: 12 }, grid: { color: GRID }, title: { display: true, text: 'Frequentie (MHz)', color: '#8b949e', font: { family: MONO, size: 9 } } },
    },
  };
}

function markerDataset(data: (number | null)[], color: string) {
  return { data, borderColor: color, backgroundColor: color, pointRadius: 8, showLine: false };
}

export default function TabFreqSweep({ calc }: Props) {
  const { inputs, results } = calc;

  const N = 80;
  const freqs = Array.from({ length: N }, (_, i) => 1.8 + (28.5 - 1.8) * i / (N - 1));
  const sweep = freqs.map(f => magloopCalc({ ...inputs, fMHz: f }));

  const etas = sweep.map(r => r.eta);
  const qs = sweep.map(r => r.Q);
  const vcaps = sweep.map(r => r.VcapKV);
  const ctuneReqs = sweep.map(r => r.CpF_req);
  const labels = freqs.map(f => f.toFixed(1));

  const curIdx = Math.round((inputs.fMHz - 1.8) / (28.5 - 1.8) * (N - 1));
  const ci = Math.max(0, Math.min(N - 1, curIdx));

  function markerAt<T>(arr: T[]): (T | null)[] {
    return arr.map((v, i) => i === ci ? v : null);
  }

  const lineStyle = (color: string) => ({ borderColor: color, backgroundColor: color + '22', fill: true, tension: 0.3, pointRadius: 0 });

  const etaData = { labels, datasets: [{ ...lineStyle('#3fb950'), data: etas }, markerDataset(markerAt(etas), '#f78166')] };
  const qData = { labels, datasets: [{ ...lineStyle('#58a6ff'), data: qs }, markerDataset(markerAt(qs), '#f78166')] };
  const vcapData = { labels, datasets: [{ ...lineStyle('#d2a8ff'), data: vcaps }, markerDataset(markerAt(vcaps), '#f78166')] };
  const ctuneData = {
    labels,
    datasets: [
      { ...lineStyle('#ffa657'), data: ctuneReqs.map(v => v < 0 ? null : v), spanGaps: false },
      markerDataset(markerAt(ctuneReqs.map(v => v < 0 ? null : v)), '#f78166'),
    ],
  };

  return (
    <div>
      <div className="section-title">Frequentie Sweep — 1.8 tot 28.5 MHz</div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 12 }}>
        Alle parameters berekend met de huidige lus-instellingen. Rode stip = huidige frequentie ({inputs.fMHz.toFixed(3)} MHz).
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: MONO, color: '#3fb950', marginBottom: 4 }}>
            Efficiëntie η (%) — huidig: {results.eta.toFixed(2)}%
          </div>
          <div style={{ height: 160 }}>
            <Line data={etaData} options={makeOpts('Efficiëntie (%)', '#3fb950', 0)} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontFamily: MONO, color: '#58a6ff', marginBottom: 4 }}>
            Q-Factor — huidig: {Math.round(results.Q)}
          </div>
          <div style={{ height: 160 }}>
            <Line data={qData} options={makeOpts('Q-factor', '#58a6ff', 0)} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontFamily: MONO, color: '#d2a8ff', marginBottom: 4 }}>
            V_cap (kV RMS) — huidig: {results.VcapKV.toFixed(2)} kV
          </div>
          <div style={{ height: 160 }}>
            <Line data={vcapData} options={makeOpts('V_cap (kV)', '#d2a8ff', 0)} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontFamily: MONO, color: '#ffa657', marginBottom: 4 }}>
            C_tune req (pF) — huidig: {results.CpF_req <= 0 ? 'ONMOGELIJK' : results.CpF_req.toFixed(1) + ' pF'}
          </div>
          <div style={{ height: 160 }}>
            <Line data={ctuneData} options={makeOpts('C_req (pF)', '#ffa657', 0)} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="section-title">Kritieke frequenties</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {(() => {
            const maxEtaIdx = etas.indexOf(Math.max(...etas));
            const maxQIdx = qs.indexOf(Math.max(...qs));
            const minVcapIdx = vcaps.indexOf(Math.min(...vcaps.filter(v => v > 0)));
            return [
              {
                label: 'Max η — Beste efficiëntie',
                f: freqs[maxEtaIdx]?.toFixed(2),
                val: etas[maxEtaIdx]?.toFixed(2) + ' %',
                color: '#3fb950',
                explain: 'Op hogere frequenties stijgt R_rad ∝ f⁴ terwijl R_loop slechts ∝ √f groeit. Dit punt geeft de beste verhouding tussen stralingsrendement en conductorverliezen. Gebruik deze frequentie als je DX-prestaties wilt maximaliseren.',
              },
              {
                label: 'Max Q — Scherpste afstemming',
                f: freqs[maxQIdx]?.toFixed(2),
                val: 'Q = ' + Math.round(qs[maxQIdx]).toString(),
                color: '#58a6ff',
                explain: 'Q bepaalt de bandbreedte (BW = f/Q) en de selectiviteit. Hoge Q = smal signaalvenster → uitstekende ruis-onderdrukking maar kritische afstemming. Bij RX is dit voordelig; bij TX vereist het een stabiele condensator.',
              },
              {
                label: 'Min V_cap — Veiligste condensator',
                f: freqs[minVcapIdx]?.toFixed(2),
                val: vcaps[minVcapIdx]?.toFixed(2) + ' kV RMS',
                color: '#d2a8ff',
                explain: 'De condensatorspanning V_cap = I·X_C neemt sterk af op hogere frequenties (X_C daalt). Op dit punt is de belasting van de condensator het laagst — interessant als je een condensator met lage spanningsrating wil gebruiken of hoog vermogen wil zenden.',
              },
            ].map(item => (
              <div key={item.label} className="stat-card" style={{ position: 'relative', cursor: 'default' }}>
                <span className="stat-label" style={{ fontSize: 9 }}>{item.label}</span>
                <span className="stat-val" style={{ fontSize: 18, color: item.color }}>{item.f} MHz</span>
                <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: MONO }}>{item.val}</span>
                <div style={{ marginTop: 6, fontSize: 10, color: 'var(--muted)', lineHeight: 1.5, borderTop: '1px solid var(--border)', paddingTop: 6 }}>
                  {item.explain}
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
