<script>
	import { onMount } from "svelte";
	import { matchSelect } from "../stores"
	
	let resp;
	let matchInfo;
	let eventName;
	let teamNumber;
	let teams = new Set();
	let teamSorted;

	$: teamSorted =  Array.from(teams).sort()
	$: if(resp) {
		matchInfo = resp
	}
 
	async function fetchEventData() {
		let response = await fetch('/data/events/event_' + eventName +'.json')
		resp = await response.json()

		for (const [key, value] of Object.entries(resp.quals)) {
			for ( let t of value["red"] )
				teams.add(Number(t))
			for ( let t of value["blue"] )
				teams.add(Number(t))
		}
		console.log("teams: " + teams.size)
		console.log(resp)
		teams=teams;
	}

	onMount(async () => {
		fetchEventData()
	})

</script>
<svelte:head>
	<title>Match Explorer</title>
	<meta name="description" content="Match Explorer" />
</svelte:head>

<div class="flex justify-center w-full m-5 space-x-2">
	<select class="p-2" bind:value={eventName} on:change={fetchEventData}>
		<option value="2023hop">Houston (2023 Hopper)</option>
	</select>
	<!-- <select class="p-2" bind:value={teamNumber} >
		{#each teamSorted as t}
			<option value="{t}">{t}</option>
		{/each}
	</select> -->
</div>

{#if (matchInfo!=null)}
	<table class="bg-white md:w-[60%] mx-auto text-center">
		<thead>
			<tr>
				<th>Match</th>
				<th>Red</th>
				<th>Blue</th>
				<th>Videos</th>		
			</tr>
		</thead>
		<tbody>
			{#each Object.entries(matchInfo["quals"]) as [key, value], i}
				<tr class="{(i%2==0)? "bg-slate-200" : "bg-white" }">
					<td>
						Q{key}
					</td>
					<td>
						{value["red"]}
					</td>
					<td>
						{value["blue"]}
					</td>
					<td class="flex-1">
						{#each value["videos"] as v}
							<a href="/annotate" on:mousedown={()=>$matchSelect["videoUrl"]=v}>Link</a>
						{/each}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}


