<script>
    import FieldPathAuto from "./FieldPathAuto.svelte";
    import Player from "./Player.svelte";
    import { gameData, autoEventList, videoMatch, matchSelect } from "../stores"
    import { onMount } from "svelte";
    import VideoPlayer from "./VideoPlayer.svelte";
    import ResultsForm from "./ResultsForm.svelte";
  
    //--------------
    // Helper functions
    //--------------
        async function fetchEventData() {
            console.info("Fetching event data: " + eventName)
            let response = await fetch('/data/events/event_' + eventName +'.json')
            matchInfo = await response.json()

            for (const [key, value] of Object.entries(matchInfo.quals)) {
                for ( let t of value["red"] )
                    teams.add(Number(t))
                for ( let t of value["blue"] )
                    teams.add(Number(t))
            }
            console.log("teams: " + teams.size)
            console.log(matchInfo)
            teams=teams;
        }

        function resetState(resetVideo=true) {
            console.log("Reseting state")
            fieldPath.reset()
            if(resetVideo)
                videoPlayer.loadRemoteVideo("")
        }

    //--------------
    // Annotaions
    //--------------
    let fieldPath
    let videoPlayer
    let alliance
    let timeFn
    let durationFn
    let time = null
    let startTime=null

    $: startTime = $videoMatch.StartTime
    $: alliance = $gameData.AllianceColor == 0? "blue" : "red"


    //--------------
    // Stream Management
    //--------------
	let matchInfo;
	let eventName;
    let matchNum
	let teams = new Set();

    onMount(() => {
            timeFn = videoPlayer.getCurrTime
            durationFn = videoPlayer.getDuration
        }
    )

    //----------------
    //  FORM
    //----------------
    let resultForm;

</script>
<svelte:head>
	<title>Video Annotation</title>
	<meta name="description" content="Video Annotation" />
</svelte:head>

<style>
  .inactive {
      background-color: #999999;
      color: #555555;
  }
</style>

<div class="flex w-full">
  <div class="flex-1 bg-black border-r-2 border-slate-800 p-4">
      <div class="grid grid-cols-2 justify-between mb-2 space-x-2">
          <button class="focus:outline-none text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-md px-5 py-2.5"
              on:click={()=>$gameData.AllianceColor=1}
              class:inactive="{alliance === "blue"}"
              >RED</button
          >
          <button class="focus:outline-none text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-md px-5 py-2.5"
              on:click={()=>$gameData.AllianceColor=0}
              class:inactive="{alliance === "red"}"
              >BLUE</button
          >
      </div>

      <VideoPlayer bind:this={videoPlayer} bind:currTime={time}/>
        <!-- {#await import('./VideoPlayer.svelte') then {default: VideoPlayer}}
        <svelte:component this={VideoPlayer} bind:this={videoPlayer}/>
        {/await} -->
  </div>
  <div class="flex-1 bg-black p-4">
    <div class="grid grid-cols-1 justify-center">
        <div class="flex justify-center space-x-2">
            <button class="focus:outline-none text-white bg-orange-700  font-medium  rounded-lg text-md px-5 py-2.5 mb-2 dark:bg-orange-600  disabled:bg-slate-200 disabled:text-slate-500 w-full"
                on:click={()=> {fieldPath.reset(); resultForm.clearMsg()}}
                disabled={$autoEventList.length==0}>Clear</button
            >
            <button class="focus:outline-none text-white bg-green-700  font-medium  rounded-lg text-md px-5 py-2.5 mb-2 dark:bg-green-600 disabled:bg-slate-200 disabled:text-slate-500 w-full"
                on:click={fieldPath.undo()}
                disabled={$autoEventList.length === 0}>Undo</button
            >
        </div>
        
        <FieldPathAuto  bind:this={fieldPath} 
                        bind:timeFn={timeFn} 
                        bind:durationFn={durationFn}
                        alliance={alliance}
                        canvasSize={{w:510, h:380}}/>

        {#if (time==null)}
            <span class="text-center w-full text-red-700"> [Warning: No Timing Information Avaialble]</span>
        {:else}
        <div class="flex">
            <span class="text-center w-full text-white"> 
                <b>Video: </b> 
                [start: <a on:click={  ()=>{ 
                                        if(time!==null && startTime>=0) 
                                            videoPlayer.seek(startTime)
                                        }
                                    }
                        >
                            {(time===null) ? "n/a" : parseFloat(startTime).toFixed(3)}
                        </a>, 
                 cur: {(time===null) ? "n/a" :  time.toFixed(3)}]
            </span>
            <span class="text-center w-full text-green-400"> 
                <b>Match time: </b> 
                [
                    {#if (time==null || startTime==null)}
                        <span class="text-red-500">n/a</span> 
                    {:else}
                        <span>{parseFloat(time-startTime).toFixed(3)}</span>
                    {/if}
                ] 
            </span>
        </div>
        {/if}
    </div>
  </div>
</div>

<ResultsForm bind:this={resultForm}
             bind:eventName={eventName} 
             bind:matchNum={matchNum}
             bind:autoPaths={$autoEventList}
             on:submitted={() => {console.log("received submitted event"); resetState(false)}}/>

<div class="flex justify-center w-full m-5 space-x-2">
	<select class="p-2" bind:value={eventName} on:change={fetchEventData}>
        <option disabled selected value> -- select event -- </option>
		<option value="2023hop">Houston (2023 Hopper)</option>
        <option value="local">Local</option>
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
							<a  href="#" 
                                class = "text-blue-600 hover:text-blue-800 visited:text-purple-600"
                                on:mousedown={()=> {
                                                        resetState(); 
                                                        videoPlayer.loadRemoteVideo(v); 
                                                        matchNum="Q"+key
                                                    }
                                                }
                            >
                                Link
                            </a>
						{/each}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}



