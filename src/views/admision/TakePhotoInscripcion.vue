<template>
    <div>
        <video ref="video" autoplay playsinline webkit-playsinline muted hidden></video>
        <canvas ref="canvas" width="400" height="400" class="bg-black rounded-3x1"></canvas>

        <!-- Campo DNI Mejorado -->
        <div class="dni-container">
            <label for="dni" class="dni-label">Ingrese su DNI:</label>
            <input 
                id="dni" 
                v-model="dni" 
                @input="validateDNI" 
                placeholder="Ej. 12345678" 
                type="number"
                class="dni-input"
            />
            <div class="validation-message" v-if="dni.length > 0">
                <span v-if="isValid" class="valid">✅ DNI válido</span>
                <span v-else class="invalid">❌ DNI debe tener 8 dígitos</span>
            </div>
        </div>

        <!-- Botón Mejorado -->
        <div class="button-container">
            <button @click="TakePicture" class="capture-button">
                <i class="pi pi-camera"></i>
                Take Picture
            </button>
        </div>
    </div>
</template>

<script setup>
import { useAdmisionStore } from '../../stores/useAdmisionStore';
import { ref, onMounted } from 'vue';

const canvas = ref(null)
const video = ref(null)
const ctx = ref(null)
const dni = ref('')
const isValid = ref(false)

const constraints = ref({
    audio: false,
    video: true
})

onMounted(async () => {
    if (video.value && canvas.value) {
        ctx.value = canvas.value.getContext("2d");
        await navigator.mediaDevices
        getUserMedia(constraints.value)
            .then(SetStream)
            .catch(e => {
                console.error(e)
            })
    }
})

function SetStream(stream) {
    video.value.srcObject = stream
    video.value.play()
    requestAnimationFrame(Draw)
}

function Draw() {
    ctx.value.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height)
    requestAnimationFrame(Draw)
}

function TakePicture() {
    var link = document.createElement('a')
    link.download = `vue-cam-${new Date().toISOString()}.png{}`
    link.href = canvas.value.toDataURL()
    link.click()
}

const validateDNI = () => {
    const dniRegex = /^[0-9]{8}$/
    isValid.value = dniRegex.test(dni.value)
}
</script>

<style scoped>
/* Contenedor DNI */
.dni-container {
    max-width: 320px;
    margin: 25px auto;
    font-family: inherit;
}

.dni-label {
    display: block;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 8px;
    font-size: 14px;
}

.dni-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid var(--surface-300);
    border-radius: 8px;
    font-size: 16px;
    background: var(--surface-0);
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.dni-input:focus {
    outline: none;
    border-color: var(--primary-500);
    box-shadow: 0 0 0 3px var(--primary-100);
}

.dni-input::placeholder {
    color: var(--text-color-secondary);
}

/* Mensajes de validación */
.validation-message {
    margin-top: 8px;
    font-size: 14px;
    font-weight: 500;
}

.valid {
    color: var(--green-500);
}

.invalid {
    color: var(--red-500);
}

/* Botón de captura */
.button-container {
    display: flex;
    justify-content: center;
    padding: 20px 0;
}

.capture-button {
    background: var(--primary-500);
    color: white;
    border: none;
    padding: 14px 28px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.capture-button:hover {
    background: var(--primary-600);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.capture-button:active {
    transform: translateY(0);
}

.capture-button:disabled {
    background: var(--surface-300);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
</style>