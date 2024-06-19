<script lang="ts">
	export let title: string;
	export let alt: string;
	export let cover: string;
	export let link: string;
	export let release: number;
	export let game: string;
</script>

<div
	class="flex w-32 flex-shrink-0 flex-col justify-center rounded-md p-4 transition-all duration-300 ease-in-out hover:bg-gray-4 sm:w-40 md:w-44 lg:w-52"
>
	<img
		{alt}
		src={cover}
		class="size-24 rounded-md sm:size-32 md:size-36 lg:size-44"
	/>
	<h3 class="truncate font-semibold">
		{#if link}
			<a class="text-sm hover:text-yellow-12" href={link}>{title}</a>
		{/if}
		{#if $$slots.form}
			<slot name="form" />
		{/if}
	</h3>
	<div class="hidden space-x-1 md:block">
		<small class="text-xs text-gray-11">{release}</small>
		<span class="font-bold text-gray-11">·</span>
		<small class="text-xs text-gray-11">{game}</small>
	</div>
</div>
