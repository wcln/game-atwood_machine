
var STAGE_WIDTH, STAGE_HEIGHT;

var spinningTween = null;

function init() {
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

function initGraphics() {

  // Pulley.
  pulley.regX = pulley.image.width/2;
  pulley.regY = pulley.image.height/2;
  pulley.x = STAGE_WIDTH/2;
  pulley.y = 125;
  stage.addChild(pulley);

  // Support.
  support.x = STAGE_WIDTH/2 - support.image.width/2;
  support.y = 0;
  stage.addChild(support);

  // Mass A.

  // Mass B.

  stage.update();
}

function initListeners() {

}


function release() {
  spinningTween = createjs.Tween.get(pulley, {loop: true})
    .to({rotation: 0}, 0)
    .to({rotation: 90}, 500)
    .to({rotation: 180}, 500)
    .to({rotation: 270}, 500)
    .to({rotation: 360}, 500);


}


function reset() {
  spinningTween.setPaused(true);
}

function update() {
  stage.update();
}

///////////////////////////////////// START PRELOAD FUNCTIONS

var massA, massB;
var pulley, support;


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
      mass_a = new createjs.Bitmap(event.result);
    } else if (event.item.id == "mass_b") {
      mass_b = new createjs.Bitmap(event.reuslt);
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
