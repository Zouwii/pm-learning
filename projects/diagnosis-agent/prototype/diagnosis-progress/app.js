const elements = {
  stateSelect: document.querySelector("#stateSelect"),
  caseStatus: document.querySelector("#caseStatus"),
  stepCount: document.querySelector("#stepCount"),
  stepsList: document.querySelector("#stepsList"),
  resultTitle: document.querySelector("#resultTitle"),
  resultCount: document.querySelector("#resultCount"),
  resultRows: document.querySelector("#resultRows"),
  timeline: document.querySelector("#timeline"),
  resultActions: document.querySelector("#resultActions"),
  toggleTimelineButton: document.querySelector("#toggleTimelineButton"),
  drawerMask: document.querySelector("#drawerMask"),
  evidenceDrawer: document.querySelector("#evidenceDrawer"),
  closeDrawerButton: document.querySelector("#closeDrawerButton"),
  drawerSource: document.querySelector("#drawerSource"),
  drawerTime: document.querySelector("#drawerTime"),
  drawerContent: document.querySelector("#drawerContent"),
  toast: document.querySelector("#toast"),
};

const steps = [
  ["创建 Case", "保存问题与来源"],
  ["采集材料", "获取时间窗口材料"],
  ["匹配场景", "匹配标准排查流程"],
  ["执行排查", "逐项检查并记录证据"],
  ["汇总结果", "等待应用工程师复核"],
];

const evidence = {
  locationError: {
    source: "nav.log:1842-1848",
    time: "2026-08-25 14:30:14",
    content:
      "[14:30:13.829] localization quality=0.21\n[14:30:14.012] ERROR code=LOC_LOST source=localization\n[14:30:14.018] task paused reason=localization_unavailable",
  },
  modelConfig: {
    source: "model_config.yaml",
    time: "2026-08-25 14:30:09",
    content:
      "localization_source: reflector_lidar\nlocalization_profile: shuttle_v4\nconfig_version: 2026.08.12\nvalidation: passed",
  },
  lidarInput: {
    source: "lidar_driver.log:910-932",
    time: "2026-08-25 14:25—14:35",
    content:
      "packet_rate_avg=24.98Hz\npacket_loss=0.02%\ndriver_restart=0\ntimestamp_discontinuity=0\nstatus=healthy",
  },
  taskEngine: {
    source: "task_engine.log:626-641",
    time: "2026-08-25 14:30:14",
    content:
      "task_state=RUNNING\nupstream_error=none\ninterrupt_trigger=localization_unavailable\nresult=task_chain_excluded",
  },
};

const states = {
  completed: {
    status: ["诊断完成", "completed"],
    activeStep: 5,
    stepCount: "5 / 5",
    title: "排查结果",
    description: "",
    count: "已完成 4 项检查",
    rows: [
      {
        rowClass: "problem-row",
        label: ["发现问题", "problem"],
        item: "定位链路",
        conclusion: "14:30:14 触发 LOC_LOST，定位质量下降并出现位姿跳变，时间与任务中断一致。建议归属定位模块复核。",
        evidence: ["nav.log:1842-1848", "locationError"],
        status: ["异常", "abnormal"],
      },
      {
        label: ["已排查", "checked"],
        item: "机型配置",
        conclusion: "定位源、配置版本和关键参数与当前机型要求一致，未发现配置错误。",
        evidence: ["model_config.yaml", "modelConfig"],
        status: ["正常", "normal"],
      },
      {
        label: ["已排查", "checked"],
        item: "激光设备输入",
        conclusion: "问题时间窗口内驱动未掉线，数据频率和丢包率正常，暂时排除设备输入中断。",
        evidence: ["lidar_driver.log", "lidarInput"],
        status: ["已排除", "excluded"],
      },
      {
        label: ["已排查", "checked"],
        item: "任务引擎",
        conclusion: "任务中断由定位不可用触发，任务链路中未发现更早的异常。",
        evidence: ["task_engine.log", "taskEngine"],
        status: ["已排除", "excluded"],
      },
    ],
    timeline: [
      ["14:30:03", "完成基础材料采集，共获取 4 项材料", "success"],
      ["14:30:07", "识别 LOC_LOST，进入定位丢失标准排查流程", "success"],
      ["14:30:18", "完成定位、配置、设备输入和任务引擎检查", "success"],
      ["14:30:21", "形成排查结果，等待应用工程师复核", "success"],
    ],
    actions: `
      <button class="secondary-button" type="button" data-action="manual">不认可，转人工排查</button>
      <button class="secondary-button" type="button" data-action="supplement">补充材料</button>
      <button class="primary-button" type="button" data-action="handoff">认可并生成交接材料</button>`,
  },
  running: {
    status: ["诊断中", "running"],
    activeStep: 4,
    stepCount: "4 / 5",
    title: "排查进度",
    description: "",
    count: "已完成 2 项，执行中 1 项",
    rows: [
      {
        rowClass: "problem-row",
        label: ["当前发现", "problem"],
        item: "定位链路",
        conclusion: "已发现 LOC_LOST 和位姿跳变，正在补充证据以判断最终归属模块。",
        evidence: ["nav.log:1842-1848", "locationError"],
        status: ["待确认", "waiting"],
      },
      {
        label: ["已排查", "checked"],
        item: "机型配置",
        conclusion: "定位源和关键参数与当前机型要求一致。",
        evidence: ["model_config.yaml", "modelConfig"],
        status: ["正常", "normal"],
      },
      {
        rowClass: "pending-row",
        label: ["排查中", "pending"],
        item: "激光设备输入",
        conclusion: "正在检查问题时间窗口内的数据频率、丢包和驱动状态。",
        evidence: null,
        status: ["执行中", "waiting"],
      },
    ],
    timeline: [
      ["14:30:03", "完成基础材料采集", "success"],
      ["14:30:07", "识别 LOC_LOST，进入定位丢失排查流程", "success"],
      ["14:30:18", "正在检查激光设备输入", "running"],
    ],
    actions: `
      <button class="secondary-button" type="button" data-action="manual">停止并转人工</button>
      <button class="primary-button" type="button" data-action="finish">完成诊断</button>`,
  },
  missing: {
    status: ["待补材料", "waiting"],
    activeStep: 4,
    stepCount: "4 / 5",
    title: "排查进度",
    description: "",
    count: "已完成 2 项，待补 1 项",
    rows: [
      {
        rowClass: "problem-row",
        label: ["当前发现", "problem"],
        item: "定位链路",
        conclusion: "已确认定位异常与任务中断时间一致，但暂时无法确定异常来自定位模块还是设备输入。",
        evidence: ["nav.log:1842-1848", "locationError"],
        status: ["证据不足", "waiting"],
      },
      {
        label: ["已排查", "checked"],
        item: "机型配置",
        conclusion: "当前配置与机型要求一致，暂时排除配置错误。",
        evidence: ["model_config.yaml", "modelConfig"],
        status: ["已排除", "excluded"],
      },
      {
        rowClass: "pending-row",
        label: ["待补材料", "pending"],
        item: "激光设备输入",
        conclusion: "缺少 14:25—14:35 的激光驱动日志，无法排除设备数据中断。",
        evidence: null,
        status: ["待补充", "waiting"],
      },
    ],
    timeline: [
      ["14:30:03", "完成基础材料采集", "success"],
      ["14:30:18", "确认定位链路存在异常", "success"],
      ["14:30:20", "缺少激光驱动日志，自动诊断暂停", "warning"],
    ],
    actions: `
      <button class="secondary-button" type="button" data-action="manual">转人工排查</button>
      <button class="primary-button" type="button" data-action="supplement">补充缺失材料</button>`,
  },
  failed: {
    status: ["执行失败", "failed"],
    activeStep: 2,
    stepCount: "2 / 5",
    title: "排查结果",
    description: "",
    count: "执行失败 1 项",
    rows: [
      {
        rowClass: "failed-row",
        label: ["执行失败", "failed"],
        item: "基础材料采集",
        conclusion: "无法通过 SSH 连接车辆 172.19.3.79，可能由车辆离线、网络不可达或权限失效导致。",
        evidence: null,
        status: ["失败", "failed"],
      },
    ],
    timeline: [
      ["14:30:01", "开始连接内网车辆 172.19.3.79", "running"],
      ["14:30:16", "连接超时，未获取基础材料", "failed"],
      ["14:30:16", "保存失败原因并停止后续分析", "warning"],
    ],
    actions: `
      <button class="secondary-button" type="button" data-action="manual">转人工排查</button>
      <button class="primary-button" type="button" data-action="retry">重试连接</button>`,
  },
};

function renderSteps(activeStep) {
  elements.stepsList.innerHTML = steps
    .map(([title, description], index) => {
      const number = index + 1;
      const status = number < activeStep ? "completed" : number === activeStep ? "active" : "pending";
      return `
        <li class="step-item ${status}">
          <span class="step-node">${status === "completed" ? "✓" : number}</span>
          <span class="step-copy"><strong>${title}</strong><small>${description}</small></span>
        </li>`;
    })
    .join("");
}

function renderRows(rows) {
  elements.resultRows.innerHTML = rows
    .map((row) => {
      const evidenceCell = row.evidence
        ? `<button class="evidence-button" type="button" data-evidence="${row.evidence[1]}">${row.evidence[0]}</button>`
        : '<span class="no-evidence">暂无证据</span>';
      return `
        <tr class="${row.rowClass || ""}">
          <td><span class="result-label ${row.label[1]}">${row.label[0]}</span></td>
          <td><strong>${row.item}</strong></td>
          <td>${row.conclusion}</td>
          <td>${evidenceCell}</td>
          <td><span class="row-status ${row.status[1]}">${row.status[0]}</span></td>
        </tr>`;
    })
    .join("");
}

function renderTimeline(items) {
  elements.timeline.innerHTML = items
    .map(
      ([time, text, status]) => `
        <div class="timeline-item ${status}">
          <time>${time}</time><i></i><p>${text}</p>
        </div>`,
    )
    .join("");
}

function setStatus([label, type]) {
  elements.caseStatus.textContent = label;
  elements.caseStatus.className = `status-pill ${type}`;
}

function renderState(name) {
  const state = states[name];
  setStatus(state.status);
  elements.stepCount.textContent = state.stepCount;
  elements.resultTitle.textContent = state.title;
  elements.resultCount.textContent = state.count;
  elements.resultActions.innerHTML = state.actions;
  renderSteps(state.activeStep);
  renderRows(state.rows);
  renderTimeline(state.timeline);
  bindDynamicActions();
}

function openEvidence(key) {
  const item = evidence[key];
  if (!item) return;
  elements.drawerSource.textContent = item.source;
  elements.drawerTime.textContent = item.time;
  elements.drawerContent.textContent = item.content;
  elements.drawerMask.classList.remove("hidden");
  elements.evidenceDrawer.classList.remove("hidden");
}

function closeEvidence() {
  elements.drawerMask.classList.add("hidden");
  elements.evidenceDrawer.classList.add("hidden");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.add("hidden"), 2500);
}

function bindDynamicActions() {
  document.querySelectorAll("[data-evidence]").forEach((button) => {
    button.addEventListener("click", () => openEvidence(button.dataset.evidence));
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "finish") {
        elements.stateSelect.value = "completed";
        renderState("completed");
        showToast("已完成全部排查项。 ");
      }
      if (action === "retry") {
        elements.stateSelect.value = "running";
        renderState("running");
        showToast("已重新连接并恢复诊断。 ");
      }
      if (action === "supplement") showToast("已进入材料补充流程。 ");
      if (action === "manual") showToast("已转入人工排查，当前表格和执行记录将保留。 ");
      if (action === "handoff") showToast("已认可结论，下一步将生成标准化交接材料。 ");
    });
  });
}

elements.stateSelect.addEventListener("change", () => renderState(elements.stateSelect.value));
elements.toggleTimelineButton.addEventListener("click", () => {
  const hidden = elements.timeline.classList.toggle("hidden");
  elements.toggleTimelineButton.textContent = hidden ? "展开" : "收起";
});
elements.drawerMask.addEventListener("click", closeEvidence);
elements.closeDrawerButton.addEventListener("click", closeEvidence);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeEvidence();
});

renderState("completed");
