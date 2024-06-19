<script lang="ts">
	import { page } from '$app/stores';
	import { Card } from '$components';
	import Search from '$components/Search.svelte';
	import type { SelectAlbum } from '$lib/db';
	import { debounce } from '$lib/utils';

	let filteredAlbums: SelectAlbum[] = [];
	let query: string = '';

	const search = () => {
		filteredAlbums = $page.data.albums.filter((album: SelectAlbum) => {
			let albumName = album.name.toLowerCase();
			return albumName.includes(query.toLowerCase());
		});
	};
</script>

<section class="flex flex-col gap-8">
	<Search bind:query on:input={debounce(search)} placeholder="Search album" />
	{#if query && filteredAlbums.length === 0}
		<p class="mt-8 flex items-center justify-center text-4xl font-semibold">
			No Results
		</p>
	{:else if filteredAlbums.length > 0}
		<div class="flex flex-wrap justify-evenly gap-1 md:justify-around">
			{#each filteredAlbums as album}
				<Card
					title={album.name}
					alt={album.name}
					cover={album.cover}
					release={album.release}
					game={album.games.name}
					link={`/album/${album.slug}`}
				/>
			{/each}
		</div>
	{:else}
		<div class="flex flex-wrap justify-evenly gap-1 md:justify-around">
			{#each $page.data.albums as album}
				<Card
					title={album.name}
					alt={album.name}
					cover={album.cover}
					release={album.release}
					game={album.games.name}
					link={`/album/${album.slug}`}
				/>
			{/each}
		</div>
	{/if}
</section>
