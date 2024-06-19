<script lang="ts">
	import { page } from '$app/stores';

	const pluralize = (count: number) => {
		if (count === 1) {
			return 'music';
		} else return 'musics';
	};
</script>

<div class="space-y-2 divide-y divide-gray-6">
	{#each $page.data.authors as author}
		<a
			href={`/author/${author.slug}`}
			class="group flex items-center justify-between p-2"
		>
			<p class="text-xl font-semibold group-hover:text-yellow-12">
				{author.name}
			</p>
			<p class="text-sm text-gray-11">
				{author.musicsCount}
				{pluralize(author.musicsCount)}
			</p>
		</a>
	{/each}
</div>
