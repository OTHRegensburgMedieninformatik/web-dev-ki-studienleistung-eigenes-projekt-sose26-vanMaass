const dataStore = require("./data-store.js"); 
const dataStoreClient = dataStore.getDataStore(); 
const logger = require("../utils/logger.js"); 
 
const user = { 
    async addUser(user) { 
        const query = 'INSERT INTO users (email, password, first_name, last_name) VALUES($1, $2, $3, $4)'; 
        const values = [user.email, user.password, user.firstName, user.lastName]; 
        try { 
            await dataStoreClient.query(query, values); 
        } catch (e) { 
            logger.error("Error adding user", e); 
        } 
    }, 
    async authenticateUser(email, password) { 
        const query = 'SELECT * FROM users WHERE email=$1 AND password=$2'; 
        const values = [email, password]; 
        try { 
            let dbRes = await dataStoreClient.query(query, values); 
            if (dbRes.rows[0] !== undefined) { 
                return {id: email, firstName: dbRes.rows[0].first_name, lastName: dbRes.rows[0].last_name, email: dbRes.rows[0].email}; 
            } else { 
                return undefined; 
            } 
        } catch (e) { 
            console.log("Error authenticating user", e); 
        } 
    }, 
    async getUserById(id) { 
        logger.info(`Getting user ${id}`); 
        const query = 'SELECT * FROM users WHERE email=$1'; 
        const values = [id]; 
        try { 
            let dbRes = await dataStoreClient.query(query, values); 
            logger.info(`Getting user ${dbRes.rows[0].email}`); 
            if (dbRes.rows[0] !== undefined) { 
                return {id: dbRes.rows[0].email, firstName: dbRes.rows[0].first_name, lastName: dbRes.rows[0].last_name}; 
            } else { 
                return undefined; 
            } 
        } catch (e) { 
            console.log("Error getting user", e); 
        } 
    },
    async updateUser(userId, updates) {
        const { firstName, lastName, email, password } = updates;
        try {
            let query;
            let values;

            // Wenn Passwort aktualisiert wird
            if (password && password.trim() !== "") {
                query = 'UPDATE users SET first_name=$1, last_name=$2, email=$3, password=$4 WHERE email=$5';
                values = [firstName, lastName, email, password, userId];
            } else {
                // Ohne Passwort aktualisieren
                query = 'UPDATE users SET first_name=$1, last_name=$2, email=$3 WHERE email=$4';
                values = [firstName, lastName, email, userId];
            }

            await dataStoreClient.query(query, values);
            logger.info("User updated successfully", { email: userId });
        } catch (e) {
            logger.error("Error updating user", e);
            throw e;
        }
    }
}; 
module.exports = user; 
