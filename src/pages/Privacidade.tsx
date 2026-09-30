import { Link } from "react-router-dom";

const UPDATED = "27 de setembro de 2026";

/**
 * Política de privacidade do Lendas do Flu, em linguagem direta (LGPD, Lei 13.709/2018).
 * Página pública: não exige login e precisa existir também para a revisão da App Store.
 */
const Privacidade = () => {
  return (
    <main className="min-h-screen bg-background px-5 py-10">
      <article className="mx-auto max-w-2xl space-y-4 leading-relaxed text-foreground">
        <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          ← Voltar para o início
        </Link>

        <h1 className="pt-4 text-2xl font-bold">Política de privacidade</h1>
        <p className="text-sm text-muted-foreground">Atualizada em {UPDATED}.</p>

        <p>
          O Lendas do Flu é um jogo de quizzes sobre a história e os ídolos do Fluminense. Esta página explica quais
          dados o app guarda, para quê e o que você pode fazer com eles, conforme a Lei Geral de Proteção de Dados
          (LGPD, Lei 13.709/2018). Responsável pelo tratamento: Nei Alves. Fale com a gente:{" "}
          <a href="mailto:neigirao@gmail.com" className="underline">
            neigirao@gmail.com
          </a>
          .
        </p>

        <h2 className="pt-2 text-lg font-semibold">O que guardamos</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Conta: seu e-mail e, se você entrar com o Google, nome e foto do perfil Google; com a Apple, o e-mail que a Apple informar.</li>
          <li>Jogo: pontuações, progresso, conquistas, estatísticas, desafios e preferências.</li>
          <li>Perfil: nome de exibição e foto que você escolher.</li>
        </ul>

        <h2 className="pt-2 text-lg font-semibold">Para que usamos</h2>
        <p>
          Para fazer o jogo funcionar: salvar seu progresso, montar rankings e lembrar suas preferências. Também usamos
          métricas de uso para entender como o jogo é usado e corrigir falhas. Não vendemos seus dados. O serviço se baseia
          na execução da conta; para métricas, respeitamos os direitos previstos na LGPD.
        </p>

        <h2 className="pt-2 text-lg font-semibold">Com quem os dados passam</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Supabase: login social (Google ou Apple) e banco de dados onde seu jogo fica guardado.</li>
          <li>Google: se você escolher entrar com o Google, o login passa pela sua conta Google.</li>
          <li>Google Analytics 4: mede visitas e interações com o jogo para melhorar o app. O Google pode usar cookies ou identificadores de dispositivo para essas métricas.</li>
          <li>Sentry: registra erros e uma amostra reduzida de desempenho para corrigir falhas. Não gravamos sessões nem habilitamos o envio padrão de dados pessoais.</li>
          <li>Vercel Speed Insights: métricas anônimas de desempenho do site.</li>
          <li>Lovable: hospedagem do site.</li>
        </ul>

        <h2 className="pt-2 text-lg font-semibold">O que fica público</h2>
        <p>
          Rankings e páginas públicas de estatísticas mostram apenas seu nome de exibição e seu desempenho no jogo.
          O perfil também pode mostrar a foto escolhida por você.
        </p>

        <h2 className="pt-2 text-lg font-semibold">Cookies e armazenamento no navegador</h2>
        <p>
          Usamos o armazenamento local do navegador para manter você conectado e lembrar preferências. Não usamos
          cookies de publicidade. O Google Analytics pode usar cookies ou identificadores para medir visitas e interações.
        </p>

        <h2 className="pt-2 text-lg font-semibold">Seus direitos</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Corrigir: as informações do seu perfil podem ser editadas no próprio app.</li>
          <li>
            Exportar ou apagar: para receber uma cópia dos seus dados ou excluir sua conta e todos os dados, escreva
            para{" "}
            <a href="mailto:neigirao@gmail.com" className="underline">
              neigirao@gmail.com
            </a>
            .
          </li>
        </ul>

        <h2 className="pt-2 text-lg font-semibold">Mudanças</h2>
        <p>Se esta política mudar, a data no topo é atualizada.</p>

        <p>
          Veja também os <Link to="/termos" className="underline">Termos de uso</Link>.
        </p>
      </article>
    </main>
  );
};

export default Privacidade;
