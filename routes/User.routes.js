const express = require("express");
const router = express.Router();
const UserController = require("./../controllers/User.controller");

router.post("/createUser", UserController.createUser);
router.get("/getUser", UserController.getUsers);
router.delete("/deleteUSer/:id", UserController.deleteUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);

module.exports = router;
