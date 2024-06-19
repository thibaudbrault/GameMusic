<script lang="ts">
	import { page } from '$app/stores';
	import { Card } from '$components';
	import { scrollFn } from '$lib/utils';
	import { ArrowLeft, ArrowRight } from 'lucide-svelte';

	let scrollAreaLatest: HTMLElement | undefined;
</script>

<div class="space-y-2">
	<div class="flex items-center justify-between">
		<div class="flex items-baseline gap-2">
			<h2 class="text-2xl font-bold">Latest albums</h2>
			<a
				href="/album/latest"
				class="text-xs font-semibold text-gray-11 hover:underline">Show all</a
			>
		</div>
		<div class="flex gap-2">
			<button
				on:click={() => scrollFn(scrollAreaLatest, 'prev')}
				class="transition-all duration-300 ease-in-out disabled:text-gray-11 disabled:opacity-60"
			>
				<ArrowLeft />
			</button>
			<button
				on:click={() => scrollFn(scrollAreaLatest, 'next')}
				class="transition-all duration-300 ease-in-out disabled:text-gray-11 disabled:opacity-60"
			>
				<ArrowRight />
			</button>
		</div>
	</div>
	<div
		class="no-scrollbar flex w-full flex-nowrap gap-2 overflow-x-scroll"
		bind:this={scrollAreaLatest}
	>
		{#each $page.data.latestAlbums as album}
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
</div>
