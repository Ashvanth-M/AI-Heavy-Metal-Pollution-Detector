import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Info, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContaminationData {
  id: string;
  metalName: string;
  sampleConcentration: number;
  backgroundConcentration: number;
  cf: number;
}

export function CFCalculator() {
  const [contaminationData, setContaminationData] = useState<ContaminationData[]>([
    {
      id: "1",
      metalName: "Lead (Pb)",
      sampleConcentration: 0,
      backgroundConcentration: 0.01,
      cf: 0,
    },
    {
      id: "2",
      metalName: "Cadmium (Cd)",
      sampleConcentration: 0,
      backgroundConcentration: 0.003,
      cf: 0,
    },
  ]);

  const [overallCF, setOverallCF] = useState<number | null>(null);

  const addNewMetal = () => {
    const newId = (contaminationData.length + 1).toString();
    setContaminationData([
      ...contaminationData,
      {
        id: newId,
        metalName: "",
        sampleConcentration: 0,
        backgroundConcentration: 0,
        cf: 0,
      },
    ]);
  };

  const removeMetal = (id: string) => {
    if (contaminationData.length > 1) {
      setContaminationData(contaminationData.filter(item => item.id !== id));
    }
  };

  const updateMetalName = (id: string, name: string) => {
    setContaminationData(
      contaminationData.map(item =>
        item.id === id ? { ...item, metalName: name } : item
      )
    );
  };

  const updateSampleConcentration = (id: string, value: string) => {
    const concentration = parseFloat(value) || 0;
    setContaminationData(
      contaminationData.map(item =>
        item.id === id ? { ...item, sampleConcentration: concentration } : item
      )
    );
  };

  const updateBackgroundConcentration = (id: string, value: string) => {
    const concentration = parseFloat(value) || 0;
    setContaminationData(
      contaminationData.map(item =>
        item.id === id ? { ...item, backgroundConcentration: concentration } : item
      )
    );
  };

  const calculateCF = () => {
    const updatedData = contaminationData.map(item => {
      const cf = item.backgroundConcentration > 0 
        ? item.sampleConcentration / item.backgroundConcentration 
        : 0;
      return { ...item, cf };
    });
    
    setContaminationData(updatedData);
    
    // Calculate overall CF as average
    const validCFs = updatedData.filter(item => item.cf > 0);
    const avgCF = validCFs.length > 0 
      ? validCFs.reduce((sum, item) => sum + item.cf, 0) / validCFs.length 
      : 0;
    
    setOverallCF(avgCF);
  };

  const getCFInterpretation = (cf: number) => {
    if (cf < 1) return { level: "No Contamination", color: "text-green-600", description: "Background levels" };
    if (cf < 3) return { level: "Moderate Contamination", color: "text-yellow-600", description: "Slightly elevated" };
    if (cf < 6) return { level: "Considerable Contamination", color: "text-orange-600", description: "Significantly elevated" };
    return { level: "Very High Contamination", color: "text-red-600", description: "Extremely elevated" };
  };

  const resetCalculator = () => {
    setContaminationData(
      contaminationData.map(item => ({
        ...item,
        sampleConcentration: 0,
        cf: 0,
      }))
    );
    setOverallCF(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Contamination Factor (CF) Calculator
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  CF = C_sample / C_background. Measures the ratio of metal concentration 
                  in sample to background/reference concentration.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {contaminationData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-lg"
            >
              <div>
                <Label htmlFor={`metal-name-${item.id}`} className="text-xs">
                  Metal Name
                </Label>
                <Input
                  id={`metal-name-${item.id}`}
                  type="text"
                  value={item.metalName}
                  onChange={(e) => updateMetalName(item.id, e.target.value)}
                  placeholder="e.g., Lead (Pb)"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor={`sample-${item.id}`} className="text-xs">
                  Sample Conc. (mg/L)
                </Label>
                <Input
                  id={`sample-${item.id}`}
                  type="number"
                  step="0.001"
                  min="0"
                  value={item.sampleConcentration || ""}
                  onChange={(e) => updateSampleConcentration(item.id, e.target.value)}
                  placeholder="0.000"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor={`background-${item.id}`} className="text-xs">
                  Background Conc. (mg/L)
                </Label>
                <Input
                  id={`background-${item.id}`}
                  type="number"
                  step="0.001"
                  min="0"
                  value={item.backgroundConcentration || ""}
                  onChange={(e) => updateBackgroundConcentration(item.id, e.target.value)}
                  placeholder="0.000"
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-end">
                <div className="text-sm w-full">
                  <span className="text-muted-foreground text-xs block">CF Value:</span>
                  <span className="font-medium text-lg">
                    {item.cf > 0 ? item.cf.toFixed(3) : "N/A"}
                  </span>
                  {item.cf > 0 && (
                    <div className={`text-xs ${getCFInterpretation(item.cf).color}`}>
                      {getCFInterpretation(item.cf).level}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={() => removeMetal(item.id)}
                  variant="outline"
                  size="sm"
                  disabled={contaminationData.length <= 1}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={addNewMetal} variant="outline" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Metal
          </Button>
          <Button onClick={calculateCF} className="flex-1">
            Calculate CF
          </Button>
          <Button onClick={resetCalculator} variant="outline">
            Reset
          </Button>
        </div>

        {overallCF !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-muted/50 rounded-lg border"
          >
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold">Overall CF Result</h3>
              <div className="text-3xl font-bold">{overallCF.toFixed(3)}</div>
              {(() => {
                const interpretation = getCFInterpretation(overallCF);
                return (
                  <div className="space-y-2">
                    <div className={`text-lg font-semibold ${interpretation.color}`}>
                      {interpretation.level}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {interpretation.description}
                    </p>
                  </div>
                );
              })()}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Individual CF Values:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {contaminationData.map((item, index) => (
                  <div key={index} className="flex justify-between p-2 bg-background rounded">
                    <span className="font-medium">{item.metalName || `Metal ${index + 1}`}:</span>
                    <span className={getCFInterpretation(item.cf).color}>
                      {item.cf > 0 ? item.cf.toFixed(3) : "N/A"}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                <p><strong>CF Interpretation:</strong></p>
                <p>• CF &lt; 1: No contamination (background levels)</p>
                <p>• 1 ≤ CF &lt; 3: Moderate contamination</p>
                <p>• 3 ≤ CF &lt; 6: Considerable contamination</p>
                <p>• CF ≥ 6: Very high contamination</p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}