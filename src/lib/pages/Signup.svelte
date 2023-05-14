<!-- Create Account -->
<script async script lang="ts">
  import { Link } from 'svelte-navigator'
  // @ts-ignore
  import { passwordStrengthCalculator } from '../../utils/passwordUtils'
  import Input from '../components/Input.svelte'
  import PasswordInput from '../components/PasswordInput.svelte'
  import { createAccount } from '../../services/auth'
  import { onMount } from 'svelte'
  import LoadingSpinner from '../components/LoadingSpinner.svelte'

  let redirectUrl: string | null = null
  let isLoading = false
  let name = ''
  let email = ''
  let masterPassword = ''
  let confirmMasterPassword = ''
  let passwordHint = ''
  let error = ''
  let emailError = ''
  let masterPasswordError = ''
  let confirmMasterPasswordError = ''
  let passwordStrength = 0
  let passwordStrengthProgress = '0'
  let passwordStrengthText = ''
  let passwordStrengthColor = 'progress-error'
  let passwordStrengthWarning = ''
  let passwordTimeToCrack = ''
  let passwordStrengthSuggestions = []

  $: if (masterPassword.length > 0) {
    const passwordStrengthDetails = passwordStrengthCalculator(masterPassword)
    passwordStrength = passwordStrengthDetails.strength
    passwordStrengthText = passwordStrengthDetails.message
    passwordStrengthSuggestions = passwordStrengthDetails.suggestions
    passwordStrengthWarning = passwordStrengthDetails.warning
    passwordTimeToCrack = passwordStrengthDetails.timeToCrack.toString()
    passwordStrengthColor =
      passwordStrength < 25
        ? 'progress-error'
        : passwordStrength < 50
        ? 'progress-warning'
        : passwordStrength < 75
        ? 'progress-info'
        : 'progress-success'
    passwordStrengthProgress = passwordStrength.toString()
  }

  // validate the inputs on submit
  const validateInputs = () => {
    emailError = ''
    masterPasswordError = ''
    confirmMasterPasswordError = ''
    if (email.length === 0) {
      emailError = 'Email is required'
      return false
    }

    if (masterPassword.length < 12) {
      masterPasswordError = 'Password must be at least 12 characters long'
      return false
    }
    // check if the master password is weak
    if (passwordStrength < 75) {
      masterPasswordError = 'Password is not strong enough'
      return false
    }
    if (masterPassword !== confirmMasterPassword) {
      confirmMasterPasswordError = 'Passwords do not match'
      return false
    }
    return true
  }

  let res = null
  // submit the form
  const submitForm = async () => {
    if (validateInputs()) {
      // clear the errors
      emailError = ''
      masterPasswordError = ''
      confirmMasterPasswordError = ''
      // create the account
      try {
        isLoading = true
        res = await createAccount(email, masterPassword, name, passwordHint)
        isLoading = false
        error = ''
        if (!redirectUrl) {
          window.location.replace('/send')
        } else {
          window.location.replace(redirectUrl)
        }
      } catch (err) {
        isLoading = false
        error = err.message
      }
    }
  }
  onMount(async () => {
    if (sessionStorage.getItem('token')) {
      window.location.replace('/')
    }
    const urlParams = new URLSearchParams(window.location.search)
    redirectUrl = urlParams.get('redirect')
  })
</script>

<!-- Create Account Form -->
{#if isLoading}
  <LoadingSpinner />
{:else}
  <form
    on:submit|preventDefault={submitForm}
    class="flex min-h-screen flex-col items-center gap-2 bg-gradient-to-b from-slate-800 to-base-200"
  >
    <div class="flex flex-col items-center gap-4 mt-10">
      <Link to="/" class=" text-3xl flex items-center gap-2">
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
      <div class="text-xl font-bold text-white">Create Account</div>
    </div>
    <div class="card flex-shrink-0 shadow-2xl bg-base-100">
      <div class="card-body">
        <div class="text-red-500">{error}</div>
        <Input
          label="Email"
          id="email"
          bind:value={email}
          topRightLabel="Required"
          error={emailError}
          bottomLeftLabel="You will use this to login."
          type="email"
          required={true}
        />

        <Input
          label="Name"
          id="name"
          bind:value={name}
          bottomLeftLabel="What should we call you?"
        />

        <PasswordInput
          label="Master Password"
          id="masterPassword"
          bind:value={masterPassword}
          bottomLeftLabel="Your master password cannot be recovered if you forget it! 12 character minimum"
          type="password"
          error={masterPasswordError}
          showPasswordToggle
          required={true}
        />

        <!-- password strength meter -->
        <div class="form-control">
          <!-- // value is the password strength -->
          <!--  conditionally render the color of the progress bar based on the strength -->
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
        </div>

        <!-- time to crack password -->
        {#if masterPassword.length > 0}
          <div class="text-xs text-gray-500">
            Time to crack: {passwordTimeToCrack}
          </div>
        {/if}

        {#if masterPassword.length > 0 && passwordStrengthWarning}
          <div class="text-xs text-red-500">{passwordStrengthWarning}</div>
        {/if}

        {#if masterPassword.length > 0 && passwordStrengthSuggestions.length > 0}
          {#each passwordStrengthSuggestions as suggestion}
            <div class="text-xs text-yellow-500">{suggestion}</div>
          {/each}
        {/if}

        <!-- <PasswordStrength
        value={masterPassword}
        showPasswordSuggestions
        showPasswordWarning /> -->

        <PasswordInput
          label="Confirm Master Password"
          id="confirmMasterPassword"
          bind:value={confirmMasterPassword}
          bottomLeftLabel="Confirm your master password"
          type="password"
          error={confirmMasterPasswordError}
          showPasswordToggle
          required={true}
        />
        <Input
          label="Password Hint"
          id="passwordHint"
          bind:value={passwordHint}
          bottomLeftLabel="A hint to help you remember your master password"
        />
      </div>
      <div class="form-control flex flex-col items-center">
        <button class="btn btn-primary w-1/2 m-2" type="submit">
          Create Account
        </button>
        <Link
          to="/login?redirect={redirectUrl}"
          class="btn btn-ghost m-2">Login</Link
        >
      </div>
    </div>
    <div class="my-2">© 2023 Enigma. All rights reserved.</div>
  </form>
{/if}
<!--  display contents in res if it is not null -->

<!-- {#if res}
  <div class="card">
    <div class="card-body">
      <pre>{JSON.stringify(res, null, 2)}</pre>
    </div>
  </div>
{/if} -->
