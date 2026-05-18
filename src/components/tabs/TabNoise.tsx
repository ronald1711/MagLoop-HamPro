import { Line } from "react-chartjs-2";
import type { useCalculator } from "../../hooks/useCalculator";
type Calc = ReturnType<typeof useCalculator>;
interface Props { calc: Calc; }
const OPTS: any = {
  responsive:true, maintainAspectRatio:false,
  plugins:{legend:{display:true,labels:{color:"#8b949e",font:{family:"Share Tech Mono",size:10}}}},
  scales:{
    y:{ticks:{color:"#8b949e",font:{family:"Share Tech Mono",size:10}},grid:{color:"rgba(48,54,61,0.8)"},title:{display:true,text:"T_A (K)",color:"#8b949e"}},
    x:{ticks:{color:"#8b949e",font:{family:"Share Tech Mono",size:10}},grid:{color:"rgba(48,54,61,0.8)"},title:{display:true,text:"Efficientie eta",color:"#8b949e"}},
  },
};
export default function TabNoise({ calc }: Props) {
  const { inputs, setInput, noiseResult: n, noiseData, results } = calc;
  const markerData = noiseData.data.map((_,i)=>i===Math.round(results.eta/5)*5/5?n.TA:null);
  const chartData = {
    labels: noiseData.labels,
    datasets:[
      {label:"T_A (K)",borderColor:"#d29922",backgroundColor:"rgba(210,153,34,0.1)",fill:true,tension:0.3,data:noiseData.data},
      {label:"Huidig",borderColor:"#f78166",backgroundColor:"#f78166",pointRadius:8,pointStyle:"circle",showLine:false,data:markerData},
    ],
  };
  return (
    <div>
      <div className="section-title">Ruisbijdrage &amp; Signaal/Ruis - Balanis para 2.16</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div>
          <div className="section-title" style={{border:"none",marginBottom:6}}>Antennetemperatuur T_A</div>
          <div className="dashboard-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
            <div className="stat-card"><span className="stat-label">T_A (K)</span><span className="stat-val" style={{fontSize:22,color:"var(--c-warn)"}}>{Math.round(n.TA)} K</span></div>
            <div className="stat-card"><span className="stat-label">T_ohm verlies (K)</span><span className="stat-val" style={{fontSize:22,color:"var(--c-danger)"}}>{Math.round(n.Tohm)} K</span></div>
            <div className="stat-card"><span className="stat-label">T_scene (K)</span><span className="stat-val" style={{fontSize:22}}>{n.Tscene.toLocaleString()} K</span></div>
            <div className="stat-card"><span className="stat-label">Noise Figure (dB)</span><span className="stat-val" style={{fontSize:22,color:"var(--c-warn)"}}>{n.NF_dB.toFixed(1)} dB</span></div>
          </div>
          <div className="control-group" style={{marginTop:12}}>
            <label>Omgevingstemperatuur T_scene (K) <span>{inputs.tScene.toLocaleString()}</span></label>
            <input type="range" min="100" max="50000" step="100" value={inputs.tScene}
              onChange={e=>setInput("tScene",parseFloat(e.target.value))}/>
            <div style={{fontFamily:"Share Tech Mono",fontSize:9,color:"var(--muted)",marginTop:6}}>HF overdag: 5000-20000 K - Nacht: 1000-5000 K</div>
          </div>
        </div>
        <div>
          <div className="section-title" style={{border:"none",marginBottom:6}}>S/N vs efficientie</div>
          <div style={{height:200}}><Line data={chartData} options={OPTS}/></div>
          <div className="info-box" style={{marginTop:12}}>
            <div style={{fontFamily:"Share Tech Mono",fontSize:9,color:"var(--c-primary)",marginBottom:6}}>ANTENNETEMPERATUUR (Balanis para 2.16)</div>
            <div style={{fontFamily:"Share Tech Mono",color:"var(--c-warn)",fontSize:10}}>T_A = eta*T_scene + (1-eta)*T_phys</div>
            <br/>
            <div>Op HF is T_scene &gt;&gt; 290K, dus een lus met 10% rendement is als ontvangstantenne nauwelijks slechter dan een perfecte antenne.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
