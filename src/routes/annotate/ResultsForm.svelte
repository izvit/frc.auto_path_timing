<script>
  	import { createEventDispatcher } from 'svelte'

	export let eventName = null
	export let teamNum  = null
	export let matchId = null
	export let autoPaths = []
	
	const dispatch = createEventDispatcher()

	let teamInput;
	let eventInput;
	let matchInput;
	let formMsg="";

	export function clearMsg(){
		formMsg=""
	}

	function setMessage(msg){
		formMsg=msg
	}

	function isNumber(value) {
		return typeof value === 'number';
	}
	async function saveForm () {
		const serverUri = 'http://localhost:5000/autopaths'
		const res = await fetch(serverUri, {
			mode: 'cors',
			method: 'POST',
			body: JSON.stringify({	"event":eventName, 
									"team":teamNum, 
									"match": matchId,
									"autopaths": autoPaths
								 }, 
								 (k, v) => {
									if(k=="prevEvent" || k=="pos" ) 
										return undefined; 
									else 
										return v;
								}),
			headers: {
				'Access-Control-Allow-Origin':'*',
				'Content-Type': 'application/json'
			}
		}).catch((err) => {
			console.error("Error: " + err.message)
			setMessage("Unable submit match data (server: " + serverUri + ")")
		})
	}

	async function submit(){
		if (!eventName || eventName.length == 0) {
			formMsg="Event name must not be empty"
			return;
		}

		if (!teamNum || !isNumber(teamNum)) {
			formMsg="Team number must be numeric"
			return;
		}
		
		const regex = /^[XQExqe]\d+$/;
		if (!matchId || !matchId.match(regex)) {
			formMsg="Invalid match id.  Must start with Q or E and be followed by a number."
			return;
		}
		matchId = matchId.toUpperCase()
		formMsg=""
		await saveForm()

		dispatch('submitted', {"matchNum" : matchId})
		matchId=""
		teamNum=""
		
	}
	
</script>

<div class="flex flex-col w-full p-2">
	<form class="flex justify-center w-full space-x-2 p-2" on:submit|preventDefault={submit}>
		<input bind:this={eventInput} bind:value={eventName} placeholder="Name of event" type="text"/>
		<input bind:this={teamInput} bind:value={teamNum} placeholder="Team number" type="number"/>
		<input bind:this={matchInput} bind:value={matchId} placeholder="Match (e.g Q1, E2)"  type="text"/>
		<input bind:this={autoPaths} bind:value={autoPaths} type="hidden"/>
		<button class="bg-slate-300 w-37 p-1" type="submit" on:submit={submit}>
			Submit
		</button>
		<button class="bg-slate-300 w-27 p-1" on:click={()=>{matchInput.value=""; teamInput.value=""} }>
			Clear
		</button>
	</form>
	<p class="text-red-400 w-full text-center">{formMsg}</p>
</div>