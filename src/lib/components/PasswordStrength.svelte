<script lang="ts">
    import { onMount } from "svelte";
    import { passwordStrengthCalculator } from '../../utils/passwordUtils'

    export let showPasswordSuggestions = false;
    export let value = "";
    
    let passwordStrengthProgress = "";
    let passwordStrengthText = "";
    let passwordStrengthColor = "";
    let passwordSuggestions = [];
    
    // update the password strength meter
    function updatePasswordStrengthMeter(password = value) {
        const result = passwordStrengthCalculator(password);
        passwordStrengthText = result.message;
        passwordSuggestions = result.suggestions;
        if (result.strength < 30) {
            passwordStrengthColor = "progress-error";
        } else if (result.strength < 60) {
            passwordStrengthColor = "progress-warning";
        } else {
            passwordStrengthColor = "progress-success";
        }
        passwordStrengthProgress = result.strength.toString();
    }
    
    // update the password strength meter on mount
    onMount(() => {
        updatePasswordStrengthMeter();
    });
    
    // update the password strength meter on value change
    $: updatePasswordStrengthMeter();
</script>

<!-- password strength meter -->
<div class="form-control">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label">
    <span class="label-text">Password Strength</span>
    <span class="label-text-alt">{passwordStrengthText}</span>
  </label>
  <progress
    class={`progress ${passwordStrengthColor}`}
    value={passwordStrengthProgress}
    max="100"
  >
    {passwordStrengthText}
  </progress>

    <!-- password suggestions -->
    {#if showPasswordSuggestions}
        {#each passwordSuggestions as suggestion}
        <div class="text-xs text-gray-500">{suggestion}</div>
        {/each}
    {/if}
</div>
