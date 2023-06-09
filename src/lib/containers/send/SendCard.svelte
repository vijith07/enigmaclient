<script lang="ts">
  import { deleteSend } from '../../../services/send/deleteSend'
  import type { ISend } from '../../../services/send/types'
  import EditSendModal from './EditSendModal.svelte'

  export let populateSendList: () => Promise<void>
  export let send: ISend = null
  const shareLink: string = `https://enigma.vijith.dev/sa/${send.id}/${send.encrypted_key}`

  let isLoading = false
  let error = ''
  let success = ''

  // delete send
  const onDelete = async () => {
    try {
      isLoading = true
      await deleteSend(send.id)
      isLoading = false
      success = 'Send deleted successfully'
      populateSendList()
    } catch (error) {
      isLoading = false
      error = error.message
    }
  }

  const generateLink = () => {
    navigator.clipboard.writeText(shareLink)
  }
</script>

{#if !isLoading && !error && !success}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="card bg-transparent shadow-lg m-2">
    <div class="card-body flex flex-wrap items-center justify-center gap-2">
      <div class="card-title text-white">
        <EditSendModal oldSend={send} {populateSendList} />
      </div>

      <!--  if the send is disabled, display a warning -->
      <div class="card-title text-base text-warning">{error}</div>
      <!--  if the send is expired, display a warning -->

      <!-- <div class="card-body text-base text-primary">{send.data}</div> -->
      <!--  if max_access_count is set, display a badge -->
      <div class="flex flex-wrap justify-center items-center gap-2">
        <div class="flex flex-row gap-2">
          {#if send.password && send.password.length > 0}
            <div>🔑</div>
          {/if}
          {#if send.send_type === 0}
            <div>✒️</div>
          {:else if send.send_type === 1}
            <div>📄</div>
          {/if}
        </div>
        <div class="md:badge">{send.access_count} times accessed</div>
        {#if send.max_access_count > 0}
          <div class="md:badge md:badge-info">
            {send.max_access_count - send.access_count} accesses left
          </div>
          {#if send.access_count >= send.max_access_count}
            <div class="md:badge md:badge-warning">Limit Reached</div>
          {/if}
        {:else}
          <div class="md:badge">No Limit</div>
        {/if}
      </div>

      {#if send.expiration_time}
        {#if new Date(send.expiration_time) < new Date()}
          <div class="badge badge-outline">Expired</div>
        {/if}
      {/if}

      <div class="flex flex-row card-actions items-center m-2">
        <button class="btn btn-xs md:btn-md  btn-outline btn-success" on:click={generateLink}>
          Copy Link
        </button>
        <button class="btn btn-xs md:btn-md btn-outline btn-error" on:click={onDelete}
          >Delete</button
        >
      </div>
    </div>
  </div>
{:else if success}
  <div class="card bg-transparent shadow-lg">
    <div class="card-body flex flex-row items-center">
      <div class="card-title text-base text-success">{success}</div>
    </div>
  </div>
{:else if error}
  <div class="card bg-transparent shadow-lg">
    <div class="card-body flex flex-row items-center">
      <div class="card-title text-base text-error">{error}</div>
    </div>
  </div>
{:else}
  <div class="card bg-transparent shadow-lg">
    <div class="card-body flex flex-row items-center">
      <div class="card-title text-base text-info">Loading...</div>
    </div>
  </div>
{/if}
