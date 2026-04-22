import { useCallback, useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "success") => {
    const id = Math.random().toString(36).slice(2, 10);
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return { toasts, toast };
}

export function Toaster({ toasts }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 18px",
            borderRadius: 12,
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
            boxShadow: "0 8px 32px rgba(0,0,0,.4)",
            minWidth: 260,
            animation: "toastIn .3s ease",
            background:
              t.type === "error"
                ? "linear-gradient(135deg,#ef4444,#dc2626)"
                : t.type === "warning"
                  ? "linear-gradient(135deg,#f59e0b,#d97706)"
                  : "linear-gradient(135deg,#10b981,#059669)",
          }}
        >
          <span style={{ fontSize: 16 }}>
            {t.type === "error" ? "✕" : t.type === "warning" ? "⚠" : "✓"}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

