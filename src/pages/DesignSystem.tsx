import { SEOManager } from "@/components/seo/SEOManager";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";

const colorTokens = [
  { name: "Primária (Grená)", className: "bg-primary", textClass: "text-primary-foreground", token: "--primary" },
  { name: "Secundária (Verde)", className: "bg-secondary", textClass: "text-secondary-foreground", token: "--secondary" },
  { name: "Acento", className: "bg-accent", textClass: "text-accent-foreground", token: "--accent" },
  { name: "Sucesso", className: "bg-success", textClass: "text-success-foreground", token: "--success" },
  { name: "Aviso", className: "bg-warning", textClass: "text-warning-foreground", token: "--warning" },
  { name: "Erro", className: "bg-error", textClass: "text-error-foreground", token: "--error" },
];

const typographyScale = [
  { label: "Display", className: "text-4xl font-bold tracking-tight", sample: "Design System Flulegendarium" },
  { label: "Título", className: "text-2xl font-semibold", sample: "Componentes e padrões" },
  { label: "Subtítulo", className: "text-lg text-muted-foreground", sample: "Consistência visual com foco em acessibilidade" },
  { label: "Corpo", className: "text-base", sample: "Texto padrão para a maior parte da experiência." },
  { label: "Caption", className: "text-sm text-muted-foreground", sample: "Meta-informações e apoio contextual." },
];

const spacingScale = ["2", "4", "6", "8", "12", "16"];

const DesignSystem = () => {
  return (
    <>
      <SEOManager
        title="Design System | Lendas do Flu"
        description="Fundamentos visuais e biblioteca de componentes do Flulegendarium."
        schema="WebPage"
      />

      <div className="min-h-screen page-warm bg-tricolor-vertical-border">
        <TopNavigation />

        <main id="main-content" className="container mx-auto px-4 pt-28 pb-16 space-y-8">
          <section className="space-y-3">
            <Badge variant="secondary">v1.0</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-primary">Design System</h1>
            <p className="text-muted-foreground max-w-3xl">
              Biblioteca oficial de fundamentos e componentes para manter consistência visual, acessibilidade e velocidade de implementação.
            </p>
          </section>

          <Tabs defaultValue="fundamentos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fundamentos">Fundamentos</TabsTrigger>
              <TabsTrigger value="componentes">Componentes</TabsTrigger>
            </TabsList>

            <TabsContent value="fundamentos" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paleta semântica</CardTitle>
                  <CardDescription>Use tokens CSS/Tailwind semânticos em vez de cores hardcoded.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {colorTokens.map((color) => (
                    <div key={color.name} className="space-y-2">
                      <div className={`h-24 rounded-lg ${color.className} ${color.textClass} flex items-end p-3 shadow-sm`}>
                        <span className="text-sm font-medium">{color.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Token: {color.token}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tipografia</CardTitle>
                  <CardDescription>Hierarquia clara para títulos, conteúdo e apoio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {typographyScale.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</p>
                      <p className={item.className}>{item.sample}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Escala de espaçamento</CardTitle>
                  <CardDescription>Baseada em múltiplos de 4 para ritmo visual consistente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {spacingScale.map((space) => (
                    <div key={space} className="flex items-center gap-3">
                      <span className="w-14 text-sm text-muted-foreground">{space}</span>
                      <div className="bg-primary/20 rounded" style={{ width: `${Number(space) * 4}px`, height: 12 }} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="componentes" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ações e estados</CardTitle>
                  <CardDescription>Exemplos de botões e feedback visual.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-wrap gap-3">
                    <Button>Primário</Button>
                    <Button variant="secondary">Secundário</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="destructive">Destrutivo</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                  <Separator />
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-start gap-2 rounded-md border bg-success/10 p-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-success" />
                      <p>Sucesso: ação concluída com consistência de token.</p>
                    </div>
                    <div className="flex items-start gap-2 rounded-md border bg-info/10 p-3 text-sm">
                      <Info className="h-4 w-4 mt-0.5 text-info" />
                      <p>Informação: comunicações neutras e úteis.</p>
                    </div>
                    <div className="flex items-start gap-2 rounded-md border bg-warning/10 p-3 text-sm">
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-warning" />
                      <p>Aviso: atenção do usuário sem bloquear fluxo.</p>
                    </div>
                    <div className="flex items-start gap-2 rounded-md border bg-error/10 p-3 text-sm">
                      <XCircle className="h-4 w-4 mt-0.5 text-error" />
                      <p>Erro: mensagens objetivas com orientação de correção.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Formulário padrão</CardTitle>
                  <CardDescription>Campos com label e espaçamentos padronizados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input id="nome" placeholder="Digite seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="voce@exemplo.com" />
                  </div>
                  <Button className="w-full">Enviar</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DesignSystem;
