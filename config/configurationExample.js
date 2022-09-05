//this is an example config file. RENAME THIS 'config.js' OR MAKE A NEW FILE CALLED 'config.js' TO READ CONFIGURATION

const username = 'Admin'; //string, sets the username for accessing CouchDB
const password = 'Admin'; //string, sets the password for accessing CouchDB
const credentials = username + ':' + password; //packs the credentials ready for use, you should not change this
const serverPort = 80; //number, sets the server port
module.exports = { couchCreds: credentials, serverPort: serverPort }; //exports the configuration for use, you should also not change this
