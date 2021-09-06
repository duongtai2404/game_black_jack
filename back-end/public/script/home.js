const host = 'http://localhost:3000'

const data = {
    name: localStorage.getItem('name')
}
const option = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    body: JSON.stringify(data)
}

function createRoom(){
    const createRoomButton = document.getElementById('createRoom');
    createRoomButton.onclick = () => {    
        fetch(`${host}/create_room`, option)
            .then(function(response){
                return response.json();
            })
            .then(function(ids){
                if (ids.roomId){
                    console.log(ids)
                    const roomId = ids.roomId;
                    const dealerId = ids.dealerId;
                    window.location.replace(`${host}/dealer/${roomId}/${dealerId}`);
                }
                else{
                    window.location.replace(`${host}/home/${ids.msg}`)
                    
                }
            })
            
        // window.location.replace(`${host}/dealer`)
    }
}

function enterRoom(){
    var enterRoomBtn = document.querySelector('.btn.btn-secondary')
    enterRoomBtn.addEventListener('click', function(){
        var roomId = document.querySelector('.input-group > input').value;
        var roomIdNumber = Number(roomId);
        if (Number.isNaN(roomIdNumber) == false && 
            roomId.length == 6 && 
            roomIdNumber > 0 && 
            Number.isInteger(roomIdNumber)){
            
                fetch(`${host}/enter_room/${roomIdNumber}`, option)
                .then(function(response){
                    return response.json();
                })
                .then(function(ids){
                    if (ids.roomId){
                        console.log(ids)
                        const roomId = ids.roomId;
                        const playerId = ids.playerId;
                        window.location.replace(`${host}/player/${roomId}/${playerId}`);
                        
                    }
                    else{

                        window.location.replace(`${host}/home/${ids.msg}`)
                    }
                })
                
            }
    })
}

function start(){
    createRoom();
    enterRoom();
    if (msg){
        alert(msg);
    }
}

start();