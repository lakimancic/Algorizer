let cols = 51, rows = 21;

let matrix;

let anims = [];
let animator, index = 0;

let start = { i: -1, j: -1};
let end = { i: -1, j: -1};

let clicked = false;

let rtype = "start";

let dirs = [
  { i: -1, j: 0 },
  { i: 0, j: 1 },
  { i: 1, j: 0 },
  { i: 0, j: -1 }
]

let COLOR_WALL = "#005ce6";
let COLOR_START = '#33cc33';
let COLOR_END = '#cc0000';
let COLOR_CURRENT = "#ffff66";
let COLOR_VISITED = '#80b3ff';
let COLOR_BORDER = '#b3d9ff';

$(document).ready(function () {
  createTable();

  $("input[type=radio][name=node]").change(function() {
    rtype = $(this).val();
  })
});

function createTable() {
  matrix = [];
  weights = [];
  start = { i: -1, j: -1};
  end = { i: -1, j: -1};
  index = 0;
  $("#maze").html("");
  for(let i=0;i<rows;i++) {
    let row = document.createElement("tr");
    let pomniz = [];
    for(let j=0;j<cols;j++) {
      let col = document.createElement("td");
      col.id = i+"x"+j;
      row.appendChild(col);
      pomniz.push(0);
    }
    $("#maze").append(row);
    matrix.push(pomniz);
  }

  $("#maze td").mousedown(function () {
    if(index == 0) {
      switch(rtype) {
        case "wall":
        createWall(this);
        break;
        case "start":
        createStart(this);
        break;
        case "end":
        createEnd(this);
        break;
      }
    }
    clicked = true;
  }).mouseup(function () {
    clicked = false;
  }).mouseenter(function () {
    if(clicked) {
      if(index == 0) {
        switch(rtype) {
          case "wall":
          createWall(this);
          break;
          case "start":
          createStart(this);
          break;
          case "end":
          createEnd(this);
          break;
        }
      }
    }
  });
}

function createWall(k) {
  let i = Number(k.id.split('x')[0]);
  let j = Number(k.id.split('x')[1]);
  if(matrix[i][j] == 2 || matrix[i][j] == 3) return;
  if(matrix[i][j] == 0) {
    $(k).css("background-color", COLOR_WALL);
    $(k).css("border-color", COLOR_WALL);
    matrix[i][j] = 1;
  }
  else if(matrix[i][j] == 1){
    $(k).css("background-color", "white");
    $(k).css("border-color", COLOR_BORDER);
    matrix[i][j] = 0;
  }
  /*$(k).css("background-color",COLOR_WALL);
  $(k).css("border-color", COLOR_WALL);*/
}

function createStart(k) {
  let i = Number(k.id.split('x')[0]);
  let j = Number(k.id.split('x')[1]);
  if(matrix[i][j] == 3) return;
  if(start.i > -1 && start.j > -1 && !(start.i == i && start.j == j)) {
    $(`#maze tr:eq(${start.i}) td:eq(${start.j})`).css("background-color", "white");
    $(`#maze tr:eq(${start.i}) td:eq(${start.j})`).css("border-color", COLOR_BORDER);
    matrix[start.i][start.j] = 0;
  }
  $(k).css("background-color", COLOR_START);
  $(k).css("border-color", COLOR_BORDER);
  matrix[i][j] = 2;
  start = {i: i, j: j};
}

function createEnd(k) {
  let i = Number(k.id.split('x')[0]);
  let j = Number(k.id.split('x')[1]);
  if(matrix[i][j] == 2) return;
  if(end.i > -1 && end.j > -1 && !(end.i == i && end.j == j)) {
    $(`#maze tr:eq(${end.i}) td:eq(${end.j})`).css("background-color", "white");
    $(`#maze tr:eq(${end.i}) td:eq(${end.j})`).css("border-color", COLOR_BORDER);
    matrix[end.i][end.j] = 0;
  }
  $(k).css("background-color", COLOR_END);
  $(k).css("border-color", COLOR_BORDER);
  matrix[i][j] = 3;
  end = {i: i, j: j};
}

// parse
// { type: "visited", i: i, j: j };

function parseAnim(token) {
  switch(token.type) {
    case "visited":
    $(`#maze tr:eq(${token.i}) td:eq(${token.j})`).css("background-color", COLOR_VISITED);
    $(`#maze tr:eq(${token.i}) td:eq(${token.j})`).css("border-color", "white");
    break;
    case "path":
    if(!(token.vi == start.i && token.vj == start.j)) {
      $(`#maze tr:eq(${token.vi}) td:eq(${token.vj})`).css("background-color", COLOR_VISITED);
      $(`#maze tr:eq(${token.vi}) td:eq(${token.vj})`).css("border-color", "white");
    }
    if(!(token.i == start.i && token.j == start.j)){
      $(`#maze tr:eq(${token.i}) td:eq(${token.j})`).css("background-color", COLOR_CURRENT);
      $(`#maze tr:eq(${token.i}) td:eq(${token.j})`).css("border-color", COLOR_CURRENT);
    }
    break;
  }
}

function parseAnims() {
  if(index == anims.length){
    clearInterval(animator);
    $("#startBtn").prop("disabled", false);
    $("#clearBtn").prop("disabled", false);
    $("#stopBtn").prop("disabled", true);
    return;
  }
  parseAnim(anims[index]);
  index++;
}

function BFS(pred) {
  let queue = [];

  let visited = [];



  for(let i=0;i<rows;i++) {
    let vpom = [];
    let ppom = [];
    for(let j=0;j<cols;j++) {
      vpom.push(false);
      ppom.push(-1);
    }
    visited.push(vpom);
    pred.push(ppom);
  }

  visited[start.i][start.j] = true;
  queue.push(start);

  let prev = queue[0];

  while(queue.length != 0) {
    let u = queue[0];
    queue.shift();

    for(let i=0;i<dirs.length;i++) {
      if(u.i + dirs[i].i >= rows || u.i + dirs[i].i < 0) continue;
      if(u.j + dirs[i].j >= cols || u.j + dirs[i].j < 0) continue;
      if(matrix[u.i + dirs[i].i][u.j + dirs[i].j] == 1) continue;
      if(visited[u.i + dirs[i].i][u.j + dirs[i].j]) continue;

      visited[u.i + dirs[i].i][u.j + dirs[i].j] = true;
      pred[u.i + dirs[i].i][u.j + dirs[i].j] = u;

      queue.push({i: u.i + dirs[i].i, j: u.j + dirs[i].j});

      if(u.i + dirs[i].i == end.i && u.j + dirs[i].j == end.j) {
        anims.push({type: "visited", i: prev.i, j: prev.j});
        return true;
      }

      anims.push({type: "path", i: u.i + dirs[i].i, j: u.j + dirs[i].j, vi: prev.i, vj: prev.j});
      prev = {i: u.i + dirs[i].i, j: u.j + dirs[i].j};
    }
  }
  return false;
}

function BFSPath() {
  let pred = [];

  if(BFS(pred)) {
    let path = [];
    let crawl = end;
    path.push(crawl);


    while(pred[crawl.i][crawl.j] != -1) {
      path.push(pred[crawl.i][crawl.j]);
      crawl = pred[crawl.i][crawl.j];
    }

    for(let i=path.length-2;i>0;i--){
      anims.push({type: "path", i: path[i].i, j: path[i].j});
    }
  }
}

function DFS() {
  let visited = [];

  for(let i=0;i<rows;i++) {
    let vpom = [];
    for(let j=0;j<cols;j++) {
      vpom.push(false);
    }
    visited.push(vpom);
  }

  let stack = [];

  stack.push({node: start, path: [start]});

  let prev = start;

  while(stack.length > 0) {
    let u = stack[stack.length-1].node;
    let path = stack[stack.length-1].path;
    stack.pop();

    if(visited[u.i][u.j]) continue;
    if(matrix[u.i][u.j] == 1) continue;

    visited[u.i][u.j] = true;

    if(u.i == end.i && u.j == end.j) {
      anims.push({type: "visited", i: prev.i, j: prev.j});
      return path;
    }

    anims.push({type: "path", i: u.i, j: u.j, vi: prev.i, vj: prev.j});
    prev = u;

    for(let i=dirs.length-1;i>=0;i--) {
      if(u.i + dirs[i].i >= rows || u.i + dirs[i].i < 0) continue;
      if(u.j + dirs[i].j >= cols || u.j + dirs[i].j < 0) continue;
      let newnode = {i: u.i + dirs[i].i, j: u.j + dirs[i].j};
      stack.push({node: newnode, path: path.concat(newnode)});
    }
  }
  return false;
}

function DFSPath() {
  let path = DFS();

  if(path != false) {
    for(let i=0;i<path.length-1;i++){
      anims.push({type: "path", i: path[i].i, j: path[i].j});
    }
  }
}

function dijkstra(path) {
  let visited = [];
  let dist = [];

  for(let i=0;i<rows;i++) {
    let vpom = [];
    let ppom = [];
    let dpom = [];
    for(let j=0;j<cols;j++) {
      vpom.push(false);
      ppom.push(-1);
      dpom.push(Infinity);
    }
    visited.push(vpom);
    path.push(ppom);
    dist.push(dpom);
  }

  dist[start.i][start.j] = 0;
  let prev = start;

  for(let i = 0; i<rows*cols;i++) {
    let v = -1;
    for(let j=0; j<rows;j++){
      for(let k=0;k<cols;k++) {
        if(!visited[j][k] && matrix[j][k] != 1 && (v == -1 || dist[j][k] < dist[v.i][v.j]))
          v = {i: j, j: k};
      }
    }

    if(dist[v.i][v.j] == Infinity) break;

    visited[v.i][v.j] = true;

    if(v.i == end.i && v.j == end.j) {
      anims.push({type: "visited", i: prev.i, j: prev.j});
      return true;
    }

    anims.push({type: "path", i: v.i, j: v.j, vi: prev.i, vj: prev.j});
    prev = v;

    for(let j=0;j<dirs.length;j++) {
      if(v.i + dirs[j].i >= rows || v.i + dirs[j].i < 0) continue;
      if(v.j + dirs[j].j >= cols || v.j + dirs[j].j < 0) continue;
      if(dist[v.i][v.j] + 1 < dist[v.i + dirs[j].i][v.j + dirs[j].j]){
        dist[v.i + dirs[j].i][v.j + dirs[j].j] = dist[v.i][v.j] + 1;
        path[v.i + dirs[j].i][v.j + dirs[j].j] = v;
      }
    }
  }
  return false;
}

function dijkstraPath() {
  let path = [];
  let dij = dijkstra(path);
  if(dij) {
    let path2 = [];
    let crawl = end;
    path2.push(crawl);

    while(path[crawl.i][crawl.j] != -1) {
      path2.push(path[crawl.i][crawl.j]);
      crawl = path[crawl.i][crawl.j];
    }


    for(let i=path2.length-1;i>0;i--){
      anims.push({type: "path", i: path2[i].i, j: path2[i].j});
    }
  }
}

function astar() {
  let mask = [];
  let closedList = [];

  for(let i=0;i<rows;i++) {
    let mpom = [];
    let cpom = [];
    for(let j=0;j<cols;j++) {
      cpom.push(false);
      mpom.push({pi: -1, pj: -1, f: Infinity, g: Infinity, h: Infinity});
    }
    mask.push(mpom);
    closedList.push(cpom);
  }

  let openList = [];
  openList.push(start);

  mask[start.i][start.j] = {pi: -1, pj: -1, f: 0, g: 0, h: 0};
  let prev = start;

  while(openList.length > 0){
    let u = openList[0];
    let index = 0;
    openList.forEach((item, i) => {
      if(mask[item.i][item.j].f <= mask[u.i][u.j].f){
        u = item;
        index = i;
      }
    });
    openList.splice(index, 1);

    closedList[u.i][u.j] = true;

    if(u.i == end.i && u.j == end.j){
      anims.push({type: "visited", i: prev.i, j: prev.j});
      let path = [];
      let curr = u;
      while(mask[curr.i][curr.j].pi != -1){
        path.push(curr);
        let pom = mask[curr.i][curr.j];
        curr = {i: pom.pi, j: pom.pj};
      }
      return path;
    }

    anims.push({type: "path", i: u.i, j: u.j, vi: prev.i, vj: prev.j});
    prev = u;

    for(let i=0;i<dirs.length;i++){
      let newpos = {i: u.i + dirs[i].i, j: u.j + dirs[i].j };

      if(newpos.i >= rows || newpos.i < 0) continue;
      if(newpos.j >= cols || newpos.j < 0) continue;
      if(matrix[newpos.i][newpos.j] == 1) continue;

      if(closedList[newpos.i][newpos.j]) continue;

      let g = mask[u.i][u.j].g + 1;
      let h = Math.abs(newpos.i - end.i) + Math.abs(newpos.j - end.j);
      //let h = Math.sqrt(Math.pow(newpos.i - end.i, 2) + Math.pow(newpos.j - end.j, 2));
      let f = g + h;

      let ba = 1;
      for(let j=0;j<openList.length;j++){
        if(newpos.i == openList[j].i && newpos.j == openList[j].j && mask[openList[j].i][openList[j].j].f < f){
          ba = -1;
          break;
        }
        else if(newpos.i == openList[j].i && newpos.j == openList[j].j){
          ba = 0;
        }
      }
      if(ba > -1){
        mask[newpos.i][newpos.j] = { pi: u.i, pj: u.j, f: f, g: g, h: h};
        if(ba == 1){
          openList.push(newpos);
        }
      }
    }
  }
  return false;
}

function astarPath() {
  let path = astar();

  if(path){
    for(let i=path.length-1;i>0;i--){
      anims.push({type: "path", i: path[i].i, j: path[i].j});
    }
  }
}

function generateMaze() {
  createTable();

  for(let i=0;i<rows;i++){
    matrix[i][cols-1] = 1;
    matrix[i][0] = 1;
  }

  for(let i=0;i<cols;i++){
    matrix[rows-1][i] = 1;
    matrix[0][i] = 1;
  }
  recursiveDivision(2,2,cols - 3, rows - 3, false);
  drawByMatrix();
}

function drawByMatrix() {
  for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
      if(matrix[i][j] == 1){
        $(`#maze tr:eq(${i}) td:eq(${j})`).css("background-color", COLOR_WALL);
        $(`#maze tr:eq(${i}) td:eq(${j})`).css("border-color", COLOR_WALL);
      }
    }
  }
}

function drawVWall(minY,maxY,x) {
  let pass = Math.floor(Math.random()*((maxY-minY)/2))*2 + minY+1;
  for(let i=minY+1;i<maxY;i++){
    if(i!=pass) {
      $(`#maze tr:eq(${i}) td:eq(${x})`).css("background-color", COLOR_WALL);
      $(`#maze tr:eq(${i}) td:eq(${x})`).css("border-color", COLOR_WALL);
      matrix[i][x] = 1;
    }
  }
}

function drawHWall(minY,maxY,x) {
  let pass = Math.floor(Math.random()*((maxY-minY)/2))*2 + minY+1;
  for(let i=minY+1;i<maxY;i++){
    if(i!=pass) {
      $(`#maze tr:eq(${x}) td:eq(${i})`).css("background-color", COLOR_WALL);
      $(`#maze tr:eq(${x}) td:eq(${i})`).css("border-color", COLOR_WALL);
      matrix[x][i] = 1;
    }
  }
}

function recursiveDivision(x,y,maxx,maxy, h){
  if(h){
    if(maxy - y < 0) return;

    let wallY = Math.floor(Math.random()*(maxy-y)/2)*2 + y;

    drawHWall(x - 2, maxx + 2, wallY);
    recursiveDivision(x, y, maxx, wallY - 2, !h);
    recursiveDivision(x, wallY + 2, maxx, maxy, !h);
  }
  else{
    //if(maxx > cols) return;
    if(maxx - x < 0) return;

    let wallX = Math.floor(Math.random()*(maxx - x)/2)*2 + x;

    drawVWall(y - 2, maxy + 2, wallX);
    recursiveDivision(x, y, wallX - 2, maxy, !h);
    recursiveDivision(wallX + 2, y, maxx, maxy, !h);
  }
}

//

function startParsing() {
  var output = document.getElementById("spd_val");
  let speed = 2000/Number(output.textContent);
  if (index == 0){
    if(alg == "none"){
      $(".edit p").text("Please select algorithm!");
      return;
    }
    if(start.i == -1 && start.j == -1) {
      $(".edit p").text("Please set start node!");
      return;
    }
    if(end.i == -1 && end.j == -1) {
      $(".edit p").text("Please set end node!");
      return;
    }
  }
  $(".edit p").text("Message");
  $("#startBtn").prop("disabled", true);
  $("#stopBtn").prop("disabled", false);
  switch(alg) {
    case "bfs":
    if(index == 0 ) {
      anims = [];
      BFSPath();
    }
    animator = setInterval(parseAnims, speed);
    break;
    case "dfs":
    if(index == 0 ) {
      anims = [];
      DFSPath();
    }
    animator = setInterval(parseAnims, speed);
    break;
    case "dij":
    if(index == 0 ) {
      anims = [];
      dijkstraPath();
      //console.log(anims);
    }
    animator = setInterval(parseAnims, speed);
    break;
    case "aa":
    if(index == 0 ) {
      anims = [];
      let path = [];
      astarPath();
      //console.log(anims);
    }
    animator = setInterval(parseAnims, speed);
    break;
  }
}

function stopParsing() {
  $("#startBtn").prop("disabled", false);
  $("#cleartBtn").prop("disabled", false);
  $("#stopBtn").prop("disabled", true);
  clearInterval(animator);
  $(".edit p").text("Don't change algorithm!");
}

