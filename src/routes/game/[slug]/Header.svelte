<script lang="ts">
	import { page } from '$app/stores';
</script>

<header class="flex items-center gap-16">
	<div class="relative">
		<img
			src={$page.data.game.cover}
			alt={$page.data.value}
			class="max-h-52 rounded-md"
		/>
		<div
			class="from-1% absolute inset-0 rounded-md bg-gradient-to-l from-gray-2"
		/>
	</div>
	<div class="space-y-4">
		<h2 class="text-6xl font-bold">{$page.data.game.name}</h2>
		<div class="flex gap-2 text-sm text-gray-11 sm:text-base">
			<p>{$page.data.countAlbums} albums</p>
			<p class="before:mx-2 before:font-bold before:content-['·']">
				{$page.data.game.companies.name}
			</p>
		</div>
	</div>
</header>
