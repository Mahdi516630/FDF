import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../api/client";
import { AuthScreen } from "../auth/AuthScreen";
import { Dashboard } from "../features/dashboard/Dashboard";
import { RefereesTab } from "../features/referees/RefereesTab";
import { CategoriesTab } from "../features/categories/CategoriesTab";
import { DesignationsTab } from "../features/designations/DesignationsTab";
import { ReportingTab } from "../features/reporting/ReportingTab";
import { PendingUsersTab } from "../features/admin/PendingUsersTab";
import { I } from "../ui/icons";
import { Toaster, useToast } from "../ui/toast";

export default function App() {
  const { toasts, toast } = useToast();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [referees, setReferees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [r, c, d] = await Promise.all([api.listReferees(), api.listCategories(), api.listDesignations()]);
      setReferees(r);
      setCategories(c);
      setDesignations(d);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    (async () => {
      try {
        const me = await api.me();
        setUser({ email: me.email });
        setIsAdmin(!!me.isAdmin);
        await refreshAll();
      } catch {
        setToken(null);
      }
    })();
  }, [refreshAll]);

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAdmin(false);
    setPendingCount(0);
    setReferees([]);
    setCategories([]);
    setDesignations([]);
  };

  const onAuthed = async (u) => {
    // u may not include admin flags; fetch /me after auth
    setUser(u);
    const me = await api.me();
    setIsAdmin(!!me.isAdmin);
    await refreshAll();
  };

  const TABS = useMemo(
    () => {
      const base = [
      { id: "dashboard", label: "Dashboard", icon: I.bar },
      { id: "referees", label: "Arbitres", icon: I.users },
      { id: "categories", label: "Catégories", icon: I.tag },
      { id: "designations", label: "Désignations", icon: I.cal },
      { id: "reporting", label: "Net à Payer", icon: I.file },
      ];
      if (isAdmin) base.push({ id: "admin", label: `Admin${pendingCount ? ` (${pendingCount})` : ""}`, icon: I.shield });
      return base;
    },
    [isAdmin, pendingCount]
  );

  if (!getToken()) return <><AuthScreen onAuthed={onAuthed} /><Toaster toasts={toasts} /></>;

  return (
    <div style={{ minHeight: "100vh", background: "#07101d", fontFamily: "'Syne',sans-serif", color: "#f0fdf4", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes slideIn{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes toastIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:#07101d}::-webkit-scrollbar-thumb{background:#1a3050;border-radius:3px}
        input,select,textarea{font-family:'Syne',sans-serif!important;color:#f0fdf4!important}
        input::placeholder{color:#374151!important}
        select option{background:#0b1628;color:#f0fdf4}
        .row-hover:hover{background:rgba(255,255,255,.03)!important}
        @media(max-width:1024px){.sidebar{width:190px!important;padding:18px 12px!important}.main-pad{margin-left:190px!important;padding:20px 18px!important}}
        @media(max-width:820px){.sidebar{width:170px!important}.main-pad{margin-left:170px!important;padding:18px 14px!important}.main-pad h2{font-size:18px!important}}
        @media(max-width:640px){.sidebar{display:none!important}.mobile-nav{display:flex!important}.main-pad{margin-left:0!important;padding:16px 14px 80px!important}}
        @media(max-width:420px){.main-pad{padding:14px 12px 86px!important}.main-pad h2{font-size:17px!important}}
      `}</style>

      <div className="sidebar" style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 210, background: "rgba(7,16,29,.97)", borderRight: "1px solid rgba(255,255,255,.06)", display: "flex", flexDirection: "column", zIndex: 30, padding: "20px 14px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 2 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{I.shield}</div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: "#f0fdf4" }}>Referee</p>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: "#10b981" }}>Manager FDF</p>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "9px 11px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "'Syne',sans-serif",
                fontWeight: tab === t.id ? 700 : 500,
                fontSize: 13,
                background: tab === t.id ? "rgba(16,185,129,.12)" : "transparent",
                color: tab === t.id ? "#10b981" : "#6b7280",
                borderLeft: tab === t.id ? "2px solid #10b981" : "2px solid transparent",
                transition: "all .2s",
              }}
            >
              <span style={{ color: tab === t.id ? "#10b981" : "#374151" }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 14 }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, color: "#1f2937", fontFamily: "'JetBrains Mono',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email || "—"}</p>
          <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 11px", borderRadius: 8, border: "none", cursor: "pointer", background: "rgba(239,68,68,.08)", color: "#f87171", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, width: "100%" }}>
            {I.logout} Déconnexion
          </button>
        </div>
      </div>

      <div className="main-pad" style={{ flex: 1, marginLeft: 210, padding: "24px 28px" }}>
        <div style={{ marginBottom: 20, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#f0fdf4", letterSpacing: "-.5px" }}>{TABS.find((t) => t.id === tab)?.label}</h2>
            <p style={{ margin: "3px 0 0", color: "#1f2937", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => refreshAll().catch(() => toast("Erreur de chargement.", "error"))}
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 10,
              padding: "8px 12px",
              cursor: "pointer",
              color: "#9ca3af",
              fontFamily: "'Syne',sans-serif",
              fontWeight: 700,
              fontSize: 12,
            }}
            disabled={loading}
          >
            {loading ? "Chargement…" : "Rafraîchir"}
          </button>
        </div>

        {tab === "dashboard" && <Dashboard designations={designations} referees={referees} categories={categories} />}
        {tab === "referees" && (
          <RefereesTab
            referees={referees}
            toast={toast}
            onCreate={async (r) => {
              await api.addReferee(r);
              await refreshAll();
            }}
            onUpdate={async (id, patch) => {
              await api.updateReferee(id, patch);
              await refreshAll();
            }}
            onDelete={async (id) => {
              await api.deleteReferee(id);
              await refreshAll();
            }}
          />
        )}
        {tab === "categories" && (
          <CategoriesTab
            categories={categories}
            toast={toast}
            onCreate={async (c) => {
              await api.addCategory(c);
              await refreshAll();
            }}
            onUpdate={async (id, patch) => {
              await api.updateCategory(id, patch);
              await refreshAll();
            }}
            onDelete={async (id) => {
              await api.deleteCategory(id);
              await refreshAll();
            }}
          />
        )}
        {tab === "designations" && (
          <DesignationsTab
            designations={designations}
            referees={referees}
            categories={categories}
            toast={toast}
            onCreate={async (d) => {
              await api.addDesignation(d);
              await refreshAll();
            }}
            onDelete={async (id) => {
              await api.deleteDesignation(id);
              await refreshAll();
            }}
          />
        )}
        {tab === "reporting" && <ReportingTab designations={designations} referees={referees} categories={categories} toast={toast} />}
        {tab === "admin" && isAdmin && (
          <PendingUsersTab
            toast={toast}
            onCount={(n) => {
              setPendingCount(n);
              if (n > 0) toast(`Nouvelles inscriptions en attente: ${n}`, "warning");
            }}
          />
        )}
      </div>

      <div className="mobile-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(7,16,29,.98)", borderTop: "1px solid rgba(255,255,255,.07)", padding: "6px 0", zIndex: 30 }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "5px 0", background: "none", border: "none", cursor: "pointer", color: tab === t.id ? "#10b981" : "#374151", fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700 }}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <Toaster toasts={toasts} />
    </div>
  );
}

