function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}



// Calculate the final position of an object inside 
// a BOUNDARY * BOUNDARY square bundary.
// Arguments: Current position (x,y) and initial step vectors (VX, VY)
// Returns: final position (x,y) and finalized vectors (VX, VY)
function  calculateFinalPositionAndDirectionInSquareBoundary(x, y, VX, VY, BOUNDARY, cvx=VX, cvy=VY) {
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
    passed_vx = Math.round(parseFloat(((cvy-remaining_vy)/(VY/VX)).toFixed(2))); // passed vy based on passed vx
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
    passed_vx = Math.round(parseFloat(((cvy-remaining_vy)/(VY/VX)).toFixed(2))); // passed vy based on passed vx
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

/* Board Matrix Size */
N = 700;
M = 700;
let BOARD = document.getElementById("board");
BOARD.style.width = N+"px";
BOARD.style.height = M+"px";

class Xobject {
  static PARENT_ELEMENT = document.getElementById('board');
  static NUMBER_OF_OBJECTS = 0;
  constructor(x, y, r, vx, vy, color, lifespan=10) {
    this.color = color;
    this.lifespan = lifespan;
    this.element = Xobject.createXobject(Xobject.PARENT_ELEMENT);
    this.setRadius(r);
    this.setColor();
    this.setPosition(x, y);
    this.vx = vx;
    this.vy = vy;
    this.passed_lifetime = 1;
  }
  getLifeForce(){
    return 1-parseFloat(this.passed_lifetime/this.lifespan).toFixed(2);
  }
  setColor() {
    this.element.style.backgroundColor = this.color(this.getLifeForce());
  }
  setRadius(radius) {
    this.r = radius;
    this.element.style.width = this.r+"px";
    this.element.style.height = this.r+"px";
  }
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.element.style.left = this.x+"px";
    this.element.style.top = this.y+"px";
  }
  setStepVector(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }

  devour(xobj) {
    return xobj;
  }

  touches(xobj) {
    let x1 = this.x, x1r = this.x+this.r, y1 = this.y, y1r = this.y+this.r;
    let x2 = xobj.x, x2r = xobj.x+xobj.r, y2 = xobj.y, y2r = xobj.y+xobj.r;

    if(x1r<x2 || x1>x2r)
      return false;
    if(y1r<y2 || y1>y2r)
      return false;
    return true;
  }

  destroy() {
    Xobject.PARENT_ELEMENT.removeChild(this.element);
  }

  static reproduce(xobj_1, xobj_2) {
    return [xobj_1, xobj_2];
  }

  static createXobject(parent_element){
    let element = document.createElement("div");
    Xobject.NUMBER_OF_OBJECTS += 1;
    element.id = `xo_${Xobject.NUMBER_OF_OBJECTS}`;
    element.classList.add("circle");
    parent_element.appendChild(element);
    return element;
  }
}

class MashWorld {
  static N = 700;
  static M = 700;
  static R = 5.00; // threshold a new object produces
  DEFAULT_RADIUS_COMPS = 30;
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

  constructor(
    object_creation_threshold, 
    default_lifespan, 
    smashing_threshold, 
    minimum_size_range, 
    maximum_size_range,
    minimum_speed_range,
    maximum_speed_range
  ) {
    this.N = MashWorld.N;
    this.M = MashWorld.M;
    this.R = MashWorld.R;
    this.object_creation_threshold = object_creation_threshold;
    this.default_lifespan = default_lifespan;
    this.smashing_threshold = smashing_threshold;
    this.minimum_size_range = minimum_size_range;
    this.maximum_size_range = maximum_size_range;
    this.minimum_speed_range = minimum_speed_range;
    this.maximum_speed_range = maximum_speed_range;
    this.objects = [];
  }
  smash(bxo, sxo) {
    let number_of_objects = parseInt(bxo.r / sxo.r);
    for(let t=0; t<number_of_objects; t++) {
      this.createNewObject(
        bxo.x,
        bxo.y,
        sxo.r,
        [bxo.vx, -bxo.vx][getRndInteger(0, 1)],
        [bxo.vy, -bxo.vy][getRndInteger(0, 1)],
        bxo.color,
        bxo.lifespan+sxo.lifespan
      );
    }
  }
  createNewObject(x, y, r, vx, vy) {
    let xobj = new Xobject(
      x,
      y,
      r,
      vx,
      vy,
      this.COLORS[getRndInteger(0, 2)],
      10
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
      return xobj;
    }
    return false;
  }

  run(oct=0.5, smin=-7, smax=7, r=this.DEFAULT_RADIUS_COMPS){
    this.spawnNewObject(smin, smax, r);
    this.objects.forEach((e)=>{
      let cx = parseInt(e.element.style.left);
      let cy = parseInt(e.element.style.top);

      let fp = calculateFinalPositionAndDirectionInSquareBoundary(cx, cy, e.vx, e.vy, this.N-e.r);
      
      
      e.element.style.left = fp[0]+"px";
      e.element.style.top = fp[1]+"px";
      e.vx = fp[2];
      e.vy = fp[3];
      e.passed_lifetime += 1;
      e.setColor();
      if(e.passed_lifetime>=e.lifespan) {
        this.objects.splice(this.objects.indexOf(e), 1);
        e.destroy();
      }
    });
    for(let i=0; i<this.objects.length; i++){
      for(let j=i+1; j<this.objects.length; j++){
        let temp = this.objects[i].touches(this.objects[j]);
        if(temp)
          console.log(`${this.objects[i].element.id} <=> ${this.objects[j].element.id}: ${temp}`);
          if(this.objects[])
      }
    }

  }
}


let mw = new MashWorld(700, 700, 0.5);
// mw.createNewObject(550, 500, 20, 50, -30);
for(let t=0; t<=10; t++)
  mw.spawnNewObject(
    getRndInteger(-25, 25),
    getRndInteger(-25, 25)
  );

let XXX;
function rs(interval=1000){
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