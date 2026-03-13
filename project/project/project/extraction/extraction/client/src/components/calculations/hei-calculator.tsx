import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Info } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeavyMetal {
  name: string;
  concentration: number;
  standardValue: number;
  weight: number;
}

export function HEICalculator() {
  const [metals, setMetals] = useState<HeavyMetal[]>([
    { name: "Lead (Pb)", concentration: 0, standardValue: 0.01, weight: 0.2 },
    { name: "Cadmium (Cd)", concentration: 0, standardValue: 0.003, weight: 0.2 },
    { name: "Chromium (Cr)", concentration: 0, standardValue: 0.05, weight: 0.15 },
    { name: "Copper (Cu)", concentration: 0, standardValue: 2.0, weight: 0.15 },
    { name: "Zinc (Zn)", concentration: 0, standardValue: 3.0, weight: 0.15 },
    { name: "Iron (Fe)", concentration: 0, standardValue: 0.3, weight: 0.15 },
  ]);

  const [heiResult, setHeiResult] = useState<number | null>(null);

  const updateConcentration = (index: number, value: string) => {
    const newMetals = [...metals];
    newMetals[index].concentration = parseFloat(value) || 0;
    setMetals(newMetals);
  };

  const updateStandardValue = (index: number, value: string) => {
    const newMetals = [...metals];
    newMetals[index].standardValue = parseFloat(value) || 0;
    setMetals(newMetals);
  };

  const calculateHEI = () => {
    let hei = 0;
    
    for (const metal of metals) {
      if (metal.standardValue > 0) {
        const ratio = metal.concentration / metal.standardValue;
        hei += metal.weight * ratio;
      }
    }
    
    setHeiResult(hei);
  };

  const getHEIInterpretation = (hei: number) => {
    if (hei < 10) return { level: "Low", color: "text-green-600", description: "Minimal contamination" };
    if (hei < 20) return { level: "Medium", color: "text-yellow-600", description: "Moderate contamination" };
    if (hei < 40) return { level: "High", color: "text-orange-600", description: "High contamination" };
    return { level: "Very High", color: "text-red-600", description: "Critical contamination" };
  };

  const resetCalculator = () => {
    setMetals(metals.map(metal => ({ ...metal, concentration: 0 })));
    setHeiResult(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Heavy Metal Evaluation Index (HEI) Calculator
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  HEI evaluates the overall contamination level by comparing 
                  heavy metal concentrations to standard values with weighted factors.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {metals.map((metal, index) => (
            <motion.div
              key={metal.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg"
            >
              <div>
                <Label className="text-sm font-medium">{metal.name}</Label>
                <p className="text-xs text-muted-foreground">Weight: {metal.weight}</p>
              </div>
              <div>
                <Label htmlFor={`concentration-${index}`} className="text-xs">
                  Concentration (mg/L)
                </Label>
                <Input
                  id={`concentration-${index}`}
                  type="number"
                  step="0.001"
                  min="0"
                  value={metal.concentration || ""}
                  onChange={(e) => updateConcentration(index, e.target.value)}
                  placeholder="0.000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`standard-${index}`} className="text-xs">
                  Standard Value (mg/L)
                </Label>
                <Input
                  id={`standard-${index}`}
                  type="number"
                  step="0.001"
                  min="0"
                  value={metal.standardValue || ""}
                  onChange={(e) => updateStandardValue(index, e.target.value)}
                  placeholder="0.000"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <div className="text-sm">
                  <span className="text-muted-foreground">Ratio: </span>
                  <span className="font-medium">
                    {metal.standardValue > 0 
                      ? (metal.concentration / metal.standardValue).toFixed(3)
                      : "N/A"
                    }
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={calculateHEI} className="flex-1">
            Calculate HEI
          </Button>
          <Button onClick={resetCalculator} variant="outline">
            Reset
          </Button>
        </div>

        {heiResult !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-muted/50 rounded-lg border"
          >
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold">HEI Result</h3>
              <div className="text-3xl font-bold">{heiResult.toFixed(2)}</div>
              {(() => {
                const interpretation = getHEIInterpretation(heiResult);
                return (
                  <div className="space-y-2">
                    <div className={`text-lg font-semibold ${interpretation.color}`}>
                      {interpretation.level} Contamination
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {interpretation.description}
                    </p>
                  </div>
                );
              })()}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Calculation Details:</h4>
              <div className="text-sm space-y-1">
                {metals.map((metal, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{metal.name}:</span>
                    <span>
                      {metal.weight} × {metal.standardValue > 0 
                        ? (metal.concentration / metal.standardValue).toFixed(3)
                        : "N/A"
                      } = {metal.standardValue > 0 
                        ? (metal.weight * (metal.concentration / metal.standardValue)).toFixed(3)
                        : "0.000"
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}