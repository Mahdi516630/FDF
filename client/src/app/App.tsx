// =============================================================================
// client/src/app/App.tsx
// Shell principal — tabs nav + state global + routing entre features
// Hérité FDF (structure) + TypeScript strict
// =============================================================================
import { useCallback, useEffect, useMemo, useState } from "react";
import { getToken, setToken } from "../api/client.js";
import { authApi } from "../api/auth.js";
import { refereesApi } from "../api/referees.js";
import { categoriesApi } from "../api/categories.js";
import { designationsApi } from "../api/designations.js";
import { AuthScreen } from "../features/auth/AuthScreen.js";
import { Dashboard } from "../features/dashboard/Dashboard.js";
import { RefereesTab } from "../features/referees/RefereesTab.js";
import { CategoriesTab } from "../features/categories/CategoriesTab.js";
import { DesignationsTab } from "../features/designations/DesignationsTab.js";
import { ReportingTab } from "../features/reporting/ReportingTab.js";
import { PendingUsersTab } from "../features/admin/PendingUsersTab.js";
import type { DesignationDetail, Referee, Category } from "../types.js";

// ── Toast minimal ──────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const toast = useCallback((msg: string, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, toast };
}

// ── Navigation icons ────────────────────────────────────────────────────────
const ICONS = {
  bar:    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  users:  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  tag:    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  cal:    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  file:   <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  shield: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  logout: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
};

type TabId = "dashboard" | "referees" | "categories" | "designations" | "reporting" | "admin";

// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const { toasts, toast } = useToast();
  const [user, setUser]             = useState<{ email: string; role: string } | null>(null);
  const [tab, setTab]               = useState<TabId>("dashboard");
  const [referees, setReferees]     = useState<Referee[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [designations, setDesig]    = useState<DesignationDetail[]>([]);
  const [loading, setLoading]       = useState(false);
  const [pendingCount, setPending]  = useState(0);

  const isAdmin = user?.role === "admin";

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [r, c, d] = await Promise.all([
        refereesApi.list(),
        categoriesApi.list(),
        designationsApi.list(),
      ]);
      setReferees(r); setCategories(c); setDesig(d);
    } finally { setLoading(false); }
  }, []);

  // Auto-login si token présent
  useEffect(() => {
    if (!getToken()) return;
    (async () => {
      try {
        const me = await authApi.me();
        setUser({ email: me.email, role: me.role });
        await refreshAll();
      } catch { setToken(null); }
    })();
  }, [refreshAll]);

  const logout = () => {
    setToken(null); setUser(null);
    setReferees([]); setCategories([]); setDesig([]);
    setPending(0);
  };

  const onAuthed = async (u: { email: string; role: string }) => {
    setUser(u);
    const me = await authApi.me();
    setUser({ email: me.email, role: me.role });
    await refreshAll();
  };

  const TABS = useMemo(() => {
    const base: { id: TabId; label: string; icon: React.ReactNode }[] = [
      { id: "dashboard",    label: "Dashboard",    icon: ICONS.bar },
      { id: "referees",     label: "Arbitres",     icon: ICONS.users },
      { id: "categories",   label: "Catégories",   icon: ICONS.tag },
      { id: "designations", label: "Désignations", icon: ICONS.cal },
      { id: "reporting",    label: "Net à Payer",  icon: ICONS.file },
    ];
    if (isAdmin) base.push({ id: "admin", label: `Admin${pendingCount ? ` (${pendingCount})` : ""}`, icon: ICONS.shield });
    return base;
  }, [isAdmin, pendingCount]);

  // ── Auth wall ──────────────────────────────────────────────────────────────
  if (!getToken()) return (
    <>
      <AuthScreen onAuthed={onAuthed} />
      <Toaster toasts={toasts} />
    </>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#07101d", fontFamily: "'Syne',sans-serif", color: "#f0fdf4", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:#07101d}::-webkit-scrollbar-thumb{background:#1a3050;border-radius:3px}
        input,select{font-family:'Syne',sans-serif!important;color:#f0fdf4!important}
        input::placeholder{color:#374151!important}
        select option{background:#0b1628;color:#f0fdf4}
        @media(max-width:640px){.sidebar{display:none!important}.mobile-nav{display:flex!important}.main{margin-left:0!important;padding:16px 14px 80px!important}}
      `}</style>

      {/* ── Sidebar ── */}
      <aside className="sidebar" style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 210, background: "rgba(7,16,29,.97)", borderRight: "1px solid rgba(255,255,255,.06)", display: "flex", flexDirection: "column", zIndex: 30, padding: "20px 14px" }}>
        <div style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{ICONS.shield}</div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: "#f0fdf4" }}>Referee</p>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: "#10b981" }}>Manager v3</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 9,
              border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'Syne',sans-serif",
              fontWeight: tab === t.id ? 700 : 500, fontSize: 13,
              background: tab === t.id ? "rgba(16,185,129,.12)" : "transparent",
              color: tab === t.id ? "#10b981" : "#6b7280",
              borderLeft: tab === t.id ? "2px solid #10b981" : "2px solid transparent",
              transition: "all .15s",
            }}>
              <span style={{ color: tab === t.id ? "#10b981" : "#374151" }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 14 }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, color: "#1f2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
          <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 11px", borderRadius: 8, border: "none", cursor: "pointer", background: "rgba(239,68,68,.08)", color: "#f87171", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, width: "100%" }}>
            {ICONS.logout} Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main" style={{ flex: 1, marginLeft: 210, padding: "24px 28px" }}>
        <div style={{ marginBottom: 20, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#f0fdf4" }}>
              {TABS.find(t => t.id === tab)?.label}
            </h2>
            <p style={{ margin: "3px 0 0", color: "#1f2937", fontSize: 11, fontFamily: "monospace" }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <button onClick={() => refreshAll().catch(() => toast("Erreur.", "error"))} disabled={loading}
            style={{ padding: "8px 14px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>
            {loading ? "Chargement…" : "↻ Rafraîchir"}
          </button>
        </div>

        {/* ── Feature routing ── */}
        {tab === "dashboard" && <Dashboard designations={designations} referees={referees} categories={categories} />}

        {tab === "referees" && (
          <RefereesTab referees={referees} toast={toast}
            onCreate={async b => { await refereesApi.create(b); await refreshAll(); }}
            onUpdate={async (id, b) => { await refereesApi.update(id, b); await refreshAll(); }}
            onDelete={async id => { await refereesApi.remove(id); await refreshAll(); }}
          />
        )}

        {tab === "categories" && (
          <CategoriesTab categories={categories} toast={toast}
            onCreate={async b => { await categoriesApi.create(b); await refreshAll(); }}
            onUpdate={async (id, b) => { await categoriesApi.update(id, b); await refreshAll(); }}
            onDelete={async id => { await categoriesApi.remove(id); await refreshAll(); }}
          />
        )}

        {tab === "designations" && (
          <DesignationsTab designations={designations} referees={referees} categories={categories} toast={toast}
            onCreate={async b => { await designationsApi.create(b); await refreshAll(); }}
            onUpdate={async (id, b) => { await designationsApi.update(id, b); await refreshAll(); }}
            onDelete={async id => { await designationsApi.remove(id); await refreshAll(); }}
          />
        )}

        {tab === "reporting" && <ReportingTab categories={categories} toast={toast} />}

        {tab === "admin" && isAdmin && (
          <PendingUsersTab toast={toast} onCount={n => setPending(n)} />
        )}
      </main>

      {/* ── Mobile nav ── */}
      <nav className="mobile-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(7,16,29,.98)", borderTop: "1px solid rgba(255,255,255,.07)", padding: "6px 0", zIndex: 30 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "5px 0", background: "none", border: "none", cursor: "pointer", color: tab === t.id ? "#10b981" : "#374151", fontSize: 9, fontWeight: 700 }}>
            {t.icon}{t.label}
          </button>
        ))}
      </nav>

      <Toaster toasts={toasts} />
    </div>
  );
}

// ── Toaster ────────────────────────────────────────────────────────────────
function Toaster({ toasts }: { toasts: { id: number; msg: string; type: string }[] }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200, display: "flex", flexDirection: "column", gap: 8, maxWidth: 340 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: t.type === "error" ? "#1f0a0a" : "#0a1f12", border: `1px solid ${t.type === "error" ? "rgba(239,68,68,.4)" : "rgba(16,185,129,.4)"}`, borderRadius: 12, padding: "12px 16px", color: t.type === "error" ? "#fca5a5" : "#6ee7b7", fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,.4)" }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
