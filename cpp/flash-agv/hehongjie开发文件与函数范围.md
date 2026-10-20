# flash-agv：hehongjie 开发文件与函数范围

## 1. 口径与阅读方式

本清单依据本地 `flash-agv-develop-laser_agv` 的 Git 作者记录、当前源码逐行归属和函数定义整理，供查找贡献模块与理解函数职责。识别的作者身份包括公司邮箱与 GitHub 邮箱中的 `hehongjie`。这里只保留文件、函数及归属边界，不记录提交号、日期或署名行数。

“主体开发”表示核心实现可从作者记录和当前代码对应；“参与”表示在多人维护文件中修改了相关逻辑；“历史参与”表示曾实现或修改，但文件已经迁移、删除或被后续实现覆盖。函数名是理解代码的入口，不能仅凭函数列表推断整个函数、需求或项目均由一人独立完成。

表中的 `L` 是整理时对应源码的函数起始行，仅用于快速定位；不同代码包可能有偏移，可按文件路径和函数名搜索。历史文件在无 Git 的代码包中可能找不到，相关函数只作为贡献范围线索。

## 2. 主要开发范围

| 模块 | 核心文件 | 关键函数或职责 | 归属边界 |
| --- | --- | --- | --- |
| 任务编排 | `task_manager.h/.cpp` | 订单转换、任务初始化、路径位置、目标生成与发送、执行、取消/暂停/恢复 | 历史主链路参与；当前文件多人维护，业务动作等后续扩展另行区分 |
| 路径拼接 | `stitcher.h/.cpp` | `stitchOrders`、续单拼接、起始索引和移动类型 | 主体开发，当前仍有相关实现 |
| 路径裁断 | `pruner.h/.cpp` | `pruneOrders`、运动类型、顺滑过点、载体、上线、释放点、轨迹裁断 | 主体开发，当前仍有相关实现 |
| 任务工具 | `fsm_task.hpp`、`knowledge_base.hpp`、`nav_common.hpp`、`nav_base_client.h/.cpp`、`safety_client.hpp` | 状态机、共享任务数据、几何/索引工具、导航客户端、安全属性 | 多个文件有主体开发范围，部分接口经团队修改 |
| 地图处理 | `map_info.h/.cpp`、`map_manager.h/.cpp` | 地图解析、节点/边查询、地图更新、订单路径属性填充 | 与旧 `state_manager` 目录存在迁移关系，当前文件多人维护 |
| 二维码检码 | `tag_checker.h/.cpp` | 目标码选择、首码检查、检测处理和结果通知 | 主要功能有个人开发记录，地图加载等有后续修改 |
| 车辆状态 | 历史 `status_gather`、`status_monitor`、`fsm_common.hpp` | 状态汇聚、任务/异常上报、状态机 | 历史开发；当前 `StateManager` 已重写 |
| 通信与协议 | 历史 `comm_adapter`、`protocol_adapter`；当前 `comm_adapter_manager.cpp` | MQTT 订单和状态、VDA5050 编解码、车辆初始化和地图请求 | 旧实现不在当前源码；当前通信管理器只认定局部参与 |
| 底层导航与定位 | `nav_base.cpp`、`nav_controller.cpp`、`pose_locator.cpp`、`tag_localiser_manager.cc` | 导航任务、规划、位姿、二维码定位 | 参与修改，不归为整个底层模块独立开发 |

从系统调用看，任务入口经 `TaskManager` 转换订单，`NavStitcher` 接续路径，`NavPruner` 裁断本次可下发区间，`NavBaseClient` 下发导航目标；反馈再回到任务和状态模块。该链路是理解个人代码位置的地图，不表示每一环都由个人实现。

## 3. 核心任务链路

### 3.1 `src/order_manager/task_manager.cpp`、`include/order_manager/task_manager.h`

`TaskManager` 处于调度订单与底层导航之间：接收订单、转为内部路径，衔接已有任务，确定当前路径位置，裁断并发送目标，最后处理反馈和任务结束。当前文件由多人持续开发。下面列出的函数属于相关主链路；取放货/充电行为树、异步业务动作和部分活动目标结果保护是后续扩展，不应整体算作个人独立开发。

| 函数 / 接口 | 参考起始行 | 功能 | 归属提示 |
| --- | ---: | --- | --- |
| `TaskManager::taskTransform` | L1109 | 将订单节点和边转换为内部 `TaskPath` | 主链路参与 |
| `taskInit` | L1139 | 校验任务、调用拼接并初始化执行状态 | 主链路参与，多人修改 |
| `init` / `reset` | L233 / L246 | 初始化任务依赖并清理运行状态 | 参与，当前实现含后续修改 |
| `taskRouteLoc` / `firstTaskRouteLoc` | L1281 / L1393 | 续单与首单的路径位置判定 | 主链路参与 |
| `fillFirstRouteLoc` / `getRouteLoc` | L1346 / L1470 | 结合位姿和反馈形成当前路线位置 | 主链路参与 |
| `preprocessing` | L1560 | 对齐导航目标与反馈，准备路径状态 | 主链路参与 |
| `preprocessGoal` | L1686 | 根据裁断结果截取可下发的导航段 | 主链路参与 |
| `fillGoal` / `sendGoal` | L1724 / L1783 | 组装并发送 `NavBaseGoal` | 主链路参与 |
| `executeTask` / `taskProcess` | L1836 / L2014 | 周期执行任务、处理反馈与状态迁移 | 主链路参与，多人修改 |
| `cancelTask` / `pauseTask` / `resumeTask` | L1930 / L1976 / L1995 | 取消、暂停与恢复任务 | 主链路参与 |
| `publishTaskStatus` / `updateOrderState` | L291 / 头文件 L197 | 输出任务和订单状态 | 参与，当前状态出口多人维护 |
| `getAndPubPath` / `handleException` | 头文件 L194 / L205 | 输出当前路径与处理任务异常 | 参与，当前实现须结合源码区分 |
| `fillResult` | L1625 | 区分当前导航段和整单结果 | 参与，现有迟到结果保护含后续扩展 |

`include/order_manager/common/nav_structs.h` 中的 `TaskPath`、`PathPoint`、`RouteLocationInfo`、`PrunerIndex`、`InnerMBGoal`、`MoveBaseFeedback` 和 `MoveBaseResult` 是这条任务链的主要数据契约；结构及字段有团队后续修改。

### 3.2 `src/order_manager/stitcher.cpp`、`include/order_manager/stitcher.h`

`NavStitcher` 把新订单与已执行路径衔接，处理首单、续单与重复节点。当前核心实现保留较多作者代码。

| 函数 / 接口 | 参考起始行 | 功能 |
| --- | ---: | --- |
| `isSamePoint` / `isSameSubGoal` | L11 / L35 | 判断路径点和子目标是否可衔接 |
| `stitchWithLastPath` / `stitchWithoutLastPath` | L68 / L129 | 按有无旧路径拼接新订单 |
| `stitchOrders` | L143 | 统一拼接入口 |
| `calcStartIndex` | L174 | 根据车辆当前位置计算任务起始索引 |
| `fillMoveType` | L293 | 补齐路径点的移动类型 |

### 3.3 `src/order_manager/pruner.cpp`、`include/order_manager/pruner.h`

`NavPruner` 汇总多个裁断策略，为本轮下发计算有效路径区间。当前核心实现保留较多作者代码。

| 函数 / 接口 | 参考起始行 | 功能 |
| --- | ---: | --- |
| `pruneOrders` | L30 | 汇总各策略，确定本次下发区间 |
| `resetFrontIndex` | L97 | 修正路径前边界与当前位置关系 |
| `driveType` | L109 | 按行驶类型调整裁断边界 |
| `smoothThrough` | L162 | 处理顺滑过点与连续路径 |
| `carrierPrune` | L314 | 处理载体角度相关约束 |
| `upTrack` | L357 | 处理车辆上线时的路径边界 |
| `releasePruner` | L372 | 处理订单节点/边放行状态 |
| `trajectoryPrune` | L390 | 处理轨迹段的裁断范围 |

### 3.4 任务状态、共享数据与导航客户端

| 文件 | 主要函数 / 接口 | 功能与归属 |
| --- | --- | --- |
| `include/order_manager/utils/fsm_task.hpp` | `wait`、`init`、`run`、`pause`、`resume`、`stop`、`fail`、`reset` | 任务状态机；有个人开发记录，当前接口按源码核对 |
| `include/order_manager/utils/knowledge_base.hpp` | `State<T>::set` / `get` | 用互斥锁保存任务路径、目标、位姿及反馈等共享数据 |
| `include/order_manager/utils/nav_common.hpp` | 索引查找、位姿变换、距离/角度、任务编码和反馈对齐函数 | 任务与导航的公共工具；部分实现由团队修改 |
| `include/order_manager/utils/safety_client.hpp` | `sendSafetyAttr` | 把路径边属性转为安全膨胀和停车距离并下发 |
| `src/order_manager/utils/nav_base_client.cpp` | `sendGoal`（L99）、`getMbFeedback`（L57）、`getMbResult`（L33）、`cancelGoal`（L147）、`resetMb`（L136）、`fillReachScene`（L175） | 与底层 `NavBase` 交互；当前文件多人维护 |
| `include/order_manager/common/config_master.hpp` | `getConfig`、`setConfig` | 保存任务侧参数配置 |

## 4. 地图与二维码检码

### 4.1 `src/map_manager/map_info.cpp`、`src/map_manager/map_manager.cpp`

地图代码将地图 JSON 转成节点、边及轨迹属性，供任务转换、拼接和导航目标生成使用。相关代码从旧目录迁移到当前地图模块，整份文件不能按个人独立开发处理。

| 函数 / 接口 | 参考起始行 | 功能 | 归属提示 |
| --- | ---: | --- | --- |
| `MapInfo::constructMapInfo` | L41 | 解析地图节点、边和关联属性 | 历史开发并迁移，现有实现多人维护 |
| `MapInfo::getNodeInfo` / `getEdgeInfo` | L231 / L240 | 查询节点和边信息 | 参与 |
| `MapManager::updateMap` | L22 | 更新当前地图数据 | 参与 |
| `getMapSnapshot` | L75 | 获取地图快照供任务侧使用 | 参与 |
| `processNodeInfo` / `processEdgeInfo` | L147 / L171 | 把地图节点/边属性补到订单路径 | 参与 |

主要接口还可在 `include/map_manager/map_info.h` 和 `include/map_manager/map_manager.h` 查看。`updateMap` 的调用并不等于个人负责全部地图解析、缓存与发布能力。

### 4.2 `src/state_manager/visualmark_detect/tag_checker.cpp`、对应头文件

`TagChecker` 按任务路径和地图码位处理二维码检码，确定目标码、首码与检测结果。该模块有个人开发记录，地图加载与当前接入由团队继续修改。

| 函数 / 接口 | 参考起始行 | 功能 |
| --- | ---: | --- |
| `detectVisualmarks` | L66 | 接收并处理视觉标记检测信息 |
| `notifyResult` | L80 | 向相关模块通知检码结果 |
| `processDetection` | L232 | 判断检测是否满足当前任务要求 |
| `findTargetTagId` | L295 | 根据路径查找目标二维码 |
| `checkFirstTagId` | L369 | 检查首个二维码是否符合预期 |
| `getTagInTopoPoint` / `getNeighbors` | 在当前文件中按函数名搜索 | 查询拓扑点的码位及邻接关系 |

## 5. 状态、通信与协议边界

### 5.1 车辆状态的历史实现

早期状态相关文件包括 `include/state_manager/common/fsm_common.hpp`、`include/state_manager/status_gather.h`、`src/state_manager/status_gather.cpp` 和 `src/state_manager/status_monitor.cpp`。其中 `StatusGather::pubTaskStatus`、`pubActionStatus`、`pubSafetyStatus`、`transTaskStatus`、`transInfoAndError`、`getAllStatus` 负责汇聚任务、动作、安全和错误等状态；`StatusMonitor::fillStateMessage` 负责状态消息组织。

这些是历史参与范围。当前同名 `StateManager` 文件已经重写，不能把其当前状态机、错误管理和周期上传逻辑整体视为 hehongjie 的个人实现。无 Git 代码包可能不包含上述旧文件。

### 5.2 通信与 VDA5050 的历史实现

历史 `comm_adapter` 中的 `CommAdapter::initConfig`、`handleConnect`、`handleRawTask`、`onMessage`、`commThread` 和 `updateStatus` 对应 MQTT 配置、连接、订单接收与状态发送。历史 `protocol_adapter` 中的 `VDA5050V2ProtocolAdapter::taskDecoder`、`taskCoder`、`statusCoder`、`statusDecoder`，以及节点、边、动作和状态字段的 `parse*` / `fill*` 函数，对应 VDA5050 消息编解码；`ProtocolAdapterFactory::createAdapter` 负责选择协议适配器。

旧通信/协议源码当前已迁出或改由外部依赖承接，不能用当前 `CommAdapterManager` 的全部实现代表个人贡献。当前 `src/communication/comm_adapter_manager.cpp` 可核实的局部范围集中于 `initializeForAgv`（L415）和 `waitReadyAndRequestInitialMap`（L428）：初始化车辆身份，并在就绪后请求初始地图。

## 6. 参与修改的底层模块与工程支撑

以下文件仅能确认局部参与；它们用于理解任务链路的上下游，不应作为整模块独立负责来讲。

| 文件 | 相关函数 / 代码区域 | 边界 |
| --- | --- | --- |
| `src/nav_base/nav_base.cpp` | `acceptGoal`、`cancelGoal`、`taskThread`、`getFeedback`、`getResult` | 底层导航任务生命周期的参与修改 |
| `src/nav_base/nav_controller.cpp` | `planGlobalPath`（L1047）、`checkExceedToleDistNoTag`（L915）等 | 规划与无码检码距离等局部修改，控制器整体由团队维护 |
| `src/nav_base/core/pose_locator.cpp` | `init`（L25）、`getTaskPose`（L49） | 位姿和坐标系读取的局部修改 |
| `src/tag_localiser_manager/tag_localiser_manager.cc` | `init`、`getMapDataFromJson`、`dataProcessLoop` | 二维码定位初始化和数据转换的局部修改 |
| `include/common/filesystem_compat.h` | `getConfigFilePath`（L100） | 配置路径兼容代码 |
| `src/main.cpp`、构建与部署脚本 | 程序装配、构建配置、打包和上传入口 | 工程支撑参与，不能据此认定完整发布职责 |

本清单完成静态代码与作者归属核对，未运行车辆或验证实际业务效果。简历中的交付状态、效果和个人决策仍需结合真实项目经历确认。
