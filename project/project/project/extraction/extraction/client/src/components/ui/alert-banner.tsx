import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface AlertBannerProps {
  criticalCount: number;
  isVisible: boolean;
}

export function AlertBanner({ criticalCount, isVisible }: AlertBannerProps) {
  if (!isVisible || criticalCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="border-b border-border"
    >
      <Alert className="rounded-none border-0 bg-destructive text-destructive-foreground animate-pulse-slow" data-testid="critical-alert-banner">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="font-medium">
          ⚠️ Critical contamination detected in {criticalCount} samples! Immediate action required.
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
