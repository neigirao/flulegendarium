import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AddPlayerForm } from "@/components/AddPlayerForm";
import { PlayersManagement } from "@/components/admin/PlayersManagement";
import { PlayersListView } from "@/components/admin/PlayersListView";
import { LoggedUsersView } from "@/components/admin/LoggedUsersView";
import { ReportsOverview } from "@/components/admin/reports/ReportsOverview";
import { BusinessIntelligenceDashboard } from "@/components/admin/bi/BusinessIntelligenceDashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, BarChart3, UserPlus, Users, FileText, Eye, UserCheck, Brain } from "lucide-react";

export default function Admin() {
  const { isAuthenticated, isLoading, adminData, logout } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/admin/login-administrador';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-flu-verde/50 to-white">
      {/* Header do Admin */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-flu-grena">Área Administrativa - Lendas do Flu</h1>
              <p className="text-gray-600">Bem-vindo, {adminData?.username}</p>
            </div>
            <Button variant="outline" onClick={logout} className="flex items-center gap-2">
              <LogOut size={16} />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 max-w-5xl">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 size={16} />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="business-intelligence" className="flex items-center gap-2">
              <Brain size={16} />
              BI
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText size={16} />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="logged-users" className="flex items-center gap-2">
              <UserCheck size={16} />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="view-players" className="flex items-center gap-2">
              <Eye size={16} />
              Visualizar
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Users size={16} />
              Gerenciar
            </TabsTrigger>
            <TabsTrigger value="add-player" className="flex items-center gap-2">
              <UserPlus size={16} />
              Adicionar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="business-intelligence">
            <BusinessIntelligenceDashboard />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsOverview />
          </TabsContent>

          <TabsContent value="logged-users">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-flu-grena mb-4">Usuários Logados</h2>
              <LoggedUsersView />
            </div>
          </TabsContent>

          <TabsContent value="view-players">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-flu-grena mb-4">Visualizar Jogadores</h2>
              <PlayersListView />
            </div>
          </TabsContent>

          <TabsContent value="players">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-flu-grena mb-4">Gerenciar Jogadores</h2>
              <PlayersManagement />
            </div>
          </TabsContent>

          <TabsContent value="add-player">
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-flu-grena mb-4">Adicionar Novo Jogador</h2>
                <AddPlayerForm />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
