<script lang="ts">
	import { page } from '$app/stores';
	import { cover, favoritesMusics, length, musics, trackId } from '$lib/store';
	import { Tabs } from 'bits-ui';
	import { onMount } from 'svelte';
	import Albums from './Albums.svelte';
	import Playlists from './Playlists.svelte';
	import type { SelectMusic } from '$lib/db';
	import { Musics } from '$modules';

	const tabs = [
		{
			value: 'playlists',
			label: 'Playlists',
		},
		{
			value: 'musics',
			label: 'Musics',
		},
		{
			value: 'albums',
			label: 'Albums',
		},
		{
			value: 'artists',
			label: 'Artists',
		},
	];

	let value = 'playlists';

	$: $cover = $page.data.favoritesMusics[$trackId]?.album.cover;

	onMount(() => {
		$musics = $page.data.favoritesMusics;
		$length = $page.data.favoritesMusics.length;
		$page.data.favoritesMusics.forEach((music: SelectMusic) => {
			favoritesMusics.update((current) => current.add(music.id));
		});
	});
</script>

<Tabs.Root bind:value class="mt-4 space-y-8 md:mt-0">
	<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
		<h2 class="text-3xl font-bold capitalize md:text-4xl">{value}</h2>
		<Tabs.List
			class="flex w-fit items-center justify-center gap-4 rounded-md bg-gray-12 px-2 py-1 text-gray-1 md:px-4 md:py-2"
		>
			{#each tabs as tab}
				<Tabs.Trigger
					value={tab.value}
					class="rounded-md px-2 py-1 text-base font-semibold lowercase data-[state=active]:bg-gray-3 data-[state=active]:text-gray-12 md:text-xl"
					style="font-variant: small-caps;"
				>
					{tab.label}
				</Tabs.Trigger>
			{/each}
		</Tabs.List>
	</div>
	<Tabs.Content value="playlists">
		<Playlists />
	</Tabs.Content>
	<Tabs.Content value="musics">
		<Musics />
	</Tabs.Content>
	<Tabs.Content value="albums">
		<Albums />
	</Tabs.Content>
	<Tabs.Content value="artists">
		<p class="py-4 text-center text-xl font-semibold capitalize md:text-2xl">
			Coming soon
		</p>
	</Tabs.Content>
</Tabs.Root>
