export async function GET() {
  return Response.json({
    status: "ok",
    app: "Vet Head App",
    phase: 1,
    timestamp: new Date().toISOString(),
  });
}
