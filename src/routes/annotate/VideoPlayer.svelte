<script>
    import { onMount } from "svelte";
    import {autoVideoBase64} from "../stores"

    export let currTime = null

    let controlButton;
    let playbackRateSelect;
    let videoLive;
    let videoPlayer
    let recording=false
    let viewing=true

    var mediaRecorder;
    

    function loadVideo (base64String){
        let dataStartInd = base64String.indexOf("base64") //Remove codec info (unsupported)
        videoPlayer.src = {src: "data:video/webm;" + base64String.substring(dataStartInd), type: "video/webm"} 
    }
    
    // stop both mic and camera
    function stopBothVideoAndAudio(stream) {
        stream.getTracks().forEach((track) => {
            if (track.readyState == 'live') {
                track.stop();
            }
        });
    }

    export function nudgeVideo(step)
    {
        videoPlayer.currentTime = videoPlayer.currentTime + step; 
        console.log("nudge: currTime: " + videoPlayer.currentTime)
    }

    export function pausePlay()
    {
        videoPlayer.pause(); 
        console.log("pause: curTime: " + videoPlayer.currentTime)
    }

    export function continuePlay()
    {
        if(!videoPlayer.ended) 
            videoPlayer.play()
    }

    export function getCurrTime()
    {
        return videoPlayer.currentTime
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

        //-- Register listner for time updates
        videoPlayer.addEventListener('time-update', () => {
                currTime=videoPlayer.currentTime
            });

        //-- Register listner for record event
        controlButton.addEventListener('click', async () => {
            if(viewing==true){
                const stream = await navigator.mediaDevices.getUserMedia({ 
                                video: { frameRate: { ideal: 10 } },
                                audio: true,
                                })
        
                videoLive.srcObject = stream
            
                if (!MediaRecorder.isTypeSupported('video/webm')) { 
                    console.warn('video/webm is not supported')
                    }
            
                mediaRecorder = new MediaRecorder(stream, { 
                                                    mimeType: 'video/webm',
                                                    })
                recording=true
                viewing=false
                videoLive.play()
                mediaRecorder.start()

                mediaRecorder.addEventListener('dataavailable', event => {   
                    var reader = new FileReader();
                    reader.readAsDataURL(event.data); 
                    //Only necessaary for base64
                    reader.onloadend = function() {
                        $autoVideoBase64 = reader.result;
                        loadVideo(reader.result)
                    }       
                })

            }
            else {
                recording=false
                viewing=true
                videoLive.pause()
                stopBothVideoAndAudio(videoLive.srcObject)
                mediaRecorder.stop()
            }
            }) 
        
    }

    onMount(() => {

            //Load existing video if it has already been captured
            if ($autoVideoBase64.length>0) {
                loadVideo($autoVideoBase64)
            }

            //Set default playback rate
            videoPlayer.playbackRate = 0.5

            //Register callbacks
            register()
        }
    )


</script>


<div class="h-fit w-auto flex flex-col rounded-lg overflow-hidden bg-black shadow">
    <!-- card cover -->   
    <media-player bind:this={videoPlayer} class:recording title="Viewer">
        <media-provider></media-provider>
        <media-video-layout></media-video-layout>
    </media-player>

    <video class="object-cover"  class:viewing muted bind:this={videoLive} ></video>
    <!-- end card cover -->

    <!-- card footer -->
    <div class="grid grid-cols-6 px-6 py-4 bg-slate-500"> 
        <div class="col-span-3">
            Playback Speed
        </div>
        <div class="col-span-2">
            <select  bind:this={playbackRateSelect} on:change={()=>{videoPlayer.playbackRate=playbackRateSelect.value}}>
            <option value="0.5"  selected="selected">0.5x</option>
            <option value="1.0">1.0x</option>
            <option value="1.5">1.5x</option>
            <option value="2.0">2.0x</option>
            </select>
        </div>
        <div class="col-span-1">
            <button type="button" class="bg-blue-600 hover:bg-blue-700 py-2 px-2 text-sm font-medium text-white border border-transparent rounded-lg focus:outline-none" bind:this={controlButton}>
                {#if viewing==true}
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="15" fill="red" />
                    </svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                        <line x1="15"  y1="10" x2="15" y2="30" style="stroke:white;stroke-width:4" />
                        <line x1="25"  y1="10" x2="25" y2="30" style="stroke:white;stroke-width:4" />
                    </svg>
                {/if}
            </button>

        </div>
    <!-- end card footer -->
    </div>
</div>

<svelte:window on:keydown={handleKeys}/>



<style>
    .recording {
        display: none
    }
    .viewing {
        display: none
    }

    button {
        border-style: solid;
        border: 2px solid rgb(240, 221, 9);
    }
    select {
        background-color:#000;
        border-style: solid;
        border: 2px solid rgb(255, 255, 255);
        margin: 2px 2px 2px 2px;
        color:#FFF;
    }
    select * {
        background-color:#000;
        color:#FFF;
    }
</style>