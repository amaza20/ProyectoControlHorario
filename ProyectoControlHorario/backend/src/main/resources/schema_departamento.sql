-- ===========================================================
-- 🧱 TABLA: FICHAJES
-- ===========================================================
CREATE TABLE IF NOT EXISTS fichajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT NOT NULL,
    fecha_hora TEXT NOT NULL,  -- ← nombre coherente con el backend (formato dd/MM/yyyy HH:mm:ss)
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
    fecha_hora TEXT NOT NULL,  -- ← también coherente con el formato
    tipo TEXT CHECK(tipo IN ('ENTRA', 'SALE')) NOT NULL,
    huella_fichaje TEXT,
    huella TEXT,
    FOREIGN KEY (fichaje_id) REFERENCES fichajes(id)
);
