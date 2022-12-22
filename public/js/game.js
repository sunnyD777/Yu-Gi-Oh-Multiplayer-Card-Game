$(function() {
  var extraDeck = Deck.pop();
  var lp = 8000;
  var card;
  var opp_card;
  var zone_order = [2, 3, 1, 4, 0];
  var phase = "null";
  var animation = false;
  var rps = null
  var choose_turn = false;
  var username = $("#username").text()
  var opp_username;
  var player = io.connect(window.location.href);

  var to_field = new Audio("/Sounds/set_card.mp3");
  var flip = new Audio("/Sounds/flip.mp3");
  var dice = new Audio("/Sounds/dice.mp4");
  var coin = new Audio("/Sounds/coin_flip.mp4");
  var lp_change = new Audio("/Sounds/lp_drop.mp3");
  var draw = new Audio("/Sounds/draw.wav");   
  
  $("#back").on("mouseover", function(){
    $(this).attr("src","/Images/back_hover.png")
})
$("#back").on("mouseout", function(){
    $(this).attr("src","/Images/back.png")
})
$("#back").on("click", function(){
    window.location.pathname = "/game/lobby"
})
  $(".meter > span").each(function () {
    $(this)
      .data("origWidth", $(this).width())
      .width(0)
      .animate(
        {
          width: $(this).data("origWidth")
        },
        1200
      );
  })

  player.emit("game_room", {
    username: username,
    gameRoom: gameRoom
  });
  player.emit("username",username)
  $("#userChoices img").on("click",function(){
    rps = $(this)
    player.emit("rps_choice",$(this).index())
  })

  player.on("opp_rps_choice",function(data){
    if(rps){
      player.emit("rps_choice2", rps.index())
       rpsAnimation(data)
    }
  })

  player.on("opp_rps_choice2",function(data){
       rpsAnimation(data)
  })
  $(".turn").on("mouseover",function(){
    $("#viewer").attr("src", $(this).attr("src"));
    $("#name").html($(this).attr("name"));
    $("#dscr").html($(this).attr("dscr"));
    if(choose_turn){
      $(this).css("cursor","pointer")
      $(this).css("opacity","1")
    }
  })
  $(".turn").on("mouseout",function(){
    if(choose_turn){
      $(this).css("cursor","")
      $(this).css("opacity","0.8")
    }
  })
  $(".turn").on("click",function(){
  if(choose_turn){
    if($(this).attr("name")=="First"){
      $("#mp1").click()
      $("#msg_output").append(
        '<p style="font-weight: bold; font-style: italic;">You are going first!</p>'
        );
    }
    else{
      $("#msg_output").append(
        '<p style="font-weight: bold; font-style: italic;">You are going second!</p>'
        );
    }
    player.emit("turn_choice",$(this).attr("name"))
      initDeck();
      initExtraDeck();
      initHand();
    
      $("#viewer").attr("src", "/Images/blank_space.png");
      $("#name").html("");
      $("#dscr").html("");
      $("#preGame").fadeOut(function(){
          $(this).remove()
          $("#grid").fadeIn()
         })
      }
  })
  player.on("opp_turn_choice",function(choice){
       if(choice=="Second"){
          $("#mp1").click()
          $("#msg_output").append(
            '<p style="font-weight: bold; font-style: italic;">You are going first!</p>'
            );
       }
       else{
        $("#msg_output").append(
          '<p style="font-weight: bold; font-style: italic;">You are going second!</p>'
          );
       }
        $('.turn[name="'+choice+'"]').css("border","1vw solid red")
        setTimeout(function(){
          initDeck();
          initExtraDeck();
          initHand();
          $("#viewer").attr("src", "/Images/blank_space.png");
          $("#name").html("");
          $("#dscr").html("");
          $("#preGame").fadeOut(function(){
              $(this).remove()
              $("#grid").fadeIn()
             })
        },1000)
  })
  player.on("opp_username",function(data){
    opp_username = data
    $("#opp_username").html(opp_username)
    $("#opp_username").css("visibility","visible")
    player.emit("second_username",username)
  })
  player.on("second_opp_username",function(data){
    opp_username = data
    $("#opp_username").html(opp_username)
    $("#opp_username").css("visibility","visible")
  })
  $(document).on("mouseover", ".card", showCardInfoAndOptionsOnHover);
  $(document).on("mouseover", ".opp_card", showOpponentCard);
  $(document).on("click", ".opp_card", selectOpponentCard);
  $(document).on("mouseout", ".card", function() {
    $(".options_menu").css("display", "none");
  });
  $(".options_menu").on("mouseover", function() {
    $(this).css("display", "block");
  });
  $(".options_menu").on("mouseout", function() {
    $(this).css("display", "none");
  });
  $(".viewer").on("scroll", function() {
    $(".options_menu").css("display", "none");
  });
  $("#deck").on("mouseover", function() {
    $("#deck_options").css("display", "block");
    var topOffset = $("#deck_options").height();
    var leftOffset = parseInt($("#deck_options").css("padding-inline-start"));
    $("#deck_options").offset({
      top: $(this).offset().top - topOffset,
      left: $(this).offset().left - leftOffset
    });
  });
  $("#deck").on("mouseout", function() {
    $("#deck_options").css("display", "none");
  });
  $("#gy").on("click", function() {
    $("#gy_view").css("display", "block");
  });
  $("#opp_gy").on("click", function() {
    $("#opp_gy_view").css("display", "block");
  });
  $("#rfp").on("click", function() {
    $("#rfp_view").css("display", "block");
  });
  $("#opp_rfp").on("click", function() {
    $("#opp_rfp_view").css("display", "block");
  });
  $("#ed").on("click", function() {
    $("#ed_view").css("display", "block");
  });
  $(".exit").on("click", function() {
    $(".viewer").css("display", "none");
  });

  $("#phases li").on("click", selectPhase);
  $("#end").on("click", endTurn);

  $("#chat").submit(sendMessage);
  $("#coin").on("click", coinToss);
  $("#dice").on("click", diceRoll);

  $("#add_lp").on("click", addLP);
  $("#sub_lp").on("click", subLP);

  $("#d_op1").on("click", viewDeck);
  $("#d_op2").on("click", Mill);
  $("#d_op3").on("click", banishTop);
  $("#d_op4").on("click", shuffleDeck);
  $("#d_op5").on("click", Draw);

  $("#dc_op1").on("click", summonAtkMode);
  $("#dc_op2").on("click", summonDefMode);
  $("#dc_op3").on("click", returnToHand);
  $("#dc_op4").on("click", sendToGrave);
  $("#dc_op5").on("click", sendToRemovedFromPlay);

  $("#dc_st_op1").on("click", Activate);
  $("#dc_st_op2").on("click", sendToGrave);
  $("#dc_st_op3").on("click", sendToRemovedFromPlay);
  $("#dc_st_op4").on("click", returnToHand);

  $("#ed_op1").on("click", summonAtkMode);
  $("#ed_op2").on("click", summonDefMode);

  $("#h_op1").on("click", summonAtkMode);
  $("#h_op2").on("click", summonDefMode);
  $("#h_op3").on("click", setMonsterHand);
  $("#h_op4").on("click", sendToGrave);
  $("#h_op5").on("click", sendToRemovedFromPlay);
  $("#h_op6").on("click", returnToDeck);

  $("#h_st_op1").on("click", Activate);
  $("#h_st_op2").on("click", setSpellTrap);
  $("#h_st_op3").on("click", sendToGrave);
  $("#h_st_op4").on("click", sendToRemovedFromPlay);
  $("#h_st_op5").on("click", returnToDeck);

  $("#f_op1").on("click", switchAtkMode);
  $("#f_op2").on("click", switchDefMode);
  $("#f_op3").on("click", setMonsterField);
  $("#f_op4").on("click", flipMonster);
  $("#f_op5").on("click", flipSummon);
  $("#f_op6").on("click", sendToGrave);
  $("#f_op7").on("click", sendToRemovedFromPlay);
  $("#f_op8").on("click", returnToHand);
  $("#f_op9").on("click", returnToDeck);
  $("#f_op11").on("click", attackDirectly);
  $("#f_op12").on("click", Attack);

  $("#f_st_op1").on("click", flipSpellTrapUp);
  $("#f_st_op2").on("click", flipSpellTrapDown);
  $("#f_st_op3").on("click", sendToGrave);
  $("#f_st_op4").on("click", sendToRemovedFromPlay);
  $("#f_st_op5").on("click", returnToHand);
  $("#f_st_op6").on("click", returnToDeck);

  $("#gy_op1").on("click", summonAtkMode);
  $("#gy_op2").on("click", summonDefMode);
  $("#gy_op3").on("click", returnToHand);
  $("#gy_op4").on("click", sendToRemovedFromPlay);
  $("#gy_op5").on("click", returnToDeck);

  $("#gy_st_op1").on("click", Activate);
  $("#gy_st_op2").on("click", sendToRemovedFromPlay);
  $("#gy_st_op3").on("click", returnToHand);
  $("#gy_st_op4").on("click", returnToDeck);

  $("#rfp_op1").on("click", summonAtkMode);
  $("#rfp_op2").on("click", summonDefMode);
  $("#rfp_op3").on("click", returnToHand);
  $("#rfp_op4").on("click", sendToGrave);
  $("#rfp_op5").on("click", returnToDeck);

  $("#rfp_st_op1").on("click", Activate);
  $("#rfp_st_op2").on("click", sendToGrave);
  $("#rfp_st_op3").on("click", returnToHand);
  $("#rfp_st_op4").on("click", returnToDeck);

  //opponent actions
  player.on("opp_deck_size", function(opp_deck_size) {
    $("#opp_deck_num").html(opp_deck_size);
  });
  // player.on("opp_deck_size_second", function(opp_deck_size) {
  //   $("#opp_deck_num").html(opp_deck_size);
  // });
  player.on("opp_ed_size", function(opp_ed_size) {
    $("#opp_ed_num").html(opp_ed_size);
    // player.emit("second_ed_size", extraDeck.length);
  });
  // player.on("opp_ed_size_second", function(opp_ed_size) {
  //   $("#opp_ed_num").html(opp_ed_size);
  // });
  player.on("opp_change_lp", function(opp_lp) {
    lp_change.play()
    percent = (opp_lp/8000)*100
    prev = opp_lp
    var i = setInterval(function ()
    {
        if (prev >= opp_lp)
        {
          $("#opp_lp").html(opp_lp);
            clearInterval(i);
          
        }
        else
        {
            prev+=10;
            $("#opp_lp").html(prev);
        }
    }, 0.001);
  
    if(percent<=25)
    $("#op_lp").parent().attr('class', 'meter red');
    else if (percent<=50)
    $("#op_lp").parent().attr('class', 'meter orange');
    else
    $("#op_lp").parent().attr('class', 'meter green');

    $("#opp_lp").animate({width:`${percent>100 ? 100 : percent}%`})
  });
  player.on("opp_msg", opponentMessage);
  player.on("opp_shuffle", opponentShuffleDeck);
  player.on("opp_coin_toss", opponentCoinToss);
  player.on("opp_dice_roll", opponentDiceRoll);
  player.on("opp_field_card", opponentPlayFieldCard);
  player.on("opp_remove_card", opponentRemoveCard);
  player.on("opp_to_hand", opponentToHand);
  player.on("opp_select_phase", opponentSelectPhase);
  player.on("opp_end_turn", opponentEndTurn);
  player.on("opp_switch_def", opponentSwitchDef);
  player.on("opp_switch_atk", opponentSwitchAtk);
  player.on("opp_set_monster", opponentSetMonster);
  player.on("opp_flip_monster", opponentFlipMonster);
  player.on("opp_flip_summon", opponentFlipSummon);
  player.on("opp_flip_st_up", opponentFlipSpellTrapUp);
  player.on("opp_flip_st_down", opponentFlipSpellTrapDown);
  player.on("opp_select_card", opponentSelectCard);
  player.on("opp_attack_directly", opponentAttackDirectly);
  player.on("opp_attack_monster", opponentAttackMonster);

  function rpsAnimation(data){
    var org_offset = $(rps).position()
    var clone = $(rps).clone()
    clone.offset({top:org_offset.top,left:org_offset.left})
    $(clone).appendTo("#preGame")
    $("#userChoices").fadeOut(function(){
      $(this).css({"display": "inline-block","visibility": "hidden"}); 
    })
    // $(rps).siblings().fadeTo(function(){
    //   $(this).css("visibility", "hidden");   
    // })
    var index = rps.index();
    var pos = $("#userChoice").position()
    $(clone).css({"position":"absolute","width":"8vw","height": "24vh"})
    $(clone).animate({top:pos.top,left:pos.left,width:"12vw",height:"36vh"},500,function(){
        $(this).css({ left: 0, top: 0 });
        $("#userChoice").append($(this))
    })
 
    var opp_org_offset = $("#opponentChoices img").eq(data).position()
    var opp_rps = $("#opponentChoices img").eq(data).clone()
    opp_rps.offset({top:opp_org_offset.top,left:opp_org_offset.left})
    $(opp_rps).appendTo("#preGame")
    $("#opponentChoices").fadeOut(function(){
      $(this).css({"display": "inline-block","visibility": "hidden"}); 
    })
    // $(opp_rps).siblings().fadeTo(function(){
    //   $(this).css("visibility", "hidden");   
    // })
    var flipped= false;
    var opp_pos = $("#opponentChoice").position()
    $(opp_rps).css({"position":"absolute","width":"8vw","height": "24vh"})
  opp_rps.animate(
    { deg: -180 },
    {
      duration: 300,
      step: function(now) {
        $(this).css({ transform: "rotateY(" + now  + "deg)" });
        if(now<-90 && !flipped){
          $(this).attr("src",$("#userChoices img").eq(data).attr("src"));
          flipped = true;
        }
        },
      complete: function() {
        $(this).animate({top:opp_pos.top,left:opp_pos.left,width:"12vw",height:"36vh"},500,function(){
         $(this).css({ left: 0, top: 0 });
         $("#opponentChoice").append($(this))
         rpsValue(index,data)
        })
      }
    })
  }
  function rpsValue(left, right){
    if(left==right){
      sameChoice()
    }
     else if(left == 0){
       if (right == 1)
          rightBeatsleft()
      else
          leftBeatsRight()
     }
     else if (left ==1){
      if (right == 2)
        rightBeatsleft()
      else
       leftBeatsRight()
     }
     else if (left ==2){
      if (right == 0)
        rightBeatsleft()
      else
        leftBeatsRight()
     }
  }
  function sameChoice(){
      $("#userChoice img").animate({left:"+=5vw"},function(){
        $(this).fadeOut(1500,function(){
          $(this).remove()
          $(this).css("display", "inline-block"); 
          $("#userChoices").css("visibility","visible"); 
        })
      })
      $("#opponentChoice img").animate({left:"-=5vw"},function(){
        $(this).fadeOut(1500,function(){
          $(this).remove()
          $(this).css("display", "inline-block"); 
          $("#opponentChoices").css("visibility","visible"); 
        })
      })
      rps=null;
  }
  function leftBeatsRight(){
    $("#userChoice img").animate({left:"+=10vw"},function(){
      $("#opponentChoice img").animate({left:"+=100vw"},function(){
        $("#userChoice").fadeOut(1500,function(){
          $("#rockPaperScissors").remove()
          $("#directions").html("Choose turn order")
          choose_turn = true;
          $("#turnChoice").fadeIn(2000);
        })
      })
    })
  }
  function rightBeatsleft(){
    $("#opponentChoice img").animate({left:"-=10vw"},function(){
      $("#userChoice img").animate({left:"-=100vw"},function(){
        $("#opponentChoice").fadeOut(2000,function(){
          $("#rockPaperScissors").remove()
          $("#directions").html("Opponent will choose turn order")
          $("#turnChoice").fadeIn(1500);
        })
      })
    })
  }
  function initDeck() {
    var deck_num = Deck.length;
    $("#deck_num").html(deck_num);
    for (var i = 0; i < deck_num; i++) {
      var card = $("<img>", {
        src: Deck[i].imageURL,
        name: Deck[i].name,
        class: "card",
        img_path: Deck[i].imageURL,
        dscr: Deck[i].description,
        type: Deck[i].type,
        subtype: Deck[i].subtype,
        pos: "deck"
      });
      $("#deck_cards").append(card);
    }
    Shuffle();
    player.emit("deck_size", deck_num - 5);
  }
  function initExtraDeck() {
    var ed_num = extraDeck.length;
    $("#ed_num").html(ed_num);
    for (var i = 0; i < ed_num; i++) {
      var ed_card = $("<img>", {
        src: extraDeck[i].imageURL,
        name: extraDeck[i].name,
        class: "card",
        img_path: extraDeck[i].imageURL,
        dscr: extraDeck[i].description,
        type: extraDeck[i].type,
        pos: "ed"
      });
      $("#ed_cards").append(ed_card);
    }
    $("#extra_deck_num").html(ed_num);
    player.emit("ed_size", ed_num);
  }
  function initHand() {
    for (var i = 0; i < 5; i++) {
      var hand_card = $("#deck_cards img:eq(0)");
      $(hand_card).attr("pos", "hand");
      $(hand_card).appendTo("#hand");
      var opp_hand_card = $("<img>", {
        src: "/Images/card_back.png",
        class: "opp_card"
      });
      $("#opp_hand").append(opp_hand_card);
    }
    $("#deck_num").html($("#deck_cards img").length);
  }

  function Shuffle() {
    deck = $("#deck_cards");
    $.each(deck.get(), function() {
      var card = deck.children();
      card.sort(function() {
        return 0.5 - Math.random();
      });
      deck.empty();
      card.appendTo(deck);
    });
  }
  function showCardInfoAndOptionsOnHover() {
    if (animation) return;
    $(".options_menu").css("width", "4vw");
    card = $(this);
    $("#viewer").attr("src", $(this).attr("img_path"));
    $("#name").html($(this).attr("name"));
    $("#dscr").html($(this).attr("dscr"));
    if(card.closest("#preGame").length!=0){
      $("#viewer").attr("src", $(this).attr("src"));
      return
    }
    var type = $(this).attr("type");
    var pos = $(this).attr("pos");
    var options;
    if (type.includes("Monster")) options = "#" + pos + "_monster_options";
    else options = "#" + pos + "_st_options";
    selectFieldOptions($(this), type, pos);
    if (inDefensePosition(card)) $(options).css("width", "12vh");
    $(options).css("display", "block");
    var topPos = $(this).offset().top - $(options).height();
    var leftPos = $(this).offset().left;
    if ($(this).parents(".viewer").length) {
      var viewer = "#" + pos + "_view";
      var viewTop = $(viewer).offset().top - $(options).height() + 1;
      if (topPos < viewTop) topPos = viewTop;
    }
    $(options).offset({ top: topPos, left: leftPos });
  }
  function selectFieldOptions(card, type, pos) {
    if (pos == "field") {
      if (type.includes("Monster")) {
        $("#f_op1").css("display", "block");
        $("#f_op2").css("display", "block");
        $("#f_op3").css("display", "block");
        $("#f_op4").css("display", "block");
        $("#f_op5").css("display", "block");
        $("#f_op8").css("display", "block");
        $(".bp_options").css("display", "none");
        if (type == "ed_monster") $("#f_op8").css("display", "none");
        if (card.attr("src") == "/Images/card_back.png") {
          $("#f_op1").css("display", "none");
          $("#f_op2").css("display", "none");
          $("#f_op3").css("display", "none");
        } else if (inDefensePosition(card)) {
          if (phase == "bp") $(".bp_options").css("display", "block");
          $("#f_op2").css("display", "none");
          $("#f_op4").css("display", "none");
          $("#f_op5").css("display", "none");
        } else {
          if (phase == "bp") $(".bp_options").css("display", "block");
          $("#f_op1").css("display", "none");
          $("#f_op4").css("display", "none");
          $("#f_op5").css("display", "none");
        }
      } else {
        $("#st_f_op1").css("display", "block");
        $("#st_f_op2").css("display", "block");
        if (card.attr("src") == "/Images/card_back.png")
          $("#st_f_op2").css("display", "none");
        else $("#st_f_op1").css("display", "none");
      }
    } else {
      if (fullMonsterZone()) $(".toMField").css("display", "none");
      else $(".toMField").css("display", "block");
      if (fullSpellTrapZone()) $(".toSTField").css("display", "none");
      else $(".toSTField").css("display", "block");
    }
  }

  function getMonsterZone() {
    for (var i = 0; i < 5; i++) {
      zone = "#R2C" + zone_order[i];
      if ($(zone).attr("used") == "false") {
        $(zone).attr("used", "true");
        return zone;
      }
    }
    return -1;
  }
  function getSpellTrapZone() {
    for (var i = 0; i < 5; i++) {
      zone = "#R3C" + zone_order[i];
      if ($(zone).attr("used") == "false") {
        $(zone).attr("used", "true");
        return zone;
      }
    }
    return -1;
  }
  function viewDeck() {
    $("#deck_options").css("display", "none");
    $("#deck_view").css("display", "block");
  }
  function Mill() {
    removeFromField("gy", $("#deck_cards img:eq(0)"));
  }
  function banishTop() {
    removeFromField("rfp", $("#deck_cards img:eq(0)"));
  }
  function shuffleDeck() {
    Shuffle();
    $("#msg_output").append(
      '<p style="font-weight: bold">Your deck has been Shuffled!</p>'
    );
    $("#msg_output").scrollTop($("#msg_output")[0].scrollHeight);
    $("#deck_options").css("display", "none");
    player.emit("shuffle");
  }

  function Draw() {
    toHand($("#deck_cards img:eq(0)"), true);
    draw.play()
  }
  function returnToHand() {
    toHand(card);
  }
  function toHand(_card, draw = false) {
    var org_offset = _card.offset();
    var index = _card.index();
    var pos = _card.attr("pos");
    var topCard;
    if (_card.attr("pos") == "field") {
      _card.css("transform", "none");
      if ($(_card).hasClass("opp_selected")) {
        $(_card).removeClass("opp_selected");
        opp_card = null;
      }
      _card.parent().attr("used", "false");
      _card.attr("src", _card.attr("img_path"));
      index =
        "#R" +
        Math.abs(_card.parent().attr("id")[1] - 3) +
        "C" +
        (4 - _card.parent().attr("id")[3]) +
        " .opp_card";
    } else if (_card.parents(".viewer").length) {
      if (pos != "deck") {
        if ($("#" + pos + "_cards img").length == 1)
          $("#" + pos).attr("src", "/Images/" + pos + ".jpg");
        else if (_card.index() == 0)
          $("#" + pos).attr(
            "src",
            $("#" + pos + "_cards img:eq(1)").attr("img_path")
          );
      }
      topCard = $("#" + pos).attr("src");
      org_offset = $("#" + pos).offset();
      $(".viewer").css("display", "none");
      $("#" + pos + "_num").html($("#" + pos + "_cards img").length - 1);
    }
    $(_card).appendTo("#cardHolderToField");
    var data = {
      src: $(_card).attr("src"),
      img_path: $(_card).attr("img_path"),
      dscr: $(_card).attr("dscr"),
      name: $(_card).attr("name"),
      type: $(_card).attr("type"),
      pos: pos,
      index: index,
      topCard: topCard,
      draw: draw
    };
    var temp = $("<img>");
    $(temp).css("visibility", "hidden");
    $(temp).appendTo("#hand");
    $("#hand").scrollLeft($("#hand")[0].scrollWidth);
    var hand_pos = $(temp).position();
    _card.offset({ top: org_offset.top, left: org_offset.left });
    if (pos == "deck" && !draw) {
      var reveal_pos = $("#R1C1").position();
      _card.animate(
        {
          top: reveal_pos.top,
          left: reveal_pos.left,
          height: "36vh",
          width: "12vw"
        },
        500,
        function() {
          $(_card).animate(
            {
              top: hand_pos.top,
              left: hand_pos.left,
              height: "12vh",
              width: "4vw"
            },
            300,
            function() {
              $(temp).remove();
              $(_card).attr("pos", "hand");
              $(_card).appendTo("#hand");
            }
          );
        }
      );
    } else {
      $(_card).animate(
        { top: hand_pos.top, left: hand_pos.left },
        300,
        function() {
          $(temp).remove();
          $(_card).attr("pos", "hand");
          $(_card).appendTo("#hand");
        }
      );
    }
    player.emit("to_hand", data);
    $(".options_menu").css("display", "none");
  }
  function removeFromField(dest, _card) {
    if ($(_card).hasClass("opp_selected")) {
      console.log("hi")
      $(_card).removeClass("opp_selected");
      opp_card = null;
    }
    animation = true;
    org_offset = _card.offset();
    var pos = _card.attr("pos");
    var index = _card.index();
    var topCard;
    if (_card.attr("pos") == "field") {
      _card.css("transform", "none");
      _card.parent().attr("used", "false");
      index =
        "#R" +
        Math.abs(_card.parent().attr("id")[1] - 3) +
        "C" +
        (4 - _card.parent().attr("id")[3]) +
        " .opp_card";
      org_offset = _card.offset();
    } else if (_card.parents(".viewer").length) {
      if (pos == "rfp" || pos == "gy") {
        index = _card.index();
        if ($("#" + pos + "_cards img").length == 1)
          $("#" + pos).attr("src", "/Images/" + pos + ".jpg");
        else if (index == 0)
          $("#" + pos).attr(
            "src",
            $("#" + pos + "_cards img:eq(1)").attr("img_path")
          );
      }
      topCard = $("#" + pos).attr("src");
      org_offset = $("#" + pos).offset();
      $(".viewer").css("display", "none");
      $("#" + pos + "_num").html($("#" + pos + "_cards img").length - 1);
    }
    if (_card.attr("type").includes("ed") && dest == "deck") dest = "ed";
    var data = {
      src: $(_card).attr("src"),
      img_path: $(_card).attr("img_path"),
      dscr: $(_card).attr("dscr"),
      name: $(_card).attr("name"),
      type: $(_card).attr("type"),
      pos: pos,
      dest: "#opp_" + dest,
      index: index,
      topCard: topCard
    };
    var dest_pos = $("#" + dest + "_container").position();
    _card.appendTo("#cardHolderToField");
    _card.attr("pos", dest);
    _card.offset({ top: org_offset.top, left: org_offset.left });
    $(_card).animate(
      { top: dest_pos.top, left: dest_pos.left },
      300,
      function() {
        if (dest == "rfp" || dest == "gy")
          $("#" + dest).attr("src", data.img_path);
        _card.attr("src", data.img_path);
        _card.css({ left: 0, top: 0 });
        $("#" + dest + "_cards").prepend(_card);
        $("#" + dest + "_num").html($("#" + dest + "_cards img").length);
        animation = false;
      }
    );
    player.emit("remove_from_field", data);
    $(".options_menu").css("display", "none");
  }
  function toField(zone, _card, inDefPos = false) {
    animation = true;
    var org_offset = _card.offset();
    var pos = _card.attr("pos");
    var topCard;
    if (_card.parents(".viewer").length) {
      index = _card.index();
      if (pos == "gy" || pos == "rfp") {
        if ($("#" + pos + "_cards img").length == 1)
          $("#" + pos).attr("src", "/Images/" + pos + ".jpg");
        else if (index == 0)
          $("#" + pos).attr(
            "src",
            $("#" + pos + "_cards img:eq(1)").attr("img_path")
          );
      }
      topCard = $("#" + pos).attr("src");
      org_offset = $("#" + pos).offset();
      $(".viewer").css("display", "none");
      $("#" + pos + "_num").html($("#" + pos + "_cards img").length - 1);
    }
    var opp_zone_id = "#R" + Math.abs(zone[2] - 3) + "C" + (4 - zone[4]);
    if (_card.attr("subtype") == "Field") {
      zone = "#field_zone";
      var opp_zone_id = "#opp_field_zone";
    }
    var zone_pos = $(zone).position();
    var data = {
      src: _card.attr("src"),
      img_path: _card.attr("img_path"),
      dscr: _card.attr("dscr"),
      name: _card.attr("name"),
      type: _card.attr("type"),
      pos: pos,
      zone_id: opp_zone_id,
      index: _card.index(),
      inDefPos: inDefPos,
      topCard: topCard
    };
    _card.appendTo("#cardHolderToField");
    _card.attr("pos", "field");
    _card.offset({ top: org_offset.top, left: org_offset.left });
    _card.animate({ top: zone_pos.top, left: zone_pos.left }, 300, function() {
      _card.css({ left: 0, top: 0 });
      _card.appendTo($(zone));
      animation = false;
    });
    $(".options_menu").css("display", "none");
    player.emit("card_to_field", data);
  }

  function summonAtkMode() {
    toField(getMonsterZone(), card);
  }
  function summonDefMode() {
    card.animate(
      { deg: -90 },
      {
        duration: 100,
        step: function(now) {
          $(this).css({ transform: "rotate(" + now + "deg)" });
        }
      }
    );
    toField(getMonsterZone(), card, true);
  }

  function setMonsterHand() {
    card.attr("src", "/Images/card_back.png");
    card.animate(
      { deg: -90 },
      {
        duration: 100,
        step: function(now) {
          $(this).css({ transform: "rotate(" + now + "deg)" });
        }
      }
    );
    toField(getMonsterZone(), card, true);
  }
  function Activate() {
    toField(getSpellTrapZone(), card);
  }
  function setSpellTrap() {
    card.animate({ deg: -180 }, 1);
    card.attr("src", "/Images/card_back.png");
    toField(getSpellTrapZone(), card);
  }

  function sendToGrave() {
    removeFromField("gy", card);
  }
  function sendToRemovedFromPlay() {
    removeFromField("rfp", card);
  }

  function returnToDeck() {
    removeFromField("deck", card);
  }

  function switchAtkMode() {
    animation = true;
    var field_card = card;
    field_card.animate(
      { deg: 0 },
      {
        duration: 300,
        step: function(now) {
          $(this).css({ transform: "rotate(" + now + "deg)" });
          animation = false;
        }
      }
    );
    $("#field_monster_options").css("display", "none");
    var opp_zone =
      "#R1C" + (4 - field_card.parent().attr("id")[3]) + " .opp_card";
    player.emit("switch_atk", opp_zone);
  }
  function switchDefMode() {
    animation = true;
    var field_card = card;
    field_card.animate(
      { deg: -90 },
      {
        duration: 300,
        step: function(now) {
          $(this).css({ transform: "rotate(" + now + "deg)" });
          animation = false;
        }
      }
    );
    $("#field_monster_options").css("display", "none");
    var opp_zone =
      "#R1C" + (4 - field_card.parent().attr("id")[3]) + " .opp_card";
    player.emit("switch_def", opp_zone);
  }
  function setMonsterField() {
    var field_card = card;
    var flipped = false;
    animation = true;
    var inDef = false;
    if (inDefensePosition(field_card)) {
      field_card.animate(
        { deg: -180 },
        {
          duration: 300,
          step: function(now) {
            $(this).css({
              transform: "rotate(-90deg) rotateY(" + now + "deg)"
            });
            if (!flipped) {
              field_card.attr("src", "/Images/card_back_flip.png");
              flipped = true;
              inDef = true;
            }
          },
          complete: function() {
            field_card.animate({ deg: -90 });
            field_card.attr("src", "/Images/card_back.png");
            field_card.css("transform", "rotate(-90deg)");
            animation = false;
          }
        }
      );
    } else {
      field_card.animate(
        { deg: -180 },
        {
          duration: 300,
          step: function(now) {
            $(this).css({
              transform: "rotateZ(" + now / 2 + "deg) rotateY(" + now + "deg)"
            });
            if (now <= -90 && !flipped) {
              field_card.attr("src", "/Images/card_back_flip.png");
              flipped = true;
            }
          },
          complete: function() {
            field_card.animate({ deg: -90 });
            field_card.attr("src", "/Images/card_back.png");
            field_card.css("transform", "rotate(-90deg)");
            animation = false;
          }
        }
      );
    }
    $("#field_monster_options").css("display", "none");
    var data = {
      inDef: inDef,
      opp_zone: "#R1C" + (4 - field_card.parent().attr("id")[3]) + " .opp_card"
    };
    player.emit("set_monster", data);
  }
  function flipMonster() {
    animation = true;
    var field_card = card;
    field_card.attr("src", field_card.attr("img_path"));
    field_card.animate(
      { deg: 0 },
      {
        duration: 300,
        step: function(now) {
          $(this).css({ transform: "rotate(-90deg) rotateY(" + now + "deg)" });
        },
        complete: function() {
          field_card.animate({ deg: -90 });
          $(this).css({ transform: "rotate(-90deg)" });
          animation = false;
        }
      }
    );
    $("#field_monster_options").css("display", "none");
    var opp_zone =
      "#R1C" + (4 - field_card.parent().attr("id")[3]) + " .opp_card";
    player.emit("flip_monster", opp_zone);
  }

  function flipSummon() {
    animation = true;
    var field_card = card;
    field_card.attr("src", field_card.attr("img_path"));
    field_card.animate(
      { deg: 0 },
      {
        duration: 300,
        step: function(now) {
          $(this).css({
            transform: "rotate(" + now + "deg) rotateY(" + now + "deg)"
          });
        },
        complete: function() {
          field_card.animate({ deg: 0 });
          $(this).css({ transform: "rotate(0deg)" });
          animation = false;
        }
      }
    );
    $("#field_monster_options").css("display", "none");
    var opp_zone =
      "#R1C" + (4 - field_card.parent().attr("id")[3]) + " .opp_card";
    player.emit("flip_summon", opp_zone);
  }
  function flipSpellTrapUp() {
    animation = true;
    var field_card = card;
    flipped = false;
    field_card.animate(
      { deg: 0 },
      {
        duration: 300,
        step: function(now) {
          $(this).css({ transform: "rotateY(" + now / 2 + "deg)" });
          if (!flipped) {
            field_card.attr("src", field_card.attr("img_path"));
            flipped = true;
          }
        },
        complete: function() {
          $(this).css({ transform: "none" });
          animation = false;
        }
      }
    );
    $(".options_menu").css("display", "none");
    var opp_zone =
      "#R0C" + (4 - field_card.parent().attr("id")[3]) + " .opp_card";
    player.emit("flip_st_up", opp_zone);
  }
  function flipSpellTrapDown() {
    animation = true;
    var field_card = card;
    flipped = false;
    field_card.animate(
      { deg: -180 },
      {
        duration: 300,
        step: function(now) {
          $(this).css({ transform: "rotateY(" + now + "deg)" });
          if (now <= -90 && !flipped) {
            field_card.attr("src", "/Images/card_back_flip.png");
            flipped = true;
          }
        },
        complete: function() {
          field_card.attr("src", "/Images/card_back.png");
          field_card.css("transform", "none");
          animation = false;
        }
      }
    );
    $(".options_menu").css("display", "none");
    var opp_zone =
      "#R0C" + (4 - field_card.parent().attr("id")[3]) + " .opp_card";
    player.emit("flip_st_down", opp_zone);
  }
  function Attack() {
    if (!opp_card) return;
    animation = true;
    var _card = card;
    var opp_offset =
      (opp_card.parent().attr("id")[3] - _card.parent().attr("id")[3]) * 6 +
      "vw";
    console.log(opp_offset);
    _card.animate({ left: opp_offset, top: "-=25vh" }, function() {
      _card.animate({ left: 0, top: 0 }, 1000, function() {
        animation = false;
      });
    });
    $(".options_menu").css("display", "none");
    var data = {
      opp_zone: "#R1C" + (4 - card.parent().attr("id")[3]) + " .opp_card",
      opp_offset: opp_offset
    };
    player.emit("attack_monster", data);
  }
  function attackDirectly() {
    animation = true;
    var org_left = card.css("left");
    var zone = card
      .parent()
      .attr("id")
      .slice(-1);
    left = (2 - zone) * 6 + "vw";
    card.animate({ left: left, top: "-=45vh" }, function() {
      card.animate({ left: 0, top: 0 }, 1000, function() {
        animation = false;
      });
    });
    $(".options_menu").css("display", "none");
    var opp_zone = "#R1C" + (4 - card.parent().attr("id")[3]) + " .opp_card";
    player.emit("attack_directly", opp_zone);
  }
  function inDefensePosition(_card) {
    return (
      _card.css("transform") != "matrix(1, 0, 0, 1, 0, 0)" &&
      _card.css("transform") != "none"
    );
  }
  function fullMonsterZone() {
    var used_zones = 0;
    $("#monsterZone .container").each(function() {
      if ($(this).attr("used") == "true") used_zones++;
    });
    return used_zones >= 5;
  }
  function fullSpellTrapZone() {
    var used_zones = 0;
    $("#spellTrapZone .container").each(function() {
      if ($(this).attr("used") == "true") used_zones++;
    });
    return used_zones >= 5;
  }
  function selectPhase() {
    if (phase.includes("opp")) return;
    phase_id = "#" + phase;
    $(phase_id).css("color", "white");
    $(this).css("color", "yellow");
    phase = $(this)
      .text()
      .toLowerCase();
    player.emit(
      "select_phase",
      $(this)
        .text()
        .toLowerCase()
    );
  }
  function endTurn() {
    if (phase.includes("opp")) return;
    $("#" + phase).css("color", "white");
    phase = "opp_turn";
    player.emit("end_turn");
  }
  function coinToss() {
    var x = Math.round(Math.random());
    coin.play()
    if (x == 0)
      $("#msg_output").append(
        '<p style="font-weight: bold">Coin has landed on heads!</p>'
      );
    else
      $("#msg_output").append(
        '<p style="font-weight: bold">Coin has landed on tails!</p>'
      );
    $("#msg_output").scrollTop($("#msg_output")[0].scrollHeight);
    player.emit("coin_toss", x);
  }
  function diceRoll() {
    dice.play()
    var x = Math.floor(Math.random() * 6) + 1;
    $("#msg_output").append(
      '<p style="font-weight: bold">Dice has landed on ' + x + "!</p>"
    );
    $("#msg_output").scrollTop($("#msg_output")[0].scrollHeight);
    player.emit("dice_roll", x);
  }
  function subLP() {
    if ($("#value").val() == "") {
      return;
    }
    lp_change.play()
    prev = lp
    lp -= parseInt($("#value").val());
    $("#value").val("");
    if (lp < 0) lp = 0;
    // $("#lp").html(lp);
    var i = setInterval(function ()
    {
        if (prev <= lp)
        {
          $("#lp").html(lp);

            clearInterval(i);
        }
        else
        {
            prev-=10;
            $("#lp").html(prev);
        }
    }, 0.001);
 
    percent = (lp/8000)*100

    
    if(percent<=25)
    $("#lp").parent().attr('class', 'meter red');
    else if (percent<=50)
    $("#lp").parent().attr('class', 'meter orange');
    else
    $("#lp").parent().attr('class', 'meter green');

    $("#lp").animate({width:`${percent>100 ? 100 : percent}%`}, 1200)
    player.emit("change_lp", lp);
  }
  function addLP() {
    if ($("#value").val() == "") {
      return;
    }
    lp_change.play()
    prev = lp
    lp += parseInt($("#value").val());
    $("#value").val("");
    var i = setInterval(function ()
    {
        if (prev >= lp)
        {
          $("#lp").html(lp);
            clearInterval(i);
          
        }
        else
        {
            prev+=10;
            $("#lp").html(prev);
        }
    }, 0.001);
   
    if (lp < 0) lp = 0;
    percent = (lp/8000)*100
    if(percent<=25)
    $("#lp").parent().attr('class', 'meter red');
    else if (percent<=50)
    $("#lp").parent().attr('class', 'meter orange');
    else
    $("#lp").parent().attr('class', 'meter green');

       
      // $("#lp").data("origWidth", percent)
      // .width($(lp).width())
      // .animate(
      //   {
      //     width: $("#lp").data("origWidth")
      //   },
      //   1200
      // );
    $("#lp").animate({width:`${percent>100 ? 100 : percent}%`})
    player.emit("change_lp", lp);
  }
  function sendMessage(event) {
    event.preventDefault();
    player.emit("send_msg", $("#msg_input").val());
    $("#msg_output").append(
      '<p style="color:red;font-weight: bold">'+username+': ' +
        $("#msg_input").val() +
        "</p>"
    );
    $("#msg_output").scrollTop($("#msg_output")[0].scrollHeight);
    $("#msg_input").val("");
  }

  function showOpponentCard() {
    if ($(this).attr("src") != "/Images/card_back.png") {
      $("#viewer").attr("src", $(this).attr("img_path"));
      $("#name").html($(this).attr("name"));
      $("#dscr").html($(this).attr("dscr"));
    } else {
      $("#viewer").attr("src", $(this).attr("src"));
      $("#name").html("");
      $("#dscr").html("");
    }
  }
  function selectOpponentCard() {
    var index =
      "#R" +
      Math.abs(
        $(this)
          .parent()
          .attr("id")[1] - 3
      ) +
      "C" +
      (4 -
        $(this)
          .parent()
          .attr("id")[3]) +
      " .card";
    if ($(this).attr("pos") == "opp_field") {
      if ($(this).hasClass("selected")) {
        $(this).removeClass("selected");
        opp_card = null;
      } else {
        $(this).addClass("selected");
        opp_card = $(this);
      }
    }
    player.emit("select_opp_card", index);
  }
  function opponentAttackDirectly(data) {
    var opp_card = $(data);
    var zone = opp_card
      .parent()
      .attr("id")
      .slice(-1);
    left = (2 - zone) * 6 + "vw";
    opp_card.css("z-index", 1);
    opp_card.animate({ left: left, top: "+=45vh" }, function() {
      opp_card.animate({ left: 0, top: 0 }, 1000, function() {
        opp_card.css("z-index", 0);
      });
    });
  }
  function opponentAttackMonster(data) {
    console.log(data);
    var opp_card = $(data.opp_zone);
    opp_card.css("z-index", 1);
    opp_card.animate(
      { left: "-=" + data.opp_offset, top: "+=25vh" },
      function() {
        opp_card.animate({ left: 0, top: 0 }, 1000, function() {
          opp_card.css("z-index", 0);
        });
      }
    );
  }
  function opponentSelectCard(data) {
    var card = $(data);
    if (card.hasClass("opp_selected")) card.removeClass("opp_selected");
    else card.addClass("opp_selected");
  }
  function opponentMessage(data) {
    $("#msg_output").append(
      '<p style="color:blue;font-weight: bold">'+opp_username+': ' + data + "</p>"
    );
    $("#msg_output").scrollTop($("#msg_output")[0].scrollHeight);
  }
  function opponentShuffleDeck() {
    $("#msg_output").append(
      '<p style="font-weight: bold">Opponent has shuffled their deck!</p>'
    );
    $("#msg_output").scrollTop($("#msg_output")[0].scrollHeight);
  }
  function opponentCoinToss(data) {
    coin.play()
    if (data == 0)
      $("#msg_output").append(
        '<p style="font-weight: bold">Opponent coin has landed on heads!</p>'
      );
    else
      $("#msg_output").append(
        '<p style="font-weight: bold">Opponent coin has landed on tails!</p>'
      );
    $("#msg_output").scrollTop($("#msg_output")[0].scrollHeight);
  }
  function opponentDiceRoll(data) {
    dice.play()
    $("#msg_output").append(
      '<p style="font-weight: bold">Opponent dice has landed on ' +
        data +
        "!</p>"
    );
    $("#msg_output").scrollTop($("#msg_output")[0].scrollHeight);
  }
  function opponentSelectPhase(data) {
    $("#phases li").css("color", "white");
    $("#" + data).css("color", "red");
    phase = "opp_" + data;
  }
  function opponentEndTurn() {
    $("#phases li").css("color", "white");
    phase ="new_turn"
    $("#dp").click()
    Draw();
  }
  function opponentPlayFieldCard(data) {
    console.log(data);
    var opp_card;
    var org_offset;

    if (data.pos == "hand") {
      var opp_index = $("#opp_hand img").length - 1 - data.index;
      opp_card = $("#opp_hand img:eq(" + opp_index + ")");
      org_offset = opp_card.offset();
    } 
    else {
      opp_card = $("<img>", { class: "opp_card" });
      org_offset = $("#opp_" + data.pos).offset();
      $("#opp_" + data.pos + "_num").html(
        parseInt($("#opp_" + data.pos + "_num").html()) - 1
      );
      if (data.pos == "gy" || data.pos == "rfp") {
        opp_card = $("#opp_" + data.pos + "_cards img:eq(" + data.index + ")");
        $("#opp_" + data.pos).attr("src", data.topCard);
      }
    }
    opp_card.attr({
      src: data.src,
      img_path: data.img_path,
      type: data.type,
      dscr: data.dscr,
      name: data.name,
      pos: "opp_field"
    });
    opp_card.css("transform", "rotate(180deg)");
    var zone = $(data.zone_id);
    var zone_pos = zone.position();
    opp_card.appendTo("#cardHolderToField");
    opp_card.offset({ top: org_offset.top, left: org_offset.left });
    if (data.inDefPos)
      opp_card.animate(
        { deg: 90 },
        {
          duration: 100,
          step: function(now) {
            $(this).css({ transform: "rotate(" + now + "deg)" });
          }
        }
      );
    else opp_card.animate({ deg: 180 }, 1);
    opp_card.animate(
      { top: zone_pos.top, left: zone_pos.left },
      300,
      function() {
        opp_card.css({ left: 0, top: 0 });
        opp_card.appendTo($(zone));
      }
    );
  }
  function opponentRemoveCard(data) {
    var opp_card;
    var org_offset;
    console.log(data.dest);
    if (data.pos == "hand") {
      var opp_index = $("#opp_hand img").length - 1 - data.index;
      opp_card = $("#opp_hand img:eq(" + opp_index + ")");
      org_offset = opp_card.offset();
    } else if (data.pos == "field") {
      opp_card = $(data.index);
      if ($(opp_card).hasClass("selected")) {
        $(opp_card).removeClass("selected");
      }
      opp_card.css("transform", "none");
      org_offset = opp_card.offset();
    } else {
      opp_card = $("<img>", { class: "opp_card" });
      org_offset = $("#opp_" + data.pos).offset();
      $("#opp_" + data.pos + "_num").html(
        parseInt($("#opp_" + data.pos + "_num").html()) - 1
      );
      if (data.pos == "gy" || data.pos == "rfp") {
        opp_card = $("#opp_" + data.pos + "_cards img:eq(" + data.index + ")");
        $("#opp_" + data.pos).attr("src", data.topCard);
      }
    }
    opp_card.attr({
      src: data.src,
      img_path: data.img_path,
      type: data.type,
      dscr: data.dscr,
      name: data.name,
      pos: "opp_out_field"
    });
    opp_card.css("transform", "rotate(180deg)");
    var dest_pos = $(data.dest + "_container").position();
    opp_card.appendTo("#cardHolderToField");
    opp_card.offset({ top: org_offset.top, left: org_offset.left });
    opp_card.animate(
      { top: dest_pos.top, left: dest_pos.left },
      300,
      function() {
        $(data.dest + "_num").html(parseInt($(data.dest + "_num").html()) + 1);
        if (data.dest == "#opp_gy" || data.dest == "#opp_rfp") {
          $(data.dest).attr("src", data.img_path);
          opp_card.attr("src", data.img_path);
          opp_card.css("transform", "none");
          opp_card.css({ left: 0, top: 0 });
          $(data.dest + "_cards").prepend(opp_card);
          return;
        }
        opp_card.remove();
      }
    );
  }
  function opponentToHand(data) {
    var opp_card;
    var org_offset;
    if (data.pos == "field") {
      opp_card = $(data.index);
      if ($(opp_card).hasClass("selected")) {
        $(opp_card).removeClass("selected");
      }
      opp_card.css("transform", "none");
      org_offset = opp_card.offset();
    } else {
      opp_card = $("<img>", { class: "opp_card" });
      opp_card.attr({
        src: data.src,
        img_path: data.img_path,
        type: data.type,
        dscr: data.dscr,
        name: data.name,
        pos: "opp_field"
      });
      if (data.draw) {
        draw.play()
        opp_card.attr("src", "/Images/card_back.png");
      }
      org_offset = $("#opp_" + data.pos).offset();
      $("#opp_" + data.pos + "_num").html(
        parseInt($("#opp_" + data.pos + "_num").html()) - 1
      );
      if (data.pos == "gy" || data.pos == "rfp") {
        opp_card = $("#opp_" + data.pos + "_cards img:eq(" + data.index + ")");
        $("#opp_" + data.pos).attr("src", data.topCard);
      }
    }
   
    opp_card.css("transform", "rotate(180deg)");
    var temp = $("<img>", { class: "opp_card", src: "/Images/card_back.png" });
    $(temp).css("visibility", "hidden");
    $(temp).prependTo("#opp_hand");
    $("#hand").scrollLeft($("#hand")[0].scrollWidth);
    var hand_pos = $(temp).position();
    opp_card.appendTo("#cardHolderToField");
    opp_card.offset({ top: org_offset.top, left: org_offset.left });
    if ((data.pos == "deck") && !data.draw ) {
      var reveal_pos = $("#R1C2").position();
      opp_card.animate(
        {
          top: reveal_pos.top,
          left: reveal_pos.left,
          height: "36vh",
          width: "12vw"
        },
        500,
        function() {
          opp_card.animate(
            {
              top: hand_pos.top,
              left: hand_pos.left,
              height: "12vh",
              width: "4vw"
            },
            300,
            function() {
              $(temp).css("visibility", "visible");
              opp_card.remove();
            }
          );
        }
      );
    } else {
      opp_card.animate(
        { top: hand_pos.top, left: hand_pos.left },
        300,
        function() {
          $(temp).css("visibility", "visible");
          opp_card.remove();
        }
      );
    }
  }
  function opponentSwitchDef(data) {
    var opp_card = $(data);
    opp_card.animate(
      { deg: 90 },
      {
        duration: 300,
        step: function(now) {
          $(this).css({ transform: "rotate(" + now + "deg)" });
        }
      }
    );
  }
  function opponentSwitchAtk(data) {
    var opp_card = $(data);
    opp_card.animate(
      { deg: 180 },
      {
        duration: 300,
        step: function(now) {
          $(this).css({ transform: "rotate(" + now + "deg)" });
        }
      }
    );
  }
  function opponentSetMonster(data) {
    var opp_card = $(data.opp_zone);
    var flipped = false;
    if (data.inDef) {
      opp_card.animate(
        { deg: 180 },
        {
          duration: 300,
          step: function(now) {
            $(this).css({ transform: "rotate(90deg) rotateY(" + now + "deg)" });
            console.log(now);
            if (!flipped) {
              opp_card.attr("src", "/Images/card_back_flip.png");
              flipped = true;
            }
          },
          complete: function() {
            opp_card.animate({ deg: 90 });
            opp_card.attr("src", "/Images/card_back.png");
            opp_card.css("transform", "rotate(90deg)");
          }
        }
      );
    } else {
      opp_card.animate(
        { deg: 90 },
        {
          duration: 300,
          step: function(now) {
            $(this).css({
              transform: "rotateZ(" + now + "deg) rotateY(" + now * 2 + "deg)"
            });
            console.log(now);
            if (now <= 135 && !flipped) {
              opp_card.attr("src", "/Images/card_back_flip.png");
              flipped = true;
            }
          },
          complete: function() {
            opp_card.animate({ deg: 90 });
            opp_card.attr("src", "/Images/card_back.png");
            opp_card.css("transform", "rotate(90deg)");
          }
        }
      );
    }
  }
  function opponentFlipMonster(data) {
    var opp_card = $(data);
    opp_card.attr("src", opp_card.attr("img_path"));
    opp_card.animate(
      { deg: 0 },
      {
        duration: 300,
        step: function(now) {
          $(this).css({ transform: "rotate(90deg) rotateY(" + now + "deg)" });
        },
        complete: function() {
          opp_card.animate({ deg: 90 });
          $(this).css({ transform: "rotate(90deg)" });
        }
      }
    );
  }
  function opponentFlipSummon(data) {
    var opp_card = $(data);
    opp_card.attr("src", opp_card.attr("img_path"));
    opp_card.animate(
      { deg: 0 },
      {
        duration: 300,
        step: function(now) {
          $(this).css({
            transform: "rotate(" + (now + 180) + "deg) rotateY(" + now + "deg)"
          });
        },
        complete: function() {
          opp_card.animate({ deg: 180 });
          $(this).css({ transform: "rotate(180deg)" });
        }
      }
    );
  }
  function opponentFlipSpellTrapUp(data) {
    var opp_card = $(data);
    flipped = false;
    opp_card.animate(
      { deg: 0 },
      {
        duration: 300,
        step: function(now) {
          $(this).css({
            transform: "rotate(180deg)rotateY(" + now / 2 + "deg)"
          });
          if (!flipped) {
            opp_card.attr("src", opp_card.attr("img_path"));
            flipped = true;
          }
        },
        complete: function() {
          opp_card.animate({ deg: 180 });
          $(this).css({ transform: "rotate(180deg)" });
        }
      }
    );
  }
  function opponentFlipSpellTrapDown(data) {
    var opp_card = $(data);
    flipped = false;
    opp_card.animate(
      { deg: 0 },
      {
        duration: 300,
        step: function(now) {
          $(this).css({
            transform: "rotate(180deg) rotateY(" + now / 2 + "deg)"
          });
          if (!flipped) {
            opp_card.attr("src", "/Images/card_back.png");
            flipped = true;
          }
        },
        complete: function() {
          opp_card.animate({ deg: 180 });
          $(this).css({ transform: "rotate(180deg)" });
        }
      }
    );
  }
});
