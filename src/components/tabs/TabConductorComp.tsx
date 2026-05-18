import { useMemo } from 'react';
import { magloopCalc } from '../../calc/magloop';
import { CONDUCTORS } from '../../calc/constants';
import type { useCalculator } from '../../hooks/useCalculator';

type Calc = ReturnType<typeof useCalculator>;
interface Props { calc: Calc; }

interface Row {
  id: string;
  label: string;
  eta: number;
  Q: number;
  VcapKV: number;
  RloopMohm: number;
  CpF_req: number;
  impossible: boolean;
}

export default function TabConductorComp({ calc }: Props) {
  const { inputs } = calc;
  const currentId = inputs.conductorId;

  const rows = useMemo<Row[]>(() => {
    return Object.entries(CONDUCTORS).map(([id, def]) => {
      const r = magloopCalc({ ...inputs, conductorId: id });
      return {
        id, label: def.label,
        eta: r.eta, Q: r.Q, VcapKV: r.VcapKV,
        RloopMohm: r.Rloop * 1000,
        CpF_req: r.CpF_req,
        impossible: r.CpF_req <= 0,
      };
    }).sort((a, b) => b.eta - a.eta);
  }, [inputs]);

  const cur = rows.find(r => r.id === currentId);

  return (
    <div>
      <div className="section-title">Geleider Vergelijker</div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8 }}>
        Alle geleiders berekend met huidige lusinstellingen (⌀ {inputs.loopDiameterM.toFixed(2)} m, {inputs.fMHz.toFixed(3)} MHz, {inputs.txPowerW} W). Gesorteerd op efficiëntie ↓
      </div>

      {cur && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Geselecteerd', val: cur.label, color: 'var(--c-primary)' },
            { label: 'Efficiëntie', val: cur.eta.toFixed(2) + ' %', color: cur.eta < 1 ? 'var(--c-danger)' : 'var(--c-success)' },
            { label: 'Q-factor', val: Math.round(cur.Q).toString(), color: 'var(--c-primary)' },
            { label: 'V_cap (kV)', val: cur.VcapKV.toFixed(2), color: cur.VcapKV > 10 ? 'var(--c-danger)' : 'var(--muted)' },
          ].map(item => (
            <div key={item.label} className="stat-card">
              <span className="stat-label">{item.label}</span>
              <span className="stat-val" style={{ fontSize: 14, color: item.color }}>{item.val}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, fontFamily: 'Share Tech Mono' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              <th style={{ textAlign: 'left', padding: '4px 6px' }}>Geleider</th>
              <th style={{ textAlign: 'right', padding: '4px 6px' }}>η %</th>
              <th style={{ textAlign: 'right', padding: '4px 6px' }}>Q</th>
              <th style={{ textAlign: 'right', padding: '4px 6px' }}>V_cap kV</th>
              <th style={{ textAlign: 'right', padding: '4px 6px' }}>R_loop mΩ</th>
              <th style={{ textAlign: 'right', padding: '4px 6px' }}>C_req pF</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const isCur = row.id === currentId;
              const bg = isCur ? 'rgba(88,166,255,0.08)' : undefined;
              const etaColor = row.eta < 1 ? 'var(--c-danger)' : row.eta < 5 ? 'var(--c-warn)' : 'var(--c-success)';
              const vcapColor = row.VcapKV > 10 ? 'var(--c-danger)' : row.VcapKV > 5 ? 'var(--c-warn)' : undefined;
              return (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border)', background: bg }}>
                  <td style={{ padding: '4px 6px', color: isCur ? 'var(--c-primary)' : 'var(--text)' }}>
                    {isCur ? '▶ ' : ''}{row.label}
                  </td>
                  <td style={{ textAlign: 'right', padding: '4px 6px', color: etaColor }}>{row.eta.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '4px 6px' }}>{Math.round(row.Q)}</td>
                  <td style={{ textAlign: 'right', padding: '4px 6px', color: vcapColor }}>{row.VcapKV.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '4px 6px', color: 'var(--c-danger)' }}>{row.RloopMohm.toFixed(1)}</td>
                  <td style={{ textAlign: 'right', padding: '4px 6px', color: row.impossible ? 'var(--c-danger)' : row.CpF_req < 5 ? 'var(--c-warn)' : undefined }}>
                    {row.impossible ? 'N/A' : row.CpF_req.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, fontSize: 10, color: 'var(--muted)' }}>
        N/A = resonantie onmogelijk (C_req ≤ 0). Kleur: groen ≥5% η, oranje 1–5%, rood &lt;1%.
      </div>
    </div>
  );
}
