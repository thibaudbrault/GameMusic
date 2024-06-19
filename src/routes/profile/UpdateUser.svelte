<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Button, Form, TextInput } from '$components';
	import { updateUserSchema } from '$lib/validation';
</script>

<h2 class="text-3xl font-semibold text-yellow-12">
	{$page.data.profile.name}'s profile
</h2>
<div class="mt-24 flex flex-col items-center justify-center gap-8">
	<div class="rounded-md border border-gray-6 bg-gray-4 p-8">
		<Form
			action="?/updateUser"
			id="updateUser"
			data={$page.data.updateUserForm}
			schema={updateUserSchema}
			buttonText="Update"
			class="space-y-4"
			let:form
		>
			<fieldset class="flex flex-col gap-2">
				<input value={$page.data.profile.id} name="id" hidden />
				<TextInput
					{form}
					field="name"
					label="Name"
					placeholder={$page.data.profile.name}
				/>
			</fieldset>
		</Form>
		<hr class="my-8 h-px w-full border-transparent bg-yellow-6" />
		<form method="POST" use:enhance action="?/deleteUser">
			<Button
				intent="destructive"
				size="small"
				class="w-full font-semibold lowercase"
				style="font-variant: small-caps;">Delete account</Button
			>
		</form>
	</div>
</div>
