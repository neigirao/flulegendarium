import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NPSReport } from "./NPSReport";
import { FeedbackReport } from "./FeedbackReport";
import { SupportTicketsReport } from "./SupportTicketsReport";
import { ErrorMetricsReport } from "./ErrorMetricsReport";
import { UserEngagementReport } from "./UserEngagementReport";
import { PeriodSelector } from "../shared/PeriodSelector";
import { useReportPeriod } from "@/hooks/use-report-period";
import { MessageSquare, LifeBuoy, Star, AlertTriangle, Users } from "lucide-react";

export const ReportsOverview = () => {
  const { period, setPeriod } = useReportPeriod();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-flu-grena mb-2">Relatórios & Análises</h2>
          <p className="text-muted-foreground">
            Monitore a satisfação dos usuários e questões operacionais
          </p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <Tabs defaultValue="nps" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="nps" className="flex items-center gap-2">
            <Star size={16} />
            NPS
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare size={16} />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <LifeBuoy size={16} />
            Support
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-2">
            <AlertTriangle size={16} />
            Erros
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Users size={16} />
            Engagement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nps" className="space-y-6">
          <NPSReport days={period} />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <FeedbackReport days={period} />
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <SupportTicketsReport days={period} />
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <ErrorMetricsReport days={period} />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <UserEngagementReport days={period} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
