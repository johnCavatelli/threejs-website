import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import * as dat from 'dat.gui'
import gsap from 'gsap'
import { StencilOp, Vector3 } from 'three'

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
var mouse, raycaster, currentState, currentHover, selectedSeedHitboxID, newPlantPoint;
var models = {};
var hitboxes = {};
var seedToPlants = {};
var plantIdToHitbox = {};
const shovelId = -10;
const canId = -20;
const plant1Id = -30;
const plant2Id = -31;
const plant3Id = -32;

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

//HTML Listeners
start_button.addEventListener("click", function(){ChangeState(states["lookSeeds"])});
garden_button.addEventListener("click", function(){ChangeState(states["lookGarden"])});
seeds_button.addEventListener("click", function(){ChangeState(states["lookSeeds"])});

//ThreeJS Setup
const gui = new dat.GUI() // Debug
const canvas = document.querySelector('canvas.webgl') // Canvas
const scene = new THREE.Scene() // Scene
const gltfLoader = new GLTFLoader(loadingManager);

//Model URLs
const shovelURL = new URL('../models/shovel.glb', import.meta.url);
const canURL = new URL('../models/can.glb', import.meta.url);
const cloudURL = new URL('../models/cloud.glb', import.meta.url);
const boxURL = new URL('../models/box.glb', import.meta.url);
const packetURL = new URL('../models/packet.glb', import.meta.url);
const tableURL = new URL('../models/Table.glb', import.meta.url);
const plantURL = new URL('../models/flowers.glb', import.meta.url);

// Primitive Geometry
const moundGeometry = new THREE.TorusGeometry(0.05, .02, 16, 10 );
const sphereGeometry = new THREE.SphereBufferGeometry(.05, 12, 12);
const packetGeometry = new THREE.BoxGeometry(0.45,0.3,0.65);
const dirtGeometry = new THREE.BoxGeometry(1.1,0.1,1.4);
const plantHitboxGeometry = new THREE.BoxGeometry(0.3,0.6,0.3);

// Materials
scene.background = new THREE.Color(0x85dde6)
scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );


const clear_mat = new THREE.MeshStandardMaterial({opacity:0, transparent:true})
const def_mat = new THREE.MeshStandardMaterial()
const table_mat = new THREE.MeshStandardMaterial()
const box_mat = new THREE.MeshStandardMaterial()
const cloud_mat = new THREE.MeshStandardMaterial()
const dirt_mat = new THREE.MeshStandardMaterial()
const packet_mat = new THREE.MeshToonMaterial()
const flower_mat = new THREE.MeshToonMaterial()
table_mat.color = new THREE.Color(0x876031)
box_mat.color = new THREE.Color(0xb58b4c)
cloud_mat.color = new THREE.Color(0xd1eaeb)
dirt_mat.color = new THREE.Color(0x422e1c)
def_mat.color = new THREE.Color(0xaf00af)

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
const dirt_box = new THREE.Mesh(dirtGeometry, clear_mat)
dirt_box.position.set(1.9,0.8,0);
dirt_box.rotation.set(0,1.57,0);
dirt_box.name = "dirt"


const plant1_hitbox = new THREE.Mesh(plantHitboxGeometry, def_mat);
const plant2_hitbox = new THREE.Mesh(plantHitboxGeometry, def_mat);
plant1_hitbox.position.set(0,-2,0);
plant2_hitbox.position.set(0,-2,0);
plant1_hitbox.name = "plant";
plant2_hitbox.name = "plant";
const hitIndicator = new THREE.Mesh(sphereGeometry, def_mat)
hitIndicator.position.set(0,-4,0);

scene.add(b1);
scene.add(b2);
scene.add(dirt_box);
scene.add(hitIndicator);
scene.add(plant1_hitbox);
scene.add(plant2_hitbox);

seedToPlants[b1.id] = plant1_hitbox.id;
seedToPlants[b2.id] = plant2_hitbox.id;
plantIdToHitbox[plant1Id] = plant1_hitbox;
plantIdToHitbox[plant2Id] = plant2_hitbox;


CreateMesh(canURL, [cloud_mat, cloud_mat, cloud_mat, cloud_mat, cloud_mat], [3.2,-0.1,0.6], [0,0,0], 0.2, canId)
CreateMesh(shovelURL, [box_mat, dirt_mat], [4,0,1], [0,1.7,0], 0.2, shovelId)
CreateMesh(packetURL, [packet_mat], [4,0.5,-0.4], [0,1.3,0], 0.2, b1.id)
CreateMesh(packetURL, [packet_mat], [4.5,0.5,-0.23], [0,1.3,0], 0.2, b2.id)
CreateMesh(cloudURL, [cloud_mat], [2,-2,0], [0,0,0.1], 0.1)
CreateMesh(cloudURL, [cloud_mat], [-5,20,-20], [0,0,0], 0.2)
CreateMesh(cloudURL, [cloud_mat], [15,-2,-80], [0,0,0], 0.3)
CreateMesh(cloudURL, [cloud_mat], [2,-20,-50], [0,0,0], 0.2)
CreateMesh(tableURL, [table_mat], [4.4,-0.3,0], [0,1.27,0], 0.07)
CreateMesh(boxURL, [box_mat, dirt_mat], [1.9,0.2,0], [0,1.57,0], 0.08)
CreateMesh(plantURL, [flower_mat], [1,-1.3,0], [0,0,0], 0.6, plant1_hitbox.id)
CreateMesh(plantURL, [flower_mat], [1,-1.3,1], [0,0,0], 0.6, plant2_hitbox.id)

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
scene.add( dirLight );

const hemiLight = new THREE.HemisphereLight( 0xeef0c0, 0x444444, 1.2 );
hemiLight.position.set( 0, 20, 0 );
scene.add( hemiLight );

//scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );


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
renderer.shadowMap.enabled = true

// Mouse
mouse = new THREE.Vector2
raycaster = new THREE.Raycaster();
window.addEventListener( 'pointermove', onMouseMove );
window.addEventListener( 'click', onClick);

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.panSpeed = 2
controls.enableDamping = true


/**
 * Main Loop
 */
ChangeState(states["intro"]);
const clock = new THREE.Clock()

const tick = () =>
{    
    const elapsedTime = clock.getElapsedTime()
    // controls.update();

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
        case states["lookSeeds"]:   
            raycaster.setFromCamera( mouse, camera ); // update the picking ray with the camera and pointer position
            const pIntersects = raycaster.intersectObjects( scene.children );// calculate objects intersecting the picking ray
            var newHover;
            for ( let i = 0; i < pIntersects.length; i ++ ) {
                if(pIntersects[i].object.name == "plant"){
                    gsap.to(plantIdToHitbox.position, {
                        y: 0.7,
                        duration: 0.5,
                        ease: "power4.out"         
                    })
                    newHover = pIntersects[i].object.id;
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
                currentHover = null;
                ChangeState(states["diggingHole"])
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
                models[seedToPlants[selectedSeedHitboxID]].position.set(newPlantPoint.x,0,newPlantPoint.z);
                hitboxes[selectedSeedHitboxID].position.set(-10,-10,0);
                plantIdToHitbox[seedToPlants[selectedSeedHitboxID]].position.set(newPlantPoint.x, 0.8, newPlantPoint.z);
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
            ChangeHTMLStates({text_welcome: "",button_start: "",text_loading:"none", start_button:"none", button_garden:"none", button_seeds:"none", button_back:"none"});
            break;
        case states["lookSeeds"]:
            currentState = states["lookSeeds"];
            ChangeCameraValues(4.3,2,0,-1.5,0,0,2);
            ChangeHTMLStates({text_welcome: "none",button_start: "none",text_loading:"none", button_back:"none", button_garden: "", button_seeds: "none"});
          break;
        case states["lookGarden"]:
            currentState = states["lookGarden"];
            ChangeCameraValues(2,2.3,1.6,-0.8,0,0,2);
            ChangeHTMLStates({back_button: "none", button_garden:"none", button_seeds:""});
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
            ChangeHTMLStates({back_button: "", button_garden:"none", button_seeds:"none"});
          break;
        case states["plantingSeed"]:
            currentState = states["plantingSeed"];
            const newMound = new THREE.Mesh(moundGeometry, dirt_mat)
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

function ChangeHTMLStates({text_loading, text_welcome, button_start, button_garden, button_seeds, button_back} = {}){
    loading_text.style.display = text_loading;
    welcome_text.style.display = text_welcome;
    start_button.style.display = button_start;
    garden_button.style.display = button_garden;
    seeds_button.style.display = button_seeds;
    back_button.style.display = button_back;
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
    console.log(colliderId);
    models[colliderId] = mode;
}