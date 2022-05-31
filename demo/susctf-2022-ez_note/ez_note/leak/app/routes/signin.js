const user = require("../db/userdb")
// const secret = require("../config").secret
// const jwt = require('jsonwebtoken')

const signin = async (req, res) => {
    for (let v in req.body) {
        req.body[v] = req.body[v].replace(/\s*/g, "");
    }

    let username = req.body.username
    let password = req.body.password
    let result = await user.find({username: username, password: password})
    if (result.length > 0) {
        // let tempuser = result[0]
        // let info = {
        //     username: tempuser.username,
        //  }
        // let token = "Bear " + jwt.sign(info, secret, {expiresIn: 3600 * 24 * 7})
        // res.set("refresh", "1;url=/")
        // res.json({status: 'ok', data: {token: token}})  // 这里发下来token,前端接受存到localStorage
        req.session.user = {username: result[0].username}
        // console.log(req.session)
        res.redirect("/")
    } else {
        // res.set("refresh", "1;url=/signin")
        // res.send("username or password error")
        res.send('username or password error<script>setTimeout(function(){location.href="/signin"},1000) </script>')
    }
}

const sendview = (req, res) => {
    res.sendFile("views/signin.html", {root: __dirname + "/.."})
}

module.exports = {
    signin: signin,
    getview: sendview
}