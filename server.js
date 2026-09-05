import "dotenv/config";
import express from "express";
import session from "express-session";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getAll, getOne, setOne } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.set("trust proxy", 1); // needed for secure cookies behind a hosting provider's proxy
app.use(express.json({ strict: false })); // store values can be primitives (numbers, strings), not just objects/arrays

const APP_PASSWORD = process.env.SOLACE_PASSWORD || null;
const isProduction = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: process.env.SESSION_SECRET || "solace-dev-secret-change-me-in-.env",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: isProduction,
      sameSite: "lax",
    },
  })
);

// --- Auth ---

app.post("/api/login", (req, res) => {
  const { password } = req.body || {};
  if (!APP_PASSWORD || password === APP_PASSWORD) {
    req.session.authenticated = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: "Incorrect password." });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

function requireAuth(req, res, next) {
  if (!APP_PASSWORD) return next(); // no password configured — open access (local dev convenience)
  if (req.session.authenticated) return next();
  if (
    req.path === "/login.html" ||
    req.path === "/api/login" ||
    req.path.startsWith("/js/") ||
    req.path.startsWith("/css/") ||
    req.path.startsWith("/assets/") ||
    req.path === "/manifest.json"
  ) {
    return next();
  }
  if (req.path.startsWith("/api/")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  return res.redirect("/login.html?next=" + encodeURIComponent(req.path));
}

app.use(requireAuth);

// --- Data store (Supabase-backed, mirrors the old localStorage keys) ---

app.get("/api/store", async (req, res) => {
  try {
    res.json(await getAll());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read store" });
  }
});

app.get("/api/store/:key", async (req, res) => {
  try {
    const value = await getOne(req.params.key);
    if (value === undefined) return res.status(404).json({ error: "Not found" });
    res.json(value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read key" });
  }
});

app.put("/api/store/:key", async (req, res) => {
  try {
    await setOne(req.params.key, req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to write key" });
  }
});

// Static frontend — served last, after auth + API routes
app.use(express.static(__dirname));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Solace running at http://localhost:${PORT}`);
  if (!APP_PASSWORD) {
    console.log("Note: SOLACE_PASSWORD is not set — the app is open with no login. Set it in .env before deploying publicly.");
  }
});
