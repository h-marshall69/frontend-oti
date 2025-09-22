<template>
  <main class="form-signin">
    <form @submit.prevent="submit">
      <h1 class="h3 mb-3 fw-normal">Please sign in</h1>

      <div class="form-floating mb-3">
        <input type="text" class="form-control" name="username" placeholder="Username" />
        <label for="username">Username</label>
      </div>

      <div class="form-floating">
        <input type="password" class="form-control" name="password" placeholder="Password" />
        <label>Password</label>
      </div>

      <button class="w-100 btn btn-lg btn-primary" type="submit">Submit</button>
    </form>
  </main>
</template>

<script>
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()

    const submit = async (e) => {
      const form = new FormData(e.target)
      const params = new URLSearchParams(form.entries()) // esto eliminar by marshall

      const inputs = Object.fromEntries(form.entries())

      //const { data } = await axios.post('login', inputs, {
      //withCredentials: true,
      //})

      const { data } = await axios.post('login', params.toString(), {
        //withCredentials: true,
      })

      console.log(data)

      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

      await router.push('/')
    }

    return {
      submit,
    }
  },
}
</script>
<style scoped>
/* login.css */
body {
  background: linear-gradient(135deg, #4e54c8, #8f94fb);
  font-family: 'Segoe UI', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.form-signin {
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.form-signin h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-signin input[type='text'],
.form-signin input[type='password'] {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
}

.form-signin button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4e54c8;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.form-signin button:hover {
  background-color: #3b3fc1;
}
</style>
