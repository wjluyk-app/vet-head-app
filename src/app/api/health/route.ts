export async function GET() {
  return Response.json({
    status: "ok",
    app: "Cubby Cup App",
    phase: 1,
    timestamp: new Date().toISOString(),
  });
}
