const note = require("../db/notedb")

const home = async (req, res) =>{
    if(!req.session.user) {
        // res.set("refresh", "1;url=/signin")
        // res.send("login first!")
        res.send('login first!<script>setTimeout(function(){location.href="/signin"},1000) </script>')
        return
    }

    let notes = await note.find({author: req.session.user.username})     // 就给看自己的note
    // let data = []
    // for(let n of notes)
    // {
    //     if(n.author === username || n.author === "admin")
    //     {
    //         data.push(n)
    //     }
    // }
    res.render("index", {notes: notes, username: req.session.user.username})

}



module.exports = home