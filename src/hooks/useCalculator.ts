import { useReducer, useMemo, useEffect } from 'react';
import { magloopCalc, groundBoostCurve } from '../calc/magloop';
import { friisCalc, friisRangeCurve } from '../calc/friis';
import { noiseCalc, noiseCurve } from '../calc/noise';
import type { CalcInputs } from '../calc/magloop';
import type { FriisInputs } from '../calc/friis';

export interface AllInputs extends CalcInputs {
  friis: FriisInputs;
  tScene: number;
  activeBandIndex: number;
  customMaterial: 'cu' | 'al' | 'steel';
  customDiam_mm: number;
}

export const DEFAULT_INPUTS: AllInputs = {
  fMHz: 14.15, loopDiameterM: 1.0, shape: 'circle',
  conductorId: 'cu_tube_22',
  turns: 1, spacingRatio: 3.0, txPowerW: 100,
  extLossOhm: 0.05, height: 1.5, groundType: 'good',
  friis: { distanceKm: 10, rxGainDbi: 1.76, plf: 1.0, feedLossDb: 0.5 },
  tScene: 5000, activeBandIndex: 4,
  customMaterial: 'cu', customDiam_mm: 22,
};

function loadStoredInputs(): AllInputs {
  try {
    const stored = localStorage.getItem('magloop_inputs_v1');
    if (stored) return { ...DEFAULT_INPUTS, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return DEFAULT_INPUTS;
}

type Action =
  | { type: 'SET'; key: keyof AllInputs; value: unknown }
  | { type: 'SET_FRIIS'; key: keyof FriisInputs; value: number | string }
  | { type: 'SET_BAND'; index: number; fMHz: number };

export function reducer(state: AllInputs, action: Action): AllInputs {
  switch (action.type) {
    case 'SET': return { ...state, [action.key]: action.value };
    case 'SET_FRIIS': return { ...state, friis: { ...state.friis, [action.key]: action.value } };
    case 'SET_BAND': return { ...state, activeBandIndex: action.index, fMHz: action.fMHz };
    default: return state;
  }
}

export function useCalculator() {
  const [inputs, dispatch] = useReducer(reducer, undefined, loadStoredInputs);

  useEffect(() => {
    localStorage.setItem('magloop_inputs_v1', JSON.stringify(inputs));
  }, [inputs]);

  const results = useMemo(() => magloopCalc(inputs), [inputs]);

  const friisResult = useMemo(
    () => friisCalc(results, inputs.txPowerW, inputs.friis),
    [results, inputs.txPowerW, inputs.friis]
  );
  const friisRange = useMemo(
    () => friisRangeCurve(results, inputs.txPowerW, inputs.friis),
    [results, inputs.txPowerW, inputs.friis]
  );
  const noiseResult = useMemo(() => noiseCalc(results, inputs.tScene), [results, inputs.tScene]);
  const noiseData = useMemo(() => noiseCurve(inputs.tScene), [inputs.tScene]);
  const groundData = useMemo(
    () => groundBoostCurve(inputs.fMHz, inputs.groundType as 'perfect'|'good'|'poor'|'free'),
    [inputs.fMHz, inputs.groundType]
  );

  function setInput<K extends keyof AllInputs>(key: K, value: AllInputs[K]) {
    dispatch({ type: 'SET', key, value });
  }
  function setFriis(key: keyof FriisInputs, value: number | string) {
    dispatch({ type: 'SET_FRIIS', key, value });
  }
  function setBand(index: number, fMHz: number) {
    dispatch({ type: 'SET_BAND', index, fMHz });
  }

  return { inputs, setInput, setFriis, setBand, results, friisResult, friisRange, noiseResult, noiseData, groundData };
}
