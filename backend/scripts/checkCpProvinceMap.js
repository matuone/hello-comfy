import {
  CP_PROVINCE_RANGES,
  cpToProvinceCode,
  validateCpProvinceRanges,
} from "../services/shipping/cpProvinceMap.js";

const validation = validateCpProvinceRanges();

if (!validation.ok) {
  console.error("CP map check failed");
  if (validation.invalid.length > 0) {
    console.error("Invalid ranges:", validation.invalid);
  }
  if (validation.overlaps.length > 0) {
    console.error("Overlapping ranges:", validation.overlaps);
  }
  process.exit(1);
}

const smokeCases = [
  { cp: 1001, expected: "C" },
  { cp: 1846, expected: "B" },
  { cp: 3000, expected: "S" },
  { cp: 3500, expected: "H" },
  { cp: 3600, expected: "P" },
  { cp: 4000, expected: "T" },
  { cp: 5000, expected: "X" },
  { cp: 5300, expected: "F" },
  { cp: 5400, expected: "J" },
  { cp: 5500, expected: "M" },
  { cp: 5700, expected: "D" },
  { cp: 6200, expected: "L" },
  { cp: 8300, expected: "Q" },
  { cp: 8400, expected: "R" },
  { cp: 9300, expected: "Z" },
  { cp: 9400, expected: "V" },
];

const failures = smokeCases.filter(({ cp, expected }) => cpToProvinceCode(cp) !== expected);
if (failures.length > 0) {
  console.error("Smoke test failures:", failures.map((f) => ({ ...f, got: cpToProvinceCode(f.cp) })));
  process.exit(1);
}

const distinctCodes = new Set(CP_PROVINCE_RANGES.map((r) => r.code));
console.log("CP map check OK");
console.log(`Ranges: ${CP_PROVINCE_RANGES.length}`);
console.log(`Province codes covered: ${distinctCodes.size}`);
