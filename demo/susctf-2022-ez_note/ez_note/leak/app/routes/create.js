const note = require("../db/notedb")
const crypto = require("crypto")

const create = async (req, res) => {
    if (!req.session.user) {
        // res.set("refresh", "1;url=/signin")
        // res.send("login first!")
        res.send('login first!<script>setTimeout(function(){location.href="/signin"},1000) </script>')
        return
    }

    await new note({
        content: req.body.content,
        title: req.body.title,
        author: req.session.user.username,
        id: crypto.randomUUID()
    }).save()
    // res.set("refresh", "1;url=/")
    // res.send("创建成功")
    res.send('create success<script>setTimeout(function(){location.href="/"},1000) </script>')
}

const sendview = (req, res) => {
    if (!req.session.user) {
        // res.set("refresh", "1;url=/signin")
        // res.send("login first!")
        res.send('login first!<script>setTimeout(function(){location.href="/signin"},1000) </script>')
        return;
    }
    res.sendFile("/views/create.html", {root: __dirname + "/.."})
}

module.exports = {
    postnote: create,
    geteditor: sendview
}