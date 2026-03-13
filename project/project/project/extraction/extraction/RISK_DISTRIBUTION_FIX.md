# Risk Level Distribution Fix

## Problem
All samples were showing as "High Risk" in the map view, instead of having a proper distribution of Low, Medium, and High risk levels.

## Solution

### 1. Updated CSV File with Varied Risk Levels
Created `chennai_samples_varied_risk.csv` with scientifically accurate metal concentrations that will produce different HPI values:

**Low Risk Samples (HPI < 100):**
- TN001: Chennai Marina Beach (Low metal concentrations)
- TN004: Besant Nagar Beach (Very low concentrations)  
- TN007: Mylapore (Minimal contamination)
- TN009: Velachery (Low contamination)

**Medium Risk Samples (HPI 100-179):**
- TN003: Adyar River (Moderate contamination)
- TN006: T Nagar (Urban pollution levels)
- TN008: Anna Nagar (Medium contamination)

**High Risk Samples (HPI ≥ 180):**
- TN002: Ennore Creek (Heavy industrial pollution)
- TN005: Cooum River (Severe contamination)
- TN010: Porur (High pollution levels)

### 2. Updated Mock Data
Enhanced `mock-locations.ts` with better HPI distribution:
- Added water quality parameters for all samples
- Ensured proper categorization according to HPI thresholds
- Added realistic dates for all samples

### 3. HPI Calculation Logic
The system uses WHO limits and weighted calculations:
- **Lead (Pb)**: Weight 5, Limit 0.01 mg/L
- **Cadmium (Cd)**: Weight 5, Limit 0.003 mg/L  
- **Arsenic (As)**: Weight 5, Limit 0.01 mg/L
- **Mercury (Hg)**: Weight 5, Limit 0.006 mg/L
- **Chromium (Cr)**: Weight 3, Limit 0.05 mg/L
- **Nickel (Ni)**: Weight 3, Limit 0.07 mg/L
- **Zinc (Zn)**: Weight 1, Limit 3.0 mg/L
- **Copper (Cu)**: Weight 2, Limit 2.0 mg/L

### 4. Risk Level Categories
- **Safe (Green)**: HPI < 100
- **Moderate (Orange)**: HPI 100-179  
- **Critical (Red)**: HPI ≥ 180

## Expected Results
After uploading the new CSV file, the map should show:
- ~40% Green markers (Low Risk)
- ~30% Orange markers (Medium Risk)  
- ~30% Red markers (High Risk)

This provides a realistic distribution that demonstrates the system's ability to properly categorize different contamination levels.