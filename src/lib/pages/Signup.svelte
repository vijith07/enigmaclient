<!-- Create Account -->
<script async script>
  import { Link } from 'svelte-navigator'
  // @ts-ignore
  import { generatePBKDF2Hash } from '../../utils/pbkdf2HashGenerator'
  import { rsaGenerateKeyPair } from '../../utils/rsaProvider'
  import {onMount} from 'svelte'
  import { fromBufferToByteString, toBuf, toByteString } from '../../utils/common'
  import { aesEncrypt } from '../../utils/aesProvider'

    // generate a pbdf2 hash of the master password if the user has entered a master password and confirmed it

    // generate a rsa key pair on mount

    // encrypt the private key with the pbdf2 hash of the master password

    // store the encrypted private key , the public key, the email, the name, and the password hint in the database

    onMount(async () => {
      const keyPair = await rsaGenerateKeyPair(1024)
      console.log(keyPair[0])
      console.log(keyPair[1])
      const hash = await generatePBKDF2Hash('password', 'salt', 600000, "sha256" )
      console.log(hash)
      // const encryptedPrivateKey = await aesEncrypt(toBuf(keyPair[1]),
    })


  let name = ''
  let email = ''
  let masterPassword = ''
  let confirmMasterPassword = ''
  let passwordHint = ''
</script>

<!-- Create Account Form -->

<div
  class="flex min-h-screen flex-col items-center gap-4 bg-gradient-to-t from-slate-800 to-base-200"
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
  <div class="card flex-shrink-0 w-1/4 shadow-2xl bg-base-100">
    <div class="card-body">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Email</span>
        </label>
        <input
          type="email"
          placeholder="email"
          class="input input-bordered"
          id="email"
          bind:value={email}
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Name</span>
        </label>
        <input
          type="text"
          placeholder="name"
          class="input input-bordered"
          id="name"
          bind:value={name}
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Master Password</span>
        </label>
        <input
          type="password"
          placeholder="password"
          class="input input-bordered"
          id="masterPassword"
          bind:value={masterPassword}
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Confirm Master Password</span>
        </label>
        <input
          type="password"
          placeholder="password"
          class="input input-bordered"
          id="confirmMasterPassword"
          bind:value={confirmMasterPassword}
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Master Password Hint</span>
        </label>
        <input
          type="text"
          class="input input-bordered"
          id="hint"
          bind:value={confirmMasterPassword}
        />
      </div>
    </div>
    <div class="form-control flex flex-col items-center">
      <button class="btn btn-primary w-1/2 m-2">Create Account</button>
      <Link to="/login" class="btn btn-ghost m-2">Login</Link>
    </div>
  </div>
  <div>© 2023 Enigma. All rights reserved.</div>
</div>
