// Risk level classification utility functions

// Risk level types
export type RiskLevel = 'Low Risk' | 'Medium Risk' | 'High Risk' | 'No Pollution';

// Risk level color mapping
export const getRiskLevelColor = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'Low Risk':
      return 'green';
    case 'Medium Risk':
      return 'orange';
    case 'High Risk':
      return 'red';
    case 'No Pollution':
      return 'blue';
    default:
      return 'gray';
  }
};

// Classification functions based on provided thresholds
export const classifyContaminationFactor = (cf: number): RiskLevel => {
  if (cf < 1) return 'Low Risk';
  if (cf < 3) return 'Medium Risk';
  return 'High Risk';
};

export const classifyPollutionLoadIndex = (pli: number): RiskLevel => {
  if (pli === 0) return 'No Pollution';
  if (pli <= 1) return 'Low Risk';
  return 'High Risk';
};

export const classifyHeavyMetalPollutionIndex = (hpi: number): RiskLevel => {
  if (hpi < 100) return 'Low Risk';
  if (hpi <= 300) return 'Medium Risk';
  return 'High Risk';
};

export const classifyHeavyMetalEvaluationIndex = (hei: number): RiskLevel => {
  if (hei < 40) return 'Low Risk';
  if (hei <= 80) return 'Medium Risk';
  return 'High Risk';
};

export const classifyMetalIndex = (mi: number): RiskLevel => {
  if (mi <= 1) return 'Low Risk';
  if (mi <= 3) return 'Medium Risk';
  return 'High Risk';
};

export const classifyContaminationDegree = (cd: number): RiskLevel => {
  if (cd < 6) return 'Low Risk';
  if (cd <= 12) return 'Medium Risk';
  return 'High Risk';
};

// Function to format numeric values to 2 decimal places
export const formatValue = (value: number): string => {
  return value.toFixed(2);
};

// Map risk level to category for map markers
export const riskLevelToCategory = (riskLevel: RiskLevel): 'Safe' | 'Moderate' | 'Critical' => {
  switch (riskLevel) {
    case 'Low Risk':
    case 'No Pollution':
      return 'Safe';
    case 'Medium Risk':
      return 'Moderate';
    case 'High Risk':
      return 'Critical';
    default:
      return 'Safe';
  }
};