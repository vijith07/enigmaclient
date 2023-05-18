<script lang="ts">
  import { onMount } from 'svelte'
  import Navbar from '../containers/Navbar.svelte'
  import CreateSendModal from '../containers/send/CreateSendModal.svelte'
  import Filter from '../containers/send/Filter.svelte'
  import SendCard from '../containers/send/SendCard.svelte'
  import VerifyEmail from '../containers/VerifyEmail.svelte'
  import LoadingSpinner from '../components/LoadingSpinner.svelte'
  import { getSends } from '../../services/send/getSend'
  import type { ISendResponse } from '../../services/send/types'

  let selectedType = 'All'
  let searchString = ''
  let isLoading = false
  let error = ''

  let sendList: ISendResponse[] = []

  let filteredSendList: ISendResponse[] = []

  const handleFilter = (search, type) => {
    searchString = search
    selectedType = type
    // filter the sendList
    filteredSendList = sendList.filter((send) => {
      if (selectedType == 'All') {
        return send.name.toLowerCase().includes(searchString.toLowerCase())
      } else {
        return (
          send.name.toLowerCase().includes(searchString.toLowerCase()) &&
          send.send_type == (selectedType == 'Text' ? 0 : 1)
        )
      }
    })
  }
  // populate the sendList with all sends

  const populateSendList = async () => {
    try {
      isLoading = true
      sendList = await getSends()
      filteredSendList = sendList
      isLoading = false
    } catch (err) {
      error = err.message
      isLoading = false
    }
  }

  // svelte on mount
  onMount(async () => {
    if (!sessionStorage.getItem('token') && !sessionStorage.getItem('user')) {
      // redirect to login with redirect url
      window.location.replace(`/login?redirect=${window.location.href}`)
    }
    await populateSendList()
  })
  $: populateSendList()
</script>

<div class="min-h-screen bg-gradient-to-b from-slate-800 to-base-100">
  <Navbar />
  {#if isLoading}
   <LoadingSpinner />
  {:else if error}
    {#if error == 'Error: User is not verified'}
      <div class="flex justify-center items-center h-screen">
        <VerifyEmail />
      </div>
    {:else}
      <div class="flex justify-center items-center h-screen">
        <div class="text-2xl text-red-500">{error}</div>
      </div>
    {/if}
  {:else}
    <div class="flex flex-wrap">
      <div class="flex flex-col w-full m-4">
        <div class="flex flex-wrap justify-items-center items-center">
          <Filter {handleFilter} />
          <button class="btn btn-ghost text-lg" on:click={populateSendList}>
            🔃
          </button>
          <div class="ml-auto">
            <CreateSendModal {populateSendList} />
          </div>
          <!-- button to refresh the send list -->
        </div>
        <div class="divider" />
        <!--  loop through all sends -->
        {#each filteredSendList as send}
          <SendCard {send} {populateSendList} />
        {/each}

        <!--  if no sends -->
        {#if filteredSendList.length == 0 && sendList.length != 0}
          <div class="flex justify-center items-center">
            <div class="text-2xl text-gray-500">No sends found</div>
          </div>
        {/if}

        <!--  if no sends -->
        {#if sendList.length == 0}
          <div
            class="flex flex-col gap-4 justify-center items-center h-full mt-16"
          >
            <div class="text-lg text-gray-500">
              You have not created any sends yet. Click the button below to
              create a send.
            </div>
            <CreateSendModal {populateSendList} />
          </div>
        {/if}
      </div>
    </div>
  {/if}
  <div class="flex justify-center items-end h-16 text-gray-500">
    © 2023 Enigma. All rights reserved.
  </div>
</div>
