<template>
	<div class="flex gap-3 justify-content-center">
		<!-- Foto Tomada -->
		<div class="flex flex-column align-items-center">
			<img 
				src="/user_blank.jpg" 
				alt="Imagen 1" 
				class="small-photo border-round"
			/>
			<p class="mt-2 mb-0 text-sm">Foto Tomada</p>
		</div>

		<!-- Foto Guardada -->
		<div class="flex flex-column align-items-center">
			<img 
				src="/user_blank.jpg" 
				alt="Imagen 2" 
				class="small-photo border-round"
			/>
			<p class="mt-2 mb-0 text-sm">Foto Guardada</p>
		</div>
	</div>
</template>

<script setup>
</script>

<style scoped>
.small-photo {
	width: 400px;
	height: 400px;
	object-fit: cover;
}

.text-sm {
	font-size: 0.875rem;
}
</style>