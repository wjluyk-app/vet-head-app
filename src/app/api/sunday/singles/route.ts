import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const resultInput = z.object({
  pairingId: z.string().uuid(),
  winnerTeamId: z.string().uuid().nullable(),
  halved: z.boolean(),
  closedOnHole: z.number().int().min(10).max(18).nullable(),
  resultText: z.string().trim().max(100).nullable(),
});

export async function POST(request: Request) {
  const parsed = resultInput.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: "Invalid singles result request",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    return Response.json(
      { ok: false, error: "Authentication required" },
      { status: 401 },
    );
  }

  const { data, error } = await supabase.rpc(
    "save_singles_match_result",
    {
      p_pairing_id: parsed.data.pairingId,
      p_winner_team_id: parsed.data.winnerTeamId,
      p_halved: parsed.data.halved,
      p_closed_on_hole: parsed.data.closedOnHole,
      p_result_text: parsed.data.resultText,
    },
  );

  if (error) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 409 },
    );
  }

  return Response.json({
    ok: true,
    result: data,
  });
}
