const jwt = require('jsonwebtoken');
const jwtSecret = '9e65be37f950cbd11d3d506bbf2207ba659e776913cd913e8f534751920aa3f146e0ee';  //in teoria dicono che è sicuro lasciarla qua così, ma in caso si vedrà

exports.adminAuth = async function(req, res, next) {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Non autorizzato" })
      } else {
        if (decodedToken.role !== "admin") {
          return res.status(401).json({ message: "Non autorizzato" })
        } else {
          next()
        }
      }
    })
  } else {
    return res.status(401).json({ message: "Non autorizzato, token non disponibile" });
  }
}
exports.userAuth = (req, res, next) => {
  const token = req.cookies.jwt
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Non autorizzato" })
      } else {
        if (decodedToken.role !== "user" && decodedToken.role !== "admin") {
          return res.status(401).json({ message: "Non autorizzato" })
        } else {
          next()
        }
      }
    })
  } else {
    return res.status(401).json({ message: "Non autorizzato, token non disponibile" })
  }
}
