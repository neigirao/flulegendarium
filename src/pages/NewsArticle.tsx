import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RootLayout } from "@/components/RootLayout";
import { SEOManager } from "@/components/seo/SEOManager";
import { supabase } from "@/integrations/supabase/client";
import { NewsArticle as NewsArticleType } from "@/types/news";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Eye, ArrowLeft, Share2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { toast } from "sonner";
import { SafeHtml } from "@/utils/htmlSanitizer";

const NewsArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        
        // Fetch article
        const { data, error } = await supabase
          .from('news_articles')
          .select(`
            *,
            category:news_categories(*)
          `)
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setNotFound(true);
          } else {
            throw error;
          }
          return;
        }

        setArticle(data);

        // Increment view count
        await supabase
          .from('news_articles')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', data.id);

      } catch (error) {
        console.error('Error fetching article:', error);
        toast.error('Erro ao carregar a notícia');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary || '',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  if (isLoading) {
    return (
      <RootLayout>
        <div className="min-h-screen bg-muted safe-area-top safe-area-bottom">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <SkeletonLoader className="h-8 w-3/4 mb-4" />
              <SkeletonLoader className="h-64 w-full mb-6" />
              <SkeletonLoader className="h-4 w-full mb-2" />
              <SkeletonLoader className="h-4 w-full mb-2" />
              <SkeletonLoader className="h-4 w-2/3 mb-4" />
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  if (notFound) {
    return (
      <RootLayout>
        <div className="min-h-screen bg-muted flex items-center justify-center safe-area-top safe-area-bottom">
          <div className="text-center">
            <div className="text-6xl mb-4">📰</div>
            <h1 className="font-display text-display-subtitle text-primary mb-2">
              Notícia não encontrada
            </h1>
            <p className="font-body text-muted-foreground mb-6">
              A notícia que você está procurando não existe ou foi removida.
            </p>
            <Button 
              onClick={() => navigate('/noticias')}
              className="touch-target-lg bg-primary hover:bg-primary/90"
            >
              Voltar ao Portal de Notícias
            </Button>
          </div>
        </div>
      </RootLayout>
    );
  }

  if (!article) return null;

  return (
    <>
      <SEOManager 
        title={`${article.title} - Portal de Notícias | Lendas do Flu`}
        description={article.summary || article.content.substring(0, 160)}
        keywords={`${article.category?.name || 'notícias'}, fluminense, tricolor, ${article.title}`}
        url={`https://lendasdoflu.com/noticias/${article.slug}`}
      />
      <RootLayout>
        <div className="min-h-screen bg-tricolor-vertical-border safe-area-top safe-area-bottom">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-8">
            <div className="container mx-auto px-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/noticias')}
                className="touch-target text-primary-foreground hover:bg-primary-foreground/20 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Portal
              </Button>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <article className="max-w-4xl mx-auto">
              {/* Article Header */}
              <header className="mb-8">
                {article.category && (
                  <Badge className="bg-secondary text-secondary-foreground mb-4">
                    {article.category.name}
                  </Badge>
                )}
                
                <h1 className="font-display text-display-title text-primary mb-4 leading-tight">
                  {article.title}
                </h1>

                {article.summary && (
                  <p className="font-body text-display-sm text-muted-foreground mb-6 leading-relaxed">
                    {article.summary}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border">
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground font-body">
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
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{article.views_count} visualizações</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="touch-target flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartilhar
                  </Button>
                </div>
              </header>

              {/* Featured Image */}
              {article.featured_image_url && (
                <div className="mb-8">
                  <img 
                    src={article.featured_image_url} 
                    alt={article.title}
                    className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <SafeHtml 
                  html={article.content.replace(/\n/g, '<br>')}
                  className="font-body text-foreground leading-relaxed"
                />
              </div>

              {/* Share Section */}
              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center justify-between">
                  <p className="font-body text-muted-foreground">Gostou desta notícia?</p>
                  <Button
                    onClick={handleShare}
                    className="touch-target-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </RootLayout>
    </>
  );
};

export default NewsArticle;