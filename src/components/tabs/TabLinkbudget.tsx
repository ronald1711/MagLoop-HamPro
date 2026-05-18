import { Line } from "react-chartjs-2";
import type { useCalculator } from "../../hooks/useCalculator";
type Calc = ReturnType<typeof useCalculator>;
interface Props { calc: Calc; }
const OPTS: any = {
  responsive:true, maintainAspectRatio:false,
  plugins:{legend:{display:true,labels:{color:"#8b949e",font:{family:"Share Tech Mono",size:10}}}},
  scales:{
    y:{ticks:{color:"#8b949e",font:{family:"Share Tech Mono",size:10}},grid:{color:"rgba(48,54,61,0.8)"},title:{display:true,text:"P_r (dBm)",color:"#8b949e",font:{family:"Share Tech Mono",size:9}}},
    x:{ticks:{color:"#8b949e",font:{family:"Share Tech Mono",size:10}},grid:{color:"rgba(48,54,61,0.8)"}},
  },
};
function Row({label,value}:{label:string;value:string}) {
  return <div className="friis-row"><span className="friis-key">{label}</span><span className="friis-val">{value}</span></div>;
}
export default function TabLinkbudget({ calc }: Props) {
  const { inputs, setFriis, friisResult: fr, friisRange } = calc;
  const chartData = { labels: friisRange.labels,
    datasets:[{label:"P_r (dBm)",borderColor:"#3fb950",backgroundColor:"rgba(63,185,80,0.1)",fill:true,tension:0.3,data:friisRange.data}]};
  return (
    <div>
      <div className="section-title">Verbindingsbudget - Friis Vergelijking (Balanis para 2.15)</div>
      <div className="friis-grid">
        <div className="friis-card">
          <h4>Invoer verbinding</h4>
          <div style={{display:"grid",gap:8}}>
            <div className="control-group">
              <label>Afstand TX-RX (km) <span>{inputs.friis.distanceKm}</span></label>
              <input type="range" min="0.1" max="1000" step="0.1" value={inputs.friis.distanceKm}
                onChange={e=>setFriis("distanceKm",parseFloat(e.target.value))}/>
            </div>
            <div className="control-group">
              <label>Gain RX-antenne (dBi) <span>{inputs.friis.rxGainDbi}</span></label>
              <input type="range" min="-10" max="30" step="0.1" value={inputs.friis.rxGainDbi}
                onChange={e=>setFriis("rxGainDbi",parseFloat(e.target.value))}/>
            </div>
            <div className="control-group"><label>Polarisatie-verlies (PLF)</label>
              <select value={inputs.friis.plf} onChange={e=>setFriis("plf",parseFloat(e.target.value))}>
                <option value="1.0">Uitgelijnd (PLF=1.0)</option>
                <option value="0.5">45 graden rotatie (PLF=0.5)</option>
                <option value="0">Orthogonaal (PLF=0)</option>
              </select>
            </div>
            <div className="control-group"><label>Feedlijn verlies TX (dB)</label>
              <input type="number" value={inputs.friis.feedLossDb} step="0.1" min="0"
                onChange={e=>setFriis("feedLossDb",parseFloat(e.target.value))}/>
            </div>
          </div>
        </div>
        <div className="friis-card">
          <h4>Berekend linkbudget</h4>
          <Row label="TX Vermogen P_t" value={fr.Pt_W.toFixed(0)+" W ("+(10*Math.log10(fr.Pt_W*1000)).toFixed(1)+" dBm)"}/>
          <Row label="Feedlijn verlies" value={"-"+fr.feedLoss_dB.toFixed(1)+" dB"}/>
          <Row label="Gain TX G_t" value={fr.Gt_dBi.toFixed(2)+" dBi"}/>
          <Row label="FSPL (free-space)" value={fr.FSPL_dB.toFixed(1)+" dB"}/>
          <Row label="PLF polarisatie" value={fr.PLF_dB<-90?"inf dB":fr.PLF_dB.toFixed(1)+" dB"}/>
          <Row label="Gain RX G_r" value={fr.Gr_dBi.toFixed(1)+" dBi"}/>
          <div style={{borderTop:"2px solid var(--c-primary)",margin:"8px 0"}}/>
          <Row label="Ontvangen P_r" value={fr.Pr_W.toExponential(2)+" W"}/>
          <Row label="Ontvangen P_r (dBm)" value={fr.Pr_dBm.toFixed(1)+" dBm"}/>
          <Row label="Veldsterkte op RX" value={(fr.Efield*1000).toFixed(3)+" mV/m"}/>
          <div className="info-box" style={{marginTop:12}}>
            <div style={{fontFamily:"Share Tech Mono",fontSize:9,color:"var(--c-primary)",marginBottom:4}}>FRIIS FORMULE (Balanis 2-122)</div>
            <div style={{fontFamily:"Share Tech Mono",fontSize:10,color:"var(--muted)"}}>P_r/P_t = G_t*G_r*(lambda/4piR)^2 * PLF</div>
          </div>
        </div>
      </div>
      <div className="chart-box" style={{marginTop:16}}><Line data={chartData} options={OPTS}/></div>
    </div>
  );
}
