<script>
    import { writable } from "svelte/store";
    import { onMount } from "svelte";

    import { ContextMenu, ContextMenuItem, MenuItemShape, FieldElementTypes,
            GameField, FieldImageConfig, config_blue_2024, config_red_2024} from "./field"
    import { getMousePos, drawCircle, Colors, AllianceColor } from "./field_utils"
    import { createEventDispatcher } from 'svelte'
    import { gameData, autoEventList, videoMatch } from "../stores"
    import * as events from "./field_events"


    export let alliance = AllianceColor.blue
    export let canvasSize={w:610, h:470}
    export let timeFn = () => null
    export let durationFn = () => null

    //-- Component-specific variables
      let canvas;
      let ctx;
      let gameField;
      let fieldConfig;


    //-- External events
      const dispatch = createEventDispatcher();

    //-- Component state
      let currEvent = ($autoEventList.length>0) ? $autoEventList.slice(-1)[0] : null
      let currPos = (currEvent) ? currEvent.pos : null
      let contextMenu = null;
      let loaded = writable();
      loaded = false;
  
    //-- Setup event handlers
      onMount(() => {
        ctx = canvas.getContext("2d");
        canvas.addEventListener("mousedown", mouseDownHandler);
        canvas.addEventListener("mousemove", mouseMoveHandler);
        canvas.addEventListener("mouseup", mouseUpHandler);    
  
        canvas.addEventListener("touchstart", touchStartHandler);   
        canvas.addEventListener("touchmove", touchMoveHandler);   
        canvas.addEventListener("touchend", touchEndHandler);
        loaded = true

        console.log("Start at load:" + $videoMatch.StartTime)
      });
      
    

    $: if(alliance && loaded===true) setAlliance(alliance)

    function setAlliance(alliance){

      if(ctx){
        gameField = new GameField(ctx, canvas.width, canvas.height, alliance)


        if(alliance==AllianceColor.blue){
          fieldConfig = FieldImageConfig.from(config_blue_2024)
        }
        else {
          fieldConfig = FieldImageConfig.from(config_red_2024)
        }

        fieldConfig.setDims(canvas.width, canvas.height)
        console.log(fieldConfig)
        renderEvents()
      }
    }

    //-----------------------------
    //  Game Event Helpers
    //------------------------------
  
      /**
       * Enum representing whether robot is holding a note
       */
      const RobotState = {
        full: "full",
        empty : "empty"
      }
  
      /**
       * Add point to the event queue
       * @param  {[{x,y}] pos } position of mouse event
       */
        function addMoveEvent(pos) {
            // Update position
            if(currPos==null){
                const init = new events.InitEvent(pos) 
                addGameEvent(init);
            }
            else{
                currPos = pos;
                const m = new events.MoveEvent(currPos) 
                addGameEvent(m);
            }
        }
  
        /**
         * Add point to the event queue (TODO: refactor to handler class with callbacks)
         * @param  {[events.GameEventType] e }
         */
        function addGameEvent(e) {
            
          console.log("Start time game event:" + $videoMatch.StartTime + " checkingTime: " + timeFn())
          if(currEvent==null && e.name!=events.GameEventType.init){
                console.log("Unexpected event (" + e.name + "). Expecting init event.")
                return
          }

          //-- Handle time information
            let currTime = timeFn() 
            let duration = durationFn()
            console.log("currTime: " + currTime + " duration: " + duration)
            if(currTime !== null && duration!==null && duration > 0)
            {
              let startTime = $videoMatch.StartTime

              if(startTime==null && e.name!=events.GameEventType.init){
                  console.error("Unexpected: Start time has not been initialized")
                  return
              }

              if(e.name==events.GameEventType.init)
              {
                $videoMatch.StartTime = currTime
                console.log("Setting start time: " +  $videoMatch.StartTime)
              }

              console.log("time: " + timeFn() + "rel_time: " + (currTime - $videoMatch.StartTime))
              e.time = currTime - $videoMatch.StartTime

            }

          //-- Handle event list
            let history_len = $autoEventList.length;
            if(history_len>0)
                e.prevEvent = $autoEventList[history_len-1];
              

            $autoEventList.push(e)
            $autoEventList=$autoEventList
            console.log(JSON.stringify($autoEventList, 
                                      (k, v) => {
                                                  if(k=="prevEvent") 
                                                    return undefined; 
                                                  else 
                                                    return v;
                                                }
                                      )
                        )
  
          //-- Update states
            currEvent = e
            currPos = e.pos

          //-- Update normalized coordinates (refactor to be done in event factory?)
            e.setNormPos(fieldConfig.getNormCoord(e.pos.x, e.pos.y))
            if(e.name==events.GameEventType.init){
                //Divide height into 7 equal zones and assign starting zone position based on location
                //NOTE: Might make sense to store the x,y instead
                $gameData.StartPosition = (e.npos.y+1)/2 * 7
            }

          console.log("Added  event [e: "+ e + "]");
          console.log(e)
          

          //-- Update displays
            updateField(e) 
            updatePoints(e)
            renderEvents()
        }

        /**
         * Update field elements based on event
         * NOTE: Needs refactored to remove if/else structure
         * @param {events.GameEvent} event Most recent event
         * @param {boolean} undo Flag indicating that this is an undo operation
         */
        function updateField(event, undo=false){
            console.log("Updating field: " + event)
            switch(event.name){
              case events.GameEventType.pickup:
              case events.GameEventType.failPickup:
                  if(!undo){
                    let item = gameField.select(event.pos);
                    console.log("item: " + item)

                    if (item && item.type == FieldElementTypes.note){
                        console.log("Disabling note: " + item.id)
                        gameField.disable(item.id)
                        event.setId(item.id)
                      
                    }
                  }
                  else {
                    if(event.noteId!==undefined)
                      gameField.enable(event.noteId)
                  }
                  break;
            }


        }

        /**
         * Function to update game scoring based on game event
         * NOTE: Needs refactored to remove if/else structure
         * @param {events.GameEvent} event
         * @param {boolean} undo
         */
        function updatePoints(event, undo=false) {
            console.log("Updating events: " + event)

            if (event.name=="scoreAmp"){
                if(undo)
                    $gameData.AutoAmpNoteSuccess--;
                else
                    $gameData.AutoAmpNoteSuccess++;

            }        
            else if (event.name=="scoreSpeaker"){
                if(undo)
                    $gameData.AutoSpeakerNoteSuccess--;
                else
                    $gameData.AutoSpeakerNoteSuccess++;

            }
            else if (event.name=="missSpeaker"){
                if(undo)
                    $gameData.AutoSpeakerNoteFail--;
                else
                    $gameData.AutoSpeakerNoteFail++;

            }
            else if (event.name=="missAmp"){
                if(undo)
                    $gameData.AutoAmpNoteFail--;
                else
                    $gameData.AutoAmpNoteFail++;

            }

        }
  
        /**
         * Remove last game event added to queue
         * NOTE: This function must be able to unroll
         * all of the robot state to work correctly
         */
        export function undo() {
            updatePoints(currEvent, true)
            updateField(currEvent, true)
            $autoEventList= $autoEventList.slice(0, -1);
            $autoEventList=$autoEventList
 
            let history_len= $autoEventList.length;
            if(history_len>0){
                currEvent = $autoEventList[history_len-1];
                currPos = currEvent.pos
            }
            else{
                currEvent=null;
                currPos=null;
                $videoMatch.StartTime=null;
            }
            
            renderEvents()
        }

    //-----------------------------
    //  Combined logic for touch and mouse events
    //------------------------------
      /**
       * Logic for when a down event (mouse or touch) is detected
       * @param pos Location of event
       */
      function downEvent(pos){

        dispatch("fieldEventPos", pos)

        let nitems=8
        let shape = MenuItemShape.circ
        contextMenu = new ContextMenu(ctx, pos, nitems)
        
        //-- Proposed
        contextMenu.addItem(new ContextMenuItem(() => {addGameEvent(new events.PickupEvent(pos))}, Colors.orange, null, shape))
        contextMenu.addItem(new ContextMenuItem(() => {addGameEvent(new events.SpeakerScoreEvent(pos))}, Colors.green, null, shape))
        contextMenu.addItem(new ContextMenuItem(() => {addGameEvent(new events.DropEvent(pos))}, Colors.black, null, shape))
        contextMenu.addItem(new ContextMenuItem(() => { addGameEvent(new events.PickupEvent(pos)); 
                                                        addGameEvent(new events.SpeakerScoreEvent(pos))}, 
                                                Colors.green, 
                                                Colors.darkorange, shape))
        contextMenu.addItem(new ContextMenuItem(() => { addGameEvent(new events.PickupEvent(pos)); 
                                                        addGameEvent(new events.SpeakerMissEvent(pos))}, 
                                                Colors.red, 
                                                Colors.darkorange, shape))
        
        contextMenu.addItem(new ContextMenuItem(() => {}, Colors.gray, null, shape))
        contextMenu.addItem(new ContextMenuItem(() => {addGameEvent(new events.SpeakerMissEvent(pos))}, Colors.red, null, shape))
        contextMenu.addItem(new ContextMenuItem(() => {addGameEvent(new events.PickupFailEvent(pos))}, Colors.black, Colors.orange, shape))
        

        
        addMoveEvent(pos); 
      }
  
      /**
       * Logic for when a up event (mouse or touch) is detected
       * @param pos Location of event
       */
      function upEvent(pos){
        if(contextMenu!=null)
        {
          contextMenu.run()
        }
  
        contextMenu = null;
        renderEvents();
      }

  
      /**
       * Logic for when a move event (mouse or touch) is detected
       * @param pos Location of event
       */
      function moveEvent(pos){
        if(contextMenu!=null) {   
          console.log("Move position:" + pos)
          contextMenu.highlight(pos)   
        }  
      }
  
    //-----------------------------
    //  Mouse event handler 
    //------------------------------
    
      function mouseDownHandler(e) {
        console.log("Mouse down");
        var pos = getMousePos(canvas, e);
        downEvent(pos)
      }
  
      function mouseUpHandler(e) {
        console.log("Mouse up");
        var pos = getMousePos(canvas, e);
        upEvent(pos)
      }
  
      function mouseMoveHandler(e) {
        console.log("Mouse move");
        let pos = getMousePos(canvas, e)
        moveEvent(pos)
      }
  
    //-------------------------
    //  Touch event handlers
    //-------------------------
  
      function touchStartHandler(e) {
        console.log("Started touch")
        e.preventDefault(); 
        console.log(e)
        
        var pos = getMousePos(canvas, e.touches[0])
        downEvent(pos)
      }
  
      function touchMoveHandler(e) {
        console.log("Move touch")
        e.preventDefault();
        let pos = getMousePos(canvas, e.touches[0])
        moveEvent(pos)  
      }
  
      function touchEndHandler(e) {
        console.log("End touch")
        e.preventDefault();
        mouseUpHandler(e)
      }
  
  
    //-------------------------
    //  Rendering 
    //-------------------------
  
      /**
       * Event specific rendering functions
       */
      let drawFun = {
        "move" : (e) => {
                    ctx.beginPath();
                    ctx.strokeStyle = Colors.white
                    ctx.lineWidth = 2
                    ctx.moveTo(e.prevEvent.pos.x, e.prevEvent.pos.y);
                    ctx.lineTo(e.pos.x, e.pos.y);
                    ctx.stroke();
                  },
        "pickup" : (e)=> {
                      drawCircle(ctx, e.pos, Colors.orange, 10, Colors.darkorange);
                  },
        "failPickup" : (e)=> {
                      drawCircle(ctx, e.pos, Colors.orange, 10, Colors.black);
                  },
        "drop" : (e)=> {
                      drawCircle(ctx, e.pos, Colors.black, 10);
                  },
        "scoreSpeaker" : (e)=> {
                      drawCircle(ctx, e.pos, Colors.green, 10);
                  },
        "missSpeaker" : (e)=> {
                      drawCircle(ctx, e.pos, Colors.red, 10);
                  },
        "scoreAmp" : (e)=> {
                      drawCircle(ctx, e.pos, Colors.blue, 10);
                  },
        "missAmp" : (e)=> {
                      drawCircle(ctx, e.pos, Colors.burgundy, 10);
                  },
        "init" : (e)=> {
                      drawCircle(ctx, e.pos, Colors.cyan, 10);
                  }
      }
  
  
      /**
       * Redraws all events on the canvas.
       * NOTE: This function should be called any time any
       * display element changes
       */
      function renderEvents() {
  
        let i=0;
        ctx.clearRect(0, 0, canvas.width, canvas.height)
  
        if (gameField!==undefined)
        {
          gameField.draw()

          console.log($autoEventList)
          $autoEventList.forEach(
              el => {
                  drawFun[el.name](el)
                  i++;
              }
          )
    
          if(contextMenu!=null){
            console.log("Drawing menu")
            contextMenu.draw()
          }
        }
      }
  
  </script>
  
  <style>
    canvas {
      border: 1px solid white;
    }

    .red_bg {
      background: url("/images/2024-field-red.png");
      background-size: 100% 100%;
    }

    .blue_bg {
      background: url("/images/2024-field-blue.png");
      background-size: 100% 100%;
    }

  </style>
  

  <div class="flex justify-center">
      <canvas 
      bind:this={canvas}
      class:blue_bg={alliance === "blue"}
      class:red_bg={alliance === "red"}
      width={canvasSize.w}
      height={canvasSize.h}
      />
  </div>

  