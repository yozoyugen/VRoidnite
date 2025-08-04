
let mScale = 1;
let grid_size = mScale*5;
let gridH_size = mScale*4;
let buildThick = grid_size*0.04;
let slope_ang = Math.acos(grid_size / Math.sqrt(grid_size*grid_size+gridH_size*gridH_size) )
let grid_num = 10;
let tol = 1E-5;

function mCreateWallEdgePoints(px, py, pz, type="z", editType=0){
        
    let edgePoints = [];
    // origin -> build center
    let zEdgePoints = [
        grid_size/4, gridH_size/2, 0,
        -grid_size/4, gridH_size/2, 0,
        grid_size/4, -gridH_size/2, 0,
        -grid_size/4, -gridH_size/2, 0,
        grid_size/2, gridH_size/4, 0,
        grid_size/2, -gridH_size/4, 0,
        -grid_size/2, gridH_size/4, 0,
        -grid_size/2, -gridH_size/4, 0,
    ];
    let xEdgePoints = [
        0, gridH_size/2, grid_size/4, 
        0, gridH_size/2, -grid_size/4,
        0, -gridH_size/2, grid_size/4,
        0, -gridH_size/2, -grid_size/4,
        0, gridH_size/4, grid_size/2,
        0, -gridH_size/4, grid_size/2,
        0, gridH_size/4, -grid_size/2,
        0, -gridH_size/4, -grid_size/2,
    ];

    if(type == "z"){
        edgePoints = zEdgePoints;
    }else if(type == "x"){
        edgePoints = xEdgePoints;
    }

    for(var i=0; i<edgePoints.length/3; i++){
        edgePoints[i*3+0] += px;
        edgePoints[i*3+1] += py;
        edgePoints[i*3+2] += pz;
    }

    return edgePoints;
}

function mCreateFloorEdgePoints(px, py, pz, editType=0){
        
    // origin -> build center
    let edgePoints = [
        grid_size/2, 0, -grid_size/4, 
        grid_size/2, 0, grid_size/4, 
        -grid_size/2, 0, -grid_size/4, 
        -grid_size/2, 0, grid_size/4, 
        grid_size/4, 0, -grid_size/2,
        -grid_size/4, 0, -grid_size/2,
         grid_size/4, 0, grid_size/2,
        -grid_size/4, 0, grid_size/2,
    ];
    
    for(var i=0; i<edgePoints.length/3; i++){
        edgePoints[i*3+0] += px;
        edgePoints[i*3+1] += py;
        edgePoints[i*3+2] += pz;
    }

    return edgePoints;
}

function mCreateSlopeEdgePoints(px, py, pz, type="z-", editType=-1){
    
    let edgePoints = [];
    // origin -> build center
    // bottom x 2, top x 2, left x 2, right x 2
    let zmEdgePoints = [
        -grid_size/4, -gridH_size/2, grid_size/2,
        grid_size/4, -gridH_size/2, grid_size/2,
        -grid_size/4, gridH_size/2, -grid_size/2,
        grid_size/4, gridH_size/2, -grid_size/2,
        -grid_size/2, -gridH_size/4, grid_size/4,
        -grid_size/2, gridH_size/4, -grid_size/4,
        grid_size/2, -gridH_size/4, grid_size/4,
        grid_size/2, gridH_size/4, -grid_size/4,
    ];

    let T = [1, 0, 0,
             0, 1, 0,
             0, 0, 1];
    if(type == "z+"){
        T = [-1, 0, 0,
             0, 1, 0,
             0, 0, -1];
    }else if(type == "x-"){
        T = [0, 0, 1,
             0, 1, 0,
             -1, 0, 0];
    }else if(type == "x+"){
        T = [0, 0, -1,
             0, 1, 0,
             1, 0, 0];
    }

    let m = new Array(3*8).fill(0);
    for(var i=0; i<8; i++){
        m[i*3+0] = T[0]*zmEdgePoints[i*3+0]
                  +T[1]*zmEdgePoints[i*3+1]
                  +T[2]*zmEdgePoints[i*3+2];
        m[i*3+1] = T[3]*zmEdgePoints[i*3+0]
                  +T[4]*zmEdgePoints[i*3+1]
                  +T[5]*zmEdgePoints[i*3+2];
        m[i*3+2] = T[6]*zmEdgePoints[i*3+0]
                  +T[7]*zmEdgePoints[i*3+1]
                  +T[8]*zmEdgePoints[i*3+2];
    }

    let idx = [0, 1, 2, 3, 4, 5, 6, 7]; // no editType 
    if(editType>=0 && editType<=3){

    }else if(editType==4 || editType==6 || editType==8 || editType==10 ){
        // right half
        idx = [1, 3, 6, 7];
    }else if(editType==5 || editType==7 || editType==9 || editType==11 ){
        // left half
        idx = [0, 2, 4, 5];
    }

    for(var i=0; i<idx.length; i++){
        edgePoints.push(m[idx[i]*3+0]);
        edgePoints.push(m[idx[i]*3+1]);
        edgePoints.push(m[idx[i]*3+2]);
    }

    for(var i=0; i<edgePoints.length/3; i++){
        edgePoints[i*3+0] += px;
        edgePoints[i*3+1] += py;
        edgePoints[i*3+2] += pz;
    }

    return edgePoints;
}

function mCreateConeEdgePoints(px, py, pz, editType=0){
    // z-x plane    

    // origin -> build center
    let ep = [  //edgePoints     // x-, x+, z-, z+
        -grid_size/2, -gridH_size/2, -grid_size/4, // x-
        -grid_size/2, -gridH_size/2, grid_size/4,  // x-
        grid_size/2, -gridH_size/2, -grid_size/4,  // x+
        grid_size/2, -gridH_size/2, grid_size/4,   // x+
        grid_size/4, -gridH_size/2, -grid_size/2,  // z-
        -grid_size/4, -gridH_size/2, -grid_size/2, // z-
        -grid_size/4, -gridH_size/2, grid_size/2,  // z+
        -grid_size/4, -gridH_size/2, grid_size/2,  // z+
    ];

    let edgePoints = [];
    //let idx = [0, 1, 2, 3, 4, 5, 6, 7]; // no editType 
    let T = [1, 0, 0,
             0, 1, 0,
             0, 0, 1];

    if(editType==0){
        edgePoints = ep;
    }else if(editType>=1 && editType<=4){
        edgePoints = [
         grid_size/2, -gridH_size/2, -grid_size/4, // x+
         grid_size/2, -gridH_size/2, grid_size/4,  // x+
        -grid_size/4, -gridH_size/2, grid_size/2,  // z+
         grid_size/4, -gridH_size/2, grid_size/2,  // z+
         grid_size/4, -gridH_size/4, -grid_size/2,  // z-
        -grid_size/4,  gridH_size/4, -grid_size/2,  // z-
        -grid_size/2,  gridH_size/4, -grid_size/4,  // x-
        -grid_size/2, -gridH_size/4,  grid_size/4,  // x-
        ];
        if(editType==2){
            T = [0, 0, 1,
                 0, 1, 0,
                -1, 0, 0];
        }else if(editType==3){
            T = [0, 0, -1,
                 0, 1, 0,
                 1, 0, 0];
        }else if(editType==4){
            T = [-1, 0, 0,
                  0, 1, 0,
                  0, 0, -1];
        }

    }else if(editType>=5 && editType<=8){
        // x- slope
        edgePoints = [
        -grid_size/2,  gridH_size/2, -grid_size/4,  // x-
        -grid_size/2,  gridH_size/2,  grid_size/4,  // x-
         grid_size/2, -gridH_size/2, -grid_size/4, // x+
         grid_size/2, -gridH_size/2, grid_size/4,  // x+
         grid_size/4, -gridH_size/4, grid_size/2,  // z+
        -grid_size/4,  gridH_size/4, grid_size/2,  // z+
         grid_size/4, -gridH_size/4, -grid_size/2,  // z-
        -grid_size/4,  gridH_size/4, -grid_size/2,  // z-
        ];
        if(editType==8){ // +90
            T = [0, 0, 1,
                 0, 1, 0,
                -1, 0, 0];
        }else if(editType==7){
            T = [0, 0, -1,
                 0, 1, 0,
                 1, 0, 0];
        }else if(editType==6){
            T = [-1, 0, 0,
                  0, 1, 0,
                  0, 0, -1];
        }

    }else if(editType==9 || editType==10){
        edgePoints = [
        -grid_size/2,  gridH_size/4, -grid_size/4,  // x-
        -grid_size/2, -gridH_size/4,  grid_size/4,  // x-
         grid_size/2, -gridH_size/4, -grid_size/4, // x+
         grid_size/2,  gridH_size/4, grid_size/4,  // x+
         grid_size/4,  gridH_size/4, grid_size/2,  // z+
        -grid_size/4, -gridH_size/4, grid_size/2,  // z+
         grid_size/4, -gridH_size/4, -grid_size/2,  // z-
        -grid_size/4,  gridH_size/4, -grid_size/2,  // z-
        ];
        if(editType==10){
            T = [0, 0, 1,
                 0, 1, 0,
                -1, 0, 0];
        }

    }else if(editType>=11 && editType<=14){
        edgePoints = [
        -grid_size/2, -gridH_size/4, -grid_size/4,  // x-
        -grid_size/2,  gridH_size/4,  grid_size/4,  // x-
         grid_size/2,  gridH_size/2, -grid_size/4, // x+
         grid_size/2,  gridH_size/2, grid_size/4,  // x+
         grid_size/4,  gridH_size/2, grid_size/2,  // z+
        -grid_size/4,  gridH_size/2, grid_size/2,  // z+
         grid_size/4,  gridH_size/4, -grid_size/2,  // z-
        -grid_size/4, -gridH_size/4, -grid_size/2,  // z-
        ];
        if(editType==12){
            T = [0, 0, 1,
                 0, 1, 0,
                -1, 0, 0];
        }else if(editType==13){
            T = [0, 0, -1,
                 0, 1, 0,
                 1, 0, 0];
        }else if(editType==14){
            T = [-1, 0, 0,
                  0, 1, 0,
                  0, 0, -1];
        }
    }

    //for(var i=0; i<idx.length; i++){
    //    edgePoints.push(m[idx[i]*3+0]);
    //    edgePoints.push(m[idx[i]*3+1]);
    //    edgePoints.push(m[idx[i]*3+2]);
    //}

    for(var i=0; i<edgePoints.length/3; i++){
        let x = T[0]*edgePoints[i*3+0]
               +T[1]*edgePoints[i*3+1]
               +T[2]*edgePoints[i*3+2];
        let y = T[3]*edgePoints[i*3+0]
               +T[4]*edgePoints[i*3+1]
               +T[5]*edgePoints[i*3+2];
        let z = T[6]*edgePoints[i*3+0]
               +T[7]*edgePoints[i*3+1]
               +T[8]*edgePoints[i*3+2];
        edgePoints[i*3+0] = x;
        edgePoints[i*3+1] = y;
        edgePoints[i*3+2] = z;
    }
    
    for(var i=0; i<edgePoints.length/3; i++){
        edgePoints[i*3+0] += px;
        edgePoints[i*3+1] += py;
        edgePoints[i*3+2] += pz;
    }

    return edgePoints;
}

function mCreateBuildEdgePoints(b){
  let edgePoints = null;
  if(b.buildType==0){
    edgePoints = mCreateWallEdgePoints(b.position.x, b.position.y, b.position.z, b.dirType);
  }else if(b.buildType==1){
    edgePoints = mCreateFloorEdgePoints(b.position.x, b.position.y, b.position.z);
  }else if(b.buildType==2){
    edgePoints = mCreateSlopeEdgePoints(b.position.x, b.position.y, b.position.z, b.dirType);
  }else if(b.buildType==3){
    edgePoints = mCreateConeEdgePoints(b.position.x, b.position.y, b.position.z);
  }

  return edgePoints;
}



function mCheckBuildIsUnique(build, ArrayBuild_){
    let judge = true;

    Object.values(ArrayBuild_).forEach((v) => {
        //n += 1;
        //if(v!=null && v.buildMesh!=null){
        //    let b = v.buildMesh;
            //console.log("b:", b.buildType);  

        if(v!=null){
            let b = v;
            if( b.position.x == build.position.x && b.position.y == build.position.y &&  b.position.z == build.position.z ){
                //b.buildType == build.buildType &&
                    judge = false;
                    //console.log("b:", b);  
                    //break
                    return judge;
            }
        }
        
    })
    //console.log("mCheckBuildIsUnique:", judge);
    //console.log("n:", n);
    //console.log("n:", Object.keys(ArrayBuild).length);
    return judge;
}

function mCheckBuildIsConnected(build, ArrayBuild_){
    let judge = false;
    //build.isGrounded = false;
    if(build.position.y <= gridH_size/2){
        judge = true;
        //build.isGrounded = true;
        return judge;
    }

    let e = build.edgePoints;
    if(e==null){
        return judge;
    }
    //console.log("e:", e);  

    Object.values(ArrayBuild_).forEach((v) => {
        if(v!=null && v.edgePoints!=null){
            let p = v.edgePoints;
            
            for(var i=0; i<e.length/3; i++){
                let ex = e[i*3+0];
                let ey = e[i*3+1];
                let ez = e[i*3+2];
                for(var j=0; j<p.length/3; j++){
                    let px = p[j*3+0];
                    let py = p[j*3+1];
                    let pz = p[j*3+2];
                    let d = Math.sqrt((ex-px)*(ex-px)+(ey-py)*(ey-py)+(ez-pz)*(ez-pz));
                    //console.log("v:", v);  
                    if( d < 0.001){
                        judge = true;
                        return judge;
                    }
                }
            }
        }
        
    })

    return judge;
}

function mPickUpConnectedBuild(build, ArrayBuild_){
    
    let e = build.edgePoints;
    if(e==null){
        return;
    }
    //console.log("e:", e);  
    let a = [];

    Object.values(ArrayBuild_).forEach((v) => {
        if(v!=null && v.edgePoints!=null){
            let p = v.edgePoints;
            
            let c = false;

            for(var i=0; i<e.length/3; i++){
                let ex = e[i*3+0];
                let ey = e[i*3+1];
                let ez = e[i*3+2];
                for(var j=0; j<p.length/3; j++){
                    let px = p[j*3+0];
                    let py = p[j*3+1];
                    let pz = p[j*3+2];
                    let d = Math.sqrt((ex-px)*(ex-px)+(ey-py)*(ey-py)+(ez-pz)*(ez-pz));
                    //console.log("v:", v);  
                    if( d < 0.001){
                        a.push(v.build_id);
                        v.connectedBuild.push(build.build_id)
                        c = true;
                        break;
                    }
                }
                if(c){
                    break;
                }
            }
        }    
    })

    build.connectedBuild = a;
}

function mCheckBuildIsGrounded(build){
    let judge = false;
    build.isGrounded = false;
    if(build.position.y <= gridH_size/2){
        judge = true;
        build.isGrounded = true;
        return judge;
    }

    // For terrain

}

function mCheckBuildRootIsGrounded(build, ArrayBuild_){

    if(build==null){
        return
    }
    //console.log("mCheckBuildRootIsGrounded:", build);

    let isGrounded = false;

    if(build.isGrounded){
        isGrounded = true;
        return isGrounded;
    }

    let c = build.connectedBuild.slice();
    c = Array.from(new Set(c));

    let count_ = 0;
    let roop_ = true;
    while(roop_){
        count_ += 1;
        let n0 = c.length;
        for(var i=0; i<n0; i++){
            if(ArrayBuild_[c[i]]==null){
                continue;
            }
            c.push(...ArrayBuild_[c[i]].connectedBuild)
        }
        c = Array.from(new Set(c));
        let n1 = c.length;
        if(n0 == n1){
            break;
        }
        if(count_>=100){
            break;
        }
    }
    //console.log("c:", c);

    //let isGrounded = false;
    for(var i=0; i<c.length; i++){
        let b = ArrayBuild_[c[i]];
        if(b==null){
            continue;
        }
        if(b.isGrounded){
            isGrounded = true;
            break;
        }

    }

    //console.log("isGrounded:", isGrounded);
    return isGrounded;
}



export { 
    mCreateWallEdgePoints,
    mCreateFloorEdgePoints,
    mCreateSlopeEdgePoints,
    mCreateConeEdgePoints,
    mCreateBuildEdgePoints,
    mCheckBuildIsUnique,
    mCheckBuildIsConnected,
    mPickUpConnectedBuild,
    mCheckBuildIsGrounded,
    mCheckBuildRootIsGrounded,
 };