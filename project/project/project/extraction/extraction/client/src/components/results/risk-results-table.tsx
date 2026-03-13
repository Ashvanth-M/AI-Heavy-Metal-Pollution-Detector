import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RiskLevel } from "@/lib/risk-classification";

interface RiskResultsTableProps {
  results: {
    index: string;
    value: number;
    riskLevel: RiskLevel;
  }[];
}

export function RiskResultsTable({ results }: RiskResultsTableProps) {
  const getBadgeColor = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case "Low Risk":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Medium Risk":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "High Risk":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "No Pollution":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Index</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Risk Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">{result.index}</TableCell>
              <TableCell>{result.value.toFixed(2)}</TableCell>
              <TableCell>
                <Badge className={getBadgeColor(result.riskLevel)}>
                  {result.riskLevel}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}