import { describe, it, expect } from 'vitest';
import { reducer, DEFAULT_INPUTS } from '../../src/hooks/useCalculator';

describe('reducer', () => {
  describe('SET action', () => {
    it('updates the targeted top-level field', () => {
      const next = reducer(DEFAULT_INPUTS, { type: 'SET', key: 'fMHz', value: 7.1 });
      expect(next.fMHz).toBe(7.1);
    });

    it('leaves all other fields unchanged', () => {
      const next = reducer(DEFAULT_INPUTS, { type: 'SET', key: 'fMHz', value: 7.1 });
      expect(next.loopDiameterM).toBe(DEFAULT_INPUTS.loopDiameterM);
      expect(next.turns).toBe(DEFAULT_INPUTS.turns);
      expect(next.conductorId).toBe(DEFAULT_INPUTS.conductorId);
    });

    it('returns a new object (immutability)', () => {
      const next = reducer(DEFAULT_INPUTS, { type: 'SET', key: 'fMHz', value: 7.1 });
      expect(next).not.toBe(DEFAULT_INPUTS);
    });

    it('can update any CalcInput field', () => {
      const next = reducer(DEFAULT_INPUTS, { type: 'SET', key: 'turns', value: 3 });
      expect(next.turns).toBe(3);
    });
  });

  describe('SET_FRIIS action', () => {
    it('updates the targeted Friis sub-field', () => {
      const next = reducer(DEFAULT_INPUTS, { type: 'SET_FRIIS', key: 'distanceKm', value: 50 });
      expect(next.friis.distanceKm).toBe(50);
    });

    it('leaves other Friis fields unchanged', () => {
      const next = reducer(DEFAULT_INPUTS, { type: 'SET_FRIIS', key: 'distanceKm', value: 50 });
      expect(next.friis.rxGainDbi).toBe(DEFAULT_INPUTS.friis.rxGainDbi);
      expect(next.friis.plf).toBe(DEFAULT_INPUTS.friis.plf);
    });

    it('leaves top-level fields unchanged', () => {
      const next = reducer(DEFAULT_INPUTS, { type: 'SET_FRIIS', key: 'distanceKm', value: 50 });
      expect(next.fMHz).toBe(DEFAULT_INPUTS.fMHz);
    });

    it('produces a new friis object (immutability)', () => {
      const next = reducer(DEFAULT_INPUTS, { type: 'SET_FRIIS', key: 'distanceKm', value: 50 });
      expect(next.friis).not.toBe(DEFAULT_INPUTS.friis);
    });
  });

  describe('SET_BAND action', () => {
    it('updates both activeBandIndex and fMHz', () => {
      const next = reducer(DEFAULT_INPUTS, { type: 'SET_BAND', index: 2, fMHz: 7.1 });
      expect(next.activeBandIndex).toBe(2);
      expect(next.fMHz).toBe(7.1);
    });

    it('leaves other fields unchanged', () => {
      const next = reducer(DEFAULT_INPUTS, { type: 'SET_BAND', index: 2, fMHz: 7.1 });
      expect(next.turns).toBe(DEFAULT_INPUTS.turns);
      expect(next.loopDiameterM).toBe(DEFAULT_INPUTS.loopDiameterM);
    });
  });

  describe('unknown action type', () => {
    it('returns the same state reference for unrecognised actions', () => {
      const next = reducer(DEFAULT_INPUTS, { type: 'UNKNOWN' } as never);
      expect(next).toBe(DEFAULT_INPUTS);
    });
  });

  describe('DEFAULT_INPUTS sanity', () => {
    it('default frequency is in a valid amateur band', () => {
      expect(DEFAULT_INPUTS.fMHz).toBeGreaterThan(1);
      expect(DEFAULT_INPUTS.fMHz).toBeLessThan(30);
    });

    it('default conductor exists in the CONDUCTORS map', async () => {
      const { CONDUCTORS } = await import('../../src/calc/constants');
      expect(DEFAULT_INPUTS.conductorId in CONDUCTORS).toBe(true);
    });
  });
});
