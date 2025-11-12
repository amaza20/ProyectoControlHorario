-- ===========================================================
-- 🧱 TABLA: FICHAJES
-- ===========================================================
CREATE TABLE IF NOT EXISTS fichajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    instante TEXT NOT NULL,  
    tipo TEXT CHECK(tipo IN ('ENTRA', 'SALE')) NOT NULL,
    huella TEXT,
    id_edicion INTEGER
);

-- ===========================================================
-- 🧱 TABLA: EDICIONES
-- ===========================================================
CREATE TABLE IF NOT EXISTS ediciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fichaje_id INTEGER NOT NULL,
    instante TEXT NOT NULL,  
    tipo TEXT CHECK(tipo IN ('ENTRA', 'SALE')) NOT NULL,
    huella_fichaje TEXT,
    huella TEXT,
    FOREIGN KEY (fichaje_id) REFERENCES fichajes(id)
);
