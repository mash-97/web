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

class Bubble {
  static PARENT_ELEMENT = document.getElementById('board');
  static NUMBER_OF_OBJECTS = 0;
  constructor(x, y, r, vx, vy, color, lifespan=10) {
    this.r = r;
    this.color = color;
    this.lifespan = lifespan;
    this.element = Bubble.createBubble(Bubble.PARENT_ELEMENT);
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
    // console.log("destroy: ", this.element);

    if(Bubble.PARENT_ELEMENT.contains(this.element))
      Bubble.PARENT_ELEMENT.removeChild(this.element);
    else
      console.log('mismatched destroy call for: ', this.element);
  }

  static reproduce(xobj_1, xobj_2) {
    return [xobj_1, xobj_2];
  }

  static createBubble(parent_element){
    let element = document.createElement("div");
    Bubble.NUMBER_OF_OBJECTS += 1;
    element.id = `xo_${Bubble.NUMBER_OF_OBJECTS}`;
    element.classList.add("circle");
    parent_element.appendChild(element);
    return element;
  }
}

class BubbleWorld {
  static N = 700;
  static M = 700;
  static R = 5.00; // threshold a new object produces
  static TOC = document.getElementById('toc');
  static TOD = document.getElementById('tod');
  static NCO = document.getElementById('nco');
  static NCO_TOC = document.getElementById('nco_toc');
  static TOD_TOC = document.getElementById('tod_toc');
  static MAA = document.getElementById('maa');
  static MSA = document.getElementById('msa');

  static MAX_OBJECTS = 30;

  static COLORS = [
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
  TOTAL_OBJECTS_CREATED = 0;
  TOTAL_OBJECTS_DESTROYED = 0;
  constructor(
    object_creation_threshold, 
    default_lifespan, 
    smashing_threshold, 
    minimum_size_range, 
    maximum_size_range,
    minimum_speed_range,
    maximum_speed_range
  ) {
    this.N = BubbleWorld.N;
    this.M = BubbleWorld.M;
    this.R = BubbleWorld.R;
    this.object_creation_threshold = object_creation_threshold;
    this.default_lifespan = default_lifespan;
    this.smashing_threshold = smashing_threshold;
    this.minimum_size_range = minimum_size_range;
    this.maximum_size_range = maximum_size_range;
    this.minimum_speed_range = minimum_speed_range;
    this.maximum_speed_range = maximum_speed_range;
    this.objects = [];
    this.maximum_age_attained = 0;
    this.maximum_size_attained = 0;

    console.log([object_creation_threshold, 
      default_lifespan, 
      smashing_threshold, 
      minimum_size_range, 
      maximum_size_range,
      minimum_speed_range,
      maximum_speed_range]);
  }
  smash(maxo, mino) {
    let number_of_objects = Math.round(parseInt(maxo.r / mino.r));
    for(let t=0; t<number_of_objects; t++) {
      this.createNewObject(
        maxo.x,
        maxo.y,
        mino.r,
        [maxo.vx, -maxo.vx, maxo.vy, -maxo.vy][getRndInteger(0, 3)],
        [maxo.vx, -maxo.vx, maxo.vy, -maxo.vy][getRndInteger(0, 3)],
        maxo.color,
        (maxo.lifespan-maxo.passed_lifetime)+(mino.lifespan-mino.passed_lifetime)
      );
    }
  }
  createNewObject(x, y, r, vx, vy, color=null, lifespan=null) {
    color = color || BubbleWorld.COLORS[getRndInteger(0, 2)];
    lifespan = lifespan || this.default_lifespan;
    let xobj = new Bubble(
      x,
      y,
      r,
      vx,
      vy,
      color,
      lifespan
    );
    this.objects.push(xobj);
    this.TOTAL_OBJECTS_CREATED += 1;
    
    return xobj;
  }

  spawnNewObject() {
    let rv = Math.random();
    let r = null;
    
    while(r==0 || r==null)
      r = getRndInteger(this.minimum_size_range, this.maximum_size_range);
    
    if (rv >= this.object_creation_threshold) {// && this.objects.length<BubbleWorld.MAX_OBJECTS) {
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
    // console.log('==> run started');
    let to_be_deleted = [];
    this.spawnNewObject();
    this.objects.forEach((e)=>{

      let fp = calculateFinalPositionAndDirectionInSquareBoundary(e.x, e.y, e.vx, e.vy, this.N-e.r);
      
      
      e.setPosition(fp[0], fp[1]);
      e.setStepVector(fp[2], fp[3]);
      e.passed_lifetime += 1;
      e.setColor();
      if(e.passed_lifetime>=e.lifespan){
        to_be_deleted.push(e);
      }

      if(e.r > this.maximum_size_attained)
        this.maximum_size_attained = e.r;
      if(e.passed_lifetime > this.maximum_age_attained)
        this.maximum_age_attained = e.passed_lifetime;
    });
    
    for(let i=0; i<this.objects.length; i++){
      if(to_be_deleted.indexOf(this.objects[i]) != -1) // if the object is in the to_be_deleted list, next
        continue;
      for(let j=i+1; j<this.objects.length; j++){
        if(to_be_deleted.indexOf(this.objects[j]) != -1) // if the object is in the to_be_deleted list, next
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

        if(this.objects[i].color != this.objects[j].color) {
          // smash oout
          this.smash(maxo, mino);
          to_be_deleted.push(mino);
          to_be_deleted.push(maxo);
        }
        else if(this.objects[i].color == this.objects[j].color) {
          maxo.devour(mino);
          to_be_deleted.push(mino);
        }
        break;
      }
    }

    for(let t=0; t<to_be_deleted.length; t++) {
      to_be_deleted[t].destroy();
      let indx = this.objects.indexOf(to_be_deleted[t]);
      if(indx>-1)
        this.objects.splice(indx, 1);
      this.TOTAL_OBJECTS_DESTROYED += 1;
    }
    BubbleWorld.TOD.textContent = this.TOTAL_OBJECTS_DESTROYED;
    BubbleWorld.NCO.textContent = this.objects.length;
    BubbleWorld.TOC.textContent = this.TOTAL_OBJECTS_CREATED;
    BubbleWorld.NCO_TOC.textContent = (this.objects.length / this.TOTAL_OBJECTS_CREATED).toFixed(4);
    BubbleWorld.TOD_TOC.textContent = (this.TOTAL_OBJECTS_DESTROYED / this.TOTAL_OBJECTS_CREATED).toFixed(4);
    BubbleWorld.MAA.textContent = this.maximum_age_attained;
    BubbleWorld.MSA.textContent = this.maximum_size_attained;
    // console.log('<=== run ended!');
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
function rs(interval=1000/60){
  XXX = setInterval(()=> mw.run(), interval);
}
function rst(){
  clearInterval(XXX);
}

document.getElementById('set_config').onclick = (e)=>{
  mw = new BubbleWorld(
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
let STI = document.getElementById('sti');
document.getElementById('start_button').onclick = (e)=>{
  if(e.target.innerText=='Play'){
    e.target.innerText = 'Pause';
    rs(parseInt(STI.value));
  }
  else {
    e.target.innerText = 'Play';
    rst();
  }
};