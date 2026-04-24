// =============================================================================
// client/src/features/admin/PendingUsersTab.tsx
// Hérité FDF — migré TypeScript
// =============================================================================
import { useEffect, useState } from "react";
import { adminApi } from "../../api/admin.js";

interface PendingUser { id: string; email: string; createdAt: string; }

interface Props {
  toast: (msg: string, type?: string) => void;
  onCount: (n: number) => void;
}

export function PendingUsersTab({ toast, onCount }: Props) {
  const [pending, setPending]   = useState<PendingUser[]>([]);
  const [loading, setLoading]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listPending();
      setPending(data);
      onCount(data.length);
    } catch { toast("Erreur chargement.", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const approve = async (u: PendingUser) => {
    await adminApi.approve(u.id);
    toast(`${u.email} approuvé.`);
    load();
  };

  const reject = async (u: PendingUser) => {
    if (!confirm(`Rejeter ${u.email} ?`)) return;
    await adminApi.reject(u.id);
    toast(`${u.email} rejeté.`);
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>{pending.length} compte(s) en attente d'approbation</p>
        <button onClick={load} disabled={loading}
          style={{ padding: "8px 14px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 9, color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>
          {loading ? "…" : "Rafraîchir"}
        </button>
      </div>

      {pending.length === 0
        ? <div style={{ textAlign: "center", padding: 60, color: "#374151" }}><div style={{ fontSize: 40, marginBottom: 12 }}>✅</div><p>Aucun compte en attente.</p></div>
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map(u => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "14px 18px", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: "#f0fdf4", fontSize: 14 }}>{u.email}</p>
                  <p style={{ margin: "3px 0 0", color: "#4b5563", fontSize: 11, fontFamily: "monospace" }}>
                    Inscription : {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => approve(u)}
                    style={{ padding: "8px 18px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    ✓ Approuver
                  </button>
                  <button onClick={() => reject(u)}
                    style={{ padding: "8px 14px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 9, color: "#f87171", fontSize: 13, cursor: "pointer" }}>
                    ✕ Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
