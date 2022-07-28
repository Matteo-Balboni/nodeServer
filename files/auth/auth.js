const nano = require('nano')({
  url: 'http://Admin:Admin@127.0.0.1:5984',
  requestDefaults: {
    jar: true
  }
});
const userdb = nano.db.use('userdb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = '9e65be37f950cbd11d3d506bbf2207ba659e776913cd913e8f534751920aa3f146e0ee';  //in teoria dicono che è sicuro lasciarla qua così, ma in caso si vedrà

exports.register = async function(req, res, next) {
  const { username, password, role } = req.body;
  try {
    bcrypt.hash(password, 10).then(async function(hash) {
      await userdb.insert({
        username: username,
        password: hash,
        role: role

      }).then(async function(data) {
        const maxAge = 10 * 60 * 60; //età massima messa come 10 ore (in secondi)
        const token = jwt.sign(
          { id: data.id, username, role},
          jwtSecret,
          {
            expiresIn: maxAge //per l'appunto per ora 3 ore
          }
        );
        res.cookie("jwt", token, {
          httpOnly: true, //guarda meglio cosa fa
          maxAge: maxAge * 1000  //qua invece va in ms
        });
        res.status(201).json({
          message: "Utente creato correttamente",
          data: data
        })
      }, function(err) {
        res.status(400).json({ message: "Utente non creato", error: err.message});
      });
    });
  } catch (err) {
    res.status(401).json({
      message: "Utente non creato",
      error: error.mesage,
    })
  }
}
exports.login = async function(req, res, next) {
  const { username, password } = req.body;

  //controlla se vengono forniti i dati
  if (!username || !password) {
    return res.render('./pages/errors', {message: "Username o Password non presenti", error: ""})// res.status(400).json({
    //   message: "Username o Password non presenti",
    // });
  }

  const query = {
    selector: {
        username: { "$eq": username }
     }
  }

  try {
    const user = await userdb.find(query);
    if (user.docs.length == 0) {
      res.render('./pages/errors', {message: "Login non effettuato", error: "Utente non trovato"})
      // res.status(401).json({
      //   message: "Login non effettuato",
      //   error: "Utente non trovato",
      // })
    } else {
      bcrypt.compare(password, user.docs[0].password).then(function(result) {
        if (result) {
          const maxAge = 10 * 60 * 60;
          const token = jwt.sign(
            { id: user.docs[0]._id, username: username, role: user.docs[0].role},
            jwtSecret,
            {
              expiresIn: maxAge //per l'appunto per ora 3 ore
            }
          );
          res.cookie("jwt", token, {
            httpOnly: true, //guarda meglio cosa fa
            maxAge: maxAge * 1000  //qua invece va in ms
          });
          res.redirect('/');
          //res.status(200).json({ message: "Login effettuato", user});
        } else {
          res.render('./pages/errors', {message: "Login non effettuato", error: "Credenziali errate"})
          //res.status(400).json({ message: "Login non effettuato " });
        }
      });
    }
  } catch (err) {
    res.render('./pages/errors', {message: "Errore", error: err.message})
    // res.status(400).json({
    //   message: "Errore",
    //   error: err.message,
    // });
  }
}
exports.update = async function(req, res, next){
  const { role, id } = req.body; //il ruolo per verificare se admin, e l'id dell'utente da aggiornare
  if (role) {
    if (role == 'admin') {
      const query = {
        selector: {
            _id: { "$eq": id }
         }
      }
      await userdb.find(query).then(async function(user) {
        user = user.docs[0];
        if (user) {
          if(user.role !== 'admin'){
            userdb.insert({
              _id: user._id,
              _rev: user._rev,
              username: user.username,
              password: user.password,
              role: role
            }).then(async function(data) {
              res.status(201).json({ message: "Update avvenuto con successo", data });
            }, function(err) {
              res.status(400).json({ message: "Errore", error: err.message})
            });
          } else {
            res.status(400).json({ message: "L'utente è già amministratore" });
          }
        } else {
          res.status(400).json({ message: "Utente specificato inesistente"})
        }
      });
    } else {
      res.status(400).json({ message: "Non amministratore"});
    }
  } else {
    res.status(400).json({ message: "Role o Id non presenti" });
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
        res.status(201).json({ message: "Utente eliminato correttamente", user});
      }, function(err) {
        res.status(400).json({ message: "Errore", error: err.message});
      });
    } else {
      res.status(400).json({ message: "Utente non trovato" });
    }
  });
}
