
function toggleInputs() { 
  const mixtureType = document.getElementById('mixtureType').value;
  const excessOxygenContainer = document.getElementById('excessOxygenContainer');
  const coContainer = document.getElementById('coContainer');
  excessOxygenContainer.style.display = mixtureType === 'lean' ? 'block' : 'none';
  coContainer.style.display = mixtureType === 'rich' ? 'block' : 'none';
  if (mixtureType !== 'lean') {
    document.getElementById('excessOxygen').value = ''; 
  }
  if (mixtureType !== 'rich') {
    document.getElementById('coMoles').value = ''; 
  }
}

function calculateMixture(n, m, mixtureType, excessO2, coMoles) {
  const y = n + m / 4; 
  const air_stoich = y * 4.76; 
  const N2_stoich = y * 3.76; 
  const MW_fuel = 12 * n + 1 * m; 
  const MW_air = 28.97; 
  const AFR_s = (air_stoich * MW_air) / MW_fuel; 
  let phi, air_actual, N2, CO2, H2O, CO, O2;
  if (mixtureType === 'stoichiometric') {
    phi = 1.0;
    air_actual = air_stoich;
    N2 = N2_stoich;
    CO2 = n;
    H2O = m / 2;
    CO = 0;
    O2 = 0;
  } else if (mixtureType === 'lean') {
    if (isNaN(excessO2) || excessO2 < 0) {
      return { error: "Please enter a valid non-negative number for excess oxygen." };
    }
    phi = y / (y + excessO2); 
    air_actual = air_stoich / phi;
    N2 = N2_stoich / phi;
    CO2 = n;
    H2O = m / 2;
    CO = 0;
    O2 = excessO2;
  } else { // rich
    if (isNaN(coMoles) || coMoles < 0 || coMoles >= n) {
      return { error: "Please enter a valid CO moles (0 ≤ CO < n)." };
    }
    phi = n / (n - coMoles); 
    air_actual = air_stoich / phi;
    N2 = N2_stoich / phi;
    CO2 = n - coMoles; 
    CO = coMoles;
    H2O = m / 2;
    O2 = 0;
  }
  const AFR = AFR_s / phi;
  const O2_actual = air_actual / 4.76; 
  const N2_reactant = O2_actual * 3.76; 
  let reaction = `C${n}H${m} + ${O2_actual.toFixed(2)}(O₂ + 3.76N₂) → `;
  let products = [];
  if (CO2 > 0) products.push(`${CO2.toFixed(2)}CO₂`);
  if (H2O > 0) products.push(`${H2O.toFixed(2)}H₂O`);
  if (N2 > 0) products.push(`${N2.toFixed(2)}N₂`);
  if (CO > 0) products.push(`${CO.toFixed(2)}CO`);
  if (O2 > 0) products.push(`${O2.toFixed(2)}O₂`);
  reaction += products.join(' + ');

  return {
    phi: phi.toFixed(2),
    air_stoich: air_stoich.toFixed(2),
    air_actual: air_actual.toFixed(2),
    AFR_s: AFR_s.toFixed(2),
    AFR: AFR.toFixed(2),
    CO2: CO2.toFixed(2),
    H2O: H2O.toFixed(2),
    N2: N2.toFixed(2),
    CO: CO > 0 ? CO.toFixed(2) : null,
    O2: O2 > 0 ? O2.toFixed(2) : null,
    reaction: reaction
  };
}

function calculate() {
  const n = parseFloat(document.getElementById('carbon').value);
  const m = parseFloat(document.getElementById('hydrogen').value);
  const mixtureType = document.getElementById('mixtureType').value;
  const excessO2 = mixtureType === 'lean' ? parseFloat(document.getElementById('excessOxygen').value) : 0;
  const coMoles = mixtureType === 'rich' ? parseFloat(document.getElementById('coMoles').value) : 0;
  if (isNaN(n) || isNaN(m) || n < 1 || m < 0) {
    document.getElementById('results').innerHTML = "Please enter valid numbers: Carbon (n ≥ 1), Hydrogen (m ≥ 0).";
    return;
  }
  if (mixtureType === 'lean' && (isNaN(excessO2) || excessO2 < 0)) {
    document.getElementById('results').innerHTML = "Please enter a valid non-negative number for excess oxygen.";
    return;
  }
  if (mixtureType === 'rich' && (isNaN(coMoles) || coMoles < 0 || coMoles >= n)) {
    document.getElementById('results').innerHTML = "Please enter a valid CO moles (0 ≤ CO < n).";
    return;
  }
  const result = calculateMixture(n, m, mixtureType, excessO2, coMoles);
  if (result.error) {
    document.getElementById('results').innerHTML = result.error;
    return;
  }
  document.getElementById('results').innerHTML = `
    <strong>${mixtureType.charAt(0).toUpperCase() + mixtureType.slice(1)} Mixture (φ = ${result.phi}):</strong><br>
    <div class="reaction">${result.reaction}</div>
    Moles of Air (stoichiometric): ${result.air_stoich} mol<br>
    Moles of Air (actual): ${result.air_actual} mol<br>
    Stoichiometric Air-Fuel Ratio: ${result.AFR_s}<br>
    Actual Air-Fuel Ratio: ${result.AFR}<br>
    <strong>Products (moles):</strong><br>
    CO₂: ${result.CO2} mol<br>
    H₂O: ${result.H2O} mol<br>
    N₂: ${result.N2} mol<br>
    ${result.CO ? `CO: ${result.CO} mol<br>` : ""}
    ${result.O2 ? `O₂ (excess): ${result.O2} mol<br>` : ""}
  `;
}
