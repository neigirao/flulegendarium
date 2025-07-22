-- Criar tabela de categorias de notícias
CREATE TABLE public.news_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de notícias
CREATE TABLE public.news_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text,
  content text NOT NULL,
  featured_image_url text,
  category_id uuid REFERENCES public.news_categories(id),
  author_name text NOT NULL DEFAULT 'Redação Tricolor',
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT true,
  views_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  published_at timestamp with time zone DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_news_articles_category_id ON public.news_articles(category_id);
CREATE INDEX idx_news_articles_published_at ON public.news_articles(published_at DESC);
CREATE INDEX idx_news_articles_is_featured ON public.news_articles(is_featured);
CREATE INDEX idx_news_articles_is_published ON public.news_articles(is_published);
CREATE INDEX idx_news_articles_slug ON public.news_articles(slug);

-- Habilitar RLS
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias
CREATE POLICY "Todos podem ver categorias" 
ON public.news_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Apenas admins podem gerenciar categorias" 
ON public.news_categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Políticas para notícias
CREATE POLICY "Todos podem ver notícias publicadas" 
ON public.news_articles 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Apenas admins podem gerenciar notícias" 
ON public.news_articles 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_news_categories_updated_at
  BEFORE UPDATE ON public.news_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir categorias padrão
INSERT INTO public.news_categories (name, slug, description) VALUES
('Time Principal', 'time-principal', 'Notícias sobre o elenco principal do Fluminense'),
('Base', 'base', 'Notícias sobre as categorias de base do clube'),
('História', 'historia', 'Conteúdo histórico e comemorativo do Fluminense'),
('Entrevistas', 'entrevistas', 'Entrevistas exclusivas com jogadores e dirigentes'),
('Transferências', 'transferencias', 'Movimentações no mercado da bola');

-- Inserir algumas notícias de exemplo
INSERT INTO public.news_articles (title, slug, summary, content, category_id, is_featured, featured_image_url) 
SELECT 
  'Fluminense Vence Clássico Contra o Flamengo',
  'fluminense-vence-classico-contra-flamengo',
  'Em um jogo emocionante o Fluminense saiu vitorioso! La cuedizo centro o Flamengo, com um gol nos minutos finais.',
  'Em uma partida eletrizante no Maracanã, o Fluminense conseguiu uma vitória histórica sobre o Flamengo por 2x1. O gol da vitória saiu nos acréscimos do segundo tempo, em uma jogada espetacular que culminou com um chute certeiro de fora da área. A torcida tricolor vibrou muito com essa conquista importante no clássico carioca.',
  c.id,
  true,
  '/lovable-uploads/efaf362c-8726-4049-98bc-ebb26dcdd4e1.png'
FROM news_categories c WHERE c.slug = 'time-principal'
LIMIT 1;

INSERT INTO public.news_articles (title, slug, summary, content, category_id, featured_image_url) 
SELECT 
  'Flu Avança para as Semifinais da Copa',
  'flu-avanca-semifinais-copa',
  'Atacante marca dois na vitória em seis minutos.',
  'O Fluminense garantiu vaga nas semifinais da Copa depois de uma apresentação brilhante. Com dois gols em seis minutos decisivos, o time mostrou força e determinação para conquistar a classificação.',
  c.id,
  '/lovable-uploads/16398385-eef5-4e38-b90a-39630732acba.png'
FROM news_categories c WHERE c.slug = 'time-principal'
LIMIT 1;

INSERT INTO public.news_articles (title, slug, summary, content, category_id, featured_image_url) 
SELECT 
  'Homenagem aos Ídolos Tricolores',
  'homenagem-idolos-tricolores',
  'Busca de vivo-aveitm âtitojoo.',
  'O Fluminense prestou uma bela homenagem aos seus maiores ídolos em cerimônia especial realizada no estádio. Foi um momento emocionante que relembrou a rica história do clube.',
  c.id,
  '/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png'
FROM news_categories c WHERE c.slug = 'historia'
LIMIT 1;