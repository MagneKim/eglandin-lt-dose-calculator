(function () {
  "use strict";

  const { validateWeight, calculateDose, formatDose, formatAmpEquivalent } = window.EglandinCalculator;

  const form = document.querySelector("#dose-form");
  const weightInput = document.querySelector("#weight");
  const weightControl = document.querySelector("#weight-control");
  const weightError = document.querySelector("#weight-error");
  const resultPanel = document.querySelector("#result");
  const hourlyDoseOutput = document.querySelector("#hourly-dose");
  const dailyDoseOutput = document.querySelector("#daily-dose");
  const ampsPerDayOutput = document.querySelector("#amps-per-day");
  const maxDaysOutput = document.querySelector("#max-days");

  function hideResult() {
    resultPanel.hidden = true;
  }

  function clearError() {
    weightError.hidden = true;
    weightError.textContent = "";
    weightInput.removeAttribute("aria-invalid");
    weightControl.classList.remove("has-error");
  }

  function showError(message) {
    weightError.textContent = message;
    weightError.hidden = false;
    weightInput.setAttribute("aria-invalid", "true");
    weightControl.classList.add("has-error");
    weightInput.focus();
  }

  function renderResult(result) {
    hourlyDoseOutput.textContent = formatDose(result.hourlyDose);
    dailyDoseOutput.textContent = formatDose(result.dailyDose);
    ampsPerDayOutput.textContent = formatAmpEquivalent(result.ampsPerDay);
    maxDaysOutput.textContent = String(result.maxDays);
    resultPanel.hidden = false;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearError();

    const validation = validateWeight(weightInput.value);
    if (!validation.valid) {
      hideResult();
      showError(validation.message);
      return;
    }

    const transplantType = form.elements.transplantType.value;
    renderResult(calculateDose(validation.weightKg, transplantType));
  });

  form.addEventListener("input", () => {
    clearError();
    hideResult();
  });

  form.addEventListener("change", hideResult);
})();
