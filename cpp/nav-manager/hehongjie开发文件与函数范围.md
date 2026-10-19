# nav-manager：hehongjie 开发文件与函数范围

## 1. 口径与阅读方式

本清单依据本地 `mainbody/nav-manager` 仓库的 Git 作者记录、当前源码的逐行署名和函数定义整理。识别的作者身份为姓名 `hehongjie` 的公司邮箱及 GitHub 邮箱记录。只整理文件和函数，不记录具体提交时间、提交号或版本。

“主体署名”表示当前主要实现仍由该作者署名；“参与”表示当前文件为多人共同维护，列出的函数是相关代码的检索入口，不表示整个函数均由其独立完成；“历史参与”表示有作者修改记录，但当前函数实现已被后续代码覆盖。源码行号只用于定位当前函数起点，随代码调整会变化。

本仓库还包含 ROS 环境、第三方 Eigen、构建产物及配置。下文聚焦导航业务源码；没有把第三方代码或整个仓库的功能都算作个人贡献。

| 模块 | 文件范围 | 主要关联工作 | 归属判断 |
| --- | --- | --- | --- |
| 任务入口与执行 | `manager/src/access_layer.cpp`、`manager/src/plugin/nav_plugin.cpp` | Action 任务接入、插件选择、导航目标构造、执行、反馈和结果 | 多人维护，个人有较大范围参与 |
| 路径处理与抢占 | `dispatch_preempt_processor.cpp`、`pruner.cpp`、`route_processor.cpp` | 路径拼接、裁断、起点定位、轨迹与运动类型处理 | 多人维护，个人参与 |
| 地图与搜路 | `map_manager.cpp`、`jz_router_generator.cpp`、`path_request.cpp` | 地图更新、节点/边转换、路径搜索、拓扑与轨迹信息 | 多人维护，个人参与 |
| 精度、安全与定位 | `precision_manager.cpp`、`abnormal_check.cpp`、`hotstart_manager.cpp`、`localization.cpp` | 到点精度、可行区域、异常检查、定位源切换 | 前两者主体署名；后两者参与 |
| 二维码检码 | `tag_checker.cpp`、`visualmarks_detect.cpp` | 检码、目标码识别、结果发布 | 当前主体署名 |
| 导航基础接口 | `nav_base_client.cpp`、`nav_core` 相关文件 | 导航目标/反馈接口、配置和健康状态 | 客户端主体署名；公共模块参与 |
| 到点自学习数据链路 | `manager/src/data_collection/*` | 补偿应用和数据采集相关文件 | 有历史作者记录；当前实现主要由其他作者署名，详见第 8 节 |

## 2. 任务入口与导航插件

### `manager/src/access_layer.cpp`、`manager/include/nav_manager/access_layer.h`

`AccessLayer` 接收移动任务 Action，选择导航或伺服插件，维护执行、取消、停车和任务完成流程。当前实现有较多 hehongjie 署名行，但入口和回调为多人共同修改。

| 函数 / 接口 | 当前起始行 | 功能 | 归属 |
| --- | ---: | --- | --- |
| `AccessLayer::AccessLayer` | L16 | 初始化数据存储、插件和任务通信 | 参与 |
| `getPluginHandle` | L82 | 根据任务目标选择插件 | 参与 |
| `executeCB` | L100 | 接收目标并驱动插件执行 | 参与 |
| `finishNavTask` | L234 | 汇总执行结果并结束任务 | 参与 |
| `cancelCallback` | L260 | 响应取消请求 | 参与 |
| `brakeUnlock` / `parkingPub` / `parkingFunc` | L270 / L295 / L304 | 刹车解锁与停车状态处理 | 参与 |
| `loop` / `initQuickVisualServoTeaching` | L323 / L343 | 周期处理和快速视觉伺服示教初始化 | 参与 |

### `manager/src/plugin/nav_plugin.cpp`、`manager/include/nav_manager/plugin/nav_plugin.h`

导航插件把外部任务转换为内部路径和 `NavBase` 目标，处理路径裁断、定位方式、控制反馈、结果和动态配置。它是本仓库最大、且多人持续修改的业务文件之一；下列函数是相关工作范围，不宜整体认定为个人独立设计。

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `NavPlugin::init` / `cancel` / `reset` | L342 / L351 / L288 | 初始化、取消及复位导航任务 |
| `preprocessing` / `getNavMode` | L481 / L554 | 目标预处理、导航模式判定 |
| `execute` / `getFeedback` / `fillMoveTaskResult` | L577 / L883 / L813 | 导航执行循环、反馈和结果转换 |
| `fillTaskParam` / `fillPathNode` | L901 / L1003 | 将外部节点和任务属性转为内部路径参数 |
| `fillInnerMBGoal` / `sendGoal` | L1414 / L1639 | 组织并下发底层导航目标 |
| `taskInit` / `firstTaskRouteLoc` / `taskRouteLoc` / `getRouteLoc` | L1683 / L1811 / L1890 / L2002 | 任务初始化及路径起点/续接位置判断 |
| `updateDynamicConfig` / `findSubmapPath` | L2085 / L2138 | 动态参数更新和子地图路径查找 |
| `abnormalCheck` / `fakeArriveCheck` / `processTaskPriority` | L868 / L2169 / L2205 | 异常、模拟到点及优先级处理 |
| `onMapUpdate` / `onSlowStop` / `fastLoop` / `slowLoop` | L250 / L1880 / L172 / L202 | 地图更新、缓停及周期处理 |

### `manager/src/plugin/servo_plugin.cpp`、`manager/include/nav_manager/plugin/servo_plugin.h`

伺服插件是同一任务入口下的另一执行分支。当前文件为多人维护，hehongjie 有部分实现署名。相关函数：`init`（L39）、`execute`（L60）、`sendGoal`（L84）、`vsFeedbackCB`（L92）、`vsDoneCB`（L99）、`reset`（L132）和 `cancel`（L141）。

## 3. 抢占、路径拼接与裁断

### `manager/src/dispatch/dispatch_preempt_processor.cpp`、对应头文件

调度抢占时，把新目标与已有路径衔接，并重映射反馈中的路径序号。当前实现有较多个人署名，仍属于共同维护文件。

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `sameSubGoal` | L58 | 判断前后目标是否为同一子目标 |
| `stitchWithLastPath` / `stitchWithoutLastPath` | L99 / L153 | 按有无历史路径选择拼接方式 |
| `transform` / `transformPoint` / `transformGoal` | L196 / L214 / L294 | 转换路径点与调度目标 |
| `followStitch` / `stitch` | L248 / L404 | 追踪并生成衔接路径 |
| `calcDeltaSeq` / `remapDeltaSeq` / `remapPathIndex` | L280 / L285 / L291 | 维护反馈序号映射 |
| `publish` | L375 | 发布路径位置结果 |

### `manager/src/code_inserting/pruner.cpp`、对应头文件

按起点、运动类型、顺滑过点、载体旋转、定位、轨迹和请求搜路结果裁断路径。当前函数由多人迭代，个人有可核实参与。

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `prune` / `resetFrontIndex` | L30 / L119 | 统一裁断入口与前端索引复位 |
| `driveType` / `smoothThrough` | L131 / L187 | 依据运动类型和顺滑过点规则裁断 |
| `carrierPrune` / `rotatePrune` | L338 / L601 | 载体与旋转段处理 |
| `upTrack` / `locPrune` | L379 / L397 | 上线与定位相关裁断 |
| `lonOrLateralPrune` / `trajectoryPrune` / `reqRoutePrune` | L452 / L477 / L546 | 横纵向、轨迹与搜路路径裁断 |

### `manager/src/router/route_processor.cpp`、对应头文件

承担路径片段合并、起点索引和运动类型处理。当前主体代码中有大量个人署名，函数仍有多人改动。

主要函数：`uptrackProcess`（L44）、`hardPruneProcess`（L124）、`calcStartIndex`（L148）、`trajectoryProcess`（L264）、`setLateralMove`（L285）、`fillMoveType`（L343）、`mergePathPart`（L411）、`pathPartProcess`（L493）、`mappingMergePath`（L639）和 `mergePath`（L737）。

## 4. 地图、搜路与配置

### `manager/src/map/map_manager.cpp`、`manager/include/nav_manager/map/map_manager.h`

地图管理负责地图更新、节点/边结构生成、位置查询、子图坐标转换与轨迹信息提取。当前文件约半数代码行有个人署名，其余由团队维护。

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `init` / `onMapUpdate` | L38 / L70 | 初始化和更新地图 |
| `createMapInfo` / `createNewNodes` / `createNewEdges` | L129 / L409 / L577 | 生成地图节点与边信息 |
| `findTopoPoint` / `findNode` / `findEdge` | L731 / L969 / L994 | 拓扑、节点和边查询 |
| `fetchNewMapInfo` / `getStorageAreaNodes` | L904 / L954 | 获取新地图数据及库位区域节点 |
| `calcTrajDist` / `findNearest` / `checkTrajectorys` | L1103 / L1136 / L1173 | 轨迹距离、最近点与轨迹检查 |
| `transformNewCarly` / `transformSubPose` | L1247 / L1290 | 地图和子图位姿转换 |
| `fillEdgeTrajControlPoints` / `fillTrajectoryInfo` | L1447 / L1540 | 提取边上的轨迹控制信息 |

### `manager/src/router/jz_router_generator.cpp`、`path_request.cpp`

`JzRouterGenerator` 封装外部搜路接口及路径检查，当前文件为多人维护，个人参与。主要函数：`updateBestPath`（L15）、`checkPaths`（L47）、`getIndex`（L66）、`searchSrcIndex`（L109）、`updateMap`（L153）、`searchPaths`（L182）、`searchRoute`（L208）和 `jzSearch`（L363）。

`PathRequest` 为路径请求建立查询表，主要接口为 `init`（L6）和 `createTable`（L8）；文件有个人参与记录。`manager/src/config_manager.cpp` 中的 `loadConfig`（L20）、`loadConfigMaster`（L51）、`needUpdateMap`（L120）和 `stopToUpdate`（L148）关联导航参数与地图更新控制，属于共同维护范围。

## 5. 到点精度、安全与定位

### `manager/src/code_inserting/precision_manager.cpp`、对应头文件

当前实现几乎全部为 hehongjie 署名，是归属较清晰的模块。`PrecisionManager` 将任务路径与车辆外形转成到点精度/可行区域约束。

主要函数：`parseCoordinates`（L39）、`setFootprint`（L86）、`fillReachScene`（L109）、`calcCircumcircle`（L180）、`calcRegion`（L196）、`calcInflation`（L241）、`calcPolygon`（L250）、`calcTrajPolygon`（L302）、`calcExtraPoint`（L327）、`transformToJsonStr`（L376）和 `updateFeasibleRegion`（L416）。

### `manager/src/code_inserting/abnormal_check.cpp`、对应头文件

当前实现为 hehongjie 署名。`AbnormalCheck` 检查载体旋转、移动、终点以及二维码定位相关异常。主要函数：`carrierCheck`（L15）、`carrierCheckRotate`（L78）、`carrierCheckMove`（L114）、`carrierNoRotateCheck`（L134）、`carrierEndCheck`（L164）和 `qrcodeCheck`（L192）。

### `manager/src/code_inserting/hotstart_manager.cpp`、`localization.cpp`

热启动和定位源选择由多人维护，个人参与范围包括 `HotStartManager::isLocValid`（L71）、`navModeCheck`（L151）、`setHete`（L548）、`waitLocValid`（L595）、`globalLocSourceSync`（L676）等流程。`Localization` 中关联 `getWorldPose`（L39）、`handleVisualmarkInfo`（L86）、`handleLaserLocInfo`（L99）、`handleTagLocInfo`（L117）和 `handleTextureLocInfo`（L143），也应按共同维护描述。

`manager/src/code_inserting/low_code_process.cpp` 当前几乎全部有个人署名，其中 `LowCodePub::pubLowCode`（L12）、`pubLowcodeData`（L22）、`calcEndDist`（L115）、`calcStartDist`（L179）和 `taskFeedbackAlign`（L186）负责计算并发布任务起终点距离；`carrier_rotater.cpp` 的 `setRotateAngle`（L36）和 `getCarrierAngleInTarget`（L94）参与载体旋转控制。两者可作为上述执行链路的补充文件。

## 6. 二维码检码

### `manager/src/visualmark_detect/tag_checker.cpp`、对应头文件

当前实现几乎全部有 hehongjie 署名。`TagChecker` 接收视觉标记，执行目标码校验与检码结果处理。主要函数：`landmarkDetectCallback`（L41）、`checkTag`（L53）、`detectVisualmarks`（L577）和 `loadLandmarks`（L628）。

### `manager/src/visualmark_detect/visualmarks_detect.cpp`、对应头文件

当前实现几乎全部有 hehongjie 署名。`VisualMarksDetector` 管理目标码、检测周期、地图码位与结果发布。主要函数：`init`（L34）、`checkFirstTagId`（L69）、`startTimer`（L79）、`pubDetectResult`（L111）、`findNearestTagId`（L159）、`getCurrentTf`（L214）、`extractQRCodeInfo`（L237）、`readTagGlobalPosesXml`（L274）、`readMapXml`（L299）和 `uploadDetectData`（L343）。

## 7. 导航客户端与公共支撑

### `manager/src/utils/nav_base_client.cpp`、对应头文件

当前实现绝大部分为 hehongjie 署名。该客户端把上层导航插件与底层导航对象相连，管理目标、反馈、结果和取消。主要函数：`getMbResult`（L19）、`getMbFeedback`（L51）、`sendGoal`（L81）、`resetMb`（L136）、`cancelGoal`（L143）和 `fillFeedbackInfo`（L164）。

### `nav_core` 公共模块

这些文件有个人修改记录，但当前实现为多人共同维护，不能据此认定整个基础模块为个人开发。

| 文件 | 相关函数 / 接口 | 功能 |
| --- | --- | --- |
| `nav_core/src/ros_datastore.cpp` | `init`、`odomVel`、`visualMarks`、`localizationStatus`、`collisionStop`、`softStop` | ROS 数据订阅和状态读取 |
| `nav_core/src/health_monitor.cpp` | `setStatus`、`status`、`pubErrorInfo`、`report`、`publishKeyLog` | 健康状态与异常信息发布 |
| `nav_core/src/config_master.cpp` | `init`、`initChassis`、`modernInit`、`getJ3ControlConfig` | 底盘和导航配置装载 |
| `nav_core/src/precision_keeper.cpp` | `selectPrecision`、`xReach`、`yawReach`、`setReachScene` | 到点精度条件的底层保存与判定；个人参与较少 |

## 8. 到点自学习的归属边界

`manager/src/data_collection/run_learning.cpp` 中可检索 `GoalCompensator::setRunLearningOffset`（L82）、`useRunLearningOffset`（L137）、`useRunLearningOffsetXY`（L210）、`dataCollection`（L232）和 `calculateControlError`（L437）。`data_collector.cpp` 中可检索 `uploadRunLearningData`（L48）与 `checkLearningValid`（L100）。这些函数说明当前自学习链路的位置，但当前主体代码不由 hehongjie 署名。

上述文件及 `tag_compensator.cpp` 存在 hehongjie 的历史修改记录，因此只记录为历史参与或协作背景；不能把现有 `GoalCompensator` 算法、数据采集闭环或到点自学习整体列为他的个人主责。若需整理该项目的个人贡献，应另按实际作者和函数逐一核对。

## 9. 适合复述的代码边界

- 可重点讲述且当前归属较清楚：精度/可行区域计算、异常检查、二维码检码、视觉标记检测、`NavBaseClient` 接口。
- 可讲述“参与开发/持续迭代”：导航任务入口、`NavPlugin`、路径抢占与裁断、地图和搜路、定位源及 `nav_core` 公共状态。
- 到点自学习相关函数属于本仓库的协作链路，个人归属需按具体函数重新核实。
