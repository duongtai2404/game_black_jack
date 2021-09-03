const host = 'http://localhost:3000'

const socket = io('/');

// const socket = io('/');

socket.on('player-connection', function(userId, userName){
    console.log(userId, userName);
})

var cardlist = [1, 2]


function startGame (){
    const startGameBtn = document.querySelector('.dealer-start__btn');
    startGameBtn.addEventListener('click', function(){
        activateControl();
        renderCardList();
        startGameBtn.disabled = true;
    })
}

function resetGame (){
    const resetBtn = document.querySelector('.dealer-reset__btn');
    resetBtn.addEventListener('click', function(){
        console.log('reset clicked')
    })
}

function exitGame(){
    const exitBtn = document.querySelector('.exit__btn');
    exitBtn.addEventListener('click', function(){
        console.log('exit clicked')
    })
}

function activateControl (){
    const hitBtn = document.querySelector('.hit-btn');
    const doneBtn = document.querySelector('.done-btn');
    const resetBtn = document.querySelector('.dealer-reset__btn');
    hitBtn.disabled = false
    doneBtn.disabled = false;
    resetBtn.disabled = false;
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

function showCard(){
    var player_item = document.querySelector('li.player-item');
    console.log(player_item)
    player_item.addEventListener('click', function(){
        console.log('show card clicked')
        document.querySelector('.confirm-form').style.display = 'flex';
    })
}

function showCardAccept(){
    var acceptBtn = document.querySelector('.confirm-form__btn--accept');
    console.log(acceptBtn)
    acceptBtn.addEventListener('click', function(e){
        e.stopPropagation();
        console.log('accept clicked')
        document.querySelector('.confirm-form').style.display = 'none';
        document.querySelector('.modal').style.display = 'flex';
    })
}

function showCardReject(){
    var rejectBtn = document.querySelector('.confirm-form__btn--reject');
    rejectBtn.addEventListener('click', function(e){
        e.stopPropagation();
        console.log('reject clicked')
        document.querySelector('.confirm-form').style.display = 'none';

    })
}

function hideCard(){
    var closeBtn = document.querySelector('.close-player-btn');
    closeBtn.addEventListener('click', function(){
        document.querySelector('.modal').style.display = 'none';

    })
}

function start(){
    startGame();
    resetGame();
    exitGame();
    hitCard();
    done();
    showCard();
    showCardAccept();
    showCardReject();
    hideCard();
}

start();
