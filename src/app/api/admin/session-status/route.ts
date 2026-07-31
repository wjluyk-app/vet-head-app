import { z } from "zod";
import { getBillAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  sessionId: z.string().uuid(),
  status: z.enum([
    "setup",
    "open",
    "submitted",
    "review",
    "locked",
    "published",
  ]),
});

export async function POST(request: Request) {
  const adminUser = await getBillAdminUser();

  if (!adminUser) {
    return Response.json(
      { ok: false, error: "Administrator access required" },
      { status: 403 },
    );
  }

  const parsed = requestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: "Invalid session status request",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("set_session_status", {
    p_session_id: parsed.data.sessionId,
    p_status: parsed.data.status,
    p_reason: `Administrator changed session to ${parsed.data.status}`,
  });

  if (error) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 409 },
    );
  }

  return Response.json({
    ok: true,
    session: data,
  });
}
