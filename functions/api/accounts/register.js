const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });

const normalizeEmail = value => String(value || "").trim().toLowerCase();
const id = prefix => `${prefix}-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  const role = body.role === "seller" ? "seller" : "buyer";
  const email = normalizeEmail(body.email);
  const name = String(body.name || "").trim();
  const phone = String(body.phone || body.mobile || "").trim();
  const address = String(body.address || "").trim();

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "Valid email is required." }, 400);
  }

  if (!name) return json({ ok: false, error: "Name is required." }, 400);
  if (role === "buyer" && (!phone || !address)) {
    return json({ ok: false, error: "Phone and address are required." }, 400);
  }

  const existing = await context.env.DB
    .prepare("SELECT email, role FROM users WHERE email = ?")
    .bind(email)
    .first();

  const existingApplication = await context.env.DB
    .prepare("SELECT email, status FROM seller_applications WHERE email = ?")
    .bind(email)
    .first();

  if (existing || existingApplication) {
    return json({ ok: false, error: "This email is already registered.", exists: true }, 409);
  }

  const userId = id(role);
  await context.env.DB
    .prepare("INSERT INTO users (id, email, role, name, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(userId, email, role, name, phone, address, role === "seller" ? "pending" : "active")
    .run();

  if (role === "seller") {
    const applicationId = `VSL-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    await context.env.DB
      .prepare("INSERT INTO seller_applications (id, user_id, email, name, mobile, address, has_permit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(applicationId, userId, email, name, phone, address, String(body.hasPermit || ""), "UNDER REVIEW")
      .run();
    return json({ ok: true, userId, applicationId, status: "UNDER REVIEW" }, 201);
  }

  return json({ ok: true, userId, status: "active" }, 201);
}
