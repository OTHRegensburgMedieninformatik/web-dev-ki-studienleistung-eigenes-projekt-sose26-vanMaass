const express = require("express");
const router = express.Router();

const home = require("./controllers/home.js");
const about = require("./controllers/about.js");
const accounts = require("./controllers/accounts.js");
const admin = require("./controllers/admin.js");
const auth = require("./utils/auth.js");

router.get("/", home.index);
router.get("/about", about.index);
router.get("/login", accounts.login);              
router.get("/signup", accounts.signup);            
router.post("/register", accounts.register);       
router.post("/authenticate", accounts.authenticate); 
router.get("/logout", auth.protected, accounts.logout);  
router.get("/profile", auth.protected, accounts.profile);
router.post("/profile/update", auth.protected, accounts.updateProfile);
router.get("/detail/:id", home.detail);
router.get("/cart", home.cart);
router.post("/cart/add", auth.protected, home.addToCart);
router.post("/cart/remove/:id", auth.protected, home.removeFromCart);
router.post("/cart/update/:id", auth.protected, home.updateQuantity);
router.post("/cart/checkout", auth.protected, home.checkout);
router.get("/admin/product", auth.admin, admin.addProduct);
router.post("/admin/product", auth.admin, admin.upload.array("bilder", 10), admin.saveProduct);

module.exports = router;
