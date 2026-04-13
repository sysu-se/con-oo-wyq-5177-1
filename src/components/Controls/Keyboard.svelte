<script>
    import { gameStore } from '../../stores/domainAdapter.js';
    import { cursor } from '@sudoku/stores/cursor';
    import { notes } from '@sudoku/stores/notes';
    import { candidates } from '@sudoku/stores/candidates';
    // 【修复】：删除了那个捣乱的 keyboardDisabled 引入

    const KEYBOARD = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    function handleInput(number) {
       // 防护盾：没选中格子时不执行
       if (!$cursor || $cursor.x === null || $cursor.y === null) return;

       if ($notes) {
          candidates.add($cursor, number);
       } else {
          gameStore.guess($cursor.y, $cursor.x, number);
       }
    }
</script>

<div class="grid grid-cols-9 gap-1">
   {#each KEYBOARD as number}
      <button class="btn btn-keyboard" on:click={() => handleInput(number)}>
         {number}
      </button>
   {/each}
</div>

<style>
    .btn-keyboard { @apply text-3xl font-light h-12 w-full p-0; }
</style>