import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Btn } from "../../ui/primitives";

export function PendingUsersTab({ toast, onCount }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await api.listPendingUsers();
      setPending(rows);
      onCount?.(rows.length);
    } catch {
      toast("Erreur chargement utilisateurs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approve = async (id) => {
    await api.approveUser(id);
    toast("Utilisateur approuvé.");
    await load();
  };

  const reject = async (id) => {
    if (!confirm("Refuser et supprimer ce compte ?")) return;
    await api.rejectUser(id);
    toast("Utilisateur refusé.", "warning");
    await load();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <p style={{ margin: 0, color: "#f0fdf4", fontWeight: 800 }}>Inscriptions en attente</p>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 12 }}>{pending.length} demande(s)</p>
        </div>
        <Btn onClick={load} outline color="#6b7280" disabled={loading}>
          {loading ? "Chargement…" : "Rafraîchir"}
        </Btn>
      </div>

      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,.07)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,.4)" }}>
              {["Email", "Créé le", "Actions"].map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding: "11px 14px",
                    textAlign: i === 2 ? "center" : "left",
                    color: "#6b7280",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".06em",
                    borderBottom: "1px solid rgba(255,255,255,.07)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: 30, textAlign: "center", color: "#374151" }}>
                  Aucune inscription en attente.
                </td>
              </tr>
            ) : (
              pending.map((u) => (
                <tr key={u.id} className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                  <td style={{ padding: "10px 14px", color: "#f0fdf4", fontWeight: 600 }}>{u.email}</td>
                  <td style={{ padding: "10px 14px", color: "#6b7280", fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{u.createdAt}</td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                      <Btn sm onClick={() => approve(u.id)} color="#10b981">
                        Approuver
                      </Btn>
                      <Btn sm onClick={() => reject(u.id)} outline color="#ef4444">
                        Refuser
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

