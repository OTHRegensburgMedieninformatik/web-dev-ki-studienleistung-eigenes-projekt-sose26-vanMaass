const userStore = require("../models/user.js");
const orderStore = require("../models/order-store.js");
const logger = require("../utils/logger.js");

const accounts = {
    login(request, response) {
        const viewData = {
            title: "Login to the Service",
            referer: request.get('referer') || request.query.referer || "/",
            session: request.session
        };
        response.render("login", viewData);
    },

    logout(request, response) {
        request.session.destroy();
        response.redirect("/");
    },

    signup(request, response) {
        const viewData = {
            title: "Signup for the Service",
            session: request.session
        };
        response.render("signup", viewData);
    },

    async register(request, response) {
        const newUser = request.body;
        await userStore.addUser(newUser);
        logger.info("Registering user", newUser);
        response.redirect("/");
    },

    async authenticate(request, response) {
        let authenticatedUser = await userStore.authenticateUser(request.body.email, request.body.password);
        if (authenticatedUser) {
            request.session.user = {
                id: authenticatedUser.id,
                firstName: authenticatedUser.firstName,
                lastName: authenticatedUser.lastName,
                email: authenticatedUser.email,
                isAdmin: authenticatedUser.isAdmin,
            };
            logger.info("User successfully authenticated and added to session", authenticatedUser);
            const referer = request.body.referer;
            //referer ist die Seite, von der der User kommt, wenn er nicht von /login oder /authenticate kommt, dann redirect auf diese Seite, sonst redirect auf /
            const target = (referer && !referer.includes("/login") && !referer.includes("/authenticate")) ? referer : "/";

            response.redirect(target);
        } else {
            //Fehlermeldung mit npm flash-message
            await response.flash("error", "E-Mail oder Passwort falsch.");
            response.redirect("/login");
        }
    },

    async getCurrentUser(request) {
        const userId = request.session.user;
        return await userStore.getUserById(userId);
    },
    async profile(request, response) {
        if (!request.session.user) {
            return response.redirect("/login");
        }

        try {
            const orders = await orderStore.getOrdersByUser(request.session.user.id);
            const viewData = {
                title: "Mein Profil",
                session: request.session,
                orders: orders
            };
            response.render("profile", viewData);
        } catch (error) {
            logger.error("Error loading profile", error);
            const viewData = {
                title: "Mein Profil",
                session: request.session,
                orders: []
            };
            response.render("profile", viewData);
        }
    },

    async updateProfile(request, response) {
        if (!request.session.user) {
            return response.redirect("/login");
        }

        const { firstName, lastName, email, password } = request.body;
        const userId = request.session.user.id; // Email als ID

        try {
            // Profil in DB aktualisieren
            await userStore.updateUser(userId, { firstName, lastName, email, password });

            // Session aktualisieren mit neuen Daten
            request.session.user.firstName = firstName;
            request.session.user.lastName = lastName;
            request.session.user.email = email;

            logger.info("User profile updated", { email: userId });
            response.redirect("/");
        } catch (error) {
            logger.error("Error updating profile", error);
            response.status(500).send("Fehler beim Aktualisieren des Profils");
        }
    }
};

module.exports = accounts;
