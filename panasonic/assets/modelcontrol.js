import * as THREE from "../build/three.module.js";

import Stats from "./jsm/libs/stats.module.js";
import { GUI } from "./jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "./jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "./jsm/loaders/FBXLoader.js";
import { TransformControls } from "./jsm/controls/TransformControls.js";
import { RoomEnvironment } from "./jsm/environments/RoomEnvironment.js";

let scene, renderer, camera, stats, mesh;
let model, skeleton, mixer, clock, controls;
var dirLight2;
var animations;
var actionMC, actionDC;

const crossFadeControls = [];
var timeouts = [];

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
var gaModel,
	banhModel1,
	banhModel2,
	banhModel3,
	banhModel4,
	banhModel5,
	banhModel6,
	groupBanh;
var controlGaObj, controlBanhObj, controlKhay;
var objectsSelect = [];
var lcd;
var smokeParticles = [];
var loaderKhay1, loaderKhay2;
var banhKhay2, banhKhay1;
var khay1, khay2, khay3;

var isClose = true;

//Nuong Ga
var isNuongGa = false;
var stepNuongGa;

var isHapBanh = false;
var stepBanhBao;
var isOpenKhay = false;

//Info canvas
var loadingScreen = document.getElementById("loading-screen");
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

//Điều khiển bếp
var canSelect, isSelectFunction, canSetTime, isSetTime;
var chucnang = [
	"Chế độ hấp nhiệt độ thấp",
	"Chế độ hấp thông thường",
	"Chế độ chiên không dầu",
	"Chế độ lên men",
	"Chế độ đối lưu (Với cách này, toàn bộ bề mặt thức ăn được nhận năng lượng nhiệt cùng một lúc. Ví dụ: luộc rau, chiên cá ngập dầu, đồ xôi. Khi luộc rau, bạn nên luộc với nhiều nước cho ngập rau, vì rau phải được nước bao bọc hoàn toàn thì mới chín đều được)",
	"Chế độ hầm bằng phương pháp đối lưu ",
	"Chế độ Menu tự động",
];

//Tao nhiet do
var nhietDoMaterial, nhietdo;
// Tao hoi nuoc
var groupHoiNuoc;
// Khay duoi
var groupKhay;

var textureLCD = new THREE.TextureLoader().load("textures/LCD/normal.png");
var textureLCD00 = new THREE.TextureLoader().load("textures/LCD/0.png");
var textureLCD01 = new THREE.TextureLoader().load("textures/LCD/1.png");
var textureLCD02 = new THREE.TextureLoader().load("textures/LCD/2.png");
var textureLCD03 = new THREE.TextureLoader().load("textures/LCD/3.png");
var textureLCD04 = new THREE.TextureLoader().load("textures/LCD/4.png");
var textureLCD05 = new THREE.TextureLoader().load("textures/LCD/5.png");
var textureLCD06 = new THREE.TextureLoader().load("textures/LCD/6.png");
var textureLCD07 = new THREE.TextureLoader().load("textures/LCD/7.png");

//Time
var defaultTime = new THREE.TextureLoader().load(
	"textures/Time Textures/0.png"
);
var timeTextures = [
	new THREE.TextureLoader().load("textures/Time Textures/1.png"),
	new THREE.TextureLoader().load("textures/Time Textures/2.png"),
	new THREE.TextureLoader().load("textures/Time Textures/3.png"),
	new THREE.TextureLoader().load("textures/Time Textures/4.png"),
	new THREE.TextureLoader().load("textures/Time Textures/5.png"),
	new THREE.TextureLoader().load("textures/Time Textures/6.png"),
	new THREE.TextureLoader().load("textures/Time Textures/7.png"),
	new THREE.TextureLoader().load("textures/Time Textures/8.png"),
];
init();
loadGa();

function init() {
	const container = document.getElementById("container");
	clock = new THREE.Clock();
	scene = new THREE.Scene();

	const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
	hemiLight.position.set(0, 0, 0);
	scene.add(hemiLight);

	const dirLight = new THREE.DirectionalLight(0xffffff);
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

	// ground

	var grid = new THREE.GridHelper(100, 40, 0x000000, 0x000000);
	grid.material.opacity = 0.1;
	grid.material.depthWrite = false;
	grid.material.transparent = true;
	scene.add(grid);

	const mesh = new THREE.Mesh(
		new THREE.PlaneGeometry(100, 100),
		new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
	);
	mesh.rotation.x = -Math.PI / 2;
	mesh.receiveShadow = true;
	scene.add(mesh);

	lcd = new THREE.Mesh(
		new THREE.PlaneGeometry(0.3, 0.15),
		new THREE.MeshBasicMaterial({
			map: textureLCD,
			opacity: 1,
			transparent: false,
		})
	);
	//lcd.rotation.x = -Math.PI / 2;
	lcd.receiveShadow = true;
	lcd.position.set(0, 0.3, 0.525);
	scene.add(lcd);

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
	//scene.add(new THREE.AxesHelper(500));

	var manager = new THREE.LoadingManager();
	manager.onProgress = function (item, loaded, total) {
		//console.log(item, loaded, total);
	};
	manager.onLoad = function () {
		loadingScreen.classList.add("fade-out");
		// optional: remove loader from DOM via event listener
		loadingScreen.addEventListener("transitionend", onTransitionEnd);
	};
	manager.onError = function () {
		//console.log('there has been an error');
	};

	const loader = new GLTFLoader(manager);
	loader.load("models/gltf/NU-SC180B_Anim_3.glb", function (gltf) {
		model = gltf.scene;
		model.scale.set(3, 3, 3);

		model.traverse(function (object) {
			if (object.isMesh) object.castShadow = true;
		});

		model.getObjectByName("LCD").material = new THREE.MeshBasicMaterial({
			map: textureLCD,
			opacity: 1,
			transparent: false,
		});
		model.getObjectByName("Mesh002_2").material = new THREE.MeshBasicMaterial({
			map: textureLCD,
			opacity: 0,
			transparent: true,
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

	const loaderKhayDuoi = new GLTFLoader();
	loaderKhayDuoi.load("models/gltf/khay.gltf", function (gltf) {
		gltf.scene.children[2].material = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			specular: 0xffffff,
			emissive: 0xffffff,
			shininess: 30,
			opacity: 0.6,
			transparent: true,
		});
		var model2 = gltf.scene;
		khay1 = gltf.scene.children[2];
		khay2 = gltf.scene.children[3];
		khay3 = gltf.scene.children[4];

		groupKhay = new THREE.Group();
		groupKhay.add(khay1);
		groupKhay.add(khay2);
		groupKhay.add(khay3);

		groupKhay.position.set(0, 0, -0.2);
		groupKhay.scale.set(0.003, 0.003, 0.003);
		scene.add(groupKhay);

		model2.scale.set(0.003, 0.0028, 0.003);
		model2.position.set(0, 0.01, -0.16);
		model2.traverse(function (object) {
			if (object.isMesh) object.castShadow = true;
		});
		scene.add(model2);
	});

	loaderKhay1 = new FBXLoader();
	loaderKhay1.load("models/fbx/khay final.fbx", function (object) {
		banhKhay1 = object.children[2];
		banhKhay1.position.set(0, -0.22, 0);
		banhKhay1.scale.set(0.003, 0.004, 0.003);

		banhKhay1.traverse(function (child) {
			if (child.isMesh) {
				//child.material.map = texture;
				//child.material.needsUpdate = true;
				child.castShadow = true;
			}
		});
		scene.add(banhKhay1);
	});
	loaderKhay2 = new FBXLoader();
	loaderKhay2.load("models/fbx/khay final.fbx", function (object) {
		banhKhay2 = object.children[2];
		banhKhay2.position.set(0, 0, 0);
		banhKhay2.scale.set(0.003, 0.004, 0.003);

		// banhModel2 = object.children[0];
		// banhModel2.position.set(0.3, 0.55, 1);
		// banhModel2.scale.set(0.1, 0.1, 0.1);
		//scene.add(banhModel2);

		banhKhay2.traverse(function (child) {
			if (child.isMesh) {
				//child.material.map = texture;
				//child.material.needsUpdate = true;
				child.castShadow = true;
			}
		});
		scene.add(banhKhay2);
	});

	// let tracker = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
	// 	new THREE.Vector3(0,0,0),
	//   new THREE.Vector3(0.8,1, 0)
	// ]), new THREE.LineBasicMaterial( {
	// 	color: 'red',
	// 	linewidth: 10,
	// 	linecap: 'round', //ignored by WebGLRenderer
	// 	linejoin:  'round' //ignored by WebGLRenderer
	// } ));
	// scene.add(tracker);

	const loaderBanh = new FBXLoader();
	loaderBanh.load("models/fbx/Banhbao.fbx", function (object) {
		banhModel1 = object.children[0];
		banhModel1.position.set(0, 0, 0);
		banhModel1.scale.set(0.1, 0.1, 0.1);

		// banhModel2 = object.children[0];
		// banhModel2.position.set(0.3, 0.55, 1);
		// banhModel2.scale.set(0.1, 0.1, 0.1);
		//scene.add(banhModel2);

		banhModel1.traverse(function (child) {
			if (child.isMesh) {
				//child.material.map = texture;
				//child.material.needsUpdate = true;
				child.castShadow = true;
			}
		});
		//scene.add(banhModel1);
	});
	const loaderBanh2 = new FBXLoader();
	loaderBanh2.load("models/fbx/Banhbao.fbx", function (object) {
		banhModel2 = object.children[0];
		//banhModel2.position.set(0.3, 0.55, 1);
		banhModel2.position.set(0.3, 0, 0);
		banhModel2.scale.set(0.1, 0.1, 0.1);
		//scene.add(banhModel2);

		banhModel2.traverse(function (child) {
			if (child.isMesh) {
				//child.material.map = texture;
				//child.material.needsUpdate = true;
				child.castShadow = true;
			}
		});
		//scene.add(banhModel2);
	});
	const loaderBanh3 = new FBXLoader();
	loaderBanh3.load("models/fbx/Banhbao.fbx", function (object) {
		banhModel3 = object.children[0];
		//banhModel2.position.set(0.3, 0.55, 1);
		banhModel3.position.set(-0.3, 0, 0);
		banhModel3.scale.set(0.1, 0.1, 0.1);
		//scene.add(banhModel2);

		banhModel3.traverse(function (child) {
			if (child.isMesh) {
				//child.material.map = texture;
				//child.material.needsUpdate = true;
				child.castShadow = true;
			}
		});
		//scene.add(banhModel3);
	});

	const loaderBanh4 = new FBXLoader();
	loaderBanh4.load("models/fbx/Banhbao.fbx", function (object) {
		banhModel4 = object.children[0];
		//banhModel2.position.set(0.3, 0.55, 1);
		banhModel4.position.set(0, 0.2, 0);
		banhModel4.scale.set(0.1, 0.1, 0.1);
		//scene.add(banhModel2);

		banhModel4.traverse(function (child) {
			if (child.isMesh) {
				//child.material.map = texture;
				//child.material.needsUpdate = true;
				child.castShadow = true;
			}
		});
		//scene.add(banhModel4);
	});

	const loaderBanh5 = new FBXLoader();
	loaderBanh5.load("models/fbx/Banhbao.fbx", function (object) {
		banhModel5 = object.children[0];
		//banhModel2.position.set(0.3, 0.55, 1);
		banhModel5.position.set(0.3, 0.2, 0);
		banhModel5.scale.set(0.1, 0.1, 0.1);
		//scene.add(banhModel2);

		banhModel5.traverse(function (child) {
			if (child.isMesh) {
				//child.material.map = texture;
				//child.material.needsUpdate = true;
				child.castShadow = true;
			}
		});
		//scene.add(banhModel5);
	});
	const loaderBanh6 = new FBXLoader();
	loaderBanh6.load("models/fbx/Banhbao.fbx", function (object) {
		banhModel6 = object.children[0];
		//banhModel2.position.set(0.3, 0.55, 1);
		banhModel6.position.set(-0.3, 0.2, 0);
		banhModel6.scale.set(0.1, 0.1, 0.1);
		//scene.add(banhModel2);

		banhModel6.traverse(function (child) {
			if (child.isMesh) {
				//child.material.map = texture;
				//child.material.needsUpdate = true;
				child.castShadow = true;
			}
		});
		//scene.add(banhModel6);
	});

	groupBanh = new THREE.Group();
	groupBanh.position.set(0, 0.55, 1);
	scene.add(groupBanh);

	//Quả cầu nhiệt độ
	nhietDoMaterial = new THREE.MeshPhongMaterial({
		color: 0xffe100,
		specular: 0xffe100,
		emissive: 0xffe100,
		shininess: 2,
		opacity: 0.3,
		transparent: true,
	});
	const sphereGeo = new THREE.SphereGeometry(4, 32, 16);
	nhietdo = new THREE.Mesh(sphereGeo, nhietDoMaterial);
	nhietdo.position.set(0, 0.5, 0);
	nhietdo.scale.set(0.1, 0.1, 0.1);
	//scene.add(nhietdo);

	// Hoi nuoc
	groupHoiNuoc = new THREE.Group();
	groupHoiNuoc.position.set(0, 0, 0.15);
	//scene.add(groupHoiNuoc);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;
	renderer.setAnimationLoop(render);
	container.appendChild(renderer.domElement);

	addParticles();

	const pmremGenerator = new THREE.PMREMGenerator(renderer);
	scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;
	scene.background = new THREE.Color(0xeeeeee);
	//scene.fog = new THREE.Fog(0xeeeeee, 10, 50);

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
	controls.enableZoom = true;
	controls.target.set(0, 1, 0);
	controls.minDistance = 2;
	controls.maxDistance = 10;
	controls.update();

	controlGaObj = new TransformControls(camera, renderer.domElement);
	controlGaObj.showZ = true;
	controlGaObj.showY = false;
	controlGaObj.showX = false;
	controlGaObj.addEventListener("dragging-changed", function (event) {
		controls.enabled = !event.value;
	});

	controlBanhObj = new TransformControls(camera, renderer.domElement);
	controlBanhObj.showZ = true;
	controlBanhObj.showY = false;
	controlBanhObj.showX = false;
	controlBanhObj.addEventListener("dragging-changed", function (event) {
		controls.enabled = !event.value;
	});

	controlKhay = new TransformControls(camera, renderer.domElement);
	controlKhay.showZ = true;
	controlKhay.showY = false;
	controlKhay.showX = false;
	controlKhay.addEventListener("dragging-changed", function (event) {
		controls.enabled = !event.value;
	});

	stats = new Stats();
	//container.appendChild(stats.dom);

	window.addEventListener("resize", onWindowResize);
}
function getRndInteger(min, max) {
	return (Math.random() * (max - min) + min).toFixed(4);
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
		const material = new THREE.MeshPhysicalMaterial({
			color: 0xffffff,
			metalness: 1,
			roughness: 0,
			ior: 1.5,
			envMapIntensity: 1,
			transmission: 1, // use material.transmission for glass materials
			specularIntensity: 1,
			specularColor: 0xffffff,
			opacity: 0,
			side: THREE.DoubleSide,
			transparent: true,
		});
		const startButton = new THREE.Mesh(geometry, material);
		startButton.position.set(0.42, 0.29, 0.53);
		startButton.scale.set(0.01, 0.01, 0.01);
		scene.add(startButton);
		startButton.name = "startbutton";
		objectsSelect.push(startButton);

		const plusButton = new THREE.Mesh(geometry, material);
		plusButton.position.set(0.35, 0.29, 0.53);
		plusButton.scale.set(0.01, 0.01, 0.01);
		scene.add(plusButton);
		plusButton.name = "plusbutton";
		objectsSelect.push(plusButton);

		const minusButton = new THREE.Mesh(geometry, material);
		minusButton.position.set(0.27, 0.29, 0.53);
		minusButton.scale.set(0.01, 0.01, 0.01);
		scene.add(minusButton);
		minusButton.name = "minusbutton";
		objectsSelect.push(minusButton);

		const restartButton = new THREE.Mesh(geometry, material);
		restartButton.position.set(0.19, 0.29, 0.53);
		restartButton.scale.set(0.01, 0.01, 0.01);
		scene.add(restartButton);
		restartButton.name = "restartbutton";
		objectsSelect.push(restartButton);

		window.addEventListener("keydown", function (event) {
			// switch (event.keyCode) {
			// 	case 81: // Q
			// 	controlBanhObj.setSpace(controlBanhObj.space === "local" ? "world" : "local");
			// 		break;
			// 	case 16: // Shift
			// 	controlBanhObj.setTranslationSnap(100);
			// 	controlBanhObj.setRotationSnap(THREE.MathUtils.degToRad(15));
			// 	controlBanhObj.setScaleSnap(0.25);
			// 		break;
			// 	case 87: // W
			// 		controlObj.setMode("translate");
			// 		break;
			// 	case 69: // E
			// 		controlObj.setMode("rotate");
			// 		break;
			// 	case 82: // R
			// 		controlObj.setMode("scale");
			// 		break;
			// 	case 67: // C
			// 		break;
			// 	case 86: // V
			// 		break;
			// 	case 187:
			// 	case 107: // +, =, num+
			// 		controlObj.setSize(controlObj.size + 0.1);
			// 		break;
			// 	case 189:
			// 	case 109: // -, _, num-
			// 		controlObj.setSize(Math.max(controlObj.size - 0.1, 0.1));
			// 		break;
			// 	case 88: // X
			// 		controlObj.showX = !controlObj.showX;
			// 		break;
			// 	case 89: // Y
			// 		controlObj.showY = !controlObj.showY;
			// 		break;
			// 	case 90: // Z
			// 		controlObj.showZ = !controlObj.showZ;
			// 		break;
			// 	case 32: // Spacebar
			// 		controlObj.enabled = !controlObj.enabled;
			// 		break;
			// }
		});

		window.addEventListener("keyup", function (event) {
			switch (event.keyCode) {
				case 16: // Shift
					control.setTranslationSnap(null);
					control.setRotationSnap(null);
					control.setScaleSnap(null);
					break;
			}
		});
		document.addEventListener("mousedown", onDocumentMouseDown);
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

var done;
function animate() {
	// Render loop
	requestAnimationFrame(animate);

	// Get the time elapsed since the last frame, used for mixer update

	const mixerUpdateDelta = clock.getDelta();

	// Update the animation mixer, the stats panel, and render this frame

	mixer.update(mixerUpdateDelta);

	stats.update();
	updateAnnotationOpacity();
	updateScreenPosition();

	if (
		gaModel.position.z < 0.1 &&
		isClose == false &&
		isNuongGa == true &&
		stepNuongGa == 1
	) {
		isClose = true;
		controlGaObj.showZ = false;
		controlGaObj.enabled = false;
		NuongGa(2);
	}
	if (isClose && isNuongGa && stepNuongGa == 2) {
		NuongGa(3);
	}
	if (isHapBanh && groupKhay.position.z <= 0.5 && !isOpenKhay && !done){
		groupKhay.position.z += mixerUpdateDelta * 0.45;
		setTimeout(() => {
			controlKhay.attach(groupKhay);
			scene.add(controlKhay);
			isOpenKhay = true;
			done = true;
		}, 2000);
	}
	if (isOpenKhay && groupKhay.position.z <= -0.2){
		
		setTimeout(() => {
			controls.enabled = true;
		}, 1000);
		
		BanhBao(1);
		isOpenKhay = false;
		controlKhay.showZ = false;
		controlKhay.enabled = false;
		//scene.remove(controlKhay);
		groupKhay.position.set(0, 0, -0.2);
	}

	if (
		groupBanh.position.z < 0.1 &&
		isClose == false &&
		isHapBanh == true &&
		stepBanhBao == 1
	) {
		isClose = true;
		controlBanhObj.showZ = false;
		controlBanhObj.enabled = false;
		BanhBao(2);
	}

	if (isClose && isHapBanh && stepBanhBao == 2) {
		BanhBao(3);
	}

	

	// if (isHapBanh){
	let smokeParticlesLength = smokeParticles.length;

	while (smokeParticlesLength--) {
		smokeParticles[smokeParticlesLength].rotation.z += mixerUpdateDelta * 2;
	}
	// }

	render();
}

var i = 0;
function render() {
	renderer.render(scene, camera);
	const timer = 0.0001 * Date.now();

	nhietdo.rotation.x += 0.01;
	nhietdo.rotation.y += 0.005;

	nhietDoMaterial.opacity = 0.3 * Math.sin(10 * timer);

	switch (indexFunction) {
		case 0:
			if (i == 0) {
				lcd.material.map = textureLCD00;
				setTimeout(() => {
					i = 1;
				}, 700);
			}
			if (i == 1) {
				lcd.material.map = textureLCD01;
				setTimeout(() => {
					i = 0;
				}, 700);
			}
			break;
		case 1:
			if (i == 0) {
				lcd.material.map = textureLCD00;
				setTimeout(() => {
					i = 1;
				}, 700);
			}
			if (i == 1) {
				lcd.material.map = textureLCD02;
				setTimeout(() => {
					i = 0;
				}, 700);
			}
			break;
		case 2:
			if (i == 0) {
				lcd.material.map = textureLCD00;
				setTimeout(() => {
					i = 1;
				}, 700);
			}
			if (i == 1) {
				lcd.material.map = textureLCD03;
				setTimeout(() => {
					i = 0;
				}, 700);
			}
			break;
		case 3:
			if (i == 0) {
				lcd.material.map = textureLCD00;
				setTimeout(() => {
					i = 1;
				}, 700);
			}
			if (i == 1) {
				lcd.material.map = textureLCD04;
				setTimeout(() => {
					i = 0;
				}, 700);
			}
			break;
		case 4:
			if (i == 0) {
				lcd.material.map = textureLCD00;
				setTimeout(() => {
					i = 1;
				}, 700);
			}
			if (i == 1) {
				lcd.material.map = textureLCD05;
				setTimeout(() => {
					i = 0;
				}, 700);
			}
			break;
		case 5:
			if (i == 0) {
				lcd.material.map = textureLCD00;
				setTimeout(() => {
					i = 1;
				}, 700);
			}
			if (i == 1) {
				lcd.material.map = textureLCD06;
				setTimeout(() => {
					i = 0;
				}, 700);
			}
			break;
		case 6:
			if (i == 0) {
				lcd.material.map = textureLCD00;
				setTimeout(() => {
					i = 1;
				}, 700);
			}
			if (i == 1) {
				lcd.material.map = textureLCD07;
				setTimeout(() => {
					i = 0;
				}, 700);
			}
			break;
		case 6:
			if (i == 0) {
				lcd.material.map = textureLCD00;
				setTimeout(() => {
					i = 1;
				}, 700);
			}
			if (i == 1) {
				lcd.material.map = textureLCD08;
				setTimeout(() => {
					i = 0;
				}, 700);
			}
			break;
		default:
			lcd.material.map = textureLCD;
	}
	if (canSetTime) {
		lcd.material.map = defaultTime;
	}
	if (isSetTime) {
		lcd.material.map = timeTextures[indexTime];
	}
	if (isStart) {
		isStart = false;
		setTimeout(() => {
			document.getElementById("fucntion").innerHTML = "Hết thời gian";
			document.getElementById("step").innerHTML = "Thức ăn đã chín";
			document.getElementById("content").innerHTML = "Kết thúc mô phỏng";
			scene.remove(nhietdo);
			scene.remove(groupHoiNuoc);
			if (actionDC != null) {
				actionDC.enabled = false;
			}
			scene.remove(lcd);
			isClose = false;
			actionMC = mixer.clipAction(animations[5]);
			actionMC.timeScale = 0.3;
			actionMC.setLoop(THREE.LoopOnce);
			actionMC.clampWhenFinished = true;
			actionMC.enable = true;
			actionMC.play().reset();
		}, 10000);
	}
}

function updateAnnotationOpacity() {
	const meshDistance = camera.position.distanceTo(model.position);
	const spriteDistance = camera.position.distanceTo(sprite.position);
	spriteBehindObject = spriteDistance > meshDistance;
	sprite.material.opacity = spriteBehindObject ? 0.5 : 1;
}

function updateScreenPosition() {
	const vector = new THREE.Vector3(0.7, 1.1, 0.5);
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
		actionDC.enabled = false;
	}
	scene.remove(lcd);
	isClose = false;
	actionMC = mixer.clipAction(animations[5]);
	actionMC.timeScale = 0.3;
	actionMC.setLoop(THREE.LoopOnce);
	actionMC.clampWhenFinished = true;
	actionMC.enable = true;
	actionMC.play().reset();
	$(".button-bottom").toggleClass("button-bottom-hide");
	setTimeout(() => {
		$(".button-bottom").toggleClass("button-bottom-hide");
	}, 5000);
};

window.DongCua = function DongCua() {
	if (actionMC != null) {
		actionMC.enabled = false;
	}
	timeouts.push(
		setTimeout(() => {
			controls.enabled = true;
			scene.add(lcd);
		}, 3000)
	);
	isClose = true;
	actionDC = mixer.clipAction(animations[2]);
	actionDC.timeScale = 0.3;
	actionDC.setLoop(THREE.LoopOnce);
	actionDC.clampWhenFinished = true;
	actionDC.enable = true;

	actionDC.play().reset();
};

window.CloseFucntion = function CloseFucntion() {
	if (!isClose) {
		DongCua();
	} else {
	}
	for (var i = 0; i < timeouts.length; i++) {
		clearTimeout(timeouts[i]);
	}
	document.getElementById("fucntion").innerHTML = "Panasonic";
	document.getElementById("step").innerHTML = "";
	document.getElementById("content").innerHTML = "NU-SC180B";
	scene.remove(nhietdo);
	gaModel.position.set(0, 0.5277480372311415, 1);
	scene.remove(gaModel);
	scene.remove(controlBanhObj);
	scene.remove(controlGaObj);
	scene.remove(controlKhay);
	groupBanh.position.set(0, 0.55, 1);
	scene.remove(groupBanh);
	groupBanh = new THREE.Group();
	groupBanh.position.set(0, 0.55, 1);
	scene.add(groupBanh);
	isClose = false;
	isNuongGa = false;
	stepNuongGa = 0;
	scene.remove(groupHoiNuoc);
	controlGaObj = new TransformControls(camera, renderer.domElement);
	controlGaObj.showZ = true;
	controlGaObj.showY = false;
	controlGaObj.showX = false;
	controlGaObj.addEventListener("dragging-changed", function (event) {
		controls.enabled = !event.value;
	});
	controlBanhObj = new TransformControls(camera, renderer.domElement);
	controlBanhObj.showZ = true;
	controlBanhObj.showY = false;
	controlBanhObj.showX = false;
	controlBanhObj.addEventListener("dragging-changed", function (event) {
		controls.enabled = !event.value;
	});

	controlKhay = new TransformControls(camera, renderer.domElement);
	controlKhay.showZ = true;
	controlKhay.showY = false;
	controlKhay.showX = false;
	controlKhay.addEventListener("dragging-changed", function (event) {
		controls.enabled = !event.value;
	});
	done = false;
	isHapBanh = false;
	stepBanhBao = 0;
	canSelect = false;
	canSetTime = false;
	isSelectFunction = false;
	isSetTime = false;
	done = false;
	isOpenKhay = false;

	scene.add(banhKhay2);
	indexFunction = -1;
	indexTime = -1;
};

window.NuongGa = function NuongGa(value) {
	isNuongGa = true;
	scene.remove(banhKhay2);
	switch (value) {
		case 1:
			stepNuongGa = 1;
			MoCua();
			timeouts.push(
				setTimeout(() => {
					scene.add(gaModel);
					controlGaObj.attach(gaModel);
					scene.add(controlGaObj);
				}, 3000)
			);
			document.getElementById("fucntion").innerHTML = "Nướng Gà";
			document.getElementById("step").innerHTML = "";
			document.getElementById("content").innerHTML =
				"Cho gà vào lò và đóng cửa";
			break;
		case 2:
			stepNuongGa = 2;
			document.getElementById("fucntion").innerHTML = "Nướng Gà";
			document.getElementById("step").innerHTML = "";
			document.getElementById("content").innerHTML =
				"Điều chỉnh bảng và chọn chức năng nướng";
			DongCua();
			//isClose = true;
			controlGaObj.enabled = false;
			scene.remove(controlGaObj);
			controls.enable = true;

			//	camera.position.set(2, 1, 0.7); // set camera sau khi bo ga vao
			//controls.target.set(0, 0, 0);
			break;
		case 3:
			stepNuongGa = 3;
			document.getElementById("fucntion").innerHTML = "Nướng Gà";
			document.getElementById("step").innerHTML = "";
			document.getElementById("content").innerHTML =
				"Bấm 'SELECT' đẻ chọn chế độ của lò";
			//DongCua();
			isClose = true;

			canSelect = true;
			break;
		default:
	}
};

window.BanhBao = function BanhBao(value) {
	isHapBanh = true;
	switch (value) {
		case 0:
			document.getElementById("fucntion").innerHTML = "Hấp Bánh Bao";
			document.getElementById("content").innerHTML =
				"Đổ nước vào khay phía dưới";
			break;
		case 1:
			stepBanhBao = 1;
			MoCua();
			document.getElementById("fucntion").innerHTML = "Hấp Bánh Bao";
			document.getElementById("content").innerHTML =
				"Cho bánh bao vào và đóng cửa lò";
			timeouts.push(
				setTimeout(() => {
					scene.add(banhModel1);
					scene.add(banhModel2);
					scene.add(banhModel3);
					groupBanh.add(banhModel1),
						groupBanh.add(banhModel2),
						groupBanh.add(banhModel3),
						groupBanh.add(banhModel4),
						groupBanh.add(banhModel5),
						groupBanh.add(banhModel6),
						controlBanhObj.attach(groupBanh);
					//controlObj.attach(banhModel2);
					scene.add(controlBanhObj);
				}, 3000)
			);
			break;
		case 2:
			stepBanhBao = 2;
			document.getElementById("fucntion").innerHTML = "Banh bao";
			document.getElementById("step").innerHTML = "";
			document.getElementById("content").innerHTML =
				"Điều chỉnh bảng và chọn chức năng nướng";
			DongCua();
			isClose = true;
			controlBanhObj.enabled = false;
			scene.remove(controlBanhObj);
			controls.enable = true;
			break;
		case 3:
			stepBanhBao = 3;
			document.getElementById("fucntion").innerHTML = "Hấp Bánh Bao";
			document.getElementById("step").innerHTML = "";
			document.getElementById("content").innerHTML =
				"Bấm 'SELECT' đẻ chọn chế độ của lò";
			//DongCua();
			//isClose = true;

			canSelect = true;
			break;
		default:
	}
};

var indexFunction = -1;
var indexTime = -1;
var isStart;
function onDocumentMouseDown(event) {
	event.preventDefault();
	var mouse3D = new THREE.Vector3(
		(event.clientX / window.innerWidth) * 2 - 1,
		-(event.clientY / window.innerHeight) * 2 + 1,
		0.5
	);
	var raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse3D, camera);
	var intersects = raycaster.intersectObjects(objectsSelect);
	if (intersects[0] != null) {
		if (canSelect) {
			if (!canSetTime) {
				if (intersects[0].object.name == "plusbutton") {
					isSelectFunction = true;
					document.getElementById("fucntion").innerHTML = "Chọn chế độ";
					document.getElementById("step").innerHTML = "";
					if (indexFunction == chucnang.length - 1) {
						indexFunction = -1;
					}
					indexFunction++;
					document.getElementById("content").innerHTML =
						chucnang[indexFunction];
				}
				if (intersects[0].object.name == "minusbutton") {
					isSelectFunction = true;
					document.getElementById("fucntion").innerHTML = "Chọn chế độ";
					document.getElementById("step").innerHTML = "";
					if (indexFunction == 0 || indexFunction == -1) {
						indexFunction = chucnang.length;
					}
					indexFunction = indexFunction - 1;
					document.getElementById("content").innerHTML =
						chucnang[indexFunction];
				}
			} else {
				if (intersects[0].object.name == "plusbutton") {
					isSelectFunction = true;

					if (indexTime == timeTextures.length - 1) {
						indexTime = -1;
					}
					indexTime++;

					document.getElementById("fucntion").innerHTML = "Chọn thời gian";
					document.getElementById("step").innerHTML = "";
					document.getElementById("content").innerHTML = "";
					isSetTime = true;
				} else if (intersects[0].object.name == "minusbutton") {
					isSelectFunction = true;

					if (indexTime == 0 || indexTime == -1) {
						indexTime = timeTextures.length;
					}
					indexTime = indexTime - 1;

					document.getElementById("fucntion").innerHTML = "Chọn thời gian";
					document.getElementById("step").innerHTML = "";
					document.getElementById("content").innerHTML = "";
					isSetTime = true;
				}
			}

			if (isSelectFunction) {
				if (!isSetTime) {
					if (intersects[0].object.name == "startbutton") {
						document.getElementById("fucntion").innerHTML = "Chọn thời gian";
						document.getElementById("step").innerHTML = "";
						document.getElementById("content").innerHTML =
							"Chọn thời gian thích hợp";
						canSetTime = true;
						lcd.material.map = timeTextures[0];
					}
				} else {
					if (intersects[0].object.name == "startbutton") {
						scene.add(nhietdo);

						if (isHapBanh) {
							scene.add(groupHoiNuoc);
						}
						document.getElementById("fucntion").innerHTML = "Lò bắt đầu chạy ";
						document.getElementById("step").innerHTML = "";
						document.getElementById("content").innerHTML =
							"Vui lòng đợi trong giây lát";
						canSetTime = false;
						isStart = true;
					}
				}
			}

			if (intersects[0].object.name == "restartbutton") {
				canSelect = true;
				canSetTime = false;
				indexFunction = -1;
				isSelectFunction = false;
				isSetTime = false;
				indexTime = -1;
				document.getElementById("fucntion").innerHTML = "Nướng Gà";
				document.getElementById("step").innerHTML = "Bước 2";
				document.getElementById("content").innerHTML = "Chọn chế độ phù hợp";
				lcd.material.map = textureLCD00;
				isStart = false;
			}
		}
	}
}
function onTransitionEnd(event) {
	event.target.remove();
}
function addParticles() {
	const textureLoaderSmoke = new THREE.TextureLoader();

	textureLoaderSmoke.load(
		"https://rawgit.com/marcobiedermann/playground/master/three.js/smoke-particles/dist/assets/images/clouds.png",
		(texture) => {
			const smokeMaterial = new THREE.MeshLambertMaterial({
				color: 0xffffff,
				map: texture,
				transparent: true,
			});
			smokeMaterial.map.minFilter = THREE.LinearFilter;
			const smokeGeometry = new THREE.PlaneBufferGeometry(0.15, 0.15);

			const smokeMeshes = [];
			let limit = 100;

			while (limit--) {
				smokeMeshes[limit] = new THREE.Mesh(smokeGeometry, smokeMaterial);
				smokeMeshes[limit].position.set(
					getRndInteger(-0.35, 0.35),
					getRndInteger(0.3, 0.9),
					getRndInteger(-0.3, 0.3)
				);
				smokeMeshes[limit].rotation.z = Math.random() * 360;
				smokeParticles.push(smokeMeshes[limit]);
				groupHoiNuoc.add(smokeMeshes[limit]);
				// scene.add(smokeMeshes[limit]);
			}
			//scene.add(groupHoiNuoc);
		}
	);
}
