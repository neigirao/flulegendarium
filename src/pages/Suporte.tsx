import { Link } from "react-router-dom";
import { SEOManager } from "@/components/seo/SEOManager";

export default function Suporte() {
  return (
    <main className="min-h-screen bg-background px-5 py-10">
      <SEOManager title="Suporte | Lendas do Flu" description="Ajuda e contato do Lendas do Flu." schema="WebPage" />
      <article className="mx-auto max-w-2xl space-y-5 leading-relaxed text-foreground">
        <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">← Voltar para o início</Link>
        <h1 className="pt-4 text-3xl font-bold">Suporte</h1>
        <p>Lendas do Flu é um quiz independente para testar seu conhecimento sobre jogadores, décadas e camisas históricas do Fluminense. Não é um aplicativo oficial do clube.</p>
        <h2 className="text-xl font-semibold">Precisa de ajuda?</h2>
        <p>Se tiver problemas para entrar, jogar ou acompanhar seu progresso, envie um e-mail com uma descrição do problema e, se possível, o modelo do aparelho e a versão do app.</p>
        <p>Contato: <a className="underline" href="mailto:neigirao@gmail.com">neigirao@gmail.com</a></p>
        <p>Para dúvidas sobre seus dados ou exclusão da conta, consulte a <Link to="/privacidade" className="underline">política de privacidade</Link> ou escreva para o mesmo endereço.</p>
      </article>
    </main>
  );
}
