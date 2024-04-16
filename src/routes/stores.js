import { writable } from 'svelte/store';
 
 //-- Stores
 export const autoVideoBase64 = writable("")
 export const autoEventList = writable([])
 export const matchSelect = writable ({
    "eventName" : null,
    "id" : null,
    "videoUrl" : null,
 }
 )

 export const gameData = writable({
     AllianceColor: 0,
     ReversedAlliance: 0,
     StartPosition: 0,
     Leave: 0,
     AutoSpeakerNoteSuccess: 0,
     AutoSpeakerNoteFail: 0,
     AutoAmpNoteSuccess: 0,
     AutoAmpNoteFail: 0,
     TeleSpeakerNoteSuccess:0,
     TeleSpeakerNoteFail: 0,
     TeleAmpNoteSuccess: 0,
     TeleAmpNoteFail: 0,
     TeleTrapNoteSuccess: 0,
     TeleTrapNoteFail: 0,
     TeleOnstage: 0,
     AutoPreLoadedNoteCollect: 0,
     AutoFloorSpike0NoteCollect: 0,
     AutoFloorSpike1NoteCollect: 0,
     AutoFloorSpike2NoteCollect: 0,
     AutoFloorCenterline0NoteCollect: 0,
     AutoFloorCenterline1NoteCollect: 0,
     AutoFloorCenterline2NoteCollect: 0,
     AutoFloorCenterline3NoteCollect: 0,
     AutoFloorCenterline4NoteCollect: 0,
     TelePreLoadedNoteCollect: 0,
     TeleFloorNoteCollect: 0,
     TeleSourceNoteCollect: 0,
     AutoNoteDrop: 0,
     TeleNoteDrop: 0,
     CoopertitionBonus: 0,
     Harmony: 0,
     PlayingDefenseDuration: 0,
     UnderDefenseDuration: 0,
     Park: 0,
     Points: 0,
     Penalties: 0,
     Disabled: 0,
     DriverRating: 0,
     NoteIntakeRating: 0,
     DefenseRating: 0,
     UnderDefenseRating: 0,
     AutoPath: ["sz1"], 
     AutoEventList: "",
     TeleEventList: "",
     Comment: " "
 })

 export const videoMatch = writable({
           StartTime : null
           }
       )
