const User = require("../models/User")

module.exports = function(socket){
    var gameRoom;
    var user;
socket.on("game_room", function(data){
    gameRoom = data.gameRoom
    user = data.username
    console.log(user+": " + gameRoom)
    socket.join(gameRoom)
})    
socket.on("disconnect", function(){
    console.log("Connection disconnected")
    User.findOneAndUpdate({username: user}, {$set: {gameRoom: null}}, {upsert: false}, function(err,doc) {
        if (err) { throw err; }
        else { console.log("Updated GameRoom to Null"); }
        });
    })
socket.on("username",function(data){
    setTimeout(function(){
        socket.to(gameRoom).emit("opp_username",data)
    }, 1000)
})
// socket.on("second_username",function(data){
//     socket.to(gameRoom).emit("second_opp_username",data)
// })
socket.on("rps_choice",function(data){
    socket.to(gameRoom).emit("opp_rps_choice",data)
})
socket.on("rps_choice2",function(data){
    socket.to(gameRoom).emit("opp_rps_choice2",data)
})
socket.on("turn_choice",function(data){
    socket.to(gameRoom).emit("opp_turn_choice",data);
})
socket.on("deck_size",function(data){
    console.log("deck size:"+ data + gameRoom)
    socket.to(gameRoom).emit("opp_deck_size",data);
    })
socket.on("ed_size",function(data){
    socket.to(gameRoom).emit("opp_ed_size",data);
    })
socket.on("second_deck_size",function(data){
    socket.to(gameRoom).emit("opp_deck_size_second",data);
    })
socket.on("second_ed_size",function(data){
        socket.to(gameRoom).emit("opp_ed_size_second",data);
        })
socket.on("shuffle",function(){
        socket.to(gameRoom).emit("opp_shuffle");
    })
socket.on("to_hand",function(data){
        socket.to(gameRoom).emit("opp_to_hand",data);
    })
socket.on("remove_from_field", function (data){
        socket.to(gameRoom).emit("opp_remove_card", data);
    });
socket.on("card_to_field", function (data){
        socket.to(gameRoom).emit("opp_field_card", data);
    });
socket.on("switch_atk", function (data){
        socket.to(gameRoom).emit("opp_switch_atk", data);
        });
socket.on("switch_def", function (data){
    socket.to(gameRoom).emit("opp_switch_def", data);
    });
    
socket.on("set", function (data){
socket.to(gameRoom).emit("opp_Set", data);
});

socket.on("flip_monster", function (data){
socket.to(gameRoom).emit("opp_flip_monster", data);
});

socket.on("flip_summon", function (data){
socket.to(gameRoom).emit("opp_flip_summon", data);
});
socket.on("flip_st_up", function (data){
    socket.to(gameRoom).emit("opp_flip_st_up", data);
    });
socket.on("flip_st_down", function (data){
    socket.to(gameRoom).emit("opp_flip_st_down", data);
    });
            
socket.on("set_monster", function (data){
    socket.to(gameRoom).emit("opp_set_monster", data);
    });
socket.on("attack_directly", function (data){
socket.to(gameRoom).emit("opp_attack_directly", data);
});

socket.on("attack_monster", function (data){
socket.to(gameRoom).emit("opp_attack_monster", data);
});
socket.on("end_turn",function(){
    socket.to(gameRoom).emit("opp_end_turn");
    })
    socket.on("select_phase",function(data){
        socket.to(gameRoom).emit("opp_select_phase",data);
        })
socket.on("select_opp_card",function(data){
socket.to(gameRoom).emit("opp_select_card",data);
})
socket.on("coin_toss",function(data){
    socket.to(gameRoom).emit("opp_coin_toss",data);
    })
    
    socket.on("dice_roll",function(data){
    socket.to(gameRoom).emit("opp_dice_roll",data);
    })
    socket.on("change_lp",function(data){
        socket.to(gameRoom).emit("opp_change_lp",data);
        })
        socket.on("send_msg", function (data){
            socket.to(gameRoom).emit("opp_msg",  data);
        });
        
    }