<script lang="ts">
  import { getFileSize } from '../../utils/file'

  export let files: FileList = null
  export let maxFileSize = 100 * 1024 * 1024
  export let uploadFile: (file : File) => void

  let error = ''

  $: if (files) {
    if (files[0].size > maxFileSize) {
      files = null
      error = `File size exceeds ${getFileSize(maxFileSize)}`
    } else {
      error = ''
      uploadFile(files[0])
    }
  }
</script>

<div class="form-control w-full">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label">
    <span class="label-text">Pick a file</span>
    <span class="label-text-alt">less than {getFileSize(maxFileSize)}</span>
  </label>
  <input type="file" class="file-input file-input-bordered w-full" bind:files />
  {#if files}
    <div class="flex flex-col gap-2 m-3">
      {#each Array.from(files) as file}
        <div class="flex flex-row justify-between items-center gap-2">
          <div class="text-sm">{file.name}</div>
          <div class="text-sm">{getFileSize(file.size)}</div>
        </div>
      {/each}
    </div>
  {/if}

  {#if error}
    <div class="alert alert-error mt-">{error}</div>
  {/if}
</div>
