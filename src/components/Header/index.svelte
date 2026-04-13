<script>
    import Dropdown from './Dropdown.svelte';
    import Buttons from './Buttons.svelte';
</script>

<div class="px-4 py-4 flex justify-center text-white">
    <div class="w-full max-w-xl">

       <nav class="flex flex-wrap items-center justify-between">
          <Dropdown />

          <Buttons />
       </nav>

    </div>
</div>