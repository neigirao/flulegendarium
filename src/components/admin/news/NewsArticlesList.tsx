import React, { useState } from "react";
import { useNewsArticles } from "@/hooks/use-news-articles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Eye, Trash2, Search, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface NewsArticlesListProps {
  onEditArticle: (articleId: string) => void;
}

export const NewsArticlesList = ({ onEditArticle }: NewsArticlesListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { articles, categories, isLoading, refetch } = useNewsArticles({ 
    searchTerm,
    categoryId: selectedCategory 
  });

  const filteredArticles = articles.filter(article => {
    if (statusFilter === "published") return article.is_published;
    if (statusFilter === "draft") return !article.is_published;
    if (statusFilter === "featured") return article.is_featured;
    return true;
  });

  const handleDelete = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      toast.success('Notícia deletada com sucesso!');
      refetch();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Erro ao deletar notícia');
    }
  };

  const togglePublished = async (articleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('news_articles')
        .update({ is_published: !currentStatus })
        .eq('id', articleId);

      if (error) throw error;

      toast.success(`Notícia ${!currentStatus ? 'publicada' : 'despublicada'} com sucesso!`);
      refetch();
    } catch (error) {
      console.error('Error updating article:', error);
      toast.error('Erro ao atualizar notícia');
    }
  };

  const toggleFeatured = async (articleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('news_articles')
        .update({ is_featured: !currentStatus })
        .eq('id', articleId);

      if (error) throw error;

      toast.success(`Notícia ${!currentStatus ? 'destacada' : 'removida do destaque'} com sucesso!`);
      refetch();
    } catch (error) {
      console.error('Error updating article:', error);
      toast.error('Erro ao atualizar notícia');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando notícias...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar notícias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="published">Publicadas</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
            <SelectItem value="featured">Destacadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Articles List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg text-flu-grena group-hover:text-flu-verde transition-colors">
                    {article.title}
                  </CardTitle>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {article.category && (
                      <Badge variant="secondary" className="text-xs">
                        {article.category.name}
                      </Badge>
                    )}
                    
                    <Badge 
                      variant={article.is_published ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {article.is_published ? "Publicada" : "Rascunho"}
                    </Badge>
                    
                    {article.is_featured && (
                      <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
                        Destaque
                      </Badge>
                    )}
                  </div>
                </div>

                {article.featured_image_url && (
                  <div className="w-16 h-16 flex-shrink-0">
                    <img 
                      src={article.featured_image_url} 
                      alt={article.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {article.summary && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {article.summary}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{article.author_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {format(new Date(article.created_at), "d/M/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{article.views_count}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditArticle(article.id)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Editar
                </Button>

                <Button
                  size="sm"
                  variant={article.is_published ? "secondary" : "default"}
                  onClick={() => togglePublished(article.id, article.is_published)}
                  className="flex items-center gap-1"
                >
                  {article.is_published ? "Despublicar" : "Publicar"}
                </Button>

                <Button
                  size="sm"
                  variant={article.is_featured ? "secondary" : "outline"}
                  onClick={() => toggleFeatured(article.id, article.is_featured)}
                  className="flex items-center gap-1"
                >
                  {article.is_featured ? "Remover destaque" : "Destacar"}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="flex items-center gap-1">
                      <Trash2 className="w-3 h-3" />
                      Deletar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deletar notícia</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja deletar a notícia "{article.title}"? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(article.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Deletar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-xl font-semibold text-flu-grena mb-2">
            Nenhuma notícia encontrada
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca."
              : "Comece criando sua primeira notícia."}
          </p>
        </div>
      )}
    </div>
  );
};