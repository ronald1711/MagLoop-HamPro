import { Line } from "react-chartjs-2";
import type { useCalculator } from "../../hooks/useCalculator";
type Calc = ReturnType<typeof useCalculator>;
interface Props { calc: Calc; }
const OPTS: any = {
  responsive:true, maintainAspectRatio:false,
  plugins:{legend:{display:false}},
  scales:{
    y:{ticks:{color:"#8b949e",font:{family:"Share Tech Mono",size:10}},grid:{color:"rgba(48,54,61,0.8)"},title:{display:true,text:"Grondwinst (dB)",color:"#8b949e",font:{family:"Share Tech Mono",size:9}}},
    x:{ticks:{color:"#8b949e",font:{family:"Share Tech Mono",size:10},maxTicksLimit:10},grid:{color:"rgba(48,54,61,0.8)"},title:{display:true,text:"Hoogte h/lambda",color:"#8b949e",font:{family:"Share Tech Mono",size:9}}},
  },
};
const GND_DESC: Record<string,string> = {
  perfect:"Perfecte geleider: maximale reflectie (|Gamma|=1). +6dB bij h=lambda/4.",
  good:"Goede grond: |Gamma|=0.82. Typisch aarde/gras.",
  poor:"Slechte grond / asfalt: |Gamma|=0.50. Weinig reflectie.",
  free:"Vrije ruimte: geen grondreflectie.",
};
export default function TabGround({ calc }: Props) {
  const { results, inputs, groundData } = calc;
  const curIdx = Math.min(Math.round(results.hLam * 100), 99);
  const markerData = groundData.data.map((_,i)=>i===curIdx?groundData.data[i]:null);
  const chartData = {
    labels: groundData.labels,
    datasets: [
      {label:"Grondwinst (dB)",borderColor:"#58a6ff",backgroundColor:"rgba(88,166,255,0.1)",fill:true,tension:0.3,data:groundData.data,pointRadius:0},
      {label:"Huidig",borderColor:"#f78166",backgroundColor:"#f78166",pointRadius:8,showLine:false,data:markerData},
    ],
  };
  return (
    <div>
      <div className="section-title">Grondeffect - Balanis Ch.4 Image Theory</div>
      <div className="ground-grid">
        <div className="ground-card">
          <h4>Effectieve directiviteit boven grond</h4>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <div className="stat-card"><span className="stat-label">D0 vrije ruimte</span><span className="stat-val" style={{fontSize:18}}>1.76 dBi</span></div>
            <div className="stat-card"><span className="stat-label">D_eff boven grond</span><span className="stat-val" style={{fontSize:18,color:"var(--c-primary)"}}>{results.Deff_dBi.toFixed(2)} dBi</span></div>
            <div className="stat-card"><span className="stat-label">Grondwinst</span><span className="stat-val" style={{fontSize:18,color:results.gndBoost>1?"var(--c-success)":results.gndBoost<-0.5?"var(--c-danger)":"var(--c-warn)"}}>{(results.gndBoost>=0?"+":"")+results.gndBoost.toFixed(2)} dB</span></div>
            <div className="stat-card"><span className="stat-label">Re grond (Ohm)</span><span className="stat-val" style={{fontSize:18,color:"var(--c-danger)"}}>{results.Re_gnd.toFixed(3)}</span></div>
            <div className="stat-card"><span className="stat-label">G_eff (dBi)</span><span className="stat-val" style={{fontSize:18,color:"var(--c-success)"}}>{results.Geff_dBi.toFixed(2)}</span></div>
            <div className="stat-card"><span className="stat-label">Hoogte h/lambda</span><span className="stat-val" style={{fontSize:18}}>{results.hLam.toFixed(3)}</span></div>
          </div>
          <div style={{height:180}}><Line data={chartData} options={OPTS}/></div>
        </div>
        <div className="ground-card">
          <h4>Image Theory - Balanis para 4.7</h4>
          <div className="info-box">
            <div style={{fontFamily:"Share Tech Mono",fontSize:9,color:"var(--c-primary)",marginBottom:8}}>HOE HET WERKT</div>
            <div>Een antenne op hoogte h boven een perfecte geleider werkt als een <strong>2-element array</strong>: de antenne + spiegelbeeld op diepte h.</div>
            <br/>
            <div>Array factor: <span style={{fontFamily:"Share Tech Mono",color:"var(--c-warn)"}}>AF = 2*Gamma*|sin(k*h)|</span></div>
            <br/>
            <div><strong>Max winst</strong> bij h = lambda/4: AF = 2*Gamma = +6 dB</div>
            <div><strong>Bij h &rarr; 0:</strong> AF &rarr; 0</div>
            <br/>
            <div style={{fontFamily:"Share Tech Mono",fontSize:9,color:"var(--muted)"}}>PEC: |Gamma|=1 - Goede grond: |Gamma|=0.82 - Slechte grond: |Gamma|=0.50</div>
            <br/>
            <div style={{color:"var(--c-primary)",fontWeight:"bold"}}>{GND_DESC[inputs.groundType]}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
