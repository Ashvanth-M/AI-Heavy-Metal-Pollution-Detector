import { type Sample } from "@shared/schema";

// Standard reference values for heavy metals (mg/L) - WHO/EPA standards
export const STANDARD_VALUES = {
  lead: 0.01,      // WHO guideline
  cadmium: 0.003,  // WHO guideline
  arsenic: 0.01,   // WHO guideline
  mercury: 0.006,  // WHO guideline
  chromium: 0.05,  // WHO guideline
  nickel: 0.07,    // WHO guideline
  zinc: 3.0,       // WHO guideline
  copper: 2.0,     // WHO guideline
} as const;

// Background/natural concentrations for heavy metals (mg/L)
export const BACKGROUND_VALUES = {
  lead: 0.001,
  cadmium: 0.0001,
  arsenic: 0.001,
  mercury: 0.0001,
  chromium: 0.002,
  nickel: 0.005,
  zinc: 0.01,
  copper: 0.005,
} as const;

// Weights for HEI calculation (based on toxicity and environmental impact)
export const HEI_WEIGHTS = {
  lead: 0.2,
  cadmium: 0.2,
  arsenic: 0.15,
  mercury: 0.15,
  chromium: 0.1,
  nickel: 0.1,
  zinc: 0.05,
  copper: 0.05,
} as const;

/**
 * Calculate Heavy Metal Evaluation Index (HEI)
 * Formula: HEI = Σ(Wi × Ci/Si)
 * Where: Wi = weight factor, Ci = concentration, Si = standard value
 */
export function calculateHEI(sample: Partial<Sample>): number {
  let hei = 0;
  
  // Calculate for each metal if concentration is available
  if (sample.lead !== null && sample.lead !== undefined) {
    hei += HEI_WEIGHTS.lead * (sample.lead / STANDARD_VALUES.lead);
  }
  
  if (sample.cadmium !== null && sample.cadmium !== undefined) {
    hei += HEI_WEIGHTS.cadmium * (sample.cadmium / STANDARD_VALUES.cadmium);
  }
  
  if (sample.arsenic !== null && sample.arsenic !== undefined) {
    hei += HEI_WEIGHTS.arsenic * (sample.arsenic / STANDARD_VALUES.arsenic);
  }
  
  if (sample.mercury !== null && sample.mercury !== undefined) {
    hei += HEI_WEIGHTS.mercury * (sample.mercury / STANDARD_VALUES.mercury);
  }
  
  if (sample.chromium !== null && sample.chromium !== undefined) {
    hei += HEI_WEIGHTS.chromium * (sample.chromium / STANDARD_VALUES.chromium);
  }
  
  if (sample.nickel !== null && sample.nickel !== undefined) {
    hei += HEI_WEIGHTS.nickel * (sample.nickel / STANDARD_VALUES.nickel);
  }
  
  if (sample.zinc !== null && sample.zinc !== undefined) {
    hei += HEI_WEIGHTS.zinc * (sample.zinc / STANDARD_VALUES.zinc);
  }
  
  if (sample.copper !== null && sample.copper !== undefined) {
    hei += HEI_WEIGHTS.copper * (sample.copper / STANDARD_VALUES.copper);
  }
  
  return hei;
}

/**
 * Calculate Contamination Factor (CF) for individual metals
 * Formula: CF = Ci / Cb
 * Where: Ci = concentration in sample, Cb = background concentration
 */
export function calculateCF(concentration: number, backgroundValue: number): number {
  if (backgroundValue <= 0) return 0;
  return concentration / backgroundValue;
}

/**
 * Calculate overall CF for a sample (average of all available metals)
 */
export function calculateOverallCF(sample: Partial<Sample>): number {
  const cfValues: number[] = [];
  
  if (sample.lead !== null && sample.lead !== undefined) {
    cfValues.push(calculateCF(sample.lead, BACKGROUND_VALUES.lead));
  }
  
  if (sample.cadmium !== null && sample.cadmium !== undefined) {
    cfValues.push(calculateCF(sample.cadmium, BACKGROUND_VALUES.cadmium));
  }
  
  if (sample.arsenic !== null && sample.arsenic !== undefined) {
    cfValues.push(calculateCF(sample.arsenic, BACKGROUND_VALUES.arsenic));
  }
  
  if (sample.mercury !== null && sample.mercury !== undefined) {
    cfValues.push(calculateCF(sample.mercury, BACKGROUND_VALUES.mercury));
  }
  
  if (sample.chromium !== null && sample.chromium !== undefined) {
    cfValues.push(calculateCF(sample.chromium, BACKGROUND_VALUES.chromium));
  }
  
  if (sample.nickel !== null && sample.nickel !== undefined) {
    cfValues.push(calculateCF(sample.nickel, BACKGROUND_VALUES.nickel));
  }
  
  if (sample.zinc !== null && sample.zinc !== undefined) {
    cfValues.push(calculateCF(sample.zinc, BACKGROUND_VALUES.zinc));
  }
  
  if (sample.copper !== null && sample.copper !== undefined) {
    cfValues.push(calculateCF(sample.copper, BACKGROUND_VALUES.copper));
  }
  
  if (cfValues.length === 0) return 0;
  
  return cfValues.reduce((sum, cf) => sum + cf, 0) / cfValues.length;
}

/**
 * Get HEI interpretation
 */
export function getHEIInterpretation(hei: number): {
  level: string;
  color: string;
  description: string;
} {
  if (hei < 10) return { 
    level: "Low", 
    color: "text-green-600", 
    description: "Minimal contamination" 
  };
  if (hei < 20) return { 
    level: "Medium", 
    color: "text-yellow-600", 
    description: "Moderate contamination" 
  };
  if (hei < 40) return { 
    level: "High", 
    color: "text-orange-600", 
    description: "High contamination" 
  };
  return { 
    level: "Very High", 
    color: "text-red-600", 
    description: "Critical contamination" 
  };
}

/**
 * Calculate Pollution Load Index (PLI)
 * Formula: PLI = (CF1 × CF2 × CF3 × ... × CFn)^(1/n)
 * Where: CFn = contamination factor for each metal, n = number of metals
 */
export function calculatePLI(sample: Partial<Sample>): number {
  const cfValues: number[] = [];
  
  if (sample.lead !== null && sample.lead !== undefined) {
    cfValues.push(calculateCF(sample.lead, BACKGROUND_VALUES.lead));
  }
  
  if (sample.cadmium !== null && sample.cadmium !== undefined) {
    cfValues.push(calculateCF(sample.cadmium, BACKGROUND_VALUES.cadmium));
  }
  
  if (sample.arsenic !== null && sample.arsenic !== undefined) {
    cfValues.push(calculateCF(sample.arsenic, BACKGROUND_VALUES.arsenic));
  }
  
  if (sample.mercury !== null && sample.mercury !== undefined) {
    cfValues.push(calculateCF(sample.mercury, BACKGROUND_VALUES.mercury));
  }
  
  if (sample.chromium !== null && sample.chromium !== undefined) {
    cfValues.push(calculateCF(sample.chromium, BACKGROUND_VALUES.chromium));
  }
  
  if (sample.nickel !== null && sample.nickel !== undefined) {
    cfValues.push(calculateCF(sample.nickel, BACKGROUND_VALUES.nickel));
  }
  
  if (sample.zinc !== null && sample.zinc !== undefined) {
    cfValues.push(calculateCF(sample.zinc, BACKGROUND_VALUES.zinc));
  }
  
  if (sample.copper !== null && sample.copper !== undefined) {
    cfValues.push(calculateCF(sample.copper, BACKGROUND_VALUES.copper));
  }
  
  if (cfValues.length === 0) return 0;
  
  // Calculate geometric mean (nth root of product)
  const product = cfValues.reduce((prod, cf) => prod * cf, 1);
  return Math.pow(product, 1 / cfValues.length);
}

/**
 * Get PLI interpretation
 */
export function getPLIInterpretation(pli: number): {
  level: string;
  color: string;
  description: string;
} {
  if (pli < 1) return { 
    level: "No Pollution", 
    color: "text-green-600", 
    description: "Baseline pollution" 
  };
  if (pli < 2) return { 
    level: "Moderate Pollution", 
    color: "text-yellow-600", 
    description: "Moderate pollution" 
  };
  if (pli < 3) return { 
    level: "High Pollution", 
    color: "text-orange-600", 
    description: "High pollution" 
  };
  return { 
    level: "Very High Pollution", 
    color: "text-red-600", 
    description: "Extremely high pollution" 
  };
}

/**
 * Get CF interpretation
 */
export function getCFInterpretation(cf: number): {
  level: string;
  color: string;
  description: string;
} {
  if (cf < 1) return { 
    level: "No Contamination", 
    color: "text-green-600", 
    description: "Background levels" 
  };
  if (cf < 3) return { 
    level: "Moderate", 
    color: "text-yellow-600", 
    description: "Slightly elevated" 
  };
  if (cf < 6) return { 
    level: "Considerable", 
    color: "text-orange-600", 
    description: "Significantly elevated" 
  };
  return { 
    level: "Very High", 
    color: "text-red-600", 
    description: "Extremely elevated" 
  };
}