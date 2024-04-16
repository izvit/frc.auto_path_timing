<script>
	import { onMount } from "svelte";
	
	let resp;
	let rows;

	$: if(resp) rows = resp


</script>
<svelte:head>
	<title>Match Explorer</title>
	<meta name="description" content="Match Explorer" />
</svelte:head>

<input
	type="text"
	value="2023hop"
	on:keydown={async (e) => {
		if (e.key !== 'Enter') return;

		const input = e.currentTarget;
		const eventName = input.value;

		let response = await fetch('/api/bluealliance', {
			method: 'POST',
			body: JSON.stringify({ eventName }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		resp = await response.json()
		console.log(resp)
		input.value = ''
	}}
/>


{#if (rows!=null)}
	<table class="bg-white">
		<thead>
			<tr>
				<th>Video</th>
				<th>Team0</th>
				<th>Team1</th>
				<th>Team2</th>
				<th>Team0</th>
				<th>Team1</th>
				<th>Team2</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as {videoUrl, red0, red1, red2, blue0, blue1, blue2}}
				<tr>
					<td>
						<a href="{videoUrl}" class="font-medium text-yellow-600 dark:text-yellow-500 hover:underline">Video</a>
					</td>
					<td>
						<a href="{red0.uri}" class="font-medium text-red-600 dark:text-red-500 hover:underline">{red0.number}</a>
					</td>
					<td>
						<a href="{red1.uri}" class="font-medium text-red-600 dark:text-red-500 hover:underline">{red1.number}</a>
					</td>
					<td>
						<a href="{red2.uri}" class="font-medium text-red-600 dark:text-red-500 hover:underline">{red2.number}</a>
					</td>
					<td>
						<a href="{blue0.uri}" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">{blue0.number}</a>
					</td>
					<td>
						<a href="{blue1.uri}" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">{blue0.number}</a>
					</td>	
					<td>
						<a href="{blue2.uri}" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">{blue0.number}</a>
					</td>						
				</tr>
			{/each}
		</tbody>
	</table>
{/if}


