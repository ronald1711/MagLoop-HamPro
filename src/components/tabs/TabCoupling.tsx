import type { CalcResult } from "../../calc/magloop";
interface Props { results: CalcResult; }
function Row({k,v}:{k:string;v:React.ReactNode}) {
  return <div className="coupling-row"><span className="coupling-key">{k}</span><span className="coupling-val">{v}</span></div>;
}
export default function TabCoupling({ results }: Props) {
  return (
    <div>
      <div className="section-title">Koppellus berekening - aanbevolen methode</div>
      <div className="coupling-grid">
        <div className="coupling-card">
          <h4>Koppellus dimensies</h4>
          <Row k="Methode" v={<span className="method-badge method-good">Faraday / Inductief</span>}/>
          <Row k="Diameter koppellus" v={(results.coupDiam*100).toFixed(1)+" cm"}/>
          <Row k="Afstand (typ.)" v="1-3 cm"/>
          <Row k="Galv. scheiding" v={<span style={{color:"var(--c-success)"}}>Ja</span>}/>
          <Row k="Multi-band" v={<span style={{color:"var(--c-success)"}}>Ja</span>}/>
          <Row k="Extra afregeling" v={<span style={{color:"var(--c-success)"}}>Geen</span>}/>
        </div>
        <div className="coupling-card">
          <h4>Impedantietransformatie</h4>
          <Row k="Z_lus resonantie" v={Math.round(results.Zin_res)+" Ohm"}/>
          <Row k="Transformatie n2" v={results.transN2.toFixed(1)+":1"}/>
          <Row k="Lusstroom (A)" v={results.Ia.toFixed(2)+" A"}/>
          <Row k="Mag. moment m" v={results.magMoment.toFixed(3)+" A*m2"}/>
        </div>
      </div>
      <div className="info-box" style={{marginTop:14}}>
        <div style={{fontFamily:"Share Tech Mono",fontSize:9,color:"var(--c-primary)",marginBottom:6}}>ANDERE METHODEN (overzicht)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div><strong style={{color:"var(--c-success)"}}>Koppellus (Faraday)</strong> - aanbevolen. Diam/5, galv. gescheiden, multi-band.</div>
          <div><strong style={{color:"var(--c-warn)"}}>Gamma match</strong> - compact, geen galv. scheiding, 2x afstemknop.</div>
          <div><strong style={{color:"var(--c-primary)"}}>Split/Butterfly C</strong> - laag verlies, QRO, 1 knop, mechanisch complex.</div>
          <div><strong style={{color:"var(--muted)"}}>Ferriet trafo</strong> - eenvoudig, ferriet-verlies bij HF; max 100W.</div>
        </div>
      </div>
    </div>
  );
}
