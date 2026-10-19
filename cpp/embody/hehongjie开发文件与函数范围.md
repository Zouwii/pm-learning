# enbody：hehongjie 开发文件与函数范围

## 1. 口径与仓库边界

本清单依据本地 `enbody` 各仓库的 Git 作者记录、当前源码 `git blame` 和函数定义整理，只记录与轮臂机器人应用相关的文件与函数，不记录提交时间、提交版本或项目时间线。

识别的作者身份包括姓名为 `hehongjie` 的公司邮箱和 GitHub 邮箱记录。本文中的“当前署名”表示当前文件仍有对应作者行；“历史参与”表示作者记录中修改过该文件，但当前实现可能已经被他人继续修改。

归属限制：

- 文件由 hehongjie 新增或当前大部分代码由其署名，不等于其中所有需求、算法和后续改动均由其独立完成。
- 函数表用于说明能够从源码核实的开发边界；多人共同修改的函数明确标为“参与”。
- ROS 消息、Service、YAML 和构建文件没有普通函数，按“接口/配置范围”列出。
- 行号为当前工作区源码中的函数起始行，只用于快速定位。

仓库角色：

| 仓库 | 角色 | 与项目工作的关系 |
| --- | --- | --- |
| `embodied-app` | 核心仓库 | VR 输入、遥操作节点、任务编排前后端、应用模式管理、闭环抓取和 Web UI |
| `embodied-motion` | 核心算法支撑 | FK/IK 接入、遥操控制、位姿参考生成、关节低通滤波、碰撞检测和运动规划 |
| `embodied-core` | 公共契约支撑 | ROS 消息与 Service、机器人模型、运动学参数和统一日志接口 |
| `embodied-hw` | 硬件执行支撑 | 机械臂控制、灵巧手接口、轨迹执行、相机及本地硬件仿真 |

## 2. 主要开发范围

| 功能范围 | 核心文件 | 主要函数或职责 | 归属判断 |
| --- | --- | --- | --- |
| VR 数据接入与目标生成 | `controller_udp.py` | UDP 数据接收、四元数变换、绝对/相对目标、锚点、左右手输入与 TCP 反馈 | 参与开发，当前文件部分署名 |
| 双臂遥操作闭环 | `teleop_node.hpp/.cpp` | 参数加载、FK/IK 初始化、目标订阅、使能与模式切换、定时求解、灵巧手开度、碰撞处理 | 当前主体实现署名 |
| 遥操运动控制 | `sdk_arm_controller.hpp/.cpp`、`se3_reference_generator.hpp` | 目标参考生成、FK、实时 IK、速度限幅、EMA 低通滤波、反馈对齐 | 新增并维护的核心范围 |
| 任务编排后端 | `models.py`、`program_store.py`、`task_runner.py`、`task_executor_node.py` | Block 数据模型、任务持久化、循环展开、任务运行、机械臂与灵巧手到位判定 | 当前主体实现署名 |
| FK/IK 双向转换 | `kinematics_bridge.py`、`fk_bridge.py`、`task_scheduler_*_cli.cpp` | IK 请求、默认点位、FK 回算、参考关节重算、C++ 运动学 CLI 桥接 | 新增并维护，少量文件有后续修改 |
| 任务编排前端 | `store.js`、`TaskStudio.vue`、`WaypointEditor.vue`、`WaypointRow.vue` | Program/Waypoint 管理、机械臂/灵巧手/循环 Block、拖拽嵌套、运行与停止 | 当前主体实现署名 |
| 闭环抓取 | `closed_loop_grasp_node.hpp/.cpp`、`data_preprocess.py` | FSM、观察位、目标位姿、笛卡尔接近、抓取、放置、返回观察位、RGB-D 配对预处理 | 新增并维护的核心范围 |
| 应用模式与控制 API | `state.py`、`api.py` | 遥操作/编排/抓取模式切换、机器人连接、启动、停止、故障、状态事件流 | 当前主体实现署名 |
| 公共接口与模型 | `jz_interfaces`、`jz_msgs`、`marvin_robot_model` | FK/IK、抓取、灵巧手、机械臂控制接口与 M6 配置 | 接口和配置支撑 |
| 硬件执行适配 | `robot_control_node.cpp`、`hardware_sim.py` | 控制 Service、软停止、轨迹 Action、状态反馈及双臂仿真 | 多人共同维护，仅认定可核实参与范围 |

## 3. 核心仓库：`embodied-app`

### 3.1 VR 输入与目标位姿生成

#### `interaction/vr_reader/scripts/controller_udp.py`

功能范围：接收 VR 控制器 UDP 数据，将控制器位姿转换成左右臂目标位姿；支持绝对控制、相对锚点控制、输入坐标旋转、抓握键防抖、TCP 反馈和设备发现。

当前文件为多人共同修改，不能将整份文件认定为个人独立开发。当前署名显示，hehongjie 的代码主要集中在绝对目标生成、UDP 最新帧读取，以及左右控制器接收和 TCP 反馈函数的部分逻辑；相对锚点与四元数基础函数当前主要由其他作者署名。

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `UDPPoseReceiver.__init__` | L44 | 初始化 ROS、UDP Socket、发布订阅、控制模式和左右臂状态 |
| `_make_absolute_target` | L394 | 生成绝对位姿目标 |
| `_poll_udp_sockets` / `_recv_latest` | L504 / L519 | 高频接收时只处理最新 UDP 数据 |
| `UDPPoseReceiver.__init__`、`_log_target_delta`、`_make_teleop_target` | L44 / L346 / L376 | 参与初始化、目标诊断和目标生成部分逻辑 |
| `listen_udp_A` / `listen_udp_B` | L529 / L641 | 参与左右 VR 控制器接收处理 |
| `listen_udp_C` / `listen_discovery` | L750 / L807 | 参与脚踏/设备发现数据处理 |
| `tcp_callback_A` / `tcp_callback_B` | L891 / L920 | 参与左右臂 TCP 反馈缓存和日志逻辑 |

### 3.2 双臂遥操作节点

#### `teleop/teleop_node/include/embodied_app_teleop_node/teleop_node.hpp`

功能范围：定义遥操作节点的参数、左右臂控制器、运动学、安全检测、ROS 通信、定时器和灵巧手控制接口。当前文件主体为 hehongjie 署名。

主要接口：

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `TeleopNode::initialize` | L35 | 组织节点完整初始化链路 |
| `loadParameters` | L40 | 读取遥操频率、速度、低通滤波和碰撞参数 |
| `resolveRobotModelProfilePath` | L41 | 定位机器人模型配置 |
| `initSafety` | L42 | 初始化碰撞安全后端 |
| `initKinematics` | L43 | 初始化 FK/IK 后端 |
| `initArms` | L44 | 建立左右臂控制器 |
| `initTf` | L45 | 初始化坐标变换 |
| `createPubSub` | L65 | 创建目标、反馈、模式、灵巧手和碰撞相关通信 |
| `handleTeleopSetApertureCommand` | L69 | 处理遥操作灵巧手开度命令 |
| `applyAppMode` | L74 | 根据应用模式启停遥操作 |
| `onTimerA` / `onTimerB` | L76 / L77 | 周期计算左右臂控制输出 |
| `onCollisionTimer` | L91 | 周期执行碰撞检测 |

#### `teleop/teleop_node/src/teleop_node.cpp`

功能范围：实现目标位姿转换、运动学与安全初始化、双臂订阅与求解、模式切换、灵巧手开度控制及碰撞保护。当前主体实现为 hehongjie 署名。

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `poseToIsometry` | L68 | ROS Pose 转换为 Eigen 位姿 |
| `TeleopNode::initialize` | L204 | 串联参数、运动学、安全、手臂、TF 和 ROS 初始化 |
| `TeleopNode::loadParameters` | L215 | 加载并校验遥操参数 |
| `TeleopNode::resolveRobotModelProfilePath` | L310 | 解析模型配置路径和回退路径 |
| `TeleopNode::initSafety` | L329 | 创建安全检查器 |
| `TeleopNode::initKinematics` | L358 | 选择并初始化运动学后端 |
| `TeleopNode::initArms` | L388 | 配置左右臂实时控制器 |
| `TeleopNode::initTf` | L419 | 建立 TF Buffer 与 Listener |
| `TeleopNode::createPubSub` | L564 | 建立目标位姿、使能、模式、关节反馈和灵巧手通信 |
| `TeleopNode::handleTeleopSetApertureCommand` | L741 | 校验、限幅并异步下发灵巧手命令 |
| `TeleopNode::applyAppMode` | L853 | 进入遥操时根据真实反馈重置跟踪状态 |
| `TeleopNode::createTimers` | L878 | 创建双臂 IK 与碰撞检测定时器 |
| `TeleopNode::onTimerA` / `onTimerB` | L890 / L894 | 执行左右臂求解链路 |
| `TeleopNode::onCollisionTimer` | L941 | 汇总双臂状态并更新碰撞结果 |

### 3.3 任务编排数据模型与存储

#### `task/task_scheduler/task_scheduler/models.py`

功能范围：定义任务编排的 Block 数据模型。当前文件主体为 hehongjie 署名。

| 类型 / 函数 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `Pose` | L13 | TCP 位姿数据 |
| `ArmWaypoint` | L68 | 单/双臂动作 Block |
| `ArmWaypoint.normalize_legacy_arm` | L74 | 兼容旧机械臂动作格式 |
| `GripperWaypoint` | L101 | 灵巧手动作 Block |
| `GripperWaypoint.normalize_legacy_gripper` | L107 | 兼容旧灵巧手格式 |
| `LoopWaypoint` | L128 | 可循环、可嵌套的循环 Block |
| `validate_waypoint` | L138 | 按类型解析具体 Block |
| `Program` / `ProgramSummary` | L144 / L150 | 任务组及摘要 |
| `RunState` / `RunRequest` | L167 / L175 | 执行状态与运行请求 |
| `IkRequest` / `IkResponse` | L183 / L192 | IK 请求与结果 |
| `ArmWaypointPreset` | L203 | 默认机械臂点位及 FK 信息 |

#### `task/task_scheduler/task_scheduler/services/program_store.py`

功能范围：Program 与 Waypoint 的文件化持久化、迁移、复制、打开/关闭及默认 Block 生成。当前文件主体为 hehongjie 署名。

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `_load_all` / `_save_all` | L94 / L166 | 加载和保存任务组 |
| `list_programs` / `get_program` | L226 / L240 | 查询任务组 |
| `create_program` / `save_program` | L258 / L286 | 创建和更新任务组 |
| `delete_program` / `duplicate_program` | L308 / L321 | 删除和复制任务组 |
| `close_program` / `open_program` | L350 / L359 | 管理前端工作区打开状态 |
| `_rewp` | L400 | 复制时递归重建 Waypoint ID |
| `_arm_side` / `_gripper_side` | L408 / L417 | 生成机械臂与灵巧手默认侧配置 |
| `_default_waypoints` | L431 | 生成默认任务 Block |

### 3.4 任务执行与循环展开

#### `task/task_scheduler/task_scheduler/services/task_runner.py`

功能范围：根据 Program、单个 Waypoint 或 Loop Block 构造执行序列并驱动执行器。当前文件主体为 hehongjie 署名。

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `TaskRunner.run` | L30 | 校验并启动完整 Program |
| `TaskRunner.stop` | L81 | 停止当前任务 |
| `TaskRunner.run_single` | L84 | 单独运行指定 Block |
| `_build_executable_map` | L88 | 建立可运行 Block 索引，包含循环子节点 |
| `_expand_loop` | L104 | 按重复次数展开循环 Block |

#### `task/task_scheduler/task_scheduler/nodes/task_executor_node.py`

功能范围：任务编排的执行闭环，包括进程执行、ROS 模式同步、机械臂/灵巧手命令下发、反馈确认、碰撞与停止处理。当前文件主体为 hehongjie 署名。

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `TaskExecutorNode.start_run` | L155 | 启动任务执行线程 |
| `stop_run` | L191 | 请求停止并清理执行状态 |
| `apply_app_mode` / `apply_robot_mode` | L211 / L244 | 同步应用模式和机器人模式 |
| `_write_plan_file` | L292 | 将 Block 序列写为执行计划 |
| `_run_plan` | L317 | 执行计划并维护当前 Block 状态 |
| `_publish_waypoint_command` | L621 | 按 Block 类型分发机械臂或灵巧手动作 |
| `_publish_joint_waypoint` | L676 | 发布机械臂关节目标 |
| `_call_gripper_waypoint_service` | L703 | 执行灵巧手 Block |
| `_publish_set_aperture_command` | L751 | 发布开度控制命令 |
| `_call_set_aperture_service` | L778 | 调用灵巧手开度 Service |
| `_wait_for_arrival` | L846 | 统一等待动作完成 |
| `_wait_for_arm_arrival` | L866 | 根据关节反馈判断机械臂到位 |
| `_wait_for_gripper_arrival` | L925 | 判断灵巧手动作完成 |
| `_on_joint_states` | L951 | 缓存关节状态反馈 |
| `_on_collision_left` / `_on_collision_right` | L964 / L970 | 接收碰撞状态并参与停止判断 |

### 3.5 FK/IK 双向转换与参考关节

#### `task/task_scheduler/task_scheduler/services/kinematics_bridge.py`

功能范围：任务编排后端到 C++ 运动学工具的桥接，完成 IK 解算、FK 回算、默认点位和配置加载。当前绝大部分代码仍为 hehongjie 署名。

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `KinematicsBridge._resolve_executable` | L54 | 定位 IK CLI |
| `_resolve_fk_executable` | L79 | 定位 FK CLI |
| `solve` | L104 | 执行 IK，解析状态和关节结果 |
| `default_arm_waypoint` | L212 | 读取 Home 关节并用 FK 生成默认 TCP 位姿 |
| `_solve_fk` | L236 | 执行 FK 并解析位姿 |
| `_load_home_joints` | L269 | 从机器人配置读取默认关节角 |

#### `task/task_scheduler/task_scheduler/services/ref_joint_resolver.py`

功能范围：当任务中的目标位姿、启用侧或点位顺序变化时，重新计算后续 IK 所需的参考关节。当前文件主体为 hehongjie 署名。

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `arm_ref_signature` | L13 | 为机械臂 Block 生成参考关节依赖签名 |
| `program_needs_ref_joint_recompute` | L35 | 判断任务修改后是否需要重算 |
| `recompute_program_ref_joints` | L39 | 按执行顺序连续求解左右臂参考关节 |
| `_flatten_waypoints` | L71 | 展平普通和循环 Block |

#### `app_mode_manager/app_mode_manager/fk_bridge.py`

功能范围：根据实时关节反馈调用 FK CLI，向状态页提供左右臂末端 TCP 位姿。当前大部分代码为 hehongjie 署名。

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `FeedbackFkBridge.solve` | L24 | 调用 FK 工具并解析 TCP Pose |
| `_resolve_fk_executable` | L73 | 定位 FK CLI |
| `_resolve_robot_model_profile` | L103 | 定位机器人模型 Profile |
| `_resolve_config_file` | L136 | 兼容运动学配置路径 |

#### `task/task_scheduler_core/src/task_scheduler_ik_cli.cpp`

功能范围：将任务编排后端的目标 TCP、手臂侧和参考关节转换为统一运动学调用，并以 JSON 返回 IK 结果。当前文件主体为 hehongjie 署名。

主要函数：`parseOptions`、`makeTargetTcpBase`、`printResult` 和 `main`。

#### `task/task_scheduler_core/src/task_scheduler_fk_cli.cpp`

功能范围：将手臂侧和七轴关节角传入运动学后端，返回末端 TCP 位姿。当前文件主体为 hehongjie 署名。

主要函数：`parseOptions`、`printResult` 和 `main`。

#### `task/task_scheduler_core/src/task_scheduler_kinematics_cli_common.cpp`

功能范围：为 FK/IK CLI 共用配置路径、机器人 Profile、运动学后端创建和位姿 JSON 序列化。当前文件主体为 hehongjie 署名。

主要函数：`resolveConfigPath`、`resolveRobotModelProfilePath`、`makeKinematicsConfig`、`createBackend` 和 `poseJson`。

#### `task/task_scheduler_core/src/task_scheduler_exec_cli.cpp`

功能范围：读取任务计划，逐步输出 Block，等待后端执行确认并输出任务完成事件。当前文件主体为 hehongjie 署名。

主要函数：`load_plan`、`emit_step`、`emit_done`、`read_ack` 和 `main`。

### 3.6 任务编排前端

#### `ui/app/robot-flow-studio/src/store.js`

功能范围：前端统一状态和业务动作入口，覆盖后端连接、模式切换、任务组与 Block 管理、位姿编辑、运行和停止。当前文件主体为 hehongjie 署名。

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `createStore` | L539 | 创建完整前端状态和动作集合 |
| `loadBackendProgramList` / `openProgramByIdFromBackend` | L1825 / L1849 | 加载并打开后端任务组 |
| `setFeature` / `setMode` | L2494 / L2553 | 切换任务编排、遥操作和抓取模式 |
| `createProgram` / `saveProgram` / `duplicateProgram` | L2781 / L2885 / L2939 | 管理任务组 |
| `createWaypoint` | L3110 | 创建机械臂 Block |
| `createGripperTask` | L3155 | 创建灵巧手 Block |
| `createLoopTask` | L3184 | 创建循环 Block |
| `moveWaypointIntoLoop` / `moveWaypointOutOfLoop` | L3386 / L3416 | Block 嵌套与移出循环 |
| `reorderWaypoint` | L3472 | 拖拽重排 Block |
| `recordCurrentPose` / `applyInputPose` | L3595 / L3658 | 记录反馈位姿并编辑目标 TCP |
| `runCurrentProgram` / `runCurrentWaypoint` | L3933 / L3972 | 运行任务组或单个 Block |
| `stopRun` / `stopTaskRun` | L4009 / L4047 | 停止执行并同步 UI 状态 |

#### 前端组件文件

| 文件 | 主要函数 / 接口 | 功能 |
| --- | --- | --- |
| `components/WaypointEditor.vue` | `syncLocalPose`、`nudge`、`applyPose`、`updateGripper`、`onLoopRepeat`、`sendJoints` | 编辑 TCP、关节角、灵巧手参数和循环次数 |
| `components/WaypointRow.vue` | `onDragStart`、`onDrop`、`onLoopDropZoneDrop`、`onDragEnd` | Block 行展示、拖拽排序和循环嵌套 |
| `views/TaskStudio.vue` | `createArmWaypoint`、`createGripperWaypoint`、`createLoopWaypoint`、`waypointAction`、`reorderWaypoint` | 任务编排主界面 |
| `views/control/FeatureSwitch.vue` | `setGraspObjectType` 及抓取状态计算属性 | 切换遥操作、任务编排、闭环抓取等功能 |
| `views/control/RunControl.vue` | `formatJointAngles` 及运行/故障/位姿计算属性 | 显示机械臂运行状态、关节、TCP 和故障 |

### 3.7 闭环抓取 FSM

#### `task/closed_loop_grasp/include/closed_loop_grasp/closed_loop_grasp_node.hpp`

功能范围：定义闭环抓取节点及 `IDLE → MOVE_OBSERVE → OBSERVE → PLAN_APPROACH → EXEC_APPROACH → GRASP → MOVE_PLACE → PLACE → RETURN_HOME` 状态机。当前文件主体为 hehongjie 署名。

主要接口包括：`startRun`、`stopRun`、`failRun`、`setState`、`computeApproachTargets`、`startCartesianApproach`、`startCloseHand`、`startMovePlace`、`startMoveToPlaceEntry`、`startOpenHandForPlace`、`startReturnHome`、`makeMoveLTrajectory`、`makeJointTrajectory` 和 `sendTrajectory`。

#### `task/closed_loop_grasp/src/closed_loop_grasp_node.cpp`

功能范围：实现从观察、接收目标位姿、坐标变换、规划接近、闭合灵巧手、抬升、放置到返回观察位的执行闭环。当前文件主体为 hehongjie 署名。

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `loadParameters` | L180 | 加载手眼外参、观察位、放置位和运动限制 |
| `initializeMotion` | L310 | 初始化运动学和 MoveL/MoveJ 规划器 |
| `createRosInterfaces` | L367 | 建立模式、关节、目标位姿、状态及轨迹接口 |
| `onAppMode` / `onObjectPose` | L407 / L441 | 响应抓取模式和感知结果 |
| `onStateTimer` | L449 | 驱动 FSM 的观察和目标接收阶段 |
| `startRun` / `stopRun` / `failRun` | L511 / L546 / L562 | 管理抓取生命周期和异常回家 |
| `setState` / `stateName` | L578 / L600 | 切换并输出 FSM 状态 |
| `computeApproachTargets` | L635 | 结合手眼变换计算抓取 TCP 和接近点 |
| `startCartesianApproach` / `startCartesianFinalApproach` | L687 / L703 | 分段执行笛卡尔接近 |
| `startCloseHand` | L712 | 闭合灵巧手并进入抓取状态 |
| `startMovePlace` | L746 | 抬升已抓物体 |
| `startMoveToPlaceEntry` / `startOpenHandForPlace` | L763 / L773 | 移动到放置入口并张手 |
| `startMoveToObserveAfterPlace` | L826 | 放置完成后返回观察位 |
| `startReturnHome` / `sendReturnHomeJointTrajectory` | L831 / L872 | 停止或异常后返回安全位置 |
| `makeMoveLTrajectory` | L908 | 生成笛卡尔轨迹 |
| `makeTrajectoryFromPlan` | L966 | 将运动规划结果转换为 ROS 轨迹 |
| `makeJointTrajectory` | L1060 | 生成关节轨迹 |
| `sendTrajectory` | L1012 | 发送轨迹 Action 并处理结果回调 |

#### `task/closed_loop_grasp/scripts/data_preprocess.py`

功能范围：RGB-D 时间戳配对、去畸变、相机信息更新、软/硬物体通道切换和预处理结果发布。当前文件主体为 hehongjie 署名。

| 函数 / 接口 | 当前起始行 | 功能 |
| --- | ---: | --- |
| `find_nearest_stamp_key` | L106 | 在允许误差内寻找最近图像时间戳 |
| `build_undistort_maps` | L118 | 构建去畸变映射 |
| `make_rectified_camera_info` | L131 | 生成校正后的 CameraInfo |
| `DataPreprocessNode._pop_match_with_color` | L291 | 以彩色帧匹配深度帧 |
| `_pop_match_with_depth` | L310 | 以深度帧匹配彩色帧 |
| `_publish_matched_pair` | L377 | 发布配对后的 RGB-D 和相机参数 |
| `_process_color` / `_process_depth` | L424 / L433 | 执行图像预处理 |

### 3.8 应用模式与机器人控制

#### `app_mode_manager/app_mode_manager/state.py`

功能范围：统一维护应用模式、机器人连接状态、任务状态、TCP 反馈、抓取状态、碰撞和故障，并桥接 ROS Service。当前文件主体为 hehongjie 署名。

主要函数：

- `get_status`、`get_task_state`、`get_feedback_pose`：聚合页面状态；
- `set_app_mode`、`set_feature`：切换遥操作、回放、闭环抓取和任务编排；
- `start_closed_grasp`、`stop_closed_grasp`：控制闭环抓取；
- `connect_robot`、`startup_robot`、`disconnect_robot`、`release_robot`：管理机器人连接生命周期；
- `set_robot_mode`、`clear_fault`、`homing`、`arm_soft_stop`：机器人控制；
- `get_motor_err_code`、`_query_hand_error_code_via_ros`：汇总机械臂与灵巧手故障；
- `_on_eef_left`、`_on_eef_right`、`_on_joint_states`：处理实时反馈；
- `_on_task_run_feedback`、`_on_grasp_status`：同步任务和抓取状态。

#### `app_mode_manager/app_mode_manager/api.py`

功能范围：向 Web UI 提供应用状态、任务状态、模式切换、抓取控制和机器人操作 HTTP API。当前文件主体为 hehongjie 署名。

主要函数：`create_app`、`stream_app_events`、`stream_task_events`、`set_app_mode`、`set_feature`、`start_closed_grasp`、`stop_closed_grasp`、`get_live_pose`、`connect_robot`、`startup_robot`、`clear_fault`、`homing`、`arm_soft_stop`、`get_motor_err_code`、`disconnect_robot` 和 `release_robot`。

## 4. 支撑仓库：`embodied-motion`

### 4.1 遥操作实时控制与低通滤波

#### `motion_algorithm/include/motion_algorithm/control/sdk_arm_controller.hpp`

功能范围：定义单臂遥操作控制器输入、输出和状态，包含 IK 频率、最大关节速度、低通滤波系数、反馈关节和命令关节。当前文件主体为 hehongjie 署名。

主要接口：`setEnabled`、`setFeedback`、`updateTarget`、`resetTrackingFromFeedback` 和 `update`。

#### `motion_algorithm/src/control/sdk_arm_controller.cpp`

功能范围：实现“目标 TCP → 参考位姿 → IK → 关节速度限幅 → EMA 低通滤波 → 关节命令”的实时闭环。当前绝大部分代码为 hehongjie 署名。

| 函数 / 接口 | 当前范围 | 功能 |
| --- | --- | --- |
| `SdkArmController::setFeedback` | L32–L35 | 缓存真实关节反馈 |
| `updateTarget` | L37–L42 | 更新目标 TCP 及时间戳 |
| `resetTrackingFromFeedback` | L44–L55 | 以真实臂形重置命令与目标，避免重新使能回到旧姿态 |
| `update` | L57–L130 | 执行 FK、实时 IK、速度限幅和 EMA 低通滤波 |

#### `motion_algorithm/include/motion_algorithm/common/se3_reference_generator.hpp`

功能范围：在 SE(3) 上对输入位姿和速度进行滤波与短时外推，向遥操作控制器提供平滑目标。当前文件主体为 hehongjie 署名。

主要函数：`updateMeasurement`、`getReference`、`computeAlpha`、`so3Log`、`so3Exp`、`se3Log` 和 `se3Exp`。

### 4.2 机器人模型与运动学配置

#### `motion_algorithm/include/motion_algorithm/common/robot_model_profile.hpp`

功能范围：定义机器人模型 Profile，统一关联运动学参数、工具/基座位姿、Home 关节和碰撞模型。当前文件主体为 hehongjie 署名。

主要接口：`loadRobotModelProfile`。

#### `motion_algorithm/src/common/robot_model_profile.cpp`

功能范围：解析并校验 Profile，处理相对路径、左右臂基座/工具位姿、关节列表和碰撞配置。当前绝大部分代码为 hehongjie 署名。

主要函数：`requireNode`、`requireString`、`parsePose6`、`parseJoints14`、`parseStringList`、`validateProfile` 和 `loadRobotModelProfile`。

### 4.3 碰撞安全

#### `motion_algorithm/include/motion_algorithm/safety/arm_collision_safety.hpp`

功能范围：定义双臂碰撞检查后端和检查入口。当前文件主体为 hehongjie 署名。

#### `motion_algorithm/src/safety/arm_collision_safety.cpp`

功能范围：加载 URDF/SRDF，初始化碰撞检查器，按最大检查频率执行双臂/环境碰撞检查并缓存结果。当前文件主体为 hehongjie 署名。

主要函数：`ArmCollisionSafety::initialize`、`evaluate` 和 `runCollisionCheck`。

### 4.4 参与修改的运动学与规划文件

以下文件存在 hehongjie 参与，但当前主要实现由多人共同维护，不将整份文件归为个人独立开发：

| 文件 | 可核实相关函数 | 参与范围 |
| --- | --- | --- |
| `motion_algorithm/src/kinematics/marvin_sdk_kinematics.cpp` | `initialize`、`inverseKinematics`、`runIkSolver` 内的少量代码 | 参与工具/基座配置日志、主解失败后的备用解处理及 IK 参数适配；当前函数主体由其他作者署名 |
| `motion_algorithm/src/planning/movel_planner.cpp` | `setIkConfig`、`setupIkCallbacks` | 参与 IK 配置注入、Profile/Home 关节读取和左右臂运动学后端初始化 |

## 5. 支撑仓库：`embodied-core`

本仓库中的相关工作主要是公共接口和配置，没有普通业务函数。

### 5.1 ROS 接口

| 文件 | 接口范围 |
| --- | --- |
| `common/jz_interfaces/srv/FK.srv` | 关节角到末端位姿的 FK Service |
| `common/jz_interfaces/srv/IK.srv` | 目标 TCP 到关节角的 IK Service |
| `common/jz_interfaces/srv/SetAperture.srv` | 灵巧手开度和速度控制 |
| `common/jz_interfaces/srv/ArmSoftStop.srv` | 单臂或双臂软停止 |
| `common/jz_interfaces/srv/Connect.srv` / `Release.srv` | 机械臂连接生命周期 |
| `common/jz_interfaces/srv/GetErrorCode.srv` | 灵巧手故障查询 |
| `common/jz_msgs/msg/VrController.msg` | VR 控制器输入数据 |
| `common/jz_msgs/msg/IKRequest.msg` / `IKResult.msg` | 遥操作 IK 请求和结果 |
| `common/jz_msgs/msg/Jointcmd.msg` / `Jointfeedback.msg` | 关节命令与反馈 |

`common/jz_interfaces/CMakeLists.txt` 中的接口注册和大部分相关 Service 文件当前仍有 hehongjie 署名。`jz_msgs` 中部分消息来自已有接口迁移或由其他作者维护，因此只认定其为遥操作链路依赖，不认定全部消息由 hehongjie 独立设计。

### 5.2 机器人模型配置

| 文件 | 配置范围 |
| --- | --- |
| `robot_model/marvin_robot_model/config/marvin_m6_robot_profile.yaml` | 运动学后端、参数文件、基座/工具位姿、Home 关节和碰撞模型入口 |
| `robot_model/marvin_robot_model/config/robot_param_m6.yaml` | 遥操、关节速度、低通滤波、手部、到位容差等运行参数 |
| `robot_model/marvin_robot_model/config/ccs_m6.yaml` | M6 运动学与关节约束参数，属于多人维护配置 |

## 6. 支撑仓库：`embodied-hw`

### 6.1 本地硬件仿真

#### `sim_driver/sim_driver/hardware_sim.py`

功能范围：模拟左右臂关节命令、机器人模式和关节状态反馈，支撑遥操作和任务编排的本地闭环联调。当前文件有明确 hehongjie 署名，但存在其他作者修改。

主要函数：`HardwareSimulator.__init__`、`_cmd_a_callback`、`_cmd_b_callback`、`_robot_mode_callback`、`_sync_publishers` 和 `_publish`。

### 6.2 机械臂和灵巧手执行节点

#### `actuator_driver/robot_arm/marvin_robot/src/robot_control_node.cpp`

功能范围：机械臂 SDK、ROS Service、关节状态、灵巧手、轨迹 Action 和故障接口的综合执行节点。该文件由多人长期共同维护，当前只有部分代码可归入 hehongjie 的参与范围。

可核实的相关参与点：

| 函数 / 区域 | 功能 | 归属提示 |
| --- | --- | --- |
| `normalize_soft_stop_arm` | 统一 A/B/AB 软停止参数 | 当前函数有明确署名代码 |
| `MarvinRobotCppNode` 构造与 `create_services` 的部分接口注册 | 注册连接、释放、软停止、开度、故障和运动控制 Service | 多人共同维护，不认定整个构造函数 |
| `soft_stop_callback` | 向单臂或双臂发送软停止 | 存在参与修改 |
| `handle_fjt_goal`、`handle_fjt_cancel`、`handle_fjt_accepted`、`execute_fjt` | FollowJointTrajectory 执行链路 | 存在参与修改，后续亦有大量他人修改 |
| `getTrajectoryActualPositionsRad`、`waitForTrajectoryGoal`、`send_trajectory_point` | 轨迹反馈、到位等待和点位下发 | 存在参与修改 |
| `record_command_result` | 记录最近命令执行结果 | 存在参与修改 |

### 6.3 抓取和相机支撑

以下文件存在 hehongjie 修改记录，但当前署名很少，不能视为个人主责文件：

| 文件 | 当前用途 |
| --- | --- |
| `actuator_driver/test/grab_test/grab_test/arm_gripper_grab_node.py` | 机械臂与夹爪抓取联调 |
| `sensor_driver/launch/sensor_driver.launch.py` | 感知相机驱动启动 |
| `sensor_driver/sdk/OrbbecSDK_ROS2/orbbec_camera/launch/gemini_330_series.launch.py` | Gemini 330 相机参数与启动 |

## 7. 简历工作与代码范围对应

| 简历表述 | 可对应的文件与函数 |
| --- | --- |
| VR 获取末端 TCP 位姿 | `controller_udp.py` 的 `_make_absolute_target`、`_poll_udp_sockets`、`_recv_latest`，以及 `listen_udp_A/B`、`tcp_callback_A/B` 中可核实的参与代码 |
| 后端 IK 实时解算 | `teleop_node.cpp` 的 `onTimerA/B`、`SdkArmController::update`、运动学后端 `inverseKinematics` |
| 低通滤波提升平滑性 | `SdkArmController::update` 中 EMA 低通；`SE3ReferenceGenerator` 的位姿/速度滤波 |
| 任务编排前端和后端闭环 | `store.js`、`TaskStudio.vue`、`WaypointEditor.vue`、`program_store.py`、`task_runner.py`、`task_executor_node.py` |
| 动作与循环 Block | `ArmWaypoint`、`GripperWaypoint`、`LoopWaypoint`、`_expand_loop`、前端 `createLoopTask` 和拖拽函数 |
| FK/IK 双向转换 | `KinematicsBridge.solve`、`default_arm_waypoint`、`_solve_fk`、`FeedbackFkBridge.solve` |
| 视觉闭环抓取 FSM | `ClosedLoopGraspNode` 的状态机、`computeApproachTargets`、接近、抓取、放置及返回观察位函数 |
| 机械臂与灵巧手协同 | `startCloseHand`、`startOpenHandForPlace`、任务执行器的机械臂/灵巧手分发，以及硬件 Service 接口 |

## 8. 复核限制

本清单进行了静态源码和 Git 作者归属核对，没有构建、运行实机或验证业务效果。后续源码变化会导致行号移动；个人主责、共同完成和现场交付情况仍应结合本人确认，不能只由文件署名推断。
