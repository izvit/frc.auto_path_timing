<script>
	import { onMount } from "svelte";

	

	onMount(async function () {
		let response = fetchEvent("2023hop")
		console.log(response.json())
	})
	

</script>
<svelte:head>
	<title>Match Explorer</title>
	<meta name="description" content="Match Explorer" />
</svelte:head>

<form method="POST" action="?/getMatchInfo">
	<label class="text-yellow-200">
		Event Name: 
		<input name="eventName" type="text">
	</label>
</form>