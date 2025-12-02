
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NPSReport } from "./NPSReport";
import { FeedbackReport } from "./FeedbackReport";
import { SupportTicketsReport } from "./SupportTicketsReport";
import { ErrorMetricsReport } from "./ErrorMetricsReport";
import { UserEngagementReport } from "./UserEngagementReport";
import { MessageSquare, LifeBuoy, Star, AlertTriangle, Users } from "lucide-react";

export const ReportsOverview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-flu-grena mb-2">Relatórios & Análises</h2>
        <p className="text-gray-600">
          Monitore a satisfação dos usuários e questões operacionais
        </p>
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
          <NPSReport />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <FeedbackReport />
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <SupportTicketsReport />
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <ErrorMetricsReport />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <UserEngagementReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};
