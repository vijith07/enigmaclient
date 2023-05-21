<script lang="ts">
  import { updateSend } from '../../../services/send/createSend'
  import {
    getDecryptedFile,
    requestSendDownloadLink,
  } from '../../../services/send/getSend'
  import type { ISend } from '../../../services/send/types'
  import { getFileSize } from '../../../utils/file'
  import FileDownload from '../../components/FileDownload.svelte'
  import Input from '../../components/Input.svelte'
  import PasswordInput from '../../components/PasswordInput.svelte'
  import Select from '../../components/Select.svelte'
  import TextArea from '../../components/TextArea.svelte'

  export let oldSend: ISend = null
  export let populateSendList: () => Promise<void>

  const timeOptions = [
    '1 hour',
    '1 day',
    '2 days',
    '3 days',
    '7 days',
    '30 days',
  ]
  let isLoading = false
  let error = ''
  let shareOnSave = true
  let downloadURL = ''
  let send: ISend = {
    ...oldSend,
    max_access_count:
      oldSend.max_access_count < 0 ? null : oldSend.max_access_count,
    expiration_time: null,
    deletion_time: null,
  }
  let link = `https://enigma.vijith.dev/sa/${send.id}/${send.encrypted_key}`
  async function handleSubmit() {
    error = ''
    try {
      if (error == '') {
        isLoading = true
        if (!send.expiration_time) {
          send.expiration_time = oldSend.expiration_time + 'Z'
        }
        if (!send.deletion_time) {
          send.deletion_time = oldSend.deletion_time + 'Z'
        }
        await updateSend(send)
        isLoading = false
        if (shareOnSave) {
          navigator.clipboard.writeText(link)
        }
        populateSendList()
      }
    } catch (error) {
      isLoading = false
      error = error.message
    }
  }

  const onFileDownload = async () => {
    try {
      downloadURL = await requestSendDownloadLink(send.id)
      await getDecryptedFile(
        { ...send.file_data, url: downloadURL },
        send.encrypted_key,
        send.iv
      )
    } catch (err) {
      error = err.message
    }
  }
</script>

{#if isLoading}
  <div class="alert alert-info">Updating Send...</div>
{:else}
  <!-- The button to open modal -->
  <label
    for="update-{send.id}"
    class="btn btn-ghost text-lg hover:bg-transparent hover:text-primary"
    >{oldSend.name}</label
  >
  <input type="checkbox" id="update-{send.id}" class="modal-toggle" />
  <label
    class="modal modal-bottom sm:modal-middle cursor-pointer ease-in-out duration-300 bg-transparent"
    for="update-{send.id}"
  >
    <label class="modal-box relative" for="">
      <label
        for="update-{send.id}"
        class="btn btn-sm btn-circle absolute right-4 top-4">✕</label
      >

      <form on:submit|preventDefault={handleSubmit}>
        <h3 class="font-bold text-lg">EDIT SEND</h3>
        <div class="divider" />
        <div class="modal-body p-2">
          {#if error}
            <div class="alert alert-error mt-">{error}</div>
          {/if}
          <div class="w-1/2">
            <Input
              label="NAME"
              id="{send.id}-name"
              bottomLeftLabel="A friendly name to describe this Send."
              required={true}
              bind:value={send.name}
            />
          </div>
          {#if send.send_type === 0}
            <TextArea
              bottomLeftLabel="The text you want to send."
              required
              label="TEXT"
              id="{send.id}-text"
              bind:value={send.text_data}
            />

            <div
              class="form-control flex flex-row items-center gap-2 m-2 opacity-70"
            >
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                bind:checked={send.hide_data}
              />
              <span class="label-text text-sm">
                When accessing this Send, hide the text by default.
              </span>
            </div>
          {/if}
          {#if send.send_type === 1}
            <!-- show file details -->
            <div class="flex flex-wrap items-center justify-between m-2">
              <!--  show file name and size -->
              <div class="flex flex-col">
                <span class="text-sm font-bold">{send.file_data.file_name}</span>
                <span class="text-xs opacity-50">
                  {getFileSize(send.file_data.file_size)}
                </span>
              </div>

              <FileDownload
                fileData={{ ...send.file_data, url: downloadURL }}
                onClick={() => onFileDownload()}
              />
            </div>
          {/if}

          <!-- show link with copy to clipboard button -->
          <div class="flex flex-row items-center gap-2">
            <Input
              label="LINK"
              id="{send.id}-link"
              bottomLeftLabel="The link to this Send."
              required={true}
              readonly={true}
              bind:value={link}
            />
            <button
              type="button"
              class="btn btn-square btn-sm"
              on:click={() => {
                navigator.clipboard.writeText(link)
              }}
            >
              📋
            </button>
          </div>

          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="label">
            <span class="label-text opacity-50 mt-2">SHARE</span>
          </label>
          <div
            class="form-control flex flex-row items-center gap-2 m-2 opacity-70"
          >
            <input
              type="checkbox"
              class="checkbox checkbox-sm"
              bind:checked={shareOnSave}
            />
            <span class="label-text text-sm">
              Copy the link to this Send to your clipboard upon save.
            </span>
          </div>
          <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
          <div tabindex="0" class="collapse collapse-arrow mt-6 -mx-3">
            <input type="checkbox" class="peer" />
            <div class="collapse-title text-sm">OPTIONS</div>
            <div class="collapse-content flex flex-col gap-2">
              <!-- expiry time select with multiple options -->
              <!--  show oldSend.deletion_time and oldSend.expiration_time in text format -->
              <div class="flex flex-wrap gap-1">
                <Select
                  label="DELETE DATE"
                  id="{send.id}-delete"
                  topRightLabel={new Date(
                    oldSend.deletion_time
                  ).toLocaleString()}
                  bottomLeftLabel="The Send will be permanently deleted on the specified date and time."
                  required={false}
                  bind:value={send.deletion_time}
                  options={timeOptions}
                />
                <Select
                  label="EXPIRY DATE"
                  id="{send.id}-expiryTime"
                  topRightLabel={new Date(
                    oldSend.expiration_time
                  ).toLocaleString()}
                  bottomLeftLabel="If set, the Send will expire on the specified date and time."
                  required={false}
                  bind:value={send.expiration_time}
                  options={[...timeOptions, 'Never']}
                />

                <!-- Set Access Limit Counter with text and increment and decrement buttons -->
              </div>
              <div class="sm:w-1/2">
                <Input
                  label="ACCESS LIMIT"
                  id="{send.id}-accessLimit"
                  type="number"
                  bottomLeftLabel="If set, users will only be able to access this Send a limited number of times."
                  bind:value={send.max_access_count}
                />
              </div>
              <PasswordInput
                label="Password"
                topRightLabel="Optionally require a password to access."
                autocomplete="new-password"
                bind:value={send.password}
                required={false}
                id="{send.id}-send-password"
              />
              <TextArea
                label="Notes"
                id="{send.id}-notes"
                bottomLeftLabel="A private note to help you remember what this Send is for"
                bind:value={send.notes}
              />
              <!-- Hide email -->
              <div class="form-control flex flex-row items-center gap-2 my-2">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  bind:checked={send.hide_email}
                />
                <span class="label-text text-sm">
                  Hide my email address from recipients.
                </span>
              </div>
            </div>
          </div>
          <div class="divider" />
          <div class="modal-action">
            <label for="update-{send.id}" class="btn">Cancel</label>
            <label for="update-{send.id}">
              <button class="btn btn-primary" type="submit">Save</button>
            </label>
          </div>
        </div>
      </form>
    </label>
  </label>
{/if}
