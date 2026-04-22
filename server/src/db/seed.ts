export const LEVELS = [
  "Élite",
  "International",
  "National A",
  "National B",
  "Régional",
  "Stagiaire 2023",
  "Stagiaire 2024",
  "Stagiaire 2025"
] as const;

export const SEED_REFS = [
  { id: "r1", name: "Abdi Hassan Omar", phone: "77831245", level: "International" },
  { id: "r2", name: "Fadumo Warsame Ali", phone: "77913467", level: "National A" },
  { id: "r3", name: "Mahad Ismail Dirie", phone: "77567890", level: "Élite" },
  { id: "r4", name: "Hodan Jama Elmi", phone: "77234512", level: "National B" },
  { id: "r5", name: "Daher Guirreh Aden", phone: "77678901", level: "Régional" },
  { id: "r6", name: "Said Ali Ahmed", phone: "77658774", level: "Stagiaire 2023" },
  { id: "r7", name: "Moussa Dirieh", phone: "77112233", level: "National A" }
];

export const SEED_CATS = [
  { id: "c1", name: "Ligue 1", centralfee: 8000, assistantfee: 5000, fourthfee: 3000 },
  { id: "c2", name: "Ligue 2", centralfee: 6000, assistantfee: 4000, fourthfee: 2500 },
  { id: "c3", name: "Coupe FDF", centralfee: 10000, assistantfee: 6500, fourthfee: 4000 }
];

export const SEED_DESIGS = [
  {
    id: "d1",
    date: "21 AVRIL",
    jour: "LUNDI",
    heure: "17H00",
    teama: "AS Port",
    teamb: "Artar Sihid",
    terrain: "Académie Douda",
    matchnumber: "61",
    categoryid: "c3",
    centralid: "r1",
    assistant1id: "r2",
    assistant2id: "r3",
    fourthid: "r4",
    observateur: "Med Ali Farah"
  },
  {
    id: "d2",
    date: "21 AVRIL",
    jour: "LUNDI",
    heure: "19H00",
    teama: "ASAS Télécom",
    teamb: "FC Obock",
    terrain: "",
    matchnumber: "62",
    categoryid: "c3",
    centralid: "r5",
    assistant1id: "r6",
    assistant2id: "r7",
    fourthid: "r1",
    observateur: "Ourouke"
  },
  {
    id: "d3",
    date: "22 AVRIL",
    jour: "MARDI",
    heure: "17H00",
    teama: "AS Arta",
    teamb: "Dikhil FC",
    terrain: "El Hadj Hassan",
    matchnumber: "01",
    categoryid: "c1",
    centralid: "r2",
    assistant1id: "r3",
    assistant2id: "r4",
    fourthid: "r5",
    observateur: ""
  },
  {
    id: "d4",
    date: "22 AVRIL",
    jour: "MARDI",
    heure: "19H00",
    teama: "FC Djibouti",
    teamb: "Gendarmerie",
    terrain: "El Hadj Hassan",
    matchnumber: "02",
    categoryid: "c1",
    centralid: "r6",
    assistant1id: "r7",
    assistant2id: "r1",
    fourthid: "r2",
    observateur: ""
  },
  {
    id: "d5",
    date: "23 AVRIL",
    jour: "MERCREDI",
    heure: "17H00",
    teama: "Police FC",
    teamb: "AS Tadjourah",
    terrain: "El Hadj Hassan",
    matchnumber: "03",
    categoryid: "c2",
    centralid: "r3",
    assistant1id: "r4",
    assistant2id: "r5",
    fourthid: "r6",
    observateur: ""
  }
];

