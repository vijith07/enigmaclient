<script lang="ts">
  import { onMount } from 'svelte'
  import {
    aesDecrypt,
    aesEncrypt,
    generateAESKey,
  } from '../../utils/crypto/aesProvider'
  import { downloadFile, getFileSize } from '../../utils/file'
  let files: FileList = null
  let aesKey: CryptoKey = null
  let iv = window.crypto.getRandomValues(new Uint8Array(12))
  onMount(async () => {
    aesKey = await generateAESKey()
  })

  $: if (files) {
    uploadFile()
  }

  const uploadFile = async () => {
    let file = files[0]
    let fileData = await file.arrayBuffer()
    let encryptedFileData = await aesEncrypt(fileData, aesKey, iv)
    let encryptedFile = new File([encryptedFileData], file.name, {
      type: file.type,
    })
    downloadFile(encryptedFile, encryptedFile.name)
    encryptedFileData = await encryptedFile.arrayBuffer()
    let decryptedFileData = await aesDecrypt(encryptedFileData, aesKey, iv)
    let decryptedFile = new File([decryptedFileData], encryptedFile.name, {
      type: encryptedFile.type,
    })
    downloadFile(decryptedFile, decryptedFile.name)
  }
</script>

<!-- input file -->
<input type="file" id="file" bind:files />

<!-- show file meta data -->
{#if files}
  <p>File Name: {files[0].name}</p>
  <p>File Size : {getFileSize(files[0].size)}</p>
  <p>File Type: {files[0].type}</p>
{/if}
