# con-oo-wyq-5177-1 - Review

## Review 结论

领域对象具备基本类结构和 Undo/Redo 语义，但当前提交仍是“局部接入”：Sudoku 没有真正承载数独规则，Svelte 端同时维护新旧两套状态流，导致设计质量与作业要求中的“真实接入”都未达标。

## 总体评价

| 维度 | 评价 |
| --- | --- |
| OOP | fair |
| JS Convention | fair |
| Sudoku Business | poor |
| OOD | poor |

## 缺点

### 1. 真实游戏生命周期仍由旧 stores 驱动，领域对象不是唯一核心

- 严重程度：core
- 位置：src/App.svelte:3-31; src/components/Modal/Types/Welcome.svelte:2-24; src/components/Header/Dropdown.svelte:11-65; src/components/Modal/Types/Share.svelte:5-17; src/components/Modal/Types/GameOver.svelte:3-17
- 原因：Board、Keyboard、Undo/Redo 走的是 src/stores/domainAdapter.js，但开局、切换难度、分享编码、胜利弹窗、暂停恢复仍依赖 @sudoku/game、@sudoku/stores/grid、@sudoku/stores/game。这样形成两套并行状态源，违反了作业要求中“开始一局游戏/界面渲染/输入/Undo Redo/自动更新都应真正消费领域对象”的目标，也使 UI 状态存在脱节风险。

### 2. 数独规则校验没有进入领域模型，非法落子仍可写入领域对象

- 严重程度：core
- 位置：src/domain/Sudoku.js:28-40; src/stores/domainAdapter.js:34-58; src/stores/domainAdapter.js:80-87
- 原因：Sudoku.guess 只检查坐标和 0..9 范围，不校验行/列/宫冲突，也不区分题面 givens 与玩家可编辑格。冲突检测被放在 store 层 findConflicts，固定格保护也只在 gameStore.guess 的 UI 防线里做。结果是领域对象本身并不维护数独业务不变量，任何绕过 UI 的调用都能写出业务上非法的盘面。

### 3. 存在重复的 Svelte 适配层，职责边界被拆成两套

- 严重程度：major
- 位置：src/stores/domainAdapter.js:60-95; src/node_modules/@sudoku/stores/grid.js:54-117
- 原因：项目里同时存在 createGameStore 和 @sudoku/stores/grid.js 中的 gameInstance 适配逻辑，两边都在把领域对象转成可渲染 grid，并分别承担输入、撤销、提示等职责。这不是清晰的单一 Store Adapter，而是并存的双适配层，后续任何规则变化都需要同步修改多处。

### 4. Svelte 适配层直接窥探 Game 内部字段

- 严重程度：major
- 位置：src/stores/domainAdapter.js:65-73
- 原因：gameStore 直接读取 gameInstance.history.length 和 gameInstance.redoHistory.length，而不是使用 Game.canUndo()/canRedo()。这让 UI 依赖 Game 的内部表示，削弱封装，也让后续修改历史实现方式时更容易破坏接入层。

### 5. 构造器校验不完整，防御式编程只做了一半

- 严重程度：minor
- 位置：src/domain/Sudoku.js:2-15
- 原因：当前只检查了 grid.length 和 grid[0].length，没有验证每一行都长度为 9、每个单元都是 number，也没有处理非数组行。对于承担领域边界的对象，这种半校验会让错误在更深层的位置才暴露。

### 6. 领域 API 用 console.warn 加 silent return 表达失败，不符合常见 JS 接口习惯

- 严重程度：minor
- 位置：src/domain/Sudoku.js:29-39
- 原因：guess 遇到非法输入时既不抛错，也不返回明确结果，只是打印 console.warn。调用方无法通过返回值判断操作是否成功，测试和上层适配也很难围绕失败路径建立清晰契约。

## 优点

### 1. 对外输入输出都做了拷贝，避免共享引用污染

- 位置：src/domain/Sudoku.js:7-21; src/domain/Sudoku.js:42-50
- 原因：构造时复制 grid，getGrid 和 toJSON 也返回新数组，clone 复用同一拷贝策略，能防止 UI 或测试代码通过共享二维数组破坏对象内部状态。

### 2. Undo/Redo 语义清晰且符合会话模型

- 位置：src/domain/Game.js:18-45
- 原因：每次 guess 前先快照入 history，新操作清空 redoHistory，undo/redo 互相搬运当前快照，这套时序与数独游戏的撤销重做语义一致，静态上容易验证。

### 3. Game 对 Sudoku 与历史快照建立了所有权

- 位置：src/domain/Game.js:2-16
- 原因：构造函数会 clone 当前 sudoku 与传入历史，getSudoku 也返回副本，避免调用方持有外部引用直接篡改会话内部状态。

### 4. 采用了 store adapter 思路把领域对象转成 Svelte 可消费状态

- 位置：src/stores/domainAdapter.js:60-95
- 原因：gameStore 暴露 subscribe、guess、undo、redo、newGame，并把 grid、conflicts、canUndo、canRedo 整理成纯数据，这个方向本身符合本次作业推荐的 Store Adapter 方案。

### 5. 部分核心交互已经改为通过领域接口进入

- 位置：src/components/Board/index.svelte:2-20; src/components/Controls/Keyboard.svelte:2-18; src/components/Controls/ActionBar/Actions.svelte:2-30
- 原因：棋盘渲染读取 $gameStore.grid，数字输入走 gameStore.guess，撤销重做走 gameStore.undo/redo，至少在局部流程上没有继续直接 mutate 旧二维数组。

## 补充说明

- 本次结论仅基于静态阅读，未运行 vitest，也未实际打开浏览器验证交互；涉及胜利判定、分享编码、暂停恢复是否出现用户可见异常的判断，依据的是导入关系与状态流分析。
- 审查范围限制在 src/domain/* 及其直接相关的 Svelte 接入文件：src/stores/domainAdapter.js、src/App.svelte、src/components/*，以及这些组件直接依赖的 @sudoku game/store 模块；未扩展到无关目录。
- 关于“两套状态源会脱节”的结论来自静态代码结构而非运行结果：从当前导入关系看，这个架构风险是确定存在的，但每条路径在运行时是否立刻表现为 bug，仍需实际运行后才能完全确认。
