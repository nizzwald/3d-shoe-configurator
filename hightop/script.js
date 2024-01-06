const LOADER = document.getElementById('js-loader');

const TRAY = document.getElementById('js-tray-slide');
const DRAG_NOTICE = document.getElementById('js-drag-notice');

var theModel;

const MODEL_PATH = "fox_hightop_01.glb";

var activeOption = 'top';
var loaded = false;

//var bmap =  new THREE.TextureLoader().load('img/ambient_bump_.jpg');

const colors = [

    {
        color:'787878',
          bumpMap: 'img/foam_grip_.jpg',
        size: [1, 1, 1],
        bumpScale  :  0.45}
/*
        ,
    {
        color: '006cff',
        bumpMap: 'img/ambient_bump_.jpg',
        size: [1, 1, 1],
        bumpScale  :  .45
    },
    {
        color: '575757',
        bumpMap: 'img/foxtooth_.jpg',
        size: [1, 1, 1],
        bumpScale  :  .45
    },
    {
        color: '757575',
        bumpMap: 'img/rubber_.jpg',
        size: [1, 1, 1],
        bumpScale  :  .45
    },

  {
    color: 'ffffff' }
*/
  ];


const BACKGROUND_COLOR = 0xf1f1f1;
// Init the scene
const scene = new THREE.Scene();
//scene.position.x = -10;
//scene.position.y = -2;
// Set background
scene.background = new THREE.Color(BACKGROUND_COLOR);
//scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20, 100);

const canvas = document.querySelector('#main_shoe');

// Init the renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);

//0var cameraFar = 11;

document.body.appendChild(renderer.domElement);

// Add a camerra
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
//var camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
camera.position.z = 30;
camera.position.x = 15;
camera.position.y = 5;

// Initial material - change color here if you want to display the initial shoe as a different color
const INITIAL_MTL = new THREE.MeshPhongMaterial({ color: 0xebebeb, shininess: 10 });
const INITIAL_MAP = [
  { childID: "bottom", mtl: INITIAL_MTL },
  { childID: "main_part", mtl: INITIAL_MTL },
  { childID: "sole", mtl: INITIAL_MTL },
  { childID: "tongue", mtl: INITIAL_MTL },
  { childID: "top", mtl: INITIAL_MTL },
  { childID: "laces", mtl: INITIAL_MTL },
  { childID: "lining", mtl: INITIAL_MTL },
  { childID: "upper", mtl: INITIAL_MTL }];

// Init the object loader
var loader = new THREE.GLTFLoader();

loader.load(MODEL_PATH, function (gltf) {
  theModel = gltf.scene;

  theModel.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  // Set the models initial scale
  theModel.scale.set(2, 2, 2);
  theModel.rotation.y = Math.PI;

  // Offset the y position a bit
  theModel.position.y = -5;
  //theModel.position.x = -13;
  // Set initial textures
  for (let object of INITIAL_MAP) {
    initColor(theModel, object.childID, object.mtl);
  }

  // Add the model to the scene
  //console.log(theModel);
  scene.add(theModel);

  // Remove the loader
  LOADER.remove();

}, undefined, function (error) {
  console.error(error);
});

// Function - Add the textures to the models
function initColor(parent, type, mtl) {
  parent.traverse(o => {
    if (o.isMesh) {
      if (o.name.includes(type)) {
        o.material = mtl;
        o.nameID = type; // Set a new property to identify this object
      }
    }
  });
}

// Add lights
var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
hemiLight.position.set(0, 50, 0);
// Add hemisphere light to scene
scene.add(hemiLight);

var dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
//dirLight.position.set(-8, 12, 8);
dirLight.position.set(-12, 18, 8);
dirLight.castShadow = true;
//Set up shadow properties for the dirLight
var d = 14;
dirLight.shadow.camera.left = - d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = - d;

//dirLight.shadow.camera.near = -300;
//dirLight.shadow.camera.far = 512;
//dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);

// Add directional Light to scene
scene.add(dirLight);

// Floor

var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
let floor_mat = new THREE.TextureLoader().load("img/old/grass_.jpg");

/*
var floorMaterial = new THREE.MeshPhongMaterial({
  map: floor_mat,
  size: [100,100,100],
  shininess: 0 });
*/

var floorMaterial = new THREE.MeshPhongMaterial({
  color: 0x8cddfe,
  shininess: 100 });


var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -0.5 * Math.PI;
floor.receiveShadow = true;
floor.position.y = -7;
scene.add(floor);


// Add controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 3;
controls.enableDamping = true;
controls.enablePan = false;
controls.dampingFactor = 0.1;
controls.autoRotate = false; // Toggle this if you'd like the chair to automatically rotate
controls.autoRotateSpeed = 0.2; // 30

function animate() {

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  if (theModel != null && loaded == false) {
    initialRotation();
    DRAG_NOTICE.classList.add('start');
  }
}

animate();

// Function - New resizing method
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  var width = window.innerWidth;
  var height = window.innerHeight;
  var canvasPixelWidth = canvas.width / window.devicePixelRatio;
  var canvasPixelHeight = canvas.height / window.devicePixelRatio;

  const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {

    renderer.setSize(width, height, false);
  }
  return needResize;
}

// Function - Build Colors

/*
function buildColors(colors) {
  for (let [i, color] of colors.entries()) {
    let swatch = document.createElement('div');
    swatch.classList.add('tray__swatch');

    if (color.texture)
    {
      swatch.style.backgroundImage = "url(" + color.texture + ")";
    } else
    {
      swatch.style.background = "#" + color.color;
    }

    swatch.setAttribute('data-key', i);
    TRAY.append(swatch);
  }
}

buildColors(colors);
*/

// Select Option - Parts of the shoe
const options = document.querySelectorAll(".option");

for (const option of options) {
  option.addEventListener('click', selectOption);
}

function selectOption(e) {
  let option = e.target;
  activeOption = e.target.dataset.option;
  for (const otherOption of options) {
    otherOption.classList.remove('--is-active');
  }
  option.classList.add('--is-active');
}

// Swatches
//const swatches = document.querySelectorAll(".material-div");
/*
for (const swatch of swatches) {
  swatch.addEventListener('click', selectSwatch);
}
*/

/*
// Swatches
const swatches = document.querySelectorAll(".tray__swatch");

for (const swatch of swatches) {
  swatch.addEventListener('click', selectSwatch);
}


function selectSwatch(e) {
  console.log(e);
  //let color = colors[parseInt(e.target.dataset.key)];
  let color = colors[parseInt(e.target.id)];
  let new_mtl;

  if (color.texture) {

    let txt = new THREE.TextureLoader().load(color.texture);

    txt.repeat.set(color.size[0], color.size[1], color.size[2]);
    txt.wrapS = THREE.RepeatWrapping;
    txt.wrapT = THREE.RepeatWrapping;

    //console.log(color);
    if(color.bumpMap){
      txt.bumpMap = new THREE.TextureLoader().load(color.bumpMap);
      txt.bumpScale = color.bumpScale;
      new_mtl = new THREE.MeshPhongMaterial({
        map: txt,
        shininess: color.shininess ? color.shininess : 10 });
    }
    else{

      new_mtl = new THREE.MeshPhongMaterial({
        map: txt,
        shininess: color.shininess ? color.shininess : 10 });
    }

//console.log(new_mtl);

  } else

  {

    if(color.bumpMap){
      let txt = new THREE.TextureLoader().load(color.bumpMap);
      txt.repeat.set(color.size[0], color.size[1], color.size[2]);

    new_mtl = new THREE.MeshPhongMaterial({
      color: parseInt('0x' + color.color),
      bumpMap: txt,
      shininess: color.shininess ? color.shininess : 10 });
    }
    else{
      new_mtl = new THREE.MeshPhongMaterial({
        color: parseInt('0x' + color.color),
        shininess: color.shininess ? color.shininess : 10 });
    }


  }



  setMaterial(theModel, activeOption, new_mtl);
}
*/
function selectSwatch2(colors) {
  //let color = colors[parseInt(e.target.dataset.key)];

  let color = colors;
  let new_mtl;

  if (color.texture) {

    let txt = new THREE.TextureLoader().load(color.texture);

    txt.repeat.set(color.size[0], color.size[1], color.size[2]);
    txt.wrapS = THREE.RepeatWrapping;
    txt.wrapT = THREE.RepeatWrapping;

    //console.log(color);
    if(color.bumpMap){
      txt.bumpMap = new THREE.TextureLoader().load(color.bumpMap);
      txt.bumpScale = color.bumpScale;
      new_mtl = new THREE.MeshPhongMaterial({
        map: txt,
        shininess: color.shininess ? color.shininess : 10 });
    }
    else{

      new_mtl = new THREE.MeshPhongMaterial({
        map: txt,
        shininess: color.shininess ? color.shininess : 10 });
    }

//console.log(new_mtl);

  } else

  {

    if(color.bumpMap){
      let txt = new THREE.TextureLoader().load(color.bumpMap);
      txt.repeat.set(color.size[0], color.size[1], color.size[2]);

    new_mtl = new THREE.MeshPhongMaterial({
      color: parseInt('0x' + color.color),
      bumpMap: txt,
      shininess: color.shininess ? color.shininess : 10 });
    }
    else{
      new_mtl = new THREE.MeshPhongMaterial({
        color: parseInt('0x' + color.color),
        shininess: color.shininess ? color.shininess : 10 });
    }


  }

  setMaterial(theModel, activeOption, new_mtl);
}

/*
function selectSwatch(e) {
  let color = colors[parseInt(e.target.dataset.key)];
  let new_mtl;

  if (color.texture) {

    let txt = new THREE.TextureLoader().load(color.texture);

    txt.repeat.set(color.size[0], color.size[1], color.size[2]);
    txt.wrapS = THREE.RepeatWrapping;
    txt.wrapT = THREE.RepeatWrapping;

    //console.log(color);
    if(color.bumpMap){
      txt.bumpMap = new THREE.TextureLoader().load(color.bumpMap);
      txt.bumpScale = color.bumpScale;
      new_mtl = new THREE.MeshPhongMaterial({
        map: txt,
        shininess: color.shininess ? color.shininess : 10 });
    }
    else{

      new_mtl = new THREE.MeshPhongMaterial({
        map: txt,
        shininess: color.shininess ? color.shininess : 10 });
    }

//console.log(new_mtl);

  } else

  {

    if(color.bumpMap){
      let txt = new THREE.TextureLoader().load(color.bumpMap);
      txt.repeat.set(color.size[0], color.size[1], color.size[2]);

    new_mtl = new THREE.MeshPhongMaterial({
      color: parseInt('0x' + color.color),
      bumpMap: txt,
      shininess: color.shininess ? color.shininess : 10 });
    }
    else{
      new_mtl = new THREE.MeshPhongMaterial({
        color: parseInt('0x' + color.color),
        shininess: color.shininess ? color.shininess : 10 });
    }


  }

  setMaterial(theModel, activeOption, new_mtl);
}
*/

function setMaterial(parent, type, mtl) {
  parent.traverse(o => {
    if (o.isMesh && o.nameID != null) {
      if (o.nameID == type) {
        o.material = mtl;
      }
    }
  });
}

// Function - Opening rotate
let initRotate = 0;

function initialRotation() {
  initRotate++;
  if (initRotate <= 60) {
    theModel.rotation.y += Math.PI / 60;
  } else {
    loaded = true;
  }
}

var slider = document.getElementById('js-tray'),sliderItems = document.getElementById('js-tray-slide'),difference;

function slide(wrapper, items) {
  var posX1 = 0,
  posX2 = 0,
  posInitial,
  threshold = 20,
  posFinal,
  slides = items.getElementsByClassName('tray__swatch');

  // Mouse events
  items.onmousedown = dragStart;

  // Touch events
  items.addEventListener('touchstart', dragStart);
  items.addEventListener('touchend', dragEnd);
  items.addEventListener('touchmove', dragAction);


  function dragStart(e) {
    e = e || window.event;
    posInitial = items.offsetLeft;
    difference = sliderItems.offsetWidth - slider.offsetWidth;
    difference = difference * -1;

    if (e.type == 'touchstart') {
      posX1 = e.touches[0].clientX;
    } else {
      posX1 = e.clientX;
      document.onmouseup = dragEnd;
      document.onmousemove = dragAction;
    }
  }

  function dragAction(e) {
    e = e || window.event;

    if (e.type == 'touchmove') {
      posX2 = posX1 - e.touches[0].clientX;
      posX1 = e.touches[0].clientX;
    } else {
      posX2 = posX1 - e.clientX;
      posX1 = e.clientX;
    }

    if (items.offsetLeft - posX2 <= 0 && items.offsetLeft - posX2 >= difference) {
      items.style.left = items.offsetLeft - posX2 + "px";
    }
  }

  function dragEnd(e) {
    posFinal = items.offsetLeft;
    if (posFinal - posInitial < -threshold) {

    } else if (posFinal - posInitial > threshold) {

    } else {
      items.style.left = posInitial + "px";
    }

    document.onmouseup = null;
    document.onmousemove = null;
  }

}

slide(slider, sliderItems);
