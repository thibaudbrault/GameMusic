<script>
	import { page } from '$app/stores';
	import { Card } from '$components';
</script>

<ul class="flex flex-wrap justify-evenly gap-1 md:justify-around">
	{#each $page.data.game.albums as album}
		<li>
			<Card
				title={album.name}
				alt={album.name}
				cover={album.cover}
				release={album.release}
				game={$page.data.game.name}
				link={`/album/${album.slug}`}
			/>
		</li>
	{/each}
</ul>
