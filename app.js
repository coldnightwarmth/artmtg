import * as THREE from "three";
import { TrackballControls } from "./vendor/TrackballControls.js";

const ASSET_VERSION = Date.now().toString(36);

const TEMPLATE_FILES = [
  "blackcard.png",
  "bluecard.png",
  "goldcard.png",
  "greencard.png",
  "redcard.png",
  "whitecard.png"
];

const CROP_FILES = [
  "Alberto Zardo, The Divine Comedy, Lucifer.png",
  "American School, A Toy Peddler of Japan.png",
  "Anker, Children_s Team 1868.png",
  "Athanasius Kircher, Deck of Earth, Solar Clock 1636.png",
  "Bagetti, The Walnut Tree in Benevento 1826.png",
  "Barna Basilides, The Shepherds 1935.png",
  "Beechey, The Oddie Children 1789.png",
  "Bellows, Club Night 1907.png",
  "Blythe, Boy Playing Marbles.png",
  "Breviarium Grimani, The Wine Harvest 1515.png",
  "Bruegel, The Triumph of Death 1562.png",
  "Carbo, The Bullfight.png",
  "Clarke, Between Rounds.png",
  "Crawhall, The Bullfight at Algeciras.png",
  "Dali, The Knight of Death 1934.png",
  "David Humbert de Superville, The Ruinous Tower of Babel ~1800.png",
  "David Lynch, Rock with Seven Eyes 1996.png",
  "Discart, A Game of Draughts.png",
  "Eitaku, Spinning top and blowing bubbles 1888.png",
  "El Greco, View and Plan of Toledo 1608.png",
  "Ernst Klimt, Still life with armor 1885.png",
  "Fragonard, The Swing 1780.png",
  "Franz Ludwig Catel, Monks in a monastery courtyard 1856.png",
  "French School, Child jockeys racing fish 1913.png",
  "French School, Futuredays A Nineteenth Century Vision of the Year 2000.png",
  "German School, The origins of billiard 1745.png",
  "Gerome, The Retreating Lions 1902.png",
  "Goya, Boys Playing at Soldiers.png",
  "Gustave Dore, Satan Views the Whole of Eden.png",
  "Harold Forster, Fate  1930.png",
  "Helen Lundeberg, Dreaming 1942.png",
  "Henri Emilien Rousseau, The Falcon Chase 1923.png",
  "Hieronymous Bosch, Ascent of the Blessed 1504.png",
  "James Gurney.png",
  "Kiefer, Everyone Stands Under His Own Dome of Heaven 1970.png",
  "Konstantin Gorbatov, The Invisible City of Kitezh 1913.png",
  "Landscape, 1928 Picasso.png",
  "Leonardo da Vinci, Salvator Mundi 1510.png",
  "Leyster, A card player.png",
  "Luigi Russolo, The Sanctity of Light 1910.png",
  "Mikalojus Konstantinas Čiurlionis, Sagittarius  1907.png",
  "N.C. Wyeth, The Duel 1922.png",
  "Pernhart, View of the Grossglockner.png",
  "Pinelli, Bullfight.png",
  "Rembrandt, Palla Athena 1657.png",
  "Roerich, Mother of the World.png",
  "Tatiana Bystrova, Nocturnal Bloom 1970.png",
  "Thomas Baines, The Eastern Cataracts of the Victoria Falls_.png",
  "Tyrus Wong, Concept for Disney_s Bambi 1942.png",
  "Unknown, Angel.png",
  "Unknown, Green Knight 14th century.png",
  "Unknown, Jester.png",
  "Unknown, Mythic Sky.png",
  "Unknown, The Devil_s Cave.png",
  "Wilhelm Kotarbinski, The Angel of Sadness 1900_.png"
];

const FULL_FILES = [
  "Alberto Zardo, The Divine Comedy, Lucifer.jpg",
  "American School, A Toy Peddler of Japan.jpg",
  "Anker, Children_s Team 1868.jpg",
  "Athanasius Kircher, Deck of Earth, Solar Clock 1636.jpg",
  "Bagetti, The Walnut Tree in Benevento 1826.jpg",
  "Barna Basilides, The Shepherds 1935.jpg",
  "Beechey, The Oddie Children 1789.jpg",
  "Bellows, Club Night 1907.jpg",
  "Blythe, Boy Playing Marbles.jpg",
  "Breviarium Grimani, The Wine Harvest 1515.jpg",
  "Bruegel, The Triumph of Death 1562.webp",
  "Carbo, The Bullfight.jpg",
  "Clarke, Between Rounds.jpg",
  "Crawhall, The Bullfight at Algeciras.jpg",
  "Dali, The Knight of Death 1934.jpg",
  "David Humbert de Superville, The Ruinous Tower of Babel ~1800.jpg",
  "David Lynch, Rock with Seven Eyes 1996.jpg",
  "Discart, A Game of Draughts.jpg",
  "Eitaku, Spinning top and blowing bubbles 1888.jpg",
  "El Greco, View and Plan of Toledo 1608.jpg",
  "Ernst Klimt, Still life with armor 1885.jpg",
  "Fragonard, The Swing 1780.jpg",
  "Franz Ludwig Catel, Monks in a monastery courtyard 1856.jpg",
  "French School, Child Jockeys Racing Fish 1913.jpg",
  "French School, Futuredays A Nineteenth Century Vision of the Year 2000.jpg",
  "German School, The origins of billiard 1745.jpg",
  "Gerome, The Retreating Lions 1902.jpg",
  "Goya, Boys Playing at Soldiers.jpg",
  "Gustave Dore, Satan Views the Whole of Eden.jpg",
  "Harold Forster, Fate  1930.jpg",
  "Helen Lundeberg, Dreaming 1942.jpg",
  "Henri Emilien Rousseau, The Falcon Chase 1923.jpg",
  "Hieronymous Bosch, Ascent of the Blessed 1504.jpg",
  "James Gurney, Mountain Temple.jpg",
  "Kiefer, Everyone Stands Under His Own Dome of Heaven 1970.jpg",
  "Konstantin Gorbatov, The Invisible City of Kitezh 1913.jpg",
  "Landscape, 1928 Picasso.jpg",
  "Leonardo da Vinci, Salvator Mundi 1510.jpg",
  "Leyster, A Card Player.jpg",
  "Luigi Russolo, The Sanctity of Light 1910.jpg",
  "Mikalojus Konstantinas Čiurlionis, Sagittarius  1907.jpg",
  "N.C. Wyeth, The Duel 1922.jpg",
  "Pernhart, View of the Grossglockner.jpg",
  "Pinelli, Bullfight.jpg",
  "Rembrandt, Palla Athena 1657.jpg",
  "Roerich, Mother of the World.jpg",
  "Tatiana Bystrova, Nocturnal Bloom 1970.jpg",
  "Thomas Baines, The Eastern Cataracts of the Victoria Falls .jpg",
  "Tyrus Wong, Concept for Disney_s Bambi 1942.jpg",
  "Unknown, Angel.jpg",
  "Unknown, Green Knight 14th century.jpg",
  "Unknown, The Devil_s Cave.png",
  "Unkown, Jester.png",
  "Unkown, Mythic Sky.jpg",
  "Wilhelm Kotarbinski, The Angel of Sadness 1900..jpg"
];

const ART_WINDOW = { x: 36, y: 68, width: 328, height: 242 };
const FACE_WIDTH = 800;
const FACE_HEIGHT = 1120;
const CARD_WIDTH = 2.5;
const CARD_HEIGHT = 3.5;
const CARD_DEPTH = 0.055;
const CARD_RADIUS = 0.095;
const BACK_TRIM = { x: 0.026, y: 0.018 };
const FULL_ART_LAYOUTS = new Map([
  [
    "hieronymousboschascentoftheblessed1504",
    {
      yOffset: "0",
      width: "auto",
      height: "var(--card-height)",
      maxWidth: "none",
      maxHeight: "var(--card-height)"
    }
  ]
]);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);
const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0.48, 0.24, 6.75);
const DEFAULT_CAMERA_DIRECTION = DEFAULT_CAMERA_POSITION.clone()
  .sub(DEFAULT_TARGET)
  .normalize();
const DEFAULT_CAMERA_UP = new THREE.Vector3(0, 1, 0);
const SNAP_DURATION = 720;

const table = document.querySelector("#table");
const scenePanel = document.querySelector("#scenePanel");
const canvas = document.querySelector("#cardCanvas");
const previousButton = document.querySelector("#previousButton");
const nextButton = document.querySelector("#nextButton");
const shuffleButton = document.querySelector("#shuffleButton");
const detailsButton = document.querySelector("#detailsButton");
const uploadButton = document.querySelector("#uploadButton");
const fullArtLink = document.querySelector("#fullArtLink");
const fullArtImage = document.querySelector("#fullArtImage");
const artMagnifier = document.querySelector("#artMagnifier");
const uploadModal = document.querySelector("#uploadModal");
const closeUploadButton = document.querySelector("#closeUploadButton");
const dropZone = document.querySelector("#dropZone");
const dropZoneText = document.querySelector("#dropZoneText");
const uploadInput = document.querySelector("#uploadInput");
const cropCanvas = document.querySelector("#cropCanvas");
const cropZoomInput = document.querySelector("#cropZoom");
const cropXInput = document.querySelector("#cropX");
const cropYInput = document.querySelector("#cropY");
const customTitleInput = document.querySelector("#customTitle");
const customAuthorInput = document.querySelector("#customAuthor");
const customDateInput = document.querySelector("#customDate");
const createCardButton = document.querySelector("#createCardButton");

let artItems = buildArtItems();
let authorOrder = buildAuthorOrder(artItems);
const imageCache = new Map();

let renderer;
let scene;
let camera;
let controls;
let cardGroup;
let frontMaterial;
let backMaterial;
let frontGloss;
let backGloss;
let currentArtIndex = -1;
let currentTemplateFile = "";
let loadToken = 0;
let cameraSnap = null;
let paperNoiseCanvas = null;
let uploadState = createUploadState();
let cropDrag = null;

init();

async function init() {
  initScene();
  initControls();
  await applyRandomCard();
  animate();
}

function initScene() {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.copy(DEFAULT_CAMERA_POSITION);
  camera.up.copy(DEFAULT_CAMERA_UP);
  camera.lookAt(DEFAULT_TARGET);

  const ambient = new THREE.HemisphereLight(0xffffff, 0x2b2114, 1.6);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xfff2cf, 3.4);
  key.position.set(2.8, 3.5, 4.2);
  scene.add(key);

  const coolRim = new THREE.DirectionalLight(0x9dc2ca, 1.7);
  coolRim.position.set(-3.2, 1.6, -2.6);
  scene.add(coolRim);

  cardGroup = new THREE.Group();
  scene.add(cardGroup);

  const sideMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0b0906,
    roughness: 0.34,
    metalness: 0.08,
    clearcoat: 0.5,
    clearcoatRoughness: 0.24
  });
  const core = new THREE.Mesh(
    createRoundedCoreGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH, CARD_RADIUS),
    sideMaterial
  );
  cardGroup.add(core);

  const paperRoughnessMap = createPaperRoughnessTexture();
  frontMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    alphaTest: 0.02,
    roughness: 0.36,
    roughnessMap: paperRoughnessMap,
    metalness: 0.02,
    clearcoat: 0.76,
    clearcoatRoughness: 0.18,
    reflectivity: 0.68,
    side: THREE.FrontSide
  });

  backMaterial = frontMaterial.clone();

  const faceGeometry = createRoundedPlaneGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  const frontFace = new THREE.Mesh(faceGeometry, frontMaterial);
  frontFace.position.z = CARD_DEPTH / 2 + 0.002;
  cardGroup.add(frontFace);

  const backFace = new THREE.Mesh(faceGeometry.clone(), backMaterial);
  backFace.rotation.y = Math.PI;
  backFace.position.z = -CARD_DEPTH / 2 - 0.002;
  cardGroup.add(backFace);

  frontGloss = createGlossPlane(1);
  frontGloss.position.z = CARD_DEPTH / 2 + 0.004;
  cardGroup.add(frontGloss);

  backGloss = createGlossPlane(-1);
  backGloss.rotation.y = Math.PI;
  backGloss.position.z = -CARD_DEPTH / 2 - 0.004;
  cardGroup.add(backGloss);

  new ResizeObserver(resizeRenderer).observe(scenePanel);
  resizeRenderer();
}

function initControls() {
  controls = new TrackballControls(camera, renderer.domElement);
  controls.noPan = true;
  controls.rotateSpeed = 3.2;
  controls.zoomSpeed = 0.65;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.1;
  controls.minDistance = 4.8;
  controls.maxDistance = 8.6;
  controls.target.copy(DEFAULT_TARGET);
  controls.target0.copy(DEFAULT_TARGET);
  controls.position0.copy(DEFAULT_CAMERA_POSITION);
  controls.up0.copy(DEFAULT_CAMERA_UP);
  controls.addEventListener("start", cancelCameraSnap);
  controls.addEventListener("end", startCameraSnap);
  renderer.domElement.addEventListener("pointerdown", cancelCameraSnap);
  renderer.domElement.addEventListener("pointerup", startCameraSnap);
  renderer.domElement.addEventListener("pointercancel", startCameraSnap);
  window.addEventListener("pointerup", startCameraSnap);

  previousButton.addEventListener("click", () => {
    applyRelativeCard(-1);
  });

  nextButton.addEventListener("click", () => {
    applyRelativeCard(1);
  });

  shuffleButton.addEventListener("click", () => {
    applyRandomCard();
  });
  shuffleButton.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    applyTemplateShuffle();
  });

  detailsButton.addEventListener("click", () => {
    const isOpen = table.classList.toggle("details-open");
    detailsButton.setAttribute("aria-expanded", String(isOpen));
    if (!isOpen) hideArtMagnifier();
  });

  fullArtImage.addEventListener("mouseenter", showArtMagnifier);
  fullArtImage.addEventListener("mousemove", updateArtMagnifier);
  fullArtImage.addEventListener("mouseleave", hideArtMagnifier);

  initUploadControls();
}

function initUploadControls() {
  uploadButton.addEventListener("click", openUploadModal);
  closeUploadButton.addEventListener("click", closeUploadModal);
  uploadModal.addEventListener("click", (event) => {
    if (event.target === uploadModal) closeUploadModal();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && uploadModal.classList.contains("is-open")) {
      closeUploadModal();
    }
  });

  dropZone.addEventListener("click", () => uploadInput.click());
  uploadInput.addEventListener("change", () => {
    const [file] = uploadInput.files;
    if (file) loadUploadFile(file);
  });

  for (const eventName of ["dragenter", "dragover"]) {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add("is-dragging");
    });
  }

  for (const eventName of ["dragleave", "drop"]) {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove("is-dragging");
    });
  }

  dropZone.addEventListener("drop", (event) => {
    const [file] = event.dataTransfer.files;
    if (file) loadUploadFile(file);
  });

  for (const input of [cropZoomInput, cropXInput, cropYInput]) {
    input.addEventListener("input", () => {
      syncCropInputs();
      renderCropPreview();
    });
  }

  cropCanvas.addEventListener("pointerdown", startCropDrag);
  cropCanvas.addEventListener("pointermove", updateCropDrag);
  cropCanvas.addEventListener("pointerup", endCropDrag);
  cropCanvas.addEventListener("pointercancel", endCropDrag);
  createCardButton.addEventListener("click", createCustomCard);
  renderCropPreview();
}

function openUploadModal() {
  uploadModal.classList.add("is-open");
  uploadModal.setAttribute("aria-hidden", "false");
  hideArtMagnifier();
}

function closeUploadModal() {
  uploadModal.classList.remove("is-open");
  uploadModal.setAttribute("aria-hidden", "true");
  dropZone.classList.remove("is-dragging");
}

function createUploadState() {
  return {
    file: null,
    image: null,
    imageUrl: "",
    cropX: 50,
    cropY: 50,
    zoom: 1
  };
}

async function loadUploadFile(file) {
  if (!file.type.startsWith("image/")) return;

  const imageUrl = URL.createObjectURL(file);
  const image = await loadImage(imageUrl);
  uploadState = {
    file,
    image,
    imageUrl,
    cropX: 50,
    cropY: 50,
    zoom: 1
  };

  cropZoomInput.value = "1";
  cropXInput.value = "50";
  cropYInput.value = "50";
  if (!customTitleInput.value.trim()) {
    customTitleInput.value = cleanBase(file.name);
  }
  dropZoneText.textContent = file.name;
  createCardButton.disabled = false;
  renderCropPreview();
}

function syncCropInputs() {
  uploadState.zoom = Number(cropZoomInput.value);
  uploadState.cropX = Number(cropXInput.value);
  uploadState.cropY = Number(cropYInput.value);
}

function startCropDrag(event) {
  if (!uploadState.image) return;

  cropCanvas.setPointerCapture(event.pointerId);
  cropDrag = {
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startCropX: uploadState.cropX,
    startCropY: uploadState.cropY
  };
}

function updateCropDrag(event) {
  if (!cropDrag || cropDrag.pointerId !== event.pointerId || !uploadState.image) return;

  const rect = cropCanvas.getBoundingClientRect();
  const crop = getUploadCropRect();
  const maxSourceX = Math.max(uploadState.image.naturalWidth - crop.width, 1);
  const maxSourceY = Math.max(uploadState.image.naturalHeight - crop.height, 1);
  const deltaX = event.clientX - cropDrag.startClientX;
  const deltaY = event.clientY - cropDrag.startClientY;

  uploadState.cropX = clamp(
    cropDrag.startCropX - (deltaX / rect.width) * (crop.width / maxSourceX) * 100,
    0,
    100
  );
  uploadState.cropY = clamp(
    cropDrag.startCropY - (deltaY / rect.height) * (crop.height / maxSourceY) * 100,
    0,
    100
  );
  cropXInput.value = uploadState.cropX.toFixed(1);
  cropYInput.value = uploadState.cropY.toFixed(1);
  renderCropPreview();
}

function endCropDrag(event) {
  if (!cropDrag || cropDrag.pointerId !== event.pointerId) return;
  cropDrag = null;
}

function getUploadCropRect() {
  const image = uploadState.image;
  if (!image) return { x: 0, y: 0, width: 1, height: 1 };

  const targetRatio = ART_WINDOW.width / ART_WINDOW.height;
  let width = image.naturalWidth;
  let height = width / targetRatio;

  if (height > image.naturalHeight) {
    height = image.naturalHeight;
    width = height * targetRatio;
  }

  width /= uploadState.zoom;
  height /= uploadState.zoom;

  const maxX = Math.max(image.naturalWidth - width, 0);
  const maxY = Math.max(image.naturalHeight - height, 0);
  return {
    x: maxX * (uploadState.cropX / 100),
    y: maxY * (uploadState.cropY / 100),
    width,
    height
  };
}

function renderCropPreview() {
  const ctx = cropCanvas.getContext("2d");
  ctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);

  if (!uploadState.image) {
    ctx.fillStyle = "rgba(242, 241, 234, 0.08)";
    ctx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
    ctx.fillStyle = "rgba(242, 241, 234, 0.55)";
    ctx.font = "22px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Crop preview", cropCanvas.width / 2, cropCanvas.height / 2);
    return;
  }

  const crop = getUploadCropRect();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    uploadState.image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height
  );
}

async function createCustomCard() {
  if (!uploadState.image || createCardButton.classList.contains("is-loading")) return;

  createCardButton.disabled = true;
  createCardButton.classList.add("is-loading");

  try {
    await new Promise((resolve) => setTimeout(resolve, 420));

    const title = customTitleInput.value.trim() || cleanBase(uploadState.file.name) || "Untitled";
    const artist = customAuthorInput.value.trim() || "Unknown";
    const year = customDateInput.value.trim();
    const newItem = {
      cropFile: uploadState.file.name,
      fullFile: uploadState.file.name,
      cropUrl: uploadState.imageUrl,
      fullUrl: uploadState.imageUrl,
      title,
      customCrop: getUploadCropRect(),
      meta: {
        artist,
        title,
        year,
        kind: "Legendary Artwork",
        body: year ? `${artist}\nDated ${year}` : artist
      }
    };

    artItems = [...artItems, newItem];
    authorOrder = buildAuthorOrder(artItems);
    await applyCardByIndex(artItems.length - 1);
    closeUploadModal();
    resetUploadForm();
  } finally {
    createCardButton.classList.remove("is-loading");
    createCardButton.disabled = !uploadState.image;
  }
}

function resetUploadForm() {
  uploadState = createUploadState();
  uploadInput.value = "";
  dropZoneText.textContent = "Drop or choose an image";
  customTitleInput.value = "";
  customAuthorInput.value = "";
  customDateInput.value = "";
  cropZoomInput.value = "1";
  cropXInput.value = "50";
  cropYInput.value = "50";
  createCardButton.disabled = true;
  renderCropPreview();
}

function createGlossPlane(normalDirection) {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    uniforms: {
      uCameraPosition: { value: new THREE.Vector3() },
      uTime: { value: 0 },
      uNormalDirection: { value: normalDirection }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {
        vUv = uv;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uCameraPosition;
      uniform float uTime;
      uniform float uNormalDirection;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {
        vec3 normal = normalize(vWorldNormal) * uNormalDirection;
        vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
        float facing = abs(dot(normal, viewDir));
        float fresnel = pow(1.0 - clamp(facing, 0.0, 1.0), 1.42);
        vec2 centered = vUv - 0.5;
        float tiltBand = centered.x * viewDir.x * 1.7 + centered.y * viewDir.y * 1.4 + viewDir.z * 0.2;
        float sweep = smoothstep(0.16, 0.0, abs(tiltBand + sin(uTime * 0.45) * 0.025));
        float verticalEdge = smoothstep(0.38, 0.52, abs(centered.x));
        float sheen = clamp(fresnel * 0.64 + sweep * 0.46 + verticalEdge * 0.08, 0.0, 1.0);
        vec3 cool = vec3(0.74, 0.91, 1.0);
        vec3 warm = vec3(1.0, 0.78, 0.33);
        vec3 pearl = vec3(1.0, 1.0, 0.94);
        vec3 color = mix(cool, warm, smoothstep(-0.45, 0.55, centered.x + viewDir.x * 0.55));
        color = mix(color, pearl, sweep * 0.54);
        gl_FragColor = vec4(color, sheen * 0.14);
      }
    `
  });

  return new THREE.Mesh(
    createRoundedPlaneGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS),
    material
  );
}

async function applyRandomCard() {
  const artIndex = randomIndex(artItems.length, currentArtIndex);
  await applyCardByIndex(artIndex);
}

async function applyTemplateShuffle() {
  if (currentArtIndex === -1) {
    await applyRandomCard();
    return;
  }

  await applyCardByIndex(
    currentArtIndex,
    randomEntryExcept(TEMPLATE_FILES, currentTemplateFile)
  );
}

async function applyRelativeCard(direction) {
  const currentOrderPosition = authorOrder.indexOf(currentArtIndex);
  const basePosition = currentOrderPosition === -1 ? 0 : currentOrderPosition;
  const nextPosition = modulo(basePosition + direction, authorOrder.length);
  await applyCardByIndex(authorOrder[nextPosition]);
}

async function applyCardByIndex(artIndex, templateFile = randomEntry(TEMPLATE_FILES)) {
  const token = ++loadToken;
  const item = artItems[artIndex];

  const [frontTexture, backTexture] = await Promise.all([
    createFrontTexture(item, templateFile),
    createBackTexture()
  ]);

  if (token !== loadToken) {
    frontTexture.dispose();
    backTexture.dispose();
    return;
  }

  currentArtIndex = artIndex;
  currentTemplateFile = templateFile;
  swapTexture(frontMaterial, frontTexture);
  swapTexture(backMaterial, backTexture);
  frontMaterial.needsUpdate = true;
  backMaterial.needsUpdate = true;

  fullArtLink.href = item.fullUrl;
  fullArtImage.src = item.fullUrl;
  fullArtImage.alt = item.title;
  applyFullArtLayout(item.fullFile);
  hideArtMagnifier();
}

function applyFullArtLayout(fullFile) {
  const layout = FULL_ART_LAYOUTS.get(identityKey(fullFile));
  fullArtImage.style.setProperty("--full-art-y-offset", layout?.yOffset || "0");
  fullArtImage.style.setProperty("--full-art-width", layout?.width || "auto");
  fullArtImage.style.setProperty("--full-art-height", layout?.height || "auto");
  fullArtImage.style.setProperty("--full-art-max-width", layout?.maxWidth || "100%");
  fullArtImage.style.setProperty("--full-art-max-height", layout?.maxHeight || "100%");
}

function showArtMagnifier(event) {
  updateArtMagnifier(event);
  artMagnifier.classList.add("is-visible");
}

function hideArtMagnifier() {
  artMagnifier.classList.remove("is-visible");
}

function updateArtMagnifier(event) {
  if (!fullArtImage.naturalWidth || !fullArtImage.naturalHeight) return;

  const rect = fullArtImage.getBoundingClientRect();
  const zoom = 3.15;
  const xRatio = (event.clientX - rect.left) / rect.width;
  const yRatio = (event.clientY - rect.top) / rect.height;
  const magnifierSize = artMagnifier.offsetWidth;
  const backgroundWidth = rect.width * zoom;
  const backgroundHeight = rect.height * zoom;
  const backgroundX = magnifierSize / 2 - xRatio * backgroundWidth;
  const backgroundY = magnifierSize / 2 - yRatio * backgroundHeight;

  artMagnifier.style.left = `${event.clientX}px`;
  artMagnifier.style.top = `${event.clientY}px`;
  artMagnifier.style.backgroundImage = `url("${fullArtImage.currentSrc || fullArtImage.src}")`;
  artMagnifier.style.backgroundSize = `${backgroundWidth}px ${backgroundHeight}px`;
  artMagnifier.style.backgroundPosition = `${backgroundX}px ${backgroundY}px`;
}

async function createFrontTexture(item, templateFile) {
  const [art, template] = await Promise.all([
    loadImage(item.cropUrl),
    loadImage(urlFor("assets/card templates", templateFile))
  ]);

  const surface = document.createElement("canvas");
  surface.width = FACE_WIDTH;
  surface.height = FACE_HEIGHT;

  const ctx = surface.getContext("2d");
  const scale = FACE_WIDTH / 400;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, FACE_WIDTH, FACE_HEIGHT);

  if (item.customCrop) {
    drawCrop(
      ctx,
      art,
      item.customCrop,
      ART_WINDOW.x * scale,
      ART_WINDOW.y * scale,
      ART_WINDOW.width * scale,
      ART_WINDOW.height * scale
    );
  } else {
    drawCover(
      ctx,
      art,
      ART_WINDOW.x * scale,
      ART_WINDOW.y * scale,
      ART_WINDOW.width * scale,
      ART_WINDOW.height * scale
    );
  }
  ctx.drawImage(template, 0, 0, FACE_WIDTH, FACE_HEIGHT);
  drawCardText(ctx, item.meta, scale);
  addPaperSurface(ctx, FACE_WIDTH, FACE_HEIGHT);

  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

async function createBackTexture() {
  const back = await loadImage(urlFor("assets/card templates", "back.jpg"));
  const surface = document.createElement("canvas");
  surface.width = FACE_WIDTH;
  surface.height = FACE_HEIGHT;
  const ctx = surface.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  drawCover(ctx, back, 0, 0, FACE_WIDTH, FACE_HEIGHT, {
    trimX: BACK_TRIM.x,
    trimY: BACK_TRIM.y
  });
  addPaperSurface(ctx, FACE_WIDTH, FACE_HEIGHT);

  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;
  return texture;
}

function drawCardText(ctx, meta, scale) {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(23, 19, 14, 0.94)";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(255, 255, 255, 0.45)";
  ctx.shadowBlur = 0.45;
  ctx.shadowOffsetY = 0.3;

  fitText(ctx, meta.title, {
    x: 43,
    y: 46,
    width: 314,
    max: 17.4,
    min: 10.4,
    weight: "700",
    family: "Georgia, 'Times New Roman', serif"
  });

  fitText(ctx, meta.kind, {
    x: 43,
    y: 331,
    width: 314,
    max: 13.2,
    min: 9.4,
    weight: "700",
    family: "Georgia, 'Times New Roman', serif"
  });

  ctx.shadowBlur = 0.2;
  ctx.textBaseline = "top";
  ctx.font = "13px Georgia, 'Times New Roman', serif";
  drawWrappedText(ctx, meta.body, 43, 359, 314, 16.2, 120);
  ctx.restore();
}

function fitText(ctx, text, options) {
  const { x, y, width, max, min, weight, family } = options;
  let size = max;
  while (size > min) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= width) break;
    size -= 0.4;
  }
  ctx.fillText(text, x, y);
}

function drawWrappedText(ctx, text, x, y, width, lineHeight, maxHeight) {
  const paragraphs = text.split("\n");
  let cursorY = y;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= width || !line) {
        line = candidate;
      } else {
        ctx.fillText(line, x, cursorY);
        cursorY += lineHeight;
        line = word;
      }
      if (cursorY - y > maxHeight) return;
    }

    if (line) {
      ctx.fillText(line, x, cursorY);
      cursorY += lineHeight;
    }
    cursorY += lineHeight * 0.32;
    if (cursorY - y > maxHeight) return;
  }
}

function drawCrop(ctx, image, crop, x, y, width, height) {
  const sx = clamp(crop.x, 0, image.naturalWidth - 1);
  const sy = clamp(crop.y, 0, image.naturalHeight - 1);
  const sw = clamp(crop.width, 1, image.naturalWidth - sx);
  const sh = clamp(crop.height, 1, image.naturalHeight - sy);
  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
}

function drawCover(ctx, image, x, y, width, height, options = {}) {
  const trimX = (options.trimX || 0) * image.naturalWidth;
  const trimY = (options.trimY || 0) * image.naturalHeight;
  let sx = trimX;
  let sy = trimY;
  let sw = image.naturalWidth - trimX * 2;
  let sh = image.naturalHeight - trimY * 2;
  const imageRatio = sw / sh;
  const targetRatio = width / height;

  if (imageRatio > targetRatio) {
    const sourceWidth = sh * targetRatio;
    sx += (sw - sourceWidth) / 2;
    sw = sourceWidth;
  } else {
    const sourceHeight = sw / targetRatio;
    sy += (sh - sourceHeight) / 2;
    sh = sourceHeight;
  }

  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
}

function addPaperSurface(ctx, width, height) {
  if (!paperNoiseCanvas) {
    paperNoiseCanvas = createPaperNoiseCanvas(width, height);
  }

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.globalCompositeOperation = "soft-light";
  ctx.drawImage(paperNoiseCanvas, 0, 0, width, height);
  ctx.restore();
}

function createPaperNoiseCanvas(width, height) {
  const surface = document.createElement("canvas");
  surface.width = width;
  surface.height = height;
  const ctx = surface.getContext("2d");
  const imageData = ctx.createImageData(width, height);
  let seed = 0x4d595df4;

  for (let y = 0; y < height; y++) {
    const rowFiber = (randomFromSeed() - 0.5) * 10;

    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const speckle = randomFromSeed() < 0.024
        ? (randomFromSeed() - 0.5) * 48
        : 0;
      const value = clampByte(128 + (randomFromSeed() - 0.5) * 34 + rowFiber + speckle);
      imageData.data[index] = value;
      imageData.data[index + 1] = value;
      imageData.data[index + 2] = value;
      imageData.data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return surface;

  function randomFromSeed() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
}

function createPaperRoughnessTexture() {
  const size = 256;
  const surface = document.createElement("canvas");
  surface.width = size;
  surface.height = Math.round(size * 1.4);
  const ctx = surface.getContext("2d");
  const imageData = ctx.createImageData(surface.width, surface.height);
  let seed = 0x2c6fe96d;

  for (let i = 0; i < imageData.data.length; i += 4) {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    const value = 178 + ((seed >>> 24) % 58);
    imageData.data[i] = value;
    imageData.data[i + 1] = value;
    imageData.data[i + 2] = value;
    imageData.data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createRoundedCardShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function createRoundedPlaneGeometry(width, height, radius) {
  const geometry = new THREE.ShapeGeometry(
    createRoundedCardShape(width, height, radius),
    18
  );
  const position = geometry.getAttribute("position");
  const uvs = [];

  for (let i = 0; i < position.count; i++) {
    uvs.push(
      (position.getX(i) + width / 2) / width,
      (position.getY(i) + height / 2) / height
    );
  }

  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

function createRoundedCoreGeometry(width, height, depth, radius) {
  const geometry = new THREE.ExtrudeGeometry(
    createRoundedCardShape(width, height, radius),
    {
      depth,
      bevelEnabled: false,
      curveSegments: 18
    }
  );
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function buildArtItems() {
  return CROP_FILES.map((cropFile) => {
    const fullFile = findFullFile(cropFile);
    const cropMeta = parseName(cropFile);
    const fullMeta = parseName(fullFile);
    const meta = chooseMetadata(cropMeta, fullMeta);
    return {
      cropFile,
      fullFile,
      cropUrl: urlFor("assets/art/crop", cropFile),
      fullUrl: urlFor("assets/art/full", fullFile),
      title: meta.title,
      meta
    };
  });
}

function buildAuthorOrder(items) {
  return items
    .map((_, index) => index)
    .sort((left, right) => {
      const leftMeta = items[left].meta;
      const rightMeta = items[right].meta;
      return compareText(leftMeta.artist, rightMeta.artist)
        || compareText(leftMeta.title, rightMeta.title)
        || compareText(items[left].cropFile, items[right].cropFile);
    });
}

function findFullFile(cropFile) {
  const cropKey = identityKey(cropFile);
  const exact = FULL_FILES.find((file) => identityKey(file) === cropKey);
  if (exact) return exact;

  const contained = FULL_FILES.find((file) => {
    const fullKey = identityKey(file);
    return fullKey.startsWith(cropKey) || cropKey.startsWith(fullKey);
  });
  if (contained) return contained;

  let best = FULL_FILES[0];
  let bestScore = -1;
  const cropTokens = tokenSet(cropFile);
  for (const file of FULL_FILES) {
    const fullTokens = tokenSet(file);
    const score = [...cropTokens].filter((token) => fullTokens.has(token)).length;
    if (score > bestScore) {
      best = file;
      bestScore = score;
    }
  }
  return best;
}

function parseName(fileName) {
  const clean = cleanBase(fileName);
  const parts = clean.split(",").map((part) => part.trim()).filter(Boolean);
  let artist = parts[0] || "Unknown";
  let title = parts.length > 1 ? parts.slice(1).join(", ") : artist;
  let year = "";

  const leadingDateMatch = title.match(/^(~?\d{3,4})\s+(.+)$/);
  const dateMatch = title.match(/\s(~?\d{3,4})(?:[.\s_]*)$/);
  if (leadingDateMatch) {
    year = leadingDateMatch[1];
    title = leadingDateMatch[2].trim();
  } else if (dateMatch) {
    year = dateMatch[1];
    title = title.slice(0, dateMatch.index).trim();
  }

  if (identityKey(fileName) === "landscape1928picasso") {
    artist = "Picasso";
    title = "Landscape";
    year = year || "1928";
  }

  title = title || artist;
  const body = year ? `${artist}\nDated ${year}` : artist;

  return {
    artist,
    title,
    year,
    kind: "Legendary Artwork",
    body
  };
}

function chooseMetadata(cropMeta, fullMeta) {
  if (cropMeta.title === cropMeta.artist && fullMeta.title !== fullMeta.artist) {
    return fullMeta;
  }
  if (!cropMeta.year && fullMeta.year && cropMeta.title === fullMeta.title) {
    return fullMeta;
  }
  return cropMeta;
}

function cleanBase(fileName) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/_s\b/g, "'s")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+[.]+$/g, "")
    .trim();
}

function identityKey(fileName) {
  return cleanBase(fileName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/unkown/gi, "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function tokenSet(fileName) {
  return new Set(
    cleanBase(fileName)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/unkown/gi, "unknown")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 1)
  );
}

function urlFor(directory, fileName) {
  return `${directory}/${encodeURIComponent(fileName)}?v=${ASSET_VERSION}`;
}

function loadImage(src) {
  if (imageCache.has(src)) return imageCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${src}`));
    image.src = src;
  });
  imageCache.set(src, promise);
  return promise;
}

function swapTexture(material, texture) {
  const previous = material.map;
  material.map = texture;
  if (previous) previous.dispose();
}

function randomEntry(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomEntryExcept(items, avoid) {
  if (items.length <= 1) return items[0];
  let next = avoid;

  while (next === avoid) {
    next = randomEntry(items);
  }

  return next;
}

function randomIndex(max, avoid) {
  if (max <= 1) return 0;
  let next = avoid;
  while (next === avoid) {
    next = Math.floor(Math.random() * max);
  }
  return next;
}

function modulo(value, length) {
  return ((value % length) + length) % length;
}

function compareText(left, right) {
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base"
  });
}

function resizeRenderer() {
  const { width, height } = scenePanel.getBoundingClientRect();
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  if (controls) controls.handleResize();
}

function startCameraSnap() {
  const eye = camera.position.clone().sub(controls.target);

  cameraSnap = {
    startedAt: null,
    eye,
    radius: THREE.MathUtils.clamp(
      eye.length(),
      controls.minDistance,
      controls.maxDistance
    ),
    target: controls.target.clone(),
    up: camera.up.clone()
  };
}

function cancelCameraSnap() {
  cameraSnap = null;
}

function updateCameraSnap(time) {
  if (!cameraSnap) return;

  if (cameraSnap.startedAt === null) {
    cameraSnap.startedAt = time;
  }

  const progress = Math.min((time - cameraSnap.startedAt) / SNAP_DURATION, 1);
  const eased = 1 - Math.pow(1 - progress, 3);
  controls.target.lerpVectors(cameraSnap.target, DEFAULT_TARGET, eased);
  camera.position.copy(controls.target).addScaledVector(
    slerpDirection(cameraSnap.eye, DEFAULT_CAMERA_DIRECTION, eased),
    cameraSnap.radius
  );
  camera.up.lerpVectors(cameraSnap.up, DEFAULT_CAMERA_UP, eased).normalize();
  camera.lookAt(controls.target);

  if (progress >= 1) {
    const finalRadius = cameraSnap.radius;
    cameraSnap = null;
    controls.target.copy(DEFAULT_TARGET);
    camera.position.copy(DEFAULT_TARGET).addScaledVector(
      DEFAULT_CAMERA_DIRECTION,
      finalRadius
    );
    camera.up.copy(DEFAULT_CAMERA_UP);
    camera.lookAt(DEFAULT_TARGET);
  }
}

function slerpDirection(startVector, endDirection, progress) {
  const startLength = startVector.length();
  const start = startLength > 0.0001
    ? startVector.clone().divideScalar(startLength)
    : endDirection.clone();
  const end = endDirection.clone().normalize();
  const dot = THREE.MathUtils.clamp(start.dot(end), -1, 1);

  if (dot > 0.9995) {
    return start.lerp(end, progress).normalize();
  }

  const theta = Math.acos(dot);
  const sinTheta = Math.sin(theta);
  const startScale = Math.sin((1 - progress) * theta) / sinTheta;
  const endScale = Math.sin(progress * theta) / sinTheta;

  return start
    .multiplyScalar(startScale)
    .add(end.multiplyScalar(endScale))
    .normalize();
}

function animate(time = 0) {
  requestAnimationFrame(animate);
  updateCameraSnap(time);
  controls.update();

  const seconds = time * 0.001;
  frontGloss.material.uniforms.uTime.value = seconds;
  backGloss.material.uniforms.uTime.value = seconds;
  frontGloss.material.uniforms.uCameraPosition.value.copy(camera.position);
  backGloss.material.uniforms.uCameraPosition.value.copy(camera.position);
  renderer.render(scene, camera);
}
