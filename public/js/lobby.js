$(function() {
  console.log(window.location)
  var player = io.connect(window.location.href);
  var username;

  username = $(".user").text();
  player.emit("new_player", username);

  $("#deck").on("click",()=>{window.location.pathname = "/game/deck"})
  $("#chat").submit(sendMessage);
  $(document).on("mouseover", ".player", showChallengeRequest);
  $(document).on("mouseout", ".challenge", removeChallengeRequest);
  $(document).on("click", ".challenge", sendChallengeRequest);
  $(document).on("mouseover", ".chal_player", showAcceptChallenge);
  $(document).on("mouseout", ".accept", removeAcceptChallenge);
  $(document).on("click", ".chal_player", function(ev) {
    $(this).attr("class", "replace");
    opp_username = $(this).text();
    $(this).html(
        "Accept"
      );
  });
  $(document).on("click", ".accept", function() {
    var data = {
      opp_index: $(this).attr("index"),
      index: $("#lobby .user").index(),
      gameId: makeid()
    };
    player.emit("accept", data);
  });
  player.on("curr_players", function(players) {
    if (players.length == 0) return;
    for (var i = players.length - 1; i >= 0; i--)
      $("#lobby").prepend(
        '<div class = "player" name=' +
          players[i].username +
          ">" +
          players[i].username +
          "</div>"
      );
  });
  player.on("add_new_player", function(username) {
    $("#lobby").append(
      '<div class = "player" name=' + username + ">" + username + "</div>"
    );
  });
  player.on("player_quit", function(index) {
    $("#lobby div:eq(" + index + ")").remove();
  });
  player.on("opp_challenge", function(opp) {
    $("#challenges").append(
      '<div index="' +
        opp.index +  '" class ="chal_player" name=' + opp.username +' >' +
        opp.username +
        "</div>"
    );
  });
  player.on("change_room", function() {
    window.location.pathname = "/game/room";
  });
  player.on("opp_accept", function() {
    window.location.pathname = "/game/room";
  });
 
  player.on("opp_msg",opponentMessage)
  
  function showChallengeRequest() {
    $(this).attr("class", "challenge");
    $(this).html("Challenge");
  }
  function showAcceptChallenge() {
    $(this).attr("class", "accept");
    $(this).html("Accept");
  }
  function removeChallengeRequest() {
    $(this).attr("class", "player");
    $(this).html($(this).attr("name"));
  }
  function removeAcceptChallenge() {
    $(this).attr("class", "chal_player");
    $(this).html($(this).attr("name"));
  }
  function sendChallengeRequest() {
    var data = {
      opp_index: $(this).index(),
      index: $(".user").index()
    };
    player.emit("challenge", data);
  }
  function makeid() {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
  function sendMessage(event) {
    event.preventDefault();
    data ={
      name: username,
      msg: $("#msg_input").val()
    }
    player.emit("send_msg", data);
    $("#msg_output").append(
      '<p style="color:red;font-weight: bold">'+username+': ' +
        $("#msg_input").val() +
        "</p>"
    );
    $("#msg_output").scrollTop($("#msg_output")[0].scrollHeight);
    $("#msg_input").val("");
  }
  function opponentMessage(data) {
    $("#msg_output").append(
      '<p style="font-weight: bold">'+data.name+': ' + data.msg + "</p>"
    );
    $("#msg_output").scrollTop($("#msg_output")[0].scrollHeight);
  }
});
