import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { NewsArticle, NewsCategory } from "@/types/news";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";

const newsArticleSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  summary: z.string().optional(),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  featured_image_url: z.string().optional(),
  category_id: z.string().optional(),
  author_name: z.string().min(1, "Nome do autor é obrigatório"),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
});

type NewsArticleFormData = z.infer<typeof newsArticleSchema>;

interface NewsArticleFormProps {
  articleId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const NewsArticleForm = ({ articleId, onSuccess, onCancel }: NewsArticleFormProps) => {
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<NewsArticleFormData>({
    resolver: zodResolver(newsArticleSchema),
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      content: "",
      featured_image_url: "",
      author_name: "Redação Tricolor",
      is_featured: false,
      is_published: true,
    },
  });

  useEffect(() => {
    fetchCategories();
    if (articleId && articleId !== "new") {
      fetchArticle();
    }
  }, [articleId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('news_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  const fetchArticle = async () => {
    if (!articleId || articleId === "new") return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;

      form.reset({
        title: data.title,
        slug: data.slug,
        summary: data.summary || "",
        content: data.content,
        featured_image_url: data.featured_image_url || "",
        category_id: data.category_id || "",
        author_name: data.author_name,
        is_featured: data.is_featured,
        is_published: data.is_published,
      });
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Erro ao carregar notícia');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    form.setValue('title', title);
    if (!articleId || articleId === "new") {
      const slug = generateSlug(title);
      form.setValue('slug', slug);
    }
  };

  const onSubmit = async (data: NewsArticleFormData) => {
    try {
      setIsLoading(true);

      if (articleId === "new" || !articleId) {
        // Create new article
        const { error } = await supabase
          .from('news_articles')
          .insert({
            title: data.title,
            slug: data.slug,
            summary: data.summary,
            content: data.content,
            featured_image_url: data.featured_image_url,
            category_id: data.category_id || null,
            author_name: data.author_name,
            is_featured: data.is_featured,
            is_published: data.is_published,
          });

        if (error) throw error;
        toast.success('Notícia criada com sucesso!');
      } else {
        // Update existing article
        const { error } = await supabase
          .from('news_articles')
          .update({
            ...data,
            category_id: data.category_id || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', articleId);

        if (error) throw error;
        toast.success('Notícia atualizada com sucesso!');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving article:', error);
      if (error.code === '23505') {
        toast.error('Já existe uma notícia com este slug. Tente um título diferente.');
      } else {
        toast.error('Erro ao salvar notícia');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-flu-grena">
            {articleId === "new" || !articleId ? "Nova Notícia" : "Editar Notícia"}
          </CardTitle>
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Digite o título da notícia"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="url-da-noticia" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resumo</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Breve resumo da notícia"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Conteúdo completo da notícia"
                      rows={10}
                      className="min-h-[200px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="featured_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://exemplo.com/imagem.jpg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="author_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autor *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome do autor" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap gap-6">
              <FormField
                control={form.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label>Publicar notícia</Label>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label>Destacar notícia</Label>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-flu-verde hover:bg-flu-verde/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Salvando..." : "Salvar Notícia"}
              </Button>
              
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};