export class Game {
  constructor({ sudoku, history = [], redoHistory = [] }) {
//    this.currentSudoku = sudoku;
//    this.history = history;           // 撤销栈
//    this.redoHistory = redoHistory;   // 重做栈
    //改进点：建立所有权。必须复印一份
    this.currentSudoku = sudoku.clone();
    this.history = history.map(s => s.clone());
    this.redoHistory = redoHistory.map(s => s.clone());
  }

  getSudoku() {
    //return this.currentSudoku;
    //改进点：封闭内部状态。只给复印件
    return this.currentSudoku.clone();
  }

  guess(move) {
    //每次落子前，把当前局面的snapshot压入撤销栈
    this.history.push(this.currentSudoku.clone());

    //只要发生新操作，必须清空重做栈
    this.redoHistory = [];

    //在当前局面执行落子
    this.currentSudoku.guess(move);
  }

  undo() {
    if (!this.canUndo()) return;

    //将当前状态压入重做栈
    this.redoHistory.push(this.currentSudoku.clone());
    //从撤销栈弹出上一个状态，覆盖为当前状态
    this.currentSudoku = this.history.pop();
  }

  redo() {
    if (!this.canRedo()) return;

    //将当前状态压回撤销栈
    this.history.push(this.currentSudoku.clone());
    //从重做栈弹出未来的状态，恢复为当前状态
    this.currentSudoku = this.redoHistory.pop();
  }

  canUndo() {
    return this.history.length > 0;
  }

  canRedo() {
    return this.redoHistory.length > 0;
  }

  //序列化整个游戏会话（包含历史记录）
  toJSON() {
    return {
      current: this.currentSudoku.toJSON(),
      history: this.history.map(s => s.toJSON()),
      redoHistory: this.redoHistory.map(s => s.toJSON())
    };
  }
}