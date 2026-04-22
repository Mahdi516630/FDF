import React, { useState } from "react";
import { api, setToken } from "../api/client";
import { I } from "../ui/icons";
import { IS } from "../ui/primitives";

export function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const handle = async () => {
    setErr("");
    const e = email.toLowerCase().trim();
    if (!e || !pw) {
      setErr("Tous les champs sont requis.");
      return;
    }
    try {
      if (mode === "login") {
        const res = await api.login(e, pw);
        setToken(res.token);
        onAuthed?.(res.user);
      } else {
        const res = await api.register(e, pw);
        if (res?.pending) {
          setErr("Votre compte est créé et en attente de validation par l'administrateur (admin@fdf.dj).");
          setMode("login");
          setPw("");
        }
      }
    } catch (ex) {
      if (ex?.message === "InvalidCredentials") setErr("Email ou mot de passe incorrect.");
      else if (ex?.message === "NotApproved") setErr("Votre compte n'est pas encore approuvé par l'administrateur.");
      else if (ex?.message === "EmailExists") setErr("Email déjà utilisé.");
      else if (ex?.message === "ValidationError") setErr("Données invalides.");
      else setErr("Erreur.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#07101d 0%,#0a1828 60%,#071018 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "'Syne',sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes slideIn{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes toastIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:#07101d}::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:3px}
        input,select,textarea{font-family:'Syne',sans-serif!important;color:#f0fdf4!important}
        input::placeholder{color:#374151!important}
        select option{background:#0b1628;color:#f0fdf4}
      `}</style>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32, animation: "floatY 4s ease-in-out infinite" }}>
          <div
            style={{
              display: "inline-flex",
              width: 68,
              height: 68,
              borderRadius: 18,
              background: "linear-gradient(135deg,#10b981,#059669)",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(16,185,129,.35)",
              marginBottom: 14,
              color: "#fff",
            }}
          >
            {I.shield}
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#f0fdf4", letterSpacing: "-.5px" }}>
            Referee Manager
          </h1>
          <p style={{ margin: "4px 0 0", color: "#374151", fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>
            FDF — Fédération Djiboutienne de Football
          </p>
        </div>
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 22, padding: 28, backdropFilter: "blur(20px)" }}>
          <div style={{ display: "flex", background: "rgba(0,0,0,.3)", borderRadius: 10, padding: 4, marginBottom: 22 }}>
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  background: mode === m ? "linear-gradient(135deg,#10b981,#059669)" : "transparent",
                  color: mode === m ? "#fff" : "#6b7280",
                }}
              >
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>
          {err && <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: "9px 13px", color: "#fca5a5", fontSize: 13, marginBottom: 14 }}>{err}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", display: "block", marginBottom: 5 }}>EMAIL</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="admin@fdf.dj" style={IS} />
            </div>
            <div style={{ position: "relative" }}>
              <label style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", display: "block", marginBottom: 5 }}>MOT DE PASSE</label>
              <input value={pw} onChange={(e) => setPw(e.target.value)} type={show ? "text" : "password"} placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && handle()} style={{ ...IS, paddingRight: 40 }} />
              <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 10, top: 32, background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
                {show ? I.eyeOff : I.eye}
              </button>
            </div>
            <button
              onClick={handle}
              style={{
                padding: "12px 0",
                background: "linear-gradient(135deg,#10b981,#059669)",
                border: "none",
                borderRadius: 9,
                color: "#fff",
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(16,185,129,.3)",
              }}
            >
              {mode === "login" ? "Se connecter →" : "Créer le compte →"}
            </button>
          </div>
          <p style={{ textAlign: "center", color: "#1f2937", fontSize: 11, marginTop: 18, fontFamily: "'JetBrains Mono',monospace" }}>Demo : admin@fdf.dj / admin123</p>
        </div>
      </div>
    </div>
  );
}

