<script lang="ts">
  import { onMount } from 'svelte'
  import { getSends, type ISendResponse } from '../../services/send'
  import Navbar from '../containers/Navbar.svelte'
  import CreateSendModal from '../containers/send/CreateSendModal.svelte'
  import Filter from '../containers/send/Filter.svelte'
  import SendList from '../containers/send/SendList.svelte'
  import SendCard from '../containers/send/SendCard.svelte'

  let selectedType = 'All'
  let searchString = ''

  console.log('selectedType', selectedType)

  const handleFilter = (search, type) => {
    searchString = search
    selectedType = type
  }

  let sendList:ISendResponse[] = []

  // populate the sendList with all sends

  const populateSendList = async () => {
    try {
      console.log('populating send list')
      sendList = await getSends()
      console.log('sendList', sendList)
    } catch (error) {
      console.log(error)
    }
  }

  // svelte on mount
  onMount(async () => {
    await populateSendList()
  })

  $: populateSendList()

  


</script>

<!-- page to display all sends -->
<div class="min-h-screen bg-gradient-to-b from-slate-800 to-base-100">
  <Navbar />
  <div class="flex flex-wrap">
    <div class="flex flex-col w-full m-4">
      <div class="flex flex-wrap justify-items-center items-center">
        <Filter {handleFilter} />
        <div class="ml-auto">
          <CreateSendModal />
        </div>
        <!-- button to refresh the send list -->
        <button
          class="btn btn-primary"
          on:click={populateSendList}
        >
          Refresh
        </button>
      </div>
      <div class="divider" />
      <!--  loop through all sends -->
      {#each sendList as send}
      <SendCard {send} />
      {/each}
    </div>
  </div>
</div>
