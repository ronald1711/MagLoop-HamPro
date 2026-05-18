import type { useCalculator } from "../hooks/useCalculator";
import { BAND_PRESETS, CONDUCTORS, CONDUCTOR_NOTES } from "../calc/constants";
type Calc = ReturnType<typeof useCalculator>;
interface Props { calc: Calc; theme: string; setTheme: (t: string) => void; }
const RC = { small: "var(--c-success)", intermediate: "var(--c-warn)", large: "var(--c-primary)" };
const RL = {
  small: "Kleine lus (C<0.2λ)",
  intermediate: "Intermediair (0.2-0.5λ)",
  large: "Grote lus (C>=0.5λ)",
};
function CG({ children, tip }: { children: React.ReactNode; tip?: string }) {
  return <div className="control-group" title={tip}>{children}</div>;
}

const CAT_LABELS: Record<string, string> = {
  round_tube: 'Ronde buizen',
  flat_strip: 'Strip / Tape geleiders',
  coax_outer: 'Coaxkabel (buitengeleider)',
  flex_duct: 'Flex kanaalduct',
};

function ConductorSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const byCat: Record<string, { id: string; label: string }[]> = {};
  for (const [id, def] of Object.entries(CONDUCTORS)) {
    if (!byCat[def.cat]) byCat[def.cat] = [];
    byCat[def.cat].push({ id, label: def.label });
  }
  const catOrder = ['round_tube', 'flat_strip', 'coax_outer', 'flex_duct'];
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="custom">— Aangepast (handmatig invoer) —</option>
      {catOrder.map(cat => (
        byCat[cat] ? (
          <optgroup key={cat} label={CAT_LABELS[cat] ?? cat}>
            {byCat[cat].map(({ id, label }) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </optgroup>
        ) : null
      ))}
    </select>
  );
}

function ConductorNotes({ conductorId, customMaterial }: { conductorId: string; customMaterial: string }) {
  if (conductorId === 'custom') {
    const notes = customMaterial === 'al'
      ? [CONDUCTOR_NOTES['al_warning']]
      : customMaterial === 'steel'
      ? [CONDUCTOR_NOTES['steel_warning']]
      : [];
    return notes.length > 0 ? (
      <div style={{ marginTop: 6 }}>
        {notes.map((note, i) => note ? (
          <div key={i} style={{ fontSize: 10, color: note.level === 'danger' ? 'var(--c-danger)' : 'var(--c-warn)', padding: '3px 0', borderTop: '1px solid var(--border)' }}>
            {note.text}
          </div>
        ) : null)}
      </div>
    ) : null;
  }
  const cond = CONDUCTORS[conductorId];
  if (!cond || cond.notes.length === 0) return null;
  return (
    <div style={{ marginTop: 6 }}>
      {cond.notes.map(noteKey => {
        const note = CONDUCTOR_NOTES[noteKey];
        if (!note) return null;
        const color = note.level === 'danger' ? 'var(--c-danger)' : note.level === 'warn' ? 'var(--c-warn)' : 'var(--c-primary)';
        return (
          <div key={noteKey} style={{ fontSize: 10, color, padding: '3px 0', borderTop: '1px solid var(--border)' }}>
            {note.text}
          </div>
        );
      })}
    </div>
  );
}

export default function Sidebar({ calc, theme, setTheme }: Props) {
  const { inputs, setInput, setBand, results } = calc;
  const rc = RC[results.regime];
  const cond = CONDUCTORS[inputs.conductorId];
  const isCoax = cond?.cat === 'coax_outer';
  const isFlexOrTape = cond?.cat === 'flex_duct' || (cond?.cat === 'flat_strip' && inputs.conductorId.includes('tape'));

  return (
    <div className="sidebar">
      <h1>MagLoop <span>HamPro</span></h1>
      <div className="version-tag">V1.0 by PC3Y</div>
      <div className="theme-nav">
        {["dark","light","contrast"].map(t => (
          <button key={t} className={"theme-btn"+(theme===t?" active":"")} onClick={()=>setTheme(t)}>
            {t==="contrast"?"HIGH CONTRAST":t.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="band-nav">
        {BAND_PRESETS.map((b,i)=>(
          <button key={b.label} className={"band-btn"+(inputs.activeBandIndex===i?" active":"")}
            onClick={()=>setBand(i,b.f)}>{b.label}</button>
        ))}
      </div>
      <div className="regime-badge">
        <div className="regime-dot" style={{background:rc}}/>
        <div className="regime-text">
          <div className="regime-clam" style={{color:rc}}>{RL[results.regime]}</div>
          <div style={{color:"var(--muted)",fontSize:9}}>C/λ = <span style={{color:rc}}>{results.plam.toFixed(3)}</span></div>
        </div>
      </div>
      <CG tip="Cirkel: hoogste Q en efficiëntie voor gelijke oppervlak. Vierkant: ≈5% hogere inductantie maar meer mechanisch verlies op hoeken.">
        <label>Vorm <span>Geometrie</span></label>
        <select value={inputs.shape} onChange={e=>setInput("shape",e.target.value as "circle"|"square")}>
          <option value="circle">Ronde lus (Cirkel)</option><option value="square">Vierkante lus</option>
        </select>
      </CG>
      <CG tip="Werkfrequentie in MHz. Hogere frequentie = kleiner λ = hogere R_rad = betere efficiëntie voor dezelfde lus. Gebruik de bandknoppen bovenaan voor snelle selectie.">
        <label>Frequentie <span>{inputs.fMHz.toFixed(3)} MHz</span></label>
        <input type="range" min="1.8" max="30" step="0.01" value={inputs.fMHz}
          onChange={e=>setInput("fMHz",parseFloat(e.target.value))}/>
      </CG>
      <CG tip="Buitendiameter van de lus (cirkel) of zijlengte (vierkant). Groter = meer inductantie L, hogere Q maar ook hogere V_cap. Typisch 0.5–2m voor HF.">
        <label>Loop Diameter (m) <span>{inputs.loopDiameterM.toFixed(2)}</span></label>
        <input type="range" min="0.2" max="3.0" step="0.01" value={inputs.loopDiameterM}
          onChange={e=>setInput("loopDiameterM",parseFloat(e.target.value))}/>
      </CG>
      <CG tip="Geleidermateriaal en doorsnede. Koper (Cu) heeft laagste ρ=1.72×10⁻⁸ Ω·m. Grotere diameter = lagere huidweerstand R_s = hogere Q. Coax: buitengeleider als lusleider bij N=1.">
        <label>Geleider</label>
        <ConductorSelect value={inputs.conductorId} onChange={id=>setInput("conductorId",id)}/>
        {inputs.conductorId === 'custom' && (
          <div style={{marginTop:8}}>
            <label style={{fontSize:10,display:'block',marginBottom:4}}>Materiaal</label>
            <select value={inputs.customMaterial}
              onChange={e=>setInput("customMaterial", e.target.value as 'cu'|'al'|'steel')}>
              <option value="cu">Koper (Cu) — ρ=1.72×10⁻⁸</option>
              <option value="al">Aluminium (Al) — ρ=2.65×10⁻⁸</option>
              <option value="steel">Staal — ρ≈1×10⁻⁷</option>
            </select>
            <label style={{fontSize:10,display:'block',marginTop:6,marginBottom:2}}>Diameter (mm)</label>
            <input type="number" value={inputs.customDiam_mm} min="1" max="200" step="0.5"
              style={{width:'100%'}}
              onChange={e=>{
                const v = parseFloat(e.target.value);
                if (!isNaN(v) && v > 0) setInput("customDiam_mm", v);
              }}/>
          </div>
        )}
        <ConductorNotes conductorId={inputs.conductorId} customMaterial={inputs.customMaterial}/>
        {isCoax && (
          <div style={{marginTop:6,fontSize:10,color:"var(--c-primary)"}}>
            Coax topologie: gebruik buitengeleider als lusleider (N=1 outer only).
          </div>
        )}
        {isFlexOrTape && (
          <div style={{marginTop:6,fontSize:10,color:"var(--muted)"}}>
            Skin effect: enkel de buitenste {`~`}skin depth draagt RF stroom.
          </div>
        )}
        {cond?.max_pwr && (
          <div style={{marginTop:4,fontSize:10,color:"var(--c-danger)"}}>
            Max TX vermogen: {cond.max_pwr} W (automatisch begrensd)
          </div>
        )}
      </CG>
      <CG tip="Aantal windingen N. Bij N>1 stijgt L met N², maar ook R_loop en proximity-verlies. Meerwinding nuttig op lagere banden. Spacing ratio c/a moet ≥2 zijn voor lage proximity-verlies.">
        <label>Windingen (N) <span>{inputs.turns}</span></label>
        <input type="range" min="1" max="10" step="1" value={inputs.turns}
          onChange={e=>setInput("turns",parseInt(e.target.value))}/>
      </CG>
      {inputs.turns>1&&(
        <CG tip="Verhouding van draad-middelpunt-afstand tot draaddiameter (c/a). c/a=2 = draden raken bijna. Proximity-effect verhoogt R_loop bij kleine c/a. Aanbevolen: c/a ≥ 3.">
          <label>Spacing Ratio (c/a) <span>{inputs.spacingRatio.toFixed(1)}</span></label>
          <input type="range" min="1.1" max="10" step="0.1" value={inputs.spacingRatio}
            onChange={e=>setInput("spacingRatio",parseFloat(e.target.value))}/>
        </CG>
      )}
      <CG tip="Extra verliesweerstand voor niet-gemodelleerde verliezen: aansluitstukken, verbindingen, condensatoresr, kleminductie. Praktisch: 0.05–0.20 Ω is realistisch voor goede constructie.">
        <label>Extra Verlies Re (Ω)</label>
        <select onChange={e=>{if(e.target.value!=="custom")setInput("extLossOhm",parseFloat(e.target.value));}}>
          <option value="0">Ideaal (0 Ω)</option>
          <option value="0.05">Low Loss (0.05 Ω)</option>
          <option value="0.20">Realistic (0.20 Ω)</option>
        </select>
        <input type="number" value={inputs.extLossOhm} step="0.01" min="0"
          onChange={e=>setInput("extLossOhm",parseFloat(e.target.value))} style={{marginTop:8}}/>
      </CG>
      <CG tip="TX-vermogen in Watt. Bepaalt lusstroom I=√(P/R_tot) en condensatorspanning V_cap=I×X_L. Bij hogere vermogens stijgt V_cap snel — controleer of condensator dit aankan.">
        <label>TX Vermogen (W) <span>{inputs.txPowerW}{results.txPowerEffective < inputs.txPowerW ? ` → ${results.txPowerEffective}W (begrensd)` : ''}</span></label>
        <input type="number" value={inputs.txPowerW} min="1"
          onChange={e=>setInput("txPowerW",parseFloat(e.target.value))}/>
      </CG>
      <CG tip="Hoogte van het luscentrum boven het grondvlak. Bij h<0.1λ is grondverlies dominant. Optimale directiviteitswinst bij h=λ/4 via image theory. Laag = meer grondverlies, hoog = minder grondinteractie.">
        <label>Hoogte boven grond <span>{inputs.height.toFixed(1)} m</span></label>
        <input type="range" min="0" max="20" step="0.1" value={inputs.height}
          onChange={e=>setInput("height",parseFloat(e.target.value))}/>
      </CG>
      <CG tip="Bepaalt reflectiecoëfficiënt Γ voor image theory berekening. Perfecte geleider: Γ=1 (max winst). Goede grond/gras: Γ=0.82. Slechte grond/asfalt: Γ=0.50. Vrije ruimte: geen grondeffect.">
        <label>Grondtype</label>
        <select value={inputs.groundType}
          onChange={e=>setInput("groundType",e.target.value as "perfect"|"good"|"poor"|"free")}>
          <option value="perfect">Perfecte geleider (Γ=1.0)</option>
          <option value="good">Goede grond / gras (Γ=0.82)</option>
          <option value="poor">Slechte grond / asfalt (Γ=0.50)</option>
          <option value="free">Vrije ruimte (geen grond)</option>
        </select>
      </CG>
    </div>
  );
}
