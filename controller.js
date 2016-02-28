var dualShock = require('dualshock-controller');
var RollingSpider = require('rolling-spider');
var rollingSpider = new RollingSpider();
var speed = 100;

var state = {
  inAir: false
}

//pass options to init the controller.
var controller = dualShock(
    {
	//you can use a ds4 by uncommenting this line.
	//config: 'dualshock4-generic-driver',
	//if using ds4 comment this line.
	config : 'dualShock3',
	//smooths the output from the acelerometers (moving averages) defaults to true
	accelerometerSmoothing : true,
	//smooths the output from the analog sticks (moving averages) defaults to false
	analogStickSmoothing : false
});

//make sure you add an error event handler
controller.on('error', (data) => {
    //...someStuffDidNotWork();
    console.log('ERROR:', data);
});

//add event handlers:
controller.on('left:move', (data) => {
    console.log('left:move', normalize(data));
    var normalized = normalize(data);
    if( !!Math.ceil(normalized.x) ){
      turn(normalized);
    }
    if( !!Math.ceil(normalized.y) ){
      elevate(normalized)
    }

});
controller.on('right:move', (data) => {
    console.log('right:move', normalize(data));
});
controller.on('connected', (data) => {
    console.log('connected', data);
});
controller.on('square:press',  (data) => {
    console.log('square:press', data);
});
controller.on('square:release',  (data) => {
    console.log('square:release', data);
});
controller.on('triangle:release',  (data) => {
    console.log('triagle:release', data);
    takeOffOrLand();
});
controller.on('circle:release',  (data) => {
    console.log('triagle:release', data);
    kill();
});
controller.on('start:release',  (data) => {
    console.log('start:release', data);
    setupDrone();
});

//connect the controller
controller.connect();

function elevate(value){
  if(value.y > 0){
    rise(value.y);
  }else {
    fall(value.y);
  }
}

function turn(value){
  if(value.x > 0){
    turnCounterClockWise(value.x);
  }else {
    turnClockWise(value.x);
  }
}

function turnClockWise(much){
  console.log('turnClockWise', much);
  rollingSpider.clockwise({steps: much, speed});
}

function turnCounterClockWise(much){
  console.log('turnCounterClockWise', much);
  rollingSpider.counterClockwise({steps: much, speed});
}

function rise(much){
  console.log('rise', much);
  rollingSpider.up({steps: much, speed})
}

function fall(much){
  console.log('fall', much);
  rollingSpider.down({steps: much, speed})
}

function normalize(value){
  return Object.keys(value).reduce((prev, key) => {
    prev[key] = (128 - value[key]) / 128 * 25;
    return prev;
  }, {});
  //
}

function setupDrone(){
  console.log('connecting to drone');
  rollingSpider.connect(() => {
    console.log('drone connected');
    rollingSpider.setup(() => {
      console.log('drone setup');
      rollingSpider.flatTrim();
      rollingSpider.startPing();
      console.log('pinging drone');
    });
  });
}

function takeOffOrLand(){
  if(state.inAir){
    land();
  }else {
    takeOff();
  }
}

function takeOff(){
  console.log('taking off');
  rollingSpider.takeOff();
  rollingSpider.flatTrim();
  state.inAir = true;
}

function land(){
  console.log('landing');
  rollingSpider.land();
  state.inAir = false;
}

function kill(){
  console.log('KILL!!!');
  rollingSpider.emergancy()
}
