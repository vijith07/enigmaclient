<!-- file download card with meta data -->
<script lang="ts">
  import type { IFileDataResponse } from "../../services/send/types"
    export let fileData:IFileDataResponse = null
    export let onClick:()=>void = null
</script>

<div>
    <button class="btn btn-outline btn-info" on:click={onClick} >Download File {fileData.name}</button>
</div>
