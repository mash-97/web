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
    this.r = r;
    this.color = color;
    this.lifespan = lifespan;
    this.element = Xobject.createXobject(Xobject.PARENT_ELEMENT);
    this.setRadius();
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
  setRadius() {
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
    this.r += xobj.r;
    this.lifespan += (xobj.lifespan - xobj.passed_lifetime);
    this.setRadius();
    this.setStepVector(this.vx + xobj.vx, this.vy + xobj.vy);
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
    console.log("destroy: ", this.element);
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
  static MAX_OBJECTS = 30;
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

    console.log([object_creation_threshold, 
      default_lifespan, 
      smashing_threshold, 
      minimum_size_range, 
      maximum_size_range,
      minimum_speed_range,
      maximum_speed_range]);
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
      this.default_lifespan
    );
    this.objects.push(xobj);
    return xobj;
  }

  spawnNewObject() {
    let rv = Math.random();
    let r = null;
    
    while(r==0 || r==null)
      r = getRndInteger(this.minimum_size_range, this.maximum_size_range);
    
    if (rv >= this.object_creation_threshold && this.objects.length<MashWorld.MAX_OBJECTS) {
      let xobj = this.createNewObject(
        getRndInteger(0, this.N-r),
        getRndInteger(0, this.M-r),
        r,
        getRndInteger(this.minimum_speed_range, this.maximum_speed_range),
        getRndInteger(this.minimum_speed_range, this.maximum_speed_range),
      );
      return xobj;
    }
    return false;
  }

  run(){
    let to_be_deleted = [];
    this.spawnNewObject();
    this.objects.forEach((e)=>{
      let cx = parseInt(e.element.style.left);
      let cy = parseInt(e.element.style.top);

      let fp = calculateFinalPositionAndDirectionInSquareBoundary(cx, cy, e.vx, e.vy, this.N-e.r);
      
      
      e.setPosition(fp[0], fp[1]);
      e.setStepVector(fp[2], fp[3]);
      e.passed_lifetime += 1;
      e.setColor();
      if(e.passed_lifetime>=e.lifespan)
        to_be_deleted.push(e);
    });
    
    for(let i=0; i<this.objects.length; i++){
      if(to_be_deleted.indexOf(this.objects[i])!=-1)
        continue;
      for(let j=i+1; j<this.objects.length; j++){
        if(to_be_deleted.indexOf(this.objects[j])!=-1)
          continue;
        let touches = this.objects[i].touches(this.objects[j]);
        
        let dr = this.objects[i].r - this.objects[j].r;
        if(!touches || Math.abs(dr) < this.smashing_threshold)
          continue;
        
        let maxo, mino;
        if(this.objects[i].r >= this.objects[j].r){
          maxo = this.objects[i];
          mino = this.objects[j];
        }
        else {
          maxo = this.objects[j];
          mino = this.objects[i];
        }
        console.log(this.objects[i].color);
        console.log(this.objects[i].color != this.objects[j].color);
        if(this.objects[i].color != this.objects[j].color) {
          // smash oout
          this.smash(maxo, mino);
          to_be_deleted.push(mino);
          to_be_deleted.push(maxo);
        }
        else {
          maxo.devour(mino);
          to_be_deleted.push(mino);
        }
          
      }
    }

    for(let t=0; t<to_be_deleted.length; t++) {
      to_be_deleted[t].destroy();
      this.objects.splice(this.objects.indexOf(to_be_deleted[t]), 1);
    }
  }
}


let object_creation_threshold_element = document.getElementById('object_creation_threshold');
let default_lifespan_element = document.getElementById('default_lifespan');
let smashing_threshold_element = document.getElementById('smashing_threshold');
let minimum_size_range_element = document.getElementById('minimum_size_range');
let maximum_size_range_element = document.getElementById('maximum_size_range');
let minimum_speed_range_element = document.getElementById('minimum_speed_range');
let maximum_speed_range_element = document.getElementById('maximum_speed_range');

let mw = null;


let XXX;
function rs(interval=1000/5){
  XXX = setInterval(()=> mw.run(), interval);
}
function rst(){
  clearInterval(XXX);
}

document.getElementById('set_config').onclick = (e)=>{
  mw = new MashWorld(
    parseFloat(object_creation_threshold_element.value),
    parseInt(default_lifespan_element.value),
    parseFloat(smashing_threshold_element.value),
    parseInt(minimum_size_range_element.value),
    parseInt(maximum_size_range_element.value),
    parseInt(minimum_speed_range_element.value),
    parseInt(maximum_speed_range_element.value)
  );
  e.target.hidden = true;
  document.getElementById('start_button').hidden = false;
}
document.getElementById('start_button').onclick = (e)=>{
  if(e.target.innerText=='Play'){
    e.target.innerText = 'Pause';
    rs();
  }
  else {
    e.target.innerText = 'Play';
    rst();
  }
};