const express = require("express");
const router = express.Router();

const home = require("./controllers/home.js");
const about = require("./controllers/about.js");
const accounts = require("./controllers/accounts.js");

router.get("/", home.index);
router.get("/about", about.index);
router.get("/login", accounts.login);              
router.get("/signup", accounts.signup);            
router.post("/register", accounts.register);       
router.post("/authenticate", accounts.authenticate); 
router.get("/logout", accounts.logout);  
router.get("/profile", accounts.profile);
router.post("/profile/update", accounts.updateProfile);
router.get("/detail/:id", home.detail);
router.get("/cart", home.cart);
router.post("/cart/add", home.addToCart);
router.post("/cart/remove/:id", home.removeFromCart);
router.post("/cart/update/:id", home.updateQuantity);
router.post("/cart/checkout", home.checkout);

module.exports = router;
