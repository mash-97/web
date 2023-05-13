function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

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
function start() {
  y1 = setInterval(()=>movc(c1, 5, 0, 500, -1), 0.05);
  y2 = setInterval(()=>movc(c2, 10, 10, 500, 500), 100);
  y3 = setInterval(()=>movc(c3, 0, 10, -1, 500), 100);
}

function stop() {
  clearInterval(y1);
  clearInterval(y2);
  clearInterval(y3);
}

class Xobject {
  constructor(x, y, r, vx, vy, c, id, lifespan=10, parent_element=null) {
    console.log(`x: ${x}, y: ${y}, r: ${r}, vx: ${vx}, vy: ${vy}, c: `, c);
    this.x = x;
    this.y = y;
    this.r = r;
    this.vx = vx;
    this.vy = vy;
    this.c = c;
    this.id = id;
    this.lifespan = lifespan;
    this.manifest(parent_element || document.getElementsByTagName("body"));
  }

  manifest(pe){
    console.log(`pe: `, pe);
    this.element = document.createElement("div");
    this.element.id = this.id;
    this.element.classList.add("circle");
    this.element.style.backgroundColor = this.c(1);
    this.element.style.width = this.r+"px";
    this.element.style.height = this.r+"px";
    this.element.style.left = this.x+"px";
    this.element.style.top = this.y+"px";
    pe.appendChild(this.element);
  }
}

class MashWorld {
  N = 700;
  M = 700;
  R = 5.00; // threshold a new object produces
  DEFAULT_RADIUS_COMPS = 10;
  COLORS = [
    (a) => {
      return `rgba(100, 0, 0, ${a})`;
    },
    (a) => {
      return `rgba(0, 100, 0, ${a})`;
    },
    (a) => {
      return `rgba(0, 0, 100, ${a})`;
    }
  ];

  constructor(N = 700, M = 700, R = 0.5) {
    this.N = N;
    this.M = M;
    this.R = R;
    this.objects = [];
  }

  spawnNewObject(smin, smax) {
    let rv = Math.random();
    console.log(`rv: ${rv}`);
    if (rv >= this.R) {
      let xobj = new Xobject(
        getRndInteger(0, this.N),
        getRndInteger(0, this.M),
        this.DEFAULT_RADIUS_COMPS,
        getRndInteger(smin, smax),
        getRndInteger(smin, smax),
        this.COLORS[getRndInteger(0, 2)],
        `xo_${this.objects.length}`,
        10,
        document.getElementById("board")
      );
      this.objects.push(xobj);
      return xobj;
    }
    return false;
  }
}


let mw = new MashWorld(700, 700, 0.5);
mw.spawnNewObject(-10, 10); 
for(let x=1; x<=100; x++)
  mw.spawnNewObject(-10, 10);

function run(){
  mw.objects.forEach((e)=>{
    e.element.style.top = (parseInt(e.element.style.top)+e.vy)+"px";
    e.element.style.left = (parseInt(e.element.style.left)+e.vx)+"px";
    
  });
}
let XXX;
function rs(){
  XXX = setInterval(run, 500);
}
function rst(){
  clearInterval(XXX);
}