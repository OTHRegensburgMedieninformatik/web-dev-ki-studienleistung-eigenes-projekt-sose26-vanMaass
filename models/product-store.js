const dataStore = require("./data-store.js");
const dataStoreClient = dataStore.getDataStore();
const logger = require("../utils/logger.js");


const productStore = {
    /// Holt alle Produkte mit ihren Bildern
    async getAllProducts() {
        const query = `
            SELECT 
              p.id, 
              p.titel, 
              p.kurzbeschreibung, 
              p.beschreibung,
              p.preis, 
              p.kategorie, 
              p.bewegung,
              p.farben,
              p.status,
              p.isaktiv,
              p.erstelltam,
              b.bildurl,
              b.reihenfolge,
              b.ishauptbild
            FROM "MarsStore".produkte p
            LEFT JOIN "MarsStore".bilder b ON p.id = b.produktid
            ORDER BY p.id, b.reihenfolge
        `;
        
        try {
            let result = await dataStoreClient.query(query);
            
            // Gruppiere Bilder nach Produkten
            const products = {};
            result.rows.forEach(row => {
                if (!products[row.id]) {
                    products[row.id] = {
                        id: row.id,
                        titel: row.titel,
                        kurzbeschreibung: row.kurzbeschreibung,
                        beschreibung: row.beschreibung,
                        preis: row.preis,
                        kategorie: row.kategorie,
                        bewegung: row.bewegung,
                        farben: row.farben,
                        status: row.status,
                        isaktiv: row.isaktiv,
                        erstelltam: row.erstelltam,
                        bilder: []
                    };
                }
                if (row.bildurl) {
                    products[row.id].bilder.push({
                        bildurl: row.bildurl,
                        reihenfolge: row.reihenfolge,
                        ishauptbild: row.ishauptbild
                    });
                }
            });
            
            // Konvertiere Objekt zu Array
            const productList = Object.values(products);
            logger.info(`Fetched ${productList.length} products with images`);
            
            return productList;
        } catch (e) {
            logger.error("Error fetching products with images", e);
            return [];
        }
    },

    /**
     * Holt ein einzelnes Produkt mit seinen Bildern
     * 
     * @param {number} id - Product ID
     * @returns {Promise<Object|null>} Product object or null
     */
    async getProductById(id) {
        const query = `
            SELECT 
              p.id, 
              p.titel, 
              p.kurzbeschreibung, 
              p.beschreibung,
              p.preis, 
              p.kategorie, 
              p.bewegung,
              p.farben,
              p.status,
              p.isaktiv,
              p.erstelltam,
              b.bildurl,
              b.reihenfolge,
              b.ishauptbild
            FROM "MarsStore".produkte p
            LEFT JOIN "MarsStore".bilder b ON p.id = b.produktid
            WHERE p.id = $1
            ORDER BY b.reihenfolge
        `;
        const values = [id];
        
        try {
            let result = await dataStoreClient.query(query, values);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            // Gruppiere Bilder für dieses Produkt
            const firstRow = result.rows[0];
            const product = {
                id: firstRow.id,
                titel: firstRow.titel,
                kurzbeschreibung: firstRow.kurzbeschreibung,
                beschreibung: firstRow.beschreibung,
                preis: firstRow.preis,
                kategorie: firstRow.kategorie,
                bewegung: firstRow.bewegung,
                farben: firstRow.farben,
                status: firstRow.status,
                isaktiv: firstRow.isaktiv,
                erstelltam: firstRow.erstelltam,
                bilder: []
            };
            
            result.rows.forEach(row => {
                if (row.bildurl) {
                    product.bilder.push({
                        bildurl: row.bildurl,
                        reihenfolge: row.reihenfolge,
                        ishauptbild: row.ishauptbild
                    });
                }
            });
            
            logger.info(`Fetched product ${id} with ${product.bilder.length} images`);
            return product;
        } catch (e) {
            logger.error("Error fetching product by id", e);
            return null;
        }
    },
    // Holt die ersten 10 Produkte für die Startseite
    async getTopProducts(limit = 10) {
        const query = `
            SELECT 
            p.id, 
            p.titel, 
            p.kurzbeschreibung, 
            p.beschreibung,
            p.preis, 
            p.kategorie, 
            p.bewegung,
            p.farben,
            p.status,
            p.isaktiv,
            p.erstelltam,
            b.bildurl,
            b.reihenfolge,
            b.ishauptbild
            FROM "MarsStore".produkte p
            LEFT JOIN "MarsStore".bilder b ON p.id = b.produktid
            ORDER BY p.id, b.reihenfolge
            LIMIT $1
        `;
        const values = [limit];
        
        try {
            let result = await dataStoreClient.query(query, values);
            
            // Gleiche Gruppier-Logik wie getAllProducts()
            const products = {};
            result.rows.forEach(row => {
                if (!products[row.id]) {
                    products[row.id] = {
                        id: row.id,
                        titel: row.titel,
                        // ... rest
                        bilder: []
                    };
                }
                if (row.bildurl) {
                    products[row.id].bilder.push({
                        bildurl: row.bildurl,
                        reihenfolge: row.reihenfolge,
                        ishauptbild: row.ishauptbild
                    });
                }
            });
            
            const productList = Object.values(products);
            logger.info(`Fetched top ${productList.length} products`);
            return productList;
        } catch (e) {
            logger.error("Error fetching top products", e);
            return [];
        }
    },

    /**
     * Holt Produkte nach Kategorie
     * 
     * @param {string} kategorie - Category name
     * @returns {Promise<Array>} Products in category
     */
    async getProductsByCategory(kategorie) {
        const query = `
            SELECT 
              p.id, 
              p.titel, 
              p.kurzbeschreibung, 
              p.beschreibung,
              p.preis, 
              p.kategorie, 
              p.bewegung,
              p.farben,
              p.status,
              p.isaktiv,
              p.erstelltam,
              b.bildurl,
              b.reihenfolge,
              b.ishauptbild
            FROM "MarsStore".produkte p
            LEFT JOIN "MarsStore".bilder b ON p.id = b.produktid
            WHERE p.kategorie = $1
            ORDER BY p.id, b.reihenfolge
        `;
        const values = [kategorie];
        
        try {
            let result = await dataStoreClient.query(query, values);
            
            // Gruppiere Bilder nach Produkten (gleiche Logik wie getAllProducts)
            const products = {};
            result.rows.forEach(row => {
                if (!products[row.id]) {
                    products[row.id] = {
                        id: row.id,
                        titel: row.titel,
                        kurzbeschreibung: row.kurzbeschreibung,
                        beschreibung: row.beschreibung,
                        preis: row.preis,
                        kategorie: row.kategorie,
                        bewegung: row.bewegung,
                        farben: row.farben,
                        status: row.status,
                        isaktiv: row.isaktiv,
                        erstelltam: row.erstelltam,
                        bilder: []
                    };
                }
                if (row.bildurl) {
                    products[row.id].bilder.push({
                        bildurl: row.bildurl,
                        reihenfolge: row.reihenfolge,
                        ishauptbild: row.ishauptbild
                    });
                }
            });
            
            const productList = Object.values(products);
            logger.info(`Fetched ${productList.length} products in category ${kategorie}`);
            return productList;
        } catch (e) {
            logger.error("Error fetching products by category", e);
            return [];
        }
    },

    async addProduct(product) {
        const query = `
            INSERT INTO "MarsStore".produkte (titel, kurzbeschreibung, beschreibung, preis, kategorie, bewegung, farben, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `;
        const values = [
            product.titel,
            product.kurzbeschreibung,
            product.beschreibung,
            product.preis,
            product.kategorie,
            product.bewegung,
            product.farben ? JSON.stringify(product.farben) : null,
            product.status || 'Normal'
        ];
        try {
            const result = await dataStoreClient.query(query, values);
            logger.info("Product added", { id: result.rows[0].id });
            return result.rows[0].id;
        } catch (e) {
            logger.error("Error adding product", e);
            throw e;
        }
    },

    async addImage(produktId, bildurl, reihenfolge, isHauptbild) {
        const query = `
            INSERT INTO "MarsStore".bilder (produktid, bildurl, reihenfolge, ishauptbild)
            VALUES ($1, $2, $3, $4)
        `;
        const values = [produktId, bildurl, reihenfolge, isHauptbild];
        try {
            await dataStoreClient.query(query, values);
            logger.info("Image added", { produktId, bildurl });
        } catch (e) {
            logger.error("Error adding image", e);
            throw e;
        }
    },

};

module.exports = productStore;
