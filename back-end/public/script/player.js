const host = 'http://localhost:3000';

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
        if (!betBtn.classList.contains('control-btn--disabled')){
            const betNum = Number(document.querySelector('.player-bet__input').value)
            if (betNum && betNum > 0 && Number.isInteger(betNum)){
                betBtn.classList.add('control-btn--disabled')
            }  
            else{
                alert("mức cược cần lớn hơn 0 và số nguyên")
            }

        }

    });
}

function start(){
    getRoomInfo(renderPlayers);
    bet();
}

start();