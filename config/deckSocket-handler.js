const Cards = require("../models/Card")

module.exports = function(socket){
    console.log("connected!")
    socket.on("searchCard",function(data){
        console.log(data)
        Cards.find(data)
        .then(cards=>{
            socket.emit("resultCards",cards)
        })
    })
}