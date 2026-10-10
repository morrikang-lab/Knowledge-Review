/* Knowledge Review for Obsidian */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => KnowledgeReviewPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");

// src/ai.ts
function endpoint(baseUrl) {
  const clean = baseUrl.trim().replace(/\/+$/, "");
  return clean.endsWith("/chat/completions") ? clean : `${clean}/chat/completions`;
}
function parseJson(text) {
  var _a, _b;
  const fenced = (_b = (_a = text.match(/```(?:json)?\s*([\s\S]*?)```/i)) == null ? void 0 : _a[1]) != null ? _b : text;
  return JSON.parse(fenced.trim());
}
async function requestJson(settings, system, user) {
  var _a, _b, _c;
  if (!settings.aiBaseUrl.trim() || !settings.aiApiKey.trim() || !settings.aiModel.trim()) {
    throw new Error("\u8BF7\u5148\u5728\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u586B\u5199 AI \u63A5\u53E3\u5730\u5740\u3001\u6A21\u578B\u548C API \u5BC6\u94A5\u3002");
  }
  const requestBody = {
    model: settings.aiModel.trim(),
    temperature: 0.2,
    messages: [{ role: "system", content: system }, { role: "user", content: user }]
  };
  const send = (withJsonMode) => fetch(endpoint(settings.aiBaseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${settings.aiApiKey.trim()}` },
    body: JSON.stringify(withJsonMode ? { ...requestBody, response_format: { type: "json_object" } } : requestBody)
  });
  let response = await send(true);
  if (response.status === 400 || response.status === 422) response = await send(false);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`AI \u8BF7\u6C42\u5931\u8D25\uFF08${response.status}\uFF09\uFF1A${detail.slice(0, 300)}`);
  }
  const payload = await response.json();
  const content = (_c = (_b = (_a = payload.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.message) == null ? void 0 : _c.content;
  if (!content) throw new Error("AI \u6CA1\u6709\u8FD4\u56DE\u53EF\u7528\u5185\u5BB9\u3002");
  return parseJson(content);
}
async function testAIConnection(settings) {
  const parsed = await requestJson(
    settings,
    '\u8FD9\u662F\u4E00\u6B21 API \u8FDE\u63A5\u6D4B\u8BD5\u3002\u53EA\u8FD4\u56DE\u4E25\u683C JSON\uFF1A{"ok":true}\u3002',
    "\u8BF7\u786E\u8BA4\u8FDE\u63A5\u6B63\u5E38\u3002"
  );
  if (parsed.ok !== true) throw new Error("API \u5DF2\u54CD\u5E94\uFF0C\u4F46\u6CA1\u6709\u8FD4\u56DE\u9884\u671F\u7684\u6D4B\u8BD5\u7ED3\u679C\u3002");
}
async function generateFlashcards(settings, material, count) {
  var _a;
  const parsed = await requestJson(
    settings,
    '\u4F60\u662F\u4E00\u540D\u4E25\u8C28\u7684\u95EA\u5361\u7F16\u8F91\u3002\u53EA\u57FA\u4E8E\u6750\u6599\u751F\u6210\u53EF\u72EC\u7ACB\u590D\u4E60\u7684\u95EE\u7B54\u5361\u3002\u95EE\u9898\u5FC5\u987B\u660E\u786E\uFF0C\u7B54\u6848\u7B80\u6D01\u4F46\u5B8C\u6574\uFF0C\u4E0D\u5F97\u8865\u5145\u6750\u6599\u4E2D\u6CA1\u6709\u7684\u4E8B\u5B9E\u3002\u8FD4\u56DE\u4E25\u683C JSON\uFF1A{"cards":[{"question":"...","answer":"..."}]}\u3002',
    `\u8BF7\u4ECE\u4E0B\u9762\u6750\u6599\u4E2D\u751F\u6210 ${count} \u5F20\u4E2D\u6587\u95EE\u7B54\u95EA\u5361\u3002\u4F18\u5148\u8986\u76D6\u5173\u952E\u6982\u5FF5\uFF0C\u907F\u514D\u91CD\u590D\u3002

\u6750\u6599\uFF1A
${material}`
  );
  const cards = (_a = parsed.cards) != null ? _a : [];
  return cards.filter((card) => typeof card.question === "string" && typeof card.answer === "string").map((card) => ({ question: String(card.question).trim(), answer: String(card.answer).trim(), selected: true })).filter((card) => card.question && card.answer);
}
async function suggestKeyword(settings, material) {
  const parsed = await requestJson(
    settings,
    '\u4ECE\u7528\u6237\u6750\u6599\u4E2D\u9009\u62E9\u4E00\u4E2A\u6700\u80FD\u4EE3\u8868\u6838\u5FC3\u77E5\u8BC6\u70B9\u3001\u9002\u5408\u5145\u5F53\u94FE\u63A5\u951A\u70B9\u7684\u77ED\u5173\u952E\u8BCD\u3002\u5173\u952E\u8BCD\u5FC5\u987B\u9010\u5B57\u5B58\u5728\u4E8E\u539F\u6587\uFF0C\u4E0D\u5F97\u6539\u5199\u3002\u53EA\u8FD4\u56DE\u4E25\u683C JSON\uFF1A{"keyword":"\u539F\u6587\u8BCD\u8BED"}\u3002',
    material
  );
  const keyword = typeof parsed.keyword === "string" ? parsed.keyword.trim() : "";
  if (!keyword || !material.includes(keyword)) throw new Error("AI \u6CA1\u6709\u8FD4\u56DE\u539F\u6587\u4E2D\u5B58\u5728\u7684\u5173\u952E\u8BCD\u3002");
  return keyword;
}
async function suggestClozes(settings, material) {
  const parsed = await requestJson(
    settings,
    '\u4ECE\u6750\u6599\u4E2D\u9009\u62E9\u591A\u4E2A\u503C\u5F97\u8BB0\u5FC6\u7684\u5173\u952E\u8BCD\u6216\u77ED\u8BED\u4F5C\u4E3A\u6316\u7A7A\u3002\u6BCF\u9879\u5FC5\u987B\u9010\u5B57\u5B58\u5728\u4E8E\u539F\u6587\uFF0C\u4E0D\u5F97\u91CD\u53E0\u3001\u4E0D\u5F97\u6539\u5199\uFF0C\u6700\u591A 8 \u9879\u3002\u53EA\u8FD4\u56DE\u4E25\u683C JSON\uFF1A{"terms":["\u539F\u6587\u8BCD\u8BED1","\u539F\u6587\u8BCD\u8BED2"]}\u3002',
    material
  );
  if (!Array.isArray(parsed.terms)) return [];
  return Array.from(new Set(parsed.terms.filter((term) => typeof term === "string").map((term) => term.trim()).filter((term) => term && material.includes(term)))).slice(0, 8);
}

// src/modals.ts
var import_obsidian = require("obsidian");

// src/utils.ts
function uid(prefix = "kr") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function startOfDay(time = Date.now()) {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}
function addDays(time, days) {
  const date = new Date(time);
  date.setDate(date.getDate() + days);
  date.setHours(8, 0, 0, 0);
  return date.getTime();
}
function normalizeTags(value) {
  return Array.from(new Set(value.split(/[,，\s]+/).map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean)));
}
function stripMdExtension(path) {
  return path.replace(/\.md$/i, "");
}
function escapeFenceValue(value) {
  return value.replace(/\r?\n/g, " ").trim();
}
function serializeExcerpt(spec) {
  const lines = [
    "```knowledge-card",
    `source: ${escapeFenceValue(spec.source)}`,
    spec.marker ? `marker: ${escapeFenceValue(spec.marker)}` : "",
    spec.blocks.length ? `blocks: ${spec.blocks.join(", ")}` : "",
    spec.heading ? `heading: ${escapeFenceValue(spec.heading)}` : "",
    spec.title ? `title: ${escapeFenceValue(spec.title)}` : "",
    `color: ${spec.color}`,
    `showHeading: ${spec.showHeading ? "true" : "false"}`,
    "```"
  ];
  return lines.filter(Boolean).join("\n");
}
function parseExcerpt(source) {
  var _a, _b;
  const values = /* @__PURE__ */ new Map();
  for (const rawLine of source.split("\n")) {
    const match = rawLine.match(/^\s*([A-Za-z]+)\s*:\s*(.*?)\s*$/);
    if (match) values.set(match[1].toLowerCase(), match[2]);
  }
  const path = values.get("source");
  if (!path) return null;
  const blocks = ((_b = (_a = values.get("blocks")) != null ? _a : values.get("block")) != null ? _b : "").split(",").map((item) => item.trim().replace(/^\^/, "")).filter(Boolean);
  return {
    source: path.replace(/^\[\[|\]\]$/g, ""),
    blocks,
    marker: values.get("marker") || void 0,
    heading: values.get("heading") || void 0,
    title: values.get("title") || void 0,
    color: values.get("color") || "blue",
    showHeading: values.get("showheading") !== "false"
  };
}
function nearestHeading(editor, line) {
  for (let index = line; index >= 0; index -= 1) {
    const match = editor.getLine(index).match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
    if (match) return match[1];
  }
  return void 0;
}
function fileLink(file, anchor) {
  return `${stripMdExtension(file.path)}${anchor ? `#${anchor}` : ""}`;
}

// src/scheduler.ts
function scheduleReview(card, rating, settings, now = Date.now()) {
  var _a, _b, _c;
  const next = { ...card, updatedAt: now };
  if (card.algorithm === "fixed") {
    const intervals = settings.fixedIntervals.length ? settings.fixedIntervals : [0, 1, 2, 4, 7, 15, 30];
    if (rating === "again") {
      next.fixedStep = 0;
      next.intervalDays = 0;
      next.dueAt = now + 10 * 60 * 1e3;
    } else if (rating === "hard") {
      const step = Math.max(1, Math.min(card.fixedStep, intervals.length - 1));
      const days = Math.max(1, (_a = intervals[step]) != null ? _a : 1);
      next.fixedStep = step;
      next.intervalDays = days;
      next.dueAt = addDays(now, days);
    } else {
      const step = Math.min(card.fixedStep + 1, intervals.length - 1);
      const days = (_c = (_b = intervals[step]) != null ? _b : intervals[intervals.length - 1]) != null ? _c : 30;
      next.fixedStep = step;
      next.intervalDays = days;
      next.dueAt = addDays(now, days);
    }
    return next;
  }
  if (rating === "again") {
    next.repetitions = 0;
    next.intervalDays = 1;
    next.ease = Math.max(1.3, card.ease - 0.2);
  } else if (rating === "hard") {
    next.repetitions = card.repetitions + 1;
    next.intervalDays = Math.max(1, Math.round(Math.max(1, card.intervalDays) * 1.2));
    next.ease = Math.max(1.3, card.ease - 0.15);
  } else {
    next.repetitions = card.repetitions + 1;
    if (next.repetitions === 1) next.intervalDays = 1;
    else if (next.repetitions === 2) next.intervalDays = 3;
    else next.intervalDays = Math.max(1, Math.round(Math.max(1, card.intervalDays) * card.ease));
    next.ease = Math.min(3.2, card.ease + 0.05);
  }
  next.dueAt = addDays(now, next.intervalDays);
  return next;
}

// src/card-tools.ts
function cardTitle(card) {
  var _a;
  if ((_a = card.title) == null ? void 0 : _a.trim()) return card.title.trim();
  if (card.kind === "image") return card.question;
  const terms = Array.from(card.question.matchAll(/\{\{c\d+::([\s\S]*?)\}\}/g)).map((m) => m[1]);
  return (terms.length ? terms.slice(0, 3).join(" \xB7 ") : card.question.replace(/[#*`\[\]]/g, "").replace(/\s+/g, " ")).slice(0, 70);
}
function adjustBox(box, dx, dy, corner) {
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  if (!corner) return { ...box, x: clamp(box.x + dx, 0, 1 - box.width), y: clamp(box.y + dy, 0, 1 - box.height) };
  let left = box.x, top = box.y, right = left + box.width, bottom = top + box.height;
  if (corner.includes("w")) left = clamp(left + dx, 0, right - 0.015);
  else right = clamp(right + dx, left + 0.015, 1);
  if (corner.includes("n")) top = clamp(top + dy, 0, bottom - 0.015);
  else bottom = clamp(bottom + dy, top + 0.015, 1);
  return { x: left, y: top, width: right - left, height: bottom - top };
}
function forecast(cards, settings, now = Date.now(), days = 30) {
  const today = startOfDay(now);
  const dates = Array.from({ length: days }, (_, i) => addDays(today, i));
  const indices = new Map(dates.map((t, i) => [startOfDay(t), i]));
  const known = dates.map(() => 0), projected = dates.map(() => 0);
  for (const card of cards.filter((c) => !c.suspended)) {
    let due = Math.max(now, card.dueAt);
    const first = indices.get(startOfDay(due));
    if (first === void 0) continue;
    known[first]++;
    let state = { ...card };
    for (let n = 0; n < days; n++) {
      state = scheduleReview(state, "good", settings, due);
      due = Math.max(state.dueAt, addDays(due, 1));
      const index = indices.get(startOfDay(due));
      if (index === void 0) break;
      projected[index]++;
    }
  }
  return { dates, known, projected };
}

// src/modals.ts
var COLORS = ["blue", "green", "yellow", "red", "purple", "gray"];
var ExcerptOptionsModal = class extends import_obsidian.Modal {
  constructor(app, initialTitle, suggestedKeyword, selectedText, onSubmit) {
    super(app);
    this.selectedText = selectedText;
    this.onSubmit = onSubmit;
    this.value = { title: initialTitle, keyword: suggestedKeyword, color: "blue", showHeading: true };
  }
  onOpen() {
    this.setTitle("\u521B\u5EFA\u77E5\u8BC6\u6458\u5F55\u5361\u7247");
    new import_obsidian.Setting(this.contentEl).setName("\u5361\u7247\u6807\u9898").setDesc("\u53EF\u4EE5\u7559\u7A7A\uFF0C\u5C06\u663E\u793A\u6765\u6E90\u7AE0\u8282\u3002").addText((text) => text.setValue(this.value.title).onChange((value) => {
      this.value.title = value;
    }));
    new import_obsidian.Setting(this.contentEl).setName("\u539F\u6587\u9AD8\u4EAE\u5173\u952E\u8BCD").setDesc("\u8BE5\u8BCD\u4F1A\u53D8\u6210\u8DF3\u5F80\u6458\u5F55\u5E93\u7684\u9AD8\u4EAE\u94FE\u63A5\uFF0C\u5FC5\u987B\u539F\u6837\u51FA\u73B0\u5728\u6240\u9009\u5185\u5BB9\u4E2D\u3002").addText((text) => text.setValue(this.value.keyword).onChange((value) => {
      this.value.keyword = value;
    }));
    new import_obsidian.Setting(this.contentEl).setName("\u989C\u8272").addDropdown((dropdown) => {
      for (const color of COLORS) dropdown.addOption(color, colorLabel(color));
      dropdown.setValue(this.value.color).onChange((value) => {
        this.value.color = value;
      });
    });
    new import_obsidian.Setting(this.contentEl).setName("\u663E\u793A\u6240\u5728\u7AE0\u8282").addToggle((toggle) => toggle.setValue(true).onChange((value) => {
      this.value.showHeading = value;
    }));
    new import_obsidian.Setting(this.contentEl).addButton((button) => button.setCta().setButtonText("\u521B\u5EFA\u6458\u5F55").onClick(() => {
      if (!this.value.keyword.trim() || !this.selectedText.includes(this.value.keyword.trim())) return;
      this.close();
      this.onSubmit(this.value);
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ClozePreviewModal = class extends import_obsidian.Modal {
  constructor(app, material, terms, onSubmit) {
    super(app);
    this.material = material;
    this.onSubmit = onSubmit;
    this.suggestions = terms.map((text) => ({ text, selected: true }));
  }
  onOpen() {
    this.modalEl.addClass("kr-ai-preview-modal");
    this.setTitle("\u9009\u62E9\u9700\u8981\u6316\u7A7A\u7684\u5185\u5BB9");
    this.contentEl.createEl("p", { text: "AI \u5EFA\u8BAE\u5982\u4E0B\u3002\u53EF\u4EE5\u4FEE\u6539\u6587\u5B57\u6216\u5173\u95ED\u4E0D\u9700\u8981\u7684\u9879\u76EE\uFF0C\u6587\u5B57\u5FC5\u987B\u539F\u6837\u5B58\u5728\u4E8E\u9009\u533A\u4E2D\u3002", cls: "setting-item-description" });
    const preview = this.contentEl.createEl("textarea", { text: this.material, cls: "kr-material-preview" });
    preview.readOnly = true;
    const list = this.contentEl.createDiv({ cls: "kr-cloze-suggestions" });
    this.suggestions.forEach((item, index) => {
      new import_obsidian.Setting(list).setName(`\u6316\u7A7A ${index + 1}`).addText((text) => text.setValue(item.text).onChange((value) => {
        item.text = value;
      })).addToggle((toggle) => toggle.setValue(item.selected).onChange((value) => {
        item.selected = value;
      }));
    });
    new import_obsidian.Setting(this.contentEl).addButton((button) => button.setButtonText("\u53D6\u6D88").onClick(() => this.close())).addButton((button) => button.setCta().setButtonText("\u7EE7\u7EED\u5236\u4F5C\u95EA\u5361").onClick(() => {
      const terms = this.suggestions.filter((item) => item.selected).map((item) => item.text.trim()).filter((term) => term && this.material.includes(term));
      if (!terms.length) return;
      this.close();
      this.onSubmit(Array.from(new Set(terms)));
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ManualExcerptModal = class extends import_obsidian.Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
    this.source = "";
    this.heading = "";
    this.block = "";
    this.title = "";
    this.color = "blue";
    this.showHeading = true;
  }
  onOpen() {
    this.setTitle("\u624B\u52A8\u63D2\u5165\u77E5\u8BC6\u6458\u5F55\u5361\u7247");
    new import_obsidian.Setting(this.contentEl).setName("\u6E90\u6587\u4EF6").setDesc("\u4F8B\u5982\uFF1A\u65E5\u8BED/N2\u9605\u8BFB.md").addText((text) => text.onChange((value) => {
      this.source = value;
    }));
    new import_obsidian.Setting(this.contentEl).setName("\u7AE0\u8282\u6807\u9898").setDesc("\u7AE0\u8282\u4E0E\u5757 ID \u4E8C\u9009\u4E00\u3002").addText((text) => text.onChange((value) => {
      this.heading = value;
    }));
    new import_obsidian.Setting(this.contentEl).setName("\u5757 ID").setDesc("\u53EF\u4E0D\u5199 ^ \u7B26\u53F7\u3002").addText((text) => text.onChange((value) => {
      this.block = value.replace(/^\^/, "");
    }));
    new import_obsidian.Setting(this.contentEl).setName("\u5361\u7247\u6807\u9898").addText((text) => text.onChange((value) => {
      this.title = value;
    }));
    new import_obsidian.Setting(this.contentEl).setName("\u989C\u8272").addDropdown((dropdown) => {
      for (const color of COLORS) dropdown.addOption(color, colorLabel(color));
      dropdown.setValue(this.color).onChange((value) => {
        this.color = value;
      });
    });
    new import_obsidian.Setting(this.contentEl).setName("\u663E\u793A\u6240\u5728\u7AE0\u8282").addToggle((toggle) => toggle.setValue(true).onChange((value) => {
      this.showHeading = value;
    }));
    new import_obsidian.Setting(this.contentEl).addButton((button) => button.setCta().setButtonText("\u63D2\u5165").onClick(() => {
      if (!this.source.trim() || !this.heading.trim() && !this.block.trim()) return;
      this.close();
      this.onSubmit({
        source: this.source.trim(),
        blocks: this.block.trim() ? [this.block.trim()] : [],
        heading: this.heading.trim() || void 0,
        title: this.title.trim() || void 0,
        color: this.color,
        showHeading: this.showHeading
      });
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ImageOcclusionModal = class extends import_obsidian.Modal {
  constructor(app, file, onSubmit, initialBoxes = [], initialTitle = "") {
    super(app);
    this.onSubmit = onSubmit;
    this.url = URL.createObjectURL(file);
    this.title = initialTitle;
    this.boxes = initialBoxes.map((box) => ({ ...box }));
  }
  onOpen() {
    this.modalEl.addClass("kr-image-editor-modal");
    this.setTitle("\u7F16\u8F91\u56FE\u7247\u6316\u7A7A\u65B9\u5757");
    this.contentEl.createEl("p", { text: "\u7A7A\u767D\u5904\u62D6\u52A8\u753B\u6846\uFF1B\u70B9\u51FB\u65B9\u5757\u9009\u4E2D\uFF0C\u62D6\u52A8\u4E2D\u95F4\u79FB\u52A8\uFF0C\u62D6\u52A8\u56DB\u89D2\u7F29\u653E\u3002", cls: "setting-item-description" });
    new import_obsidian.Setting(this.contentEl).setName("\u56FE\u7247\u5361\u6807\u9898").setDesc("\u624B\u52A8\u586B\u5199\uFF1B\u7559\u7A7A\u81EA\u52A8\u4F7F\u7528 1\u30012\u30013\u2026\u2026").addText((text) => text.setValue(this.title).onChange((value) => {
      this.title = value;
    }));
    const stage = this.contentEl.createDiv({ cls: "kr-image-stage" });
    const picture = stage.createEl("img", { attr: { src: this.url, alt: "\u5F85\u6316\u7A7A\u56FE\u7247", draggable: "false" } });
    const overlay = stage.createDiv({ cls: "kr-image-overlay" });
    const counter = this.contentEl.createEl("p", { cls: "setting-item-description" });
    let selected = -1;
    const history = [];
    const snapshot = () => this.boxes.map((box) => ({ ...box }));
    const redraw = () => {
      overlay.empty();
      this.boxes.forEach((box, index) => {
        const block = overlay.createDiv({ cls: `kr-editor-box ${index === selected ? "is-selected" : ""}` });
        block.dataset.index = String(index);
        placeBox(block, box);
        if (index === selected) for (const corner of ["nw", "ne", "sw", "se"]) {
          const handle = block.createDiv({ cls: `kr-resize-handle kr-handle-${corner}` });
          handle.dataset.corner = corner;
        }
      });
      counter.setText(`\u5171 ${this.boxes.length} \u4E2A\u65B9\u5757${selected >= 0 ? ` \xB7 \u5DF2\u9009\u4E2D ${selected + 1}` : ""}`);
    };
    const point = (event) => {
      const rect = picture.getBoundingClientRect();
      return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
    };
    let gesture = null;
    let draft = null;
    stage.addEventListener("pointerdown", (event) => {
      if (gesture || !picture.complete || !picture.naturalWidth) return;
      event.preventDefault();
      const target = event.target;
      const hit = target.closest(".kr-editor-box");
      selected = hit ? Number(hit.dataset.index) : -1;
      gesture = { id: event.pointerId, from: point(event), box: selected >= 0 ? { ...this.boxes[selected] } : void 0, corner: target.dataset.corner, before: snapshot() };
      redraw();
      if (selected < 0) draft = overlay.createDiv({ cls: "kr-editor-box" });
      stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener("pointermove", (event) => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const end = point(event), dx = end.x - gesture.from.x, dy = end.y - gesture.from.y;
      if (gesture.box) {
        this.boxes[selected] = adjustBox(gesture.box, dx, dy, gesture.corner);
        const node = overlay.querySelector(`[data-index="${selected}"]`);
        if (node) placeBox(node, this.boxes[selected]);
      } else if (draft) placeBox(draft, { x: Math.min(end.x, gesture.from.x), y: Math.min(end.y, gesture.from.y), width: Math.abs(dx), height: Math.abs(dy) });
    });
    stage.addEventListener("pointerup", (event) => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const end = point(event);
      if (!gesture.box) {
        const box = { x: Math.min(end.x, gesture.from.x), y: Math.min(end.y, gesture.from.y), width: Math.abs(end.x - gesture.from.x), height: Math.abs(end.y - gesture.from.y) };
        if (box.width >= 0.015 && box.height >= 0.015) {
          this.boxes.push(box);
          selected = this.boxes.length - 1;
        }
      }
      if (JSON.stringify(this.boxes) !== JSON.stringify(gesture.before)) history.push(gesture.before);
      gesture = null;
      draft = null;
      redraw();
    });
    stage.addEventListener("pointercancel", () => {
      if (gesture) this.boxes = gesture.before;
      gesture = null;
      draft = null;
      redraw();
    });
    new import_obsidian.Setting(this.contentEl).addButton((button) => button.setButtonText("\u64A4\u9500").onClick(() => {
      const prior = history.pop();
      if (prior) this.boxes = prior;
      selected = -1;
      redraw();
    })).addButton((button) => button.setButtonText("\u5220\u9664\u9009\u4E2D\u65B9\u5757").onClick(() => {
      if (selected < 0) return;
      history.push(snapshot());
      this.boxes.splice(selected, 1);
      selected = -1;
      redraw();
    })).addButton((button) => button.setButtonText("\u6E05\u7A7A").onClick(() => {
      history.push(snapshot());
      this.boxes = [];
      selected = -1;
      redraw();
    })).addButton((button) => button.setCta().setButtonText("\u4FDD\u5B58\u65B9\u5757\u5E76\u7EE7\u7EED").onClick(() => {
      if (!this.boxes.length) {
        new import_obsidian.Notice("\u8BF7\u753B\u81F3\u5C11\u4E00\u4E2A\u65B9\u5757\u3002");
        return;
      }
      this.close();
      this.onSubmit(this.title.trim(), snapshot());
    }));
    redraw();
  }
  onClose() {
    URL.revokeObjectURL(this.url);
    this.contentEl.empty();
  }
};
var FlashcardEditModal = class extends import_obsidian.Modal {
  constructor(app, card, onSubmit) {
    var _a, _b;
    super(app);
    this.card = card;
    this.onSubmit = onSubmit;
    this.question = card.question;
    this.answer = card.answer;
    this.deck = card.deck;
    this.tags = card.tags.join(", ");
    this.title = cardTitle(card);
    this.color = card.color;
    this.sourceText = (_b = (_a = card.source) == null ? void 0 : _a.text) != null ? _b : "";
  }
  onOpen() {
    this.modalEl.addClass("kr-edit-modal");
    this.setTitle("\u7F16\u8F91\u95EA\u5361");
    if (this.card.kind !== "image") new import_obsidian.Setting(this.contentEl).setName("\u5173\u952E\u8BCD\u6807\u9898").addText((input) => input.setValue(this.title).onChange((value) => {
      this.title = value;
    }));
    new import_obsidian.Setting(this.contentEl).setName("\u5361\u7247\u5E95\u8272").addDropdown((input) => {
      for (const color of COLORS) input.addOption(color, colorLabel(color));
      input.setValue(this.color).onChange((value) => {
        this.color = value;
      });
    });
    this.contentEl.createEl("p", { text: "\u8FD9\u91CC\u53EA\u4FEE\u6539\u95EA\u5361\u5185\u5BB9\uFF0C\u4E0D\u4F1A\u66F4\u6539\u539F\u6587\u7B14\u8BB0\u3002", cls: "setting-item-description" });
    new import_obsidian.Setting(this.contentEl).setName(this.card.kind === "image" ? "\u56FE\u7247\u5361\u6807\u9898" : "\u95EE\u9898\uFF0F\u6316\u7A7A\u5185\u5BB9").addTextArea((input) => input.setValue(this.question).onChange((value) => {
      this.question = value;
    }));
    if (this.card.kind !== "image") {
      new import_obsidian.Setting(this.contentEl).setName("\u7B54\u6848").addTextArea((input) => input.setValue(this.answer).onChange((value) => {
        this.answer = value;
      }));
    }
    new import_obsidian.Setting(this.contentEl).setName("\u5361\u7EC4").addText((input) => input.setValue(this.deck).onChange((value) => {
      this.deck = value;
    }));
    new import_obsidian.Setting(this.contentEl).setName("\u6807\u7B7E").addText((input) => input.setValue(this.tags).onChange((value) => {
      this.tags = value;
    }));
    if (this.card.source && this.card.kind !== "image") new import_obsidian.Setting(this.contentEl).setName("\u6765\u6E90\u539F\u6587\u7247\u6BB5").setDesc("\u4EC5\u7528\u4E8E\u5B9A\u4F4D\uFF1B\u586B\u5199\u539F\u7B14\u8BB0\u4E2D\u786E\u5B9E\u5B58\u5728\u7684\u6587\u5B57\uFF0C\u4E0D\u4F1A\u66F4\u6539\u7B14\u8BB0\u3002").addTextArea((input) => input.setValue(this.sourceText).onChange((value) => {
      this.sourceText = value;
    }));
    new import_obsidian.Setting(this.contentEl).addButton((button) => button.setCta().setButtonText("\u4FDD\u5B58\u4FEE\u6539").onClick(() => {
      if (!this.question.trim() || !this.deck.trim()) {
        new import_obsidian.Notice("\u6807\u9898\u548C\u5361\u7EC4\u4E0D\u80FD\u4E3A\u7A7A\u3002");
        return;
      }
      this.close();
      this.onSubmit({
        question: this.question,
        answer: this.answer,
        deck: this.deck,
        tags: this.tags.split(/[,，\s]+/).map((tag) => tag.replace(/^#/, "").trim()).filter(Boolean),
        occlusions: this.card.occlusions,
        title: this.card.kind === "image" ? void 0 : this.title,
        color: this.color,
        source: this.card.source ? { ...this.card.source, text: this.sourceText || this.card.source.text } : void 0
      });
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};
var DeleteFlashcardModal = class extends import_obsidian.Modal {
  constructor(app, card, onConfirm) {
    super(app);
    this.card = card;
    this.onConfirm = onConfirm;
  }
  onOpen() {
    this.setTitle("\u5220\u9664\u95EA\u5361");
    this.contentEl.createEl("p", { text: `\u786E\u5B9A\u5220\u9664\u300C${this.card.question.slice(0, 60)}\u300D\u548C\u5B83\u7684\u590D\u4E60\u8BB0\u5F55\u5417\uFF1F\u539F\u6587\u7B14\u8BB0\u4E0D\u4F1A\u6539\u52A8\u3002` });
    new import_obsidian.Setting(this.contentEl).addButton((button) => button.setButtonText("\u53D6\u6D88").onClick(() => this.close())).addButton((button) => button.setWarning().setButtonText("\u5220\u9664\u95EA\u5361").onClick(() => {
      this.close();
      this.onConfirm();
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};
function placeBox(el, box) {
  el.style.left = `${box.x * 100}%`;
  el.style.top = `${box.y * 100}%`;
  el.style.width = `${box.width * 100}%`;
  el.style.height = `${box.height * 100}%`;
}
var FlashcardMetaModal = class extends import_obsidian.Modal {
  constructor(app, defaults, titleText, showCount, onSubmit) {
    super(app);
    this.titleText = titleText;
    this.showCount = showCount;
    this.onSubmit = onSubmit;
    this.value = { ...defaults };
  }
  onOpen() {
    this.setTitle(this.titleText);
    new import_obsidian.Setting(this.contentEl).setName("\u5361\u7EC4").addText((text) => text.setValue(this.value.deck).onChange((value) => {
      this.value.deck = value;
    }));
    new import_obsidian.Setting(this.contentEl).setName("\u6807\u7B7E").setDesc("\u591A\u4E2A\u6807\u7B7E\u7528\u9017\u53F7\u6216\u7A7A\u683C\u5206\u9694\u3002").addText((text) => text.setPlaceholder("N2, \u9605\u8BFB").onChange((value) => {
      this.value.tags = value;
    }));
    new import_obsidian.Setting(this.contentEl).setName("\u989C\u8272").addDropdown((dropdown) => {
      for (const color of COLORS) dropdown.addOption(color, colorLabel(color));
      dropdown.setValue(this.value.color).onChange((value) => {
        this.value.color = value;
      });
    });
    new import_obsidian.Setting(this.contentEl).setName("\u590D\u4E60\u7B97\u6CD5").addDropdown((dropdown) => dropdown.addOption("fixed", "\u56FA\u5B9A\u827E\u5BBE\u6D69\u65AF\u95F4\u9694").addOption("adaptive", "\u52A8\u6001\u8C03\u6574\u95F4\u9694").setValue(this.value.algorithm).onChange((value) => {
      this.value.algorithm = value;
    }));
    if (this.showCount) {
      new import_obsidian.Setting(this.contentEl).setName("\u751F\u6210\u6570\u91CF").addText((text) => text.setValue(String(this.value.count)).setPlaceholder("5").onChange((value) => {
        const parsed = Number.parseInt(value, 10);
        if (Number.isFinite(parsed)) this.value.count = Math.max(1, Math.min(20, parsed));
      }));
    }
    new import_obsidian.Setting(this.contentEl).addButton((button) => button.setCta().setButtonText(this.showCount ? "\u8C03\u7528 AI \u751F\u6210" : "\u521B\u5EFA\u95EA\u5361").onClick(() => {
      if (!this.value.deck.trim()) return;
      this.close();
      this.onSubmit(this.value);
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};
var AIPreviewModal = class extends import_obsidian.Modal {
  constructor(app, drafts, onSubmit, context = "") {
    super(app);
    this.drafts = drafts;
    this.onSubmit = onSubmit;
    this.context = context;
  }
  onOpen() {
    this.modalEl.addClass("kr-ai-preview-modal");
    this.setTitle(`\u9884\u89C8 AI \u95EA\u5361\uFF08${this.drafts.length}\uFF09`);
    this.contentEl.createEl("p", { text: "\u53EF\u76F4\u63A5\u4FEE\u6539\u95EE\u9898\u548C\u7B54\u6848\uFF0C\u53D6\u6D88\u52FE\u9009\u7684\u5361\u7247\u4E0D\u4F1A\u4FDD\u5B58\u3002", cls: "setting-item-description" });
    if (this.context) this.contentEl.createEl("p", { text: this.context, cls: "kr-image-context" });
    const list = this.contentEl.createDiv({ cls: "kr-draft-list" });
    this.drafts.forEach((draft, index) => {
      const row = list.createDiv({ cls: "kr-draft" });
      new import_obsidian.Setting(row).setName(`\u95EA\u5361 ${index + 1}`).addToggle((toggle) => toggle.setValue(draft.selected).onChange((value) => {
        draft.selected = value;
      }));
      row.createEl("label", { text: "\u95EE\u9898" });
      const question = row.createEl("textarea", { text: draft.question });
      question.addEventListener("input", () => {
        draft.question = question.value;
      });
      row.createEl("label", { text: "\u7B54\u6848" });
      const answer = row.createEl("textarea", { text: draft.answer });
      answer.addEventListener("input", () => {
        draft.answer = answer.value;
      });
    });
    new import_obsidian.Setting(this.contentEl).addButton((button) => button.setButtonText("\u53D6\u6D88").onClick(() => this.close())).addButton((button) => button.setCta().setButtonText("\u4FDD\u5B58\u9009\u4E2D\u7684\u95EA\u5361").onClick(() => {
      const selected = this.drafts.filter((draft) => draft.selected && draft.question.trim() && draft.answer.trim());
      this.close();
      this.onSubmit(selected);
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};
function colorLabel(color) {
  var _a;
  return (_a = { blue: "\u84DD\u8272", green: "\u7EFF\u8272", yellow: "\u9EC4\u8272", red: "\u7EA2\u8272", purple: "\u7D2B\u8272", gray: "\u7070\u8272" }[color]) != null ? _a : color;
}

// src/review-view.ts
var import_obsidian2 = require("obsidian");
var REVIEW_VIEW_TYPE = "knowledge-review-view";
var ReviewView = class extends import_obsidian2.ItemView {
  constructor(leaf, host) {
    super(leaf);
    this.host = host;
    this.query = "";
    this.order = "newest";
    this.onlyDue = false;
    this.filters = { deck: "", tag: "", color: "" };
  }
  getViewType() {
    return REVIEW_VIEW_TYPE;
  }
  getDisplayText() {
    return `\u4ECA\u65E5\u590D\u4E60 (${this.host.getDueCards().length})`;
  }
  getIcon() {
    return "brain-circuit";
  }
  async onOpen() {
    this.render();
  }
  refresh() {
    this.render();
  }
  render() {
    const root = this.contentEl;
    root.empty();
    root.addClass("kr-review-view");
    const header = root.createDiv({ cls: "kr-review-title-row" });
    (0, import_obsidian2.setIcon)(header.createSpan(), "brain-circuit");
    header.createEl("h2", { text: "\u95EA\u5361\u590D\u4E60" });
    header.createSpan({ text: String(this.host.getDueCards().length), cls: "kr-due-badge" });
    const start = root.createEl("button", { text: "\u5F00\u59CB\u4ECA\u65E5\u590D\u4E60", cls: "mod-cta" });
    start.disabled = !this.host.getDueCards().length;
    start.addEventListener("click", () => this.nextDue());
    const toolbar = root.createDiv({ cls: "kr-library-toolbar" });
    const search = toolbar.createEl("input", { type: "search", placeholder: "\u641C\u7D22\u6807\u9898\u3001\u5185\u5BB9\u6216\u6807\u7B7E" });
    search.value = this.query;
    const sorting = toolbar.createEl("select", { attr: { "aria-label": "\u6392\u5E8F\u65B9\u5F0F" } });
    for (const [value, label] of [["newest", "\u521B\u5EFA\u65F6\u95F4\uFF1A\u65B0\u2192\u65E7"], ["oldest", "\u521B\u5EFA\u65F6\u95F4\uFF1A\u65E7\u2192\u65B0"], ["modified", "\u6700\u8FD1\u4FEE\u6539"], ["due", "\u6700\u8FD1\u5230\u671F"]]) sorting.createEl("option", { value, text: label });
    sorting.value = this.order;
    const dueLabel = toolbar.createEl("label");
    const dueCheck = dueLabel.createEl("input", { type: "checkbox" });
    dueCheck.checked = this.onlyDue;
    dueLabel.appendText("\u53EA\u770B\u5F85\u590D\u4E60");
    for (const [key, label, values] of [
      ["deck", "\u6240\u6709\u5361\u7EC4", unique(this.host.getAllCards().map((c) => c.deck))],
      ["tag", "\u6240\u6709\u6807\u7B7E", unique(this.host.getAllCards().flatMap((c) => c.tags))],
      ["color", "\u6240\u6709\u989C\u8272", unique(this.host.getAllCards().map((c) => c.color))]
    ]) {
      const select = toolbar.createEl("select", { attr: { "aria-label": label } });
      select.createEl("option", { value: "", text: label });
      for (const value of values) select.createEl("option", { value, text: value });
      select.value = this.filters[key];
      select.addEventListener("change", () => {
        this.filters[key] = select.value;
        renderGroups();
      });
    }
    const groups = root.createDiv({ cls: "kr-tag-library" });
    const renderGroups = () => {
      var _a, _b;
      groups.empty();
      const query = this.query.toLowerCase();
      const cards = this.host.getAllCards().filter((c) => (!this.onlyDue || !c.suspended && c.dueAt <= Date.now()) && (!this.filters.deck || c.deck === this.filters.deck) && (!this.filters.tag || c.tags.includes(this.filters.tag)) && (!this.filters.color || c.color === this.filters.color) && `${cardTitle(c)} ${c.question} ${c.answer} ${c.tags.join(" ")}`.toLowerCase().includes(query));
      cards.sort((a, b) => this.order === "oldest" ? a.createdAt - b.createdAt : this.order === "modified" ? b.updatedAt - a.updatedAt : this.order === "due" ? a.dueAt - b.dueAt : b.createdAt - a.createdAt);
      const tags = unique(cards.flatMap((c) => c.tags.length ? c.tags : ["\u672A\u5206\u7C7B"]));
      for (const tag of tags) {
        const section = groups.createEl("section", { cls: "kr-tag-section" });
        const members = cards.filter((c) => c.tags.length ? c.tags.includes(tag) : tag === "\u672A\u5206\u7C7B");
        section.createEl("h3", { text: `${tag} \xB7 ${members.length}` });
        const grid = section.createDiv({ cls: "kr-tile-grid" });
        for (const card of members) {
          const tile = grid.createDiv({ cls: `kr-card-tile kr-color-${card.color}`, attr: { role: "button", tabindex: "0" } });
          tile.createEl("strong", { text: cardTitle(card) });
          const preview = card.kind === "image" ? `\u56FE\u7247\u6316\u7A7A \xB7 ${(_b = (_a = card.occlusions) == null ? void 0 : _a.length) != null ? _b : 0} \u4E2A\u65B9\u5757` : card.question.replace(/\{\{c\d+::([\s\S]*?)\}\}/g, "\uFF3B\u2026\u2026\uFF3D").replace(/[#*`]/g, "");
          tile.createEl("p", { text: preview.slice(0, 160), cls: "kr-tile-preview" });
          const bottom = tile.createDiv({ cls: "kr-tile-bottom" });
          bottom.createSpan({ text: card.suspended ? "\u5DF2\u6682\u505C" : card.dueAt <= Date.now() ? "\u5F85\u590D\u4E60" : new Date(card.dueAt).toLocaleDateString(), cls: "kr-tile-due" });
          bottom.createSpan({ text: card.deck, cls: "kr-tile-deck" });
          const open = () => new CardDetailModal(this.app, this.host, card).open();
          tile.addEventListener("click", open);
          tile.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              open();
            }
          });
        }
      }
      if (!cards.length) groups.createEl("p", { text: "\u5F53\u524D\u6761\u4EF6\u4E0B\u6CA1\u6709\u95EA\u5361\u3002" });
    };
    search.addEventListener("input", () => {
      this.query = search.value;
      renderGroups();
    });
    sorting.addEventListener("change", () => {
      this.order = sorting.value;
      renderGroups();
    });
    dueCheck.addEventListener("change", () => {
      this.onlyDue = dueCheck.checked;
      renderGroups();
    });
    renderGroups();
    this.renderStats(root);
    this.renderForecast(root);
  }
  nextDue() {
    const card = this.host.getDueCards()[0];
    if (card) new CardDetailModal(this.app, this.host, card, () => this.nextDue()).open();
    else new import_obsidian2.Notice("\u4ECA\u5929\u7684\u590D\u4E60\u5DF2\u5B8C\u6210\u3002");
  }
  renderStats(parent) {
    var _a, _b;
    const section = parent.createDiv({ cls: "kr-stats" });
    section.createEl("h3", { text: "\u672C\u6708\u590D\u4E60\u65E5\u5386" });
    const now = /* @__PURE__ */ new Date(), year = now.getFullYear(), month = now.getMonth();
    const counts = /* @__PURE__ */ new Map();
    for (const log of this.host.getReviewLog()) {
      const date = new Date(log.reviewedAt);
      if (date.getFullYear() === year && date.getMonth() === month) counts.set(date.getDate(), ((_a = counts.get(date.getDate())) != null ? _a : 0) + 1);
    }
    section.createEl("p", { text: `${year}\u5E74${month + 1}\u6708 \xB7 \u5DF2\u590D\u4E60 ${Array.from(counts.values()).reduce((a, b) => a + b, 0)} \u6B21`, cls: "kr-stat-summary" });
    const calendar = section.createDiv({ cls: "kr-calendar" });
    for (const day of ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u65E5"]) calendar.createDiv({ text: day, cls: "kr-weekday" });
    for (let n = 0; n < (new Date(year, month, 1).getDay() + 6) % 7; n++) calendar.createDiv({ cls: "kr-day kr-day-empty" });
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      const count = (_b = counts.get(day)) != null ? _b : 0;
      const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
      const cell = calendar.createEl("button", { text: String(day), cls: `kr-day kr-heat-${level}`, attr: { "aria-label": `${day} \u65E5\u590D\u4E60 ${count} \u6B21` } });
      cell.title = `${day} \u65E5\u590D\u4E60 ${count} \u6B21`;
      cell.addEventListener("click", () => new import_obsidian2.Notice(`${month + 1}\u6708${day}\u65E5 \xB7 \u590D\u4E60 ${count} \u6B21`));
      if (startOfDay(new Date(year, month, day).getTime()) === startOfDay()) cell.addClass("is-today");
    }
    const legend = section.createDiv({ cls: "kr-heat-legend" });
    ["0 \u6B21", "1\u20132", "3\u20135", "6\u201310", "11+"].forEach((label, level) => legend.createSpan({ text: label, cls: `kr-heat-${level}` }));
  }
  renderForecast(parent) {
    const section = parent.createDiv({ cls: "kr-stats kr-forecast" });
    section.createEl("h3", { text: "\u672A\u6765 30 \u5929\u590D\u4E60\u6570\u91CF\u9884\u89C8" });
    section.createEl("p", { text: "\u84DD\u7EBF\uFF1A\u5DF2\u786E\u5B9A\u5230\u671F\u91CF\uFF1B\u6A59\u7EBF\uFF1A\u6BCF\u6B21\u90FD\u9009\u201C\u8BB0\u5F97\u201D\u65F6\u7684\u9884\u8BA1\u603B\u91CF\u3002\u903E\u671F\u5361\u8BA1\u5165\u4ECA\u5929\uFF1B\u5B9E\u9645\u8BC4\u5206\u4F1A\u6539\u53D8\u540E\u7EED\u5B89\u6392\u3002", cls: "kr-stat-summary" });
    const data = forecast(this.host.getAllCards(), this.host.getSettings());
    const totals = data.known.map((n, i) => n + data.projected[i]);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 600 220");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "\u672A\u676530\u5929\u95EA\u5361\u590D\u4E60\u6570\u91CF\u66F2\u7EBF");
    section.append(svg);
    const max = Math.max(1, ...totals), x = (i) => 40 + i * 540 / 29, y = (n) => 185 - n * 155 / max;
    const add = (tag, attrs, text) => {
      const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
      for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
      if (text) el.textContent = text;
      svg.append(el);
      return el;
    };
    for (const n of [0, Math.ceil(max / 2), max]) {
      add("line", { x1: "40", x2: "580", y1: String(y(n)), y2: String(y(n)), stroke: "var(--background-modifier-border)" });
      add("text", { x: "4", y: String(y(n) + 4), fill: "var(--text-muted)", "font-size": "12" }, String(n));
    }
    for (const [values, color] of [[totals, "#d77822"], [data.known, "#397ac9"]]) {
      add("polyline", { points: values.map((n, i) => `${x(i)},${y(n)}`).join(" "), fill: "none", stroke: color, "stroke-width": "2.5" });
      values.forEach((n, i) => {
        const dot = add("circle", { cx: String(x(i)), cy: String(y(n)), r: "3", fill: color });
        const title = document.createElementNS(svg.namespaceURI, "title");
        title.textContent = `${new Date(data.dates[i]).toLocaleDateString()}\uFF1A\u5DF2\u786E\u5B9A ${data.known[i]}\uFF1B\u9884\u8BA1\u603B\u91CF ${totals[i]}`;
        dot.append(title);
      });
    }
    for (const i of [0, 7, 14, 21, 29]) add("text", { x: String(x(i)), y: "208", "text-anchor": "middle", fill: "var(--text-muted)", "font-size": "12" }, new Date(data.dates[i]).toLocaleDateString(void 0, { month: "numeric", day: "numeric" }));
    const details = section.createEl("details");
    details.createEl("summary", { text: "\u67E5\u770B\u6BCF\u5929\u6570\u91CF" });
    const table = details.createEl("table");
    const head = table.createEl("tr");
    ["\u65E5\u671F", "\u5DF2\u786E\u5B9A", "\u9884\u8BA1\u603B\u91CF"].forEach((text) => head.createEl("th", { text }));
    data.dates.forEach((date, i) => {
      const row = table.createEl("tr");
      [new Date(date).toLocaleDateString(), String(data.known[i]), String(totals[i])].forEach((text) => row.createEl("td", { text }));
    });
  }
};
function unique(values) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
var CardDetailModal = class extends import_obsidian2.Modal {
  constructor(app, host, card, afterRating) {
    super(app);
    this.host = host;
    this.card = card;
    this.afterRating = afterRating;
    this.revealed = false;
    this.revealedBlanks = /* @__PURE__ */ new Set();
    this.component = new import_obsidian2.Component();
  }
  onOpen() {
    this.component.load();
    this.modalEl.addClass("kr-detail-modal");
    void this.render();
  }
  onClose() {
    this.component.unload();
    this.contentEl.empty();
  }
  async render() {
    var _a, _b, _c, _d;
    const card = this.card, root = this.contentEl;
    root.empty();
    this.setTitle(cardTitle(card));
    const cardEl = root.createDiv({ cls: `kr-flashcard kr-color-${card.color}` });
    if (card.dueAt > Date.now()) cardEl.createEl("p", { text: "\u63D0\u524D\u590D\u4E60\u5E76\u8BC4\u5206\u4F1A\u91CD\u65B0\u5B89\u6392\u4E0B\u6B21\u590D\u4E60\u65F6\u95F4\u3002", cls: "kr-stat-summary" });
    const questionEl = cardEl.createDiv({ cls: "kr-question markdown-rendered" });
    if (card.kind === "image") {
      this.renderImage(card, cardEl);
    } else if (card.kind === "cloze") await this.renderCloze(card, questionEl, cardEl);
    else await import_obsidian2.MarkdownRenderer.render(this.app, card.question, questionEl, (_b = (_a = card.source) == null ? void 0 : _a.path) != null ? _b : "", this.component);
    if (card.kind === "qa") {
      if (!this.revealed) cardEl.createEl("button", { text: "\u663E\u793A\u7B54\u6848", cls: "kr-reveal mod-cta" }).addEventListener("click", () => {
        this.revealed = true;
        void this.render();
      });
      else {
        const answer = cardEl.createDiv({ cls: "kr-answer markdown-rendered" });
        await import_obsidian2.MarkdownRenderer.render(this.app, card.answer, answer, (_d = (_c = card.source) == null ? void 0 : _c.path) != null ? _d : "", this.component);
      }
    }
    if (this.revealed || this.revealedBlanks.size) this.ensureRatingActions(cardEl, card);
    const meta = cardEl.createDiv({ cls: "kr-card-meta" });
    if (card.source) meta.createEl("button", { text: `\u6765\u6E90\uFF1A${card.source.path}`, cls: "kr-source-button" }).addEventListener("click", () => {
      this.close();
      void this.host.openCardSource(card).catch((error) => new import_obsidian2.Notice(String(error)));
    });
    meta.createSpan({ text: card.deck, cls: "kr-tile-deck" });
    const controls = root.createDiv({ cls: "kr-detail-controls" });
    controls.createEl("button", { text: "\u7F16\u8F91\u5185\u5BB9" }).addEventListener("click", () => {
      new FlashcardEditModal(this.app, card, (changes) => {
        void this.host.updateCard(card.id, changes).then(() => {
          this.revealed = false;
          this.revealedBlanks.clear();
          void this.render();
        }).catch((error) => new import_obsidian2.Notice(String(error)));
      }).open();
    });
    if (card.kind === "image") controls.createEl("button", { text: "\u8C03\u6574\u65B9\u5757" }).addEventListener("click", () => {
      void this.editImageBoxes();
    });
    controls.createEl("button", { text: "\u5220\u9664" }).addEventListener("click", () => {
      new DeleteFlashcardModal(this.app, card, () => {
        void this.host.deleteCard(card.id).then(() => this.close()).catch((error) => new import_obsidian2.Notice(String(error)));
      }).open();
    });
  }
  async editImageBoxes() {
    var _a;
    const card = this.card, source = this.app.vault.getAbstractFileByPath((_a = card.imagePath) != null ? _a : "");
    if (!(source instanceof import_obsidian2.TFile)) {
      new import_obsidian2.Notice("\u627E\u4E0D\u5230\u539F\u56FE\u3002");
      return;
    }
    const data = await this.app.vault.readBinary(source);
    const type = source.extension === "png" ? "image/png" : source.extension === "webp" ? "image/webp" : "image/jpeg";
    new ImageOcclusionModal(this.app, new File([data], source.name, { type }), (title, boxes) => {
      void this.host.updateCard(card.id, { question: title || card.question, answer: card.answer, deck: card.deck, tags: card.tags, color: card.color, occlusions: boxes }).then(() => {
        this.revealedBlanks.clear();
        void this.render();
      }).catch((error) => new import_obsidian2.Notice(String(error)));
    }, card.occlusions, card.question).open();
  }
  async renderCloze(card, target, cardEl) {
    var _a, _b, _c, _d;
    const answers = [];
    const source = card.question.replace(/\{\{c\d+::([\s\S]*?)\}\}/g, (_match, answer) => {
      const index = answers.push(answer) - 1;
      return `KRBLANKTOKEN${index}END`;
    });
    await import_obsidian2.MarkdownRenderer.render(this.app, source, target, (_b = (_a = card.source) == null ? void 0 : _a.path) != null ? _b : "", this.component);
    const nodes = [];
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const text = (_c = node.textContent) != null ? _c : "";
      const regex = /KRBLANKTOKEN(\d+)END/g;
      if (!regex.test(text)) continue;
      regex.lastIndex = 0;
      const fragment = document.createDocumentFragment();
      let last = 0;
      for (const match of text.matchAll(regex)) {
        const offset = (_d = match.index) != null ? _d : 0;
        fragment.append(document.createTextNode(text.slice(last, offset)));
        const index = Number(match[1]);
        const blank = document.createElement("button");
        blank.type = "button";
        blank.className = "kr-inline-blank";
        const reveal = () => {
          blank.textContent = answers[index];
          blank.addClass("is-revealed");
          blank.setAttribute("aria-label", `\u6316\u7A7A ${index + 1}\uFF1A${answers[index]}`);
          this.revealedBlanks.add(index);
          this.ensureRatingActions(cardEl, card);
        };
        blank.textContent = this.revealedBlanks.has(index) ? answers[index] : "\u70B9\u51FB\u663E\u793A";
        blank.setAttribute("aria-label", `\u663E\u793A\u6316\u7A7A ${index + 1}`);
        if (this.revealedBlanks.has(index)) blank.addClass("is-revealed");
        blank.addEventListener("click", reveal);
        fragment.append(blank);
        last = offset + match[0].length;
      }
      fragment.append(document.createTextNode(text.slice(last)));
      node.replaceWith(fragment);
    }
  }
  renderImage(card, cardEl) {
    var _a, _b;
    const file = this.app.vault.getAbstractFileByPath((_a = card.imagePath) != null ? _a : "");
    if (!(file instanceof import_obsidian2.TFile)) {
      cardEl.createEl("p", { text: "\u627E\u4E0D\u5230\u8FD9\u5F20\u95EA\u5361\u7684\u539F\u56FE\uFF0C\u8BF7\u68C0\u67E5\u4ED3\u5E93\u4E2D\u7684\u56FE\u7247\u6587\u4EF6\u3002", cls: "kr-error" });
      return;
    }
    const stage = cardEl.createDiv({ cls: "kr-image-stage kr-review-image" });
    stage.createEl("img", { attr: { src: this.app.vault.getResourcePath(file), alt: card.question, draggable: "false" } });
    const overlay = stage.createDiv({ cls: "kr-image-overlay" });
    ((_b = card.occlusions) != null ? _b : []).forEach((box, index) => {
      const blank = overlay.createEl("button", { cls: "kr-review-box", attr: { type: "button", "aria-label": `\u663E\u793A\u65B9\u5757 ${index + 1}` } });
      blank.style.left = `${box.x * 100}%`;
      blank.style.top = `${box.y * 100}%`;
      blank.style.width = `${box.width * 100}%`;
      blank.style.height = `${box.height * 100}%`;
      if (this.revealedBlanks.has(index)) blank.addClass("is-revealed");
      blank.addEventListener("click", () => {
        blank.addClass("is-revealed");
        blank.setAttribute("aria-label", `\u65B9\u5757 ${index + 1} \u5DF2\u663E\u793A`);
        this.revealedBlanks.add(index);
        this.ensureRatingActions(cardEl, card);
      });
    });
  }
  ensureRatingActions(cardEl, card) {
    if (cardEl.querySelector(".kr-rating-actions")) return;
    const actions = cardEl.createDiv({ cls: "kr-rating-actions" });
    this.ratingButton(actions, "\u5FD8\u8BB0", "again", card);
    this.ratingButton(actions, "\u56F0\u96BE", "hard", card);
    this.ratingButton(actions, "\u8BB0\u5F97", "good", card);
  }
  ratingButton(parent, text, rating, card) {
    const button = parent.createEl("button", { text, cls: `kr-rating-${rating}` });
    button.addEventListener("click", () => {
      parent.querySelectorAll("button").forEach((el) => {
        el.disabled = true;
      });
      void this.host.rateCard(card.id, rating).then(() => {
        var _a;
        this.close();
        (_a = this.afterRating) == null ? void 0 : _a.call(this);
      }).catch((error) => {
        new import_obsidian2.Notice(String(error));
        parent.querySelectorAll("button").forEach((el) => {
          el.disabled = false;
        });
      });
    });
  }
};

// src/settings.ts
var import_obsidian3 = require("obsidian");
var KnowledgeReviewSettingTab = class extends import_obsidian3.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Knowledge Review \u8BBE\u7F6E" });
    containerEl.createEl("p", {
      text: "\u95EA\u5361\u4E0E\u590D\u4E60\u8BB0\u5F55\u4FDD\u5B58\u5728\u672C\u673A\u63D2\u4EF6\u76EE\u5F55\u7684 data.json\u3002\u66F4\u65B0\u65F6\u4E0D\u8981\u5220\u9664\u8FD9\u4E2A\u6587\u4EF6\u6216\u5378\u8F7D\u91CD\u88C5\u63D2\u4EF6\uFF1B\u4E0A\u4F20 GitHub \u65F6\u4E5F\u4E0D\u8981\u516C\u5F00\u5B83\u3002",
      cls: "kr-data-warning"
    });
    containerEl.createEl("h3", { text: "AI \u81EA\u52A8\u51FA\u9898" });
    containerEl.createEl("p", {
      text: "\u53EF\u4E00\u952E\u4F7F\u7528\u667A\u8C31\u514D\u8D39\u6A21\u578B\u3001DeepSeek \u4F4E\u4EF7\u6A21\u578B\u6216\u81EA\u5B9A\u4E49\u517C\u5BB9\u63A5\u53E3\u3002\u5BC6\u94A5\u53EA\u4FDD\u5B58\u5728\u672C\u5730\u63D2\u4EF6\u6570\u636E\u4E2D\u3002",
      cls: "setting-item-description"
    });
    new import_obsidian3.Setting(containerEl).setName("\u63A5\u53E3\u9884\u8BBE").setDesc("\u9009\u62E9\u9884\u8BBE\u4F1A\u81EA\u52A8\u586B\u5199\u63A5\u53E3\u5730\u5740\u548C\u6A21\u578B\uFF0C\u4E0D\u4F1A\u5220\u9664\u5DF2\u586B\u5199\u7684 API \u5BC6\u94A5\u3002").addButton((button) => button.setCta().setButtonText("\u667A\u8C31\u514D\u8D39").onClick(async () => {
      this.plugin.store.settings.aiBaseUrl = "https://open.bigmodel.cn/api/paas/v4";
      this.plugin.store.settings.aiModel = "glm-4-flash-250414";
      await this.plugin.saveStore();
      this.display();
      new import_obsidian3.Notice("\u5DF2\u5207\u6362\u5230\u667A\u8C31 GLM-4-Flash \u514D\u8D39\u6A21\u578B\u3002");
    })).addButton((button) => button.setButtonText("DeepSeek").onClick(async () => {
      this.plugin.store.settings.aiBaseUrl = "https://api.deepseek.com";
      this.plugin.store.settings.aiModel = "deepseek-flash";
      await this.plugin.saveStore();
      this.display();
      new import_obsidian3.Notice("\u5DF2\u5207\u6362\u5230 DeepSeek Flash\uFF1B\u8BF7\u586B\u5199 DeepSeek API Key\u3002");
    })).addButton((button) => button.setButtonText("OpenAI").onClick(async () => {
      this.plugin.store.settings.aiBaseUrl = "https://api.openai.com/v1";
      this.plugin.store.settings.aiModel = "gpt-5.6-luna";
      await this.plugin.saveStore();
      this.display();
      new import_obsidian3.Notice("\u5DF2\u5207\u6362\u5230 OpenAI\uFF1B\u8BF7\u586B\u5199 OpenAI API Key\u3002");
    }));
    new import_obsidian3.Setting(containerEl).setName("\u517C\u5BB9\u63A5\u53E3\u5730\u5740").setDesc("\u901A\u5E38\u7531\u4E0A\u65B9\u9884\u8BBE\u81EA\u52A8\u586B\u5199\uFF0C\u4E5F\u53EF\u4EE5\u624B\u52A8\u8F93\u5165\u517C\u5BB9\u63A5\u53E3\u7684\u7248\u672C\u6839\u5730\u5740\u3002").addText((text) => text.setValue(this.plugin.store.settings.aiBaseUrl).onChange(async (value) => {
      this.plugin.store.settings.aiBaseUrl = value.trim();
      await this.plugin.saveStore();
    }));
    new import_obsidian3.Setting(containerEl).setName("\u6A21\u578B\u540D\u79F0").setDesc("\u667A\u8C31\u514D\u8D39\u6A21\u578B\uFF1Aglm-4-flash-250414\uFF1BDeepSeek\uFF1Adeepseek-flash\u3002").addText((text) => text.setValue(this.plugin.store.settings.aiModel).onChange(async (value) => {
      this.plugin.store.settings.aiModel = value.trim();
      await this.plugin.saveStore();
    }));
    new import_obsidian3.Setting(containerEl).setName("API \u5BC6\u94A5").addText((text) => {
      text.inputEl.type = "password";
      text.setValue(this.plugin.store.settings.aiApiKey).onChange(async (value) => {
        this.plugin.store.settings.aiApiKey = value.trim();
        await this.plugin.saveStore();
      });
    });
    new import_obsidian3.Setting(containerEl).setName("\u6D4B\u8BD5 AI \u8FDE\u63A5").setDesc("\u4F7F\u7528\u5F53\u524D\u5730\u5740\u3001\u6A21\u578B\u548C\u5BC6\u94A5\u53D1\u9001\u4E00\u4E2A\u6700\u5C0F\u6D4B\u8BD5\u8BF7\u6C42\u3002").addButton((button) => button.setButtonText("\u6D4B\u8BD5\u8FDE\u63A5").onClick(async () => {
      button.setDisabled(true).setButtonText("\u6D4B\u8BD5\u4E2D\u2026");
      try {
        await testAIConnection(this.plugin.store.settings);
        new import_obsidian3.Notice("AI \u8FDE\u63A5\u6210\u529F\u3002");
      } catch (error) {
        new import_obsidian3.Notice(error instanceof Error ? error.message : "AI \u8FDE\u63A5\u5931\u8D25\u3002", 1e4);
      } finally {
        button.setDisabled(false).setButtonText("\u6D4B\u8BD5\u8FDE\u63A5");
      }
    }));
    containerEl.createEl("h3", { text: "\u6458\u5F55\u5E93" });
    new import_obsidian3.Setting(containerEl).setName("\u6458\u5F55\u5E93\u6587\u4EF6").setDesc("\u65B0\u6458\u5F55\u4F1A\u81EA\u52A8\u8FFD\u52A0\u5230\u8FD9\u4E2A Markdown \u6587\u4EF6\u4E2D\u3002").addText((text) => text.setValue(this.plugin.store.settings.excerptLibraryPath).setPlaceholder("\u6458\u5F55\u5E93.md").onChange(async (value) => {
      const trimmed = value.trim();
      this.plugin.store.settings.excerptLibraryPath = trimmed || "\u6458\u5F55\u5E93.md";
      await this.plugin.saveStore();
    }));
    new import_obsidian3.Setting(containerEl).setName("\u9ED8\u8BA4\u751F\u6210\u6570\u91CF").addSlider((slider) => slider.setLimits(1, 20, 1).setDynamicTooltip().setValue(this.plugin.store.settings.aiCardCount).onChange(async (value) => {
      this.plugin.store.settings.aiCardCount = value;
      await this.plugin.saveStore();
    }));
    containerEl.createEl("h3", { text: "\u590D\u4E60\u8BA1\u5212" });
    new import_obsidian3.Setting(containerEl).setName("\u56FA\u5B9A\u590D\u4E60\u95F4\u9694").setDesc("\u4EE5\u5929\u4E3A\u5355\u4F4D\uFF0C\u7528\u9017\u53F7\u5206\u9694\uFF1B0 \u8868\u793A\u521B\u5EFA\u5F53\u5929\u3002").addText((text) => text.setValue(this.plugin.store.settings.fixedIntervals.join(", ")).onChange(async (value) => {
      const parsed = value.split(/[,，\s]+/).map(Number).filter((n) => Number.isFinite(n) && n >= 0);
      if (parsed.length) {
        this.plugin.store.settings.fixedIntervals = parsed;
        await this.plugin.saveStore();
      }
    }));
    new import_obsidian3.Setting(containerEl).setName("\u9ED8\u8BA4\u7B97\u6CD5").addDropdown((dropdown) => dropdown.addOption("fixed", "\u56FA\u5B9A\u827E\u5BBE\u6D69\u65AF\u95F4\u9694").addOption("adaptive", "\u52A8\u6001\u8C03\u6574\u95F4\u9694").setValue(this.plugin.store.settings.defaultAlgorithm).onChange(async (value) => {
      this.plugin.store.settings.defaultAlgorithm = value === "adaptive" ? "adaptive" : "fixed";
      await this.plugin.saveStore();
    }));
    new import_obsidian3.Setting(containerEl).setName("\u9ED8\u8BA4\u5361\u7EC4").addText((text) => text.setValue(this.plugin.store.settings.defaultDeck).onChange(async (value) => {
      this.plugin.store.settings.defaultDeck = value.trim() || "\u9ED8\u8BA4\u5361\u7EC4";
      await this.plugin.saveStore();
    }));
    new import_obsidian3.Setting(containerEl).setName("\u542F\u52A8\u65F6\u63D0\u9192").setDesc("\u6253\u5F00 Obsidian \u65F6\uFF0C\u5982\u679C\u6709\u5230\u671F\u5361\u7247\u5219\u663E\u793A\u63D0\u9192\u3002").addToggle((toggle) => toggle.setValue(this.plugin.store.settings.startupReminder).onChange(async (value) => {
      this.plugin.store.settings.startupReminder = value;
      await this.plugin.saveStore();
    }));
  }
};

// src/types.ts
var DEFAULT_SETTINGS = {
  aiBaseUrl: "https://open.bigmodel.cn/api/paas/v4",
  aiApiKey: "",
  aiModel: "glm-4-flash-250414",
  aiCardCount: 5,
  fixedIntervals: [0, 1, 2, 4, 7, 15, 30],
  defaultAlgorithm: "fixed",
  defaultDeck: "\u9ED8\u8BA4\u5361\u7EC4",
  excerptLibraryPath: "\u6458\u5F55\u5E93.md",
  startupReminder: true
};

// src/main.ts
var KnowledgeReviewPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.store = { settings: { ...DEFAULT_SETTINGS }, cards: [], reviewLog: [] };
    this.excerptChildren = /* @__PURE__ */ new Set();
  }
  async onload() {
    await this.loadStore();
    this.registerView(REVIEW_VIEW_TYPE, (leaf) => new ReviewView(leaf, this));
    this.addRibbonIcon("brain-circuit", "\u6253\u5F00\u4ECA\u65E5\u590D\u4E60", () => {
      void this.activateReviewView();
    });
    this.addSettingTab(new KnowledgeReviewSettingTab(this.app, this));
    this.registerMarkdownCodeBlockProcessor("knowledge-card", (source, el, ctx) => {
      const spec = parseExcerpt(source);
      if (!spec) {
        el.createEl("div", { text: "\u77E5\u8BC6\u6458\u5F55\u914D\u7F6E\u65E0\u6548\uFF1A\u7F3A\u5C11 source\u3002", cls: "kr-error" });
        return;
      }
      ctx.addChild(new ExcerptRenderChild(el, this, spec, ctx.sourcePath));
    });
    this.registerEvent(this.app.vault.on("modify", (file) => {
      if (file instanceof import_obsidian4.TFile && file.extension === "md") {
        for (const child of this.excerptChildren) void child.refreshIfSource(file);
      }
    }));
    this.addCommand({
      id: "copy-selection-as-knowledge-card",
      name: "\u5C06\u6240\u9009\u5185\u5BB9\u6458\u5F55\u5230\u6458\u5F55\u5E93",
      callback: () => this.withActiveEditor((editor, file) => {
        void this.openExcerptCreator(editor, file);
      })
    });
    this.addCommand({
      id: "insert-manual-knowledge-card",
      name: "\u624B\u52A8\u63D2\u5165\u77E5\u8BC6\u6458\u5F55\u5361\u7247",
      callback: () => this.withActiveEditor((editor) => {
        new ManualExcerptModal(this.app, (spec) => editor.replaceSelection(`${serializeExcerpt(spec)}
`)).open();
      })
    });
    this.addCommand({
      id: "create-cloze-flashcard",
      name: "\u5C06\u9009\u533A\u5185\u7684\u9AD8\u4EAE\u521B\u5EFA\u4E3A\u591A\u6316\u7A7A\u95EA\u5361",
      callback: () => this.withActiveEditor((editor, file) => this.openClozeCreator(editor, file))
    });
    this.addCommand({
      id: "generate-ai-cloze-flashcard",
      name: "\u4ECE\u6240\u9009\u5185\u5BB9 AI \u751F\u6210\u591A\u6316\u7A7A\u95EA\u5361",
      callback: () => this.withActiveEditor((editor, file) => this.openAIClozeCreator(editor, file))
    });
    this.addCommand({
      id: "generate-ai-flashcards",
      name: "\u4ECE\u6240\u9009\u5185\u5BB9\u751F\u6210 AI \u95EE\u7B54\u95EA\u5361",
      callback: () => this.withActiveEditor((editor, file) => this.openAICreator(editor, file))
    });
    this.addCommand({ id: "create-image-occlusion", name: "\u5BFC\u5165\u56FE\u7247\u5E76\u753B\u65B9\u5757\u6316\u7A7A\u95EA\u5361", callback: () => this.openImageOcclusionCreator() });
    this.addCommand({ id: "open-review-center", name: "\u6253\u5F00\u4ECA\u65E5\u590D\u4E60\u4E2D\u5FC3", callback: () => {
      void this.activateReviewView();
    } });
    this.app.workspace.onLayoutReady(() => {
      if (this.store.settings.startupReminder) {
        const count = this.getDueCards().length;
        if (count > 0) new import_obsidian4.Notice(`\u4ECA\u5929\u6709 ${count} \u5F20\u95EA\u5361\u5F85\u590D\u4E60\u3002`, 7e3);
      }
    });
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(REVIEW_VIEW_TYPE);
  }
  async loadStore() {
    var _a, _b, _c;
    const saved = await this.loadData();
    this.store = {
      settings: { ...DEFAULT_SETTINGS, ...(_a = saved == null ? void 0 : saved.settings) != null ? _a : {} },
      cards: Array.isArray(saved == null ? void 0 : saved.cards) ? saved.cards : [],
      reviewLog: Array.isArray(saved == null ? void 0 : saved.reviewLog) ? saved.reviewLog : [],
      imageTitleCounter: (_c = saved == null ? void 0 : saved.imageTitleCounter) != null ? _c : Math.max(0, ...((_b = saved == null ? void 0 : saved.cards) != null ? _b : []).filter((c) => c.kind === "image" && /^\d+$/.test(c.question)).map((c) => Number(c.question)))
    };
  }
  async saveStore() {
    await this.saveData(this.store);
    this.refreshReviewViews();
  }
  getDueCards() {
    return this.store.cards.filter((card) => !card.suspended && card.dueAt <= Date.now()).sort((a, b) => a.dueAt - b.dueAt);
  }
  getAllCards() {
    return this.store.cards;
  }
  getReviewLog() {
    return this.store.reviewLog;
  }
  getSettings() {
    return this.store.settings;
  }
  selectionSource(editor, file) {
    const at = editor.getCursor("from");
    return { path: file.path, text: editor.getSelection(), line: at.line, ch: at.ch, heading: nearestHeading(editor, at.line) };
  }
  async imageNoteSource(imagePath, title, activeNote) {
    let note = activeNote;
    if (!note) {
      await this.ensureFolder("Knowledge Review");
      const path = "Knowledge Review/\u56FE\u7247\u95EA\u5361\u6765\u6E90.md";
      const existing = this.app.vault.getAbstractFileByPath(path);
      note = existing instanceof import_obsidian4.TFile ? existing : await this.app.vault.create(path, "# \u56FE\u7247\u95EA\u5361\u6765\u6E90\n");
    }
    const blockId = uid("krimage");
    await this.app.vault.append(note, `

## ${title.replace(/\n/g, " ")}

![[${imagePath}]]
^${blockId}
`);
    return { path: note.path, blockId };
  }
  async openCardSource(card) {
    var _a, _b, _c, _d, _e;
    if (card.kind === "image" && (!card.source || card.source.path === card.imagePath)) {
      card.source = await this.imageNoteSource((_a = card.imagePath) != null ? _a : "", card.question, null);
      await this.saveStore();
    }
    const source = card.source;
    if (!source) {
      new import_obsidian4.Notice("\u8FD9\u5F20\u5361\u6CA1\u6709\u8BB0\u5F55\u6765\u6E90\u3002");
      return;
    }
    const file = this.app.vault.getAbstractFileByPath(source.path);
    if (!(file instanceof import_obsidian4.TFile) || file.extension !== "md") {
      new import_obsidian4.Notice("\u627E\u4E0D\u5230\u6765\u6E90\u7B14\u8BB0\u3002");
      return;
    }
    const text = await this.app.vault.read(file);
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: "markdown", active: true, state: { file: file.path, mode: "source" } });
    if (!(leaf.view instanceof import_obsidian4.MarkdownView)) return;
    let at = -1;
    let length = 0;
    if (source.blockId) at = text.indexOf(`^${source.blockId}`);
    if (source.marker) at = text.indexOf(`<!--kr:start:${source.marker}-->`);
    const quote = source.text || (card.kind === "cloze" ? card.question.replace(/\{\{c\d+::([\s\S]*?)\}\}/g, "==$1==") : "");
    if (at < 0 && quote) {
      const expected = text.split("\n").slice(0, (_b = source.line) != null ? _b : 0).join("\n").length + ((_c = source.ch) != null ? _c : 0);
      const matches = [];
      let found = text.indexOf(quote);
      while (found >= 0) {
        matches.push(found);
        found = text.indexOf(quote, found + Math.max(1, quote.length));
      }
      matches.sort((a, b) => Math.abs(a - expected) - Math.abs(b - expected));
      at = (_d = matches[0]) != null ? _d : -1;
      length = quote.length;
    }
    if (at >= 0) {
      const from = leaf.view.editor.offsetToPos(at);
      const to = leaf.view.editor.offsetToPos(at + length);
      leaf.view.editor.setSelection(from, to);
      leaf.view.editor.scrollIntoView({ from, to }, true);
    } else if (source.line !== void 0) {
      const pos = { line: Math.min(source.line, leaf.view.editor.lineCount() - 1), ch: (_e = source.ch) != null ? _e : 0 };
      leaf.view.editor.setCursor(pos);
      leaf.view.editor.scrollIntoView({ from: pos, to: pos }, true);
      new import_obsidian4.Notice("\u539F\u6587\u5DF2\u6539\u53D8\uFF0C\u5DF2\u8DF3\u5230\u521B\u5EFA\u65F6\u8BB0\u5F55\u7684\u884C\u3002");
    } else {
      new import_obsidian4.Notice("\u65E7\u5361\u6CA1\u6709\u51C6\u786E\u4F4D\u7F6E\u3002\u53EF\u5728\u7F16\u8F91\u7A97\u53E3\u586B\u5199\u6765\u6E90\u539F\u6587\u7247\u6BB5\uFF0C\u518D\u70B9\u51FB\u6765\u6E90\u3002", 8e3);
    }
    this.app.workspace.revealLeaf(leaf);
  }
  async rateCard(cardId, rating) {
    const index = this.store.cards.findIndex((card) => card.id === cardId);
    if (index < 0) return;
    const previous = this.store.cards[index];
    const next = scheduleReview(previous, rating, this.store.settings);
    this.store.cards[index] = next;
    this.store.reviewLog.push({ id: uid("log"), cardId, reviewedAt: Date.now(), rating, previousDueAt: previous.dueAt, nextDueAt: next.dueAt });
    await this.saveStore();
  }
  async updateCard(cardId, changes) {
    var _a, _b;
    const card = this.store.cards.find((item) => item.id === cardId);
    if (!card) throw new Error("\u627E\u4E0D\u5230\u95EA\u5361\u3002");
    if (!changes.question.trim() || !changes.deck.trim()) throw new Error("\u6807\u9898\u548C\u5361\u7EC4\u4E0D\u80FD\u4E3A\u7A7A\u3002");
    card.question = changes.question.trim();
    card.answer = changes.answer.trim();
    card.title = ((_a = changes.title) == null ? void 0 : _a.trim()) || void 0;
    if (changes.color) card.color = changes.color;
    if (changes.source) card.source = changes.source;
    if (card.kind !== "image") card.kind = /\{\{c\d+::[^{}]+\}\}/.test(card.question) ? "cloze" : "qa";
    card.deck = changes.deck.trim();
    card.tags = changes.tags;
    if (card.kind === "image" && ((_b = changes.occlusions) == null ? void 0 : _b.length)) card.occlusions = changes.occlusions;
    card.updatedAt = Date.now();
    await this.saveStore();
  }
  async deleteCard(cardId) {
    this.store.cards = this.store.cards.filter((card) => card.id !== cardId);
    this.store.reviewLog = this.store.reviewLog.filter((log) => log.cardId !== cardId);
    await this.saveStore();
  }
  registerExcerpt(child) {
    this.excerptChildren.add(child);
  }
  unregisterExcerpt(child) {
    this.excerptChildren.delete(child);
  }
  refreshReviewViews() {
    for (const leaf of this.app.workspace.getLeavesOfType(REVIEW_VIEW_TYPE)) {
      if (leaf.view instanceof ReviewView) leaf.view.refresh();
    }
  }
  async activateReviewView() {
    var _a;
    let leaf = this.app.workspace.getLeavesOfType(REVIEW_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = (_a = this.app.workspace.getRightLeaf(false)) != null ? _a : this.app.workspace.getLeaf(true);
      await leaf.setViewState({ type: REVIEW_VIEW_TYPE, active: true });
    }
    this.app.workspace.revealLeaf(leaf);
  }
  withActiveEditor(action) {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian4.MarkdownView);
    if (!view) {
      new import_obsidian4.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A Markdown \u6587\u4EF6\u5E76\u8FDB\u5165\u7F16\u8F91\u6A21\u5F0F\u3002");
      return;
    }
    action(view.editor, view.file);
  }
  async openExcerptCreator(editor, file) {
    if (!file) {
      new import_obsidian4.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A Markdown \u6587\u4EF6\u3002");
      return;
    }
    const selected = editor.getSelection();
    if (!selected.trim()) {
      new import_obsidian4.Notice("\u8BF7\u5148\u9009\u4E2D\u9700\u8981\u6458\u5F55\u7684\u4EFB\u610F\u5185\u5BB9\u3002");
      return;
    }
    const from = editor.getCursor("from");
    const to = editor.getCursor("to");
    const heading = nearestHeading(editor, from.line);
    new import_obsidian4.Notice("\u6B63\u5728\u4E3A\u6458\u5F55\u9009\u62E9\u5173\u952E\u8BCD\u2026", 4e3);
    let keyword;
    try {
      keyword = await suggestKeyword(this.store.settings, selected);
    } catch (error) {
      new import_obsidian4.Notice(error instanceof Error ? error.message : "AI \u5173\u952E\u8BCD\u9009\u62E9\u5931\u8D25\u3002", 9e3);
      return;
    }
    new ExcerptOptionsModal(this.app, heading != null ? heading : "", keyword, selected, (options) => {
      void this.createLinkedExcerpt(editor, file, from, to, selected, heading, options);
    }).open();
  }
  openClozeCreator(editor, file) {
    if (!file) {
      new import_obsidian4.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A Markdown \u6587\u4EF6\u3002");
      return;
    }
    const selected = editor.getSelection();
    const source = this.selectionSource(editor, file);
    if (!selected.trim()) {
      new import_obsidian4.Notice("\u8BF7\u5148\u9009\u62E9\u5305\u542B\u9AD8\u4EAE\u5185\u5BB9\u7684\u4EFB\u610F\u8303\u56F4\u3002");
      return;
    }
    const terms = [];
    let number = 0;
    const question = selected.replace(/==([\s\S]+?)==/g, (_match, term) => {
      const clean = term.trim();
      if (!clean) return term;
      terms.push(clean);
      number += 1;
      return `{{c${number}::${clean}}}`;
    });
    if (!terms.length) {
      new import_obsidian4.Notice("\u9009\u533A\u5185\u6CA1\u6709\u627E\u5230 ==\u9AD8\u4EAE==\u3002\u8BF7\u5148\u9AD8\u4EAE\u591A\u4E2A\u8BCD\u8BED\u3002", 7e3);
      return;
    }
    new FlashcardMetaModal(this.app, this.defaultMeta(), "\u521B\u5EFA\u591A\u6316\u7A7A\u95EA\u5361", false, (meta) => {
      this.addCards([{ question, answer: terms.map((term) => `- ${term}`).join("\n"), selected: true }], meta, source);
      new import_obsidian4.Notice(`\u5DF2\u521B\u5EFA\u5305\u542B ${terms.length} \u4E2A\u6316\u7A7A\u7684\u95EA\u5361\u3002`);
    }).open();
  }
  openAIClozeCreator(editor, file) {
    if (!file) {
      new import_obsidian4.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A Markdown \u6587\u4EF6\u3002");
      return;
    }
    const material = editor.getSelection().trim();
    const source = this.selectionSource(editor, file);
    if (!material) {
      new import_obsidian4.Notice("\u8BF7\u5148\u9009\u4E2D\u7528\u4E8E\u5236\u4F5C\u6316\u7A7A\u5361\u7684\u4EFB\u610F\u5185\u5BB9\u3002");
      return;
    }
    new import_obsidian4.Notice("AI \u6B63\u5728\u5EFA\u8BAE\u6316\u7A7A\u5185\u5BB9\u2026", 5e3);
    void suggestClozes(this.store.settings, material).then((terms) => {
      if (!terms.length) throw new Error("AI \u6CA1\u6709\u627E\u5230\u5408\u9002\u7684\u6316\u7A7A\u5185\u5BB9\u3002");
      new ClozePreviewModal(this.app, material, terms, (selectedTerms) => {
        const draft = buildClozeDraft(material, selectedTerms);
        new FlashcardMetaModal(this.app, this.defaultMeta(), "\u521B\u5EFA AI \u591A\u6316\u7A7A\u95EA\u5361", false, (meta) => {
          this.addCards([draft], meta, source);
          new import_obsidian4.Notice(`\u5DF2\u521B\u5EFA\u5305\u542B ${selectedTerms.length} \u4E2A\u6316\u7A7A\u7684\u95EA\u5361\u3002`);
        }).open();
      }).open();
    }).catch((error) => new import_obsidian4.Notice(error instanceof Error ? error.message : "AI \u6316\u7A7A\u5EFA\u8BAE\u5931\u8D25\u3002", 1e4));
  }
  openAICreator(editor, file) {
    if (!file) {
      new import_obsidian4.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A Markdown \u6587\u4EF6\u3002");
      return;
    }
    const material = editor.getSelection().trim();
    if (!material) {
      new import_obsidian4.Notice("\u8BF7\u5148\u9009\u4E2D\u7528\u4E8E\u51FA\u9898\u7684\u4EFB\u610F\u5185\u5BB9\u3002");
      return;
    }
    const source = this.selectionSource(editor, file);
    new FlashcardMetaModal(this.app, this.defaultMeta(), "AI \u81EA\u52A8\u751F\u6210\u95EE\u7B54\u95EA\u5361", true, (meta) => {
      new import_obsidian4.Notice("\u6B63\u5728\u751F\u6210\u95EA\u5361\u2026", 5e3);
      void generateFlashcards(this.store.settings, material, meta.count).then((drafts) => {
        if (!drafts.length) throw new Error("AI \u8FD4\u56DE\u4E86\u7A7A\u5361\u7247\u5217\u8868\u3002");
        new AIPreviewModal(this.app, drafts, (selected) => {
          this.addCards(selected, meta, source);
          new import_obsidian4.Notice(`\u5DF2\u4FDD\u5B58 ${selected.length} \u5F20\u95EA\u5361\u3002`);
        }).open();
      }).catch((error) => new import_obsidian4.Notice(error instanceof Error ? error.message : "\u751F\u6210\u95EA\u5361\u5931\u8D25\u3002", 1e4));
    }).open();
  }
  defaultMeta() {
    return {
      deck: this.store.settings.defaultDeck,
      tags: "",
      color: "blue",
      algorithm: this.store.settings.defaultAlgorithm,
      count: this.store.settings.aiCardCount
    };
  }
  openImageOcclusionCreator() {
    var _a, _b;
    const activeNote = (_b = (_a = this.app.workspace.getActiveViewOfType(import_obsidian4.MarkdownView)) == null ? void 0 : _a.file) != null ? _b : null;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.onchange = () => {
      var _a2;
      const file = (_a2 = input.files) == null ? void 0 : _a2[0];
      if (!file) return;
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        new import_obsidian4.Notice("\u8BF7\u9009\u62E9 PNG\u3001JPEG \u6216 WebP \u622A\u56FE\u3002");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        new import_obsidian4.Notice("\u622A\u56FE\u4E0D\u80FD\u8D85\u8FC7 10 MB\uFF0C\u8BF7\u5148\u538B\u7F29\u3002");
        return;
      }
      new ImageOcclusionModal(this.app, file, (title, boxes) => {
        new FlashcardMetaModal(this.app, { ...this.defaultMeta(), deck: "\u79D1\u76EE\u4E00", tags: "\u79D1\u76EE\u4E00" }, "\u4FDD\u5B58\u56FE\u7247\u6316\u7A7A\u95EA\u5361", false, (meta) => {
          void this.addImageCard(file, title, boxes, meta, activeNote).catch((error) => new import_obsidian4.Notice(error instanceof Error ? error.message : "\u56FE\u7247\u95EA\u5361\u4FDD\u5B58\u5931\u8D25\u3002", 1e4));
        }).open();
      }).open();
    };
    input.click();
  }
  async addImageCard(file, title, boxes, meta, activeNote) {
    var _a;
    const folder = "Knowledge Review/\u56FE\u7247\u6316\u7A7A";
    await this.ensureFolder(folder);
    const suffix = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${folder}/${uid("image")}.${suffix}`;
    const image = await this.app.vault.createBinary(path, await file.arrayBuffer());
    const now = Date.now();
    const number = ((_a = this.store.imageTitleCounter) != null ? _a : 0) + 1;
    if (!title.trim()) this.store.imageTitleCounter = number;
    const displayTitle = title.trim() || String(number);
    const source = await this.imageNoteSource(image.path, displayTitle, activeNote);
    this.store.cards.push({
      id: uid("card"),
      kind: "image",
      question: displayTitle,
      answer: "",
      deck: meta.deck.trim(),
      tags: normalizeTags(meta.tags),
      color: meta.color,
      source,
      imagePath: image.path,
      occlusions: boxes,
      algorithm: meta.algorithm,
      createdAt: now,
      updatedAt: now,
      dueAt: now,
      fixedStep: 0,
      intervalDays: 0,
      ease: 2.5,
      repetitions: 0,
      suspended: false
    });
    await this.saveStore();
    new import_obsidian4.Notice(`\u5DF2\u521B\u5EFA\u542B ${boxes.length} \u4E2A\u65B9\u5757\u7684\u56FE\u7247\u95EA\u5361\uFF0C\u4ECA\u5929\u53EF\u4EE5\u590D\u4E60\u3002`);
  }
  async createLinkedExcerpt(editor, sourceFile, from, to, selected, heading, options) {
    const targetFile = await this.ensureExcerptLibrary();
    const marker = uid("krm");
    const cardId = uid("krcard");
    const keyword = options.keyword.trim();
    const keywordAt = selected.indexOf(keyword);
    if (keywordAt < 0) {
      new import_obsidian4.Notice("\u9AD8\u4EAE\u5173\u952E\u8BCD\u4E0D\u5728\u6240\u9009\u5185\u5BB9\u4E2D\u3002");
      return;
    }
    const targetLink = `${stripMdExtension(targetFile.path)}#^${cardId}`;
    const linked = `${selected.slice(0, keywordAt)}==[[${targetLink}|${keyword}]]==${selected.slice(keywordAt + keyword.length)}`;
    const replacement = `<!--kr:start:${marker}-->${linked}<!--kr:end:${marker}-->`;
    const spec = {
      source: sourceFile.path,
      blocks: [],
      marker,
      heading,
      title: options.title.trim() || void 0,
      color: options.color,
      showHeading: options.showHeading
    };
    await this.app.vault.append(targetFile, `

${serializeExcerpt(spec)}
^${cardId}
`);
    editor.replaceRange(replacement, from, to);
    new import_obsidian4.Notice(`\u5DF2\u6458\u5F55\u5230 ${targetFile.path}\uFF0C\u539F\u6587\u5173\u952E\u8BCD\u53EF\u70B9\u51FB\u8DF3\u8F6C\u3002`, 7e3);
  }
  async ensureExcerptLibrary() {
    let path = (0, import_obsidian4.normalizePath)(this.store.settings.excerptLibraryPath || "\u6458\u5F55\u5E93.md");
    if (!path.toLowerCase().endsWith(".md")) path += ".md";
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof import_obsidian4.TFile) return existing;
    const slash = path.lastIndexOf("/");
    if (slash > 0) await this.ensureFolder(path.slice(0, slash));
    return this.app.vault.create(path, "# \u6458\u5F55\u5E93\n");
  }
  async ensureFolder(path) {
    const parts = (0, import_obsidian4.normalizePath)(path).split("/");
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (!this.app.vault.getAbstractFileByPath(current)) await this.app.vault.createFolder(current);
    }
  }
  async openSourceMarker(file, marker) {
    const leaf = this.app.workspace.getLeaf(false);
    await leaf.openFile(file);
    if (!(leaf.view instanceof import_obsidian4.MarkdownView)) return;
    const token = `<!--kr:start:${marker}-->`;
    const offset = leaf.view.editor.getValue().indexOf(token);
    if (offset < 0) return;
    const position = leaf.view.editor.offsetToPos(offset + token.length);
    leaf.view.editor.setCursor(position);
    leaf.view.editor.scrollIntoView({ from: position, to: position }, true);
  }
  addCards(drafts, meta, source) {
    const now = Date.now();
    for (const draft of drafts) {
      this.store.cards.push({
        id: uid("card"),
        kind: draft.question.includes("{{c") ? "cloze" : "qa",
        question: draft.question.trim(),
        answer: draft.answer.trim(),
        deck: meta.deck.trim(),
        tags: normalizeTags(meta.tags),
        color: meta.color,
        source,
        algorithm: meta.algorithm,
        createdAt: now,
        updatedAt: now,
        dueAt: now,
        fixedStep: 0,
        intervalDays: 0,
        ease: 2.5,
        repetitions: 0,
        suspended: false
      });
    }
    void this.saveStore();
  }
};
var ExcerptRenderChild = class extends import_obsidian4.MarkdownRenderChild {
  constructor(containerEl, plugin, spec, containingSourcePath) {
    super(containerEl);
    this.plugin = plugin;
    this.spec = spec;
    this.containingSourcePath = containingSourcePath;
  }
  onload() {
    this.plugin.registerExcerpt(this);
    void this.render();
  }
  onunload() {
    this.plugin.unregisterExcerpt(this);
  }
  async refreshIfSource(file) {
    if (!this.resolvedFile || file.path === this.resolvedFile.path) await this.render();
  }
  resolveFile() {
    const exact = this.plugin.app.vault.getAbstractFileByPath(this.spec.source);
    if (exact instanceof import_obsidian4.TFile) return exact;
    return this.plugin.app.metadataCache.getFirstLinkpathDest(this.spec.source, this.containingSourcePath);
  }
  async render() {
    const el = this.containerEl;
    el.empty();
    const file = this.resolveFile();
    if (!file) {
      el.createEl("div", { text: `\u627E\u4E0D\u5230\u6E90\u6587\u4EF6\uFF1A${this.spec.source}`, cls: "kr-error" });
      return;
    }
    this.resolvedFile = file;
    const source = await this.plugin.app.vault.cachedRead(file);
    const extracted = extractExcerpt(source, this.spec);
    if (!extracted.content.trim()) {
      el.createEl("div", { text: "\u627E\u4E0D\u5230\u5BF9\u5E94\u7684\u539F\u6587\u6BB5\u843D\u6216\u7AE0\u8282\u3002", cls: "kr-error" });
      return;
    }
    const card = el.createDiv({ cls: `kr-excerpt-card kr-color-${this.spec.color}`, attr: { role: "button", tabindex: "0" } });
    const title = this.spec.title || extracted.heading || file.basename;
    const header = card.createDiv({ cls: "kr-excerpt-header" });
    header.createEl("strong", { text: title });
    if (this.spec.showHeading && extracted.heading && extracted.heading !== title) header.createSpan({ text: extracted.heading });
    const body = card.createDiv({ cls: "kr-excerpt-body markdown-rendered" });
    await import_obsidian4.MarkdownRenderer.render(this.plugin.app, extracted.content, body, file.path, this);
    card.createDiv({ text: file.path, cls: "kr-excerpt-source" });
    const open = () => {
      if (this.spec.marker) {
        void this.plugin.openSourceMarker(file, this.spec.marker);
        return;
      }
      const anchor = this.spec.blocks[0] ? `^${this.spec.blocks[0]}` : this.spec.heading;
      void this.plugin.app.workspace.openLinkText(fileLink(file, anchor), this.containingSourcePath, false);
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  }
};
function extractExcerpt(source, spec) {
  var _a, _b;
  const lines = source.split("\n");
  if (spec.marker) {
    const startToken = `<!--kr:start:${spec.marker}-->`;
    const endToken = `<!--kr:end:${spec.marker}-->`;
    const start = source.indexOf(startToken);
    const end = source.indexOf(endToken, start + startToken.length);
    if (start < 0 || end < 0) return { content: "", heading: spec.heading };
    const raw = source.slice(start + startToken.length, end);
    const clean = raw.replace(/==\[\[[^\]]*?\|([^\]]+)\]\]==/g, "$1");
    const lineBefore = source.slice(0, start).split("\n").length - 1;
    return { content: clean.trim(), heading: spec.heading || headingBefore(lines, lineBefore) };
  }
  if (spec.blocks.length) {
    const chunks = [];
    let firstLine = -1;
    for (const id of spec.blocks) {
      const marker = new RegExp(`(?:^|\\s)\\^${escapeRegExp(id)}\\s*$`);
      const markerLine = lines.findIndex((line) => marker.test(line));
      if (markerLine < 0) continue;
      if (firstLine < 0) firstLine = markerLine;
      const ownMarkerLine = lines[markerLine].trim() === `^${id}`;
      const end = ownMarkerLine ? markerLine - 1 : markerLine;
      let start = end;
      while (start > 0 && lines[start - 1].trim() !== "" && !/^#{1,6}\s+/.test(lines[start - 1])) start -= 1;
      const text = lines.slice(start, end + 1).join("\n").replace(new RegExp(`\\s*\\^${escapeRegExp(id)}\\s*$`), "").trim();
      if (text) chunks.push(text);
    }
    return { content: chunks.join("\n\n"), heading: spec.heading || headingBefore(lines, firstLine) };
  }
  if (spec.heading) {
    const target = normalizeHeading(spec.heading);
    const start = lines.findIndex((line) => {
      const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
      return match ? normalizeHeading(match[2]) === target : false;
    });
    if (start < 0) return { content: "", heading: spec.heading };
    const level = (_b = (_a = lines[start].match(/^(#{1,6})/)) == null ? void 0 : _a[1].length) != null ? _b : 6;
    let end = lines.length;
    for (let index = start + 1; index < lines.length; index += 1) {
      const next = lines[index].match(/^(#{1,6})\s+/);
      if (next && next[1].length <= level) {
        end = index;
        break;
      }
    }
    return { content: lines.slice(start + 1, end).join("\n").trim(), heading: spec.heading };
  }
  return { content: "" };
}
function headingBefore(lines, line) {
  for (let index = Math.min(line, lines.length - 1); index >= 0; index -= 1) {
    const match = lines[index].match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
    if (match) return match[1];
  }
  return void 0;
}
function normalizeHeading(value) {
  return value.trim().replace(/^#+\s*/, "").replace(/\s+#+$/, "").toLowerCase();
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function buildClozeDraft(material, terms) {
  const ranges = terms.map((term) => ({ term, start: material.indexOf(term) })).filter((item) => item.start >= 0).sort((a, b) => a.start - b.start || b.term.length - a.term.length);
  const accepted = [];
  let lastEnd = -1;
  for (const range of ranges) {
    if (range.start >= lastEnd) {
      accepted.push(range);
      lastEnd = range.start + range.term.length;
    }
  }
  let question = material;
  for (let index = accepted.length - 1; index >= 0; index -= 1) {
    const range = accepted[index];
    question = `${question.slice(0, range.start)}{{c${index + 1}::${range.term}}}${question.slice(range.start + range.term.length)}`;
  }
  return { question, answer: accepted.map((item) => `- ${item.term}`).join("\n"), selected: true };
}
