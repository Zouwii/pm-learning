# flash-agv：hehongjie 开发文件与函数范围

整理日期：2026-10-14。

源码基线：`0fe69a049a1b878aa87dc80a545fa07f7bcbc3a1`。函数行号对应该 Git 版本；历史文件另注明快照版本。

## 1. 统计口径与阅读方式

本清单依据本地仓库 `HEAD` 可达的 Git 作者记录、文件新增/修改/删除及重命名记录、`git blame` 和源码函数定义整理。它是代码贡献溯源，不是当前人员职责或架构归属调整。

识别到的作者身份：

- `hehongjie <hehongjie@iplusbot.cn>`：342 条提交记录。
- `hehongjie <76713209+dszhhj@users.noreply.github.com>`：2 条提交记录。

合计 **344 条提交**，作者日期范围 **2025-09-03 至 2026-07-08**。本地仓库不是浅克隆；未拉取远端，本清单不声称覆盖尚未进入本地 HEAD 的分支或提交。

- **当前相关文件：59 个**，其中 **32 个有作者新增记录**（包含旧路径新增后迁移到现路径），另 **27 个为参与修改文件**。
- **历史独立路径：36 个**，当前已不存在或不再作为本仓库源码；大小写不同的历史路径分别记录，不等同于独立逻辑文件数。
- 当前文件列出 **678 个函数/接口条目**，包含头文件声明、内联实现、源文件定义、Shell 和 CMake 函数；声明与定义、重载分别计数，不是去重后的函数数量。
- 对 **3 个当前 C/C++ 文件已无作者署名行的情况**，补列最后可查的作者参与快照。

“历史新增”仅表示 hehongjie 的提交新增过该文件；多人后续修改后的整份文件、整段函数不能直接认定均由他独立开发。“署名行”来自指定版本的 `git blame`，包含注释、空行及括号，仅辅助溯源，不代表开发工作量。函数内有署名行也不等于整个函数归他所有；0 行也不否定被后续覆盖的历史贡献。

**函数范围有两层含义：**每个文件说明职责/功能范围；函数表列出名称及 `L起始–L结束` 的源码范围。范围包含函数声明或定义本身，不包含前置注释、模板前缀；不展开宏生成函数，不单列匿名 lambda。默认/禁用接口明确标注。头文件中只声明但未在对应源文件实现的函数，仍按“声明”列出。

当前文件链接指向仓库源码。历史文件不能用当前路径打开，按第 4 节给出的 Git 快照读取。章节按检索主题组织，不改变既有模块分类图或维护人。

## 2. 主要开发范围

| 范围 | 主要文件 | 主要函数或职责 | 归属说明 |
| --- | --- | --- | --- |
| 任务处理 | `task_manager.h/.cpp` | `taskInit`、`taskTransform`、`getRouteLoc`、`preprocessing`、`fillGoal`、`sendGoal`、`executeTask`、`cancelTask`、`pauseTask`、`resumeTask` | 历史 `order_manager` 更名/迁移；当前多人共同修改 |
| 路径裁断 | `pruner.h/.cpp` | `pruneOrders` 及运动类型、顺滑过点、载体、上线、释放点、轨迹裁断 | 新增开发，当前保留大量署名代码 |
| 路径拼接 | `stitcher.h/.cpp` | `stitchOrders`、`stitchWithLastPath`、`calcStartIndex`、`fillMoveType` | 新增开发，当前保留大量署名代码 |
| 任务工具 | `fsm_task.hpp`、`knowledge_base.hpp`、`nav_common.hpp`、`nav_base_client.h/.cpp`、`safety_client.hpp` | 任务状态机、共享状态、几何/索引工具、导航客户端、安全属性下发 | 包含历史目录迁移 |
| 地图处理 | `map_info.h/.cpp`、`map_manager.h/.cpp` | `constructMapInfo`、`getNodeInfo`、`getEdgeInfo`、`updateMap`、`processNodeInfo`、`processEdgeInfo` | 历史位于 `state_manager`，当前迁至 `map_manager` |
| 二维码检码 | `tag_checker.h/.cpp` | `detectVisualmarks`、`processDetection`、`findTargetTagId`、`checkFirstTagId`、`notifyResult` | 新增开发；地图加载函数后续有修改 |
| 车辆状态 | `state_manager.h/.cpp`、历史 `status_gather`、`status_monitor`、`fsm_common.hpp` | 原车辆状态机、状态汇聚及状态消息上报 | 当前 StateManager 已重写，须区分历史快照和当前实现 |
| 通信与协议 | 当前 `comm_adapter_manager.h/.cpp`，历史 `comm_adapter`、`protocol_adapter` | MQTT 连接/订单接收/状态发送，VDA5050 编解码及工厂 | 旧通信/协议源码不在当前仓库树；当前使用外部安装依赖 |
| 导航和二维码定位 | `nav_base.cpp`、`nav_controller.cpp`、`pose_locator.cpp`、`tag_localiser_manager.cc` | 导航任务、全局规划、检码距离、定位初始化及数据转换 | 属于参与修改，不据此归为整文件独立开发 |

旧通信/协议的外部依赖依据：当前 `CMakeLists.txt` 的 `ADAPTER_DIR` 指向 `/opt/jz/jz-motion-common/protocol_comm_adapter`，检查外部头文件和动态库，并将旧 `src/protocol_adapter`、`src/comm_adapter` 子目录构建注释掉。本清单仅分析 flash-agv 本地 Git 历史，未扩展到外部项目。

## 3. 当前文件及函数范围

### 3.1 任务处理与任务工具

| 文件名（相对仓库根目录） | 贡献类型 | 函数/接口条目 | 当前署名行 / 全部行 |
| --- | --- | --- | --- |
| [include/order_manager/common/config_master.hpp](#file-1) | 历史新增 | 5 | 56 / 56 |
| [include/order_manager/common/nav_enums.h](#file-2) | 历史新增 | 0 | 35 / 46 |
| [include/order_manager/common/nav_structs.h](#file-3) | 历史新增 | 14 | 250 / 250 |
| [include/order_manager/pruner.h](#file-4) | 历史新增 | 19 | 77 / 81 |
| [include/order_manager/stitcher.h](#file-5) | 历史新增 | 10 | 34 / 48 |
| [include/order_manager/task_manager.h](#file-6) | 历史新增 | 53 | 116 / 253 |
| [include/order_manager/utils/fsm_task.hpp](#file-7) | 历史新增 | 13 | 154 / 162 |
| [include/order_manager/utils/knowledge_base.hpp](#file-8) | 历史新增 | 7 | 64 / 64 |
| [include/order_manager/utils/nav_base_client.h](#file-9) | 历史新增 | 9 | 79 / 94 |
| [include/order_manager/utils/nav_common.hpp](#file-10) | 历史新增 | 17 | 179 / 202 |
| [include/order_manager/utils/safety_client.hpp](#file-11) | 历史新增 | 1 | 37 / 40 |
| [src/order_manager/CMakeLists.txt](#file-12) | 历史新增 | 0 | 79 / 94 |
| [src/order_manager/pruner.cpp](#file-13) | 历史新增 | 12 | 465 / 469 |
| [src/order_manager/stitcher.cpp](#file-14) | 历史新增 | 10 | 339 / 342 |
| [src/order_manager/task_manager.cpp](#file-15) | 历史新增 | 58 | 886 / 2096 |
| [src/order_manager/utils/nav_base_client.cpp](#file-16) | 历史新增 | 8 | 161 / 224 |

<a id="file-1"></a>

#### [include/order_manager/common/config_master.hpp](../../include/order_manager/common/config_master.hpp)

功能范围：任务侧 NavParams 参数容器；ConfigMaster 单例提供线程安全的 getConfig、setConfig。

新增依据：`74d6e684`，2025-09-24，历史路径 `include/order_manager/common/config_master.hpp`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `ConfigMaster::getInstance` | `L35–L38` | 定义 | 4 |
| `ConfigMaster::getConfig` | `L39–L42` | 定义 | 4 |
| `ConfigMaster::setConfig` | `L44–L47` | 定义 | 4 |
| `ConfigMaster::ConfigMaster` | `L50–L50` | 定义 | 1 |
| `ConfigMaster::~ConfigMaster` | `L51–L51` | 定义 | 1 |

<a id="file-2"></a>

#### [include/order_manager/common/nav_enums.h](../../include/order_manager/common/nav_enums.h)

功能范围：路径裁断类型、移动类型、到点方式和任务错误码枚举；无函数。

新增依据：`314a0c9c`，2025-09-23，历史路径 `include/order_manager/common/nav_enums.h`。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="file-3"></a>

#### [include/order_manager/common/nav_structs.h](../../include/order_manager/common/nav_structs.h)

功能范围：任务路径、节点/边属性、裁断索引、路线定位、导航目标/反馈/结果与订单状态结构，函数主要为默认构造和初始化。

新增依据：`314a0c9c`，2025-09-23，历史路径 `include/order_manager/common/nav_structs.h`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `PrunerIndex::PrunerIndex` | `L32–L32` | 定义 | 1 |
| `IndexInfo::IndexInfo` | `L40–L42` | 定义 | 3 |
| `NodeInfo::NodeInfo` | `L53–L56` | 定义 | 4 |
| `EdgeInfo::EdgeInfo` | `L72–L77` | 定义 | 6 |
| `PathPoint::PathPoint` | `L90–L94` | 定义 | 5 |
| `TaskPath::TaskPath` | `L116–L128` | 定义 | 13 |
| `RouteLocationInfo::RouteLocationInfo` | `L141–L143` | 定义 | 3 |
| `PrunerParam::PrunerParam` | `L151–L151` | 定义 | 1 |
| `MoveBaseFeedback::MoveBaseFeedback` | `L185–L189` | 定义 | 5 |
| `MoveBaseResult::MoveBaseResult` | `L201–L202` | 定义 | 2 |
| `MoveBaseResult::MoveBaseResult` | `L203–L204` | 定义 | 2 |
| `InnerMBGoal::InnerMBGoal` | `L219–L221` | 定义 | 3 |
| `GetRouteLocationParam::GetRouteLocationParam` | `L230–L230` | 定义 | 1 |
| `OrderState::OrderState` | `L244–L246` | 定义 | 3 |

<a id="file-4"></a>

#### [include/order_manager/pruner.h](../../include/order_manager/pruner.h)

功能范围：NavPruner 路径裁断接口；包含主裁断入口、裁断索引访问和各类裁断策略声明。

新增依据：`314a0c9c`，2025-09-23，历史路径 `include/order_manager/pruner.h`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `NavPruner::pruneOrders` | `L26–L27` | 声明 | 2 |
| `NavPruner::NavPruner` | `L28–L28` | 声明 | 1 |
| `NavPruner::~NavPruner` | `L29–L29` | 声明 | 1 |
| `NavPruner::getPruneIndex` | `L30–L30` | 定义 | 1 |
| `NavPruner::reset` | `L31–L31` | 声明 | 1 |
| `NavPruner::setSendMovebasePruneIndex` | `L32–L34` | 定义 | 3 |
| `NavPruner::getSendMovebasePruneIndex` | `L35–L35` | 定义 | 1 |
| `NavPruner::smoothThrough` | `L42–L42` | 声明 | 1 |
| `NavPruner::driveType` | `L43–L43` | 声明 | 1 |
| `NavPruner::carrierPrune` | `L44–L45` | 声明 | 2 |
| `NavPruner::locPrune` | `L46–L47` | 声明 | 2 |
| `NavPruner::upTrack` | `L48–L48` | 声明 | 1 |
| `NavPruner::lonOrLateralPrune` | `L49–L49` | 声明 | 1 |
| `NavPruner::trajectoryPrune` | `L50–L50` | 声明 | 1 |
| `NavPruner::reqRoutePrune` | `L51–L52` | 声明 | 2 |
| `NavPruner::rotatePrune` | `L53–L53` | 声明 | 1 |
| `NavPruner::releasePruner` | `L54–L55` | 声明 | 2 |
| `NavPruner::resetFrontIndex` | `L56–L57` | 声明 | 2 |
| `NavPruner::print` | `L58–L58` | 声明 | 1 |

<a id="file-5"></a>

#### [include/order_manager/stitcher.h](../../include/order_manager/stitcher.h)

功能范围：NavStitcher 路径拼接接口。

新增依据：`314a0c9c`，2025-09-23，历史路径 `include/order_manager/stitcher.h`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `NavStitcher::stitchOrders` | `L14–L14` | 声明 | 1 |
| `NavStitcher::NavStitcher` | `L21–L21` | 声明 | 1 |
| `NavStitcher::~NavStitcher` | `L22–L22` | 声明 | 1 |
| `NavStitcher::isSameSubGoal` | `L37–L37` | 声明 | 1 |
| `NavStitcher::isSamePoint` | `L38–L38` | 声明 | 1 |
| `NavStitcher::stitchWithLastPath` | `L39–L39` | 声明 | 1 |
| `NavStitcher::stitchWithoutLastPath` | `L40–L40` | 声明 | 1 |
| `NavStitcher::calcStartIndex` | `L41–L41` | 声明 | 1 |
| `NavStitcher::fillMoveType` | `L42–L42` | 声明 | 1 |
| `NavStitcher::printPath` | `L43–L43` | 声明 | 1 |

<a id="file-6"></a>

#### [include/order_manager/task_manager.h](../../include/order_manager/task_manager.h)

功能范围：TaskManager 任务初始化、取消/暂停/恢复、路径定位、目标预处理及发送接口；当前也包含后续新增的业务动作协调接口。

历史关联路径：`include/order_manager/order_manager.h`、`src/order_manager/order_manager.h`。

新增依据：`945aa75f`，2025-09-03，历史路径 `src/order_manager/order_manager.h`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `TaskManager::TaskManager` | `L31–L36` | 声明 | 0 |
| `TaskManager::~TaskManager` | `L37–L37` | 声明 | 1 |
| `TaskManager::taskInit` | `L44–L44` | 声明 | 1 |
| `TaskManager::cancelTask` | `L51–L51` | 声明 | 1 |
| `TaskManager::pauseTask` | `L58–L58` | 声明 | 1 |
| `TaskManager::resumeTask` | `L65–L65` | 声明 | 1 |
| `TaskManager::isIdleForInstantAction` | `L69–L69` | 声明 | 0 |
| `TaskManager::executeTask` | `L101–L101` | 声明 | 1 |
| `TaskManager::taskProcess` | `L103–L103` | 声明 | 1 |
| `TaskManager::taskTransform` | `L105–L106` | 声明 | 2 |
| `TaskManager::init` | `L107–L107` | 声明 | 1 |
| `TaskManager::reset` | `L108–L108` | 声明 | 1 |
| `TaskManager::publishTaskStatus` | `L110–L110` | 声明 | 1 |
| `TaskManager::collectOrderActions` | `L111–L112` | 声明 | 0 |
| `TaskManager::applyCompletedBusinessAction` | `L113–L114` | 声明 | 0 |
| `TaskManager::collectBusinessActionsForCurrentTask` | `L115–L116` | 声明 | 0 |
| `TaskManager::handleBusinessActionsAfterNavigation` | `L117–L119` | 声明 | 0 |
| `TaskManager::syncNavStateToAsyncAdapter` | `L120–L122` | 声明 | 0 |
| `TaskManager::businessActionGoalDistanceMm` | `L123–L124` | 声明 | 0 |
| `TaskManager::feedbackDistanceMm` | `L125–L125` | 声明 | 0 |
| `TaskManager::segmentDistanceMeters` | `L126–L127` | 声明 | 0 |
| `TaskManager::topologyDistanceMeters` | `L128–L129` | 声明 | 0 |
| `TaskManager::ensureAsyncAdapter` | `L130–L130` | 声明 | 0 |
| `TaskManager::startCurrentBusinessAction` | `L131–L131` | 声明 | 0 |
| `TaskManager::pollCurrentBusinessActionState` | `L132–L132` | 声明 | 0 |
| `TaskManager::notifySuspendedBusinessAction` | `L133–L133` | 声明 | 0 |
| `TaskManager::pollSuspendedBusinessActionState` | `L134–L135` | 声明 | 0 |
| `TaskManager::suspendCurrentBusinessAction` | `L136–L139` | 声明 | 0 |
| `TaskManager::applySuspendedBusinessActionEffect` | `L144–L144` | 声明 | 0 |
| `TaskManager::clearSuspendedBusinessAction` | `L145–L145` | 声明 | 0 |
| `TaskManager::resetBusinessActions` | `L146–L146` | 声明 | 0 |
| `TaskManager::clearActiveNavGoal` | `L147–L147` | 声明 | 0 |
| `TaskManager::markActiveNavGoal` | `L148–L148` | 声明 | 0 |
| `TaskManager::hasActiveBusinessActions` | `L149–L151` | 定义 | 0 |
| `TaskManager::isBusinessActionStarted` | `L152–L156` | 定义 | 0 |
| `TaskManager::isNavigationFinishedBeforeBusiness` | `L157–L162` | 定义 | 0 |
| `TaskManager::ensureTagObservationSubscribed` | `L163–L163` | 声明 | 0 |
| `TaskManager::readFreshTagId` | `L164–L165` | 声明 | 0 |
| `TaskManager::actionStateId` | `L166–L168` | 声明 | 0 |
| `TaskManager::getRouteLoc` | `L170–L171` | 声明 | 2 |
| `TaskManager::firstTaskRouteLoc` | `L172–L174` | 声明 | 3 |
| `TaskManager::taskRouteLoc` | `L175–L176` | 声明 | 2 |
| `TaskManager::fillFirstRouteLoc` | `L177–L179` | 声明 | 3 |
| `TaskManager::preprocessing` | `L181–L182` | 声明 | 2 |
| `TaskManager::preprocessGoal` | `L184–L185` | 声明 | 2 |
| `TaskManager::fillGoal` | `L187–L187` | 声明 | 1 |
| `TaskManager::sendGoal` | `L189–L190` | 声明 | 2 |
| `TaskManager::fillResult` | `L192–L192` | 声明 | 1 |
| `TaskManager::getAndPubPath` | `L194–L194` | 声明 | 1 |
| `TaskManager::printSendGoal` | `L195–L195` | 声明 | 1 |
| `TaskManager::updateOrderState` | `L197–L200` | 定义 | 4 |
| `TaskManager::getOrderState` | `L201–L204` | 定义 | 4 |
| `TaskManager::handleException` | `L205–L209` | 定义 | 2 |

<a id="file-7"></a>

#### [include/order_manager/utils/fsm_task.hpp](../../include/order_manager/utils/fsm_task.hpp)

功能范围：任务状态机 FSM：wait、init、run、pause、resume、stop、fail、reset 及状态转换/查询。

历史关联路径：`include/order_manager/common/state_machine.hpp`、`include/order_manager/utils/state_machine.hpp`、`include/state_manager/state_machine.hpp`。

新增依据：`2e3a9cb1`，2025-09-25，历史路径 `include/state_manager/state_machine.hpp`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `FSM::FSM` | `L19–L19` | 定义 | 1 |
| `FSM::wait` | `L22–L35` | 定义 | 14 |
| `FSM::init` | `L37–L48` | 定义 | 12 |
| `FSM::run` | `L50–L62` | 定义 | 13 |
| `FSM::pause` | `L64–L75` | 定义 | 12 |
| `FSM::resume` | `L77–L88` | 定义 | 12 |
| `FSM::stop` | `L90–L101` | 定义 | 12 |
| `FSM::fail` | `L103–L108` | 定义 | 6 |
| `FSM::reset` | `L110–L121` | 定义 | 12 |
| `FSM::printState` | `L123–L125` | 定义 | 3 |
| `FSM::getState` | `L127–L130` | 定义 | 4 |
| `FSM::stateToString` | `L132–L149` | 定义 | 18 |
| `FSM::transition` | `L155–L159` | 定义 | 5 |

<a id="file-8"></a>

#### [include/order_manager/utils/knowledge_base.hpp](../../include/order_manager/utils/knowledge_base.hpp)

功能范围：任务共享知识库 KB；State<T>::set/get 使用互斥锁保存和读取任务路径、位姿、目标、反馈等共享数据。

历史关联路径：`include/order_manager/common/knowledge_base.hpp`。

新增依据：`01d4b345`，2025-09-24，历史路径 `include/order_manager/common/knowledge_base.hpp`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `KB::State::State` | `L13–L13` | 定义 | 1 |
| `KB::State::~State` | `L14–L14` | 定义 | 1 |
| `KB::State::set` | `L15–L19` | 定义 | 5 |
| `KB::State::get` | `L20–L24` | 定义 | 5 |
| `KB::instance` | `L31–L34` | 定义 | 4 |
| `KB::KB` | `L37–L37` | 定义 | 1 |
| `KB::~KB` | `L38–L38` | 定义 | 1 |

<a id="file-9"></a>

#### [include/order_manager/utils/nav_base_client.h](../../include/order_manager/utils/nav_base_client.h)

功能范围：NavBaseClient 导航客户端接口，用于发送/取消目标、获取反馈/结果和填充到点场景。

新增依据：`5041cfd1`，2025-10-28，历史路径 `include/order_manager/utils/nav_base_client.h`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `NavBaseClient::NavBaseClient` | `L24–L26` | 声明 | 0 |
| `NavBaseClient::~NavBaseClient` | `L27–L27` | 声明 | 1 |
| `NavBaseClient::getMbResult` | `L37–L37` | 声明 | 1 |
| `NavBaseClient::getMbFeedback` | `L48–L48` | 声明 | 1 |
| `NavBaseClient::sendGoal` | `L61–L62` | 声明 | 2 |
| `NavBaseClient::resetMb` | `L64–L64` | 声明 | 1 |
| `NavBaseClient::cancelGoal` | `L74–L74` | 声明 | 1 |
| `NavBaseClient::fillReachScene` | `L75–L75` | 声明 | 1 |
| `NavBaseClient::processTaskPriority` | `L81–L81` | 声明 | 1 |

<a id="file-10"></a>

#### [include/order_manager/utils/nav_common.hpp](../../include/order_manager/utils/nav_common.hpp)

功能范围：任务/导航通用工具：位姿转换、节点索引查找、距离/角度计算、点到线投影、任务编码和反馈对齐。

历史关联路径：`include/order_manager/common/nav_common.hpp`。

新增依据：`314a0c9c`，2025-09-23，历史路径 `include/order_manager/common/nav_common.hpp`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `intCast` | `L11–L13` | 定义 | 2 |
| `getCurWorldPose` | `L15–L15` | 声明 | 0 |
| `findNextDiffId` | `L17–L28` | 定义 | 11 |
| `findPreviousDiffId` | `L31–L45` | 定义 | 14 |
| `nodePositionToEigen` | `L47–L53` | 定义 | 6 |
| `getlineAngle` | `L55–L59` | 定义 | 4 |
| `getDiffAngle` | `L61–L69` | 定义 | 8 |
| `getYaw` | `L71–L76` | 定义 | 5 |
| `poseHypot2D` | `L77–L81` | 定义 | 4 |
| `point2Line` | `L83–L124` | 定义 | 40 |
| `calcTaskCode` | `L126–L131` | 定义 | 4 |
| `calcTaskIndex` | `L133–L136` | 定义 | 3 |
| `isValidTaskCode` | `L138–L140` | 定义 | 2 |
| `printTaskCode` | `L142–L146` | 定义 | 4 |
| `calcPathIndex` | `L148–L175` | 定义 | 24 |
| `taskFeedbackAlign` | `L177–L190` | 定义 | 13 |
| `transformPose` | `L192–L199` | 定义 | 7 |

<a id="file-11"></a>

#### [include/order_manager/utils/safety_client.hpp](../../include/order_manager/utils/safety_client.hpp)

功能范围：sendSafetyAttr 从当前路径边属性生成安全膨胀量和停车距离，更新安全模块属性。

历史关联路径：`src/order_manager/utils/safety_client.cpp`。

新增依据：`2dfff250`，2025-11-24，历史路径 `src/order_manager/utils/safety_client.cpp`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `sendSafetyAttr` | `L11–L37` | 定义 | 25 |

<a id="file-12"></a>

#### [src/order_manager/CMakeLists.txt](../../src/order_manager/CMakeLists.txt)

功能范围：该目录模块的构建、依赖链接及安装配置；无业务函数。

新增依据：`2e3a9cb1`，2025-09-25，历史路径 `src/order_manager/CMakeLists.txt`。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="file-13"></a>

#### [src/order_manager/pruner.cpp](../../src/order_manager/pruner.cpp)

功能范围：pruneOrders 合并裁断结果；driveType、smoothThrough、carrierPrune、upTrack、releasePruner、trajectoryPrune 处理运动类型、顺滑过点、载体角度、上线、释放点和轨迹分段。

新增依据：`314a0c9c`，2025-09-23，历史路径 `src/order_manager/pruner.cpp`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `NavPruner::NavPruner` | `L8–L15` | 定义 | 8 |
| `NavPruner::~NavPruner` | `L17–L17` | 定义 | 1 |
| `NavPruner::reset` | `L19–L24` | 定义 | 6 |
| `NavPruner::pruneOrders` | `L30–L86` | 定义 | 57 |
| `NavPruner::print` | `L88–L94` | 定义 | 7 |
| `NavPruner::resetFrontIndex` | `L97–L103` | 定义 | 6 |
| `NavPruner::driveType` | `L109–L138` | 定义 | 30 |
| `NavPruner::smoothThrough` | `L162–L307` | 定义 | 146 |
| `NavPruner::carrierPrune` | `L314–L352` | 定义 | 38 |
| `NavPruner::upTrack` | `L357–L370` | 定义 | 13 |
| `NavPruner::releasePruner` | `L372–L386` | 定义 | 15 |
| `NavPruner::trajectoryPrune` | `L390–L467` | 定义 | 78 |

<a id="file-14"></a>

#### [src/order_manager/stitcher.cpp](../../src/order_manager/stitcher.cpp)

功能范围：判断节点及子目标一致性，拼接新旧路径，计算起始索引并填充移动类型。

新增依据：`314a0c9c`，2025-09-23，历史路径 `src/order_manager/stitcher.cpp`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `NavStitcher::NavStitcher` | `L7–L7` | 定义 | 1 |
| `NavStitcher::~NavStitcher` | `L9–L9` | 定义 | 1 |
| `NavStitcher::isSamePoint` | `L11–L33` | 定义 | 23 |
| `NavStitcher::isSameSubGoal` | `L35–L66` | 定义 | 32 |
| `NavStitcher::stitchWithLastPath` | `L68–L127` | 定义 | 60 |
| `NavStitcher::stitchWithoutLastPath` | `L129–L141` | 定义 | 13 |
| `NavStitcher::stitchOrders` | `L143–L172` | 定义 | 30 |
| `NavStitcher::calcStartIndex` | `L174–L291` | 定义 | 118 |
| `NavStitcher::fillMoveType` | `L293–L328` | 定义 | 34 |
| `NavStitcher::printPath` | `L330–L339` | 定义 | 9 |

<a id="file-15"></a>

#### [src/order_manager/task_manager.cpp](../../src/order_manager/task_manager.cpp)

功能范围：订单转任务、路径定位、拼接/裁断协作、导航目标生成与发送、执行反馈及取消/暂停/恢复；后续业务动作和异步协调函数须按署名列区分。

历史关联路径：`src/order_manager/order_manager.cpp`。

新增依据：`945aa75f`，2025-09-03，历史路径 `src/order_manager/order_manager.cpp`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `btDiag` | `L36–L43` | 定义 | 0 |
| `normalizedActionType` | `L45–L53` | 定义 | 0 |
| `isPickAction` | `L55–L57` | 定义 | 0 |
| `isDropAction` | `L59–L61` | 定义 | 0 |
| `isChargeAction` | `L63–L65` | 定义 | 0 |
| `isPlaceholderAction` | `L67–L70` | 定义 | 0 |
| `isBusinessAction` | `L72–L74` | 定义 | 0 |
| `actionParamValue` | `L76–L82` | 定义 | 0 |
| `treeNameForAction` | `L84–L98` | 定义 | 0 |
| `defaultLoadState` | `L100–L104` | 定义 | 0 |
| `loadStateFromShelf` | `L106–L120` | 定义 | 0 |
| `statusFromResult` | `L122–L129` | 定义 | 0 |
| `TaskManager::TaskManager` | `L133–L167` | 定义 | 8 |
| `TaskManager::~TaskManager` | `L169–L179` | 定义 | 5 |
| `TaskManager::ensureTagObservationSubscribed` | `L181–L201` | 定义 | 0 |
| `TaskManager::readFreshTagId` | `L203–L224` | 定义 | 1 |
| `TaskManager::isIdleForInstantAction` | `L226–L231` | 定义 | 0 |
| `TaskManager::init` | `L233–L244` | 定义 | 8 |
| `TaskManager::reset` | `L246–L289` | 定义 | 28 |
| `TaskManager::publishTaskStatus` | `L291–L354` | 定义 | 8 |
| `TaskManager::collectOrderActions` | `L356–L366` | 定义 | 0 |
| `TaskManager::applyCompletedBusinessAction` | `L368–L408` | 定义 | 0 |
| `TaskManager::actionStateId` | `L410–L416` | 定义 | 0 |
| `TaskManager::collectBusinessActionsForCurrentTask` | `L418–L449` | 定义 | 0 |
| `TaskManager::feedbackDistanceMm` | `L451–L453` | 定义 | 0 |
| `TaskManager::segmentDistanceMeters` | `L455–L459` | 定义 | 0 |
| `TaskManager::topologyDistanceMeters` | `L461–L473` | 定义 | 0 |
| `TaskManager::businessActionGoalDistanceMm` | `L475–L530` | 定义 | 0 |
| `TaskManager::syncNavStateToAsyncAdapter` | `L532–L570` | 定义 | 0 |
| `TaskManager::notifySuspendedBusinessAction` | `L572–L591` | 定义 | 0 |
| `TaskManager::pollSuspendedBusinessActionState` | `L593–L652` | 定义 | 0 |
| `TaskManager::suspendCurrentBusinessAction` | `L654–L684` | 定义 | 0 |
| `TaskManager::applySuspendedBusinessActionEffect` | `L686–L697` | 定义 | 0 |
| `TaskManager::clearSuspendedBusinessAction` | `L699–L705` | 定义 | 0 |
| `TaskManager::clearActiveNavGoal` | `L707–L710` | 定义 | 0 |
| `TaskManager::markActiveNavGoal` | `L712–L724` | 定义 | 0 |
| `TaskManager::ensureAsyncAdapter` | `L726–L750` | 定义 | 0 |
| `TaskManager::startCurrentBusinessAction` | `L752–L829` | 定义 | 0 |
| `TaskManager::pollCurrentBusinessActionState` | `L831–L919` | 定义 | 0 |
| `TaskManager::handleBusinessActionsAfterNavigation` | `L921–L1064` | 定义 | 0 |
| `TaskManager::resetBusinessActions` | `L1066–L1084` | 定义 | 0 |
| `TaskManager::printSendGoal` | `L1086–L1107` | 定义 | 22 |
| `TaskManager::taskTransform` | `L1109–L1137` | 定义 | 22 |
| `TaskManager::taskInit` | `L1139–L1279` | 定义 | 96 |
| `TaskManager::taskRouteLoc` | `L1281–L1344` | 定义 | 64 |
| `TaskManager::fillFirstRouteLoc` | `L1346–L1389` | 定义 | 42 |
| `TaskManager::firstTaskRouteLoc` | `L1393–L1452` | 定义 | 60 |
| `TaskManager::getRouteLoc` | `L1470–L1558` | 定义 | 88 |
| `TaskManager::preprocessing` | `L1560–L1623` | 定义 | 64 |
| `TaskManager::fillResult` | `L1625–L1684` | 定义 | 19 |
| `TaskManager::preprocessGoal` | `L1686–L1722` | 定义 | 37 |
| `TaskManager::fillGoal` | `L1724–L1781` | 定义 | 58 |
| `TaskManager::sendGoal` | `L1783–L1834` | 定义 | 38 |
| `TaskManager::executeTask` | `L1836–L1928` | 定义 | 47 |
| `TaskManager::cancelTask` | `L1930–L1974` | 定义 | 27 |
| `TaskManager::pauseTask` | `L1976–L1993` | 定义 | 14 |
| `TaskManager::resumeTask` | `L1995–L2012` | 定义 | 14 |
| `TaskManager::taskProcess` | `L2014–L2093` | 定义 | 55 |

<a id="file-16"></a>

#### [src/order_manager/utils/nav_base_client.cpp](../../src/order_manager/utils/nav_base_client.cpp)

功能范围：对接 NavBase，完成 sendGoal、getMbFeedback、getMbResult、cancelGoal、resetMb、fillReachScene。

新增依据：`5041cfd1`，2025-10-28，历史路径 `src/order_manager/utils/nav_base_client.cpp`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `NavBaseClient::NavBaseClient` | `L12–L24` | 定义 | 4 |
| `NavBaseClient::~NavBaseClient` | `L26–L31` | 定义 | 6 |
| `NavBaseClient::getMbResult` | `L33–L55` | 定义 | 23 |
| `NavBaseClient::getMbFeedback` | `L57–L97` | 定义 | 26 |
| `NavBaseClient::sendGoal` | `L99–L134` | 定义 | 28 |
| `NavBaseClient::resetMb` | `L136–L145` | 定义 | 4 |
| `NavBaseClient::cancelGoal` | `L147–L173` | 定义 | 19 |
| `NavBaseClient::fillReachScene` | `L175–L221` | 定义 | 31 |

### 3.2 地图相关代码

| 文件名（相对仓库根目录） | 贡献类型 | 函数/接口条目 | 当前署名行 / 全部行 |
| --- | --- | --- | --- |
| [include/map_manager/map_info.h](#file-17) | 历史新增 | 4 | 156 / 178 |
| [include/map_manager/map_manager.h](#file-18) | 历史新增 | 14 | 48 / 65 |
| [src/map_manager/map_info.cpp](#file-19) | 历史新增 | 6 | 181 / 252 |
| [src/map_manager/map_manager.cpp](#file-20) | 历史新增 | 8 | 38 / 204 |

<a id="file-17"></a>

#### [include/map_manager/map_info.h](../../include/map_manager/map_info.h)

功能范围：地图节点、边、货架等数据结构，以及地图解析和查询接口。

历史关联路径：`include/state_manager/common/map_info.h`。

新增依据：`e414586a`，2026-03-18，历史路径 `include/state_manager/common/map_info.h`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `PairHash::operator()` | `L14–L18` | 定义 | 5 |
| `MapInfo::constructMapInfo` | `L160–L160` | 声明 | 1 |
| `MapInfo::getNodeInfo` | `L161–L161` | 声明 | 1 |
| `MapInfo::getEdgeInfo` | `L162–L162` | 声明 | 1 |

<a id="file-18"></a>

#### [include/map_manager/map_manager.h](../../include/map_manager/map_manager.h)

功能范围：地图管理接口：更新地图、查询快照、处理订单节点/边和读取地图 ID。

历史关联路径：`include/state_manager/map_manager.h`。

新增依据：`3c03f1a5`，2025-09-26，历史路径 `include/state_manager/map_manager.h`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `MapManager::getInstance` | `L18–L21` | 定义 | 4 |
| `MapManager::~MapManager` | `L22–L22` | 默认实现 | 1 |
| `MapManager::updateMap` | `L23–L23` | 声明 | 1 |
| `MapManager::getMapSnapshot` | `L24–L24` | 声明 | 0 |
| `MapManager::processNodeInfo` | `L25–L26` | 声明 | 2 |
| `MapManager::processEdgeInfo` | `L27–L28` | 声明 | 2 |
| `MapManager::selectShelfForLoadBinding` | `L29–L30` | 声明 | 0 |
| `MapManager::shutdown` | `L31–L31` | 声明 | 1 |
| `MapManager::getCurMapId` | `L33–L36` | 定义 | 4 |
| `MapManager::MapManager` | `L40–L40` | 声明 | 1 |
| `MapManager::MapManager` | `L43–L43` | 禁用接口 | 1 |
| `MapManager::operator=` | `L44–L44` | 禁用接口 | 1 |
| `MapManager::getMapSnapshotName` | `L45–L45` | 声明 | 0 |
| `MapManager::setCurMapId` | `L47–L51` | 定义 | 5 |

<a id="file-19"></a>

#### [src/map_manager/map_info.cpp](../../src/map_manager/map_info.cpp)

功能范围：constructMapInfo 解析地图 JSON；getNodeInfo、getEdgeInfo 查询节点与边。

历史关联路径：`src/state_manager/common/map_info.cpp`。

新增依据：`e414586a`，2026-03-18，历史路径 `src/state_manager/common/map_info.cpp`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `numberOrDefault` | `L12–L24` | 定义 | 0 |
| `intOrDefault` | `L26–L28` | 定义 | 0 |
| `stringOrDefault` | `L30–L37` | 定义 | 0 |
| `MapInfo::constructMapInfo` | `L41–L229` | 定义 | 158 |
| `MapInfo::getNodeInfo` | `L231–L238` | 定义 | 8 |
| `MapInfo::getEdgeInfo` | `L240–L249` | 定义 | 10 |

<a id="file-20"></a>

#### [src/map_manager/map_manager.cpp](../../src/map_manager/map_manager.cpp)

功能范围：地图更新和快照管理；processNodeInfo、processEdgeInfo 将订单节点/边与地图信息关联，生成任务路径属性。

历史关联路径：`src/state_manager/map_manager.cpp`。

新增依据：`3c03f1a5`，2025-09-26，历史路径 `src/state_manager/map_manager.cpp`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `MapManager::MapManager` | `L13–L15` | 定义 | 1 |
| `MapManager::shutdown` | `L17–L20` | 定义 | 1 |
| `MapManager::updateMap` | `L22–L73` | 定义 | 10 |
| `MapManager::getMapSnapshot` | `L75–L80` | 定义 | 2 |
| `MapManager::getMapSnapshotName` | `L82–L85` | 定义 | 0 |
| `MapManager::selectShelfForLoadBinding` | `L87–L145` | 定义 | 0 |
| `MapManager::processNodeInfo` | `L147–L169` | 定义 | 10 |
| `MapManager::processEdgeInfo` | `L171–L201` | 定义 | 7 |

### 3.3 状态与二维码检码

| 文件名（相对仓库根目录） | 贡献类型 | 函数/接口条目 | 当前署名行 / 全部行 |
| --- | --- | --- | --- |
| [include/state_manager/state_manager.h](#file-21) | 历史新增；同路径后续重建 | 53 | 0 / 148 |
| [include/state_manager/visualmark_detect/tag_checker.h](#file-22) | 历史新增 | 11 | 132 / 138 |
| [src/state_manager/CMakeLists.txt](#file-23) | 历史新增 | 0 | 64 / 83 |
| [src/state_manager/state_manager.cpp](#file-24) | 历史新增；同路径后续重建 | 59 | 0 / 787 |
| [src/state_manager/visualmark_detect/tag_checker.cpp](#file-25) | 历史新增 | 12 | 286 / 382 |

<a id="file-21"></a>

#### [include/state_manager/state_manager.h](../../include/state_manager/state_manager.h)

功能范围：当前 StateManager 状态汇聚、错误管理、状态请求、快照和上传接口；hehongjie 曾新增早期接口，随后删除该路径。当前为同路径后续实现，已无其署名行。

历史关联路径：`src/state_manager/state_manager.h`。

新增依据：`945aa75f`，2025-09-03，历史路径 `src/state_manager/state_manager.h`。

归属提示：以下是当前函数清单，当前 blame 已无 hehongjie 署名行；最后参与版本见第 5 节，不能把以下当前实现全部归于 hehongjie。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `StateManager::getInstance` | `L36–L36` | 声明 | 0 |
| `StateManager::setStatusUploader` | `L38–L38` | 声明 | 0 |
| `StateManager::bindResetStateCallback` | `L39–L39` | 声明 | 0 |
| `StateManager::unbindResetStateCallback` | `L40–L40` | 声明 | 0 |
| `StateManager::tick` | `L41–L41` | 声明 | 0 |
| `StateManager::start` | `L42–L42` | 声明 | 0 |
| `StateManager::stop` | `L43–L43` | 声明 | 0 |
| `StateManager::StateManager` | `L47–L47` | 声明 | 0 |
| `StateManager::~StateManager` | `L48–L48` | 声明 | 0 |
| `StateManager::currentErrors` | `L50–L50` | 声明 | 0 |
| `StateManager::getCarState` | `L51–L51` | 声明 | 0 |
| `StateManager::getHighestErrorLevel` | `L52–L52` | 声明 | 0 |
| `StateManager::getRobotPose` | `L53–L53` | 声明 | 0 |
| `StateManager::getVelocity` | `L54–L54` | 声明 | 0 |
| `StateManager::getLoadState` | `L55–L55` | 声明 | 0 |
| `StateManager::snapshot` | `L56–L56` | 声明 | 0 |
| `StateManager::requestState` | `L57–L57` | 声明 | 0 |
| `StateManager::reportError` | `L58–L58` | 声明 | 0 |
| `StateManager::clearError` | `L59–L59` | 声明 | 0 |
| `StateManager::updateTaskStatus` | `L61–L64` | 声明 | 0 |
| `StateManager::updateActionStatus` | `L65–L66` | 声明 | 0 |
| `StateManager::updateInstantActionStatus` | `L67–L68` | 声明 | 0 |
| `StateManager::updateMapStatus` | `L69–L69` | 声明 | 0 |
| `StateManager::updateRobotPose` | `L70–L70` | 声明 | 0 |
| `StateManager::updateVelocity` | `L71–L71` | 声明 | 0 |
| `StateManager::updateLoadState` | `L72–L72` | 声明 | 0 |
| `StateManager::clearLoadState` | `L73–L73` | 声明 | 0 |
| `StateManager::updateBatteryLevel` | `L74–L74` | 声明 | 0 |
| `StateManager::updateAutoChargeRequestLevel` | `L75–L75` | 声明 | 0 |
| `StateManager::updateVehicleConfigVersion` | `L76–L76` | 声明 | 0 |
| `StateManager::updateVehicleMetrics` | `L77–L77` | 声明 | 0 |
| `StateManager::updateCustomInfo` | `L78–L78` | 声明 | 0 |
| `StateManager::removeCustomInfo` | `L79–L79` | 声明 | 0 |
| `StateManager::nowMs` | `L81–L81` | 声明 | 0 |
| `StateManager::priorityHigher` | `L82–L82` | 声明 | 0 |
| `StateManager::loadErrorDefinitions` | `L84–L84` | 声明 | 0 |
| `StateManager::errorDefinitionFor` | `L85–L85` | 声明 | 0 |
| `StateManager::reportErrorLocked` | `L86–L86` | 声明 | 0 |
| `StateManager::clearErrorLocked` | `L87–L87` | 声明 | 0 |
| `StateManager::runThread` | `L88–L88` | 声明 | 0 |
| `StateManager::tickLocked` | `L89–L89` | 声明 | 0 |
| `StateManager::snapshotLocked` | `L90–L90` | 声明 | 0 |
| `StateManager::transitionLocked` | `L91–L91` | 声明 | 0 |
| `StateManager::resetToReadyLocked` | `L92–L92` | 声明 | 0 |
| `StateManager::hasErrorLevelLocked` | `L93–L93` | 声明 | 0 |
| `StateManager::hasAutoRecoverableLocked` | `L94–L94` | 声明 | 0 |
| `StateManager::highestErrorLevelLocked` | `L95–L95` | 声明 | 0 |
| `StateManager::refreshHighestErrorLevelLocked` | `L96–L96` | 声明 | 0 |
| `StateManager::runningRequestAliveLocked` | `L97–L97` | 声明 | 0 |
| `StateManager::naturalStateLocked` | `L98–L98` | 声明 | 0 |
| `StateManager::pruneTimedErrorsLocked` | `L99–L99` | 声明 | 0 |
| `StateManager::resetStateLocked` | `L100–L100` | 声明 | 0 |
| `StateManager::publishResetStateIfChanged` | `L101–L101` | 声明 | 0 |

<a id="file-22"></a>

#### [include/state_manager/visualmark_detect/tag_checker.h](../../include/state_manager/visualmark_detect/tag_checker.h)

功能范围：TagChecker 二维码检码接口，定义错误类型和检测结果。

新增依据：`e414586a`，2026-03-18，历史路径 `include/state_manager/visualmark_detect/tag_checker.h`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `TagChecker::TagChecker` | `L48–L48` | 声明 | 1 |
| `TagChecker::~TagChecker` | `L49–L49` | 声明 | 1 |
| `TagChecker::reset` | `L55–L55` | 声明 | 0 |
| `TagChecker::detectVisualmarks` | `L62–L62` | 声明 | 1 |
| `TagChecker::notifyResult` | `L70–L71` | 声明 | 2 |
| `TagChecker::getTagInTopoPoint` | `L78–L78` | 声明 | 0 |
| `TagChecker::getNeighbors` | `L84–L84` | 声明 | 0 |
| `TagChecker::getTagInTopoPose` | `L91–L91` | 声明 | 0 |
| `TagChecker::processDetection` | `L99–L100` | 声明 | 2 |
| `TagChecker::findTargetTagId` | `L109–L109` | 声明 | 1 |
| `TagChecker::checkFirstTagId` | `L117–L119` | 声明 | 3 |

<a id="file-23"></a>

#### [src/state_manager/CMakeLists.txt](../../src/state_manager/CMakeLists.txt)

功能范围：该目录模块的构建、依赖链接及安装配置；无业务函数。

新增依据：`3a52892a`，2025-09-25，历史路径 `src/state_manager/CMakeLists.txt`。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="file-24"></a>

#### [src/state_manager/state_manager.cpp](../../src/state_manager/state_manager.cpp)

功能范围：当前车辆状态机、错误管理、黑板读取、状态快照和周期上传实现；hehongjie 最初新增的是空占位文件，随后删除该路径。当前为同路径后续实现，已无其署名行。

新增依据：`945aa75f`，2025-09-03，历史路径 `src/state_manager/state_manager.cpp`。

归属提示：以下是当前函数清单，当前 blame 已无 hehongjie 署名行；最后参与版本见第 5 节，不能把以下当前实现全部归于 hehongjie。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `startupErrorDefinition` | `L33–L43` | 定义 | 0 |
| `statePriority` | `L45–L59` | 定义 | 0 |
| `errorLevelFromString` | `L61–L68` | 定义 | 0 |
| `isBlockingErrorLevel` | `L70–L73` | 定义 | 0 |
| `validCustomDataKey` | `L75–L80` | 定义 | 0 |
| `stateSignalValue` | `L83–L91` | 定义 | 0 |
| `StateManager::getInstance` | `L95–L98` | 定义 | 0 |
| `StateManager::StateManager` | `L100–L121` | 定义 | 0 |
| `StateManager::~StateManager` | `L123–L126` | 定义 | 0 |
| `StateManager::currentErrors` | `L128–L135` | 定义 | 0 |
| `StateManager::getCarState` | `L137–L140` | 定义 | 0 |
| `StateManager::getHighestErrorLevel` | `L142–L145` | 定义 | 0 |
| `StateManager::getRobotPose` | `L147–L151` | 定义 | 0 |
| `StateManager::getVelocity` | `L153–L157` | 定义 | 0 |
| `StateManager::getLoadState` | `L159–L163` | 定义 | 0 |
| `StateManager::snapshot` | `L165–L168` | 定义 | 0 |
| `StateManager::setStatusUploader` | `L170–L173` | 定义 | 0 |
| `StateManager::bindResetStateCallback` | `L175–L206` | 定义 | 0 |
| `StateManager::unbindResetStateCallback` | `L208–L213` | 定义 | 0 |
| `StateManager::tick` | `L215–L256` | 定义 | 0 |
| `StateManager::start` | `L258–L278` | 定义 | 0 |
| `StateManager::stop` | `L280–L285` | 定义 | 0 |
| `StateManager::requestState` | `L286–L321` | 定义 | 0 |
| `StateManager::reportError` | `L323–L327` | 定义 | 0 |
| `StateManager::clearError` | `L329–L332` | 定义 | 0 |
| `StateManager::reportErrorLocked` | `L334–L359` | 定义 | 0 |
| `StateManager::clearErrorLocked` | `L361–L373` | 定义 | 0 |
| `StateManager::updateTaskStatus` | `L375–L383` | 定义 | 0 |
| `StateManager::updateActionStatus` | `L385–L389` | 定义 | 0 |
| `StateManager::updateInstantActionStatus` | `L391–L411` | 定义 | 0 |
| `StateManager::updateMapStatus` | `L413–L417` | 定义 | 0 |
| `StateManager::updateRobotPose` | `L419–L422` | 定义 | 0 |
| `StateManager::updateVelocity` | `L424–L427` | 定义 | 0 |
| `StateManager::updateLoadState` | `L429–L435` | 定义 | 0 |
| `StateManager::clearLoadState` | `L437–L443` | 定义 | 0 |
| `StateManager::updateBatteryLevel` | `L445–L454` | 定义 | 0 |
| `StateManager::updateAutoChargeRequestLevel` | `L456–L465` | 定义 | 0 |
| `StateManager::updateVehicleConfigVersion` | `L466–L469` | 定义 | 0 |
| `StateManager::updateVehicleMetrics` | `L471–L481` | 定义 | 0 |
| `StateManager::updateCustomInfo` | `L483–L508` | 定义 | 0 |
| `StateManager::removeCustomInfo` | `L510–L516` | 定义 | 0 |
| `StateManager::nowMs` | `L518–L522` | 定义 | 0 |
| `StateManager::priorityHigher` | `L524–L526` | 定义 | 0 |
| `StateManager::loadErrorDefinitions` | `L528–L561` | 定义 | 0 |
| `StateManager::errorDefinitionFor` | `L563–L578` | 定义 | 0 |
| `StateManager::runThread` | `L580–L586` | 定义 | 0 |
| `StateManager::tickLocked` | `L588–L605` | 定义 | 0 |
| `StateManager::snapshotLocked` | `L607–L656` | 定义 | 0 |
| `StateManager::transitionLocked` | `L658–L666` | 定义 | 0 |
| `StateManager::resetToReadyLocked` | `L668–L679` | 定义 | 0 |
| `StateManager::hasErrorLevelLocked` | `L681–L688` | 定义 | 0 |
| `StateManager::hasAutoRecoverableLocked` | `L690–L692` | 定义 | 0 |
| `StateManager::highestErrorLevelLocked` | `L694–L702` | 定义 | 0 |
| `StateManager::refreshHighestErrorLevelLocked` | `L704–L706` | 定义 | 0 |
| `StateManager::runningRequestAliveLocked` | `L708–L711` | 定义 | 0 |
| `StateManager::naturalStateLocked` | `L713–L724` | 定义 | 0 |
| `StateManager::pruneTimedErrorsLocked` | `L726–L739` | 定义 | 0 |
| `StateManager::resetStateLocked` | `L741–L752` | 定义 | 0 |
| `StateManager::publishResetStateIfChanged` | `L754–L784` | 定义 | 0 |

<a id="file-25"></a>

#### [src/state_manager/visualmark_detect/tag_checker.cpp](../../src/state_manager/visualmark_detect/tag_checker.cpp)

功能范围：加载地图二维码位置及邻接关系，确定目标码，检查首码、错码/漏码并上报检测结果。

新增依据：`e414586a`，2026-03-18，历史路径 `src/state_manager/visualmark_detect/tag_checker.cpp`。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `reportCodeForTagError` | `L13–L23` | 定义 | 0 |
| `TagChecker::TagChecker` | `L27–L29` | 定义 | 3 |
| `TagChecker::~TagChecker` | `L31–L34` | 定义 | 4 |
| `TagChecker::reset` | `L36–L64` | 定义 | 28 |
| `TagChecker::detectVisualmarks` | `L66–L78` | 定义 | 12 |
| `TagChecker::notifyResult` | `L80–L125` | 定义 | 35 |
| `TagChecker::getTagInTopoPoint` | `L127–L150` | 定义 | 15 |
| `TagChecker::getNeighbors` | `L152–L200` | 定义 | 31 |
| `TagChecker::getTagInTopoPose` | `L202–L230` | 定义 | 24 |
| `TagChecker::processDetection` | `L232–L293` | 定义 | 57 |
| `TagChecker::findTargetTagId` | `L295–L367` | 定义 | 47 |
| `TagChecker::checkFirstTagId` | `L369–L380` | 定义 | 12 |

### 3.4 通信管理

| 文件名（相对仓库根目录） | 贡献类型 | 函数/接口条目 | 当前署名行 / 全部行 |
| --- | --- | --- | --- |
| [include/communication/comm_adapter_manager.h](#file-26) | 参与修改 | 35 | 8 / 126 |
| [src/communication/CMakeLists.txt](#file-27) | 参与修改 | 0 | 1 / 22 |
| [src/communication/comm_adapter_manager.cpp](#file-28) | 参与修改 | 43 | 34 / 1119 |

<a id="file-26"></a>

#### [include/communication/comm_adapter_manager.h](../../include/communication/comm_adapter_manager.h)

功能范围：当前通信管理器接口，涵盖连接生命周期、业务回调、状态上传和即时动作；现存 hehongjie 署名集中于启动接口。

最近可查的作者参与提交：`e3ec3f51`，2026-04-15。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `CommAdapterManager::getInstance` | `L41–L41` | 声明 | 0 |
| `CommAdapterManager::initializeTransport` | `L43–L43` | 声明 | 0 |
| `CommAdapterManager::activateBusinessHandlers` | `L44–L46` | 声明 | 0 |
| `CommAdapterManager::deactivateBusinessHandlers` | `L47–L47` | 声明 | 0 |
| `CommAdapterManager::enableFaultRecovery` | `L49–L49` | 定义 | 0 |
| `CommAdapterManager::initialize` | `L52–L52` | 声明 | 0 |
| `CommAdapterManager::initializeForAgv` | `L53–L56` | 声明 | 1 |
| `CommAdapterManager::waitReadyAndRequestInitialMap` | `L57–L58` | 声明 | 2 |
| `CommAdapterManager::shutdown` | `L59–L59` | 声明 | 0 |
| `CommAdapterManager::setOrderHandler` | `L61–L61` | 声明 | 0 |
| `CommAdapterManager::setMapInfoHandler` | `L62–L62` | 声明 | 0 |
| `CommAdapterManager::setCarParamHandler` | `L63–L63` | 声明 | 0 |
| `CommAdapterManager::setVehicleRestartHandler` | `L64–L64` | 声明 | 0 |
| `CommAdapterManager::configureCarParam` | `L65–L66` | 声明 | 0 |
| `CommAdapterManager::bindStateUploader` | `L67–L67` | 声明 | 0 |
| `CommAdapterManager::isConnectReady` | `L69–L69` | 声明 | 0 |
| `CommAdapterManager::agvId` | `L70–L70` | 声明 | 0 |
| `CommAdapterManager::uploadMapRequestForCurrentAgv` | `L71–L71` | 声明 | 0 |
| `CommAdapterManager::uploadCarParamRequestForCurrentAgv` | `L72–L72` | 声明 | 0 |
| `CommAdapterManager::uploadStatus` | `L73–L73` | 声明 | 0 |
| `CommAdapterManager::CommAdapterManager` | `L77–L77` | 声明 | 0 |
| `CommAdapterManager::~CommAdapterManager` | `L78–L78` | 声明 | 0 |
| `CommAdapterManager::CommAdapterManager` | `L80–L80` | 禁用接口 | 0 |
| `CommAdapterManager::operator=` | `L81–L81` | 禁用接口 | 0 |
| `CommAdapterManager::loadConfig` | `L83–L84` | 声明 | 0 |
| `CommAdapterManager::executeSoftwareReset` | `L85–L85` | 声明 | 0 |
| `CommAdapterManager::executeSoftwareEmergencyStop` | `L86–L86` | 声明 | 0 |
| `CommAdapterManager::executeCancelOrder` | `L87–L87` | 声明 | 0 |
| `CommAdapterManager::executeVehicleRestart` | `L88–L88` | 声明 | 0 |
| `CommAdapterManager::executeInitialPose` | `L89–L89` | 声明 | 0 |
| `CommAdapterManager::executeLaserSnapshot` | `L90–L92` | 声明 | 0 |
| `CommAdapterManager::handleInstantActions` | `L93–L94` | 声明 | 0 |
| `CommAdapterManager::validateStatusSnapshot` | `L95–L96` | 声明 | 0 |
| `CommAdapterManager::buildStateMessage` | `L97–L98` | 声明 | 0 |
| `CommAdapterManager::fillHeader` | `L99–L99` | 声明 | 0 |

<a id="file-27"></a>

#### [src/communication/CMakeLists.txt](../../src/communication/CMakeLists.txt)

功能范围：该目录模块的构建、依赖链接及安装配置；无业务函数。

最近可查的作者参与提交：`e3ec3f51`，2026-04-15。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="file-28"></a>

#### [src/communication/comm_adapter_manager.cpp](../../src/communication/comm_adapter_manager.cpp)

功能范围：通信管理器实现；现存 hehongjie 署名集中于 initializeForAgv、waitReadyAndRequestInitialMap，即车辆身份初始化和就绪后请求初始地图。

最近可查的作者参与提交：`e3ec3f51`，2026-04-15。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `steadyNowMs` | `L32–L36` | 定义 | 0 |
| `loadFrontLaserExtrinsic` | `L44–L79` | 定义 | 0 |
| `buildLaserSnapshotResult` | `L81–L129` | 定义 | 0 |
| `formatSignalSnapshot` | `L131–L173` | 定义 | 0 |
| `toProtocolErrorLevel` | `L175–L180` | 定义 | 0 |
| `buildProtocolErrorDescription` | `L182–L193` | 定义 | 0 |
| `clampPercent` | `L195–L197` | 定义 | 0 |
| `toBatteryHealth` | `L199–L202` | 定义 | 0 |
| `validMapStatus` | `L204–L211` | 定义 | 0 |
| `validActionStatus` | `L213–L225` | 定义 | 0 |
| `loadGeometryConfig` | `L236–L246` | 定义 | 0 |
| `CommAdapterManager::getInstance` | `L250–L253` | 定义 | 0 |
| `CommAdapterManager::CommAdapterManager` | `L255–L279` | 定义 | 0 |
| `CommAdapterManager::~CommAdapterManager` | `L281–L281` | 定义 | 0 |
| `CommAdapterManager::initializeTransport` | `L283–L366` | 定义 | 0 |
| `CommAdapterManager::activateBusinessHandlers` | `L368–L398` | 定义 | 0 |
| `CommAdapterManager::deactivateBusinessHandlers` | `L400–L409` | 定义 | 0 |
| `CommAdapterManager::initialize` | `L411–L413` | 定义 | 0 |
| `CommAdapterManager::initializeForAgv` | `L415–L426` | 定义 | 5 |
| `CommAdapterManager::waitReadyAndRequestInitialMap` | `L428–L452` | 定义 | 25 |
| `CommAdapterManager::shutdown` | `L454–L489` | 定义 | 0 |
| `CommAdapterManager::setOrderHandler` | `L491–L494` | 定义 | 0 |
| `CommAdapterManager::setMapInfoHandler` | `L496–L499` | 定义 | 0 |
| `CommAdapterManager::setCarParamHandler` | `L501–L504` | 定义 | 0 |
| `CommAdapterManager::setVehicleRestartHandler` | `L506–L510` | 定义 | 0 |
| `CommAdapterManager::configureCarParam` | `L512–L516` | 定义 | 0 |
| `CommAdapterManager::bindStateUploader` | `L518–L528` | 定义 | 0 |
| `CommAdapterManager::isConnectReady` | `L530–L533` | 定义 | 0 |
| `CommAdapterManager::agvId` | `L535–L535` | 定义 | 0 |
| `CommAdapterManager::uploadMapRequestForCurrentAgv` | `L537–L544` | 定义 | 0 |
| `CommAdapterManager::uploadCarParamRequestForCurrentAgv` | `L546–L551` | 定义 | 0 |
| `CommAdapterManager::uploadStatus` | `L553–L573` | 定义 | 0 |
| `CommAdapterManager::loadConfig` | `L575–L623` | 定义 | 0 |
| `CommAdapterManager::executeSoftwareReset` | `L625–L644` | 定义 | 0 |
| `CommAdapterManager::executeSoftwareEmergencyStop` | `L646–L665` | 定义 | 0 |
| `CommAdapterManager::executeCancelOrder` | `L667–L677` | 定义 | 0 |
| `CommAdapterManager::executeVehicleRestart` | `L679–L702` | 定义 | 0 |
| `CommAdapterManager::executeInitialPose` | `L704–L751` | 定义 | 0 |
| `CommAdapterManager::executeLaserSnapshot` | `L753–L843` | 定义 | 0 |
| `CommAdapterManager::handleInstantActions` | `L845–L852` | 定义 | 0 |
| `CommAdapterManager::validateStatusSnapshot` | `L854–L948` | 定义 | 0 |
| `CommAdapterManager::buildStateMessage` | `L950–L1095` | 定义 | 0 |
| `CommAdapterManager::fillHeader` | `L1097–L1116` | 定义 | 0 |

### 3.5 导航与规划控制（参与修改）

| 文件名（相对仓库根目录） | 贡献类型 | 函数/接口条目 | 当前署名行 / 全部行 |
| --- | --- | --- | --- |
| [include/nav_base/nav_base.h](#file-29) | 参与修改 | 19 | 5 / 61 |
| [include/nav_base/nav_controller.h](#file-30) | 参与修改 | 40 | 20 / 189 |
| [include/pnc/core/params/config_params.h](#file-31) | 参与修改 | 0 | 1 / 120 |
| [src/nav_base/CMakeLists.txt](#file-32) | 参与修改 | 0 | 2 / 71 |
| [src/nav_base/core/config_master.cpp](#file-33) | 参与修改；无现存署名 | 8 | 0 / 170 |
| [src/nav_base/core/pose_locator.cpp](#file-34) | 参与修改 | 5 | 22 / 70 |
| [src/nav_base/nav_base.cpp](#file-35) | 参与修改 | 19 | 86 / 320 |
| [src/nav_base/nav_controller.cpp](#file-36) | 参与修改 | 40 | 229 / 1119 |

<a id="file-29"></a>

#### [include/nav_base/nav_base.h](../../include/nav_base/nav_base.h)

功能范围：导航任务接收、取消、反馈、结果及工作线程的接口。

最近可查的作者参与提交：`2c10a2af`，2026-05-14。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `NavBase::NavBase` | `L23–L25` | 声明 | 0 |
| `NavBase::~NavBase` | `L26–L26` | 声明 | 0 |
| `NavBase::cancelGoal` | `L27–L27` | 声明 | 0 |
| `NavBase::acceptGoal` | `L28–L28` | 声明 | 0 |
| `NavBase::getFeedback` | `L29–L29` | 声明 | 0 |
| `NavBase::getResult` | `L30–L30` | 声明 | 0 |
| `NavBase::reset` | `L31–L31` | 声明 | 0 |
| `NavBase::shutdown` | `L32–L32` | 声明 | 0 |
| `NavBase::isShutdown` | `L33–L33` | 声明 | 0 |
| `NavBase::taskThread` | `L37–L37` | 声明 | 1 |
| `NavBase::resetBase` | `L38–L38` | 声明 | 0 |
| `NavBase::isNextPlanReady` | `L39–L39` | 声明 | 0 |
| `NavBase::isGoalInReachScope` | `L40–L40` | 声明 | 0 |
| `NavBase::hasNewGoal` | `L41–L41` | 声明 | 0 |
| `NavBase::isGoalCancelled` | `L42–L42` | 声明 | 1 |
| `NavBase::updateFeedback` | `L43–L43` | 声明 | 0 |
| `NavBase::postExecProcess` | `L44–L44` | 声明 | 0 |
| `NavBase::prepareGoalForPlanner` | `L45–L45` | 声明 | 0 |
| `NavBase::processNewGoal` | `L46–L46` | 声明 | 0 |

<a id="file-30"></a>

#### [include/nav_base/nav_controller.h](../../include/nav_base/nav_controller.h)

功能范围：导航控制器接口，包括全局路径规划、规划/控制线程、任务反馈和检码相关处理。

最近可查的作者参与提交：`2c10a2af`，2026-05-14。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `NavController::NavController` | `L43–L45` | 声明 | 0 |
| `NavController::~NavController` | `L46–L46` | 声明 | 0 |
| `NavController::initialize` | `L47–L47` | 声明 | 0 |
| `NavController::setPlan` | `L48–L48` | 声明 | 0 |
| `NavController::planGlobalPath` | `L50–L50` | 声明 | 1 |
| `NavController::getFeedback` | `L51–L51` | 声明 | 0 |
| `NavController::terminateTask` | `L52–L52` | 声明 | 0 |
| `NavController::reachMode` | `L53–L53` | 声明 | 0 |
| `NavController::isOnStandby` | `L54–L54` | 声明 | 0 |
| `NavController::isPlanningThreadReady` | `L56–L56` | 声明 | 0 |
| `NavController::planningThread` | `L57–L57` | 声明 | 0 |
| `NavController::controlThread` | `L58–L58` | 声明 | 0 |
| `NavController::shutdown` | `L59–L59` | 声明 | 0 |
| `NavController::isShutdown` | `L60–L60` | 声明 | 0 |
| `NavController::navReset` | `L64–L64` | 声明 | 0 |
| `NavController::resetVariables` | `L65–L65` | 声明 | 0 |
| `NavController::reconfigTasktable` | `L66–L66` | 声明 | 0 |
| `NavController::reconfigPathAttribute` | `L67–L67` | 声明 | 0 |
| `NavController::reachReport` | `L68–L68` | 声明 | 0 |
| `NavController::naviControl` | `L70–L70` | 声明 | 0 |
| `NavController::actionRotate` | `L71–L71` | 声明 | 0 |
| `NavController::actionTracking` | `L72–L72` | 声明 | 0 |
| `NavController::shouldSkipControl` | `L73–L73` | 声明 | 0 |
| `NavController::validateRobotState` | `L74–L75` | 声明 | 0 |
| `NavController::setPubCommand` | `L76–L78` | 声明 | 0 |
| `NavController::updateCenterFeedback` | `L79–L79` | 声明 | 0 |
| `NavController::updateStateEvent` | `L80–L82` | 声明 | 0 |
| `NavController::turnInfo` | `L83–L83` | 声明 | 0 |
| `NavController::updateFeedbackTable` | `L84–L85` | 声明 | 0 |
| `NavController::triggerDiverseCycle` | `L86–L87` | 声明 | 0 |
| `NavController::useOdomIntergratePose` | `L88–L88` | 声明 | 0 |
| `NavController::setPlanCore` | `L91–L91` | 声明 | 0 |
| `NavController::activatePlanTrigger` | `L94–L94` | 声明 | 0 |
| `NavController::shouldReplanRightNow` | `L95–L95` | 声明 | 0 |
| `NavController::naviPlanning` | `L96–L97` | 声明 | 0 |
| `NavController::checkExceedToleDistNoTag` | `L98–L99` | 声明 | 0 |
| `NavController::ensureTagObservationSubscribed` | `L100–L100` | 声明 | 0 |
| `NavController::readFreshTagId` | `L101–L102` | 声明 | 0 |
| `NavController::tryMakingPlan` | `L105–L106` | 声明 | 2 |
| `NavController::isPlanFarAway` | `L107–L108` | 声明 | 2 |

<a id="file-31"></a>

#### [include/pnc/core/params/config_params.h](../../include/pnc/core/params/config_params.h)

功能范围：规划控制参数结构；当前 hehongjie 仅有少量字段行的署名，无函数。

最近可查的作者参与提交：`e414586a`，2026-03-18。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="file-32"></a>

#### [src/nav_base/CMakeLists.txt](../../src/nav_base/CMakeLists.txt)

功能范围：该目录模块的构建、依赖链接及安装配置；无业务函数。

最近可查的作者参与提交：`904b0bc8`，2025-10-28。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="file-33"></a>

#### [src/nav_base/core/config_master.cpp](../../src/nav_base/core/config_master.cpp)

功能范围：导航参数读取和车辆能力访问；hehongjie 曾参与修改，当前版本无其署名行，历史函数见补充章节。

最近可查的作者参与提交：`e414586a`，2026-03-18。

归属提示：以下是当前函数清单，当前 blame 已无 hehongjie 署名行；最后参与版本见第 5 节，不能把以下当前实现全部归于 hehongjie。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `ConfigMaster::getInstance` | `L12–L15` | 定义 | 0 |
| `ConfigMaster::ConfigMaster` | `L17–L17` | 定义 | 0 |
| `loadConfig` | `L19–L144` | 定义 | 0 |
| `ConfigMaster::init` | `L146–L160` | 定义 | 0 |
| `ConfigMaster::chassisType` | `L162–L162` | 定义 | 0 |
| `ConfigMaster::trackWidth` | `L163–L165` | 定义 | 0 |
| `ConfigMaster::maxWheelVel` | `L166–L166` | 定义 | 0 |
| `ConfigMaster::haveTabRotater` | `L167–L167` | 定义 | 0 |

<a id="file-34"></a>

#### [src/nav_base/core/pose_locator.cpp](../../src/nav_base/core/pose_locator.cpp)

功能范围：位姿定位器初始化、坐标系读取及任务位姿获取。

最近可查的作者参与提交：`e414586a`，2026-03-18。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `PoseLocator::getInstance` | `L18–L21` | 定义 | 0 |
| `PoseLocator::PoseLocator` | `L23–L23` | 定义 | 0 |
| `PoseLocator::init` | `L25–L41` | 定义 | 14 |
| `PoseLocator::getBaseFrame` | `L43–L47` | 定义 | 0 |
| `PoseLocator::getTaskPose` | `L49–L67` | 定义 | 6 |

<a id="file-35"></a>

#### [src/nav_base/nav_base.cpp](../../src/nav_base/nav_base.cpp)

功能范围：导航任务生命周期：接收目标、处理新目标、驱动任务线程、发布反馈/结果及复位；属于参与修改文件。

最近可查的作者参与提交：`2c10a2af`，2026-05-14。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `NavBase::isShutdown` | `L29–L29` | 定义 | 1 |
| `NavBase::shutdown` | `L31–L37` | 定义 | 0 |
| `NavBase::~NavBase` | `L39–L43` | 定义 | 2 |
| `NavBase::NavBase` | `L45–L70` | 定义 | 2 |
| `NavBase::updateFeedback` | `L73–L80` | 定义 | 0 |
| `NavBase::postExecProcess` | `L83–L106` | 定义 | 3 |
| `NavBase::isNextPlanReady` | `L109–L117` | 定义 | 2 |
| `NavBase::taskThread` | `L120–L181` | 定义 | 14 |
| `NavBase::isGoalInReachScope` | `L184–L199` | 定义 | 2 |
| `NavBase::cancelGoal` | `L202–L210` | 定义 | 0 |
| `NavBase::acceptGoal` | `L212–L224` | 定义 | 3 |
| `NavBase::getFeedback` | `L226–L231` | 定义 | 3 |
| `NavBase::getResult` | `L233–L238` | 定义 | 3 |
| `NavBase::hasNewGoal` | `L241–L241` | 定义 | 0 |
| `NavBase::isGoalCancelled` | `L243–L243` | 定义 | 1 |
| `NavBase::processNewGoal` | `L245–L283` | 定义 | 15 |
| `NavBase::prepareGoalForPlanner` | `L285–L293` | 定义 | 9 |
| `NavBase::reset` | `L295–L309` | 定义 | 12 |
| `NavBase::resetBase` | `L312–L317` | 定义 | 6 |

<a id="file-36"></a>

#### [src/nav_base/nav_controller.cpp](../../src/nav_base/nav_controller.cpp)

功能范围：导航控制及规划实现；hehongjie 参与全局路径规划迁移、规划尝试/偏离检查、无二维码距离检查和相关反馈处理。

最近可查的作者参与提交：`2c10a2af`，2026-05-14。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `fduration` | `L44–L46` | 定义 | 1 |
| `NavController::shutdown` | `L53–L68` | 定义 | 0 |
| `NavController::isShutdown` | `L69–L69` | 定义 | 0 |
| `NavController::reachMode` | `L71–L73` | 定义 | 0 |
| `NavController::isOnStandby` | `L75–L77` | 定义 | 1 |
| `NavController::terminateTask` | `L79–L85` | 定义 | 0 |
| `NavController::getFeedback` | `L87–L92` | 定义 | 3 |
| `NavController::resetVariables` | `L95–L113` | 定义 | 2 |
| `NavController::navReset` | `L115–L135` | 定义 | 0 |
| `NavController::reachReport` | `L137–L151` | 定义 | 0 |
| `NavController::~NavController` | `L153–L175` | 定义 | 4 |
| `NavController::NavController` | `L177–L228` | 定义 | 4 |
| `NavController::initialize` | `L231–L271` | 定义 | 2 |
| `NavController::turnInfo` | `L274–L297` | 定义 | 0 |
| `NavController::updateFeedbackTable` | `L299–L342` | 定义 | 1 |
| `NavController::reconfigTasktable` | `L344–L363` | 定义 | 3 |
| `NavController::reconfigPathAttribute` | `L365–L386` | 定义 | 2 |
| `NavController::updateCenterFeedback` | `L388–L437` | 定义 | 4 |
| `NavController::useOdomIntergratePose` | `L439–L445` | 定义 | 4 |
| `NavController::updateStateEvent` | `L447–L490` | 定义 | 4 |
| `NavController::triggerDiverseCycle` | `L492–L512` | 定义 | 2 |
| `NavController::actionRotate` | `L515–L527` | 定义 | 1 |
| `NavController::actionTracking` | `L529–L549` | 定义 | 1 |
| `NavController::activatePlanTrigger` | `L552–L556` | 定义 | 2 |
| `NavController::shouldReplanRightNow` | `L558–L582` | 定义 | 10 |
| `NavController::isPlanningThreadReady` | `L584–L596` | 定义 | 0 |
| `NavController::planningThread` | `L599–L640` | 定义 | 0 |
| `NavController::naviPlanning` | `L642–L679` | 定义 | 5 |
| `NavController::setPlan` | `L681–L711` | 定义 | 6 |
| `NavController::setPlanCore` | `L714–L760` | 定义 | 2 |
| `NavController::controlThread` | `L763–L802` | 定义 | 1 |
| `NavController::shouldSkipControl` | `L804–L812` | 定义 | 4 |
| `NavController::naviControl` | `L814–L913` | 定义 | 23 |
| `NavController::checkExceedToleDistNoTag` | `L915–L955` | 定义 | 30 |
| `NavController::ensureTagObservationSubscribed` | `L957–L977` | 定义 | 0 |
| `NavController::readFreshTagId` | `L979–L1000` | 定义 | 0 |
| `NavController::setPubCommand` | `L1004–L1016` | 定义 | 2 |
| `NavController::tryMakingPlan` | `L1020–L1031` | 定义 | 12 |
| `NavController::isPlanFarAway` | `L1033–L1045` | 定义 | 13 |
| `NavController::planGlobalPath` | `L1047–L1116` | 定义 | 70 |

### 3.6 二维码定位（参与修改）

| 文件名（相对仓库根目录） | 贡献类型 | 函数/接口条目 | 当前署名行 / 全部行 |
| --- | --- | --- | --- |
| [include/tag_localiser_manager/tag_localiser_manager.h](#file-37) | 参与修改 | 13 | 3 / 82 |
| [src/tag_localiser_manager/tag_localiser_manager.cc](#file-38) | 参与修改 | 19 | 180 / 589 |

<a id="file-37"></a>

#### [include/tag_localiser_manager/tag_localiser_manager.h](../../include/tag_localiser_manager/tag_localiser_manager.h)

功能范围：二维码定位管理器生命周期、拓扑地图获取和定位结果获取接口。

最近可查的作者参与提交：`357df967`，2025-10-28。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `TagLocaliserManager::TagLocaliserManager` | `L27–L27` | 声明 | 0 |
| `TagLocaliserManager::TagLocaliserManager` | `L28–L28` | 禁用接口 | 0 |
| `TagLocaliserManager::operator=` | `L29–L29` | 禁用接口 | 0 |
| `TagLocaliserManager::~TagLocaliserManager` | `L31–L31` | 声明 | 0 |
| `TagLocaliserManager::init` | `L33–L37` | 声明 | 0 |
| `TagLocaliserManager::start` | `L39–L39` | 声明 | 0 |
| `TagLocaliserManager::stop` | `L41–L41` | 声明 | 0 |
| `TagLocaliserManager::getNavTopoMap` | `L43–L43` | 声明 | 0 |
| `TagLocaliserManager::getPerceptionResult` | `L45–L45` | 声明 | 0 |
| `TagLocaliserManager::isStarted` | `L47–L47` | 声明 | 1 |
| `TagLocaliserManager::startDrivers` | `L50–L50` | 声明 | 0 |
| `TagLocaliserManager::stopDrivers` | `L52–L52` | 声明 | 0 |
| `TagLocaliserManager::dataProcessLoop` | `L54–L54` | 声明 | 0 |

<a id="file-38"></a>

#### [src/tag_localiser_manager/tag_localiser_manager.cc](../../src/tag_localiser_manager/tag_localiser_manager.cc)

功能范围：二维码定位初始化、地图 JSON 到定位地图数据转换、IMU/里程计/相机数据转换及启停；属于参与修改文件。

最近可查的作者参与提交：`e6b57202`，2025-12-01。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `from_json` | `L20–L26` | 定义 | 2 |
| `getParamsFromCarParam` | `L33–L42` | 定义 | 0 |
| `getMapDataFromJson` | `L44–L135` | 定义 | 61 |
| `toImuData` | `L137–L149` | 定义 | 4 |
| `toImuDataVector` | `L151–L160` | 定义 | 0 |
| `toOdomData` | `L162–L177` | 定义 | 2 |
| `toOdomDataVector` | `L179–L188` | 定义 | 0 |
| `toCameraData` | `L190–L223` | 定义 | 2 |
| `TagLocaliserManager::TagLocaliserManager` | `L226–L229` | 定义 | 0 |
| `TagLocaliserManager::~TagLocaliserManager` | `L231–L235` | 定义 | 2 |
| `TagLocaliserManager::init` | `L237–L353` | 定义 | 87 |
| `TagLocaliserManager::isStarted` | `L355–L355` | 定义 | 1 |
| `TagLocaliserManager::start` | `L357–L429` | 定义 | 13 |
| `TagLocaliserManager::startDrivers` | `L431–L472` | 定义 | 0 |
| `TagLocaliserManager::stopDrivers` | `L474–L496` | 定义 | 0 |
| `TagLocaliserManager::stop` | `L498–L520` | 定义 | 3 |
| `TagLocaliserManager::getNavTopoMap` | `L522–L525` | 定义 | 2 |
| `TagLocaliserManager::getPerceptionResult` | `L527–L530` | 定义 | 1 |
| `TagLocaliserManager::dataProcessLoop` | `L532–L587` | 定义 | 0 |

### 3.7 通用工具与消息

| 文件名（相对仓库根目录） | 贡献类型 | 函数/接口条目 | 当前署名行 / 全部行 |
| --- | --- | --- | --- |
| [include/common/filesystem_compat.h](#file-39) | 参与修改 | 15 | 23 / 125 |
| [include/common_msgs/nav_msgs/path.h](#file-40) | 历史新增 | 0 | 19 / 19 |

<a id="file-39"></a>

#### [include/common/filesystem_compat.h](../../include/common/filesystem_compat.h)

功能范围：文件系统兼容接口及配置路径定位；hehongjie 现存贡献集中于 getConfigFilePath。

最近可查的作者参与提交：`a7d18a25`，2025-09-18。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `path::path` | `L31–L31` | 定义 | 0 |
| `path::path` | `L32–L32` | 定义 | 0 |
| `path::path` | `L33–L33` | 定义 | 0 |
| `path::string` | `L35–L35` | 定义 | 0 |
| `path::c_str` | `L36–L36` | 定义 | 0 |
| `operator std::string` | `L39–L39` | 定义 | 0 |
| `error_code::error_code` | `L48–L48` | 定义 | 0 |
| `error_code::error_code` | `L49–L49` | 定义 | 0 |
| `error_code::operator bool` | `L51–L51` | 定义 | 0 |
| `error_code::value` | `L52–L52` | 定义 | 0 |
| `error_code::message` | `L53–L53` | 定义 | 0 |
| `exists` | `L57–L60` | 定义 | 0 |
| `create_directories` | `L63–L85` | 定义 | 0 |
| `create_directories` | `L88–L97` | 定义 | 0 |
| `getConfigFilePath` | `L100–L120` | 定义 | 21 |

<a id="file-40"></a>

#### [include/common_msgs/nav_msgs/path.h](../../include/common_msgs/nav_msgs/path.h)

功能范围：PoseStamped、Path 路径消息结构定义；无函数。

新增依据：`7bf4debf`，2025-09-25，历史路径 `include/common_msgs/nav_msgs/path.h`。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

### 3.8 程序入口、构建和脚本

| 文件名（相对仓库根目录） | 贡献类型 | 函数/接口条目 | 当前署名行 / 全部行 |
| --- | --- | --- | --- |
| [.gitignore](#file-41) | 参与修改 | 0 | 1 / 30 |
| [CMakeLists.txt](#file-42) | 参与修改 | 3 | 65 / 423 |
| [dev.sh](#file-43) | 参与修改；无现存署名 | 2 | 0 / 118 |
| [docker_ci_local.sh](#file-44) | 参与修改；无现存署名 | 0 | 0 / 260 |
| [src/main.cpp](#file-45) | 参与修改 | 8 | 21 / 708 |
| [tools/configure.sh](#file-46) | 参与修改 | 0 | 2 / 567 |
| [tools/detect_platform.sh](#file-47) | 参与修改；无现存署名 | 0 | 0 / 109 |
| [tools/generate_deb.sh](#file-48) | 参与修改；无现存署名 | 0 | 0 / 467 |
| [tools/run_tests.sh](#file-49) | 参与修改；无现存署名 | 0 | 0 / 242 |
| [tools/setup_dev_env.sh](#file-50) | 参与修改；无现存署名 | 4 | 0 / 178 |
| [tools/upload_deb_to_ftp.sh](#file-51) | 参与修改 | 2 | 6 / 168 |

<a id="file-41"></a>

#### [.gitignore](../../.gitignore)

功能范围：开发产物及临时文件的 Git 忽略规则；无函数。

最近可查的作者参与提交：`93873fb7`，2025-09-09。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="file-42"></a>

#### [CMakeLists.txt](../../CMakeLists.txt)

功能范围：工程总构建入口，组织模块、依赖、可执行程序及安装规则。

最近可查的作者参与提交：`e3ec3f51`，2026-04-15。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `get_git_hash` | `L43–L54` | CMake macro | 12 |
| `get_git_branch` | `L57–L68` | CMake macro | 12 |
| `find_glog_library` | `L99–L135` | CMake function | 0 |

<a id="file-43"></a>

#### [dev.sh](../../dev.sh)

功能范围：开发命令菜单及选项分派。

最近可查的作者参与提交：`8f6bbc2a`，2025-11-27。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `show_menu` | `L14–L24` | 定义 | 0 |
| `execute_choice` | `L27–L58` | 定义 | 0 |

<a id="file-44"></a>

#### [docker_ci_local.sh](../../docker_ci_local.sh)

功能范围：本地 Docker CI 构建流程；当前为顶层脚本，无具名函数。

最近可查的作者参与提交：`8f6bbc2a`，2025-11-27。

函数范围：无具名函数；顶层脚本范围为 `L1–L260`。

<a id="file-45"></a>

#### [src/main.cpp](../../src/main.cpp)

功能范围：车辆主程序装配、位置更新、信号处理和运行生命周期；属于参与修改文件。

最近可查的作者参与提交：`e3ec3f51`，2026-04-15。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `saveLastLocaliserPose` | `L56–L82` | 定义 | 0 |
| `RecordingServiceGuard::~RecordingServiceGuard` | `L88–L93` | 定义 | 0 |
| `DriverManagerGuard::~DriverManagerGuard` | `L100–L104` | 定义 | 0 |
| `signalHandler` | `L112–L117` | 定义 | 1 |
| `crashSignalHandler` | `L119–L150` | 定义 | 0 |
| `mainStateClient` | `L152–L155` | 定义 | 0 |
| `updateAgvPosition` | `L157–L193` | 定义 | 3 |
| `main` | `L196–L708` | 定义 | 16 |

<a id="file-46"></a>

#### [tools/configure.sh](../../tools/configure.sh)

功能范围：构建配置脚本；当前为顶层脚本，无具名函数。

最近可查的作者参与提交：`54f08015`，2026-04-09。

函数范围：无具名函数；顶层脚本范围为 `L1–L567`。

<a id="file-47"></a>

#### [tools/detect_platform.sh](../../tools/detect_platform.sh)

功能范围：平台探测脚本；当前为顶层脚本，无具名函数。

最近可查的作者参与提交：`8f6bbc2a`，2025-11-27。

函数范围：无具名函数；顶层脚本范围为 `L1–L109`。

<a id="file-48"></a>

#### [tools/generate_deb.sh](../../tools/generate_deb.sh)

功能范围：Debian 安装包生成流程；当前为顶层脚本，无具名函数。

最近可查的作者参与提交：`8f6bbc2a`，2025-11-27。

函数范围：无具名函数；顶层脚本范围为 `L1–L467`。

<a id="file-49"></a>

#### [tools/run_tests.sh](../../tools/run_tests.sh)

功能范围：测试执行脚本；当前为顶层脚本，无具名函数。

最近可查的作者参与提交：`8f6bbc2a`，2025-11-27。

函数范围：无具名函数；顶层脚本范围为 `L1–L242`。

<a id="file-50"></a>

#### [tools/setup_dev_env.sh](../../tools/setup_dev_env.sh)

功能范围：开发环境配置，包含系统探测、平台变量、vcpkg 查找及系统依赖安装函数。

最近可查的作者参与提交：`8f6bbc2a`，2025-11-27。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `detect_os` | `L7–L15` | 定义 | 0 |
| `setup_platform_vars` | `L21–L45` | 定义 | 0 |
| `find_vcpkg` | `L50–L58` | 定义 | 0 |
| `install_system_deps` | `L74–L88` | 定义 | 0 |

<a id="file-51"></a>

#### [tools/upload_deb_to_ftp.sh](../../tools/upload_deb_to_ftp.sh)

功能范围：安装包 FTP 上传和重试清理流程。

最近可查的作者参与提交：`8f6bbc2a`，2025-11-27。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 当前版本中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `cleanup_attempt_files` | `L94–L101` | 定义 | 0 |
| `stop_retrying` | `L103–L107` | 定义 | 0 |

### 3.9 配置和协议样例

| 文件名（相对仓库根目录） | 贡献类型 | 函数/接口条目 | 当前署名行 / 全部行 |
| --- | --- | --- | --- |
| [config/comm_config.json](#file-52) | 历史新增 | 0 | 7 / 22 |
| [config/last_localiser_info.json](#file-53) | 历史新增 | 0 | 0 / 0 |
| [test/output_order_message.json](#file-54) | 历史新增 | 0 | 0 / 0 |
| [test/output_state_message.json](#file-55) | 历史新增 | 0 | 0 / 0 |
| [test/vda5050_order_message.json](#file-56) | 历史新增 | 0 | 79 / 84 |
| [test/vda5050_state_message.json](#file-57) | 历史新增 | 0 | 123 / 123 |

<a id="file-52"></a>

#### [config/comm_config.json](../../config/comm_config.json)

功能范围：通信配置，提供协议、连接和通信行为的配置项；无函数。

新增依据：`dbec08ce`，2025-10-24，历史路径 `config/comm_config.json`。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="file-53"></a>

#### [config/last_localiser_info.json](../../config/last_localiser_info.json)

功能范围：上次定位信息文件；当前为空文件，无函数。

新增依据：`9135fbab`，2025-10-27，历史路径 `config/last_localiser_info.json`。

函数范围：无，文件为空。

<a id="file-54"></a>

#### [test/output_order_message.json](../../test/output_order_message.json)

功能范围：协议输出样例占位文件；当前为空，无函数。

历史关联路径：`src/protocol_adapter/test/output_order_message.json`。

新增依据：`a57fb566`，2025-09-12，历史路径 `src/protocol_adapter/test/output_order_message.json`。

函数范围：无，文件为空。

<a id="file-55"></a>

#### [test/output_state_message.json](../../test/output_state_message.json)

功能范围：协议输出样例占位文件；当前为空，无函数。

历史关联路径：`src/protocol_adapter/test/output_state_message.json`。

新增依据：`a57fb566`，2025-09-12，历史路径 `src/protocol_adapter/test/output_state_message.json`。

函数范围：无，文件为空。

<a id="file-56"></a>

#### [test/vda5050_order_message.json](../../test/vda5050_order_message.json)

功能范围：VDA5050 订单消息 JSON 测试样例；无函数。

历史关联路径：`src/protocol_adapter/test/vda5050_order_message.json`。

新增依据：`a57fb566`，2025-09-12，历史路径 `src/protocol_adapter/test/vda5050_order_message.json`。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="file-57"></a>

#### [test/vda5050_state_message.json](../../test/vda5050_state_message.json)

功能范围：VDA5050 状态消息 JSON 测试样例；无函数。

历史关联路径：`src/protocol_adapter/test/vda5050_state_message.json`。

新增依据：`a57fb566`，2025-09-12，历史路径 `src/protocol_adapter/test/vda5050_state_message.json`。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

### 3.10 既有文档

| 文件名（相对仓库根目录） | 贡献类型 | 函数/接口条目 | 当前署名行 / 全部行 |
| --- | --- | --- | --- |
| [docs/历史归档/系统架构/software_architecture_legacy.md](#file-58) | 参与修改；无现存署名 | 0 | 0 / 75 |
| [docs/待整理/设计文档/AGV功能模块化脑图.md](#file-59) | 参与修改；无现存署名 | 0 | 0 / 311 |

<a id="file-58"></a>

#### [docs/历史归档/系统架构/software_architecture_legacy.md](../../docs/%E5%8E%86%E5%8F%B2%E5%BD%92%E6%A1%A3/%E7%B3%BB%E7%BB%9F%E6%9E%B6%E6%9E%84/software_architecture_legacy.md)

功能范围：历史软件架构说明文档；hehongjie 曾参与修改，当前已无其署名行；无函数。

历史关联路径：`docs/软件架构设计.md`。

最近可查的作者参与提交：`8f6bbc2a`，2025-11-27。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="file-59"></a>

#### [docs/待整理/设计文档/AGV功能模块化脑图.md](../../docs/%E5%BE%85%E6%95%B4%E7%90%86/%E8%AE%BE%E8%AE%A1%E6%96%87%E6%A1%A3/AGV%E5%8A%9F%E8%83%BD%E6%A8%A1%E5%9D%97%E5%8C%96%E8%84%91%E5%9B%BE.md)

功能范围：历史软件架构说明文档；hehongjie 曾参与修改，当前已无其署名行；无函数。

历史关联路径：`docs/AGV功能模块化脑图.md`。

最近可查的作者参与提交：`8f6bbc2a`，2025-11-27。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

## 4. 历史文件及函数范围

以下路径当前不存在，或历史代码已由新接口/外部依赖承接。每个函数的行号只适用于所列快照。优先使用该路径最后一次可读取文件内容的 hehongjie 提交；若他仅在删除/重命名中涉及该路径，则读取提交父版本，并明确标注。

读取方式（在仓库根目录执行，将版本和路径替换为下面对应值）：

```powershell
git show '版本:文件路径'
```

| 历史文件名 | 快照 | 贡献类型 | 函数/接口条目 |
| --- | --- | --- | --- |
| [CMakeLists(real).txt](#history-1) | `e959a66f` | 历史新增 | 1 |
| [CMakeLists_protocol_adapter.txt](#history-2) | `2d3ae7e1` | 历史新增 | 0 |
| [config/communicate_config.json](#history-3) | `f6545d97` | 历史新增 | 0 |
| [config/nav_config_differ.json](#history-4) | `978a7da7` | 参与修改 | 0 |
| [config/vehicle_profile.json](#history-5) | `978a7da7` | 参与修改 | 0 |
| [include/comm_adapter/comm_adapter.h](#history-6) | `4869436c` | 参与修改 | 13 |
| [include/common/class_logger.h](#history-7) | `fd6ba03e^` | 仅删除/迁移涉及 | 24 |
| [include/common/class_logger.hpp](#history-8) | `52dad7da` | 历史新增 | 24 |
| [include/drivers/laser_drivers/wanji_718h_interface.h](#history-9) | `e414586a` | 参与修改 | 5 |
| [include/nav_base/core/ros_datastore.h](#history-10) | `7869ec46^` | 仅删除/迁移涉及 | 13 |
| [include/order_manager/common/handle_exception.hpp](#history-11) | `6e2087e7` | 历史新增 | 1 |
| [include/order_manager/utils/safety_client.h](#history-12) | `2dfff250` | 历史新增 | 3 |
| [include/protocol_adapter/Iprotocol_adapter.h](#history-13) | `d47f339f` | 历史新增 | 5 |
| [include/protocol_adapter/VDA5050_V2/protocol_adapter.h](#history-14) | `a77274a9` | 参与修改 | 54 |
| [include/protocol_adapter/VDA5050_v2/protocol_adapter.h](#history-15) | `d47f339f` | 历史新增 | 6 |
| [include/protocol_adapter/VDA5050_v2/protocol_structs.h](#history-16) | `d47f339f` | 历史新增 | 0 |
| [include/protocol_adapter/common/Iprotocol_adapter.h](#history-17) | `2d3ae7e1` | 参与修改 | 5 |
| [include/protocol_adapter/common/protocol_structs.h](#history-18) | `6ce252bf` | 参与修改 | 19 |
| [include/protocol_adapter/protocol_adapter_factory.h](#history-19) | `4869436c` | 历史新增 | 3 |
| [include/state_manager/common/fsm_common.hpp](#history-20) | `dd85cffd` | 历史新增 | 11 |
| [include/state_manager/common/state_common.hpp](#history-21) | `91a1e6c5` | 历史新增 | 1 |
| [include/state_manager/status_gather.h](#history-22) | `6bc29fe7` | 历史新增 | 22 |
| [include/state_manager/status_monitor.h](#history-23) | `002f8721` | 历史新增 | 3 |
| [src/comm_adapter/CMakeLists.txt](#history-24) | `34c07a30` | 历史新增 | 0 |
| [src/comm_adapter/comm_adapter.cpp](#history-25) | `33f0f62b` | 历史新增 | 9 |
| [src/comm_adapter/comm_adapter.h](#history-26) | `945aa75f` | 历史新增 | 0 |
| [src/comm_adapter/comm_demo.cpp](#history-27) | `ad5d7d73` | 历史新增 | 2 |
| [src/drivers/laser_drivers/laser_drivers.cpp](#history-28) | `e414586a` | 参与修改 | 11 |
| [src/drivers/motor_driver.cpp](#history-29) | `f4233b81` | 参与修改 | 7 |
| [src/main2.cpp](#history-30) | `fec7a94d` | 参与修改 | 5 |
| [src/protocol_adapter/CMakeLists.txt](#history-31) | `1eb1f158` | 参与修改 | 0 |
| [src/protocol_adapter/VDA5050_V2/protocol_adapter.cpp](#history-32) | `6171f8df` | 历史新增 | 42 |
| [src/protocol_adapter/protocol_adapter_demo.cpp](#history-33) | `c61fbb93` | 历史新增 | 3 |
| [src/protocol_adapter/protocol_adapter_factory.cpp](#history-34) | `a57fb566` | 历史新增 | 1 |
| [src/state_manager/status_gather.cpp](#history-35) | `6bc29fe7` | 历史新增 | 16 |
| [src/state_manager/status_monitor.cpp](#history-36) | `3c129fa7` | 历史新增 | 3 |

<a id="history-1"></a>

### 4.1 `CMakeLists(real).txt`

功能范围：历史总构建配置副本；无业务函数。

快照：`e959a66f8c13de329037fb5556aceb3bca1765a3`；关联作者提交日期：2025-09-26；文件长度：250 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `find_glog_library` | `L65–L119` | CMake function | 55 |

<a id="history-2"></a>

### 4.2 `CMakeLists_protocol_adapter.txt`

功能范围：历史协议适配器独立构建配置；无业务函数。

快照：`2d3ae7e115eccde4ec4977942ffd6c4832622ff7`；关联作者提交日期：2025-09-16；文件长度：80 行。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="history-3"></a>

### 4.3 `config/communicate_config.json`

功能范围：历史通信配置；无函数。

快照：`f6545d976f91296aa5072623c35b24aecd104ce0`；关联作者提交日期：2025-09-19；文件长度：14 行。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="history-4"></a>

### 4.4 `config/nav_config_differ.json`

功能范围：历史差速车型导航参数配置；无函数。

快照：`978a7da7e67fb85ec8bc83c434da161a4ef86eab`；关联作者提交日期：2026-07-08；文件长度：135 行。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="history-5"></a>

### 4.5 `config/vehicle_profile.json`

功能范围：历史车型配置，关联导航、通信及车辆参数；无函数。

快照：`978a7da7e67fb85ec8bc83c434da161a4ef86eab`；关联作者提交日期：2026-07-08；文件长度：49 行。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="history-6"></a>

### 4.6 `include/comm_adapter/comm_adapter.h`

功能范围：历史 CommAdapter MQTT 通信接口，涵盖状态缓存、配置、连接回调、订单接收和通信线程。

快照：`4869436cb2196b7361c9670f92cdde8cde783087`；关联作者提交日期：2025-10-11；文件长度：73 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `CommAdapter::CommAdapter` | `L16–L16` | 声明 | 1 |
| `CommAdapter::~CommAdapter` | `L17–L17` | 声明 | 1 |
| `CommAdapter::updateStatus` | `L23–L23` | 声明 | 1 |
| `CommAdapter::getJsonVal` | `L25–L31` | 定义 | 7 |
| `CommAdapter::initConfig` | `L34–L34` | 声明 | 1 |
| `CommAdapter::commThread` | `L35–L35` | 声明 | 1 |
| `CommAdapter::onConnect` | `L36–L36` | 声明 | 1 |
| `CommAdapter::onMessage` | `L37–L38` | 声明 | 2 |
| `CommAdapter::handleConnect` | `L39–L39` | 声明 | 1 |
| `CommAdapter::handleRawTask` | `L40–L40` | 声明 | 1 |
| `CommAdapter::getStates` | `L41–L44` | 定义 | 4 |
| `CommAdapter::setStates` | `L45–L48` | 定义 | 4 |
| `CommAdapter::CommAdapterConfig::CommAdapterConfig` | `L61–L61` | 定义 | 1 |

<a id="history-7"></a>

### 4.7 `include/common/class_logger.h`

功能范围：历史日志头文件路径；本次可核实的 hehongjie 记录为删除该路径，不能据此认定为其开发。

快照：`fd6ba03e0098f9ae7d4fc2776b4d269088b10407^`；关联作者提交日期：2025-11-12；文件长度：257 行。

此处为删除/重命名提交的父版本，仅用于说明当时文件内容；不能把删除该文件视为开发该文件。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `LogStream::LogStream` | `L36–L39` | 定义 | 0 |
| `LogStream::LogStream` | `L42–L42` | 禁用接口 | 0 |
| `LogStream::operator=` | `L43–L43` | 禁用接口 | 0 |
| `LogStream::LogStream` | `L46–L53` | 定义 | 0 |
| `LogStream::~LogStream` | `L55–L83` | 定义 | 0 |
| `LogStream::operator<<` | `L86–L89` | 定义 | 0 |
| `ClassLogger::ParseLevel` | `L100–L109` | 定义 | 0 |
| `ClassLogger::CreateLogger` | `L111–L159` | 定义 | 0 |
| `ClassLogger::ClassLogger` | `L162–L169` | 定义 | 0 |
| `ClassLogger::ClassLogger` | `L171–L179` | 定义 | 0 |
| `ClassLogger::GetLogger` | `L181–L183` | 定义 | 0 |
| `ClassLogger::Trace` | `L186–L188` | 定义 | 0 |
| `ClassLogger::Debug` | `L190–L192` | 定义 | 0 |
| `ClassLogger::Info` | `L194–L196` | 定义 | 0 |
| `ClassLogger::Warning` | `L198–L200` | 定义 | 0 |
| `ClassLogger::Error` | `L202–L204` | 定义 | 0 |
| `ClassLogger::Critical` | `L206–L208` | 定义 | 0 |
| `ClassLogger::TraceF` | `L212–L212` | 定义 | 0 |
| `ClassLogger::DebugF` | `L215–L215` | 定义 | 0 |
| `ClassLogger::InfoF` | `L218–L218` | 定义 | 0 |
| `ClassLogger::WarningF` | `L221–L221` | 定义 | 0 |
| `ClassLogger::ErrorF` | `L224–L224` | 定义 | 0 |
| `ClassLogger::CriticalF` | `L227–L227` | 定义 | 0 |
| `ClassLogger::SetLevel` | `L229–L233` | 定义 | 0 |

<a id="history-8"></a>

### 4.8 `include/common/class_logger.hpp`

功能范围：历史基于 spdlog 的类日志封装，提供日志级别解析、日志流和各级日志接口。

快照：`52dad7dafc8146d0476e1675957f069b06c2aadc`；关联作者提交日期：2025-11-18；文件长度：257 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `LogStream::LogStream` | `L36–L39` | 定义 | 4 |
| `LogStream::LogStream` | `L42–L42` | 禁用接口 | 1 |
| `LogStream::operator=` | `L43–L43` | 禁用接口 | 1 |
| `LogStream::LogStream` | `L46–L53` | 定义 | 8 |
| `LogStream::~LogStream` | `L55–L83` | 定义 | 29 |
| `LogStream::operator<<` | `L86–L89` | 定义 | 4 |
| `ClassLogger::ParseLevel` | `L100–L109` | 定义 | 10 |
| `ClassLogger::CreateLogger` | `L111–L159` | 定义 | 49 |
| `ClassLogger::ClassLogger` | `L162–L169` | 定义 | 8 |
| `ClassLogger::ClassLogger` | `L171–L179` | 定义 | 9 |
| `ClassLogger::GetLogger` | `L181–L183` | 定义 | 3 |
| `ClassLogger::Trace` | `L186–L188` | 定义 | 3 |
| `ClassLogger::Debug` | `L190–L192` | 定义 | 3 |
| `ClassLogger::Info` | `L194–L196` | 定义 | 3 |
| `ClassLogger::Warning` | `L198–L200` | 定义 | 3 |
| `ClassLogger::Error` | `L202–L204` | 定义 | 3 |
| `ClassLogger::Critical` | `L206–L208` | 定义 | 3 |
| `ClassLogger::TraceF` | `L212–L212` | 定义 | 1 |
| `ClassLogger::DebugF` | `L215–L215` | 定义 | 1 |
| `ClassLogger::InfoF` | `L218–L218` | 定义 | 1 |
| `ClassLogger::WarningF` | `L221–L221` | 定义 | 1 |
| `ClassLogger::ErrorF` | `L224–L224` | 定义 | 1 |
| `ClassLogger::CriticalF` | `L227–L227` | 定义 | 1 |
| `ClassLogger::SetLevel` | `L229–L233` | 定义 | 5 |

<a id="history-9"></a>

### 4.9 `include/drivers/laser_drivers/wanji_718h_interface.h`

功能范围：历史万集 718H 雷达驱动接口，包含初始化、启动、停止和扫描处理；属于参与修改文件。

快照：`e414586a5a86fa7a5bf4c10af11d9f950093b2d4`；关联作者提交日期：2026-03-18；文件长度：46 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `LaserInterface::~LaserInterface` | `L20–L20` | 声明 | 0 |
| `LaserInterface::init` | `L23–L23` | 声明 | 0 |
| `LaserInterface::start` | `L26–L26` | 声明 | 0 |
| `LaserInterface::stop` | `L29–L29` | 声明 | 0 |
| `LaserInterface::process` | `L33–L33` | 声明 | 0 |

<a id="history-10"></a>

### 4.10 `include/nav_base/core/ros_datastore.h`

功能范围：历史 ROS 数据存储接口；本次 hehongjie 记录为删除该文件，不能据此认定为其开发。

快照：`7869ec4643438a68b5eb3903bfc980a2f9781ff8^`；关联作者提交日期：2025-11-03；文件长度：68 行。

此处为删除/重命名提交的父版本，仅用于说明当时文件内容；不能把删除该文件视为开发该文件。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `RosDatastore::getInstance` | `L42–L45` | 定义 | 0 |
| `RosDatastore::RosDatastore` | `L46–L46` | 声明 | 0 |
| `RosDatastore::~RosDatastore` | `L47–L47` | 定义 | 0 |
| `RosDatastore::init` | `L49–L49` | 声明 | 0 |
| `RosDatastore::odomVel` | `L50–L50` | 声明 | 0 |
| `RosDatastore::motorVelFeedback` | `L51–L52` | 声明 | 0 |
| `RosDatastore::maxSpeed` | `L53–L53` | 声明 | 0 |
| `RosDatastore::stopTrigger` | `L54–L54` | 声明 | 0 |
| `RosDatastore::taskPriority` | `L55–L55` | 声明 | 0 |
| `RosDatastore::visualMarks` | `L56–L57` | 声明 | 0 |
| `RosDatastore::localizationStatus` | `L58–L59` | 声明 | 0 |
| `RosDatastore::mapUpdate` | `L60–L60` | 声明 | 0 |
| `RosDatastore::safeStop` | `L61–L61` | 声明 | 0 |

<a id="history-11"></a>

### 4.11 `include/order_manager/common/handle_exception.hpp`

功能范围：历史任务异常处理入口；后来由其他实现承接。

快照：`6e2087e708ea9348b76db2cb7c16d278541a7a6e`；关联作者提交日期：2025-10-20；文件长度：18 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `handleException` | `L10–L15` | 定义 | 6 |

<a id="history-12"></a>

### 4.12 `include/order_manager/utils/safety_client.h`

功能范围：历史 SafetyClient 类接口，用于发送安全属性。

快照：`2dfff25044e6c9fa4d207552547fca65c221c6d5`；关联作者提交日期：2025-11-24；文件长度：18 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `SafetyClient::SafetyClient` | `L11–L11` | 默认实现 | 1 |
| `SafetyClient::~SafetyClient` | `L12–L12` | 默认实现 | 1 |
| `SafetyClient::sendAttr` | `L14–L14` | 声明 | 1 |

<a id="history-13"></a>

### 4.13 `include/protocol_adapter/Iprotocol_adapter.h`

功能范围：历史协议适配抽象接口，定义任务和状态消息的编码/解码。

快照：`d47f339fed1c66230ddc0f5d9b188259e615fa0e`；关联作者提交日期：2025-09-08；文件长度：23 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `IProtocolAdapter::~IProtocolAdapter` | `L10–L10` | 默认实现 | 1 |
| `IProtocolAdapter::taskDecoder` | `L11–L13` | 声明 | 3 |
| `IProtocolAdapter::taskCoder` | `L14–L15` | 声明 | 2 |
| `IProtocolAdapter::statusCoder` | `L16–L17` | 声明 | 2 |
| `IProtocolAdapter::statusDecoder` | `L18–L20` | 声明 | 3 |

<a id="history-14"></a>

### 4.14 `include/protocol_adapter/VDA5050_V2/protocol_adapter.h`

功能范围：历史 VDA5050 V2 适配接口：订单和状态编解码、字段解析/填充、枚举字符串转换。

快照：`a77274a99694bba9396b123b8f5204175f875eca`；关联作者提交日期：2025-09-25；文件长度：232 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `VDA5050V2ProtocolAdapter::VDA5050V2ProtocolAdapter` | `L14–L14` | 默认实现 | 1 |
| `VDA5050V2ProtocolAdapter::~VDA5050V2ProtocolAdapter` | `L15–L15` | 默认实现 | 1 |
| `VDA5050V2ProtocolAdapter::taskDecoder` | `L16–L17` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::taskCoder` | `L18–L19` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::statusCoder` | `L20–L21` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::statusDecoder` | `L22–L23` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::getJsonVal` | `L27–L33` | 定义 | 7 |
| `VDA5050V2ProtocolAdapter::parseHeader` | `L36–L36` | 声明 | 1 |
| `VDA5050V2ProtocolAdapter::fillHeader` | `L37–L37` | 声明 | 1 |
| `VDA5050V2ProtocolAdapter::parseOrderAction` | `L40–L41` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::parseEdgeTrajectory` | `L42–L42` | 声明 | 1 |
| `VDA5050V2ProtocolAdapter::parseEdgeCorridor` | `L43–L44` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::parseOrderPathNodes` | `L45–L47` | 声明 | 3 |
| `VDA5050V2ProtocolAdapter::parseOrderPathEdges` | `L48–L50` | 声明 | 3 |
| `VDA5050V2ProtocolAdapter::fillOrderAction` | `L52–L53` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::fillNodePositon` | `L54–L55` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::fillEdgeCorridor` | `L56–L57` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::fillEdgeTrajectory` | `L58–L59` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::fillOrderPathNodes` | `L60–L61` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::fillOrderPathEdges` | `L62–L63` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::blockingTypeToString` | `L64–L73` | 定义 | 10 |
| `VDA5050V2ProtocolAdapter::corridorRefPointToString` | `L74–L81` | 定义 | 8 |
| `VDA5050V2ProtocolAdapter::orientationTypeToString` | `L82–L89` | 定义 | 8 |
| `VDA5050V2ProtocolAdapter::parseMapEntryState` | `L92–L94` | 声明 | 3 |
| `VDA5050V2ProtocolAdapter::parseActionState` | `L95–L97` | 声明 | 3 |
| `VDA5050V2ProtocolAdapter::parseNodeState` | `L98–L99` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::parseEdgeState` | `L100–L101` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::parseAgvPositionState` | `L102–L103` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::parseVelocityState` | `L104–L104` | 声明 | 1 |
| `VDA5050V2ProtocolAdapter::parseLoadState` | `L105–L105` | 声明 | 1 |
| `VDA5050V2ProtocolAdapter::parseSafetyState` | `L106–L107` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::parseBatteryState` | `L108–L109` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::parseInfoState` | `L110–L111` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::parseErrorState` | `L112–L113` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::parseOperationalState` | `L114–L116` | 声明 | 3 |
| `VDA5050V2ProtocolAdapter::fillMapEntryState` | `L118–L119` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::fillNodeState` | `L120–L121` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::fillEdgeState` | `L122–L123` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::fillAgvPositionState` | `L124–L125` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::fillVelocityState` | `L126–L127` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::fillLoadDimensionsState` | `L128–L129` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::fillLoadState` | `L130–L130` | 声明 | 1 |
| `VDA5050V2ProtocolAdapter::fillReferenceInfo` | `L131–L132` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::fillInfoState` | `L133–L133` | 声明 | 1 |
| `VDA5050V2ProtocolAdapter::fillErrorState` | `L134–L135` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::fillActionState` | `L136–L137` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::fillSafetyState` | `L138–L139` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::fillBatteryState` | `L140–L141` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::mapStatusToString` | `L143–L145` | 定义 | 3 |
| `VDA5050V2ProtocolAdapter::actionStatusToString` | `L146–L163` | 定义 | 18 |
| `VDA5050V2ProtocolAdapter::eStopToString` | `L164–L176` | 定义 | 13 |
| `VDA5050V2ProtocolAdapter::infoLevelToString` | `L177–L179` | 定义 | 3 |
| `VDA5050V2ProtocolAdapter::errorLevelToString` | `L180–L182` | 定义 | 3 |
| `VDA5050V2ProtocolAdapter::operatingModeToString` | `L183–L197` | 定义 | 15 |

<a id="history-15"></a>

### 4.15 `include/protocol_adapter/VDA5050_v2/protocol_adapter.h`

功能范围：更早期的小写目录 VDA5050 适配接口；与大写目录版本是不同历史路径，不能按两套独立模块计算。

快照：`d47f339fed1c66230ddc0f5d9b188259e615fa0e`；关联作者提交日期：2025-09-08；文件长度：27 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `VDA5050V2ProtocolAdapter::VDA5050V2ProtocolAdapter` | `L11–L11` | 默认实现 | 1 |
| `VDA5050V2ProtocolAdapter::~VDA5050V2ProtocolAdapter` | `L12–L12` | 默认实现 | 1 |
| `VDA5050V2ProtocolAdapter::taskDecoder` | `L13–L14` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::taskCoder` | `L15–L16` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::statusCoder` | `L17–L18` | 声明 | 2 |
| `VDA5050V2ProtocolAdapter::statusDecoder` | `L19–L20` | 声明 | 2 |

<a id="history-16"></a>

### 4.16 `include/protocol_adapter/VDA5050_v2/protocol_structs.h`

功能范围：早期协议数据结构和枚举定义；无函数。

快照：`d47f339fed1c66230ddc0f5d9b188259e615fa0e`；关联作者提交日期：2025-09-08；文件长度：301 行。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="history-17"></a>

### 4.17 `include/protocol_adapter/common/Iprotocol_adapter.h`

功能范围：历史协议适配抽象接口，定义 taskDecoder/taskCoder/statusCoder/statusDecoder。

快照：`2d3ae7e115eccde4ec4977942ffd6c4832622ff7`；关联作者提交日期：2025-09-16；文件长度：61 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `IProtocolAdapter::~IProtocolAdapter` | `L10–L10` | 默认实现 | 1 |
| `IProtocolAdapter::taskDecoder` | `L25–L27` | 声明 | 3 |
| `IProtocolAdapter::taskCoder` | `L36–L37` | 声明 | 2 |
| `IProtocolAdapter::statusCoder` | `L46–L47` | 声明 | 2 |
| `IProtocolAdapter::statusDecoder` | `L56–L58` | 声明 | 3 |

<a id="history-18"></a>

### 4.18 `include/protocol_adapter/common/protocol_structs.h`

功能范围：历史通用订单/状态协议数据结构，含消息头、节点/边、轨迹、位置、速度、载荷、安全、电池等结构的默认构造。

快照：`6ce252bf8c4353e09d07602b0d7d2d10f6f969e7`；关联作者提交日期：2025-09-28；文件长度：352 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `CurrentState::CurrentState` | `L13–L13` | 定义 | 1 |
| `Header::Header` | `L24–L24` | 定义 | 1 |
| `ControlPoint::ControlPoint` | `L31–L31` | 定义 | 1 |
| `Trajectory::Trajectory` | `L37–L37` | 定义 | 1 |
| `NodePosition::NodePosition` | `L58–L60` | 定义 | 3 |
| `PathNode::PathNode` | `L95–L95` | 定义 | 1 |
| `Corridor::Corridor` | `L112–L114` | 定义 | 3 |
| `PathEdge::PathEdge` | `L137–L139` | 定义 | 3 |
| `OrderMessage::OrderMessage` | `L154–L154` | 定义 | 1 |
| `NodeState::NodeState` | `L195–L195` | 定义 | 1 |
| `EdgeState::EdgeState` | `L204–L204` | 定义 | 1 |
| `AgvPosition::AgvPosition` | `L222–L224` | 定义 | 3 |
| `Velocity::Velocity` | `L231–L231` | 定义 | 1 |
| `LoadDimensions::LoadDimensions` | `L238–L238` | 定义 | 1 |
| `Load::Load` | `L249–L249` | 定义 | 1 |
| `SafetyState::SafetyState` | `L286–L286` | 定义 | 1 |
| `BatteryState::BatteryState` | `L295–L297` | 定义 | 3 |
| `TaskState::TaskState` | `L326–L328` | 定义 | 3 |
| `StateMessage::StateMessage` | `L347–L349` | 定义 | 3 |

<a id="history-19"></a>

### 4.19 `include/protocol_adapter/protocol_adapter_factory.h`

功能范围：历史协议适配器工厂接口。

快照：`4869436cb2196b7361c9670f92cdde8cde783087`；关联作者提交日期：2025-10-11；文件长度：21 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `ProtocolAdapterFactory::createAdapter` | `L13–L14` | 声明 | 2 |
| `ProtocolAdapterFactory::ProtocolAdapterFactory` | `L15–L15` | 默认实现 | 1 |
| `ProtocolAdapterFactory::~ProtocolAdapterFactory` | `L16–L16` | 默认实现 | 1 |

<a id="history-20"></a>

### 4.20 `include/state_manager/common/fsm_common.hpp`

功能范围：历史车辆公共状态机：等待定位、维护、故障、就绪、等待复位和运行状态转换。

快照：`dd85cffd177cdb7bf0178930090a8d030f87e701`；关联作者提交日期：2026-04-09；文件长度：121 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `stateToString` | `L9–L28` | 定义 | 20 |
| `FSM::FSM` | `L37–L37` | 定义 | 1 |
| `FSM::waitLocation` | `L40–L51` | 定义 | 12 |
| `FSM::maintenance` | `L53–L58` | 定义 | 6 |
| `FSM::malfunction` | `L60–L65` | 定义 | 6 |
| `FSM::ready` | `L67–L79` | 定义 | 13 |
| `FSM::waitReset` | `L81–L86` | 定义 | 6 |
| `FSM::running` | `L88–L99` | 定义 | 12 |
| `FSM::printState` | `L101–L103` | 定义 | 3 |
| `FSM::getState` | `L105–L108` | 定义 | 4 |
| `FSM::transition` | `L114–L118` | 定义 | 5 |

<a id="history-21"></a>

### 4.21 `include/state_manager/common/state_common.hpp`

功能范围：历史状态来源/车辆状态公共类型及状态来源哈希适配。

快照：`91a1e6c5627f71d6ff6229430e95cbf8f607a40b`；关联作者提交日期：2026-04-08；文件长度：25 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `hash<StateSource>::operator()` | `L21–L23` | 定义 | 3 |

<a id="history-22"></a>

### 4.22 `include/state_manager/status_gather.h`

功能范围：历史 StatusGather 状态汇聚接口，接收任务、动作、安全、电池、健康、地图、载荷、位姿、速度和模式数据。

快照：`6bc29fe79983a3fa70213a2945e33c910fe90b4b`；关联作者提交日期：2026-04-09；文件长度：149 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `StatusGather::StatusGather` | `L14–L14` | 声明 | 1 |
| `StatusGather::StatusGather` | `L17–L17` | 禁用接口 | 1 |
| `StatusGather::operator=` | `L18–L18` | 禁用接口 | 1 |
| `StatusGather::getInstance` | `L22–L25` | 定义 | 4 |
| `StatusGather::~StatusGather` | `L27–L27` | 默认实现 | 1 |
| `StatusGather::setAgvId` | `L32–L32` | 定义 | 1 |
| `StatusGather::pubTaskStatus` | `L40–L42` | 声明 | 3 |
| `StatusGather::pubActionStatus` | `L48–L48` | 声明 | 1 |
| `StatusGather::pubSafetyStatus` | `L54–L54` | 声明 | 1 |
| `StatusGather::pubIPCStatus` | `L60–L60` | 声明 | 1 |
| `StatusGather::pubHealthStatus` | `L66–L69` | 声明 | 4 |
| `StatusGather::pubMapStatus` | `L75–L75` | 声明 | 1 |
| `StatusGather::pubLoadStatus` | `L81–L81` | 声明 | 1 |
| `StatusGather::pubAgvStatus` | `L87–L87` | 声明 | 1 |
| `StatusGather::pubAgvVelocity` | `L93–L93` | 声明 | 1 |
| `StatusGather::pubOperatingMode` | `L99–L99` | 声明 | 1 |
| `StatusGather::getAllStatus` | `L105–L105` | 声明 | 1 |
| `StatusGather::pubCommonFSM` | `L111–L111` | 声明 | 1 |
| `StatusGather::transTaskStatus` | `L114–L116` | 声明 | 3 |
| `StatusGather::transInfoAndError` | `L117–L120` | 声明 | 4 |
| `StatusGather::fillHeader` | `L121–L121` | 声明 | 1 |
| `StatusGather::getAgvId` | `L123–L123` | 定义 | 1 |

<a id="history-23"></a>

### 4.23 `include/state_manager/status_monitor.h`

功能范围：历史 StatusMonitor 状态消息填充接口。

快照：`002f8721480a8bbf736f5eef01fe328535255e6f`；关联作者提交日期：2025-10-20；文件长度：38 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `StatusMonitor::StatusMonitor` | `L11–L11` | 声明 | 1 |
| `StatusMonitor::~StatusMonitor` | `L12–L12` | 声明 | 1 |
| `StatusMonitor::fillStateMessage` | `L30–L30` | 声明 | 1 |

<a id="history-24"></a>

### 4.24 `src/comm_adapter/CMakeLists.txt`

功能范围：该目录模块的构建、依赖链接及安装配置；无业务函数。

快照：`34c07a306db591beefdee762b907fb55e6bc7e60`；关联作者提交日期：2025-10-14；文件长度：100 行。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="history-25"></a>

### 4.25 `src/comm_adapter/comm_adapter.cpp`

功能范围：历史 MQTT 通信实现：初始化配置、处理连接、接收/解析订单、编码并发送状态、运行通信线程。

快照：`33f0f62b206f1a5117a297de235ddbce7857cf94`；关联作者提交日期：2025-09-25；文件长度：208 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `CommAdapter::CommAdapter` | `L8–L21` | 定义 | 14 |
| `CommAdapter::~CommAdapter` | `L22–L28` | 定义 | 7 |
| `CommAdapter::initConfig` | `L30–L70` | 定义 | 41 |
| `CommAdapter::updateStatus` | `L72–L82` | 定义 | 11 |
| `CommAdapter::handleConnect` | `L84–L92` | 定义 | 9 |
| `CommAdapter::onConnect` | `L95–L105` | 定义 | 11 |
| `CommAdapter::handleRawTask` | `L107–L124` | 定义 | 18 |
| `CommAdapter::onMessage` | `L126–L134` | 定义 | 9 |
| `CommAdapter::commThread` | `L136–L206` | 定义 | 71 |

<a id="history-26"></a>

### 4.26 `src/comm_adapter/comm_adapter.h`

功能范围：历史空头文件，占位文件；无函数。

快照：`945aa75f91abde782dbdc187eb28d8ff3d8fb2a5`；关联作者提交日期：2025-09-03；文件长度：0 行。

函数范围：无，文件为空。

<a id="history-27"></a>

### 4.27 `src/comm_adapter/comm_demo.cpp`

功能范围：历史通信演示入口及信号退出处理。

快照：`ad5d7d7324958ccad82ac29a4ae54aa4ce2a7866`；关联作者提交日期：2025-09-18；文件长度：27 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `signalHandler` | `L6–L11` | 定义 | 6 |
| `main` | `L13–L27` | 定义 | 15 |

<a id="history-28"></a>

### 4.28 `src/drivers/laser_drivers/laser_drivers.cpp`

功能范围：历史万集雷达命令构造、校验、扫描组装和驱动生命周期实现；属于参与修改文件。

快照：`e414586a5a86fa7a5bf4c10af11d9f950093b2d4`；关联作者提交日期：2026-03-18；文件长度：446 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `reset_scan_assembly` | `L30–L34` | 定义 | 0 |
| `calculate_bcc_checksum` | `L37–L40` | 定义 | 0 |
| `create_set_running_mode_cmd` | `L42–L51` | 定义 | 0 |
| `create_set_standby_mode_cmd` | `L54–L63` | 定义 | 0 |
| `create_start_scan_cmd` | `L65–L80` | 定义 | 0 |
| `create_stop_scan_cmd` | `L83–L98` | 定义 | 0 |
| `LaserInterface::~LaserInterface` | `L102–L107` | 定义 | 0 |
| `LaserInterface::init` | `L110–L173` | 定义 | 1 |
| `LaserInterface::start` | `L176–L214` | 定义 | 0 |
| `LaserInterface::stop` | `L217–L256` | 定义 | 0 |
| `LaserInterface::process` | `L259–L443` | 定义 | 3 |

<a id="history-29"></a>

### 4.29 `src/drivers/motor_driver.cpp`

功能范围：历史电机驱动初始化、启停、接收解析及速度发送实现；属于参与修改文件。

快照：`f4233b81dd768b7c0de1d0036767142ef853ee28`；关联作者提交日期：2025-11-07；文件长度：395 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `sendMotorSpeed` | `L19–L134` | 定义 | 0 |
| `MotorDriver::init` | `L136–L184` | 定义 | 0 |
| `MotorDriver::start` | `L186–L213` | 定义 | 0 |
| `MotorDriver::stop` | `L215–L231` | 定义 | 0 |
| `MotorDriver::process` | `L233–L241` | 定义 | 0 |
| `MotorDriver::receiveAndParseData` | `L244–L365` | 定义 | 1 |
| `MotorDriver::sendSpeed` | `L367–L393` | 定义 | 0 |

<a id="history-30"></a>

### 4.30 `src/main2.cpp`

功能范围：历史主程序版本，包含通信配置/适配器初始化、位置更新和运行入口。

快照：`fec7a94d620eafd85a55a1d1cd8bf21b595d2d96`；关联作者提交日期：2025-10-29；文件长度：192 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `signalHandler` | `L33–L38` | 定义 | 0 |
| `updateAgvPosition` | `L40–L46` | 定义 | 7 |
| `initCommConfig` | `L48–L74` | 定义 | 27 |
| `initCommAdapter` | `L76–L83` | 定义 | 8 |
| `main` | `L86–L191` | 定义 | 47 |

<a id="history-31"></a>

### 4.31 `src/protocol_adapter/CMakeLists.txt`

功能范围：该目录模块的构建、依赖链接及安装配置；无业务函数。

快照：`1eb1f15871d1458f3a2a64ffae22ff3352246169`；关联作者提交日期：2025-09-22；文件长度：103 行。

函数范围：无具名函数；内容为数据结构、枚举、配置、构建命令或文档。

<a id="history-32"></a>

### 4.32 `src/protocol_adapter/VDA5050_V2/protocol_adapter.cpp`

功能范围：历史 VDA5050 V2 订单/状态 JSON 编解码实现，解析或填充头、动作、节点、边、轨迹、走廊、地图、位置、速度、载荷、安全、电池、信息和错误。

快照：`6171f8dfb6ec6c89f67dd9fbc0cce40aceca2ac2`；关联作者提交日期：2025-10-13；文件长度：814 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `VDA5050V2ProtocolAdapter::parseHeader` | `L7–L14` | 定义 | 8 |
| `VDA5050V2ProtocolAdapter::parseOrderAction` | `L16–L32` | 定义 | 17 |
| `VDA5050V2ProtocolAdapter::parseEdgeCorridor` | `L34–L54` | 定义 | 21 |
| `VDA5050V2ProtocolAdapter::parseEdgeTrajectory` | `L56–L73` | 定义 | 18 |
| `VDA5050V2ProtocolAdapter::parseOrderPathNodes` | `L75–L117` | 定义 | 43 |
| `VDA5050V2ProtocolAdapter::parseOrderPathEdges` | `L119–L169` | 定义 | 51 |
| `VDA5050V2ProtocolAdapter::fillHeader` | `L171–L178` | 定义 | 8 |
| `VDA5050V2ProtocolAdapter::fillOrderAction` | `L180–L189` | 定义 | 10 |
| `VDA5050V2ProtocolAdapter::fillEdgeCorridor` | `L191–L198` | 定义 | 8 |
| `VDA5050V2ProtocolAdapter::fillNodePositon` | `L200–L210` | 定义 | 11 |
| `VDA5050V2ProtocolAdapter::fillEdgeTrajectory` | `L212–L221` | 定义 | 10 |
| `VDA5050V2ProtocolAdapter::fillOrderPathNodes` | `L223–L238` | 定义 | 16 |
| `VDA5050V2ProtocolAdapter::fillOrderPathEdges` | `L240–L267` | 定义 | 28 |
| `VDA5050V2ProtocolAdapter::fillMapEntryState` | `L269–L280` | 定义 | 12 |
| `VDA5050V2ProtocolAdapter::fillActionState` | `L282–L293` | 定义 | 12 |
| `VDA5050V2ProtocolAdapter::fillNodeState` | `L295–L306` | 定义 | 12 |
| `VDA5050V2ProtocolAdapter::fillEdgeState` | `L308–L322` | 定义 | 15 |
| `VDA5050V2ProtocolAdapter::fillAgvPositionState` | `L324–L335` | 定义 | 12 |
| `VDA5050V2ProtocolAdapter::fillVelocityState` | `L337–L341` | 定义 | 5 |
| `VDA5050V2ProtocolAdapter::fillLoadDimensionsState` | `L343–L348` | 定义 | 6 |
| `VDA5050V2ProtocolAdapter::fillLoadState` | `L350–L363` | 定义 | 14 |
| `VDA5050V2ProtocolAdapter::fillSafetyState` | `L365–L369` | 定义 | 5 |
| `VDA5050V2ProtocolAdapter::fillBatteryState` | `L371–L378` | 定义 | 8 |
| `VDA5050V2ProtocolAdapter::fillReferenceInfo` | `L380–L388` | 定义 | 9 |
| `VDA5050V2ProtocolAdapter::fillInfoState` | `L390–L403` | 定义 | 14 |
| `VDA5050V2ProtocolAdapter::fillErrorState` | `L405–L418` | 定义 | 14 |
| `VDA5050V2ProtocolAdapter::parseMapEntryState` | `L420–L445` | 定义 | 26 |
| `VDA5050V2ProtocolAdapter::parseActionState` | `L447–L472` | 定义 | 26 |
| `VDA5050V2ProtocolAdapter::parseNodeState` | `L474–L489` | 定义 | 16 |
| `VDA5050V2ProtocolAdapter::parseEdgeState` | `L491–L507` | 定义 | 17 |
| `VDA5050V2ProtocolAdapter::parseAgvPositionState` | `L509–L530` | 定义 | 22 |
| `VDA5050V2ProtocolAdapter::parseVelocityState` | `L532–L540` | 定义 | 9 |
| `VDA5050V2ProtocolAdapter::parseLoadState` | `L542–L564` | 定义 | 23 |
| `VDA5050V2ProtocolAdapter::parseSafetyState` | `L566–L584` | 定义 | 19 |
| `VDA5050V2ProtocolAdapter::parseBatteryState` | `L586–L601` | 定义 | 16 |
| `VDA5050V2ProtocolAdapter::parseInfoState` | `L603–L635` | 定义 | 33 |
| `VDA5050V2ProtocolAdapter::parseErrorState` | `L637–L670` | 定义 | 34 |
| `VDA5050V2ProtocolAdapter::parseOperationalState` | `L672–L687` | 定义 | 16 |
| `VDA5050V2ProtocolAdapter::taskDecoder` | `L689–L711` | 定义 | 23 |
| `VDA5050V2ProtocolAdapter::taskCoder` | `L713–L731` | 定义 | 19 |
| `VDA5050V2ProtocolAdapter::statusCoder` | `L733–L767` | 定义 | 35 |
| `VDA5050V2ProtocolAdapter::statusDecoder` | `L769–L812` | 定义 | 44 |

<a id="history-33"></a>

### 4.33 `src/protocol_adapter/protocol_adapter_demo.cpp`

功能范围：历史协议测试/演示入口，验证任务及状态消息编解码。

快照：`c61fbb93c7e91949ecd21439cd72a3319cbc1063`；关联作者提交日期：2025-09-29；文件长度：105 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `testTask` | `L8–L42` | 定义 | 35 |
| `testState` | `L44–L78` | 定义 | 35 |
| `main` | `L82–L105` | 定义 | 24 |

<a id="history-34"></a>

### 4.34 `src/protocol_adapter/protocol_adapter_factory.cpp`

功能范围：历史 createAdapter 实现，按协议类型选择协议适配器。

快照：`a57fb566e0de9ef3505e9074ca8f9270f945aef5`；关联作者提交日期：2025-09-12；文件长度：13 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `ProtocolAdapterFactory::createAdapter` | `L5–L11` | 定义 | 7 |

<a id="history-35"></a>

### 4.35 `src/state_manager/status_gather.cpp`

功能范围：历史状态汇聚实现，将各来源状态转换为统一状态消息，组织任务状态、信息和错误上报。

快照：`6bc29fe79983a3fa70213a2945e33c910fe90b4b`；关联作者提交日期：2026-04-09；文件长度：213 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `StatusGather::StatusGather` | `L6–L8` | 定义 | 3 |
| `StatusGather::pubTaskStatus` | `L10–L22` | 定义 | 13 |
| `StatusGather::pubActionStatus` | `L24–L30` | 定义 | 7 |
| `StatusGather::pubMapStatus` | `L32–L38` | 定义 | 7 |
| `StatusGather::pubSafetyStatus` | `L40–L46` | 定义 | 7 |
| `StatusGather::pubIPCStatus` | `L48–L54` | 定义 | 7 |
| `StatusGather::pubHealthStatus` | `L56–L61` | 定义 | 6 |
| `StatusGather::pubLoadStatus` | `L63–L69` | 定义 | 7 |
| `StatusGather::pubAgvStatus` | `L71–L76` | 定义 | 6 |
| `StatusGather::pubAgvVelocity` | `L78–L83` | 定义 | 6 |
| `StatusGather::pubOperatingMode` | `L85–L91` | 定义 | 7 |
| `StatusGather::pubCommonFSM` | `L93–L100` | 定义 | 8 |
| `StatusGather::transTaskStatus` | `L102–L143` | 定义 | 42 |
| `StatusGather::transInfoAndError` | `L145–L163` | 定义 | 19 |
| `StatusGather::fillHeader` | `L165–L185` | 定义 | 21 |
| `StatusGather::getAllStatus` | `L187–L211` | 定义 | 25 |

<a id="history-36"></a>

### 4.36 `src/state_manager/status_monitor.cpp`

功能范围：历史 StatusMonitor 构造/析构和 fillStateMessage 实现。

快照：`3c129fa768f7a205c289227cdfc8f4fb5562764f`；关联作者提交日期：2025-10-20；文件长度：17 行。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `StatusMonitor::StatusMonitor` | `L5–L7` | 定义 | 3 |
| `StatusMonitor::~StatusMonitor` | `L8–L10` | 定义 | 3 |
| `StatusMonitor::fillStateMessage` | `L12–L14` | 定义 | 3 |

## 5. 当前已改写文件的作者参与快照

以下文件仍在当前目录树，但当前所有行的 blame 均不再署名 hehongjie。为保留开发历史，补列其最后可查参与版本中的接口与函数；这些行号不适用于当前文件。快照是整份文件状态，不等于他独立编写了所有函数，因此本节不作逐函数归属断言。

### 5.1 当前 `include/state_manager/state_manager.h`

历史路径：`include/state_manager/state_manager.h`；快照：`74d6e684eda75279fc6d46a371459d8366e15a96`；作者日期：2025-09-24。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `StateManager::pubNavState` | `L7–L7` | 定义 | 未计算 |
| `StateManager::StateManager` | `L10–L10` | 定义 | 未计算 |
| `StateManager::~StateManager` | `L11–L11` | 定义 | 未计算 |

### 5.2 当前 `src/nav_base/core/config_master.cpp`

历史路径：`src/nav_base/core/config_master.cpp`；快照：`e414586a5a86fa7a5bf4c10af11d9f950093b2d4`；作者日期：2026-03-18。

| 函数 / 接口 | 起止行号（含边界） | 类型 | 该快照中 hehongjie 署名行 |
| --- | --- | --- | --- |
| `ConfigMaster::getInstance` | `L20–L23` | 定义 | 未计算 |
| `ConfigMaster::ConfigMaster` | `L25–L25` | 定义 | 未计算 |
| `loadConfig` | `L27–L146` | 定义 | 未计算 |
| `ConfigMaster::init` | `L148–L176` | 定义 | 未计算 |
| `ConfigMaster::chassisType` | `L178–L178` | 定义 | 未计算 |
| `ConfigMaster::trackWidth` | `L179–L181` | 定义 | 未计算 |
| `ConfigMaster::maxWheelVel` | `L182–L182` | 定义 | 未计算 |
| `ConfigMaster::haveTabRotater` | `L183–L183` | 定义 | 未计算 |

### 5.3 当前 `src/state_manager/state_manager.cpp`

历史路径：`src/state_manager/state_manager.cpp`；快照：`945aa75f91abde782dbdc187eb28d8ff3d8fb2a5`；作者日期：2025-09-03。

函数范围：无，文件为空。

## 6. 复核方式与限制

本次检查了当前 739 个 Git 跟踪项中的 519 个候选文件：所有当前 C/C++ 文件，以及作者提交和重命名链关联的其他文件。以 Git 重命名关系关联旧路径，并扫描当前 C/C++ blame，补查迁移后仍保留作者代码的文件。未按姓名注释猜测作者，也未将当前维护人作为开发作者。

函数范围使用 C++/Bash 语法树及 CMake 函数/宏边界提取，排除了局部锁变量等被语法树歧义识别为声明的条目，并补查转换运算符。`filesystem_compat.h` 的 `__has_include` 条件和历史 `fsm_common.hpp` 的日志宏会产生解析告警；已核对告警位置，不将它们作为函数。`nav_controller.cpp` 的宏上下文告警亦未影响列出的显式函数。默认/删除声明保留，匿名 lambda 和宏展开结果不列入。

复核命令：

```powershell
git shortlog -sne HEAD
git log HEAD --author=hehongjie --name-status --date=short
git log HEAD --author=hehongjie --diff-filter=A --name-only
git blame HEAD --line-porcelain -- 'src/order_manager/task_manager.cpp'
git show '6171f8df:src/protocol_adapter/VDA5050_V2/protocol_adapter.cpp'
```

本次为静态清单整理，核对了源码路径和函数行号，未构建或运行程序。更新源码后若增删行，须重新核对函数范围。
