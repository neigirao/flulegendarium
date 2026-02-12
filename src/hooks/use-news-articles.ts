import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NewsArticle, NewsCategory, NewsFilters } from "@/types/news";
import { logger } from "@/utils/logger";

export const useNewsArticles = (filters: NewsFilters = {}) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | null>(null);
  const [popularArticles, setPopularArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('news_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      logger.error('Error fetching categories', 'NEWS_ARTICLES', err);
      setError('Erro ao carregar categorias');
    }
  };

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('news_articles')
        .select(`
          *,
          category:news_categories(*)
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      // Apply filters
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,summary.ilike.%${filters.searchTerm}%,content.ilike.%${filters.searchTerm}%`);
      }

      if (filters.featured !== undefined) {
        query = query.eq('is_featured', filters.featured);
      }

      if (filters.limit) {
        const offset = ((filters.page || 1) - 1) * filters.limit;
        query = query.range(offset, offset + filters.limit - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      logger.error('Error fetching articles', 'NEWS_ARTICLES', err);
      setError('Erro ao carregar notícias');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeaturedArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          category:news_categories(*)
        `)
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setFeaturedArticle(data || null);
    } catch (err) {
      logger.error('Error fetching featured article', 'NEWS_ARTICLES', err);
    }
  };

  const fetchPopularArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          category:news_categories(*)
        `)
        .eq('is_published', true)
        .order('views_count', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPopularArticles(data || []);
    } catch (err) {
      logger.error('Error fetching popular articles', 'NEWS_ARTICLES', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchFeaturedArticle();
    fetchPopularArticles();
  }, []);

  useEffect(() => {
    fetchArticles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.searchTerm, filters.categoryId, filters.page, filters.limit, filters.featured]);

  return {
    articles,
    featuredArticle,
    popularArticles,
    categories,
    isLoading,
    error,
    refetch: fetchArticles
  };
};