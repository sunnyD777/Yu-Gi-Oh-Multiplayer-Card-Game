const mongoose = require("mongoose") 
const Schema = mongoose.Schema
const CardSchema = require("./Card").schema

const UserSchema = new Schema({
    username: String,
    email: String,
    password:String,
    gameRoom: String,
    deck: [],
})
const User = mongoose.model("user", UserSchema)

module.exports = User