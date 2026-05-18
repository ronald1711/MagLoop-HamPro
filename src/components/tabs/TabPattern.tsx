import { useRef, useEffect } from "react";
import type { CalcResult } from "../../calc/magloop";
interface Props { results: CalcResult; }
function drawPattern(canvas: HTMLCanvasElement, regime: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W=canvas.width, H=canvas.height, cx=W/2, cy=H/2, R=W*0.42;
  ctx.clearRect(0,0,W,H);
  const panel = getComputedStyle(document.documentElement).getPropertyValue("--panel").trim()||"#161b22";
  ctx.fillStyle=panel; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="rgba(128,128,128,0.2)"; ctx.lineWidth=1;
  [0.25,0.5,0.75,1.0].forEach(r=>{ctx.beginPath();ctx.arc(cx,cy,R*r,0,2*Math.PI);ctx.stroke();});
  ctx.strokeStyle="rgba(128,128,128,0.35)";
  ctx.beginPath();ctx.moveTo(cx,cy-R-8);ctx.lineTo(cx,cy+R+8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx-R-8,cy);ctx.lineTo(cx+R+8,cy);ctx.stroke();
  const mc=getComputedStyle(document.documentElement).getPropertyValue("--muted").trim()||"#8b949e";
  ctx.fillStyle=mc; ctx.font="9px Share Tech Mono"; ctx.textAlign="center";
  ctx.fillText("0 deg",cx,cy-R-10); ctx.fillText("180 deg",cx,cy+R+18);
  ctx.fillText("90 deg",cx+R+16,cy+3); ctx.fillText("90 deg",cx-R-16,cy+3);
  ctx.strokeStyle="rgba(88,166,255,0.25)"; ctx.lineWidth=1; ctx.setLineDash([3,3]);
  const hpbw_r=Math.pow(Math.sin(Math.PI/4),2)*R;
  [45,135,225,315].forEach(deg=>{
    const a=(deg-90)*Math.PI/180;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+hpbw_r*Math.cos(a),cy+hpbw_r*Math.sin(a));ctx.stroke();
  });
  ctx.setLineDash([]);
  const color=regime==="small"?"#3fb950":regime==="intermediate"?"#d29922":"#58a6ff";
  ctx.strokeStyle=color; ctx.lineWidth=2.5;
  ctx.beginPath();
  for(let i=0;i<=360;i++){
    const th=(i*Math.PI)/180, rn=Math.pow(Math.sin(th),2);
    const px=cx+R*rn*Math.sin(th), py=cy-R*rn*Math.cos(th);
    i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
  }
  ctx.closePath(); ctx.stroke();
  ctx.fillStyle=color==="#3fb950"?"rgba(63,185,80,0.12)":color==="#d29922"?"rgba(210,153,34,0.12)":"rgba(88,166,255,0.12)";
  ctx.beginPath();
  for(let i=0;i<=360;i++){
    const th=(i*Math.PI)/180, rn=Math.pow(Math.sin(th),2);
    const px=cx+R*rn*Math.sin(th), py=cy-R*rn*Math.cos(th);
    i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
  }
  ctx.closePath(); ctx.fill();
}
export default function TabPattern({ results }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{ if(canvasRef.current) drawPattern(canvasRef.current, results.regime); },[results.regime]);
  return (
    <div className="pattern-wrap">
      <div className="pattern-canvas-box">
        <div className="section-title">Stralingspatroon (elevatie)</div>
        <canvas className="pattern-canvas" ref={canvasRef} width={240} height={240}/>
        <div style={{fontFamily:"Share Tech Mono",fontSize:9,color:"var(--muted)",marginTop:6,textAlign:"center"}}>F(theta) = sin2(theta) - Lusas = verticaal</div>
      </div>
      <div style={{flex:1,minWidth:200}}>
        <div className="section-title">Balanis para 5.2.6 + para 2.3</div>
        <div className="dashboard-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
          <div className="stat-card"><span className="stat-label">Directiviteit D0</span><span className="stat-val" style={{fontSize:20}}>1.76 dBi</span></div>
          <div className="stat-card"><span className="stat-label">Gain G</span><span className="stat-val" style={{fontSize:20,color:"var(--c-success)"}}>{results.G_dBi.toFixed(2)} dBi</span></div>
          <div className="stat-card"><span className="stat-label">HPBW (-3dB)</span><span className="stat-val" style={{fontSize:20}}>90 deg</span></div>
          <div className="stat-card"><span className="stat-label">A_em</span><span className="stat-val" style={{fontSize:18}}>{results.Aem.toFixed(3)} m2</span></div>
          <div className="stat-card"><span className="stat-label">A_em / A_fysiek</span><span className="stat-val" style={{fontSize:18,color:"var(--c-primary)"}}>{(results.Aem/results.area_m2).toFixed(1)}x</span></div>
          <div className="stat-card"><span className="stat-label">Null richting</span><span className="stat-val" style={{fontSize:18}}>theta=0 deg</span></div>
        </div>
        <div className="info-box" style={{marginTop:12}}>
          <div style={{fontFamily:"Share Tech Mono",fontSize:9,color:"var(--c-primary)",marginBottom:6}}>PATROON EIGENSCHAPPEN</div>
          <div>Vorm: sin2(theta) - identiek aan korte dipool</div>
          <div>Dualiteit: kleine lus = magnetische dipool m = I0*S</div>
          <div>Polarisatie: E-veld in phi-richting</div>
          <div>Maximum: theta = 90 deg (in vlak van lus)</div>
          <div>Nul: theta = 0 en 180 deg (langs lusas)</div>
          <div>HPBW: 90 deg (van 45 t/m 135)</div>
        </div>
      </div>
    </div>
  );
}
