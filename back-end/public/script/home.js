const host = 'http://localhost:3000'

function createRoom(){
    const createRoomButton = document.getElementById('createRoom');
    createRoomButton.onclick = () => {
        window.location.replace(`${host}/dealer`);
    };
}

function enterRoom(){
    var enterRoomBtn = document.querySelector('.btn.btn-secondary')
    enterRoomBtn.addEventListener('click', function(){
        var roomId = document.querySelector('.input-group > input').value;
        var roomIdNumber = Number(roomId);
        if (Number.isNaN(roomIdNumber) == false && roomId.length == 6){
            
            window.location.replace(`${host}/player/${roomId}`);
        }
    })
}

function start(){
    createRoom();
    enterRoom();
}

start();