import { createRouter, createWebHistory } from 'vue-router'
import TomarFoto from '@/views/TomarFoto/TomarFoto.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'tomar fotos',
      component: TomarFoto,
    },
  ],
})

export default router
