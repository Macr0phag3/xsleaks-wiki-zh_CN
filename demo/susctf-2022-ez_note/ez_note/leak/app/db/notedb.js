const mongoose = require("mongoose")

let noteSchema = new mongoose.Schema({
    content: {type: String},
    title: {type: String},
    author: {type: String},
    id: {type: String}
})

module.exports = mongoose.model("note", noteSchema)