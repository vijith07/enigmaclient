<script lang="ts">
  import type { ISend } from '../../../services/send'
  import { createSend } from '../../../services/send'

  import Input from '../../components/Input.svelte'
  import PasswordInput from '../../components/PasswordInput.svelte'
  import Select from '../../components/Select.svelte'
  import TextArea from '../../components/TextArea.svelte'

  const timeOptions = [
    '1 hour',
    '1 day',
    '2 days',
    '3 days',
    '7 days',
    '30 days',
  ]

  let name = ''
  let type = 0
  let text = ''
  let hideText = false
  let expiryDate = ''
  let deleteDate = ''
  let notes = ''
  let password = ''
  let shareOnSave = true
  let hideEmail = false
  let disableAfterAccess = false
  let accessLimit = 0

  async function handleSubmit() {
    const newSend: ISend = {
      name,
      type,
      text,
      hideText,
      expiryDate,
      deleteDate,
      notes,
      password,
      shareOnSave,
      hideEmail,
      disableAfterAccess,
      accessLimit,
    }
    console.log(newSend)
    try {
      const res = await createSend(newSend)
      console.log(res)
    } catch (error) {
      console.log(error)
    }
  }
</script>

<!-- The button to open modal -->
<label for="create-send-modal" class="btn btn-outline">+ CREATE NEW SEND</label>
<input type="checkbox" id="create-send-modal" class="modal-toggle" />
<label
  class="modal modal-bottom sm:modal-middle cursor-pointer"
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
        <div class="w-1/2">
          <Input
            label="NAME"
            id="name"
            bottomLeftLabel="A friendly name to describe this Send."
            required={true}
            bind:value={name}
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
              checked
            />
            <span class="label-text">Text</span>
          </div>
          <div class="form-control flex flex-row gap-2 m-2">
            <input type="radio" name="radio-10" disabled class="radio" />
            <div class="label-text">File</div>
          </div>
        </div>
        <TextArea
          bottomLeftLabel="The text you want to send."
          required
          label="TEXT"
          id="text"
          bind:value={text}
        />
        <!-- do you want to hide send checkbox -->
        <div
          class="form-control flex flex-row items-center gap-2 m-2 opacity-70"
        >
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            bind:checked={hideText}
          />
          <span class="label-text text-sm">
            When accessing this Send, hide the text by default.
          </span>
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
        <div tabindex="0" class="collapse collapse-arrow mt-6 -mx-2">
          <input type="checkbox" class="peer" />
          <div class="collapse-title text-sm">OPTIONS</div>
          <div class="collapse-content flex flex-col gap-2">
            <!-- expiry time select with multiple options -->
            <div class="flex flex-row gap-2">
              <!-- delete options -->
              <Select
                label="DELETE DATE"
                id="delete"
                bottomLeftLabel="The Send will be permanently deleted on the specified date and time."
                required={true}
                variant={'medium'}
                bind:value={deleteDate}
                options={timeOptions}
              />
              <Select
                label="EXPIRY DATE"
                id="expiryTime"
                bottomLeftLabel="If set, the Send will expire on the specified date and time."
                required={true}
                variant={'medium'}
                bind:value={expiryDate}
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
                bind:value={accessLimit}
              />
            </div>
            <PasswordInput
              label="Password"
              topRightLabel="Optionally require a password for users to access this send"
              autocomplete="new-password"
              bind:value={password}
              required={false}
              id="send-password"
            />
            <TextArea
              label="Notes"
              bottomLeftLabel="A private note to help you remember what this Send is for"
              bind:value={notes}
            />
            <!-- Hide email -->
            <div class="form-control flex flex-row items-center gap-2 my-2">
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                bind:checked={hideEmail}
              />
              <span class="label-text text-sm">
                Hide my email address from recipients.
              </span>
            </div>
            <!-- Deactivate Send -->
            <div class="form-control flex flex-row items-center gap-2">
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                bind:checked={disableAfterAccess}
              />
              <span class="label-text text-sm">
                Deactivate this Send after it has been accessed.
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
