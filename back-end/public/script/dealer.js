const host = 'http://localhost:3000'

function checkConnection(){
    if (!dealerId && !roomId){
        window.location.replace(`${host}/home`)
    }
}