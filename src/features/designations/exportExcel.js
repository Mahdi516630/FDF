import * as XLSX from "xlsx";

function buildXLSXBlob(sheetName, rows, colWidths) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  if (Array.isArray(colWidths) && colWidths.length) {
    ws["!cols"] = colWidths.map((wch) => ({ wch }));
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName || "Sheet1");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function exportDesignationXlsx(category, selectedDesigs, referees, categories) {
  const cat = categories.find((c) => c.id === category?.id);
  const getRef = (id) => referees.find((r) => r.id === id);

  const header = [
    ["", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "FÉDÉRATION DJIBOUTIENNE DE FOOTBALL", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "Tel : (00253) 35 35 99 - Fax : (00253) 35 35 98 - B.P : 2694", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "fdf@yahoo.fr", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "COMMISSION CENTRALE DES ARBITRES", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", cat ? cat.name.toUpperCase() : "DÉSIGNATION", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["Date", "JOUR", "HEURE", "Equipe A", "Equipe B", "TERRAIN", "MATC N°", "Arbitre", "Assisstant 1", "Assisstant 2", "4eme officiel", "OBSERVATEUR", ""],
  ];

  const dataRows = selectedDesigs.map((d) => [
    d.date,
    d.jour || "",
    d.heure || "",
    d.teama,
    d.teamb,
    d.terrain || "",
    d.matchnumber,
    getRef(d.centralid)?.name || "",
    getRef(d.assistant1id)?.name || "",
    getRef(d.assistant2id)?.name || "",
    getRef(d.fourthid)?.name || "",
    d.observateur || "",
    "",
  ]);

  const allRows = [...header, ...dataRows];
  const blob = buildXLSXBlob(cat?.name || "Désignation", allRows, [12, 10, 8, 18, 18, 20, 8, 22, 22, 22, 18, 18, 5]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Désignation_${(cat?.name || "matchs").replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

