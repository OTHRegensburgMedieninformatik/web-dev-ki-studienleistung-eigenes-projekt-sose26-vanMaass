const dataStore = require("./data-store.js");
const dataStoreClient = dataStore.getDataStore();
const logger = require("../utils/logger.js");

const cartStore = {
  async addToCart(userId, productId, quantity = 1) {
    try {
      // Erst prüfen, ob das Item schon im Warenkorb ist
      const checkQuery = 'SELECT * FROM "MarsStore"."cart_items" WHERE user_id = $1 AND product_id = $2';
      const checkResult = await dataStoreClient.query(checkQuery, [userId, productId]);
      
      if (checkResult.rows.length > 0) {
        // Item existiert, Update Menge
        const updateQuery = 'UPDATE "MarsStore"."cart_items" SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3';
        await dataStoreClient.query(updateQuery, [quantity, userId, productId]);
      } else {
        // Item existiert nicht, Insert
        const insertQuery = 'INSERT INTO "MarsStore"."cart_items" (user_id, product_id, quantity) VALUES ($1, $2, $3)';
        await dataStoreClient.query(insertQuery, [userId, productId, quantity]);
      }
      
      logger.info("Item added to cart", { userId, productId, quantity });
    } catch (e) {
      logger.error("Error adding to cart", e);
      throw e;
    }
  },

  async getCartItems(userId) {  //Select Befehl mithilfe von KI
    const query = `
      SELECT c.id, c.product_id, c.quantity, p.titel, p.preis, json_agg(json_build_object('bildurl', b.bildurl)) as bilder 
      FROM "MarsStore"."cart_items" c
      JOIN "MarsStore"."produkte" p ON c.product_id = p.id
      LEFT JOIN "MarsStore"."bilder" b ON p.id = b.produktid
      WHERE c.user_id = $1
      GROUP BY c.id, p.id
      ORDER BY c.added_at DESC
    `;
    const values = [userId];
    try {
      const result = await dataStoreClient.query(query, values);
      return result.rows;
    } catch (e) {
      logger.error("Error fetching cart items", e);
      throw e;
    }
  },

  async removeFromCart(cartItemId) {
    const query = 'DELETE FROM "MarsStore"."cart_items" WHERE id = $1';
    const values = [cartItemId];
    try {
      await dataStoreClient.query(query, values);
      logger.info("Item removed from cart", { cartItemId });
    } catch (e) {
      logger.error("Error removing from cart", e);
      throw e;
    }
  },

  async clearCart(userId) {
    const query = 'DELETE FROM "MarsStore"."cart_items" WHERE user_id = $1';
    const values = [userId];
    try {
      await dataStoreClient.query(query, values);
      logger.info("Cart cleared", { userId });
    } catch (e) {
      logger.error("Error clearing cart", e);
      throw e;
    }
  },

  async updateQuantity(cartItemId, quantity) {
    const query = 'UPDATE "MarsStore"."cart_items" SET quantity = $1 WHERE id = $2';
    const values = [quantity, cartItemId];
    try {
      await dataStoreClient.query(query, values);
      logger.info("Quantity updated", { cartItemId, quantity });
    } catch (e) {
      logger.error("Error updating quantity", e);
      throw e;
    }
  }
};

module.exports = cartStore;