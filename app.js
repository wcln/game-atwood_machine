
var STAGE_WIDTH, STAGE_HEIGHT;

var massAValue = 2.5, massBValue = 2.5;

let massAHeight = 0;
let massBHeight = 0;

var lineA, lineB, shadowA, shadowB;

var spinningTween = null;

var ua = window.navigator.userAgent;
var is_ie = /MSIE|Trident/.test(ua);

function init() {
  if (is_ie) {
    $('#container').empty();
    $('#container').html("<h1>This WCLN media is not supported on Internet Explorer. Please use Chrome or Firefox.</h1>")
    // alert("This WCLN media is not supported on Internet Explorer. Please use Chrome or Firefox.");
  } else {
    STAGE_WIDTH = parseInt(document.getElementById("gameCanvas").getAttribute("width"));
    STAGE_HEIGHT = parseInt(document.getElementById("gameCanvas").getAttribute("height"));

    // Init stage object.
    stage = new createjs.Stage("gameCanvas");
    stage.mouseEventsEnabled = true;
    stage.enableMouseOver(); // Default, checks the mouse 20 times/second for hovering cursor changes

    setupManifest();
    startPreload();

    initListeners();

    stage.update();
  }
}

function initGraphics() {

  // Set mass values.
  massAValue = 2.5, massBValue = 2.5;
  $("#mass-a").val(massAValue * 10);
  $("#mass-b").val(massBValue * 10);
  $("#mass-a-value").html(massAValue.toFixed(1));
  $("#mass-b-value").html(massBValue.toFixed(1));

  // Pulley.
  pulley.regX = pulley.image.width/2;
  pulley.regY = pulley.image.height/2;
  pulley.x = STAGE_WIDTH/2;
  pulley.y = 125;
  pulley.rotation = 0;
  stage.addChild(pulley);

  // Support.
  support.x = STAGE_WIDTH/2 - support.image.width/2;
  support.y = 0;
  stage.addChild(support);

  // Lock.
  lock.x = STAGE_WIDTH/2 - lock.image.width/2;
  lock.y = pulley.y - lock.image.height/2;
  lock.alpha = 1;
  stage.addChild(lock);

  // Mass A.
  massA.x = STAGE_WIDTH/4 - massA.image.width/2 - 10;
  massA.y = STAGE_HEIGHT - 100 - massA.image.height;
  stage.addChild(massA);

  // Mass B.
  massB.x = ((STAGE_WIDTH/4) * 3) - massB.image.width/2 + 10;
  massB.y = STAGE_HEIGHT - 100 - massB.image.height;
  stage.addChild(massB);

  drawLines();

  stage.update();
}

function initListeners() {
  $("#mass-a").on('input', function(event) {
    massAValue = event.target.value / 10;
    $("#mass-a-value").html(massAValue.toFixed(1));
  });
  $("#mass-b").on('input', function(event) {
    massBValue = event.target.value / 10;
    $("#mass-b-value").html(massBValue.toFixed(1));
  });
}

function drawLines() {
  stage.removeChild(shadowA);
  stage.removeChild(shadowB);
  stage.removeChild(lineA);
  stage.removeChild(lineB);

  lineA = new createjs.Shape();
  lineB = new createjs.Shape();
  shadowA = new createjs.Shape();
  shadowB = new createjs.Shape();

  lineA.graphics.setStrokeStyle(3);
  lineA.graphics.beginStroke("#623823");
  lineA.graphics.moveTo(pulley.x - pulley.image.width/2 + 3, pulley.y).lineTo(massA.x + massA.image.width/2, massA.y + 3);
  shadowA.graphics.setStrokeStyle(1);
  shadowA.graphics.beginStroke("#331a0e");
  shadowA.graphics.moveTo(pulley.x - pulley.image.width/2 + 3, pulley.y).lineTo(massA.x + massA.image.width/2 - 1, massA.y + 3);

  lineB.graphics.setStrokeStyle(3);
  lineB.graphics.beginStroke("#623823");
  lineB.graphics.moveTo(pulley.x + pulley.image.width/2 - 3, pulley.y).lineTo(massB.x + massB.image.width/2, massB.y + 3);
  shadowB.graphics.setStrokeStyle(1);
  shadowB.graphics.beginStroke("#331a0e");
  shadowB.graphics.moveTo(pulley.x + pulley.image.width/2 - 4, pulley.y).lineTo(massB.x + massB.image.width/2 - 1, massB.y + 3);

  stage.addChildAt(shadowA, 0)
  stage.addChildAt(shadowB, 0)
  stage.addChildAt(lineA, 0);
  stage.addChildAt(lineB, 0);
}

function disableControls() {
  $("#release-btn").prop('disabled', true);
  $("#reset-btn").prop('disabled', true);
  $("#mass-a").prop('disabled', true);
  $("#mass-b").prop('disabled', true);
}

function enableControls() {
  $("#release-btn").prop('disabled', false);
  $("#reset-btn").prop('disabled', false);
  $("#mass-a").prop('disabled', false);
  $("#mass-b").prop('disabled', false);
}

function removeLock() {
  // Remove lock.
  createjs.Tween.get(lock).to({alpha: 0}, 400).call(function() {
    stage.removeChild(lock);
  });
}

function release() {

  disableControls();

  let a = calculateAcceleration();
  console.log('Acceleration: ' + a);
  if (a > 0) { // Mass A moving to bottom.

    removeLock();

    // Calculate the distance to the bottom.
    var distance = (STAGE_HEIGHT - massA.y - massA.image.height) / 10;

    console.log('Distance: ' + distance);

    // Calculate time to reach the bottom in ms.
    var time = (Math.sqrt(2 * a * distance) / a) * 1000;

    console.log('Time: ' + (time / 1000).toFixed(2) + ' secs');

    // Move the masses.
    createjs.Tween.get(massA).to({y: STAGE_HEIGHT - massA.image.height}, time, createjs.Ease.getPowIn(2));
    var originalY = massB.y;
    createjs.Tween.get(massB).to({y: originalY - (distance * 10)}, time, createjs.Ease.getPowIn(2)).call(function() {
      $("#reset-btn").prop('disabled', false);
    });

    spinPulley(time, "CCW");

    logData(a, (time / 1000).toFixed(2), 0);


  } else if (a < 0) { // Mass B moving to bottom.

    removeLock();

    a = Math.abs(a);

    // Calculate the distance to the bottom.
    var distance = (STAGE_HEIGHT - massB.y - massB.image.height) / 10;

    console.log('Distance: ' + distance);

    // Calculate time to reach the bottom in ms.
    var time = (Math.sqrt(2 * a * distance) / a) * 1000;

    console.log('Time: ' + (time / 1000).toFixed(2) + ' secs');

    // Move the masses.
    createjs.Tween.get(massB).to({y: STAGE_HEIGHT - massB.image.height}, time, createjs.Ease.getPowIn(2));
    var originalY = massA.y;
    createjs.Tween.get(massA).to({y: originalY - (distance * 10)}, time, createjs.Ease.getPowIn(2)).call(function() {
      $("#reset-btn").prop('disabled', false);
    });

    spinPulley(time, "CW");

    logData(-a, (time / 1000).toFixed(2), 0);

  } else {
    enableControls();
  }
}

// Given the mass of the two objects, returns the system acceleration.
// Positive value means mass A will be moving down.
// Negative value means mass B will be moving down.
function calculateAcceleration() {
  return 9.8 * ((massAValue - massBValue) / (massAValue + massBValue));
}

function spinPulley(time, direction) {
  if (direction == "CW") {
      createjs.Tween.get(pulley).to({rotation: 160}, time, createjs.Ease.getPowIn(2));
  } else if (direction == "CCW") {
    createjs.Tween.get(pulley).to({rotation: -160}, time, createjs.Ease.getPowIn(2));
  }
}

function logData(acceleration, doneTime, currentTime) {

  let datatime = currentTime;

  let originalHeight = 10;

  let velocity = Math.abs(acceleration) * datatime;

  if (acceleration > 0) { // Mass A moving to bottom.
    massAHeight = originalHeight + (0.5 * -acceleration * Math.pow(datatime, 2));
    massBHeight = originalHeight + (0.5 * acceleration * Math.pow(datatime, 2));
    massAVelocity = -velocity;
    massBVelocity = velocity;
  } else { // Mass B moving to bottom.
    massAHeight = originalHeight + (0.5 * acceleration * Math.pow(datatime, 2));
    massBHeight = originalHeight + (0.5 * -acceleration * Math.pow(datatime, 2));
    massAVelocity = velocity;
    massBVelocity = -velocity;
  }

  if (massAHeight >= 0 && massBHeight >= 0) {
    $('table tr:last').after('<tr><td>'+datatime.toFixed(2)+'</td><td>'+(massAHeight/10).toFixed(2)+'</td><td>'+(massAVelocity/10).toFixed(2)+'</td><td>'+(massBHeight/10).toFixed(2)+'</td><td>'+(massBVelocity/10).toFixed(2)+'</td></tr>');
    setTimeout(function() {
      datatime += 0.02;
      logData(acceleration, doneTime, datatime);
    }, 20);
  } else {
    // Output a different last entry, with a 0 height.
    if (massAHeight < 0) {
      massAHeight = 0;
    } else if (massBHeight < 0) {
      massBHeight = 0;
    }
    $('table tr:last').after('<tr><td>'+doneTime+'</td><td>'+(massAHeight/10).toFixed(2)+'</td><td>'+(massAVelocity/10).toFixed(2)+'</td><td>'+(massBHeight/10).toFixed(2)+'</td><td>'+(massBVelocity/10).toFixed(2)+'</td></tr>');
  }
}

function reset() {

  // Clear table contents.
  $('tbody').html('<tr id="heading-1"><th></th><th id="a" colspan="2">Mass A</th><th id="b" colspan="2">Mass B</th></tr><tr id="heading-2"><th>Time (s)</th><th>Height (m)</th><th>Velocity (m/s)</th><th>Height (m)</th><th>Velocity (m/s)</th></tr>');

  initGraphics();
  enableControls();
}

function update() {
  drawLines();
  stage.update();
}

///////////////////////////////////// START PRELOAD FUNCTIONS

var massA, massB;
var pulley, support;
var lock;


/*
 * Add files to be loaded here.
 */
function setupManifest() {
  manifest = [
    {
      src: "images/pulley.png",
      id: "pulley"
    },
    {
      src: "images/support.png",
      id: "support"
    },
    {
      src: "images/mass_a.png",
      id: "mass_a"
    },
    {
      src: "images/mass_b.png",
      id: "mass_b"
    },
    {
      src: "images/lock.png",
      id: "lock"
    }
  ];

}


function startPreload() {
    preload = new createjs.LoadQueue(true);
    preload.installPlugin(createjs.Sound);
    preload.on("fileload", handleFileLoad);
    preload.on("progress", handleFileProgress);
    preload.on("complete", loadComplete);
    preload.on("error", loadError);
    preload.loadManifest(manifest);
}

/*
 * Specify how to load each file.
 */
function handleFileLoad(event) {
    console.log("A file has loaded of type: " + event.item.type);
    // create bitmaps of images
    if (event.item.id == "pulley") {
      pulley = new createjs.Bitmap(event.result);
    } else if (event.item.id == "support") {
      support = new createjs.Bitmap(event.result);
    } else if (event.item.id == "mass_a") {
      massA = new createjs.Bitmap(event.result);
    } else if (event.item.id == "mass_b") {
      massB = new createjs.Bitmap(event.result);
    } else if (event.item.id == "lock") {
      lock = new createjs.Bitmap(event.result);
    }
}

function loadError(evt) {
    console.log("Error!", evt.text);
}

// not currently used as load time is short
function handleFileProgress(event) {

}

/*
 * Displays the start screen.
 */
function loadComplete(event) {
    console.log("Finished Loading Assets");

    // ticker calls update function, set the FPS
    createjs.Ticker.setFPS(24);
    createjs.Ticker.addEventListener("tick", update); // call update function

    stage.update();
    initGraphics();
}

///////////////////////////////////// END PRELOADJS FUNCTIONS

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
