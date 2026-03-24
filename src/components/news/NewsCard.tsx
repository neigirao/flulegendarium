import React from "react";
import { NewsArticle } from "@/types/news";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard = ({ article }: NewsCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/noticias/${article.slug}`);
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-secondary/20 hover:border-primary/30"
      onClick={handleClick}
    >
      {/* Featured Image */}
      {article.featured_image_url && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={article.featured_image_url} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {article.category && (
            <Badge className="absolute top-3 left-3 bg-secondary text-white">
              {article.category.name}
            </Badge>
          )}
        </div>
      )}

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-bold text-lg text-primary mb-2 group-hover:text-secondary transition-colors duration-300 line-clamp-2">
          {article.title}
        </h3>

        {/* Summary */}
        {article.summary && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {article.summary}
          </p>
        )}

        {/* Meta Info */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" />
            <span>{article.author_name}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>
                {format(new Date(article.published_at), "d/M/yyyy", { locale: ptBR })}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{article.views_count}</span>
            </div>
          </div>
        </div>

        {/* Read More */}
        <div className="mt-4 pt-3 border-t border-border">
          <span className="text-secondary text-sm font-medium group-hover:text-primary transition-colors duration-300">
            Ler mais →
          </span>
        </div>
      </CardContent>
    </Card>
  );
};