const host = 'http://localhost:3000'

const socket = io('/');

function errorListen(){
    socket.on('error', function(msg){
        console.log(msg)
    })
}

function handleJoinRoom(){
    socket.emit('join-room', roomId, dealerId);
    socket.on('room-info', function(room){
        // getRoomInfo(renderPlayerList)
        renderPlayerList(room);
        document.querySelector('.dealer-start__btn').disabled = true;
    })
    socket.on('room-joined', function(){
        console.log('created room')
    })   
}

function renderPlayerList(roomInfo){
        console.log(roomInfo)
        players = roomInfo.players
        var htmls = players.map(function(val){
            var bettedClass = ''
            var imgSrc = ''
            if (val.bet > 0){
                bettedClass = 'player--betted'
            }
            if (val.card > 0){
                imgSrc = '/assets/img/0.png'
            }
            var html = `
            <li class="player-item grid__col--2 ${bettedClass}" onclick=handleShowCard(${val.id}) id="player-${val.id}">
                <span class="player-item__name">${val.name}</span>
                <img src="${imgSrc}" alt="" class="player-item__img">
                <div class="player-item__info">
                <div>
                    <span>Bài: </span>
                    <span class="player-item__card-number">${val.card}</span>
                </div>
                <div>
                    <span>Cược: </span>
                    <span class="player-item__bet">${val.bet}</span>
                </div>

                </div>

                <div class="confirm-form">
                <div class="confirm-form__info">
                    <span>Xác nhận xem bài</span>
                    <span class="confirm-form__name">${val.name}</span>

                </div>
                    <div class="confirm-form__btn">
                    <button class="confirm-form__btn--accept btn control-btn">Đồng ý</button>
                    <button class="confirm-form__btn--reject btn control-btn">Hủy</button>
                    </div>
                </div>

            </li>
          
            `
            return html;
        })
        console.log(htmls)
        document.querySelector('ul.player-list').innerHTML = htmls.join(' ')
        
}

function handleShowCard(userId){
    var playerItem = document.querySelector(`#player-${userId}`)
    var cardNum = Number(playerItem.querySelector('.player-item_card-number'))
    if (cardNum > 0){
        var confirmform = playerItem.querySelector('.confirm-form');
        var acceptBtn = playerItem.querySelector('.confirm-form__btn--accept');
        var rejectBtn = playerItem.querySelector('.confirm-form__btn--reject');
        var playerName = playerItem.querySelector('.player-item__name').textContent;
    
        confirmform.style.display = 'flex'
    
        acceptBtn.addEventListener('click', function(e){
            e.stopPropagation();
            confirmform.style.display = 'none';
            document.querySelector('.modal .player__name').textContent = playerName;
            document.querySelector('.modal').style.display = 'flex';
        })
    
        rejectBtn.addEventListener('click', function(e){
            e.stopPropagation();
            confirmform.style.display = 'none';
    
        })

    }
}

function handleLeaveRoom(){
    const exitBtn = document.querySelector('.exit__btn');
    exitBtn.addEventListener('click', function(){
        console.log('exit clicked')
        socket.emit('exit-room', roomId, dealerId);
        window.location.replace(`${host}/home`)
    })
}

function handlePlayerBet (){
    socket.on('player-betted', function(userId, betVal){
        var playerItem = document.querySelector(`#player-${userId}`);
        if (playerItem){
            playerItem.querySelector('.player-item__bet').textContent = betVal;
            playerItem.classList.add('player--betted')
        }
    })

    socket.on('all-player-betted', function(){
        var dealCardBtn = document.querySelector('.dealer-start__btn');
        dealCardBtn.disabled = false;
    })
}

function checkAllBetted(){
    var betNums = document.querySelectorAll('.player-item__bet')
    var resutl = true;
    betNums.forEach(function(val){
        var betVal = Number(val.textContent)
        resutl = (Number.isNaN(betVal) == false && betVal > 0);
    })
    return resutl;
}

function handleDealCard (){
    var dealCardBtn = document.querySelector('.dealer-start__btn');
    dealCardBtn.addEventListener('click', function(){
        var allBetted = checkAllBetted();
        if (allBetted){
            console.log('deal clicked')
            socket.emit('deal-card', roomId, dealerId);
            dealCardBtn.disabled = true;
        }
    })

    socket.on('card-dealt', function(){
        socket.emit('request-card', roomId, dealerId)
    })

    socket.on('receive-card', function(userId, playerCard){
        if (userId == dealerId){
            renderCardList(playerCard)

        }
    })
}


function renderCardList (cardList){
    console.log(cardList)
    if (cardList.length && cardList.length > 0){
        
        var playerCardList = document.querySelector('.player .card-list.player__card');
        var htmls = cardList.map(function(card){
            var html = `
            <li class="card-list__item">
            <img src="/assets/img/${card}.png" alt="" class="card-list__item-img">
            </li>
            `
            
            return html
        })
        htmls.join(' ')
        playerCardList.innerHTML = htmls;
    }
    // console.log(htmls)
}

function handlePlayerTurn (){
    socket.on('player-turn', function(userId){
        var playerItem = document.querySelector(`#player-${userId}`);
        console.log(playerItem)
        if(playerItem){
            if (playerItem.classList.contains('player--betted')){

                playerItem.classList.remove('player--betted');
            }
            playerItem.classList.add('player--turn')
        }
        
    })

    socket.on('dealer-turn', function(){
        var player = document.querySelector('.player');
        if (player.classList.contains('player--betted')){
            player.classList.remove('player--betted')
        }
        player.classList.add('player--turn')
        activateControl();
    })

    socket.on('card-hit', function(cardList){
        renderCardList(cardList);
    })

    socket.on('turn-ended', function(){
        endTurn();
        disableControl();
        // socket.emit('next-turn', roomId, playerId);
    })

    socket.on('player-card-change', function(userId, card){
        var playerItem = document.querySelector(`#player-${userId}`);
        playerItem.querySelector('.player-item__card-number').textContent = card;
    })

    socket.on('player-finish', function(userId){
        var otherPlayer = document.querySelector(`#player-${userId}`);
        if(otherPlayer){
            if (otherPlayer.classList.contains('player--turn')){
                otherPlayer.classList.remove('player--turn')
            }
            otherPlayer.classList.add('player--end-turn')
            console.log('turn', otherPlayer)
        }
        
    })
}

function activateControl (){
    const hitBtn = document.querySelector('.hit-btn');
    const doneBtn = document.querySelector('.done-btn');

    hitBtn.disabled = false;
    doneBtn.disabled = false;

    hitBtn.addEventListener('click', function(){
        socket.emit('hit-card', roomId, dealerId);
        console.log('hit clicked')
    })

    doneBtn.addEventListener('click', function(){
        console.log('done clicked')
        endTurn();
        disableControl();
        socket.emit('show-all', roomId, dealerId)
    })
}

function endTurn(){
    var player = document.querySelector('.player');
    if (player.classList.contains('player--turn')){
        player.classList.remove('player--turn')
    }
    player.classList.add('player--end-turn')
}

function disableControl(){
    document.querySelector('.hit-btn').disabled = true;
    document.querySelector('.done-btn').disabled = true;
}




function hideCard(){
    var closeBtn = document.querySelector('.close-player-btn');
    closeBtn.addEventListener('click', function(){
        document.querySelector('.modal').style.display = 'none';

    })
}

function start(){
    document.querySelector('.player-area .player__name').textContent = localStorage.getItem('name');
    errorListen();
    handleJoinRoom();
    handleLeaveRoom();
    handlePlayerBet();
    handleDealCard();
    handlePlayerTurn();
    
    hideCard();
}

start();
