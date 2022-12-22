const express = require("express")
const Router = express.Router();
const Cards = require("../models/Card")
const User = require("../models/User")

Router.get("/lobby", (req,res)=>{
    if(req.isUnauthenticated())
        res.redirect("/")
    else
       res.render("lobby",{username:req.user.username})
})
Router.get("/logout", (req,res)=>{
    req.logout();
    res.redirect("/")
})
Router.get("/room", (req,res)=>{
    if(req.isUnauthenticated()){
        res.redirect("/")
        return;
    }    res.render("game",{username:req.user.username, gameRoom:req.user.gameRoom, deck: req.user.deck})
})

Router.get("/deck",(req,res)=>{
    if(req.isUnauthenticated()){
        res.redirect("/")
        return;
    }
    if(req.session.cards == undefined)
       req.session.cards = null;
    var cards = req.session.cards;
    req.session.cards = null;
    res.render("deck",{resultCards: cards, userDeck: req.user.deck})
    
})

Router.post("/deckUser",(req,res)=>{
   User.findOneAndUpdate({username: req.user.username},{deck:req.body.deck}).then(()=>{
       console.log("Updated!")
   })
})
module.exports = Router;