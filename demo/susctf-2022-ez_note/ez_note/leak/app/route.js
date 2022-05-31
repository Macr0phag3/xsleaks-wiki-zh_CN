const express = require("express")
const router = express.Router()
const signin = require("./routes/signin")
const signup = require("./routes/signup")
const logout = require("./routes/logout")
const home = require("./routes/home")
const view = require("./routes/view")
const create = require("./routes/create")
const search = require("./routes/search")

router.get("/", home)
router.get("/signin", signin.getview)
router.get("/signup", signup.getview)
router.get("/create", create.geteditor)
router.get("/view/:id", view)
router.get("/logout", logout)
router.get("/search", search)

router.post("/create", create.postnote)
router.post("/signin", signin.signin)
router.post("/signup", signup.signup)

module.exports = router
