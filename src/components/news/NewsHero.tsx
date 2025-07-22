import React from "react";
import { NewsArticle } from "@/types/news";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface NewsHeroProps {
  article: NewsArticle;
}

export const NewsHero = ({ article }: NewsHeroProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/noticias/${article.slug}`);
  };

  return (
    <div 
      className="relative bg-gradient-to-r from-flu-grena to-flu-verde rounded-2xl overflow-hidden cursor-pointer group"
      onClick={handleClick}
    >
      {/* Background Image */}
      {article.featured_image_url && (
        <div className="absolute inset-0">
          <img 
            src={article.featured_image_url} 
            alt={article.title}
            className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>
      )}

      <div className="relative p-8 md:p-12 text-white">
        {/* Category Badge */}
        {article.category && (
          <Badge className="bg-flu-verde/80 text-white mb-4 text-sm">
            {article.category.name}
          </Badge>
        )}

        {/* Content */}
        <div className="max-w-3xl">
          <div className="bg-flu-verde/20 text-yellow-300 text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
            Es ja sueño
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight group-hover:text-yellow-300 transition-colors duration-300">
            {article.title}
          </h1>
          
          {article.summary && (
            <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
              {article.summary}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-white/80">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{article.author_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(article.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6">
            <span className="inline-flex items-center text-yellow-300 font-semibold group-hover:underline">
              Ler mais →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};