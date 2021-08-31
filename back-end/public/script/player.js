// const { json } = require("body-parser");
localStorage.setItem(playerId, playerId);

const host = 'http://localhost:3000'

const socket = io('/');

socket.emit('join-room', roomId, playerId);

socket.on('player-connection', function(userId, userName) {
    console.log(userId, userName);
})

function handleExit(){
    var exitBtn = document.querySelector('.exit > .control-btn.btn');
    console.log(exitBtn) 
    exitBtn.addEventListener('click', function(){
        console.log(roomId, playerId)
        var data = {
            roomId: roomId,
            playerId: playerId
        }
        exitTable(data)
    })
}

function exitTable (data){
    var option = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
        body: JSON.stringify(data)
    }

    fetch (`${host}/home`, option)
        .then(function(response){
            console.log('then 1')
            if (response.ok){
                return response.json();
            }
          
        })
        .then(function(destination){
            window.location.replace(destination);
        })
        .catch(function(error){
            console.log('loi')
            console.log(error)
        })

}

function start(){
    var name = localStorage.getItem('name');
    document.querySelector('.player__name').textContent = name;
    handleExit();
}



start();