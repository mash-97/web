/* Board Matrix Size */
N = 700;
M = 700;
let BOARD = document.getElementById("board");
BOARD.style.width = N+"px";
BOARD.style.height = M+"px";


let c1 = document.getElementById("c1");
let c2 = document.getElementById("c2");
let c3 = document.getElementById("c3");


function movc(c, ts, ls, tl, ll){
  let cv_t = parseInt(c.style.top) || 0;
  let cv_l = parseInt(c.style.left) || 0;
  
  if(tl>=0 && cv_t>=tl){
    c.style.top = "0px";
  }
  else{
    c.style.top = (cv_t+ts)+"px";
  }
  if(ll>=0 && cv_l>=ll){
    c.style.left = "0px";
  }
  else{
    c.style.left = (cv_l+ls)+"px";
  }
}

let y1, y2, y3;
function start(){
  y1 = setInterval(()=>movc(c1, 5, 0, 500, -1), 0.05);
  y2 = setInterval(()=>movc(c2, 10, 10, 500, 500), 100);
  y3 = setInterval(()=>movc(c3, 0, 10, -1, 500), 100);
}

function stop(){
  clearInterval(y1);
  clearInterval(y2);
  clearInterval(y3);
}

// class MashWorld{
//   N = 500;
//   M = 500;
//   R = 5.00; // threshold a new object produces
//   constructor(r, )
// }