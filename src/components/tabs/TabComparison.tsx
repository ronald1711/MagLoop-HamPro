import type { useCalculator } from "../../hooks/useCalculator";
import { BAND_PRESETS } from "../../calc/constants";

type Calc = ReturnType<typeof useCalculator>;
interface Props { calc: Calc; }

export default function TabComparison({ calc }: Props) {
  const { results, inputs } = calc;
  const f = inputs.fMHz;

  // Dipole calculations
  const dipoleLen = 142.5 / f; // meters (half wave)
  const dipoleGain = 2.15; // dBi in free space
  const dipoleEff = 98; // %
  const dipoleBw = f * 0.04 * 1000; // ~4% bandwidth in kHz

  // Ground Plane calculations
  const gpHeight = 71.25 / f; // meters (quarter wave)
  const gpGain = 1.8; // dBi
  const gpEff = 65; // % with typical ground/radial losses
  const gpBw = f * 0.05 * 1000; // ~5% bandwidth in kHz

  // Loop values
  const loopSize = inputs.loopDiameterM;
  const loopGain = results.G_dBi;
  const loopEff = results.eta;
  const loopBw = results.BWkHz;

  // Helper for progress bar color
  const getEffColor = (eff: number) => {
    if (eff > 80) return "var(--c-success)";
    if (eff > 40) return "var(--c-warn)";
    return "var(--c-danger)";
  };

  return (
    <div>
      <div className="section-title">Antenne Vergelijking - MagLoop vs Dipool vs Ground Plane (GP)</div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        
        {/* Magnetic Loop Card */}
        <div className="coupling-card" style={{ borderTop: "4px solid var(--c-success)" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "var(--c-success)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Magnetic Loop</span>
            <span style={{ fontSize: 10, background: "rgba(63, 185, 80, 0.15)", padding: "2px 6px", borderRadius: 4 }}>Compact</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
            <div><strong>Fysieke afmeting:</strong> <span style={{ fontFamily: "Share Tech Mono" }}>{loopSize.toFixed(2)} m diameter</span></div>
            <div><strong>Gain:</strong> <span style={{ fontFamily: "Share Tech Mono" }}>{loopGain.toFixed(2)} dBi</span></div>
            
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <strong>Efficiëntie:</strong>
                <span style={{ fontFamily: "Share Tech Mono", color: getEffColor(loopEff) }}>{loopEff.toFixed(2)}%</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(loopEff, 100)}%`, background: getEffColor(loopEff) }}></div>
              </div>
            </div>

            <div><strong>Bandbreedte:</strong> <span style={{ fontFamily: "Share Tech Mono", color: "var(--c-warn)" }}>{loopBw.toFixed(2)} kHz</span></div>
            <div><strong>Afstemming:</strong> <span style={{ color: "var(--c-warn)" }}>Vereist bij frequentiewisseling</span></div>
            <div><strong>QRM Ruisgevoeligheid:</strong> <span style={{ color: "var(--c-success)", fontWeight: "bold" }}>Zeer Laag (magnetisch)</span></div>
            <div><strong>Ideale hoogte:</strong> 1.5 - 3.0 m boven grond (laag)</div>
          </div>
        </div>

        {/* Dipole Card */}
        <div className="coupling-card" style={{ borderTop: "4px solid var(--c-primary)" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "var(--c-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Half-Wave Dipool</span>
            <span style={{ fontSize: 10, background: "rgba(88, 166, 255, 0.15)", padding: "2px 6px", borderRadius: 4 }}>Referentie</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
            <div><strong>Fysieke afmeting:</strong> <span style={{ fontFamily: "Share Tech Mono" }}>{dipoleLen.toFixed(2)} m spanwijdte</span></div>
            <div><strong>Gain:</strong> <span style={{ fontFamily: "Share Tech Mono" }}>{dipoleGain.toFixed(2)} dBi</span></div>
            
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <strong>Efficiëntie:</strong>
                <span style={{ fontFamily: "Share Tech Mono", color: "var(--c-success)" }}>{dipoleEff}%</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${dipoleEff}%`, background: "var(--c-success)" }}></div>
              </div>
            </div>

            <div><strong>Bandbreedte:</strong> <span style={{ fontFamily: "Share Tech Mono" }}>{dipoleBw.toFixed(0)} kHz</span></div>
            <div><strong>Afstemming:</strong> <span style={{ color: "var(--c-success)" }}>Niet vereist (breedbandig)</span></div>
            <div><strong>QRM Ruisgevoeligheid:</strong> <span style={{ color: "var(--muted)" }}>Gemiddeld (elektrisch + mag.)</span></div>
            <div><strong>Ideale hoogte:</strong> &gt; { (150/f/2).toFixed(1) } m boven grond (&gt; &lambda;/4)</div>
          </div>
        </div>

        {/* Ground Plane Card */}
        <div className="coupling-card" style={{ borderTop: "4px solid var(--c-warn)" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "var(--c-warn)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Ground Plane (GP)</span>
            <span style={{ fontSize: 10, background: "rgba(210, 153, 34, 0.15)", padding: "2px 6px", borderRadius: 4 }}>DX Vertical</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
            <div><strong>Fysieke afmeting:</strong> <span style={{ fontFamily: "Share Tech Mono" }}>{gpHeight.toFixed(2)} m hoog (+ radials)</span></div>
            <div><strong>Gain:</strong> <span style={{ fontFamily: "Share Tech Mono" }}>{gpGain.toFixed(2)} dBi</span></div>
            
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <strong>Efficiëntie:</strong>
                <span style={{ fontFamily: "Share Tech Mono", color: "var(--c-warn)" }}>{gpEff}%</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${gpEff}%`, background: "var(--c-warn)" }}></div>
              </div>
            </div>

            <div><strong>Bandbreedte:</strong> <span style={{ fontFamily: "Share Tech Mono" }}>{gpBw.toFixed(0)} kHz</span></div>
            <div><strong>Afstemming:</strong> <span style={{ color: "var(--c-success)" }}>Niet vereist (breedbandig)</span></div>
            <div><strong>QRM Ruisgevoeligheid:</strong> <span style={{ color: "var(--c-danger)", fontWeight: "bold" }}>Hoog (pikt veel E-veld ruis op)</span></div>
            <div><strong>Ideale hoogte:</strong> Op de grond of verhoogd met radials</div>
          </div>
        </div>

      </div>

      {/* Summary Analysis Box */}
      <div className="info-box" style={{ marginTop: 14 }}>
        <div style={{ fontFamily: "Share Tech Mono", fontSize: 9, color: "var(--c-primary)", marginBottom: 8 }}>
          STRATEGISCHE ANALYSE VOOR HAM SHACKS
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.5, display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <strong style={{ color: "var(--c-success)" }}>Wanneer kiest u de Magnetic Loop?</strong>
            <br />
            Ideaal voor woningen met beperkte ruimte (balkon, zolder, tuin) en stedelijke gebieden met veel QRM (storing van elektronica). De loop fungeert als een pre-selector voor uw ontvanger vanwege de extreem hoge Q (smalle bandbreedte), waardoor naburige signalen worden weggefilterd en de local noise floor drastisch daalt.
          </div>
          <div>
            <strong style={{ color: "var(--c-primary)" }}>Wanneer kiest u de Dipool?</strong>
            <br />
            Als u de ruimte heeft (&gt; {dipoleLen.toFixed(1)} meter spanwijdte) en de antenne op voldoende hoogte (&gt; &lambda;/4) kunt ophangen. Dit is de meest efficiënte antenne voor algemeen gebruik en vereist geen tussentijdse afstemming.
          </div>
          <div>
            <strong style={{ color: "var(--c-warn)" }}>Wanneer kiest u de Ground Plane Vertical?</strong>
            <br />
            Uitstekend voor DX (lange afstand) vanwege de lage elevatiehoek van de afstraling, maar vereist een fatsoenlijk radialennetwerk om de efficiëntie acceptabel te houden. Let op: pikt door de verticale polarisatie aanzienlijk meer man-made ruis op.
          </div>
        </div>
      </div>
    </div>
  );
}
