<script lang="ts">
  import { createSend } from '../../../services/send/createSend'
  import type { ICreateSendRequest } from '../../../services/send/types'
  import { getFileSize } from '../../../utils/file'
  import Input from '../../components/Input.svelte'
  import PasswordInput from '../../components/PasswordInput.svelte'
  import Select from '../../components/Select.svelte'
  import TextArea from '../../components/TextArea.svelte'

  export let populateSendList: () => Promise<void>

  const timeOptions = [
    '1 hour',
    '1 day',
    '2 days',
    '3 days',
    '7 days',
    '30 days',
  ]
  const maxFileSize = 5 * 1024 * 1024 // 5MB

  let isLoading = false
  let error = ''
  let files: FileList = null
  let shareOnSave = true

  let newSend: ICreateSendRequest = {
    name: '',
    send_type: null,
    text_data: '',
    hide_data: false,
    expiration_time: 'Never',
    deletion_time: '7 days',
    notes: '',
    password: '',
    encrypted_key: '',
    hide_email: false,
    max_access_count: null,
    file_data: null,
    iv: '',
  }

  const clearForm = () => {
    newSend = {
      name: '',
      send_type: null,
      text_data: '',
      hide_data: false,
      expiration_time: 'Never',
      deletion_time: '7 days',
      notes: '',
      password: '',
      encrypted_key: '',
      hide_email: false,
      max_access_count: null,
      file_data: null,
      iv: '',
    }
    files = null
    shareOnSave = true
    error = ''
  }
  async function handleSubmit() {
    try {
      isLoading = true
      validateSend(newSend)
      if (newSend.send_type == 0 && error == '') {
        await createSend(newSend)
      } else if (newSend.send_type == 1 && error == '') {
        if (!files) {
          error = 'Please select a file'
          throw new Error(error)
        }
        await createSend(newSend, files[0])
      }
      clearForm()
      isLoading = false
      populateSendList()
    } catch (error) {
      isLoading = false
      error = error.message
    }
  }

  const validateSend = (send: ICreateSendRequest) => {
    if (!send.name) {
      error = 'Please enter a name'
      throw new Error(error)
    }
    if (send.send_type == null) {
      error = 'Please select a send type'
      throw new Error(error)
    }
    if (send.send_type == 0 && !send.text_data) {
      error = 'Please enter text'
      throw new Error(error)
    }
    if (send.send_type == 1 && !files) {
      error = 'Please select a file'
      throw new Error(error)
    }
    if (send.send_type == 1 && files[0].size > maxFileSize) {
      error = `File size exceeds ${getFileSize(maxFileSize)}`
      throw new Error(error)
    }
  }
</script>

{#if isLoading}
  <div class="alert alert-info">Creating Send...</div>
{:else}
  <!-- The button to open modal -->
  <label for="create-send-modal" class="btn btn-outline"
    >+ CREATE NEW SEND</label
  >
  <input type="checkbox" id="create-send-modal" class="modal-toggle" />
  <label
    class="modal modal-bottom sm:modal-middle cursor-pointer ease-in-out duration-300 bg-transparent"
    for="create-send-modal"
  >
    <label class="modal-box relative" for="">
      <label
        for="create-send-modal"
        class="btn btn-sm btn-circle absolute right-4 top-4">✕</label
      >

      <form on:submit|preventDefault={handleSubmit}>
        <h3 class="font-bold text-lg">CREATE NEW SEND</h3>
        <div class="divider" />
        <div class="modal-body">
          {#if error}
            <div class="alert alert-error mt-">{error}</div>
          {/if}
          <div class="w-1/2">
            <Input
              label="NAME"
              id="name"
              bottomLeftLabel="A friendly name to describe this Send."
              required={true}
              bind:value={newSend.name}
            />
          </div>
          <div class="form-control flex flex-col">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="label">
              <span class="label-text">What type of Send is this?</span>
            </label>
            <div class="form-control flex flex-row gap-2 m-2">
              <input
                type="radio"
                readonly
                name="radio-10"
                class="radio"
                on:change={() => {
                  newSend.send_type = 0
                }}
              />
              <span class="label-text">Text</span>
            </div>
            <div class="form-control flex flex-row gap-2 m-2">
              <input
                type="radio"
                name="radio-10"
                class="radio"
                on:change={() => {
                  newSend.send_type = 1
                }}
              />
              <div class="label-text">File</div>
            </div>
          </div>
          {#if newSend.send_type === 0}
            <TextArea
              bottomLeftLabel="The text you want to send."
              required
              label="TEXT"
              id="text"
              bind:value={newSend.text_data}
            />

            <div
              class="form-control flex flex-row items-center gap-2 m-2 opacity-70"
            >
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                bind:checked={newSend.hide_data}
              />
              <span class="label-text text-sm">
                When accessing this Send, hide the text by default.
              </span>
            </div>
          {/if}
          {#if newSend.send_type === 1}
            <div class="form-control w-full">
              <!-- svelte-ignore a11y-label-has-associated-control -->
              <label class="label">
                <span class="label-text">Pick a file</span>
                <span class="label-text-alt"
                  >less than {getFileSize(maxFileSize)}</span
                >
              </label>
              <input
                type="file"
                class="file-input file-input-bordered w-full"
                bind:files
              />
              {#if files}
                <div class="flex flex-col gap-2 m-3">
                  {#each Array.from(files) as file}
                    <div
                      class="flex flex-row justify-between items-center gap-2"
                    >
                      <div class="text-sm">{file.name}</div>
                      <div class="text-sm">{getFileSize(file.size)}</div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
          <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
          <div tabindex="0" class="collapse collapse-arrow mt-6 -mx-2">
            <input type="checkbox" class="peer" />
            <div class="collapse-title text-sm">OPTIONS</div>
            <div class="collapse-content flex flex-col gap-2">
              <!-- expiry time select with multiple options -->
              <div class="flex flex-row gap-1">
                <!-- delete options -->
                <Select
                  label="DELETE DATE"
                  id="delete"
                  bottomLeftLabel="The Send will be permanently deleted on the specified date and time."
                  required={true}
                  variant={'medium'}
                  bind:value={newSend.deletion_time}
                  options={timeOptions}
                />
                <Select
                  label="EXPIRY DATE"
                  id="expiryTime"
                  bottomLeftLabel="If set, the Send will expire on the specified date and time."
                  required={true}
                  variant={'medium'}
                  bind:value={newSend.expiration_time}
                  options={[...timeOptions, 'Never']}
                />

                <!-- Set Access Limit Counter with text and increment and decrement buttons -->
              </div>
              <div class="w-1/2">
                <Input
                  label="ACCESS LIMIT"
                  id="accessLimit"
                  type="number"
                  bottomLeftLabel="If set, users will only be able to access this Send a limited number of times."
                  bind:value={newSend.max_access_count}
                />
              </div>
              <PasswordInput
                label="Password"
                topRightLabel="Optionally require a password for users to access this send"
                autocomplete="new-password"
                bind:value={newSend.password}
                required={false}
                id="send-password"
              />
              <TextArea
                label="Notes"
                bottomLeftLabel="A private note to help you remember what this Send is for"
                id="notes"
                bind:value={newSend.notes}
              />
              <!-- Hide email -->
              <div class="form-control flex flex-row items-center gap-2 my-2">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  bind:checked={newSend.hide_email}
                />
                <span class="label-text text-sm">
                  Hide my email address from recipients.
                </span>
              </div>
            </div>
          </div>
          <div class="divider" />
          <div class="modal-action">
            <label for="create-send-modal" class="btn">Cancel</label>
            <label for="create-send-modal">
              <button class="btn btn-primary" type="submit">Save</button>
            </label>
          </div>
        </div>
      </form>
    </label>
  </label>
{/if}
