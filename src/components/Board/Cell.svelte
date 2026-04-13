<script>
    import Candidates from './Candidates.svelte';
    import { SUDOKU_SIZE } from '@sudoku/constants';
    import { cursor } from '@sudoku/stores/cursor';

    export let value;
    export let cellX;
    export let cellY;

    export let disabled = false;
    export let userNumber = false;
    export let conflictingNumber = false;
    export let selected = false;
    export let sameArea = false;
    export let sameNumber = false;
    export let candidates = null;

    const borderRight = (cellX !== SUDOKU_SIZE && cellX % 3 !== 0);
    const borderRightBold = (cellX !== SUDOKU_SIZE && cellX % 3 === 0);
    const borderBottom = (cellY !== SUDOKU_SIZE && cellY % 3 !== 0);
    const borderBottomBold = (cellY !== SUDOKU_SIZE && cellY % 3 === 0);
</script>

<div class="cell row-start-{cellY} col-start-{cellX}"
     class:border-r={borderRight}
     class:border-r-4={borderRightBold}
     class:border-b={borderBottom}
     class:border-b-4={borderBottomBold}>

       <div class="cell-inner"
            class:user-number={userNumber}
            class:selected={selected}
            class:same-area={sameArea}
            class:same-number={sameNumber}
            class:conflicting-number={conflictingNumber}>

          {#if !disabled}
             <button class="cell-btn" on:click={cursor.set(cellX - 1, cellY - 1)}>
                {#if candidates}
                   <Candidates {candidates} />
                {:else}
                   <span class="cell-text">{value === 0 ? '' : value}</span>
                {/if}
             </button>
          {:else}
             <span class="cell-btn flex items-center justify-center font-bold {conflictingNumber ? '' : 'text-gray-900'}">
                <span class="cell-text">{value}</span>
             </span>
          {/if}

       </div>
</div>

<style>
    .cell { @apply h-full w-full row-end-auto col-end-auto bg-white; }
    .cell-inner { @apply relative h-full w-full text-gray-800; }
    .cell-btn { @apply absolute inset-0 h-full w-full outline-none; }
    .cell-text { @apply leading-none text-base; }

    @media (min-width: 300px) { .cell-text { @apply text-lg; } }
    @media (min-width: 350px) { .cell-text { @apply text-xl; } }
    @media (min-width: 400px) { .cell-text { @apply text-2xl; } }
    @media (min-width: 500px) { .cell-text { @apply text-3xl; } }
    @media (min-width: 600px) { .cell-text { @apply text-4xl; } }

    .user-number { @apply text-blue-600 font-medium; }
    .selected { @apply bg-blue-500 text-white; }
    .same-area { @apply bg-blue-100; }
    .same-number { @apply bg-blue-200; }
    .conflicting-number { @apply text-red-600 font-bold; }
</style>