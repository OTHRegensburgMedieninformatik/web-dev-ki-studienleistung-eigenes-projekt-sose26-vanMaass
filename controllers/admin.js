const logger = require("../utils/logger.js");
const productStore = require("../models/product-store.js");
const multer = require("multer");
const path = require("path");

// Multer: Bilder in /images speichern
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "..", "images"));
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({     //Multer mithilfe von KI
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mime = allowedTypes.test(file.mimetype);
        if (ext && mime) {
            cb(null, true);
        } else {
            cb(new Error("Nur Bilddateien erlaubt (jpg, png, gif, webp)"));
        }
    }
});

const admin = {
    upload: upload,

    addProduct(request, response) {
        if (!request.session.user || !request.session.user.isAdmin) {
            return response.redirect("/");
        }

        const viewData = {
            title: "Produkt hinzufügen",
            session: request.session
        };
        response.render("admin", viewData);
    },

    async saveProduct(request, response) {
        if (!request.session.user || !request.session.user.isAdmin) {
            return response.redirect("/");
        }

        try {
            const { titel, kurzbeschreibung, beschreibung, preis, kategorie, bewegung, status, farben } = request.body;

            // Farben als Array parsen (kommagetrennte Hex-Codes) mithilfe KI
            let farbenArray = null;
            if (farben && farben.trim() !== "") {
                farbenArray = farben.split(",").map(f => f.trim()).filter(f => f !== "");
            }

            const productId = await productStore.addProduct({
                titel,
                kurzbeschreibung,
                beschreibung,
                preis,
                kategorie,
                bewegung,
                farben: farbenArray,
                status: status || "Normal"
            });

            // Hochgeladene Bilder verknüpfen
            if (request.files && request.files.length > 0) {
                for (let i = 0; i < request.files.length; i++) {
                    const file = request.files[i];
                    await productStore.addImage(productId, file.filename, i + 1, i === 0);
                }
            }

            logger.info("Admin added new product", { productId, titel });
            response.redirect("/about");
        } catch (error) {
            logger.error("Error saving product", error);
            response.status(500).send("Fehler beim Speichern des Produkts");
        }
    }
};

module.exports = admin;
