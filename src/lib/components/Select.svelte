<script lang="ts">
  export let options: string[] = []
  export let placeholder = ''
  export let value: string = ''
  export let error: string = ''
  export let id: string = ''
  export let required: boolean = false
  export let variant: 'small' | 'medium' | 'large' = 'large'
  export let disabled: boolean = false
  export let label:string = ''
  export let topRightLabel:string = ''
  export let bottomLeftLabel:string = ''
  export let bottomRightLabel:string = ''
</script>

<div class="form-control w-full max-w-xs">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">
        {#if label}
          <span class="label-text">{label}</span>
        {/if}
        {#if topRightLabel}
          <span class="label-text-alt">{topRightLabel}</span>
        {/if}
      </label>
    <select {placeholder} {required} {disabled} {id} {value} class="select select-bordered focus:border-0 {error ? 'border-red-500' : ''} {variant === 'small' ? 'w-32' : variant === 'large' ? '' : 'w-56'}">
        {#each options as option}
            <option value={option}>{option}</option>
        {/each}
    </select>
    {#if error.length > 0}
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
