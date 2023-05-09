<script>
  import Navbar from '../containers/Navbar.svelte'
  import Filter from '../containers/send/Filter.svelte'
  import SendList from '../containers/send/SendList.svelte'

  let selectedType = 'All'
  let searchString = ''

  console.log('selectedType', selectedType)

  const handleFilter = (search, type) => {
    searchString = search
    selectedType = type
  }
</script>

<!-- page to display all sends -->
<div class="min-h-screen bg-gradient-to-b from-slate-800 to-base-100">
  <Navbar />
  <div class="flex flex-wrap">
      
    <div class="flex flex-col w-full m-4">
      <div class="flex flex-wrap justify-items-center items-center">
        <Filter {handleFilter} />
        <div class="ml-auto">
          <button class="btn btn-outline">+ Create New Send</button>
        </div>
      </div>
      <div class="divider" />
      <SendList />
    </div>
  </div>
</div>
