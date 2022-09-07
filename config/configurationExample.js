//this is an example config file. RENAME THIS 'config.js' OR MAKE A NEW FILE CALLED 'config.js' TO READ CONFIGURATION

const username = 'Admin'; //string, sets the username for accessing CouchDB
const password = 'Admin'; //string, sets the password for accessing CouchDB
const credentials = username + ':' + password; //packs the credentials ready for use, you should not change this
const serverPort = 80; //number, sets the server port
const jwtSecret = '6be195e80d8d7a76bd7b0abf5fe1b58f419f03b5c08b353c2525ef4abb563f9327f9d5'; //string, your jwt(JsonWebToken) secret string, you should probably change this and keep it secret
//to create a jwt token like this you have to go into the node console and type:   require("crypto").randomBytes(35).toString("hex")
module.exports = { couchCreds: credentials, serverPort: serverPort, jwtSecret: jwtSecret}; //exports the configuration for use, you should also not change this
