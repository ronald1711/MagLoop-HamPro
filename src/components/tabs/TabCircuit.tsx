import type { CalcResult } from "../../calc/magloop";
interface Props { results: CalcResult; }
export default function TabCircuit({ results: r }: Props) {
  const Vcap = r.VcapKV; // RMS voltage in kV
  const Vpeak = Vcap * Math.sqrt(2);
  const Vdesign = Vpeak * 1.5; // 1.5x safety margin

  const airGapMm = Vdesign / 1.2; // 1.2 kV/mm breakdown strength in typical air (moisture/dust margin)
  const vacGapMm = Vdesign / 25.0; // 25.0 kV/mm breakdown strength in vacuum

  let recommendation = "";
  let capColor = "var(--c-success)";
  if (r.CpF_req <= 0) {
    recommendation = "Afstemming is fysiek ONMOGELIJK! De luszelfcapaciteit (C_self) is groter dan de benodigde capaciteit. Verklein de lusdiameter of verlaag de frequentie.";
    capColor = "var(--c-danger)";
  } else if (Vcap < 1.0) {
    recommendation = "Lucht-afstemcondensator (vlinder/butterfly of trombone) met minimale plaat-afstand.";
  } else if (Vcap < 3.0) {
    recommendation = "Hogespanning lucht-condensator of vacuüm-condensator; trombone-condensator van koperbuis.";
    capColor = "var(--c-warn)";
  } else {
    recommendation = "Vacuüm variabele condensator vereist (bijv. Russian KP1-4) om overslag te voorkomen.";
    capColor = "var(--c-danger)";
  }

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

      <div className="section-title" style={{marginTop:20}}>Condensator Spanningsdoorslag & Spatiëring</div>
      <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:16}}>
        <div className="coupling-card" style={{display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <h4>Doorslagspecificaties & Advies</h4>
          <div style={{display:"flex",flexDirection:"column",gap:8,fontSize:12,color:"var(--text)"}}>
            <div><strong>RMS Spanning:</strong> <span style={{fontFamily:"Share Tech Mono",fontSize:13}}>{Vcap.toFixed(2)} kV</span></div>
            <div><strong>Piekspanning (V_peak):</strong> <span style={{fontFamily:"Share Tech Mono",fontSize:13}}>{Vpeak.toFixed(2)} kV</span></div>
            <div><strong>Ontwerpspanning (1.5x marge):</strong> <span style={{fontFamily:"Share Tech Mono",fontSize:13,color:"var(--c-warn)"}}>{Vdesign.toFixed(2)} kV</span></div>
            <div style={{marginTop:6,borderTop:"1px solid var(--border)",paddingTop:8}}>
              <strong>Type Advies:</strong> <span style={{color:capColor,fontWeight:"bold"}}>{recommendation}</span>
            </div>
          </div>
        </div>

        <div className="coupling-card">
          <h4>Minimale Plaat-afstand (Ontwerpmarge)</h4>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div className="stat-card" style={{borderColor:"rgba(210,153,34,0.3)"}}>
              <span className="stat-label">Luchtspleet (Air Gap)</span>
              <span className="stat-val" style={{fontSize:20,color:"var(--c-warn)"}}>{r.CpF_req<=0?"N/A":airGapMm.toFixed(2)+" mm"}</span>
              <span className="stat-label" style={{fontSize:8}}>Bij 1.2 kV/mm (lucht)</span>
            </div>
            <div className="stat-card" style={{borderColor:"rgba(88,166,255,0.3)"}}>
              <span className="stat-label">Vacuümspleet (Vac Gap)</span>
              <span className="stat-val" style={{fontSize:20,color:"var(--c-primary)"}}>{r.CpF_req<=0?"N/A":vacGapMm.toFixed(2)+" mm"}</span>
              <span className="stat-label" style={{fontSize:8}}>Bij 25 kV/mm (vacuüm)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
