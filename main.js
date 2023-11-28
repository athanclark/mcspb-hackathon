import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const composer = new EffectComposer(renderer);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 5;

const scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xcccccc));
// Skybox
const bgUrls = ['right', 'left', 'top', 'bottom', 'front', 'rear']
      .map((x) => `public/skybox-${x}.png`);
scene.background = new THREE.CubeTextureLoader().load(bgUrls);

// Post-Processing
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2( window.innerWidth, window.innerHeight ),
    1.5,
    0.4,
    0.85
);
bloomPass.threshold = 0.35;
bloomPass.strength = 0.2;
bloomPass.radius = 0;
composer.addPass( bloomPass );
const outputPass = new OutputPass();
composer.addPass( outputPass );

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(0, 1, 0);
light.castShadow = true;
scene.add(light);

let monkey;
const manager = new THREE.LoadingManager();
manager.onLoad = function() {
    document.body.appendChild(renderer.domElement);
};
const gltfLoader = new GLTFLoader(manager);
gltfLoader.load('public/suzanne.glb', function(suzanne) {
    monkey = suzanne.scene.children[0];
    const material = new THREE.MeshPhysicalMaterial({
        roughness: 0,
        transmission: 1,
        thickness: 2
    });
    monkey.material = material;
    monkey.castShadow = true;
    scene.add(monkey);
});

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5, 32, 32),
    new THREE.MeshPhysicalMaterial({
        color: 0x0000ff,
        reflectivity: 1.0,
        metalness: 0.0,
        sheen: 1.0
    })
);
plane.receiveShadow = true;
plane.rotation.x -= Math.PI / 2;
plane.position.y -= 1.5;
scene.add(plane);


// Runs every frame
function timePassed(diff) {
    // represents "one full rotation every 10 seconds"
    const ang_speed = Math.PI / (5 * 1000);
    if (monkey) {
        monkey.rotation.x += ang_speed * diff;
	      monkey.rotation.y += ang_speed * diff;
    }
}


// Animation loop
let last_frame = null;
function animate(now) {
	  requestAnimationFrame(animate);

    const diff = now - last_frame;

    if (diff) {
        if (diff < 0) {
            throw new Error('diff should never be negative!', diff);
        }

        timePassed(diff);
    }

	  composer.render(scene, camera);
    last_frame = now;
}

// Error if WebGL isn't available
if ( WebGL.isWebGLAvailable() ) {
	  animate();
    requestAnimationFrame(animate);
} else {
	  const warning = WebGL.getWebGLErrorMessage();
	  document.body.appendChild(warning);
}


// Move the camera around with the mouse
window.addEventListener('mousemove', (e) => {
    if (e.clientX >= 0 && e.clientY >= 0) {
        const MAX_X = 2;
        const MAX_Y = 2;
        const newX = ((e.clientX - (window.innerWidth / 2)) / window.innerWidth) * MAX_X;
        const newY = ((e.clientY - (window.innerWidth / 2)) / window.innerWidth) * MAX_Y;
        camera.position.x = newX;
        camera.position.y = newY * -1;
        camera.lookAt(0, 0, 0);
    }
});

// Adjust the camera and renderer when the window resizes
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
