# Diagnosis-Agent 交互原型

本目录保存产品流程验证用的前端原型，不连接正式后端、车辆、Skills 或数据库。

## 当前页面

- `create-case/`：创建诊断 Case；
- 覆盖初始输入、识别成功确认、识别失败补充和 Mock 创建完成状态；
- 支持识别车辆 IP、Teambition 链接、远程现场信息和日志目录。
- `diagnosis-progress/`：查看诊断步骤、排查结果和执行记录；
- 核心输出采用排查结果表格，第一行展示发现的问题，后续行展示已检查和排除的方向；
- 支持诊断完成、执行中、材料不足和执行失败四种状态，并可追溯 Mock 原始证据。

## 本地运行

可以直接打开 `create-case/index.html`，也可以在本目录启动静态服务器：

```shell
python3 -m http.server 4173
```

然后访问：`http://127.0.0.1:4173/create-case/`。

创建 Mock Case 后可以直接进入诊断过程页，也可访问：

`http://127.0.0.1:4173/diagnosis-progress/`

## 产品边界

- 原型只验证输入、来源识别、人工确认和异常补充流程；
- 所有识别逻辑和 Case 编号均为前端 Mock；
- 不代表 `management-system` 或 `diagnosis-orchestrator` 已完成正式接入。
