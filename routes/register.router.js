const express = require('express')
const router = express.Router()
const UserModel = require("../models/User.model");
const bcrypt = require("bcryptjs");

router.post("/", async (req, res) => {
    let { username, email, password } = req.body;
  
    try {
      let user = await UserModel.findOne({ email });
  
      if (user) {
        return res.render("register", { msg_error: "Email ya existe" });
      }
  
      user = await UserModel.findOne({ username });
  
      if (user) {
        return res.render("register", { msg_error: "Usuario ya existe" });
      }
  
      let hashedPassword = await bcrypt.hash(password, 12);
  
      user = await UserModel.create({
        username,
        email,
        password: hashedPassword,
      });
  
      await user.save();
      res.render("login", { msg_error: "" });
    } catch (error) {
      return res.render("register", { msg_error: error.message });
    }
  });
  
  module.exports = router