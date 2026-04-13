export class Sudoku {
  constructor(grid) {
    //改进点：合法性校验。防止外部传入非法格式
        if (!grid || grid.length !== 9 || grid[0].length !== 9) {
          throw new Error("Invalid grid: 必须是 9x9 矩阵");
        }
        this.grid = grid.map(row => [...row]);
//    //必须深拷贝，切断与外部输入的引用联系，防止数据污染
//    this.grid = this._deepCopy(grid);
  }

  //内部深拷贝方法
  _deepCopy(matrix) {
    if (!matrix) return [];
    return matrix.map(row => [...row]);
  }

  getGrid() {
    //返回时也要深拷贝，防止 UI 组件意外修改底层数据
    return this._deepCopy(this.grid);
  }

//  guess(move) {
//    const { row, col, value } = move;
//    this.grid[row][col] = value;
//  }

    //改进点：防卫式编程。遵守数独规则，不合法的落子直接拦截
      guess(move) {
        const { row, col, value } = move;
        if (row < 0 || row > 8 || col < 0 || col > 8) {
          console.warn("坐标越界");
          return;
        }
        if (value < 0 || value > 9) {
          console.warn("数值非法");
          return;
        }
        this.grid[row][col] = value;
      }
  //供Game生成历史snapshot使用
  clone() {
    return new Sudoku(this.grid);
  }

  //序列化
  toJSON() {
    return {
      grid: this._deepCopy(this.grid)
    };
  }

  //外表化
//  toString() {
//    return this.grid.map(row => {
//      return row.map(cell => (cell === null ? '.' : cell)).join(' ');
//    }).join('\n');
//  }
    // 升级版外表化：带九宫格边框格式化
      toString() {
        let result = '\n+-------+-------+-------+\n';
        for (let r = 0; r < 9; r++) {
          result += '| ';
          for (let c = 0; c < 9; c++) {
            const val = this.grid[r][c];
            result += (val === null || val === 0 ? '.' : val) + ' ';
            //每3列画一条竖线
            if ((c + 1) % 3 === 0) result += '| ';
          }
          result += '\n';
          //每3行画一条横线
          if ((r + 1) % 3 === 0) result += '+-------+-------+-------+\n';
        }
        return result;
      }
}