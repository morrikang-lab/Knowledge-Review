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
async function generateFlashcards(settings, material, count) {
  var _a, _b, _c, _d;
  if (!settings.aiBaseUrl.trim() || !settings.aiApiKey.trim() || !settings.aiModel.trim()) {
    throw new Error("\u8BF7\u5148\u5728\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u586B\u5199 AI \u63A5\u53E3\u5730\u5740\u3001\u6A21\u578B\u548C API \u5BC6\u94A5\u3002");
  }
  const requestBody = {
    model: settings.aiModel.trim(),
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: '\u4F60\u662F\u4E00\u540D\u4E25\u8C28\u7684\u95EA\u5361\u7F16\u8F91\u3002\u53EA\u57FA\u4E8E\u6750\u6599\u751F\u6210\u53EF\u72EC\u7ACB\u590D\u4E60\u7684\u95EE\u7B54\u5361\u3002\u95EE\u9898\u5FC5\u987B\u660E\u786E\uFF0C\u7B54\u6848\u7B80\u6D01\u4F46\u5B8C\u6574\uFF0C\u4E0D\u5F97\u8865\u5145\u6750\u6599\u4E2D\u6CA1\u6709\u7684\u4E8B\u5B9E\u3002\u8FD4\u56DE\u4E25\u683C JSON\uFF1A{"cards":[{"question":"...","answer":"..."}]}\u3002'
      },
      {
        role: "user",
        content: `\u8BF7\u4ECE\u4E0B\u9762\u6750\u6599\u4E2D\u751F\u6210 ${count} \u5F20\u4E2D\u6587\u95EE\u7B54\u95EA\u5361\u3002\u4F18\u5148\u8986\u76D6\u5173\u952E\u6982\u5FF5\uFF0C\u907F\u514D\u91CD\u590D\u3002

\u6750\u6599\uFF1A
${material}`
      }
    ]
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
  const parsed = parseJson(content);
  const cards = (_d = parsed.cards) != null ? _d : [];
  return cards.filter((card) => typeof card.question === "string" && typeof card.answer === "string").map((card) => ({ question: String(card.question).trim(), answer: String(card.answer).trim(), selected: true })).filter((card) => card.question && card.answer);
}

// src/modals.ts
var import_obsidian = require("obsidian");
var COLORS = ["blue", "green", "yellow", "red", "purple", "gray"];
var ExcerptOptionsModal = class extends import_obsidian.Modal {
  constructor(app, initialTitle, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
    this.value = { title: initialTitle, color: "blue", showHeading: true };
  }
  onOpen() {
    this.setTitle("\u521B\u5EFA\u77E5\u8BC6\u6458\u5F55\u5361\u7247");
    new import_obsidian.Setting(this.contentEl).setName("\u5361\u7247\u6807\u9898").setDesc("\u53EF\u4EE5\u7559\u7A7A\uFF0C\u5C06\u663E\u793A\u6765\u6E90\u7AE0\u8282\u3002").addText((text) => text.setValue(this.value.title).onChange((value) => {
      this.value.title = value;
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
    new import_obsidian.Setting(this.contentEl).addButton((button) => button.setCta().setButtonText("\u751F\u6210\u5E76\u590D\u5236").onClick(() => {
      this.close();
      this.onSubmit(this.value);
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
  constructor(app, drafts, onSubmit) {
    super(app);
    this.drafts = drafts;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    this.modalEl.addClass("kr-ai-preview-modal");
    this.setTitle(`\u9884\u89C8 AI \u95EA\u5361\uFF08${this.drafts.length}\uFF09`);
    this.contentEl.createEl("p", { text: "\u53EF\u76F4\u63A5\u4FEE\u6539\u95EE\u9898\u548C\u7B54\u6848\uFF0C\u53D6\u6D88\u52FE\u9009\u7684\u5361\u7247\u4E0D\u4F1A\u4FDD\u5B58\u3002", cls: "setting-item-description" });
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
    heading: values.get("heading") || void 0,
    title: values.get("title") || void 0,
    color: values.get("color") || "blue",
    showHeading: values.get("showheading") !== "false"
  };
}
function isBoundary(line) {
  return line.trim() === "" || /^#{1,6}\s+/.test(line);
}
function selectedBlocks(editor) {
  var _a, _b, _c;
  const from = editor.getCursor("from");
  const to = editor.getCursor("to");
  let start = from.line;
  let end = to.line;
  if (to.ch === 0 && end > start) end -= 1;
  while (start > 0 && !isBoundary(editor.getLine(start - 1))) start -= 1;
  while (end + 1 < editor.lineCount() && !isBoundary(editor.getLine(end + 1))) end += 1;
  const blocks = [];
  let cursor = start;
  while (cursor <= end) {
    while (cursor <= end && isBoundary(editor.getLine(cursor))) cursor += 1;
    if (cursor > end) break;
    const blockStart = cursor;
    while (cursor + 1 <= end && !isBoundary(editor.getLine(cursor + 1))) cursor += 1;
    const blockEnd = cursor;
    const lines = [];
    for (let line = blockStart; line <= blockEnd; line += 1) lines.push(editor.getLine(line));
    const last = (_a = lines[lines.length - 1]) != null ? _a : "";
    const inlineId = (_b = last.match(/(?:^|\s)\^([A-Za-z0-9-]+)\s*$/)) == null ? void 0 : _b[1];
    const nextLineId = blockEnd + 1 < editor.lineCount() ? (_c = editor.getLine(blockEnd + 1).trim().match(/^\^([A-Za-z0-9-]+)$/)) == null ? void 0 : _c[1] : void 0;
    blocks.push({ startLine: blockStart, endLine: blockEnd, text: lines.join("\n"), blockId: inlineId != null ? inlineId : nextLineId });
    cursor += 1;
  }
  return blocks;
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
async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch (e) {
    const textarea = document.body.createEl("textarea", { text: value });
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

// src/review-view.ts
var REVIEW_VIEW_TYPE = "knowledge-review-view";
var ReviewView = class extends import_obsidian2.ItemView {
  constructor(leaf, host) {
    super(leaf);
    this.host = host;
    this.revealed = false;
    this.index = 0;
    this.filters = { deck: "", source: "", tag: "", color: "" };
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
    await this.render();
  }
  refresh() {
    void this.render();
  }
  filteredDue() {
    return this.host.getDueCards().filter(
      (card) => {
        var _a;
        return (!this.filters.deck || card.deck === this.filters.deck) && (!this.filters.source || ((_a = card.source) == null ? void 0 : _a.path) === this.filters.source) && (!this.filters.tag || card.tags.includes(this.filters.tag)) && (!this.filters.color || card.color === this.filters.color);
      }
    );
  }
  async render() {
    var _a, _b, _c, _d;
    const root = this.contentEl;
    root.empty();
    root.addClass("kr-review-view");
    const header = root.createDiv({ cls: "kr-review-header" });
    const titleRow = header.createDiv({ cls: "kr-review-title-row" });
    const icon = titleRow.createSpan();
    (0, import_obsidian2.setIcon)(icon, "brain-circuit");
    titleRow.createEl("h2", { text: "\u4ECA\u65E5\u590D\u4E60" });
    titleRow.createSpan({ text: String(this.host.getDueCards().length), cls: "kr-due-badge" });
    this.renderFilters(header);
    const cards = this.filteredDue();
    if (!cards.length) {
      const empty = root.createDiv({ cls: "kr-empty" });
      const emptyIcon = empty.createSpan();
      (0, import_obsidian2.setIcon)(emptyIcon, "circle-check-big");
      empty.createEl("h3", { text: "\u4ECA\u5929\u5DF2\u5B8C\u6210" });
      empty.createEl("p", { text: "\u5F53\u524D\u7B5B\u9009\u6761\u4EF6\u4E0B\u6CA1\u6709\u5230\u671F\u5361\u7247\u3002" });
      this.renderStats(root);
      return;
    }
    this.index = Math.min(this.index, cards.length - 1);
    const card = cards[this.index];
    const progress = root.createDiv({ cls: "kr-review-progress" });
    progress.createSpan({ text: `${this.index + 1} / ${cards.length}` });
    progress.createSpan({ text: card.deck });
    const cardEl = root.createDiv({ cls: `kr-flashcard kr-color-${card.color}` });
    cardEl.createEl("div", { text: card.kind === "cloze" ? "\u6316\u7A7A\u5361" : "\u95EE\u7B54\u5361", cls: "kr-card-kind" });
    const question = card.kind === "cloze" ? card.question.replace(/\{\{c\d+::([\s\S]*?)\}\}/g, "\uFF3B\u2026\u2026\uFF3D") : card.question;
    const questionEl = cardEl.createDiv({ cls: "kr-question markdown-rendered" });
    await import_obsidian2.MarkdownRenderer.render(this.app, question, questionEl, (_b = (_a = card.source) == null ? void 0 : _a.path) != null ? _b : "", this);
    if (!this.revealed) {
      const reveal = cardEl.createEl("button", { text: "\u663E\u793A\u7B54\u6848", cls: "mod-cta kr-reveal" });
      reveal.addEventListener("click", () => {
        this.revealed = true;
        void this.render();
      });
    } else {
      const answerEl = cardEl.createDiv({ cls: "kr-answer markdown-rendered" });
      answerEl.createEl("div", { text: "\u7B54\u6848", cls: "kr-answer-label" });
      await import_obsidian2.MarkdownRenderer.render(this.app, card.answer, answerEl, (_d = (_c = card.source) == null ? void 0 : _c.path) != null ? _d : "", this);
      const actions = cardEl.createDiv({ cls: "kr-rating-actions" });
      this.ratingButton(actions, "\u5FD8\u8BB0", "again", card);
      this.ratingButton(actions, "\u56F0\u96BE", "hard", card);
      this.ratingButton(actions, "\u8BB0\u5F97", "good", card);
    }
    const meta = cardEl.createDiv({ cls: "kr-card-meta" });
    if (card.tags.length) meta.createSpan({ text: card.tags.map((tag) => `#${tag}`).join(" ") });
    if (card.source) {
      const source = meta.createEl("button", { text: `\u6765\u6E90\uFF1A${card.source.path}`, cls: "kr-source-button" });
      source.addEventListener("click", () => {
        var _a2, _b2, _c2, _d2;
        const anchor = ((_a2 = card.source) == null ? void 0 : _a2.blockId) ? `^${card.source.blockId}` : (_b2 = card.source) == null ? void 0 : _b2.heading;
        void this.app.workspace.openLinkText(`${stripMdExtension((_d2 = (_c2 = card.source) == null ? void 0 : _c2.path) != null ? _d2 : "")}${anchor ? `#${anchor}` : ""}`, "", false);
      });
    }
    this.renderStats(root);
  }
  ratingButton(parent, text, rating, card) {
    const button = parent.createEl("button", { text, cls: `kr-rating-${rating}` });
    button.addEventListener("click", async () => {
      await this.host.rateCard(card.id, rating);
      this.revealed = false;
      this.index = 0;
      await this.render();
    });
  }
  renderFilters(parent) {
    const all = this.host.getAllCards();
    const filters = parent.createEl("details", { cls: "kr-filters" });
    filters.createEl("summary", { text: "\u7B5B\u9009" });
    const grid = filters.createDiv({ cls: "kr-filter-grid" });
    this.selectFilter(grid, "\u5361\u7EC4", unique(all.map((card) => card.deck)), this.filters.deck, (value) => {
      this.filters.deck = value;
    });
    this.selectFilter(grid, "\u6765\u6E90", unique(all.map((card) => {
      var _a;
      return (_a = card.source) == null ? void 0 : _a.path;
    }).filter(isString)), this.filters.source, (value) => {
      this.filters.source = value;
    });
    this.selectFilter(grid, "\u6807\u7B7E", unique(all.flatMap((card) => card.tags)), this.filters.tag, (value) => {
      this.filters.tag = value;
    });
    this.selectFilter(grid, "\u989C\u8272", unique(all.map((card) => card.color)), this.filters.color, (value) => {
      this.filters.color = value;
    });
  }
  selectFilter(parent, label, options, value, setValue) {
    const wrapper = parent.createDiv();
    wrapper.createEl("label", { text: label });
    const select = wrapper.createEl("select");
    select.createEl("option", { text: "\u5168\u90E8", value: "" });
    for (const option of options) select.createEl("option", { text: option, value: option });
    select.value = value;
    select.addEventListener("change", () => {
      setValue(select.value);
      this.index = 0;
      this.revealed = false;
      void this.render();
    });
  }
  renderStats(parent) {
    var _a, _b;
    const section = parent.createDiv({ cls: "kr-stats" });
    section.createEl("h3", { text: "\u672C\u6708\u590D\u4E60\u65E5\u5386" });
    const now = /* @__PURE__ */ new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1);
    const days = new Date(year, month + 1, 0).getDate();
    const counts = /* @__PURE__ */ new Map();
    for (const log of this.host.getReviewLog()) {
      const date = new Date(log.reviewedAt);
      if (date.getFullYear() === year && date.getMonth() === month) counts.set(date.getDate(), ((_a = counts.get(date.getDate())) != null ? _a : 0) + 1);
    }
    const total = Array.from(counts.values()).reduce((sum, value) => sum + value, 0);
    section.createEl("p", { text: `${year}\u5E74${month + 1}\u6708 \xB7 \u5DF2\u590D\u4E60 ${total} \u6B21`, cls: "kr-stat-summary" });
    const calendar = section.createDiv({ cls: "kr-calendar" });
    for (const day of ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u65E5"]) calendar.createDiv({ text: day, cls: "kr-weekday" });
    const offset = (first.getDay() + 6) % 7;
    for (let blank = 0; blank < offset; blank += 1) calendar.createDiv({ cls: "kr-day kr-day-empty" });
    for (let day = 1; day <= days; day += 1) {
      const count = (_b = counts.get(day)) != null ? _b : 0;
      const el = calendar.createDiv({ cls: `kr-day ${count ? "is-reviewed" : ""}` });
      el.createSpan({ text: String(day) });
      if (count) el.createEl("small", { text: String(count) });
      if (startOfDay(new Date(year, month, day).getTime()) === startOfDay()) el.addClass("is-today");
    }
  }
};
function unique(values) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
function isString(value) {
  return typeof value === "string" && value.length > 0;
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
    containerEl.createEl("h3", { text: "AI \u81EA\u52A8\u51FA\u9898" });
    containerEl.createEl("p", {
      text: "\u5BC6\u94A5\u53EA\u4FDD\u5B58\u5728\u672C\u5730\u63D2\u4EF6\u6570\u636E\u4E2D\u3002Obsidian \u6CA1\u6709\u7CFB\u7EDF\u5BC6\u94A5\u5E93\u63A5\u53E3\uFF0C\u8BF7\u786E\u4FDD\u540C\u6B65\u76EE\u5F55\u53EF\u4FE1\u3002",
      cls: "setting-item-description"
    });
    new import_obsidian3.Setting(containerEl).setName("\u517C\u5BB9\u63A5\u53E3\u5730\u5740").setDesc("\u793A\u4F8B\uFF1Ahttps://api.openai.com/v1").addText((text) => text.setValue(this.plugin.store.settings.aiBaseUrl).onChange(async (value) => {
      this.plugin.store.settings.aiBaseUrl = value.trim();
      await this.plugin.saveStore();
    }));
    new import_obsidian3.Setting(containerEl).setName("\u6A21\u578B\u540D\u79F0").setDesc("\u586B\u5199\u63A5\u53E3\u670D\u52A1\u5546\u63D0\u4F9B\u7684\u6A21\u578B ID\u3002").addText((text) => text.setValue(this.plugin.store.settings.aiModel).onChange(async (value) => {
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
  aiBaseUrl: "https://api.openai.com/v1",
  aiApiKey: "",
  aiModel: "",
  aiCardCount: 5,
  fixedIntervals: [0, 1, 2, 4, 7, 15, 30],
  defaultAlgorithm: "fixed",
  defaultDeck: "\u9ED8\u8BA4\u5361\u7EC4",
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
      name: "\u5C06\u6240\u9009\u6BB5\u843D\u590D\u5236\u4E3A\u77E5\u8BC6\u6458\u5F55\u5361\u7247",
      callback: () => this.withActiveEditor((editor, file) => this.openExcerptCreator(editor, file))
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
      name: "\u5C06\u6240\u9009\u6587\u5B57\u521B\u5EFA\u4E3A\u6316\u7A7A\u95EA\u5361",
      callback: () => this.withActiveEditor((editor, file) => this.openClozeCreator(editor, file))
    });
    this.addCommand({
      id: "generate-ai-flashcards",
      name: "\u4ECE\u6240\u9009\u6BB5\u843D\u751F\u6210 AI \u95EE\u7B54\u95EA\u5361",
      callback: () => this.withActiveEditor((editor, file) => this.openAICreator(editor, file))
    });
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
    var _a;
    const saved = await this.loadData();
    this.store = {
      settings: { ...DEFAULT_SETTINGS, ...(_a = saved == null ? void 0 : saved.settings) != null ? _a : {} },
      cards: Array.isArray(saved == null ? void 0 : saved.cards) ? saved.cards : [],
      reviewLog: Array.isArray(saved == null ? void 0 : saved.reviewLog) ? saved.reviewLog : []
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
  async rateCard(cardId, rating) {
    const index = this.store.cards.findIndex((card) => card.id === cardId);
    if (index < 0) return;
    const previous = this.store.cards[index];
    const next = scheduleReview(previous, rating, this.store.settings);
    this.store.cards[index] = next;
    this.store.reviewLog.push({ id: uid("log"), cardId, reviewedAt: Date.now(), rating, previousDueAt: previous.dueAt, nextDueAt: next.dueAt });
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
  openExcerptCreator(editor, file) {
    if (!file) {
      new import_obsidian4.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A Markdown \u6587\u4EF6\u3002");
      return;
    }
    const blocks = selectedBlocks(editor);
    if (!blocks.length) {
      new import_obsidian4.Notice("\u6CA1\u6709\u627E\u5230\u53EF\u6458\u5F55\u7684\u6B63\u6587\u6BB5\u843D\u3002");
      return;
    }
    const heading = nearestHeading(editor, blocks[0].startLine);
    new ExcerptOptionsModal(this.app, heading != null ? heading : "", (options) => {
      const ids = this.ensureBlockIds(editor, blocks);
      const spec = { source: file.path, blocks: ids, heading, title: options.title || void 0, color: options.color, showHeading: options.showHeading };
      void copyText(serializeExcerpt(spec)).then(() => new import_obsidian4.Notice("\u6458\u5F55\u5361\u7247\u5DF2\u590D\u5236\u3002\u5207\u6362\u5230\u76EE\u6807\u7B14\u8BB0\u540E\u7C98\u8D34\u5373\u53EF\u3002"));
    }).open();
  }
  openClozeCreator(editor, file) {
    if (!file) {
      new import_obsidian4.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A Markdown \u6587\u4EF6\u3002");
      return;
    }
    const selected = editor.getSelection();
    if (!selected.trim()) {
      new import_obsidian4.Notice("\u8BF7\u5148\u9009\u4E2D\u9700\u8981\u6316\u7A7A\u7684\u6587\u5B57\u3002");
      return;
    }
    const blocks = selectedBlocks(editor);
    if (blocks.length !== 1 || !blocks[0].text.includes(selected)) {
      new import_obsidian4.Notice("\u4E00\u6B21\u6316\u7A7A\u9700\u4F4D\u4E8E\u540C\u4E00\u4E2A\u5B8C\u6574\u6BB5\u843D\u4E2D\u3002");
      return;
    }
    const defaults = this.defaultMeta();
    new FlashcardMetaModal(this.app, defaults, "\u521B\u5EFA\u6316\u7A7A\u95EA\u5361", false, (meta) => {
      const blockId = this.ensureBlockIds(editor, blocks)[0];
      const cleanParagraph = blocks[0].text.replace(/\s+\^[A-Za-z0-9-]+\s*$/, "");
      const question = cleanParagraph.replace(selected, `{{c1::${selected}}}`);
      this.addCards([{ question, answer: selected, selected: true }], meta, { path: file.path, blockId });
      new import_obsidian4.Notice("\u6316\u7A7A\u95EA\u5361\u5DF2\u521B\u5EFA\u3002");
    }).open();
  }
  openAICreator(editor, file) {
    if (!file) {
      new import_obsidian4.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A Markdown \u6587\u4EF6\u3002");
      return;
    }
    const blocks = selectedBlocks(editor);
    if (!blocks.length) {
      new import_obsidian4.Notice("\u8BF7\u5148\u9009\u62E9\u7528\u4E8E\u51FA\u9898\u7684\u6BB5\u843D\u3002");
      return;
    }
    const material = blocks.map((block) => block.text.replace(/\s+\^[A-Za-z0-9-]+\s*$/, "")).join("\n\n");
    const defaults = this.defaultMeta();
    new FlashcardMetaModal(this.app, defaults, "AI \u81EA\u52A8\u751F\u6210\u95EE\u7B54\u95EA\u5361", true, (meta) => {
      const blockId = this.ensureBlockIds(editor, blocks)[0];
      const source = { path: file.path, blockId, heading: nearestHeading(editor, blocks[0].startLine) };
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
  ensureBlockIds(editor, blocks) {
    const ids = blocks.map((block) => {
      var _a;
      return (_a = block.blockId) != null ? _a : uid("kc");
    });
    for (let index = blocks.length - 1; index >= 0; index -= 1) {
      if (!blocks[index].blockId) {
        const line = blocks[index].endLine;
        editor.replaceRange(`
^${ids[index]}`, { line, ch: editor.getLine(line).length });
        blocks[index].blockId = ids[index];
      }
    }
    return ids;
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
