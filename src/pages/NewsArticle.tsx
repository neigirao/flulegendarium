import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RootLayout } from "@/components/RootLayout";
import { SEOHead } from "@/components/SEOHead";
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
        <div className="min-h-screen bg-gray-50">
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📰</div>
            <h1 className="text-2xl font-bold text-flu-grena mb-2">
              Notícia não encontrada
            </h1>
            <p className="text-gray-600 mb-6">
              A notícia que você está procurando não existe ou foi removida.
            </p>
            <Button 
              onClick={() => navigate('/noticias')}
              className="bg-flu-grena hover:bg-flu-grena/90"
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
      <SEOHead 
        title={`${article.title} - Portal de Notícias | Lendas do Flu`}
        description={article.summary || article.content.substring(0, 160)}
        keywords={`${article.category?.name || 'notícias'}, fluminense, tricolor, ${article.title}`}
        url={`https://flulegendarium.lovable.app/noticias/${article.slug}`}
      />
      <RootLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-flu-grena to-flu-verde text-white py-8">
            <div className="container mx-auto px-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/noticias')}
                className="text-white hover:bg-white/20 mb-4"
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
                  <Badge className="bg-flu-verde text-white mb-4">
                    {article.category.name}
                  </Badge>
                )}
                
                <h1 className="text-3xl md:text-4xl font-bold text-flu-grena mb-4 leading-tight">
                  {article.title}
                </h1>

                {article.summary && (
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                    {article.summary}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-200">
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
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
                    className="flex items-center gap-2"
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
                  className="text-gray-800 leading-relaxed"
                />
              </div>

              {/* Share Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">Gostou desta notícia?</p>
                  <Button
                    onClick={handleShare}
                    className="bg-flu-verde hover:bg-flu-verde/90 text-white"
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