import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
// import * as dat from 'dat.gui'
import gsap from 'gsap'
// import { StencilOp, Vector3 } from 'three'

//Variables
const states = { 
intro: "intro",
lookGarden: "lookGarden",
lookSeeds: "lookSeeds",
lookPage: "lookPage",
diggingHole: "diggingHole",
plantingSeed: "plantingSeed",
wateringPlant: "wateringPlant"
}
var mouse, raycaster, currentState, currentHover, selectedSeedHitboxID, newPlantPoint, selectedPlantId;
var models = {};
var hitboxes = {};
var seedToPlants = {};
var plantHitboxToArticle = {};
const shovelId = -10;
const canId = -20;
const windmillBladeId = -5;
const bg_clouds = [-30,-31,-32,-33];


//loading screen manager
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = function(url,item,total){
    console.log("Starting Loading");
    ChangeHTMLStates({text_loading:"", text_welcome:"none", button_start:"none"});
}
loadingManager.onLoad = function(){
    ChangeState(states["intro"]);
}

//HTML Elements
const loading_text = document.getElementById("loading")
const welcome_text = document.getElementById("welcome")
const start_button = document.getElementById("start")
const seeds_button = document.getElementById("seeds")
const garden_button = document.getElementById("garden")
const back_button = document.getElementById("back")
const article_text = document.getElementById("article")
const instructions_text = document.getElementById("instructions")

//HTML Listeners
start_button.addEventListener("click", function(){ChangeState(states["lookSeeds"])});
garden_button.addEventListener("click", function(){ChangeState(states["lookGarden"])});
seeds_button.addEventListener("click", function(){ChangeState(states["lookSeeds"])});
back_button.addEventListener("click", function(){ChangeState(states["lookGarden"])});

//ThreeJS Setup
// const gui = new dat.GUI() // Debug
const canvas = document.querySelector('canvas.webgl') // Canvas
const scene = new THREE.Scene() // Scene
const gltfLoader = new GLTFLoader(loadingManager);

//Model URLs
const shovelURL = new URL('../models/shovel.glb', import.meta.url);
const canURL = new URL('../models/can.glb', import.meta.url);
const cloudURL = new URL('../models/cloud.glb', import.meta.url);
const boxURL = new URL('../models/box.glb', import.meta.url);
const packetURL = new URL('../models/packet_1.glb', import.meta.url);
const packet2URL = new URL('../models/packet_1.glb', import.meta.url);
const packet3URL = new URL('../models/packet_1.glb', import.meta.url);
const packet4URL = new URL('../models/packet_1.glb', import.meta.url);
const packet5URL = new URL('../models/packet_1.glb', import.meta.url);
const packet6URL = new URL('../models/packet_1.glb', import.meta.url);
const tableURL = new URL('../models/Table.glb', import.meta.url);
const plant1URL = new URL('../models/flower_1.glb', import.meta.url);
const plant2URL = new URL('../models/flower_2.glb', import.meta.url);
const plant3URL = new URL('../models/flower_3.glb', import.meta.url);
const plant4URL = new URL('../models/flower_4.glb', import.meta.url);
const plant5URL = new URL('../models/flower_5.glb', import.meta.url);
const plant6URL = new URL('../models/flower_6.glb', import.meta.url);
const windmillBaseURL = new URL('../models/windmillBase.glb', import.meta.url);
const windmillBladeURL = new URL('../models/windMillBlade.glb', import.meta.url);

// Primitive Geometry
const moundGeometry = new THREE.TorusGeometry(0.05, .02, 16, 10 );
const sphereGeometry = new THREE.SphereBufferGeometry(.02, 12, 12);
const packetGeometry = new THREE.BoxGeometry(0.45,0.3,0.45);
const dirtGeometry = new THREE.BoxGeometry(1.1,0.1,1.4);
const plantHitboxGeometry = new THREE.BoxGeometry(0.15,0.6,0.15);

// Materials

const clear_mat = new THREE.MeshStandardMaterial({opacity:0, transparent:true})
const def_mat = new THREE.MeshStandardMaterial()
const table_mat = new THREE.MeshStandardMaterial()
const box_mat = new THREE.MeshStandardMaterial()
const cloud_mat = new THREE.MeshStandardMaterial()
const dirt_mat = new THREE.MeshStandardMaterial()
const packet1_mat = new THREE.MeshToonMaterial()
const packet2_mat = new THREE.MeshToonMaterial()
const packet3_mat = new THREE.MeshToonMaterial()
const packet4_mat = new THREE.MeshToonMaterial()
const packet5_mat = new THREE.MeshToonMaterial()
const packet6_mat = new THREE.MeshToonMaterial()
const petal_1_mat = new THREE.MeshToonMaterial()
const petal_2_mat = new THREE.MeshToonMaterial()
const petal_3_mat = new THREE.MeshToonMaterial()
const petal_4_mat = new THREE.MeshToonMaterial()
const petal_5_mat = new THREE.MeshToonMaterial()
const leaf_1_mat = new THREE.MeshToonMaterial()
const leaf_2_mat = new THREE.MeshToonMaterial()
const leaf_3_mat = new THREE.MeshToonMaterial()
const leaf_4_mat = new THREE.MeshToonMaterial()
const leaf_5_mat = new THREE.MeshToonMaterial()
table_mat.color = new THREE.Color(0x876031)
box_mat.color = new THREE.Color(0xb58b4c)
cloud_mat.color = new THREE.Color(0xffffff)
dirt_mat.color = new THREE.Color(0x422e1c)
def_mat.color = new THREE.Color(0xaf00af)
petal_1_mat.color = new THREE.Color(0xd05aed)
petal_2_mat.color = new THREE.Color(0xf2841d)
petal_3_mat.color = new THREE.Color(0xc24a0a)
petal_4_mat.color = new THREE.Color(0x573753)
petal_5_mat.color = new THREE.Color(0xf2841d)
leaf_1_mat.color = new THREE.Color(0x456837)
leaf_2_mat.color = new THREE.Color(0x527C42)
leaf_3_mat.color = new THREE.Color(0x516D41)
leaf_4_mat.color = new THREE.Color(0x6F742D)
leaf_5_mat.color = new THREE.Color(0xe8cb3a)

// Create Meshes
const b1 = new THREE.Mesh(packetGeometry, clear_mat)
b1.position.set(4,0.5,-0.4);
b1.rotation.set(0,-0.2,0);
b1.name = "box"
hitboxes[b1.id] = b1;
const b2 = new THREE.Mesh(packetGeometry, clear_mat)
b2.position.set(4.5,0.5,-0.23);
b2.rotation.set(0,-0.2,0);
b2.name = "box"
hitboxes[b2.id] = b2;
const b3 = new THREE.Mesh(packetGeometry, clear_mat)
b3.position.set(5,0.5,-0.05);
b3.rotation.set(0,-0.2,0);
b3.name = "box"
hitboxes[b3.id] = b3;
const b4 = new THREE.Mesh(packetGeometry, clear_mat)
b4.position.set(3.8,0.5,0.1);
b4.rotation.set(0,-0.2,0);
b4.name = "box"
hitboxes[b4.id] = b4;
const b5 = new THREE.Mesh(packetGeometry, clear_mat)
b5.position.set(4.3,0.5,0.3);
b5.rotation.set(0,-0.2,0);
b5.name = "box"
hitboxes[b5.id] = b5;
const b6 = new THREE.Mesh(packetGeometry, clear_mat)
b6.position.set(4.8,0.5,0.5);
b6.rotation.set(0,-0.2,0);
b6.name = "box"
hitboxes[b6.id] = b6;
const dirt_box = new THREE.Mesh(dirtGeometry, clear_mat)
dirt_box.position.set(1.9,0.8,0);
dirt_box.rotation.set(0,1.57,0);
dirt_box.name = "dirt"


const plant1_hitbox = new THREE.Mesh(plantHitboxGeometry, clear_mat);
const plant2_hitbox = new THREE.Mesh(plantHitboxGeometry, clear_mat);
const plant3_hitbox = new THREE.Mesh(plantHitboxGeometry, clear_mat);
const plant4_hitbox = new THREE.Mesh(plantHitboxGeometry, clear_mat);
const plant5_hitbox = new THREE.Mesh(plantHitboxGeometry, clear_mat);
const plant6_hitbox = new THREE.Mesh(plantHitboxGeometry, clear_mat);
plant1_hitbox.position.set(0,-2,0);
plant2_hitbox.position.set(0,-2,0);
plant3_hitbox.position.set(0,-2,0);
plant4_hitbox.position.set(0,-2,0);
plant5_hitbox.position.set(0,-2,0);
plant6_hitbox.position.set(0,-2,0);
plant1_hitbox.name = "plant";
plant2_hitbox.name = "plant";
plant3_hitbox.name = "plant";
plant4_hitbox.name = "plant";
plant5_hitbox.name = "plant";
plant6_hitbox.name = "plant";
hitboxes[plant1_hitbox.id] = plant1_hitbox;
hitboxes[plant2_hitbox.id] = plant2_hitbox;
hitboxes[plant3_hitbox.id] = plant3_hitbox;
hitboxes[plant4_hitbox.id] = plant4_hitbox;
hitboxes[plant5_hitbox.id] = plant5_hitbox;
hitboxes[plant6_hitbox.id] = plant6_hitbox;
const hitIndicator = new THREE.Mesh(sphereGeometry, def_mat)
hitIndicator.position.set(0,-4,0);

scene.add(b1);
scene.add(b2);
scene.add(b3);
scene.add(b4);
scene.add(b5);
scene.add(b6);
scene.add(dirt_box);
scene.add(hitIndicator);
scene.add(plant1_hitbox);
scene.add(plant2_hitbox);
scene.add(plant3_hitbox);
scene.add(plant4_hitbox);
scene.add(plant5_hitbox);
scene.add(plant6_hitbox);

seedToPlants[b1.id] = plant1_hitbox.id;
seedToPlants[b2.id] = plant2_hitbox.id;
seedToPlants[b3.id] = plant3_hitbox.id;
seedToPlants[b4.id] = plant4_hitbox.id;
seedToPlants[b5.id] = plant5_hitbox.id;
seedToPlants[b6.id] = plant6_hitbox.id;


CreateMesh(canURL, [cloud_mat, cloud_mat, cloud_mat, cloud_mat, cloud_mat], [3.2,-0.1,0.6], [0,0,0], 0.2, canId)
CreateMesh(shovelURL, [box_mat, dirt_mat], [4,0,1], [0,1.7,0], 0.2, shovelId)
CreateMesh(packetURL, [packet1_mat], [4,0.5,-0.4], [0,1.3,0], 0.2, b1.id)
CreateMesh(packet2URL, [packet2_mat], [4.5,0.5,-0.23], [0,1.3,0], 0.2, b2.id)
CreateMesh(packet3URL, [packet3_mat], [5,0.5,-0.08], [0,1.3,0], 0.2, b3.id)
CreateMesh(packet4URL, [packet4_mat], [3.83,0.5,0.22], [0,1.3,0], 0.2, b4.id)
CreateMesh(packet5URL, [packet5_mat], [4.33,0.5,0.35], [0,1.3,0], 0.2, b5.id)
CreateMesh(packet6URL, [packet6_mat], [4.82,0.5,0.5], [0,1.3,0], 0.2, b6.id)
CreateMesh(cloudURL, [cloud_mat], [2,-2,0], [0,0,0.1], 0.1)
CreateMesh(cloudURL, [cloud_mat], [50,-20,-20], [0,0,0], 0.4, bg_clouds[0])
CreateMesh(cloudURL, [cloud_mat], [0,10,-80], [0,0,0], 0.6, bg_clouds[3])
CreateMesh(cloudURL, [cloud_mat], [0,-15,-30], [0,0,0], 0.4, bg_clouds[1])
CreateMesh(cloudURL, [cloud_mat], [-100,-10,-50], [0,0,0], 0.3, bg_clouds[2])
CreateMesh(tableURL, [table_mat], [4.4,-0.3,0], [0,1.27,0], 0.07)
CreateMesh(windmillBaseURL, [table_mat,table_mat,dirt_mat,dirt_mat], [0.3,0,0], [0,-1,0], 0.3)
CreateMesh(windmillBladeURL, [table_mat], [0.3,0,0], [0,-1,0], 0.3, windmillBladeId)
CreateMesh(boxURL, [box_mat, dirt_mat], [1.9,0.2,0], [0,1.57,0], 0.08)
CreateMesh(plant1URL, [petal_1_mat, leaf_1_mat,leaf_2_mat,leaf_3_mat,leaf_4_mat,leaf_2_mat], [1,-1.3,0], [0,0,0], 0.5, plant1_hitbox.id)
CreateMesh(plant2URL, [leaf_1_mat, petal_2_mat,petal_3_mat,leaf_5_mat,petal_3_mat], [1,-1.3,0], [0,0,0], 0.5, plant2_hitbox.id)
CreateMesh(plant3URL, [petal_3_mat, petal_4_mat], [1,-1.3,0], [0,0,0], 0.5, plant3_hitbox.id)
CreateMesh(plant4URL, [petal_5_mat, leaf_5_mat,leaf_1_mat,leaf_2_mat,leaf_3_mat], [1,-1.3,0], [0,0,0], 0.5, plant4_hitbox.id)
CreateMesh(plant5URL, [petal_5_mat, petal_5_mat,leaf_5_mat,petal_4_mat,leaf_3_mat,petal_1_mat,petal_1_mat], [1,-1.3,0], [0,0,0], 0.5, plant5_hitbox.id)
CreateMesh(plant6URL, [packet1_mat], [1,-1.3,0], [0,0,0], 0.5,plant6_hitbox.id)


// Lights
const dirLight = new THREE.DirectionalLight( 0xffffff);
dirLight.position.set( - 3, 10, - 10 );
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = -5;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add( dirLight );

const hemiLight = new THREE.HemisphereLight( 0xeef0c0, 0x444444, 1.2 );
hemiLight.position.set( 0, 20, 0 );
scene.add( hemiLight );

//scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );
const hour = new Date().getHours();
// console.log("HOUR: " + hour);
if(hour < 6){
    scene.background = new THREE.Color(0x4d508f);//we-morning
    hemiLight.intensity = 0.4;
    hemiLight.groundColor = new THREE.Color(0x363d96);
    hemiLight.skyColor = new THREE.Color(0x2e3175);
    dirLight.intensity = 0.1;
}
else if(hour < 10){
    scene.background = new THREE.Color(0xcf7744);//sunset
    hemiLight.intensity = 0.5;
    hemiLight.groundColor = new THREE.Color(0xcf7744);
    hemiLight.skyColor = new THREE.Color(0xe6ae40);
}
else if(hour < 17){
    scene.background = new THREE.Color(0xb3ffe3);//day 
    hemiLight.intensity = 1.2;
    hemiLight.groundColor = new THREE.Color(0xd6902d);
    hemiLight.skyColor = new THREE.Color(0xffffff);
    dirLight.intensity = 1;
}
else if(hour < 21){
    scene.background = new THREE.Color(0xd6902d);//golden hour
    hemiLight.intensity = 1.2;
    hemiLight.groundColor = new THREE.Color(0xd6902d);
    hemiLight.skyColor = new THREE.Color(0xffffff);
    dirLight.intensity = 1;
}
else{
    scene.background = new THREE.Color(0x5c5fab);
    hemiLight.intensity = 0.8;
    hemiLight.groundColor = new THREE.Color(0x5e6385);
    hemiLight.skyColor = new THREE.Color(0x322870);
    dirLight.intensity = 0.5;
}

//sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.75;



// Mouse
mouse = new THREE.Vector2
raycaster = new THREE.Raycaster();
window.addEventListener( 'pointermove', onMouseMove );
window.addEventListener( 'click', onClick);

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.panSpeed = 2
controls.enableDamping = true

//HTML articles in dictionary so that when the plant is clicked on it's brought up
plantHitboxToArticle[plant1_hitbox.id] = '<a herf="https://github.com/johnCavatelli">Link to Github</a>'
plantHitboxToArticle[plant2_hitbox.id] = '<a href="https://amazon.com">Link to my book on Amazon</a>'
// plantHitboxToArticle[plant3_hitbox.id] = '<a href="./files/resume.pdf>Open my resume in a new tab</a>'
// plantHitboxToArticle[plant4_hitbox.id] = '<p>About Me!</p>'
// plantHitboxToArticle[plant5_hitbox.id] = '<p>Personal Projects</p>'
// plantHitboxToArticle[plant6_hitbox.id] = '<p>I started game development in the Unity Game Engine in March of 2020</p><a href="itch.io/johnCavatelli">My games hosted on Itch.io</a>'


/**
 * Main Loop
 */
ChangeState(states["intro"]);
const clock = new THREE.Clock()

const tick = () =>
{    
    const elapsedTime = clock.getElapsedTime()
    if(models[windmillBladeId] != null){models[windmillBladeId].children[0].rotation.x = .5 * elapsedTime;}
    bg_clouds.forEach((item) =>{
        if(models[item] != null){
        models[item].position.x -= 0.02;
        if(models[item].position.x < -100){
            models[item].position.x = 100;
        }
        }
    });
    //controls.update();

    switch(currentState) {
        case states["intro"]:
            break;
        case states["lookSeeds"]:   
            raycaster.setFromCamera( mouse, camera ); // update the picking ray with the camera and pointer position
            const intersects = raycaster.intersectObjects( scene.children );// calculate objects intersecting the picking ray
            var newHover;
            for ( let i = 0; i < intersects.length; i ++ ) {
                if(intersects[i].object.name == "box"){
                    // console.log(models)
                    // console.log(intersects[i].object.id);
                    gsap.to(models[intersects[i].object.id].position, {
                        y: 0.7,
                        duration: 0.5,
                        ease: "power4.out"         
                    })
                    newHover = intersects[i].object.id;
                    break;
                }                
            }
            if(newHover != currentHover){
                if(currentHover != null){
                gsap.to(models[currentHover].position, {
                    y: 0.5,
                    duration: 0.5,
                    ease: "power4.out"         
                })}
                currentHover = newHover;
            }
            break;
        case states["lookGarden"]:   
            raycaster.setFromCamera( mouse, camera ); // update the picking ray with the camera and pointer position
            const pIntersects = raycaster.intersectObjects( scene.children );// calculate objects intersecting the picking ray
            var newHover;
            for ( let i = 0; i < pIntersects.length; i ++ ) {
                if(pIntersects[i].object.name == "plant"){
                    gsap.to(models[pIntersects[i].object.id].rotation, {
                        y: 0.85,
                        duration: 0.5,
                        ease: "power4.out"         
                    })
                    newHover = pIntersects[i].object.id;
                    break;
                }                
            }
            if(newHover != currentHover){
                if(currentHover != null){
                gsap.to(models[currentHover].rotation, {
                    y: 0,
                    duration: 0.5,
                    ease: "power4.out"         
                })}
                currentHover = newHover;
            }
            break;            
        case states["diggingHole"]:
            raycaster.setFromCamera( mouse, camera ); // update the picking ray with the camera and pointer position
            const dirtIntersect = raycaster.intersectObjects( scene.children );// calculate objects intersecting the picking ray
            newPlantPoint = null
            hitIndicator.position.set(0,-2,0);
            for ( let i = 0; i < dirtIntersect.length; i ++ ) {
                if(dirtIntersect[i].object.name == "dirt"){
                    hitIndicator.position.set(dirtIntersect[i].point.x, dirtIntersect[i].point.y, dirtIntersect[i].point.z);
                    newPlantPoint = dirtIntersect[i].point;
                    break;
                }
            }            
            break;
        case states["plantingSeed"]:
            raycaster.setFromCamera( mouse, camera ); // update the picking ray with the camera and pointer position
            const plantIntersect = raycaster.intersectObjects( scene.children );// calculate objects intersecting the picking ray
            hitIndicator.position.set(0,-2,0);
            for ( let i = 0; i < plantIntersect.length; i ++ ) {
                if(plantIntersect[i].object.name == "dirt"){
                    hitIndicator.position.set(plantIntersect[i].point.x, plantIntersect[i].point.y, plantIntersect[i].point.z);
                    break;
                }
            }
            break;
        case states["wateringPlant"]:
            raycaster.setFromCamera( mouse, camera ); // update the picking ray with the camera and pointer position
            const waterIntersect = raycaster.intersectObjects( scene.children );// calculate objects intersecting the picking ray
            hitIndicator.position.set(0,-2,0);
            for ( let i = 0; i < waterIntersect.length; i ++ ) {
                if(waterIntersect[i].object.name == "dirt"){
                    hitIndicator.position.set(waterIntersect[i].point.x, waterIntersect[i].point.y, waterIntersect[i].point.z);
                    break;
                }
            }
            break;
        case states["lookPage"]:
            break;
        default:
          // code block
      }
    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

//functions
function onMouseMove( event){
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;  
}

function onClick(event){
    switch(currentState) {
        case states["lookSeeds"]:
            if(currentHover != null){
                console.log("Clicked on: " + currentHover);
                selectedSeedHitboxID = currentHover;
                console.log("Current Hover: " + selectedSeedHitboxID)
                currentHover = null;
                ChangeState(states["diggingHole"])
            }
          break;
        case states["lookGarden"]:
            if(currentHover != null){
                console.log("Clicked on: " + currentHover);
                selectedPlantId = currentHover;
                currentHover = null;
                ChangeState(states["lookPage"]);
            }
          break;          
        case states["diggingHole"]:
            if(newPlantPoint != null){
                ChangeState(states["plantingSeed"]);
            }
          break;
        case states["plantingSeed"]:
            if(newPlantPoint.distanceTo(hitIndicator.position) < 0.1){
                ChangeState(states["wateringPlant"]);
            }
          break;
        case states["wateringPlant"]:
            if(newPlantPoint.distanceTo(hitIndicator.position) < 0.1){
                hitIndicator.position.set(0,-1,0);     
                models[seedToPlants[selectedSeedHitboxID]].position.set(newPlantPoint.x,0,newPlantPoint.z);//move flowers below soil
                hitboxes[selectedSeedHitboxID].position.set(-100,0,0);
                hitboxes[seedToPlants[selectedSeedHitboxID]].position.set(newPlantPoint.x, 0.8, newPlantPoint.z);//plant hitbox
                gsap.to(models[seedToPlants[selectedSeedHitboxID]].position, {
                    y: 0.9,
                    delay: 1,
                    duration: 3,
                    ease: "power2.out"   
                })
                gsap.to(models[canId].position, {
                    x: newPlantPoint.x + 0.3,
                    y: 1.2,
                    z: newPlantPoint.z,
                    duration: 0.7,
                    ease: "power2.out"   
                }) 
                gsap.to(models[canId].rotation, {
                    x: 0,
                    y: 0,
                    z: 1.57,
                    delay: 0.7,
                    duration: 0.5,
                    ease: "none"
                })                   
                gsap.to(models[canId].position, {
                    x: 3.2,
                    y: -0.1,
                    z: 0.6,
                    duration: 1,
                    delay: 1.4,
                    ease: "power2.out"   
                }) 
                gsap.to(models[canId].rotation, {
                    x: 0,
                    y: 0,
                    z: 0,
                    delay: 1.4,
                    duration: 1,
                    ease: "power3.out"
                })                   
                ChangeState(states["lookGarden"]);
            }
            break;                    
        default:
          // code block
      }    
}

function ChangeState(newState){
    switch(newState) {
        case states["intro"]:
            currentState = states["intro"];
            ChangeCameraValues(6,4,8,-0.3,0.3,0,0);
            ChangeHTMLStates({text_welcome: "",button_start: "",text_loading:"none", start_button:"none", button_garden:"none", button_seeds:"none", button_back:"none", text_article:"none", text_instructions:"none"});
            break;
        case states["lookSeeds"]:
            currentState = states["lookSeeds"];
            ChangeCameraValues(4.3,2,0,-1.5,0,0,2);
            instructions_text.innerHTML = "<h2>Choose some seeds to plant</h2>"
            ChangeHTMLStates({text_welcome: "none",button_start: "none",text_loading:"none", button_back:"none", button_garden: "", button_seeds: "none", text_instructions:""});
          break;
        case states["lookGarden"]:
            currentState = states["lookGarden"];
            ChangeCameraValues(2,2.3,1.6,-0.8,0,0,2);
            instructions_text.innerHTML = "<h2>Click on a plant</h2>"
            ChangeHTMLStates({text_article:"none", button_back: "none", button_garden:"none", button_seeds:"", text_instructions:"",text_article:"none"});
        break;
        case states["diggingHole"]:
            currentState = states["diggingHole"];
            gsap.to(models[selectedSeedHitboxID].position, {
                x: 1.5,
                y: 1.2,
                z: -1.3,
                duration: 2,
                ease: "power3.out"         
            })
            gsap.to(models[selectedSeedHitboxID].rotation, {
                x: 0,
                y: 1.57,
                z: 1.57,
                duration: 2,
                ease: "power3.out"         
            })            
            gsap.to(models[shovelId].position, {
                x: 2.5,
                y: 1.2,
                z: -1.3,
                duration: 2,
                ease: "power3.out"         
            })
            gsap.to(models[shovelId].rotation, {
                x: 0,
                y: 0,
                z: 0,
                duration: 2,
                ease: "power3.out"         
            })            
            ChangeCameraValues(2,2.3,1.6,-0.8,0,0,2);
            instructions_text.innerHTML = "<h2>Dig a hole</h2>"
            ChangeHTMLStates({button_back: "none", button_garden:"none", button_seeds:"none", text_instructions:""});
          break;
        case states["plantingSeed"]:
            currentState = states["plantingSeed"];
            const newMound = new THREE.Mesh(moundGeometry, dirt_mat)
            newMound.castShadow = true;
            newMound.position.set(newPlantPoint.x, 0.6, newPlantPoint.z);
            newMound.rotation.set(1.57,0,0);
            scene.add(newMound);
            gsap.to(models[shovelId].position, {
                x: newPlantPoint.x,
                y: 1.5,
                z: newPlantPoint.z,
                duration: 1,
                overwrite: true,
                ease: "power2.out"         
            })
            gsap.to(models[shovelId].rotation, {
                x: 1.57,
                y: 0,
                z: 0,
                duration: 1,
                overwrite: true,
                ease: "power3.out"
            })
            gsap.to(models[shovelId].position, {
                y: 1,
                duration: 1,
                delay: 1,
                ease: "bounce.out"         
            })            
            gsap.to(models[shovelId].position, {
                x: 4,
                y: 0,
                z: 1,
                duration: 1,
                delay: 2,
                ease: "power2.out"         
            })
            gsap.to(models[shovelId].rotation, {
                x: 0,
                y: 0,
                z: 0,
                duration: 2,
                delay: 2,
                ease: "power3.out"         
            })
            gsap.to(newMound.position, {
                y: 0.82,
                duration: 1,
                delay: 1,
                ease: "power2.out"         
            })
            instructions_text.innerHTML = "<h2>Click the hole to Plant the seeds</h2>"
            break;
        case states["wateringPlant"]:
            currentState = states["wateringPlant"];
            gsap.to(models[selectedSeedHitboxID].position, {
                x: newPlantPoint.x,
                z: newPlantPoint.z,
                duration: 1,
                ease: "power2.out"         
            })
            gsap.to(models[selectedSeedHitboxID].rotation, {
                x: 3.14,
                y: 1.57,
                z: 1.57,
                duration: 1,
                ease: "power3.out"
            })
            gsap.to(models[selectedSeedHitboxID].position, {
                y: 1.4,
                delay: 1,
                duration: 0.5,
                ease: "bounce.out"
            })       
            gsap.to(models[selectedSeedHitboxID].position, {
                x: -15,
                delay: 1.5,
                duration: 0.5,
                ease: "bounce.out"
            })    
            gsap.to(models[canId].position, {
                y: 1.3,
                delay: 1,
                duration: 0.5,
                ease: "power2.out"   
            })
            instructions_text.innerHTML = "<h2>Click the hole to give the plant some water</h2>"    
            break;
        case states["lookPage"]:
            currentState = states["lookPage"];
            article_text.innerHTML = plantHitboxToArticle[selectedPlantId];
            ChangeHTMLStates({button_back: "", button_garden:"none", button_seeds:"none",text_article:"",text_instructions:"none"})
            break;
        default:
          // code block
      }
}

function ChangeCameraValues(camX,camY,camZ, camRX,camRY,camRZ, dur){
    gsap.to(camera.position, {
        x:camX,
        y:camY,
        z:camZ,
        duration: dur,
        ease: "power4.out"         
    })
    gsap.to(camera.rotation, {
        x:camRX,
        y:camRY,
        z:camRZ,
        ease: "sine.out",
        duration: dur
    })
}

function ChangeHTMLStates({text_loading, text_welcome, button_start, button_garden, button_seeds, button_back, text_article, text_instructions} = {}){
    loading_text.style.display = text_loading;
    welcome_text.style.display = text_welcome;
    start_button.style.display = button_start;
    garden_button.style.display = button_garden;
    seeds_button.style.display = button_seeds;
    back_button.style.display = button_back;
    article_text.style.display = text_article;
    instructions_text.style.display = text_instructions;
}

function CreateMesh(url, materials, position, rotation, scale, colliderId){
    var materialIndex = 0;
    gltfLoader.load(url.href,function(gltf){
        const model = gltf.scene;
        model.traverse((o) => {            
            if (o.isMesh){
                o.castShadow = true;
                o.receiveShadow = true; 
                if(materials != null){
                const texture = o.material.map;
                // console.log(texture);
                o.material = materials[materialIndex];
                o.material.map = texture;
                materialIndex++;
                }
            }
        });        
        model.rotation.set(rotation[0], rotation[1], rotation[2]);
        model.scale.set(scale,scale,scale);        
        model.position.set(position[0], position[1], position[2]);
                
        //console.log(model);
        scene.add(model);        
        // gui.add(model.position, 'x')
        // gui.add(model.position, 'y')
        // gui.add(model.position, 'z')
        // gui.add(model.rotation, 'x')
        // gui.add(model.rotation, 'y')
        // gui.add(model.rotation, 'z')
        SetModel(model, colliderId)
        
    }, undefined, function(error){
        console.log(error);
    })
}

function SetModel(mode, colliderId){
    // console.log(colliderId);
    models[colliderId] = mode;
}