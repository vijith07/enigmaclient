<script async script lang="ts">
  import { onMount } from 'svelte'
  import { verifyEmail } from '../../services/email'
  let error = false
  let message = ''
  onMount(async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const res = await verifyEmail(token)
      error = false
      message = res.message
      setTimeout(() => {
        window.location.replace('/login')
      }, 3000)
    } catch (err) {
      error = true
      message = err.message
    }
  })
</script>

<!--  if error -->
{#if error}
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-3xl font-bold text-red-500">Error</h1>
    <p class="text-xl text-red-500">{message}</p>
  </div>
{/if}

<!--  if no error -->
{#if !error}
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-3xl font-bold text-green-500">Success</h1>
    <p class="text-xl text-green-500">{message}</p>
  </div>
{/if}
<!--  if message is empty -->
{#if message === ''}
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-3xl font-bold text-blue-500">Loading...</h1>
  </div>
{/if}
