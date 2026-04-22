import React, { useMemo, useState } from "react";
import { I } from "../../ui/icons";
import { Badge, Btn, Field, IS, Modal, SS } from "../../ui/primitives";
import { genId } from "../../utils/format";
import { exportDesignationXlsx } from "./exportExcel";

export function DesignationsTab({ designations, referees, categories, toast, onCreate, onDelete }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [exportModal, setExportModal] = useState(false);
  const [form, setForm] = useState({
    date: "21 AVRIL",
    jour: "LUNDI",
    heure: "17H00",
    teama: "",
    teamb: "",
    terrain: "",
    matchnumber: "",
    categoryid: "",
    centralid: "",
    assistant1id: "",
    assistant2id: "",
    fourthid: "",
    observateur: "",
  });

  const getRef = (id) => referees.find((r) => r.id === id);
  const getCat = (id) => categories.find((c) => c.id === id);

  const filtered = useMemo(() => {
    return designations.filter((d) => {
      const matchSearch =
        d.teama.toLowerCase().includes(search.toLowerCase()) ||
        d.teamb.toLowerCase().includes(search.toLowerCase()) ||
        (d.matchnumber || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === "all" || d.categoryid === filterCat;
      return matchSearch && matchCat;
    });
  }, [designations, search, filterCat]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((d) => d.id)));
  };

  const save = async () => {
    const { date, teama, teamb, categoryid, centralid, assistant1id, assistant2id, fourthid } = form;
    if (!date || !teama || !teamb || !categoryid || !centralid || !assistant1id || !assistant2id || !fourthid) {
      toast("Champs obligatoires manquants.", "error");
      return;
    }
    const roles = [centralid, assistant1id, assistant2id, fourthid];
    if (new Set(roles).size !== roles.length) {
      toast("Un arbitre ne peut avoir deux rôles.", "error");
      return;
    }
    try {
      await onCreate({ id: genId(), ...form });
      toast("Désignation créée !");
      setModal(null);
    } catch (ex) {
      toast(ex?.message === "DuplicateRoles" ? "Un arbitre ne peut avoir deux rôles." : "Erreur.", "error");
    }
  };

  const del = async (id) => {
    if (!confirm("Supprimer ?")) return;
    await onDelete(id);
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    toast("Supprimée.", "warning");
  };

  const doExport = () => {
    const sel = designations.filter((d) => selected.has(d.id));
    if (sel.length === 0) {
      toast("Aucun match sélectionné.", "error");
      return;
    }
    const cat = getCat(sel[0].categoryid);
    exportDesignationXlsx(cat, sel, referees, categories);
    toast(`Export Excel: ${sel.length} match(s) exporté(s) !`);
    setExportModal(false);
  };

  const catColors = {};
  categories.forEach((c, i) => {
    catColors[c.id] = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"][i % 5];
  });

  const JOURS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"];

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#4b5563" }}>{I.search}</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Équipe, N° match..." style={{ ...IS, paddingLeft: 34 }} />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ ...SS, width: "auto", minWidth: 130 }}>
          <option value="all">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Btn
          onClick={() => {
            setForm({
              date: "21 AVRIL",
              jour: "LUNDI",
              heure: "17H00",
              teama: "",
              teamb: "",
              terrain: "",
              matchnumber: "",
              categoryid: categories[0]?.id || "",
              centralid: "",
              assistant1id: "",
              assistant2id: "",
              fourthid: "",
              observateur: "",
            });
            setModal("add");
          }}
        >
          {I.plus} Nouveau
        </Btn>
        <Btn
          onClick={() => {
            if (selected.size === 0) {
              toast("Sélectionnez d'abord des matchs.", "warning");
              return;
            }
            setExportModal(true);
          }}
          color="#3b82f6"
        >
          {I.upload} Exporter ({selected.size})
        </Btn>
      </div>

      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,.07)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,.5)" }}>
              <th style={{ padding: "11px 14px", width: 36 }}>
                <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ cursor: "pointer", accentColor: "#10b981" }} />
              </th>
              {["N°", "Date / Heure", "Match", "Catégorie", "Arbitre Central", "Assistants", "4ème", "Actions"].map((h, i) => (
                <th key={i} style={{ padding: "11px 14px", textAlign: "left", color: "#6b7280", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", borderBottom: "1px solid rgba(255,255,255,.07)", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#374151" }}>
                  Aucune désignation.
                </td>
              </tr>
            )}
            {filtered.map((d, i) => {
              const cat = getCat(d.categoryid);
              const isSel = selected.has(d.id);
              return (
                <tr key={d.id} className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,.04)", background: isSel ? "rgba(16,185,129,.06)" : "transparent", transition: "background .15s" }}>
                  <td style={{ padding: "9px 14px" }}>
                    <input type="checkbox" checked={isSel} onChange={() => toggleSelect(d.id)} style={{ cursor: "pointer", accentColor: "#10b981" }} />
                  </td>
                  <td style={{ padding: "9px 14px", color: "#6b7280", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>{String(i + 1).padStart(2, "0")}</td>
                  <td style={{ padding: "9px 14px" }}>
                    <p style={{ margin: 0, color: "#f0fdf4", fontSize: 12, fontWeight: 600 }}>
                      {d.date} — {d.heure}
                    </p>
                    <p style={{ margin: "1px 0 0", color: "#4b5563", fontSize: 11 }}>{d.jour}</p>
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <p style={{ margin: 0, color: "#f0fdf4", fontSize: 13, fontWeight: 700 }}>
                      {d.teama} <span style={{ color: "#374151" }}>vs</span> {d.teamb}
                    </p>
                    {d.matchnumber && <p style={{ margin: "2px 0 0", color: "#4b5563", fontSize: 11 }}>N° {d.matchnumber} {d.terrain && `• ${d.terrain}`}</p>}
                  </td>
                  <td style={{ padding: "9px 14px" }}>{cat && <Badge color={catColors[cat.id]}>{cat.name}</Badge>}</td>
                  <td style={{ padding: "9px 14px", color: "#d1d5db", fontSize: 12, fontWeight: 600 }}>{getRef(d.centralid)?.name || "—"}</td>
                  <td style={{ padding: "9px 14px" }}>
                    <p style={{ margin: 0, color: "#9ca3af", fontSize: 11 }}>{getRef(d.assistant1id)?.name || "—"}</p>
                    <p style={{ margin: "2px 0 0", color: "#9ca3af", fontSize: 11 }}>{getRef(d.assistant2id)?.name || "—"}</p>
                  </td>
                  <td style={{ padding: "9px 14px", color: "#9ca3af", fontSize: 12 }}>{getRef(d.fourthid)?.name || "—"}</td>
                  <td style={{ padding: "9px 14px" }}>
                    <button onClick={() => del(d.id)} style={{ background: "rgba(239,68,68,.1)", border: "none", borderRadius: 6, padding: 6, cursor: "pointer", color: "#f87171" }}>
                      {I.trash}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {exportModal && (
        <Modal title="📤 Exporter la feuille de désignation" onClose={() => setExportModal(false)} wide>
          <p style={{ margin: "0 0 12px", color: "#9ca3af", fontSize: 13 }}>
            <strong style={{ color: "#10b981" }}>{selected.size}</strong> match(s) sélectionné(s)
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={() => setExportModal(false)} outline color="#6b7280">
              Annuler
            </Btn>
            <Btn onClick={doExport} color="#3b82f6">
              {I.dl} Télécharger Excel
            </Btn>
          </div>
        </Modal>
      )}

      {modal === "add" && (
        <Modal title="Nouvelle désignation" onClose={() => setModal(null)} wide>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Field label="DATE" half>
              <input value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={IS} placeholder="21 AVRIL" />
            </Field>
            <Field label="JOUR" half>
              <select value={form.jour} onChange={(e) => setForm((f) => ({ ...f, jour: e.target.value }))} style={SS}>
                {JOURS.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="HEURE" half>
              <input value={form.heure} onChange={(e) => setForm((f) => ({ ...f, heure: e.target.value }))} style={IS} placeholder="17H00" />
            </Field>
            <Field label="N° MATCH" half>
              <input value={form.matchnumber} onChange={(e) => setForm((f) => ({ ...f, matchnumber: e.target.value }))} style={IS} placeholder="61" />
            </Field>
            <Field label="ÉQUIPE A" half>
              <input value={form.teama} onChange={(e) => setForm((f) => ({ ...f, teama: e.target.value }))} style={IS} placeholder="AS Port" />
            </Field>
            <Field label="ÉQUIPE B" half>
              <input value={form.teamb} onChange={(e) => setForm((f) => ({ ...f, teamb: e.target.value }))} style={IS} placeholder="FC Obock" />
            </Field>
            <Field label="TERRAIN">
              <input value={form.terrain} onChange={(e) => setForm((f) => ({ ...f, terrain: e.target.value }))} style={IS} placeholder="Académie Douda" />
            </Field>
            <Field label="CATÉGORIE">
              <select value={form.categoryid} onChange={(e) => setForm((f) => ({ ...f, categoryid: e.target.value }))} style={SS}>
                <option value="">-- Sélectionner --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 16, marginTop: 4 }}>
            <p style={{ margin: "0 0 12px", color: "#6b7280", fontSize: 11, fontWeight: 700, letterSpacing: ".06em" }}>DÉSIGNATION DES ARBITRES</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {[
                ["centralid", "🟢 ARBITRE CENTRAL"],
                ["assistant1id", "🔵 ASSISTANT 1"],
                ["assistant2id", "🔵 ASSISTANT 2"],
                ["fourthid", "🟡 4ÈME ARBITRE"],
              ].map(([k, l]) => (
                <Field key={k} label={l} half>
                  <select value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={SS}>
                    <option value="">-- Sélectionner --</option>
                    {referees.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </Field>
              ))}
            </div>
          </div>
          <Field label="OBSERVATEUR (optionnel)">
            <input value={form.observateur} onChange={(e) => setForm((f) => ({ ...f, observateur: e.target.value }))} style={IS} placeholder="Nom de l'observateur" />
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={() => setModal(null)} outline color="#6b7280">
              Annuler
            </Btn>
            <Btn onClick={save}>Créer la désignation</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

