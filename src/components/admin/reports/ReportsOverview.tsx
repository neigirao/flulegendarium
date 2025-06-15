
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NPSReport } from "./NPSReport";
import { FeedbackReport } from "./FeedbackReport";
import { SupportTicketsReport } from "./SupportTicketsReport";
import { BarChart3, MessageSquare, LifeBuoy, Star } from "lucide-react";

export const ReportsOverview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-flu-grena mb-2">Relatórios & Análises</h2>
        <p className="text-gray-600">
          Monitore a satisfação dos usuários e questões de suporte
        </p>
      </div>

      <Tabs defaultValue="nps" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
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
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nps" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NPSReport />
            <Card>
              <CardHeader>
                <CardTitle>Tendências NPS</CardTitle>
                <CardDescription>
                  Evolução do NPS nos últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Gráfico de tendências em desenvolvimento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <FeedbackReport />
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <SupportTicketsReport />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Erro</CardTitle>
                <CardDescription>
                  Frequência e tipos de erros reportados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Relatório de erros em desenvolvimento</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance do App</CardTitle>
                <CardDescription>
                  Tempos de carregamento e responsividade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Métricas de performance em desenvolvimento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
