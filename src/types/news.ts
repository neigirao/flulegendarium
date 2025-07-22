export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  featured_image_url?: string;
  category_id?: string;
  author_name: string;
  is_featured: boolean;
  is_published: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  published_at: string;
  category?: NewsCategory;
}

export interface NewsFilters {
  searchTerm?: string;
  categoryId?: string | null;
  page?: number;
  limit?: number;
  featured?: boolean;
}