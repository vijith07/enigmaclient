<script lang="ts">
  // @ts-ignore
  import { Link } from 'svelte-navigator'
  // check local storage for the token
  let isLoggedIn = false
  let userName = ''

  const token = sessionStorage.getItem('token')
  if (token) {
    isLoggedIn = true
    const user = sessionStorage.getItem('user')
    if (user) {
      userName = JSON.parse(user).name || ''
    }
  }
</script>

<div class="hero min-h-screen bg-gradient-to-l from-cyan-900 to-blue-900">
  <div class="hero-content text-center">
    <div class="max-w-2xl">
      <div class="md:text-5xl text-3xl font-bold text-cyan-200">
        A trusted way to securely share sensitive information directly with <span
          class="text-white"
        >
          anyone</span
        >. Move to the next level of security.
      </div>
      <div class="p-6 md:text-lg text-gray-300">
        Transmit Securely. Share Text and Files. Rest Assured with End-to-End
        Encryption and Zero-Knowledge Architecture.
      </div>
      <div class="flex items-center justify-center gap-4">
        {#if isLoggedIn}
          <a href="/send" class="btn bg-white text-black hover:bg-primary"
            >Manage Sends
          </a>
        {:else}
          <a href="/signup" class="btn bg-white text-black hover:bg-primary"
            >Get Started</a
          >
        {/if}
      </div>
    </div>
  </div>
</div>
