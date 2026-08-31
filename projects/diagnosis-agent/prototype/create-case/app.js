const elements = {
  inputPanel: document.querySelector("#inputPanel"),
  reviewPanel: document.querySelector("#reviewPanel"),
  errorPanel: document.querySelector("#errorPanel"),
  createdPanel: document.querySelector("#createdPanel"),
  caseForm: document.querySelector("#caseForm"),
  problemInput: document.querySelector("#problemInput"),
  occurredAt: document.querySelector("#occurredAt"),
  problemFieldGroup: document.querySelector("#problemFieldGroup"),
  timeFieldGroup: document.querySelector("#timeFieldGroup"),
  problemError: document.querySelector("#problemError"),
  timeError: document.querySelector("#timeError"),
  characterCount: document.querySelector("#characterCount"),
  fillExampleButton: document.querySelector("#fillExampleButton"),
  resetButton: document.querySelector("#resetButton"),
  backButton: document.querySelector("#backButton"),
  editButton: document.querySelector("#editButton"),
  confirmButton: document.querySelector("#confirmButton"),
  returnToInputButton: document.querySelector("#returnToInputButton"),
  createAnotherButton: document.querySelector("#createAnotherButton"),
  reviewReadonly: document.querySelector("#reviewReadonly"),
  reviewEditForm: document.querySelector("#reviewEditForm"),
  reviewSourceType: document.querySelector("#reviewSourceType"),
  reviewSourceAddress: document.querySelector("#reviewSourceAddress"),
  reviewProblem: document.querySelector("#reviewProblem"),
  reviewOccurredAt: document.querySelector("#reviewOccurredAt"),
  sourceIcon: document.querySelector("#sourceIcon"),
  editSourceType: document.querySelector("#editSourceType"),
  editSourceAddress: document.querySelector("#editSourceAddress"),
  editProblem: document.querySelector("#editProblem"),
  editOccurredAt: document.querySelector("#editOccurredAt"),
  createdCaseId: document.querySelector("#createdCaseId"),
  toast: document.querySelector("#toast"),
  steps: [...document.querySelectorAll(".step")],
};

const state = {
  recognized: null,
  editing: false,
};

const SOURCE_STYLE = {
  "内网车辆": "blue",
  "Teambition 任务": "purple",
  "客户远程现场": "orange",
  "已有日志": "gray",
};

function toLocalDateTimeValue(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function normalizeAddress(value) {
  return value.replace(/[，。；;]+$/, "").trim();
}

function detectMaterialSource(rawText) {
  const text = rawText.trim();
  const urlMatches = text.match(/https?:\/\/[^\s，。；]+/gi) || [];
  const teambitionUrl = urlMatches.find((url) => /teambition|tb\./i.test(url));
  const ipMatch = text.match(/\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/);
  const windowsPath = text.match(/[A-Za-z]:\\(?:[^\\\s]+\\)*[^\s，。；]*/);
  const unixPath = text.match(/(?:^|\s)(\/(?:[^/\s]+\/)+[^\s，。；]*)/);
  const isRemote = /客户现场|远程现场|远程连接|remote[-_ ]?hand/i.test(text);

  if (teambitionUrl) {
    return {
      type: "Teambition 任务",
      address: normalizeAddress(teambitionUrl),
    };
  }

  if (windowsPath || unixPath) {
    return {
      type: "已有日志",
      address: normalizeAddress(windowsPath?.[0] || unixPath?.[1] || ""),
    };
  }

  if (isRemote && ipMatch) {
    return {
      type: "客户远程现场",
      address: `远程现场 / ${ipMatch[0]}`,
    };
  }

  if (ipMatch) {
    return {
      type: "内网车辆",
      address: ipMatch[0],
    };
  }

  return null;
}

function extractProblemDescription(rawText, source) {
  let description = rawText.trim();
  if (source?.type === "Teambition 任务") {
    description = description.replace(source.address, "");
  } else if (source?.type === "已有日志") {
    description = description.replace(source.address, "");
  } else if (source?.address) {
    const ip = source.address.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/)?.[0];
    if (ip) description = description.replace(ip, "");
  }

  description = description
    .replace(/^[\s，。；:：,\-]+/, "")
    .replace(/\s+/g, " ")
    .trim();

  return description || "未识别到独立的问题描述，请人工补充。";
}

function setActiveStep(activeStep) {
  elements.steps.forEach((step, index) => {
    const number = index + 1;
    step.classList.toggle("active", number === activeStep);
    step.classList.toggle("completed", number < activeStep);
  });
}

function showPanel(panelName) {
  ["inputPanel", "reviewPanel", "errorPanel", "createdPanel"].forEach((name) => {
    elements[name].classList.toggle("hidden", name !== panelName);
  });
}

function clearValidation() {
  elements.problemFieldGroup.classList.remove("invalid");
  elements.timeFieldGroup.classList.remove("invalid");
  elements.problemError.textContent = "";
  elements.timeError.textContent = "";
}

function validateForm() {
  clearValidation();
  let valid = true;

  if (!elements.problemInput.value.trim()) {
    elements.problemFieldGroup.classList.add("invalid");
    elements.problemError.textContent = "请填写问题信息。";
    valid = false;
  }

  if (!elements.occurredAt.value) {
    elements.timeFieldGroup.classList.add("invalid");
    elements.timeError.textContent = "请选择问题发生时间。";
    valid = false;
  }

  return valid;
}

function syncReviewReadonly() {
  const data = state.recognized;
  elements.reviewSourceType.textContent = data.type;
  elements.reviewSourceAddress.textContent = data.address;
  elements.reviewProblem.textContent = data.problem;
  elements.reviewOccurredAt.textContent = formatDateTime(data.occurredAt);
  elements.sourceIcon.className = `source-icon ${SOURCE_STYLE[data.type] || "gray"}`;
}

function syncReviewEditForm() {
  const data = state.recognized;
  elements.editSourceType.value = data.type;
  elements.editSourceAddress.value = data.address;
  elements.editProblem.value = data.problem;
  elements.editOccurredAt.value = data.occurredAt;
}

function setReviewEditing(editing) {
  state.editing = editing;
  elements.reviewReadonly.classList.toggle("hidden", editing);
  elements.reviewEditForm.classList.toggle("hidden", !editing);
  elements.editButton.textContent = editing ? "保存修改" : "修改识别结果";
  elements.confirmButton.disabled = editing;
  elements.confirmButton.style.opacity = editing ? "0.55" : "1";
  elements.confirmButton.style.cursor = editing ? "not-allowed" : "pointer";
}

function saveReviewEdits() {
  state.recognized = {
    ...state.recognized,
    type: elements.editSourceType.value,
    address: elements.editSourceAddress.value.trim() || "未填写",
    problem: elements.editProblem.value.trim() || "未填写",
    occurredAt: elements.editOccurredAt.value,
  };
  syncReviewReadonly();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 2600);
}

function returnToInput() {
  showPanel("inputPanel");
  setActiveStep(1);
  window.requestAnimationFrame(() => elements.problemInput.focus());
}

function resetPrototype() {
  state.recognized = null;
  state.editing = false;
  elements.caseForm.reset();
  elements.characterCount.textContent = "0";
  clearValidation();
  returnToInput();
}

elements.problemInput.addEventListener("input", () => {
  elements.characterCount.textContent = String(elements.problemInput.value.length);
  if (elements.problemInput.value.trim()) {
    elements.problemFieldGroup.classList.remove("invalid");
    elements.problemError.textContent = "";
  }
});

elements.occurredAt.addEventListener("input", () => {
  if (elements.occurredAt.value) {
    elements.timeFieldGroup.classList.remove("invalid");
    elements.timeError.textContent = "";
  }
});

elements.fillExampleButton.addEventListener("click", () => {
  elements.problemInput.value =
    "172.19.3.79 小车在执行搬运任务时定位丢失，任务中断，现场反馈错误发生后未进行重启。";
  elements.occurredAt.value = "2026-08-25T14:30";
  elements.characterCount.textContent = String(elements.problemInput.value.length);
  clearValidation();
  showToast("已填入内网车辆示例，可直接体验识别流程。另可删除 IP 测试识别失败状态。");
});

elements.resetButton.addEventListener("click", resetPrototype);

elements.caseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateForm()) return;

  const source = detectMaterialSource(elements.problemInput.value);
  if (!source) {
    showPanel("errorPanel");
    setActiveStep(1);
    return;
  }

  state.recognized = {
    ...source,
    problem: extractProblemDescription(elements.problemInput.value, source),
    occurredAt: elements.occurredAt.value,
  };

  syncReviewReadonly();
  syncReviewEditForm();
  setReviewEditing(false);
  showPanel("reviewPanel");
  setActiveStep(2);
});

elements.backButton.addEventListener("click", returnToInput);
elements.returnToInputButton.addEventListener("click", returnToInput);

elements.editButton.addEventListener("click", () => {
  if (state.editing) {
    saveReviewEdits();
    setReviewEditing(false);
    showToast("识别结果已按人工修改更新。");
  } else {
    syncReviewEditForm();
    setReviewEditing(true);
  }
});

elements.confirmButton.addEventListener("click", () => {
  if (!state.recognized || state.editing) return;
  const suffix = String(Date.now()).slice(-6);
  elements.createdCaseId.textContent = `CASE-${suffix}`;
  showPanel("createdPanel");
  setActiveStep(3);
});

elements.createAnotherButton.addEventListener("click", resetPrototype);

document.querySelectorAll("[data-placeholder-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showToast("“我的 Case”列表不在本轮创建页原型范围内。 ");
  });
});

elements.occurredAt.max = toLocalDateTimeValue(new Date());
