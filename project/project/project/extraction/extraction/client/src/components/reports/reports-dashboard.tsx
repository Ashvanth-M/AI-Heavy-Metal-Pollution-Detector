import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Lightbulb } from "lucide-react";
import { SummaryCards } from "./summary-cards";
import { Charts } from "./charts";
import { useAnalytics, useSamples, useGenerateReport } from "@/hooks/use-samples";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export function ReportsDashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: samples = [] } = useSamples();
  const generateReportMutation = useGenerateReport();
  const { toast } = useToast();

  const handleDownloadReports = async () => {
    try {
      const result = await generateReportMutation.mutateAsync();
      toast({
        title: "Report generated",
        description: result.message,
      });
    } catch (error) {
      toast({
        title: "Report generation failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const getRecommendations = () => {
    if (!analytics) return [];

    const recommendations = [];

    if (analytics.criticalPercentage > 30) {
      recommendations.push({
        type: "critical",
        icon: "🚨",
        text: "Urgent Action Required: Over 30% of samples show critical contamination levels. Immediate water treatment and alternative water sources needed for affected areas.",
      });
    } else if (analytics.criticalPercentage > 0) {
      recommendations.push({
        type: "warning",
        icon: "⚠️",
        text: `Critical contamination detected in ${analytics.criticalPercentage}% of samples. Immediate investigation and remediation recommended for affected areas.`,
      });
    }

    if (analytics.moderatePercentage > 20) {
      recommendations.push({
        type: "moderate",
        icon: "🔍",
        text: `${analytics.moderatePercentage}% of samples require ongoing monitoring and potential treatment to prevent escalation.`,
      });
    }

    if (analytics.safePercentage > 50) {
      recommendations.push({
        type: "positive",
        icon: "✅",
        text: `Positive outlook: ${analytics.safePercentage}% of samples are within safe limits. Continue regular testing to maintain water quality standards.`,
      });
    }

    return recommendations;
  };

  if (analyticsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No data available for analysis</p>
      </div>
    );
  }

  const recommendations = getRecommendations();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold mb-4 sm:mb-0">Analysis Reports</h3>
        <Button
          onClick={handleDownloadReports}
          disabled={generateReportMutation.isPending}
          data-testid="button-download-all-reports"
        >
          <Download className="w-4 h-4 mr-2" />
          {generateReportMutation.isPending ? "Generating..." : "Download All Reports (PDF)"}
        </Button>
      </div>

      <SummaryCards analytics={analytics} />

      <Charts categoryCounts={analytics.categoryCounts} samples={samples} />

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-accent">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold mb-3 flex items-center" data-testid="heading-ai-recommendations">
              <Lightbulb className="w-5 h-5 mr-2 text-primary" />
              AI Recommendations
            </h4>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                  className="flex items-start space-x-3"
                  data-testid={`recommendation-${rec.type}`}
                >
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <p className="text-sm">
                    <strong>{rec.icon} {rec.type === "critical" ? "Urgent Action Required" : 
                           rec.type === "warning" ? "Warning" :
                           rec.type === "moderate" ? "Monitoring Recommended" : "Positive Outlook"}:</strong>{" "}
                    {rec.text}
                  </p>
                </motion.div>
              ))}
              {recommendations.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Upload sample data to receive AI-powered recommendations.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
