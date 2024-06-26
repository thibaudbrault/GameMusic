<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Button, Dropdown } from '$components';
	import type { SelectAlbum } from '$lib/db';
	import { favoritesAlbums, isPlaying } from '$lib/store';
	import { calculateTotalDuration, formatTotalDuration } from '$lib/utils';
	import { AddMusic, DeleteMusics } from '$modules';
	import { Heart, MoreHorizontal } from 'lucide-svelte';
	import { onMount } from 'svelte';

	const handleFavorite = (id: string) => {
		favoritesAlbums.update((currentFavorites) => {
			const newFavorites = new Set(currentFavorites);
			if (newFavorites.has(id)) {
				newFavorites.delete(id);
			} else {
				newFavorites.add(id);
			}
			return newFavorites;
		});
	};

	onMount(() => {
		$page.data.favoritesAlbums.forEach((album: SelectAlbum) => {
			favoritesAlbums.update((current) => current.add(album.id));
		});
	});
</script>

<div class="flex flex-col items-center gap-4 p-4 sm:flex-row">
	<div
		class="relative max-w-52 rounded-full border border-gray-5 sm:size-28 md:size-40 lg:size-52"
	>
		<img
			src={$page.data.album.cover}
			alt={$page.data.album.name}
			class={`h-full w-full rounded-full ${$isPlaying ? 'animate-spin-slow' : ''}`}
		/>
		<div class="absolute inset-0 rounded-full bg-gray-1 opacity-15" />
	</div>
	<div class="flex flex-1 flex-col justify-end gap-4">
		<div class="flex flex-col gap-1">
			<div
				class="flex justify-center text-sm font-semibold capitalize text-yellowA-11 sm:justify-start"
			>
				<small>
					{$page.data.game}
				</small>
				<small class="before:mx-2 before:font-bold before:content-['·']">
					{$page.data.album.release}
				</small>
			</div>
			<h1
				class="text-center text-3xl font-bold sm:text-left md:text-5xl lg:text-6xl"
			>
				{$page.data.album.name}
			</h1>
		</div>
		<div class="flex items-center justify-between text-sm sm:text-base">
			<ul class="flex gap-2 text-gray-11 sm:gap-0">
				<li>{$page.data.likes} likes</li>
				<li class="sm:before:mx-2 sm:before:font-bold sm:before:content-['·']">
					{$page.data.length} titles
				</li>
				<li class="sm:before:mx-2 sm:before:font-bold sm:before:content-['·']">
					{formatTotalDuration(calculateTotalDuration($page.data.musics))}
				</li>
			</ul>
			<div class="flex gap-2">
				{#if $page.data.session}
					{#if $favoritesAlbums.has($page.data.album.id)}
						<form
							method="POST"
							use:enhance
							action="?/removeFavoriteAlbum"
							on:submit={() => handleFavorite($page.data.album.id)}
						>
							<input value={$page.data.album.id} name="albumId" hidden />
							<input value={$page.data.profile.id} name="userId" hidden />
							<Button intent="ghost" size="icon" class="text-red-500">
								<Heart class="fill-red-500" />
							</Button>
						</form>
					{:else}
						<form
							method="POST"
							use:enhance
							action="?/addFavoriteAlbum"
							on:submit={() => handleFavorite($page.data.album.id)}
						>
							<input value={$page.data.album.id} name="albumId" hidden />
							<input value={$page.data.profile.id} name="userId" hidden />
							<Button intent="ghost" size="icon">
								<Heart />
							</Button>
						</form>
					{/if}
				{/if}
				{#if $page.data.user && $page.data.profile.role === 'admin'}
					<Dropdown>
						<MoreHorizontal slot="trigger" />
						<svelte:fragment slot="content">
							<AddMusic />
							<DeleteMusics />
						</svelte:fragment>
					</Dropdown>
				{/if}
			</div>
		</div>
	</div>
</div>
