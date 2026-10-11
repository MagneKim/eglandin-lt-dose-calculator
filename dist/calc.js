(function (global) {
  "use strict";

  const CALCULATION_CONSTANTS = Object.freeze({
    DOSE_LIMIT_MCG_PER_KG_HR: 0.6,
    HOURS_PER_DAY: 24,
    AMP_MCG: 10,
    MAX_WEIGHT_KG: 300,
    MAX_DAYS: Object.freeze({
      compatible: 7,
      incompatible: 14
    })
  });

  function validateWeight(rawValue) {
    const value = String(rawValue ?? "").trim();

    if (value === "") {
      return { valid: false, message: "환자 체중을 입력해 주세요." };
    }

    if (/^-\d+(?:\.\d+)?$/.test(value)) {
      return { valid: false, message: "0보다 큰 체중을 입력해 주세요." };
    }

    if (!/^\d+(?:\.\d+)?$/.test(value)) {
      const hasLetters = /[a-zA-Z가-힣]/.test(value);
      return {
        valid: false,
        message: hasLetters ? "체중은 숫자로 입력해 주세요." : "입력한 체중을 다시 확인해 주세요."
      };
    }

    const weightKg = Number(value);

    if (!Number.isFinite(weightKg)) {
      return { valid: false, message: "입력한 체중을 다시 확인해 주세요." };
    }

    if (weightKg <= 0) {
      return { valid: false, message: "0보다 큰 체중을 입력해 주세요." };
    }

    if (weightKg > CALCULATION_CONSTANTS.MAX_WEIGHT_KG) {
      return { valid: false, message: "입력한 체중을 다시 확인해 주세요." };
    }

    return { valid: true, weightKg };
  }

  function calculateDose(weightKg, transplantType) {
    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      throw new RangeError("weightKg must be a finite number greater than zero.");
    }

    if (!Object.hasOwn(CALCULATION_CONSTANTS.MAX_DAYS, transplantType)) {
      throw new RangeError("Unsupported transplant type.");
    }

    const hourlyDose = weightKg * CALCULATION_CONSTANTS.DOSE_LIMIT_MCG_PER_KG_HR;
    const dailyDose = hourlyDose * CALCULATION_CONSTANTS.HOURS_PER_DAY;
    const ampsPerDay = dailyDose / CALCULATION_CONSTANTS.AMP_MCG;

    return {
      hourlyDose,
      dailyDose,
      ampsPerDay,
      maxDays: CALCULATION_CONSTANTS.MAX_DAYS[transplantType]
    };
  }

  function formatDose(value) {
    return new Intl.NumberFormat("ko-KR", {
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(value);
  }

  function formatAmpEquivalent(value) {
    return new Intl.NumberFormat("ko-KR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      useGrouping: true
    }).format(value);
  }

  const api = {
    CALCULATION_CONSTANTS,
    validateWeight,
    calculateDose,
    formatDose,
    formatAmpEquivalent
  };

  global.EglandinCalculator = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
