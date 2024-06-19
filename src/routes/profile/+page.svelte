<script lang="ts">
	import { Tabs } from 'bits-ui';
	import UpdateUser from './UpdateUser.svelte';
	import History from './History.svelte';

	const tabs = [
		{
			value: 'user',
			label: 'User',
		},
		{
			value: 'history',
			label: 'History',
		},
	];

	let value = 'user';
</script>

<Tabs.Root bind:value class="mt-4 space-y-8 md:mt-0">
	<div class="flex flex-col gap-4">
		<h2 class="text-3xl font-bold capitalize md:text-4xl">{value}</h2>
		<Tabs.List class="flex w-full gap-4 border-b border-b-gray-6">
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
	</div>
	<Tabs.Content value="user">
		<UpdateUser />
	</Tabs.Content>
	<Tabs.Content value="history">
		<History />
	</Tabs.Content>
</Tabs.Root>
