let arr = [];
let back_up = [];
let anims = [];

let animator, index = 0;

const COLOR_NOT_SORTED = "#cc0000";
const COLOR_GRAY = "#8c8c8c";
const COLOR_SORTED = "#33cc33";
const COLOR_CURRENT = "#ffd11a";
const COLOR_NORMAL = "#1a75ff";

function onIndexChange() {
  switch(alg){
    case "sel":
    $(".legend .square:eq(2)").css("display","block");
    $(".legend .text:eq(2)").css("display","block");
    $(".legend .text:eq(2)").text("Current");
    $(".legend .square:eq(3)").css("display","block");
    $(".legend .text:eq(3)").css("display","block");
    $(".legend .text:eq(3)").text("Current Minimal");
    break;
    case "bubb":
    $(".legend .square:eq(2)").css("display","none");
    $(".legend .text:eq(2)").css("display","none");
    $(".legend .square:eq(3)").css("display","block");
    $(".legend .text:eq(3)").css("display","block");
    $(".legend .text:eq(3)").text("Current / Next");
    break;
    case "insert":
    $(".legend .square:eq(2)").css("display","block");
    $(".legend .text:eq(2)").css("display","block");
    $(".legend .text:eq(2)").text("Current");
    $(".legend .square:eq(3)").css("display","none");
    $(".legend .text:eq(3)").css("display","none");
    break;
    case "merge":
    $(".legend .square:eq(2)").css("display","block");
    $(".legend .text:eq(2)").css("display","block");
    $(".legend .text:eq(2)").text("Current");
    $(".legend .square:eq(3)").css("display","none");
    $(".legend .text:eq(3)").css("display","none");
    break;
    case "quick":
    $(".legend .square:eq(2)").css("display","block");
    $(".legend .text:eq(2)").css("display","block");
    $(".legend .text:eq(2)").text("Smaller/Current");
    $(".legend .square:eq(3)").css("display","block");
    $(".legend .text:eq(3)").css("display","block");
    $(".legend .text:eq(3)").text("Pivot");
    break;
    case "heap":
    $(".legend .square:eq(2)").css("display","block");
    $(".legend .text:eq(2)").css("display","block");
    $(".legend .text:eq(2)").text("Current Left/Right");
    $(".legend .square:eq(3)").css("display","block");
    $(".legend .text:eq(3)").css("display","block");
    $(".legend .text:eq(3)").text("Largest");
    break;
    default:
    $(".legend .square:eq(2)").css("display","none");
    $(".legend .text:eq(2)").css("display","none");
    $(".legend .square:eq(3)").css("display","none");
    $(".legend .text:eq(3)").css("display","none");
    break;
  }
}

function drawNewArr(sorted) {
  let num = $("#num").val();
  $("#startBtn").prop("disabled", false);
  if(num < 5 || num > 200) {
    $(".edit p").text("Size of array must be between 5 and 200!");
    return;
  }
  index = 0;
  arr = newRandomArray(num);
  back_up = [...arr];
  showArr();
}

function showArr() {
  $('#visual').html("");
  let len = arr.length;
  arr.forEach((item, i) => {
    let newel = document.createElement('div');
    newel.style.height = 100*item/len + "%";
    //newel.style.width = 100/len + "%";
    newel.style.backgroundColor = COLOR_NOT_SORTED;
    $("#visual").append(newel);
  });
}

$(document).ready(function(){
  $(".forselect").click(() => {
    onIndexChange();
  })
});

// Animation Parsers
// { type: "next", index: i, min: min_idx, prev: -1 }
// { type: "swap", a: i, b: min_idx }

function parseSelection(token) {
  switch (token.type) {
    case "next":
      $(`#visual div:eq(${token.prev})`).css("background-color", COLOR_NOT_SORTED);
      $(`#visual div:gt(${token.prev})`).css("background-color", COLOR_NOT_SORTED);
      if(token.index != -1){
        $(`#visual div:eq(${token.index})`).css("background-color", COLOR_CURRENT);
      }
      $(`#visual div:eq(${token.min})`).css("background-color", COLOR_NORMAL);
    break;
    case "swap":
      $(`#visual div:eq(${token.a})`).css("background-color", COLOR_SORTED);
      if(token.a != token.b) $(`#visual div:eq(${token.b})`).css("background-color", COLOR_NOT_SORTED);
      $(`#visual div:eq(${token.a})`).css("height", 100*token.a_val/arr.length + "%");
      $(`#visual div:eq(${token.b})`).css("height", 100*token.b_val/arr.length + "%");
    break;
  }
}

// { type: "next", index: i }
// { type: "swap", a: i, b: j}
// { type: "sorted", index: i }

function parseBubble(token) {
  switch (token.type) {
    case "next":
      if(token.index > 0)
        $(`#visual div:eq(${token.index-1})`).css("background-color", COLOR_NOT_SORTED);
      $(`#visual div:eq(${token.index})`).css("background-color", COLOR_NORMAL);
      $(`#visual div:eq(${token.index+1})`).css("background-color", COLOR_NORMAL);
    break;
    case "swap":
      $(`#visual div:eq(${token.a})`).css("height", 100*token.a_val/arr.length + "%");
      $(`#visual div:eq(${token.b})`).css("height", 100*token.b_val/arr.length + "%");
    break;
    case "sorted":
      if(token.index > 0) $(`#visual div:eq(${token.index-1})`).css("background-color", COLOR_NOT_SORTED);
      $(`#visual div:eq(${token.index})`).css("background-color", COLOR_SORTED);
    break;
  }
}

// {type: "swap", a: i, b: j , a_val: . , b_val: .}
// {type: "change", index: i, is: true }

function parseInsertion(token) {
  switch (token.type) {
    case "swap":
      $(`#visual div:eq(${token.a})`).css("background-color", COLOR_CURRENT);
      $(`#visual div:eq(${token.b})`).css("background-color", COLOR_NOT_SORTED);
      $(`#visual div:eq(${token.a})`).css("height", 100*token.a_val/arr.length + "%");
      $(`#visual div:eq(${token.b})`).css("height", 100*token.b_val/arr.length + "%");
    break;
    case "change":
      if(token.is){
        $(`#visual div:eq(${token.index})`).css("background-color", COLOR_CURRENT);
      }
      else{
        $(`#visual div:eq(${token.index})`).css("background-color", COLOR_NOT_SORTED);
      }
    break;
    case "sorted":
      $(`#visual div`).css("background-color", COLOR_SORTED);
    break;
  }
}

// {type: "next", index: i, change: -1 }
// {type: "clr", index: i }

function parseMerge(token) {
  switch (token.type) {
    case "next":
    if(token.index > 0) $(`#visual div:eq(${token.index-1})`).css("background-color", COLOR_NOT_SORTED);
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_CURRENT);
    if(token.change > -1) $(`#visual div:eq(${token.index})`).css("height", 100*token.change/arr.length + "%");
    break;
    case "clr":
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_NOT_SORTED);
    break;
    case "sorted":
      $(`#visual div`).css("background-color", COLOR_SORTED);
    break;
  }
}

// {type: "next", index: j, i: i }
// {type: "swap", a: j, b: i }
// {type: "pivot", index: i }
// {type: "clr", index: i }

function parseQuick(token) {
  switch (token.type) {
    case "next":
    if(token.index > 0) $(`#visual div:eq(${token.index-1})`).css("background-color", COLOR_NOT_SORTED);
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_CURRENT);
    if(token.i > -1) $(`#visual div:eq(${token.i})`).css("background-color", COLOR_CURRENT);
    if(token.i > 0)$(`#visual div:eq(${token.i-1})`).css("background-color", COLOR_NOT_SORTED);
    break;
    case "swap":
    $(`#visual div:eq(${token.a})`).css("height", 100*token.a_val/arr.length + "%");
    $(`#visual div:eq(${token.b})`).css("height", 100*token.b_val/arr.length + "%");
    break;
    case "pivot":
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_NORMAL);
    break;
    case "clr":
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_NOT_SORTED);
    if(token.index2 > -1) $(`#visual div:eq(${token.index2})`).css("background-color", COLOR_NOT_SORTED);
    break;
    case "sorted":
      $(`#visual div`).css("background-color", COLOR_SORTED);
    break;
  }
}

// { type: "swap", a: , b: }
// { type: "lr", l: , r: }
// { type: "clr", a: , b: }

function parseHeap(token) {
  switch(token.type) {
    case "swap":
    $(`#visual div:eq(${token.a})`).css("height", 100*token.a_val/arr.length + "%");
    $(`#visual div:eq(${token.b})`).css("height", 100*token.b_val/arr.length + "%");
    break;
    case "lr":
    if(token.l < token.n) $(`#visual div:eq(${token.l})`).css("background-color", COLOR_CURRENT);
    if(token.r < token.n) $(`#visual div:eq(${token.r})`).css("background-color", COLOR_CURRENT);
    break;
    case "clr":
    $(`#visual div:eq(${token.a})`).css("background-color", COLOR_NOT_SORTED);
    if(token.b > -1) $(`#visual div:eq(${token.b})`).css("background-color", COLOR_NOT_SORTED);
    break;
    case "larg":
    $(`#visual div:eq(${token.index})`).css("background-color", COLOR_NORMAL);
    break;
    case "sorted":
      $(`#visual div`).css("background-color", COLOR_SORTED);
    break;
  }
}
//

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

// Algorithms

function selectionSort() {
  anims = [];
  let i, j, min_idx;

  for(i = 0; i < arr.length-1; i++){
    min_idx = i;
    for(j = i + 1;j<arr.length;j++){
      anims.push({type: "next", index: j, min: min_idx, prev: i});
      if(arr[j] < arr[min_idx]){
        min_idx = j;
      }
    }
    anims.push({type: "next", index: -1, min: min_idx, prev: i});
    [arr[i], arr[min_idx]] = [arr[min_idx], arr[i]];
    anims.push({type:"swap", a: i, b: min_idx, a_val: arr[i], b_val: arr[min_idx]});
  }
  anims.push({type:"swap", a: arr.length-1, b: arr.length-1, a_val: arr[arr.length-1], b_val: arr[arr.length-1]});
}

function bubbleSort() {
  anims = [];
  let i,j;
  for(i=0;i<arr.length-1;i++){
    for(j=0;j<arr.length-1-i;j++){
      anims.push({type: "next", index: j});
      if(arr[j] > arr[j+1]){
        [arr[j],arr[j+1]] = [arr[j+1],arr[j]];
        anims.push({type: "swap", a: j, b: j+1, a_val: arr[j], b_val: arr[j+1]});
      }
    }
    anims.push({type:"sorted", index: arr.length-1-i});
  }
  anims.push({type:"sorted", index: 0});
}

function insertionSort() {
  anims = [];
  let i, key, j;
  for(i=1;i<arr.length;i++){
    key = arr[i];
    anims.push({type: "change", index: i, is: true});
    j = i - 1;

    while(j >= 0 && arr[j] > key) {
      arr[j+1] = arr[j];
      anims.push({type: "swap", a: j, b: j+1, a_val: key, b_val: arr[j+1]});
      j--;
    }
    arr[j + 1] = key;
    anims.push({type: "change", index: j+1, is: false});
  }
  anims.push({type: "sorted"});
}

function merge(l,m,r) {
  let n1 = Math.floor(m - l + 1);
  let n2 = Math.floor(r - m);

  let L = [], R = [];

  for (let i = 0; i < n1; i++) {
    anims.push({ type:"next", index: l+i, change: -1});
    L.push(arr[l+i]);
  }
  for (let i = 0; i < n2; i++) {
    anims.push({ type:"next", index: m+1+i, change: -1});
    R.push(arr[m+1+i]);
  }
  anims.push({ type:"clr", index: r});

  let i = 0;
  let j = 0;
  let k = l;

  while(i < n1 && j < n2) {
    if(L[i] <= R[j]) {
      arr[k] = L[i];
      i++;
    }
    else{
      arr[k] = R[j];
      j++;
    }
    anims.push({ type:"next", index: k, change: arr[k]});
    k++;
  }

  while(i<n1) {
    arr[k] = L[i];
    anims.push({ type:"next", index: k, change: arr[k]});
    i++;
    k++;
  }

  while(j<n2) {
    arr[k] = R[j];
    anims.push({ type:"next", index: k, change: arr[k]});
    j++;
    k++;
  }

  anims.push({ type:"clr", index: k-1});
}

function mergeSort(l,r){
  if(l >= r){
    return;
  }
  let m = Math.floor((l+r-1)/2);
  mergeSort(l,m);
  mergeSort(m+1,r);
  merge(l,m,r);
}

function partition(low,high){
  let pivot = arr[high];
  anims.push({type: "pivot", index: high});
  let i = (low - 1);

  for(let j=low;j<=high-1;j++){
    if(arr[j] < pivot) {
      i++;
      [arr[i],arr[j]] = [arr[j],arr[i]];
      anims.push({type: "swap", a: i, b: j, a_val: arr[i], b_val: arr[j]});
    }
    anims.push({type:"next", index: j, i: i});
  }
  anims.push({type: "clr", index: high-1, index2: i});
  [arr[i+1],arr[high]] = [arr[high],arr[i+1]];
  anims.push({type: "swap", a: i+1, b: high, a_val: arr[i+1], b_val: arr[high]});
  anims.push({type: "clr", index: high, index2: -1});
  return i+1;
}

function quickSort(low,high) {
  if(low < high) {
    let pi = partition(low,high);

    quickSort(low, pi-1);
    quickSort(pi+1,high);
  }
}

function heapify(n, i) {
  let largest = i;
  let l = 2*i + 1;
  let r = 2*i + 2;
  anims.push({type: "lr", l: l, r: r, n: n});
  if(l < n && arr[l] > arr[largest])
    largest = l;
  if(r < n && arr[r] > arr[largest])
    largest = r;
  anims.push({type: "larg", index: largest});
  anims.push({type: "clr", a: l, b: r});
  anims.push({type: "clr", a: largest, b: -1});
  if(largest != i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    anims.push({type: "swap", a: i, b: largest, a_val: arr[i], b_val: arr[largest]});
    heapify(n, largest);
  }
}

function heapSort(n) {
  for(let i = Math.floor(n/2) - 1; i >= 0;i--) {
    heapify(n,i);
  }
  for(let i = n-1;i>0;i--){
    [arr[0], arr[i]] = [arr[i], arr[0]];
    anims.push({type: "swap", a: 0, b: i, a_val: arr[0], b_val: arr[i]});
    heapify(i,0);
  }
}

// Calling Algorithms

function startParsing() {
  var output = document.getElementById("spd_val");
  let speed = 2000/Number(output.textContent);
  if (index == 0){
    if(alg == "none"){
      $(".edit p").text("Please select algorithm!");
      return;
    }
  }
  $(".edit p").text("Message");
  $("#startBtn").prop("disabled", true);
  $("#stopBtn").prop("disabled", false);
  switch(alg) {
    case "sel":
    if(index == 0 ) selectionSort();
    animator = setInterval(parseAnims, speed, parseSelection);
    break;
    case "bubb":
    if(index == 0 ) bubbleSort();
    animator = setInterval(parseAnims, speed, parseBubble);
    break;
    case "insert":
    if(index == 0 ) insertionSort();
    animator = setInterval(parseAnims, speed, parseInsertion);
    break;
    case "merge":
    if(index == 0 ) {
      anims = [];
      mergeSort(0,arr.length-1);
      anims.push({type: "sorted"});
    }
    animator = setInterval(parseAnims, speed, parseMerge);
    break;
    case "quick":
    if(index == 0 ) {
      anims = [];
      quickSort(0,arr.length-1);
      anims.push({type: "sorted"});
    }
    animator = setInterval(parseAnims, speed, parseQuick);
    break;
    case "heap":
    if(index == 0 ) {
      anims = [];
      heapSort(arr.length);
      anims.push({type: "sorted"});
    }
    animator = setInterval(parseAnims, speed, parseHeap);
    break;
  }
}

function stopParsing() {
  $("#startBtn").prop("disabled", false);
  $("#resetBtn").prop("disabled", false);
  $("#stopBtn").prop("disabled", true);
  clearInterval(animator);
  $(".edit p").text("Don't change algorithm!");
}

function resetParsing() {
  index = 0;
  $(".edit p").text("Message");
  arr = [...back_up];
  showArr();
}
