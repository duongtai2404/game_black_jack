(()=>{const e="https://xidzach-ltd.herokuapp.com",o={name:localStorage.getItem("name")},n={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)};document.getElementById("createRoom").onclick=()=>{fetch(`${e}/create_room`,n).then((function(e){return e.json()})).then((function(o){if(o.roomId){console.log(o);const n=o.roomId,t=o.dealerId;window.location.replace(`${e}/dealer/${n}/${t}`)}else window.location.replace(`${e}/home/${o.msg}`)}))},document.querySelector(".btn.btn-secondary").addEventListener("click",(function(){var o=document.querySelector(".input-group > input").value,t=Number(o);0==Number.isNaN(t)&&6==o.length&&t>0&&Number.isInteger(t)&&fetch(`${e}/enter_room/${t}`,n).then((function(e){return e.json()})).then((function(o){if(o.roomId){console.log(o);const n=o.roomId,t=o.playerId;window.location.replace(`${e}/player/${n}/${t}`)}else window.location.replace(`${e}/home/${o.msg}`)}))})),msg&&alert(msg)})();