import React from "react";
import { NewsArticle } from "@/types/news";
import { NewsCard } from "./NewsCard";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";

interface NewsGridProps {
  articles: NewsArticle[];
  isLoading: boolean;
}

export const NewsGrid = ({ articles, isLoading }: NewsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
            <SkeletonLoader className="h-48 w-full" />
            <div className="p-4 space-y-3">
              <SkeletonLoader className="h-4 w-3/4" />
              <SkeletonLoader className="h-4 w-full" />
              <SkeletonLoader className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📰</div>
        <h3 className="text-xl font-semibold text-primary mb-2">
          Nenhuma notícia encontrada
        </h3>
        <p className="text-muted-foreground">
          Tente ajustar os filtros ou buscar por outros termos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
};