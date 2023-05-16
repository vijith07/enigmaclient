<script lang="ts">
  export let files: FileList = null
  export const uploadFile = async () => {}
  $: if (files) {
    uploadFile()
  }
</script>

<div class="form-control w-full max-w-xs">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label">
    <span class="label-text">Pick a file</span>
    <span class="label-text-alt">Max. size(5MB)</span>
  </label>
  <input
    type="file"
    class="file-input file-input-bordered w-full max-w-xs"
    bind:files
  />
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label">
    <span class="label-text-alt">Alt label</span>
    <span class="label-text-alt">Alt label</span>
  </label>
</div>
