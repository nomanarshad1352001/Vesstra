// Static preview health document. The demo has no backend or database calls.
export const dynamic = "force-static";
export function GET() {
  return Response.json({ ok: true, mode: "local-demo" });
}
