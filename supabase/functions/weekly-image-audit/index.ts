import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
// @deno-types="npm:resend@4.0.0"
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Domínios conhecidos por serem problemáticos
const KNOWN_PROBLEMATIC_DOMAINS = [
  'placar.com.br',
  'globoesporte.globo.com',
  'espn.com.br',
  'ge.globo.com',
  'lance.com.br',
  'uol.com.br',
  'estadao.com.br',
  'oglobo.globo.com',
];

interface AuditResult {
  playerId: string;
  playerName: string;
  imageUrl: string;
  isExternal: boolean;
  domain: string;
  isProblematic: boolean;
}

interface PlayerData {
  id: string;
  name: string;
  image_url: string;
}

const isProblematicDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return KNOWN_PROBLEMATIC_DOMAINS.some(domain => 
      urlObj.hostname.includes(domain)
    );
  } catch {
    return false;
  }
};

const auditPlayerImages = async (supabase: SupabaseClient): Promise<{
  total: number;
  external: number;
  problematic: number;
  local: number;
  problematicPlayers: AuditResult[];
}> => {
  console.log('🔍 Iniciando auditoria de imagens...');
  
  const { data: players, error } = await supabase
    .from('players')
    .select('id, name, image_url')
    .order('name');

  if (error) {
    console.error('❌ Erro ao buscar jogadores:', error);
    throw error;
  }

  console.log(`📊 Total de jogadores encontrados: ${(players as PlayerData[]).length}`);

  const results: AuditResult[] = [];
  let externalCount = 0;
  let problematicCount = 0;
  let localCount = 0;

  for (const player of players as PlayerData[]) {
    const isExternal = player.image_url.startsWith('http://') || 
                      player.image_url.startsWith('https://');
    
    let domain = '';
    let isProblematic = false;

    if (isExternal) {
      externalCount++;
      try {
        const url = new URL(player.image_url);
        domain = url.hostname;
        isProblematic = isProblematicDomain(player.image_url);
        
        if (isProblematic) {
          problematicCount++;
        }
      } catch {
        domain = 'URL inválida';
        isProblematic = true;
        problematicCount++;
      }
    } else {
      localCount++;
    }

    if (isProblematic) {
      results.push({
        playerId: player.id,
        playerName: player.name,
        imageUrl: player.image_url,
        isExternal,
        domain,
        isProblematic,
      });
    }
  }

  console.log(`✅ Auditoria concluída: ${problematicCount} jogadores problemáticos`);

  return {
    total: (players as PlayerData[]).length,
    external: externalCount,
    problematic: problematicCount,
    local: localCount,
    problematicPlayers: results,
  };
};

const generateEmailHtml = (auditData: {
  total: number;
  external: number;
  problematic: number;
  local: number;
  problematicPlayers: AuditResult[];
}): string => {
  const { total, external, problematic, local, problematicPlayers } = auditData;
  
  const playersListHtml = problematicPlayers.length > 0
    ? problematicPlayers.map(player => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; font-size: 14px;">${player.playerName}</td>
          <td style="padding: 12px; font-size: 12px; color: #6b7280; max-width: 300px; word-break: break-all;">
            ${player.imageUrl}
          </td>
          <td style="padding: 12px; font-size: 12px;">
            <span style="background-color: #fef2f2; color: #dc2626; padding: 4px 8px; border-radius: 4px;">
              ${player.domain}
            </span>
          </td>
        </tr>
      `).join('')
    : '<tr><td colspan="3" style="padding: 24px; text-align: center; color: #6b7280;">Nenhuma imagem problemática encontrada! 🎉</td></tr>';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
        <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7C0A33 0%, #9B1240 100%); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
              📊 Relatório Semanal de Auditoria de Imagens
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">
              Lendas do Flu - Auditoria Automática
            </p>
          </div>

          <!-- Stats Cards -->
          <div style="padding: 32px;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px;">
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px;">
                <div style="font-size: 32px; font-weight: bold; color: #111827;">${total}</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">Total de Jogadores</div>
              </div>
              <div style="background-color: #dbeafe; border-radius: 8px; padding: 20px;">
                <div style="font-size: 32px; font-weight: bold; color: #1e40af;">${external}</div>
                <div style="color: #1e40af; font-size: 14px; margin-top: 4px;">URLs Externas</div>
              </div>
              <div style="background-color: #fee2e2; border-radius: 8px; padding: 20px;">
                <div style="font-size: 32px; font-weight: bold; color: #dc2626;">${problematic}</div>
                <div style="color: #dc2626; font-size: 14px; margin-top: 4px;">Precisam Migração ⚠️</div>
              </div>
              <div style="background-color: #d1fae5; border-radius: 8px; padding: 20px;">
                <div style="font-size: 32px; font-weight: bold; color: #059669;">${local}</div>
                <div style="color: #059669; font-size: 14px; margin-top: 4px;">Locais (OK) ✅</div>
              </div>
            </div>

            <!-- Problematic Players Table -->
            ${problematic > 0 ? `
              <div style="margin-top: 32px;">
                <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-bottom: 16px;">
                  ⚠️ Jogadores que Precisam de Migração (${problematic})
                </h2>
                <div style="overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                      <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Jogador</th>
                        <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">URL da Imagem</th>
                        <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Domínio</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${playersListHtml}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : `
              <div style="margin-top: 32px; text-align: center; padding: 40px; background-color: #f0fdf4; border-radius: 8px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                <h2 style="color: #059669; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">
                  Tudo Certo!
                </h2>
                <p style="color: #6b7280; margin: 0;">
                  Nenhuma imagem problemática foi encontrada nesta auditoria.
                </p>
              </div>
            `}

            <!-- Call to Action -->
            ${problematic > 0 ? `
              <div style="margin-top: 32px; padding: 24px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <h3 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                  🔧 Ação Necessária
                </h3>
                <p style="color: #78350f; margin: 0 0 16px 0; font-size: 14px; line-height: 1.6;">
                  Acesse o painel administrativo para migrar as imagens problemáticas identificadas. A migração automática irá garantir disponibilidade e performance das imagens.
                </p>
                <a href="https://2d18f90c-a6cd-4fc2-913d-b76eb4df6c17.lovableproject.com/admin" 
                   style="display: inline-block; background-color: #7C0A33; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  Acessar Painel Admin
                </a>
              </div>
            ` : ''}

            <!-- Footer -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Este é um relatório automático gerado semanalmente.<br>
                <strong>Lendas do Flu</strong> - Sistema de Auditoria de Imagens
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0 0;">
                Data do Relatório: ${new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando auditoria semanal de imagens...');

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Executar auditoria
    const auditResults = await auditPlayerImages(supabase);

    console.log('📊 Resultados da auditoria:', auditResults);

    // Configurar Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Gerar HTML do email
    const emailHtml = generateEmailHtml(auditResults);

    // Enviar email
    console.log('📧 Enviando relatório por email...');
    
    const emailResponse = await resend.emails.send({
      from: 'Lendas do Flu <onboarding@resend.dev>',
      to: ['neigirao@gmail.com'], // Email do desenvolvedor (verificado no Resend)
      subject: `📊 Relatório Semanal de Auditoria de Imagens - ${auditResults.problematic} imagens precisam migração`,
      html: emailHtml,
    });

    if (emailResponse.error) {
      console.error('❌ Erro ao enviar email:', emailResponse.error);
      throw emailResponse.error;
    }

    console.log('✅ Email enviado com sucesso!', emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        audit: auditResults,
        emailSent: true,
        emailId: emailResponse.data?.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Erro na auditoria semanal:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        details: String(error),
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
