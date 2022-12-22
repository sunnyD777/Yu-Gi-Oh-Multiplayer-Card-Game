
$(function(){
    console.log(window.location)
var player = io.connect(window.location.href); 
$("#queryOptions").submit(sendQueryOptions)
var resultCards = null;
var currPage=0;
var totalPages=0;
var deck =[];
var ed =[];
var dragCard = null;
var dragDeckCard = null;
var cardType;
var subType;
var monsterType;
var monsterAttribute;

var monster_subTypes= "<li class='back' >&nbsp;</li>"+
                      "<li>Normal</li>"+
                      "<li>Effect</li>"+
                      "<li>Ritual</li>"+
                      "<li>Fusion</li>"+
                      "<li>Synchro</li>";
var spell_subTypes=   "<li class='back' >&nbsp;</li>"+
                      "<li>Normal</li>"+
                      "<li>Continuous</li>"+
                      "<li>Equip</li>"+
                      "<li>Field</li>"+
                      "<li>Quick-Play</li>"
                      "<li>Ritual</li>";
var trap_subTypes=    "<li class='back' >&nbsp;</li>"+   
                      "<li>Normal</li>"+
                      "<li>Continuous</li>"+
                      "<li>Counter</li>";
if(userDeck!= null){
  var userExtraDeck = userDeck.pop()
  initSavedDeck(userDeck, userExtraDeck)
}

$("#container").on("dragover",(ev)=>{
    if(dragCard!= null)
        allowDrop(ev)
})
$("#container").on("drop",(ev)=>{
    if($(ev.target).closest("#container").length )
     drop(ev)
})
$("body").on("dragover",(ev)=>{
    if($(ev.target).closest("#container").length )
        return
    allowDeckDrop(ev)
})
$("body").on("drop",(ev)=>{
    if(dragDeckCard!=null)
         deckDrop(ev)
})
$(document).on('drag','.resultCard', (ev)=>{
    drag(ev)
})
$(document).on("drag",".taken",(ev)=>{
    dragDeck(ev)
})
$(".options").on("click",function(){
    if ($(this).css("opacity")!=1)
        return
    var menu = $(this).next()
    if($(menu).css("display") == "none")
         $(menu).css("display","block")
    else
         $(menu).css("display","none")
})
$("#cardTypeSelector").on("click",function(){
    var menu = $("cardType")
    console.log(menu)
    if($(menu).css("display") == "none")
         $(menu).css("display","block")
    else
         $(menu).css("display","none")
})
$(document).on("click",".selectOption li",function(){
    var type = $(this).parent().attr("id")
    var text = $(this).text();
    var menu = $(this).parent().prev()
    if($(this).attr("class")=="back"){
        $(menu).css("color","white")
        if(type=="subTypeSelector"){
        subType = null;
        text = "Sub Type"
    }
    else if(type=="attribute"){
        monsterAttribute= null
        text = "Monst Attr"
    }
    else{
        monsterType = null
        text= "Monst Type"
    }
    }
    else{
        $(menu).css("color","powderblue")
        if(type=="subTypeSelector")
        subType = text
    else if(type=="attribute")
        monsterAttribute= text
    else
        monsterType = text
    }
    $(this).parent().css("display","none")
    $(menu).html( text)
})

$("#cardType li").on("click",function(){
    subType=null;
    monsterType=null;
    monsterAttribute=null;
    
   $("#subType").html("Sub Type")
   $("#monstType").html("Monst Type")
   $("#monstAttr").html("Monst Attr")
    $(".options").css({"opacity":0.7, "color":"white"})
    $("#subTypeSelector").empty()
    var menu = $(this).parent().prev()
    cardType = $(this).text()
    if(cardType=="Monster"){
        $(".options").css("opacity",1)
        $(".mon").removeAttr('disabled');
        $("#subTypeSelector").append(monster_subTypes)
    }
    else if(cardType=="Spell" || cardType=="Trap"){
        $(".mon").attr('disabled',"disabled");
        if(cardType=="Spell")
             $("#subTypeSelector").append(spell_subTypes)
        else
             $("#subTypeSelector").append(trap_subTypes)
        $("#subType").css("opacity",1)
    }
    if($(this).attr("class")=="back"){
        $(menu).html("Card Type")
        $(menu).css("color","white")
        cardType = null;
    }
    else{
        $(menu).html(cardType)
        $(menu).css("color","red")
    }
    $(this).parent().css("display","none")
})
player.on("resultCards",function(cards){
    resultCards = cards;
    console.log(cards)
    currPage = 0;
    totalPages = Math.floor(resultCards.length/30);
    $("#totalPages").html(totalPages+1)
    initCardPages()
})

$(document).on('mouseover','.resultCard', showCardInfoAndOptionsOnHover)
$(document).on('mouseover','.taken', showCardInfoAndOptionsOnHover)


$("#rightPage").on("click",function(){
    if(currPage==totalPages)
        return;
    currPage++;
    initCardPages();
    })
$("#leftPage").on("click",function(){
    if(currPage==0)
            return
        currPage--;
        initCardPages();
    })
$("#saveDeck").click(function(){
    //covverts it into object on database
    deck.push(ed)
     $.post("/game/deckUser", {"deck":deck});
          });
$("#clearDeck").click(clearDeck)
$("#back").on("mouseover", function(){
    $(this).attr("src","/Images/back_hover.png")
})
$("#back").on("mouseout", function(){
    $(this).attr("src","/Images/back.png")
})
$("#back").on("click", function(){
    window.location.pathname = "/game/lobby"
})
function showCardInfoAndOptionsOnHover(){
if($(this).attr('src')!= "/Images/rectangle.jpg"){
$('#viewer').attr('src', $(this).attr('src'));
$('#name').html($(this).attr('name'));
$('#dscr').html($(this).attr('dscr'));
}
}

function initCardPages(){
$('<img class="resultCard" src="/Images/rectangle.jpg">').replaceAll("#cardResultDisplay .resultCard")
var slots = $("#cardResultDisplay .resultCard")
$("#currPage").html(currPage+1)
var length = slots.length
if(currPage==totalPages)
   length = resultCards.length % length; 
for (var i = 0;i<length;i++)
        slots.eq(i).attr({"src":resultCards[(currPage*slots.length)+i].imageURL, "dscr":resultCards[(currPage*slots.length)+i].description, "name": resultCards[(currPage*slots.length)+i].name, "subtype":resultCards[(currPage*slots.length)+i].subtype, "index": (currPage*slots.length)+i })
}
function initSavedDeck(userDeck,userExtraDeck){
   if(userDeck!=null){
    $('<img class="slot" src="/Images/rectangle.jpg">').replaceAll(".slot")
    deck = userDeck
    console.log(userDeck)
    for (var i = 0; i <userDeck.length;i++)
        $(".slot").eq(i).attr({"src":userDeck[i].imageURL,"name":userDeck[i].name,"dscr":userDeck[i].description,"class":"slot taken"})
   }
    if(userExtraDeck!=null){
    $('<img class="ed_slot" src="/Images/rectangle.jpg">').replaceAll(".ed_slot")
    ed = userExtraDeck
    for (var i = 0; i <userExtraDeck.length;i++)
         $(".ed_slot").eq(i).attr({"src":userExtraDeck[i].imageURL,"name":userExtraDeck[i].name,"dscr":userExtraDeck[i].description,"class":"ed_slot taken"})
}
}
function sendQueryOptions( event ) {
    console.log("submitted!")
    event.preventDefault(); 
    var data = {
        name: {'$regex': $("#Name").val(), '$options': 'i' },
        description: {'$regex': $("#description").val(), '$options': 'i' }
    }
    if(cardType)
        data["type"] = cardType
    if(subType)
        data["subtype"] = subType
if(cardType=="Monster"){
    if(monsterType)
       data["monsterType"] = monsterType
    if(monsterAttribute)
        data["monsterAttribute"] = monsterAttribute
    if($("#levelLow").val())
        data["monsterLevel"] = {"$gte": $("#levelLow").val()}
    else
         data["monsterLevel"] =  {"$gte": 1}
    if($("#levelHigh").val())
        data.monsterLevel.$lte = $("#levelHigh").val()
    else
         data.monsterLevel.$lte = 12
     if($("#atkLow").val())
         data["monsterATK"] = {"$gte": $("#atkLow").val()}
     else
          data["monsterATK"] =  {"$gte": 0}
     if($("#atkHigh").val())
         data.monsterATK.$lte = $("#atkHigh").val()
     else
          data.monsterATK.$lte = 999999
     if($("#defLow").val())
          data["monsterDEF"] = {"$gte": $("#defLow").val()}
      else
           data["monsterDEF"] =  {"$gte": 0}
      if($("#defHigh").val())
          data.monsterDEF.$lte = $("#defHigh").val()
      else
           data.monsterDEF.$lte = 999999
}
console.log(data)
    player.emit('searchCard', data);
  }
function allowDrop(ev){
 if(dragCard){
    var subtype = dragCard.attr("subtype");
    if((subtype=="Fusion" || subtype=="Synchro") && ed.length==15)
        return
    else if(deck.length==60)
        return
    ev.preventDefault();
 }
}
function allowDeckDrop(ev){
    if(dragDeckCard)
     ev.preventDefault();
}   
function drop(ev) {
    ev.preventDefault();
    var subtype = dragCard.attr("subtype");
    if(subtype=="Fusion" || subtype=="Synchro"){
        $(".ed_slot").eq(ed.length).attr({"src":dragCard.attr("src"),"name":dragCard.attr("name"),"dscr":dragCard.attr("dscr"),"class":"ed_slot taken"});
        ed.push(resultCards[dragCard.attr("index")])
        dragCard = null;
    }
    else{
        $(".slot").eq(deck.length).attr({"src":dragCard.attr("src"),"name":dragCard.attr("name"),"dscr":dragCard.attr("dscr"),"class":"slot taken"});
         deck.push(resultCards[dragCard.attr("index")])
         dragCard =null;
    }
  }
  function deckDrop(ev){
      ev.preventDefault();
      if(!dragDeckCard.isED){
        deck.splice(dragDeckCard.index,1)
        dragDeckCard=null;
        initSavedDeck(deck,null)
      }
      else{
         ed.splice(dragDeckCard.index,1)
         dragDeckCard=null;
         initSavedDeck(null,ed)
      }
  }
  function drag(ev) {
    if($(ev.target).attr("src")=="/Images/rectangle.jpg"){
      dragCard = null;
      return
    }
     dragCard = $(ev.target)
  }
  function dragDeck(ev){
      if($(ev.target).index(".slot")!=-1)
        dragDeckCard = {isED: false, index:$(ev.target).index(".slot")}
      else
        dragDeckCard = {isED: true, index:$(ev.target).index(".ed_slot")}
    }
 function clearDeck(){
    $('<img class="ed_slot" src="/Images/rectangle.jpg">').replaceAll(".ed_slot")
    $('<img class="slot" src="/Images/rectangle.jpg">').replaceAll(".slot")
    deck = [];
    ed = [];
}
})
