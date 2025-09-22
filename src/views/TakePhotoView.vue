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
          <input type="text" id="dni" v-model="dni" placeholder="Ingrese DNI (8-9 dígitos)" required
            class="form-input" />
        </div>

        <!-- Selector de método de captura -->
        <div class="form-group">
          <label>Seleccionar método de captura:</label>
          <div class="capture-options">
            <button type="button" @click="showCamera = true" class="capture-btn" :class="{ active: showCamera }">
              📷 Usar Cámara
            </button>
            <button type="button" @click="showCamera = false" class="capture-btn" :class="{ active: !showCamera }">
              📁 Cargar Archivo
            </button>
          </div>
        </div>

        <!-- Sección de cámara -->
        <div v-if="showCamera" class="camera-section">
          <div class="camera-preview">
            <video ref="videoElement" v-show="!capturedImage && !isLoadingCamera" autoplay playsinline
              class="camera-video"></video>
            <canvas ref="canvasElement" style="display: none;"></canvas>

            <div v-if="isLoadingCamera" class="camera-loading">
              Cargando cámara...
            </div>

            <div v-if="capturedImage" class="captured-image">
              <img :src="capturedImage" alt="Foto capturada" class="preview-image" />
              <button type="button" @click="retakePhoto" class="retake-btn">
                🔄 Volver a tomar
              </button>
            </div>
          </div>

          <div class="camera-controls" v-if="!capturedImage && !isLoadingCamera">
            <button type="button" @click="capturePhoto" class="capture-photo-btn" :disabled="!isCameraReady">
              📸 Tomar Foto
            </button>
          </div>
        </div>

        <!-- Sección de carga de archivo -->
        <div v-else class="file-section">
          <div class="form-group">
            <label for="image">Seleccionar Imagen (JPG):</label>
            <input type="file" id="image" ref="fileInput" @change="handleFileSelect" accept=".jpg,.jpeg" required
              class="form-input" />
            <small v-if="selectedFile">Archivo seleccionado: {{ selectedFile.name }}</small>
          </div>

          <!-- Vista previa de archivo seleccionado -->
          <div v-if="imagePreview && !showCamera" class="image-preview">
            <h3>Vista previa:</h3>
            <img :src="imagePreview" alt="Vista previa" class="preview-image" />
          </div>
        </div>

        <button type="submit" :disabled="uploading || !hasValidImage" class="submit-btn">
          {{ uploading ? 'Subiendo...' : 'Subir Foto' }}
        </button>
      </form>

      <!-- Resultado del procesamiento -->
      <div v-if="result" class="result-section">
        <h3>Resultado del procesamiento:</h3>
        <div class="result-info">
          <p><strong>Estado:</strong> {{ result.status }}</p>
          <p><strong>Mensaje:</strong> {{ result.message }}</p>
          <p><strong>Estado Usuario:</strong> {{ result.statusUser }}</p>

          <!-- Visualización de la imagen procesada -->
          <div v-if="result.imageUrl" class="processed-image">
            <h4>Imagen Procesada:</h4>
            <img :src="result.imageUrl" :alt="`Imagen procesada para DNI ${dni}`" class="processed-image-preview"
              @load="onProcessedImageLoad" @error="onProcessedImageError" />
            <div v-if="processedImageLoading" class="image-loading">
              Cargando imagen procesada...
            </div>
            <div class="image-actions">
              <a :href="result.imageUrl" target="_blank" class="image-link">
                🔗 Abrir en nueva pestaña
              </a>
              <button @click="downloadProcessedImage" class="download-btn">
                💾 Descargar imagen
              </button>
            </div>
          </div>
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
      messageType: '',
      result: null,

      // Cámara
      showCamera: false,
      capturedImage: null,
      stream: null,
      isCameraReady: false,
      isLoadingCamera: false,

      // Imagen procesada
      processedImageLoading: false,
    }
  },
  computed: {
    hasValidImage() {
      if (this.showCamera) {
        return this.capturedImage !== null
      } else {
        return this.selectedFile !== null
      }
    }
  },
  watch: {
    showCamera(newVal) {
      if (newVal) {
        this.startCamera()
      } else {
        this.stopCamera()
      }
    }
  },
  mounted() {
    // Inicializar cámara si es necesario
    if (this.showCamera) {
      this.startCamera()
    }
  },
  beforeUnmount() {
    this.stopCamera()
  },
  methods: {
    // Manejo de archivos
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        if (!file.type.match('image/jpeg')) {
          this.showMessage('Solo se permiten archivos JPG', 'error')
          this.$refs.fileInput.value = ''
          this.selectedFile = null
          this.imagePreview = null
          return
        }

        this.selectedFile = file
        this.capturedImage = null // Limpiar imagen de cámara si existe

        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreview = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    // Funcionalidad de cámara
    async startCamera() {
      this.isLoadingCamera = true
      this.isCameraReady = false

      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user' // Usar cámara frontal
          }
        })

        this.$refs.videoElement.srcObject = this.stream
        await this.$refs.videoElement.play()
        this.isCameraReady = true
      } catch (error) {
        console.error('Error al acceder a la cámara:', error)
        this.showMessage('No se pudo acceder a la cámara. Asegúrese de permitir el acceso.', 'error')
        this.showCamera = false
      } finally {
        this.isLoadingCamera = false
      }
    },

    stopCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
        this.stream = null
      }
      this.isCameraReady = false
      this.capturedImage = null
    },

    capturePhoto() {
      const video = this.$refs.videoElement
      const canvas = this.$refs.canvasElement
      const context = canvas.getContext('2d')

      // Configurar canvas con las dimensiones del video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Dibujar el frame actual del video en el canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convertir a blob y luego a File
      canvas.toBlob((blob) => {
        const file = new File([blob], `foto-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        })

        this.selectedFile = file
        this.capturedImage = canvas.toDataURL('image/jpeg')
        this.stopCamera() // Detener la cámara después de capturar
      }, 'image/jpeg', 0.95)
    },

    retakePhoto() {
      this.capturedImage = null
      this.selectedFile = null
      this.startCamera()
    },

    // Subida de la foto
    async uploadPhoto() {
      if (!this.dni.match(/^\d{8,9}$/)) {
        this.showMessage('El DNI debe tener 8 o 9 dígitos', 'error')
        return
      }

      if (!this.hasValidImage) {
        this.showMessage('Por favor capture o seleccione una imagen', 'error')
        return
      }

      this.uploading = true
      this.message = ''
      this.result = null
      this.processedImageLoading = true

      try {
        const formData = new FormData()
        formData.append('dni', this.dni)
        formData.append('file', this.selectedFile)

        const response = await axios.post('tomar_fotos', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        this.result = response.data

        if (response.status === 200 && this.result.status === 'success') {
          this.showMessage('Foto procesada exitosamente', 'success')
          // Limpiar formulario después de éxito
          setTimeout(() => {
            this.resetForm()
          }, 3000)
        } else {
          this.showMessage(this.result.message || 'Error al procesar la foto', 'error')
        }
      } catch (error) {
        console.error('Error:', error)
        if (error.response && error.response.data) {
          this.showMessage(error.response.data.message || 'Error al procesar la foto', 'error')
        } else {
          this.showMessage('Error de conexión', 'error')
        }
      } finally {
        this.uploading = false
      }
    },

    // Manejo de imagen procesada
    onProcessedImageLoad() {
      this.processedImageLoading = false
    },

    onProcessedImageError() {
      this.processedImageLoading = false
      this.showMessage('Error al cargar la imagen procesada', 'error')
    },

    async downloadProcessedImage() {
      if (!this.result.imageUrl) return

      try {
        const response = await fetch(this.result.imageUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `foto-procesada-${this.dni}.jpg`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('Error al descargar la imagen:', error)
        this.showMessage('Error al descargar la imagen', 'error')
      }
    },

    showMessage(text, type) {
      this.message = text
      this.messageType = type

      setTimeout(() => {
        this.message = ''
        this.messageType = ''
      }, 5000)
    },

    resetForm() {
      this.dni = ''
      this.selectedFile = null
      this.imagePreview = null
      this.capturedImage = null
      this.result = null

      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }

      if (this.showCamera) {
        this.startCamera()
      }
    }
  }
}
</script>

<style scoped>
.photo-upload-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.upload-section {
  background: #f5f5f5;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.upload-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.capture-options {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.capture-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.capture-btn.active {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.capture-btn:hover:not(.active) {
  border-color: #007bff;
}

.camera-section {
  margin: 20px 0;
}

.camera-preview {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

.camera-video {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.camera-loading {
  padding: 40px;
  text-align: center;
  color: white;
  background: #333;
}

.captured-image {
  text-align: center;
  padding: 20px;
}

.camera-controls {
  text-align: center;
}

.capture-photo-btn {
  background: #28a745;
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.3s;
}

.capture-photo-btn:hover:not(:disabled) {
  background: #218838;
}

.capture-photo-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.retake-btn {
  background: #ffc107;
  color: #212529;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  margin-top: 10px;
  cursor: pointer;
}

.retake-btn:hover {
  background: #e0a800;
}

.submit-btn {
  width: 100%;
  background: #007bff;
  color: white;
  padding: 15px;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 20px;
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background: #0056b3;
}

.message {
  padding: 15px;
  margin: 15px 0;
  border-radius: 6px;
  font-weight: bold;
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

.image-preview,
.captured-image {
  margin: 20px 0;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border: 2px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  margin-top: 30px;
}

.result-info p {
  margin: 8px 0;
  font-size: 16px;
}

.processed-image {
  margin-top: 20px;
  text-align: center;
}

.processed-image-preview {
  max-width: 100%;
  max-height: 400px;
  border: 3px solid #28a745;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-loading {
  padding: 20px;
  color: #6c757d;
  font-style: italic;
}

.image-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.image-link,
.download-btn {
  padding: 10px 15px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
}

.image-link {
  background: #17a2b8;
  color: white;
  border: none;
}

.image-link:hover {
  background: #138496;
}

.download-btn {
  background: #28a745;
  color: white;
  border: none;
  cursor: pointer;
}

.download-btn:hover {
  background: #218838;
}

@media (max-width: 768px) {
  .photo-upload-container {
    padding: 10px;
  }

  .upload-section {
    padding: 20px;
  }

  .capture-options {
    flex-direction: column;
  }

  .image-actions {
    flex-direction: column;
    align-items: center;
  }

  .image-link,
  .download-btn {
    width: 100%;
    text-align: center;
  }
}
</style>