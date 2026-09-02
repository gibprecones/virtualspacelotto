const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });

const normalizeEmail = value => String(value || "").trim().toLowerCase();

export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "Valid email is required." }, 400);
  }

  const user = await context.env.DB
    .prepare("SELECT email, role, status FROM users WHERE email = ?")
    .bind(email)
    .first();

  const application = await context.env.DB
    .prepare("SELECT email, status FROM seller_applications WHERE email = ?")
    .bind(email)
    .first();

  return json({
    ok: true,
    exists: Boolean(user || application),
    user: user || null,
    application: application || null
  });
}
