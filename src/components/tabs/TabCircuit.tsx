import type { CalcResult } from "../../calc/magloop";
interface Props { results: CalcResult; }
export default function TabCircuit({ results: r }: Props) {
  return (
    <div>
      <div className="section-title">Equivalent Circuit - Balanis para 5.2.7A</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div>
          <div className="circuit-svg-box">
            <svg width="100%" viewBox="0 0 340 160" xmlns="http://www.w3.org/2000/svg" style={{fontFamily:"Share Tech Mono"}}>
              <line x1="10" y1="60" x2="40" y2="60" stroke="var(--c-primary)" strokeWidth="2"/>
              <rect x="40" y="48" width="44" height="24" fill="none" stroke="var(--c-success)" strokeWidth="1.5" rx="3"/>
              <text x="62" y="57" textAnchor="middle" fontSize="8" fill="var(--c-success)">R_rad</text>
              <text x="62" y="68" textAnchor="middle" fontSize="7" fill="var(--muted)">{(r.Rrad*1000).toFixed(2)}mOhm</text>
              <line x1="84" y1="60" x2="104" y2="60" stroke="var(--c-primary)" strokeWidth="2"/>
              <rect x="104" y="48" width="44" height="24" fill="none" stroke="var(--c-danger)" strokeWidth="1.5" rx="3"/>
              <text x="126" y="57" textAnchor="middle" fontSize="8" fill="var(--c-danger)">R_L</text>
              <text x="126" y="68" textAnchor="middle" fontSize="7" fill="var(--muted)">{(r.Rloop*1000).toFixed(1)}mOhm</text>
              <line x1="148" y1="60" x2="168" y2="60" stroke="var(--c-primary)" strokeWidth="2"/>
              <path d="M168,60 q5,-14 10,0 q5,-14 10,0 q5,-14 10,0 q5,-14 10,0" fill="none" stroke="var(--c-primary)" strokeWidth="2"/>
              <text x="188" y="90" textAnchor="middle" fontSize="8" fill="var(--c-primary)">X_A</text>
              <text x="188" y="100" textAnchor="middle" fontSize="7" fill="var(--muted)">{Math.round(r.XL)} Ohm</text>
              <line x1="218" y1="60" x2="250" y2="60" stroke="var(--c-primary)" strokeWidth="2"/>
              <circle cx="254" cy="60" r="4" fill="var(--c-primary)"/>
              <line x1="10" y1="130" x2="254" y2="130" stroke="var(--c-primary)" strokeWidth="2"/>
              <circle cx="10" cy="130" r="4" fill="var(--c-primary)"/>
              <line x1="280" y1="60" x2="280" y2="90" stroke="var(--c-warn)" strokeWidth="2"/>
              <line x1="265" y1="90" x2="295" y2="90" stroke="var(--c-warn)" strokeWidth="2"/>
              <line x1="265" y1="96" x2="295" y2="96" stroke="var(--c-warn)" strokeWidth="2"/>
              <line x1="280" y1="96" x2="280" y2="130" stroke="var(--c-warn)" strokeWidth="2"/>
              <line x1="254" y1="60" x2="280" y2="60" stroke="var(--c-warn)" strokeWidth="1.5" strokeDasharray="4,3"/>
              <line x1="254" y1="130" x2="280" y2="130" stroke="var(--c-warn)" strokeWidth="1.5" strokeDasharray="4,3"/>
              <text x="300" y="96" fontSize="8" fill="var(--c-warn)">C_tune</text>
              <text x="300" y="107" fontSize="7" fill={r.CpF_req<=0?"var(--c-danger)":"var(--muted)"}>{r.CpF_req<=0?"N/A":r.CpF_req.toFixed(1)+"pF"}</text>
              <text x="10" y="50" fontSize="9" fill="var(--muted)">Z_in</text>
            </svg>
          </div>
          <div style={{fontSize:11,color:"var(--muted)",marginTop:6,fontFamily:"Share Tech Mono"}}>Balanis (5-33): Z_in = (R_rad + R_L) + j(X_A)</div>
        </div>
        <div>
          <div className="dashboard-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
            <div className="stat-card"><span className="stat-label">Z_in resonantie</span><span className="stat-val" style={{fontSize:18,color:"var(--c-primary)"}}>{Math.round(r.Zin_res)} Ohm</span></div>
            <div className="stat-card"><span className="stat-label">X_A (Ohm)</span><span className="stat-val" style={{fontSize:18}}>{Math.round(r.XL)} Ohm</span></div>
            <div className="stat-card"><span className="stat-label">R_L verlies (Ohm)</span><span className="stat-val" style={{fontSize:18,color:"var(--c-danger)"}}>{r.Rloop.toFixed(4)}</span></div>
            <div className="stat-card"><span className="stat-label">R_rad (Ohm)</span><span className="stat-val" style={{fontSize:18,color:"var(--c-success)"}}>{r.Rrad.toFixed(5)}</span></div>
            <div className="stat-card"><span className="stat-label">C_tune req (pF)</span><span className="stat-val" style={{fontSize:18,color:r.CpF_req<=0?"var(--c-danger)":r.CpF_req<5?"var(--c-warn)":undefined}}>{r.CpF_req<=0?"ONMOGELIJK":r.CpF_req.toFixed(1)+" pF"}</span></div>
            <div className="stat-card"><span className="stat-label">Q factor</span><span className="stat-val" style={{fontSize:18}}>{Math.round(r.Q)}</span></div>
          </div>
          <div className="info-box" style={{marginTop:12,fontFamily:"Share Tech Mono",fontSize:11}}>
            <div style={{color:"var(--c-primary)",marginBottom:4}}>RESONANTIE FORMULE (5-36)</div>
            <div>{"Z_in = "+r.Rtotal.toFixed(4)+" + "+" + "+(r.XL*r.XL/r.Rtotal).toFixed(1)+" = "+Math.round(r.Zin_res)+" Ohm"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
