const note = require("../db/notedb")

const search = async (req, res) => {
    if (!req.session.user) {
        // res.set("refresh", "1;url=/signin")
        // res.send("login first!")
        res.send('login first!<script>setTimeout(function(){location.href="/signin"},1000) </script>')
        return
    }

    let query = req.query.q
    let result = await note.find({author: req.session.user.username})   // 只能查找自己的note
    let data = []
    for (let n of result) {
        if (n.content.indexOf(query) !== -1) {
            data.push(n)
        }
    }
    if (data.length === 1)  // 仅有一条结果
    {
        // 跳转且延迟一秒，使history能被增加
        // res.set("refresh", "1;url=/view/" + data[0].title)
        // res.send("find only match, redirecting")
        let url = '/view/' + data[0].id
        res.send('find only match, redirecting<script>setTimeout(function(){location.href="' + url + '"},1000) </script>')
    } else {
        res.render("search", {notes: data})
    }
}

module.exports = search