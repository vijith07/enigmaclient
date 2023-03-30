<!--  Password Input  with Password Strength Meter and Toggle -->


<script lang="ts">
    export let type = 'password'
    export let placeholder = ''
    export let value = type === 'text' ? '' : null
    export let label = ''
    export let topRightLabel = ''
    export let bottomLeftLabel = ''
    export let bottomRightLabel = ''
    export let id = ''
    export let error = ''
    export let showPassword = false

    // toggle show/hide password
    function toggleShowPassword() {
        showPassword = !showPassword
    }

</script>

<div class="form-control ">
    
</div>