<template>
  <div class="camera-container">
    <h1>Validación Facial</h1>
    <video ref="cameraVideo" class="camera-feed" autoplay playsinline></video>
    <canvas ref="cameraCanvas" class="camera-canvas"></canvas>

    <div class="feedback">
      <p v-if="!isFaceDetected">Esperando rostro...</p>
      <p v-else-if="!isValid">Ajusta tu posición: {{ feedbackMessage }}</p>
      <p v-else>¡Validación completa! Puedes tomar la foto.</p>
    </div>

    <button @click="capturePhoto" :disabled="!isValid">Tomar Foto</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

// Referencias a los elementos del DOM
const cameraVideo = ref(null)
const cameraCanvas = ref(null)

// Estado de la validación
const isFaceDetected = ref(false)
const isValid = ref(false)
const feedbackMessage = ref('')

let faceLandmarker = null
let lastVideoTime = -1
let animationFrameId = null

// Inicializa MediaPipe y la cámara
const initializeMediaPipe = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
  )
  faceLandmarker = await FaceLandmarker.createForVideo(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker_mesh/float16/1/face_landmarker_mesh.task`,
      delegate: 'GPU',
    },
    outputFaceBlendshapes: true,
    runningMode: 'VIDEO',
    numFaces: 1,
  })

  startCamera()
}

// Inicia la cámara y el bucle de detección
const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    cameraVideo.value.srcObject = stream
    cameraVideo.value.addEventListener('loadeddata', () => {
      // Bucle de detección de MediaPipe
      detectFace()
    })
  } catch (error) {
    console.error('Error al acceder a la cámara:', error)
  }
}

// Bucle de detección en cada frame
const detectFace = () => {
  if (cameraVideo.value && cameraVideo.value.currentTime !== lastVideoTime) {
    const results = faceLandmarker.detectForVideo(cameraVideo.value, Date.now())
    lastVideoTime = cameraVideo.value.currentTime

    // Procesa los resultados y realiza la validación
    processResults(results)
  }
  animationFrameId = requestAnimationFrame(detectFace)
}

// Lógica de validación
const processResults = (results) => {
  if (results.faceLandmarks && results.faceLandmarks.length > 0) {
    isFaceDetected.value = true
    const landmarks = results.faceLandmarks[0]

    // Aquí implementas tu lógica de validación
    const validationChecks = {
      isCentered: checkCentering(landmarks),
      isLookingForward: checkLookingForward(landmarks),
      areEyesOpen: checkEyesOpen(landmarks),
    }

    isValid.value = Object.values(validationChecks).every((v) => v)

    if (!isValid.value) {
      if (!validationChecks.isCentered) feedbackMessage.value = 'Por favor, centra tu rostro.'
      else if (!validationChecks.isLookingForward)
        feedbackMessage.value = 'Mira de frente a la cámara.'
      else if (!validationChecks.areEyesOpen) feedbackMessage.value = 'Abre bien los ojos.'
    }
  } else {
    isFaceDetected.value = false
    isValid.value = false
  }
}

// Implementación de las funciones de validación
const checkCentering = (landmarks) => {
  // Ejemplo: verificar que la nariz (punto 1) esté cerca del centro
  const noseTip = landmarks[1]
  return Math.abs(noseTip.x - 0.5) < 0.2 && Math.abs(noseTip.y - 0.5) < 0.2
}

const checkLookingForward = (landmarks) => {
  // Ejemplo: comparar la posición de los ojos para detectar inclinación
  const leftEye = landmarks[33]
  const rightEye = landmarks[263]
  const eyeDistance = Math.abs(leftEye.x - rightEye.x)
  return eyeDistance > 0.05 // Ajusta este valor según tu necesidad
}

const checkEyesOpen = (landmarks) => {
  // Ejemplo: calcular la distancia vertical entre los párpados
  const leftEyeUpper = landmarks[159]
  const leftEyeLower = landmarks[145]
  const rightEyeUpper = landmarks[386]
  const rightEyeLower = landmarks[374]

  const leftEyeOpenness = Math.abs(leftEyeUpper.y - leftEyeLower.y)
  const rightEyeOpenness = Math.abs(rightEyeUpper.y - rightEyeLower.y)

  return leftEyeOpenness > 0.02 && rightEyeOpenness > 0.02 // Ajusta este valor
}

// Función para capturar la foto
const capturePhoto = () => {
  const canvas = cameraCanvas.value
  const video = cameraVideo.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const context = canvas.getContext('2d')
  context.drawImage(video, 0, 0, canvas.width, canvas.height)

  const photoDataUrl = canvas.toDataURL('image/jpeg')
  console.log('¡Foto capturada!', photoDataUrl)
  // Aquí puedes enviar la foto a un servidor o procesarla
}

// Ciclo de vida del componente
onMounted(() => {
  initializeMediaPipe()
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  if (cameraVideo.value && cameraVideo.value.srcObject) {
    cameraVideo.value.srcObject.getTracks().forEach((track) => track.stop())
  }
})
</script>

<style scoped>
.camera-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.camera-feed {
  width: 100%;
  max-width: 600px;
  border: 2px solid #ccc;
  border-radius: 8px;
}
.camera-canvas {
  display: none; /* Ocultamos el canvas, solo se usa para la captura */
}
.feedback {
  height: 50px;
  text-align: center;
}
.feedback p {
  font-size: 1.2em;
  color: #333;
}
.feedback p[v-if='isValid'] {
  color: green;
}
</style>
