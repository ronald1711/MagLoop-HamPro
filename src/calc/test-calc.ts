import { magloopCalc } from './magloop';

function j1(x: number): number {
  const x2 = x * x;
  let term = x / 2;
  let sum = term;
  for (let m = 1; m <= 8; m++) {
    term *= -x2 / (4 * m * (m + 1));
    sum += term;
  }
  return sum;
}

console.log("Testing J1 Bessel approximation...");
const tests = [
  { x: 0.0, expected: 0.0 },
  { x: 1.0, expected: 0.44005 },
  { x: 2.0, expected: 0.57672 }
];
for (const t of tests) {
  const got = j1(t.x);
  const diff = Math.abs(got - t.expected);
  if (diff > 1e-4) {
    throw new Error(`FAIL: J1(${t.x}) = ${got}, expected ~${t.expected}`);
  }
}
console.log("PASS: Bessel J1 test passed!");

const res = magloopCalc({
  fMHz: 14.15, loopDiameterM: 1.0, shape: 'circle',
  conductorId: 'cu_tube_22', turns: 1, spacingRatio: 3.0,
  txPowerW: 100, extLossOhm: 0.05, height: 1.5, groundType: 'good'
});
if (!res.patternPoints || res.patternPoints.length !== 361) {
  throw new Error("FAIL: patternPoints not generated correctly");
}
console.log("PASS: magloopCalc returning patternPoints");

import { vswrCurve } from './magloop';

const curve = vswrCurve({
  fMHz: 14.15, loopDiameterM: 1.0, shape: 'circle',
  conductorId: 'cu_tube_22', turns: 1, spacingRatio: 3.0,
  txPowerW: 100, extLossOhm: 0.05, height: 1.5, groundType: 'good'
}, res);

if (!curve || curve.length !== 100) {
  throw new Error("FAIL: vswrCurve length not 100");
}

let minVswr = 999;
let minF = 0;
for (const pt of curve) {
  if (pt.vswr < minVswr) {
    minVswr = pt.vswr;
    minF = pt.fMHz;
  }
}
console.log(`Min VSWR found: ${minVswr} at ${minF} MHz`);
if (minVswr > 1.2) {
  throw new Error(`FAIL: VSWR minimum is too high (${minVswr}), expected close to 1.0`);
}
console.log("PASS: vswrCurve test passed!");

import { generateNecFile } from './necExport';
console.log("Testing NEC export generation...");
const necTextCircle = generateNecFile({
  fMHz: 14.15, loopDiameterM: 1.0, shape: 'circle',
  conductorId: 'cu_tube_22', turns: 1, spacingRatio: 3.0,
  txPowerW: 100, extLossOhm: 0.05, height: 1.5, groundType: 'good'
}, res);

if (!necTextCircle.includes("GW  1 ") || !necTextCircle.includes("LD  0  5") || !necTextCircle.includes("GN  2")) {
  throw new Error("FAIL: NEC Circle export invalid content");
}

const necTextSquare = generateNecFile({
  fMHz: 14.15, loopDiameterM: 1.0, shape: 'square',
  conductorId: 'cu_tube_22', turns: 1, spacingRatio: 3.0,
  txPowerW: 100, extLossOhm: 0.05, height: 1.5, groundType: 'good'
}, res);

if (!necTextSquare.includes("GW  1 ") || !necTextSquare.includes("LD  0  3") || !necTextSquare.includes("EX  0  1")) {
  throw new Error("FAIL: NEC Square export invalid content");
}

console.log("PASS: NEC export generation passed!");

