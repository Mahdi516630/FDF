import React from "react";
import { I } from "./icons";

export function Modal({ title, onClose, children, wide }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.75)",
        backdropFilter: "blur(6px)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#0b1628",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 20,
          width: "100%",
          maxWidth: wide ? 760 : 520,
          maxHeight: "92vh",
          overflowY: "auto",
          animation: "slideIn .25s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid rgba(255,255,255,.07)",
            position: "sticky",
            top: 0,
            background: "#0b1628",
            zIndex: 1,
          }}
        >
          <h3 style={{ margin: 0, color: "#f0fdf4", fontWeight: 800, fontSize: 15 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,.06)",
              border: "none",
              borderRadius: 8,
              width: 30,
              height: 30,
              cursor: "pointer",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {I.x}
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

export const IS = {
  width: "100%",
  background: "rgba(0,0,0,.35)",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 8,
  padding: "9px 12px",
  color: "#f0fdf4",
  fontFamily: "'Syne',sans-serif",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

export const SS = { ...IS, cursor: "pointer" };

export function Field({ label, children, half }) {
  return (
    <div style={{ marginBottom: 12, width: half ? "calc(50% - 6px)" : "100%" }}>
      <label
        style={{
          color: "#6b7280",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".06em",
          display: "block",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function Btn({ children, onClick, color = "#10b981", outline, sm, disabled, type = "button" }) {
  const bg = outline ? "transparent" : `linear-gradient(135deg, ${color}, ${color}dd)`;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: sm ? "7px 13px" : "10px 18px",
        background: disabled ? "rgba(255,255,255,.05)" : bg,
        border: outline ? `1px solid ${color}40` : "none",
        borderRadius: 8,
        color: disabled ? "#4b5563" : outline ? color : "#fff",
        fontFamily: "'Syne',sans-serif",
        fontWeight: 700,
        fontSize: sm ? 12 : 13,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all .2s",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export function Badge({ children, color = "#10b981" }) {
  return (
    <span
      style={{
        background: `${color}20`,
        color,
        borderRadius: 6,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function StatCard({ icon, label, value, sub, color = "#10b981" }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,.025)",
        border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 14,
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: -16, right: -16, width: 70, height: 70, borderRadius: "50%", background: `${color}18` }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ margin: "0 0 4px", color: "#6b7280", fontSize: 11, fontWeight: 700, letterSpacing: ".06em" }}>{label}</p>
          <p style={{ margin: 0, color: "#f0fdf4", fontSize: 24, fontWeight: 800, letterSpacing: "-.5px" }}>{value}</p>
          {sub && <p style={{ margin: "3px 0 0", color: "#374151", fontSize: 11 }}>{sub}</p>}
        </div>
        <div style={{ color, background: `${color}18`, borderRadius: 9, padding: 8 }}>{icon}</div>
      </div>
    </div>
  );
}

