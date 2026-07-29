import { z } from "zod";

const scoreInput = z.object({
  matchNumber: z.number().int().min(1).max(6),
  teamShortName: z.enum(["L. Swardo", "S. Swardo"]),
  holeNumber: z.number().int().min(1).max(18),
  netScore: z.number().int().min(1).max(20),
  priorUpdatedAt: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = scoreInput.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { ok: false, errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Phase 1 prototype contract:
  // 1. Input is already a NET team score.
  // 2. No handicap adjustment occurs here.
  // 3. Production persistence will use the authenticated user and audit tables.
  return Response.json({
    ok: true,
    accepted: parsed.data,
    serverUpdatedAt: new Date().toISOString(),
    persistence: "prototype-validation-only",
  });
}
