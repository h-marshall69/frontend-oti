<template>
    <header>
        <nav>
            <button @click="handleNavigation('AdministratorPage')"
                :class="{ active: currentComponent === 'AdministratorPage' }">
                Ir Administrador
            </button>
            <button @click="handleNavigation('AdmisionPage')" 
                :class="{ active: currentComponent === 'AdmisionPage' }">
                Ir Admision
            </button>
            <button @click="handleNavigation('Nose')" 
                :class="{ active: currentComponent === 'Nose' }">
                Ir Nose
            </button>
            <button @click="handleNavigation('Test')" 
                :class="{ active: currentComponent === 'Test' }">
                Ir Test
            </button>
        </nav>
    </header>

    <main>
        <component :is="components[currentComponent]" />
    </main>
</template>

<script>
import { ref } from 'vue'
import AdmisionPage from './AdmisionPage.vue';
import AdministratorPage from '../administrador/AdministratorPage.vue';

import Nose from './Nose.vue';
import Test from './Test.vue';

export default {
    setup() {
        const currentComponent = ref('AdministratorPage')

        const components = {
            AdministratorPage,
            AdmisionPage,
            Nose,
            Test,
        };

        const handleNavigation = (componentName) => {
            currentComponent.value = componentName;
        }

        return {
            currentComponent,
            components,
            handleNavigation
        }
    },
}
</script>

<style scoped>

.active {
    /* Add your active button styles here */
    background-color: #007bff;
    color: white;
}

</style>