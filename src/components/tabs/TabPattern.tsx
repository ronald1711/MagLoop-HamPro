import { useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import type { CalcResult } from '../../calc/magloop';
import type { AllInputs } from '../../hooks/useCalculator';
import { GND_REFL } from '../../calc/constants';

interface Props { results: CalcResult; inputs: AllInputs; }

function drawPattern(canvas: HTMLCanvasElement, regime: string, patternPoints: number[]) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, R = W * 0.42;
  ctx.clearRect(0, 0, W, H);
  const panel = getComputedStyle(document.documentElement).getPropertyValue('--panel').trim() || '#161b22';
  ctx.fillStyle = panel; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(128,128,128,0.2)'; ctx.lineWidth = 1;
  [0.25, 0.5, 0.75, 1.0].forEach(r => { ctx.beginPath(); ctx.arc(cx, cy, R * r, 0, 2 * Math.PI); ctx.stroke(); });
  ctx.strokeStyle = 'rgba(128,128,128,0.35)';
  ctx.beginPath(); ctx.moveTo(cx, cy - R - 8); ctx.lineTo(cx, cy + R + 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - R - 8, cy); ctx.lineTo(cx + R + 8, cy); ctx.stroke();
  const mc = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#8b949e';
  ctx.fillStyle = mc; ctx.font = '9px Share Tech Mono'; ctx.textAlign = 'center';
  ctx.fillText('0°', cx, cy - R - 10); ctx.fillText('180°', cx, cy + R + 18);
  ctx.fillText('90°', cx + R + 16, cy + 3); ctx.fillText('90°', cx - R - 16, cy + 3);

  // Calculate dynamic HPBW line angles
  let hpbwAngle = 45;
  if (patternPoints) {
    let bestDiff = 1.0;
    for (let deg = 0; deg <= 90; deg++) {
      const val = patternPoints[deg];
      const diff = Math.abs(val - 0.5);
      if (diff < bestDiff) {
        bestDiff = diff;
        hpbwAngle = deg;
      }
    }
  }

  ctx.strokeStyle = 'rgba(88,166,255,0.25)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
  [hpbwAngle, 180 - hpbwAngle, 180 + hpbwAngle, 360 - hpbwAngle].forEach(deg => {
    const a = (deg - 90) * Math.PI / 180;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); ctx.stroke();
  });
  ctx.setLineDash([]);
  
  const color = regime === 'small' ? '#3fb950' : regime === 'intermediate' ? '#d29922' : '#58a6ff';
  ctx.strokeStyle = color; ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 360; i++) {
    const th = (i * Math.PI) / 180;
    const rn = patternPoints ? (patternPoints[i] ?? Math.pow(Math.sin(th), 2)) : Math.pow(Math.sin(th), 2);
    const px = cx + R * rn * Math.sin(th), py = cy - R * rn * Math.cos(th);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.stroke();
  
  ctx.fillStyle = color === '#3fb950' ? 'rgba(63,185,80,0.12)' : color === '#d29922' ? 'rgba(210,153,34,0.12)' : 'rgba(88,166,255,0.12)';
  ctx.beginPath();
  for (let i = 0; i <= 360; i++) {
    const th = (i * Math.PI) / 180;
    const rn = patternPoints ? (patternPoints[i] ?? Math.pow(Math.sin(th), 2)) : Math.pow(Math.sin(th), 2);
    const px = cx + R * rn * Math.sin(th), py = cy - R * rn * Math.cos(th);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
}

export default function TabPattern({ results, inputs }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (canvasRef.current) drawPattern(canvasRef.current, results.regime, results.patternPoints); }, [results]);

  // Elevation pattern above ground
  const Gamma = GND_REFL[inputs.groundType] ?? 0;
  const k = 2 * Math.PI / results.lambda;
  const h = inputs.height;
  const N = 91; // 0° to 90°
  const elevAngles = Array.from({ length: N }, (_, i) => i);

  const gFreeData = elevAngles.map(() => 1.76); // D0 = 1.5 → 1.76 dBi, constant
  const gGndData = elevAngles.map(elev => {
    const rad = elev * Math.PI / 180;
    const AF = inputs.groundType === 'free' ? 1 : 2 * Gamma * Math.abs(Math.sin(k * h * Math.sin(rad)));
    const G_lin = 1.5 * Math.max(AF, 0.001) * Math.max(AF, 0.001);
    return parseFloat((10 * Math.log10(G_lin)).toFixed(2));
  });

  // Find max elevation angle
  const maxGndIdx = gGndData.indexOf(Math.max(...gGndData));
  const maxElevAngle = elevAngles[maxGndIdx];
  const maxGndDb = gGndData[maxGndIdx];

  const MONO = 'Share Tech Mono';
  const GRID = 'rgba(48,54,61,0.8)';
  const elevLabels = elevAngles.map(a => a % 10 === 0 ? a + '°' : '');

  const elevChartData = {
    labels: elevLabels,
    datasets: [
      { label: 'Vrije ruimte', data: gFreeData, borderColor: '#8b949e', borderDash: [4, 3], pointRadius: 0, fill: false, tension: 0 },
      { label: 'Boven grond', data: gGndData, borderColor: '#58a6ff', backgroundColor: 'rgba(88,166,255,0.10)', fill: true, tension: 0.3, pointRadius: 0 },
    ],
  };
  const elevOpts: any = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#8b949e', font: { family: MONO, size: 9 }, boxWidth: 20 } },
    },
    scales: {
      y: {
        ticks: { color: '#8b949e', font: { family: MONO, size: 9 } }, grid: { color: GRID },
        title: { display: true, text: 'Gain (dBi)', color: '#8b949e', font: { family: MONO, size: 9 } },
      },
      x: {
        ticks: { color: '#8b949e', font: { family: MONO, size: 9 } }, grid: { color: GRID },
        title: { display: true, text: 'Elevatie (°)', color: '#8b949e', font: { family: MONO, size: 9 } },
      },
    },
  };

  // Calculate HPBW
  let hpbw = 90;
  if (results.patternPoints) {
    let bestDiff = 1.0;
    let bestAngle = 45;
    for (let deg = 0; deg <= 90; deg++) {
      const val = results.patternPoints[deg];
      const diff = Math.abs(val - 0.5);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestAngle = deg;
      }
    }
    hpbw = 2 * (90 - bestAngle);
  }

  const regimeText = results.regime === 'small'
    ? "F(θ) = sin²(θ) — Lusas = verticaal"
    : "F(θ) = [J₁(ka sin θ) / J₁(ka)]²";

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        <div>
          <div className="pattern-canvas-box">
            <div className="section-title">Azimuth / Elevatie patroon</div>
            <canvas className="pattern-canvas" ref={canvasRef} width={240} height={240} />
            <div style={{ fontFamily: MONO, fontSize: 9, color: 'var(--muted)', marginTop: 6, textAlign: 'center' }}>
              {regimeText}
            </div>
          </div>
          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
            <div className="stat-card"><span className="stat-label">D₀</span><span className="stat-val" style={{ fontSize: 18 }}>{results.D0_dBi.toFixed(2)} dBi</span></div>
            <div className="stat-card"><span className="stat-label">Gain G</span><span className="stat-val" style={{ fontSize: 18, color: 'var(--c-success)' }}>{results.G_dBi.toFixed(2)} dBi</span></div>
            <div className="stat-card"><span className="stat-label">HPBW</span><span className="stat-val" style={{ fontSize: 18 }}>{hpbw}°</span></div>
            <div className="stat-card"><span className="stat-label">A_em</span><span className="stat-val" style={{ fontSize: 16 }}>{results.Aem.toFixed(3)} m²</span></div>
          </div>
        </div>
        <div>
          <div className="section-title">
            Elevatie patroon boven grond — h={inputs.height.toFixed(1)}m ({results.hLam.toFixed(3)}λ)
          </div>
          <div style={{ height: 200 }}>
            <Line data={elevChartData} options={elevOpts} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
            <div className="stat-card">
              <span className="stat-label">Max gain hoek</span>
              <span className="stat-val" style={{ fontSize: 18, color: 'var(--c-primary)' }}>{maxElevAngle}°</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Max gain</span>
              <span className="stat-val" style={{ fontSize: 18, color: 'var(--c-success)' }}>{maxGndDb.toFixed(1)} dBi</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Grondtype</span>
              <span className="stat-val" style={{ fontSize: 14, color: 'var(--c-warn)' }}>Γ={Gamma.toFixed(2)}</span>
            </div>
          </div>
          <div className="info-box" style={{ marginTop: 10, fontSize: 10, fontFamily: MONO }}>
            <div style={{ color: 'var(--c-primary)', marginBottom: 4 }}>IMAGE THEORY — BALANIS PAR. 4.7</div>
            <div>AF(θ) = 2·Γ·|sin(k·h·sin(θ))|</div>
            <div style={{ marginTop: 4, color: 'var(--muted)' }}>
              {maxElevAngle <= 10
                ? `Lage hoek (${maxElevAngle}°): gunstig voor DX → skywave op lange afstand`
                : maxElevAngle >= 60
                ? `Hoge hoek (${maxElevAngle}°): NVIS-mode → ideaal voor regionaal verkeer (<1000 km)`
                : `Middelmatige hoek (${maxElevAngle}°): gemengde DX/regionaal propagatie`}
            </div>
            <div style={{ marginTop: 4, color: 'var(--muted)' }}>
              Max gain bij h = λ/4 = {(results.lambda / 4).toFixed(2)} m voor lage DX-hoek
            </div>
          </div>
        </div>
      </div>
      <div className="info-box" style={{ marginTop: 12, fontSize: 10, fontFamily: MONO }}>
        <div style={{ color: 'var(--c-primary)', marginBottom: 4 }}>PATROON EIGENSCHAPPEN — BALANIS PAR. 5.2.6</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <div>Vorm: {results.regime === 'small' ? 'sin²(θ) — korte dipool' : 'Bessel J₁ — verbreed patroon'}</div>
            <div>Polarisatie: E-veld in φ-richting</div>
            <div>Null: langs lusas (θ=0°, 180°)</div>
          </div>
          <div>
            <div>A_em/A_fysiek: {(results.Aem / results.area_m2).toFixed(1)}× verhouding</div>
            <div>Eff. vectorlengte ℓ_e: {results.le_m.toFixed(3)} m</div>
            <div>Nabij-veld zone: {(results.lambda / 6.28).toFixed(1)} m (λ/2π)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
