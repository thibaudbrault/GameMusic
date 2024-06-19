<script>
	import { page } from '$app/stores';
</script>

<div>
	{#each $page.data.history as history}
		<p>{history.music.name}</p>
	{/each}
</div>
