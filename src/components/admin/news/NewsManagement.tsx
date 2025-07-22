import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsArticlesList } from "./NewsArticlesList";
import { NewsArticleForm } from "./NewsArticleForm";
import { NewsCategoriesManagement } from "./NewsCategoriesManagement";
import { Button } from "@/components/ui/button";
import { Plus, List, FolderOpen } from "lucide-react";

export const NewsManagement = () => {
  const [activeTab, setActiveTab] = useState("articles");
  const [editingArticle, setEditingArticle] = useState<string | null>(null);

  const handleNewArticle = () => {
    setEditingArticle("new");
    setActiveTab("form");
  };

  const handleEditArticle = (articleId: string) => {
    setEditingArticle(articleId);
    setActiveTab("form");
  };

  const handleBackToList = () => {
    setEditingArticle(null);
    setActiveTab("articles");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-flu-grena">Gerenciar Notícias</h2>
        <Button 
          onClick={handleNewArticle}
          className="bg-flu-verde hover:bg-flu-verde/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Notícia
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Artigos
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {editingArticle ? "Editar" : "Novo"} Artigo
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <NewsArticlesList onEditArticle={handleEditArticle} />
        </TabsContent>

        <TabsContent value="form">
          <NewsArticleForm 
            articleId={editingArticle}
            onSuccess={handleBackToList}
            onCancel={handleBackToList}
          />
        </TabsContent>

        <TabsContent value="categories">
          <NewsCategoriesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};