<script lang="ts">
  import { onMount } from 'svelte'
  import PasswordInput from '../components/PasswordInput.svelte'
  import { Link } from 'svelte-navigator'
  import TextArea from '../components/TextArea.svelte'
  import type {
    IAccessSend,
    IFileDataResponse,
  } from '../../services/send/types'
  import {
    decryptAccessFileSend,
    decryptAccessTextSend,
    getSendforAccess,
    verifySendPassword,
  } from '../../services/send/getSend'
  import FileDownload from '../components/FileDownload.svelte'

  let sendId = ''
  let aesKey = ''
  let requirePassword = false
  let isPasswordCorrect = false
  let password = ''
  let text_data = ''
  let file_data: IFileDataResponse = null
  let name = ''
  let email = ''
  let send_type: number = null
  let send: IAccessSend = null
  let hideData = true
  let error: string | null = null

  const getIdAndKey = () => {
    let url = window.location.href
    let urlArray = url.split('/')

    let sendId = urlArray[4]
    let aesKey = ''
    for (let i = 5; i < urlArray.length; i++) {
      if (i == urlArray.length - 1) {
        aesKey += urlArray[i]
        break
      }
      aesKey += urlArray[i] + '/'
    }

    return [sendId, aesKey]
  }

  onMount(async () => {
    try {
      sendId = getIdAndKey()[0]
      aesKey = getIdAndKey()[1]
      const response = await getSendforAccess(sendId, aesKey)
      send = response.send
      hideData = send.hide_data
      if (send.password) {
        requirePassword = true
        isPasswordCorrect = false
      } else {
        requirePassword = false
        isPasswordCorrect = true
        let decryptedData = null
        try {
          if (send.send_type == 0) {
            decryptedData = await decryptAccessTextSend(aesKey, send)
          } else {
          }
        } catch (err) {
          error =
            'Error decrypting data. Please check if the link is correct and try again.'
        }
        name = decryptedData.name
        email = decryptedData.email
        text_data = decryptedData.data
        file_data = decryptedData.file_data
      }
    } catch (err) {
      // set timeout to redirect to home page
      error =
        'Error fetching data. Please check if the link is correct and try again.'
      // setTimeout(() => {
      //   window.location.replace('/')
      // }, 5000)
    }
  })

  const handleDownload = async () => {
    try {
      await decryptAccessFileSend(aesKey, send)
    } catch (err) {
      error =
        'Error decrypting data. Please check if the link is correct and try again.'
    }
  }

  const verifyPassword = () => {
    if (password.length === 0) {
      return
    }
    verifySendPassword(aesKey, send.iv, send.password, password).then(
      async (response) => {
        if (!response) {
          isPasswordCorrect = false
          error = 'Password is incorrect'
          return
        }
        isPasswordCorrect = true
        let decryptedData = await decryptAccessTextSend(aesKey, send)
        name = decryptedData.name
        email = decryptedData.email
        send_type = decryptedData.send_type
        text_data = decryptedData.text_data
        file_data = decryptedData.file_data
      }
    )
  }
</script>

<div
  class="flex flex-col pt-4 items-center min-h-screen bg-gradient-to-tr from-base-100 to-slate-800"
>
  <Link to="/" class=" text-xl flex items-center gap-2 text-primary">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill-rule="evenodd"
      clip-rule="evenodd"
      class="fill-current"
      ><path
        d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z"
      /></svg
    >
    <div>Send</div>
  </Link>

  {#if error}
    <div
      class="w-1/2 flex justify-center m-24 alert text-warning border border-error"
    >
      {error}
    </div>
  {/if}

  {#if requirePassword && !isPasswordCorrect && !error}
    <!-- show input filed to aske for password and a button to verify -->
    <!--  form to ask for password -->
    <!--  info that this is a password protected send -->

    <form
      class="flex flex-col lg:w-2/5 md:w-3/5 w-full gap-4 m-4 p-10 rounded shadow-lg"
      on:submit|preventDefault={verifyPassword}
    >
      <p class="text-lg">
        This send is password protected. Please type the password to continue.
      </p>
      <p class="opacity-75">
        If you don't have the password, please contact the sender.
      </p>

      <PasswordInput
        label="Password"
        bind:value={password}
        autocomplete="new-password"
        {error}
        required={false}
      />
      <button class="btn btn-primary mx-10" type="submit"> Verify </button>
    </form>
  {/if}

  {#if isPasswordCorrect && !error}
    <!--  show warning if email is empty -->

    {#if email === ''}
      <div
        class="alert text-warning border border-warning border-opacity-20 lg:w-2/5 md:w-3/5 w-full p-2 m-4"
      >
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            /></svg
          >
          <span
            >Warning: The Enigma user who created this send has chosen to hide
            their email address. You should ensure you trust the source of this
            link before using it.
          </span>
        </div>
      </div>
    {/if}

    <div
      class="flex lg:w-2/5 md:w-3/5 w-full justify-end items-center flex-col p-2 m-4"
    >
      <div class="text-base text-info uppercase">{name}</div>
      <div class="divider" />
      {#if email.length > 0}
        <div class="card-body text-xs opacity-40">sender: {email}</div>
      {/if}
      {#if send_type === 0}
        <TextArea
          label="Text"
          bind:value={text_data}
          readonly={true}
          hidden={hideData}
        />

        <button
          class="btn btn-ghost"
          on:click={() => {
            hideData = !hideData
          }}
        >
          Toggle Visibility
        </button>
        <!--  button to copy data to clipboard -->
        <button
          class="btn btn-ghost w-24 mt-4"
          on:click={() => {
            navigator.clipboard.writeText(text_data)
          }}
        >
          Copy
        </button>
      {/if}
      {#if send_type === 1}
        <FileDownload fileData={file_data} onClick = {() => handleDownload()} />
      {/if}
    </div>
  {/if}
  <div class="p-2">© 2023 Enigma. All rights reserved.</div>
</div>
