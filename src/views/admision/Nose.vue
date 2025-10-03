<template>
  <div>
      <label>Toma de Fotos</label>
      <video ref="videoElement" autoplay playsinline></video>
      <select v-model="selectedCamera" @change="startCamera">
        <option v-for="device in videoDevices" :key="device.deviceId" :value="device.deviceId">
          {{ device.label || 'Cámara ' + device.deviceId }}
        </option>
      </select>
      <input v-model="dni" placeholder="DNI Ej. 12345678" />
      <button @click="uploadPhoto" class="styled-button">
        <i class="pi pi-camera"></i>
        Take Picture
      </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from "axios";
import { useAdmisionStore } from '../../stores/useAdmisionStore';
import { makeFormData } from '../../abadeer_truco/utilities/FormDataMaker';

const loading = ref(true)
const videoDevices = ref([])
const selectedCamera = ref(null)
const videoElement = ref(null)
const dni = ref("")

const getCameras = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  videoDevices.value = devices.filter(device => device.kind === 'videoinput')
  if (videoDevices.value.length > 0) {
    selectedCamera.value = videoDevices.value[0].deviceId
    startCamera()
  }
  loading.value = false
}

const startCamera = async () => {
  if (!selectedCamera.value) return
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: selectedCamera.value,
      width: { min: 1280, ideal: 1920 },
      height: { min: 720, ideal: 1080 }
    }
  })
  videoElement.value.srcObject = stream
}

onMounted(async () => {
  await getCameras()
})

const props = defineProps({
  imageSrc: { type: String, required: true },
  dni: { type: String, required: true }
});

const uploadPhoto = async () => {
  try {
    const formData = makeFormData({
      imageString: props.imageSrc,
      dni: props.dni,
      codes: ["00000000-0000-0000-0000-000000000000"]
    });

    const response = await axios.post("http://localhost:8000/api/tomar_fotos", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    console.log("Respuesta del servidor:", response.data);
  } catch (error) {
    console.error("Error al subir la foto:", error);
  }
};
</script>

<style scoped>
.styled-button {
  background: var(--primary-500);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.styled-button:hover {
  background: var(--primary-600);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.styled-button:active {
  transform: translateY(0);
}
</style>