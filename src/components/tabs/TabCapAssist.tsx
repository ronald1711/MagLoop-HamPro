import type { CalcResult } from '../../calc/magloop';

interface Props { results: CalcResult; }

interface CapType {
  name: string;
  cRange: string;
  vMax: string;
  pMax: string;
  notes: string;
  color: string;
}

const CAP_TYPES: CapType[] = [
  { name: 'Vacuümcondensator (variabel)', cRange: '5–500 pF', vMax: '5–30 kV', pMax: '500 W+', notes: 'Beste keuze voor >5 kV en hogere vermogens. Motoraansturing mogelijk. N4SPP/MFJ/Jennings.', color: 'var(--c-success)' },
  { name: 'Lucht variabel (silver mica plates)', cRange: '10–500 pF', vMax: '1–5 kV', pMax: '100–500 W', notes: 'Goed voor QRP–midvermogen. Breed afstembaar. Vereist grote afstand tussen de platen bij hogere spanning.', color: 'var(--c-success)' },
  { name: 'Butterfly (gespleten stator)', cRange: '10–200 pF', vMax: '2–5 kV', pMax: '100–300 W', notes: 'Weinig RF op as (galvanisch symmetrisch). Compacte constructie. AA5TB/MFJ. Ideaal voor stille motor-afstemming.', color: 'var(--c-primary)' },
  { name: 'Transmissielijncondensator', cRange: '1–50 pF', vMax: '10+ kV', pMax: '1 kW+', notes: 'Zelfbouw: overlappende buizen of platen op afstand. Geen mechanische slijtage. Typisch QRO toepassingen.', color: 'var(--c-primary)' },
  { name: 'Glijcondensator (piston)', cRange: '1–100 pF', vMax: '5–20 kV', pMax: '500 W+', notes: 'Hoge Q, laag verlies. Geschikt voor hogere banden. Dino/Jennings/Comet typen.', color: 'var(--c-primary)' },
  { name: 'Zilvermica (vaste waarde)', cRange: '1–1000 pF', vMax: '0.5–2 kV', pMax: '<50 W', notes: 'Alleen voor QRP of vaste afstemming. Hoge Q maar niet variabel.', color: 'var(--c-warn)' },
];

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)', fontSize: 11 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontFamily: 'Share Tech Mono', color: color ?? 'var(--text)' }}>{value}</span>
    </div>
  );
}

export default function TabCapAssist({ results: r }: Props) {
  const vRms = r.VcapKV;
  const vPeak = vRms * Math.sqrt(2);
  const vDesign = vPeak * 1.5;
  const cReq = r.CpF_req;
  const impossible = cReq <= 0;

  const suitable = CAP_TYPES.filter(ct => {
    const vNum = parseFloat(ct.vMax.split('–')[0] ?? ct.vMax);
    const vNumMax = parseFloat(ct.vMax.split('–')[1] ?? ct.vMax.split('–')[0]);
    return (isNaN(vNumMax) ? vNum : vNumMax) >= vRms * 0.9;
  });

  return (
    <div>
      <div className="section-title">Condensator Assistent</div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 12 }}>
        Selecteer de juiste afstemcondensator op basis van de benodigde capaciteit en spanningsklasse.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="info-box">
          <div style={{ fontFamily: 'Share Tech Mono', color: 'var(--c-primary)', fontSize: 10, marginBottom: 8 }}>VEREISTEN</div>
          {impossible
            ? <div style={{ color: 'var(--c-danger)', fontFamily: 'Share Tech Mono', fontSize: 12 }}>RESONANTIE ONMOGELIJK — verhoog frequentie of verklein diameter</div>
            : <>
              <Row label="C_ideaal" value={`${r.CpF.toFixed(1)} pF`} />
              <Row label="C_self" value={`${r.C_self_pF.toFixed(2)} pF`} />
              {r.ccable_pF > 0 && <Row label="C_cable (info)" value={`${r.ccable_pF.toFixed(0)} pF`} color="var(--muted)" />}
              <Row label="C_benodigd" value={`${cReq.toFixed(1)} pF`} color={cReq < 5 ? 'var(--c-danger)' : cReq < 10 ? 'var(--c-warn)' : 'var(--c-success)'} />
            </>
          }
        </div>
        <div className="info-box">
          <div style={{ fontFamily: 'Share Tech Mono', color: 'var(--c-warn)', fontSize: 10, marginBottom: 8 }}>SPANNINGSKLASSE</div>
          <Row label="V_cap (RMS)" value={`${vRms.toFixed(2)} kV`} color={vRms > 10 ? 'var(--c-danger)' : vRms > 5 ? 'var(--c-warn)' : 'var(--c-success)'} />
          <Row label="V_cap piek (×√2)" value={`${vPeak.toFixed(2)} kV`} color="var(--c-danger)" />
          <Row label="V ontwerp (×1.5 piek)" value={`${vDesign.toFixed(2)} kV`} color="var(--c-danger)" />
          <Row label="TX vermogen" value={`${r.txPowerEffective} W`} />
          <div style={{ marginTop: 8, fontSize: 10, color: 'var(--muted)' }}>
            Condensator moet minimaal {vDesign.toFixed(1)} kV aankunnen (piek × veiligheidsfactor 1.5).
          </div>
        </div>
      </div>

      {!impossible && (
        <>
          <div className="section-title" style={{ marginBottom: 8 }}>Aanbevolen condensatortypes</div>
          {CAP_TYPES.map(ct => {
            const vNum = parseFloat(ct.vMax.split('–')[0]);
            const vNumMax = parseFloat(ct.vMax.split('–')[1] ?? ct.vMax.split('–')[0]);
            const cLo = parseFloat(ct.cRange.split('–')[0]);
            const cHi = parseFloat(ct.cRange.replace('+','').split('–')[1] ?? ct.cRange.split('–')[0]);
            const vOk = (isNaN(vNumMax) ? vNum : vNumMax) >= vRms * 0.9;
            const cOk = !impossible && (cLo <= cReq && cReq <= cHi * 1.5);
            const highlight = vOk && cOk;
            return (
              <div key={ct.name} style={{ border: `1px solid ${highlight ? ct.color : 'var(--border)'}`, borderRadius: 6, padding: '10px 12px', marginBottom: 8, background: highlight ? ct.color + '11' : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: highlight ? ct.color : 'var(--text)' }}>
                    {highlight ? '✓ ' : ''}{ct.name}
                  </span>
                  <div style={{ display: 'flex', gap: 8, fontSize: 9, fontFamily: 'Share Tech Mono' }}>
                    <span style={{ color: cOk ? 'var(--c-success)' : 'var(--muted)' }}>{ct.cRange}</span>
                    <span style={{ color: vOk ? 'var(--c-success)' : 'var(--c-danger)' }}>{ct.vMax}</span>
                    <span style={{ color: 'var(--muted)' }}>{ct.pMax}</span>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{ct.notes}</div>
              </div>
            );
          })}
        </>
      )}

      <div className="info-box" style={{ marginTop: 12, fontSize: 10, fontFamily: 'Share Tech Mono' }}>
        <div style={{ color: 'var(--c-primary)', marginBottom: 6 }}>PRAKTISCHE TIPS</div>
        <div>• Afstemming: motordrive met encoder voor precies afstemmen (BW={r.BWkHz.toFixed(1)} kHz vereist nauwkeurigheid)</div>
        <div>• Isolatie: vacuüm of Teflon voor &gt;3 kV — nooit polycarbonaat of PVC</div>
        <div>• Aansluitingen: schroefklem op as geleidt RF — gebruik ferrite bead op motorbekabeling</div>
        <div>• {cReq < 20 && cReq > 0 ? `C_req=${cReq.toFixed(1)} pF is laag — mechanische precisie kritisch, hand-effect dominant` : `C_req=${cReq.toFixed(1)} pF is comfortabel bereikbaar met standaard condensator`}</div>
      </div>
    </div>
  );
}
