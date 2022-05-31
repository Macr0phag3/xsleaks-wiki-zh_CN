const user = require("../db/userdb")

const signup = async (req, res) => {
    for (let v in req.body) {
        req.body[v] = req.body[v].replace(/\s*/g, "");
    }

    let username = req.body.username
    let password = req.body.password

    let tempuser = await user.find({username: username})
    if (tempuser.length > 0) {
        // res.set("refresh", "3;url=/signup")
        // res.send("用户已存在！")
        res.send('user already exist!<script>setTimeout(function(){location.href="/signin"},1000) </script>')
    } else {
        let temp = new user({
            username: username,
            password: password
        })
        temp.save().then((data) => {
            // res.set("refresh", "1;url=/signin")
            // res.send("创建用户成功")
            res.send('register success<script>setTimeout(function(){location.href="/signin"},1000) </script>')
        }).catch((err) => {
            console.log(err)
        })
    }
}

const sendview = (req, res) => {
    res.sendFile("/views/signup.html", {root: __dirname + "/.."})
}


module.exports = {
    signup: signup,
    getview: sendview
}