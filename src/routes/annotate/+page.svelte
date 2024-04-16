<script>
    import FieldPathAuto from "./FieldPathAuto.svelte";
    import Player from "./Player.svelte";
    import { gameData, autoEventList, videoMatch, matchSelect } from "../stores"
    import { onMount } from "svelte";
    import VideoPlayer from "./VideoPlayer.svelte";
  
    let fieldPath
    let videoPlayer
    let alliance
    let timeFn
    let durationFn
    let time = null
    let startTime=null

    $: startTime = $videoMatch.StartTime
    $: alliance = $gameData.AllianceColor == 0? "blue" : "red"

    onMount(() => {
            timeFn = videoPlayer.getCurrTime
            durationFn = videoPlayer.getDuration
            if ($matchSelect !== null ) {
                videoPlayer.loadRemoteVideo($matchSelect["videoUrl"])
            }
        }
    )

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
        <!-- {#await import('./Player.svelte') then {default: Player}}
        <svelte:component this={Player} bind:this={videoPlayer}/>
        {/await} -->
  </div>
  <div class="flex-1 bg-black p-4">
    <div class="grid grid-cols-1 justify-center">
        <button class="focus:outline-none text-white bg-green-700 hover:bg-green-800 font-medium  rounded-lg text-md px-5 py-2.5 mb-2 dark:bg-green-600 dark:hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-500 w-full"
            on:click={fieldPath.undo()}
            disabled={$autoEventList.length === 0}>Undo</button
        >

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
                <b>Video time: </b> 
                [start: {(time===null) ? "n/a" : parseFloat(startTime).toFixed(3)}, 
                 cur: {(time===null) ? "n/a" :  time.toFixed(3)}]</span>
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
