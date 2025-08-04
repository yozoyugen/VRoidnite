const UTIL = require('./mUtil.module.js')

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

let ArrayBuild = {}; 
let build_id = 0;


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
          player.health = 100; //maxHealth;
          player.shield = 100; //maxShield;
          array_player[player.id] = player;
          console.log('array_player:', Object.keys(array_player).length);

          //let msg = "add-player " + player.id;
          //mBroadCastOthers(msg, ws);
          mBroadCastOthers(messageString, ws);

          if (ws.readyState === WebSocket.OPEN) {
            Object.values(array_player).forEach((player_) => {
              ws.send("add-player "+ player_.id+" "+player_.model_id);
              //ws.send(messageString);
            });

            Object.values(ArrayBuild).forEach((b) => {
              ws.send("add-init-build "+ b.buildType+" "+b.position.x+" "+b.position.y+" "+b.position.z
                      +" "+b.dirType+" "+b.player_id+" "+b.build_id+" "+b.health+" "+b.editType+" "+b.doorDir);
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
        case "playerDamaged":
          mPlayerDamaged(parts)
          break
        case "playerBuild":
          mPlayerBuild(messageString, parts)
          break
        case "buildDamaged":
          mBuildDamaged(parts)
          break
        case "playerEdit":
          mPlayerEdit(messageString, parts)
          break
        
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

function mPlayerDamaged(v){
  let id = parseInt(v[1]);
  let d = parseInt(v[2]);
  let p = array_player[id];
  if(p!=null){
    if(p.shield > 0){
      p.shield -= d;
      if(p.shield < 0){
          d = -p.shield;
          p.shield = 0.0;
      } else{
          d = 0.0;
      }
    }
    p.health -= d;
    p.health = Math.max(0.0, p.health);  

    let msg = "playerHealthChanged "+ p.id+" "+p.health+" "+p.shield+" "+true;
    mBroadCast(msg);

    if(p.health <= 0){
      //mPlayerDead(p) //-> do in client
      mRespawnPlayer(p);
    }

  }

}

function mRespawnPlayer(player){
    console.log("mRespawnPlayer:")
    setTimeout(() => {
        if(player!=null){
          player.shield = 100;
          player.health = 100;
          let msg = "playerRespawned "+ player.id;
          mBroadCast(msg); 
        }       
    }, 3000);
}

function mPlayerBuild(m, v){
  let buildType = parseInt(v[1]);
  let px = parseFloat(v[2]);
  let py = parseFloat(v[3]);
  let pz = parseFloat(v[4]);
  let dirType = v[5];
  let player_id = parseInt(v[6]);


  let b = new Object();
  b.build_id = build_id;
    let position = new Object();
    position.x = px;
    position.y = py;
    position.z = pz;
  b.position = position;
  b.player_id = player_id;
  b.buildType = buildType;
  b.dirType = dirType;
  b.health = 150;
  b.editType = 0;
  b.edgePoints = UTIL.mCreateBuildEdgePoints(b);
  b.connectedBuild = [];
  UTIL.mPickUpConnectedBuild(b, ArrayBuild);
  UTIL.mCheckBuildIsGrounded(b);

  if( UTIL.mCheckBuildIsUnique(b, ArrayBuild) ){
    let msg = m + " " + build_id;
    mBroadCast(msg); 

    //console.log("b:", b)
    ArrayBuild[build_id] = b;
    build_id += 1; 
  }

}

/*function mCreateBuildEdgePoints(b){
  let edgePoints = null;
  if(b.buildType==0){
    edgePoints = UTIL.mCreateWallEdgePoints(b.position.x, b.position.y, b.position.z, b.dirType);
  }else if(b.buildType==1){
    edgePoints = UTIL.mCreateFloorEdgePoints(b.position.x, b.position.y, b.position.z);
  }else if(b.buildType==2){
    edgePoints = UTIL.mCreateSlopeEdgePoints(b.position.x, b.position.y, b.position.z, b.dirType);
  }else if(b.buildType==3){
    edgePoints = UTIL.mCreateConeEdgePoints(b.position.x, b.position.y, b.position.z);
  }

  return edgePoints;
}*/

function mBuildDamaged(v){
  let id = parseInt(v[1]);
  let d = parseInt(v[2]);
  let b = ArrayBuild[id];
  if(b!=null){
    b.health -= d;
    
    if(b.health <= 0){
      //delete ArrayBuild[id];
      //let msg = "buildDestroy " + id;
      //mBroadCast(msg);
      mDestroyBuild(b)

    }else{
      let msg = "buildHealthChanged "+ id+" "+b.health;
      mBroadCast(msg);
    }

  }

}

function mDestroyBuild(b){
  if(b!=null){
    let c = b.connectedBuild.slice();
    delete ArrayBuild[b.build_id];
    let msg = "buildDestroy " + b.build_id;
    mBroadCast(msg);

    for(var i=0; i<c.length; i++){
        let b2 = ArrayBuild[c[i]];
        if( !UTIL.mCheckBuildRootIsGrounded(b2, ArrayBuild) ){
            setTimeout(() => {
                mDestroyBuild(b2)
            }, 500);
        }
    }    
  }
}

function mPlayerEdit(m, v){
  let player_id = parseInt(v[1]);
  let build_id = parseInt(v[2]);
  let editType = parseInt(v[3]);
  let dirType = v[4];
  let doorDir = parseInt(v[5]);  

  let b = ArrayBuild[build_id];
  if(b!=null){
    b.editType = editType;
    b.dirType = dirType;
    b.doorDir = doorDir;
    b.edgePoints = UTIL.mCreateBuildEdgePoints(b);
    
    mBroadCast(m);
  }

}
