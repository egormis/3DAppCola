import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import $ from "https://cdn.skypack.dev/jquery";

document.addEventListener("DOMContentLoaded", function () {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("3d-container").appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 2, 50);
  pointLight.position.set(0, 5, 5);
  scene.add(pointLight);

  scene.background = new THREE.Color(0xaaaaaa);

  const loader = new GLTFLoader();
  let model;
  let mixer;

  function loadModel(modelPath) {
    if (model) {
      scene.remove(model);
    }
    loader.load(
      modelPath,
      function (gltf) {
        console.log("Model loaded successfully");
        model = gltf.scene;
        model.position.set(0, 0, 0);
        scene.add(model);

        model.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          console.log("Animation clip:", clip);
          mixer.clipAction(clip).play();
        });

        animate();
      },
      undefined,
      function (error) {
        console.error("An error happened", error);
      }
    );
  }

  function fetchModel(modelName) {
    $.ajax({
      url: "../php/getModel.php",
      type: "GET",
      data: { modelPath: modelName },
      dataType: "json",
      success: function (response) {
        if (response.modelUrl) {
          loadModel(response.modelUrl);
        } else {
          console.error("Model not found", response);
        }
      },
      error: function (error) {
        console.error("Error fetching model", error);
        console.log("Response text:", error.responseText);
      },
    });
  }

  camera.position.set(0, 2, 5);
  camera.lookAt(0, 0, 0);

  let isMouseDown = false;
  let previousMousePosition = { x: 0, y: 0 };

  document.addEventListener(
    "mousedown",
    (event) => {
      isMouseDown = true;
    },
    false
  );
  document.addEventListener(
    "mouseup",
    (event) => {
      isMouseDown = false;
    },
    false
  );
  document.addEventListener("mousemove", (event) => {
    if (!isMouseDown) return;

    const deltaMove = {
      x: event.offsetX - previousMousePosition.x,
      y: event.offsetY - previousMousePosition.y,
    };

    if (model) {
      model.rotation.y += deltaMove.x * 0.005;
    }

    previousMousePosition = {
      x: event.offsetX,
      y: event.offsetY,
    };
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  $("#wireframe-btn").on("click", function () {
    scene.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material.wireframe = !child.material.wireframe;
      }
    });
  });

  $("#texture-btn").on("click", function () {});

  $("#cola-btn").on("click", function () {
    fetchModel("Cola");
  });

  $("#fanta-btn").on("click", function () {
    fetchModel("Fanta");
  });

  $("#pepper-btn").on("click", function () {
    fetchModel("DoctorPepper");
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) {
      mixer.update(delta);
    }

    renderer.render(scene, camera);
  }

  fetchModel("Cola");
});
