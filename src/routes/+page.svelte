<script lang="ts">
	import { page } from '$app/stores';
	import { LatestSlider, PopularSlider } from '$modules';
</script>

<div class="space-y-8 overflow-x-hidden">
	<div class="space-y-2">
		<h2 class="text-2xl font-bold">Games</h2>
		<div class="grid auto-cols-max grid-flow-col gap-6 overflow-x-hidden">
			{#each $page.data.games as game}
				<div
					class="relative flex size-48 items-center justify-center rounded-md bg-gray-3 bg-cover bg-center bg-no-repeat p-4 text-center"
					style="background-image: url({game.cover})"
				>
					<a
						href={`/game/${game.value}`}
						class="z-10 text-3xl font-semibold hover:text-yellow-12"
						>{game.name}</a
					>
					<div class="absolute inset-0 rounded-md bg-gray-1 opacity-20" />
				</div>
			{/each}
		</div>
	</div>
	<LatestSlider />
	<PopularSlider />
</div>
