// Obsidian's multi-window alias for document
(globalThis as unknown as Record<string, unknown>).activeDocument = document;

// Obsidian global DOM factory helpers
(globalThis as unknown as Record<string, unknown>).createEl = (tag: string, opts?: { cls?: string | string[]; text?: string; attr?: Record<string, string> }) => {
  const el = document.createElement(tag);
  if (opts?.cls) {
    const classes = Array.isArray(opts.cls) ? opts.cls : [opts.cls];
    el.classList.add(...classes);
  }
  if (opts?.text) el.textContent = opts.text;
  if (opts?.attr) Object.entries(opts.attr).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
};

const createElFn = (globalThis as unknown as Record<string, unknown>).createEl as (tag: string, opts?: object) => HTMLElement;

(globalThis as unknown as Record<string, unknown>).createDiv = (cls?: string) =>
  createElFn('div', cls ? { cls } : undefined);

(globalThis as unknown as Record<string, unknown>).createSpan = (cls?: string) =>
  createElFn('span', cls ? { cls } : undefined);

// Obsidian extensions on HTMLElement
declare global {
  interface HTMLElement {
    addClass(cls: string): this;
    setCssProps(props: Record<string, string>): this;
  }
  interface SVGElement {
    addClass(cls: string): this;
    setCssProps(props: Record<string, string>): this;
  }
}

HTMLElement.prototype.addClass = function (cls: string) {
  this.classList.add(cls);
  return this;
};

HTMLElement.prototype.setCssProps = function (props: Record<string, string>) {
  Object.entries(props).forEach(([k, v]) => this.style.setProperty(k, v));
  return this;
};

// SVGElement also needs these (InteractivePGN calls .addClass on SVG nodes)
SVGElement.prototype.addClass = function (cls: string) {
  this.classList.add(cls);
  return this;
};

SVGElement.prototype.setCssProps = function (props: Record<string, string>) {
  Object.entries(props).forEach(([k, v]) => this.style.setProperty(k, v));
  return this;
};
