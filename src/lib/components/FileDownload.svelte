<!-- file download card with meta data -->
<script lang="ts">
  import { onMount } from 'svelte'
  import type { IFileDataResponse } from '../../services/send/types'
  import { getFileSize } from '../../utils/file'
  import { convertSecondsToDHMS } from '../../utils/dateTime'
  export let fileData: IFileDataResponse = null
  export let onClick: () => void = null
  export let disabled: boolean = false
  export let secondsBeforeDisabled: number | null = null

  let timeSpent = 0

  onMount(() => {
    if (secondsBeforeDisabled) {
      let interval = setInterval(() => {
        timeSpent += 1
        if (timeSpent >= secondsBeforeDisabled) {
          clearInterval(interval)
        }
      }, 1000)
    }
  })

  $: disabled = disabled || timeSpent >= secondsBeforeDisabled
</script>

<div class=" flex flex-col items-center gap-4 justify-center">
  <!-- if secondsBeforeDisabled is not null,show a countdown timer -->

  {#if secondsBeforeDisabled && !disabled}
    <p class="opacity-50">
      This link expires in: {convertSecondsToDHMS(
        secondsBeforeDisabled - timeSpent
      )}
    </p>
  {/if}

  <!--  If disabled is true, show a message that the link has expired try again or contact the sender -->

  <div class="flex flex-row gap-2 items-center justify-center">
    <!--  Click on this button to download the file -->
    <!-- Show note -->

    <button class="btn btn-outline btn-info" {disabled} on:click={onClick}>
      Download File {getFileSize(fileData.file_size)}
    </button>
    {#if secondsBeforeDisabled && !disabled}
      <div
        class="radial-progress"
        style="--value:{(timeSpent * 100) /
          secondsBeforeDisabled}; --size:2rem; --thickness: 2px;"
      />
    {/if}
  </div>
  {#if disabled}
    <p class="text-warning opacity-75 text-sm">
      Link has expired. Please contact the sender or try again.
    </p>
  {/if}
  <div class="text-base text-info opacity-75 font-bold">
    Note: You can download the file only once.
  </div>
</div>
