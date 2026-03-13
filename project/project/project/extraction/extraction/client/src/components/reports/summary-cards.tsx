import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface SummaryCardsProps {
  analytics: {
    totalSamples: number;
    safePercentage: number;
    moderatePercentage: number;
    criticalPercentage: number;
  };
}

export function SummaryCards({ analytics }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Samples",
      value: analytics.totalSamples.toString(),
      icon: BarChart3,
      color: "text-primary",
      bgColor: "bg-primary/10",
      delay: 0,
    },
    {
      title: "Safe Samples",
      value: `${analytics.safePercentage}%`,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      delay: 0.1,
    },
    {
      title: "Moderate Risk",
      value: `${analytics.moderatePercentage}%`,
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      delay: 0.2,
    },
    {
      title: "Critical Risk",
      value: `${analytics.criticalPercentage}%`,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      delay: 0.3,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: card.delay }}
          >
            <Card data-testid={`card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className={`text-3xl font-bold ${card.color}`} data-testid={`value-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
