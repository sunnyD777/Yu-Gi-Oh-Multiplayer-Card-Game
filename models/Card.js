const mongoose = require("mongoose")
const Schema = mongoose.Schema

const CardSchema = new Schema({
    name: String,
    type : String,
    subtype : String,
    monsterType : String,
    monsterAttribute : String,
    monsterLevel : Number,
    monsterATK : Number,
    monsterDEF : Number,
    description : String,
    imageURL : String,
})
const Card = mongoose.model("cards",CardSchema)
module.exports = Card;
