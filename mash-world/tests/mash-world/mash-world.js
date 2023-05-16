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

  createNewObject(x, y, r, vx, vy) {
    let xobj = new Xobject(
      x,
      y,
      r,
      vx,
      vy,
      this.COLORS[getRndInteger(0, 2)],
      `xo_${this.objects.length}`,
      10,
      document.getElementById("board")
    );
    this.objects.push(xobj);
    return xobj;
  }

  spawnNewObject(smin, smax, r=this.DEFAULT_RADIUS_COMPS) {
    let rv = Math.random();
    if (rv >= this.R) {
      let xobj = this.createNewObject(
        getRndInteger(0, this.N-r),
        getRndInteger(0, this.M-r),
        r,
        getRndInteger(smin, smax),
        getRndInteger(smin, smax),
      );
      this.objects.push(xobj);
      return xobj;
    }
    return false;
  }

  run(){
    this.objects.forEach((e)=>{
      console.log(`==> for element: `, e.element);
      let cx = parseInt(e.element.style.left);
      let cy = parseInt(e.element.style.top);

      let fp = calculateFinalPositionAndDirectionInSquareBoundary(cx, cy, e.vx, e.vy, this.N-e.r);
      
      
      e.element.style.left = fp[0]+"px";
      e.element.style.top = fp[1]+"px";
      e.vx = fp[2];
      e.vy = fp[3];
      console.log(`fp: `, fp);
    });
  }
}

// Calculate the final position of an object inside 
// a BOUNDARY * BOUNDARY square bundary.
// Arguments: Current position (x,y) and initial step vectors (VX, VY)
// Returns: final position (x,y) and finalized vectors (VX, VY)
function  calculateFinalPositionAndDirectionInSquareBoundary(x, y, VX, VY, BOUNDARY, cvx=VX, cvy=VY) {
  console.log(`x: ${x}, y: ${y}, cvx: ${cvx}, cvy: ${cvy}`);
  // recursive base condition
  if(cvx==0 && cvy==0)
    return [x, y, VX, VY];
  
  let remaining_vx, remaining_vy;
  let passed_vx, passed_vy;

  // if it crosses the right boundary
  if(x+cvx >= BOUNDARY && cvx!=0) {
    remaining_vx = x + cvx - BOUNDARY; // remaining vx vector
    x = BOUNDARY;
    passed_vy = Math.round(parseFloat(((cvx-remaining_vx)*(VY/VX)).toFixed(2))); // passed vy based on passed vx
    y = y + passed_vy;
    remaining_vy = cvy-passed_vy;

    return calculateFinalPositionAndDirectionInSquareBoundary(
      x,
      y,
      VX*(-1),  // as it hits the right most boundary
      VY,
      BOUNDARY,
      remaining_vx*(-1),
      remaining_vy
    );
  }

  // if it crosses the bottom boundary
  if(y+cvy >= BOUNDARY && cvy!=0) {
    remaining_vy = y + cvy - BOUNDARY; // remaining vx vector
    y = BOUNDARY;
    passed_vx = Math.round(parseFloat(((cvy-remaining_vy)*(VY/VX)).toFixed(2))); // passed vy based on passed vx
    x = x + passed_vx;
    remaining_vx = cvx-passed_vx;

    return calculateFinalPositionAndDirectionInSquareBoundary(
      x,
      y,
      VX,  
      VY*(-1), // as it hits the bottom most boundary
      BOUNDARY,
      remaining_vx,
      remaining_vy*(-1)
    );
  }
  // if it crosses the left boundary (incomplete)
  if(x+cvx <= 0 && cvx!=0) {
    let remaining_vx = x + cvx - 0; // remaining vx vector
    x = 0;
    let passed_vy = Math.round(parseFloat(((cvx-remaining_vx)*(VY/VX)).toFixed(2))); // passed vy based on passed vx
    y = y + passed_vy;
    let remaining_vy = cvy-passed_vy;

    return calculateFinalPositionAndDirectionInSquareBoundary(
      x,
      y,
      VX*(-1),  // as it hits the right most boundary
      VY,
      BOUNDARY,
      remaining_vx*(-1),
      remaining_vy
    );
  }

  // if it crosses the top boundary
  if(y+cvy <= 0 && cvy!=0) {
    remaining_vy = y + cvy - 0; // remaining vx vector
    y = 0;
    passed_vx = Math.round(parseFloat(((cvy-remaining_vy)*(VY/VX)).toFixed(2))); // passed vy based on passed vx
    x = x + passed_vx;
    remaining_vx = cvx-passed_vx;

    return calculateFinalPositionAndDirectionInSquareBoundary(
      x,
      y,
      VX,  
      VY*(-1), // as it hits the top most boundary
      BOUNDARY,
      remaining_vx,
      remaining_vy*(-1)
    );
  }


  return [x+cvx, y+cvy, VX, VY];
}


let mw = new MashWorld(700, 700, 0.5);
mw.createNewObject(550, 500, 20, 50, -30);
for(let t=0; t<=30; t++)
  mw.spawnNewObject(
    getRndInteger(-5, 5),
    getRndInteger(-5, 5)
  );

let XXX;
function rs(interval=1000/60){
  XXX = setInterval(()=> mw.run(), interval);
}
function rst(){
  clearInterval(XXX);
}

document.getElementById('start_button').onclick = (e)=>{
  console.log('e: ', e);
  if(e.target.innerText=='Start'){
    e.target.innerText = 'Stop';
    rs();
  }
  else {
    e.target.innerText = 'Start';
    rst();
  }
};