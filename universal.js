let alg = "none";

function changeIndex(el) {
  if(alg != 'none'){
    document.getElementById(alg).classList = "forselect";
  }
  alg = el.id;
  el.classList += ' checked';
}

function newRandomArray(n) {
  let arr = [];
  for (let i = 0; i < n; i++) {
    let k, b;
    do {
      k = Math.floor((Math.random()*n)+1);
      b = false;
      for(let j = 0; j < arr.length; j++){
        if(k == arr[j]){
          b = true;
          break;
        }
      }
    } while (b);
    arr.push(k);
  }
  return arr;
}

function newSortedArray(n) {
  let arr = [];
  for (let i = 1; i <= n; i++) {
    arr.push(i);
  }
  return arr;
}

var slider = document.getElementById("myRange");
var output = document.getElementById("spd_val");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}
