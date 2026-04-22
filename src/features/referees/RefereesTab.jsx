import React, { useState } from "react";
import { LEVELS } from "../../constants/levels";
import { I } from "../../ui/icons";
import { Badge, Btn, Field, IS, Modal, SS } from "../../ui/primitives";
import { genId } from "../../utils/format";

export function RefereesTab({ referees, toast, onCreate, onUpdate, onDelete }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", level: "National A" });

  const filtered = referees.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.phone || "").includes(search) ||
      (r.level || "").toLowerCase().includes(search.toLowerCase())
  );

  const save = async () => {
    if (!form.name.trim()) {
      toast("Le nom est requis.", "error");
      return;
    }
    try {
      if (modal === "add") {
        await onCreate({
          id: genId(),
          name: form.name.trim(),
          phone: form.phone.trim(),
          level: form.level,
        });
        toast("Arbitre ajouté !");
      } else {
        await onUpdate(modal, {
          name: form.name.trim(),
          phone: form.phone.trim(),
          level: form.level,
        });
        toast("Arbitre modifié !");
      }
      setModal(null);
    } catch {
      toast("Erreur.", "error");
    }
  };

  const del = async (id) => {
    if (!confirm("Supprimer cet arbitre ?")) return;
    try {
      await onDelete(id);
      toast("Supprimé.", "warning");
    } catch (ex) {
      toast(ex?.message === "RefereeInUse" ? "Impossible: arbitre utilisé dans une désignation." : "Erreur.", "error");
    }
  };

  const levelColor = {
    Élite: "#f59e0b",
    International: "#10b981",
    "National A": "#3b82f6",
    "National B": "#8b5cf6",
    Régional: "#06b6d4",
    "Stagiaire 2023": "#6b7280",
    "Stagiaire 2024": "#6b7280",
    "Stagiaire 2025": "#6b7280",
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#4b5563" }}>{I.search}</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, téléphone, niveau..." style={{ ...IS, paddingLeft: 34 }} />
        </div>
        <Btn
          onClick={() => {
            setForm({ name: "", phone: "", level: "National A" });
            setModal("add");
          }}
        >
          {I.plus} Ajouter
        </Btn>
      </div>

      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,.07)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,.4)" }}>
              {["N°", "Nom", "Niveau", "Téléphone", "Actions"].map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: "11px 14px",
                    textAlign: i === 4 ? "center" : "left",
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#374151" }}>
                  Aucun arbitre.
                </td>
              </tr>
            )}
            {filtered.map((r, i) => (
              <tr key={r.id} className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                <td style={{ padding: "10px 14px", color: "#4b5563", fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>{String(i + 1).padStart(2, "0")}</td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                      {r.name.charAt(0)}
                    </div>
                    <span style={{ color: "#f0fdf4", fontWeight: 600, fontSize: 13 }}>{r.name}</span>
                  </div>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <Badge color={levelColor[r.level] || "#6b7280"}>{r.level || "—"}</Badge>
                </td>
                <td style={{ padding: "10px 14px", color: "#6b7280", fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>{r.phone || "—"}</td>
                <td style={{ padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    <button
                      onClick={() => {
                        setForm({ name: r.name, phone: r.phone || "", level: r.level || "National A" });
                        setModal(r.id);
                      }}
                      style={{ background: "rgba(59,130,246,.1)", border: "none", borderRadius: 6, padding: 6, cursor: "pointer", color: "#60a5fa" }}
                    >
                      {I.edit}
                    </button>
                    <button onClick={() => del(r.id)} style={{ background: "rgba(239,68,68,.1)", border: "none", borderRadius: 6, padding: 6, cursor: "pointer", color: "#f87171" }}>
                      {I.trash}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Ajouter un arbitre" : "Modifier l'arbitre"} onClose={() => setModal(null)}>
          <Field label="NOM COMPLET">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={IS} placeholder="Prénom Nom" />
          </Field>
          <Field label="TÉLÉPHONE">
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={IS} placeholder="77 XX XX XX" />
          </Field>
          <Field label="NIVEAU / GRADE">
            <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} style={SS}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={() => setModal(null)} outline color="#6b7280">
              Annuler
            </Btn>
            <Btn onClick={save}>Enregistrer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

