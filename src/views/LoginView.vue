<template>
  <main class="form-signin">
    <form @submit.prevent="submit">
      <h1 class="h3 mb-3 fw-normal">Please sign in</h1>

      <div class="form-floating mb-3">
        <input v-model="username" type="text" class="form-control" placeholder="Username" />
        <label>Username</label>
      </div>

      <div class="form-floating mb-3">
        <input v-model="password" type="password" class="form-control" placeholder="Password" />
        <label>Password</label>
      </div>

      <button class="w-100 btn btn-lg btn-primary" type="submit">Submit</button>
    </form>
  </main>
</template>

<script>
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const router = useRouter()

export default {
  name: 'Login',
  setup() {
    const submit = async (e) => {
      try {
        const { data } = await axios.post('/login', {
          username: username.value,
          password: password.value,
        })

        // Guardar token en localStorage
        localStorage.setItem('auth_token', data.token)

        // Configurar axios para futuras peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

        // Redirigir al home
        await router.push('/')
      } catch (error) {
        console.error('Error en login:', error)
        //alert('Credenciales inválidas o error de servidor')
      }
    }

    return {
      submit,
    }
  },
}
</script>
