import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Users, Mail, Phone, Globe } from "lucide-react";

const teamMembers = [
  {
    name: "Dr. Sarah Johnson",
    role: "Environmental Scientist",
    email: "sarah.johnson@university.edu",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
  },
  {
    name: "Michael Chen",
    role: "Full Stack Developer", 
    email: "michael.chen@techcorp.com",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Data Analyst",
    email: "emily.rodriguez@research.org", 
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
  },
];

export function AboutPage() {
  return (
    <div className="space-y-8">
      {/* Project Overview */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-2xl font-bold mb-4">About Heavy Metal Pollution Monitoring</h3>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              Heavy metal contamination in groundwater poses a significant threat to public health and environmental safety. 
              This dashboard provides comprehensive analysis and visualization tools to monitor Heavy Metal Pollution Index (HPI) 
              levels across geographic regions, enabling informed decision-making for water quality management.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              The system processes water sample data to calculate HPI values and categorizes contamination levels as Safe, 
              Moderate, or Critical, providing actionable insights for environmental health professionals.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* HPI Formula */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-xl font-semibold mb-4 flex items-center">
            <Calculator className="w-6 h-6 mr-2 text-primary" />
            Heavy Metal Pollution Index (HPI) Formula
          </h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-center mb-6">
            <p className="text-lg">HPI = Σ(Wi × Qi) / Σ(Wi)</p>
            <p className="text-sm text-muted-foreground mt-2">
              Where: Wi = Weight of metal, Qi = Quality rating of metal
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{"< 100"}</div>
              <div className="text-sm font-medium text-green-700 dark:text-green-300">Safe</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">100-180</div>
              <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Moderate</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">≥ 180</div>
              <div className="text-sm font-medium text-red-700 dark:text-red-300">Critical</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Section */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-xl font-semibold mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2 text-primary" />
            Development Team
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center" data-testid={`team-member-${index}`}>
                <img 
                  src={member.image} 
                  alt={`${member.name} - ${member.role}`}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-border object-cover"
                />
                <h5 className="font-semibold" data-testid={`member-name-${index}`}>{member.name}</h5>
                <p className="text-sm text-muted-foreground" data-testid={`member-role-${index}`}>{member.role}</p>
                <p className="text-xs text-muted-foreground mt-1" data-testid={`member-email-${index}`}>{member.email}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-xl font-semibold mb-4">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-2">Research Institution</h5>
              <p className="text-muted-foreground text-sm">Environmental Monitoring Laboratory</p>
              <p className="text-muted-foreground text-sm">Department of Environmental Science</p>
              <p className="text-muted-foreground text-sm">University Research Center</p>
            </div>
            <div>
              <h5 className="font-medium mb-2">Contact Details</h5>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  contact@groundwater-monitor.org
                </p>
                <p className="text-muted-foreground text-sm flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +1 (555) 123-4567
                </p>
                <p className="text-muted-foreground text-sm flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  www.groundwater-monitor.org
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
