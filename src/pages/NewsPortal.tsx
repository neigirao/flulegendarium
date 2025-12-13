import React, { useState, useEffect } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOHead } from "@/components/SEOHead";
import { NewsHero } from "@/components/news/NewsHero";
import { NewsGrid } from "@/components/news/NewsGrid";
import { NewsSidebar } from "@/components/news/NewsSidebar";
import { NewsSearch } from "@/components/news/NewsSearch";
import { useNewsArticles } from "@/hooks/use-news-articles";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const NewsPortal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const { 
    articles, 
    featuredArticle, 
    popularArticles, 
    categories, 
    isLoading 
  } = useNewsArticles({ 
    searchTerm, 
    categoryId: selectedCategory,
    page: currentPage,
    limit: itemsPerPage 
  });

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil((articles?.length || 0) / itemsPerPage);

  return (
    <>
      <SEOHead 
        title="Portal de Notícias - Lendas do Flu | Notícias do Tricolor"
        description="🗞️ Fique por dentro das últimas notícias sobre o Fluminense Football Club. Notícias do time principal, base, história e muito mais!"
        keywords="notícias fluminense, portal tricolor, fluminense fc, notícias flu"
        url="https://lendasdoflu.com/noticias"
      />
      <RootLayout>
        <div className="min-h-screen bg-tricolor-vertical-border safe-area-top safe-area-bottom">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary text-primary-foreground py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h1 className="font-display text-display-hero tracking-wider mb-4">
                  NOTÍCIAS DO TRICOLOR
                </h1>
                <p className="font-body text-display-sm text-primary-foreground/90 max-w-2xl mx-auto">
                  Fique por dentro das últimas notícias sobre o Fluminense Football Club.
                </p>
              </div>
              
              <NewsSearch onSearch={handleSearch} searchTerm={searchTerm} />
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Featured Article */}
                {featuredArticle && !searchTerm && !selectedCategory && (
                  <NewsHero article={featuredArticle} />
                )}

                {/* Articles Grid */}
                <div className="mt-8">
                  {selectedCategory && (
                    <div className="mb-6">
                      <h2 className="font-display text-display-subtitle text-primary mb-2">
                        {categories?.find(c => c.id === selectedCategory)?.name}
                      </h2>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleCategorySelect(null)}
                        className="touch-target text-secondary hover:text-primary"
                      >
                        ← Voltar para todas as notícias
                      </Button>
                    </div>
                  )}

                  {searchTerm && (
                    <div className="mb-6">
                      <h2 className="font-display text-display-subtitle text-primary mb-2">
                        Resultados para "{searchTerm}"
                      </h2>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSearch("")}
                        className="touch-target text-secondary hover:text-primary"
                      >
                        ← Limpar busca
                      </Button>
                    </div>
                  )}

                  <NewsGrid articles={articles} isLoading={isLoading} />

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="touch-target flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>
                      
                      <span className="font-body text-primary font-medium">
                        {currentPage} de {totalPages}
                      </span>
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="touch-target flex items-center gap-2"
                      >
                        Próxima
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <NewsSidebar 
                  categories={categories}
                  popularArticles={popularArticles}
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                />
              </div>
            </div>
          </div>
        </div>
      </RootLayout>
    </>
  );
};

export default NewsPortal;