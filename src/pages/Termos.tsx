import { Link } from "react-router-dom";

const UPDATED = "30 de setembro de 2026";

/**
 * Termos de uso do Lendas do Flu, em linguagem direta.
 * Página pública: não exige login. Se uma regra aqui deixar de ser verdade,
 * atualize o texto no mesmo commit da mudança.
 */
const Termos = () => {
  return (
    <main className="min-h-screen bg-background px-5 py-10">
      <article className="mx-auto max-w-2xl space-y-4 leading-relaxed text-foreground">
        <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          ← Voltar para o início
        </Link>

        <h1 className="pt-4 text-2xl font-bold">Termos de uso</h1>
        <p className="text-sm text-muted-foreground">Atualizados em {UPDATED}.</p>

        <p>
          Ao criar uma conta no Lendas do Flu você concorda com estes termos. Se não concordar, não use o app.
        </p>

        <h2 className="pt-2 text-lg font-semibold">O jogo</h2>
        <p>
          O Lendas do Flu é um jogo gratuito de quizzes sobre a história e os ídolos do Fluminense, feito por um
          torcedor. É um projeto independente, sem vínculo oficial com o Fluminense Football Club. Escudos, fotos de
          jogadores e imagens históricas pertencem aos seus donos e aparecem apenas como tema das perguntas. O jogo
          está em evolução: modos e funções podem mudar, ser adicionados ou removidos.
        </p>

        <h2 className="pt-2 text-lg font-semibold">Sua conta</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Você entra com sua conta Google ou Apple, e é responsável pelo acesso a ela.</li>
          <li>Uma conta é pessoal. Não use a conta de outra pessoa.</li>
          <li>O nome de exibição que você escolher aparece nos rankings e nas páginas públicas de estatísticas.</li>
        </ul>

        <h2 className="pt-2 text-lg font-semibold">Jogo limpo</h2>
        <p>
          Não use automação, robôs, exploits ou qualquer artifício para pontuar ou manipular rankings. Contas que
          fizerem isso podem ter pontuações removidas e ser suspensas.
        </p>

        <h2 className="pt-2 text-lg font-semibold">Doações</h2>
        <p>
          As doações são voluntárias, feitas por Pix, e não compram nada: o jogo inteiro continua gratuito para todo
          mundo, com ou sem doação.
        </p>

        <h2 className="pt-2 text-lg font-semibold">Garantias e responsabilidade</h2>
        <p>
          O jogo é oferecido como está. Fazemos o possível para mantê-lo no ar e seus dados seguros, mas não garantimos
          que funcione sem interrupções ou erros.
        </p>

        <h2 className="pt-2 text-lg font-semibold">Encerramento</h2>
        <p>
          Você pode parar de jogar quando quiser. Para excluir sua conta e todos os dados, escreva para{" "}
          <a href="mailto:neigirao@gmail.com" className="underline">
            neigirao@gmail.com
          </a>
          .
        </p>

        <h2 className="pt-2 text-lg font-semibold">Mudanças e lei aplicável</h2>
        <p>
          Estes termos podem mudar; a data no topo mostra a versão atual. Vale a lei brasileira, incluindo o Código de
          Defesa do Consumidor e a LGPD.
        </p>

        <h2 className="pt-2 text-lg font-semibold">Contato</h2>
        <p>
          Fale com a gente:{" "}
          <a href="mailto:neigirao@gmail.com" className="underline">
            neigirao@gmail.com
          </a>
          . Veja também a <Link to="/privacidade" className="underline">política de privacidade</Link>.
        </p>
      </article>
    </main>
  );
};

export default Termos;
