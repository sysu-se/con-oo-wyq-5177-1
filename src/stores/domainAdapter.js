import { writable } from 'svelte/store';
import { createSudoku, createGame } from '../domain/index.js';

const SEED_GRID = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9], [4, 5, 6, 7, 8, 9, 1, 2, 3], [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 3, 1, 5, 6, 4, 8, 9, 7], [5, 6, 4, 8, 9, 7, 2, 3, 1], [8, 9, 7, 2, 3, 1, 5, 6, 4],
    [3, 1, 2, 6, 4, 5, 9, 7, 8], [6, 4, 5, 9, 7, 8, 3, 1, 2], [9, 7, 8, 3, 1, 2, 6, 4, 5]
];

function generatePuzzle() {
    let grid = SEED_GRID.map(row => [...row]);
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    nums.sort(() => Math.random() - 0.5);
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            grid[r][c] = nums[grid[r][c] - 1];
        }
    }
    for (let block = 0; block < 3; block++) {
        let offset = block * 3;
        let r1 = offset + Math.floor(Math.random() * 3);
        let r2 = offset + Math.floor(Math.random() * 3);
        let temp = grid[r1]; grid[r1] = grid[r2]; grid[r2] = temp;
    }
    let holes = 45;
    while (holes > 0) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);
        if (grid[r][c] !== 0) { grid[r][c] = 0; holes--; }
    }
    return grid;
}

// 检测冲突：查出所有违背数独规则的红字
function findConflicts(grid) {
    let conflicts = Array(9).fill(null).map(() => Array(9).fill(false));
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let v = grid[r][c];
            if (v === 0) continue;
            let isConflict = false;
            for (let i = 0; i < 9; i++) {
                if (i !== c && grid[r][i] === v) isConflict = true;
                if (i !== r && grid[i][c] === v) isConflict = true;
            }
            let br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
            for (let ir = 0; ir < 3; ir++) {
                for (let ic = 0; ic < 3; ic++) {
                    if ((br + ir !== r || bc + ic !== c) && grid[br + ir][bc + ic] === v) {
                        isConflict = true;
                    }
                }
            }
            conflicts[r][c] = isConflict;
        }
    }
    return conflicts;
}

function createGameStore() {
    let currentInitialGrid = generatePuzzle();
    // 深拷贝一份给底层逻辑，保护原题不被污染
    let gameInstance = createGame({ sudoku: createSudoku(currentInitialGrid.map(r => [...r])) });

    function getUIState() {
        const currentGrid = gameInstance.getSudoku().getGrid();
        return {
            grid: currentGrid,
            initialGrid: currentInitialGrid,
            conflicts: findConflicts(currentGrid),
            canUndo: gameInstance.history.length > 0,
            canRedo: gameInstance.redoHistory.length > 0
        };
    }

    const { subscribe, set } = writable(getUIState());

    return {
        subscribe,
        guess: (row, col, value) => {
            // 防护墙：如果是初始题目，或者坐标不存在，绝对不允许修改！
            if (row === undefined || col === undefined) return;
            if (currentInitialGrid[row][col] !== 0) return;

            gameInstance.guess({ row, col, value });
            set(getUIState());
        },
        undo: () => { gameInstance.undo(); set(getUIState()); },
        redo: () => { gameInstance.redo(); set(getUIState()); },
        newGame: () => {
            currentInitialGrid = generatePuzzle();
            gameInstance = createGame({ sudoku: createSudoku(currentInitialGrid.map(r => [...r])) });
            set(getUIState());
        }
    };
}

export const gameStore = createGameStore();