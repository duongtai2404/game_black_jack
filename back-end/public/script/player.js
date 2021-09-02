const host = 'http://localhost:3000';

const socket = io('/');

socket.emit('join-room', roomId, playerId);

socket.on('player-connection', function(userId, userName) {
    console.log(userId, userName);
})

var cardlist = [1, 2]

function getRoomInfo (callBack){
    fetch (`${host}/${roomId}`)
        .then(function(response){
            return response.json();
        })
        .then(callBack);
}

function renderPlayers(names){
    console.log(names)
    document.querySelector('.dealer__name').textContent = names.dealerName;
}


function bet(){
    const betBtn = document.querySelector('.player-bet__btn');
    betBtn.addEventListener('click', function(){
        console.log('bet clicked')
        const betNum = Number(document.querySelector('.player-bet__input').value)
        if (betNum && betNum > 0 && Number.isInteger(betNum)){
            betBtn.disabled = true;
            renderCardList();
            activateControl();
        }  
        else{
            alert("mức cược cần lớn hơn 0 và số nguyên")
        }
    });
}

function activateControl (){
    const hitBtn = document.querySelector('.hit-btn');
    const doneBtn = document.querySelector('.done-btn');
    hitBtn.disabled = false
    doneBtn.disabled = false;
}

function renderCardList (){
    var playerCardList = document.querySelector('.card-list.player__card');
    var htmls = cardlist.map(function(card){
        var html = `
        <li class="card-list__item">
        <img src="/assets/img/${card}.png" alt="" class="card-list__item-img">
        </li>
        `

        return html
    })
    htmls.join(' ')
    playerCardList.innerHTML = htmls;
    // console.log(htmls)
}

function hitCard(){
    const hitBtn = document.querySelector('.hit-btn');
    hitBtn.addEventListener('click', function(){
        console.log('hit clicked')
        cardlist.push(cardlist.length)
        renderCardList();
        if (cardlist.length >= 5){
            hitBtn.disabled = true;
            // hitBtn.classList.add('control-btn--disabled')

            document.querySelector('.done-btn').disabled = true;
        }
    })
}

function done (){
    const doneBtn = document.querySelector('.done-btn');
    doneBtn.addEventListener('click', function(){
        console.log('done clicked');
    })
}

function start(){
    getRoomInfo(renderPlayers);
    // renderCardList();
    bet();
    hitCard();
}

start();