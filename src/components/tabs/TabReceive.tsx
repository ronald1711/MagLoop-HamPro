import type { CalcResult } from "../../calc/magloop";
interface Props { results: CalcResult; }
export default function TabReceive({ results }: Props) {
  return (
    <div>
      <div className="section-title">Ontvangst modus - Balanis para 5.2.7B</div>
      <div className="receive-grid">
        <div className="stat-card"><span className="stat-label">V_oc per uV/m</span><span className="stat-val">{(results.le_m*1e6).toFixed(2)} uV</span></div>
        <div className="stat-card"><span className="stat-label">Eff. vectorlengte le</span><span className="stat-val">{results.le_m.toFixed(4)} m</span></div>
        <div className="stat-card"><span className="stat-label">Max eff. apertuur A_em</span><span className="stat-val">{results.Aem.toFixed(3)} m2</span></div>
        <div className="stat-card"><span className="stat-label">A_em / A_fysiek</span><span className="stat-val" style={{color:"var(--c-primary)"}}>{(results.Aem/results.area_m2).toFixed(1)}x</span></div>
        <div className="stat-card"><span className="stat-label">D0 ontvangst</span><span className="stat-val" style={{fontSize:18}}>1.76 dBi</span></div>
        <div className="stat-card"><span className="stat-label">Golflengte lambda</span><span className="stat-val">{results.lambda.toFixed(2)} m</span></div>
      </div>
      <div className="info-box" style={{marginTop:14}}>
        <div style={{fontFamily:"Share Tech Mono",fontSize:9,color:"var(--c-primary)",marginBottom:6}}>ONTVANGST EIGENSCHAPPEN</div>
        <div>Als ontvangstantenne is de kleine lus uitstekend - lage efficientie speelt nauwelijks een rol bij S/N op HF.</div>
        <div style={{marginTop:6}}>De lus meet magnetisch veld B - orthogonaal aan een dipool die E meet.</div>
        <div style={{marginTop:6}}>Richtingzoeker (RDF): het scherpe nulpunt maakt de lus ideaal voor peilingen.</div>
        <div style={{marginTop:6}}>Formule vectorlengte: <span style={{fontFamily:"Share Tech Mono",color:"var(--c-warn)"}}>le = k0*S*N (Balanis 5-40)</span></div>
      </div>
    </div>
  );
}
