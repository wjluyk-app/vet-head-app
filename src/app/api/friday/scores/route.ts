import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getBillAdminUser } from "@/lib/auth/admin";

const scoreInput = z.object({
  scorecardId: z.string().uuid(),
  holeNumber: z.number().int().min(1).max(18),
  netScore: z.number().int().min(1).max(20),
  expectedVersion: z.number().int().positive().optional(),
  reason: z.string().trim().min(1).max(250).optional(),
});

export async function POST(request: Request) {
  const adminUser = await getBillAdminUser();

  if (!adminUser) {
    return Response.json(
      { ok: false, error: "Administrator access required" },
      { status: 403 },
    );
  }

  const parsed = scoreInput.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "Invalid score request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return Response.json({ ok: false, error: "Authentication required" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("save_team_hole_score", {
    p_scorecard_id: parsed.data.scorecardId,
    p_hole_number: parsed.data.holeNumber,
    p_net_score: parsed.data.netScore,
    p_expected_version: parsed.data.expectedVersion ?? null,
    p_reason: parsed.data.reason ?? "Score entry",
  });

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 409 });
  }

  const saved = data?.[0];
  if (!saved) {
    return Response.json({ ok: false, error: "No score returned" }, { status: 500 });
  }

  return Response.json({
    ok: true,
    conflict: saved.conflict,
    score: {
      id: saved.hole_score_id,
      netScore: saved.saved_score,
      version: saved.saved_version,
      updatedAt: saved.saved_at,
    },
  });
}
