// =============================================================================
// client/src/features/auth/AuthScreen.tsx
// Hérité FDF, migré TypeScript + shadcn/ui
// =============================================================================
import { useState } from "react";
import { authApi } from "../../api/auth.js";
import { setToken } from "../../api/client.js";
import { ApiError } from "../../api/client.js";

interface Props {
  onAuthed: (user: { email: string; role: string }) => void;
}

const ERROR_MAP: Record<string, string> = {
  InvalidCredentials: "Email ou mot de passe incorrect.",
  NotApproved:        "Votre compte n'est pas encore approuvé par l'administrateur.",
  EmailExists:        "Cet email est déjà utilisé.",
  ValidationError:    "Données invalides.",
};

export function AuthScreen({ onAuthed }: Props) {
  const [mode, setMode]   = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw]       = useState("");
  const [show, setShow]   = useState(false);
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setErr("");
    const e = email.toLowerCase().trim();
    if (!e || !pw) { setErr("Tous les champs sont requis."); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await authApi.login(e, pw);
        setToken(res.token);
        onAuthed(res.user);
      } else {
        await authApi.register(e, pw);
        setErr("Compte créé — en attente de validation par l'administrateur.");
        setMode("login");
        setPw("");
      }
    } catch (ex) {
      const msg = ex instanceof ApiError ? ex.message : "Erreur réseau.";
      setErr(ERROR_MAP[msg] ?? msg);
    } finally {
      setLoading(false);
    }
  };

  const S = {
    page:  { minHeight: "100vh", background: "linear-gradient(135deg,#07101d 0%,#0a1828 60%,#071018 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Syne',sans-serif" } as React.CSSProperties,
    card:  { width: "100%", maxWidth: 400, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 22, padding: 28, backdropFilter: "blur(20px)" } as React.CSSProperties,
    input: { width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 9, padding: "11px 14px", color: "#f0fdf4", fontSize: 14, fontFamily: "'Syne',sans-serif", outline: "none" } as React.CSSProperties,
    btn:   { padding: "12px 0", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 9, color: "#fff", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", width: "100%", boxShadow: "0 4px 20px rgba(16,185,129,.3)" } as React.CSSProperties,
    tab:   (active: boolean) => ({ flex: 1, padding: "8px 0", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, background: active ? "linear-gradient(135deg,#10b981,#059669)" : "transparent", color: active ? "#fff" : "#6b7280" }) as React.CSSProperties,
    label: { color: "#6b7280", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", display: "block", marginBottom: 5 } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap'); *{box-sizing:border-box} input::placeholder{color:#374151!important}`}</style>
      <div>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#10b981,#059669)", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(16,185,129,.35)", marginBottom: 12 }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#f0fdf4" }}>Referee Manager</h1>
          <p style={{ margin: "4px 0 0", color: "#374151", fontSize: 12 }}>Fédération Djiboutienne de Football</p>
        </div>

        <div style={S.card}>
          {/* Tabs login/register */}
          <div style={{ display: "flex", background: "rgba(0,0,0,.3)", borderRadius: 10, padding: 4, marginBottom: 20 }}>
            <button style={S.tab(mode === "login")}    onClick={() => setMode("login")}>Connexion</button>
            <button style={S.tab(mode === "register")} onClick={() => setMode("register")}>Inscription</button>
          </div>

          {err && (
            <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: "9px 13px", color: "#fca5a5", fontSize: 13, marginBottom: 14 }}>
              {err}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={S.label}>EMAIL</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="admin@fdf.dj" style={S.input} />
            </div>
            <div style={{ position: "relative" }}>
              <label style={S.label}>MOT DE PASSE</label>
              <input value={pw} onChange={e => setPw(e.target.value)} type={show ? "text" : "password"} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handle()} style={{ ...S.input, paddingRight: 42 }} />
              <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: 32, background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
                {show ? "🙈" : "👁"}
              </button>
            </div>
            <button onClick={handle} disabled={loading} style={S.btn}>
              {loading ? "Chargement…" : mode === "login" ? "Se connecter →" : "Créer le compte →"}
            </button>
          </div>
          <p style={{ textAlign: "center", color: "#1f2937", fontSize: 11, marginTop: 16 }}>Demo : admin@fdf.dj / admin123</p>
        </div>
      </div>
    </div>
  );
}
