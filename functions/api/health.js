export async function onRequestGet(context) {
  const row = await context.env.DB.prepare("SELECT 1 AS ok").first();
  return Response.json({ ok: row?.ok === 1, service: "virtualspacelotto-api" });
}
