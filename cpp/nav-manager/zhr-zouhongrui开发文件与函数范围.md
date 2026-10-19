# nav-manager：zhr / zouhongrui 开发文件与函数范围

## 1. 口径与阅读方式

本清单依据本地 `mainbody/nav-manager` 的 Git 作者记录、当前源码逐行署名和函数定义整理，源码取自 `RC/1.2603.x` 分支。按用户提供的身份合并 `zhr`、`Zhr`、`zouhongrui`、`zou hongrui` 等作者署名。只整理文件和函数，不记录具体提交时间、提交号或版本。函数行号是当前源码中的起始行，供快速定位。

“主体署名”表示当前函数主要实现仍有上述作者署名；“参与”表示函数或文件由多人共同修改；“历史参与”表示能查到作者修改记录，但当前相应实现已由他人继续修改。文件被修改过不等于其中全部逻辑均为个人独立开发。ROS、地图、导航控制等现有框架属于团队背景，以下仅说明能够从源码核实的个人范围。

| 范围 | 主要文件 | 函数与职责 | 归属判断 |
| --- | --- | --- | --- |
| 到点自学习补偿 | `run_learning.cpp/.h` | 终点和起点补偿匹配、补偿位姿应用、成功到点数据采集 | 当前核心实现主体署名，部分函数共同修改 |
| 数据采集与校验 | `data_collector.cpp/.h`、`run_learning_struct.h` | 自学习数据组装、有效性检查、ROS 发布与数据结构 | 当前主要采集函数主体署名 |
| 地图补偿解析 | `map_manager.cpp/.h`、`map_common.h` | `run_learning_pose`、`study_data`、库区节点解析 | 相关段落主体署名，整份地图文件为多人维护 |
| 导航目标接入 | `nav_plugin.cpp/.h`、`shared_struct.h` | 自学习数据注入路径点、库区补偿、补偿目标下发 | 相关段落署名；导航插件整体为多人维护 |
| 定位模式切换 | `hotstart_manager.cpp/.h` | 沿路径判定激光、二维码、纹理定位源并切换 | 参与较深，状态机函数多人共同修改 |
| 其他支持 | `tag_compensator.cpp`、`config_manager.cpp`、`nav_core` | 标签补偿数据、地图更新配置和公共状态 | 局部参与，不作为个人主线 |

## 2. 到点自学习：补偿选择与位姿应用

### `manager/src/data_collection/run_learning.cpp`、`manager/include/nav_manager/data_collection/run_learning.h`

`GoalCompensator` 读取地图中的补偿数据，根据前置点、楼层状态和载货状态选择补偿；随后处理有二维码与无二维码场景的坐标变换，并在任务完成时整理采集数据。当前文件多数代码行由这些作者署名，但后续规则和采集细节也有他人修改。

| 函数 / 接口 | 当前起始行 | 功能 | 归属 |
| --- | ---: | --- | --- |
| `GoalCompensator::GoalCompensator` | L6 | 接入地图、定位模块和数据采集器 | 主体署名 |
| `applyCompensationToEndPoint` | L16 | 按前置点、楼层和载货状态匹配终点补偿 | 主体署名 |
| `applyCompensationToStartPoint` | L49 | 按楼层和载货状态匹配起点补偿 | 主体署名 |
| `setRunLearningOffset` | L82 | 为导航目标的起点和终点写入选中的补偿 | 主体署名，后续规则共同修改 |
| `useRunLearningOffset` | L137 | 将平移和角度补偿应用到目标位姿，并记录所用补偿 | 主体署名，部分代码共同修改 |
| `useRunLearningOffsetXY` | L210 | 只应用 XY 补偿，不改变朝向 | 主体署名 |
| `dataCollection` | L232 | 采集示教位姿、导航误差、前置点、载荷、楼层及应用补偿 | 参与较深，函数内多人修改 |
| `resetRunLearning` | L429 | 重置一次任务的采集状态 | 参与 |
| `calculateControlError` | L437 | 计算目标位姿与实际到达位姿的相对误差 | 参与，当前大部分实现由其他作者修改 |
| `printCompensationData` | L466 | 将分层补偿数据写入诊断日志 | 参与，当前实现由多人修改 |

头文件定义 `GoalCompensator` 的补偿、数据采集和状态重置接口。`manager/include/nav_manager/data_collection/run_learning_struct.h` 定义 `RunLearning` 数据记录，包含目标点、前置点、载荷、楼层、示教位姿、控制误差和所用补偿；文件当前为多人署名，不能把整个结构及后续字段都认作独立开发。

## 3. 到点自学习：数据采集与有效性保护

### `manager/src/data_collection/data_collector.cpp`、`manager/include/nav_manager/data_collection/data_collector.h`

`DataCollector` 把 `RunLearning` 转为采集消息，在发布前检查开关和数据有效性。当前 `uploadRunLearningData` 与 `checkLearningValid` 的主要实现由这些作者署名；`uploadTagData` 属于另一个多人维护的标签数据通道。

| 函数 / 接口 | 当前起始行 | 功能 | 归属 |
| --- | ---: | --- | --- |
| `DataCollector::DataCollector` | L27 | 初始化采集消息发布接口 | 主体署名 |
| `uploadRunLearningData` | L48 | 组装自学习采集字段、检查采集开关并发布 | 主体署名，少量后续修改 |
| `checkLearningValid` | L100 | 检查导航偏移的平移和角度有效性 | 主体署名，少量后续修改 |
| `uploadTagData` | L163 | 处理标签补偿数据上传 | 参与，当前实现主要由其他作者维护 |

### `manager/src/data_collection/tag_compensator.cpp`、对应头文件

这是二维码补偿数据的支撑链路，并非 `GoalCompensator` 的全部实现。文件有个人修改记录，当前代码由多人维护。可检索 `updateMap`（L71）、`uploadData`（L90）、`calcCmpCallback`（L133）、`dumpData`（L149）和 `calcCompensation`（L181）；这些函数按“参与”处理。

## 4. 地图数据与补偿结构

### `manager/src/map/map_manager.cpp`、`manager/include/nav_manager/map/map_manager.h`

`MapManager` 的完整地图生命周期由团队维护。与个人自学习工作直接相关的代码集中在节点解析和库区查询，不能将整份 `map_manager.cpp` 视为个人开发。

| 函数 / 接口 | 当前起始行 | 相关代码 | 归属 |
| --- | ---: | --- | --- |
| `createNewNodes` | L409 | 解析节点 `run_learning_pose` 示教值和 `study_data` 分层补偿 | 相关主体段落署名 |
| `getStorageAreaNodes` | L954 | 查询起点或终点所在库区的节点集合 | 当前函数主体署名 |
| `fetchNewMapInfo` | L904 | 获取更新后的地图信息，供节点重建使用 | 参与 |
| `onMapUpdate` | L70 | 响应地图更新，使补偿数据重新进入节点结构 | 参与 |
| `createNewEdges` | L577 | 解析边属性，含定位源相关信息 | 局部参与 |

`manager/include/nav_manager/utils/map_common.h` 中的 `RunLearningPose`、`CompensationValue`、`CompensationEntry`、`CompensationFrame`、`CompensationData` 和 `NodeInfo` 相关字段承载示教值和分层补偿。`manager/include/nav_manager/utils/shared_struct.h` 中的 `RunLearningOffset`、`PathPoint::run_learning_offset` 及 `InnerMBGoal` 的楼层、库区标记和索引承担任务运行时的数据传递。两个公共头文件均由多人维护，只认定与上述字段有关的参与范围。

## 5. 导航目标中的补偿接入

### `manager/src/plugin/nav_plugin.cpp`、`manager/include/nav_manager/plugin/nav_plugin.h`

`NavPlugin` 是团队导航执行入口。个人当前署名主要位于路径点补偿、库区起终点处理和底层目标构造的局部段落；其他任务调度、裁断、反馈与结果逻辑不宜整体归入个人范围。

| 函数 / 接口 | 当前起始行 | 相关代码 | 归属 |
| --- | ---: | --- | --- |
| `fillPathNode` | L1003 | 对路径点应用地图中的自学习补偿；处理有码/无码、朝向和库区规则 | 函数内相关段落主体署名，整体多人维护 |
| `fillInnerMBGoal` | L1414 | 标记起终点库区状态、调用补偿器并组装底层目标 | 相关段落署名，整体多人维护 |
| `computeStorageIntersectionIndices` | L1549 | 计算任务路径与起点/终点库区的交集索引 | 当前函数主体署名 |
| `execute` | L577 | 在导航执行过程接入自学习采集时机 | 局部参与 |
| `onMapUpdate` | L250 | 地图更新后衔接补偿数据刷新 | 局部参与 |

代码链路可按 `MapManager::createNewNodes` → `GoalCompensator::setRunLearningOffset` → `NavPlugin::fillPathNode` / `fillInnerMBGoal` → `GoalCompensator::dataCollection` → `DataCollector::uploadRunLearningData` 查阅。链路说明调用关系，不代表每个函数的全部实现都由一人完成。

## 6. 定位源切换与热启动

### `manager/src/code_inserting/hotstart_manager.cpp`、`manager/include/nav_manager/code_inserting/hotstart_manager.h`

`HotStartManager` 根据当前边和下一条边的定位源配置，在激光、二维码和纹理定位之间切换，并与地图、服务端和前端状态同步。当前文件有较多个人署名，但定位状态机由多人迭代，应表述为参与开发与持续维护。

| 函数 / 接口 | 当前起始行 | 功能 | 归属 |
| --- | ---: | --- | --- |
| `navModeCheck` | L151 | 判断当前/下一条边的定位源交集，驱动切换状态机 | 参与较深，函数内多人修改 |
| `isLocValid` / `abnormalCheck` | L71 / L92 | 校验定位结果与异常条件 | 局部参与 |
| `setLaser` / `setHete` / `setTextureFlag` | L521 / L548 / L539 | 控制定位源开关和切换流程 | 参与 |
| `waitLocValid` | L595 | 等待切换后的定位源有效 | 参与 |
| `globalLocSourceSync` / `pubToCarlyState` | L676 / L734 | 同步全局定位源及对外状态 | 参与 |
| `transToIntAndGenerateJson` / `lastEdgeGetLocSource` | L772 / L818 | 将边上的定位源配置转为下发数据 | 参与 |
| `forceSetLocSource` | L862 | 强制设置定位源 | 参与 |

## 7. 配置、任务入口和公共模块的局部参与

以下文件有作者记录或少量当前署名，但并非本清单的个人主线。函数名仅作为进一步核对的入口。

| 文件 | 函数 / 接口 | 归属边界 |
| --- | --- | --- |
| `manager/src/config_manager.cpp` | `getShelfConfig`（L74）、`needUpdateMap`（L120）、`stopToUpdate`（L148）、`resetUpdating`（L177） | 地图更新与配置处理的局部参与 |
| `manager/src/access_layer.cpp` | `executeCB`（L100）、`finishNavTask`（L234） | 任务入口有少量署名，不能称为个人实现整个入口 |
| `manager/src/dispatch/dispatch_preempt_processor.cpp` | `stitch`（L404）等 | 抢占路径模块仅少量当前署名 |
| `manager/src/plugin/servo_plugin.cpp` | `execute`（L60）等 | 伺服分支仅少量当前署名 |
| `nav_core/src/ros_datastore.cpp` | `mapUpdate`（L210）、`localizationStatus`（L205）等 | ROS 状态缓存与地图更新接口的局部参与 |
| `nav_core/src/health_monitor.cpp` | `setStatus`（L185）、`report`（L225）等 | 健康状态模块的局部参与 |
| `navigation/nav_base/src/task_master.cpp` | `TaskMaster` 相关任务处理 | 底层导航任务模块只有少量当前署名 |

## 8. 适合复述的个人边界

- 归属较清楚的主线：自学习补偿匹配、补偿位姿应用、采集上报与有效性检查、地图补偿数据解析、库区补偿接入。
- 可表述为参与开发与持续维护：定位源切换，以及 `NavPlugin`、`MapManager` 中与上述功能直接相关的段落。
- 团队背景：完整导航框架、底层控制器、所有地图管理能力和全部任务调度逻辑。
