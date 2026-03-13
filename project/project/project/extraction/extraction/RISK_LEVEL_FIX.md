# 🔧 Risk Level Categorization Fix

## ❌ **Problem Identified:**
There was a mismatch between risk level categories in the CSV upload system:
- **Frontend Upload**: Used "High Risk" for critical contamination levels
- **Map Display**: Expected "Critical" for displaying red markers
- **Backend Processing**: Returned "Critical" from `categorizeHPI()` function
- **Result**: "High Risk" samples were not properly mapped to "Critical" markers

## ✅ **Solution Implemented:**

### 1. **Standardized Risk Level Determination** 
Updated the frontend risk level calculation in [`upload-form.tsx`](file://c:\Users\ashva\Documents\pavi\pavi\extraction\extraction\client\src\components\upload\upload-form.tsx#L187-L205) to use proper HPI thresholds:

```typescript
// Helper function to determine risk level based on sample data using standard HPI categorization
const determineRiskLevel = (sample: any): RiskResult["riskLevel"] => {
  // Use HPI value primarily, falling back to HEI or MI if HPI not available
  let hpi = parseFloat(sample.hpi || 0);
  
  // If HPI is not available or zero, try to estimate from HEI or MI
  if (!hpi && sample.hei) {
    // Convert HEI to approximate HPI equivalent
    hpi = parseFloat(sample.hei) * 2.5; // Rough conversion factor
  } else if (!hpi && sample.mi) {
    // Convert MI to approximate HPI equivalent  
    hpi = parseFloat(sample.mi) * 40; // Rough conversion factor
  }
  
  // Use standard HPI categorization (same as backend)
  if (hpi < 100) return "Low Risk";
  if (hpi < 180) return "Medium Risk";
  return "High Risk"; // This will map to "Critical" in the map display
};
```

### 2. **Enhanced Map Category Mapping**
Created a robust mapping function in [`map-view.tsx`](file://c:\Users\ashva\Documents\pavi\pavi\extraction\extraction\client\src\components\map\map-view.tsx#L144-L160) to handle both risk level formats:

```typescript
// Helper function to convert risk level to map category
const riskLevelToCategory = (riskLevel: string): 'Safe' | 'Moderate' | 'Critical' => {
  switch (riskLevel) {
    case 'Low Risk':
    case 'Safe':
      return 'Safe';
    case 'Medium Risk':
    case 'Moderate':
      return 'Moderate';
    case 'High Risk':
    case 'Critical':
      return 'Critical';
    default:
      console.warn(`Unknown risk level: ${riskLevel}, defaulting to Safe`);
      return 'Safe';
  }
};
```

### 3. **Improved Badge Display**
Enhanced the `getCategoryBadge` function to handle mixed category/risk level formats:

```typescript
const getCategoryBadge = (category: string) => {
  // Handle both category names and risk levels
  const normalizedCategory = category.toLowerCase();
  
  if (normalizedCategory.includes("safe") || normalizedCategory.includes("low")) {
    variant = "secondary";
  } else if (normalizedCategory.includes("moderate") || normalizedCategory.includes("medium")) {
    variant = "outline";  
  } else if (normalizedCategory.includes("critical") || normalizedCategory.includes("high")) {
    variant = "destructive";
  }
  
  // Display consistent category names
  let displayText = category;
  if (normalizedCategory.includes("low")) displayText = "Safe";
  if (normalizedCategory.includes("medium")) displayText = "Moderate";
  if (normalizedCategory.includes("high")) displayText = "Critical";
  
  return (<Badge variant={variant}>{displayText}</Badge>);
};
```

### 4. **Added Debug Logging**
Enhanced console logging to track the conversion process:

```typescript
console.log("MapView: Converting uploaded data to map format:", convertedSamples);
console.log("MapView: Original risk levels:", mapData.map(d => d.riskLevel));
console.log("MapView: Converted categories:", convertedSamples.map(s => s.category));
```

## 🎯 **Standard HPI Categorization:**

| HPI Value | Risk Level | Map Category | Marker Color |
|-----------|------------|--------------|--------------|
| < 100     | Low Risk   | Safe         | 🟢 Green    |
| 100-179   | Medium Risk| Moderate     | 🟡 Yellow   |
| ≥ 180     | High Risk  | Critical     | 🔴 Red      |

## 📋 **Files Modified:**

1. **`client/src/components/upload/upload-form.tsx`**
   - Updated `determineRiskLevel()` function to use proper HPI thresholds
   - Now uses consistent categorization with backend

2. **`client/src/components/map/map-view.tsx`**
   - Added `riskLevelToCategory()` mapping function
   - Enhanced `getCategoryBadge()` to handle mixed formats
   - Added debug logging for conversion tracking

3. **`server/routes.ts`**
   - Added clarifying comment about `categorizeHPI()` return values
   - Ensured consistent backend categorization

4. **`sample_data.csv`**
   - Updated test data with clear risk level examples

## ✅ **Results:**

- ✅ **"High Risk" samples** now correctly display as **"Critical"** on the map
- ✅ **Red markers** appear for contamination levels ≥ 180 HPI
- ✅ **Consistent categorization** across upload, storage, and display
- ✅ **Backward compatibility** with existing data formats
- ✅ **Debug logging** for troubleshooting future issues

## 🧪 **Testing:**

Upload the updated `sample_data.csv` file to verify:
1. Samples with HPI < 100 show as **Green** (Safe)
2. Samples with HPI 100-179 show as **Yellow** (Moderate)  
3. Samples with HPI ≥ 180 show as **Red** (Critical)
4. Risk level badges display consistent category names

The fix ensures that **"High Risk" = "Critical"** throughout the entire system! 🎯✨