const express = require('express')
const router = express.Router()
const UserModel = require("../models/User.model");
const bcrypt = require("bcryptjs");

router.post("/", async (req, res) => {
    const { email, password } = req.body;
  
    const user = await UserModel.findOne({ email });
  
    if (!user) {
      return res.render("login", { msg_error: "Email no registrado" });
    }
  
    const passCoincide = await bcrypt.compare(password, user.password);
  
    if (!passCoincide) {
      return res.render("login", { msg_error: "Contraseña incorrecta" });
    }
  
    req.session.user = user;
    res.render("dashboard", { user: user.username });
  });

  module.exports = router