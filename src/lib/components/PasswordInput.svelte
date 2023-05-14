<!--  Password Input  with Password Strength Meter and Toggle -->
<script lang="ts">
  import PasswordStrength from './PasswordStrength.svelte'

  export let type = 'password'
  export let placeholder = ''
  export let value = ''
  export let label = ''
  export let topRightLabel = ''
  export let bottomLeftLabel = ''
  export let bottomRightLabel = ''
  export let id = ''
  export let error = ''
  export let showPasswordToggle = false
  export let showPasswordStrength = false
  export let showPasswordSuggestions = false
  export let autocomplete = ''
  export let required = true

  let showPassword = false

  // toggle show/hide password
  function toggleShowPassword() {
    showPassword = !showPassword
    type = showPassword ? 'text' : 'password'
  }

  function handleInput({ target: t }) {
    value = t.value
  }
</script>

<!--  Password Input  with Password Strength Meter and Toggle -->

<div class="form-control w-full ">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label">
    {#if label}
      <span class="label-text">{label}</span>
    {/if}
    {#if topRightLabel}
      <span class="label-text-alt opacity-50">{topRightLabel}</span>
    {/if}
  </label>
  <input
    {type}
    {placeholder}
    {autocomplete}
    class="input w-full input-bordered {error
      ? 'border-red-500'
      : ''} focus:border-0"
    {id}
    {value}
    on:input={handleInput}
    {required}
  />

  <!--  show/hide password toggle -->
  <div class="flex items-center justify-end">
    <button class="btn btn-ghost btn-sm hover:bg-transparent" type="button" on:click={toggleShowPassword}>
      {#if showPassword}
        Hide
      {:else}
        Show
      {/if}
    </button>
  </div>

  {#if error}
    <p class="text-error p-2">{error}</p>
  {/if}
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label">
    {#if bottomLeftLabel}
      <span class="label-text-alt text-gray-400">{bottomLeftLabel}</span>
    {/if}

    {#if bottomRightLabel}
      <span class="label-text-alt">{bottomRightLabel}</span>
    {/if}
  </label>
</div>

<!--  Password Strength Meter -->
{#if showPasswordStrength}
  <PasswordStrength {value} />
{/if}
