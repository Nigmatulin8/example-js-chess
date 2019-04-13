import nBodyProblem from './components/nBodyProblem.js';
import Manifestation from './components/Manifestation.js';

const g = 39.5;
const dt = 0.008;
const softeningConstant = 0.15;

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

const scale = 70;
const radius = 4;
const trailLength = 35;

const massesList = document.querySelector("#masses-list");

const masses = [
  {
    name: "Солнце",
    m: 1,
    x: -1.50324727873647e-6,
    y: -3.93762725944737e-6,
    z: -4.86567877183925e-8,
    vx: 3.1669325898331e-5,
    vy: -6.85489559263319e-6,
    vz: -7.90076642683254e-7
  },
  {
    name: "Меркурий",
    m: 1.65956463e-7,
    x: -0.346390408691506,
    y: -0.272465544507684,
    z: 0.00951633403684172,
    vx: 4.25144321778261,
    vy: -7.61778341043381,
    vz: -1.01249478093275
  },
  {
    name: "Венера",
    m: 2.44699613e-6,
    x: -0.168003526072526,
    y: 0.698844725464528,
    z: 0.0192761582256879,
    vx: -7.2077847105093,
    vy: -1.76778886124455,
    vz: 0.391700036358566
  },
  {
    name: "Земля",
    m: 3.0024584e-6,
    x: 0.648778995445634,
    y: 0.747796691108466,
    z: -3.22953591923124e-5,
    vx: -4.85085525059392,
    vy: 4.09601538682312,
    vz: -0.000258553333317722
  },
  {
    m: 3.213e-7,
    name: "Марс",
    x: -0.574871406752105,
    y: -1.395455041953879,
    z: -0.01515164037265145,
    vx: 4.9225288800471425,
    vy: -1.5065904473191791,
    vz: -0.1524041758922603
  },
];

const innerSolarSystem = new nBodyProblem({
  g,
  dt,
  masses: JSON.parse(JSON.stringify(masses)),
  softeningConstant
});

const populateManifestations = masses => {
  masses.forEach(
    mass =>
    (mass["manifestation"] = new Manifestation(
      ctx,
      trailLength,
      radius
    ))
  );
};

populateManifestations(innerSolarSystem.masses);

document.querySelector("#reset-button").addEventListener('click', () => {
  innerSolarSystem.masses = JSON.parse(JSON.stringify(masses));
	populateManifestations(innerSolarSystem.masses);
});

let mousePressX = 0;
let mousePressY = 0;

let currentMouseX = 0;
let currentMouseY = 0;

let dragging = false;

canvas.addEventListener('mousedown', e => {
  mousePressX = e.clientX;
  mousePressY = e.clientY;
  dragging = true;
}, false);

canvas.addEventListener('mousemove', e => {
  currentMouseX = e.clientX;
  currentMouseY = e.clientY;
}, false);

canvas.addEventListener('mouseup', e => {
  const x = (mousePressX - width / 2) / scale;
  const y = (mousePressY - height / 2) / scale;
  const z = 0;
  const vx = (e.clientX - mousePressX) / 35;
  const vy = (e.clientY - mousePressY) / 35;
  const vz = 0;

  innerSolarSystem.masses.push({
    m: parseFloat(massesList.value),
    x,
    y,
    z,
    vx,
    vy,
    vz,
    manifestation: new Manifestation(ctx, trailLength, radius)
  });

  dragging = false;
}, false);

const animate = () => {
	innerSolarSystem.updatePositionVectors()
				.updateAccelerationVectors()
				.updateVelocityVectors();

	ctx.clearRect(0, 0, width, height);

	const massesLen = innerSolarSystem.masses.length;

	for(let i = 0; i < massesLen; i++) {
		const massI = innerSolarSystem.masses[i];

		const x = width / 2 + massI.x * scale;
    const y = height / 2 + massI.y * scale;

		massI.manifestation.draw(x, y);

		if(massI.name) {
			ctx.font = "14px Arial",
			ctx.fillText(massI.name, x + 12, y + 4);
			ctx.fill();
		}

		if(x < radius || x > width - radius) massI.vx = -massI.vx;
		if(y < radius || y > height - radius) massI.vy = -massI.vy;
	}

	if (dragging) {
    	ctx.beginPath();
    	ctx.moveTo(mousePressX, mousePressY);
    	ctx.lineTo(currentMouseX, currentMouseY);
    	ctx.strokeStyle = "red";
    	ctx.stroke();
  	}

	requestAnimationFrame(animate);
}

animate();