<template>
    <Splitter style="height: 100%">
        <SplitterPanel :size="50" :minSize="40" class="flex align-items-center justify-content-center">
            <TakePhotoInscripcion />
        </SplitterPanel>

        <SplitterPanel :size="50" :minSize="40" class="flex align-items-center justify-content-center">
            <PhotoTakedInscripcion />
        </SplitterPanel>
    </Splitter>
</template>
<script setup>
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import TakePhotoInscripcion from './TakePhotoInscripcion.vue';
import PhotoTakedInscripcion from './PhotoTakedInscripcion.vue';
</script>
<style scoped></style>