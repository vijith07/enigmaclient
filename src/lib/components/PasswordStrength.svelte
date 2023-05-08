<script lang="ts">
  import { onMount } from 'svelte'
  import { passwordStrengthCalculator } from '../../utils/passwordUtils'

  export let showPasswordSuggestions: boolean = false
  export let showPasswordWarning: boolean = false
  export let value: string = ''

  let strength = 0
  let message = ''
  let suggestions = []
  let warning = ''
  let progressColor = 'progress-error'

  const updatePasswordStrengthMeter = () => {
    const passwordStrengthDetails = passwordStrengthCalculator(value)
    strength = passwordStrengthDetails.strength
    message = passwordStrengthDetails.message
    suggestions = passwordStrengthDetails.suggestions
    warning = passwordStrengthDetails.warning
    progressColor =
      strength < 25
        ? 'progress-error'
        : strength < 50
        ? 'progress-warning'
        : strength < 75
        ? 'progress-info'
        : 'progress-success'
  }
  onMount(() => {
    updatePasswordStrengthMeter()
  })

  $: updatePasswordStrengthMeter()
</script>

<progress
  class={`progress ${progressColor}`}
  value={strength.toString()}
  max="100"
>
  {message}
</progress>
{#if showPasswordWarning && value.length > 0 && warning.length > 0}
  <div class="text-xs text-red-500">{warning}</div>
{/if}

{#if showPasswordSuggestions && value.length > 0 && suggestions.length > 0}
  {#each suggestions as suggestion}
    <div class="text-xs text-yellow-500">{suggestion}</div>
  {/each}
{/if}
