<script>
	import { Tabs } from 'bits-ui';
	import Albums from './Albums.svelte';
	import Header from './Header.svelte';
	import Authors from './Authors.svelte';
	import Home from './Home.svelte';

	const tabs = [
		{
			value: 'home',
			label: 'Home',
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

	let value = 'home';
</script>

<div class="space-y-4">
	<Header />
	<Tabs.Root bind:value class="space-y-4">
		<Tabs.List
			class="flex w-full items-center justify-start gap-4 border-b border-b-gray-6"
		>
			{#each tabs as tab}
				<Tabs.Trigger
					value={tab.value}
					class="border-b-2 border-transparent px-2 py-1 text-base font-semibold lowercase text-gray-11 data-[state=active]:border-yellow-9 data-[state=active]:text-gray-12 md:text-xl"
					style="font-variant: small-caps;"
				>
					{tab.label}
				</Tabs.Trigger>
			{/each}
		</Tabs.List>
		<Tabs.Content value="home">
			<Home />
		</Tabs.Content>
		<Tabs.Content value="albums">
			<Albums />
		</Tabs.Content>
		<Tabs.Content value="artists">
			<Authors />
		</Tabs.Content>
	</Tabs.Root>
</div>
