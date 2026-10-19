# TaskManager：从 nav-manager 到 flash-agv

> 学习记录。个人开发范围以同目录的 `hehongjie开发文件与函数范围.md` 为口径；以下是当前两份源码的职责对照，不把当前整个 `TaskManager` 都视作个人独立开发。

## 一句话理解

`TaskManager` 是 flash-agv 的车端任务编排器：把调度订单变成内部路径，持续判断车走到哪里、下一段该下发什么导航目标，并处理任务的完成、失败、取消和状态回传。它不负责底层轨迹规划与电机控制。

## 与 nav-manager 的对应关系

| 环节 | nav-manager | flash-agv |
| --- | --- | --- |
| 外部任务入口 | `AccessLayer::executeCB` 接收 ROS `/vtr/move` Action Goal，选择 `NavPlugin` 等插件 | `CommAdapterManager` 接收 VDA5050 `OrderMessage`，调用 `TaskManager::taskInit` |
| 任务初始化 | `NavPlugin::taskInit` 处理调度任务、路径和初始化 | `TaskManager::taskTransform` 将订单节点/边转为 `TaskPath`；`taskInit` 进行拼接和状态初始化 |
| 周期执行 | `AccessLayer::executeCB` 循环调用 `NavPlugin::execute` | `TaskManager::taskProcess` 在独立线程中循环调用 `executeTask` |
| 路径处理 | `DispatchPreemptProcessor` 等处理调度路径；`Pruner` 裁断 | `NavStitcher` 拼接；`NavPruner` 裁断；`TaskManager` 调度二者 |
| 导航接口 | `NavPlugin` 经 `NavBaseClient` 向 `NavBaseServer` 送目标 | `TaskManager` 经 `NavBaseClient` 向 `NavBase` 送目标 |
| 结果出口 | `AccessLayer` 通过 ROS Action 反馈与结束任务 | `TaskManager::publishTaskStatus` 写入 `StateManager`，通信层上传 VDA5050 状态 |

nav-manager 自身已有 `nav_manager_node` 进程；两个版本的 `NavBaseClient` 也都直接调用导航对象的 `acceptGoal`。因此当前代码能确认的改造重点是**任务入口、编排职责和状态出口的重新组织**，不能简单表述为“把原本没有进程的代码进程化”或“首次把导航调用改为进程内调用”。flash-agv 的 `CMakeLists.txt` 将 `order_manager`、`nav_base`、`communication` 等库链接进 `flash_agv` 可执行程序。

## TaskManager 自身做的事

1. **接单并形成路径**：`taskTransform` 校验节点/边数量，借助 `MapManager` 将订单字段转换为车端路径点和边属性；`taskInit` 读取已有路径并调用 `NavStitcher` 接续新订单。
2. **管理任务生命周期**：任务 FSM 控制等待、初始化、运行、暂停、完成和失败；`cancelTask`、`pauseTask`、`resumeTask` 处理外部控制。`taskProcess` 是任务执行循环。
3. **决定当前进度与下一段目标**：`executeTask` 读取位姿、导航反馈与结果，经 `getRouteLoc` 计算当前路径位置，调用 `NavPruner` 得到本轮可执行区间，再经 `preprocessGoal`、`fillGoal`、`sendGoal` 下发导航目标。
4. **处理失败与回传状态**：订单转换、拼接、位姿获取、目标生成或下发失败时上报错误并切换任务状态；`publishTaskStatus` 把任务及动作状态写入 `StateManager`，由通信层对外上传。

## 一单任务如何被编排

1. `CommAdapterManager` 把收到的 `OrderMessage` 交给 `taskInit`。`taskTransform` 检查节点和边的数量关系，并通过 `MapManager::processNodeInfo`、`processEdgeInfo` 补齐车端执行所需的点、边属性。
2. `taskInit` 从知识库取上一份路径，交给 `NavStitcher::stitchOrders` 续接；成功后保存新路径。首单让 FSM 进入初始化状态，续单沿用当前任务状态。订单更新可能在旧导航目标执行期间到来，因此这里还要协调新旧路径和当前目标。
3. `taskProcess` 在任务线程中按 10 Hz 运行。只有相关任务状态才调用 `executeTask`；执行结束后根据结果切换 FSM、发布状态并清理任务。
4. `executeTask` 先读取位姿及 `NavBase` 反馈，经 `preprocessing` 对齐目标 `task_code`、过滤过期反馈，再通过 `getRouteLoc` 确认车在路径中的位置。
5. `NavPruner::pruneOrders` 给出当前允许执行的 `[front, back)` 路径区间；`preprocessGoal` 截取路径，`fillGoal` 转成 `NavBaseGoal`，`sendGoal` 经 `NavBaseClient` 送入 `NavBase`。同一目标与反馈对齐时会避免重复下发。
6. 导航结果返回后，`fillResult` 对照当前活动目标的 `task_code`，忽略旧目标的迟到结果；最终完成或失败由 `taskProcess` 收口。运行中也会经 `publishTaskStatus` 更新状态。

这里的关键难点是**异步一致性**：调度可能滚动更新订单，导航反馈可能滞后，当前路径与已下发的目标可能不在同一版本。路径索引、`task_code`、FSM 和互斥保护共同保证任务能继续推进且旧结果不会误结算新任务。

## 哪些逻辑有搬运和适配痕迹

以下是两份当前源码的静态对照，不代表逐行原样复制，也不单凭相似性判断作者：

| nav-manager 中的实现 | flash-agv 中的对应实现 | 变化 |
| --- | --- | --- |
| `nav_manager` 库中的 `NavPlugin`、`AccessLayer` 任务主循环 | `order_manager` 静态库中的 `TaskManager` | 从 ROS Action 任务与插件执行链，改为 VDA5050 订单驱动、独立任务线程和状态管理器回传；大量任务流程按新接口重组。 |
| `manager/src/code_inserting/pruner.cpp` 的 `Pruner` | `src/order_manager/pruner.cpp` 的 `NavPruner` | 核心区间合并结构、`smoothThrough`、`driveType`、`upTrack`、`trajectoryPrune` 等方法延续；旧调度交管、定位源等部分策略在当前调用路径中不同或不再启用。 |
| `DispatchPreemptProcessor::stitchWithLastPath` 等 | `NavStitcher::stitchWithLastPath` 等 | 延续新旧路径寻找重叠段并接续的思路；数据从旧调度路径改成 `TaskPath`/VDA5050 节点和边，比较条件也调整。 |
| `manager/src/utils/nav_base_client.cpp` | `src/order_manager/utils/nav_base_client.cpp` | 保留 `sendGoal`、`getMbFeedback`、`getMbResult`、`cancelGoal` 等接口形态；目标和反馈类型、依赖注入、时间/结果处理改为 flash-agv 环境。两个版本都直接调用导航对象的 `acceptGoal`。 |
| `navigation/nav_base` 库 | `src/nav_base` 库 | 都提供 `acceptGoal`、`getFeedback`、`getResult` 等导航接口；当前仅能确认接口和构建模块的对应，不能把整个库称作原样搬运。 |

flash-agv 的 `src/order_manager/CMakeLists.txt` 单独构建 `order_manager` 静态库，并链接 `nav_base`、`map_manager`、`state_manager` 和驱动等库；总工程再将这些库链接进 `flash_agv` 程序。VDA5050 的底层 `comm_adapter` 当前作为外部安装的共享库引入，不属于从 nav-manager 的 `nav_manager` 库直接搬运。

## 开发范围边界

`hehongjie开发文件与函数范围.md` 将 `taskTransform`、`taskInit`、路径位置计算、预处理、导航目标生成和发送、`executeTask`、取消/暂停/恢复及 `taskProcess` 列为 hehongjie 参与的任务主链路。`TaskManager` 当前还包含取放货/充电行为树、异步动作协调等后续代码；清单没有把这些函数列为他的现存署名工作。找工作时应讲清主链路工作及其边界，避免把整个当前类或底层导航算法都概括为个人完成。

## 源码入口

- nav-manager：`manager/src/access_layer.cpp`、`manager/src/plugin/nav_plugin.cpp`、`manager/src/dispatch/dispatch_preempt_processor.cpp`、`manager/src/code_inserting/pruner.cpp`。
- flash-agv：`src/communication/comm_adapter_manager.cpp`、`src/order_manager/task_manager.cpp`、`src/order_manager/stitcher.cpp`、`src/order_manager/pruner.cpp`、`src/order_manager/utils/nav_base_client.cpp`。
