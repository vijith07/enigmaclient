<!-- svelte-ignore a11y-label-has-associated-control -->

<script lang="ts">

  export let searchString: string = ''
  export let selectedType: string = 'All'
  export let handleFilter: (searchString: string, selectedType: string) => void

  let types = ['All', 'Text', 'File']

  $: handleFilter(searchString, selectedType)
</script>

<div class="flex flex-wrap rounded m-2">
  <div class="flex flex-wrap m-3">
    <input
      type="text"
      class="input"
      placeholder="Search Sends"
      bind:value={searchString}
    />
  </div>
  <!-- Search box -->
  <!-- All/Text/File filters buttons -->
  <div class="flex flex-wrap p-3">
    {#each types as type}
      <div class="flex flex-row gap-2 m-2 items-center">
        <input
          type="checkbox"
          class="checkbox"
          checked={selectedType === type}
          on:click={() => (selectedType = type)}
        />
        <label class="label">
          <span class="label-text">{type}</span>
        </label>
      </div>
    {/each}
  </div>
</div>
