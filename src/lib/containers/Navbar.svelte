<script lang="ts">
  // @ts-ignore
  import { Router, Route, Link } from 'svelte-navigator'
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
  const logout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    window.location.replace('/login')
  }

</script>

<div
  class="navbar flex p-2 sticky top-0 z-10 shadow-lg bg-gradient-to-r from-base-100 to-base-300"
>
  <div class="navbar-start">
    <div class="dropdown">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <label tabindex="0" class="btn btn-ghost lg:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h8m-8 6h16"
          /></svg
        >
      </label>
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <ul
        tabindex="0"
        class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
      >
        <li><Link to="/vault">Vault</Link></li>
        <li><Link to="/send">Send</Link></li>
      </ul>
    </div>
    <Link
      to="/"
      class="btn btn-ghost normal-case text-xl flex items-center gap-2"
    >
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
      <div>enigma</div>
    </Link>
  </div>
  <div class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal px-1">
      <li><Link to="/vault">Vault</Link></li>
      <li><Link to="/send">Send</Link></li>
    </ul>
  </div>
  <div class="navbar-end">
    {#if isLoggedIn}
      <div class="dropdown dropdown-end">
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <div tabindex="0" class="btn btn-ghost">
          <div class="avatar placeholder">
            <div
              class="bg-neutral-focus text-neutral-content rounded-full w-12"
            >
              <span>{userName[0]}</span>
            </div>
          </div>
        </div> 
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <ul
          tabindex="0"
          class="menu dropdown-content shadow bg-base-100 rounded-box w-52"
        >
          <!-- email -->
          <li><div class="p-3 justify-center opacity-50">{userName}</div></li>
          <li class="divider"></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><button class="" on:click={logout}>Logout</button></li>
        </ul>
        <!-- Hi message with nameand logout button -->
      </div>
    {:else}
      <Link to="/login">
        <button class="btn btn-ghost">Login </button>
      </Link>
      <Link to="/signup">
        <button class="btn btn-primary">Sign Up</button>
      </Link>
    {/if}
  </div>
</div>
