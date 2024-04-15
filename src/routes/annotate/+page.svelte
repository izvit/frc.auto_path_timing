<script>
    import FieldPathAuto from "./FieldPathAuto.svelte";
import Player from "./Player.svelte";

</script>
<svelte:head>
	<title>Video Annotation</title>
	<meta name="description" content="Video Annotation" />
</svelte:head>

<div class="grid grid-column">
  <FieldPathAuto />
  {#await import('./Player.svelte') then {default: Player}}
	<svelte:component this={Player} />
  {/await}
</div>
