// mots liés aux causes, les raisons des problèmes d’aujourd’hui
const reasonsArray = [ "car","vehicle","pollution", "gas", "emission", "environment", "carbon", "CO2", "PPM", "methane", "dioxid", "barrel", "oil", "megawatt", "endanger", "acid", "GHG", "fuel","alarmist"];
const reasonsColor = "rgb(0, 230, 224)";
let reasonsFont;

// mots liés aux conséquences
const consequencesArray = [ "medieval","melt","degree","sea-level rise","warm","temperature","AGW","climate","Cyclon", "storm", "hurrican", "flood", "endanger", "coral", "phytoplankton", "ozone", "extinction", "bear", "polar", "sea-level rise", "impact", "conservation", "species", "adapt", "mercuri", "forest", "calcification", "RGGI", "disease",];
const consequencesColor = "rgb(0, 230, 224)";
let consequencesFont;

// mots liés aux initiatives prises
const initiativesArray = ["energy","Earth","USHCN","INDC", "UNFCCC",  "COP21", "INDC", "temperature", "science", "mitigation", "palaeo", "renew", "reactor", "nuclear", "cultivar", "recycle", "ratified", "treati", "consensus", "develop", "conservation", "EPA", "simulation", "green", "EIA", "CLF", "NHTSA", "MGP", "NAAQ", "NDVI", "USHCN", "integrity", "turbin", "wind","hydrogen"];
const initiativesColor = "rgb(230, 192, 5)";
let initiativesFont;


function preload() {
  reasonsFont = loadFont('fonts/Director-bold.otf');
  consequencesFont = loadFont('fonts/Venus+Acier.otf');
  initiativesFont = loadFont('fonts/Compagnon-Bold.otf');
}


// Inspiré du code de Daniel Shiffman
// The Nature of Code
// http://natureofcode.com


const canvasPixelsX = 720;
const canvasPixelsY = 576;

boids = [];

function setup() {
  createCanvas(canvasPixelsX, canvasPixelsY);
  // Add an initial set of boids into the system
  for (let i = 0; i < 10; i++) {
     let b = new Boid(width / 2, height / 2, random(reasonsArray), reasonsColor, reasonsFont);
    boids.push(b);
  }
}

function draw() {
  background(25, 15, 0);
  for (let i = 0; i < boids.length; i++) {
    boids[i].run(boids);  // Passing the entire list of boids to each boid individually
  }
}

function mousePressed() {
  currentArray = random([reasonsArray, initiativesArray, consequencesArray]);
  if (currentArray == reasonsArray) {
    currentColor = reasonsColor;
    currentFont = reasonsFont;
  }
  if (currentArray == consequencesArray) {
    currentColor = consequencesColor;
    currentFont = consequencesFont;
  }
  if (currentArray == initiativesArray) {
    currentColor = initiativesColor;
    currentFont = initiativesFont;
  }
 
  for (let i = 0; i < 10; i++) {
    let b = new Boid(width / 2, height / 2, random(currentArray), currentColor, currentFont);
    boids.push(b);
  }
}


// BOID CLASS
// Methods for Separation, Cohesion, Alignment added
function Boid(x, y, text, color, font) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);
  this.r = 3.0;
  this.maxspeed = 2;    // Maximum speed
  this.maxforce = 0.05; // Maximum steering force
  this.text = text;
  this.color = color;
  this.font = font;
}

Boid.prototype.run = function (boids) {
  this.flock(boids);
  this.update();
  this.borders();
  this.render();
}

Boid.prototype.applyForce = function (force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function (boids) {
  let sep = this.separate(boids);   // Separation
  let ali = this.align(boids);      // Alignment
  let coh = this.cohesion(boids);   // Cohesion
  // Arbitrarily weight these forces
  sep.mult(5);
  ali.mult(1.0);
  coh.mult(0.2);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}

// Method to update location
Boid.prototype.update = function () {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function (target) {
  let desired = p5.Vector.sub(target, this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}

// Draw the boid content rotated in the direction of velocity
Boid.prototype.render = function () {
  fill(this.color);
  push();
  translate(this.position.x, this.position.y);
  textSize(20);
  textFont(this.font);
  text(this.text, 0, 0);
  pop();
}

// Wraparound
Boid.prototype.borders = function () {
  if (this.position.x < -this.r) this.position.x = width + this.r;
  if (this.position.y < -this.r) this.position.y = height + this.r;
  if (this.position.x > width + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;
}


// SEPARATION
// Method checks for nearby boids and steers away
Boid.prototype.separate = function (boids) {
  let desiredseparation = 25.0;
  let steer = createVector(0, 0);
  let count = 0;
  // For every boid in the system, check if it's too close
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);        // Weight by distance
      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}


// ALIGNMENT
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function (boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  }
  else {
    return createVector(0, 0);
  }
}


// COHESION
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function (boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);  // Steer towards the location
  }
  else {
    return createVector(0, 0);
  }
}