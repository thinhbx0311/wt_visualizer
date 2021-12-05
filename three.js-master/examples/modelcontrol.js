import * as THREE from "../build/three.module.js";

import Stats from "./jsm/libs/stats.module.js";
import { GUI } from "./jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "./jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "./jsm/loaders/FBXLoader.js";
import { TransformControls } from "./jsm/controls/TransformControls.js";

let scene, renderer, camera, stats, mesh;
let model, skeleton, mixer, clock, controls;
var dirLight2;
var animations;
var actionMC, actionDC;

const crossFadeControls = [];

let currentBaseAction = "Mocua";
const baseActions = {
	Banhbao: { weight: 0 },
	Carot: { weight: 0 },
	Dongcua: { weight: 0 },
	Ga: { weight: 0 },
	Khoaitay: { weight: 0 },
	Mocua: { weight: 0 },
};
const additiveActions = {
	sneak_pose: { weight: 0 },
	sad_pose: { weight: 0 },
	agree: { weight: 0 },
	headShake: { weight: 0 },
};
let panelSettings;
let sprite;
var gaModel, banhModel;
var displayGa = false;
var objects = [];
var controlObj;
var objectsSelect = [];


var isClose = true;

//Nuong Ga
var isNuongGa = false;
var stepNuongGa;



var isHapBanh = false;

//Info canvas

const canvas = document.getElementById("number");
const ctx = canvas.getContext("2d");
const x = 32;
const y = 32;
const radius = 30;
const startAngle = 0;
const endAngle = Math.PI * 2;

ctx.fillStyle = "rgb(0, 0, 0)";
ctx.beginPath();
ctx.arc(x, y, radius, startAngle, endAngle);
ctx.fill();

ctx.strokeStyle = "rgb(255, 255, 255)";
ctx.lineWidth = 3;
ctx.beginPath();
ctx.arc(x, y, radius, startAngle, endAngle);
ctx.stroke();

ctx.fillStyle = "rgb(255, 255, 255)";
ctx.font = "32px sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("1", x, y);

let spriteBehindObject;
const annotation = document.querySelector(".annotation");

init();
loadGa();

function init() {
	const container = document.getElementById("container");
	clock = new THREE.Clock();

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xa0a0a0);
	scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

	const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
	hemiLight.position.set(0, 20, 0);
	scene.add(hemiLight);

	const dirLight = new THREE.DirectionalLight(0xa0a0a0, 0.5);
	dirLight.position.set(3, 10, 10);
	dirLight.castShadow = true;
	dirLight.shadow.camera.top = 2;
	dirLight.shadow.camera.bottom = -2;
	dirLight.shadow.camera.left = -2;
	dirLight.shadow.camera.right = 2;
	dirLight.shadow.camera.near = 0.1;
	dirLight.shadow.camera.far = 40;
	scene.add(dirLight);

	dirLight2 = new THREE.DirectionalLight(0xffffff);
	dirLight2.position.set(3, 10, -10);
	dirLight2.castShadow = false;
	//dirLight2.position.multiplyScalar(100);
	scene.add(dirLight2);

	// ground

	mesh = new THREE.Mesh(
		new THREE.PlaneGeometry(100, 100),
		new THREE.MeshPhongMaterial({
			color: new THREE.Color("rgb(88,103,134)"),
			depthWrite: false,
		})
	);
	mesh.rotation.x = -Math.PI / 2;
	mesh.receiveShadow = true;
	scene.add(mesh);

	const numberTexture = new THREE.CanvasTexture(
		document.querySelector("#number")
	);
	const spriteMaterial = new THREE.SpriteMaterial({
		map: numberTexture,
		alphaTest: 0.5,
		transparent: true,
		depthTest: false,
		depthWrite: false,
	});

	sprite = new THREE.Sprite(spriteMaterial);
	sprite.position.set(0.8, 1, 0);
	sprite.scale.set(0.2, 0.2, 0.2);

	//scene.add(sprite);
	scene.add(new THREE.AxesHelper(500));

	const loader = new GLTFLoader();
	loader.load("models/gltf/NU-SC180B_Anim_2.glb", function (gltf) {
		model = gltf.scene;
		model.scale.set(3, 3, 3);

		model.traverse(function (object) {
			if (object.isMesh) object.castShadow = true;
		});

		skeleton = new THREE.SkeletonHelper(model);
		skeleton.visible = false;
		scene.add(skeleton);

		animations = gltf.animations;
		mixer = new THREE.AnimationMixer(model);

		//numAnimations = animations.length;

		scene.add(model);

		animate();
	});

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;
	container.appendChild(renderer.domElement);

	// camera
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		100
	);
	camera.position.set(-1, 2, 3);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.enablePan = false;
	controls.enableZoom = false;
	controls.target.set(0, 1, 0);
	controls.update();

	controlObj = new TransformControls(camera, renderer.domElement);
	controlObj.showZ = true;
	controlObj.showY = false;
	controlObj.showX = false;
	controlObj.addEventListener("change", render);

	controlObj.addEventListener("dragging-changed", function (event) {
		controls.enabled = !event.value;
	});

	stats = new Stats();
	container.appendChild(stats.dom);

	window.addEventListener("resize", onWindowResize);
}

function loadGa() {
	var texture = new THREE.TextureLoader().load("textures/ga/ga.png");
	// model
	const loader = new FBXLoader();
	loader.load("models/fbx/ga.fbx", function (object) {
		gaModel = object.children[0];
		gaModel.position.set(0, 0.5277480372311415, 1);
		gaModel.scale.set(0.003, 0.003, 0.003);

		gaModel.traverse(function (child) {
			if (child.isMesh) {
				child.material.map = texture;
				//child.material.needsUpdate = true;
				child.castShadow = true;
			}
		});

		const geometry = new THREE.SphereGeometry(2, 32, 16);
		const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
		const startButton = new THREE.Mesh(geometry, material);
		startButton.position.set(0.42,0.29,0.53);
		startButton.scale.set(0.01,0.01,0.01);
		scene.add(startButton)
		startButton.name = "startbutton";
		objectsSelect.push(startButton);

		const plusButton = new THREE.Mesh(geometry, material);
		plusButton.position.set(0.35,0.29,0.53);
		plusButton.scale.set(0.01,0.01,0.01);
		scene.add(plusButton)
		plusButton.name = "plusbutton";
		objectsSelect.push(plusButton);

		const minusButton = new THREE.Mesh(geometry, material);
		minusButton.position.set(0.27,0.29,0.53);
		minusButton.scale.set(0.01,0.01,0.01);
		scene.add(minusButton)
		minusButton.name = "minusbutton";
		objectsSelect.push(minusButton);

		const restartButton = new THREE.Mesh(geometry, material);
		restartButton.position.set(0.19,0.29,0.53);
		restartButton.scale.set(0.01,0.01,0.01);
		scene.add(restartButton)
		restartButton.name = "restartbutton";
		objectsSelect.push(restartButton);

		window.addEventListener('keydown', function (event) {

			switch (event.keyCode) {

				case 81: // Q
					controlObj.setSpace(controlObj.space === 'local' ? 'world' : 'local');
					console.log(gaModel.position);
					break;

				case 16: // Shift
					controlObj.setTranslationSnap(100);
					controlObj.setRotationSnap(THREE.MathUtils.degToRad(15));
					controlObj.setScaleSnap(0.25);
					break;

				case 87: // W
					controlObj.setMode('translate');
					break;

				case 69: // E
					controlObj.setMode('rotate');
					break;

				case 82: // R
					controlObj.setMode('scale');
					break;

				case 67: // C

					break;

				case 86: // V

					break;
				case 187:
				case 107: // +, =, num+
					controlObj.setSize(controlObj.size + 0.1);
					break;

				case 189:
				case 109: // -, _, num-
					controlObj.setSize(Math.max(controlObj.size - 0.1, 0.1));
					break;

				case 88: // X
					controlObj.showX = !controlObj.showX;
					break;

				case 89: // Y
					controlObj.showY = !controlObj.showY;
					break;

				case 90: // Z
					controlObj.showZ = !controlObj.showZ;
					break;

				case 32: // Spacebar
					controlObj.enabled = !controlObj.enabled;
					break;

			}

		});

		window.addEventListener('keyup', function (event) {

			switch (event.keyCode) {

				case 16: // Shift
					control.setTranslationSnap(null);
					control.setRotationSnap(null);
					control.setScaleSnap(null);
					break;

			}

		});
		document.addEventListener('mousedown', onDocumentMouseDown);
	});
}

function createPanel() {
	const panel = new GUI({ width: 310 });

	const folder1 = panel.addFolder("Base Actions");
	const folder2 = panel.addFolder("Additive Action Weights");
	const folder3 = panel.addFolder("General Speed");

	panelSettings = {
		"modify time scale": 1.0,
	};

	const baseNames = ["None", ...Object.keys(baseActions)];

	for (let i = 0, l = baseNames.length; i !== l; ++i) {
		const name = baseNames[i];
		const settings = baseActions[name];
		panelSettings[name] = function () {
			const currentSettings = baseActions[currentBaseAction];
			const currentAction = currentSettings ? currentSettings.action : null;
			const action = settings ? settings.action : null;
			action.clampWhenFinished = true;
			action.loop = THREE.LoopOnce;
			prepareCrossFade(currentAction, action, 0.35);
		};

		crossFadeControls.push(folder1.add(panelSettings, name));
	}

	for (const name of Object.keys(additiveActions)) {
		const settings = additiveActions[name];

		panelSettings[name] = settings.weight;
		folder2
			.add(panelSettings, name, 0.0, 1.0, 0.01)
			.listen()
			.onChange(function (weight) {
				setWeight(settings.action, weight);
				settings.weight = weight;
			});
	}

	folder3
		.add(panelSettings, "modify time scale", 0.0, 1.5, 0.01)
		.onChange(modifyTimeScale);

	folder1.open();
	folder2.open();
	folder3.open();

	crossFadeControls.forEach(function (control) {
		control.setInactive = function () {
			control.domElement.classList.add("control-inactive");
		};

		control.setActive = function () {
			control.domElement.classList.remove("control-inactive");
		};

		const settings = baseActions[control.property];

		if (!settings || !settings.weight) {
			control.setInactive();
		}
	});
}

function activateAction(action) {
	const clip = action.getClip();
	console.log(clip.name);
	const settings = baseActions[clip.name] || additiveActions[clip.name];
	setWeight(action, settings.weight);
	action.play();
}

function modifyTimeScale(speed) {
	mixer.timeScale = speed;
}

function prepareCrossFade(startAction, endAction, duration) {
	// If the current action is 'idle', execute the crossfade immediately;
	// else wait until the current action has finished its current loop

	if (currentBaseAction === "Mocua" || !startAction || !endAction) {
		executeCrossFade(startAction, endAction, duration);
	} else {
		synchronizeCrossFade(startAction, endAction, duration);
	}

	// Update control colors

	if (endAction) {
		const clip = endAction.getClip();
		currentBaseAction = clip.name;
	} else {
		currentBaseAction = "None";
	}

	crossFadeControls.forEach(function (control) {
		const name = control.property;

		if (name === currentBaseAction) {
			control.setActive();
		} else {
			control.setInactive();
		}
	});
}

function synchronizeCrossFade(startAction, endAction, duration) {
	mixer.addEventListener("loop", onLoopFinished);

	function onLoopFinished(event) {
		if (event.action === startAction) {
			mixer.removeEventListener("loop", onLoopFinished);

			executeCrossFade(startAction, endAction, duration);
		}
	}
}

function executeCrossFade(startAction, endAction, duration) {
	// Not only the start action, but also the end action must get a weight of 1 before fading
	// (concerning the start action this is already guaranteed in this place)

	if (endAction) {
		setWeight(endAction, 1);
		endAction.time = 0;

		if (startAction) {
			// Crossfade with warping

			startAction.crossFadeTo(endAction, duration, true);
		} else {
			// Fade in

			endAction.fadeIn(duration);
		}
	} else {
		// Fade out

		startAction.fadeOut(duration);
	}
}

// This function is needed, since animationAction.crossFadeTo() disables its start action and sets
// the start action's timeScale to ((start animation's duration) / (end animation's duration))

function setWeight(action, weight) {
	action.enabled = true;
	action.setEffectiveTimeScale(1);
	action.setEffectiveWeight(weight);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	// Render loop
	requestAnimationFrame(animate);

	// Get the time elapsed since the last frame, used for mixer update

	const mixerUpdateDelta = clock.getDelta();

	// Update the animation mixer, the stats panel, and render this frame

	mixer.update(mixerUpdateDelta);

	stats.update();

	renderer.render(scene, camera);
	updateAnnotationOpacity();
	updateScreenPosition();
	//update();
	if (gaModel.position.z < 0.2 && isClose == false && isNuongGa == true && stepNuongGa == 1) {
		isClose = true;
		//DongCua();
		controlObj.showZ = false;
		controlObj.enabled = false;
		NuongGa(2);
	}
	if (isClose && isNuongGa && stepNuongGa == 2) {
		NuongGa(3);

	}
}

function render() {

	renderer.render(scene, camera);

}

function updateAnnotationOpacity() {
	const meshDistance = camera.position.distanceTo(model.position);
	const spriteDistance = camera.position.distanceTo(sprite.position);
	spriteBehindObject = spriteDistance > meshDistance;
	sprite.material.opacity = spriteBehindObject ? 0.5 : 1;
}

function updateScreenPosition() {
	const vector = new THREE.Vector3(0.8, 0.5, 0);
	const canvas = renderer.domElement;

	vector.project(camera);

	vector.x = Math.round(
		(0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio)
	);
	vector.y = Math.round(
		(0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio)
	);

	annotation.style.top = `${vector.y}px`;
	annotation.style.left = `${vector.x}px`;
	annotation.style.opacity = spriteBehindObject ? 0.25 : 1;
}

window.MoCua = function MoCua() {
	if (actionDC != null) {
		actionDC.stop();
	}
	isClose = false;
	actionMC = mixer.clipAction(animations[5]);
	actionMC.timeScale = 0.3;
	actionMC.setLoop(THREE.LoopOnce);
	actionMC.clampWhenFinished = true;
	actionMC.enable = true;
	actionMC.play().reset();
};

window.DongCua = function DongCua() {
	if (actionMC != null) {
		actionMC.stop();
	}
	isClose = true;
	actionDC = mixer.clipAction(animations[2]);
	actionDC.timeScale = 0.3;
	actionDC.setLoop(THREE.LoopOnce);
	actionDC.enable = true;

	actionDC.play().reset();
};

window.CloseFucntion = function CloseFucntion() {

	if (!isClose) {
		DongCua();

	} else {


	}
	scene.remove(controlObj);
	scene.remove(gaModel);
	isNuongGa = false;
	isHapBanh = false;
}

window.NuongGa = function NuongGa(value) {
	isNuongGa = true;
	switch (value) {
		case 1:
			stepNuongGa = 1;
			MoCua();
			//controls.enableRotate = false;
			//scene.add(sprite);
			setTimeout(() => {

				scene.add(gaModel);
				controlObj.attach(gaModel);
				scene.add(controlObj);

			}, 3000);
			document.getElementById("fucntion").innerHTML = "Nướng Gà";
			document.getElementById("step").innerHTML = "Bước 1";
			document.getElementById("content").innerHTML = "Cho gà vào lồi";
			break;
		case 2:
			console.log("next");
			stepNuongGa = 2;
			document.getElementById("fucntion").innerHTML = "Nướng Gà";
			document.getElementById("step").innerHTML = "Bước 2";
			document.getElementById("content").innerHTML = "Điều chỉnh bảng và chọn chức năng nướng";
			DongCua();
			isClose = true;
			controlObj.enabled = true;
			camera.position.set(2, 1, 0.7);
			controls.target.set(0, 0, 0);
			break;
		case 3:
			console.log("next");
			stepNuongGa = 3;
			document.getElementById("fucntion").innerHTML = "Nướng Gà";
			document.getElementById("step").innerHTML = "Bước 3";
			document.getElementById("content").innerHTML = "chojn";
			DongCua();
			isClose = true;
			controlObj.enabled = true;
			break;
		default:
			console.log(value);
	}
};

window.BanhBao = function BanhBao(value) {
	switch (value) {
		case 1:
			MoCua();
			document.getElementById("fucntion").innerHTML = "Bánh Bao";
			document.getElementById("content").innerHTML = "Cho bánh bao vào lò";
			break;
		case 2:
			console.log(value);
			break;
		default:
			console.log(value);
	}
};

function onDocumentMouseDown(event) {
	event.preventDefault();
	var mouse3D = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1,
		-(event.clientY / window.innerHeight) * 2 + 1,
		0.5);
	var raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse3D, camera);
	var intersects = raycaster.intersectObjects(objectsSelect);
	if (intersects[0] != null){
		if (intersects[0].object.name == "startbutton"){
			console.log("start");
		}
		else if (intersects[0].object.name == "plusbutton"){
			console.log("plus");
		}
	}
}


