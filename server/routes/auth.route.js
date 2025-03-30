const express = require("express");
const router = express.Router();

const { signUp, login, logout } = require("../controllers/auth.controller");

const app = express();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;
