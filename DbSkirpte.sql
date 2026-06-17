-- SQL Script Web Store für DBeaver

-- ENUM Types erstellen
CREATE TYPE kategorie_enum AS ENUM ('Foto', 'Grafik');
CREATE TYPE bewegung_enum AS ENUM ('Dynamisch', 'Statisch');
CREATE TYPE status_enum AS ENUM ('Neu', 'Normal');

-- Create Table Produkte
CREATE TABLE Produkte (
  Id SERIAL PRIMARY KEY,
  Titel VARCHAR(100) NOT NULL,
  KurzBeschreibung VARCHAR(200),
  Beschreibung TEXT,
  Preis NUMERIC(10, 2) NOT NULL,
  Kategorie kategorie_enum NOT NULL,
  Bewegung bewegung_enum NOT NULL,
  Farben JSONB,
  Status status_enum DEFAULT 'Normal',
  IsAktiv BOOLEAN DEFAULT TRUE,
  ErstelltAm TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  AktualisiertAm TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Table Bilder
CREATE TABLE Bilder (
  Id SERIAL PRIMARY KEY,
  ProduktId INT NOT NULL REFERENCES Produkte(Id) ON DELETE CASCADE,
  BildURL VARCHAR(255) NOT NULL,
  Reihenfolge INT DEFAULT 1,
  IsHauptbild BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_produkt FOREIGN KEY (ProduktId) REFERENCES Produkte(Id) ON DELETE CASCADE
);

-- Index für Performance
CREATE INDEX idx_bilder_produkt ON Bilder(ProduktId);


-- Testdaten in die Produkte-Tabelle einfügen
INSERT INTO Produkte (Titel, KurzBeschreibung, Preis, Kategorie, Bewegung) VALUES
  ('Rote Berglandschaft', 'Wunderschöne Berglandschaft in Rot', 3.99, 'Foto', 'Statisch'),
  ('Grüne Natur', 'Beruhigende grüne Naturaufnahme', 3.99, 'Foto', 'Statisch'),
  ('Gelbe Sonnenseite', 'Warme gelbe Sonnenuntergänge', 3.99, 'Grafik', 'Dynamisch');

-- Testdaten in die Bilder-Tabelle einfügen
INSERT INTO bilder (ProduktId, BildURL, reihenfolge) VALUES
  (1, 'product1.jpg',  1),
  (2, 'product2.jpg',  1),
  (3, 'product3.jpg',  1);

-- Create Table users
create table users(
	Id SERIAL primary key,
	email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Table cart
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  added_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(email) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES produkte(id) ON DELETE CASCADE
);

-- Create Table orders (Bestellungen)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  ordered_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(email) ON DELETE CASCADE
);

-- Create Table order_items (Bestellpositionen)
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  preis NUMERIC(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES produkte(id) ON DELETE CASCADE
);