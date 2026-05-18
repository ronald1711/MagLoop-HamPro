import { useState } from 'react';
import type { CalcResult } from '../../calc/magloop';

interface Props { results: CalcResult; }

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = title.replace(/\s+/g, '-').toLowerCase();
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 6, marginBottom: 8 }}>
      {/* Button for keyboard access — WCAG 2.1.1, 4.1.2 */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={`section-content-${id}`}
        style={{ width: '100%', cursor: 'pointer', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', borderRadius: open ? '6px 6px 0 0' : 6, border: 'none', textAlign: 'left' }}
      >
        <span style={{ fontFamily: 'Share Tech Mono', fontSize: 12, color: 'var(--c-primary)' }}>{title}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {badge && <span style={{ fontSize: 10, color: 'var(--c-warn)', fontFamily: 'Share Tech Mono' }} aria-label={badge}>{badge}</span>}
          <span style={{ color: 'var(--muted)', fontSize: 10 }} aria-hidden="true">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div id={`section-content-${id}`} style={{ padding: '12px 14px', fontSize: 11, lineHeight: 1.7, color: 'var(--text)', borderTop: '1px solid var(--border)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function KV({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--muted)', fontSize: 10 }}>{label}</span>
      <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: color ?? 'var(--c-primary)' }}>{value}</span>
    </div>
  );
}

function Formula({ text }: { text: string }) {
  return <div style={{ fontFamily: 'Share Tech Mono', background: 'var(--surface)', padding: '6px 10px', borderRadius: 4, margin: '6px 0', fontSize: 10, color: 'var(--c-warn)', borderLeft: '2px solid var(--c-warn)' }}>{text}</div>;
}

export default function TabTheory({ results: r }: Props) {
  return (
    <div>
      <div className="section-title">Theorie — Technische Achtergrond</div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 12 }}>
        Klik op een sectie om de formules en uitleg te tonen. Live waarden zijn berekend met de huidige instellingen.
      </div>

      <Section title="Q-Factor & Bandbreedte" badge={`Q=${Math.round(r.Q)}  BW=${r.BWkHz.toFixed(2)} kHz`}>
        <p>De <strong>Q-factor</strong> (kwaliteitsfactor) bepaalt hoe scherp de lus afstembaar is en hoeveel spanning er over de condensator staat.</p>
        <Formula text="Q = X_L / R_tot = ωL / (R_rad + R_loop + R_extra + Re_gnd)" />
        <p>Een hoge Q betekent:</p>
        <ul style={{ paddingLeft: 16 }}>
          <li>Smalle bandbreedte: BW = f/Q — precisie-afstemming vereist</li>
          <li>Hoge condensatorspanning: V_cap ≈ Q × V_bron (resonantieversterking)</li>
          <li>Hoge lusstroom: meer magnetisch moment m = I·A·N</li>
        </ul>
        <div style={{ marginTop: 8 }}>
          <KV label="Reactantie X_L" value={`${Math.round(r.XL)} Ω`} />
          <KV label="Totaalweerstand R_tot" value={`${(r.Rtotal * 1000).toFixed(2)} mΩ`} />
          <KV label="Q-factor" value={Math.round(r.Q).toString()} color="var(--c-success)" />
          <KV label="Bandbreedte BW" value={`${r.BWkHz.toFixed(2)} kHz`} color={r.BWkHz < 5 ? 'var(--c-warn)' : undefined} />
          <KV label="Inductantie L" value={`${r.L_uH.toFixed(3)} µH`} />
        </div>
        <div style={{ marginTop: 8, padding: 8, background: 'var(--surface)', borderRadius: 4, fontSize: 10, color: 'var(--muted)' }}>
          Referentie: Balanis «Antenna Theory» 4e editie, paragraaf 5.2.7 (Small Loop Antenna — Circuit Parameters)
        </div>
      </Section>

      <Section title="Efficiëntie η & Stralingsrendement" badge={`η=${r.eta.toFixed(2)}%`}>
        <p>Efficiëntie is de verhouding van het uitgestraalde vermogen tot het totale ingangsvermogen.</p>
        <Formula text="η = R_rad / R_tot × 100%" />
        <p><strong>R_rad</strong> (stralingsweerstand) is het virtuele weerstandsdeel dat overeenkomt met het uitgestraalde vermogen — geen warmte, maar echte straling. <strong>R_loop</strong> is echte weerstand die warmte produceert.</p>
        <Formula text="R_rad = 31171 × (A·N / λ²)²   [kleine lus, C/λ < 0.5]" />
        <p>Verbetering efficiëntie:</p>
        <ul style={{ paddingLeft: 16 }}>
          <li>Grotere lus (A groeit kwadratisch met diameter)</li>
          <li>Hogere frequentie (λ kleiner → R_rad stijgt met f⁴)</li>
          <li>Betere geleider (lager R_loop)</li>
          <li>Groter conductordiameter (lagere huidweerstand)</li>
        </ul>
        <div style={{ marginTop: 8 }}>
          <KV label="R_rad" value={`${(r.Rrad * 1000).toFixed(4)} mΩ`} color="var(--c-success)" />
          <KV label="R_loop" value={`${(r.Rloop * 1000).toFixed(2)} mΩ`} color="var(--c-danger)" />
          <KV label="R_extra + Re_gnd" value={`${((r.Rtotal - r.Rrad - r.Rloop) * 1000).toFixed(2)} mΩ`} />
          <KV label="Efficiëntie η" value={`${r.eta.toFixed(3)} %`} color={r.eta < 1 ? 'var(--c-danger)' : r.eta < 5 ? 'var(--c-warn)' : 'var(--c-success)'} />
          <KV label="Gain G" value={`${r.G_dBi.toFixed(2)} dBi`} />
        </div>
        <div style={{ marginTop: 8, padding: 8, background: 'var(--surface)', borderRadius: 4, fontSize: 10, color: 'var(--muted)' }}>
          Referentie: Balanis eq. 5-31 (R_rad voor kleine lus), eq. 2-46 (G = η·D₀)
        </div>
      </Section>

      <Section title="Condensatorspanning & Veiligheid" badge={`V_cap=${r.VcapKV.toFixed(2)} kV`}>
        <p>Bij resonantie staat er een <strong>zeer hoge spanning</strong> over de afstemcondensator. Dit is geen vergissing — het is het gevolg van Q-versterking.</p>
        <Formula text="V_cap = I_a × X_L = √(P/R_tot) × ωL" />
        <Formula text="V_cap ≈ Q × V_bron  (resonantieversterking)" />
        <p>De condensator moet dit aankunnen. Opgelet: de <strong>piekspanning</strong> is V_cap × √2 ≈ {(r.VcapKV * 1.414).toFixed(2)} kV.</p>
        <ul style={{ paddingLeft: 16 }}>
          <li>Luchtdielektricum: ~3 kV/mm slagvaste doorslag (droog)</li>
          <li>Vacuümcondensator: enige veilige optie boven 5 kV RMS</li>
          <li>Gespleten stator (butterfly): typisch 3–5 kV max</li>
          <li>Bij hogere Q stijgt V_cap — kies condensator met voldoende marge (×2)</li>
        </ul>
        <div style={{ marginTop: 8 }}>
          <KV label="Lusstroom I_a" value={`${r.Ia.toFixed(2)} A`} />
          <KV label="V_cap (RMS)" value={`${r.VcapKV.toFixed(2)} kV`} color={r.VcapKV > 10 ? 'var(--c-danger)' : r.VcapKV > 5 ? 'var(--c-warn)' : undefined} />
          <KV label="V_cap piek (×√2)" value={`${(r.VcapKV * 1.414).toFixed(2)} kV`} color="var(--c-danger)" />
          <KV label="TX Vermogen" value={`${r.txPowerEffective} W`} />
        </div>
      </Section>

      <Section title="Huideffect & Geleiderverliezen" badge={`δ=${r.skin_um.toFixed(1)} µm`}>
        <p>Bij hoge frequenties stroomt RF-stroom alleen in een dunne <strong>huidlaag</strong> aan het oppervlak van de geleider.</p>
        <Formula text="δ = √(ρ / π·f·µ₀)   [huiddiepte in meter]" />
        <Formula text="R_s = ρ/δ = √(ρ·π·f·µ₀)   [oppervlakweerstand in Ω/□]" />
        <p>Praktische consequenties:</p>
        <ul style={{ paddingLeft: 16 }}>
          <li>Huiddiepte Cu @ {r.skin_um.toFixed(1)} µm: enkel het buitenste {r.skin_um.toFixed(1)} µm geleidt RF</li>
          <li>Grotere buitendiameter → meer effectief oppervlak → lagere R_loop</li>
          <li>Buisvormige geleider even goed als massief, bij d {">"} 3δ</li>
          <li>Koper ({`ρ=1.72×10⁻⁸`}) heeft lagere δ dan Al ({`ρ=2.65×10⁻⁸`})</li>
          <li>Aluminium: Rs {(Math.sqrt(2.650e-8 / 1.724e-8)).toFixed(2)}× hoger dan Cu</li>
        </ul>
        <div style={{ marginTop: 8 }}>
          <KV label="Huiddiepte δ" value={`${r.skin_um.toFixed(2)} µm`} />
          <KV label="Rs/□" value={`${(r.Rs_sq * 1000).toFixed(4)} mΩ/□`} />
          <KV label="R_loop totaal" value={`${(r.Rloop * 1000).toFixed(2)} mΩ`} color="var(--c-danger)" />
          <KV label="Effectieve omtrek" value={`${(r.circumference_m * 100).toFixed(2)} cm`} />
          <KV label="Geleiderlengte" value={`${r.condLen.toFixed(2)} m`} />
        </div>
        <div style={{ marginTop: 8, padding: 8, background: 'var(--surface)', borderRadius: 4, fontSize: 10, color: 'var(--muted)' }}>
          Referentie: Balanis Appendix III (Skin depth), Silver «Microwave Handbook» par. 2.8
        </div>
      </Section>

      <Section title="Afstemcapaciteit & Zelf-capaciteit" badge={`C_req=${r.CpF_req.toFixed(1)} pF`}>
        <p>De afstemcondensator brengt de lus op resonantie door de reactantie X_L te compenseren.</p>
        <Formula text="C_ideaal = 1 / (ω²·L)   →   resonantie f₀ = 1/(2π√(LC))" />
        <Formula text="C_self = ε₀ × D_eff = ε₀ × (omtrek/π)" />
        <Formula text="C_req = C_ideaal − C_self" />
        <p><strong>C_self</strong> (structurele zelf-capaciteit) verlaagt de benodigde externe C. Bij hogere frequenties domineert C_self meer.</p>
        <p>Bij N=1 coax-geleider wordt C_cable <em>niet</em> afgetrokken — de binnengeleider is floating en vormt geen shuntpad parallel aan C_tune.</p>
        <div style={{ marginTop: 8 }}>
          <KV label="C_ideaal" value={`${r.CpF.toFixed(1)} pF`} />
          <KV label="C_self" value={`${r.C_self_pF.toFixed(2)} pF`} />
          {r.ccable_pF > 0 && <KV label="C_cable (informatief, N=1)" value={`${r.ccable_pF.toFixed(0)} pF`} color="var(--muted)" />}
          <KV label="C_req (benodigd)" value={r.CpF_req <= 0 ? 'ONMOGELIJK' : `${r.CpF_req.toFixed(1)} pF`} color={r.CpF_req <= 0 ? 'var(--c-danger)' : r.CpF_req < 5 ? 'var(--c-warn)' : undefined} />
          {r.f_min_MHz > 0 && <KV label="f_min zelfres. (coax)" value={`${r.f_min_MHz.toFixed(2)} MHz`} color="var(--muted)" />}
        </div>
      </Section>

      <Section title="Grondeffect & Image Theory" badge={`Boost=${r.gndBoost >= 0 ? '+' : ''}${r.gndBoost.toFixed(2)} dB`}>
        <p>Een antenne boven een geleidend grondvlak gedraagt zich als een <strong>2-element array</strong>: de antenne plus zijn spiegelbeeld op diepte h.</p>
        <Formula text="AF = 2·|Γ|·|sin(k·h)|   (array factor)" />
        <Formula text="D_eff = D₀ × AF   →   max bij h = λ/4" />
        <p>Bij h = λ/4 en perfecte geleider (Γ=1): AF = 2 → +6 dB directiviteitswinst.</p>
        <p>Bij h &lt; 0.1λ domineert grondverlies: Re_gnd = Γ·0.3·exp(−h/0.05λ)</p>
        <div style={{ marginTop: 8 }}>
          <KV label="Hoogte h/λ" value={r.hLam.toFixed(4)} color={r.hLam < 0.1 ? 'var(--c-warn)' : undefined} />
          <KV label="Array Factor AF" value={r.AFmax.toFixed(3)} />
          <KV label="D_eff" value={`${r.Deff_dBi.toFixed(2)} dBi`} />
          <KV label="G_eff (met η)" value={`${r.Geff_dBi.toFixed(2)} dBi`} />
          <KV label="Re_gnd" value={`${r.Re_gnd.toFixed(4)} Ω`} color={r.Re_gnd > 0.01 ? 'var(--c-danger)' : undefined} />
          <KV label="Grondwinst" value={`${r.gndBoost >= 0 ? '+' : ''}${r.gndBoost.toFixed(2)} dB`} color={r.gndBoost > 1 ? 'var(--c-success)' : undefined} />
        </div>
        <div style={{ marginTop: 8, padding: 8, background: 'var(--surface)', borderRadius: 4, fontSize: 10, color: 'var(--muted)' }}>
          Referentie: Balanis par. 4.7 (Image Theory), eq. 4-114 en 4-115
        </div>
      </Section>

      <Section title="Regimegeldigheid & Modelaannamen" badge={r.regime.toUpperCase()}>
        <p>De gebruikte formules zijn gebaseerd op het <strong>uniform-stroom model</strong> (Balanis hfst. 5). Dit model is alleen geldig als de stroom over de hele lus nagenoeg gelijk is.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, margin: '8px 0' }}>
          {[
            { label: 'Klein', range: 'C/λ < 0.2', valid: true, color: 'var(--c-success)' },
            { label: 'Intermediate', range: '0.2–0.5λ', valid: false, color: 'var(--c-warn)' },
            { label: 'Groot', range: 'C/λ > 0.5', valid: false, color: 'var(--c-danger)' },
          ].map(reg => (
            <div key={reg.label} style={{ background: 'var(--surface)', padding: 6, borderRadius: 4, borderLeft: `2px solid ${reg.color}`, fontSize: 10 }}>
              <div style={{ color: reg.color, fontFamily: 'Share Tech Mono' }}>{reg.label}</div>
              <div style={{ color: 'var(--muted)' }}>{reg.range}</div>
              <div style={{ color: reg.valid ? 'var(--c-success)' : 'var(--c-warn)' }}>{reg.valid ? '✓ Formules geldig' : '⚠ Benaderend'}</div>
            </div>
          ))}
        </div>
        <p>Huidig regime: <strong style={{ color: r.regime === 'small' ? 'var(--c-success)' : r.regime === 'intermediate' ? 'var(--c-warn)' : 'var(--c-danger)' }}>{r.regime.toUpperCase()}</strong> (C/λ = {r.plam.toFixed(3)})</p>
        <div style={{ marginTop: 8 }}>
          <KV label="Perimeter" value={`${r.perimeter_m.toFixed(3)} m`} />
          <KV label="λ (golflengte)" value={`${(r.lambda * 100).toFixed(1)} cm`} />
          <KV label="C/λ ratio" value={r.plam.toFixed(4)} color={r.plam > 0.3 ? 'var(--c-danger)' : r.plam > 0.2 ? 'var(--c-warn)' : 'var(--c-success)'} />
          <KV label="Eff. apertuur A_em" value={`${r.Aem.toFixed(3)} m²`} />
          <KV label="Mag. moment m" value={`${r.magMoment.toFixed(3)} A·m²`} />
        </div>
      </Section>

      <Section title="Voedingsmethoden & Koppeling" badge="Faraday aanbevolen">
        <p>De koppeling van de 50 Ω coax naar de hoog-impedante lus (Z_in = {Math.round(r.Zin_res)} Ω) vereist een impedantietransformatie van {r.transN2.toFixed(0)}:1.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, margin: '8px 0' }}>
          {[
            { name: 'Faraday loop', color: 'var(--c-success)', pros: 'Galv. sch., multi-band, 1 knop', cons: 'Iets grotere afmeting', rec: true },
            { name: 'Capacitief', color: 'var(--c-primary)', pros: 'Compact', cons: '2 knoppen, geen galv. sch.', rec: false },
            { name: 'Gamma match', color: 'var(--c-warn)', pros: 'Zeer compact', cons: '2 knoppen, common-mode!', rec: false },
          ].map(m => (
            <div key={m.name} style={{ background: 'var(--surface)', padding: 8, borderRadius: 4, borderLeft: `2px solid ${m.color}`, fontSize: 10 }}>
              <div style={{ color: m.color, fontFamily: 'Share Tech Mono', marginBottom: 4 }}>{m.name}{m.rec ? ' ✓' : ''}</div>
              <div style={{ color: 'var(--c-success)', fontSize: 9 }}>+ {m.pros}</div>
              <div style={{ color: 'var(--c-danger)', fontSize: 9 }}>- {m.cons}</div>
            </div>
          ))}
        </div>
        <Formula text={`Faraday: d_coup = D × √(50 / Z_in)  →  ${(Math.sqrt(50/r.Zin_res)*r.coupDiam * 5*100).toFixed(0)} cm voor 50Ω match`} />
        <p>De Faraday-lus is galvanisch gescheiden: geen DC-verbinding tussen antenne en coax. Dit onderdrukt common-mode stromen op de coaxmantel effectief.</p>
        <KV label="Z_in resonantie" value={`${Math.round(r.Zin_res)} Ω`} />
        <KV label="Optimale Faraday diameter" value={`${(Math.sqrt(50/r.Zin_res)*r.coupDiam * 5*100).toFixed(1)} cm`} color="var(--c-success)" />
        <KV label="Standaard D/5 diameter" value={`${(r.coupDiam*100).toFixed(1)} cm`} />
      </Section>

      <Section title="Q/BW Referentietabel" badge={`Huidig Q=${Math.round(r.Q)}`}>
        <p>Referentietabel: bandbreedte (kHz) bij typische Q-waarden voor verschillende HF-banden.</p>
        <div style={{ overflowX: 'auto', marginTop: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, fontFamily: 'Share Tech Mono' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ textAlign: 'left', padding: '3px 8px' }}>Q</th>
                {[1.85, 3.6, 7.1, 10.12, 14.15, 21.2, 28.5].map(f => (
                  <th key={f} style={{ textAlign: 'right', padding: '3px 6px' }}>{f} MHz</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[300, 500, 800, 1000, 1500, 2000].map(q => {
                const isCur = Math.abs(r.Q - q) < q * 0.2;
                return (
                  <tr key={q} style={{ borderBottom: '1px solid var(--border)', background: isCur ? 'rgba(88,166,255,0.08)' : undefined }}>
                    <td style={{ padding: '3px 8px', color: isCur ? 'var(--c-primary)' : 'var(--text)' }}>{isCur ? '▶ ' : ''}{q}</td>
                    {[1.85, 3.6, 7.1, 10.12, 14.15, 21.2, 28.5].map(f => {
                      const bw = f * 1000 / q;
                      return (
                        <td key={f} style={{ textAlign: 'right', padding: '3px 6px', color: bw < 2 ? 'var(--c-danger)' : bw < 5 ? 'var(--c-warn)' : 'var(--muted)' }}>
                          {bw.toFixed(1)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(88,166,255,0.12)', fontWeight: 'bold' }}>
                <td style={{ padding: '3px 8px', color: 'var(--c-primary)' }}>Huidig ({Math.round(r.Q)})</td>
                {[1.85, 3.6, 7.1, 10.12, 14.15, 21.2, 28.5].map(f => {
                  const bw = f * 1000 / r.Q;
                  return (
                    <td key={f} style={{ textAlign: 'right', padding: '3px 6px', color: bw < 2 ? 'var(--c-danger)' : bw < 5 ? 'var(--c-warn)' : 'var(--c-primary)' }}>
                      {bw.toFixed(1)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 6, fontSize: 10, color: 'var(--muted)' }}>
          Waarden in kHz. Rood &lt;2 kHz (detuningsgevoelig), oranje &lt;5 kHz (precisie-afstemming). Huidig: {r.BWkHz.toFixed(2)} kHz @ {(1e-6 / (2 * Math.PI * Math.sqrt(r.L_uH * 1e-6 * r.CpF * 1e-12))).toFixed(3)} MHz
        </div>
      </Section>
    </div>
  );
}
