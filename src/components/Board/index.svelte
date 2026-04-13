<script>
    import { gameStore } from '../../stores/domainAdapter.js';
    import { cursor } from '@sudoku/stores/cursor'; // 【关键修复】引入光标状态
    import Cell from './Cell.svelte';
</script>

<div class="board max-w-xl w-full mx-auto">
    <div class="square-wrapper">
        <div class="board-grid grid grid-cols-9 grid-rows-9 bg-gray-900 border-4 border-gray-900 select-none">
            {#each $gameStore.grid as row, y}
               {#each row as value, x}
                  <Cell
                     {value}
                     cellY={y + 1}
                     cellX={x + 1}
                     disabled={$gameStore.initialGrid[y][x] !== 0}
                     userNumber={$gameStore.initialGrid[y][x] === 0 && value !== 0}
                     conflictingNumber={$gameStore.conflicts[y][x]}
                     selected={$cursor && $cursor.x === x && $cursor.y === y}
                     sameNumber={$cursor && $cursor.x !== null && $cursor.y !== null && value !== 0 && value === $gameStore.grid[$cursor.y][$cursor.x]}
                  />
               {/each}
            {/each}
        </div>
    </div>
</div>

<style>
    .board { @apply px-4 pb-4; }
    .square-wrapper { position: relative; width: 100%; padding-bottom: 100%; }
    .board-grid { position: absolute; top: 0; left: 0; width: 100%; height: 100%; gap: 1px; }
</style>