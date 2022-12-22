const express = require("express")
const bcrypt = require("bcryptjs")
const passport = require("passport")
const Router = express.Router();
const User = require("../models/User")

Router.get("/",(req,res)=>{ 
    if(req.isAuthenticated()){
       res.redirect("/game/lobby")
       return;
    }
    var registerSuccess= req.session.registerSuccess
    if (registerSuccess)
        res.render("login", {messages:[registerSuccess],type:"success"})
    else
         res.render("login")
})

Router.post("/", passport.authenticate("local",{
       successRedirect: "/game/lobby",
       failureRedirect:"/"
   }))
Router.get("/register",(req,res)=> res.render("register"))

Router.post("/register",(req,res)=>{
    const {username, email, password, password2} = req.body;
    User.findOne({username:username}).then(user=>{
        var errors = [];
        if(user)
            errors.push("User with that username already exists")
     User.findOne({email:email}).then(user=>{
                    if(user)
                        errors.push("User with that email already exists")
                    if(password != password2)
                        errors.push("Passwords do not match")
                    if(errors.length!=0)
                        res.render("register",{messages:errors, type:"danger"})
                    else{
                        bcrypt.hash(password, 10, function(err, hash) {
                            new User({
                                username: username,
                                email: email,
                                password: hash,
                                gameRoom: null,
                                deck: null
                            }).save((err)=>{
                                console.log(username +" saved to database!")
                                req.session.registerSuccess = "Successfully registered as "+ username 
                                res.redirect("/")
                            })
                        });
                    }
                })
        })   
})
module.exports = Router;