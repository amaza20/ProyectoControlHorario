-- ===========================================================
--  TABLA: FICHAJES
-- ===========================================================
CREATE TABLE IF NOT EXISTS fichajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    instante TEXT NOT NULL,  
    tipo TEXT CHECK(tipo IN ('ENTRA', 'SALE')) NOT NULL,
    huella TEXT,
    id_edicion INTEGER,
    FOREIGN KEY (id_edicion) REFERENCES ediciones(id)
);


-- ===========================================================
--  TABLA: EDICIONES
-- ===========================================================
CREATE TABLE IF NOT EXISTS ediciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fichaje_id INTEGER NOT NULL,
    instante TEXT NOT NULL,  
    tipo TEXT CHECK(tipo IN ('ENTRA', 'SALE')) NOT NULL,
    huella_fichaje TEXT,   -- huella original del fichaje antes de editar
    huella TEXT,           -- nueva huella después de la edición
    FOREIGN KEY (fichaje_id) REFERENCES fichajes(id)
);


-- ===========================================================
--  TABLA: SOLICITUD_EDICION
-- ===========================================================
CREATE TABLE IF NOT EXISTS solicitud_edicion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fichaje_id INTEGER NOT NULL,
    nuevo_instante TEXT NOT NULL,
    tipo TEXT CHECK(tipo IN ('ENTRA', 'SALE')) NOT NULL,
    aprobado TEXT CHECK(aprobado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')) DEFAULT 'PENDIENTE',
    FOREIGN KEY (fichaje_id) REFERENCES fichajes(id)
);
