<script lang="ts">
	import { page } from '$app/stores';
	import type { SelectMusic } from '$lib/db';
	import { cover, favoritesMusics, length, musics, trackId } from '$lib/store';
	import { Musics } from '$modules';
	import { Separator } from 'bits-ui';
	import { onMount } from 'svelte';
	import Header from './Header.svelte';
	import { Search } from '$components';
	import { debounce } from '$lib/utils';

	let query: string = '';
	let filteredMusics = [];

	$: if (filteredMusics.length > 0) {
		musics.set(filteredMusics);
	} else {
		musics.set($page.data.musics);
	}

	$: $length = $page.data.length;

	const search = () => {
		filteredMusics = $page.data.musics.filter((music) => {
			let musicName = music.name.toLowerCase();
			return musicName.includes(query.toLowerCase());
		});
	};

	onMount(() => {
		$cover = $page.data.album.cover;
		$trackId = 0;
		$page.data.favoritesMusics.forEach((music: SelectMusic) => {
			favoritesMusics.update((current) => current.add(music.id));
		});
	});
</script>

<div class="flex flex-col gap-4">
	<Header />
	<Separator.Root class="mx-auto h-px w-11/12 bg-gray-5" />
	<Search bind:query on:input={debounce(search)} placeholder="Search title" />
	{#if query && filteredMusics.length === 0}
		<p class="mt-8 flex items-center justify-center text-4xl font-semibold">
			No Results
		</p>
	{:else}
		<Musics />
	{/if}
</div>
