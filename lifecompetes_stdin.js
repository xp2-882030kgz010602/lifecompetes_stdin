//This is the part that handles retrieving stuff from lifecompetes.com
var fs=require("fs");
var cp=require("child_process");
var crypto=require("crypto");
var key=process.argv[2];
if(key===undefined){
  console.log("Please specify a key.");
  process.exit();
}
var io=require("socket.io-client");
var socket=io("http://lifecompetes.com");
//Try to connect to lifecompetes
socket.connect();
socket.on("connect_error",function(e){
  console.log(e);
});
socket.on("connect",function(){
  try{
    console.log("Connected to lifecompetes");
  }catch(e){
    console.log(e);
    process.exit();
  }
});
var changed=true;
socket.on("cells_placed",function(message){
  changed=true;
});
var md5=function(message){
  return crypto.createHash("md5").update(message).digest("hex");
};
//Create a blank board
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
//Turn a board into RLE
var RLESIZE=5079;
var board2rle=function(board,time){//5065 bytes in the worst case, plus one for spaces separating the board RLEs, and 13 for timestamps
  //Remove trailing "b"s.
  for(var i=0;i<50;i++){
    for(var j=99;j>=0;j--){
      if(!board[i][j]){
        board[i].pop();
      }else{
        break;
      }
    }
  }
  var rle=" -";
  for(var i=0;i<50;i++){
    var row="";
    for(var j=0;j<board[i].length;j++){
      row+="bo"[board[i][j]];
    }
    if(i===49){
      row+="!"+time;
    }else{
      row+="$";
    }
    rle+=row;
  }
  var shortened="";
  var previous="";
  var count=1;
  for(var i=0;i<rle.length;i++){
    var now=rle[i];
    if(now!==previous){//Character change
      if(count>1){
        shortened+=count;
      }
      shortened+=previous;
      count=1;
      previous=now;
    }else{//No character change
      count+=1;
    }
  }
  rle=shortened;
  rle+="/b3s23:t100,50";//This changes the RLE header to add the toroidal part
  return rle;
};
var maxgen=1*process.argv[3];
if(maxgen===undefined){
  console.log("Please specify a generation cutoff.");
  process.exit();
}
console.log("Cutoff at generation "+maxgen+".");
var objectstack=[];
var processboard=function(board,n){//We should be able to get away with async here, by using a stack
  var time=Date.now();
  cp.exec("node lcprocessor.js "+JSON.stringify(board)+" "+maxgen,(error,stdout,stderr)=>{
    if(error||stderr){
      console.log("Error parsing board "+JSON.stringify(board));
      console.error(`${error}`);
      console.error(`${stderr}`);
      return;
    }
    var results=`${stdout}`;
    var objects=results.split("\n");
    if(objects.length>1){//1 means a blank line for some reason
      console.log("Objects detected in board "+n+":");
      console.log(results.split("\n").join(" "));
    }else{
      console.log("Board blank or timed out");
    }
    objects.pop();//Last line is blank for some reason
    objectstack.push([objects,board2rle(board,time)]);//Now just put it on the stack
  });
};
var pile={};
var counts={};
var boards=0;
//Ok, let's add a new list of objects to the pile
var addobjects=function(item){
  var objects=item[0];
  var o={};
  for(var i=0;i<objects.length;i++){
    o[objects[i]]=1;
  }
  //Get the size of the pile
  var rles=Object.values(pile);
  var pilesize=0;
  for(var i=0;i<rles.length;i++){
    pilesize+=rles[i].length;
  }
  console.log("Approximate pile size in bytes: "+pilesize);
  var uniqueobjects=Object.keys(o);
  //Get the worst possible size of the potential addition
  var addsize=RLESIZE*uniqueobjects.length;
  console.log("Worst-case increase in bytes: "+addsize);
  var maxsize=pilesize+"+"+addsize;
  var max=pilesize+addsize;
  if(max>1400000){//The limit is 1.5 MB, but we need some space for the headers and stuff
    console.log(maxsize+"="+max+">1400000");
    return false;
  }
  console.log(maxsize+"="+max+"<=1400000");
  //Ok, let's increment the object counts
  for(var i=0;i<objects.length;i++){
    var object=objects[i];
    if(counts[object]===undefined){
      counts[object]=0;
    }
    counts[object]+=1;
  }
  var rle=item[1];
  //And add the board to each relevant entry in the pile
  for(var i=0;i<uniqueobjects.length;i++){
    var object=uniqueobjects[i];
    if(pile[object]===undefined){
      pile[object]="";
    }
    pile[object]+=rle;
  }
  //And increment the boards counter
  boards+=1;
  return true;
}
//Send results to Catagolue
var catagolue_results=function(key,haul){
  console.log("Authenticating with Catagolue via the payosha256 protocol...");
  //http in JS is asynchronous, and it refuses to work with me. So I'll just ask Python 2.7.13.
  var result=cp.execSync("python catagolue_results.py "+key,{input:haul}).toString();
  console.log(result);
  if(result.indexOf("Unsuccessful")!==-1){//Something didn't go right
    return false;
  }
  return true;
};
//Write the haul information
var writehaul=function(){
  var haul="@VERSION wwei23_lifecompetes\n";
  var rsns="@RULE b3s23\n";
  rsns+="@SYMMETRY lifecompetes_stdin_test\n";
  rsns+="@NUM_SOUPS "+boards+"\n";
  var censustable="@CENSUS TABLE\n";
  var samplesoupids="@SAMPLE_SOUPIDS\n";
  var objects=Object.keys(counts);//Should also work for pile
  var n=0;
  for(var i=0;i<objects.length;i++){
    var object=objects[i];
    censustable+=object+" "+counts[object]+"\n";
    samplesoupids+=object+pile[object]+"\n";
    n+=counts[object];
  }
  rsns+="@NUM_OBJECTS "+n+"\n";
  rsns+=censustable+samplesoupids;
  var root=md5(rsns);//We're going to use MD5 anyways, so let's just take a hash of the rest of the data for additional verification of data INTEGRITY. This is not for cryptographic purposes, and SHA-256 won't fit anyways.
  //Add salt to stop similar hauls from having the same root
  for(var i=0;i<12;i++){
    root+="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random()*62)];
  }
  var hash=md5(root);//Additional checks, but this has to be the MD5 anyways.
  haul+="@MD5 "+hash+"\n";
  haul+="@ROOT "+root+"\n";
  haul+=rsns;
  //Let's just clear the pile now
  pile={};
  counts={};
  boards=0;
  //Done
  return haul;
};
var unstackerid;
//Now, let's try to add stack items into the pile
var unstackloop=function(){
  unstackerid=setInterval(function(){
    //Nothing to add
    if(objectstack.length===0){
      return;
    }
    //Get the newest item
    var item=objectstack.pop();
    if(addobjects(item)){//We can add the item, and all is good
      return;
    }
    //Ok, let's put the item back (might be out of order if something got added while we were trying to add the item, but that doesn't matter)
    objectstack.push(item);
    //We're running low on space, so let's upload the haul
    //First stop looping so we don't update the haul while clearing the pile or something
    clearInterval(unstackerid);
    var haul=writehaul();
    //Upload the haul
    if(!catagolue_results(key,haul)){
      //If we can't upload, let's just save it to a file
      var root=haul.split("\n")[2].split(" ")[1];
      fs.writeFileSync("./"+root,haul);
    }
    //Ok, let's start looping again
    unstackloop();
  },500);
};
unstackloop();
var boardeta=0;
socket.on("state",function(message){
  //We force ourselves into a phase-locked loop with the server. See the comments below.
  if(Date.now()<boardeta){//Early board
    return;
  }
  var t=message.timeBeforeTick;
  setTimeout(function(){socket.emit("request_state","")},t);//Schedule board request
  boardeta=Date.now()+t;//Calculate the ETA
  var cells=message.livingCells;
  var g=message.generation;
  console.log("Processing board at generation "+g);
  var board=createblankboard();
  for(var i=0;i<cells.length;i++){
    var cell=cells[i];
    if(cell.alive){
      board[cell.y][cell.x]=1;
    }
  }
  processboard(board,g);
});
//Phase-locked loop explanation
//One naive method would be to try to request the state every t seconds or so. However, network lag means that if we run the program near a time when the board steps, network lag means that we might get the state right before step n happens and then get the state right after step n+1 happens, which means that we would miss the board at step n.
//So, what if we simply wait message.timeBeforeTick time before each request? Well, that doesn't exactly work either, since if a player joins, the server broadcasts the state even if we did not ask for it. This would cause us to create increasing volumes of requests, and this would eventually crash the server. Not ideal.
//So, we calculate the time when we make the request for the board state. If the server sends us the state before we ask for it, we know that it's one of those broadcasted board states, so we simply ignore it. This means that we ask for and receive exactly one board state per generation.
