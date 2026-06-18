const express = require("express");
const logger = require("./utils/logger");
const handlebars = require("express-handlebars");
const session = require("express-session");

const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Erforderlich um Body von POST Requests zu parsen
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Management
app.use(session({
    secret: "This is a secret!",
    cookie: {
        maxAge: 3600000
    },
    resave: false,
    saveUninitialized: false
}));

app.engine('.hbs', handlebars.engine({
    extname: '.hbs',
    helpers: {
        json: function(context) {
            return JSON.stringify(context);
        }
    }
}));
app.set('view engine', '.hbs');
app.set('views', './views');

// Statische Dateien 
app.use(express.static('./public'));
app.use('/images', express.static('./images'));

const routes = require("./routes");
app.use("/", routes);

app.listen(process.env.PORT, () => {
    console.log(`Web App template listening on ${process.env.PORT}`);
});

module.exports = app;
