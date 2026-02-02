import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Challenge templates for automatic rotation
// Valid target_metric values: games_played, streak, accuracy
const challengeTemplates = [
  {
    title: "Primeira Vitória do Dia",
    description: "Complete uma partida hoje",
    challenge_type: "daily",
    target_metric: "games_played",
    target_value: 1,
    reward_points: 50,
  },
  {
    title: "Tricolor Dedicado",
    description: "Jogue 3 partidas hoje",
    challenge_type: "daily",
    target_metric: "games_played",
    target_value: 3,
    reward_points: 100,
  },
  {
    title: "Sequência Tricolor",
    description: "Faça uma sequência de 3 acertos",
    challenge_type: "daily",
    target_metric: "streak",
    target_value: 3,
    reward_points: 75,
  },
  {
    title: "Mestre das Lendas",
    description: "Faça uma sequência de 5 acertos",
    challenge_type: "daily",
    target_metric: "streak",
    target_value: 5,
    reward_points: 150,
  },
  {
    title: "Precisão Tricolor",
    description: "Alcance 50% de precisão nas respostas",
    challenge_type: "daily",
    target_metric: "accuracy",
    target_value: 50,
    reward_points: 80,
  },
  {
    title: "Mestre da Precisão",
    description: "Alcance 80% de precisão nas respostas",
    challenge_type: "daily",
    target_metric: "accuracy",
    target_value: 80,
    reward_points: 120,
  },
  {
    title: "Maratonista Flu",
    description: "Jogue 5 partidas hoje",
    challenge_type: "daily",
    target_metric: "games_played",
    target_value: 5,
    reward_points: 200,
  },
];

function getRandomChallenges(count: number = 3): typeof challengeTemplates {
  const shuffled = [...challengeTemplates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const handler = async (req: Request): Promise<Response> => {
  console.log("[rotate-daily-challenges] Function invoked");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("[rotate-daily-challenges] Missing Supabase credentials");
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get current date in UTC
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    const todayISO = today.toISOString().split('T')[0];
    const tomorrowISO = tomorrow.toISOString().split('T')[0];

    console.log(`[rotate-daily-challenges] Processing for date: ${todayISO}`);

    // 1. Deactivate expired challenges
    const { data: expiredData, error: expireError } = await supabase
      .from("daily_challenges")
      .update({ is_active: false })
      .lt("end_date", todayISO)
      .eq("is_active", true)
      .select();

    if (expireError) {
      console.error("[rotate-daily-challenges] Error expiring challenges:", expireError);
    } else {
      console.log(`[rotate-daily-challenges] Expired ${expiredData?.length || 0} challenges`);
    }

    // 2. Check if there are active challenges for today
    const { data: activeChallenges, error: activeError } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("is_active", true)
      .gte("end_date", todayISO)
      .lte("start_date", todayISO);

    if (activeError) {
      console.error("[rotate-daily-challenges] Error checking active challenges:", activeError);
      throw activeError;
    }

    console.log(`[rotate-daily-challenges] Found ${activeChallenges?.length || 0} active challenges for today`);

    // 3. If no active challenges, create new ones
    if (!activeChallenges || activeChallenges.length === 0) {
      console.log("[rotate-daily-challenges] Creating new challenges for today");
      
      const newChallenges = getRandomChallenges(3).map((template) => ({
        ...template,
        start_date: todayISO,
        end_date: tomorrowISO,
        is_active: true,
      }));

      const { data: insertedChallenges, error: insertError } = await supabase
        .from("daily_challenges")
        .insert(newChallenges)
        .select();

      if (insertError) {
        console.error("[rotate-daily-challenges] Error inserting challenges:", insertError);
        throw insertError;
      }

      console.log(`[rotate-daily-challenges] Created ${insertedChallenges?.length || 0} new challenges`);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "New challenges created",
          challenges: insertedChallenges,
          expired: expiredData?.length || 0,
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // 4. Update existing challenges if dates are wrong
    const needsUpdate = activeChallenges.some(
      (c) => c.start_date !== todayISO || c.end_date !== tomorrowISO
    );

    if (needsUpdate) {
      console.log("[rotate-daily-challenges] Updating challenge dates");
      
      for (const challenge of activeChallenges) {
        await supabase
          .from("daily_challenges")
          .update({
            start_date: todayISO,
            end_date: tomorrowISO,
          })
          .eq("id", challenge.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Challenges already active for today",
        challenges: activeChallenges,
        expired: expiredData?.length || 0,
        datesUpdated: needsUpdate,
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("[rotate-daily-challenges] Error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
};

serve(handler);
