const config = require('../../config/config.js');
const jwt = require('jsonwebtoken');
const jwtSecret = config.jwtSecret;  //in teoria dicono che è sicuro lasciarla qua così, ma in caso si vedrà

exports.adminAuth = async function(req, res, next) {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        //return res.status(401).json({ message: "Non autorizzato" })
        return res.redirect('/not_authorized');
      } else {
        if (decodedToken.role !== "admin") {
          //return res.status(401).json({ message: "Non autorizzato" })
          return res.redirect('/not_authorized');
        } else {
          next()
        }
      }
    })
  } else {
    //return res.status(401).json({ message: "Non autorizzato, token non disponibile" });
    return res.redirect('/not_authorized');
  }
}
exports.userAuth = async function(req, res, next) {
  const token = req.cookies.jwt
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        //return res.status(401).json({ message: "Non autorizzato" })
        return res.redirect('/not_authorized');
      } else {
        if (decodedToken.role !== "user" && decodedToken.role !== "admin") {
          //return res.status(401).json({ message: "Non autorizzato" })
          return res.redirect('/not_authorized');
        } else {
          next()
        }
      }
    })
  } else {
    //return res.status(401).json({ message: "Non autorizzato, token non disponibile" })
    return res.redirect('/not_authorized');
  }
}
