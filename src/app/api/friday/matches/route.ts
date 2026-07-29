import { getFridayMatchesFromSeed } from "@/lib/repositories/friday";

export async function GET() {
  return Response.json({
    source: "2026-workbook-seed",
    matches: getFridayMatchesFromSeed(),
  });
}
