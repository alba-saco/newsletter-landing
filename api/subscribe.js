// api/subscribe.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function isValidEmail(email) {
  // good-enough email check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { email } = req.body ?? {};
    const cleaned = String(email || "").trim().toLowerCase();

    if (!isValidEmail(cleaned)) {
      return res.status(400).json({ ok: false, error: "Invalid email" });
    }

    // Insert (ignore duplicates gracefully)
    const { error } = await supabase
      .from("subscribers")
      .upsert({ email: cleaned }, { onConflict: "email" });

    if (error) {
      console.error(error);
      return res.status(500).json({ ok: false, error: "Database error" });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}