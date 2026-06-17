const { Pool } = require('pg');
const logger = require('./logger');

// Pool-Konfiguration mit Umgebungsvariablen
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Erhöht von 2000ms auf 10000ms
});

// Event-Listener für Fehler
pool.on('error', (err) => {
  logger.error('Unerwarteter Fehler im Pool:', err);
});

// Verbindung testen
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    logger.error('Datenbankverbindung fehlgeschlagen:', err.message);
    logger.error('Host:', process.env.DB_HOST);
    logger.error('Port:', process.env.DB_PORT);
    logger.error('Database:', process.env.DB_NAME);
  } else {
    logger.info('Datenbankverbindung erfolgreich hergestellt');
  }
});

module.exports = pool;
