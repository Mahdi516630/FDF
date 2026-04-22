import { selectAll, run } from "./sqlite";

export function repo(db) {
  return {
    // Auth
    getUserByEmail: (email) =>
      selectAll(db, "SELECT email,password,created_at FROM users WHERE email = ?", [email])[0] || null,
    createUser: ({ email, password }) => {
      run(db, "INSERT INTO users(email,password,created_at) VALUES (?,?,datetime('now'))", [
        email,
        password,
      ]);
    },

    // Referees
    listReferees: () =>
      selectAll(
        db,
        "SELECT id,name,phone,level,created_at as createdAt FROM referees ORDER BY name COLLATE NOCASE ASC"
      ),
    addReferee: (r) => {
      run(db, "INSERT INTO referees(id,name,phone,level,created_at) VALUES (?,?,?,?,?)", [
        r.id,
        r.name,
        r.phone || "",
        r.level || "",
        r.createdAt,
      ]);
    },
    updateReferee: (id, patch) => {
      run(db, "UPDATE referees SET name=?, phone=?, level=? WHERE id=?", [
        patch.name,
        patch.phone || "",
        patch.level || "",
        id,
      ]);
    },
    deleteReferee: (id) => run(db, "DELETE FROM referees WHERE id=?", [id]),

    // Categories
    listCategories: () =>
      selectAll(
        db,
        "SELECT id,name,central_fee as centralfee, assistant_fee as assistantfee, fourth_fee as fourthfee FROM categories ORDER BY name COLLATE NOCASE ASC"
      ),
    addCategory: (c) => {
      run(db, "INSERT INTO categories(id,name,central_fee,assistant_fee,fourth_fee) VALUES (?,?,?,?,?)", [
        c.id,
        c.name,
        c.centralfee,
        c.assistantfee,
        c.fourthfee,
      ]);
    },
    updateCategory: (id, patch) => {
      run(db, "UPDATE categories SET name=?, central_fee=?, assistant_fee=?, fourth_fee=? WHERE id=?", [
        patch.name,
        patch.centralfee,
        patch.assistantfee,
        patch.fourthfee,
        id,
      ]);
    },
    deleteCategory: (id) => run(db, "DELETE FROM categories WHERE id=?", [id]),

    // Designations
    listDesignations: () =>
      selectAll(
        db,
        `SELECT
          id,date,jour,heure,teama,teamb,terrain,matchnumber,
          category_id as categoryid,
          central_id as centralid,
          assistant1_id as assistant1id,
          assistant2_id as assistant2id,
          fourth_id as fourthid,
          observateur
        FROM designations
        ORDER BY created_at DESC`
      ),
    addDesignation: (d) => {
      run(
        db,
        `INSERT INTO designations(
          id,date,jour,heure,teama,teamb,terrain,matchnumber,category_id,
          central_id,assistant1_id,assistant2_id,fourth_id,observateur,created_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))`,
        [
          d.id,
          d.date,
          d.jour || "",
          d.heure || "",
          d.teama,
          d.teamb,
          d.terrain || "",
          d.matchnumber || "",
          d.categoryid,
          d.centralid,
          d.assistant1id,
          d.assistant2id,
          d.fourthid,
          d.observateur || "",
        ]
      );
    },
    deleteDesignation: (id) => run(db, "DELETE FROM designations WHERE id=?", [id]),
  };
}

