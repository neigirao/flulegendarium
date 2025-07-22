import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { NewsCategory } from "@/types/news";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export const NewsCategoriesManagement = () => {
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    form.setValue('name', name);
    if (!editingCategory) {
      const slug = generateSlug(name);
      form.setValue('slug', slug);
    }
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
    form.reset({
      name: "",
      slug: "",
      description: "",
    });
  };

  const handleEditCategory = (category: NewsCategory) => {
    setEditingCategory(category.id);
    setShowForm(true);
    form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setShowForm(false);
    form.reset();
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsLoading(true);

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('news_categories')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCategory);

        if (error) throw error;
        toast.success('Categoria atualizada com sucesso!');
      } else {
        // Create new category
        const { error } = await supabase
          .from('news_categories')
          .insert({
            name: data.name,
            slug: data.slug,
            description: data.description,
          });

        if (error) throw error;
        toast.success('Categoria criada com sucesso!');
      }

      fetchCategories();
      handleCancelEdit();
    } catch (error: any) {
      console.error('Error saving category:', error);
      if (error.code === '23505') {
        toast.error('Já existe uma categoria com este nome ou slug.');
      } else {
        toast.error('Erro ao salvar categoria');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('news_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast.success('Categoria deletada com sucesso!');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao deletar categoria');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-flu-grena">Categorias de Notícias</h3>
        {!showForm && (
          <Button onClick={handleNewCategory} className="bg-flu-verde hover:bg-flu-verde/90">
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Nome da categoria"
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
                          <Input {...field} placeholder="slug-da-categoria" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descrição da categoria"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-flu-verde hover:bg-flu-verde/90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Salvando..." : "Salvar"}
                  </Button>
                  
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-flu-grena">{category.name}</h4>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {category.slug}
                  </Badge>
                </div>

                {category.description && (
                  <p className="text-sm text-gray-600">{category.description}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditCategory(category)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Editar
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" className="flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        Deletar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar categoria</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja deletar a categoria "{category.name}"? 
                          Esta ação não pode ser desfeita e pode afetar notícias existentes.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteCategory(category.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-flu-grena mb-2">
            Nenhuma categoria encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            Comece criando sua primeira categoria de notícias.
          </p>
          <Button onClick={handleNewCategory} className="bg-flu-verde hover:bg-flu-verde/90">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Categoria
          </Button>
        </div>
      )}
    </div>
  );
};