import { Bar } from "react-chartjs-2";
import type { useCalculator } from "../../hooks/useCalculator";
import { BANDS, BAND_NAMES, BAND_PRESETS } from "../../calc/constants";
import { magloopCalc } from "../../calc/magloop";
import { generateNecFile } from "../../calc/necExport";
type Calc = ReturnType<typeof useCalculator>;
interface Props { calc: Calc; }
const OPTS: any = {
  responsive:true, maintainAspectRatio:false,
  plugins:{legend:{display:false}},
  scales:{
    y:{ticks:{color:"#8b949e",font:{family:"Share Tech Mono",size:10}},grid:{color:"rgba(48,54,61,0.8)"},beginAtZero:true,max:100},
    x:{ticks:{color:"#8b949e",font:{family:"Share Tech Mono",size:10}},grid:{color:"rgba(48,54,61,0.8)"}},
  },
};
function SM({label,value,color}:{label:string;value:string;color?:string}) {
  return <div className="stat-card"><span className="stat-label">{label}</span>
    <span className="stat-val" style={{fontSize:18,color}}>{value}</span></div>;
}
export default function TabDetails({ calc }: Props) {
  const { inputs, results } = calc;
  const bp = BAND_PRESETS[inputs.activeBandIndex];
  const effs = BANDS.map(fb => magloopCalc({...inputs, fMHz:fb}).eta);
  const sweepLow  = magloopCalc({...inputs, fMHz: bp?.low  ?? inputs.fMHz}).CpF_req;
  const sweepHigh = magloopCalc({...inputs, fMHz: bp?.high ?? inputs.fMHz}).CpF_req;

  const handleDownload = () => {
    const text = generateNecFile(inputs, results);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `magloop_${inputs.fMHz}mhz.nec`;
    a.click();
  };

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div>
          <div className="section-title">Geometrie &amp; Inductantie</div>
          <div className="dashboard-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
            <SM label="Inductie L" value={results.L_uH.toFixed(3)+" uH"}/>
            <SM label="Loop Oppervlak" value={results.area_m2.toFixed(3)+" m2"}/>
            <SM label="Geleiderlengte" value={results.condLen.toFixed(2)+" m"}/>
            <SM label="Perimeter/lambda" value={results.plam.toFixed(3)}/>
          </div>
        </div>
        <div>
          <div className="section-title">Verliezen &amp; Stroom</div>
          <div className="dashboard-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
            <SM label="R-Rad (mOhm)" value={results.rrad_m.toFixed(2)} color="var(--c-success)"/>
            <SM label="R-Loop (mOhm)" value={results.rloop_m.toFixed(2)} color="var(--c-danger)"/>
            <SM label="Lusstroom (A)" value={results.Ia.toFixed(2)}/>
            <SM label="Skin Depth" value={results.skin_um.toFixed(1)+" um"}/>
            <SM label="Min. diam. (20δ)" value={(results.skin_um*20/1000).toFixed(1)+" mm"} color={results.circumference_m/Math.PI*1000 < results.skin_um*20 ? "var(--c-warn)" : "var(--muted)"}/>
          </div>
        </div>
      </div>
      <div className="sweep-box" style={{marginTop:16, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16}}>
        <div style={{flex:1, minWidth:250}}>
          <div className="section-title" style={{marginTop:0}}>Band Sweep</div>
          <div className="sweep-grid">
            <div><span className="stat-label">{bp?.low??inputs.fMHz} MHz</span><span className="stat-val" style={{fontSize:20,color:sweepLow<=0?"var(--c-danger)":undefined}}>{sweepLow<=0?"N/A":sweepLow.toFixed(1)+" pF"}</span></div>
            <div><span className="stat-label">{inputs.fMHz} MHz</span><span className="stat-val" style={{fontSize:20,color:results.CpF_req<=0?"var(--c-danger)":"var(--c-primary)"}}>{results.CpF_req<=0?"ONMOGELIJK":results.CpF_req.toFixed(1)+" pF"}</span></div>
            <div><span className="stat-label">{bp?.high??inputs.fMHz} MHz</span><span className="stat-val" style={{fontSize:20,color:sweepHigh<=0?"var(--c-danger)":undefined}}>{sweepHigh<=0?"N/A":sweepHigh.toFixed(1)+" pF"}</span></div>
          </div>
        </div>
        <div style={{display:"flex", alignItems:"center"}}>
          <button 
            onClick={handleDownload}
            style={{
              padding: "12px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              background: "linear-gradient(135deg, var(--c-primary) 0%, #1f6feb 100%)",
              color: "#ffffff",
              border: "1px solid rgba(56, 139, 253, 0.4)",
              fontFamily: "Share Tech Mono",
              fontSize: "12px",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(31, 111, 235, 0.2)",
              transition: "all 0.2s ease",
            }}
          >
            Exporteren naar 4NEC2 (.nec)
          </button>
        </div>
      </div>
      <div className="chart-box" style={{marginTop:16}}>
        <Bar data={{labels:BAND_NAMES,datasets:[{label:"Efficientie %",backgroundColor:"#58a6ff",data:effs}]}} options={OPTS}/>
      </div>
    </div>
  );
}
