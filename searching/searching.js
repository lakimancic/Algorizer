let arr = [];
let anims = [];

let not_found = [];

let animator, index = 0;
let is_sorted = false;

const COLOR_NOT_FOUND = "#cc0000";
const COLOR_PASSIVE = "#8c8c8c";
const COLOR_FOUND = "#33cc33";
const COLOR_CURRENT = "#ffd11a";
const COLOR_NORMAL = "#1a75ff";

function drawNewArr(sorted) {
  let num = $("#num").val();
  $("#startBtn").prop("disabled", false);
  if(num < 5 || num > 200) {
    $(".edit p").text("Size of array must be between 5 and 200!");
    return;
  }
  index = 0;
  if(sorted) arr = newSortedArray(num);
  else arr = newRandomArray(num);
  is_sorted = sorted;
  showArr();
}



function showArr() {
  $('#visual').html("");
  let len = arr.length;
  arr.forEach((item, i) => {
    let newel = document.createElement('div');
    newel.style.height = 100*item/len + "%";
    //newel.style.width = 100/len + "%";
    newel.style.backgroundColor = COLOR_NORMAL;
    $("#visual").append(newel);
  });
}

// Animation Parsers

// { type: "check", index: i }
// { type: "found", index: i}

function parseLinear(token) {
  switch(token.type) {
    case "check":
    if(token.index > 0) $(`#visual div:eq(${token.index - 1})`).css("background-color", COLOR_NOT_FOUND);
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_CURRENT);
    break;
    case "found":
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_FOUND);
    break;
    case "notfound":
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_NOT_FOUND);
    break;
  }
}

// { type: "check", index: i, l: -1, r: 5}

function parseBinary(token) {
  switch(token.type) {
    case "check":
    if(token.l > -1){
      $(`#visual div:lt(${token.l})`).css("background-color", COLOR_PASSIVE);
      not_found.push(token.l);
      not_found.forEach((item, i) => {
        $(`#visual div:eq(${item})`).css("background-color", COLOR_NOT_FOUND);
      });
    }
    else if(token.r > -1){
      $(`#visual div:gt(${token.r})`).css("background-color", COLOR_PASSIVE);
      not_found.push(token.r);
      not_found.forEach((item, i) => {
        $(`#visual div:eq(${item})`).css("background-color", COLOR_NOT_FOUND);
      });
    }
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_CURRENT);
    break;
    case "found":
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_FOUND);
    break;
    case "notfound":
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_NOT_FOUND);
    break;
  }
}

function parseJump(token) {
  switch(token.type){
    case "jumpcheck":
    $(`#visual div:lt(${token.index})`).css("background-color", COLOR_PASSIVE);
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_CURRENT);
    not_found.push(token.not);
    not_found.forEach((item, i) => {
      $(`#visual div:eq(${item})`).css("background-color", COLOR_NOT_FOUND);
    });
    break;
    case "lincheck":
    if(token.index > 0) $(`#visual div:eq(${token.index-1})`).css("background-color", COLOR_NOT_FOUND);
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_CURRENT);
    break;
    case "notfound":
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_NOT_FOUND);
    break;
    case "found":
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_FOUND);
    break;
  }
}

// Animations Parser


function parseAnims(parse) {
  if(index == anims.length){
    clearInterval(animator);
    $("#startBtn").prop("disabled", false);
    $("#resetBtn").prop("disabled", false);
    $("#stopBtn").prop("disabled", true);
    return;
  }
  parse(anims[index]);
  index++;
}


// Searching Algorithms

function linearSearch(n) {
  anims = [];
  for(let i=0;i<arr.length;i++) {
    anims.push({type: "check", index: i});
    if(arr[i] == n) {
      anims.push({type: "found", index: i});
      return;
    }
  }
  anims.push({type: "notfound", index: arr.length - 1});
}

function binarySearch(l,r,n,is) {
  if(r >= l) {
    let mid = Math.floor((l + r)/2);

    if(is == 0) anims.push({type: "check", index: mid, l: -1, r: -1});
    else if(is == 1) anims.push({type: "check", index: mid, l: -1, r: r + 1});
    else if(is == -1) anims.push({type: "check", index: mid, l: l - 1, r: -1});

    if(arr[mid] == n){
      anims.push({type: "found", index: mid});
      return true;
    }

    if(arr[mid] > n){
      return binarySearch(l, mid - 1, n, 1);
    }

    return binarySearch(mid + 1, r, n, -1);
  }

  return false;
}

function binSearchCall(n) {
  anims = [];
  not_found = [];
  let ind = binarySearch(0,arr.length-1,n,0);
  if(!ind)
  {
    if(Number(n) < 1) anims.push({type: "notfound", index: 0});
    else if(Number(n) >= arr.length) anims.push({type: "notfound", index: arr.length - 1});
  }
}

function jumpSearch(n) {
  anims = [];
  not_found = [];

  let step = Math.floor(Math.sqrt(arr.length));
  let prev = 0;
  anims.push({type: "lincheck", index: prev});
  while(arr[Math.min(step,arr.length)-1] < n){
    anims.push({type: "jumpcheck", index: step, not: prev});
    prev = step;
    step += Math.floor(Math.sqrt(arr.length));
    if(prev >= arr.length){
      return false;
    }
  }

  while(arr[prev] < n){
    prev++;
    anims.push({type: "lincheck", index: prev});
    if(prev == Math.min(step, arr.length)){
      return false;
    }
  }
  if(arr[prev] == n){
    anims.push({type: "found", index: prev});
    return true;
  }

  anims.push({type: "notfound", index: 0});
  return false;
}

function interpolationSearch(l,r,n,is) {
  if(r >= l && n >= arr[l] && n <= arr[r]) {
    let mid = Math.floor(l + (((r-l)/(arr[r] - arr[l]))*(n - arr[l])));

    if(is == 0) anims.push({type: "check", index: mid, l: -1, r: -1});
    else if(is == 1) anims.push({type: "check", index: mid, l: -1, r: r + 1});
    else if(is == -1) anims.push({type: "check", index: mid, l: l - 1, r: -1});

    if(arr[mid] == n){
      anims.push({type: "found", index: mid});
      return true;
    }

    if(arr[mid] > n){
      return binarySearch(l, mid - 1, n, 1);
    }

    return binarySearch(mid + 1, r, n, -1);
  }

  return false;
}

function interSearchCall(n) {
  anims = [];
  not_found = [];
  let ind = interpolationSearch(0,arr.length-1,n,0);
  if(!ind)
  {
    if(Number(n) < 1) anims.push({type: "notfound", index: 0});
    else if(Number(n) >= arr.length) anims.push({type: "notfound", index: arr.length - 1});
  }
}

function exponSearch(n) {
  anims = [];
  not_found = [];
  anims.push({type: "check", index: 0, l: -1, r: -1});
  if(arr[0] == n){
    anims.push({type: "found", index: 0});
  }

  let i=1;
  anims.push({type: "check", index: i, l: 0, r: -1});

  while(i < arr.length && arr[i] <= n){
    i *= 2;
    anims.push({type: "check", index: i, l: i/2, r: -1});
  }

  let ind = binarySearch(i/2,Math.min(i,arr.length)-1,n,1);
  if(!ind)
  {
    if(Number(n) < 1) anims.push({type: "notfound", index: 0});
    else if(Number(n) >= arr.length) anims.push({type: "notfound", index: arr.length - 1});
  }
}

// Calling Algorithms

function startParsing() {
  let n;
  var output = document.getElementById("spd_val");
  let speed = 10000/Number(output.textContent);
  if (index == 0){
    n = $("#find").val();
    if(alg == "none"){
      $(".edit p").text("Please select algorithm!");
      return;
    }
    if(!n) {
      $(".edit p").text("Please enter the number for search!");
      return;
    }
    if(!Number.isInteger(Number(n))) {
      $(".edit p").text("Number must be integer");
      return;
    }
  }
  $(".edit p").text("Message");
  $("#startBtn").prop("disabled", true);
  $("#stopBtn").prop("disabled", false);
  switch(alg) {
    case "lin":
    if(index == 0 ) linearSearch(n);
    animator = setInterval(parseAnims, speed, parseLinear);
    break;
    case "bin":
    if(!is_sorted) {
      $(".edit p").text("Binary Search is used for sorted array!");
      $("#startBtn").prop("disabled", false);
      $("#stopBtn").prop("disabled", true);
      return;
    }
    if(index == 0 ) binSearchCall(n);
    animator = setInterval(parseAnims, speed, parseBinary);
    break;
    case "jump":
    if(!is_sorted) {
      $(".edit p").text("Jump Search is used for sorted array!");
      $("#startBtn").prop("disabled", false);
      $("#stopBtn").prop("disabled", true);
      return;
    }
    if(index == 0 ) jumpSearch(n);
    animator = setInterval(parseAnims, speed, parseJump);
    break;
    case "inter":
    if(!is_sorted) {
      $(".edit p").text("Jump Search is used for sorted array!");
      $("#startBtn").prop("disabled", false);
      $("#stopBtn").prop("disabled", true);
      return;
    }
    if(index == 0 ) interSearchCall(n);
    animator = setInterval(parseAnims, speed, parseBinary);
    break;
    case "exp":
    if(!is_sorted) {
      $(".edit p").text("Jump Search is used for sorted array!");
      $("#startBtn").prop("disabled", false);
      $("#stopBtn").prop("disabled", true);
      return;
    }
    if(index == 0 ) exponSearch(n);
    animator = setInterval(parseAnims, speed, parseBinary);
    break;
  }
}

function stopParsing() {
  $("#startBtn").prop("disabled", false);
  $("#resetBtn").prop("disabled", false);
  $("#stopBtn").prop("disabled", true);
  $(".edit p").text("Don't change algorithm!");
  clearInterval(animator);
}

function resetParsing() {
  index = 0;
  $(".edit p").text("Message");
  showArr();
}
