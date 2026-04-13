import { Sudoku } from './Sudoku.js';
import { Game } from './Game.js';

export function createSudoku(input) {
  return new Sudoku(input);
}

export function createSudokuFromJSON(json) {
  return new Sudoku(json.grid);
}

export function createGame({ sudoku }) {
  return new Game({ sudoku });
}

export function createGameFromJSON(json) {
  //恢复当前局面
  const currentSudoku = createSudokuFromJSON(json.current);

  //恢复历史栈，把每个snapshot数据重新变成真正的Sudoku实例
  const history = json.history.map(state => createSudokuFromJSON(state));
  const redoHistory = json.redoHistory.map(state => createSudokuFromJSON(state));

  //组装并返回 Game 对象
  return new Game({
    sudoku: currentSudoku,
    history: history,
    redoHistory: redoHistory
  });
}