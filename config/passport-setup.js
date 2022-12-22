const LocalStrategy = require("passport-local")
const bcrypt = require("bcryptjs")
const User = require("../models/User")

module.exports = (passport) =>{
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
passport.use(new LocalStrategy((username,password,done)=>{
User.findOne({username:username
    }).then(user=>{
        if(!user)
          done(null, false)

        bcrypt.compare(password,user.password, (err, correct)=>{
            if(err) throw err;
            if(correct)
                done(null, user)
            else
                done(null,false)
        })
    })
}
))

}