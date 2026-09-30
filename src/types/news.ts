export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string | null;
  summary: string | null;
  content: string;
  featured_image_url: string | null;
  category_id: string | null;
  author_name: string;
  is_featured: boolean | null;
  is_published: boolean | null;
  views_count: number | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  source?: string | null;
  url?: string | null;
  category: NewsCategory | null;
}

export interface NewsFilters {
  searchTerm?: string;
  categoryId?: string | null;
  page?: number;
  limit?: number;
  featured?: boolean;
}
