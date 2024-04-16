<script>
    import { onMount } from "svelte";


    export let currTime = null

    let controlButton;
    let playbackRateSelect;
    let player
    
    export function loadRemoteVideo(src){
        console.info("Loading remote video: " + src)
        currTime = null
        player.src = src
    }

    export function nudgeVideo(step)
    {
        if(player.currentTime)
            player.currentTime = player.currentTime + step; 
        console.log("nudge: currTime: " + player.currentTime)
    }

    export function pausePlay()
    {
        player.pause(); 
        console.log("pause: curTime: " + player.currentTime)
    }

    export function getCurrTime()
    {
        return player.currentTime
    }

    export function getDuration()
    {
        return player.duration
    }

    function handleKeys(event) 
    {
        let step=1.0
        switch (event.key) 
        {
            case "a":
                step=-0.1
                nudgeVideo(step);
                break;
            case "d":
                step=0.1
                nudgeVideo(step);
                break;
            case "s":
                step=-0.2
                nudgeVideo(step);
                break;
            case "w":
                step=0.2
                nudgeVideo(step);
                break;
        }
        
    }

    function register () {

        //-- Register listener for time updates
        player.addEventListener('time-update', () => {
                console.log("player: updating time to " + player.currentTime + "prev: " + currTime)
                currTime=player.currentTime
            });
            
    }
    

    onMount(() => {

            //Set default playback rate
            player.playbackRate = 0.5

            //Register callbacks
            register()
        }
    )


</script>

<!-- h-fit w-auto -->
<div class="h-fit w-auto flex flex-col rounded-lg overflow-hidden bg-black shadow">
    <!-- card cover -->   
    <media-player bind:this={player} 
                  title="Viewer"
                  keyShortcuts={{
                    // Space-separated list.
                    togglePaused: 'k Space',
                    toggleMuted: 'm',
                    toggleFullscreen: 'f',
                    togglePictureInPicture: 'i',
                    // Array.
                    seekBackward: ['j', 'J', 'ArrowLeft'],
                    seekForward: ['l', 'L', 'ArrowRight'],
                    volumeUp: 'ArrowUp',
                    volumeDown: 'ArrowDown',
                    speedUp: '>',
                    slowDown: '<',
                }}
                playbackRate={0.5}
    >
        <media-provider></media-provider>
        <media-video-layout></media-video-layout>
    </media-player>
    <!-- end card cover -->

    <!-- card footer -->
    <div class="grid grid-cols-6 px-6 py-4 bg-slate-500"> 
        <div class="col-span-5">
            <div class="flex justify-end space-x-2 w-full">
                <span class="font-bold">Playback Speed</span>
                <select class="bg-black text-white p-2"
                        bind:this={playbackRateSelect} 
                        on:change={()=>{
                                player.playbackRate=playbackRateSelect.value
                                console.log("Set playback to : " + playbackRateSelect.value)
                            }
                        }
                >
                    <option value="0.5"  selected="selected">0.5x</option>
                    <option value="1.0">1.0x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2.0">2.0x</option>
                    <option value="3.0">3.0x</option>
                </select>
            </div>
        </div>
    <!-- end card footer -->
    </div>
</div>

<svelte:window on:keydown={handleKeys}/>



<style>
</style>