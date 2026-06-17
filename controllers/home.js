const logger = require("../utils/logger.js");
const productStore = require("../models/product-store.js");
const cartStore = require("../models/cart-store.js");
const orderStore = require("../models/order-store.js");


const home = {
  async index(request, response) {
    logger.info("home rendering");
    
    try {
      const products = await productStore.getTopProducts(10); 
      
      const viewData = {
        title: "Mars-Store.com",
        products: products,
        session: request.session
      };
      response.render("index", viewData);
    } catch (error) {
      logger.error("Fehler beim Abrufen der Produkte:", error);
      response.status(500).send("Fehler beim Laden der Produkte");
    }
  },

  async detail(request, response) {
    logger.info("detail rendering");
    const productId = request.params.id;

    try {
      const product = await productStore.getProductById(productId);
      
      if (!product) {
        return response.status(404).send("Produkt nicht gefunden");
      }

      const viewData = {
        title: product.titel,
        product: product,
        session: request.session
      };
      response.render("detail", viewData);
    } catch (error) {
      logger.error("Fehler beim Abrufen des Produkts:", error);
      response.status(500).send("Fehler beim Laden des Produkts");
    }
  },


  async cart(request, response) {
  logger.info("cart rendering");
  
  if (!request.session.user) {
    return response.redirect("/login");
  }

  try {
    const cartItems = await cartStore.getCartItems(request.session.user.id);
    
    // Berechne Summe
    const total = cartItems.reduce((sum, item) => sum + (item.preis * item.quantity), 0);

    const viewData = {
      title: "Warenkorb",
      cartItems: cartItems,
      total: total.toFixed(2),
      session: request.session
    };
    response.render("Shoppingcart", viewData);
  } catch (error) {
    logger.error("Fehler beim Laden des Warenkorbs:", error);
    response.status(500).send("Fehler beim Laden des Warenkorbs");
  }
},

async addToCart(request, response) {
  if (!request.session.user) {
    return response.redirect("/login");
  }

  const { productId, quantity } = request.body;
  try {
    await cartStore.addToCart(request.session.user.id, productId, quantity || 1);
    response.redirect("/cart");
  } catch (error) {
    logger.error("Error adding to cart", error);
    response.status(500).send("Fehler beim Hinzufügen zum Warenkorb");
  }
},

async removeFromCart(request, response) {
  const { id } = request.params;
  try {
    await cartStore.removeFromCart(id);
    response.redirect("/cart");
  } catch (error) {
    logger.error("Error removing from cart", error);
    response.status(500).send("Fehler beim Entfernen aus dem Warenkorb");
  }
},

async updateQuantity(request, response) {
  const { id } = request.params;
  const { quantity } = request.body;
  try {
    await cartStore.updateQuantity(id, quantity);
    response.redirect("/cart");
  } catch (error) {
    logger.error("Error updating quantity", error);
    response.status(500).send("Fehler beim Aktualisieren der Menge");
  }
},

async checkout(request, response) {
  if (!request.session.user) {
    return response.redirect("/login");
  }

  try {
    const userId = request.session.user.id;
    const cartItems = await cartStore.getCartItems(userId);

    if (cartItems.length === 0) {
      return response.redirect("/cart");
    }

    const total = cartItems.reduce((sum, item) => sum + (item.preis * item.quantity), 0);

    await orderStore.createOrder(userId, cartItems, total.toFixed(2));
    await cartStore.clearCart(userId);

    response.redirect("/profile");
  } catch (error) {
    logger.error("Error during checkout", error);
    response.status(500).send("Fehler beim Kaufvorgang");
  }
}
};

module.exports = home;