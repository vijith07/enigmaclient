<script lang="ts">
  import type { ISendResponse } from '../../../services/send'

  export let send: ISendResponse = {
    id: '',
    name: '',
    type_: 0,
    access_count: 0,
    data: '',
    user_id: -1,
    creation_time: '',
    expiration_time: '',
    disabled: false,
    hide_data: false,
    iv: '',
    password: '',
    deletion_time: '',
    encrypted_key: '',
    hide_email: false,
    max_access_count: 0,
    notes: '',
    revision_time: '',
  }
  const shareLink: string = `http://localhost:5173/sa/${send.id}/${send.encrypted_key}`

  const generateLink = () => {
    navigator.clipboard.writeText(shareLink)
  }
</script>

<div class="card bg-transparent shadow-lg">
  <div class="card-body flex flex-row items-center">
    <div class="card-title text-base text-white">{send.name}</div>
    <!--  if the send is disabled, display a warning -->

    <!--  if the send is expired, display a warning -->
    {#if send.password && send.password.length > 0}
      <div>🔑</div>
    {/if}
    {#if send.type_ === 0}
      <div>📄</div>
    {:else if send.type_ === 1}
      <div>📁</div>
    {/if}
    <!-- <div class="card-body text-base text-primary">{send.data}</div> -->
    <!--  if max_access_count is set, display a badge -->
    {#if send.max_access_count > 0}
      <div class="badge badge-info">
        {send.max_access_count - send.access_count} access left
      </div>
    {/if}

    {#if send.expiration_time}
      {#if new Date(send.expiration_time) < new Date()}
        <div class="badge badge-outline">Expired</div>
      {/if}
    {/if}

    <div class="card-actions justify-end">
      <!-- treedots drop down -->
      <div class="dropdown dropdown-end">
        <div tabindex="0" class="btn btn-ghost text-white btn-sm rounded-btn">
          . . .
        </div>
        <ul
          tabindex="0"
          class="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52"
        >
          <li>
            <!-- button -->
            <button class="btn btn-ghost" on:click={generateLink}
              >Copy Link</button
            >
          </li>
          <li>
            <a>Remove Password</a>
          </li>
          <li>
            <a>Delete</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
