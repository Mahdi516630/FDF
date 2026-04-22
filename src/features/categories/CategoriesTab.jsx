import React, { useState } from "react";
import { I } from "../../ui/icons";
import { Btn, Field, IS, Modal } from "../../ui/primitives";
import { fmt, genId } from "../../utils/format";

export function CategoriesTab({ categories, toast, onCreate, onUpdate, onDelete }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", centralfee: "", assistantfee: "", fourthfee: "" });

  const save = async () => {
    if (!form.name.trim() || !form.centralfee || !form.assistantfee || !form.fourthfee) {
      toast("Tous les champs sont requis.", "error");
      return;
    }
    const data = {
      name: form.name.trim(),
      centralfee: Number(form.centralfee),
      assistantfee: Number(form.assistantfee),
      fourthfee: Number(form.fourthfee),
    };
    try {
      if (modal === "add") {
        await onCreate({ id: genId(), ...data });
        toast("Catégorie ajoutée !");
      } else {
        await onUpdate(modal, data);
        toast("Modifiée !");
      }
      setModal(null);
    } catch {
      toast("Erreur.", "error");
    }
  };

  const del = async (id) => {
    if (!confirm("Supprimer ?")) return;
    try {
      await onDelete(id);
      toast("Supprimée.", "warning");
    } catch (ex) {
      toast(ex?.message === "CategoryInUse" ? "Impossible: catégorie utilisée dans une désignation." : "Erreur.", "error");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        <Btn
          onClick={() => {
            setForm({ name: "", centralfee: "", assistantfee: "", fourthfee: "" });
            setModal("add");
          }}
        >
          {I.plus} Nouvelle catégorie
        </Btn>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {categories.map((c) => (
          <div key={c.id} style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ color: "#10b981" }}>{I.tag}</span>
                <span style={{ color: "#f0fdf4", fontWeight: 800, fontSize: 15 }}>{c.name}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    setForm({ name: c.name, centralfee: String(c.centralfee), assistantfee: String(c.assistantfee), fourthfee: String(c.fourthfee) });
                    setModal(c.id);
                  }}
                  style={{ background: "rgba(59,130,246,.1)", border: "none", borderRadius: 6, padding: 6, cursor: "pointer", color: "#60a5fa" }}
                >
                  {I.edit}
                </button>
                <button onClick={() => del(c.id)} style={{ background: "rgba(239,68,68,.1)", border: "none", borderRadius: 6, padding: 6, cursor: "pointer", color: "#f87171" }}>
                  {I.trash}
                </button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {[
                ["Central", "#10b981", c.centralfee],
                ["Assistant", "#3b82f6", c.assistantfee],
                ["4ème Arbitre", "#f59e0b", c.fourthfee],
              ].map(([l, col, v]) => (
                <div key={l} style={{ background: `${col}10`, border: `1px solid ${col}30`, borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <p style={{ margin: 0, color: col, fontSize: 10, fontWeight: 700, letterSpacing: ".06em" }}>{String(l).toUpperCase()}</p>
                  <p style={{ margin: "4px 0 0", color: "#f0fdf4", fontWeight: 800, fontSize: 18, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(v)}</p>
                  <p style={{ margin: 0, color: "#374151", fontSize: 10 }}>FDJ</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Nouvelle catégorie" : "Modifier"} onClose={() => setModal(null)}>
          <Field label="NOM">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={IS} placeholder="ex: Ligue 1" />
          </Field>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              ["centralfee", "CENTRAL (FDJ)"],
              ["assistantfee", "ASSISTANT (FDJ)"],
              ["fourthfee", "4ÈME (FDJ)"],
            ].map(([k, l]) => (
              <Field key={k} label={l} half>
                <input value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={IS} type="number" placeholder="0" />
              </Field>
            ))}
          </div>
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

