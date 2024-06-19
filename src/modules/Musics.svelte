<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Button, Dropdown } from '$components';
	import {
		authors,
		cover,
		favoritesMusics,
		length,
		musics,
		trackId,
	} from '$lib/store';
	import { format, loadTrack, scrollIntoView } from '$lib/utils';
	import { AddToPlaylist, UpdateMusic } from '$modules';
	import { Heart, MoreHorizontal } from 'lucide-svelte';

	const handleClick = async (index: number) => {
		$trackId = index;
		$cover = $page.data.album.cover;
		$authors = $musics[$trackId].authors;
		scrollIntoView($trackId);
		loadTrack();
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'ArrowLeft') {
			if ($trackId > 0) {
				$trackId = $trackId - 1;
			} else {
				$trackId = $length - 1;
			}
		} else if (event.key === 'ArrowRight') {
			if ($trackId < $length - 1) {
				$trackId = $trackId + 1;
			} else {
				$trackId = 0;
			}
		}
		$cover = $page.data.album.cover;
		$authors = $musics[$trackId].authors;
		scrollIntoView($trackId);
		loadTrack();
	};

	const handleFavorite = (id: string) => {
		favoritesMusics.update((currentFavorites) => {
			const newFavorites = new Set(currentFavorites);
			if (newFavorites.has(id)) {
				newFavorites.delete(id);
			} else {
				newFavorites.add(id);
			}
			return newFavorites;
		});
	};
</script>

{#if $musics.length > 0}
	<div class="hidden space-y-2 md:block">
		{#each $musics as music, index}
			<div
				class={`flex w-full cursor-pointer items-center justify-between rounded-md p-2 ${$trackId === index ? 'bg-gray-12 text-gray-1' : 'hover:bg-grayA-5'}`}
			>
				{#if $page.data.user}
					<form
						method="post"
						use:enhance={() => {
							return ({ update }) => {
								update({ reset: false });
							};
						}}
						action="?/updateHistory"
						class="h-full w-full"
					>
						<input value={music.id} name="musicId" hidden />
						<input value={$page.data.profile.id} name="userId" hidden />
						<button
							id={`track-${index}`}
							on:click={() => handleClick(index)}
							on:keydown={handleKeyDown}
							class="flex h-full w-full flex-1 flex-col items-start gap-1"
						>
							<p class="text-left text-xl font-bold">{music.name}</p>
							<ul class="flex items-center gap-2">
								{#each music.authors as authors}
									<li class=" text-xs font-medium capitalize">
										{authors.author.name}
									</li>
								{/each}
							</ul>
						</button>
					</form>
				{:else}
					<button
						id={`track-${index}`}
						on:click={() => handleClick(index)}
						on:keydown={handleKeyDown}
						class="flex flex-1 flex-col items-start gap-1"
					>
						<p class="text-left text-xl font-bold">{music.name}</p>
						<ul class="flex items-center gap-2">
							{#each music.authors as authors}
								<li class=" text-xs font-medium capitalize">
									{authors.author.name}
								</li>
							{/each}
						</ul>
					</button>
				{/if}
				<div class="flex items-center gap-4">
					<p class="text-sm font-medium">{format(music.duration)}</p>
					{#if $page.data.session}
						{#if $favoritesMusics.has(music.id)}
							<form
								method="POST"
								use:enhance
								action="?/removeFavoriteMusic"
								on:submit={() => handleFavorite(music.id)}
							>
								<input value={music.id} name="musicId" hidden />
								<input value={$page.data.profile.id} name="userId" hidden />
								<Button
									intent="ghost"
									size="icon"
									class="text-red-500"
									type="submit"
								>
									<Heart class="fill-red-500" />
								</Button>
							</form>
						{:else}
							<form
								method="POST"
								use:enhance
								action="?/addFavoriteMusic"
								on:submit={() => handleFavorite(music.id)}
							>
								<input value={music.id} name="musicId" hidden />
								<input value={$page.data.profile.id} name="userId" hidden />
								<Button
									intent="ghost"
									size="icon"
									class="text-inherit"
									type="submit"
								>
									<Heart />
								</Button>
							</form>
						{/if}
					{/if}
					<Dropdown>
						<MoreHorizontal slot="trigger" />
						<svelte:fragment slot="content">
							{#each music.authors as authors}
								<a href={`/author/${authors.author.slug}`} class="triggerClass">
									{authors.author.name}
								</a>
							{/each}
							{#if $page.data.user}
								<AddToPlaylist musicId={music.id} />
							{/if}
							{#if $page.data.profile?.role === 'admin'}
								<UpdateMusic musicId={music.id} />
							{/if}
						</svelte:fragment>
					</Dropdown>
				</div>
			</div>
		{/each}
	</div>
	<div class="block md:hidden">
		{#each $musics as music, index}
			<div
				class={`flex w-full cursor-pointer items-center justify-between gap-1 rounded-md p-2 ${$trackId === index ? 'bg-gray-12 text-gray-1' : 'hover:bg-grayA-5'}`}
			>
				<button
					id={`track-${index}`}
					on:click={() => handleClick(index)}
					class="flex flex-1 flex-col items-start gap-1"
				>
					<p class="text-left font-bold">{music.name}</p>
					{#each music.authors as authors}
						<p
							class="flex flex-wrap items-center gap-2 text-xs font-medium capitalize"
						>
							{authors.author.name}
						</p>
					{/each}
				</button>
				<div class="flex items-center gap-8">
					<Dropdown>
						<MoreHorizontal slot="trigger" />
						<svelte:fragment slot="content">
							{#each music.authors as authors}
								<p class="font-semibold capitalize">
									{authors.author.name}
								</p>
							{/each}
						</svelte:fragment>
					</Dropdown>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<p
		class="col-span-5 py-4 text-center text-xl font-semibold capitalize md:text-2xl"
	>
		No music
	</p>
{/if}
