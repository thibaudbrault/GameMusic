<script lang="ts">
	import { dev } from '$app/environment';
	import { goto, invalidate } from '$app/navigation';
	import {
		audio,
		cover,
		currentTime,
		duration,
		isLoading,
		isPlayerOpen,
		isZen,
	} from '$lib/store';
	import { nextTrack } from '$lib/utils';
	import { Player, PlayerMobile } from '$modules';
	import { inject } from '@vercel/analytics';
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-sonner';
	import '../app.css';
	import Sidebar from './Sidebar.svelte';

	inject({ mode: dev ? 'development' : 'production' });

	let raf: number = 0;
	let innerWidth = 0;

	export let data;
	$: ({ session, supabase } = data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (!newSession) {
				setTimeout(() => {
					goto('/', { invalidateAll: true });
				});
			}
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<Toaster
	richColors
	position="top-center"
	toastOptions={{ style: 'font-weight: 600; font-size: 1.25rem;' }}
/>
<svelte:window bind:innerWidth />
<main
	class={`relative flex h-screen flex-col-reverse gap-y-4 bg-gray-1 p-4 text-gray-12 md:flex-row ${$isPlayerOpen ? 'md:pb-28' : ''}`}
>
	{#if !$isZen}
		<Sidebar />
		<section
			class="h-full w-full flex-1 overflow-y-auto rounded-md border border-gray-5 bg-gray-2 p-4"
		>
			<slot />
		</section>
		<div class="md:hidden">
			<h1 class="text-2xl font-bold">GameMusic</h1>
		</div>
	{:else}
		<div class="flex h-full w-full items-center justify-center">
			<img src={$cover} alt="" class={'size-96 rounded-md shadow-xl'} />
		</div>
	{/if}
	<audio
		src={$audio?.src}
		bind:this={$audio}
		bind:duration={$duration}
		bind:currentTime={$currentTime}
		on:canplay={() => ($isLoading = false)}
		on:ended={() => nextTrack()}
		hidden
	/>
	{#if $audio?.src && $isPlayerOpen}
		{#if innerWidth > 768}
			<Player {raf} />
		{:else}
			<PlayerMobile {raf} />
		{/if}
	{/if}
</main>
