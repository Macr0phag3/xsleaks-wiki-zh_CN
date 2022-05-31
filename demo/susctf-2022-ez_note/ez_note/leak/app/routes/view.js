const note = require("../db/notedb")

const view = async (req, res) => {
    if (!req.session.user) {
        // res.set("refresh", "1;url=/signin")
        // res.send("login first!")
        res.send('login first!<script>setTimeout(function(){location.href="/signin"},1000) </script>')
        return
    }

    let n = await note.findOne({author: req.session.user.username, id: req.params.id})
    if (n) {
        res.render("view", {note: n})
    } else {
        res.send("note doesn't exist")
    }
}

module.exports = view