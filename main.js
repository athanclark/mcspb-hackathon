import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
// import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

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
// scene.fog = new THREE.Fog(0x000000, 1, 1000);

const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

// const glitchPass = new GlitchPass();
// composer.addPass( glitchPass );

const outputPass = new OutputPass();
composer.addPass( outputPass );

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(0, 1, 0);
light.castShadow = true;
scene.add(light);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial({color: 0x00ff00})
);
cube.castShadow = true;
scene.add(cube);
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3, 32, 32),
    new THREE.MeshStandardMaterial({color: 0x0000ff})
);
plane.receiveShadow = true;
plane.rotation.x -= Math.PI / 2;
plane.position.y -= 1;
scene.add(plane);


function timePassed(diff) {
    // represents "one full rotation every 10 seconds"
    const ang_speed = Math.PI / (5 * 1000);
    cube.rotation.x += ang_speed * diff;
	  cube.rotation.y += ang_speed * diff;
}


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

if ( WebGL.isWebGLAvailable() ) {
	  animate();
    requestAnimationFrame(animate);
} else {
	  const warning = WebGL.getWebGLErrorMessage();
	  document.body.appendChild(warning);
}

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
