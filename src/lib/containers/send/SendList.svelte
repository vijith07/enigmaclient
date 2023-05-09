<script lang="ts">
    interface ISend {
        id: number
        name: string
        email: string
        amount: number
        date: string
        type: string
    }
    let sends: ISend[]=[
        {id:1,name:'sdfjns',email:'fasfsadf',amount:3424,date:'sdf',type:'sdf'},
        {id:2,name:'sdfjns',email:'fasfsadf',amount:3424,date:'sdf',type:'sdf'},
        {id:3,name:'sdfjns',email:'fasfsadf',amount:3424,date:'sdf',type:'sdf'},
        {id:4,name:'sdfjns',email:'fasfsadf',amount:3424,date:'sdf',type:'sdf'},
    ]
    

</script>
<!--  loop through sends and display them -->
<div class="flex flex-col gap-2 mx-10"> 
    {#each sends as send}
            <div class="card shadow-xl bg-transparent">
            <div class="card-body">
               📄💬 {send.name}
            </div>
        </div>
    {/each}
</div>
 