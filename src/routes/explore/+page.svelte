<script>
	import { onMount } from "svelte";
	let table;

</script>
<svelte:head>
	<title>Match Explorer</title>
	<meta name="description" content="Match Explorer" />
</svelte:head>

<!-- <form method="POST" action="getMatchInfo">
	<label class="text-yellow-200">
		Event Name: 
		<input name="eventName" type="text">
	</label>
</form> -->

<input
	type="text"
	on:keydown={async (e) => {
		if (e.key !== 'Enter') return;

		const input = e.currentTarget;
		const eventName = input.value;

		const response = await fetch('/api/bluealliance', {
			method: 'POST',
			body: JSON.stringify({ eventName }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		table.innerHTML = await response.text()
		input.value = ''
	}}
/>
<div bind:this={table}> 
</div>
