const express = require("express");
const router = express.Router();
const { register, login, update, deleteUser } = require("./auth");
const { adminAuth, userAuth } = require("../middleware/auth");
router.route("/register").post(adminAuth, register);
router.route("/login").post(login);
router.route("/update").post(adminAuth, update);
router.route("/deleteUser").delete(adminAuth, deleteUser);
module.exports = router;
