<template>
  <div class="photo-upload-container">
    <div class="upload-section">
      <h2>Tomar Fotos</h2>

      <!-- Mensajes de estado -->
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>

      <!-- Formulario de carga -->
      <form @submit.prevent="uploadPhoto" class="upload-form">
        <div class="form-group">
          <label for="dni">DNI o Carnet de Extranjeria:</label>
          <input
            type="text"
            id="dni"
            v-model="dni"
            placeholder="Ingrese DNI (8-9 dígitos)"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="image">Seleccionar Imagen (JPG):</label>
          <input
            type="file"
            id="image"
            ref="fileInput"
            @change="handleFileSelect"
            accept=".jpg,.jpeg"
            required
            class="form-input"
          />
          <small v-if="selectedFile">Archivo seleccionado: {{ selectedFile.name }}</small>
        </div>

        <button type="submit" :disabled="uploading" class="submit-btn">
          {{ uploading ? 'Subiendo...' : 'Subir Foto' }}
        </button>
      </form>

      <!-- Vista previa de la imagen -->
      <div v-if="imagePreview" class="image-preview">
        <h3>Vista previa:</h3>
        <img :src="imagePreview" alt="Vista previa" class="preview-image" />
      </div>

      <!-- Resultado del procesamiento -->
      <div v-if="result" class="result-section">
        <h3>Resultado del procesamiento:</h3>
        <div class="result-info">
          <p><strong>Estado:</strong> {{ result.status }}</p>
          <p><strong>Mensaje:</strong> {{ result.message }}</p>
          <p><strong>Estado Usuario:</strong> {{ result.statusUser }}</p>
          <p v-if="result.imageUrl">
            <strong>URL de la imagen:</strong>
            <a :href="result.imageUrl" target="_blank">Ver imagen procesada</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PhotoUpload',
  data() {
    return {
      dni: '',
      selectedFile: null,
      imagePreview: null,
      uploading: false,
      message: '',
      messageType: '', // 'success' o 'error'
      result: null,
    }
  },
  methods: {
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        // Validar tipo de archivo
        if (!file.type.match('image/jpeg')) {
          this.showMessage('Solo se permiten archivos JPG', 'error')
          this.$refs.fileInput.value = ''
          this.selectedFile = null
          this.imagePreview = null
          return
        }

        this.selectedFile = file

        // Crear vista previa
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreview = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    async uploadPhoto() {
      // Validaciones básicas
      if (!this.dni.match(/^\d{8,9}$/)) {
        this.showMessage('El DNI debe tener 8 o 9 dígitos', 'error')
        return
      }

      if (!this.selectedFile) {
        this.showMessage('Por favor seleccione una imagen', 'error')
        return
      }

      this.uploading = true
      this.message = ''
      this.result = null

      try {
        const formData = new FormData()
        formData.append('dni', this.dni)
        formData.append('image', this.selectedFile)

        // Obtener token JWT (ajusta según tu implementación)
        const token = localStorage.getItem('token') // o como almacenes el token

        const response = await axios.post('tomar_fotos', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        const data = await response.json()

        if (response.ok) {
          this.result = data
          this.showMessage('Foto procesada exitosamente', 'success')
        } else {
          this.showMessage(data.message || 'Error al procesar la foto', 'error')
        }
      } catch (error) {
        console.error('Error:', error)
        this.showMessage('Error de conexión', 'error')
      } finally {
        this.uploading = false
      }
    },

    showMessage(text, type) {
      this.message = text
      this.messageType = type

      // Auto-ocultar mensaje después de 5 segundos
      setTimeout(() => {
        this.message = ''
        this.messageType = ''
      }, 5000)
    },

    resetForm() {
      this.dni = ''
      this.selectedFile = null
      this.imagePreview = null
      this.$refs.fileInput.value = ''
      this.result = null
    },
  },
}
</script>

<style scoped>
.photo-upload-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.upload-section {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.upload-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.submit-btn {
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background: #0056b3;
}

.message {
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.image-preview {
  margin: 20px 0;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.result-section {
  background: white;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.result-info p {
  margin: 5px 0;
}
</style>
