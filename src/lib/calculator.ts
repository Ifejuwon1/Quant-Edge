export function calculatePositionSize(
  capital: number,
  riskAmount: number,
  entry: number,
  stopLoss: number
) {
  if (entry <= 0 || stopLoss <= 0 || entry === stopLoss) return null;

  const riskPerTrade = riskAmount;
  const distanceToSL = Math.abs(entry - stopLoss);
  const stopLossPercentage = distanceToSL / entry;

  // Position Size = Risk / SL%
  const positionSize = riskPerTrade / stopLossPercentage;
  const leverage = positionSize / capital;
  const totalUnits = positionSize / entry;

  return {
    positionSize,
    leverage,
    totalUnits,
  };
}

export function calculateRR(entry: number, stopLoss: number, target: number) {
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(target - entry);
  if (risk === 0) return 0;
  return reward / risk;
}
