const express = require('express');
const router = express.Router();
const userController = require("../contollers/user");

router.post("/signup", userController.createUser);


router.post("/login", userController.userLogin);

module.exports = router;
