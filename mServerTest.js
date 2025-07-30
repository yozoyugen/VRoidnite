const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

app.get('/', (request, response) => {
  //response.setHeader('Access-Control-Allow-Origin', '*')
  //response.sendFile(path.join(__dirname, '/mClientTest.html'));
  response.sendFile(path.join(__dirname, '/mVRoidniteClient.html'));
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = [];
let array_player = {};


wss.on('connection', (ws) => {
  clients.push(ws);
  console.log('クライアントが接続しました');

  ws.on('message', (message) => {
    const messageString = message.toString();
    //console.log("Message:", messageString);
    
    /*clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });*/

  let str = messageString
  str = str.replaceAll("[", "")
  str = str.replaceAll("]", "")
  //console.log('str:'+str);
  var parts = str.split(" ")

    //if(messageString==="websocket-open"){
    //  ws.send("websocket-open")
    //}


    switch( parts[0] ){
        case "websocket-open":
          ws.send("websocket-open")
          break

        case "add-player":
          console.log('add-player:'+[parts[1], +parts[2]]);
          let player = new Object();
          player.s = ws;
          player.id = parts[1];
          player.model_id = parts[2];
          //array_player.push(parts[1])
          //array_player.push(player)
          array_player[player.id] = player;

          //let msg = "add-player " + player.id;
          //mBroadCastOthers(msg, ws);
          mBroadCastOthers(messageString, ws);

          if (ws.readyState === WebSocket.OPEN) {
            //array_player.forEach((player_) => {
            //    ws.send("add-player "+ player_.id);
            //});
            Object.values(array_player).forEach((player_) => {
              ws.send("add-player "+ player_.id+" "+player_.model_id);
              //ws.send(messageString);
            });
          }
          
          break

        case "playerMove":
          mBroadCastOthers(messageString, ws)
          //mBroadCast(messageString)
          break        
        case "playerAngle":
          mBroadCastOthers(messageString, ws)
          break
        case "playerGrounded":
          mBroadCastOthers(messageString, ws)
          break
        //case "playerCrouch":
        //  mBroadCastOthers(messageString, ws)
        //  break
        
        default:
          //console.log('default:'+messageString);
          mBroadCastOthers(messageString, ws)

    }//    


  });

  ws.on('close', () => {
    const index = clients.indexOf(ws);
    if (index !== -1) {
      clients.splice(index, 1);
    }
    let id = -1;
    /*array_player.forEach((player_) => {
      if(player_.s === ws){
        let i = array_player.indexOf(player_);
        id = player_.id;
        //console.log('player.id:', player_.id);
        if (i !== -1) {
          array_player.splice(i, 1);
        }
      }
    });*/
    Object.values(array_player).forEach((player) => {
      if(player.s === ws){
        id = player.id;
      }
    });
    delete array_player[id];
    console.log('Client disconnected:', id);
    console.log('array_player:', Object.keys(array_player).length);

    let msg = "delete-player " + id;
    mBroadCastOthers(msg, ws);
  });
});

// サーバーの起動
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});

function mBroadCast(msg){
  clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
}

function mBroadCastOthers(msg, s){
  clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        if (client === s) {
        }
        else{
          client.send(msg);
        }
      }
    });
}