<script lang="ts">
  import { sendVerificationEmail } from '../../services/email'

  let isLoading = false
  let error = ''
  let message = ''
  const sendEmailVerification = async () => {
    try {
      isLoading = true
      const res = await sendVerificationEmail()
      message = res.message
      isLoading = false
    } catch (error) {
      isLoading = false
      error = error.message
    }
  }
</script>

{#if !(message.length > 0) && !(error.length > 0)}
  <div class="card shadow-lg text-base-content">
    <div class="card-body">
      <h2 class="card-title text-warning">⚠️ Verify Email</h2>
        <ul class="list-disc list-inside text-lg">
          <li>Looks like you haven't verified your email yet.</li>
          <li>Please click the button below to send a verification email.</li>
          <li>Check your spam folder if you don't see it in your inbox.</li>
        </ul>
      <div class="card-actions justify-end">
        <button
          class="btn btn-outline btn-success"
          on:click={sendEmailVerification}
          disabled={isLoading}
        >
          {#if isLoading}
            <div class="flex flex-row items-center justify-center">
              <div
                class="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-8 w-8"
              />
            </div>
          {:else}
            Send Verification Email
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
{#if message.length > 0}
  <!--  show success message that email was sent with out button -->
  <div class="card bg-transparent text-success">
    <div class="card-body">
      <h2 class="card-title">Email Sent ✅</h2>
      <p>{message}</p>
      <p>Check your email inbox for a verification email.</p>
      <p>Check your spam folder if you don't see it in your inbox.</p>
      <p>Verify your email to unlock all features.</p>
      <p>After you verify your email, please refresh the page.</p>
    </div>
  </div>
{/if}
{#if error.length > 0}
  <!--  show error message that email was sent -->
  <div class="card bg-transparent text-error">
    <div class="card-body">
      <h2 class="card-title">Failed to send email</h2>
      <p>{error}</p>
      <p>Please try again later.</p>
    </div>
  </div>
{/if}
