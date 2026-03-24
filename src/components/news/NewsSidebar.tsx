import React from "react";
import { NewsCategory, NewsArticle } from "@/types/news";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface NewsSidebarProps {
  categories: NewsCategory[];
  popularArticles: NewsArticle[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

export const NewsSidebar = ({ 
  categories, 
  popularArticles, 
  selectedCategory, 
  onCategorySelect 
}: NewsSidebarProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary text-lg">CATEGORIAS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            className={`w-full justify-start ${
              selectedCategory === null 
                ? "bg-primary text-white" 
                : "text-primary hover:bg-secondary/10"
            }`}
            onClick={() => onCategorySelect(null)}
          >
            Todas as Categorias
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className={`w-full justify-start text-sm ${
                selectedCategory === category.id 
                  ? "bg-primary text-white" 
                  : "text-primary hover:bg-secondary/10"
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Popular Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary text-lg">NOTÍCIAS POPULARES</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {popularArticles.map((article) => (
            <div 
              key={article.id}
              className="group cursor-pointer"
              onClick={() => navigate(`/noticias/${article.slug}`)}
            >
              <div className="flex gap-3">
                {article.featured_image_url && (
                  <div className="w-16 h-16 flex-shrink-0">
                    <img 
                      src={article.featured_image_url} 
                      alt={article.title}
                      className="w-full h-full object-cover rounded group-hover:opacity-80 transition-opacity"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-primary group-hover:text-secondary transition-colors line-clamp-2 mb-1">
                    {article.title}
                  </h4>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {format(new Date(article.published_at), "d/M", { locale: ptBR })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{article.views_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {popularArticles.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              Nenhuma notícia popular ainda
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};