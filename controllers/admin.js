const logger = require("../utils/logger.js");
const productStore = require("../models/product-store.js");
const multer = require("multer");
const path = require("path");

// Multer: Bilder in /images speichern
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //Speichern in Ordner
        cb(null, path.join(__dirname, "..", "images"));
    },
    filename: function (req, file, cb) {
        //unique filename erstellen
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        //Prüfung
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
    upload: upload, //kann in routes.js verwendet werden ruft saveProduct auf

    addProduct(request, response) {
        //überprüfung + rendern
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
            //Formularfelder auslesen
            const { titel, kurzbeschreibung, beschreibung, preis, kategorie, bewegung, status, farben } = request.body;

            // Farben als Array parsen (kommagetrennte Hex-Codes)
            let farbenArray = null;
            if (farben && farben.trim() !== "") {
                //kommatrennung, Leerzeichen entfernung, leere String entfernung
                farbenArray = farben.split(",").map(f => f.trim()).filter(f => f !== "");
            }
            //Aufruf addProduct in productStore.js für db Eintrag
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

            // Hochgeladene Bilder verknüpfen und hochladen in DB
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
