<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="space-y-8">
	<div class="space-y-4">
		<h2 class="text-3xl font-semibold">Popular albums</h2>
		<div class="divide-y divide-gray-6">
			{#each $page.data.popularAlbums as album, index}
				<a
					href={`/album/${album.slug}`}
					class="group flex items-center justify-between gap-4 p-2"
				>
					<div class="flex items-center gap-8">
						<p class="text-3xl font-bold text-yellow-12">{index + 1}</p>
						<div class="flex items-center gap-4">
							<img
								src={album.cover}
								alt={album.name}
								class="size-12 rounded-md"
							/>
							<p class="text-xl font-semibold group-hover:text-yellow-12">
								{album.name}
							</p>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
	<div class="space-y-4">
		<h2 class="text-3xl font-semibold">Latest albums</h2>
		<div class="divide-y divide-gray-6">
			{#each $page.data.latestAlbums as album, index}
				<a
					href={`/album/${album.slug}`}
					class="group flex items-center justify-between gap-4 p-2"
				>
					<div class="flex items-center gap-8">
						<p class="text-3xl font-bold text-yellow-12">{index + 1}</p>
						<div class="flex items-center gap-4">
							<img
								src={album.cover}
								alt={album.name}
								class="size-12 rounded-md"
							/>
							<p class="text-xl font-semibold group-hover:text-yellow-12">
								{album.name}
							</p>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>
