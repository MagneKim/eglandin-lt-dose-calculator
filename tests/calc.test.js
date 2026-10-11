"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  CALCULATION_CONSTANTS,
  validateWeight,
  calculateDose,
  formatDose,
  formatAmpEquivalent
} = require("../dist/calc.js");

const cases = [
  [40, 24, 576, 57.6],
  [50, 30, 720, 72.0],
  [60, 36, 864, 86.4],
  [70, 42, 1008, 100.8],
  [80, 48, 1152, 115.2],
  [100, 60, 1440, 144.0]
];

test("calculates all supplied reference cases without rounding internally", () => {
  for (const [weight, hourly, daily, amps] of cases) {
    const result = calculateDose(weight, "compatible");
    assert.equal(result.hourlyDose, hourly);
    assert.equal(result.dailyDose, daily);
    assert.equal(result.ampsPerDay, amps);
    assert.equal(result.maxDays, 7);
  }
});

test("ABO type changes duration only", () => {
  const compatible = calculateDose(70, "compatible");
  const incompatible = calculateDose(70, "incompatible");
  assert.deepEqual(
    { ...compatible, maxDays: undefined },
    { ...incompatible, maxDays: undefined }
  );
  assert.equal(compatible.maxDays, 7);
  assert.equal(incompatible.maxDays, 14);
});

test("supports decimal weight and retains calculation precision", () => {
  const result = calculateDose(70.25, "compatible");
  assert.equal(result.hourlyDose, 42.15);
  assert.ok(Math.abs(result.dailyDose - 1011.6) < Number.EPSILON * 1000);
  assert.ok(Math.abs(result.ampsPerDay - 101.16) < Number.EPSILON * 1000);
  assert.equal(formatAmpEquivalent(result.ampsPerDay), "101.2");
});

test("formats results with grouping and required amp precision", () => {
  assert.equal(formatDose(1008), "1,008");
  assert.equal(formatDose(42.15), "42.15");
  assert.equal(formatAmpEquivalent(72), "72.0");
  assert.equal(formatAmpEquivalent(100.8), "100.8");
});

test("validates empty, alphabetic, malformed, zero, negative, and large values", () => {
  assert.deepEqual(validateWeight(""), { valid: false, message: "환자 체중을 입력해 주세요." });
  assert.deepEqual(validateWeight("abc"), { valid: false, message: "체중은 숫자로 입력해 주세요." });
  assert.equal(validateWeight("70kg").valid, false);
  assert.equal(validateWeight("1e2").valid, false);
  assert.equal(validateWeight("1..2").valid, false);
  assert.deepEqual(validateWeight("0"), { valid: false, message: "0보다 큰 체중을 입력해 주세요." });
  assert.deepEqual(validateWeight("-1"), { valid: false, message: "0보다 큰 체중을 입력해 주세요." });
  assert.equal(validateWeight("Infinity").valid, false);
  assert.equal(validateWeight("NaN").valid, false);
  assert.equal(validateWeight(String(CALCULATION_CONSTANTS.MAX_WEIGHT_KG + 1)).valid, false);
});

test("accepts valid integers and decimals through the operational input guard", () => {
  assert.deepEqual(validateWeight(" 70.5 "), { valid: true, weightKg: 70.5 });
  assert.deepEqual(validateWeight("300"), { valid: true, weightKg: 300 });
});

test("rejects invalid direct calculation arguments", () => {
  assert.throws(() => calculateDose(0, "compatible"), RangeError);
  assert.throws(() => calculateDose(Number.NaN, "compatible"), RangeError);
  assert.throws(() => calculateDose(70, "unknown"), RangeError);
});
