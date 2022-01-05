//This is the part that does the actual work of separating objects
//Create a board with just 0s in it
var createblankboard=function(){
  var board=[];
  for(var i=0;i<50;i++){
    var row=[];
    for(var j=0;j<100;j++){
      row.push(0);
    }
    board.push(row);
  }
  return board;
};
//Print a board to console, honestly more for debugging purposes than for anything else
var ls=".o123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz";
var renderboard=function(board){
  for(var i=0;i<50;i++){
    var row="";
    for(var j=0;j<100;j++){
      var c=board[i][j];
      if(c[0]!==undefined){
        c=c[0]//+c[1]+c[2];
        while(c<1){
          c+=ls.length-1;
        }
      }
      if(c>0){
        c=c%(ls.length-1);
        c+=1;
      }
      if(c>=0){
        row+=ls[c];
      }else if(c===-1){
        row+="-";
      }else if(c===-2){
        row+="+";
      }else{
        row+="|";
      }
    }
    console.log(row);
  }
  console.log("");
};
//Step a 0-1 board
var step=function(board){
  var horizontalsums=[];
  for(var i=0;i<50;i++){
    horizontalsums.push([]);
    var sum=board[i][98]+board[i][99]+board[i][0];
    for(var j=0;j<100;j++){
      sum-=board[i][(j+98)%100];
      sum+=board[i][(j+1)%100];
      horizontalsums[i].push(sum);
    }
  }
  var verticalsums=[];
  for(var i=0;i<100;i++){
    verticalsums.push([]);
    var sum=horizontalsums[48][i]+horizontalsums[49][i]+horizontalsums[0][i];
    for(var j=0;j<50;j++){
      sum-=horizontalsums[(j+48)%50][i];
      sum+=horizontalsums[(j+1)%50][i];
      verticalsums[i].push(sum);
    }
  }//Now for counting neighbors, we only have to spend around 4 operations per cell, not 8.
  var stepped=[];
  for(var i=0;i<50;i++){
    var row=[];
    for(var j=0;j<100;j++){
      var sum=verticalsums[j][i];
      if(sum<=2||sum>=5){
        row.push(0);//D0 to D1, D4 to D8, A0 to A2, A5 to A8
      }else if(sum===3){
        row.push(1);//S2, B3
      }else{
        row.push(board[i][j]);//S3, A4
      }
    }
    stepped.push(row);
  }
  return stepped;
};
//Step a board that's colored, assuming that all colors involved point to themselves
var stepcolorboard=function(board){
  var stepped=createblankboard();
  for(var i0=0;i0<50;i0++){
    var il=(i0+49)%50;
    var ir=(i0+1)%50;
    for(var j0=0;j0<100;j0++){
      var jl=(j0+99)%100;
      var jr=(j0+1)%100;
      //We can't use prefix sums here-is 32 8+8+8+8 or 4+4+4+4+4+4+4+4?
      var cll=board[il][jl];
      var cl0=board[il][j0];
      var clr=board[il][jr];
      var c0l=board[i0][jl];
      var c0r=board[i0][jr];
      var crl=board[ir][jl];
      var cr0=board[ir][j0];
      var crr=board[ir][jr];
      var neighbors=0;
      neighbors+=(cll>0);
      neighbors+=(cl0>0);
      neighbors+=(clr>0);
      neighbors+=(c0l>0);
      neighbors+=(c0r>0);
      neighbors+=(crl>0);
      neighbors+=(cr0>0);
      neighbors+=(crr>0);
      if(neighbors<2||neighbors>3){//Always dead
        continue;
      }
      var c00=board[i0][j0];
      if(neighbors===2||(neighbors==3&&c00)){//S23
        stepped[i0][j0]=c00;
        continue;
      }
      //Check five neighbors
      if(cll){
        stepped[i0][j0]=cll;
      }else if(cl0){
        stepped[i0][j0]=cl0;
      }else if(clr){
        stepped[i0][j0]=clr;
      }else if(c0l){
        stepped[i0][j0]=c0l;
      }else if(c0r){
        stepped[i0][j0]=c0r;
      }else{//If 5 neighbors are off in a B3 situation, then the other three must be on
        stepped[i0][j0]=crl;
      }
    }
  }
  return stepped;
};
//Step a board with color-bispecters, assuming that all colors involved point to themselves
var stepcolorbispecterboard=function(board){
  var stepped=createblankboard();
  for(var i0=0;i0<50;i0++){
    var il=(i0+49)%50;
    var ir=(i0+1)%50;
    for(var j0=0;j0<100;j0++){
      var jl=(j0+99)%100;
      var jr=(j0+1)%100;
      //We can't use prefix sums on arrays
      var cll=board[il][jl];
      var cl0=board[il][j0];
      var clr=board[il][jr];
      var c0l=board[i0][jl];
      var c0r=board[i0][jr];
      var crl=board[ir][jl];
      var cr0=board[ir][j0];
      var crr=board[ir][jr];
      var neighbors=0;
      neighbors+=(cll!==0);
      neighbors+=(cl0!==0);
      neighbors+=(clr!==0);
      neighbors+=(c0l!==0);
      neighbors+=(c0r!==0);
      neighbors+=(crl!==0);
      neighbors+=(cr0!==0);
      neighbors+=(crr!==0);
      if(neighbors<2||neighbors>3){//Always dead
        continue;
      }
      var c00=board[i0][j0];
      if(neighbors===2||(neighbors==3&&c00[0])){//S23
        stepped[i0][j0]=c00;
        continue;
      }
      //Check five neighbors
      if(cl0!==0){
        var cbs=[cl0[0],cl0[1]+1,cl0[2]];
        stepped[i0][j0]=cbs;
      }else if(cr0!==0){
        var cbs=[cr0[0],cr0[1]-1,cr0[2]];
        stepped[i0][j0]=cbs;
      }else if(c0l!==0){
        var cbs=[c0l[0],c0l[1],c0l[2]+1];
        stepped[i0][j0]=cbs;
      }else if(c0r!==0){
        var cbs=[c0r[0],c0r[1],c0r[2]-1];
        stepped[i0][j0]=cbs;
      }else if(cll!==0){
        var cbs=[cll[0],cll[1]+1,cll[2]+1];
        stepped[i0][j0]=cbs;
      }else{//If 5 neighbors are off in a B3 situation, then the other three must be on
        var cbs=[crr[0],crr[1]-1,crr[2]-1];
        stepped[i0][j0]=cbs;
      }
    }
  }
  return stepped;
};
//Step grid (AKA a list of cell positions)
var stepgrid=function(grid){//Use the Cobalt algorithm: Count neighbors with a map
  var neighborsmap={};
  var neighborslist=[];
  var gridindex={};//We need to put our grid into a map to quickly check for membership in the original grid
  for(var i=0;i<grid.length;i++){
    var cell=grid[i];
    gridindex[cell]=1;
    var cll=[cell[0]-1,cell[1]-1];
    var cl0=[cell[0]-1,cell[1]];
    var clr=[cell[0]-1,cell[1]+1];
    var c0l=[cell[0],cell[1]-1];
    var c0r=[cell[0],cell[1]+1];
    var crl=[cell[0]+1,cell[1]-1];
    var cr0=[cell[0]+1,cell[1]];
    var crr=[cell[0]+1,cell[1]+1];
    if(!neighborsmap[cll]){//(Index and list) unindexed cells
      neighborsmap[cll]=0;
      neighborslist.push(cll);
    }
    if(!neighborsmap[cl0]){
      neighborsmap[cl0]=0;
      neighborslist.push(cl0);
    }
    if(!neighborsmap[clr]){
      neighborsmap[clr]=0;
      neighborslist.push(clr);
    }
    if(!neighborsmap[c0l]){
      neighborsmap[c0l]=0;
      neighborslist.push(c0l);
    }
    if(!neighborsmap[c0r]){
      neighborsmap[c0r]=0;
      neighborslist.push(c0r);
    }
    if(!neighborsmap[crl]){
      neighborsmap[crl]=0;
      neighborslist.push(crl);
    }
    if(!neighborsmap[cr0]){
      neighborsmap[cr0]=0;
      neighborslist.push(cr0);
    }
    if(!neighborsmap[crr]){
      neighborsmap[crr]=0;
      neighborslist.push(crr);
    }
    neighborsmap[cll]+=1;
    neighborsmap[cl0]+=1;
    neighborsmap[clr]+=1;
    neighborsmap[c0l]+=1;
    neighborsmap[c0r]+=1;
    neighborsmap[crl]+=1;
    neighborsmap[cr0]+=1;
    neighborsmap[crr]+=1;
  }
  var stepped=[];
  for(var i=0;i<neighborslist.length;i++){
    var cell=neighborslist[i];
    var neighbors=neighborsmap[cell];
    if(neighbors<2||neighbors>3){//0145678->dead
      continue;
    }else if(neighbors===3){//3->alive
      stepped.push(cell);
    }else{//2->old state
      if(gridindex[cell]){
        stepped.push(cell);
      }
    }
  }
  return stepped;
};
//This applies a shift so that the leftmost cells have x-coordinate 0, and the topmost cells have y-coordinate 0.
var normalize=function(grid){
  var minx=Infinity;
  var miny=Infinity;
  for(var i=0;i<grid.length;i++){
    var cell=grid[i];
    minx=Math.min(minx,cell[0]);
    miny=Math.min(miny,cell[1]);
  }
  var normalized=[];
  for(var i=0;i<grid.length;i++){
    var cell=grid[i];
    normalized.push([cell[0]-minx,cell[1]-miny]);
  }
  return normalized;
};
//Put a grid onto a board (not necessarily 100x50)
var g2b=function(grid){
  grid=normalize(grid);
  var maxx=0;
  var maxy=0;
  for(var i=0;i<grid.length;i++){
    var cell=grid[i];
    maxx=Math.max(maxx,cell[0]);
    maxy=Math.max(maxy,cell[1]);
  }
  var board=[];
  for(var i=0;i<=maxy;i++){
    var row=[];
    for(var j=0;j<=maxx;j++){
      row.push(0);
    }
    board.push(row);
  }
  for(var i=0;i<grid.length;i++){
    var cell=grid[i];
    board[cell[1]][cell[0]]=1;
  }
  return board;
}
//This helps get the canonical apgcode
var compareapg=function(apgl,apgr){
  if(apgl==="OVERSIZED"){//Favor actual encodings over "oh no it's too big in this generation"
    return apgr;
  }else if(apgr==="OVERSIZED"){
    return apgl;
  }
  if(apgl.length<apgr.length){//Favor shorter encodings
    return apgl;
  }else if(apgl.length>apgr.length){
    return apgr;
  }
  for(var i=0;i<apgl.length;i++){
    var l=apgl[i];
    var r=apgr[i];
    if(l<r){//Failing that, favor encodings that come earlier in alphabetical order
      return apgl;
    }else if(l>r){
      return apgr;
    }
  }
  return apgl;
};
//Merge zeroes
var b32="0123456789abcdefghijklmnopqrstuv";
var merge0s=function(apg){
  var merged="";
  var i=0;
  while(i<apg.length){
    var char=apg[i];
    if(char!=="0"){
      merged+=char;
      i+=1;
    }else{
      var zeroes=0;
      while(apg[i]==="0"){
        zeroes+=1;
        i+=1;//We can't run off the end of the string because apg won't end with a 0. apg won't end with a 0 since we already stripped off all trailing zeroes in each row.
      }
      if(zeroes<3){
        if(zeroes===1){
          merged+="0";
        }else{//zeroes===2
          merged+="w";
        }
      }else{
        if(zeroes===3){
          merged+="x";
        }else{//4<=zeroes<=39
          merged+="y"+b32[zeroes-4];
        }
      }
    }
  }
  return merged;
};
//Get an apgcode representation (without prefix) for a particular board, assuming that it's a still life
var apgcode=function(board){
  var h=board.length;
  var w=board[0].length;
  if(h>40||w>40){//Patterns larger than 40x40 are oversized
    return "OVERSIZED";
  }
  var apgrd=[];//Left-to-right, top-down
  var apgld=[];//Right-to-left, top-down
  var apgru=[];//Left-to-right, bottom-up
  var apglu=[];//Right-to-left, bottom-up
  for(var i=0;i<h;i+=5){
    var rowrd=[];
    var rowld=[];
    var rowru=[];
    var rowlu=[];
    var stripd=[];
    var stripu=[];
    for(var n=4;n>=0;n--){
      var rowd=board[i+n];
      rowd=(rowd===undefined)?[]:rowd;
      stripd.push(rowd);
      var rowu=board[h-1-i-n];
      rowu=(rowu===undefined)?[]:rowu;
      stripu.push(rowu);
    }
    for(var j=0;j<w;j++){
      var crd;
      var cru;
      var nrd=0;
      var nru=0;
      for(var n=0;n<5;n++){
        crd=stripd[n][j];
        cru=stripu[n][j];
        crd=(crd===undefined)?0:crd;
        cru=(cru===undefined)?0:cru;
        nrd*=2;
        nru*=2;
        nrd+=crd;
        nru+=cru;
      }
      rowrd.push(b32[nrd]);
      rowru.push(b32[nru]);
    }
    //Before stripping zeroes, we can reverse rowrx to get the rowlx representations
    for(var j=0;j<w;j++){
      rowld.push(rowrd[w-1-j]);
      rowlu.push(rowru[w-1-j]);
    }
    while(rowrd[rowrd.length-1]==="0"){
      rowrd.pop();
    }
    while(rowld[rowld.length-1]==="0"){
      rowld.pop();
    }
    while(rowru[rowru.length-1]==="0"){
      rowru.pop();
    }
    while(rowlu[rowlu.length-1]==="0"){
      rowlu.pop();
    }
    apgrd.push(rowrd.join(""));
    apgld.push(rowld.join(""));
    apgru.push(rowru.join(""));
    apglu.push(rowlu.join(""));
  }
  apgrd=apgrd.join("z");
  apgld=apgld.join("z");
  apgru=apgru.join("z");
  apglu=apglu.join("z");
  var apgdr=[];//Top-down, left-to-right
  var apgdl=[];//Top-down, right-to-left
  var apgur=[];//Bottom-up, left-to-right
  var apgul=[];//Bottom-up, right-to-left
  for(var j=0;j<w;j+=5){
    var rowdr=[];
    var rowdl=[];
    var rowur=[];
    var rowul=[];
    for(var i=0;i<h;i++){
      var ndr=0;
      var ndl=0;
      for(var n=4;n>=0;n--){
        var cdr=board[i][j+n];
        var cdl=board[i][w-1-j-n];
        cdr=(cdr===undefined)?0:cdr;
        cdl=(cdl===undefined)?0:cdl;
        ndr*=2;
        ndl*=2;
        ndr+=cdr;
        ndl+=cdl;
      }
      rowdr.push(b32[ndr]);
      rowdl.push(b32[ndl]);
    }
    //Before stripping zeroes, we can reverse rowdx to get the rowux representations
    for(var i=0;i<h;i++){
      rowur.push(rowdr[h-1-i]);
      rowul.push(rowdl[h-1-i]);
    }
    while(rowdr[rowdr.length-1]==="0"){
      rowdr.pop();
    }
    while(rowdl[rowdl.length-1]==="0"){
      rowdl.pop();
    }
    while(rowur[rowur.length-1]==="0"){
      rowur.pop();
    }
    while(rowul[rowul.length-1]==="0"){
      rowul.pop();
    }
    apgdr.push(rowdr.join(""));
    apgdl.push(rowdl.join(""));
    apgur.push(rowur.join(""));
    apgul.push(rowul.join(""));
  }
  apgdr=apgdr.join("z");
  apgdl=apgdl.join("z");
  apgur=apgur.join("z");
  apgul=apgul.join("z");
  apgrd=merge0s(apgrd);
  apgld=merge0s(apgld);
  apgru=merge0s(apgru);
  apglu=merge0s(apglu);
  apgdr=merge0s(apgdr);
  apgdl=merge0s(apgdl);
  apgur=merge0s(apgur);
  apgul=merge0s(apgul);
  var min=apgrd;
  min=compareapg(min,apgld);
  min=compareapg(min,apgru);
  min=compareapg(min,apglu);
  min=compareapg(min,apgdr);
  min=compareapg(min,apgdl);
  min=compareapg(min,apgur);
  min=compareapg(min,apgul);
  return min;
};
//Print a grid to console, also for debugging purposes
var rendergrid=function(grid){
  var board=g2b(grid);
  for(var i=0;i<=maxy;i++){
    var row="";
    for(var j=0;j<=maxx;j++){
      row+=".o"[board[i][j]];
    }
    console.log(row);
  }
  console.log("");
};
//Color pointer stuff, to make it easier to merge colors
var colorpointers=[];
var p2c=function(n){//Pointer to color
  var m=n;
  var p=colorpointers[n];
  if(p!==n){
    m=p2c(p);//The recursion here means that all levels of recursion (the entire path) will see the end result, and then the path will be shortened to a single step.
    colorpointers[n]=m;
  }
  return m;
};
//Color-bispectral pointers. A color-bispecter takes the form [c,x,y], where x and y are grid coordinates. Since x and y can go on infinitely in 2D, a color-bispecter is part of a color-bispectrum. This draws an analogy to real-life spectrums, where the possible range of colors can go on infinitely. Of course, there are only 5000 colors in this program. The pointers here actually represent shift transformations.
var pxy2cxy=function(nxy){
  if(!nxy){
    return [0,0,0];
  }
  var mxy=[nxy[0],nxy[1],nxy[2]];
  var pxy=colorpointers[nxy[0]];
  if(pxy[0]!==nxy[0]){//If these are the same, then the xy offsets should be both 0 anyways
    var dcxy=pxy2cxy(pxy);
    colorpointers[nxy[0]]=dcxy;
    mxy=[dcxy[0],mxy[1]+dcxy[1],mxy[2]+dcxy[2]];//In this case, the xy is an offset, so they add
  }
  return mxy;
};
var mergecxys=function(axy,bxy){//axy and bxy are both color-bispecters, but are additionally marked with board coordinates. We assume that there is an actual interaction, so that relative board position=relative grid position. We also assume that axy[0]<=bxy[0] unless bxy[0]=0, as axy is supposed to have the minimum nonzero color here.
  if(bxy[0]===0){//Nothing to do here
    return true;
  }
  var dc=bxy[0]-axy[0];
  //dxy is the relative board position of bxy from the perspective of axy, so that axy+dxy=bxy for board coordinates
  //Let's just use separate dx and dy variables though
  var dx=bxy[3]-axy[3];
  var dy=bxy[4]-axy[4];
  if(dc===0){//The colors are equal
    //If the pattern is finite, then axy+dxy=bxy will hold up if axy and bxy are grid coordinates. If this doesn't hold up, we have an infinite pattern.
    return (axy[1]+dx===bxy[1])&&(axy[2]+dy===bxy[2]);
  }else if(dc>0){//bxy->axy
    //We construct the color-bispectral pointer by finding the right xy offset for turning b-coordinates into a-coordinates
    var cxy=[axy[0],axy[1]+dx-bxy[1],axy[2]+dy-bxy[2]];
    colorpointers[bxy[0]]=cxy;
  }else{//axy->bxy, this code shouldn't ever be executed provided that the program is unmodified
    var cxy=[bxy[0],bxy[1]-axy[1]-dx,bxy[2]-axy[2]-dy];
    colorpointers[axy[0]]=cxy;
  }
  return true;
};
//Merge colors that interact
var interactions0=[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,1,1,1,0,1,0,1,1,0,0,0,1,0,0,0,0,0,1,0,1,1,1,0,0,0,0,1,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,0,1,1,1,1,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,1,0,0,0,1,1,0,1,0,0,1,1,1,1,0,0,1,0,0,1,0,1,0,1,1,0,0,0,1,0,0,1,1,0,0,0,1,1,0,1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];//This includes A5e because I'm not willing to put up with its non-unique decomposition shenanigans. Everything else is unconditional interaction.
var mergecolors0=function(board){
  for(var i0=0;i0<50;i0++){
    var il=(i0+49)%50;
    var ir=(i0+1)%50;
    for(var j0=0;j0<100;j0++){
      var jl=(j0+99)%100;
      var jr=(j0+1)%100;
      //This should bypass the need for a BFS or a floodfill here.
      var cll=p2c(board[il][jl]);
      var cl0=p2c(board[il][j0]);
      var clr=p2c(board[il][jr]);
      var c0l=p2c(board[i0][jl]);
      var c00=p2c(board[i0][j0]);
      var c0r=p2c(board[i0][jr]);
      var crl=p2c(board[ir][jl]);
      var cr0=p2c(board[ir][j0]);
      var crr=p2c(board[ir][jr]);
      if(c00===0){//The cell is dead
        var neighborhood=0;
        neighborhood+=128*(cll>0);
        neighborhood+=64*(cl0>0);
        neighborhood+=32*(clr>0);
        neighborhood+=16*(c0l>0);
        neighborhood+=8*(c0r>0);
        neighborhood+=4*(crl>0);
        neighborhood+=2*(cr0>0);
        neighborhood+=(crr>0);
        if(interactions0[neighborhood]===0){
          continue;//Wrong neighborhood or we don't know enough
        }
      }
      //We know that we can check these cells, so let's do it
      var min=5000;//Highest possible color value
      min=(cll<min&&cll>0)?cll:min;//If cll is alive and it's smaller than the current minimum, then update the minimum.
      min=(cl0<min&&cl0>0)?cl0:min;
      min=(clr<min&&clr>0)?clr:min;
      min=(c0l<min&&c0l>0)?c0l:min;
      min=(c00<min&&c00>0)?c00:min;
      min=(c0r<min&&c0r>0)?c0r:min;
      min=(crl<min&&crl>0)?crl:min;
      min=(cr0<min&&cr0>0)?cr0:min;
      min=(crr<min&&crr>0)?crr:min;
      colorpointers[cll]=Math.min(colorpointers[cll],min);//Update the pointers, this won't affect 0 but it will change everything nonzero
      colorpointers[cl0]=Math.min(colorpointers[cl0],min);
      colorpointers[clr]=Math.min(colorpointers[clr],min);
      colorpointers[c0l]=Math.min(colorpointers[c0l],min);
      colorpointers[c00]=Math.min(colorpointers[c00],min);
      colorpointers[c0r]=Math.min(colorpointers[c0r],min);
      colorpointers[crl]=Math.min(colorpointers[crl],min);
      colorpointers[cr0]=Math.min(colorpointers[cr0],min);
      colorpointers[crr]=Math.min(colorpointers[crr],min);
    }
  }
};
var mergecolorbispecters0=function(board){
  for(var i0=0;i0<50;i0++){
    var il=(i0+49)%50;
    var ir=(i0+1)%50;
    for(var j0=0;j0<100;j0++){
      var jl=(j0+99)%100;
      var jr=(j0+1)%100;
      //This should bypass the need for a BFS or a floodfill here.
      var cll=pxy2cxy(board[il][jl]);
      var cl0=pxy2cxy(board[il][j0]);
      var clr=pxy2cxy(board[il][jr]);
      var c0l=pxy2cxy(board[i0][jl]);
      var c00=pxy2cxy(board[i0][j0]);
      var c0r=pxy2cxy(board[i0][jr]);
      var crl=pxy2cxy(board[ir][jl]);
      var cr0=pxy2cxy(board[ir][j0]);
      var crr=pxy2cxy(board[ir][jr]);
      if(c00[0]===0){//The cell is dead
        var neighborhood=0;
        neighborhood+=128*(cll[0]!==0);
        neighborhood+=64*(cl0[0]!==0);
        neighborhood+=32*(clr[0]!==0);
        neighborhood+=16*(c0l[0]!==0);
        neighborhood+=8*(c0r[0]!==0);
        neighborhood+=4*(crl[0]!==0);
        neighborhood+=2*(cr0[0]!==0);
        neighborhood+=(crr[0]!==0);
        if(interactions0[neighborhood]===0){
          continue;//Wrong neighborhood or we don't know enough
        }
      }
      //Put in board coordinates (without wrap)
      cll.push(i0-1);
      cl0.push(i0-1);
      clr.push(i0-1);
      c0l.push(i0);
      c00.push(i0);
      c0r.push(i0);
      crl.push(i0+1);
      cr0.push(i0+1);
      crr.push(i0+1);
      cll.push(j0-1);
      cl0.push(j0);
      clr.push(j0+1);
      c0l.push(j0-1);
      c00.push(j0);
      c0r.push(j0+1);
      crl.push(j0-1);
      cr0.push(j0);
      crr.push(j0+1);
      //We know that we can check these cells, so let's do it
      var min=[5000];//Highest possible color value, the other four entries will be filled in anyways
      min=(cll[0]<min[0]&&cll[0]>0)?cll:min;//If cll is alive and it's smaller than the current minimum, then update the minimum.
      min=(cl0[0]<min[0]&&cl0[0]>0)?cl0:min;
      min=(clr[0]<min[0]&&clr[0]>0)?clr:min;
      min=(c0l[0]<min[0]&&c0l[0]>0)?c0l:min;
      min=(c00[0]<min[0]&&c00[0]>0)?c00:min;
      min=(c0r[0]<min[0]&&c0r[0]>0)?c0r:min;
      min=(crl[0]<min[0]&&crl[0]>0)?crl:min;
      min=(cr0[0]<min[0]&&cr0[0]>0)?cr0:min;
      min=(crr[0]<min[0]&&crr[0]>0)?crr:min;
      if(!(mergecxys(min,cll)&&mergecxys(min,cl0)&&mergecxys(min,clr)&&mergecxys(min,c0l)&&mergecxys(min,c00)&&mergecxys(min,c0r)&&mergecxys(min,crl)&&mergecxys(min,cr0)&&mergecxys(min,crr))){
        return false;
      }
    }
  }
  return true;
};
var interactions1=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var mergecolors1=function(board){
  for(var i0=0;i0<50;i0++){
    var il=(i0+49)%50;
    var ir=(i0+1)%50;
    for(var j0=0;j0<100;j0++){
      var jl=(j0+99)%100;
      var jr=(j0+1)%100;
      var c00=p2c(board[i0][j0]);
      if(c00>0){//We're only concerned about neighborhoods of dead cells here
        continue;
      }
      //This should bypass the need for a BFS (or DFS) or a floodfill here.
      var cll=p2c(board[il][jl]);
      var cl0=p2c(board[il][j0]);
      var clr=p2c(board[il][jr]);
      var c0l=p2c(board[i0][jl]);
      var c0r=p2c(board[i0][jr]);
      var crl=p2c(board[ir][jl]);
      var cr0=p2c(board[ir][j0]);
      var crr=p2c(board[ir][jr]);
      if(c00===0){//The cell is dead
        var neighborhood=0;
        neighborhood+=128*(cll>0);
        neighborhood+=64*(cl0>0);
        neighborhood+=32*(clr>0);
        neighborhood+=16*(c0l>0);
        neighborhood+=8*(c0r>0);
        neighborhood+=4*(crl>0);
        neighborhood+=2*(cr0>0);
        neighborhood+=(crr>0);
        if(interactions1[neighborhood]===0){
          continue;//Wrong neighborhood
        }
      }
      //Ok, we have the right neighborhood, get the alive cells
      var alive=[];
      if(cll>0){
        alive.push(cll);
      }
      if(cl0>0){
        alive.push(cl0);
      }
      if(clr>0){
        alive.push(clr);
      }
      if(c0l>0){
        alive.push(c0l);
      }
      if(c0r>0){
        alive.push(c0r);
      }
      if(crl>0){
        alive.push(crl);
      }
      if(cr0>0){
        alive.push(cr0);
      }
      if(crr>0){
        alive.push(crr);
      }
      var a=alive[0];
      var b=alive[1];
      var c=alive[2];
      var d=alive[3];
      if(a===b){
        if(c===d){
          continue;//It's either 4 or 2+2
        }else if(a===c){//3+1 implies interaction
          var min=Math.min(a,d);
          colorpointers[a]=min;
          colorpointers[d]=min;
        }else if(a===d){//3+1 implies interaction
          var min=Math.min(a,c);
          colorpointers[a]=min;
          colorpointers[c]=min;
        }
      }else{
        if(c!==d){//Could be 2+2, 2+1+1, or 1+1+1+1
          continue;
        }else if(a===c||b===c){//===d
          var min=Math.min(a,b);
          colorpointers[a]=min;
          colorpointers[b]=min;
        }
      }
    }
  }
};
var mergecolorbispecters1=function(board){
  for(var i0=0;i0<50;i0++){
    var il=(i0+49)%50;
    var ir=(i0+1)%50;
    for(var j0=0;j0<100;j0++){
      var jl=(j0+99)%100;
      var jr=(j0+1)%100;
      var c00=pxy2cxy(board[i0][j0]);
      if(c00[0]>0){//We're only concerned about neighborhoods of dead cells here
        continue;
      }
      //This should bypass the need for a BFS or a floodfill here.
      var cll=pxy2cxy(board[il][jl]);
      var cl0=pxy2cxy(board[il][j0]);
      var clr=pxy2cxy(board[il][jr]);
      var c0l=pxy2cxy(board[i0][jl]);
      var c0r=pxy2cxy(board[i0][jr]);
      var crl=pxy2cxy(board[ir][jl]);
      var cr0=pxy2cxy(board[ir][j0]);
      var crr=pxy2cxy(board[ir][jr]);
      if(c00[0]===0){//The cell is dead
        var neighborhood=0;
        neighborhood+=128*(cll[0]!==0);
        neighborhood+=64*(cl0[0]!==0);
        neighborhood+=32*(clr[0]!==0);
        neighborhood+=16*(c0l[0]!==0);
        neighborhood+=8*(c0r[0]!==0);
        neighborhood+=4*(crl[0]!==0);
        neighborhood+=2*(cr0[0]!==0);
        neighborhood+=(crr[0]!==0);
        if(interactions1[neighborhood]===0){
          continue;//Wrong neighborhood
        }
      }
      //Put in board coordinates (without wrap)
      cll.push(i0-1);
      cl0.push(i0-1);
      clr.push(i0-1);
      c0l.push(i0);
      c0r.push(i0);
      crl.push(i0+1);
      cr0.push(i0+1);
      crr.push(i0+1);
      cll.push(j0-1);
      cl0.push(j0);
      clr.push(j0+1);
      c0l.push(j0-1);
      c0r.push(j0+1);
      crl.push(j0-1);
      cr0.push(j0);
      crr.push(j0+1);
      //Ok, we have the right neighborhood, get the alive cells
      var alive=[];
      if(cll[0]!==0){
        alive.push(cll);
      }
      if(cl0[0]!==0){
        alive.push(cl0);
      }
      if(clr[0]!==0){
        alive.push(clr);
      }
      if(c0l[0]!==0){
        alive.push(c0l);
      }
      if(c0r[0]!==0){
        alive.push(c0r);
      }
      if(crl[0]!==0){
        alive.push(crl);
      }
      if(cr0[0]!==0){
        alive.push(cr0);
      }
      if(crr[0]!==0){
        alive.push(crr);
      }
      var a=alive[0];
      var b=alive[1];
      var c=alive[2];
      var d=alive[3];
      if(a[0]===b[0]){
        if(c[0]===d[0]){
          continue;//It's either 4 or 2+2
        }else if(a[0]===c[0]){//3+1 implies interaction
          if(!mergecxys(a,d)){
            return false;
          }
        }else if(a[0]===d[0]){//3+1 implies interaction
          if(!mergecxys(a,c)){
            return false;
          }
        }
      }else{
        if(c[0]!==d[0]){//Could be 2+2, 2+1+1, or 1+1+1+1
          continue;
        }else if(a[0]===c[0]||b[0]===c[0]){//===d[0]
          if(!mergecxys(a,b)){
            return false;
          }
        }
      }
    }
  }
  return true;
};
//Compress a 0-1 board for comparison
var compress=function(board){
  var compressed=[];
  for(var i=0;i<100;i++){
    var n=0;
    for(var j=0;j<50;j++){
      n*=2;
      n+=board[j][i];
    }
    compressed.push(n);
  }
  return compressed;
};
var GEN_LIMIT=1*process.argv[3];
var processboard=function(board){
  //Calculate the period
  var p=-1;
  var pastgenerations={};
  for(var i=0;i<=GEN_LIMIT;i++){//This doesn't actually check the last generation
    var compressed=compress(board);
    var g=pastgenerations[compressed];
    if(g!==undefined){
      p=i-g;
      break;
    }
    pastgenerations[compressed]=i;
    board=step(board);
  }
  if(p===-1){
    return;
  }
  //Ok, now let's color live cells. Let's use positive integers for convenience.
  var color=1;
  for(var i=0;i<50;i++){
    for(var j=0;j<100;j++){
      if(board[i][j]===1){
        board[i][j]=color;
        color+=1;//Each live cell starts with its own color
      }
    }
  }
  colorpointers=[];
  for(var i=0;i<color;i++){//Only fill in as many colors as we need to
    colorpointers.push(i);
  }
  //Good. Let's do color decomposition now.
  var periods={};//Sets won't work since memory addresses are different
  while(periods[board]===undefined){
    periods[board]=1;
    for(var g=0;g<p;g++){//We can only have a recurrence every p generations, since otherwise the patterns themselves will be different and the colors won't be able to match
      //Figure out what changes need to be made to which colors
      mergecolors0(board);
      mergecolors1(board);
      for(var i=0;i<50;i++){//This does two things. First, we actually apply the changes, to make it easier to step this board.
        for(var j=0;j<100;j++){//Second, we shorten all the paths that the p2c function takes, to a single step.
          color=board[i][j];
          board[i][j]=p2c(color);
        }
      }
      board=stepcolorboard(board);
    }
  }
  //Split the board based on color, and get the highest color
  var maxcolor=0;
  var boards={};
  for(var i=0;i<50;i++){
    for(var j=0;j<100;j++){
      color=board[i][j];
      maxcolor=Math.max(maxcolor,color);
      if(color===0){
        continue;
      }
      if(boards[color]===undefined){
        boards[color]=createblankboard();
      }
      boards[color][i][j]=1;
    }
  }
  //Do color-bispectral decomposition on each subboard
  for(var n=1;n<=maxcolor;n++){
    if(boards[n]===undefined){
      continue;
    }
    board=boards[n];
    //Like before, color each cell with a unique positive integer
    color=1;
    for(var i=0;i<50;i++){
      for(var j=0;j<100;j++){
        if(board[i][j]===1){
          board[i][j]=[color,0,0];
          color+=1;
        }
      }
    }
    //Reset color pointers (we're using them as color-bispectral pointers this time)
    colorpointers=[];
    for(var i=0;i<color;i++){
      colorpointers.push([i,0,0]);
    }
    var infinite=false;
    while(true){//This while loop trick only works if there's only one color at the end
      if(!mergecolorbispecters0(board)){//Figure out changes
        infinite=true;
        break;
      }
      if(!mergecolorbispecters1(board)){
        infinite=true;
        break;
      }
      //Apply changes, check if done
      var finished=true;
      var c=0;
      for(var i=0;i<50;i++){
        for(var j=0;j<100;j++){
          color=board[i][j];
          if(color!==0){
            var newcolor=pxy2cxy(color);
            c=!c?newcolor[0]:c;
            finished=finished&&(c===newcolor[0]);
            board[i][j]=newcolor;
          }
        }
      }
      //Now step
      board=stepcolorbispecterboard(board);
      if(finished){
        break;
      }
    }
    if(infinite){
      boards[n]=undefined;
    }else{
      boards[n]=board;
    }
  }
  //Get the patterns off of the subboards and identify each one
  for(var n=1;n<=maxcolor;n++){
    board=boards[n];
    if(board===undefined){
      continue;
    }
    var grid=[];
    for(var i=0;i<50;i++){
      for(var j=0;j<100;j++){
        var cell=board[i][j];
        if(!cell){
          continue;
        }
        grid.push([cell[1],cell[2]]);//The coordinates were found in the color-bispectral decomposition
      }
    }
    //Now identify the period and if it's a spaceship or not, while also getting and printing the apgcode.
    grid=normalize(grid);//Normalization at the beginning will allow for an easier comparison
    grid.sort(function(cl,cr){//Sort cells by x, then by y
      if(cl[0]<cr[0]){
        return -1;
      }else if(cl[0]>cr[0]){
        return 1;
      }else if(cl[1]<cr[1]){
        return -1;
      }else if(cl[1]>cr[1]){
        return 1;
      }else{
        return 0;
      }
    });
    var g0=JSON.stringify(grid);//We know that the grid is already in its cycle
    grid=stepgrid(grid);
    var apg=apgcode(g2b(grid));
    p=1;
    var dx;
    var dy;
    while(true){
      //Time to get the period
      var g1=normalize(grid);
      g1.sort(function(cl,cr){//Sort cells by x, then by y
        if(cl[0]<cr[0]){
          return -1;
        }else if(cl[0]>cr[0]){
          return 1;
        }else if(cl[1]<cr[1]){
          return -1;
        }else if(cl[1]>cr[1]){
          return 1;
        }else{
          return 0;
        }
      });
      if(JSON.stringify(g1)===g0){
        grid.sort(function(cl,cr){//Sort cells by x, then by y
          if(cl[0]<cr[0]){
            return -1;
          }else if(cl[0]>cr[0]){
            return 1;
          }else if(cl[1]<cr[1]){
            return -1;
          }else if(cl[1]>cr[1]){
            return 1;
          }else{
            return 0;
          }
        });
        g0=JSON.parse(g0);
        var c0=g0[0];
        var c1=grid[0];
        dx=c1[0]-c0[0];
        dy=c1[1]-c0[1];
        break;
      }
      grid=stepgrid(grid);
      var apg1=apgcode(g2b(grid));
      apg=compareapg(apg,apg1);
      p+=1;
    }
    var code;
    if(p===1){
      code="s";
    }else if(dx===0&&dy===0){
      code="p";
    }else{
      code="q";
    }
    if(code==="s"){
      code+=grid.length;
    }else{
      code+=p;
    }
    if(apg==="OVERSIZED"){
      code="ov_"+code;
      console.log(code);
      continue;
    }
    code="x"+code;
    code+="_";
    code+=apg;
    console.log(code);
  }
};
//Get the board from command line arguments
var boardbits=process.argv[2];
var board=createblankboard();
for(var i=0;i<50;i++){
  for(var j=0;j<100;j++){
    if(boardbits[100*i+j]==="1"){
      board[i][j]=1;
    }
  }
}
processboard(board);
