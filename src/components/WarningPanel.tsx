import type { CalcResult } from "../calc/magloop";
import type { AllInputs } from "../hooks/useCalculator";
import { CONDUCTORS, CONDUCTOR_NOTES } from "../calc/constants";
interface Props { results: CalcResult; inputs: AllInputs; }
interface Warn { id: string; cls: string; msg: (r: CalcResult, i: AllInputs) => string; cond: (r: CalcResult, i: AllInputs) => boolean; }
const WARNS: Warn[] = [
  { id:"eta",    cls:"warn-danger",   msg:()=>"Efficientie < 1%: Vrijwel onbruikbaar.",
    cond:(r)=>r.eta<1 },
  { id:"vcap",   cls:"warn-warning",  msg:()=>"Vcap > 5kV: Hoogspanningscondensator vereist.",
    cond:(r)=>r.VcapKV>5&&r.VcapKV<=10 },
  { id:"vcapc",  cls:"warn-danger",   msg:()=>"Vcap > 10kV: Extreem risico op overslag.",
    cond:(r)=>r.VcapKV>10 },
  { id:"bw",     cls:"warn-warning",  msg:()=>"BW < 5kHz: Zeer smalle bandbreedte.",
    cond:(r)=>r.BWkHz<5 },
  { id:"ctune_imp",  cls:"warn-danger",  msg:()=>"C_tune onmogelijk (≤0 pF): resonantie niet bereikbaar op deze frequentie.",
    cond:(r)=>r.CpF_req<=0 },
  { id:"ctune_prac", cls:"warn-danger",  msg:()=>"C_tune benodigd < 5pF: onpraktisch — stray capaciteit en mechanische precisie domineren.",
    cond:(r)=>r.CpF_req>0&&r.CpF_req<5 },
  { id:"lowc",   cls:"warn-warning",  msg:()=>"C_tune benodigd < 10pF: hand-effect overheerst, precisie afstemming vereist.",
    cond:(r)=>r.CpF_req>=5&&r.CpF_req<10 },
  { id:"lam",    cls:"warn-danger",   msg:()=>"Perimeter > 0.3λ: Small-loop model onzuiver.",
    cond:(r)=>r.plam>0.3 },
  { id:"int",    cls:"warn-info",     msg:()=>"Intermediaire zone: uniform-stroom aanname onnauwkeurig.",
    cond:(r)=>r.regime==="intermediate" },
  { id:"prox",   cls:"warn-warning",  msg:()=>"Spacing c/a < 2: Proximity-verlies significant.",
    cond:(_,i)=>i.turns>1&&i.spacingRatio<2 },
  { id:"gboost", cls:"warn-info",     msg:()=>"Grondreflectie actief: directiviteitswinst via image theory.",
    cond:(r,i)=>i.groundType!=="free"&&r.gndBoost>0.5 },
  { id:"lowhgt", cls:"warn-warning",  msg:()=>"Hoogte < 0.1λ: Grondverliezen domineren.",
    cond:(r,i)=>i.groundType!=="free"&&r.hLam<0.1 },
  { id:"ccable", cls:"warn-info",
    msg:(r)=>`C_cable = ${r.ccable_pF.toFixed(0)} pF (N=1 outer-only: binnengeleider floating, niet afgetrokken van C_tune). Bij N=2 series/parallel wel relevant.`,
    cond:(r)=>r.ccable_pF>0 },
  { id:"maxpwr", cls:"warn-danger",   msg:()=>"TX vermogen begrensd door geleider max_pwr!",
    cond:(r,i)=>r.txPowerEffective<i.txPowerW },
  { id:"flex",   cls:"warn-danger",   msg:()=>"Flex kanaalduct: weerstand 3-10x verhoogd. INDICATIEF.",
    cond:(_,i)=>CONDUCTORS[i.conductorId]?.cat==="flex_duct" },
  { id:"emf",    cls:"warn-warning",
    msg:(r,i)=>`Veiligheidsafstand ${r.safeDistM.toFixed(1)} m (ICNIRP H-veld, 0.073 A/m). Bij ${i.txPowerW}W indoor: houd minimaal ${(r.safeDistM*1.5).toFixed(1)} m afstand (×1.5 marge).`,
    cond:(r,i)=>i.txPowerW>10 },
  { id:"emf_hpwr", cls:"warn-danger",
    msg:(r)=>`Hoog vermogen: veiligheidsafstand ${(r.safeDistM*1.5).toFixed(1)}m. Nooit direct naast een zendende magloop staan!`,
    cond:(r,i)=>i.txPowerW>=100&&r.safeDistM>1.5 },
  { id:"lowhgt2",  cls:"warn-warning",
    msg:()=>"Hoogte < 0.5m: grondverlies Re_gnd >100 mΩ verwacht — efficiency zwaar aangetast.",
    cond:(r,i)=>i.groundType!=="free"&&i.height<0.5 },
  { id:"nearobj",  cls:"warn-info",
    msg:(r)=>`Nabij-veld zone ≈${(r.lambda/6.28).toFixed(1)}m. Metalen objecten binnen 3-6m kunnen R_loop verhogen en de lus detunen.`,
    cond:(r,i)=>i.groundType!=="free"&&i.height<3&&r.plam<0.3 },
  { id:"detune",   cls:"warn-warning",
    msg:()=>"BW < 2kHz: thermische drift en windbeweging kunnen meetbare detuning veroorzaken. Aanbevolen: motorafstemming met encoder.",
    cond:(r)=>r.BWkHz<2 },
];

const NOTE_CLS: Record<string, string> = { info: 'warn-info', warn: 'warn-warning', danger: 'warn-danger' };

export default function WarningPanel({ results, inputs }: Props) {
  const active = WARNS.filter(w => w.cond(results, inputs));
  const cond = CONDUCTORS[inputs.conductorId];
  const condNotes = cond ? cond.notes.map(k => ({ key: k, note: CONDUCTOR_NOTES[k] })).filter(x => x.note) : [];
  if (active.length === 0 && condNotes.length === 0) return null;
  return (
    <div className="warn-container">
      {condNotes.map(({ key, note }) => (
        <div key={key} className={"warn-item " + NOTE_CLS[note.level]}>{note.text}</div>
      ))}
      {active.map(w => (
        <div key={w.id} className={"warn-item "+w.cls}>{w.msg(results, inputs)}</div>
      ))}
    </div>
  );
}
