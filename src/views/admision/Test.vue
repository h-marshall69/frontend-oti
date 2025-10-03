<template>
    <div>
        <input type="file" accept="image/jpeg" @change="handleFileUpload" />
        <input v-model="dni" placeholder="DNI Ej. 12345678" type="number" />
        <button @click="uploadPhoto" :disabled="!imageSrc">Subir imagen JPG</button>


        <img v-if="imageSrc" :src="imageSrc" alt="Vista previa" style="max-width: 300px;" />

        <p v-if="serverResponse">Respuesta del servidor: {{ serverResponse }}</p>
        <p v-if="errorMessage" style="color: red;">Error: {{ errorMessage }}</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from "axios"
import { makeFormData } from '../../abadeer_truco/utilities/FormDataMaker';

const serverResponse = ref(null)
const errorMessage = ref(null)

const imageSrc = ref(null)
const dni = ref("")

// const props = defineProps({
//   imageSrc: { type: String, required: true },
//   dni: { type: String, required: true }
// });

const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== "image/jpeg") {
        errorMessage.value = "Solo se permiten imágenes JPG";
        return;
    }

    if (!/^\d{8}$/.test(dni.value)) {
        errorMessage.value = "El DNI debe tener 8 dígitos";
        return;
    }

    const reader = new FileReader()
    reader.onload = () => {
        imageSrc.value = reader.result // base64 string
    }
    reader.onerror = () => {
        errorMessage.value = "Error al leer el archivo"
    }
    reader.readAsDataURL(file)
}

const uploadPhoto = async () => {
    try {
        // const formData = makeFormData({
        //   imageString: props.imageSrc,
        //   dni: props.dni,
        //   codes: ["00000000-0000-0000-0000-000000000000"]
        // });

        const formData = makeFormData({
            imageString: imageSrc.value,
            dni: dni.value,
            codes: ["00000000-0000-0000-0000-000000000000"]
        });

        const response = await axios.post("http://localhost:8000/api/tomar_fotos", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        serverResponse.value = response.data
    } catch (error) {
        errorMessage.value = error.message
    }
};
</script>

<style scoped></style>