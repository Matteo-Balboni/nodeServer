const config = require('../../config/config.js');
const nano = require('nano')({
  url: 'http://' + config.couchCreds + '@127.0.0.1:5984',
  requestDefaults: {
    jar: true
  }
});
const userdb = nano.db.use('userdb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async function(req, res, next) {
  const { username, password, role } = req.body;
  try {
    bcrypt.hash(password, 10).then(async function(hash) {
      await userdb.insert({
        username: username,
        password: hash,
        role: role

      }).then(async function(data) {
        res.send({ status: 'ok', message: 'Utente creato correttamente', user: { username: username, role: role }, data: data});
      }, function(err) {
        res.send({status: 'failed', message: 'Utente non creato', error: err.message});
      });
    });
  } catch (err) {
    res.send({status: 'failed', message: 'Utente non creato', error: err.message});
  }
}
exports.login = async function(req, res, next) {
  const { username, password } = req.body;

  //controlla se vengono forniti i dati
  if (!username || !password) {
    return res.render('./pages/errors', {message: "Username o Password non presenti", error: ""});
  }

  const query = {
    selector: {
        username: { "$eq": username }
     }
  }

  try {
    const user = await userdb.find(query);
    if (user.docs.length == 0) {
      res.render('./pages/errors', {message: "Login non effettuato", error: "Utente non trovato"});
    } else {
      bcrypt.compare(password, user.docs[0].password).then(function(result) {
        if (result) {
          const maxAge = 10 * 60 * 60;
          const token = jwt.sign(
            { id: user.docs[0]._id, username: username, role: user.docs[0].role},
            config.jwtSecret,
            {
              expiresIn: maxAge //per l'appunto per ora 10 ore
            }
          );
          res.cookie("jwt", token, {
            httpOnly: true, //guarda meglio cosa fa
            maxAge: maxAge * 1000  //qua invece va in ms
          });
          console.log('\x1b[46m Login da   -> \x1b[0m \x1b[4m' + req.ip + '\x1b[0m');
          res.redirect('/');
        } else {
          res.render('./pages/errors', {message: "Login non effettuato", error: "Credenziali errate"});
        }
      });
    }
  } catch (err) {
    res.render('./pages/errors', {message: "Errore", error: err.message});
  }
}
exports.update = async function(req, res, next){
  const { role, id, password } = req.body; //il ruolo per verificare se admin, e l'id dell'utente da aggiornare
  if (role != 'admin' || !password || !id) {
    return res.send({ status: 'failed', message: "Dati mancanti nella richiesta", error: ""});
  }

  try {
    bcrypt.hash(password, 10).then(async function(hash) {
      await userdb.atomic('usersView', 'update_pass', id, {
        password: hash
      }).then(
        async function(data) {
        res.send({ status: 'ok', message: 'password modificata correttamente' });
      }, function(err) {
        console.log(err);
        res.send({ status: 'failed', message: 'password non modificata', error: err.message});
      });
    });
  } catch (err) {
    res.send( {status: 'failed', message: "Errore", error: err.message });
  }
}
exports.deleteUser = async function(req, res, next) {
  const { id } = req.body;
  const query = {
    selector: {
        _id: { "$eq": id }
     }
  }
  await userdb.find(query).then(async function(user) {
    user = user.docs[0];
    if (user) {
      userdb.destroy(user._id, user._rev).then(async function(data) {
        // res.status(201).json({ message: "Utente eliminato correttamente", user});
        res.send({ status: 'ok', message: 'Utente eliminato correttamente', user: { username: user.username, role: user.role }, data: data});
      }, function(err) {
        // res.status(400).json({ message: "Errore", error: err.message});
        res.send({status: 'failed', message: 'Utente non eliminato', error: err.message});
        console.log(err);
      });
    } else {
      // res.status(400).json({ message: "Utente non trovato" });
      res.send({status: 'failed', message: 'Utente non eliminato', error: err.message});
      console.log(err);
    }
  });
}
