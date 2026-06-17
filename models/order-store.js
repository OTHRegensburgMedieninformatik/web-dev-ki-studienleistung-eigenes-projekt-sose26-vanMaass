const dataStore = require("./data-store.js");
const dataStoreClient = dataStore.getDataStore();
const logger = require("../utils/logger.js");

const orderStore = {
  async createOrder(userId, cartItems, total) {
    try {
      // Bestellung anlegen
      const orderQuery = 'INSERT INTO "MarsStore"."orders" (user_id, total) VALUES ($1, $2) RETURNING id';
      const orderResult = await dataStoreClient.query(orderQuery, [userId, total]);
      const orderId = orderResult.rows[0].id;

      // Bestellpositionen anlegen
      for (const item of cartItems) {
        const itemQuery = 'INSERT INTO "MarsStore"."order_items" (order_id, product_id, quantity, preis) VALUES ($1, $2, $3, $4)';
        await dataStoreClient.query(itemQuery, [orderId, item.product_id, item.quantity, item.preis]);
      }

      logger.info("Order created", { orderId, userId, total });
      return orderId;
    } catch (e) {
      logger.error("Error creating order", e);
      throw e;
    }
  },

  async getOrdersByUser(userId) {
    const query = `
      SELECT o.id, o.total, o.ordered_at,
        json_agg(json_build_object(
          'titel', p.titel,
          'preis', oi.preis,
          'quantity', oi.quantity
        )) as items
      FROM "MarsStore"."orders" o
      JOIN "MarsStore"."order_items" oi ON o.id = oi.order_id
      JOIN "MarsStore"."produkte" p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.ordered_at DESC
    `;
    try {
      const result = await dataStoreClient.query(query, [userId]);
      return result.rows;
    } catch (e) {
      logger.error("Error fetching orders", e);
      throw e;
    }
  }
};

module.exports = orderStore;
