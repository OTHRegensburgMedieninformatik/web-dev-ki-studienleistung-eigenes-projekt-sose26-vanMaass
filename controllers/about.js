const logger = require("../utils/logger.js");
const productStore = require("../models/product-store.js");

const about = {
  async index(request, response) {
    logger.info("about rendering");
    const products = await productStore.getAllProducts();  
    const viewData = {
      title: "Galerie",
      products: products,
      session: request.session
    };
    response.render("about", viewData);
  }
};

module.exports = about;