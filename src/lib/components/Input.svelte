<!-- generic  input component -->
<script lang="ts">
  export let type = 'text'
  export let placeholder = ''
  export let value = type === 'text' ? '' : null
  export let label = ''
  export let topRightLabel = ''
  export let bottomLeftLabel = ''
  export let bottomRightLabel = ''
  export let id = ''
  export let error = ''

  function handleInput({ target: t }) {
    if (type === 'number') {
      value = t.value === '' ? null : t.valueAsNumber
    } else {
      value = t.value
    }
  }
</script>

<!--  if input type is password add show/hide icon -->



<div class="form-control w-full ">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label">
    {#if label}
      <span class="label-text">{label}</span>
    {/if}
    {#if topRightLabel}
      <span class="label-text-alt">{topRightLabel}</span>
    {/if}
  </label>
  <input
    {type}
    {placeholder}
    class="input w-full input-bordered {error ? 'border-red-500' : ''} focus:border-0"
    {id}
    {value}
    on:input={handleInput}
  />
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
