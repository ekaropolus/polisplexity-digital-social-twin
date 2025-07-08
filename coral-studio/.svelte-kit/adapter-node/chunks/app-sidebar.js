import { A as is_array, B as get_prototype_of, C as object_prototype, D as ATTACHMENT_KEY, q as spread_attributes, l as clsx, x as bind_props, e as pop, p as push, o as ensure_array_like, E as element, m as spread_props, s as setContext, g as getContext, v as derived, h as hasContext, F as run, w as props_id, G as getAllContexts, y as copy_payload, z as assign_payload, f as attr, n as escape_html, t as stringify, j as attr_class, I as noop$1, k as attr_style } from "./index.js";
import { clsx as clsx$1 } from "clsx";
import { twMerge } from "tailwind-merge";
import parse from "style-to-object";
import { v as defaultWindow$1, r as createSubscriber, M as MediaQuery, n as SvelteMap, x as toast, h as html, i as sessionCtx, w as watch$1, y as SvelteSet, k as socketCtx, z as toggleMode } from "./threads.js";
import { t as on, B as BROWSER } from "./events.js";
import { computePosition, offset, shift, flip, size, arrow, hide, limitShift } from "@floating-ui/dom";
import { tv } from "tailwind-variants";
import { tabbable, focusable, isFocusable, isTabbable } from "tabbable";
import { w as writable } from "./exports.js";
const empty = [];
function snapshot(value, skip_warning = false) {
  return clone(value, /* @__PURE__ */ new Map(), "", empty);
}
function clone(value, cloned, path, paths, original = null) {
  if (typeof value === "object" && value !== null) {
    var unwrapped = cloned.get(value);
    if (unwrapped !== void 0) return unwrapped;
    if (value instanceof Map) return (
      /** @type {Snapshot<T>} */
      new Map(value)
    );
    if (value instanceof Set) return (
      /** @type {Snapshot<T>} */
      new Set(value)
    );
    if (is_array(value)) {
      var copy = (
        /** @type {Snapshot<any>} */
        Array(value.length)
      );
      cloned.set(value, copy);
      if (original !== null) {
        cloned.set(original, copy);
      }
      for (var i = 0; i < value.length; i += 1) {
        var element2 = value[i];
        if (i in value) {
          copy[i] = clone(element2, cloned, path, paths);
        }
      }
      return copy;
    }
    if (get_prototype_of(value) === object_prototype) {
      copy = {};
      cloned.set(value, copy);
      if (original !== null) {
        cloned.set(original, copy);
      }
      for (var key in value) {
        copy[key] = clone(value[key], cloned, path, paths);
      }
      return copy;
    }
    if (value instanceof Date) {
      return (
        /** @type {Snapshot<T>} */
        structuredClone(value)
      );
    }
    if (typeof /** @type {T & { toJSON?: any } } */
    value.toJSON === "function") {
      return clone(
        /** @type {T & { toJSON(): any } } */
        value.toJSON(),
        cloned,
        path,
        paths,
        // Associate the instance with the toJSON clone
        value
      );
    }
  }
  if (value instanceof EventTarget) {
    return (
      /** @type {Snapshot<T>} */
      value
    );
  }
  try {
    return (
      /** @type {Snapshot<T>} */
      structuredClone(value)
    );
  } catch (e) {
    return (
      /** @type {Snapshot<T>} */
      value
    );
  }
}
function createAttachmentKey() {
  return Symbol(ATTACHMENT_KEY);
}
function lifecycle_function_unavailable(name) {
  const error = new Error(`lifecycle_function_unavailable
\`${name}(...)\` is not available on the server
https://svelte.dev/e/lifecycle_function_unavailable`);
  error.name = "Svelte error";
  throw error;
}
function mount() {
  lifecycle_function_unavailable("mount");
}
function unmount() {
  lifecycle_function_unavailable("unmount");
}
async function tick() {
}
function isFunction$2(value) {
  return typeof value === "function";
}
function extract$1(value, defaultValue) {
  if (isFunction$2(value)) {
    const getter = value;
    const gotten = getter();
    if (gotten === void 0) return defaultValue;
    return gotten;
  }
  if (value === void 0) return defaultValue;
  return value;
}
function useDebounce$1(callback, wait) {
  let context2 = null;
  const wait$ = extract$1(wait, 250);
  function debounced(...args) {
    if (context2) {
      if (context2.timeout) {
        clearTimeout(context2.timeout);
      }
    } else {
      let resolve;
      let reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      context2 = {
        timeout: null,
        runner: null,
        promise,
        resolve,
        reject
      };
    }
    context2.runner = async () => {
      if (!context2) return;
      const ctx = context2;
      context2 = null;
      try {
        ctx.resolve(await callback.apply(this, args));
      } catch (error) {
        ctx.reject(error);
      }
    };
    context2.timeout = setTimeout(context2.runner, wait$);
    return context2.promise;
  }
  debounced.cancel = async () => {
    if (!context2 || context2.timeout === null) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (!context2 || context2.timeout === null) return;
    }
    clearTimeout(context2.timeout);
    context2.reject("Cancelled");
    context2 = null;
  };
  debounced.runScheduledNow = async () => {
    if (!context2 || !context2.timeout) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (!context2 || !context2.timeout) return;
    }
    clearTimeout(context2.timeout);
    context2.timeout = null;
    await context2.runner?.();
  };
  Object.defineProperty(debounced, "pending", {
    enumerable: true,
    get() {
      return !!context2?.timeout;
    }
  });
  return debounced;
}
function getStorage(storageType, window2) {
  switch (storageType) {
    case "local":
      return window2.localStorage;
    case "session":
      return window2.sessionStorage;
  }
}
class PersistedState {
  #current;
  #key;
  #serializer;
  #storage;
  #subscribe;
  #version = 0;
  constructor(key, initialValue, options = {}) {
    const {
      storage: storageType = "local",
      serializer = {
        serialize: JSON.stringify,
        deserialize: JSON.parse
      },
      syncTabs = true
    } = options;
    const window2 = "window" in options ? options.window : defaultWindow$1;
    this.#current = initialValue;
    this.#key = key;
    this.#serializer = serializer;
    if (window2 === void 0) return;
    const storage = getStorage(storageType, window2);
    this.#storage = storage;
    const existingValue = storage.getItem(key);
    if (existingValue !== null) {
      this.#current = this.#deserialize(existingValue);
    } else {
      this.#serialize(initialValue);
    }
    if (syncTabs && storageType === "local") {
      this.#subscribe = createSubscriber();
    }
  }
  get current() {
    this.#subscribe?.();
    this.#version;
    const storageItem = this.#storage?.getItem(this.#key);
    const root = storageItem ? this.#deserialize(storageItem) : this.#current;
    const proxies = /* @__PURE__ */ new WeakMap();
    const proxy = (value) => {
      if (value === null || value?.constructor.name === "Date" || typeof value !== "object") {
        return value;
      }
      let p2 = proxies.get(value);
      if (!p2) {
        p2 = new Proxy(value, {
          get: (target, property) => {
            this.#version;
            return proxy(Reflect.get(target, property));
          },
          set: (target, property, value2) => {
            this.#version += 1;
            Reflect.set(target, property, value2);
            this.#serialize(root);
            return true;
          }
        });
        proxies.set(value, p2);
      }
      return p2;
    };
    return proxy(root);
  }
  set current(newValue) {
    this.#serialize(newValue);
    this.#version += 1;
  }
  #handleStorageEvent = (event) => {
    if (event.key !== this.#key || event.newValue === null) return;
    this.#current = this.#deserialize(event.newValue);
    this.#version += 1;
  };
  #deserialize(value) {
    try {
      return this.#serializer.deserialize(value);
    } catch (error) {
      console.error(`Error when parsing "${value}" from persisted store "${this.#key}"`, error);
      return;
    }
  }
  #serialize(value) {
    try {
      if (value != void 0) {
        this.#storage?.setItem(this.#key, this.#serializer.serialize(value));
      }
    } catch (error) {
      console.error(`Error when writing value from persisted store "${this.#key}" to ${this.#storage}`, error);
    }
  }
}
function Breadcrumb($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<nav${spread_attributes(
    {
      "data-slot": "breadcrumb",
      class: clsx(className),
      "aria-label": "breadcrumb",
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></nav>`;
  bind_props($$props, { ref });
  pop();
}
function cn(...inputs) {
  return twMerge(clsx$1(inputs));
}
function Breadcrumb_item($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<li${spread_attributes(
    {
      "data-slot": "breadcrumb-item",
      class: clsx(cn("inline-flex items-center gap-1.5", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></li>`;
  bind_props($$props, { ref });
  pop();
}
/**
 * @license @lucide/svelte v0.523.0 - ISC
 *
 * ISC License
 * 
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 */
const defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
function Icon($$payload, $$props) {
  push();
  const {
    name,
    color = "currentColor",
    size: size2 = 24,
    strokeWidth = 2,
    absoluteStrokeWidth = false,
    iconNode = [],
    children,
    $$slots,
    $$events,
    ...props
  } = $$props;
  const each_array = ensure_array_like(iconNode);
  $$payload.out += `<svg${spread_attributes(
    {
      ...defaultAttributes,
      ...props,
      width: size2,
      height: size2,
      stroke: color,
      "stroke-width": absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size2) : strokeWidth,
      class: clsx([
        "lucide-icon lucide",
        name && `lucide-${name}`,
        props.class
      ])
    },
    null,
    void 0,
    void 0,
    3
  )}><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let [tag, attrs] = each_array[$$index];
    element($$payload, tag, () => {
      $$payload.out += `${spread_attributes({ ...attrs }, null, void 0, void 0, 3)}`;
    });
  }
  $$payload.out += `<!--]-->`;
  children?.($$payload);
  $$payload.out += `<!----></svg>`;
  pop();
}
function Chevron_right($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [["path", { "d": "m9 18 6-6-6-6" }]];
  Icon($$payload, spread_props([
    { name: "chevron-right" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Breadcrumb_link($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    href = void 0,
    child,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const attrs = {
    "data-slot": "breadcrumb-link",
    class: cn("hover:text-foreground transition-colors", className),
    href,
    ...restProps
  };
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: attrs });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<a${spread_attributes({ ...attrs }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></a>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Breadcrumb_list($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<ol${spread_attributes(
    {
      "data-slot": "breadcrumb-list",
      class: clsx(cn("text-muted-foreground flex flex-wrap items-center gap-1.5 break-words text-sm sm:gap-2.5", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></ol>`;
  bind_props($$props, { ref });
  pop();
}
const MOBILE_BREAKPOINT = 768;
class IsMobile extends MediaQuery {
  constructor() {
    super(`max-width: ${MOBILE_BREAKPOINT - 1}px`);
  }
}
const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "25rem";
const SIDEBAR_WIDTH_MOBILE = "20rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
class SidebarState {
  props;
  #open = derived(() => this.props.open());
  get open() {
    return this.#open();
  }
  set open($$value) {
    return this.#open($$value);
  }
  openMobile = false;
  setOpen;
  #isMobile;
  #state = derived(() => this.open ? "expanded" : "collapsed");
  get state() {
    return this.#state();
  }
  set state($$value) {
    return this.#state($$value);
  }
  constructor(props) {
    this.setOpen = props.setOpen;
    this.#isMobile = new IsMobile();
    this.props = props;
  }
  // Convenience getter for checking if the sidebar is mobile
  // without this, we would need to use `sidebar.isMobile.current` everywhere
  get isMobile() {
    return this.#isMobile.current;
  }
  // Event handler to apply to the `<svelte:window>`
  handleShortcutKeydown = (e) => {
    if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      this.toggle();
    }
  };
  setOpenMobile = (value) => {
    this.openMobile = value;
  };
  toggle = () => {
    return this.#isMobile.current ? this.openMobile = !this.openMobile : this.setOpen(!this.open);
  };
}
const SYMBOL_KEY = "scn-sidebar";
function setSidebar(props) {
  return setContext(Symbol.for(SYMBOL_KEY), new SidebarState(props));
}
function useSidebar() {
  return getContext(Symbol.for(SYMBOL_KEY));
}
function Sidebar_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes(
    {
      "data-slot": "sidebar-content",
      "data-sidebar": "content",
      class: clsx(cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Sidebar_footer($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes(
    {
      "data-slot": "sidebar-footer",
      "data-sidebar": "footer",
      class: clsx(cn("flex flex-col gap-2 p-2", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Sidebar_group_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes(
    {
      "data-slot": "sidebar-group-content",
      "data-sidebar": "group-content",
      class: clsx(cn("w-full text-sm", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Sidebar_group_label($$payload, $$props) {
  push();
  let {
    ref = null,
    children,
    child,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const mergedProps = {
    class: cn("text-sidebar-foreground font-sans ring-sidebar-ring outline-hidden flex h-8 shrink-0 items-center rounded-md px-2 text-sm font-medium transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-5 [&>svg]:shrink-0", "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0", className),
    "data-slot": "sidebar-group-label",
    "data-sidebar": "group-label",
    ...restProps
  };
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Sidebar_group($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes(
    {
      "data-slot": "sidebar-group",
      "data-sidebar": "group",
      class: clsx(cn("relative flex w-full min-w-0 flex-col p-2", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Sidebar_header($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes(
    {
      "data-slot": "sidebar-header",
      "data-sidebar": "header",
      class: clsx(cn("flex flex-col gap-2 p-2", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Input($$payload, $$props) {
  push();
  let {
    ref = null,
    value = void 0,
    type,
    files = void 0,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  if (type === "file") {
    $$payload.out += "<!--[-->";
    $$payload.out += `<input${spread_attributes(
      {
        "data-slot": "input",
        class: clsx(cn("selection:bg-primary dark:bg-input selection:text-primary-foreground border-border ring-offset-background placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm font-medium shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]", "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", "invalid:ring-destructive/20 dark:invalid:ring-destructive/40 invalid:border-destructive", className)),
        type: "file",
        ...restProps
      },
      null
    )}/>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<input${spread_attributes(
      {
        "data-slot": "input",
        class: clsx(cn("border-border bg-background selection:bg-primary dark:bg-input selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]", "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", className)),
        type,
        value,
        ...restProps
      },
      null
    )}/>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref, value, files });
  pop();
}
function Sidebar_inset($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<main${spread_attributes(
    {
      "data-slot": "sidebar-inset",
      class: clsx(cn("bg-background relative flex w-full flex-1 flex-col", "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></main>`;
  bind_props($$props, { ref });
  pop();
}
function isFunction$1(value) {
  return typeof value === "function";
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
const CLASS_VALUE_PRIMITIVE_TYPES = ["string", "number", "bigint", "boolean"];
function isClassValue(value) {
  if (value === null || value === void 0)
    return true;
  if (CLASS_VALUE_PRIMITIVE_TYPES.includes(typeof value))
    return true;
  if (Array.isArray(value))
    return value.every((item) => isClassValue(item));
  if (typeof value === "object") {
    if (Object.getPrototypeOf(value) !== Object.prototype)
      return false;
    return true;
  }
  return false;
}
const BoxSymbol = Symbol("box");
const isWritableSymbol = Symbol("is-writable");
function isBox(value) {
  return isObject(value) && BoxSymbol in value;
}
function isWritableBox(value) {
  return box.isBox(value) && isWritableSymbol in value;
}
function box(initialValue) {
  let current = initialValue;
  return {
    [BoxSymbol]: true,
    [isWritableSymbol]: true,
    get current() {
      return current;
    },
    set current(v) {
      current = v;
    }
  };
}
function boxWith(getter, setter) {
  const derived2 = getter();
  if (setter) {
    return {
      [BoxSymbol]: true,
      [isWritableSymbol]: true,
      get current() {
        return derived2;
      },
      set current(v) {
        setter(v);
      }
    };
  }
  return {
    [BoxSymbol]: true,
    get current() {
      return getter();
    }
  };
}
function boxFrom(value) {
  if (box.isBox(value)) return value;
  if (isFunction$1(value)) return box.with(value);
  return box(value);
}
function boxFlatten(boxes) {
  return Object.entries(boxes).reduce(
    (acc, [key, b]) => {
      if (!box.isBox(b)) {
        return Object.assign(acc, { [key]: b });
      }
      if (box.isWritableBox(b)) {
        Object.defineProperty(acc, key, {
          get() {
            return b.current;
          },
          set(v) {
            b.current = v;
          }
        });
      } else {
        Object.defineProperty(acc, key, {
          get() {
            return b.current;
          }
        });
      }
      return acc;
    },
    {}
  );
}
function toReadonlyBox(b) {
  if (!box.isWritableBox(b)) return b;
  return {
    [BoxSymbol]: true,
    get current() {
      return b.current;
    }
  };
}
box.from = boxFrom;
box.with = boxWith;
box.flatten = boxFlatten;
box.readonly = toReadonlyBox;
box.isBox = isBox;
box.isWritableBox = isWritableBox;
function composeHandlers(...handlers) {
  return function(e) {
    for (const handler of handlers) {
      if (!handler)
        continue;
      if (e.defaultPrevented)
        return;
      if (typeof handler === "function") {
        handler.call(this, e);
      } else {
        handler.current?.call(this, e);
      }
    }
  };
}
const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char))
    return void 0;
  return char !== char.toLowerCase();
}
function splitByCase(str) {
  const parts = [];
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = STR_SPLITTERS.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function pascalCase(str) {
  if (!str)
    return "";
  return splitByCase(str).map((p2) => upperFirst(p2)).join("");
}
function camelCase(str) {
  return lowerFirst(pascalCase(str || ""));
}
function upperFirst(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}
function lowerFirst(str) {
  return str ? str[0].toLowerCase() + str.slice(1) : "";
}
function cssToStyleObj(css) {
  if (!css)
    return {};
  const styleObj = {};
  function iterator(name, value) {
    if (name.startsWith("-moz-") || name.startsWith("-webkit-") || name.startsWith("-ms-") || name.startsWith("-o-")) {
      styleObj[pascalCase(name)] = value;
      return;
    }
    if (name.startsWith("--")) {
      styleObj[name] = value;
      return;
    }
    styleObj[camelCase(name)] = value;
  }
  parse(css, iterator);
  return styleObj;
}
function executeCallbacks(...callbacks) {
  return (...args) => {
    for (const callback of callbacks) {
      if (typeof callback === "function") {
        callback(...args);
      }
    }
  };
}
function createParser(matcher, replacer) {
  const regex = RegExp(matcher, "g");
  return (str) => {
    if (typeof str !== "string") {
      throw new TypeError(`expected an argument of type string, but got ${typeof str}`);
    }
    if (!str.match(regex))
      return str;
    return str.replace(regex, replacer);
  };
}
const camelToKebab = createParser(/[A-Z]/, (match) => `-${match.toLowerCase()}`);
function styleToCSS(styleObj) {
  if (!styleObj || typeof styleObj !== "object" || Array.isArray(styleObj)) {
    throw new TypeError(`expected an argument of type object, but got ${typeof styleObj}`);
  }
  return Object.keys(styleObj).map((property) => `${camelToKebab(property)}: ${styleObj[property]};`).join("\n");
}
function styleToString(style = {}) {
  return styleToCSS(style).replace("\n", " ");
}
const srOnlyStyles = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: "0",
  transform: "translateX(-100%)"
};
const srOnlyStylesString = styleToString(srOnlyStyles);
const EVENT_LIST = [
  "onabort",
  "onanimationcancel",
  "onanimationend",
  "onanimationiteration",
  "onanimationstart",
  "onauxclick",
  "onbeforeinput",
  "onbeforetoggle",
  "onblur",
  "oncancel",
  "oncanplay",
  "oncanplaythrough",
  "onchange",
  "onclick",
  "onclose",
  "oncompositionend",
  "oncompositionstart",
  "oncompositionupdate",
  "oncontextlost",
  "oncontextmenu",
  "oncontextrestored",
  "oncopy",
  "oncuechange",
  "oncut",
  "ondblclick",
  "ondrag",
  "ondragend",
  "ondragenter",
  "ondragleave",
  "ondragover",
  "ondragstart",
  "ondrop",
  "ondurationchange",
  "onemptied",
  "onended",
  "onerror",
  "onfocus",
  "onfocusin",
  "onfocusout",
  "onformdata",
  "ongotpointercapture",
  "oninput",
  "oninvalid",
  "onkeydown",
  "onkeypress",
  "onkeyup",
  "onload",
  "onloadeddata",
  "onloadedmetadata",
  "onloadstart",
  "onlostpointercapture",
  "onmousedown",
  "onmouseenter",
  "onmouseleave",
  "onmousemove",
  "onmouseout",
  "onmouseover",
  "onmouseup",
  "onpaste",
  "onpause",
  "onplay",
  "onplaying",
  "onpointercancel",
  "onpointerdown",
  "onpointerenter",
  "onpointerleave",
  "onpointermove",
  "onpointerout",
  "onpointerover",
  "onpointerup",
  "onprogress",
  "onratechange",
  "onreset",
  "onresize",
  "onscroll",
  "onscrollend",
  "onsecuritypolicyviolation",
  "onseeked",
  "onseeking",
  "onselect",
  "onselectionchange",
  "onselectstart",
  "onslotchange",
  "onstalled",
  "onsubmit",
  "onsuspend",
  "ontimeupdate",
  "ontoggle",
  "ontouchcancel",
  "ontouchend",
  "ontouchmove",
  "ontouchstart",
  "ontransitioncancel",
  "ontransitionend",
  "ontransitionrun",
  "ontransitionstart",
  "onvolumechange",
  "onwaiting",
  "onwebkitanimationend",
  "onwebkitanimationiteration",
  "onwebkitanimationstart",
  "onwebkittransitionend",
  "onwheel"
];
const EVENT_LIST_SET = new Set(EVENT_LIST);
function isEventHandler(key) {
  return EVENT_LIST_SET.has(key);
}
function mergeProps(...args) {
  const result = { ...args[0] };
  for (let i = 1; i < args.length; i++) {
    const props = args[i];
    if (!props)
      continue;
    for (const key of Object.keys(props)) {
      const a = result[key];
      const b = props[key];
      const aIsFunction = typeof a === "function";
      const bIsFunction = typeof b === "function";
      if (aIsFunction && typeof bIsFunction && isEventHandler(key)) {
        const aHandler = a;
        const bHandler = b;
        result[key] = composeHandlers(aHandler, bHandler);
      } else if (aIsFunction && bIsFunction) {
        result[key] = executeCallbacks(a, b);
      } else if (key === "class") {
        const aIsClassValue = isClassValue(a);
        const bIsClassValue = isClassValue(b);
        if (aIsClassValue && bIsClassValue) {
          result[key] = clsx$1(a, b);
        } else if (aIsClassValue) {
          result[key] = clsx$1(a);
        } else if (bIsClassValue) {
          result[key] = clsx$1(b);
        }
      } else if (key === "style") {
        const aIsObject = typeof a === "object";
        const bIsObject = typeof b === "object";
        const aIsString = typeof a === "string";
        const bIsString = typeof b === "string";
        if (aIsObject && bIsObject) {
          result[key] = { ...a, ...b };
        } else if (aIsObject && bIsString) {
          const parsedStyle = cssToStyleObj(b);
          result[key] = { ...a, ...parsedStyle };
        } else if (aIsString && bIsObject) {
          const parsedStyle = cssToStyleObj(a);
          result[key] = { ...parsedStyle, ...b };
        } else if (aIsString && bIsString) {
          const parsedStyleA = cssToStyleObj(a);
          const parsedStyleB = cssToStyleObj(b);
          result[key] = { ...parsedStyleA, ...parsedStyleB };
        } else if (aIsObject) {
          result[key] = a;
        } else if (bIsObject) {
          result[key] = b;
        } else if (aIsString) {
          result[key] = a;
        } else if (bIsString) {
          result[key] = b;
        }
      } else {
        result[key] = b !== void 0 ? b : a;
      }
    }
    for (const key of Object.getOwnPropertySymbols(props)) {
      const a = result[key];
      const b = props[key];
      result[key] = b !== void 0 ? b : a;
    }
  }
  if (typeof result.style === "object") {
    result.style = styleToString(result.style).replaceAll("\n", " ");
  }
  if (result.hidden !== true) {
    result.hidden = void 0;
    delete result.hidden;
  }
  if (result.disabled !== true) {
    result.disabled = void 0;
    delete result.disabled;
  }
  return result;
}
const defaultWindow = void 0;
function getActiveElement$1(document2) {
  let activeElement = document2.activeElement;
  while (activeElement?.shadowRoot) {
    const node = activeElement.shadowRoot.activeElement;
    if (node === activeElement)
      break;
    else
      activeElement = node;
  }
  return activeElement;
}
class ActiveElement {
  #document;
  #subscribe;
  constructor(options = {}) {
    const {
      window: window2 = defaultWindow,
      document: document2 = window2?.document
    } = options;
    if (window2 === void 0) return;
    this.#document = document2;
    this.#subscribe = createSubscriber();
  }
  get current() {
    this.#subscribe?.();
    if (!this.#document) return null;
    return getActiveElement$1(this.#document);
  }
}
new ActiveElement();
function isFunction(value) {
  return typeof value === "function";
}
function extract(value, defaultValue) {
  if (isFunction(value)) {
    const getter = value;
    const gotten = getter();
    if (gotten === void 0) return defaultValue;
    return gotten;
  }
  if (value === void 0) return defaultValue;
  return value;
}
class Context {
  #name;
  #key;
  /**
   * @param name The name of the context.
   * This is used for generating the context key and error messages.
   */
  constructor(name) {
    this.#name = name;
    this.#key = Symbol(name);
  }
  /**
   * The key used to get and set the context.
   *
   * It is not recommended to use this value directly.
   * Instead, use the methods provided by this class.
   */
  get key() {
    return this.#key;
  }
  /**
   * Checks whether this has been set in the context of a parent component.
   *
   * Must be called during component initialisation.
   */
  exists() {
    return hasContext(this.#key);
  }
  /**
   * Retrieves the context that belongs to the closest parent component.
   *
   * Must be called during component initialisation.
   *
   * @throws An error if the context does not exist.
   */
  get() {
    const context2 = getContext(this.#key);
    if (context2 === void 0) {
      throw new Error(`Context "${this.#name}" not found`);
    }
    return context2;
  }
  /**
   * Retrieves the context that belongs to the closest parent component,
   * or the given fallback value if the context does not exist.
   *
   * Must be called during component initialisation.
   */
  getOr(fallback) {
    const context2 = getContext(this.#key);
    if (context2 === void 0) {
      return fallback;
    }
    return context2;
  }
  /**
   * Associates the given value with the current component and returns it.
   *
   * Must be called during component initialisation.
   */
  set(context2) {
    return setContext(this.#key, context2);
  }
}
function useDebounce(callback, wait) {
  let context2 = null;
  const wait$ = extract(wait, 250);
  function debounced(...args) {
    if (context2) {
      if (context2.timeout) {
        clearTimeout(context2.timeout);
      }
    } else {
      let resolve;
      let reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      context2 = {
        timeout: null,
        runner: null,
        promise,
        resolve,
        reject
      };
    }
    context2.runner = async () => {
      if (!context2) return;
      const ctx = context2;
      context2 = null;
      try {
        ctx.resolve(await callback.apply(this, args));
      } catch (error) {
        ctx.reject(error);
      }
    };
    context2.timeout = setTimeout(context2.runner, wait$);
    return context2.promise;
  }
  debounced.cancel = async () => {
    if (!context2 || context2.timeout === null) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (!context2 || context2.timeout === null) return;
    }
    clearTimeout(context2.timeout);
    context2.reject("Cancelled");
    context2 = null;
  };
  debounced.runScheduledNow = async () => {
    if (!context2 || !context2.timeout) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (!context2 || !context2.timeout) return;
    }
    clearTimeout(context2.timeout);
    context2.timeout = null;
    await context2.runner?.();
  };
  Object.defineProperty(debounced, "pending", {
    enumerable: true,
    get() {
      return !!context2?.timeout;
    }
  });
  return debounced;
}
function runWatcher(sources, flush, effect, options = {}) {
  const { lazy = false } = options;
}
function watch(sources, effect, options) {
  runWatcher(sources, "post", effect, options);
}
function watchPre(sources, effect, options) {
  runWatcher(sources, "pre", effect, options);
}
watch.pre = watchPre;
function get$2(value) {
  if (isFunction(value)) {
    return value();
  }
  return value;
}
class ElementSize {
  // no need to use `$state` here since we are using createSubscriber
  #size = { width: 0, height: 0 };
  #observed = false;
  #options;
  #node;
  #window;
  // we use a derived here to extract the width so that if the width doesn't change we don't get a state update
  // which we would get if we would just use a getter since the version of the subscriber will be changing
  #width = derived(() => {
    this.#subscribe()?.();
    return this.getSize().width;
  });
  // we use a derived here to extract the height so that if the height doesn't change we don't get a state update
  // which we would get if we would just use a getter since the version of the subscriber will be changing
  #height = derived(() => {
    this.#subscribe()?.();
    return this.getSize().height;
  });
  // we need to use a derived here because the class will be created before the node is bound to the ref
  #subscribe = derived(() => {
    const node$ = get$2(this.#node);
    if (!node$) return;
    return createSubscriber();
  });
  constructor(node, options = { box: "border-box" }) {
    this.#window = options.window ?? defaultWindow;
    this.#options = options;
    this.#node = node;
    this.#size = { width: 0, height: 0 };
  }
  calculateSize() {
    const element2 = get$2(this.#node);
    if (!element2 || !this.#window) {
      return;
    }
    const offsetWidth = element2.offsetWidth;
    const offsetHeight = element2.offsetHeight;
    if (this.#options.box === "border-box") {
      return { width: offsetWidth, height: offsetHeight };
    }
    const style = this.#window.getComputedStyle(element2);
    const paddingWidth = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingHeight = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const borderWidth = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    const borderHeight = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const contentWidth = offsetWidth - paddingWidth - borderWidth;
    const contentHeight = offsetHeight - paddingHeight - borderHeight;
    return { width: contentWidth, height: contentHeight };
  }
  getSize() {
    return this.#observed ? this.#size : this.calculateSize() ?? this.#size;
  }
  get current() {
    this.#subscribe()?.();
    return this.getSize();
  }
  get width() {
    return this.#width();
  }
  get height() {
    return this.#height();
  }
}
class IsMounted {
  #isMounted = false;
  constructor() {
  }
  get current() {
    return this.#isMounted;
  }
}
class Previous {
  #previous = void 0;
  constructor(getter, initialValue) {
    if (initialValue !== void 0) this.#previous = initialValue;
    watch(() => getter(), (_, v) => {
      this.#previous = v;
    });
  }
  get current() {
    return this.#previous;
  }
}
function onDestroyEffect(fn) {
}
function afterSleep(ms, cb) {
  return setTimeout(cb, ms);
}
function afterTick(fn) {
  tick().then(fn);
}
const ELEMENT_NODE = 1;
const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;
function isHTMLElement$1(node) {
  return isObject(node) && node.nodeType === ELEMENT_NODE && typeof node.nodeName === "string";
}
function isDocument(node) {
  return isObject(node) && node.nodeType === DOCUMENT_NODE;
}
function isWindow(node) {
  return isObject(node) && node.constructor?.name === "VisualViewport";
}
function isNode(node) {
  return isObject(node) && node.nodeType !== void 0;
}
function isShadowRoot(node) {
  return isNode(node) && node.nodeType === DOCUMENT_FRAGMENT_NODE && "host" in node;
}
function contains(parent, child) {
  if (!parent || !child)
    return false;
  if (!isHTMLElement$1(parent) || !isHTMLElement$1(child))
    return false;
  const rootNode = child.getRootNode?.();
  if (parent === child)
    return true;
  if (parent.contains(child))
    return true;
  if (rootNode && isShadowRoot(rootNode)) {
    let next2 = child;
    while (next2) {
      if (parent === next2)
        return true;
      next2 = next2.parentNode || next2.host;
    }
  }
  return false;
}
function getDocument(node) {
  if (isDocument(node))
    return node;
  if (isWindow(node))
    return node.document;
  return node?.ownerDocument ?? document;
}
function getWindow(node) {
  if (isShadowRoot(node))
    return getWindow(node.host);
  if (isDocument(node))
    return node.defaultView ?? window;
  if (isHTMLElement$1(node))
    return node.ownerDocument?.defaultView ?? window;
  return window;
}
function getActiveElement(rootNode) {
  let activeElement = rootNode.activeElement;
  while (activeElement?.shadowRoot) {
    const el = activeElement.shadowRoot.activeElement;
    if (el === activeElement)
      break;
    else
      activeElement = el;
  }
  return activeElement;
}
class DOMContext {
  element;
  #root = derived(() => {
    if (!this.element.current) return document;
    const rootNode = this.element.current.getRootNode() ?? document;
    return rootNode;
  });
  get root() {
    return this.#root();
  }
  set root($$value) {
    return this.#root($$value);
  }
  constructor(element2) {
    if (typeof element2 === "function") {
      this.element = box.with(element2);
    } else {
      this.element = element2;
    }
  }
  getDocument = () => {
    return getDocument(this.root);
  };
  getWindow = () => {
    return this.getDocument().defaultView ?? window;
  };
  getActiveElement = () => {
    return getActiveElement(this.root);
  };
  isActiveElement = (node) => {
    return node === this.getActiveElement();
  };
  getElementById(id) {
    return this.root.getElementById(id);
  }
  querySelector = (selector) => {
    if (!this.root) return null;
    return this.root.querySelector(selector);
  };
  querySelectorAll = (selector) => {
    if (!this.root) return [];
    return this.root.querySelectorAll(selector);
  };
  setTimeout = (callback, delay) => {
    return this.getWindow().setTimeout(callback, delay);
  };
  clearTimeout = (timeoutId) => {
    return this.getWindow().clearTimeout(timeoutId);
  };
}
function attachRef(ref, onChange) {
  return {
    [createAttachmentKey()]: (node) => {
      if (box.isBox(ref)) {
        ref.current = node;
        run(() => onChange?.(node));
        return () => {
          if ("isConnected" in node && node.isConnected)
            return;
          ref.current = null;
          onChange?.(null);
        };
      }
      ref(node);
      run(() => onChange?.(node));
      return () => {
        if ("isConnected" in node && node.isConnected)
          return;
        ref(null);
        onChange?.(null);
      };
    }
  };
}
function getDataOpenClosed(condition) {
  return condition ? "open" : "closed";
}
function getAriaDisabled(condition) {
  return condition ? "true" : "false";
}
function getAriaExpanded(condition) {
  return condition ? "true" : "false";
}
function getDataDisabled(condition) {
  return condition ? "" : void 0;
}
function getAriaSelected(condition) {
  return condition ? "true" : "false";
}
function getAriaOrientation(orientation) {
  return orientation;
}
function getAriaHidden(condition) {
  return condition ? "true" : void 0;
}
function getDataOrientation(orientation) {
  return orientation;
}
function getDataSelected(condition) {
  return condition ? "" : void 0;
}
function getHidden(condition) {
  return condition ? true : void 0;
}
function getDisabled(condition) {
  return condition ? true : void 0;
}
function getRequired(condition) {
  return condition ? true : void 0;
}
class BitsAttrs {
  #variant;
  #prefix;
  attrs;
  constructor(config) {
    this.#variant = config.getVariant ? config.getVariant() : null;
    this.#prefix = this.#variant ? `data-${this.#variant}-` : `data-${config.component}-`;
    this.getAttr = this.getAttr.bind(this);
    this.selector = this.selector.bind(this);
    this.attrs = Object.fromEntries(config.parts.map((part) => [part, this.getAttr(part)]));
  }
  getAttr(part, variantOverride) {
    if (variantOverride)
      return `data-${variantOverride}-${part}`;
    return `${this.#prefix}${part}`;
  }
  selector(part, variantOverride) {
    return `[${this.getAttr(part, variantOverride)}]`;
  }
}
function createBitsAttrs(config) {
  const bitsAttrs = new BitsAttrs(config);
  return {
    ...bitsAttrs.attrs,
    selector: bitsAttrs.selector,
    getAttr: bitsAttrs.getAttr
  };
}
const ARROW_DOWN = "ArrowDown";
const ARROW_LEFT = "ArrowLeft";
const ARROW_RIGHT = "ArrowRight";
const ARROW_UP = "ArrowUp";
const END = "End";
const ENTER = "Enter";
const ESCAPE = "Escape";
const HOME = "Home";
const PAGE_DOWN = "PageDown";
const PAGE_UP = "PageUp";
const SPACE = " ";
const TAB = "Tab";
const p = "p";
const n = "n";
const j = "j";
const k = "k";
const h = "h";
const l = "l";
function getElemDirection(elem) {
  const style = window.getComputedStyle(elem);
  const direction = style.getPropertyValue("direction");
  return direction;
}
function getNextKey(dir = "ltr", orientation = "horizontal") {
  return {
    horizontal: dir === "rtl" ? ARROW_LEFT : ARROW_RIGHT,
    vertical: ARROW_DOWN
  }[orientation];
}
function getPrevKey(dir = "ltr", orientation = "horizontal") {
  return {
    horizontal: dir === "rtl" ? ARROW_RIGHT : ARROW_LEFT,
    vertical: ARROW_UP
  }[orientation];
}
function getDirectionalKeys(dir = "ltr", orientation = "horizontal") {
  if (!["ltr", "rtl"].includes(dir))
    dir = "ltr";
  if (!["horizontal", "vertical"].includes(orientation))
    orientation = "horizontal";
  return {
    nextKey: getNextKey(dir, orientation),
    prevKey: getPrevKey(dir, orientation)
  };
}
class RovingFocusGroup {
  #opts;
  #currentTabStopId = box(null);
  constructor(opts) {
    this.#opts = opts;
  }
  getCandidateNodes() {
    return [];
  }
  focusFirstCandidate() {
    const items = this.getCandidateNodes();
    if (!items.length)
      return;
    items[0]?.focus();
  }
  handleKeydown(node, e, both = false) {
    const rootNode = this.#opts.rootNode.current;
    if (!rootNode || !node)
      return;
    const items = this.getCandidateNodes();
    if (!items.length)
      return;
    const currentIndex = items.indexOf(node);
    const dir = getElemDirection(rootNode);
    const { nextKey, prevKey } = getDirectionalKeys(dir, this.#opts.orientation.current);
    const loop = this.#opts.loop.current;
    const keyToIndex = {
      [nextKey]: currentIndex + 1,
      [prevKey]: currentIndex - 1,
      [HOME]: 0,
      [END]: items.length - 1
    };
    if (both) {
      const altNextKey = nextKey === ARROW_DOWN ? ARROW_RIGHT : ARROW_DOWN;
      const altPrevKey = prevKey === ARROW_UP ? ARROW_LEFT : ARROW_UP;
      keyToIndex[altNextKey] = currentIndex + 1;
      keyToIndex[altPrevKey] = currentIndex - 1;
    }
    let itemIndex = keyToIndex[e.key];
    if (itemIndex === void 0)
      return;
    e.preventDefault();
    if (itemIndex < 0 && loop) {
      itemIndex = items.length - 1;
    } else if (itemIndex === items.length && loop) {
      itemIndex = 0;
    }
    const itemToFocus = items[itemIndex];
    if (!itemToFocus)
      return;
    itemToFocus.focus();
    this.#currentTabStopId.current = itemToFocus.id;
    this.#opts.onCandidateFocus?.(itemToFocus);
    return itemToFocus;
  }
  getTabIndex(node) {
    const items = this.getCandidateNodes();
    const anyActive = this.#currentTabStopId.current !== null;
    if (node && !anyActive && items[0] === node) {
      this.#currentTabStopId.current = node.id;
      return 0;
    } else if (node?.id === this.#currentTabStopId.current) {
      return 0;
    }
    return -1;
  }
  setCurrentTabStopId(id) {
    this.#currentTabStopId.current = id;
  }
}
function noop() {
}
function createId(prefixOrUid, uid) {
  return `bits-${prefixOrUid}`;
}
class StateMachine {
  state;
  #machine;
  constructor(initialState, machine) {
    this.state = box(initialState);
    this.#machine = machine;
    this.dispatch = this.dispatch.bind(this);
  }
  #reducer(event) {
    const nextState = this.#machine[this.state.current][event];
    return nextState ?? this.state.current;
  }
  dispatch(event) {
    this.state.current = this.#reducer(event);
  }
}
const presenceMachine = {
  mounted: {
    UNMOUNT: "unmounted",
    ANIMATION_OUT: "unmountSuspended"
  },
  unmountSuspended: { MOUNT: "mounted", ANIMATION_END: "unmounted" },
  unmounted: { MOUNT: "mounted" }
};
class Presence {
  opts;
  prevAnimationNameState = "none";
  styles = {};
  initialStatus;
  previousPresent;
  machine;
  present;
  constructor(opts) {
    this.opts = opts;
    this.present = this.opts.open;
    this.initialStatus = opts.open.current ? "mounted" : "unmounted";
    this.previousPresent = new Previous(() => this.present.current);
    this.machine = new StateMachine(this.initialStatus, presenceMachine);
    this.handleAnimationEnd = this.handleAnimationEnd.bind(this);
    this.handleAnimationStart = this.handleAnimationStart.bind(this);
    watchPresenceChange(this);
    watchStatusChange(this);
    watchRefChange(this);
  }
  /**
   * Triggering an ANIMATION_OUT during an ANIMATION_IN will fire an `animationcancel`
   * event for ANIMATION_IN after we have entered `unmountSuspended` state. So, we
   * make sure we only trigger ANIMATION_END for the currently active animation.
   */
  handleAnimationEnd(event) {
    if (!this.opts.ref.current) return;
    const currAnimationName = getAnimationName(this.opts.ref.current);
    const isCurrentAnimation = currAnimationName.includes(event.animationName) || currAnimationName === "none";
    if (event.target === this.opts.ref.current && isCurrentAnimation) {
      this.machine.dispatch("ANIMATION_END");
    }
  }
  handleAnimationStart(event) {
    if (!this.opts.ref.current) return;
    if (event.target === this.opts.ref.current) {
      this.prevAnimationNameState = getAnimationName(this.opts.ref.current);
    }
  }
  #isPresent = derived(() => {
    return ["mounted", "unmountSuspended"].includes(this.machine.state.current);
  });
  get isPresent() {
    return this.#isPresent();
  }
  set isPresent($$value) {
    return this.#isPresent($$value);
  }
}
function watchPresenceChange(state) {
  watch(() => state.present.current, () => {
    if (!state.opts.ref.current) return;
    const hasPresentChanged = state.present.current !== state.previousPresent.current;
    if (!hasPresentChanged) return;
    const prevAnimationName = state.prevAnimationNameState;
    const currAnimationName = getAnimationName(state.opts.ref.current);
    if (state.present.current) {
      state.machine.dispatch("MOUNT");
    } else if (currAnimationName === "none" || state.styles.display === "none") {
      state.machine.dispatch("UNMOUNT");
    } else {
      const isAnimating = prevAnimationName !== currAnimationName;
      if (state.previousPresent.current && isAnimating) {
        state.machine.dispatch("ANIMATION_OUT");
      } else {
        state.machine.dispatch("UNMOUNT");
      }
    }
  });
}
function watchStatusChange(state) {
  watch(() => state.machine.state.current, () => {
    if (!state.opts.ref.current) return;
    const currAnimationName = getAnimationName(state.opts.ref.current);
    state.prevAnimationNameState = state.machine.state.current === "mounted" ? currAnimationName : "none";
  });
}
function watchRefChange(state) {
  watch(() => state.opts.ref.current, () => {
    if (!state.opts.ref.current) return;
    state.styles = getComputedStyle(state.opts.ref.current);
    return executeCallbacks(on(state.opts.ref.current, "animationstart", state.handleAnimationStart), on(state.opts.ref.current, "animationcancel", state.handleAnimationEnd), on(state.opts.ref.current, "animationend", state.handleAnimationEnd));
  });
}
function getAnimationName(node) {
  return node ? getComputedStyle(node).animationName || "none" : "none";
}
function Presence_layer($$payload, $$props) {
  push();
  let { open, forceMount, presence, ref } = $$props;
  const presenceState = new Presence({ open: box.with(() => open), ref });
  if (forceMount || open || presenceState.isPresent) {
    $$payload.out += "<!--[-->";
    presence?.($$payload, { present: presenceState.isPresent });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  pop();
}
class AnimationsComplete {
  #opts;
  #currentFrame = void 0;
  #isRunning = false;
  constructor(opts) {
    this.#opts = opts;
  }
  #cleanup() {
    if (this.#currentFrame) {
      window.cancelAnimationFrame(this.#currentFrame);
      this.#currentFrame = void 0;
    }
    this.#isRunning = false;
  }
  run(fn) {
    if (this.#isRunning)
      return;
    this.#cleanup();
    this.#isRunning = true;
    const node = this.#opts.ref.current;
    if (!node) {
      this.#isRunning = false;
      return;
    }
    if (typeof node.getAnimations !== "function") {
      this.#executeCallback(fn);
      return;
    }
    this.#currentFrame = window.requestAnimationFrame(() => {
      const animations = node.getAnimations();
      if (animations.length === 0) {
        this.#executeCallback(fn);
        return;
      }
      Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
        this.#executeCallback(fn);
      });
    });
  }
  #executeCallback(fn) {
    const execute = () => {
      fn();
      this.#isRunning = false;
    };
    if (this.#opts.afterTick) {
      afterTick(execute);
    } else {
      execute();
    }
  }
}
class OpenChangeComplete {
  #opts;
  #enabled;
  #afterAnimations;
  constructor(opts) {
    this.#opts = opts;
    this.#enabled = opts.enabled ?? true;
    this.#afterAnimations = new AnimationsComplete({
      ref: this.#opts.ref,
      afterTick: this.#opts.open
    });
    watch([() => this.#opts.open.current], ([open]) => {
      if (!this.#enabled)
        return;
      this.#afterAnimations.run(() => {
        if (open === this.#opts.open.current) {
          this.#opts.onComplete();
        }
      });
    });
  }
}
const dialogAttrs = createBitsAttrs({
  component: "dialog",
  parts: [
    "content",
    "trigger",
    "overlay",
    "title",
    "description",
    "close",
    "cancel",
    "action"
  ]
});
const DialogRootContext = new Context("Dialog.Root | AlertDialog.Root");
class DialogRootState {
  static create(opts) {
    return DialogRootContext.set(new DialogRootState(opts));
  }
  opts;
  triggerNode = null;
  contentNode = null;
  descriptionNode = null;
  contentId = void 0;
  titleId = void 0;
  triggerId = void 0;
  descriptionId = void 0;
  cancelNode = null;
  constructor(opts) {
    this.opts = opts;
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    new OpenChangeComplete({
      ref: box.with(() => this.contentNode),
      open: this.opts.open,
      enabled: true,
      onComplete: () => {
        this.opts.onOpenChangeComplete.current(this.opts.open.current);
      }
    });
  }
  handleOpen() {
    if (this.opts.open.current) return;
    this.opts.open.current = true;
  }
  handleClose() {
    if (!this.opts.open.current) return;
    this.opts.open.current = false;
  }
  getBitsAttr = (part) => {
    return dialogAttrs.getAttr(part, this.opts.variant.current);
  };
  #sharedProps = derived(() => ({
    "data-state": getDataOpenClosed(this.opts.open.current)
  }));
  get sharedProps() {
    return this.#sharedProps();
  }
  set sharedProps($$value) {
    return this.#sharedProps($$value);
  }
}
class DialogTriggerState {
  static create(opts) {
    return new DialogTriggerState(opts, DialogRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref, (v) => {
      this.root.triggerNode = v;
      this.root.triggerId = v?.id;
    });
    this.onclick = this.onclick.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
  }
  onclick(e) {
    if (this.opts.disabled.current) return;
    if (e.button > 0) return;
    this.root.handleOpen();
  }
  onkeydown(e) {
    if (this.opts.disabled.current) return;
    if (e.key === SPACE || e.key === ENTER) {
      e.preventDefault();
      this.root.handleOpen();
    }
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    "aria-haspopup": "dialog",
    "aria-expanded": getAriaExpanded(this.root.opts.open.current),
    "aria-controls": this.root.contentId,
    [this.root.getBitsAttr("trigger")]: "",
    onkeydown: this.onkeydown,
    onclick: this.onclick,
    disabled: this.opts.disabled.current ? true : void 0,
    ...this.root.sharedProps,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class DialogCloseState {
  static create(opts) {
    return new DialogCloseState(opts, DialogRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
    this.onclick = this.onclick.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
  }
  onclick(e) {
    if (this.opts.disabled.current) return;
    if (e.button > 0) return;
    this.root.handleClose();
  }
  onkeydown(e) {
    if (this.opts.disabled.current) return;
    if (e.key === SPACE || e.key === ENTER) {
      e.preventDefault();
      this.root.handleClose();
    }
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    [this.root.getBitsAttr(this.opts.variant.current)]: "",
    onclick: this.onclick,
    onkeydown: this.onkeydown,
    disabled: this.opts.disabled.current ? true : void 0,
    tabindex: 0,
    ...this.root.sharedProps,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class DialogTitleState {
  static create(opts) {
    return new DialogTitleState(opts, DialogRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.root.titleId = this.opts.id.current;
    this.attachment = attachRef(this.opts.ref);
    watch.pre(() => this.opts.id.current, (id) => {
      this.root.titleId = id;
    });
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: "heading",
    "aria-level": this.opts.level.current,
    [this.root.getBitsAttr("title")]: "",
    ...this.root.sharedProps,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class DialogDescriptionState {
  static create(opts) {
    return new DialogDescriptionState(opts, DialogRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.root.descriptionId = this.opts.id.current;
    this.attachment = attachRef(this.opts.ref, (v) => {
      this.root.descriptionNode = v;
    });
    watch.pre(() => this.opts.id.current, (id) => {
      this.root.descriptionId = id;
    });
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    [this.root.getBitsAttr("description")]: "",
    ...this.root.sharedProps,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class DialogContentState {
  static create(opts) {
    return new DialogContentState(opts, DialogRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref, (v) => {
      this.root.contentNode = v;
      this.root.contentId = v?.id;
    });
  }
  #snippetProps = derived(() => ({ open: this.root.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: this.root.opts.variant.current === "alert-dialog" ? "alertdialog" : "dialog",
    "aria-modal": "true",
    "aria-describedby": this.root.descriptionId,
    "aria-labelledby": this.root.titleId,
    [this.root.getBitsAttr("content")]: "",
    style: {
      pointerEvents: "auto",
      outline: this.root.opts.variant.current === "alert-dialog" ? "none" : void 0
    },
    tabindex: this.root.opts.variant.current === "alert-dialog" ? -1 : void 0,
    ...this.root.sharedProps,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class DialogOverlayState {
  static create(opts) {
    return new DialogOverlayState(opts, DialogRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
  }
  #snippetProps = derived(() => ({ open: this.root.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    [this.root.getBitsAttr("overlay")]: "",
    style: { pointerEvents: "auto" },
    ...this.root.sharedProps,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Dialog_title$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    child,
    children,
    level = 2,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const titleState = DialogTitleState.create({
    id: box.with(() => id),
    level: box.with(() => level),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, titleState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
const isBrowser = typeof document !== "undefined";
const isIOS = getIsIOS();
function getIsIOS() {
  return isBrowser && window?.navigator?.userAgent && (/iP(ad|hone|od)/.test(window.navigator.userAgent) || // The new iPad Pro Gen3 does not identify itself as iPad, but as Macintosh.
  window?.navigator?.maxTouchPoints > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent));
}
function isHTMLElement(element2) {
  return element2 instanceof HTMLElement;
}
function isElement(element2) {
  return element2 instanceof Element;
}
function isElementOrSVGElement(element2) {
  return element2 instanceof Element || element2 instanceof SVGElement;
}
function isFocusVisible(element2) {
  return element2.matches(":focus-visible");
}
function isNotNull(value) {
  return value !== null;
}
function isSelectableInput(element2) {
  return element2 instanceof HTMLInputElement && "select" in element2;
}
const BitsConfigContext = new Context("BitsConfig");
function getBitsConfig() {
  const fallback = new BitsConfigState(null, {});
  return BitsConfigContext.getOr(fallback).opts;
}
class BitsConfigState {
  opts;
  constructor(parent, opts) {
    const resolveConfigOption = createConfigResolver(parent, opts);
    this.opts = {
      defaultPortalTo: resolveConfigOption((config) => config.defaultPortalTo),
      defaultLocale: resolveConfigOption((config) => config.defaultLocale)
    };
  }
}
function createConfigResolver(parent, currentOpts) {
  return (getter) => {
    const configOption = box.with(() => {
      const value = getter(currentOpts)?.current;
      if (value !== void 0)
        return value;
      if (parent === null)
        return void 0;
      return getter(parent.opts)?.current;
    });
    return configOption;
  };
}
function createPropResolver(configOption, fallback) {
  return (getProp) => {
    const config = getBitsConfig();
    return box.with(() => {
      const propValue = getProp();
      if (propValue !== void 0)
        return propValue;
      const option = configOption(config).current;
      if (option !== void 0)
        return option;
      return fallback;
    });
  };
}
const resolvePortalToProp = createPropResolver((config) => config.defaultPortalTo, "body");
function Portal$1($$payload, $$props) {
  push();
  let { to: toProp, children, disabled } = $$props;
  const to = resolvePortalToProp(() => toProp);
  getAllContexts();
  let target = getTarget();
  function getTarget() {
    if (!isBrowser || disabled) return null;
    let localTarget = null;
    if (typeof to.current === "string") {
      const target2 = document.querySelector(to.current);
      localTarget = target2;
    } else {
      localTarget = to.current;
    }
    return localTarget;
  }
  let instance;
  function unmountInstance() {
    if (instance) {
      unmount();
      instance = null;
    }
  }
  watch([() => target, () => disabled], ([target2, disabled2]) => {
    if (!target2 || disabled2) {
      unmountInstance();
      return;
    }
    instance = mount();
    return () => {
      unmountInstance();
    };
  });
  if (disabled) {
    $$payload.out += "<!--[-->";
    children?.($$payload);
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function addEventListener(target, event, handler, options) {
  const events = Array.isArray(event) ? event : [event];
  events.forEach((_event) => target.addEventListener(_event, handler, options));
  return () => {
    events.forEach((_event) => target.removeEventListener(_event, handler, options));
  };
}
class CustomEventDispatcher {
  eventName;
  options;
  constructor(eventName, options = { bubbles: true, cancelable: true }) {
    this.eventName = eventName;
    this.options = options;
  }
  createEvent(detail) {
    return new CustomEvent(this.eventName, {
      ...this.options,
      detail
    });
  }
  dispatch(element2, detail) {
    const event = this.createEvent(detail);
    element2.dispatchEvent(event);
    return event;
  }
  listen(element2, callback, options) {
    const handler = (event) => {
      callback(event);
    };
    return on(element2, this.eventName, handler, options);
  }
}
function debounce(fn, wait = 500) {
  let timeout = null;
  const debounced = (...args) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  };
  debounced.destroy = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  return debounced;
}
function isOrContainsTarget(node, target) {
  return node === target || node.contains(target);
}
function getOwnerDocument(el) {
  return el?.ownerDocument ?? document;
}
function getFirstNonCommentChild(element2) {
  if (!element2)
    return null;
  for (const child of element2.childNodes) {
    if (child.nodeType !== Node.COMMENT_NODE) {
      return child;
    }
  }
  return null;
}
function isClickTrulyOutside(event, contentNode) {
  const { clientX, clientY } = event;
  const rect = contentNode.getBoundingClientRect();
  return clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom;
}
globalThis.bitsDismissableLayers ??= /* @__PURE__ */ new Map();
class DismissibleLayerState {
  static create(opts) {
    return new DismissibleLayerState(opts);
  }
  opts;
  #interactOutsideProp;
  #behaviorType;
  #interceptedEvents = { pointerdown: false };
  #isResponsibleLayer = false;
  #isFocusInsideDOMTree = false;
  #documentObj = void 0;
  #onFocusOutside;
  #unsubClickListener = noop;
  constructor(opts) {
    this.opts = opts;
    this.#behaviorType = opts.interactOutsideBehavior;
    this.#interactOutsideProp = opts.onInteractOutside;
    this.#onFocusOutside = opts.onFocusOutside;
    let unsubEvents = noop;
    const cleanup = () => {
      this.#resetState();
      globalThis.bitsDismissableLayers.delete(this);
      this.#handleInteractOutside.destroy();
      unsubEvents();
    };
    watch(
      [
        () => this.opts.enabled.current,
        () => this.opts.ref.current
      ],
      () => {
        if (!this.opts.enabled.current || !this.opts.ref.current) return;
        afterSleep(1, () => {
          if (!this.opts.ref.current) return;
          globalThis.bitsDismissableLayers.set(this, this.#behaviorType);
          unsubEvents();
          unsubEvents = this.#addEventListeners();
        });
        return cleanup;
      }
    );
  }
  #handleFocus = (event) => {
    if (event.defaultPrevented) return;
    if (!this.opts.ref.current) return;
    afterTick(() => {
      if (!this.opts.ref.current || this.#isTargetWithinLayer(event.target)) return;
      if (event.target && !this.#isFocusInsideDOMTree) {
        this.#onFocusOutside.current?.(event);
      }
    });
  };
  #addEventListeners() {
    return executeCallbacks(
      /**
      * CAPTURE INTERACTION START
      * mark interaction-start event as intercepted.
      * mark responsible layer during interaction start
      * to avoid checking if is responsible layer during interaction end
      * when a new floating element may have been opened.
      */
      on(this.#documentObj, "pointerdown", executeCallbacks(this.#markInterceptedEvent, this.#markResponsibleLayer), { capture: true }),
      /**
      * BUBBLE INTERACTION START
      * Mark interaction-start event as non-intercepted. Debounce `onInteractOutsideStart`
      * to avoid prematurely checking if other events were intercepted.
      */
      on(this.#documentObj, "pointerdown", executeCallbacks(this.#markNonInterceptedEvent, this.#handleInteractOutside)),
      /**
      * HANDLE FOCUS OUTSIDE
      */
      on(this.#documentObj, "focusin", this.#handleFocus)
    );
  }
  #handleDismiss = (e) => {
    let event = e;
    if (event.defaultPrevented) {
      event = createWrappedEvent(e);
    }
    this.#interactOutsideProp.current(e);
  };
  #handleInteractOutside = debounce(
    (e) => {
      if (!this.opts.ref.current) {
        this.#unsubClickListener();
        return;
      }
      const isEventValid = this.opts.isValidEvent.current(e, this.opts.ref.current) || isValidEvent(e, this.opts.ref.current);
      if (!this.#isResponsibleLayer || this.#isAnyEventIntercepted() || !isEventValid) {
        this.#unsubClickListener();
        return;
      }
      let event = e;
      if (event.defaultPrevented) {
        event = createWrappedEvent(event);
      }
      if (this.#behaviorType.current !== "close" && this.#behaviorType.current !== "defer-otherwise-close") {
        this.#unsubClickListener();
        return;
      }
      if (e.pointerType === "touch") {
        this.#unsubClickListener();
        this.#unsubClickListener = addEventListener(this.#documentObj, "click", this.#handleDismiss, { once: true });
      } else {
        this.#interactOutsideProp.current(event);
      }
    },
    10
  );
  #markInterceptedEvent = (e) => {
    this.#interceptedEvents[e.type] = true;
  };
  #markNonInterceptedEvent = (e) => {
    this.#interceptedEvents[e.type] = false;
  };
  #markResponsibleLayer = () => {
    if (!this.opts.ref.current) return;
    this.#isResponsibleLayer = isResponsibleLayer(this.opts.ref.current);
  };
  #isTargetWithinLayer = (target) => {
    if (!this.opts.ref.current) return false;
    return isOrContainsTarget(this.opts.ref.current, target);
  };
  #resetState = debounce(
    () => {
      for (const eventType in this.#interceptedEvents) {
        this.#interceptedEvents[eventType] = false;
      }
      this.#isResponsibleLayer = false;
    },
    20
  );
  #isAnyEventIntercepted() {
    const i = Object.values(this.#interceptedEvents).some(Boolean);
    return i;
  }
  #onfocuscapture = () => {
    this.#isFocusInsideDOMTree = true;
  };
  #onblurcapture = () => {
    this.#isFocusInsideDOMTree = false;
  };
  props = {
    onfocuscapture: this.#onfocuscapture,
    onblurcapture: this.#onblurcapture
  };
}
function getTopMostLayer(layersArr) {
  return layersArr.findLast(([_, { current: behaviorType }]) => behaviorType === "close" || behaviorType === "ignore");
}
function isResponsibleLayer(node) {
  const layersArr = [...globalThis.bitsDismissableLayers];
  const topMostLayer = getTopMostLayer(layersArr);
  if (topMostLayer) return topMostLayer[0].opts.ref.current === node;
  const [firstLayerNode] = layersArr[0];
  return firstLayerNode.opts.ref.current === node;
}
function isValidEvent(e, node) {
  if ("button" in e && e.button > 0) return false;
  const target = e.target;
  if (!isElement(target)) return false;
  const ownerDocument = getOwnerDocument(target);
  const isValid = ownerDocument.documentElement.contains(target) && !isOrContainsTarget(node, target) && isClickTrulyOutside(e, node);
  return isValid;
}
function createWrappedEvent(e) {
  const capturedCurrentTarget = e.currentTarget;
  const capturedTarget = e.target;
  let newEvent;
  if (e instanceof PointerEvent) {
    newEvent = new PointerEvent(e.type, e);
  } else {
    newEvent = new PointerEvent("pointerdown", e);
  }
  let isPrevented = false;
  const wrappedEvent = new Proxy(newEvent, {
    get: (target, prop) => {
      if (prop === "currentTarget") {
        return capturedCurrentTarget;
      }
      if (prop === "target") {
        return capturedTarget;
      }
      if (prop === "preventDefault") {
        return () => {
          isPrevented = true;
          if (typeof target.preventDefault === "function") {
            target.preventDefault();
          }
        };
      }
      if (prop === "defaultPrevented") {
        return isPrevented;
      }
      if (prop in target) {
        return target[prop];
      }
      return e[prop];
    }
  });
  return wrappedEvent;
}
function Dismissible_layer($$payload, $$props) {
  push();
  let {
    interactOutsideBehavior = "close",
    onInteractOutside = noop,
    onFocusOutside = noop,
    id,
    children,
    enabled,
    isValidEvent: isValidEvent2 = () => false,
    ref
  } = $$props;
  const dismissibleLayerState = DismissibleLayerState.create({
    id: box.with(() => id),
    interactOutsideBehavior: box.with(() => interactOutsideBehavior),
    onInteractOutside: box.with(() => onInteractOutside),
    enabled: box.with(() => enabled),
    onFocusOutside: box.with(() => onFocusOutside),
    isValidEvent: box.with(() => isValidEvent2),
    ref
  });
  children?.($$payload, { props: dismissibleLayerState.props });
  $$payload.out += `<!---->`;
  pop();
}
globalThis.bitsEscapeLayers ??= /* @__PURE__ */ new Map();
class EscapeLayerState {
  static create(opts) {
    return new EscapeLayerState(opts);
  }
  opts;
  domContext;
  constructor(opts) {
    this.opts = opts;
    this.domContext = new DOMContext(this.opts.ref);
    let unsubEvents = noop;
    watch(() => opts.enabled.current, (enabled) => {
      if (enabled) {
        globalThis.bitsEscapeLayers.set(this, opts.escapeKeydownBehavior);
        unsubEvents = this.#addEventListener();
      }
      return () => {
        unsubEvents();
        globalThis.bitsEscapeLayers.delete(this);
      };
    });
  }
  #addEventListener = () => {
    return on(this.domContext.getDocument(), "keydown", this.#onkeydown, { passive: false });
  };
  #onkeydown = (e) => {
    if (e.key !== ESCAPE || !isResponsibleEscapeLayer(this)) return;
    const clonedEvent = new KeyboardEvent(e.type, e);
    e.preventDefault();
    const behaviorType = this.opts.escapeKeydownBehavior.current;
    if (behaviorType !== "close" && behaviorType !== "defer-otherwise-close") return;
    this.opts.onEscapeKeydown.current(clonedEvent);
  };
}
function isResponsibleEscapeLayer(instance) {
  const layersArr = [...globalThis.bitsEscapeLayers];
  const topMostLayer = layersArr.findLast(([_, { current: behaviorType }]) => behaviorType === "close" || behaviorType === "ignore");
  if (topMostLayer) return topMostLayer[0] === instance;
  const [firstLayerNode] = layersArr[0];
  return firstLayerNode === instance;
}
function Escape_layer($$payload, $$props) {
  push();
  let {
    escapeKeydownBehavior = "close",
    onEscapeKeydown = noop,
    children,
    enabled,
    ref
  } = $$props;
  EscapeLayerState.create({
    escapeKeydownBehavior: box.with(() => escapeKeydownBehavior),
    onEscapeKeydown: box.with(() => onEscapeKeydown),
    enabled: box.with(() => enabled),
    ref
  });
  children?.($$payload);
  $$payload.out += `<!---->`;
  pop();
}
class FocusScopeManager {
  static instance;
  #scopeStack = box([]);
  #focusHistory = /* @__PURE__ */ new WeakMap();
  static getInstance() {
    if (!this.instance) {
      this.instance = new FocusScopeManager();
    }
    return this.instance;
  }
  register(scope) {
    const current = this.getActive();
    if (current && current !== scope) {
      current.pause();
    }
    this.#scopeStack.current = this.#scopeStack.current.filter((s) => s !== scope);
    this.#scopeStack.current.unshift(scope);
  }
  unregister(scope) {
    this.#scopeStack.current = this.#scopeStack.current.filter((s) => s !== scope);
    const next2 = this.getActive();
    if (next2) {
      next2.resume();
    }
  }
  getActive() {
    return this.#scopeStack.current[0];
  }
  setFocusMemory(scope, element2) {
    this.#focusHistory.set(scope, element2);
  }
  getFocusMemory(scope) {
    return this.#focusHistory.get(scope);
  }
  isActiveScope(scope) {
    return this.getActive() === scope;
  }
}
class FocusScope {
  #paused = false;
  #container = null;
  #manager = FocusScopeManager.getInstance();
  #cleanupFns = [];
  #opts;
  constructor(opts) {
    this.#opts = opts;
  }
  get paused() {
    return this.#paused;
  }
  pause() {
    this.#paused = true;
  }
  resume() {
    this.#paused = false;
  }
  #cleanup() {
    for (const fn of this.#cleanupFns) {
      fn();
    }
    this.#cleanupFns = [];
  }
  mount(container) {
    if (this.#container) {
      this.unmount();
    }
    this.#container = container;
    this.#manager.register(this);
    this.#setupEventListeners();
    this.#handleOpenAutoFocus();
  }
  unmount() {
    if (!this.#container) return;
    this.#cleanup();
    this.#handleCloseAutoFocus();
    this.#manager.unregister(this);
    this.#container = null;
  }
  #handleOpenAutoFocus() {
    if (!this.#container) return;
    const event = new CustomEvent("focusScope.onOpenAutoFocus", { bubbles: false, cancelable: true });
    this.#opts.onOpenAutoFocus.current(event);
    if (!event.defaultPrevented) {
      requestAnimationFrame(() => {
        if (!this.#container) return;
        const firstTabbable = this.#getFirstTabbable();
        if (firstTabbable) {
          firstTabbable.focus();
          this.#manager.setFocusMemory(this, firstTabbable);
        } else {
          this.#container.focus();
        }
      });
    }
  }
  #handleCloseAutoFocus() {
    const event = new CustomEvent("focusScope.onCloseAutoFocus", { bubbles: false, cancelable: true });
    this.#opts.onCloseAutoFocus.current(event);
    if (!event.defaultPrevented) {
      const prevFocused = document.activeElement;
      if (prevFocused && prevFocused !== document.body) {
        prevFocused.focus();
      }
    }
  }
  #setupEventListeners() {
    if (!this.#container || !this.#opts.trap.current) return;
    const container = this.#container;
    const doc = container.ownerDocument;
    const handleFocus = (e) => {
      if (this.#paused || !this.#manager.isActiveScope(this)) return;
      const target = e.target;
      if (!target) return;
      const isInside = container.contains(target);
      if (isInside) {
        this.#manager.setFocusMemory(this, target);
      } else {
        const lastFocused = this.#manager.getFocusMemory(this);
        if (lastFocused && container.contains(lastFocused) && isFocusable(lastFocused)) {
          e.preventDefault();
          lastFocused.focus();
        } else {
          const firstTabbable = this.#getFirstTabbable();
          const firstFocusable = this.#getAllFocusables()[0];
          (firstTabbable || firstFocusable || container).focus();
        }
      }
    };
    const handleKeydown = (e) => {
      if (!this.#opts.loop || this.#paused || e.key !== "Tab") return;
      if (!this.#manager.isActiveScope(this)) return;
      const tabbables = this.#getTabbables();
      if (tabbables.length < 2) return;
      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];
      if (!e.shiftKey && doc.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && doc.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    };
    this.#cleanupFns.push(on(doc, "focusin", handleFocus, { capture: true }), on(container, "keydown", handleKeydown));
    const observer = new MutationObserver(() => {
      const lastFocused = this.#manager.getFocusMemory(this);
      if (lastFocused && !container.contains(lastFocused)) {
        const firstTabbable = this.#getFirstTabbable();
        const firstFocusable = this.#getAllFocusables()[0];
        const elementToFocus = firstTabbable || firstFocusable;
        if (elementToFocus) {
          elementToFocus.focus();
          this.#manager.setFocusMemory(this, elementToFocus);
        } else {
          container.focus();
        }
      }
    });
    observer.observe(container, { childList: true, subtree: true });
    this.#cleanupFns.push(() => observer.disconnect());
  }
  #getTabbables() {
    if (!this.#container) return [];
    return tabbable(this.#container, { includeContainer: false, getShadowRoot: true });
  }
  #getFirstTabbable() {
    const tabbables = this.#getTabbables();
    return tabbables[0] || null;
  }
  #getAllFocusables() {
    if (!this.#container) return [];
    return focusable(this.#container, { includeContainer: false, getShadowRoot: true });
  }
  static use(opts) {
    let scope = null;
    watch(
      [
        () => opts.ref.current,
        () => opts.enabled.current
      ],
      ([ref, enabled]) => {
        if (ref && enabled) {
          if (!scope) {
            scope = new FocusScope(opts);
          }
          scope.mount(ref);
        } else if (scope) {
          scope.unmount();
          scope = null;
        }
      }
    );
    return {
      get props() {
        return { tabindex: -1 };
      }
    };
  }
}
function Focus_scope($$payload, $$props) {
  push();
  let {
    enabled = false,
    trapFocus = false,
    loop = false,
    onCloseAutoFocus = noop,
    onOpenAutoFocus = noop,
    focusScope,
    ref
  } = $$props;
  const focusScopeState = FocusScope.use({
    enabled: box.with(() => enabled),
    trap: box.with(() => trapFocus),
    loop,
    onCloseAutoFocus: box.with(() => onCloseAutoFocus),
    onOpenAutoFocus: box.with(() => onOpenAutoFocus),
    ref
  });
  focusScope?.($$payload, { props: focusScopeState.props });
  $$payload.out += `<!---->`;
  pop();
}
globalThis.bitsTextSelectionLayers ??= /* @__PURE__ */ new Map();
class TextSelectionLayerState {
  static create(opts) {
    return new TextSelectionLayerState(opts);
  }
  opts;
  domContext;
  #unsubSelectionLock = noop;
  constructor(opts) {
    this.opts = opts;
    this.domContext = new DOMContext(opts.ref);
    let unsubEvents = noop;
    watch(() => this.opts.enabled.current, (isEnabled) => {
      if (isEnabled) {
        globalThis.bitsTextSelectionLayers.set(this, this.opts.enabled);
        unsubEvents();
        unsubEvents = this.#addEventListeners();
      }
      return () => {
        unsubEvents();
        this.#resetSelectionLock();
        globalThis.bitsTextSelectionLayers.delete(this);
      };
    });
  }
  #addEventListeners() {
    return executeCallbacks(on(this.domContext.getDocument(), "pointerdown", this.#pointerdown), on(this.domContext.getDocument(), "pointerup", composeHandlers(this.#resetSelectionLock, this.opts.onPointerUp.current)));
  }
  #pointerdown = (e) => {
    const node = this.opts.ref.current;
    const target = e.target;
    if (!isHTMLElement(node) || !isHTMLElement(target) || !this.opts.enabled.current) return;
    if (!isHighestLayer(this) || !contains(node, target)) return;
    this.opts.onPointerDown.current(e);
    if (e.defaultPrevented) return;
    this.#unsubSelectionLock = preventTextSelectionOverflow(node, this.domContext.getDocument().body);
  };
  #resetSelectionLock = () => {
    this.#unsubSelectionLock();
    this.#unsubSelectionLock = noop;
  };
}
const getUserSelect = (node) => node.style.userSelect || node.style.webkitUserSelect;
function preventTextSelectionOverflow(node, body) {
  const originalBodyUserSelect = getUserSelect(body);
  const originalNodeUserSelect = getUserSelect(node);
  setUserSelect(body, "none");
  setUserSelect(node, "text");
  return () => {
    setUserSelect(body, originalBodyUserSelect);
    setUserSelect(node, originalNodeUserSelect);
  };
}
function setUserSelect(node, value) {
  node.style.userSelect = value;
  node.style.webkitUserSelect = value;
}
function isHighestLayer(instance) {
  const layersArr = [...globalThis.bitsTextSelectionLayers];
  if (!layersArr.length) return false;
  const highestLayer = layersArr.at(-1);
  if (!highestLayer) return false;
  return highestLayer[0] === instance;
}
function Text_selection_layer($$payload, $$props) {
  push();
  let {
    preventOverflowTextSelection = true,
    onPointerDown = noop,
    onPointerUp = noop,
    id,
    children,
    enabled,
    ref
  } = $$props;
  TextSelectionLayerState.create({
    id: box.with(() => id),
    onPointerDown: box.with(() => onPointerDown),
    onPointerUp: box.with(() => onPointerUp),
    enabled: box.with(() => enabled && preventOverflowTextSelection),
    ref
  });
  children?.($$payload);
  $$payload.out += `<!---->`;
  pop();
}
globalThis.bitsIdCounter ??= { current: 0 };
function useId(prefix = "bits") {
  globalThis.bitsIdCounter.current++;
  return `${prefix}-${globalThis.bitsIdCounter.current}`;
}
class SharedState {
  #factory;
  #subscribers = 0;
  #state;
  #scope;
  constructor(factory) {
    this.#factory = factory;
  }
  #dispose() {
    this.#subscribers -= 1;
    if (this.#scope && this.#subscribers <= 0) {
      this.#scope();
      this.#state = void 0;
      this.#scope = void 0;
    }
  }
  get(...args) {
    this.#subscribers += 1;
    if (this.#state === void 0) {
      this.#scope = () => {
      };
    }
    return this.#state;
  }
}
const bodyLockStackCount = new SharedState(() => {
  const map = new SvelteMap();
  const locked = (() => {
    for (const value of map.values()) {
      if (value) return true;
    }
    return false;
  })();
  let initialBodyStyle = null;
  let stopTouchMoveListener = null;
  function resetBodyStyle() {
    if (!isBrowser) return;
    document.body.setAttribute("style", initialBodyStyle ?? "");
    document.body.style.removeProperty("--scrollbar-width");
    isIOS && stopTouchMoveListener?.();
  }
  watch(() => locked, () => {
    if (!locked) return;
    initialBodyStyle = document.body.getAttribute("style");
    const bodyStyle = getComputedStyle(document.body);
    const verticalScrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const paddingRight = Number.parseInt(bodyStyle.paddingRight ?? "0", 10);
    const config = {
      padding: paddingRight + verticalScrollbarWidth,
      margin: Number.parseInt(bodyStyle.marginRight ?? "0", 10)
    };
    if (verticalScrollbarWidth > 0) {
      document.body.style.paddingRight = `${config.padding}px`;
      document.body.style.marginRight = `${config.margin}px`;
      document.body.style.setProperty("--scrollbar-width", `${verticalScrollbarWidth}px`);
      document.body.style.overflow = "hidden";
    }
    if (isIOS) {
      stopTouchMoveListener = addEventListener(
        document,
        "touchmove",
        (e) => {
          if (e.target !== document.documentElement) return;
          if (e.touches.length > 1) return;
          e.preventDefault();
        },
        { passive: false }
      );
    }
    afterTick(() => {
      document.body.style.pointerEvents = "none";
      document.body.style.overflow = "hidden";
    });
  });
  return {
    get map() {
      return map;
    },
    resetBodyStyle
  };
});
class BodyScrollLock {
  #id = useId();
  #initialState;
  #restoreScrollDelay = () => null;
  #countState;
  locked;
  constructor(initialState, restoreScrollDelay = () => null) {
    this.#initialState = initialState;
    this.#restoreScrollDelay = restoreScrollDelay;
    this.#countState = bodyLockStackCount.get();
    if (!this.#countState) return;
    this.#countState.map.set(this.#id, this.#initialState ?? false);
    this.locked = box.with(() => this.#countState.map.get(this.#id) ?? false, (v) => this.#countState.map.set(this.#id, v));
  }
}
function Scroll_lock($$payload, $$props) {
  push();
  let {
    preventScroll = true,
    restoreScrollDelay = null
  } = $$props;
  if (preventScroll) {
    new BodyScrollLock(preventScroll, () => restoreScrollDelay);
  }
  pop();
}
function shouldEnableFocusTrap({ forceMount, present, open }) {
  if (forceMount)
    return open;
  return present && open;
}
function Dialog_overlay$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    forceMount = false,
    child,
    children,
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const overlayState = DialogOverlayState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, overlayState.props);
  {
    let presence = function($$payload2) {
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, {
          props: mergeProps(mergedProps),
          ...overlayState.snippetProps
        });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<div${spread_attributes({ ...mergeProps(mergedProps) }, null)}>`;
        children?.($$payload2, overlayState.snippetProps);
        $$payload2.out += `<!----></div>`;
      }
      $$payload2.out += `<!--]-->`;
    };
    Presence_layer($$payload, {
      open: overlayState.root.opts.open.current || forceMount,
      ref: overlayState.opts.ref,
      presence
    });
  }
  bind_props($$props, { ref });
  pop();
}
function Dialog_trigger$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    children,
    child,
    disabled = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = DialogTriggerState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    disabled: box.with(() => Boolean(disabled))
  });
  const mergedProps = mergeProps(restProps, triggerState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Dialog_description$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    children,
    child,
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const descriptionState = DialogDescriptionState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, descriptionState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function next(array, index, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length)
    return;
  if (array.length === 1 && index === 0)
    return array[0];
  if (index === array.length - 1)
    return loop ? array[0] : void 0;
  return array[index + 1];
}
function prev(array, index, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length)
    return;
  if (array.length === 1 && index === 0)
    return array[0];
  if (index === 0)
    return loop ? array[array.length - 1] : void 0;
  return array[index - 1];
}
function forward(array, index, increment, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length)
    return;
  let targetIndex = index + increment;
  if (loop) {
    targetIndex = (targetIndex % array.length + array.length) % array.length;
  } else {
    targetIndex = Math.max(0, Math.min(targetIndex, array.length - 1));
  }
  return array[targetIndex];
}
function backward(array, index, decrement, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length)
    return;
  let targetIndex = index - decrement;
  if (loop) {
    targetIndex = (targetIndex % array.length + array.length) % array.length;
  } else {
    targetIndex = Math.max(0, Math.min(targetIndex, array.length - 1));
  }
  return array[targetIndex];
}
function getNextMatch(values, search, currentMatch) {
  const lowerSearch = search.toLowerCase();
  if (lowerSearch.endsWith(" ")) {
    const searchWithoutSpace = lowerSearch.slice(0, -1);
    const matchesWithoutSpace = values.filter((value) => value.toLowerCase().startsWith(searchWithoutSpace));
    if (matchesWithoutSpace.length <= 1) {
      return getNextMatch(values, searchWithoutSpace, currentMatch);
    }
    const currentMatchLowercase = currentMatch?.toLowerCase();
    if (currentMatchLowercase && currentMatchLowercase.startsWith(searchWithoutSpace) && currentMatchLowercase.charAt(searchWithoutSpace.length) === " " && search.trim() === searchWithoutSpace) {
      return currentMatch;
    }
    const spacedMatches = values.filter((value) => value.toLowerCase().startsWith(lowerSearch));
    if (spacedMatches.length > 0) {
      const currentMatchIndex2 = currentMatch ? values.indexOf(currentMatch) : -1;
      let wrappedMatches = wrapArray(spacedMatches, Math.max(currentMatchIndex2, 0));
      const nextMatch2 = wrappedMatches.find((match) => match !== currentMatch);
      return nextMatch2 || currentMatch;
    }
  }
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const normalizedSearch = isRepeated ? search[0] : search;
  const normalizedLowerSearch = normalizedSearch.toLowerCase();
  const currentMatchIndex = currentMatch ? values.indexOf(currentMatch) : -1;
  let wrappedValues = wrapArray(values, Math.max(currentMatchIndex, 0));
  const excludeCurrentMatch = normalizedSearch.length === 1;
  if (excludeCurrentMatch)
    wrappedValues = wrappedValues.filter((v) => v !== currentMatch);
  const nextMatch = wrappedValues.find((value) => value?.toLowerCase().startsWith(normalizedLowerSearch));
  return nextMatch !== currentMatch ? nextMatch : void 0;
}
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
function Hidden_input($$payload, $$props) {
  push();
  let {
    value = void 0,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const mergedProps = mergeProps(restProps, {
    "aria-hidden": "true",
    tabindex: -1,
    style: srOnlyStylesString
  });
  if (mergedProps.type === "checkbox") {
    $$payload.out += "<!--[-->";
    $$payload.out += `<input${spread_attributes({ ...mergedProps, value }, null)}/>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<input${spread_attributes({ value, ...mergedProps }, null)}/>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { value });
  pop();
}
const collapsibleAttrs = createBitsAttrs({
  component: "collapsible",
  parts: ["root", "content", "trigger"]
});
const CollapsibleRootContext = new Context("Collapsible.Root");
class CollapsibleRootState {
  static create(opts) {
    return CollapsibleRootContext.set(new CollapsibleRootState(opts));
  }
  opts;
  attachment;
  contentNode = null;
  contentId = void 0;
  constructor(opts) {
    this.opts = opts;
    this.toggleOpen = this.toggleOpen.bind(this);
    this.attachment = attachRef(this.opts.ref);
    new OpenChangeComplete({
      ref: box.with(() => this.contentNode),
      open: this.opts.open,
      onComplete: () => {
        this.opts.onOpenChangeComplete.current(this.opts.open.current);
      }
    });
  }
  toggleOpen() {
    this.opts.open.current = !this.opts.open.current;
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    "data-state": getDataOpenClosed(this.opts.open.current),
    "data-disabled": getDataDisabled(this.opts.disabled.current),
    [collapsibleAttrs.root]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class CollapsibleContentState {
  static create(opts) {
    return new CollapsibleContentState(opts, CollapsibleRootContext.get());
  }
  opts;
  root;
  attachment;
  #present = derived(() => this.opts.forceMount.current || this.root.opts.open.current);
  get present() {
    return this.#present();
  }
  set present($$value) {
    return this.#present($$value);
  }
  #originalStyles;
  #isMountAnimationPrevented = false;
  #width = 0;
  #height = 0;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.#isMountAnimationPrevented = root.opts.open.current;
    this.root.contentId = this.opts.id.current;
    this.attachment = attachRef(this.opts.ref, (v) => this.root.contentNode = v);
    watch.pre(() => this.opts.id.current, (id) => {
      this.root.contentId = id;
    });
    watch(
      [
        () => this.opts.ref.current,
        () => this.present
      ],
      ([node]) => {
        if (!node) return;
        afterTick(() => {
          if (!this.opts.ref.current) return;
          this.#originalStyles = this.#originalStyles || {
            transitionDuration: node.style.transitionDuration,
            animationName: node.style.animationName
          };
          node.style.transitionDuration = "0s";
          node.style.animationName = "none";
          const rect = node.getBoundingClientRect();
          this.#height = rect.height;
          this.#width = rect.width;
          if (!this.#isMountAnimationPrevented) {
            const { animationName, transitionDuration } = this.#originalStyles;
            node.style.transitionDuration = transitionDuration;
            node.style.animationName = animationName;
          }
        });
      }
    );
  }
  #snippetProps = derived(() => ({ open: this.root.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    style: {
      "--bits-collapsible-content-height": this.#height ? `${this.#height}px` : void 0,
      "--bits-collapsible-content-width": this.#width ? `${this.#width}px` : void 0
    },
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    "data-disabled": getDataDisabled(this.root.opts.disabled.current),
    [collapsibleAttrs.content]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class CollapsibleTriggerState {
  static create(opts) {
    return new CollapsibleTriggerState(opts, CollapsibleRootContext.get());
  }
  opts;
  root;
  attachment;
  #isDisabled = derived(() => this.opts.disabled.current || this.root.opts.disabled.current);
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
    this.onclick = this.onclick.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
  }
  onclick(e) {
    if (this.#isDisabled()) return;
    if (e.button !== 0) return e.preventDefault();
    this.root.toggleOpen();
  }
  onkeydown(e) {
    if (this.#isDisabled()) return;
    if (e.key === SPACE || e.key === ENTER) {
      e.preventDefault();
      this.root.toggleOpen();
    }
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    type: "button",
    disabled: this.#isDisabled(),
    "aria-controls": this.root.contentId,
    "aria-expanded": getAriaExpanded(this.root.opts.open.current),
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    "data-disabled": getDataDisabled(this.#isDisabled()),
    [collapsibleAttrs.trigger]: "",
    //
    onclick: this.onclick,
    onkeydown: this.onkeydown,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Collapsible($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    children,
    child,
    id = createId(uid),
    ref = null,
    open = false,
    disabled = false,
    onOpenChange = noop,
    onOpenChangeComplete = noop,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = CollapsibleRootState.create({
    open: box.with(() => open, (v) => {
      open = v;
      onOpenChange(v);
    }),
    disabled: box.with(() => disabled),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    onOpenChangeComplete: box.with(() => onOpenChangeComplete)
  });
  const mergedProps = mergeProps(restProps, rootState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref, open });
  pop();
}
function Collapsible_content($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    child,
    ref = null,
    forceMount = false,
    children,
    id = createId(uid),
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = CollapsibleContentState.create({
    id: box.with(() => id),
    forceMount: box.with(() => forceMount),
    ref: box.with(() => ref, (v) => ref = v)
  });
  {
    let presence = function($$payload2, { present }) {
      const mergedProps = mergeProps(restProps, contentState.props, { hidden: forceMount ? void 0 : !present });
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, {
          ...contentState.snippetProps,
          props: mergedProps
        });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
        children?.($$payload2);
        $$payload2.out += `<!----></div>`;
      }
      $$payload2.out += `<!--]-->`;
    };
    Presence_layer($$payload, {
      forceMount: true,
      open: contentState.present,
      ref: contentState.opts.ref,
      presence
    });
  }
  bind_props($$props, { ref });
  pop();
}
function Collapsible_trigger($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    children,
    child,
    ref = null,
    id = createId(uid),
    disabled = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = CollapsibleTriggerState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    disabled: box.with(() => disabled)
  });
  const mergedProps = mergeProps(restProps, triggerState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function get$1(valueOrGetValue) {
  return typeof valueOrGetValue === "function" ? valueOrGetValue() : valueOrGetValue;
}
function getDPR(element2) {
  if (typeof window === "undefined") return 1;
  const win = element2.ownerDocument.defaultView || window;
  return win.devicePixelRatio || 1;
}
function roundByDPR(element2, value) {
  const dpr = getDPR(element2);
  return Math.round(value * dpr) / dpr;
}
function getFloatingContentCSSVars(name) {
  return {
    [`--bits-${name}-content-transform-origin`]: `var(--bits-floating-transform-origin)`,
    [`--bits-${name}-content-available-width`]: `var(--bits-floating-available-width)`,
    [`--bits-${name}-content-available-height`]: `var(--bits-floating-available-height)`,
    [`--bits-${name}-anchor-width`]: `var(--bits-floating-anchor-width)`,
    [`--bits-${name}-anchor-height`]: `var(--bits-floating-anchor-height)`
  };
}
function useFloating(options) {
  const openOption = get$1(options.open) ?? true;
  const middlewareOption = get$1(options.middleware);
  const transformOption = get$1(options.transform) ?? true;
  const placementOption = get$1(options.placement) ?? "bottom";
  const strategyOption = get$1(options.strategy) ?? "absolute";
  const sideOffsetOption = get$1(options.sideOffset) ?? 0;
  const alignOffsetOption = get$1(options.alignOffset) ?? 0;
  const reference = options.reference;
  let x = 0;
  let y = 0;
  const floating = box(null);
  let strategy = strategyOption;
  let placement = placementOption;
  let middlewareData = {};
  let isPositioned = false;
  const floatingStyles = (() => {
    const xVal = floating.current ? roundByDPR(floating.current, x) : x;
    const yVal = floating.current ? roundByDPR(floating.current, y) : y;
    if (transformOption) {
      return {
        position: strategy,
        left: "0",
        top: "0",
        transform: `translate(${xVal}px, ${yVal}px)`,
        ...floating.current && getDPR(floating.current) >= 1.5 && { willChange: "transform" }
      };
    }
    return {
      position: strategy,
      left: `${xVal}px`,
      top: `${yVal}px`
    };
  })();
  function update() {
    if (reference.current === null || floating.current === null) return;
    computePosition(reference.current, floating.current, {
      middleware: middlewareOption,
      placement: placementOption,
      strategy: strategyOption
    }).then((position) => {
      if (!openOption && x !== 0 && y !== 0) {
        const maxExpectedOffset = Math.max(Math.abs(sideOffsetOption), Math.abs(alignOffsetOption), 15);
        if (position.x <= maxExpectedOffset && position.y <= maxExpectedOffset) return;
      }
      x = position.x;
      y = position.y;
      strategy = position.strategy;
      placement = position.placement;
      middlewareData = position.middlewareData;
      isPositioned = true;
    });
  }
  return {
    floating,
    reference,
    get strategy() {
      return strategy;
    },
    get placement() {
      return placement;
    },
    get middlewareData() {
      return middlewareData;
    },
    get isPositioned() {
      return isPositioned;
    },
    get floatingStyles() {
      return floatingStyles;
    },
    get update() {
      return update;
    }
  };
}
const OPPOSITE_SIDE = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
};
const FloatingRootContext = new Context("Floating.Root");
const FloatingContentContext = new Context("Floating.Content");
const FloatingTooltipRootContext = new Context("Floating.Root");
class FloatingRootState {
  static create(tooltip = false) {
    return tooltip ? FloatingTooltipRootContext.set(new FloatingRootState()) : FloatingRootContext.set(new FloatingRootState());
  }
  anchorNode = box(null);
  customAnchorNode = box(null);
  triggerNode = box(null);
  constructor() {
  }
}
class FloatingContentState {
  static create(opts, tooltip = false) {
    return tooltip ? FloatingContentContext.set(new FloatingContentState(opts, FloatingTooltipRootContext.get())) : FloatingContentContext.set(new FloatingContentState(opts, FloatingRootContext.get()));
  }
  opts;
  root;
  // nodes
  contentRef = box(null);
  wrapperRef = box(null);
  arrowRef = box(null);
  contentAttachment = attachRef(this.contentRef);
  wrapperAttachment = attachRef(this.wrapperRef);
  arrowAttachment = attachRef(this.arrowRef);
  // ids
  arrowId = box(useId());
  #transformedStyle = derived(() => {
    if (typeof this.opts.style === "string") return cssToStyleObj(this.opts.style);
    if (!this.opts.style) return {};
  });
  #updatePositionStrategy = void 0;
  #arrowSize = new ElementSize(() => this.arrowRef.current ?? void 0);
  #arrowWidth = derived(() => this.#arrowSize?.width ?? 0);
  #arrowHeight = derived(() => this.#arrowSize?.height ?? 0);
  #desiredPlacement = derived(() => this.opts.side?.current + (this.opts.align.current !== "center" ? `-${this.opts.align.current}` : ""));
  #boundary = derived(() => Array.isArray(this.opts.collisionBoundary.current) ? this.opts.collisionBoundary.current : [this.opts.collisionBoundary.current]);
  #hasExplicitBoundaries = derived(() => this.#boundary().length > 0);
  get hasExplicitBoundaries() {
    return this.#hasExplicitBoundaries();
  }
  set hasExplicitBoundaries($$value) {
    return this.#hasExplicitBoundaries($$value);
  }
  #detectOverflowOptions = derived(() => ({
    padding: this.opts.collisionPadding.current,
    boundary: this.#boundary().filter(isNotNull),
    altBoundary: this.hasExplicitBoundaries
  }));
  get detectOverflowOptions() {
    return this.#detectOverflowOptions();
  }
  set detectOverflowOptions($$value) {
    return this.#detectOverflowOptions($$value);
  }
  #availableWidth = void 0;
  #availableHeight = void 0;
  #anchorWidth = void 0;
  #anchorHeight = void 0;
  #middleware = derived(() => [
    offset({
      mainAxis: this.opts.sideOffset.current + this.#arrowHeight(),
      alignmentAxis: this.opts.alignOffset.current
    }),
    this.opts.avoidCollisions.current && shift({
      mainAxis: true,
      crossAxis: false,
      limiter: this.opts.sticky.current === "partial" ? limitShift() : void 0,
      ...this.detectOverflowOptions
    }),
    this.opts.avoidCollisions.current && flip({ ...this.detectOverflowOptions }),
    size({
      ...this.detectOverflowOptions,
      apply: ({ rects, availableWidth, availableHeight }) => {
        const { width: anchorWidth, height: anchorHeight } = rects.reference;
        this.#availableWidth = availableWidth;
        this.#availableHeight = availableHeight;
        this.#anchorWidth = anchorWidth;
        this.#anchorHeight = anchorHeight;
      }
    }),
    this.arrowRef.current && arrow({
      element: this.arrowRef.current,
      padding: this.opts.arrowPadding.current
    }),
    transformOrigin({
      arrowWidth: this.#arrowWidth(),
      arrowHeight: this.#arrowHeight()
    }),
    this.opts.hideWhenDetached.current && hide({
      strategy: "referenceHidden",
      ...this.detectOverflowOptions
    })
  ].filter(Boolean));
  get middleware() {
    return this.#middleware();
  }
  set middleware($$value) {
    return this.#middleware($$value);
  }
  floating;
  #placedSide = derived(() => getSideFromPlacement(this.floating.placement));
  get placedSide() {
    return this.#placedSide();
  }
  set placedSide($$value) {
    return this.#placedSide($$value);
  }
  #placedAlign = derived(() => getAlignFromPlacement(this.floating.placement));
  get placedAlign() {
    return this.#placedAlign();
  }
  set placedAlign($$value) {
    return this.#placedAlign($$value);
  }
  #arrowX = derived(() => this.floating.middlewareData.arrow?.x ?? 0);
  get arrowX() {
    return this.#arrowX();
  }
  set arrowX($$value) {
    return this.#arrowX($$value);
  }
  #arrowY = derived(() => this.floating.middlewareData.arrow?.y ?? 0);
  get arrowY() {
    return this.#arrowY();
  }
  set arrowY($$value) {
    return this.#arrowY($$value);
  }
  #cannotCenterArrow = derived(() => this.floating.middlewareData.arrow?.centerOffset !== 0);
  get cannotCenterArrow() {
    return this.#cannotCenterArrow();
  }
  set cannotCenterArrow($$value) {
    return this.#cannotCenterArrow($$value);
  }
  contentZIndex;
  #arrowBaseSide = derived(() => OPPOSITE_SIDE[this.placedSide]);
  get arrowBaseSide() {
    return this.#arrowBaseSide();
  }
  set arrowBaseSide($$value) {
    return this.#arrowBaseSide($$value);
  }
  #wrapperProps = derived(() => ({
    id: this.opts.wrapperId.current,
    "data-bits-floating-content-wrapper": "",
    style: {
      ...this.floating.floatingStyles,
      // keep off page when measuring
      transform: this.floating.isPositioned ? this.floating.floatingStyles.transform : "translate(0, -200%)",
      minWidth: "max-content",
      zIndex: this.contentZIndex,
      "--bits-floating-transform-origin": `${this.floating.middlewareData.transformOrigin?.x} ${this.floating.middlewareData.transformOrigin?.y}`,
      "--bits-floating-available-width": `${this.#availableWidth}px`,
      "--bits-floating-available-height": `${this.#availableHeight}px`,
      "--bits-floating-anchor-width": `${this.#anchorWidth}px`,
      "--bits-floating-anchor-height": `${this.#anchorHeight}px`,
      // hide the content if using the hide middleware and should be hidden
      ...this.floating.middlewareData.hide?.referenceHidden && {
        visibility: "hidden",
        "pointer-events": "none"
      },
      ...this.#transformedStyle()
    },
    // Floating UI calculates logical alignment based the `dir` attribute
    dir: this.opts.dir.current,
    ...this.wrapperAttachment
  }));
  get wrapperProps() {
    return this.#wrapperProps();
  }
  set wrapperProps($$value) {
    return this.#wrapperProps($$value);
  }
  #props = derived(() => ({
    "data-side": this.placedSide,
    "data-align": this.placedAlign,
    style: styleToString({ ...this.#transformedStyle() }),
    ...this.contentAttachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
  #arrowStyle = derived(() => ({
    position: "absolute",
    left: this.arrowX ? `${this.arrowX}px` : void 0,
    top: this.arrowY ? `${this.arrowY}px` : void 0,
    [this.arrowBaseSide]: 0,
    "transform-origin": {
      top: "",
      right: "0 0",
      bottom: "center 0",
      left: "100% 0"
    }[this.placedSide],
    transform: {
      top: "translateY(100%)",
      right: "translateY(50%) rotate(90deg) translateX(-50%)",
      bottom: "rotate(180deg)",
      left: "translateY(50%) rotate(-90deg) translateX(50%)"
    }[this.placedSide],
    visibility: this.cannotCenterArrow ? "hidden" : void 0
  }));
  get arrowStyle() {
    return this.#arrowStyle();
  }
  set arrowStyle($$value) {
    return this.#arrowStyle($$value);
  }
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    if (opts.customAnchor) {
      this.root.customAnchorNode.current = opts.customAnchor.current;
    }
    watch(() => opts.customAnchor.current, (customAnchor) => {
      this.root.customAnchorNode.current = customAnchor;
    });
    this.floating = useFloating({
      strategy: () => this.opts.strategy.current,
      placement: () => this.#desiredPlacement(),
      middleware: () => this.middleware,
      reference: this.root.anchorNode,
      open: () => this.opts.enabled.current,
      sideOffset: () => this.opts.sideOffset.current,
      alignOffset: () => this.opts.alignOffset.current
    });
    watch(() => this.contentRef.current, (contentNode) => {
      if (!contentNode) return;
      const win = getWindow(contentNode);
      this.contentZIndex = win.getComputedStyle(contentNode).zIndex;
    });
  }
}
class FloatingArrowState {
  static create(opts) {
    return new FloatingArrowState(opts, FloatingContentContext.get());
  }
  opts;
  content;
  constructor(opts, content) {
    this.opts = opts;
    this.content = content;
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    style: this.content.arrowStyle,
    "data-side": this.content.placedSide,
    ...this.content.arrowAttachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class FloatingAnchorState {
  static create(opts, tooltip = false) {
    return tooltip ? new FloatingAnchorState(opts, FloatingTooltipRootContext.get()) : new FloatingAnchorState(opts, FloatingRootContext.get());
  }
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    if (opts.virtualEl && opts.virtualEl.current) {
      root.triggerNode = box.from(opts.virtualEl.current);
    } else {
      root.triggerNode = opts.ref;
    }
  }
}
function transformOrigin(options) {
  return {
    name: "transformOrigin",
    options,
    fn(data) {
      const { placement, rects, middlewareData } = data;
      const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
      const isArrowHidden = cannotCenterArrow;
      const arrowWidth = isArrowHidden ? 0 : options.arrowWidth;
      const arrowHeight = isArrowHidden ? 0 : options.arrowHeight;
      const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
      const noArrowAlign = { start: "0%", center: "50%", end: "100%" }[placedAlign];
      const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2;
      const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2;
      let x = "";
      let y = "";
      if (placedSide === "bottom") {
        x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
        y = `${-arrowHeight}px`;
      } else if (placedSide === "top") {
        x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
        y = `${rects.floating.height + arrowHeight}px`;
      } else if (placedSide === "right") {
        x = `${-arrowHeight}px`;
        y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
      } else if (placedSide === "left") {
        x = `${rects.floating.width + arrowHeight}px`;
        y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
      }
      return { data: { x, y } };
    }
  };
}
function getSideAndAlignFromPlacement(placement) {
  const [side, align = "center"] = placement.split("-");
  return [side, align];
}
function getSideFromPlacement(placement) {
  return getSideAndAlignFromPlacement(placement)[0];
}
function getAlignFromPlacement(placement) {
  return getSideAndAlignFromPlacement(placement)[1];
}
function Floating_layer($$payload, $$props) {
  push();
  let { children, tooltip = false } = $$props;
  FloatingRootState.create(tooltip);
  children?.($$payload);
  $$payload.out += `<!---->`;
  pop();
}
const defaultOptions = { afterMs: 1e4, onChange: noop };
function boxAutoReset(defaultValue, options) {
  const { afterMs, onChange, getWindow: getWindow2 } = { ...defaultOptions, ...options };
  let timeout = null;
  let value = defaultValue;
  function resetAfter() {
    return getWindow2().setTimeout(
      () => {
        value = defaultValue;
        onChange?.(defaultValue);
      },
      afterMs
    );
  }
  return box.with(() => value, (v) => {
    value = v;
    onChange?.(v);
    if (timeout) getWindow2().clearTimeout(timeout);
    timeout = resetAfter();
  });
}
class DataTypeahead {
  #opts;
  #candidateValues = derived(() => this.#opts.candidateValues());
  #search;
  constructor(opts) {
    this.#opts = opts;
    this.#search = boxAutoReset("", {
      afterMs: 1e3,
      getWindow: this.#opts.getWindow
    });
    this.handleTypeaheadSearch = this.handleTypeaheadSearch.bind(this);
    this.resetTypeahead = this.resetTypeahead.bind(this);
  }
  handleTypeaheadSearch(key) {
    if (!this.#opts.enabled() || !this.#candidateValues().length) return;
    this.#search.current = this.#search.current + key;
    const currentItem = this.#opts.getCurrentItem();
    const currentMatch = this.#candidateValues().find((item) => item === currentItem) ?? "";
    const values = this.#candidateValues().map((item) => item ?? "");
    const nextMatch = getNextMatch(values, this.#search.current, currentMatch);
    const newItem = this.#candidateValues().find((item) => item === nextMatch);
    if (newItem) {
      this.#opts.onMatch(newItem);
    }
    return newItem;
  }
  resetTypeahead() {
    this.#search.current = "";
  }
}
class DOMTypeahead {
  #opts;
  #search;
  #onMatch = derived(() => {
    if (this.#opts.onMatch) return this.#opts.onMatch;
    return (node) => node.focus();
  });
  #getCurrentItem = derived(() => {
    if (this.#opts.getCurrentItem) return this.#opts.getCurrentItem;
    return this.#opts.getActiveElement;
  });
  constructor(opts) {
    this.#opts = opts;
    this.#search = boxAutoReset("", { afterMs: 1e3, getWindow: opts.getWindow });
    this.handleTypeaheadSearch = this.handleTypeaheadSearch.bind(this);
    this.resetTypeahead = this.resetTypeahead.bind(this);
  }
  handleTypeaheadSearch(key, candidates) {
    if (!candidates.length) return;
    this.#search.current = this.#search.current + key;
    const currentItem = this.#getCurrentItem()();
    const currentMatch = candidates.find((item) => item === currentItem)?.textContent?.trim() ?? "";
    const values = candidates.map((item) => item.textContent?.trim() ?? "");
    const nextMatch = getNextMatch(values, this.#search.current, currentMatch);
    const newItem = candidates.find((item) => item.textContent?.trim() === nextMatch);
    if (newItem) this.#onMatch()(newItem);
    return newItem;
  }
  resetTypeahead() {
    this.#search.current = "";
  }
  get search() {
    return this.#search.current;
  }
}
const FIRST_KEYS$1 = [ARROW_DOWN, PAGE_UP, HOME];
const LAST_KEYS$1 = [ARROW_UP, PAGE_DOWN, END];
const FIRST_LAST_KEYS$1 = [...FIRST_KEYS$1, ...LAST_KEYS$1];
const selectAttrs = createBitsAttrs({
  component: "select",
  parts: [
    "trigger",
    "content",
    "item",
    "viewport",
    "scroll-up-button",
    "scroll-down-button",
    "group",
    "group-label",
    "separator",
    "arrow",
    "input",
    "content-wrapper",
    "item-text",
    "value"
  ]
});
const SelectRootContext = new Context("Select.Root | Combobox.Root");
const SelectContentContext = new Context("Select.Content | Combobox.Content");
class SelectBaseRootState {
  opts;
  touchedInput = false;
  inputNode = null;
  contentNode = null;
  triggerNode = null;
  valueId = "";
  highlightedNode = null;
  #highlightedValue = derived(() => {
    if (!this.highlightedNode) return null;
    return this.highlightedNode.getAttribute("data-value");
  });
  get highlightedValue() {
    return this.#highlightedValue();
  }
  set highlightedValue($$value) {
    return this.#highlightedValue($$value);
  }
  #highlightedId = derived(() => {
    if (!this.highlightedNode) return void 0;
    return this.highlightedNode.id;
  });
  get highlightedId() {
    return this.#highlightedId();
  }
  set highlightedId($$value) {
    return this.#highlightedId($$value);
  }
  #highlightedLabel = derived(() => {
    if (!this.highlightedNode) return null;
    return this.highlightedNode.getAttribute("data-label");
  });
  get highlightedLabel() {
    return this.#highlightedLabel();
  }
  set highlightedLabel($$value) {
    return this.#highlightedLabel($$value);
  }
  isUsingKeyboard = false;
  isCombobox = false;
  domContext = new DOMContext(() => null);
  constructor(opts) {
    this.opts = opts;
    this.isCombobox = opts.isCombobox;
    new OpenChangeComplete({
      ref: box.with(() => this.contentNode),
      open: this.opts.open,
      onComplete: () => {
        this.opts.onOpenChangeComplete.current(this.opts.open.current);
      }
    });
  }
  setHighlightedNode(node, initial = false) {
    this.highlightedNode = node;
    if (node && (this.isUsingKeyboard || initial)) {
      node.scrollIntoView({ block: this.opts.scrollAlignment.current });
    }
  }
  getCandidateNodes() {
    const node = this.contentNode;
    if (!node) return [];
    return Array.from(node.querySelectorAll(`[${this.getBitsAttr("item")}]:not([data-disabled])`));
  }
  setHighlightedToFirstCandidate() {
    this.setHighlightedNode(null);
    const candidateNodes = this.getCandidateNodes();
    if (!candidateNodes.length) return;
    this.setHighlightedNode(candidateNodes[0]);
  }
  getNodeByValue(value) {
    const candidateNodes = this.getCandidateNodes();
    return candidateNodes.find((node) => node.dataset.value === value) ?? null;
  }
  setOpen(open) {
    this.opts.open.current = open;
  }
  toggleOpen() {
    this.opts.open.current = !this.opts.open.current;
  }
  handleOpen() {
    this.setOpen(true);
  }
  handleClose() {
    this.setHighlightedNode(null);
    this.setOpen(false);
  }
  toggleMenu() {
    this.toggleOpen();
  }
  getBitsAttr = (part) => {
    return selectAttrs.getAttr(part, this.isCombobox ? "combobox" : void 0);
  };
}
class SelectSingleRootState extends SelectBaseRootState {
  opts;
  isMulti = false;
  #hasValue = derived(() => this.opts.value.current !== "");
  get hasValue() {
    return this.#hasValue();
  }
  set hasValue($$value) {
    return this.#hasValue($$value);
  }
  #currentLabel = derived(() => {
    if (!this.opts.items.current.length) return "";
    const match = this.opts.items.current.find((item) => item.value === this.opts.value.current)?.label;
    return match ?? "";
  });
  get currentLabel() {
    return this.#currentLabel();
  }
  set currentLabel($$value) {
    return this.#currentLabel($$value);
  }
  #candidateLabels = derived(() => {
    if (!this.opts.items.current.length) return [];
    const filteredItems = this.opts.items.current.filter((item) => !item.disabled);
    return filteredItems.map((item) => item.label);
  });
  get candidateLabels() {
    return this.#candidateLabels();
  }
  set candidateLabels($$value) {
    return this.#candidateLabels($$value);
  }
  #dataTypeaheadEnabled = derived(() => {
    if (this.isMulti) return false;
    if (this.opts.items.current.length === 0) return false;
    return true;
  });
  get dataTypeaheadEnabled() {
    return this.#dataTypeaheadEnabled();
  }
  set dataTypeaheadEnabled($$value) {
    return this.#dataTypeaheadEnabled($$value);
  }
  constructor(opts) {
    super(opts);
    this.opts = opts;
    watch(() => this.opts.open.current, () => {
      if (!this.opts.open.current) return;
      this.setInitialHighlightedNode();
    });
  }
  includesItem(itemValue) {
    return this.opts.value.current === itemValue;
  }
  toggleItem(itemValue, itemLabel = itemValue) {
    this.opts.value.current = this.includesItem(itemValue) ? "" : itemValue;
    this.opts.inputValue.current = itemLabel;
  }
  setInitialHighlightedNode() {
    afterTick(() => {
      if (this.highlightedNode && this.domContext.getDocument().contains(this.highlightedNode)) return;
      if (this.opts.value.current !== "") {
        const node = this.getNodeByValue(this.opts.value.current);
        if (node) {
          this.setHighlightedNode(node, true);
          return;
        }
      }
      const firstCandidate = this.getCandidateNodes()[0];
      if (!firstCandidate) return;
      this.setHighlightedNode(firstCandidate, true);
    });
  }
}
class SelectMultipleRootState extends SelectBaseRootState {
  opts;
  isMulti = true;
  #hasValue = derived(() => this.opts.value.current.length > 0);
  get hasValue() {
    return this.#hasValue();
  }
  set hasValue($$value) {
    return this.#hasValue($$value);
  }
  constructor(opts) {
    super(opts);
    this.opts = opts;
    watch(() => this.opts.open.current, () => {
      if (!this.opts.open.current) return;
      this.setInitialHighlightedNode();
    });
  }
  includesItem(itemValue) {
    return this.opts.value.current.includes(itemValue);
  }
  toggleItem(itemValue, itemLabel = itemValue) {
    if (this.includesItem(itemValue)) {
      this.opts.value.current = this.opts.value.current.filter((v) => v !== itemValue);
    } else {
      this.opts.value.current = [...this.opts.value.current, itemValue];
    }
    this.opts.inputValue.current = itemLabel;
  }
  setInitialHighlightedNode() {
    afterTick(() => {
      if (!this.domContext) return;
      if (this.highlightedNode && this.domContext.getDocument().contains(this.highlightedNode)) return;
      if (this.opts.value.current.length && this.opts.value.current[0] !== "") {
        const node = this.getNodeByValue(this.opts.value.current[0]);
        if (node) {
          this.setHighlightedNode(node, true);
          return;
        }
      }
      const firstCandidate = this.getCandidateNodes()[0];
      if (!firstCandidate) return;
      this.setHighlightedNode(firstCandidate, true);
    });
  }
}
class SelectRootState {
  static create(props) {
    const { type, ...rest } = props;
    const rootState = type === "single" ? new SelectSingleRootState(rest) : new SelectMultipleRootState(rest);
    return SelectRootContext.set(rootState);
  }
}
class SelectTriggerState {
  static create(opts) {
    return new SelectTriggerState(opts, SelectRootContext.get());
  }
  opts;
  root;
  attachment;
  #domTypeahead;
  #dataTypeahead;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(opts.ref, (v) => this.root.triggerNode = v);
    this.root.domContext = new DOMContext(opts.ref);
    this.#domTypeahead = new DOMTypeahead({
      getCurrentItem: () => this.root.highlightedNode,
      onMatch: (node) => {
        this.root.setHighlightedNode(node);
      },
      getActiveElement: () => this.root.domContext.getActiveElement(),
      getWindow: () => this.root.domContext.getWindow()
    });
    this.#dataTypeahead = new DataTypeahead({
      getCurrentItem: () => {
        if (this.root.isMulti) return "";
        return this.root.currentLabel;
      },
      onMatch: (label) => {
        if (this.root.isMulti) return;
        if (!this.root.opts.items.current) return;
        const matchedItem = this.root.opts.items.current.find((item) => item.label === label);
        if (!matchedItem) return;
        this.root.opts.value.current = matchedItem.value;
      },
      enabled: () => !this.root.isMulti && this.root.dataTypeaheadEnabled,
      candidateValues: () => this.root.isMulti ? [] : this.root.candidateLabels,
      getWindow: () => this.root.domContext.getWindow()
    });
    this.onkeydown = this.onkeydown.bind(this);
    this.onpointerdown = this.onpointerdown.bind(this);
    this.onpointerup = this.onpointerup.bind(this);
    this.onclick = this.onclick.bind(this);
  }
  #handleOpen() {
    this.root.opts.open.current = true;
    this.#dataTypeahead.resetTypeahead();
    this.#domTypeahead.resetTypeahead();
  }
  #handlePointerOpen(_) {
    this.#handleOpen();
  }
  /**
   * Logic used to handle keyboard selection/deselection.
   *
   * If it returns true, it means the item was selected and whatever is calling
   * this function should return early
   *
   */
  #handleKeyboardSelection() {
    const isCurrentSelectedValue = this.root.highlightedValue === this.root.opts.value.current;
    if (!this.root.opts.allowDeselect.current && isCurrentSelectedValue && !this.root.isMulti) {
      this.root.handleClose();
      return true;
    }
    if (this.root.highlightedValue !== null) {
      this.root.toggleItem(this.root.highlightedValue, this.root.highlightedLabel ?? void 0);
    }
    if (!this.root.isMulti && !isCurrentSelectedValue) {
      this.root.handleClose();
      return true;
    }
    return false;
  }
  onkeydown(e) {
    this.root.isUsingKeyboard = true;
    if (e.key === ARROW_UP || e.key === ARROW_DOWN) e.preventDefault();
    if (!this.root.opts.open.current) {
      if (e.key === ENTER || e.key === SPACE || e.key === ARROW_DOWN || e.key === ARROW_UP) {
        e.preventDefault();
        this.root.handleOpen();
      } else if (!this.root.isMulti && this.root.dataTypeaheadEnabled) {
        this.#dataTypeahead.handleTypeaheadSearch(e.key);
        return;
      }
      if (this.root.hasValue) return;
      const candidateNodes2 = this.root.getCandidateNodes();
      if (!candidateNodes2.length) return;
      if (e.key === ARROW_DOWN) {
        const firstCandidate = candidateNodes2[0];
        this.root.setHighlightedNode(firstCandidate);
      } else if (e.key === ARROW_UP) {
        const lastCandidate = candidateNodes2[candidateNodes2.length - 1];
        this.root.setHighlightedNode(lastCandidate);
      }
      return;
    }
    if (e.key === TAB) {
      this.root.handleClose();
      return;
    }
    if ((e.key === ENTER || // if we're currently "typing ahead", we don't want to select the item
    // just yet as the item the user is trying to get to may have a space in it,
    // so we defer handling the close for this case until further down
    e.key === SPACE && this.#domTypeahead.search === "") && !e.isComposing) {
      e.preventDefault();
      const shouldReturn = this.#handleKeyboardSelection();
      if (shouldReturn) return;
    }
    if (e.key === ARROW_UP && e.altKey) {
      this.root.handleClose();
    }
    if (FIRST_LAST_KEYS$1.includes(e.key)) {
      e.preventDefault();
      const candidateNodes2 = this.root.getCandidateNodes();
      const currHighlightedNode = this.root.highlightedNode;
      const currIndex = currHighlightedNode ? candidateNodes2.indexOf(currHighlightedNode) : -1;
      const loop = this.root.opts.loop.current;
      let nextItem;
      if (e.key === ARROW_DOWN) {
        nextItem = next(candidateNodes2, currIndex, loop);
      } else if (e.key === ARROW_UP) {
        nextItem = prev(candidateNodes2, currIndex, loop);
      } else if (e.key === PAGE_DOWN) {
        nextItem = forward(candidateNodes2, currIndex, 10, loop);
      } else if (e.key === PAGE_UP) {
        nextItem = backward(candidateNodes2, currIndex, 10, loop);
      } else if (e.key === HOME) {
        nextItem = candidateNodes2[0];
      } else if (e.key === END) {
        nextItem = candidateNodes2[candidateNodes2.length - 1];
      }
      if (!nextItem) return;
      this.root.setHighlightedNode(nextItem);
      return;
    }
    const isModifierKey = e.ctrlKey || e.altKey || e.metaKey;
    const isCharacterKey = e.key.length === 1;
    const isSpaceKey = e.key === SPACE;
    const candidateNodes = this.root.getCandidateNodes();
    if (e.key === TAB) return;
    if (!isModifierKey && (isCharacterKey || isSpaceKey)) {
      const matchedNode = this.#domTypeahead.handleTypeaheadSearch(e.key, candidateNodes);
      if (!matchedNode && isSpaceKey) {
        e.preventDefault();
        this.#handleKeyboardSelection();
      }
      return;
    }
    if (!this.root.highlightedNode) {
      this.root.setHighlightedToFirstCandidate();
    }
  }
  onclick(e) {
    const currTarget = e.currentTarget;
    currTarget.focus();
  }
  onpointerdown(e) {
    if (this.root.opts.disabled.current) return;
    if (e.pointerType === "touch") return e.preventDefault();
    const target = e.target;
    if (target?.hasPointerCapture(e.pointerId)) {
      target?.releasePointerCapture(e.pointerId);
    }
    if (e.button === 0 && e.ctrlKey === false) {
      if (this.root.opts.open.current === false) {
        this.#handlePointerOpen(e);
      } else {
        this.root.handleClose();
      }
    }
  }
  onpointerup(e) {
    if (this.root.opts.disabled.current) return;
    e.preventDefault();
    if (e.pointerType === "touch") {
      if (this.root.opts.open.current === false) {
        this.#handlePointerOpen(e);
      } else {
        this.root.handleClose();
      }
    }
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    disabled: this.root.opts.disabled.current ? true : void 0,
    "aria-haspopup": "listbox",
    "aria-expanded": getAriaExpanded(this.root.opts.open.current),
    "aria-activedescendant": this.root.highlightedId,
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    "data-disabled": getDataDisabled(this.root.opts.disabled.current),
    "data-placeholder": this.root.hasValue ? void 0 : "",
    [this.root.getBitsAttr("trigger")]: "",
    onpointerdown: this.onpointerdown,
    onkeydown: this.onkeydown,
    onclick: this.onclick,
    onpointerup: this.onpointerup,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class SelectContentState {
  static create(opts) {
    return SelectContentContext.set(new SelectContentState(opts, SelectRootContext.get()));
  }
  opts;
  root;
  attachment;
  viewportNode = null;
  isPositioned = false;
  domContext;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(opts.ref, (v) => this.root.contentNode = v);
    this.domContext = new DOMContext(this.opts.ref);
    if (this.root.domContext === null) {
      this.root.domContext = this.domContext;
    }
    watch(() => this.root.opts.open.current, () => {
      if (this.root.opts.open.current) return;
      this.isPositioned = false;
    });
    this.onpointermove = this.onpointermove.bind(this);
  }
  onpointermove(_) {
    this.root.isUsingKeyboard = false;
  }
  #styles = derived(() => {
    return getFloatingContentCSSVars(this.root.isCombobox ? "combobox" : "select");
  });
  onInteractOutside = (e) => {
    if (e.target === this.root.triggerNode || e.target === this.root.inputNode) {
      e.preventDefault();
      return;
    }
    this.opts.onInteractOutside.current(e);
    if (e.defaultPrevented) return;
    this.root.handleClose();
  };
  onEscapeKeydown = (e) => {
    this.opts.onEscapeKeydown.current(e);
    if (e.defaultPrevented) return;
    this.root.handleClose();
  };
  onOpenAutoFocus = (e) => {
    e.preventDefault();
  };
  onCloseAutoFocus = (e) => {
    e.preventDefault();
  };
  #snippetProps = derived(() => ({ open: this.root.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: "listbox",
    "aria-multiselectable": this.root.isMulti ? "true" : void 0,
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    [this.root.getBitsAttr("content")]: "",
    style: {
      display: "flex",
      flexDirection: "column",
      outline: "none",
      boxSizing: "border-box",
      pointerEvents: "auto",
      ...this.#styles()
    },
    onpointermove: this.onpointermove,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
  popperProps = {
    onInteractOutside: this.onInteractOutside,
    onEscapeKeydown: this.onEscapeKeydown,
    onOpenAutoFocus: this.onOpenAutoFocus,
    onCloseAutoFocus: this.onCloseAutoFocus,
    trapFocus: false,
    loop: false,
    onPlaced: () => {
      if (this.root.opts.open.current) {
        this.isPositioned = true;
      }
    }
  };
}
class SelectItemState {
  static create(opts) {
    return new SelectItemState(opts, SelectRootContext.get());
  }
  opts;
  root;
  attachment;
  #isSelected = derived(() => this.root.includesItem(this.opts.value.current));
  get isSelected() {
    return this.#isSelected();
  }
  set isSelected($$value) {
    return this.#isSelected($$value);
  }
  #isHighlighted = derived(() => this.root.highlightedValue === this.opts.value.current);
  get isHighlighted() {
    return this.#isHighlighted();
  }
  set isHighlighted($$value) {
    return this.#isHighlighted($$value);
  }
  prevHighlighted = new Previous(() => this.isHighlighted);
  mounted = false;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(opts.ref);
    watch(
      [
        () => this.isHighlighted,
        () => this.prevHighlighted.current
      ],
      () => {
        if (this.isHighlighted) {
          this.opts.onHighlight.current();
        } else if (this.prevHighlighted.current) {
          this.opts.onUnhighlight.current();
        }
      }
    );
    watch(() => this.mounted, () => {
      if (!this.mounted) return;
      this.root.setInitialHighlightedNode();
    });
    this.onpointerdown = this.onpointerdown.bind(this);
    this.onpointerup = this.onpointerup.bind(this);
    this.onpointermove = this.onpointermove.bind(this);
  }
  handleSelect() {
    if (this.opts.disabled.current) return;
    const isCurrentSelectedValue = this.opts.value.current === this.root.opts.value.current;
    if (!this.root.opts.allowDeselect.current && isCurrentSelectedValue && !this.root.isMulti) {
      this.root.handleClose();
      return;
    }
    this.root.toggleItem(this.opts.value.current, this.opts.label.current);
    if (!this.root.isMulti && !isCurrentSelectedValue) {
      this.root.handleClose();
    }
  }
  #snippetProps = derived(() => ({
    selected: this.isSelected,
    highlighted: this.isHighlighted
  }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  onpointerdown(e) {
    e.preventDefault();
  }
  /**
   * Using `pointerup` instead of `click` allows power users to pointerdown
   * the trigger, then release pointerup on an item to select it vs having to do
   * multiple clicks.
   */
  onpointerup(e) {
    if (e.defaultPrevented || !this.opts.ref.current) return;
    if (e.pointerType === "touch" && !isIOS) {
      on(
        this.opts.ref.current,
        "click",
        () => {
          this.handleSelect();
          this.root.setHighlightedNode(this.opts.ref.current);
        },
        { once: true }
      );
      return;
    }
    e.preventDefault();
    this.handleSelect();
    if (e.pointerType === "touch") {
      this.root.setHighlightedNode(this.opts.ref.current);
    }
  }
  onpointermove(e) {
    if (e.pointerType === "touch") return;
    if (this.root.highlightedNode !== this.opts.ref.current) {
      this.root.setHighlightedNode(this.opts.ref.current);
    }
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: "option",
    "aria-selected": this.root.includesItem(this.opts.value.current) ? "true" : void 0,
    "data-value": this.opts.value.current,
    "data-disabled": getDataDisabled(this.opts.disabled.current),
    "data-highlighted": this.root.highlightedValue === this.opts.value.current && !this.opts.disabled.current ? "" : void 0,
    "data-selected": this.root.includesItem(this.opts.value.current) ? "" : void 0,
    "data-label": this.opts.label.current,
    [this.root.getBitsAttr("item")]: "",
    onpointermove: this.onpointermove,
    onpointerdown: this.onpointerdown,
    onpointerup: this.onpointerup,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class SelectHiddenInputState {
  static create(opts) {
    return new SelectHiddenInputState(opts, SelectRootContext.get());
  }
  opts;
  root;
  #shouldRender = derived(() => this.root.opts.name.current !== "");
  get shouldRender() {
    return this.#shouldRender();
  }
  set shouldRender($$value) {
    return this.#shouldRender($$value);
  }
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.onfocus = this.onfocus.bind(this);
  }
  onfocus(e) {
    e.preventDefault();
    if (!this.root.isCombobox) {
      this.root.triggerNode?.focus();
    } else {
      this.root.inputNode?.focus();
    }
  }
  #props = derived(() => ({
    disabled: getDisabled(this.root.opts.disabled.current),
    required: getRequired(this.root.opts.required.current),
    name: this.root.opts.name.current,
    value: this.opts.value.current,
    onfocus: this.onfocus
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class SelectViewportState {
  static create(opts) {
    return new SelectViewportState(opts, SelectContentContext.get());
  }
  opts;
  content;
  root;
  attachment;
  prevScrollTop = 0;
  constructor(opts, content) {
    this.opts = opts;
    this.content = content;
    this.root = content.root;
    this.attachment = attachRef(opts.ref, (v) => this.content.viewportNode = v);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: "presentation",
    [this.root.getBitsAttr("viewport")]: "",
    style: {
      // we use position: 'relative' here on the `viewport` so that when we call
      // `selectedItem.offsetTop` in calculations, the offset is relative to the viewport
      // (independent of the scrollUpButton).
      position: "relative",
      flex: 1,
      overflow: "auto"
    },
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class SelectScrollButtonImplState {
  opts;
  content;
  root;
  attachment;
  autoScrollTimer = null;
  userScrollTimer = -1;
  isUserScrolling = false;
  onAutoScroll = noop;
  mounted = false;
  constructor(opts, content) {
    this.opts = opts;
    this.content = content;
    this.root = content.root;
    this.attachment = attachRef(opts.ref);
    watch([() => this.mounted], () => {
      if (!this.mounted) {
        this.isUserScrolling = false;
        return;
      }
      if (this.isUserScrolling) return;
    });
    this.onpointerdown = this.onpointerdown.bind(this);
    this.onpointermove = this.onpointermove.bind(this);
    this.onpointerleave = this.onpointerleave.bind(this);
  }
  handleUserScroll() {
    this.content.domContext.clearTimeout(this.userScrollTimer);
    this.isUserScrolling = true;
    this.userScrollTimer = this.content.domContext.setTimeout(
      () => {
        this.isUserScrolling = false;
      },
      200
    );
  }
  clearAutoScrollInterval() {
    if (this.autoScrollTimer === null) return;
    this.content.domContext.clearTimeout(this.autoScrollTimer);
    this.autoScrollTimer = null;
  }
  onpointerdown(_) {
    if (this.autoScrollTimer !== null) return;
    const autoScroll = (tick2) => {
      this.onAutoScroll();
      this.autoScrollTimer = this.content.domContext.setTimeout(() => autoScroll(tick2 + 1), this.opts.delay.current(tick2));
    };
    this.autoScrollTimer = this.content.domContext.setTimeout(() => autoScroll(1), this.opts.delay.current(0));
  }
  onpointermove(e) {
    this.onpointerdown(e);
  }
  onpointerleave(_) {
    this.clearAutoScrollInterval();
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    "aria-hidden": getAriaHidden(true),
    style: { flexShrink: 0 },
    onpointerdown: this.onpointerdown,
    onpointermove: this.onpointermove,
    onpointerleave: this.onpointerleave,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class SelectScrollDownButtonState {
  static create(opts) {
    return new SelectScrollDownButtonState(new SelectScrollButtonImplState(opts, SelectContentContext.get()));
  }
  scrollButtonState;
  content;
  root;
  canScrollDown = false;
  scrollIntoViewTimer = null;
  constructor(scrollButtonState) {
    this.scrollButtonState = scrollButtonState;
    this.content = scrollButtonState.content;
    this.root = scrollButtonState.root;
    this.scrollButtonState.onAutoScroll = this.handleAutoScroll;
    watch(
      [
        () => this.content.viewportNode,
        () => this.content.isPositioned
      ],
      () => {
        if (!this.content.viewportNode || !this.content.isPositioned) return;
        this.handleScroll(true);
        return on(this.content.viewportNode, "scroll", () => this.handleScroll());
      }
    );
    watch(() => this.scrollButtonState.mounted, () => {
      if (!this.scrollButtonState.mounted) return;
      if (this.scrollIntoViewTimer) {
        clearTimeout(this.scrollIntoViewTimer);
      }
      this.scrollIntoViewTimer = afterSleep(5, () => {
        const activeItem = this.root.highlightedNode;
        activeItem?.scrollIntoView({ block: this.root.opts.scrollAlignment.current });
      });
    });
  }
  /**
   * @param manual - if true, it means the function was invoked manually outside of an event
   * listener, so we don't call `handleUserScroll` to prevent the auto scroll from kicking in.
   */
  handleScroll = (manual = false) => {
    if (!manual) {
      this.scrollButtonState.handleUserScroll();
    }
    if (!this.content.viewportNode) return;
    const maxScroll = this.content.viewportNode.scrollHeight - this.content.viewportNode.clientHeight;
    const paddingTop = Number.parseInt(getComputedStyle(this.content.viewportNode).paddingTop, 10);
    this.canScrollDown = Math.ceil(this.content.viewportNode.scrollTop) < maxScroll - paddingTop;
  };
  handleAutoScroll = () => {
    const viewport = this.content.viewportNode;
    const selectedItem = this.root.highlightedNode;
    if (!viewport || !selectedItem) return;
    viewport.scrollTop = viewport.scrollTop + selectedItem.offsetHeight;
  };
  #props = derived(() => ({
    ...this.scrollButtonState.props,
    [this.root.getBitsAttr("scroll-down-button")]: ""
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class SelectScrollUpButtonState {
  static create(opts) {
    return new SelectScrollUpButtonState(new SelectScrollButtonImplState(opts, SelectContentContext.get()));
  }
  scrollButtonState;
  content;
  root;
  canScrollUp = false;
  constructor(scrollButtonState) {
    this.scrollButtonState = scrollButtonState;
    this.content = scrollButtonState.content;
    this.root = scrollButtonState.root;
    this.scrollButtonState.onAutoScroll = this.handleAutoScroll;
    watch(
      [
        () => this.content.viewportNode,
        () => this.content.isPositioned
      ],
      () => {
        if (!this.content.viewportNode || !this.content.isPositioned) return;
        this.handleScroll(true);
        return on(this.content.viewportNode, "scroll", () => this.handleScroll());
      }
    );
  }
  /**
   * @param manual - if true, it means the function was invoked manually outside of an event
   * listener, so we don't call `handleUserScroll` to prevent the auto scroll from kicking in.
   */
  handleScroll = (manual = false) => {
    if (!manual) {
      this.scrollButtonState.handleUserScroll();
    }
    if (!this.content.viewportNode) return;
    const paddingTop = Number.parseInt(getComputedStyle(this.content.viewportNode).paddingTop, 10);
    this.canScrollUp = this.content.viewportNode.scrollTop - paddingTop > 0.1;
  };
  handleAutoScroll = () => {
    if (!this.content.viewportNode || !this.root.highlightedNode) return;
    this.content.viewportNode.scrollTop = this.content.viewportNode.scrollTop - this.root.highlightedNode.offsetHeight;
  };
  #props = derived(() => ({
    ...this.scrollButtonState.props,
    [this.root.getBitsAttr("scroll-up-button")]: ""
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Select_hidden_input($$payload, $$props) {
  push();
  let { value = "", autocomplete } = $$props;
  const hiddenInputState = SelectHiddenInputState.create({ value: box.with(() => value) });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (hiddenInputState.shouldRender) {
      $$payload2.out += "<!--[-->";
      Hidden_input($$payload2, spread_props([
        hiddenInputState.props,
        {
          autocomplete,
          get value() {
            return value;
          },
          set value($$value) {
            value = $$value;
            $$settled = false;
          }
        }
      ]));
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { value });
  pop();
}
function Floating_layer_anchor($$payload, $$props) {
  push();
  let {
    id,
    children,
    virtualEl,
    ref,
    tooltip = false
  } = $$props;
  FloatingAnchorState.create(
    {
      id: box.with(() => id),
      virtualEl: box.with(() => virtualEl),
      ref
    },
    tooltip
  );
  children?.($$payload);
  $$payload.out += `<!---->`;
  pop();
}
function Arrow$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    children,
    child,
    width = 10,
    height = 5,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const mergedProps = mergeProps(restProps, { id });
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<span${spread_attributes({ ...mergedProps }, null)}>`;
    if (children) {
      $$payload.out += "<!--[-->";
      children?.($$payload);
      $$payload.out += `<!---->`;
    } else {
      $$payload.out += "<!--[!-->";
      $$payload.out += `<svg${attr("width", width)}${attr("height", height)} viewBox="0 0 30 10" preserveAspectRatio="none" data-arrow=""><polygon points="0,0 30,0 15,10" fill="currentColor"></polygon></svg>`;
    }
    $$payload.out += `<!--]--></span>`;
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function Floating_layer_arrow($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const arrowState = FloatingArrowState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, arrowState.props);
  Arrow$1($$payload, spread_props([mergedProps]));
  bind_props($$props, { ref });
  pop();
}
function Floating_layer_content($$payload, $$props) {
  push();
  let {
    content,
    side = "bottom",
    sideOffset = 0,
    align = "center",
    alignOffset = 0,
    id,
    arrowPadding = 0,
    avoidCollisions = true,
    collisionBoundary = [],
    collisionPadding = 0,
    hideWhenDetached = false,
    onPlaced = () => {
    },
    sticky = "partial",
    updatePositionStrategy = "optimized",
    strategy = "fixed",
    dir = "ltr",
    style = {},
    wrapperId = useId(),
    customAnchor = null,
    enabled,
    tooltip = false
  } = $$props;
  const contentState = FloatingContentState.create(
    {
      side: box.with(() => side),
      sideOffset: box.with(() => sideOffset),
      align: box.with(() => align),
      alignOffset: box.with(() => alignOffset),
      id: box.with(() => id),
      arrowPadding: box.with(() => arrowPadding),
      avoidCollisions: box.with(() => avoidCollisions),
      collisionBoundary: box.with(() => collisionBoundary),
      collisionPadding: box.with(() => collisionPadding),
      hideWhenDetached: box.with(() => hideWhenDetached),
      onPlaced: box.with(() => onPlaced),
      sticky: box.with(() => sticky),
      updatePositionStrategy: box.with(() => updatePositionStrategy),
      strategy: box.with(() => strategy),
      dir: box.with(() => dir),
      style: box.with(() => style),
      enabled: box.with(() => enabled),
      wrapperId: box.with(() => wrapperId),
      customAnchor: box.with(() => customAnchor)
    },
    tooltip
  );
  const mergedProps = mergeProps(contentState.wrapperProps, { style: { pointerEvents: "auto" } });
  content?.($$payload, {
    props: contentState.props,
    wrapperProps: mergedProps
  });
  $$payload.out += `<!---->`;
  pop();
}
function Floating_layer_content_static($$payload, $$props) {
  push();
  let { content } = $$props;
  content?.($$payload, { props: {}, wrapperProps: {} });
  $$payload.out += `<!---->`;
  pop();
}
const separatorAttrs = createBitsAttrs({ component: "separator", parts: ["root"] });
class SeparatorRootState {
  static create(opts) {
    return new SeparatorRootState(opts);
  }
  opts;
  attachment;
  constructor(opts) {
    this.opts = opts;
    this.attachment = attachRef(opts.ref);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: this.opts.decorative.current ? "none" : "separator",
    "aria-orientation": getAriaOrientation(this.opts.orientation.current),
    "aria-hidden": getAriaHidden(this.opts.decorative.current),
    "data-orientation": getDataOrientation(this.opts.orientation.current),
    [separatorAttrs.root]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Separator$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    child,
    children,
    decorative = false,
    orientation = "horizontal",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = SeparatorRootState.create({
    ref: box.with(() => ref, (v) => ref = v),
    id: box.with(() => id),
    decorative: box.with(() => decorative),
    orientation: box.with(() => orientation)
  });
  const mergedProps = mergeProps(restProps, rootState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Popper_content($$payload, $$props) {
  let {
    content,
    isStatic = false,
    onPlaced,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  if (isStatic) {
    $$payload.out += "<!--[-->";
    Floating_layer_content_static($$payload, { content });
  } else {
    $$payload.out += "<!--[!-->";
    Floating_layer_content($$payload, spread_props([{ content, onPlaced }, restProps]));
  }
  $$payload.out += `<!--]-->`;
}
function Popper_layer_inner($$payload, $$props) {
  push();
  let {
    popper,
    onEscapeKeydown,
    escapeKeydownBehavior,
    preventOverflowTextSelection,
    id,
    onPointerDown,
    onPointerUp,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    sticky,
    hideWhenDetached,
    updatePositionStrategy,
    strategy,
    dir,
    preventScroll,
    wrapperId,
    style,
    onPlaced,
    onInteractOutside,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onFocusOutside,
    interactOutsideBehavior = "close",
    loop,
    trapFocus = true,
    isValidEvent: isValidEvent2 = () => false,
    customAnchor = null,
    isStatic = false,
    enabled,
    ref,
    tooltip = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  {
    let content = function($$payload2, { props: floatingProps, wrapperProps }) {
      if (restProps.forceMount && enabled) {
        $$payload2.out += "<!--[-->";
        Scroll_lock($$payload2, { preventScroll });
      } else if (!restProps.forceMount) {
        $$payload2.out += "<!--[1-->";
        Scroll_lock($$payload2, { preventScroll });
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]--> `;
      {
        let focusScope = function($$payload3, { props: focusScopeProps }) {
          Escape_layer($$payload3, {
            onEscapeKeydown,
            escapeKeydownBehavior,
            enabled,
            ref,
            children: ($$payload4) => {
              {
                let children = function($$payload5, { props: dismissibleProps }) {
                  Text_selection_layer($$payload5, {
                    id,
                    preventOverflowTextSelection,
                    onPointerDown,
                    onPointerUp,
                    enabled,
                    ref,
                    children: ($$payload6) => {
                      popper?.($$payload6, {
                        props: mergeProps(restProps, floatingProps, dismissibleProps, focusScopeProps, { style: { pointerEvents: "auto" } }),
                        wrapperProps
                      });
                      $$payload6.out += `<!---->`;
                    }
                  });
                };
                Dismissible_layer($$payload4, {
                  id,
                  onInteractOutside,
                  onFocusOutside,
                  interactOutsideBehavior,
                  isValidEvent: isValidEvent2,
                  enabled,
                  ref,
                  children
                });
              }
            }
          });
        };
        Focus_scope($$payload2, {
          onOpenAutoFocus,
          onCloseAutoFocus,
          loop,
          enabled,
          trapFocus,
          forceMount: restProps.forceMount,
          ref,
          focusScope
        });
      }
      $$payload2.out += `<!---->`;
    };
    Popper_content($$payload, {
      isStatic,
      id,
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      avoidCollisions,
      collisionBoundary,
      collisionPadding,
      sticky,
      hideWhenDetached,
      updatePositionStrategy,
      strategy,
      dir,
      wrapperId,
      style,
      onPlaced,
      customAnchor,
      enabled,
      tooltip,
      content,
      $$slots: { content: true }
    });
  }
  pop();
}
function Popper_layer($$payload, $$props) {
  let {
    popper,
    open,
    onEscapeKeydown,
    escapeKeydownBehavior,
    preventOverflowTextSelection,
    id,
    onPointerDown,
    onPointerUp,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    sticky,
    hideWhenDetached,
    updatePositionStrategy,
    strategy,
    dir,
    preventScroll,
    wrapperId,
    style,
    onPlaced,
    onInteractOutside,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onFocusOutside,
    interactOutsideBehavior = "close",
    loop,
    trapFocus = true,
    isValidEvent: isValidEvent2 = () => false,
    customAnchor = null,
    isStatic = false,
    ref,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  {
    let presence = function($$payload2) {
      Popper_layer_inner($$payload2, spread_props([
        {
          popper,
          onEscapeKeydown,
          escapeKeydownBehavior,
          preventOverflowTextSelection,
          id,
          onPointerDown,
          onPointerUp,
          side,
          sideOffset,
          align,
          alignOffset,
          arrowPadding,
          avoidCollisions,
          collisionBoundary,
          collisionPadding,
          sticky,
          hideWhenDetached,
          updatePositionStrategy,
          strategy,
          dir,
          preventScroll,
          wrapperId,
          style,
          onPlaced,
          customAnchor,
          isStatic,
          enabled: open,
          onInteractOutside,
          onCloseAutoFocus,
          onOpenAutoFocus,
          interactOutsideBehavior,
          loop,
          trapFocus,
          isValidEvent: isValidEvent2,
          onFocusOutside,
          forceMount: false,
          ref
        },
        restProps
      ]));
    };
    Presence_layer($$payload, {
      open,
      ref,
      presence
    });
  }
}
function Popper_layer_force_mount($$payload, $$props) {
  let {
    popper,
    onEscapeKeydown,
    escapeKeydownBehavior,
    preventOverflowTextSelection,
    id,
    onPointerDown,
    onPointerUp,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    sticky,
    hideWhenDetached,
    updatePositionStrategy,
    strategy,
    dir,
    preventScroll,
    wrapperId,
    style,
    onPlaced,
    onInteractOutside,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onFocusOutside,
    interactOutsideBehavior = "close",
    loop,
    trapFocus = true,
    isValidEvent: isValidEvent2 = () => false,
    customAnchor = null,
    isStatic = false,
    enabled,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  Popper_layer_inner($$payload, spread_props([
    {
      popper,
      onEscapeKeydown,
      escapeKeydownBehavior,
      preventOverflowTextSelection,
      id,
      onPointerDown,
      onPointerUp,
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      avoidCollisions,
      collisionBoundary,
      collisionPadding,
      sticky,
      hideWhenDetached,
      updatePositionStrategy,
      strategy,
      dir,
      preventScroll,
      wrapperId,
      style,
      onPlaced,
      customAnchor,
      isStatic,
      enabled,
      onInteractOutside,
      onCloseAutoFocus,
      onOpenAutoFocus,
      interactOutsideBehavior,
      loop,
      trapFocus,
      isValidEvent: isValidEvent2,
      onFocusOutside
    },
    restProps,
    { forceMount: true }
  ]));
}
function Select_content$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    forceMount = false,
    side = "bottom",
    onInteractOutside = noop,
    onEscapeKeydown = noop,
    children,
    child,
    preventScroll = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = SelectContentState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    onInteractOutside: box.with(() => onInteractOutside),
    onEscapeKeydown: box.with(() => onEscapeKeydown)
  });
  const mergedProps = mergeProps(restProps, contentState.props);
  if (forceMount) {
    $$payload.out += "<!--[-->";
    {
      let popper = function($$payload2, { props, wrapperProps }) {
        const finalProps = mergeProps(props, { style: contentState.props.style });
        if (child) {
          $$payload2.out += "<!--[-->";
          child($$payload2, {
            props: finalProps,
            wrapperProps,
            ...contentState.snippetProps
          });
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<div${spread_attributes({ ...wrapperProps }, null)}><div${spread_attributes({ ...finalProps }, null)}>`;
          children?.($$payload2);
          $$payload2.out += `<!----></div></div>`;
        }
        $$payload2.out += `<!--]-->`;
      };
      Popper_layer_force_mount($$payload, spread_props([
        mergedProps,
        contentState.popperProps,
        {
          ref: contentState.opts.ref,
          side,
          enabled: contentState.root.opts.open.current,
          id,
          preventScroll,
          forceMount: true,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else if (!forceMount) {
    $$payload.out += "<!--[1-->";
    {
      let popper = function($$payload2, { props, wrapperProps }) {
        const finalProps = mergeProps(props, { style: contentState.props.style });
        if (child) {
          $$payload2.out += "<!--[-->";
          child($$payload2, {
            props: finalProps,
            wrapperProps,
            ...contentState.snippetProps
          });
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<div${spread_attributes({ ...wrapperProps }, null)}><div${spread_attributes({ ...finalProps }, null)}>`;
          children?.($$payload2);
          $$payload2.out += `<!----></div></div>`;
        }
        $$payload2.out += `<!--]-->`;
      };
      Popper_layer($$payload, spread_props([
        mergedProps,
        contentState.popperProps,
        {
          ref: contentState.opts.ref,
          side,
          open: contentState.root.opts.open.current,
          id,
          preventScroll,
          forceMount: false,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Mounted($$payload, $$props) {
  push();
  let { mounted = false, onMountedChange = noop } = $$props;
  bind_props($$props, { mounted });
  pop();
}
function Select_item$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    value,
    label = value,
    disabled = false,
    children,
    child,
    onHighlight = noop,
    onUnhighlight = noop,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const itemState = SelectItemState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    value: box.with(() => value),
    disabled: box.with(() => disabled),
    label: box.with(() => label),
    onHighlight: box.with(() => onHighlight),
    onUnhighlight: box.with(() => onUnhighlight)
  });
  const mergedProps = mergeProps(restProps, itemState.props);
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (child) {
      $$payload2.out += "<!--[-->";
      child($$payload2, { props: mergedProps, ...itemState.snippetProps });
      $$payload2.out += `<!---->`;
    } else {
      $$payload2.out += "<!--[!-->";
      $$payload2.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
      children?.($$payload2, itemState.snippetProps);
      $$payload2.out += `<!----></div>`;
    }
    $$payload2.out += `<!--]--> `;
    Mounted($$payload2, {
      get mounted() {
        return itemState.mounted;
      },
      set mounted($$value) {
        itemState.mounted = $$value;
        $$settled = false;
      }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select_viewport($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const viewportState = SelectViewportState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, viewportState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Select_scroll_down_button$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    delay = () => 50,
    child,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollButtonState = SelectScrollDownButtonState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    delay: box.with(() => delay)
  });
  const mergedProps = mergeProps(restProps, scrollButtonState.props);
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (scrollButtonState.canScrollDown) {
      $$payload2.out += "<!--[-->";
      Mounted($$payload2, {
        get mounted() {
          return scrollButtonState.scrollButtonState.mounted;
        },
        set mounted($$value) {
          scrollButtonState.scrollButtonState.mounted = $$value;
          $$settled = false;
        }
      });
      $$payload2.out += `<!----> `;
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, { props: restProps });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
        children?.($$payload2);
        $$payload2.out += `<!----></div>`;
      }
      $$payload2.out += `<!--]-->`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select_scroll_up_button$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    delay = () => 50,
    child,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollButtonState = SelectScrollUpButtonState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    delay: box.with(() => delay)
  });
  const mergedProps = mergeProps(restProps, scrollButtonState.props);
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (scrollButtonState.canScrollUp) {
      $$payload2.out += "<!--[-->";
      Mounted($$payload2, {
        get mounted() {
          return scrollButtonState.scrollButtonState.mounted;
        },
        set mounted($$value) {
          scrollButtonState.scrollButtonState.mounted = $$value;
          $$settled = false;
        }
      });
      $$payload2.out += `<!----> `;
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, { props: restProps });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
        children?.($$payload2);
        $$payload2.out += `<!----></div>`;
      }
      $$payload2.out += `<!--]-->`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function findNextSibling(el, selector) {
  let sibling = el.nextElementSibling;
  while (sibling) {
    if (sibling.matches(selector))
      return sibling;
    sibling = sibling.nextElementSibling;
  }
}
function findPreviousSibling(el, selector) {
  let sibling = el.previousElementSibling;
  while (sibling) {
    if (sibling.matches(selector))
      return sibling;
    sibling = sibling.previousElementSibling;
  }
}
function cssEscape(value) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  const length = value.length;
  let index = -1;
  let codeUnit;
  let result = "";
  const firstCodeUnit = value.charCodeAt(0);
  if (length === 1 && firstCodeUnit === 45)
    return "\\" + value;
  while (++index < length) {
    codeUnit = value.charCodeAt(index);
    if (codeUnit === 0) {
      result += "�";
      continue;
    }
    if (
      // If the character is in the range [\1-\1F] (U+0001 to U+001F) or is U+007F
      codeUnit >= 1 && codeUnit <= 31 || codeUnit === 127 || // If the character is the first character and is in the range [0-9] (U+0030 to U+0039)
      index === 0 && codeUnit >= 48 && codeUnit <= 57 || // If the character is the second character and is in the range [0-9] (U+0030 to U+0039)
      // and the first character is a `-` (U+002D)
      index === 1 && codeUnit >= 48 && codeUnit <= 57 && firstCodeUnit === 45
    ) {
      result += "\\" + codeUnit.toString(16) + " ";
      continue;
    }
    if (codeUnit >= 128 || codeUnit === 45 || codeUnit === 95 || codeUnit >= 48 && codeUnit <= 57 || codeUnit >= 65 && codeUnit <= 90 || codeUnit >= 97 && codeUnit <= 122) {
      result += value.charAt(index);
      continue;
    }
    result += "\\" + value.charAt(index);
  }
  return result;
}
const COMMAND_VALUE_ATTR = "data-value";
const commandAttrs = createBitsAttrs({
  component: "command",
  parts: [
    "root",
    "list",
    "input",
    "separator",
    "loading",
    "empty",
    "group",
    "group-items",
    "group-heading",
    "item",
    "viewport",
    "input-label"
  ]
});
const COMMAND_GROUP_SELECTOR = commandAttrs.selector("group");
const COMMAND_GROUP_ITEMS_SELECTOR = commandAttrs.selector("group-items");
const COMMAND_GROUP_HEADING_SELECTOR = commandAttrs.selector("group-heading");
const COMMAND_ITEM_SELECTOR = commandAttrs.selector("item");
const COMMAND_VALID_ITEM_SELECTOR = `${commandAttrs.selector("item")}:not([aria-disabled="true"])`;
const CommandRootContext = new Context("Command.Root");
const CommandListContext = new Context("Command.List");
const CommandGroupContainerContext = new Context("Command.Group");
const defaultState = {
  /** Value of the search query */
  search: "",
  /** Currently selected item value */
  value: "",
  filtered: {
    /** The count of all visible items. */
    count: 0,
    /** Map from visible item id to its search store. */
    items: /* @__PURE__ */ new Map(),
    /** Set of groups with at least one visible item. */
    groups: /* @__PURE__ */ new Set()
  }
};
class CommandRootState {
  static create(opts) {
    return CommandRootContext.set(new CommandRootState(opts));
  }
  opts;
  attachment;
  #updateScheduled = false;
  #isInitialMount = true;
  sortAfterTick = false;
  sortAndFilterAfterTick = false;
  allItems = /* @__PURE__ */ new Set();
  allGroups = /* @__PURE__ */ new Map();
  allIds = /* @__PURE__ */ new Map();
  // attempt to prevent the harsh delay when user is typing fast
  key = 0;
  viewportNode = null;
  inputNode = null;
  labelNode = null;
  // published state that the components and other things can react to
  commandState = defaultState;
  // internal state that we mutate in batches and publish to the `state` at once
  _commandState = defaultState;
  #snapshot() {
    return snapshot(this._commandState);
  }
  #scheduleUpdate() {
    if (this.#updateScheduled) return;
    this.#updateScheduled = true;
    afterTick(() => {
      this.#updateScheduled = false;
      const currentState = this.#snapshot();
      const hasStateChanged = !Object.is(this.commandState, currentState);
      if (hasStateChanged) {
        this.commandState = currentState;
        this.opts.onStateChange?.current?.(currentState);
      }
    });
  }
  setState(key, value, preventScroll) {
    if (Object.is(this._commandState[key], value)) return;
    this._commandState[key] = value;
    if (key === "search") {
      this.#filterItems();
      this.#sort();
    } else if (key === "value") {
      if (!preventScroll) this.#scrollSelectedIntoView();
    }
    this.#scheduleUpdate();
  }
  constructor(opts) {
    this.opts = opts;
    this.attachment = attachRef(this.opts.ref);
    const defaults = {
      ...this._commandState,
      value: this.opts.value.current ?? ""
    };
    this._commandState = defaults;
    this.commandState = defaults;
    this.onkeydown = this.onkeydown.bind(this);
  }
  /**
   * Calculates score for an item based on search text and keywords.
   * Higher score = better match.
   *
   * @param value - Item's display text
   * @param keywords - Optional keywords to boost scoring
   * @returns Score from 0-1, where 0 = no match
   */
  #score(value, keywords) {
    const filter = this.opts.filter.current ?? computeCommandScore;
    const score = value ? filter(value, this._commandState.search, keywords) : 0;
    return score;
  }
  /**
   * Sorts items and groups based on search scores.
   * Groups are sorted by their highest scoring item.
   * When no search active, selects first item.
   */
  #sort() {
    if (!this._commandState.search || this.opts.shouldFilter.current === false) {
      this.#selectFirstItem();
      return;
    }
    const scores = this._commandState.filtered.items;
    const groups = [];
    for (const value of this._commandState.filtered.groups) {
      const items = this.allGroups.get(value);
      let max = 0;
      if (!items) {
        groups.push([value, max]);
        continue;
      }
      for (const item of items) {
        const score = scores.get(item);
        max = Math.max(score ?? 0, max);
      }
      groups.push([value, max]);
    }
    const listInsertionElement = this.viewportNode;
    const sorted = this.getValidItems().sort((a, b) => {
      const valueA = a.getAttribute("data-value");
      const valueB = b.getAttribute("data-value");
      const scoresA = scores.get(valueA) ?? 0;
      const scoresB = scores.get(valueB) ?? 0;
      return scoresB - scoresA;
    });
    for (const item of sorted) {
      const group = item.closest(COMMAND_GROUP_ITEMS_SELECTOR);
      if (group) {
        const itemToAppend = item.parentElement === group ? item : item.closest(`${COMMAND_GROUP_ITEMS_SELECTOR} > *`);
        if (itemToAppend) {
          group.appendChild(itemToAppend);
        }
      } else {
        const itemToAppend = item.parentElement === listInsertionElement ? item : item.closest(`${COMMAND_GROUP_ITEMS_SELECTOR} > *`);
        if (itemToAppend) {
          listInsertionElement?.appendChild(itemToAppend);
        }
      }
    }
    const sortedGroups = groups.sort((a, b) => b[1] - a[1]);
    for (const group of sortedGroups) {
      const element2 = listInsertionElement?.querySelector(`${COMMAND_GROUP_SELECTOR}[${COMMAND_VALUE_ATTR}="${cssEscape(group[0])}"]`);
      element2?.parentElement?.appendChild(element2);
    }
    this.#selectFirstItem();
  }
  /**
   * Sets current value and triggers re-render if cleared.
   *
   * @param value - New value to set
   */
  setValue(value, opts) {
    if (value !== this.opts.value.current && value === "") {
      afterTick(() => {
        this.key++;
      });
    }
    this.setState("value", value, opts);
    this.opts.value.current = value;
  }
  /**
   * Selects first non-disabled item on next tick.
   */
  #selectFirstItem() {
    afterTick(() => {
      const item = this.getValidItems().find((item2) => item2.getAttribute("aria-disabled") !== "true");
      const value = item?.getAttribute(COMMAND_VALUE_ATTR);
      const shouldPreventScroll = this.#isInitialMount && this.opts.disableInitialScroll.current;
      this.setValue(value ?? "", shouldPreventScroll);
      this.#isInitialMount = false;
    });
  }
  /**
   * Updates filtered items/groups based on search.
   * Recalculates scores and filtered count.
   */
  #filterItems() {
    if (!this._commandState.search || this.opts.shouldFilter.current === false) {
      this._commandState.filtered.count = this.allItems.size;
      return;
    }
    this._commandState.filtered.groups = /* @__PURE__ */ new Set();
    let itemCount = 0;
    for (const id of this.allItems) {
      const value = this.allIds.get(id)?.value ?? "";
      const keywords = this.allIds.get(id)?.keywords ?? [];
      const rank = this.#score(value, keywords);
      this._commandState.filtered.items.set(id, rank);
      if (rank > 0) itemCount++;
    }
    for (const [groupId, group] of this.allGroups) {
      for (const itemId of group) {
        const currItem = this._commandState.filtered.items.get(itemId);
        if (currItem && currItem > 0) {
          this._commandState.filtered.groups.add(groupId);
          break;
        }
      }
    }
    this._commandState.filtered.count = itemCount;
  }
  /**
   * Gets all non-disabled, visible command items.
   *
   * @returns Array of valid item elements
   * @remarks Exposed for direct item access and bound checking
   */
  getValidItems() {
    const node = this.opts.ref.current;
    if (!node) return [];
    const validItems = Array.from(node.querySelectorAll(COMMAND_VALID_ITEM_SELECTOR)).filter((el) => !!el);
    return validItems;
  }
  /**
   * Gets all visible command items.
   *
   * @returns Array of valid item elements
   * @remarks Exposed for direct item access and bound checking
   */
  getVisibleItems() {
    const node = this.opts.ref.current;
    if (!node) return [];
    const visibleItems = Array.from(node.querySelectorAll(COMMAND_ITEM_SELECTOR)).filter((el) => !!el);
    return visibleItems;
  }
  /** Returns all visible items in a matrix structure
   *
   * @remarks Returns empty if the command isn't configured as a grid
   *
   * @returns
   */
  get itemsGrid() {
    if (!this.isGrid) return [];
    const columns = this.opts.columns.current ?? 1;
    const items = this.getVisibleItems();
    const grid = [[]];
    let currentGroup = items[0]?.getAttribute("data-group");
    let column = 0;
    let row = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemGroup = item?.getAttribute("data-group");
      if (currentGroup !== itemGroup) {
        currentGroup = itemGroup;
        column = 1;
        row++;
        grid.push([{ index: i, firstRowOfGroup: true, ref: item }]);
      } else {
        column++;
        if (column > columns) {
          row++;
          column = 1;
          grid.push([]);
        }
        grid[row]?.push({
          index: i,
          firstRowOfGroup: grid[row]?.[0]?.firstRowOfGroup ?? i === 0,
          ref: item
        });
      }
    }
    return grid;
  }
  /**
   * Gets currently selected command item.
   *
   * @returns Selected element or undefined
   */
  #getSelectedItem() {
    const node = this.opts.ref.current;
    if (!node) return;
    const selectedNode = node.querySelector(`${COMMAND_VALID_ITEM_SELECTOR}[data-selected]`);
    if (!selectedNode) return;
    return selectedNode;
  }
  /**
   * Scrolls selected item into view.
   * Special handling for first items in groups.
   */
  #scrollSelectedIntoView() {
    afterTick(() => {
      const item = this.#getSelectedItem();
      if (!item) return;
      const grandparent = item.parentElement?.parentElement;
      if (!grandparent) return;
      if (this.isGrid) {
        const isFirstRowOfGroup = this.#itemIsFirstRowOfGroup(item);
        item.scrollIntoView({ block: "nearest" });
        if (isFirstRowOfGroup) {
          const closestGroupHeader = item?.closest(COMMAND_GROUP_SELECTOR)?.querySelector(COMMAND_GROUP_HEADING_SELECTOR);
          closestGroupHeader?.scrollIntoView({ block: "nearest" });
          return;
        }
      } else {
        const firstChildOfParent = getFirstNonCommentChild(grandparent);
        if (firstChildOfParent && firstChildOfParent.dataset?.value === item.dataset?.value) {
          const closestGroupHeader = item?.closest(COMMAND_GROUP_SELECTOR)?.querySelector(COMMAND_GROUP_HEADING_SELECTOR);
          closestGroupHeader?.scrollIntoView({ block: "nearest" });
          return;
        }
      }
      item.scrollIntoView({ block: "nearest" });
    });
  }
  #itemIsFirstRowOfGroup(item) {
    const grid = this.itemsGrid;
    if (grid.length === 0) return false;
    for (let r = 0; r < grid.length; r++) {
      const row = grid[r];
      if (row === void 0) continue;
      for (let c = 0; c < row.length; c++) {
        const column = row[c];
        if (column === void 0 || column.ref !== item) continue;
        return column.firstRowOfGroup;
      }
    }
    return false;
  }
  /**
   * Sets selection to item at specified index in valid items array.
   * If index is out of bounds, does nothing.
   *
   * @param index - Zero-based index of item to select
   * @remarks
   * Uses `getValidItems()` to get selectable items, filtering out disabled/hidden ones.
   * Access valid items directly via `getValidItems()` to check bounds before calling.
   *
   * @example
   * // get valid items length for bounds check
   * const items = getValidItems()
   * if (index < items.length) {
   *   updateSelectedToIndex(index)
   * }
   */
  updateSelectedToIndex(index) {
    const item = this.getValidItems()[index];
    if (!item) return;
    this.setValue(item.getAttribute(COMMAND_VALUE_ATTR) ?? "");
  }
  /**
   * Updates selected item by moving up/down relative to current selection.
   * Handles wrapping when loop option is enabled.
   *
   * @param change - Direction to move: 1 for next item, -1 for previous item
   * @remarks
   * The loop behavior wraps:
   * - From last item to first when moving next
   * - From first item to last when moving previous
   *
   * Uses `getValidItems()` to get all selectable items, which filters out disabled/hidden items.
   * You can call `getValidItems()` directly to get the current valid items array.
   *
   * @example
   * // select next item
   * updateSelectedByItem(1)
   *
   * // get all valid items
   * const items = getValidItems()
   */
  updateSelectedByItem(change) {
    const selected = this.#getSelectedItem();
    const items = this.getValidItems();
    const index = items.findIndex((item) => item === selected);
    let newSelected = items[index + change];
    if (this.opts.loop.current) {
      newSelected = index + change < 0 ? items[items.length - 1] : index + change === items.length ? items[0] : items[index + change];
    }
    if (newSelected) {
      this.setValue(newSelected.getAttribute(COMMAND_VALUE_ATTR) ?? "");
    }
  }
  /**
   * Moves selection to the first valid item in the next/previous group.
   * If no group is found, falls back to selecting the next/previous item globally.
   *
   * @param change - Direction to move: 1 for next group, -1 for previous group
   * @example
   * // move to first item in next group
   * updateSelectedByGroup(1)
   *
   * // move to first item in previous group
   * updateSelectedByGroup(-1)
   */
  updateSelectedByGroup(change) {
    const selected = this.#getSelectedItem();
    let group = selected?.closest(COMMAND_GROUP_SELECTOR);
    let item;
    while (group && !item) {
      group = change > 0 ? findNextSibling(group, COMMAND_GROUP_SELECTOR) : findPreviousSibling(group, COMMAND_GROUP_SELECTOR);
      item = group?.querySelector(COMMAND_VALID_ITEM_SELECTOR);
    }
    if (item) {
      this.setValue(item.getAttribute(COMMAND_VALUE_ATTR) ?? "");
    } else {
      this.updateSelectedByItem(change);
    }
  }
  /**
   * Maps item id to display value and search keywords.
   * Returns cleanup function to remove mapping.
   *
   * @param id - Unique item identifier
   * @param value - Display text
   * @param keywords - Optional search boost terms
   * @returns Cleanup function
   */
  registerValue(value, keywords) {
    if (!(value && value === this.allIds.get(value)?.value)) {
      this.allIds.set(value, { value, keywords });
    }
    this._commandState.filtered.items.set(value, this.#score(value, keywords));
    if (!this.sortAfterTick) {
      this.sortAfterTick = true;
      afterTick(() => {
        this.#sort();
        this.sortAfterTick = false;
      });
    }
    return () => {
      this.allIds.delete(value);
    };
  }
  /**
   * Registers item in command list and its group.
   * Handles filtering, sorting and selection updates.
   *
   * @param id - Item identifier
   * @param groupId - Optional group to add item to
   * @returns Cleanup function that handles selection
   */
  registerItem(id, groupId) {
    this.allItems.add(id);
    if (groupId) {
      if (!this.allGroups.has(groupId)) {
        this.allGroups.set(groupId, /* @__PURE__ */ new Set([id]));
      } else {
        this.allGroups.get(groupId).add(id);
      }
    }
    if (!this.sortAndFilterAfterTick) {
      this.sortAndFilterAfterTick = true;
      afterTick(() => {
        this.#filterItems();
        this.#sort();
        this.sortAndFilterAfterTick = false;
      });
    }
    this.#scheduleUpdate();
    return () => {
      const selectedItem = this.#getSelectedItem();
      this.allIds.delete(id);
      this.allItems.delete(id);
      this.commandState.filtered.items.delete(id);
      this.#filterItems();
      if (selectedItem?.getAttribute("id") === id) {
        this.#selectFirstItem();
      }
      this.#scheduleUpdate();
    };
  }
  /**
   * Creates empty group if not exists.
   *
   * @param id - Group identifier
   * @returns Cleanup function
   */
  registerGroup(id) {
    if (!this.allGroups.has(id)) {
      this.allGroups.set(id, /* @__PURE__ */ new Set());
    }
    return () => {
      this.allIds.delete(id);
      this.allGroups.delete(id);
    };
  }
  get isGrid() {
    return this.opts.columns.current !== null;
  }
  /**
   * Selects last valid item.
   */
  #last() {
    return this.updateSelectedToIndex(this.getValidItems().length - 1);
  }
  /**
   * Handles next item selection:
   * - Meta: Jump to last
   * - Alt: Next group
   * - Default: Next item
   *
   * @param e - Keyboard event
   */
  #next(e) {
    e.preventDefault();
    if (e.metaKey) {
      this.#last();
    } else if (e.altKey) {
      this.updateSelectedByGroup(1);
    } else {
      this.updateSelectedByItem(1);
    }
  }
  #down(e) {
    if (this.opts.columns.current === null) return;
    e.preventDefault();
    if (e.metaKey) {
      this.updateSelectedByGroup(1);
    } else {
      this.updateSelectedByItem(this.#nextRowColumnOffset(e));
    }
  }
  #getColumn(item, grid) {
    if (grid.length === 0) return null;
    for (let r = 0; r < grid.length; r++) {
      const row = grid[r];
      if (row === void 0) continue;
      for (let c = 0; c < row.length; c++) {
        const column = row[c];
        if (column === void 0 || column.ref !== item) continue;
        return { columnIndex: c, rowIndex: r };
      }
    }
    return null;
  }
  #nextRowColumnOffset(e) {
    const grid = this.itemsGrid;
    const selected = this.#getSelectedItem();
    if (!selected) return 0;
    const column = this.#getColumn(selected, grid);
    if (!column) return 0;
    let newItem = null;
    const skipRows = e.altKey ? 1 : 0;
    if (e.altKey && column.rowIndex === grid.length - 2 && !this.opts.loop.current) {
      newItem = this.#findNextNonDisabledItem({
        start: grid.length - 1,
        end: grid.length,
        expectedColumnIndex: column.columnIndex,
        grid
      });
    } else if (column.rowIndex === grid.length - 1) {
      if (!this.opts.loop.current) return 0;
      newItem = this.#findNextNonDisabledItem({
        start: 0 + skipRows,
        end: column.rowIndex,
        expectedColumnIndex: column.columnIndex,
        grid
      });
    } else {
      newItem = this.#findNextNonDisabledItem({
        start: column.rowIndex + 1 + skipRows,
        end: grid.length,
        expectedColumnIndex: column.columnIndex,
        grid
      });
      if (newItem === null && this.opts.loop.current) {
        newItem = this.#findNextNonDisabledItem({
          start: 0,
          end: column.rowIndex,
          expectedColumnIndex: column.columnIndex,
          grid
        });
      }
    }
    return this.#calculateOffset(selected, newItem);
  }
  /** Attempts to find the next non-disabled column that matches the expected column.
   *
   * @remarks
   * - Skips over disabled columns
   * - When a row is shorter than the expected column it defaults to the last item in the row
   *
   * @param param0
   * @returns
   */
  #findNextNonDisabledItem({ start, end, grid, expectedColumnIndex }) {
    let newItem = null;
    for (let r = start; r < end; r++) {
      const row = grid[r];
      newItem = row[expectedColumnIndex]?.ref ?? null;
      if (newItem !== null && itemIsDisabled(newItem)) {
        newItem = null;
        continue;
      }
      if (newItem === null) {
        for (let i = row.length - 1; i >= 0; i--) {
          const item = row[row.length - 1];
          if (item === void 0 || itemIsDisabled(item.ref)) continue;
          newItem = item.ref;
          break;
        }
      }
      break;
    }
    return newItem;
  }
  #calculateOffset(selected, newSelected) {
    if (newSelected === null) return 0;
    const items = this.getValidItems();
    const ogIndex = items.findIndex((item) => item === selected);
    const newIndex = items.findIndex((item) => item === newSelected);
    return newIndex - ogIndex;
  }
  #up(e) {
    if (this.opts.columns.current === null) return;
    e.preventDefault();
    if (e.metaKey) {
      this.updateSelectedByGroup(-1);
    } else {
      this.updateSelectedByItem(this.#previousRowColumnOffset(e));
    }
  }
  #previousRowColumnOffset(e) {
    const grid = this.itemsGrid;
    const selected = this.#getSelectedItem();
    if (selected === void 0) return 0;
    const column = this.#getColumn(selected, grid);
    if (column === null) return 0;
    let newItem = null;
    const skipRows = e.altKey ? 1 : 0;
    if (e.altKey && column.rowIndex === 1 && this.opts.loop.current === false) {
      newItem = this.#findNextNonDisabledItemDesc({
        start: 0,
        end: 0,
        expectedColumnIndex: column.columnIndex,
        grid
      });
    } else if (column.rowIndex === 0) {
      if (this.opts.loop.current === false) return 0;
      newItem = this.#findNextNonDisabledItemDesc({
        start: grid.length - 1 - skipRows,
        end: column.rowIndex + 1,
        expectedColumnIndex: column.columnIndex,
        grid
      });
    } else {
      newItem = this.#findNextNonDisabledItemDesc({
        start: column.rowIndex - 1 - skipRows,
        end: 0,
        expectedColumnIndex: column.columnIndex,
        grid
      });
      if (newItem === null && this.opts.loop.current) {
        newItem = this.#findNextNonDisabledItemDesc({
          start: grid.length - 1,
          end: column.rowIndex + 1,
          expectedColumnIndex: column.columnIndex,
          grid
        });
      }
    }
    return this.#calculateOffset(selected, newItem);
  }
  /**
   * Attempts to find the next non-disabled column that matches the expected column.
   *
   * @remarks
   * - Skips over disabled columns
   * - When a row is shorter than the expected column it defaults to the last item in the row
   */
  #findNextNonDisabledItemDesc({ start, end, grid, expectedColumnIndex }) {
    let newItem = null;
    for (let r = start; r >= end; r--) {
      const row = grid[r];
      if (row === void 0) continue;
      newItem = row[expectedColumnIndex]?.ref ?? null;
      if (newItem !== null && itemIsDisabled(newItem)) {
        newItem = null;
        continue;
      }
      if (newItem === null) {
        for (let i = row.length - 1; i >= 0; i--) {
          const item = row[row.length - 1];
          if (item === void 0 || itemIsDisabled(item.ref)) continue;
          newItem = item.ref;
          break;
        }
      }
      break;
    }
    return newItem;
  }
  /**
   * Handles previous item selection:
   * - Meta: Jump to first
   * - Alt: Previous group
   * - Default: Previous item
   *
   * @param e - Keyboard event
   */
  #prev(e) {
    e.preventDefault();
    if (e.metaKey) {
      this.updateSelectedToIndex(0);
    } else if (e.altKey) {
      this.updateSelectedByGroup(-1);
    } else {
      this.updateSelectedByItem(-1);
    }
  }
  onkeydown(e) {
    const isVim = this.opts.vimBindings.current && e.ctrlKey;
    switch (e.key) {
      case n:
      case j: {
        if (isVim) {
          if (this.isGrid) {
            this.#down(e);
          } else {
            this.#next(e);
          }
        }
        break;
      }
      case l: {
        if (isVim) {
          if (this.isGrid) {
            this.#next(e);
          }
        }
        break;
      }
      case ARROW_DOWN:
        if (this.isGrid) {
          this.#down(e);
        } else {
          this.#next(e);
        }
        break;
      case ARROW_RIGHT:
        if (!this.isGrid) break;
        this.#next(e);
        break;
      case p:
      case k: {
        if (isVim) {
          if (this.isGrid) {
            this.#up(e);
          } else {
            this.#prev(e);
          }
        }
        break;
      }
      case h: {
        if (isVim && this.isGrid) {
          this.#prev(e);
        }
        break;
      }
      case ARROW_UP:
        if (this.isGrid) {
          this.#up(e);
        } else {
          this.#prev(e);
        }
        break;
      case ARROW_LEFT:
        if (!this.isGrid) break;
        this.#prev(e);
        break;
      case HOME:
        e.preventDefault();
        this.updateSelectedToIndex(0);
        break;
      case END:
        e.preventDefault();
        this.#last();
        break;
      case ENTER: {
        if (!e.isComposing && e.keyCode !== 229) {
          e.preventDefault();
          const item = this.#getSelectedItem();
          if (item) {
            item?.click();
          }
        }
      }
    }
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: "application",
    [commandAttrs.root]: "",
    tabindex: -1,
    onkeydown: this.onkeydown,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function itemIsDisabled(item) {
  return item.getAttribute("aria-disabled") === "true";
}
class CommandEmptyState {
  static create(opts) {
    return new CommandEmptyState(opts, CommandRootContext.get());
  }
  opts;
  root;
  attachment;
  #shouldRender = derived(() => {
    return this.root._commandState.filtered.count === 0 && this.#isInitialRender === false || this.opts.forceMount.current;
  });
  get shouldRender() {
    return this.#shouldRender();
  }
  set shouldRender($$value) {
    return this.#shouldRender($$value);
  }
  #isInitialRender = true;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: "presentation",
    [commandAttrs.empty]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class CommandGroupContainerState {
  static create(opts) {
    return CommandGroupContainerContext.set(new CommandGroupContainerState(opts, CommandRootContext.get()));
  }
  opts;
  root;
  attachment;
  #shouldRender = derived(() => {
    if (this.opts.forceMount.current) return true;
    if (this.root.opts.shouldFilter.current === false) return true;
    if (!this.root.commandState.search) return true;
    return this.root._commandState.filtered.groups.has(this.trueValue);
  });
  get shouldRender() {
    return this.#shouldRender();
  }
  set shouldRender($$value) {
    return this.#shouldRender($$value);
  }
  headingNode = null;
  trueValue = "";
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
    this.trueValue = opts.value.current ?? opts.id.current;
    watch(() => this.trueValue, () => {
      return this.root.registerGroup(this.trueValue);
    });
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: "presentation",
    hidden: this.shouldRender ? void 0 : true,
    "data-value": this.trueValue,
    [commandAttrs.group]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class CommandGroupHeadingState {
  static create(opts) {
    return new CommandGroupHeadingState(opts, CommandGroupContainerContext.get());
  }
  opts;
  group;
  attachment;
  constructor(opts, group) {
    this.opts = opts;
    this.group = group;
    this.attachment = attachRef(this.opts.ref, (v) => this.group.headingNode = v);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    [commandAttrs["group-heading"]]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class CommandGroupItemsState {
  static create(opts) {
    return new CommandGroupItemsState(opts, CommandGroupContainerContext.get());
  }
  opts;
  group;
  attachment;
  constructor(opts, group) {
    this.opts = opts;
    this.group = group;
    this.attachment = attachRef(this.opts.ref);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: "group",
    [commandAttrs["group-items"]]: "",
    "aria-labelledby": this.group.headingNode?.id ?? void 0,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class CommandInputState {
  static create(opts) {
    return new CommandInputState(opts, CommandRootContext.get());
  }
  opts;
  root;
  attachment;
  #selectedItemId = derived(() => {
    const item = this.root.viewportNode?.querySelector(`${COMMAND_ITEM_SELECTOR}[${COMMAND_VALUE_ATTR}="${cssEscape(this.root.opts.value.current)}"]`);
    if (item === void 0 || item === null) return;
    return item.getAttribute("id") ?? void 0;
  });
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref, (v) => this.root.inputNode = v);
    watch(() => this.opts.ref.current, () => {
      const node = this.opts.ref.current;
      if (node && this.opts.autofocus.current) {
        afterSleep(10, () => node.focus());
      }
    });
    watch(() => this.opts.value.current, () => {
      if (this.root.commandState.search !== this.opts.value.current) {
        this.root.setState("search", this.opts.value.current);
      }
    });
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    type: "text",
    [commandAttrs.input]: "",
    autocomplete: "off",
    autocorrect: "off",
    spellcheck: false,
    "aria-autocomplete": "list",
    role: "combobox",
    "aria-expanded": getAriaExpanded(true),
    "aria-controls": this.root.viewportNode?.id ?? void 0,
    "aria-labelledby": this.root.labelNode?.id ?? void 0,
    "aria-activedescendant": this.#selectedItemId(),
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class CommandItemState {
  static create(opts) {
    const group = CommandGroupContainerContext.getOr(null);
    return new CommandItemState({ ...opts, group }, CommandRootContext.get());
  }
  opts;
  root;
  attachment;
  #group = null;
  #trueForceMount = derived(() => {
    return this.opts.forceMount.current || this.#group?.opts.forceMount.current === true;
  });
  #shouldRender = derived(() => {
    this.opts.ref.current;
    if (this.#trueForceMount() || this.root.opts.shouldFilter.current === false || !this.root.commandState.search) {
      return true;
    }
    const currentScore = this.root.commandState.filtered.items.get(this.trueValue);
    if (currentScore === void 0) return false;
    return currentScore > 0;
  });
  get shouldRender() {
    return this.#shouldRender();
  }
  set shouldRender($$value) {
    return this.#shouldRender($$value);
  }
  #isSelected = derived(() => this.root.opts.value.current === this.trueValue && this.trueValue !== "");
  get isSelected() {
    return this.#isSelected();
  }
  set isSelected($$value) {
    return this.#isSelected($$value);
  }
  trueValue = "";
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.#group = CommandGroupContainerContext.getOr(null);
    this.trueValue = opts.value.current;
    this.attachment = attachRef(this.opts.ref);
    watch(
      [
        () => this.trueValue,
        () => this.#group?.trueValue,
        () => this.opts.forceMount.current
      ],
      () => {
        if (this.opts.forceMount.current) return;
        return this.root.registerItem(this.trueValue, this.#group?.trueValue);
      }
    );
    watch(
      [
        () => this.opts.value.current,
        () => this.opts.ref.current
      ],
      () => {
        if (!this.opts.value.current && this.opts.ref.current?.textContent) {
          this.trueValue = this.opts.ref.current.textContent.trim();
        }
        this.root.registerValue(this.trueValue, opts.keywords.current.map((kw) => kw.trim()));
        this.opts.ref.current?.setAttribute(COMMAND_VALUE_ATTR, this.trueValue);
      }
    );
    this.onclick = this.onclick.bind(this);
    this.onpointermove = this.onpointermove.bind(this);
  }
  #onSelect() {
    if (this.opts.disabled.current) return;
    this.#select();
    this.opts.onSelect?.current();
  }
  #select() {
    if (this.opts.disabled.current) return;
    this.root.setValue(this.trueValue, true);
  }
  onpointermove(_) {
    if (this.opts.disabled.current || this.root.opts.disablePointerSelection.current) return;
    this.#select();
  }
  onclick(_) {
    if (this.opts.disabled.current) return;
    this.#onSelect();
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    "aria-disabled": getAriaDisabled(this.opts.disabled.current),
    "aria-selected": getAriaSelected(this.isSelected),
    "data-disabled": getDataDisabled(this.opts.disabled.current),
    "data-selected": getDataSelected(this.isSelected),
    "data-value": this.trueValue,
    "data-group": this.#group?.trueValue,
    [commandAttrs.item]: "",
    role: "option",
    onpointermove: this.onpointermove,
    onclick: this.onclick,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class CommandListState {
  static create(opts) {
    return CommandListContext.set(new CommandListState(opts, CommandRootContext.get()));
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: "listbox",
    "aria-label": this.opts.ariaLabel.current,
    [commandAttrs.list]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class CommandLabelState {
  static create(opts) {
    return new CommandLabelState(opts, CommandRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref, (v) => this.root.labelNode = v);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    [commandAttrs["input-label"]]: "",
    for: this.opts.for?.current,
    style: srOnlyStyles,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function _command_label($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const labelState = CommandLabelState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, labelState.props);
  $$payload.out += `<label${spread_attributes({ ...mergedProps }, null)}>`;
  children?.($$payload);
  $$payload.out += `<!----></label>`;
  bind_props($$props, { ref });
  pop();
}
function Command$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    value = "",
    onValueChange = noop,
    onStateChange = noop,
    loop = false,
    shouldFilter = true,
    filter = computeCommandScore,
    label = "",
    vimBindings = true,
    disablePointerSelection = false,
    disableInitialScroll = false,
    columns = null,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = CommandRootState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    filter: box.with(() => filter),
    shouldFilter: box.with(() => shouldFilter),
    loop: box.with(() => loop),
    value: box.with(() => value, (v) => {
      if (value !== v) {
        value = v;
        onValueChange(v);
      }
    }),
    vimBindings: box.with(() => vimBindings),
    disablePointerSelection: box.with(() => disablePointerSelection),
    disableInitialScroll: box.with(() => disableInitialScroll),
    onStateChange: box.with(() => onStateChange),
    columns: box.with(() => columns)
  });
  const updateSelectedToIndex = (i) => rootState.updateSelectedToIndex(i);
  const updateSelectedByGroup = (c) => rootState.updateSelectedByGroup(c);
  const updateSelectedByItem = (c) => rootState.updateSelectedByItem(c);
  const getValidItems = () => rootState.getValidItems();
  const mergedProps = mergeProps(restProps, rootState.props);
  function Label2($$payload2) {
    _command_label($$payload2, {
      children: ($$payload3) => {
        $$payload3.out += `<!---->${escape_html(label)}`;
      },
      $$slots: { default: true }
    });
  }
  if (child) {
    $$payload.out += "<!--[-->";
    Label2($$payload);
    $$payload.out += `<!----> `;
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    Label2($$payload);
    $$payload.out += `<!----> `;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, {
    ref,
    value,
    updateSelectedToIndex,
    updateSelectedByGroup,
    updateSelectedByItem,
    getValidItems
  });
  pop();
}
function Command_empty$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    children,
    child,
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const emptyState = CommandEmptyState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    forceMount: box.with(() => forceMount)
  });
  const mergedProps = mergeProps(emptyState.props, restProps);
  if (emptyState.shouldRender) {
    $$payload.out += "<!--[-->";
    if (child) {
      $$payload.out += "<!--[-->";
      child($$payload, { props: mergedProps });
      $$payload.out += `<!---->`;
    } else {
      $$payload.out += "<!--[!-->";
      $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
      children?.($$payload);
      $$payload.out += `<!----></div>`;
    }
    $$payload.out += `<!--]-->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Command_group$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    value = "",
    forceMount = false,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const groupState = CommandGroupContainerState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    forceMount: box.with(() => forceMount),
    value: box.with(() => value)
  });
  const mergedProps = mergeProps(restProps, groupState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Command_group_heading($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const headingState = CommandGroupHeadingState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, headingState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Command_group_items($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const groupItemsState = CommandGroupItemsState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, groupItemsState.props);
  $$payload.out += `<div style="display: contents;">`;
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]--></div>`;
  bind_props($$props, { ref });
  pop();
}
function Command_input$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    value = "",
    autofocus = false,
    id = createId(uid),
    ref = null,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const inputState = CommandInputState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    value: box.with(() => value, (v) => {
      value = v;
    }),
    autofocus: box.with(() => autofocus ?? false)
  });
  const mergedProps = mergeProps(restProps, inputState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<input${spread_attributes({ ...mergedProps, value }, null)}/>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { value, ref });
  pop();
}
function Command_item$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    value = "",
    disabled = false,
    children,
    child,
    onSelect = noop,
    forceMount = false,
    keywords = [],
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const itemState = CommandItemState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    value: box.with(() => value),
    disabled: box.with(() => disabled),
    onSelect: box.with(() => onSelect),
    forceMount: box.with(() => forceMount),
    keywords: box.with(() => keywords)
  });
  const mergedProps = mergeProps(restProps, itemState.props);
  $$payload.out += `<!---->`;
  {
    $$payload.out += `<div style="display: contents;" data-item-wrapper=""${attr("data-value", itemState.trueValue)}>`;
    if (itemState.shouldRender) {
      $$payload.out += "<!--[-->";
      if (child) {
        $$payload.out += "<!--[-->";
        child($$payload, { props: mergedProps });
        $$payload.out += `<!---->`;
      } else {
        $$payload.out += "<!--[!-->";
        $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
        children?.($$payload);
        $$payload.out += `<!----></div>`;
      }
      $$payload.out += `<!--]-->`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--></div>`;
  }
  $$payload.out += `<!---->`;
  bind_props($$props, { ref });
  pop();
}
function Command_list$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    child,
    children,
    "aria-label": ariaLabel,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const listState = CommandListState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    ariaLabel: box.with(() => ariaLabel ?? "Suggestions...")
  });
  const mergedProps = mergeProps(restProps, listState.props);
  $$payload.out += `<!---->`;
  {
    if (child) {
      $$payload.out += "<!--[-->";
      child($$payload, { props: mergedProps });
      $$payload.out += `<!---->`;
    } else {
      $$payload.out += "<!--[!-->";
      $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
      children?.($$payload);
      $$payload.out += `<!----></div>`;
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!---->`;
  bind_props($$props, { ref });
  pop();
}
const SCORE_CONTINUE_MATCH = 1;
const SCORE_SPACE_WORD_JUMP = 0.9;
const SCORE_NON_SPACE_WORD_JUMP = 0.8;
const SCORE_CHARACTER_JUMP = 0.17;
const SCORE_TRANSPOSITION = 0.1;
const PENALTY_SKIPPED = 0.999;
const PENALTY_CASE_MISMATCH = 0.9999;
const PENALTY_NOT_COMPLETE = 0.99;
const IS_GAP_REGEXP = /[\\/_+.#"@[({&]/;
const COUNT_GAPS_REGEXP = /[\\/_+.#"@[({&]/g;
const IS_SPACE_REGEXP = /[\s-]/;
const COUNT_SPACE_REGEXP = /[\s-]/g;
function computeCommandScoreInner(string, abbreviation, lowerString, lowerAbbreviation, stringIndex, abbreviationIndex, memoizedResults) {
  if (abbreviationIndex === abbreviation.length) {
    if (stringIndex === string.length)
      return SCORE_CONTINUE_MATCH;
    return PENALTY_NOT_COMPLETE;
  }
  const memoizeKey = `${stringIndex},${abbreviationIndex}`;
  if (memoizedResults[memoizeKey] !== void 0)
    return memoizedResults[memoizeKey];
  const abbreviationChar = lowerAbbreviation.charAt(abbreviationIndex);
  let index = lowerString.indexOf(abbreviationChar, stringIndex);
  let highScore = 0;
  let score, transposedScore, wordBreaks, spaceBreaks;
  while (index >= 0) {
    score = computeCommandScoreInner(string, abbreviation, lowerString, lowerAbbreviation, index + 1, abbreviationIndex + 1, memoizedResults);
    if (score > highScore) {
      if (index === stringIndex) {
        score *= SCORE_CONTINUE_MATCH;
      } else if (IS_GAP_REGEXP.test(string.charAt(index - 1))) {
        score *= SCORE_NON_SPACE_WORD_JUMP;
        wordBreaks = string.slice(stringIndex, index - 1).match(COUNT_GAPS_REGEXP);
        if (wordBreaks && stringIndex > 0) {
          score *= PENALTY_SKIPPED ** wordBreaks.length;
        }
      } else if (IS_SPACE_REGEXP.test(string.charAt(index - 1))) {
        score *= SCORE_SPACE_WORD_JUMP;
        spaceBreaks = string.slice(stringIndex, index - 1).match(COUNT_SPACE_REGEXP);
        if (spaceBreaks && stringIndex > 0) {
          score *= PENALTY_SKIPPED ** spaceBreaks.length;
        }
      } else {
        score *= SCORE_CHARACTER_JUMP;
        if (stringIndex > 0) {
          score *= PENALTY_SKIPPED ** (index - stringIndex);
        }
      }
      if (string.charAt(index) !== abbreviation.charAt(abbreviationIndex)) {
        score *= PENALTY_CASE_MISMATCH;
      }
    }
    if (score < SCORE_TRANSPOSITION && lowerString.charAt(index - 1) === lowerAbbreviation.charAt(abbreviationIndex + 1) || lowerAbbreviation.charAt(abbreviationIndex + 1) === lowerAbbreviation.charAt(abbreviationIndex) && lowerString.charAt(index - 1) !== lowerAbbreviation.charAt(abbreviationIndex)) {
      transposedScore = computeCommandScoreInner(string, abbreviation, lowerString, lowerAbbreviation, index + 1, abbreviationIndex + 2, memoizedResults);
      if (transposedScore * SCORE_TRANSPOSITION > score) {
        score = transposedScore * SCORE_TRANSPOSITION;
      }
    }
    if (score > highScore) {
      highScore = score;
    }
    index = lowerString.indexOf(abbreviationChar, index + 1);
  }
  memoizedResults[memoizeKey] = highScore;
  return highScore;
}
function formatInput(string) {
  return string.toLowerCase().replace(COUNT_SPACE_REGEXP, " ");
}
function computeCommandScore(command, search, commandKeywords) {
  command = commandKeywords && commandKeywords.length > 0 ? `${`${command} ${commandKeywords?.join(" ")}`}` : command;
  return computeCommandScoreInner(command, search, formatInput(command), formatInput(search), 0, 0, {});
}
const SELECTION_KEYS = [ENTER, SPACE];
const FIRST_KEYS = [ARROW_DOWN, PAGE_UP, HOME];
const LAST_KEYS = [ARROW_UP, PAGE_DOWN, END];
const FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
function isMouseEvent(event) {
  return event.pointerType === "mouse";
}
function focus(element2, { select = false } = {}) {
  if (!element2 || !element2.focus)
    return;
  const doc = getDocument(element2);
  if (doc.activeElement === element2)
    return;
  const previouslyFocusedElement = doc.activeElement;
  element2.focus({ preventScroll: true });
  if (element2 !== previouslyFocusedElement && isSelectableInput(element2) && select) {
    element2.select();
  }
}
function focusFirst(candidates, { select = false } = {}, getActiveElement2) {
  const previouslyFocusedElement = getActiveElement2();
  for (const candidate of candidates) {
    focus(candidate, { select });
    if (getActiveElement2() !== previouslyFocusedElement)
      return true;
  }
}
function getTabbableOptions() {
  return {
    getShadowRoot: true,
    displayCheck: (
      // JSDOM does not support the `tabbable` library. To solve this we can
      // check if `ResizeObserver` is a real function (not polyfilled), which
      // determines if the current environment is JSDOM-like.
      typeof ResizeObserver === "function" && ResizeObserver.toString().includes("[native code]") ? "full" : "none"
    )
  };
}
function getTabbableFrom(currentNode, direction) {
  if (!isTabbable(currentNode, getTabbableOptions())) {
    return getTabbableFromFocusable(currentNode, direction);
  }
  const doc = getDocument(currentNode);
  const allTabbable = tabbable(doc.body, getTabbableOptions());
  if (direction === "prev")
    allTabbable.reverse();
  const activeIndex = allTabbable.indexOf(currentNode);
  if (activeIndex === -1)
    return doc.body;
  const nextTabbableElements = allTabbable.slice(activeIndex + 1);
  return nextTabbableElements[0];
}
function getTabbableFromFocusable(currentNode, direction) {
  const doc = getDocument(currentNode);
  if (!isFocusable(currentNode, getTabbableOptions()))
    return doc.body;
  const allFocusable = focusable(doc.body, getTabbableOptions());
  if (direction === "prev")
    allFocusable.reverse();
  const activeIndex = allFocusable.indexOf(currentNode);
  if (activeIndex === -1)
    return doc.body;
  const nextFocusableElements = allFocusable.slice(activeIndex + 1);
  return nextFocusableElements.find((node) => isTabbable(node, getTabbableOptions())) ?? doc.body;
}
class GraceArea {
  #opts;
  #enabled;
  #isPointerInTransit;
  #pointerGraceArea = null;
  constructor(opts) {
    this.#opts = opts;
    this.#enabled = derived(() => this.#opts.enabled());
    this.#isPointerInTransit = boxAutoReset(false, {
      afterMs: opts.transitTimeout ?? 300,
      onChange: (value) => {
        if (!this.#enabled()) return;
        this.#opts.setIsPointerInTransit?.(value);
      },
      getWindow: () => getWindow(this.#opts.triggerNode())
    });
    watch(
      [
        opts.triggerNode,
        opts.contentNode,
        opts.enabled
      ],
      ([triggerNode, contentNode, enabled]) => {
        if (!triggerNode || !contentNode || !enabled) return;
        const handleTriggerLeave = (e) => {
          this.#createGraceArea(e, contentNode);
        };
        const handleContentLeave = (e) => {
          this.#createGraceArea(e, triggerNode);
        };
        return executeCallbacks(on(triggerNode, "pointerleave", handleTriggerLeave), on(contentNode, "pointerleave", handleContentLeave));
      }
    );
    watch(() => this.#pointerGraceArea, () => {
      const handleTrackPointerGrace = (e) => {
        if (!this.#pointerGraceArea) return;
        const target = e.target;
        if (!isElement(target)) return;
        const pointerPosition = { x: e.clientX, y: e.clientY };
        const hasEnteredTarget = opts.triggerNode()?.contains(target) || opts.contentNode()?.contains(target);
        const isPointerOutsideGraceArea = !isPointInPolygon(pointerPosition, this.#pointerGraceArea);
        if (hasEnteredTarget) {
          this.#removeGraceArea();
        } else if (isPointerOutsideGraceArea) {
          this.#removeGraceArea();
          opts.onPointerExit();
        }
      };
      const doc = getDocument(opts.triggerNode() ?? opts.contentNode());
      if (!doc) return;
      return on(doc, "pointermove", handleTrackPointerGrace);
    });
  }
  #removeGraceArea() {
    this.#pointerGraceArea = null;
    this.#isPointerInTransit.current = false;
  }
  #createGraceArea(e, hoverTarget) {
    const currentTarget = e.currentTarget;
    if (!isHTMLElement(currentTarget)) return;
    const exitPoint = { x: e.clientX, y: e.clientY };
    const exitSide = getExitSideFromRect(exitPoint, currentTarget.getBoundingClientRect());
    const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide);
    const hoverTargetPoints = getPointsFromRect(hoverTarget.getBoundingClientRect());
    const graceArea = getHull([...paddedExitPoints, ...hoverTargetPoints]);
    this.#pointerGraceArea = graceArea;
    this.#isPointerInTransit.current = true;
  }
}
function getExitSideFromRect(point, rect) {
  const top = Math.abs(rect.top - point.y);
  const bottom = Math.abs(rect.bottom - point.y);
  const right = Math.abs(rect.right - point.x);
  const left = Math.abs(rect.left - point.x);
  switch (Math.min(top, bottom, right, left)) {
    case left:
      return "left";
    case right:
      return "right";
    case top:
      return "top";
    case bottom:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
function getPaddedExitPoints(exitPoint, exitSide, padding = 5) {
  const tipPadding = padding * 1.5;
  switch (exitSide) {
    case "top":
      return [
        {
          x: exitPoint.x - padding,
          y: exitPoint.y + padding
        },
        { x: exitPoint.x, y: exitPoint.y - tipPadding },
        {
          x: exitPoint.x + padding,
          y: exitPoint.y + padding
        }
      ];
    case "bottom":
      return [
        {
          x: exitPoint.x - padding,
          y: exitPoint.y - padding
        },
        { x: exitPoint.x, y: exitPoint.y + tipPadding },
        {
          x: exitPoint.x + padding,
          y: exitPoint.y - padding
        }
      ];
    case "left":
      return [
        {
          x: exitPoint.x + padding,
          y: exitPoint.y - padding
        },
        { x: exitPoint.x - tipPadding, y: exitPoint.y },
        {
          x: exitPoint.x + padding,
          y: exitPoint.y + padding
        }
      ];
    case "right":
      return [
        {
          x: exitPoint.x - padding,
          y: exitPoint.y - padding
        },
        { x: exitPoint.x + tipPadding, y: exitPoint.y },
        {
          x: exitPoint.x - padding,
          y: exitPoint.y + padding
        }
      ];
  }
}
function getPointsFromRect(rect) {
  const { top, right, bottom, left } = rect;
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom }
  ];
}
function isPointInPolygon(point, polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j2 = polygon.length - 1; i < polygon.length; j2 = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j2].x;
    const yj = polygon[j2].y;
    const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
function getHull(points) {
  const newPoints = points.slice();
  newPoints.sort((a, b) => {
    if (a.x < b.x) return -1;
    else if (a.x > b.x) return 1;
    else if (a.y < b.y) return -1;
    else if (a.y > b.y) return 1;
    else return 0;
  });
  return getHullPresorted(newPoints);
}
function getHullPresorted(points) {
  if (points.length <= 1) return points.slice();
  const upperHull = [];
  for (let i = 0; i < points.length; i++) {
    const p2 = points[i];
    while (upperHull.length >= 2) {
      const q = upperHull[upperHull.length - 1];
      const r = upperHull[upperHull.length - 2];
      if ((q.x - r.x) * (p2.y - r.y) >= (q.y - r.y) * (p2.x - r.x)) upperHull.pop();
      else break;
    }
    upperHull.push(p2);
  }
  upperHull.pop();
  const lowerHull = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p2 = points[i];
    while (lowerHull.length >= 2) {
      const q = lowerHull[lowerHull.length - 1];
      const r = lowerHull[lowerHull.length - 2];
      if ((q.x - r.x) * (p2.y - r.y) >= (q.y - r.y) * (p2.x - r.x)) lowerHull.pop();
      else break;
    }
    lowerHull.push(p2);
  }
  lowerHull.pop();
  if (upperHull.length === 1 && lowerHull.length === 1 && upperHull[0].x === lowerHull[0].x && upperHull[0].y === lowerHull[0].y) return upperHull;
  else return upperHull.concat(lowerHull);
}
const MenuRootContext = new Context("Menu.Root");
const MenuMenuContext = new Context("Menu.Root | Menu.Sub");
const MenuContentContext = new Context("Menu.Content");
const MenuOpenEvent = new CustomEventDispatcher("bitsmenuopen", { bubbles: false, cancelable: true });
const menuAttrs = createBitsAttrs({
  component: "menu",
  parts: [
    "trigger",
    "content",
    "sub-trigger",
    "item",
    "group",
    "group-heading",
    "checkbox-group",
    "checkbox-item",
    "radio-group",
    "radio-item",
    "separator",
    "sub-content",
    "arrow"
  ]
});
class MenuRootState {
  static create(opts) {
    const root = new MenuRootState(opts);
    return MenuRootContext.set(root);
  }
  opts;
  isUsingKeyboard = new IsUsingKeyboard();
  ignoreCloseAutoFocus = false;
  isPointerInTransit = false;
  constructor(opts) {
    this.opts = opts;
  }
  getBitsAttr = (part) => {
    return menuAttrs.getAttr(part, this.opts.variant.current);
  };
}
class MenuMenuState {
  static create(opts, root) {
    return MenuMenuContext.set(new MenuMenuState(opts, root, null));
  }
  opts;
  root;
  parentMenu;
  contentId = box.with(() => "");
  contentNode = null;
  triggerNode = null;
  constructor(opts, root, parentMenu) {
    this.opts = opts;
    this.root = root;
    this.parentMenu = parentMenu;
    new OpenChangeComplete({
      ref: box.with(() => this.contentNode),
      open: this.opts.open,
      onComplete: () => {
        this.opts.onOpenChangeComplete.current(this.opts.open.current);
      }
    });
    if (parentMenu) {
      watch(() => parentMenu.opts.open.current, () => {
        if (parentMenu.opts.open.current) return;
        this.opts.open.current = false;
      });
    }
  }
  toggleOpen() {
    this.opts.open.current = !this.opts.open.current;
  }
  onOpen() {
    this.opts.open.current = true;
  }
  onClose() {
    this.opts.open.current = false;
  }
}
class MenuContentState {
  static create(opts) {
    return MenuContentContext.set(new MenuContentState(opts, MenuMenuContext.get()));
  }
  opts;
  parentMenu;
  rovingFocusGroup;
  domContext;
  attachment;
  search = "";
  #timer = 0;
  #handleTypeaheadSearch;
  mounted = false;
  #isSub;
  constructor(opts, parentMenu) {
    this.opts = opts;
    this.parentMenu = parentMenu;
    this.domContext = new DOMContext(opts.ref);
    this.attachment = attachRef(this.opts.ref, (v) => {
      if (this.parentMenu.contentNode !== v) {
        this.parentMenu.contentNode = v;
      }
    });
    parentMenu.contentId = opts.id;
    this.#isSub = opts.isSub ?? false;
    this.onkeydown = this.onkeydown.bind(this);
    this.onblur = this.onblur.bind(this);
    this.onfocus = this.onfocus.bind(this);
    this.handleInteractOutside = this.handleInteractOutside.bind(this);
    new GraceArea({
      contentNode: () => this.parentMenu.contentNode,
      triggerNode: () => this.parentMenu.triggerNode,
      enabled: () => this.parentMenu.opts.open.current && Boolean(this.parentMenu.triggerNode?.hasAttribute(this.parentMenu.root.getBitsAttr("sub-trigger"))),
      onPointerExit: () => {
        this.parentMenu.opts.open.current = false;
      },
      setIsPointerInTransit: (value) => {
        this.parentMenu.root.isPointerInTransit = value;
      }
    });
    this.#handleTypeaheadSearch = new DOMTypeahead({
      getActiveElement: () => this.domContext.getActiveElement(),
      getWindow: () => this.domContext.getWindow()
    }).handleTypeaheadSearch;
    this.rovingFocusGroup = new RovingFocusGroup({
      rootNode: box.with(() => this.parentMenu.contentNode),
      candidateAttr: this.parentMenu.root.getBitsAttr("item"),
      loop: this.opts.loop,
      orientation: box.with(() => "vertical")
    });
    watch(() => this.parentMenu.contentNode, (contentNode) => {
      if (!contentNode) return;
      const handler = () => {
        afterTick(() => {
          if (!this.parentMenu.root.isUsingKeyboard.current) return;
          this.rovingFocusGroup.focusFirstCandidate();
        });
      };
      return MenuOpenEvent.listen(contentNode, handler);
    });
  }
  #getCandidateNodes() {
    const node = this.parentMenu.contentNode;
    if (!node) return [];
    const candidates = Array.from(node.querySelectorAll(`[${this.parentMenu.root.getBitsAttr("item")}]:not([data-disabled])`));
    return candidates;
  }
  #isPointerMovingToSubmenu() {
    return this.parentMenu.root.isPointerInTransit;
  }
  onCloseAutoFocus = (e) => {
    this.opts.onCloseAutoFocus.current(e);
    if (e.defaultPrevented || this.#isSub) return;
    if (this.parentMenu.triggerNode && isTabbable(this.parentMenu.triggerNode)) {
      this.parentMenu.triggerNode.focus();
    }
  };
  handleTabKeyDown(e) {
    let rootMenu = this.parentMenu;
    while (rootMenu.parentMenu !== null) {
      rootMenu = rootMenu.parentMenu;
    }
    if (!rootMenu.triggerNode) return;
    e.preventDefault();
    const nodeToFocus = getTabbableFrom(rootMenu.triggerNode, e.shiftKey ? "prev" : "next");
    if (nodeToFocus) {
      this.parentMenu.root.ignoreCloseAutoFocus = true;
      rootMenu.onClose();
      afterTick(() => {
        nodeToFocus.focus();
        afterTick(() => {
          this.parentMenu.root.ignoreCloseAutoFocus = false;
        });
      });
    } else {
      this.domContext.getDocument().body.focus();
    }
  }
  onkeydown(e) {
    if (e.defaultPrevented) return;
    if (e.key === TAB) {
      this.handleTabKeyDown(e);
      return;
    }
    const target = e.target;
    const currentTarget = e.currentTarget;
    if (!isHTMLElement(target) || !isHTMLElement(currentTarget)) return;
    const isKeydownInside = target.closest(`[${this.parentMenu.root.getBitsAttr("content")}]`)?.id === this.parentMenu.contentId.current;
    const isModifierKey = e.ctrlKey || e.altKey || e.metaKey;
    const isCharacterKey = e.key.length === 1;
    const kbdFocusedEl = this.rovingFocusGroup.handleKeydown(target, e);
    if (kbdFocusedEl) return;
    if (e.code === "Space") return;
    const candidateNodes = this.#getCandidateNodes();
    if (isKeydownInside) {
      if (!isModifierKey && isCharacterKey) {
        this.#handleTypeaheadSearch(e.key, candidateNodes);
      }
    }
    if (e.target?.id !== this.parentMenu.contentId.current) return;
    if (!FIRST_LAST_KEYS.includes(e.key)) return;
    e.preventDefault();
    if (LAST_KEYS.includes(e.key)) {
      candidateNodes.reverse();
    }
    focusFirst(candidateNodes, { select: false }, () => this.domContext.getActiveElement());
  }
  onblur(e) {
    if (!isElement(e.currentTarget)) return;
    if (!isElement(e.target)) return;
    if (!e.currentTarget.contains?.(e.target)) {
      this.domContext.getWindow().clearTimeout(this.#timer);
      this.search = "";
    }
  }
  onfocus(_) {
    if (!this.parentMenu.root.isUsingKeyboard.current) return;
    afterTick(() => this.rovingFocusGroup.focusFirstCandidate());
  }
  onItemEnter() {
    return this.#isPointerMovingToSubmenu();
  }
  onItemLeave(e) {
    if (e.currentTarget.hasAttribute(this.parentMenu.root.getBitsAttr("sub-trigger"))) return;
    if (this.#isPointerMovingToSubmenu() || this.parentMenu.root.isUsingKeyboard.current) return;
    const contentNode = this.parentMenu.contentNode;
    contentNode?.focus();
    this.rovingFocusGroup.setCurrentTabStopId("");
  }
  onTriggerLeave() {
    if (this.#isPointerMovingToSubmenu()) return true;
    return false;
  }
  onOpenAutoFocus = (e) => {
    if (e.defaultPrevented) return;
    e.preventDefault();
    const contentNode = this.parentMenu.contentNode;
    contentNode?.focus();
  };
  handleInteractOutside(e) {
    if (!isElementOrSVGElement(e.target)) return;
    const triggerId = this.parentMenu.triggerNode?.id;
    if (e.target.id === triggerId) {
      e.preventDefault();
      return;
    }
    if (e.target.closest(`#${triggerId}`)) {
      e.preventDefault();
    }
  }
  #snippetProps = derived(() => ({ open: this.parentMenu.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: "menu",
    "aria-orientation": getAriaOrientation("vertical"),
    [this.parentMenu.root.getBitsAttr("content")]: "",
    "data-state": getDataOpenClosed(this.parentMenu.opts.open.current),
    onkeydown: this.onkeydown,
    onblur: this.onblur,
    onfocus: this.onfocus,
    dir: this.parentMenu.root.opts.dir.current,
    style: { pointerEvents: "auto" },
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
  popperProps = {
    onCloseAutoFocus: (e) => this.onCloseAutoFocus(e)
  };
}
class MenuItemSharedState {
  opts;
  content;
  attachment;
  #isFocused = false;
  constructor(opts, content) {
    this.opts = opts;
    this.content = content;
    this.attachment = attachRef(this.opts.ref);
    this.onpointermove = this.onpointermove.bind(this);
    this.onpointerleave = this.onpointerleave.bind(this);
    this.onfocus = this.onfocus.bind(this);
    this.onblur = this.onblur.bind(this);
  }
  onpointermove(e) {
    if (e.defaultPrevented) return;
    if (!isMouseEvent(e)) return;
    if (this.opts.disabled.current) {
      this.content.onItemLeave(e);
    } else {
      const defaultPrevented = this.content.onItemEnter();
      if (defaultPrevented) return;
      const item = e.currentTarget;
      if (!isHTMLElement(item)) return;
      item.focus();
    }
  }
  onpointerleave(e) {
    if (e.defaultPrevented) return;
    if (!isMouseEvent(e)) return;
    this.content.onItemLeave(e);
  }
  onfocus(e) {
    afterTick(() => {
      if (e.defaultPrevented || this.opts.disabled.current) return;
      this.#isFocused = true;
    });
  }
  onblur(e) {
    afterTick(() => {
      if (e.defaultPrevented) return;
      this.#isFocused = false;
    });
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    tabindex: -1,
    role: "menuitem",
    "aria-disabled": getAriaDisabled(this.opts.disabled.current),
    "data-disabled": getDataDisabled(this.opts.disabled.current),
    "data-highlighted": this.#isFocused ? "" : void 0,
    [this.content.parentMenu.root.getBitsAttr("item")]: "",
    //
    onpointermove: this.onpointermove,
    onpointerleave: this.onpointerleave,
    onfocus: this.onfocus,
    onblur: this.onblur,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class MenuItemState {
  static create(opts) {
    const item = new MenuItemSharedState(opts, MenuContentContext.get());
    return new MenuItemState(opts, item);
  }
  opts;
  item;
  root;
  #isPointerDown = false;
  constructor(opts, item) {
    this.opts = opts;
    this.item = item;
    this.root = item.content.parentMenu.root;
    this.onkeydown = this.onkeydown.bind(this);
    this.onclick = this.onclick.bind(this);
    this.onpointerdown = this.onpointerdown.bind(this);
    this.onpointerup = this.onpointerup.bind(this);
  }
  #handleSelect() {
    if (this.item.opts.disabled.current) return;
    const selectEvent = new CustomEvent("menuitemselect", { bubbles: true, cancelable: true });
    this.opts.onSelect.current(selectEvent);
    if (selectEvent.defaultPrevented) {
      this.item.content.parentMenu.root.isUsingKeyboard.current = false;
      return;
    }
    if (this.opts.closeOnSelect.current) {
      this.item.content.parentMenu.root.opts.onClose();
    }
  }
  onkeydown(e) {
    const isTypingAhead = this.item.content.search !== "";
    if (this.item.opts.disabled.current || isTypingAhead && e.key === SPACE) return;
    if (SELECTION_KEYS.includes(e.key)) {
      if (!isHTMLElement(e.currentTarget)) return;
      e.currentTarget.click();
      e.preventDefault();
    }
  }
  onclick(_) {
    if (this.item.opts.disabled.current) return;
    this.#handleSelect();
  }
  onpointerup(e) {
    if (e.defaultPrevented) return;
    if (!this.#isPointerDown) {
      if (!isHTMLElement(e.currentTarget)) return;
      e.currentTarget?.click();
    }
  }
  onpointerdown(_) {
    this.#isPointerDown = true;
  }
  #props = derived(() => mergeProps(this.item.props, {
    onclick: this.onclick,
    onpointerdown: this.onpointerdown,
    onpointerup: this.onpointerup,
    onkeydown: this.onkeydown
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class MenuSeparatorState {
  static create(opts) {
    return new MenuSeparatorState(opts, MenuRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: "group",
    [this.root.getBitsAttr("separator")]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class DropdownMenuTriggerState {
  static create(opts) {
    return new DropdownMenuTriggerState(opts, MenuMenuContext.get());
  }
  opts;
  parentMenu;
  attachment;
  constructor(opts, parentMenu) {
    this.opts = opts;
    this.parentMenu = parentMenu;
    this.attachment = attachRef(this.opts.ref, (v) => this.parentMenu.triggerNode = v);
  }
  onpointerdown = (e) => {
    if (this.opts.disabled.current) return;
    if (e.pointerType === "touch") return e.preventDefault();
    if (e.button === 0 && e.ctrlKey === false) {
      this.parentMenu.toggleOpen();
      if (!this.parentMenu.opts.open.current) e.preventDefault();
    }
  };
  onpointerup = (e) => {
    if (this.opts.disabled.current) return;
    if (e.pointerType === "touch") {
      e.preventDefault();
      this.parentMenu.toggleOpen();
    }
  };
  onkeydown = (e) => {
    if (this.opts.disabled.current) return;
    if (e.key === SPACE || e.key === ENTER) {
      this.parentMenu.toggleOpen();
      e.preventDefault();
      return;
    }
    if (e.key === ARROW_DOWN) {
      this.parentMenu.onOpen();
      e.preventDefault();
    }
  };
  #ariaControls = derived(() => {
    if (this.parentMenu.opts.open.current && this.parentMenu.contentId.current) return this.parentMenu.contentId.current;
    return void 0;
  });
  #props = derived(() => ({
    id: this.opts.id.current,
    disabled: this.opts.disabled.current,
    "aria-haspopup": "menu",
    "aria-expanded": getAriaExpanded(this.parentMenu.opts.open.current),
    "aria-controls": this.#ariaControls(),
    "data-disabled": getDataDisabled(this.opts.disabled.current),
    "data-state": getDataOpenClosed(this.parentMenu.opts.open.current),
    [this.parentMenu.root.getBitsAttr("trigger")]: "",
    //
    onpointerdown: this.onpointerdown,
    onpointerup: this.onpointerup,
    onkeydown: this.onkeydown,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Menu_item($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    child,
    children,
    ref = null,
    id = createId(uid),
    disabled = false,
    onSelect = noop,
    closeOnSelect = true,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const itemState = MenuItemState.create({
    id: box.with(() => id),
    disabled: box.with(() => disabled),
    onSelect: box.with(() => onSelect),
    ref: box.with(() => ref, (v) => ref = v),
    closeOnSelect: box.with(() => closeOnSelect)
  });
  const mergedProps = mergeProps(restProps, itemState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Menu_separator($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    ref = null,
    id = createId(uid),
    child,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const separatorState = MenuSeparatorState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, separatorState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
const popoverAttrs = createBitsAttrs({
  component: "popover",
  parts: ["root", "trigger", "content", "close"]
});
const PopoverRootContext = new Context("Popover.Root");
class PopoverRootState {
  static create(opts) {
    return PopoverRootContext.set(new PopoverRootState(opts));
  }
  opts;
  contentNode = null;
  triggerNode = null;
  constructor(opts) {
    this.opts = opts;
    new OpenChangeComplete({
      ref: box.with(() => this.contentNode),
      open: this.opts.open,
      onComplete: () => {
        this.opts.onOpenChangeComplete.current(this.opts.open.current);
      }
    });
  }
  toggleOpen() {
    this.opts.open.current = !this.opts.open.current;
  }
  handleClose() {
    if (!this.opts.open.current) return;
    this.opts.open.current = false;
  }
}
class PopoverTriggerState {
  static create(opts) {
    return new PopoverTriggerState(opts, PopoverRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref, (v) => this.root.triggerNode = v);
    this.onclick = this.onclick.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
  }
  onclick(e) {
    if (this.opts.disabled.current) return;
    if (e.button !== 0) return;
    this.root.toggleOpen();
  }
  onkeydown(e) {
    if (this.opts.disabled.current) return;
    if (!(e.key === ENTER || e.key === SPACE)) return;
    e.preventDefault();
    this.root.toggleOpen();
  }
  #getAriaControls() {
    if (this.root.opts.open.current && this.root.contentNode?.id) {
      return this.root.contentNode?.id;
    }
    return void 0;
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    "aria-haspopup": "dialog",
    "aria-expanded": getAriaExpanded(this.root.opts.open.current),
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    "aria-controls": this.#getAriaControls(),
    [popoverAttrs.trigger]: "",
    disabled: this.opts.disabled.current,
    //
    onkeydown: this.onkeydown,
    onclick: this.onclick,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class PopoverContentState {
  static create(opts) {
    return new PopoverContentState(opts, PopoverRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref, (v) => this.root.contentNode = v);
  }
  onInteractOutside = (e) => {
    this.opts.onInteractOutside.current(e);
    if (e.defaultPrevented) return;
    if (!isElement(e.target)) return;
    const closestTrigger = e.target.closest(popoverAttrs.selector("trigger"));
    if (closestTrigger === this.root.triggerNode) return;
    this.root.handleClose();
  };
  onEscapeKeydown = (e) => {
    this.opts.onEscapeKeydown.current(e);
    if (e.defaultPrevented) return;
    this.root.handleClose();
  };
  onCloseAutoFocus = (e) => {
    this.opts.onCloseAutoFocus.current(e);
    if (e.defaultPrevented) return;
    e.preventDefault();
    this.root.triggerNode?.focus();
  };
  #snippetProps = derived(() => ({ open: this.root.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    tabindex: -1,
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    [popoverAttrs.content]: "",
    style: { pointerEvents: "auto" },
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
  popperProps = {
    onInteractOutside: this.onInteractOutside,
    onEscapeKeydown: this.onEscapeKeydown,
    onCloseAutoFocus: this.onCloseAutoFocus
  };
}
class PopoverCloseState {
  static create(opts) {
    return new PopoverCloseState(opts, PopoverRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
    this.onclick = this.onclick.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
  }
  onclick(_) {
    this.root.handleClose();
  }
  onkeydown(e) {
    if (!(e.key === ENTER || e.key === SPACE)) return;
    e.preventDefault();
    this.root.handleClose();
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    onclick: this.onclick,
    onkeydown: this.onkeydown,
    type: "button",
    [popoverAttrs.close]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Popover_content$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    child,
    children,
    ref = null,
    id = createId(uid),
    forceMount = false,
    onCloseAutoFocus = noop,
    onEscapeKeydown = noop,
    onInteractOutside = noop,
    trapFocus = true,
    preventScroll = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = PopoverContentState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    onInteractOutside: box.with(() => onInteractOutside),
    onEscapeKeydown: box.with(() => onEscapeKeydown),
    onCloseAutoFocus: box.with(() => onCloseAutoFocus)
  });
  const mergedProps = mergeProps(restProps, contentState.props);
  if (forceMount) {
    $$payload.out += "<!--[-->";
    {
      let popper = function($$payload2, { props, wrapperProps }) {
        const finalProps = mergeProps(props, {
          style: getFloatingContentCSSVars("popover")
        });
        if (child) {
          $$payload2.out += "<!--[-->";
          child($$payload2, {
            props: finalProps,
            wrapperProps,
            ...contentState.snippetProps
          });
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<div${spread_attributes({ ...wrapperProps }, null)}><div${spread_attributes({ ...finalProps }, null)}>`;
          children?.($$payload2);
          $$payload2.out += `<!----></div></div>`;
        }
        $$payload2.out += `<!--]-->`;
      };
      Popper_layer_force_mount($$payload, spread_props([
        mergedProps,
        contentState.popperProps,
        {
          ref: contentState.opts.ref,
          enabled: contentState.root.opts.open.current,
          id,
          trapFocus,
          preventScroll,
          loop: true,
          forceMount: true,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else if (!forceMount) {
    $$payload.out += "<!--[1-->";
    {
      let popper = function($$payload2, { props, wrapperProps }) {
        const finalProps = mergeProps(props, {
          style: getFloatingContentCSSVars("popover")
        });
        if (child) {
          $$payload2.out += "<!--[-->";
          child($$payload2, {
            props: finalProps,
            wrapperProps,
            ...contentState.snippetProps
          });
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<div${spread_attributes({ ...wrapperProps }, null)}><div${spread_attributes({ ...finalProps }, null)}>`;
          children?.($$payload2);
          $$payload2.out += `<!----></div></div>`;
        }
        $$payload2.out += `<!--]-->`;
      };
      Popper_layer($$payload, spread_props([
        mergedProps,
        contentState.popperProps,
        {
          ref: contentState.opts.ref,
          open: contentState.root.opts.open.current,
          id,
          trapFocus,
          preventScroll,
          loop: true,
          forceMount: false,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Popover_trigger$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    children,
    child,
    id = createId(uid),
    ref = null,
    type = "button",
    disabled = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = PopoverTriggerState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    disabled: box.with(() => Boolean(disabled))
  });
  const mergedProps = mergeProps(restProps, triggerState.props, { type });
  Floating_layer_anchor($$payload, {
    id,
    ref: triggerState.opts.ref,
    children: ($$payload2) => {
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, { props: mergedProps });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<button${spread_attributes({ ...mergedProps }, null)}>`;
        children?.($$payload2);
        $$payload2.out += `<!----></button>`;
      }
      $$payload2.out += `<!--]-->`;
    }
  });
  bind_props($$props, { ref });
  pop();
}
function Popover_arrow($$payload, $$props) {
  push();
  let { ref = null, $$slots, $$events, ...restProps } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    Floating_layer_arrow($$payload2, spread_props([
      restProps,
      {
        "data-popover-arrow": "",
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Popover_close($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    child,
    children,
    id = createId(uid),
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const closeState = PopoverCloseState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, closeState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Dialog($$payload, $$props) {
  push();
  let {
    open = false,
    onOpenChange = noop,
    onOpenChangeComplete = noop,
    children
  } = $$props;
  DialogRootState.create({
    variant: box.with(() => "dialog"),
    open: box.with(() => open, (v) => {
      open = v;
      onOpenChange(v);
    }),
    onOpenChangeComplete: box.with(() => onOpenChangeComplete)
  });
  children?.($$payload);
  $$payload.out += `<!---->`;
  bind_props($$props, { open });
  pop();
}
function Dialog_close($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    children,
    child,
    id = createId(uid),
    ref = null,
    disabled = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const closeState = DialogCloseState.create({
    variant: box.with(() => "close"),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    disabled: box.with(() => Boolean(disabled))
  });
  const mergedProps = mergeProps(restProps, closeState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Dialog_content$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    children,
    child,
    ref = null,
    forceMount = false,
    onCloseAutoFocus = noop,
    onOpenAutoFocus = noop,
    onEscapeKeydown = noop,
    onInteractOutside = noop,
    trapFocus = true,
    preventScroll = true,
    restoreScrollDelay = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = DialogContentState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, contentState.props);
  {
    let presence = function($$payload2) {
      {
        let focusScope = function($$payload3, { props: focusScopeProps }) {
          Escape_layer($$payload3, spread_props([
            mergedProps,
            {
              enabled: contentState.root.opts.open.current,
              ref: contentState.opts.ref,
              onEscapeKeydown: (e) => {
                onEscapeKeydown(e);
                if (e.defaultPrevented) return;
                contentState.root.handleClose();
              },
              children: ($$payload4) => {
                Dismissible_layer($$payload4, spread_props([
                  mergedProps,
                  {
                    ref: contentState.opts.ref,
                    enabled: contentState.root.opts.open.current,
                    onInteractOutside: (e) => {
                      onInteractOutside(e);
                      if (e.defaultPrevented) return;
                      contentState.root.handleClose();
                    },
                    children: ($$payload5) => {
                      Text_selection_layer($$payload5, spread_props([
                        mergedProps,
                        {
                          ref: contentState.opts.ref,
                          enabled: contentState.root.opts.open.current,
                          children: ($$payload6) => {
                            if (child) {
                              $$payload6.out += "<!--[-->";
                              if (contentState.root.opts.open.current) {
                                $$payload6.out += "<!--[-->";
                                Scroll_lock($$payload6, { preventScroll, restoreScrollDelay });
                              } else {
                                $$payload6.out += "<!--[!-->";
                              }
                              $$payload6.out += `<!--]--> `;
                              child($$payload6, {
                                props: mergeProps(mergedProps, focusScopeProps),
                                ...contentState.snippetProps
                              });
                              $$payload6.out += `<!---->`;
                            } else {
                              $$payload6.out += "<!--[!-->";
                              Scroll_lock($$payload6, { preventScroll });
                              $$payload6.out += `<!----> <div${spread_attributes(
                                {
                                  ...mergeProps(mergedProps, focusScopeProps)
                                },
                                null
                              )}>`;
                              children?.($$payload6);
                              $$payload6.out += `<!----></div>`;
                            }
                            $$payload6.out += `<!--]-->`;
                          },
                          $$slots: { default: true }
                        }
                      ]));
                    },
                    $$slots: { default: true }
                  }
                ]));
              },
              $$slots: { default: true }
            }
          ]));
        };
        Focus_scope($$payload2, {
          ref: contentState.opts.ref,
          loop: true,
          trapFocus,
          enabled: shouldEnableFocusTrap({
            forceMount,
            present: contentState.root.opts.open.current,
            open: contentState.root.opts.open.current
          }),
          onOpenAutoFocus,
          onCloseAutoFocus: (e) => {
            onCloseAutoFocus(e);
            if (e.defaultPrevented) return;
            afterSleep(1, () => contentState.root.triggerNode?.focus());
          },
          focusScope
        });
      }
    };
    Presence_layer($$payload, spread_props([
      mergedProps,
      {
        forceMount,
        open: contentState.root.opts.open.current || forceMount,
        ref: contentState.opts.ref,
        presence,
        $$slots: { presence: true }
      }
    ]));
  }
  bind_props($$props, { ref });
  pop();
}
function Menu($$payload, $$props) {
  push();
  let {
    open = false,
    dir = "ltr",
    onOpenChange = noop,
    onOpenChangeComplete = noop,
    _internal_variant: variant = "dropdown-menu",
    children
  } = $$props;
  const root = MenuRootState.create({
    variant: box.with(() => variant),
    dir: box.with(() => dir),
    onClose: () => {
      open = false;
      onOpenChange(false);
    }
  });
  MenuMenuState.create(
    {
      open: box.with(() => open, (v) => {
        open = v;
        onOpenChange(v);
      }),
      onOpenChangeComplete: box.with(() => onOpenChangeComplete)
    },
    root
  );
  Floating_layer($$payload, {
    children: ($$payload2) => {
      children?.($$payload2);
      $$payload2.out += `<!---->`;
    }
  });
  bind_props($$props, { open });
  pop();
}
function Dropdown_menu_content$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    child,
    children,
    ref = null,
    loop = true,
    onInteractOutside = noop,
    onEscapeKeydown = noop,
    onCloseAutoFocus = noop,
    forceMount = false,
    trapFocus = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = MenuContentState.create({
    id: box.with(() => id),
    loop: box.with(() => loop),
    ref: box.with(() => ref, (v) => ref = v),
    onCloseAutoFocus: box.with(() => onCloseAutoFocus)
  });
  const mergedProps = mergeProps(restProps, contentState.props);
  function handleInteractOutside(e) {
    contentState.handleInteractOutside(e);
    if (e.defaultPrevented) return;
    onInteractOutside(e);
    if (e.defaultPrevented) return;
    if (e.target && e.target instanceof Element) {
      const subContentSelector = `[${contentState.parentMenu.root.getBitsAttr("sub-content")}]`;
      if (e.target.closest(subContentSelector)) return;
    }
    contentState.parentMenu.onClose();
  }
  function handleEscapeKeydown(e) {
    onEscapeKeydown(e);
    if (e.defaultPrevented) return;
    contentState.parentMenu.onClose();
  }
  if (forceMount) {
    $$payload.out += "<!--[-->";
    {
      let popper = function($$payload2, { props, wrapperProps }) {
        const finalProps = mergeProps(props, {
          style: getFloatingContentCSSVars("dropdown-menu")
        });
        if (child) {
          $$payload2.out += "<!--[-->";
          child($$payload2, {
            props: finalProps,
            wrapperProps,
            ...contentState.snippetProps
          });
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<div${spread_attributes({ ...wrapperProps }, null)}><div${spread_attributes({ ...finalProps }, null)}>`;
          children?.($$payload2);
          $$payload2.out += `<!----></div></div>`;
        }
        $$payload2.out += `<!--]-->`;
      };
      Popper_layer_force_mount($$payload, spread_props([
        mergedProps,
        contentState.popperProps,
        {
          ref: contentState.opts.ref,
          enabled: contentState.parentMenu.opts.open.current,
          onInteractOutside: handleInteractOutside,
          onEscapeKeydown: handleEscapeKeydown,
          trapFocus,
          loop,
          forceMount: true,
          id,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else if (!forceMount) {
    $$payload.out += "<!--[1-->";
    {
      let popper = function($$payload2, { props, wrapperProps }) {
        const finalProps = mergeProps(props, {
          style: getFloatingContentCSSVars("dropdown-menu")
        });
        if (child) {
          $$payload2.out += "<!--[-->";
          child($$payload2, {
            props: finalProps,
            wrapperProps,
            ...contentState.snippetProps
          });
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<div${spread_attributes({ ...wrapperProps }, null)}><div${spread_attributes({ ...finalProps }, null)}>`;
          children?.($$payload2);
          $$payload2.out += `<!----></div></div>`;
        }
        $$payload2.out += `<!--]-->`;
      };
      Popper_layer($$payload, spread_props([
        mergedProps,
        contentState.popperProps,
        {
          ref: contentState.opts.ref,
          open: contentState.parentMenu.opts.open.current,
          onInteractOutside: handleInteractOutside,
          onEscapeKeydown: handleEscapeKeydown,
          trapFocus,
          loop,
          forceMount: false,
          id,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Menu_trigger($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    child,
    children,
    disabled = false,
    type = "button",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = DropdownMenuTriggerState.create({
    id: box.with(() => id),
    disabled: box.with(() => disabled ?? false),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, triggerState.props, { type });
  Floating_layer_anchor($$payload, {
    id,
    ref: triggerState.opts.ref,
    children: ($$payload2) => {
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, { props: mergedProps });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<button${spread_attributes({ ...mergedProps }, null)}>`;
        children?.($$payload2);
        $$payload2.out += `<!----></button>`;
      }
      $$payload2.out += `<!--]-->`;
    }
  });
  bind_props($$props, { ref });
  pop();
}
const labelAttrs = createBitsAttrs({ component: "label", parts: ["root"] });
class LabelRootState {
  static create(opts) {
    return new LabelRootState(opts);
  }
  opts;
  attachment;
  constructor(opts) {
    this.opts = opts;
    this.attachment = attachRef(this.opts.ref);
    this.onmousedown = this.onmousedown.bind(this);
  }
  onmousedown(e) {
    if (e.detail > 1) e.preventDefault();
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    [labelAttrs.root]: "",
    onmousedown: this.onmousedown,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Label$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    children,
    child,
    id = createId(uid),
    ref = null,
    for: forProp,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = LabelRootState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, rootState.props, { for: forProp });
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<label${spread_attributes({ ...mergedProps, for: forProp }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></label>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
class SvelteResizeObserver {
  #node;
  #onResize;
  constructor(node, onResize) {
    this.#node = node;
    this.#onResize = onResize;
    this.handler = this.handler.bind(this);
  }
  handler() {
    let rAF = 0;
    const _node = this.#node();
    if (!_node) return;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(rAF);
      rAF = window.requestAnimationFrame(this.#onResize);
    });
    resizeObserver.observe(_node);
    return () => {
      window.cancelAnimationFrame(rAF);
      resizeObserver.unobserve(_node);
    };
  }
}
function Popover($$payload, $$props) {
  push();
  let {
    open = false,
    onOpenChange = noop,
    onOpenChangeComplete = noop,
    children
  } = $$props;
  PopoverRootState.create({
    open: box.with(() => open, (v) => {
      open = v;
      onOpenChange(v);
    }),
    onOpenChangeComplete: box.with(() => onOpenChangeComplete)
  });
  Floating_layer($$payload, {
    children: ($$payload2) => {
      children?.($$payload2);
      $$payload2.out += `<!---->`;
    }
  });
  bind_props($$props, { open });
  pop();
}
function clamp(n2, min, max) {
  return Math.min(max, Math.max(min, n2));
}
const scrollAreaAttrs = createBitsAttrs({
  component: "scroll-area",
  parts: [
    "root",
    "viewport",
    "corner",
    "thumb",
    "scrollbar"
  ]
});
const ScrollAreaRootContext = new Context("ScrollArea.Root");
const ScrollAreaScrollbarContext = new Context("ScrollArea.Scrollbar");
const ScrollAreaScrollbarVisibleContext = new Context("ScrollArea.ScrollbarVisible");
const ScrollAreaScrollbarAxisContext = new Context("ScrollArea.ScrollbarAxis");
const ScrollAreaScrollbarSharedContext = new Context("ScrollArea.ScrollbarShared");
class ScrollAreaRootState {
  static create(opts) {
    return ScrollAreaRootContext.set(new ScrollAreaRootState(opts));
  }
  opts;
  attachment;
  scrollAreaNode = null;
  viewportNode = null;
  contentNode = null;
  scrollbarXNode = null;
  scrollbarYNode = null;
  cornerWidth = 0;
  cornerHeight = 0;
  scrollbarXEnabled = false;
  scrollbarYEnabled = false;
  domContext;
  constructor(opts) {
    this.opts = opts;
    this.attachment = attachRef(opts.ref, (v) => this.scrollAreaNode = v);
    this.domContext = new DOMContext(opts.ref);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    dir: this.opts.dir.current,
    style: {
      position: "relative",
      "--bits-scroll-area-corner-height": `${this.cornerHeight}px`,
      "--bits-scroll-area-corner-width": `${this.cornerWidth}px`
    },
    [scrollAreaAttrs.root]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class ScrollAreaViewportState {
  static create(opts) {
    return new ScrollAreaViewportState(opts, ScrollAreaRootContext.get());
  }
  opts;
  root;
  attachment;
  #contentId = box(useId());
  #contentRef = box(null);
  contentAttachment = attachRef(this.#contentRef, (v) => this.root.contentNode = v);
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(opts.ref, (v) => this.root.viewportNode = v);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    style: {
      overflowX: this.root.scrollbarXEnabled ? "scroll" : "hidden",
      overflowY: this.root.scrollbarYEnabled ? "scroll" : "hidden"
    },
    [scrollAreaAttrs.viewport]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
  #contentProps = derived(() => ({
    id: this.#contentId.current,
    "data-scroll-area-content": "",
    /**
     * When horizontal scrollbar is visible: this element should be at least
     * as wide as its children for size calculations to work correctly.
     *
     * When horizontal scrollbar is NOT visible: this element's width should
     * be constrained by the parent container to enable `text-overflow: ellipsis`
     */
    style: {
      minWidth: this.root.scrollbarXEnabled ? "fit-content" : void 0
    },
    ...this.contentAttachment
  }));
  get contentProps() {
    return this.#contentProps();
  }
  set contentProps($$value) {
    return this.#contentProps($$value);
  }
}
class ScrollAreaScrollbarState {
  static create(opts) {
    return ScrollAreaScrollbarContext.set(new ScrollAreaScrollbarState(opts, ScrollAreaRootContext.get()));
  }
  opts;
  root;
  #isHorizontal = derived(() => this.opts.orientation.current === "horizontal");
  get isHorizontal() {
    return this.#isHorizontal();
  }
  set isHorizontal($$value) {
    return this.#isHorizontal($$value);
  }
  hasThumb = false;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    watch(() => this.isHorizontal, (isHorizontal) => {
      if (isHorizontal) {
        this.root.scrollbarXEnabled = true;
        return () => {
          this.root.scrollbarXEnabled = false;
        };
      } else {
        this.root.scrollbarYEnabled = true;
        return () => {
          this.root.scrollbarYEnabled = false;
        };
      }
    });
  }
}
class ScrollAreaScrollbarHoverState {
  static create() {
    return new ScrollAreaScrollbarHoverState(ScrollAreaScrollbarContext.get());
  }
  scrollbar;
  root;
  isVisible = false;
  constructor(scrollbar) {
    this.scrollbar = scrollbar;
    this.root = scrollbar.root;
  }
  #props = derived(() => ({
    "data-state": this.isVisible ? "visible" : "hidden"
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class ScrollAreaScrollbarScrollState {
  static create() {
    return new ScrollAreaScrollbarScrollState(ScrollAreaScrollbarContext.get());
  }
  scrollbar;
  root;
  machine = new StateMachine("hidden", {
    hidden: { SCROLL: "scrolling" },
    scrolling: {
      SCROLL_END: "idle",
      POINTER_ENTER: "interacting"
    },
    interacting: { SCROLL: "interacting", POINTER_LEAVE: "idle" },
    idle: {
      HIDE: "hidden",
      SCROLL: "scrolling",
      POINTER_ENTER: "interacting"
    }
  });
  #isHidden = derived(() => this.machine.state.current === "hidden");
  get isHidden() {
    return this.#isHidden();
  }
  set isHidden($$value) {
    return this.#isHidden($$value);
  }
  constructor(scrollbar) {
    this.scrollbar = scrollbar;
    this.root = scrollbar.root;
    useDebounce(() => this.machine.dispatch("SCROLL_END"), 100);
    this.onpointerenter = this.onpointerenter.bind(this);
    this.onpointerleave = this.onpointerleave.bind(this);
  }
  onpointerenter(_) {
    this.machine.dispatch("POINTER_ENTER");
  }
  onpointerleave(_) {
    this.machine.dispatch("POINTER_LEAVE");
  }
  #props = derived(() => ({
    "data-state": this.machine.state.current === "hidden" ? "hidden" : "visible",
    onpointerenter: this.onpointerenter,
    onpointerleave: this.onpointerleave
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class ScrollAreaScrollbarAutoState {
  static create() {
    return new ScrollAreaScrollbarAutoState(ScrollAreaScrollbarContext.get());
  }
  scrollbar;
  root;
  isVisible = false;
  constructor(scrollbar) {
    this.scrollbar = scrollbar;
    this.root = scrollbar.root;
    const handleResize = useDebounce(
      () => {
        const viewportNode = this.root.viewportNode;
        if (!viewportNode) return;
        const isOverflowX = viewportNode.offsetWidth < viewportNode.scrollWidth;
        const isOverflowY = viewportNode.offsetHeight < viewportNode.scrollHeight;
        this.isVisible = this.scrollbar.isHorizontal ? isOverflowX : isOverflowY;
      },
      10
    );
    new SvelteResizeObserver(() => this.root.viewportNode, handleResize);
    new SvelteResizeObserver(() => this.root.contentNode, handleResize);
  }
  #props = derived(() => ({
    "data-state": this.isVisible ? "visible" : "hidden"
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class ScrollAreaScrollbarVisibleState {
  static create() {
    return ScrollAreaScrollbarVisibleContext.set(new ScrollAreaScrollbarVisibleState(ScrollAreaScrollbarContext.get()));
  }
  scrollbar;
  root;
  thumbNode = null;
  pointerOffset = 0;
  sizes = {
    content: 0,
    viewport: 0,
    scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 }
  };
  #thumbRatio = derived(() => getThumbRatio(this.sizes.viewport, this.sizes.content));
  get thumbRatio() {
    return this.#thumbRatio();
  }
  set thumbRatio($$value) {
    return this.#thumbRatio($$value);
  }
  #hasThumb = derived(() => Boolean(this.thumbRatio > 0 && this.thumbRatio < 1));
  get hasThumb() {
    return this.#hasThumb();
  }
  set hasThumb($$value) {
    return this.#hasThumb($$value);
  }
  // this needs to be a $state to properly restore the transform style when the scrollbar
  // goes from a hidden to visible state, otherwise it will start at the beginning of the
  // scrollbar and flicker to the correct position after
  prevTransformStyle = "";
  constructor(scrollbar) {
    this.scrollbar = scrollbar;
    this.root = scrollbar.root;
  }
  setSizes(sizes) {
    this.sizes = sizes;
  }
  getScrollPosition(pointerPos, dir) {
    return getScrollPositionFromPointer({
      pointerPos,
      pointerOffset: this.pointerOffset,
      sizes: this.sizes,
      dir
    });
  }
  onThumbPointerUp() {
    this.pointerOffset = 0;
  }
  onThumbPointerDown(pointerPos) {
    this.pointerOffset = pointerPos;
  }
  xOnThumbPositionChange() {
    if (!(this.root.viewportNode && this.thumbNode)) return;
    const scrollPos = this.root.viewportNode.scrollLeft;
    const offset2 = getThumbOffsetFromScroll({
      scrollPos,
      sizes: this.sizes,
      dir: this.root.opts.dir.current
    });
    const transformStyle = `translate3d(${offset2}px, 0, 0)`;
    this.thumbNode.style.transform = transformStyle;
    this.prevTransformStyle = transformStyle;
  }
  xOnWheelScroll(scrollPos) {
    if (!this.root.viewportNode) return;
    this.root.viewportNode.scrollLeft = scrollPos;
  }
  xOnDragScroll(pointerPos) {
    if (!this.root.viewportNode) return;
    this.root.viewportNode.scrollLeft = this.getScrollPosition(pointerPos, this.root.opts.dir.current);
  }
  yOnThumbPositionChange() {
    if (!(this.root.viewportNode && this.thumbNode)) return;
    const scrollPos = this.root.viewportNode.scrollTop;
    const offset2 = getThumbOffsetFromScroll({ scrollPos, sizes: this.sizes });
    const transformStyle = `translate3d(0, ${offset2}px, 0)`;
    this.thumbNode.style.transform = transformStyle;
    this.prevTransformStyle = transformStyle;
  }
  yOnWheelScroll(scrollPos) {
    if (!this.root.viewportNode) return;
    this.root.viewportNode.scrollTop = scrollPos;
  }
  yOnDragScroll(pointerPos) {
    if (!this.root.viewportNode) return;
    this.root.viewportNode.scrollTop = this.getScrollPosition(pointerPos, this.root.opts.dir.current);
  }
}
class ScrollAreaScrollbarXState {
  static create(opts) {
    return ScrollAreaScrollbarAxisContext.set(new ScrollAreaScrollbarXState(opts, ScrollAreaScrollbarVisibleContext.get()));
  }
  opts;
  scrollbarVis;
  root;
  scrollbar;
  attachment;
  computedStyle;
  constructor(opts, scrollbarVis) {
    this.opts = opts;
    this.scrollbarVis = scrollbarVis;
    this.root = scrollbarVis.root;
    this.scrollbar = scrollbarVis.scrollbar;
    this.attachment = attachRef(this.scrollbar.opts.ref, (v) => this.root.scrollbarXNode = v);
  }
  onThumbPointerDown = (pointerPos) => {
    this.scrollbarVis.onThumbPointerDown(pointerPos.x);
  };
  onDragScroll = (pointerPos) => {
    this.scrollbarVis.xOnDragScroll(pointerPos.x);
  };
  onThumbPointerUp = () => {
    this.scrollbarVis.onThumbPointerUp();
  };
  onThumbPositionChange = () => {
    this.scrollbarVis.xOnThumbPositionChange();
  };
  onWheelScroll = (e, maxScrollPos) => {
    if (!this.root.viewportNode) return;
    const scrollPos = this.root.viewportNode.scrollLeft + e.deltaX;
    this.scrollbarVis.xOnWheelScroll(scrollPos);
    if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
      e.preventDefault();
    }
  };
  onResize = () => {
    if (!(this.scrollbar.opts.ref.current && this.root.viewportNode && this.computedStyle)) return;
    this.scrollbarVis.setSizes({
      content: this.root.viewportNode.scrollWidth,
      viewport: this.root.viewportNode.offsetWidth,
      scrollbar: {
        size: this.scrollbar.opts.ref.current.clientWidth,
        paddingStart: toInt(this.computedStyle.paddingLeft),
        paddingEnd: toInt(this.computedStyle.paddingRight)
      }
    });
  };
  #thumbSize = derived(() => {
    return getThumbSize(this.scrollbarVis.sizes);
  });
  get thumbSize() {
    return this.#thumbSize();
  }
  set thumbSize($$value) {
    return this.#thumbSize($$value);
  }
  #props = derived(() => ({
    id: this.scrollbar.opts.id.current,
    "data-orientation": "horizontal",
    style: {
      bottom: 0,
      left: this.root.opts.dir.current === "rtl" ? "var(--bits-scroll-area-corner-width)" : 0,
      right: this.root.opts.dir.current === "ltr" ? "var(--bits-scroll-area-corner-width)" : 0,
      "--bits-scroll-area-thumb-width": `${this.thumbSize}px`
    },
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class ScrollAreaScrollbarYState {
  static create(opts) {
    return ScrollAreaScrollbarAxisContext.set(new ScrollAreaScrollbarYState(opts, ScrollAreaScrollbarVisibleContext.get()));
  }
  opts;
  scrollbarVis;
  root;
  scrollbar;
  attachment;
  computedStyle;
  constructor(opts, scrollbarVis) {
    this.opts = opts;
    this.scrollbarVis = scrollbarVis;
    this.root = scrollbarVis.root;
    this.scrollbar = scrollbarVis.scrollbar;
    this.attachment = attachRef(this.scrollbar.opts.ref, (v) => this.root.scrollbarYNode = v);
    this.onThumbPointerDown = this.onThumbPointerDown.bind(this);
    this.onDragScroll = this.onDragScroll.bind(this);
    this.onThumbPointerUp = this.onThumbPointerUp.bind(this);
    this.onThumbPositionChange = this.onThumbPositionChange.bind(this);
    this.onWheelScroll = this.onWheelScroll.bind(this);
    this.onResize = this.onResize.bind(this);
  }
  onThumbPointerDown(pointerPos) {
    this.scrollbarVis.onThumbPointerDown(pointerPos.y);
  }
  onDragScroll(pointerPos) {
    this.scrollbarVis.yOnDragScroll(pointerPos.y);
  }
  onThumbPointerUp() {
    this.scrollbarVis.onThumbPointerUp();
  }
  onThumbPositionChange() {
    this.scrollbarVis.yOnThumbPositionChange();
  }
  onWheelScroll(e, maxScrollPos) {
    if (!this.root.viewportNode) return;
    const scrollPos = this.root.viewportNode.scrollTop + e.deltaY;
    this.scrollbarVis.yOnWheelScroll(scrollPos);
    if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
      e.preventDefault();
    }
  }
  onResize() {
    if (!(this.scrollbar.opts.ref.current && this.root.viewportNode && this.computedStyle)) return;
    this.scrollbarVis.setSizes({
      content: this.root.viewportNode.scrollHeight,
      viewport: this.root.viewportNode.offsetHeight,
      scrollbar: {
        size: this.scrollbar.opts.ref.current.clientHeight,
        paddingStart: toInt(this.computedStyle.paddingTop),
        paddingEnd: toInt(this.computedStyle.paddingBottom)
      }
    });
  }
  #thumbSize = derived(() => {
    return getThumbSize(this.scrollbarVis.sizes);
  });
  get thumbSize() {
    return this.#thumbSize();
  }
  set thumbSize($$value) {
    return this.#thumbSize($$value);
  }
  #props = derived(() => ({
    id: this.scrollbar.opts.id.current,
    "data-orientation": "vertical",
    style: {
      top: 0,
      right: this.root.opts.dir.current === "ltr" ? 0 : void 0,
      left: this.root.opts.dir.current === "rtl" ? 0 : void 0,
      bottom: "var(--bits-scroll-area-corner-height)",
      "--bits-scroll-area-thumb-height": `${this.thumbSize}px`
    },
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class ScrollAreaScrollbarSharedState {
  static create() {
    return ScrollAreaScrollbarSharedContext.set(new ScrollAreaScrollbarSharedState(ScrollAreaScrollbarAxisContext.get()));
  }
  scrollbarState;
  root;
  scrollbarVis;
  scrollbar;
  rect = null;
  prevWebkitUserSelect = "";
  handleResize;
  handleThumbPositionChange;
  handleWheelScroll;
  handleThumbPointerDown;
  handleThumbPointerUp;
  #maxScrollPos = derived(() => this.scrollbarVis.sizes.content - this.scrollbarVis.sizes.viewport);
  get maxScrollPos() {
    return this.#maxScrollPos();
  }
  set maxScrollPos($$value) {
    return this.#maxScrollPos($$value);
  }
  constructor(scrollbarState) {
    this.scrollbarState = scrollbarState;
    this.root = scrollbarState.root;
    this.scrollbarVis = scrollbarState.scrollbarVis;
    this.scrollbar = scrollbarState.scrollbarVis.scrollbar;
    this.handleResize = useDebounce(() => this.scrollbarState.onResize(), 10);
    this.handleThumbPositionChange = this.scrollbarState.onThumbPositionChange;
    this.handleWheelScroll = this.scrollbarState.onWheelScroll;
    this.handleThumbPointerDown = this.scrollbarState.onThumbPointerDown;
    this.handleThumbPointerUp = this.scrollbarState.onThumbPointerUp;
    new SvelteResizeObserver(() => this.scrollbar.opts.ref.current, this.handleResize);
    new SvelteResizeObserver(() => this.root.contentNode, this.handleResize);
    this.onpointerdown = this.onpointerdown.bind(this);
    this.onpointermove = this.onpointermove.bind(this);
    this.onpointerup = this.onpointerup.bind(this);
  }
  handleDragScroll(e) {
    if (!this.rect) return;
    const x = e.clientX - this.rect.left;
    const y = e.clientY - this.rect.top;
    this.scrollbarState.onDragScroll({ x, y });
  }
  onpointerdown(e) {
    if (e.button !== 0) return;
    const target = e.target;
    target.setPointerCapture(e.pointerId);
    this.rect = this.scrollbar.opts.ref.current?.getBoundingClientRect() ?? null;
    this.prevWebkitUserSelect = this.root.domContext.getDocument().body.style.webkitUserSelect;
    this.root.domContext.getDocument().body.style.webkitUserSelect = "none";
    if (this.root.viewportNode) this.root.viewportNode.style.scrollBehavior = "auto";
    this.handleDragScroll(e);
  }
  onpointermove(e) {
    this.handleDragScroll(e);
  }
  onpointerup(e) {
    const target = e.target;
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
    this.root.domContext.getDocument().body.style.webkitUserSelect = this.prevWebkitUserSelect;
    if (this.root.viewportNode) this.root.viewportNode.style.scrollBehavior = "";
    this.rect = null;
  }
  #props = derived(() => mergeProps({
    ...this.scrollbarState.props,
    style: {
      position: "absolute",
      ...this.scrollbarState.props.style
    },
    [scrollAreaAttrs.scrollbar]: "",
    onpointerdown: this.onpointerdown,
    onpointermove: this.onpointermove,
    onpointerup: this.onpointerup
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class ScrollAreaThumbImplState {
  static create(opts) {
    return new ScrollAreaThumbImplState(opts, ScrollAreaScrollbarSharedContext.get());
  }
  opts;
  scrollbarState;
  attachment;
  #root;
  #removeUnlinkedScrollListener;
  #debounceScrollEnd = useDebounce(
    () => {
      if (this.#removeUnlinkedScrollListener) {
        this.#removeUnlinkedScrollListener();
        this.#removeUnlinkedScrollListener = void 0;
      }
    },
    100
  );
  constructor(opts, scrollbarState) {
    this.opts = opts;
    this.scrollbarState = scrollbarState;
    this.#root = scrollbarState.root;
    this.attachment = attachRef(this.opts.ref, (v) => this.scrollbarState.scrollbarVis.thumbNode = v);
    this.onpointerdowncapture = this.onpointerdowncapture.bind(this);
    this.onpointerup = this.onpointerup.bind(this);
  }
  onpointerdowncapture(e) {
    const thumb = e.target;
    if (!thumb) return;
    const thumbRect = thumb.getBoundingClientRect();
    const x = e.clientX - thumbRect.left;
    const y = e.clientY - thumbRect.top;
    this.scrollbarState.handleThumbPointerDown({ x, y });
  }
  onpointerup(_) {
    this.scrollbarState.handleThumbPointerUp();
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    "data-state": this.scrollbarState.scrollbarVis.hasThumb ? "visible" : "hidden",
    style: {
      width: "var(--bits-scroll-area-thumb-width)",
      height: "var(--bits-scroll-area-thumb-height)",
      transform: this.scrollbarState.scrollbarVis.prevTransformStyle
    },
    onpointerdowncapture: this.onpointerdowncapture,
    onpointerup: this.onpointerup,
    [scrollAreaAttrs.thumb]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class ScrollAreaCornerImplState {
  static create(opts) {
    return new ScrollAreaCornerImplState(opts, ScrollAreaRootContext.get());
  }
  opts;
  root;
  attachment;
  #width = 0;
  #height = 0;
  #hasSize = derived(() => Boolean(this.#width && this.#height));
  get hasSize() {
    return this.#hasSize();
  }
  set hasSize($$value) {
    return this.#hasSize($$value);
  }
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
    new SvelteResizeObserver(() => this.root.scrollbarXNode, () => {
      const height = this.root.scrollbarXNode?.offsetHeight || 0;
      this.root.cornerHeight = height;
      this.#height = height;
    });
    new SvelteResizeObserver(() => this.root.scrollbarYNode, () => {
      const width = this.root.scrollbarYNode?.offsetWidth || 0;
      this.root.cornerWidth = width;
      this.#width = width;
    });
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    style: {
      width: this.#width,
      height: this.#height,
      position: "absolute",
      right: this.root.opts.dir.current === "ltr" ? 0 : void 0,
      left: this.root.opts.dir.current === "rtl" ? 0 : void 0,
      bottom: 0
    },
    [scrollAreaAttrs.corner]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function toInt(value) {
  return value ? Number.parseInt(value, 10) : 0;
}
function getThumbRatio(viewportSize, contentSize) {
  const ratio = viewportSize / contentSize;
  return Number.isNaN(ratio) ? 0 : ratio;
}
function getThumbSize(sizes) {
  const ratio = getThumbRatio(sizes.viewport, sizes.content);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio;
  return Math.max(thumbSize, 18);
}
function getScrollPositionFromPointer({
  pointerPos,
  pointerOffset,
  sizes,
  dir = "ltr"
}) {
  const thumbSizePx = getThumbSize(sizes);
  const thumbCenter = thumbSizePx / 2;
  const offset2 = pointerOffset || thumbCenter;
  const thumbOffsetFromEnd = thumbSizePx - offset2;
  const minPointerPos = sizes.scrollbar.paddingStart + offset2;
  const maxPointerPos = sizes.scrollbar.size - sizes.scrollbar.paddingEnd - thumbOffsetFromEnd;
  const maxScrollPos = sizes.content - sizes.viewport;
  const scrollRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const interpolate = linearScale([minPointerPos, maxPointerPos], scrollRange);
  return interpolate(pointerPos);
}
function getThumbOffsetFromScroll({ scrollPos, sizes, dir = "ltr" }) {
  const thumbSizePx = getThumbSize(sizes);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const scrollbar = sizes.scrollbar.size - scrollbarPadding;
  const maxScrollPos = sizes.content - sizes.viewport;
  const maxThumbPos = scrollbar - thumbSizePx;
  const scrollClampRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const scrollWithoutMomentum = clamp(scrollPos, scrollClampRange[0], scrollClampRange[1]);
  const interpolate = linearScale([0, maxScrollPos], [0, maxThumbPos]);
  return interpolate(scrollWithoutMomentum);
}
function linearScale(input, output) {
  return (value) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}
function isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos) {
  return scrollPos > 0 && scrollPos < maxScrollPos;
}
function Scroll_area$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    ref = null,
    id = createId(uid),
    type = "hover",
    dir = "ltr",
    scrollHideDelay = 600,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = ScrollAreaRootState.create({
    type: box.with(() => type),
    dir: box.with(() => dir),
    scrollHideDelay: box.with(() => scrollHideDelay),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, rootState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_viewport($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    ref = null,
    id = createId(uid),
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const viewportState = ScrollAreaViewportState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, viewportState.props);
  const mergedContentProps = mergeProps({}, viewportState.contentProps);
  $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}><div${spread_attributes({ ...mergedContentProps }, null)}>`;
  children?.($$payload);
  $$payload.out += `<!----></div></div>`;
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_scrollbar_shared($$payload, $$props) {
  push();
  let {
    child,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarSharedState = ScrollAreaScrollbarSharedState.create();
  const mergedProps = mergeProps(restProps, scrollbarSharedState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function Scroll_area_scrollbar_x($$payload, $$props) {
  push();
  let { $$slots, $$events, ...restProps } = $$props;
  const isMounted = new IsMounted();
  const scrollbarXState = ScrollAreaScrollbarXState.create({ mounted: box.with(() => isMounted.current) });
  const mergedProps = mergeProps(restProps, scrollbarXState.props);
  Scroll_area_scrollbar_shared($$payload, spread_props([mergedProps]));
  pop();
}
function Scroll_area_scrollbar_y($$payload, $$props) {
  push();
  let { $$slots, $$events, ...restProps } = $$props;
  const isMounted = new IsMounted();
  const scrollbarYState = ScrollAreaScrollbarYState.create({ mounted: box.with(() => isMounted.current) });
  const mergedProps = mergeProps(restProps, scrollbarYState.props);
  Scroll_area_scrollbar_shared($$payload, spread_props([mergedProps]));
  pop();
}
function Scroll_area_scrollbar_visible($$payload, $$props) {
  push();
  let { $$slots, $$events, ...restProps } = $$props;
  const scrollbarVisibleState = ScrollAreaScrollbarVisibleState.create();
  if (scrollbarVisibleState.scrollbar.opts.orientation.current === "horizontal") {
    $$payload.out += "<!--[-->";
    Scroll_area_scrollbar_x($$payload, spread_props([restProps]));
  } else {
    $$payload.out += "<!--[!-->";
    Scroll_area_scrollbar_y($$payload, spread_props([restProps]));
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function Scroll_area_scrollbar_auto($$payload, $$props) {
  push();
  let {
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarAutoState = ScrollAreaScrollbarAutoState.create();
  const mergedProps = mergeProps(restProps, scrollbarAutoState.props);
  {
    let presence = function($$payload2) {
      Scroll_area_scrollbar_visible($$payload2, spread_props([mergedProps]));
    };
    Presence_layer($$payload, {
      open: forceMount || scrollbarAutoState.isVisible,
      ref: scrollbarAutoState.scrollbar.opts.ref,
      presence
    });
  }
  pop();
}
function Scroll_area_scrollbar_scroll($$payload, $$props) {
  push();
  let {
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarScrollState = ScrollAreaScrollbarScrollState.create();
  const mergedProps = mergeProps(restProps, scrollbarScrollState.props);
  {
    let presence = function($$payload2) {
      Scroll_area_scrollbar_visible($$payload2, spread_props([mergedProps]));
    };
    Presence_layer($$payload, spread_props([
      mergedProps,
      {
        open: forceMount || !scrollbarScrollState.isHidden,
        ref: scrollbarScrollState.scrollbar.opts.ref,
        presence,
        $$slots: { presence: true }
      }
    ]));
  }
  pop();
}
function Scroll_area_scrollbar_hover($$payload, $$props) {
  push();
  let {
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarHoverState = ScrollAreaScrollbarHoverState.create();
  const scrollbarAutoState = ScrollAreaScrollbarAutoState.create();
  const mergedProps = mergeProps(restProps, scrollbarHoverState.props, scrollbarAutoState.props, {
    "data-state": scrollbarHoverState.isVisible ? "visible" : "hidden"
  });
  const open = forceMount || scrollbarHoverState.isVisible && scrollbarAutoState.isVisible;
  {
    let presence = function($$payload2) {
      Scroll_area_scrollbar_visible($$payload2, spread_props([mergedProps]));
    };
    Presence_layer($$payload, {
      open,
      ref: scrollbarAutoState.scrollbar.opts.ref,
      presence
    });
  }
  pop();
}
function Scroll_area_scrollbar$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    ref = null,
    id = createId(uid),
    orientation,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarState = ScrollAreaScrollbarState.create({
    orientation: box.with(() => orientation),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const type = scrollbarState.root.opts.type.current;
  if (type === "hover") {
    $$payload.out += "<!--[-->";
    Scroll_area_scrollbar_hover($$payload, spread_props([restProps, { id }]));
  } else if (type === "scroll") {
    $$payload.out += "<!--[1-->";
    Scroll_area_scrollbar_scroll($$payload, spread_props([restProps, { id }]));
  } else if (type === "auto") {
    $$payload.out += "<!--[2-->";
    Scroll_area_scrollbar_auto($$payload, spread_props([restProps, { id }]));
  } else if (type === "always") {
    $$payload.out += "<!--[3-->";
    Scroll_area_scrollbar_visible($$payload, spread_props([restProps, { id }]));
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_thumb_impl($$payload, $$props) {
  push();
  let {
    ref = null,
    id,
    child,
    children,
    present,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const isMounted = new IsMounted();
  const thumbState = ScrollAreaThumbImplState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    mounted: box.with(() => isMounted.current)
  });
  const mergedProps = mergeProps(restProps, thumbState.props, { style: { hidden: !present } });
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_thumb($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarState = ScrollAreaScrollbarVisibleContext.get();
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    {
      let presence = function($$payload3, { present }) {
        Scroll_area_thumb_impl($$payload3, spread_props([
          restProps,
          {
            id,
            present,
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
      };
      Presence_layer($$payload2, {
        open: forceMount || scrollbarState.hasThumb,
        ref: scrollbarState.scrollbar.opts.ref,
        presence
      });
    }
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_corner_impl($$payload, $$props) {
  push();
  let {
    ref = null,
    id,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const cornerState = ScrollAreaCornerImplState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, cornerState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_corner($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    ref = null,
    id = createId(uid),
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollAreaState = ScrollAreaRootContext.get();
  const hasBothScrollbarsVisible = Boolean(scrollAreaState.scrollbarXNode && scrollAreaState.scrollbarYNode);
  const hasCorner = scrollAreaState.opts.type.current !== "scroll" && hasBothScrollbarsVisible;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (hasCorner) {
      $$payload2.out += "<!--[-->";
      Scroll_area_corner_impl($$payload2, spread_props([
        restProps,
        {
          id,
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          }
        }
      ]));
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select($$payload, $$props) {
  push();
  let {
    value = void 0,
    onValueChange = noop,
    name = "",
    disabled = false,
    type,
    open = false,
    onOpenChange = noop,
    onOpenChangeComplete = noop,
    loop = false,
    scrollAlignment = "nearest",
    required = false,
    items = [],
    allowDeselect = false,
    autocomplete,
    children
  } = $$props;
  function handleDefaultValue() {
    if (value !== void 0) return;
    value = type === "single" ? "" : [];
  }
  handleDefaultValue();
  watch.pre(() => value, () => {
    handleDefaultValue();
  });
  let inputValue = "";
  const rootState = SelectRootState.create({
    type,
    value: box.with(() => value, (v) => {
      value = v;
      onValueChange(v);
    }),
    disabled: box.with(() => disabled),
    required: box.with(() => required),
    open: box.with(() => open, (v) => {
      open = v;
      onOpenChange(v);
    }),
    loop: box.with(() => loop),
    scrollAlignment: box.with(() => scrollAlignment),
    name: box.with(() => name),
    isCombobox: false,
    items: box.with(() => items),
    allowDeselect: box.with(() => allowDeselect),
    inputValue: box.with(() => inputValue, (v) => inputValue = v),
    onOpenChangeComplete: box.with(() => onOpenChangeComplete)
  });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    Floating_layer($$payload2, {
      children: ($$payload3) => {
        children?.($$payload3);
        $$payload3.out += `<!---->`;
      }
    });
    $$payload2.out += `<!----> `;
    if (Array.isArray(rootState.opts.value.current)) {
      $$payload2.out += "<!--[-->";
      if (rootState.opts.value.current.length) {
        $$payload2.out += "<!--[-->";
        const each_array = ensure_array_like(rootState.opts.value.current);
        $$payload2.out += `<!--[-->`;
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let item = each_array[$$index];
          Select_hidden_input($$payload2, { value: item, autocomplete });
        }
        $$payload2.out += `<!--]-->`;
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]-->`;
    } else {
      $$payload2.out += "<!--[!-->";
      Select_hidden_input($$payload2, {
        autocomplete,
        get value() {
          return rootState.opts.value.current;
        },
        set value($$value) {
          rootState.opts.value.current = $$value;
          $$settled = false;
        }
      });
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { value, open });
  pop();
}
function Select_trigger$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    child,
    children,
    type = "button",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = SelectTriggerState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, triggerState.props, { type });
  $$payload.out += `<!---->`;
  Floating_layer_anchor($$payload, {
    id,
    ref: triggerState.opts.ref,
    children: ($$payload2) => {
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, { props: mergedProps });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<button${spread_attributes({ ...mergedProps }, null)}>`;
        children?.($$payload2);
        $$payload2.out += `<!----></button>`;
      }
      $$payload2.out += `<!--]-->`;
    }
  });
  $$payload.out += `<!---->`;
  bind_props($$props, { ref });
  pop();
}
const defaultOpts = {
  immediate: true
};
class TimeoutFn {
  #opts;
  #interval;
  #cb;
  #timer = null;
  constructor(cb, interval, opts = {}) {
    this.#cb = cb;
    this.#interval = interval;
    this.#opts = { ...defaultOpts, ...opts };
    this.stop = this.stop.bind(this);
    this.start = this.start.bind(this);
    if (this.#opts.immediate && BROWSER) ;
    onDestroyEffect(this.stop);
  }
  #clear() {
    if (this.#timer !== null) {
      window.clearTimeout(this.#timer);
      this.#timer = null;
    }
  }
  stop() {
    this.#clear();
  }
  start(...args) {
    this.#clear();
    this.#timer = window.setTimeout(() => {
      this.#timer = null;
      this.#cb(...args);
    }, this.#interval);
  }
}
const tooltipAttrs = createBitsAttrs({
  component: "tooltip",
  parts: ["content", "trigger"]
});
const TooltipProviderContext = new Context("Tooltip.Provider");
const TooltipRootContext = new Context("Tooltip.Root");
class TooltipProviderState {
  static create(opts) {
    return TooltipProviderContext.set(new TooltipProviderState(opts));
  }
  opts;
  isOpenDelayed = true;
  isPointerInTransit = box(false);
  #timerFn;
  #openTooltip = null;
  constructor(opts) {
    this.opts = opts;
    this.#timerFn = new TimeoutFn(
      () => {
        this.isOpenDelayed = true;
      },
      this.opts.skipDelayDuration.current,
      { immediate: false }
    );
  }
  #startTimer = () => {
    const skipDuration = this.opts.skipDelayDuration.current;
    if (skipDuration === 0) {
      return;
    } else {
      this.#timerFn.start();
    }
  };
  #clearTimer = () => {
    this.#timerFn.stop();
  };
  onOpen = (tooltip) => {
    if (this.#openTooltip && this.#openTooltip !== tooltip) {
      this.#openTooltip.handleClose();
    }
    this.#clearTimer();
    this.isOpenDelayed = false;
    this.#openTooltip = tooltip;
  };
  onClose = (tooltip) => {
    if (this.#openTooltip === tooltip) {
      this.#openTooltip = null;
    }
    this.#startTimer();
  };
  isTooltipOpen = (tooltip) => {
    return this.#openTooltip === tooltip;
  };
}
class TooltipRootState {
  static create(opts) {
    return TooltipRootContext.set(new TooltipRootState(opts, TooltipProviderContext.get()));
  }
  opts;
  provider;
  #delayDuration = derived(() => this.opts.delayDuration.current ?? this.provider.opts.delayDuration.current);
  get delayDuration() {
    return this.#delayDuration();
  }
  set delayDuration($$value) {
    return this.#delayDuration($$value);
  }
  #disableHoverableContent = derived(() => this.opts.disableHoverableContent.current ?? this.provider.opts.disableHoverableContent.current);
  get disableHoverableContent() {
    return this.#disableHoverableContent();
  }
  set disableHoverableContent($$value) {
    return this.#disableHoverableContent($$value);
  }
  #disableCloseOnTriggerClick = derived(() => this.opts.disableCloseOnTriggerClick.current ?? this.provider.opts.disableCloseOnTriggerClick.current);
  get disableCloseOnTriggerClick() {
    return this.#disableCloseOnTriggerClick();
  }
  set disableCloseOnTriggerClick($$value) {
    return this.#disableCloseOnTriggerClick($$value);
  }
  #disabled = derived(() => this.opts.disabled.current ?? this.provider.opts.disabled.current);
  get disabled() {
    return this.#disabled();
  }
  set disabled($$value) {
    return this.#disabled($$value);
  }
  #ignoreNonKeyboardFocus = derived(() => this.opts.ignoreNonKeyboardFocus.current ?? this.provider.opts.ignoreNonKeyboardFocus.current);
  get ignoreNonKeyboardFocus() {
    return this.#ignoreNonKeyboardFocus();
  }
  set ignoreNonKeyboardFocus($$value) {
    return this.#ignoreNonKeyboardFocus($$value);
  }
  contentNode = null;
  triggerNode = null;
  #wasOpenDelayed = false;
  #timerFn;
  #stateAttr = derived(() => {
    if (!this.opts.open.current) return "closed";
    return this.#wasOpenDelayed ? "delayed-open" : "instant-open";
  });
  get stateAttr() {
    return this.#stateAttr();
  }
  set stateAttr($$value) {
    return this.#stateAttr($$value);
  }
  constructor(opts, provider) {
    this.opts = opts;
    this.provider = provider;
    this.#timerFn = new TimeoutFn(
      () => {
        this.#wasOpenDelayed = true;
        this.opts.open.current = true;
      },
      this.delayDuration ?? 0,
      { immediate: false }
    );
    new OpenChangeComplete({
      open: this.opts.open,
      ref: box.with(() => this.contentNode),
      onComplete: () => {
        this.opts.onOpenChangeComplete.current(this.opts.open.current);
      }
    });
    watch(() => this.delayDuration, () => {
      if (this.delayDuration === void 0) return;
      this.#timerFn = new TimeoutFn(
        () => {
          this.#wasOpenDelayed = true;
          this.opts.open.current = true;
        },
        this.delayDuration,
        { immediate: false }
      );
    });
    watch(() => this.opts.open.current, (isOpen) => {
      if (isOpen) {
        this.provider.onOpen(this);
      } else {
        this.provider.onClose(this);
      }
    });
  }
  handleOpen = () => {
    this.#timerFn.stop();
    this.#wasOpenDelayed = false;
    this.opts.open.current = true;
  };
  handleClose = () => {
    this.#timerFn.stop();
    this.opts.open.current = false;
  };
  #handleDelayedOpen = () => {
    this.#timerFn.stop();
    const shouldSkipDelay = !this.provider.isOpenDelayed;
    const delayDuration = this.delayDuration ?? 0;
    if (shouldSkipDelay || delayDuration === 0) {
      this.#wasOpenDelayed = delayDuration > 0 && shouldSkipDelay;
      this.opts.open.current = true;
    } else {
      this.#timerFn.start();
    }
  };
  onTriggerEnter = () => {
    this.#handleDelayedOpen();
  };
  onTriggerLeave = () => {
    if (this.disableHoverableContent) {
      this.handleClose();
    } else {
      this.#timerFn.stop();
    }
  };
}
class TooltipTriggerState {
  static create(opts) {
    return new TooltipTriggerState(opts, TooltipRootContext.get());
  }
  opts;
  root;
  attachment;
  #isPointerDown = box(false);
  #hasPointerMoveOpened = false;
  #isDisabled = derived(() => this.opts.disabled.current || this.root.disabled);
  domContext;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.domContext = new DOMContext(opts.ref);
    this.attachment = attachRef(this.opts.ref, (v) => this.root.triggerNode = v);
  }
  handlePointerUp = () => {
    this.#isPointerDown.current = false;
  };
  #onpointerup = () => {
    if (this.#isDisabled()) return;
    this.#isPointerDown.current = false;
  };
  #onpointerdown = () => {
    if (this.#isDisabled()) return;
    this.#isPointerDown.current = true;
    this.domContext.getDocument().addEventListener(
      "pointerup",
      () => {
        this.handlePointerUp();
      },
      { once: true }
    );
  };
  #onpointermove = (e) => {
    if (this.#isDisabled()) return;
    if (e.pointerType === "touch") return;
    if (this.#hasPointerMoveOpened) return;
    if (this.root.provider.isPointerInTransit.current) return;
    this.root.onTriggerEnter();
    this.#hasPointerMoveOpened = true;
  };
  #onpointerleave = () => {
    if (this.#isDisabled()) return;
    this.root.onTriggerLeave();
    this.#hasPointerMoveOpened = false;
  };
  #onfocus = (e) => {
    if (this.#isPointerDown.current || this.#isDisabled()) return;
    if (this.root.ignoreNonKeyboardFocus && !isFocusVisible(e.currentTarget)) return;
    this.root.handleOpen();
  };
  #onblur = () => {
    if (this.#isDisabled()) return;
    this.root.handleClose();
  };
  #onclick = () => {
    if (this.root.disableCloseOnTriggerClick || this.#isDisabled()) return;
    this.root.handleClose();
  };
  #props = derived(() => ({
    id: this.opts.id.current,
    "aria-describedby": this.root.opts.open.current ? this.root.contentNode?.id : void 0,
    "data-state": this.root.stateAttr,
    "data-disabled": getDataDisabled(this.#isDisabled()),
    "data-delay-duration": `${this.root.delayDuration}`,
    [tooltipAttrs.trigger]: "",
    tabindex: this.#isDisabled() ? void 0 : 0,
    disabled: this.opts.disabled.current,
    onpointerup: this.#onpointerup,
    onpointerdown: this.#onpointerdown,
    onpointermove: this.#onpointermove,
    onpointerleave: this.#onpointerleave,
    onfocus: this.#onfocus,
    onblur: this.#onblur,
    onclick: this.#onclick,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class TooltipContentState {
  static create(opts) {
    return new TooltipContentState(opts, TooltipRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref, (v) => this.root.contentNode = v);
    new GraceArea({
      triggerNode: () => this.root.triggerNode,
      contentNode: () => this.root.contentNode,
      enabled: () => this.root.opts.open.current && !this.root.disableHoverableContent,
      onPointerExit: () => {
        if (this.root.provider.isTooltipOpen(this.root)) {
          this.root.handleClose();
        }
      },
      setIsPointerInTransit: (value) => {
        this.root.provider.isPointerInTransit.current = value;
      },
      transitTimeout: this.root.provider.opts.skipDelayDuration.current
    });
  }
  onInteractOutside = (e) => {
    if (isElement(e.target) && this.root.triggerNode?.contains(e.target) && this.root.disableCloseOnTriggerClick) {
      e.preventDefault();
      return;
    }
    this.opts.onInteractOutside.current(e);
    if (e.defaultPrevented) return;
    this.root.handleClose();
  };
  onEscapeKeydown = (e) => {
    this.opts.onEscapeKeydown.current?.(e);
    if (e.defaultPrevented) return;
    this.root.handleClose();
  };
  onOpenAutoFocus = (e) => {
    e.preventDefault();
  };
  onCloseAutoFocus = (e) => {
    e.preventDefault();
  };
  #snippetProps = derived(() => ({ open: this.root.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    "data-state": this.root.stateAttr,
    "data-disabled": getDataDisabled(this.root.disabled),
    style: { pointerEvents: "auto", outline: "none" },
    [tooltipAttrs.content]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
  popperProps = {
    onInteractOutside: this.onInteractOutside,
    onEscapeKeydown: this.onEscapeKeydown,
    onOpenAutoFocus: this.onOpenAutoFocus,
    onCloseAutoFocus: this.onCloseAutoFocus
  };
}
function Tooltip($$payload, $$props) {
  push();
  let {
    open = false,
    onOpenChange = noop,
    onOpenChangeComplete = noop,
    disabled,
    delayDuration,
    disableCloseOnTriggerClick,
    disableHoverableContent,
    ignoreNonKeyboardFocus,
    children
  } = $$props;
  TooltipRootState.create({
    open: box.with(() => open, (v) => {
      open = v;
      onOpenChange(v);
    }),
    delayDuration: box.with(() => delayDuration),
    disableCloseOnTriggerClick: box.with(() => disableCloseOnTriggerClick),
    disableHoverableContent: box.with(() => disableHoverableContent),
    ignoreNonKeyboardFocus: box.with(() => ignoreNonKeyboardFocus),
    disabled: box.with(() => disabled),
    onOpenChangeComplete: box.with(() => onOpenChangeComplete)
  });
  Floating_layer($$payload, {
    tooltip: true,
    children: ($$payload2) => {
      children?.($$payload2);
      $$payload2.out += `<!---->`;
    }
  });
  bind_props($$props, { open });
  pop();
}
function Tooltip_content$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    children,
    child,
    id = createId(uid),
    ref = null,
    side = "top",
    sideOffset = 0,
    align = "center",
    avoidCollisions = true,
    arrowPadding = 0,
    sticky = "partial",
    hideWhenDetached = false,
    collisionPadding = 0,
    onInteractOutside = noop,
    onEscapeKeydown = noop,
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = TooltipContentState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    onInteractOutside: box.with(() => onInteractOutside),
    onEscapeKeydown: box.with(() => onEscapeKeydown)
  });
  const floatingProps = {
    side,
    sideOffset,
    align,
    avoidCollisions,
    arrowPadding,
    sticky,
    hideWhenDetached,
    collisionPadding
  };
  const mergedProps = mergeProps(restProps, floatingProps, contentState.props);
  if (forceMount) {
    $$payload.out += "<!--[-->";
    {
      let popper = function($$payload2, { props, wrapperProps }) {
        const mergedProps2 = mergeProps(props, {
          style: getFloatingContentCSSVars("tooltip")
        });
        if (child) {
          $$payload2.out += "<!--[-->";
          child($$payload2, {
            props: mergedProps2,
            wrapperProps,
            ...contentState.snippetProps
          });
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<div${spread_attributes({ ...wrapperProps }, null)}><div${spread_attributes({ ...mergedProps2 }, null)}>`;
          children?.($$payload2);
          $$payload2.out += `<!----></div></div>`;
        }
        $$payload2.out += `<!--]-->`;
      };
      Popper_layer_force_mount($$payload, spread_props([
        mergedProps,
        contentState.popperProps,
        {
          enabled: contentState.root.opts.open.current,
          id,
          trapFocus: false,
          loop: false,
          preventScroll: false,
          forceMount: true,
          ref: contentState.opts.ref,
          tooltip: true,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else if (!forceMount) {
    $$payload.out += "<!--[1-->";
    {
      let popper = function($$payload2, { props, wrapperProps }) {
        const mergedProps2 = mergeProps(props, {
          style: getFloatingContentCSSVars("tooltip")
        });
        if (child) {
          $$payload2.out += "<!--[-->";
          child($$payload2, {
            props: mergedProps2,
            wrapperProps,
            ...contentState.snippetProps
          });
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<div${spread_attributes({ ...wrapperProps }, null)}><div${spread_attributes({ ...mergedProps2 }, null)}>`;
          children?.($$payload2);
          $$payload2.out += `<!----></div></div>`;
        }
        $$payload2.out += `<!--]-->`;
      };
      Popper_layer($$payload, spread_props([
        mergedProps,
        contentState.popperProps,
        {
          open: contentState.root.opts.open.current,
          id,
          trapFocus: false,
          loop: false,
          preventScroll: false,
          forceMount: false,
          ref: contentState.opts.ref,
          tooltip: true,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Tooltip_trigger$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    children,
    child,
    id = createId(uid),
    disabled = false,
    type = "button",
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = TooltipTriggerState.create({
    id: box.with(() => id),
    disabled: box.with(() => disabled ?? false),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, triggerState.props, { type });
  Floating_layer_anchor($$payload, {
    id,
    ref: triggerState.opts.ref,
    tooltip: true,
    children: ($$payload2) => {
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, { props: mergedProps });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<button${spread_attributes({ ...mergedProps }, null)}>`;
        children?.($$payload2);
        $$payload2.out += `<!----></button>`;
      }
      $$payload2.out += `<!--]-->`;
    }
  });
  bind_props($$props, { ref });
  pop();
}
function Tooltip_arrow($$payload, $$props) {
  push();
  let { ref = null, $$slots, $$events, ...restProps } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    Floating_layer_arrow($$payload2, spread_props([
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Tooltip_provider($$payload, $$props) {
  push();
  let {
    children,
    delayDuration = 700,
    disableCloseOnTriggerClick = false,
    disableHoverableContent = false,
    disabled = false,
    ignoreNonKeyboardFocus = false,
    skipDelayDuration = 300
  } = $$props;
  TooltipProviderState.create({
    delayDuration: box.with(() => delayDuration),
    disableCloseOnTriggerClick: box.with(() => disableCloseOnTriggerClick),
    disableHoverableContent: box.with(() => disableHoverableContent),
    disabled: box.with(() => disabled),
    ignoreNonKeyboardFocus: box.with(() => ignoreNonKeyboardFocus),
    skipDelayDuration: box.with(() => skipDelayDuration)
  });
  children?.($$payload);
  $$payload.out += `<!---->`;
  pop();
}
let isUsingKeyboard = false;
class IsUsingKeyboard {
  static _refs = 0;
  // Reference counting to avoid multiple listeners.
  static _cleanup;
  constructor() {
  }
  get current() {
    return isUsingKeyboard;
  }
  set current(value) {
    isUsingKeyboard = value;
  }
}
function Tooltip_trigger($$payload, $$props) {
  push();
  let { ref = null, $$slots, $$events, ...restProps } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Tooltip_trigger$1($$payload2, spread_props([
      { "data-slot": "tooltip-trigger" },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Tooltip_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    sideOffset = 0,
    side = "top",
    children,
    arrowClasses,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Portal$1($$payload2, {
      children: ($$payload3) => {
        $$payload3.out += `<!---->`;
        Tooltip_content$1($$payload3, spread_props([
          {
            "data-slot": "tooltip-content",
            sideOffset,
            side,
            class: cn("bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-tooltip-content-transform-origin) z-50 w-fit text-balance rounded-md px-3 py-1.5 text-xs", className)
          },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            },
            children: ($$payload4) => {
              children?.($$payload4);
              $$payload4.out += `<!----> <!---->`;
              {
                let child = function($$payload5, { props }) {
                  $$payload5.out += `<div${spread_attributes(
                    {
                      class: clsx(cn("bg-primary z-50 size-2.5 rotate-45 rounded-[2px]", side === "top" && "translate-x-1/2 translate-y-[calc(-50%_+_2px)]", side === "bottom" && "-translate-x-1/2 -translate-y-[calc(-50%_+_1px)]", side === "right" && "translate-x-[calc(50%_+_2px)] translate-y-1/2", side === "left" && "-translate-y-[calc(50%_-_3px)]", arrowClasses)),
                      ...props
                    },
                    null
                  )}></div>`;
                };
                Tooltip_arrow($$payload4, { child, $$slots: { child: true } });
              }
              $$payload4.out += `<!---->`;
            },
            $$slots: { default: true }
          }
        ]));
        $$payload3.out += `<!---->`;
      }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const Root$6 = Tooltip;
const Provider = Tooltip_provider;
const sidebarMenuButtonVariants = tv({
  base: "peer/menu-button outline-hidden ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground group-has-data-[sidebar=menu-action]/menu-item:pr-8 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm transition-[width,height,padding] focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium [&>span:last-child]:truncate [&>svg]:size-5 [&>svg]:shrink-0",
  variants: {
    variant: {
      default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      outline: "bg-background hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shadow-[0_0_0_1px_var(--sidebar-border)] hover:shadow-[0_0_0_1px_var(--sidebar-accent)]"
    },
    size: {
      default: "h-8 text-sm",
      sm: "h-7 text-xs",
      lg: "group-data-[collapsible=icon]:p-0! h-12 text-sm"
    }
  },
  defaultVariants: { variant: "default", size: "default" }
});
function Sidebar_menu_button($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    child,
    variant = "default",
    size: size2 = "default",
    isActive = false,
    tooltipContent,
    tooltipContentProps,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const sidebar = useSidebar();
  const buttonProps = {
    class: cn(sidebarMenuButtonVariants({ variant, size: size2 }), className),
    "data-slot": "sidebar-menu-button",
    "data-sidebar": "menu-button",
    "data-size": size2,
    "data-active": isActive,
    ...restProps
  };
  function Button2($$payload2, { props }) {
    const mergedProps = mergeProps(buttonProps, props);
    if (child) {
      $$payload2.out += "<!--[-->";
      child($$payload2, { props: mergedProps });
      $$payload2.out += `<!---->`;
    } else {
      $$payload2.out += "<!--[!-->";
      $$payload2.out += `<button${spread_attributes({ ...mergedProps }, null)}>`;
      children?.($$payload2);
      $$payload2.out += `<!----></button>`;
    }
    $$payload2.out += `<!--]-->`;
  }
  if (!tooltipContent) {
    $$payload.out += "<!--[-->";
    Button2($$payload, {});
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<!---->`;
    Root$6($$payload, {
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        {
          let child2 = function($$payload3, { props }) {
            Button2($$payload3, { props });
          };
          Tooltip_trigger($$payload2, { child: child2, $$slots: { child: true } });
        }
        $$payload2.out += `<!----> <!---->`;
        Tooltip_content($$payload2, spread_props([
          {
            side: "right",
            align: "center",
            hidden: sidebar.state !== "collapsed" || sidebar.isMobile
          },
          tooltipContentProps,
          {
            children: ($$payload3) => {
              if (typeof tooltipContent === "string") {
                $$payload3.out += "<!--[-->";
                $$payload3.out += `${escape_html(tooltipContent)}`;
              } else if (tooltipContent) {
                $$payload3.out += "<!--[1-->";
                tooltipContent($$payload3);
                $$payload3.out += `<!---->`;
              } else {
                $$payload3.out += "<!--[!-->";
              }
              $$payload3.out += `<!--]-->`;
            },
            $$slots: { default: true }
          }
        ]));
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload.out += `<!---->`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Sidebar_menu_item($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<li${spread_attributes(
    {
      "data-slot": "sidebar-menu-item",
      "data-sidebar": "menu-item",
      class: clsx(cn("group/menu-item relative", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></li>`;
  bind_props($$props, { ref });
  pop();
}
function Sidebar_menu_sub_button($$payload, $$props) {
  push();
  let {
    ref = null,
    children,
    child,
    class: className,
    size: size2 = "md",
    isActive = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const mergedProps = {
    class: cn("text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground outline-hidden flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground", size2 === "sm" && "text-xs", size2 === "md" && "text-sm", "group-data-[collapsible=icon]:hidden", className),
    "data-slot": "sidebar-menu-sub-button",
    "data-sidebar": "menu-sub-button",
    "data-size": size2,
    "data-active": isActive,
    ...restProps
  };
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<a${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></a>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Sidebar_menu_sub_item($$payload, $$props) {
  push();
  let {
    ref = null,
    children,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<li${spread_attributes(
    {
      "data-slot": "sidebar-menu-sub-item",
      "data-sidebar": "menu-sub-item",
      class: clsx(cn("group/menu-sub-item relative", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></li>`;
  bind_props($$props, { ref });
  pop();
}
function Sidebar_menu_sub($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<ul${spread_attributes(
    {
      "data-slot": "sidebar-menu-sub",
      "data-sidebar": "menu-sub",
      class: clsx(cn("border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5", "group-data-[collapsible=icon]:hidden", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></ul>`;
  bind_props($$props, { ref });
  pop();
}
function Sidebar_menu($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<ul${spread_attributes(
    {
      "data-slot": "sidebar-menu",
      "data-sidebar": "menu",
      class: clsx(cn("flex w-full min-w-0 flex-col gap-1", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></ul>`;
  bind_props($$props, { ref });
  pop();
}
function Sidebar_provider($$payload, $$props) {
  push();
  let {
    ref = null,
    open = true,
    onOpenChange = () => {
    },
    class: className,
    style,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  setSidebar({
    open: () => open,
    setOpen: (value) => {
      open = value;
      onOpenChange(value);
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    }
  });
  $$payload.out += `<!---->`;
  Provider($$payload, {
    delayDuration: 0,
    children: ($$payload2) => {
      $$payload2.out += `<div${spread_attributes(
        {
          "data-slot": "sidebar-wrapper",
          style: `--sidebar-width: ${stringify(SIDEBAR_WIDTH)}; --sidebar-width-icon: ${stringify(SIDEBAR_WIDTH_ICON)}; ${stringify(style)}`,
          class: clsx(cn("group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full", className)),
          ...restProps
        },
        null
      )}>`;
      children?.($$payload2);
      $$payload2.out += `<!----></div>`;
    }
  });
  $$payload.out += `<!---->`;
  bind_props($$props, { ref, open });
  pop();
}
function Sidebar_rail($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  useSidebar();
  $$payload.out += `<button${spread_attributes(
    {
      "data-sidebar": "rail",
      "data-slot": "sidebar-rail",
      "aria-label": "Toggle Sidebar",
      tabindex: -1,
      title: "Toggle Sidebar",
      class: clsx(cn("hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex", "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize", "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize", "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full", "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2", "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></button>`;
  bind_props($$props, { ref });
  pop();
}
function Separator($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Separator$1($$payload2, spread_props([
      {
        "data-slot": "separator-root",
        class: cn("bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Sidebar_separator($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    Separator($$payload2, spread_props([
      {
        "data-slot": "sidebar-separator",
        "data-sidebar": "separator",
        class: cn("bg-sidebar-border w-auto!", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const buttonVariants = tv({
  base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
      destructive: "bg-destructive shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white",
      outline: "bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-transparent dark:border-border dark:hover:bg-ring/20 border",
      secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
      link: "text-primary underline-offset-4 hover:underline"
    },
    size: {
      default: "h-9 px-4 py-2 has-[>svg]:px-3",
      sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
      lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
      icon: "size-9"
    }
  },
  defaultVariants: { variant: "default", size: "default" }
});
function Button($$payload, $$props) {
  push();
  let {
    class: className,
    variant = "default",
    size: size2 = "default",
    ref = null,
    href = void 0,
    type = "button",
    disabled,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  if (href) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<a${spread_attributes(
      {
        "data-slot": "button",
        class: clsx(cn(buttonVariants({ variant, size: size2 }), className)),
        href: disabled ? void 0 : href,
        "aria-disabled": disabled,
        role: disabled ? "link" : void 0,
        tabindex: disabled ? -1 : void 0,
        ...restProps
      },
      null
    )}>`;
    children?.($$payload);
    $$payload.out += `<!----></a>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes(
      {
        "data-slot": "button",
        class: clsx(cn(buttonVariants({ variant, size: size2 }), className)),
        type,
        disabled,
        ...restProps
      },
      null
    )}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function IconSidebarSimpleRegular($$payload, $$props) {
  let { class: class_ } = $$props;
  $$payload.out += `<svg${attr_class(clsx(class_))} data-phosphor-icon="sidebar-simple" aria-hidden="true" width="1em" height="1em" pointer-events="none" display="inline-block" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16M40 56h40v144H40Zm176 144H96V56h120z"></path></svg>`;
}
function Sidebar_trigger($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    onclick,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const sidebar = useSidebar();
  Button($$payload, spread_props([
    {
      "data-sidebar": "trigger",
      "data-slot": "sidebar-trigger",
      variant: "ghost",
      size: "icon",
      class: cn("size-7", className),
      type: "button",
      onclick: (e) => {
        onclick?.(e);
        sidebar.toggle();
      }
    },
    restProps,
    {
      children: ($$payload2) => {
        IconSidebarSimpleRegular($$payload2, {});
        $$payload2.out += `<!----> <span class="sr-only">Toggle Sidebar</span>`;
      },
      $$slots: { default: true }
    }
  ]));
  bind_props($$props, { ref });
  pop();
}
function Sheet_overlay($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Dialog_overlay$1($$payload2, spread_props([
      {
        "data-slot": "sheet-overlay",
        class: cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref, class: className });
  pop();
}
function X($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    ["path", { "d": "M18 6 6 18" }],
    ["path", { "d": "m6 6 12 12" }]
  ];
  Icon($$payload, spread_props([
    { name: "x" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
const sheetVariants = tv({
  base: "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  variants: {
    side: {
      top: "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
      bottom: "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
      left: "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
      right: "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm"
    }
  },
  defaultVariants: { side: "right" }
});
function Sheet_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    side = "right",
    portalProps,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Portal$1($$payload2, spread_props([
      portalProps,
      {
        children: ($$payload3) => {
          Sheet_overlay($$payload3, {});
          $$payload3.out += `<!----> <!---->`;
          Dialog_content$1($$payload3, spread_props([
            {
              "data-slot": "sheet-content",
              class: cn(sheetVariants({ side }), className)
            },
            restProps,
            {
              get ref() {
                return ref;
              },
              set ref($$value) {
                ref = $$value;
                $$settled = false;
              },
              children: ($$payload4) => {
                children?.($$payload4);
                $$payload4.out += `<!----> <!---->`;
                Dialog_close($$payload4, {
                  class: "ring-offset-background focus-visible:ring-ring rounded-xs focus-visible:outline-hidden absolute right-4 top-4 opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none",
                  children: ($$payload5) => {
                    X($$payload5, { class: "size-4" });
                    $$payload5.out += `<!----> <span class="sr-only">Close</span>`;
                  },
                  $$slots: { default: true }
                });
                $$payload4.out += `<!---->`;
              },
              $$slots: { default: true }
            }
          ]));
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Sheet_header($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes(
    {
      "data-slot": "sheet-header",
      class: clsx(cn("flex flex-col gap-1.5 p-4", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Sheet_title($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Dialog_title$1($$payload2, spread_props([
      {
        "data-slot": "sheet-title",
        class: cn("text-foreground font-semibold", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Sheet_description($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Dialog_description$1($$payload2, spread_props([
      {
        "data-slot": "sheet-description",
        class: cn("text-muted-foreground text-sm", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const Root$5 = Dialog;
function Sidebar($$payload, $$props) {
  push();
  let {
    ref = null,
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const sidebar = useSidebar();
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (collapsible === "none") {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<div${spread_attributes(
        {
          class: clsx(cn("bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col", className)),
          ...restProps
        },
        null
      )}>`;
      children?.($$payload2);
      $$payload2.out += `<!----></div>`;
    } else if (sidebar.isMobile) {
      $$payload2.out += "<!--[1-->";
      var bind_get = () => sidebar.openMobile;
      var bind_set = (v) => sidebar.setOpenMobile(v);
      $$payload2.out += `<!---->`;
      Root$5($$payload2, spread_props([
        {
          get open() {
            return bind_get();
          },
          set open($$value) {
            bind_set($$value);
          }
        },
        restProps,
        {
          children: ($$payload3) => {
            $$payload3.out += `<!---->`;
            Sheet_content($$payload3, {
              "data-sidebar": "sidebar",
              "data-slot": "sidebar",
              "data-mobile": "true",
              class: "bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden",
              style: `--sidebar-width: ${stringify(SIDEBAR_WIDTH_MOBILE)};`,
              side,
              children: ($$payload4) => {
                $$payload4.out += `<!---->`;
                Sheet_header($$payload4, {
                  class: "sr-only",
                  children: ($$payload5) => {
                    $$payload5.out += `<!---->`;
                    Sheet_title($$payload5, {
                      children: ($$payload6) => {
                        $$payload6.out += `<!---->Sidebar`;
                      },
                      $$slots: { default: true }
                    });
                    $$payload5.out += `<!----> <!---->`;
                    Sheet_description($$payload5, {
                      children: ($$payload6) => {
                        $$payload6.out += `<!---->Displays the mobile sidebar.`;
                      },
                      $$slots: { default: true }
                    });
                    $$payload5.out += `<!---->`;
                  },
                  $$slots: { default: true }
                });
                $$payload4.out += `<!----> <div class="flex h-full w-full flex-col">`;
                children?.($$payload4);
                $$payload4.out += `<!----></div>`;
              },
              $$slots: { default: true }
            });
            $$payload3.out += `<!---->`;
          },
          $$slots: { default: true }
        }
      ]));
      $$payload2.out += `<!---->`;
    } else {
      $$payload2.out += "<!--[!-->";
      $$payload2.out += `<div class="text-sidebar-foreground group peer hidden md:block"${attr("data-state", sidebar.state)}${attr("data-collapsible", sidebar.state === "collapsed" ? collapsible : "")}${attr("data-variant", variant)}${attr("data-side", side)} data-slot="sidebar"><div data-slot="sidebar-gap"${attr_class(clsx(cn("relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)")))}></div> <div${spread_attributes(
        {
          "data-slot": "sidebar-container",
          class: clsx(cn(
            "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
            side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            // Adjust the padding for floating and inset variants.
            variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className
          )),
          ...restProps
        },
        null
      )}><div data-sidebar="sidebar" data-slot="sidebar-inner" class="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col px-2 py-2 group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm">`;
      children?.($$payload2);
      $$payload2.out += `<!----></div></div></div>`;
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Check($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [["path", { "d": "M20 6 9 17l-5-5" }]];
  Icon($$payload, spread_props([
    { name: "check" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Dropdown_menu_content($$payload, $$props) {
  push();
  let {
    ref = null,
    sideOffset = 4,
    portalProps,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Portal$1($$payload2, spread_props([
      portalProps,
      {
        children: ($$payload3) => {
          $$payload3.out += `<!---->`;
          Dropdown_menu_content$1($$payload3, spread_props([
            {
              "data-slot": "dropdown-menu-content",
              sideOffset,
              class: cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin) z-50 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border p-1 shadow-md", className)
            },
            restProps,
            {
              get ref() {
                return ref;
              },
              set ref($$value) {
                ref = $$value;
                $$settled = false;
              }
            }
          ]));
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Dropdown_menu_item($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    inset,
    variant = "default",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Menu_item($$payload2, spread_props([
      {
        "data-slot": "dropdown-menu-item",
        "data-inset": inset,
        "data-variant": variant,
        class: cn("data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-[variant=destructive]:data-highlighted:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground outline-hidden relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm data-[disabled]:pointer-events-none data-[inset]:pl-8 data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Dropdown_menu_label($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    inset,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes(
    {
      "data-slot": "dropdown-menu-label",
      "data-inset": inset,
      class: clsx(cn("px-2 py-1.5 text-sm font-semibold data-[inset]:pl-8", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Dropdown_menu_separator($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Menu_separator($$payload2, spread_props([
      {
        "data-slot": "dropdown-menu-separator",
        class: cn("bg-border -mx-1 my-1 h-px", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Dropdown_menu_trigger($$payload, $$props) {
  push();
  let { ref = null, $$slots, $$events, ...restProps } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Menu_trigger($$payload2, spread_props([
      { "data-slot": "dropdown-menu-trigger" },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const Root$4 = Menu;
function IconCaretDownRegular($$payload, $$props) {
  let { class: class_ } = $$props;
  $$payload.out += `<svg${attr_class(clsx(class_))} data-phosphor-icon="caret-down" aria-hidden="true" width="1em" height="1em" pointer-events="none" display="inline-block" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="m213.66 101.66-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32"></path></svg>`;
}
function IconMoonRegular($$payload, $$props) {
  let { class: class_ } = $$props;
  $$payload.out += `<svg${attr_class(clsx(class_))} data-phosphor-icon="moon" aria-hidden="true" width="1em" height="1em" pointer-events="none" display="inline-block" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M233.54 142.23a8 8 0 0 0-8-2 88.08 88.08 0 0 1-109.8-109.8 8 8 0 0 0-10-10 104.84 104.84 0 0 0-52.91 37A104 104 0 0 0 136 224a103.1 103.1 0 0 0 62.52-20.88 104.84 104.84 0 0 0 37-52.91 8 8 0 0 0-1.98-7.98m-44.64 48.11A88 88 0 0 1 65.66 67.11a89 89 0 0 1 31.4-26A106 106 0 0 0 96 56a104.11 104.11 0 0 0 104 104 106 106 0 0 0 14.92-1.06 89 89 0 0 1-26.02 31.4"></path></svg>`;
}
function IconSunRegular($$payload, $$props) {
  let { class: class_ } = $$props;
  $$payload.out += `<svg${attr_class(clsx(class_))} data-phosphor-icon="sun" aria-hidden="true" width="1em" height="1em" pointer-events="none" display="inline-block" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M120 40V16a8 8 0 0 1 16 0v24a8 8 0 0 1-16 0m72 88a64 64 0 1 1-64-64 64.07 64.07 0 0 1 64 64m-16 0a48 48 0 1 0-48 48 48.05 48.05 0 0 0 48-48M58.34 69.66a8 8 0 0 0 11.32-11.32l-16-16a8 8 0 0 0-11.32 11.32Zm0 116.68-16 16a8 8 0 0 0 11.32 11.32l16-16a8 8 0 0 0-11.32-11.32M192 72a8 8 0 0 0 5.66-2.34l16-16a8 8 0 0 0-11.32-11.32l-16 16A8 8 0 0 0 192 72m5.66 114.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32ZM48 128a8 8 0 0 0-8-8H16a8 8 0 0 0 0 16h24a8 8 0 0 0 8-8m80 80a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8m112-88h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16"></path></svg>`;
}
function IconArrowsClockwiseRegular($$payload, $$props) {
  let { class: class_ } = $$props;
  $$payload.out += `<svg${attr_class(clsx(class_))} data-phosphor-icon="arrows-clockwise" aria-hidden="true" width="1em" height="1em" pointer-events="none" display="inline-block" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M224 48v48a8 8 0 0 1-8 8h-48a8 8 0 0 1 0-16h28.69l-14.63-14.63a79.56 79.56 0 0 0-56.13-23.43h-.45a79.52 79.52 0 0 0-55.89 22.77 8 8 0 0 1-11.18-11.44 96 96 0 0 1 135 .79L208 76.69V48a8 8 0 0 1 16 0m-37.59 135.29a80 80 0 0 1-112.47-.66L59.31 168H88a8 8 0 0 0 0-16H40a8 8 0 0 0-8 8v48a8 8 0 0 0 16 0v-28.69l14.63 14.63A95.43 95.43 0 0 0 130 222.06h.53a95.36 95.36 0 0 0 67.07-27.33 8 8 0 0 0-11.18-11.44Z"></path></svg>`;
}
function IconChatsRegular($$payload, $$props) {
  let { class: class_ } = $$props;
  $$payload.out += `<svg${attr_class(clsx(class_))} data-phosphor-icon="chats" aria-hidden="true" width="1em" height="1em" pointer-events="none" display="inline-block" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M216 80h-32V48a16 16 0 0 0-16-16H40a16 16 0 0 0-16 16v128a8 8 0 0 0 13 6.22L72 154v30a16 16 0 0 0 16 16h93.59L219 230.22a8 8 0 0 0 5 1.78 8 8 0 0 0 8-8V96a16 16 0 0 0-16-16M66.55 137.78 40 159.25V48h128v88H71.58a8 8 0 0 0-5.03 1.78M216 207.25l-26.55-21.47a8 8 0 0 0-5-1.78H88v-32h80a16 16 0 0 0 16-16V96h32Z"></path></svg>`;
}
function IconRobotRegular($$payload, $$props) {
  let { class: class_ } = $$props;
  $$payload.out += `<svg${attr_class(clsx(class_))} data-phosphor-icon="robot" aria-hidden="true" width="1em" height="1em" pointer-events="none" display="inline-block" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M200 48h-64V16a8 8 0 0 0-16 0v32H56a32 32 0 0 0-32 32v112a32 32 0 0 0 32 32h144a32 32 0 0 0 32-32V80a32 32 0 0 0-32-32m16 144a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16V80a16 16 0 0 1 16-16h144a16 16 0 0 1 16 16Zm-52-56H92a28 28 0 0 0 0 56h72a28 28 0 0 0 0-56m-24 16v24h-24v-24Zm-60 12a12 12 0 0 1 12-12h8v24h-8a12 12 0 0 1-12-12m84 12h-8v-24h8a12 12 0 0 1 0 24m-92-68a12 12 0 1 1 12 12 12 12 0 0 1-12-12m88 0a12 12 0 1 1 12 12 12 12 0 0 1-12-12"></path></svg>`;
}
function IconToolboxRegular($$payload, $$props) {
  let { class: class_ } = $$props;
  $$payload.out += `<svg${attr_class(clsx(class_))} data-phosphor-icon="toolbox" aria-hidden="true" width="1em" height="1em" pointer-events="none" display="inline-block" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M224 64h-48v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H32a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h192a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16M96 56a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v8H96Zm128 24v32h-32v-8a8 8 0 0 0-16 0v8H80v-8a8 8 0 0 0-16 0v8H32V80Zm0 112H32v-64h32v8a8 8 0 0 0 16 0v-8h96v8a8 8 0 0 0 16 0v-8h32z"></path></svg>`;
}
function IconPackageRegular($$payload, $$props) {
  let { class: class_ } = $$props;
  $$payload.out += `<svg${attr_class(clsx(class_))} data-phosphor-icon="package" aria-hidden="true" width="1em" height="1em" pointer-events="none" display="inline-block" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="m223.68 66.15-88-48.15a15.88 15.88 0 0 0-15.36 0l-88 48.17a16 16 0 0 0-8.32 14v95.64a16 16 0 0 0 8.32 14l88 48.17a15.88 15.88 0 0 0 15.36 0l88-48.17a16 16 0 0 0 8.32-14V80.18a16 16 0 0 0-8.32-14.03M128 32l80.34 44-29.77 16.3-80.35-44Zm0 88L47.66 76l33.9-18.56 80.34 44ZM40 90l80 43.78v85.79l-80-43.75Zm176 85.78-80 43.79v-85.75l32-17.51V152a8 8 0 0 0 16 0v-44.45L216 90v85.77Z"></path></svg>`;
}
function IconNotepadRegular($$payload, $$props) {
  let { class: class_ } = $$props;
  $$payload.out += `<svg${attr_class(clsx(class_))} data-phosphor-icon="notepad" aria-hidden="true" width="1em" height="1em" pointer-events="none" display="inline-block" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M168 128a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8m-8 24H96a8 8 0 0 0 0 16h64a8 8 0 0 0 0-16m56-112v160a32 32 0 0 1-32 32H72a32 32 0 0 1-32-32V40a8 8 0 0 1 8-8h24v-8a8 8 0 0 1 16 0v8h32v-8a8 8 0 0 1 16 0v8h32v-8a8 8 0 0 1 16 0v8h24a8 8 0 0 1 8 8m-16 8h-16v8a8 8 0 0 1-16 0v-8h-32v8a8 8 0 0 1-16 0v-8H88v8a8 8 0 0 1-16 0v-8H56v152a16 16 0 0 0 16 16h112a16 16 0 0 0 16-16Z"></path></svg>`;
}
class Session {
  socket;
  connected = false;
  host;
  appId;
  privKey;
  session;
  agentId = null;
  agents = {};
  threads = {};
  messages = {};
  constructor({ host, appId, privacyKey, session }) {
    this.host = host;
    this.appId = appId;
    this.privKey = privacyKey;
    this.session = session;
    this.socket = new WebSocket(`ws://${host}/debug/${appId}/${privacyKey}/${session}/?timeout=10000`);
    this.socket.onopen = () => {
      toast.success("Connected to session.");
      this.connected = true;
    };
    this.socket.onerror = () => {
      toast.error(`Error connecting to session.`);
      this.connected = false;
      this.socket.close();
    };
    this.socket.onclose = (e) => {
      if (this.connected) toast.info(`Session connection closed${e.reason ? ` - ${e.reason}` : "."}`);
      this.threads = {};
      this.agents = {};
      this.connected = false;
    };
    this.socket.onmessage = (ev) => {
      let data = null;
      try {
        data = JSON.parse(ev.data);
      } catch (e) {
        toast.warning(`ws: '${ev.data}'`);
        return;
      }
      switch (data.type ?? "") {
        case "DebugAgentRegistered":
          this.agentId = data.id;
          break;
        case "ThreadList":
          for (const thread of data.threads) {
            this.messages[thread.id] = thread.messages ?? [];
            this.threads[thread.id] = { ...thread, messages: void 0, unread: 0 };
          }
          break;
        case "AgentList":
          for (const agent of data.agents) {
            this.agents[agent.id] = agent;
          }
          break;
        case "org.coralprotocol.coralserver.session.Event.AgentRegistered":
          this.agents[data.agent.id] = data.agent;
          break;
        case "org.coralprotocol.coralserver.session.Event.ThreadCreated":
          console.log("new thread");
          this.threads[data.id] = {
            id: data.id,
            name: data.name,
            participants: data.participants,
            summary: data.summary,
            creatorId: data.creatorId,
            isClosed: data.isClosed,
            unread: 0
          };
          this.messages[data.id] = data.messages ?? [];
          break;
        case "org.coralprotocol.coralserver.session.Event.MessageSent":
          if (data.threadId in this.messages) {
            console.log("message setn");
            this.messages[data.threadId].push(data.message);
            this.threads[data.threadId].unread += 1;
          } else {
            console.warn("uh oh", { data, messages: this.messages });
          }
          break;
      }
    };
  }
  close() {
    this.socket.close();
  }
}
function Select_item($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    value,
    label,
    children: childrenProp,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    {
      let children = function($$payload3, { selected, highlighted }) {
        $$payload3.out += `<span class="absolute right-2 flex size-3.5 items-center justify-center">`;
        if (selected) {
          $$payload3.out += "<!--[-->";
          Check($$payload3, { class: "size-4" });
        } else {
          $$payload3.out += "<!--[!-->";
        }
        $$payload3.out += `<!--]--></span> `;
        if (childrenProp) {
          $$payload3.out += "<!--[-->";
          childrenProp($$payload3, { selected, highlighted });
          $$payload3.out += `<!---->`;
        } else {
          $$payload3.out += "<!--[!-->";
          $$payload3.out += `${escape_html(label || value)}`;
        }
        $$payload3.out += `<!--]-->`;
      };
      Select_item$1($$payload2, spread_props([
        {
          value,
          "data-slot": "select-item",
          class: cn("data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground outline-hidden *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)
        },
        restProps,
        {
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          },
          children,
          $$slots: { default: true }
        }
      ]));
    }
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Chevron_up($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [["path", { "d": "m18 15-6-6-6 6" }]];
  Icon($$payload, spread_props([
    { name: "chevron-up" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Select_scroll_up_button($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Select_scroll_up_button$1($$payload2, spread_props([
      {
        "data-slot": "select-scroll-up-button",
        class: cn("flex cursor-default items-center justify-center py-1", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          Chevron_up($$payload3, { class: "size-4" });
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Chevron_down($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [["path", { "d": "m6 9 6 6 6-6" }]];
  Icon($$payload, spread_props([
    { name: "chevron-down" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Select_scroll_down_button($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Select_scroll_down_button$1($$payload2, spread_props([
      {
        "data-slot": "select-scroll-down-button",
        class: cn("flex cursor-default items-center justify-center py-1", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          Chevron_down($$payload3, { class: "size-4" });
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    sideOffset = 4,
    portalProps,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Portal$1($$payload2, spread_props([
      portalProps,
      {
        children: ($$payload3) => {
          $$payload3.out += `<!---->`;
          Select_content$1($$payload3, spread_props([
            {
              sideOffset,
              "data-slot": "select-content",
              class: cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-h-(--bits-select-content-available-height) origin-(--bits-select-content-transform-origin) relative z-50 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className)
            },
            restProps,
            {
              get ref() {
                return ref;
              },
              set ref($$value) {
                ref = $$value;
                $$settled = false;
              },
              children: ($$payload4) => {
                Select_scroll_up_button($$payload4, {});
                $$payload4.out += `<!----> <!---->`;
                Select_viewport($$payload4, {
                  class: cn("h-(--bits-select-anchor-height) min-w-(--bits-select-anchor-width) w-full scroll-my-1 p-1"),
                  children: ($$payload5) => {
                    children?.($$payload5);
                    $$payload5.out += `<!---->`;
                  },
                  $$slots: { default: true }
                });
                $$payload4.out += `<!----> `;
                Select_scroll_down_button($$payload4, {});
                $$payload4.out += `<!---->`;
              },
              $$slots: { default: true }
            }
          ]));
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select_trigger($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    size: size2 = "default",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Select_trigger$1($$payload2, spread_props([
      {
        "data-slot": "select-trigger",
        "data-size": size2,
        class: cn("border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 shadow-xs flex w-fit items-center justify-between gap-2 whitespace-nowrap rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          children?.($$payload3);
          $$payload3.out += `<!----> `;
          Chevron_down($$payload3, { class: "size-4 opacity-50" });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const Root$3 = Select;
function Dialog_title($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Dialog_title$1($$payload2, spread_props([
      {
        "data-slot": "dialog-title",
        class: cn("font-sans text-lg leading-none font-semibold tracking-wide", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Dialog_footer($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes(
    {
      "data-slot": "dialog-footer",
      class: clsx(cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Dialog_header($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes(
    {
      "data-slot": "dialog-header",
      class: clsx(cn("flex flex-col gap-2 text-center sm:text-left", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Dialog_overlay($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Dialog_overlay$1($$payload2, spread_props([
      {
        "data-slot": "dialog-overlay",
        class: cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Dialog_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    portalProps,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Portal($$payload2, spread_props([
      portalProps,
      {
        children: ($$payload3) => {
          $$payload3.out += `<!---->`;
          Dialog_overlay($$payload3, {});
          $$payload3.out += `<!----> <!---->`;
          Dialog_content$1($$payload3, spread_props([
            {
              "data-slot": "dialog-content",
              class: cn("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg", className)
            },
            restProps,
            {
              get ref() {
                return ref;
              },
              set ref($$value) {
                ref = $$value;
                $$settled = false;
              },
              children: ($$payload4) => {
                children?.($$payload4);
                $$payload4.out += `<!----> <!---->`;
                Dialog_close($$payload4, {
                  class: "ring-offset-background focus:ring-ring rounded-xs focus:outline-hidden absolute right-4 top-4 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
                  children: ($$payload5) => {
                    X($$payload5, {});
                    $$payload5.out += `<!----> <span class="sr-only">Close</span>`;
                  },
                  $$slots: { default: true }
                });
                $$payload4.out += `<!---->`;
              },
              $$slots: { default: true }
            }
          ]));
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Dialog_description($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Dialog_description$1($$payload2, spread_props([
      {
        "data-slot": "dialog-description",
        class: cn("text-muted-foreground text-sm", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Dialog_trigger($$payload, $$props) {
  push();
  let { ref = null, $$slots, $$events, ...restProps } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Dialog_trigger$1($$payload2, spread_props([
      { "data-slot": "dialog-trigger" },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const Root$2 = Dialog;
const Portal = Portal$1;
const Root$1 = Collapsible;
const Trigger = Collapsible_trigger;
const Content = Collapsible_content;
function Scroll_area_scrollbar($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    orientation = "vertical",
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Scroll_area_scrollbar$1($$payload2, spread_props([
      {
        "data-slot": "scroll-area-scrollbar",
        orientation,
        class: cn("flex touch-none select-none p-px transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          children?.($$payload3);
          $$payload3.out += `<!----> <!---->`;
          Scroll_area_thumb($$payload3, {
            "data-slot": "scroll-area-thumb",
            class: "bg-border relative flex-1 rounded-full"
          });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Scroll_area($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    orientation = "vertical",
    scrollbarXClasses = "",
    scrollbarYClasses = "",
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Scroll_area$1($$payload2, spread_props([
      {
        "data-slot": "scroll-area",
        class: cn("relative", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          $$payload3.out += `<!---->`;
          Scroll_area_viewport($$payload3, {
            "data-slot": "scroll-area-viewport",
            class: "ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-4",
            children: ($$payload4) => {
              children?.($$payload4);
              $$payload4.out += `<!---->`;
            },
            $$slots: { default: true }
          });
          $$payload3.out += `<!----> `;
          if (orientation === "vertical" || orientation === "both") {
            $$payload3.out += "<!--[-->";
            Scroll_area_scrollbar($$payload3, {
              orientation: "vertical",
              class: scrollbarYClasses
            });
          } else {
            $$payload3.out += "<!--[!-->";
          }
          $$payload3.out += `<!--]--> `;
          if (orientation === "horizontal" || orientation === "both") {
            $$payload3.out += "<!--[-->";
            Scroll_area_scrollbar($$payload3, {
              orientation: "horizontal",
              class: scrollbarXClasses
            });
          } else {
            $$payload3.out += "<!--[!-->";
          }
          $$payload3.out += `<!--]--> <!---->`;
          Scroll_area_corner($$payload3, {});
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Label($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Label$1($$payload2, spread_props([
      {
        "data-slot": "label",
        class: cn("flex select-none items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Chevrons_up_down($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    ["path", { "d": "m7 15 5 5 5-5" }],
    ["path", { "d": "m7 9 5-5 5 5" }]
  ];
  Icon($$payload, spread_props([
    { name: "chevrons-up-down" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Clipboard_copy($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    [
      "rect",
      {
        "width": "8",
        "height": "4",
        "x": "8",
        "y": "2",
        "rx": "1",
        "ry": "1"
      }
    ],
    [
      "path",
      {
        "d": "M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
      }
    ],
    ["path", { "d": "M16 4h2a2 2 0 0 1 2 2v4" }],
    ["path", { "d": "M21 14H11" }],
    ["path", { "d": "m15 10-4 4 4 4" }]
  ];
  Icon($$payload, spread_props([
    { name: "clipboard-copy" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Copy($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    [
      "rect",
      {
        "width": "14",
        "height": "14",
        "x": "8",
        "y": "8",
        "rx": "2",
        "ry": "2"
      }
    ],
    [
      "path",
      {
        "d": "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
      }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "copy" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Plus($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    ["path", { "d": "M5 12h14" }],
    ["path", { "d": "M12 5v14" }]
  ];
  Icon($$payload, spread_props([
    { name: "plus" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Search($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    ["path", { "d": "m21 21-4.34-4.34" }],
    [
      "circle",
      { "cx": "11", "cy": "11", "r": "8" }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "search" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Trash($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    ["path", { "d": "M3 6h18" }],
    [
      "path",
      { "d": "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }
    ],
    [
      "path",
      { "d": "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "trash" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
const tools = {
  "user-input-request": {
    transport: {
      type: "http",
      url: "/api/mcp-tools/user-input-request"
    },
    toolSchema: {
      name: "request-question",
      description: "Request a question from the user. Hangs until input is received.",
      inputSchema: {
        type: "object",
        properties: {
          message: { type: "string", description: "Message to show to the user." }
        }
      }
    }
  },
  "user-input-respond": {
    transport: {
      type: "http",
      url: "/api/mcp-tools/user-input-respond"
    },
    toolSchema: {
      name: "answer-question",
      description: "Answer the last question you requested from the user. You can only respond once, and will have to request more input later.",
      inputSchema: {
        type: "object",
        properties: {
          response: { type: "string", description: "Answer to show to the user." }
        },
        required: ["response"]
      }
    }
  }
};
function Textarea($$payload, $$props) {
  push();
  let {
    ref = null,
    value = void 0,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<textarea${spread_attributes(
    {
      "data-slot": "textarea",
      class: clsx(cn("border-border placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)),
      ...restProps
    },
    null
  )}>`;
  const $$body = escape_html(value);
  if ($$body) {
    $$payload.out += `${$$body}`;
  }
  $$payload.out += `</textarea>`;
  bind_props($$props, { ref, value });
  pop();
}
function Clipboard_import_dialog($$payload, $$props) {
  push();
  let { onImport, child } = $$props;
  let value = "";
  let open = false;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Root$2($$payload2, {
      get open() {
        return open;
      },
      set open($$value) {
        open = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        $$payload3.out += `<!---->`;
        Dialog_trigger($$payload3, {
          child,
          children: ($$payload4) => {
            $$payload4.out += `<!---->Import from clipboard`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----> <!---->`;
        Dialog_content($$payload3, {
          class: "",
          children: ($$payload4) => {
            $$payload4.out += `<!---->`;
            Dialog_header($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->`;
                Dialog_title($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Import from clipboard`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> <!---->`;
                Dialog_description($$payload5, {});
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!----> `;
            Textarea($$payload4, {
              class: "min-h-60",
              get value() {
                return value;
              },
              set value($$value) {
                value = $$value;
                $$settled = false;
              }
            });
            $$payload4.out += `<!----> `;
            Button($$payload4, {
              onclick: () => {
                onImport?.(value);
                value = "";
                open = false;
              },
              children: ($$payload5) => {
                $$payload5.out += `<!---->Import`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!---->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
function Command($$payload, $$props) {
  push();
  let {
    ref = null,
    value = "",
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Command$1($$payload2, spread_props([
      {
        "data-slot": "command",
        class: cn("bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md", className)
      },
      restProps,
      {
        get value() {
          return value;
        },
        set value($$value) {
          value = $$value;
          $$settled = false;
        },
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref, value });
  pop();
}
function Command_empty($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Command_empty$1($$payload2, spread_props([
      {
        "data-slot": "command-empty",
        class: cn("py-6 text-center text-sm", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Command_group($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    heading,
    value,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Command_group$1($$payload2, spread_props([
      {
        "data-slot": "command-group",
        class: cn("text-foreground overflow-hidden p-1", className),
        value: value ?? heading ?? `----${useId()}`
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          if (heading) {
            $$payload3.out += "<!--[-->";
            $$payload3.out += `<!---->`;
            Command_group_heading($$payload3, {
              class: "text-muted-foreground px-2 py-1.5 text-xs font-medium",
              children: ($$payload4) => {
                $$payload4.out += `<!---->${escape_html(heading)}`;
              },
              $$slots: { default: true }
            });
            $$payload3.out += `<!---->`;
          } else {
            $$payload3.out += "<!--[!-->";
          }
          $$payload3.out += `<!--]--> <!---->`;
          Command_group_items($$payload3, { children });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Command_item($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Command_item$1($$payload2, spread_props([
      {
        "data-slot": "command-item",
        class: cn("aria-selected:bg-accent aria-selected:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground outline-hidden relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Command_input($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    value = "",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<div class="flex h-9 items-center gap-2 border-b px-3" data-slot="command-input-wrapper">`;
    Search($$payload2, { class: "size-4 shrink-0 opacity-50" });
    $$payload2.out += `<!----> <!---->`;
    Command_input$1($$payload2, spread_props([
      {
        "data-slot": "command-input",
        class: cn("placeholder:text-muted-foreground outline-hidden flex h-10 w-full rounded-md bg-transparent py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        get value() {
          return value;
        },
        set value($$value) {
          value = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!----></div>`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref, value });
  pop();
}
function Command_list($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Command_list$1($$payload2, spread_props([
      {
        "data-slot": "command-list",
        class: cn("max-h-[300px] scroll-py-1 overflow-y-auto overflow-x-hidden", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Popover_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    sideOffset = 4,
    align = "center",
    portalProps,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Portal$1($$payload2, spread_props([
      portalProps,
      {
        children: ($$payload3) => {
          $$payload3.out += `<!---->`;
          Popover_content$1($$payload3, spread_props([
            {
              "data-slot": "popover-content",
              sideOffset,
              align,
              class: cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--bits-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden", className)
            },
            restProps,
            {
              get ref() {
                return ref;
              },
              set ref($$value) {
                ref = $$value;
                $$settled = false;
              }
            }
          ]));
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Popover_trigger($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Popover_trigger$1($$payload2, spread_props([
      {
        "data-slot": "popover-trigger",
        class: cn("", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const Root = Popover;
const Close = Popover_close;
const Arrow = Popover_arrow;
function Combobox($$payload, $$props) {
  push();
  let {
    open = false,
    value = "",
    selectPlaceholder = "Select an item...",
    searchPlaceholder = "Search items...",
    emptyLabel = "No items found.",
    options = [],
    onValueChange,
    side,
    align,
    option: optionChild,
    trigger
  } = $$props;
  let triggerRef = null;
  function closeAndFocusTrigger() {
    open = false;
    tick().then(() => {
      triggerRef.focus();
    });
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Root($$payload2, {
      get open() {
        return open;
      },
      set open($$value) {
        open = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        $$payload3.out += `<!---->`;
        {
          let child = function($$payload4, { props }) {
            if (trigger) {
              $$payload4.out += "<!--[-->";
              trigger($$payload4, { props });
              $$payload4.out += `<!---->`;
            } else {
              $$payload4.out += "<!--[!-->";
              Button($$payload4, spread_props([
                {
                  variant: "outline",
                  class: "w-[200px] justify-between"
                },
                props,
                {
                  role: "combobox",
                  "aria-expanded": open,
                  children: ($$payload5) => {
                    $$payload5.out += `<!---->${escape_html(value || selectPlaceholder)} `;
                    Chevrons_up_down($$payload5, { class: "ml-2 size-4 shrink-0 opacity-50" });
                    $$payload5.out += `<!---->`;
                  },
                  $$slots: { default: true }
                }
              ]));
            }
            $$payload4.out += `<!--]-->`;
          };
          Popover_trigger($$payload3, {
            get ref() {
              return triggerRef;
            },
            set ref($$value) {
              triggerRef = $$value;
              $$settled = false;
            },
            child,
            $$slots: { child: true }
          });
        }
        $$payload3.out += `<!----> <!---->`;
        Popover_content($$payload3, {
          class: "w-[200px] p-0",
          side,
          align,
          children: ($$payload4) => {
            $$payload4.out += `<!---->`;
            Command($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->`;
                Command_input($$payload5, { placeholder: searchPlaceholder });
                $$payload5.out += `<!----> <!---->`;
                Command_list($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->`;
                    Command_empty($$payload6, {
                      children: ($$payload7) => {
                        $$payload7.out += `<!---->${escape_html(emptyLabel)}`;
                      },
                      $$slots: { default: true }
                    });
                    $$payload6.out += `<!----> <!---->`;
                    Command_group($$payload6, {
                      children: ($$payload7) => {
                        const each_array = ensure_array_like(options);
                        $$payload7.out += `<!--[-->`;
                        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                          let option = each_array[$$index];
                          $$payload7.out += `<!---->`;
                          Command_item($$payload7, {
                            value: option,
                            onSelect: () => {
                              value = option;
                              onValueChange?.(value);
                              closeAndFocusTrigger();
                            },
                            children: ($$payload8) => {
                              if (optionChild) {
                                $$payload8.out += "<!--[-->";
                                optionChild($$payload8, { option });
                                $$payload8.out += `<!---->`;
                              } else {
                                $$payload8.out += "<!--[!-->";
                                Check($$payload8, {
                                  class: cn("mr-2 size-4", value !== option && "text-transparent")
                                });
                                $$payload8.out += `<!----> ${escape_html(option)}`;
                              }
                              $$payload8.out += `<!--]-->`;
                            },
                            $$slots: { default: true }
                          });
                          $$payload7.out += `<!---->`;
                        }
                        $$payload7.out += `<!--]-->`;
                      },
                      $$slots: { default: true }
                    });
                    $$payload6.out += `<!---->`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!---->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { open, value });
  pop();
}
function Code_block($$payload, $$props) {
  push();
  const { text = "", class: className, language } = $$props;
  let copied = false;
  const colorize = {
    json: (text2) => text2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = "number";
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "key" : "string";
      } else if (/true|false/.test(match)) {
        cls = "boolean";
      } else if (/null/.test(match)) {
        cls = "null";
      }
      return `<span class="${cls}">${match}</span>`;
    })
  };
  $$payload.out += `<section class="group bg-secondary relative overflow-clip rounded-md p-1 pt-0 dark:bg-black/30">`;
  Scroll_area($$payload, {
    orientation: "horizontal",
    class: "group relative size-full ",
    children: ($$payload2) => {
      $$payload2.out += `<code${attr_class(clsx(cn("relative inline-block w-full px-2 py-3 whitespace-pre", language, className)), "svelte-1sebx1l")}>`;
      if (language) {
        $$payload2.out += "<!--[-->";
        $$payload2.out += `${html(colorize[language](text))}`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `${escape_html(text)}`;
      }
      $$payload2.out += `<!--]--></code>`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----> `;
  Button($$payload, {
    size: "icon",
    variant: "outline",
    disabled: copied,
    class: cn("absolute top-1 right-1 size-7 p-1 opacity-0 transition-opacity group-hover:opacity-100"),
    onclick: async () => {
      copied = true;
      await navigator.clipboard.writeText(text);
      setTimeout(
        () => {
          copied = false;
        },
        500
      );
    },
    children: ($$payload2) => {
      Copy($$payload2, { class: "size-3" });
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----></section>`;
  pop();
}
function Tooltip_label($$payload, $$props) {
  const {
    tooltip,
    class: className,
    children: labelChild
  } = $$props;
  $$payload.out += `<!---->`;
  Provider($$payload, {
    children: ($$payload2) => {
      $$payload2.out += `<!---->`;
      Root$6($$payload2, {
        disabled: !tooltip,
        children: ($$payload3) => {
          $$payload3.out += `<!---->`;
          {
            let child = function($$payload4, { props }) {
              Label($$payload4, spread_props([
                props,
                {
                  class: className,
                  children: ($$payload5) => {
                    labelChild?.($$payload5);
                    $$payload5.out += `<!---->`;
                  },
                  $$slots: { default: true }
                }
              ]));
            };
            Tooltip_trigger($$payload3, { child, $$slots: { child: true } });
          }
          $$payload3.out += `<!----> <!---->`;
          Tooltip_content($$payload3, {
            children: ($$payload4) => {
              $$payload4.out += `<p>${escape_html(tooltip)}</p>`;
            },
            $$slots: { default: true }
          });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!---->`;
    }
  });
  $$payload.out += `<!---->`;
}
function Twostep_button($$payload, $$props) {
  push();
  const {
    onclick,
    children,
    $$slots,
    $$events,
    ...props
  } = $$props;
  let open = false;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Root$2($$payload2, {
      get open() {
        return open;
      },
      set open($$value) {
        open = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        $$payload3.out += `<!---->`;
        {
          let child = function($$payload4, { props: childProps }) {
            Button($$payload4, spread_props([
              childProps,
              props,
              {
                children: ($$payload5) => {
                  children?.($$payload5);
                  $$payload5.out += `<!---->`;
                },
                $$slots: { default: true }
              }
            ]));
          };
          Dialog_trigger($$payload3, { child, $$slots: { child: true } });
        }
        $$payload3.out += `<!----> <!---->`;
        Dialog_content($$payload3, {
          class: "sm:max-w-xs",
          children: ($$payload4) => {
            $$payload4.out += `<!---->`;
            Dialog_header($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->`;
                Dialog_title($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Are you sure?`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> <!---->`;
                Dialog_description($$payload5, {});
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!----> `;
            Button($$payload4, {
              onclick: () => {
                onclick?.();
                open = false;
              },
              children: ($$payload5) => {
                $$payload5.out += `<!---->Yes`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!----> `;
            Button($$payload4, {
              variant: "secondary",
              onclick: () => {
                open = false;
              },
              children: ($$payload5) => {
                $$payload5.out += `<!---->No`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!---->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
function Modal_collapsible($$payload, $$props) {
  push();
  const { title, children } = $$props;
  $$payload.out += `<!---->`;
  Root$1($$payload, {
    class: "group",
    open: false,
    children: ($$payload2) => {
      $$payload2.out += `<!---->`;
      Trigger($$payload2, {
        class: cn(buttonVariants({ size: "icon", variant: "ghost" }), "flex h-6 w-max flex-row items-center gap-1 px-2 pl-1"),
        children: ($$payload3) => {
          Chevron_right($$payload3, {
            class: "transition-transform group-data-[state=open]:rotate-90"
          });
          $$payload3.out += `<!----> <h3 class="text-sm font-bold">${escape_html(title)}</h3>`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!----> <!---->`;
      Content($$payload2, {
        class: "max-w-full pr-2 pl-4",
        children: ($$payload3) => {
          children?.($$payload3);
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!---->`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!---->`;
  pop();
}
function Create_session($$payload, $$props) {
  push();
  let ctx = sessionCtx.get();
  let { open = false, agents } = $$props;
  let graph = { agents: [] };
  let finalBody = {
    agentGraph: { agents: {}, links: [], tools: {} }
  };
  let finalAgentIds = graph.agents.map((a) => a.name);
  let finalAgentTools = graph.agents.map((a) => a.tools);
  let finalAgentOptions = Object.fromEntries(graph.agents.map((a) => [
    a.name,
    Object.fromEntries(Object.entries(a.options).map(([k2, v]) => [k2, v.value]))
  ]));
  let reactivityHack = graph.agents.flatMap((a) => Object.values(a));
  let duplicateNames = new SvelteSet();
  let neededTools = new SvelteSet();
  watch$1(
    [
      () => finalAgentIds,
      () => finalAgentTools,
      () => finalAgentOptions,
      () => reactivityHack
    ],
    () => {
      finalBody.agentGraph.agents = {};
      duplicateNames.clear();
      neededTools.clear();
      for (const agent of graph.agents) {
        if (agent.name in finalBody.agentGraph.agents) {
          duplicateNames.add(agent.name);
          continue;
        }
        for (const tool of agent.tools) {
          neededTools.add(tool);
        }
        finalBody.agentGraph.agents[agent.name] = {
          options: finalAgentOptions[agent.name],
          type: "local",
          blocking: agent.blocking,
          agentType: agent.id,
          tools: agent.tools,
          systemPrompt: agent.systemPrompt
        };
      }
      finalBody.agentGraph.tools = Object.fromEntries(Array.from(neededTools).map((id) => {
        const tool = tools[id];
        return [
          id,
          {
            ...tool,
            transport: {
              ...tool.transport,
              url: `${window.location.origin}${tool.transport.url}`
            }
          }
        ];
      }));
    }
  );
  let valid = !!ctx.connection && ctx.connection.privacyKey.length > 0 && ctx.connection.appId.length > 0 && duplicateNames.size == 0 && graph.agents.every((v) => {
    return Object.values(v.options).every((opt) => {
      console.log({
        opt,
        default: opt.default,
        value: opt.value,
        valid: opt.default !== null || !!opt.value
      });
      return opt.default !== null || !!opt.value;
    });
  });
  const importFromJson = (text) => {
    const data = JSON.parse(text);
    if (!("agentGraph" in data) || typeof data.agentGraph !== "object" || !data.agentGraph || !("agents" in data.agentGraph) || typeof data.agentGraph.agents !== "object" || !data.agentGraph.agents) {
      return;
    }
    graph.agents = [];
    finalBody.agentGraph.links = data.agentGraph.links ?? [];
    const importAgents = data.agentGraph.agents;
    for (const [name, agent] of Object.entries(importAgents)) {
      const newAgent = {
        name,
        id: agent.agentType,
        blocking: agent.blocking,
        // TODO (alan): handle when this lookup fails
        options: agents[agent.agentType].options,
        systemPrompt: agent.systemPrompt,
        tools: agent.tools ?? []
      };
      for (const [oName, opt] of Object.entries(agent.options)) {
        newAgent.options[oName].value = opt;
      }
      graph.agents.push(newAgent);
    }
  };
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (ctx.connection) {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<!---->`;
      Root$2($$payload2, {
        get open() {
          return open;
        },
        set open($$value) {
          open = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          $$payload3.out += `<!---->`;
          Dialog_content($$payload3, {
            class: "grid max-h-[90svh] grid-cols-[100%] grid-rows-[max-content_minmax(0,1fr)_max-content] gap-y-2 lg:max-w-2xl",
            children: ($$payload4) => {
              $$payload4.out += `<!---->`;
              Dialog_header($$payload4, {
                children: ($$payload5) => {
                  $$payload5.out += `<!---->`;
                  Dialog_title($$payload5, {
                    children: ($$payload6) => {
                      $$payload6.out += `<!---->New Session`;
                    },
                    $$slots: { default: true }
                  });
                  $$payload5.out += `<!----> <!---->`;
                  Dialog_description($$payload5, {
                    children: ($$payload6) => {
                      $$payload6.out += `<!---->Create a new session.`;
                    },
                    $$slots: { default: true }
                  });
                  $$payload5.out += `<!---->`;
                },
                $$slots: { default: true }
              });
              $$payload4.out += `<!----> `;
              Scroll_area($$payload4, {
                class: "",
                children: ($$payload5) => {
                  $$payload5.out += `<section class="flex max-w-full flex-col gap-2 pr-4"><section class="grid grid-cols-[minmax(0,max-content)_auto] gap-4 gap-y-2 pt-2">`;
                  Tooltip_label($$payload5, {
                    children: ($$payload6) => {
                      $$payload6.out += `<!---->Application ID`;
                    }
                  });
                  $$payload5.out += `<!----> `;
                  Input($$payload5, {
                    required: true,
                    placeholder: "appId",
                    "aria-invalid": ctx.connection.appId.length === 0,
                    get value() {
                      return ctx.connection.appId;
                    },
                    set value($$value) {
                      ctx.connection.appId = $$value;
                      $$settled = false;
                    }
                  });
                  $$payload5.out += `<!----> `;
                  Tooltip_label($$payload5, {
                    children: ($$payload6) => {
                      $$payload6.out += `<!---->Privacy Key`;
                    }
                  });
                  $$payload5.out += `<!----> `;
                  Input($$payload5, {
                    required: true,
                    placeholder: "privKey",
                    "aria-invalid": ctx.connection.privacyKey.length === 0,
                    get value() {
                      return ctx.connection.privacyKey;
                    },
                    set value($$value) {
                      ctx.connection.privacyKey = $$value;
                      $$settled = false;
                    }
                  });
                  $$payload5.out += `<!----></section> `;
                  {
                    let child = function($$payload6, { props }) {
                      Button($$payload6, spread_props([
                        props,
                        {
                          variant: "outline",
                          class: "w-fit",
                          children: ($$payload7) => {
                            $$payload7.out += `<!---->Import `;
                            Clipboard_copy($$payload7, {});
                            $$payload7.out += `<!---->`;
                          },
                          $$slots: { default: true }
                        }
                      ]));
                    };
                    Clipboard_import_dialog($$payload5, {
                      onImport: importFromJson,
                      child
                    });
                  }
                  $$payload5.out += `<!----> `;
                  Separator($$payload5, { class: "mt-2" });
                  $$payload5.out += `<!----> `;
                  Modal_collapsible($$payload5, {
                    title: "Agents",
                    children: ($$payload6) => {
                      const each_array = ensure_array_like(graph.agents);
                      $$payload6.out += `<ul class="flex flex-col gap-1"><!--[-->`;
                      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
                        let agent = each_array[i];
                        $$payload6.out += `<!---->`;
                        Root$1($$payload6, {
                          class: "group/collapsible",
                          open: true,
                          children: ($$payload7) => {
                            $$payload7.out += `<div class="flex flex-row items-center gap-1"><!---->`;
                            Trigger($$payload7, {
                              class: cn(buttonVariants({ size: "icon", variant: "ghost" }), "size-8"),
                              children: ($$payload8) => {
                                Chevron_right($$payload8, {
                                  class: "transition-transform group-data-[state=open]/collapsible:rotate-90"
                                });
                              },
                              $$slots: { default: true }
                            });
                            $$payload7.out += `<!----> `;
                            Input($$payload7, {
                              placeholder: "agent name",
                              "aria-invalid": !agent.name || duplicateNames.has(agent.name),
                              get value() {
                                return agent.name;
                              },
                              set value($$value) {
                                agent.name = $$value;
                                $$settled = false;
                              }
                            });
                            $$payload7.out += `<!----> `;
                            Combobox($$payload7, {
                              options: Object.keys(agents),
                              onValueChange: (id) => {
                                const newAgent = agents[id];
                                if (!newAgent) return;
                                agent.options = newAgent.options;
                              },
                              selectPlaceholder: "Select an agent...",
                              searchPlaceholder: "Search agents...",
                              emptyLabel: "No agents found.",
                              get value() {
                                return agent.id;
                              },
                              set value($$value) {
                                agent.id = $$value;
                                $$settled = false;
                              }
                            });
                            $$payload7.out += `<!----> `;
                            Twostep_button($$payload7, {
                              variant: "destructive",
                              size: "icon",
                              onclick: () => {
                                graph.agents.splice(i, 1);
                              },
                              children: ($$payload8) => {
                                Trash($$payload8, {});
                              },
                              $$slots: { default: true }
                            });
                            $$payload7.out += `<!----></div> <!---->`;
                            Content($$payload7, {
                              class: "flex flex-col gap-1 p-2 pl-4",
                              children: ($$payload8) => {
                                $$payload8.out += `<!---->`;
                                Root$1($$payload8, {
                                  class: "group/options",
                                  open: true,
                                  children: ($$payload9) => {
                                    $$payload9.out += `<!---->`;
                                    Trigger($$payload9, {
                                      class: cn(buttonVariants({ size: "icon", variant: "ghost" }), "flex h-6 w-max flex-row items-center gap-1 px-2 pl-1"),
                                      children: ($$payload10) => {
                                        Chevron_right($$payload10, {
                                          class: "transition-transform group-data-[state=open]/options:rotate-90"
                                        });
                                        $$payload10.out += `<!----> <h3 class="text-sm font-bold">Options</h3>`;
                                      },
                                      $$slots: { default: true }
                                    });
                                    $$payload9.out += `<!----> <!---->`;
                                    Content($$payload9, {
                                      class: "grid grid-cols-[max-content_minmax(0,auto)] gap-2 p-2 pl-4",
                                      children: ($$payload10) => {
                                        const each_array_1 = ensure_array_like(Object.values(agent.options));
                                        $$payload10.out += `<!--[-->`;
                                        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
                                          let option = each_array_1[$$index];
                                          $$payload10.out += `<!---->`;
                                          Provider($$payload10, {
                                            children: ($$payload11) => {
                                              $$payload11.out += `<!---->`;
                                              Root$6($$payload11, {
                                                disabled: !option.description,
                                                children: ($$payload12) => {
                                                  $$payload12.out += `<!---->`;
                                                  {
                                                    let child = function($$payload13, { props }) {
                                                      Label($$payload13, spread_props([
                                                        props,
                                                        {
                                                          class: "gap-1",
                                                          children: ($$payload14) => {
                                                            $$payload14.out += `<!---->${escape_html(option.name)} <span class="text-destructive">${escape_html(option.default === null ? "*" : "")}</span>`;
                                                          },
                                                          $$slots: { default: true }
                                                        }
                                                      ]));
                                                    };
                                                    Tooltip_trigger($$payload12, { child, $$slots: { child: true } });
                                                  }
                                                  $$payload12.out += `<!----> <!---->`;
                                                  Tooltip_content($$payload12, {
                                                    children: ($$payload13) => {
                                                      $$payload13.out += `<p>${escape_html(option.description)}</p>`;
                                                    },
                                                    $$slots: { default: true }
                                                  });
                                                  $$payload12.out += `<!---->`;
                                                },
                                                $$slots: { default: true }
                                              });
                                              $$payload11.out += `<!---->`;
                                            }
                                          });
                                          $$payload10.out += `<!----> `;
                                          Input($$payload10, {
                                            type: /key/i.test(option.name) ? "password" : "text",
                                            autocomplete: "off",
                                            name: option.name,
                                            placeholder: option.default !== null ? option.default.toString() : "",
                                            required: option.default === null,
                                            "aria-invalid": option.default === null && !option.value,
                                            get value() {
                                              return option.value;
                                            },
                                            set value($$value) {
                                              option.value = $$value;
                                              $$settled = false;
                                            }
                                          });
                                          $$payload10.out += `<!---->`;
                                        }
                                        $$payload10.out += `<!--]-->`;
                                      },
                                      $$slots: { default: true }
                                    });
                                    $$payload9.out += `<!---->`;
                                  },
                                  $$slots: { default: true }
                                });
                                $$payload8.out += `<!----> <!---->`;
                                Root$1($$payload8, {
                                  class: "group/tools",
                                  open: false,
                                  children: ($$payload9) => {
                                    $$payload9.out += `<!---->`;
                                    Trigger($$payload9, {
                                      class: cn(buttonVariants({ size: "icon", variant: "ghost" }), "flex h-6 w-max flex-row items-center gap-1 px-2 pl-1"),
                                      children: ($$payload10) => {
                                        Chevron_right($$payload10, {
                                          class: "transition-transform group-data-[state=open]/tools:rotate-90"
                                        });
                                        $$payload10.out += `<!----> <h3 class="text-sm font-bold">Custom Tools</h3>`;
                                      },
                                      $$slots: { default: true }
                                    });
                                    $$payload9.out += `<!----> <!---->`;
                                    Content($$payload9, {
                                      class: "grid grid-cols-[max-content_auto] gap-2 p-2",
                                      children: ($$payload10) => {
                                        $$payload10.out += `<!---->`;
                                        Root$3($$payload10, {
                                          type: "multiple",
                                          value: agent.tools,
                                          onValueChange: (value) => {
                                            agent.tools = value;
                                          },
                                          children: ($$payload11) => {
                                            $$payload11.out += `<!---->`;
                                            Select_trigger($$payload11, {
                                              children: ($$payload12) => {
                                                if (agent.tools.length == 0) {
                                                  $$payload12.out += "<!--[-->";
                                                  $$payload12.out += `<span class="text-muted-foreground text-sm italic">No extra tools.</span>`;
                                                } else {
                                                  $$payload12.out += "<!--[!-->";
                                                  $$payload12.out += `${escape_html(agent.tools.join(", "))}`;
                                                }
                                                $$payload12.out += `<!--]-->`;
                                              },
                                              $$slots: { default: true }
                                            });
                                            $$payload11.out += `<!----> <!---->`;
                                            Select_content($$payload11, {
                                              children: ($$payload12) => {
                                                const each_array_2 = ensure_array_like(Object.entries(tools));
                                                if (Object.keys(tools).length == 0) {
                                                  $$payload12.out += "<!--[-->";
                                                  $$payload12.out += `<span class="text-muted-foreground px-2 text-sm italic">No tools</span>`;
                                                } else {
                                                  $$payload12.out += "<!--[!-->";
                                                }
                                                $$payload12.out += `<!--]--> <!--[-->`;
                                                for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
                                                  let [name, tool] = each_array_2[$$index_1];
                                                  $$payload12.out += `<!---->`;
                                                  Select_item($$payload12, {
                                                    value: name,
                                                    children: ($$payload13) => {
                                                      $$payload13.out += `<!---->${escape_html(tool.toolSchema.name)}`;
                                                    },
                                                    $$slots: { default: true }
                                                  });
                                                  $$payload12.out += `<!---->`;
                                                }
                                                $$payload12.out += `<!--]-->`;
                                              },
                                              $$slots: { default: true }
                                            });
                                            $$payload11.out += `<!---->`;
                                          },
                                          $$slots: { default: true }
                                        });
                                        $$payload10.out += `<!---->`;
                                      },
                                      $$slots: { default: true }
                                    });
                                    $$payload9.out += `<!---->`;
                                  },
                                  $$slots: { default: true }
                                });
                                $$payload8.out += `<!----> <!---->`;
                                Root$1($$payload8, {
                                  class: "group/prompt",
                                  open: false,
                                  children: ($$payload9) => {
                                    $$payload9.out += `<!---->`;
                                    Trigger($$payload9, {
                                      class: cn(buttonVariants({ size: "icon", variant: "ghost" }), "flex h-6 w-max flex-row items-center gap-1 px-2 pl-1"),
                                      children: ($$payload10) => {
                                        Chevron_right($$payload10, {
                                          class: "transition-transform group-data-[state=open]/tools:rotate-90"
                                        });
                                        $$payload10.out += `<!----> <h3 class="text-sm font-bold">Prompt</h3>`;
                                      },
                                      $$slots: { default: true }
                                    });
                                    $$payload9.out += `<!----> <!---->`;
                                    Content($$payload9, {
                                      class: "grid grid-cols-1 gap-2 p-2",
                                      children: ($$payload10) => {
                                        $$payload10.out += `<p class="text-muted-foreground text-sm">Inject additional prompt text to the agent's system prompt (the agent must
													support this!)</p> `;
                                        Textarea($$payload10, {
                                          class: "",
                                          get value() {
                                            return agent.systemPrompt;
                                          },
                                          set value($$value) {
                                            agent.systemPrompt = $$value;
                                            $$settled = false;
                                          }
                                        });
                                        $$payload10.out += `<!---->`;
                                      },
                                      $$slots: { default: true }
                                    });
                                    $$payload9.out += `<!---->`;
                                  },
                                  $$slots: { default: true }
                                });
                                $$payload8.out += `<!---->`;
                              },
                              $$slots: { default: true }
                            });
                            $$payload7.out += `<!---->`;
                          },
                          $$slots: { default: true }
                        });
                        $$payload6.out += `<!---->`;
                      }
                      $$payload6.out += `<!--]--></ul> `;
                      {
                        let trigger = function($$payload7, { props }) {
                          Button($$payload7, spread_props([
                            props,
                            {
                              size: "icon",
                              class: "mt-2 w-auto gap-1 px-3",
                              children: ($$payload8) => {
                                $$payload8.out += `<!---->New agent`;
                                Plus($$payload8, {});
                                $$payload8.out += `<!---->`;
                              },
                              $$slots: { default: true }
                            }
                          ]));
                        }, option = function($$payload7, { option: option2 }) {
                          $$payload7.out += `<!---->${escape_html(option2)}`;
                        };
                        Combobox($$payload6, {
                          side: "right",
                          align: "start",
                          options: Object.keys(agents),
                          searchPlaceholder: "Search agents...",
                          onValueChange: (value) => {
                            graph.agents.push(JSON.parse(JSON.stringify({
                              ...agents[value],
                              tools: [],
                              name: `agent-${graph.agents.length + 1}`
                            })));
                          },
                          trigger,
                          option,
                          $$slots: { trigger: true, option: true }
                        });
                      }
                      $$payload6.out += `<!---->`;
                    }
                  });
                  $$payload5.out += `<!----> `;
                  Modal_collapsible($$payload5, {
                    title: "Groups",
                    children: ($$payload6) => {
                      const each_array_3 = ensure_array_like(finalBody.agentGraph.links);
                      $$payload6.out += `<p class="text-muted-foreground text-sm leading-tight">Define a list of groups, where each agent in a group can all interact.</p> <ul class="mt-2 flex flex-col gap-1"><!--[-->`;
                      for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
                        let link = each_array_3[i];
                        $$payload6.out += `<!---->`;
                        Root$3($$payload6, {
                          type: "multiple",
                          value: link,
                          onValueChange: (value) => {
                            finalBody.agentGraph.links[i] = value;
                          },
                          children: ($$payload7) => {
                            $$payload7.out += `<!---->`;
                            Select_trigger($$payload7, {
                              children: ($$payload8) => {
                                if (link.length == 0) {
                                  $$payload8.out += "<!--[-->";
                                  $$payload8.out += `<span class="text-muted-foreground text-sm italic">Empty Group</span>`;
                                } else {
                                  $$payload8.out += "<!--[!-->";
                                  $$payload8.out += `${escape_html(link.join(", "))}`;
                                }
                                $$payload8.out += `<!--]-->`;
                              },
                              $$slots: { default: true }
                            });
                            $$payload7.out += `<!----> <!---->`;
                            Select_content($$payload7, {
                              children: ($$payload8) => {
                                const each_array_4 = ensure_array_like(Object.keys(finalBody.agentGraph.agents));
                                if (Object.keys(finalBody.agentGraph.agents).length == 0) {
                                  $$payload8.out += "<!--[-->";
                                  $$payload8.out += `<span class="text-muted-foreground px-2 text-sm italic">No agents</span>`;
                                } else {
                                  $$payload8.out += "<!--[!-->";
                                }
                                $$payload8.out += `<!--]--> <!--[-->`;
                                for (let $$index_3 = 0, $$length2 = each_array_4.length; $$index_3 < $$length2; $$index_3++) {
                                  let id = each_array_4[$$index_3];
                                  $$payload8.out += `<!---->`;
                                  Select_item($$payload8, {
                                    value: id,
                                    children: ($$payload9) => {
                                      $$payload9.out += `<!---->${escape_html(id)}`;
                                    },
                                    $$slots: { default: true }
                                  });
                                  $$payload8.out += `<!---->`;
                                }
                                $$payload8.out += `<!--]-->`;
                              },
                              $$slots: { default: true }
                            });
                            $$payload7.out += `<!---->`;
                          },
                          $$slots: { default: true }
                        });
                        $$payload6.out += `<!---->`;
                      }
                      $$payload6.out += `<!--]--> `;
                      Button($$payload6, {
                        size: "icon",
                        class: "w-fit gap-1 px-3",
                        disabled: (finalBody.agentGraph.links.at(-1)?.length ?? 1) == 0,
                        onclick: () => {
                          finalBody.agentGraph.links.push([]);
                        },
                        children: ($$payload7) => {
                          $$payload7.out += `<!---->New group`;
                          Plus($$payload7, {});
                          $$payload7.out += `<!---->`;
                        },
                        $$slots: { default: true }
                      });
                      $$payload6.out += `<!----></ul>`;
                    }
                  });
                  $$payload5.out += `<!----> `;
                  Modal_collapsible($$payload5, {
                    title: "Export",
                    children: ($$payload6) => {
                      Code_block($$payload6, {
                        text: JSON.stringify(finalBody, null, 2),
                        class: "",
                        language: "json"
                      });
                    }
                  });
                  $$payload5.out += `<!----></section>`;
                },
                $$slots: { default: true }
              });
              $$payload4.out += `<!----> <!---->`;
              Dialog_footer($$payload4, {
                children: ($$payload5) => {
                  Button($$payload5, {
                    type: "submit",
                    onclick: async () => {
                      if (!ctx.connection) return;
                      try {
                        const res = await fetch(`http://${ctx.connection.host}/sessions`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            ...finalBody,
                            applicationId: ctx.connection.appId,
                            privacyKey: ctx.connection.privacyKey
                          })
                        }).then((res2) => res2.json());
                        if (!ctx.sessions) ctx.sessions = [];
                        ctx.sessions.push(res.sessionId);
                        ctx.session = new Session({ ...ctx.connection, session: res.sessionId });
                        open = false;
                      } catch (e) {
                        toast.error(`Failed to create session: ${e}`);
                      }
                    },
                    disabled: !valid,
                    children: ($$payload6) => {
                      $$payload6.out += `<!---->Create`;
                    },
                    $$slots: { default: true }
                  });
                },
                $$slots: { default: true }
              });
              $$payload4.out += `<!---->`;
            },
            $$slots: { default: true }
          });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!---->`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { open });
  pop();
}
function IconCheckRegular($$payload, $$props) {
  let { class: class_ } = $$props;
  $$payload.out += `<svg${attr_class(clsx(class_))} data-phosphor-icon="check" aria-hidden="true" width="1em" height="1em" pointer-events="none" display="inline-block" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32"></path></svg>`;
}
function IconCaretUpDownRegular($$payload, $$props) {
  let { class: class_ } = $$props;
  $$payload.out += `<svg${attr_class(clsx(class_))} data-phosphor-icon="caret-up-down" aria-hidden="true" width="1em" height="1em" pointer-events="none" display="inline-block" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M181.66 170.34a8 8 0 0 1 0 11.32l-48 48a8 8 0 0 1-11.32 0l-48-48a8 8 0 0 1 11.32-11.32L128 212.69l42.34-42.35a8 8 0 0 1 11.32 0m-96-84.68L128 43.31l42.34 42.35a8 8 0 0 0 11.32-11.32l-48-48a8 8 0 0 0-11.32 0l-48 48a8 8 0 0 0 11.32 11.32"></path></svg>`;
}
function Logo($$payload, $$props) {
  push();
  let {
    class: className,
    $$slots,
    $$events,
    ...props
  } = $$props;
  $$payload.out += `<svg${spread_attributes(
    {
      viewBox: "0 0 381 381",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      ...props,
      class: clsx(cn(className))
    },
    null,
    void 0,
    void 0,
    3
  )}><path d="M201.119 0V74.5508H180.864V54.6546H157.851V18.8175H121.774V54.6546H141.191V93.0087H165.642V112.066H180.864V131.363H148.143V112.066H103.316V93.0087H82.5812V54.6546H59.8084V112.066H82.5812V131.363H128.247V149.941H170.556V169.477H192.37V188.894H201.719V246.305H181.463V208.311H163.964V188.415H143.229V170.676H82.5812V208.311H137.116V227.128H156.293V276.749H123.932V246.905H103.077V227.128H58.7297V170.676H38.4739V131.003H0.359552V170.676H16.5402V208.311H38.4739V246.904L58.7297 246.905V266.374H103.215V285.748H38.473V246.905H0V266.441H16.5402V304.915H47.2235V323.613H82.2216V304.915H130.764V323.613H141.191V360.169H161.207V380.305H201.719V360.169H222.813V323.613H263.684V304.915H282.981V323.493H312.946V285.259H282.981V265.962H312.946V246.305H336.797V265.962H358.975V227.488H321.815V188.894H349.262V170.077H358.975V150.54H349.262V112.186H321.815V150.54H301.919V207.592H282.981V246.305H262.486V264.404H244.747V304.915H207.112V323.613H201.719V343.269H182.062V285.498H201.719V266.202H223.533V246.305H244.747V188.894H266.801V130.404H291.251V92.6491H301.799V55.0142H270.636V112.186H244.747V169.477H223.533V149.941H201.119V92.6491H223.533V74.5508H242.47V37.3953H223.533V0H201.119Z" fill="currentColor"></path></svg>`;
  pop();
}
function Server_switcher($$payload, $$props) {
  push();
  let servers = new PersistedState("servers", []);
  let selected = new PersistedState("selectedServer", null);
  let dialogOpen = false;
  let testSuccess = null;
  let testing = false;
  let host = "";
  const debouncedTest = useDebounce$1(
    async () => {
      testSuccess = null;
      testing = true;
      try {
        const res = await fetch(`http://${host}/api/v1/registry`);
        await tick();
        testSuccess = res.status === 200;
      } catch {
        await tick();
        testSuccess = false;
      }
      testing = false;
    },
    250
  );
  const testConnection = () => {
    testSuccess = null;
    testing = true;
    debouncedTest();
  };
  let { value = null, ref = null, onSelect } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Sidebar_menu($$payload2, {
      children: ($$payload3) => {
        $$payload3.out += `<!---->`;
        Sidebar_menu_item($$payload3, {
          children: ($$payload4) => {
            $$payload4.out += `<!---->`;
            Root$4($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->`;
                {
                  let child = function($$payload6, { props }) {
                    $$payload6.out += `<!---->`;
                    Sidebar_menu_button($$payload6, spread_props([
                      {
                        size: "lg",
                        class: "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground "
                      },
                      props,
                      {
                        get ref() {
                          return ref;
                        },
                        set ref($$value) {
                          ref = $$value;
                          $$settled = false;
                        },
                        children: ($$payload7) => {
                          $$payload7.out += `<div>`;
                          Logo($$payload7, { class: "text-foreground size-8" });
                          $$payload7.out += `<!----></div> <div class="flex flex-col gap-0.5 leading-none"><span class="font-sans text-xs font-bold tracking-widest uppercase">Coral Protocol</span> <span>Studio${escape_html(selected.current === null ? "" : ` - ${selected.current}`)}</span></div> `;
                          IconCaretUpDownRegular($$payload7, { class: "ml-auto" });
                          $$payload7.out += `<!---->`;
                        },
                        $$slots: { default: true }
                      }
                    ]));
                    $$payload6.out += `<!---->`;
                  };
                  Dropdown_menu_trigger($$payload5, { child, $$slots: { child: true } });
                }
                $$payload5.out += `<!----> <!---->`;
                Dropdown_menu_content($$payload5, {
                  class: "w-(--bits-dropdown-menu-anchor-width)",
                  align: "start",
                  children: ($$payload6) => {
                    const each_array = ensure_array_like(servers.current);
                    if (servers.current.length === 0) {
                      $$payload6.out += "<!--[-->";
                      $$payload6.out += `<!---->`;
                      Dropdown_menu_label($$payload6, {
                        class: "text-muted-foreground font-normal",
                        children: ($$payload7) => {
                          $$payload7.out += `<!---->No servers added.`;
                        },
                        $$slots: { default: true }
                      });
                      $$payload6.out += `<!---->`;
                    } else {
                      $$payload6.out += "<!--[!-->";
                    }
                    $$payload6.out += `<!--]--> <!--[-->`;
                    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                      let server = each_array[$$index];
                      $$payload6.out += `<!---->`;
                      Dropdown_menu_item($$payload6, {
                        onSelect: () => {
                          selected.current = server;
                          onSelect?.(server);
                        },
                        children: ($$payload7) => {
                          $$payload7.out += `<!---->${escape_html(server)} `;
                          if (server === selected.current) {
                            $$payload7.out += "<!--[-->";
                            IconCheckRegular($$payload7, { class: "ml-auto" });
                          } else {
                            $$payload7.out += "<!--[!-->";
                          }
                          $$payload7.out += `<!--]-->`;
                        },
                        $$slots: { default: true }
                      });
                      $$payload6.out += `<!---->`;
                    }
                    $$payload6.out += `<!--]--> <!---->`;
                    Dropdown_menu_separator($$payload6, {});
                    $$payload6.out += `<!----> <!---->`;
                    Dropdown_menu_item($$payload6, {
                      onSelect: () => dialogOpen = true,
                      children: ($$payload7) => {
                        $$payload7.out += `<!---->Add a server`;
                      },
                      $$slots: { default: true }
                    });
                    $$payload6.out += `<!---->`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!---->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!----> <!---->`;
    Root$2($$payload2, {
      get open() {
        return dialogOpen;
      },
      set open($$value) {
        dialogOpen = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        $$payload3.out += `<!---->`;
        Dialog_content($$payload3, {
          children: ($$payload4) => {
            $$payload4.out += `<!---->`;
            Dialog_header($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->`;
                Dialog_title($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Add a server`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> <!---->`;
                Dialog_description($$payload5, {});
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!----> <form><section class="grid grid-cols-2">`;
            Tooltip_label($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->Host`;
              }
            });
            $$payload4.out += `<!----> `;
            Input($$payload4, {
              placeholder: "localhost:5555",
              onkeypress: testConnection,
              get value() {
                return host;
              },
              set value($$value) {
                host = $$value;
                $$settled = false;
              }
            });
            $$payload4.out += `<!----></section></form> <!---->`;
            Dialog_footer($$payload4, {
              class: "items-center",
              children: ($$payload5) => {
                if (testSuccess === true) {
                  $$payload5.out += "<!--[-->";
                  $$payload5.out += `<p class="text-sm text-green-400">Connection successful.</p>`;
                } else if (testSuccess === false) {
                  $$payload5.out += "<!--[1-->";
                  $$payload5.out += `<p class="text-destructive text-sm">Connection failed.</p>`;
                } else {
                  $$payload5.out += "<!--[!-->";
                }
                $$payload5.out += `<!--]--> `;
                Button($$payload5, {
                  variant: "outline",
                  disabled: testing,
                  onclick: (e) => {
                    e.preventDefault();
                    testSuccess = null;
                    testing = true;
                    testConnection();
                  },
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Test`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> `;
                Button($$payload5, {
                  disabled: testSuccess !== true,
                  onclick: () => {
                    testSuccess = null;
                    servers.current.push(host);
                    selected.current = host;
                    dialogOpen = false;
                    host = "";
                  },
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Add`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!---->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { value, ref });
  pop();
}
const SNAPSHOT_KEY = "sveltekit:snapshot";
const SCROLL_KEY = "sveltekit:scroll";
function create_updated_store() {
  const { set, subscribe } = writable(false);
  {
    return {
      subscribe,
      // eslint-disable-next-line @typescript-eslint/require-await
      check: async () => false
    };
  }
}
const is_legacy = noop$1.toString().includes("$$") || /function \w+\(\) \{\}/.test(noop$1.toString());
if (is_legacy) {
  ({
    data: {},
    form: null,
    error: null,
    params: {},
    route: { id: null },
    state: {},
    status: -1,
    url: new URL("https://example.com")
  });
}
function get(key, parse2 = JSON.parse) {
  try {
    return parse2(sessionStorage[key]);
  } catch {
  }
}
get(SCROLL_KEY) ?? {};
get(SNAPSHOT_KEY) ?? {};
const stores = {
  updated: /* @__PURE__ */ create_updated_store()
};
function afterNavigate(callback) {
}
({
  check: stores.updated.check
});
function context() {
  return getContext("__request__");
}
const page$1 = {
  get error() {
    return context().page.error;
  },
  get params() {
    return context().page.params;
  },
  get status() {
    return context().page.status;
  },
  get url() {
    return context().page.url;
  }
};
const page = page$1;
function IconCaretRightRegular($$payload, $$props) {
  let { class: class_ } = $$props;
  $$payload.out += `<svg${attr_class(clsx(class_))} data-phosphor-icon="caret-right" aria-hidden="true" width="1em" height="1em" pointer-events="none" display="inline-block" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="m181.66 133.66-80 80a8 8 0 0 1-11.32-11.32L164.69 128 90.34 53.66a8 8 0 0 1 11.32-11.32l80 80a8 8 0 0 1 0 11.32"></path></svg>`;
}
const badgeVariants = tv({
  base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent",
      secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent",
      destructive: "bg-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 border-transparent text-white",
      outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
    }
  },
  defaultVariants: { variant: "default" }
});
function Badge($$payload, $$props) {
  push();
  let {
    ref = null,
    href,
    class: className,
    variant = "default",
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  element(
    $$payload,
    href ? "a" : "span",
    () => {
      $$payload.out += `${spread_attributes(
        {
          "data-slot": "badge",
          href,
          class: clsx(cn(badgeVariants({ variant }), className)),
          ...restProps
        },
        null
      )}`;
    },
    () => {
      children?.($$payload);
      $$payload.out += `<!---->`;
    }
  );
  bind_props($$props, { ref });
  pop();
}
function Sidebar_link($$payload, $$props) {
  push();
  const {
    title,
    url,
    icon: Icon2,
    badge,
    collapsible = false,
    class: className,
    $$slots,
    $$events,
    ...props
  } = $$props;
  function content($$payload2) {
    if (Icon2) {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<!---->`;
      Icon2($$payload2, {});
      $$payload2.out += `<!---->`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]--> <span class="font-sans font-medium tracking-wide">${escape_html(title)}</span> `;
    if (badge) {
      $$payload2.out += "<!--[-->";
      Badge($$payload2, {
        children: ($$payload3) => {
          $$payload3.out += `<!---->${escape_html(badge)}`;
        },
        $$slots: { default: true }
      });
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]--> `;
    if (collapsible) {
      $$payload2.out += "<!--[-->";
      IconCaretRightRegular($$payload2, {
        class: "ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
      });
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  $$payload.out += `<!---->`;
  Sidebar_menu_item($$payload, {
    children: ($$payload2) => {
      if (url) {
        $$payload2.out += "<!--[-->";
        $$payload2.out += `<!---->`;
        {
          let child = function($$payload3, { props: props2 }) {
            $$payload3.out += `<a${spread_attributes({ ...props2, href: url }, null)}>`;
            content($$payload3);
            $$payload3.out += `<!----></a>`;
          };
          Sidebar_menu_button($$payload2, spread_props([
            props,
            {
              tooltipContent: props.tooltipContent ?? title,
              isActive: page.url.pathname === url,
              class: cn("group", className),
              child,
              $$slots: { child: true }
            }
          ]));
        }
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<!---->`;
        Sidebar_menu_button($$payload2, spread_props([
          props,
          {
            tooltipContent: props.tooltipContent ?? title,
            isActive: page.url.pathname === url,
            class: cn("group", className),
            children: ($$payload3) => {
              content($$payload3);
            },
            $$slots: { default: true }
          }
        ]));
        $$payload2.out += `<!---->`;
      }
      $$payload2.out += `<!--]-->`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!---->`;
  pop();
}
function Nav_bundle($$payload, $$props) {
  push();
  let { items } = $$props;
  $$payload.out += `<!---->`;
  Sidebar_menu($$payload, {
    children: ($$payload2) => {
      const each_array = ensure_array_like(items);
      $$payload2.out += `<!--[-->`;
      for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
        let item = each_array[$$index_1];
        const activeSubitems = item.items.map((sub) => page.url.pathname === sub.url);
        const badgeSum = item.sumBadges ? item.items.reduce(
          (acc, cur) => {
            return acc + (cur.badge ?? 0);
          },
          0
        ) : 0;
        $$payload2.out += `<!---->`;
        {
          let child = function($$payload3, { props }) {
            $$payload3.out += `<!---->`;
            {
              let child2 = function($$payload4, { props: props2 }) {
                Sidebar_link($$payload4, spread_props([
                  props2,
                  {
                    title: item.title,
                    icon: item.icon,
                    badge: badgeSum,
                    collapsible: true
                  }
                ]));
              };
              Trigger($$payload3, spread_props([
                props,
                {
                  disabled: item.items.length === 0,
                  child: child2,
                  $$slots: { child: true }
                }
              ]));
            }
            $$payload3.out += `<!----> <!---->`;
            Content($$payload3, {
              children: ($$payload4) => {
                $$payload4.out += `<!---->`;
                Sidebar_menu_sub($$payload4, {
                  children: ($$payload5) => {
                    const each_array_1 = ensure_array_like(item.items);
                    $$payload5.out += `<!--[-->`;
                    for (let i = 0, $$length2 = each_array_1.length; i < $$length2; i++) {
                      let subItem = each_array_1[i];
                      $$payload5.out += `<!---->`;
                      Sidebar_menu_sub_item($$payload5, {
                        children: ($$payload6) => {
                          $$payload6.out += `<!---->`;
                          {
                            let child2 = function($$payload7, { props: props2 }) {
                              $$payload7.out += `<!---->`;
                              Provider($$payload7, {
                                children: ($$payload8) => {
                                  $$payload8.out += `<!---->`;
                                  Root$6($$payload8, {
                                    children: ($$payload9) => {
                                      $$payload9.out += `<!---->`;
                                      {
                                        let child3 = function($$payload10, { props: props3 }) {
                                          $$payload10.out += `<a${spread_attributes({ href: subItem.url, ...props3 }, null)}><span class="truncate font-sans font-medium tracking-wide">${escape_html(subItem.title)}</span> `;
                                          if (subItem.badge) {
                                            $$payload10.out += "<!--[-->";
                                            Badge($$payload10, {
                                              children: ($$payload11) => {
                                                $$payload11.out += `<!---->${escape_html(subItem.badge)}`;
                                              },
                                              $$slots: { default: true }
                                            });
                                          } else {
                                            $$payload10.out += "<!--[!-->";
                                          }
                                          $$payload10.out += `<!--]--></a>`;
                                        };
                                        Tooltip_trigger($$payload9, spread_props([props2, { child: child3, $$slots: { child: true } }]));
                                      }
                                      $$payload9.out += `<!----> <!---->`;
                                      Tooltip_content($$payload9, {
                                        children: ($$payload10) => {
                                          $$payload10.out += `<p>${escape_html(subItem.title)}</p>`;
                                        },
                                        $$slots: { default: true }
                                      });
                                      $$payload9.out += `<!---->`;
                                    },
                                    $$slots: { default: true }
                                  });
                                  $$payload8.out += `<!---->`;
                                }
                              });
                              $$payload7.out += `<!---->`;
                            };
                            Sidebar_menu_sub_button($$payload6, {
                              isActive: activeSubitems[i],
                              child: child2,
                              $$slots: { child: true }
                            });
                          }
                          $$payload6.out += `<!---->`;
                        },
                        $$slots: { default: true }
                      });
                      $$payload5.out += `<!---->`;
                    }
                    $$payload5.out += `<!--]-->`;
                  },
                  $$slots: { default: true }
                });
                $$payload4.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload3.out += `<!---->`;
          };
          Root$1($$payload2, {
            open: activeSubitems.indexOf(true) != -1,
            class: "group/collapsible",
            child,
            $$slots: { child: true }
          });
        }
        $$payload2.out += `<!---->`;
      }
      $$payload2.out += `<!--]-->`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!---->`;
  pop();
}
function IconXRegular($$payload, $$props) {
  let { class: class_ } = $$props;
  $$payload.out += `<svg${attr_class(clsx(class_))} data-phosphor-icon="x" aria-hidden="true" width="1em" height="1em" pointer-events="none" display="inline-block" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z"></path></svg>`;
}
function Tour($$payload, $$props) {
  push();
  let {
    open = true,
    items = [],
    side = "bottom",
    arrowClasses,
    class: className
  } = $$props;
  let current = 0;
  function getOpen() {
    return open;
  }
  function setOpen(newOpen) {
    open = newOpen;
  }
  const currentItem = items[current];
  const scrimStyle = (() => {
    if (!currentItem.target) return "";
    const boundingRect = currentItem.target.getBoundingClientRect();
    const left = boundingRect.left;
    const right = left + boundingRect.width;
    const top = boundingRect.top;
    const bottom = top + boundingRect.height;
    const { innerHeight, innerWidth } = window;
    return `
      clip-path: polygon(
        0px 0px,
        0px ${innerHeight}px,
        ${left}px ${innerHeight}px,
        ${left}px ${top}px,
        ${right}px ${top}px,
        ${right}px ${bottom}px,
        ${left}px ${bottom}px,
        ${left}px ${innerHeight}px,
        ${innerWidth}px ${innerHeight}px,
        ${innerWidth}px 0px
      );
    `;
  })();
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Root($$payload2, {
      children: ($$payload3) => {
        var bind_get = getOpen;
        var bind_set = setOpen;
        $$payload3.out += `<!---->`;
        Root($$payload3, {
          get open() {
            return bind_get();
          },
          set open($$value) {
            bind_set($$value);
          },
          children: ($$payload4) => {
            $$payload4.out += `<!---->`;
            Popover_content($$payload4, {
              class: className,
              collisionPadding: 20,
              customAnchor: currentItem.target,
              side: currentItem.side ?? side,
              interactOutsideBehavior: "ignore",
              children: ($$payload5) => {
                $$payload5.out += `<!---->`;
                Close($$payload5, {
                  class: "ring-offset-background focus:ring-ring float-right rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                  children: ($$payload6) => {
                    IconXRegular($$payload6, {});
                    $$payload6.out += `<!----> <span class="sr-only">Close</span>`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> <p class="text-sm leading-tight whitespace-pre-wrap">${escape_html(currentItem.text)}</p> <footer class="mt-2 flex">`;
                Button($$payload5, {
                  variant: "outline",
                  disabled: current <= 0,
                  onclick: () => {
                    current -= 1;
                  },
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Back`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> <span class="grow"></span> `;
                Button($$payload5, {
                  onclick: () => {
                    if (current + 1 >= items.length) {
                      open = false;
                      return;
                    }
                    current += 1;
                  },
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->${escape_html(current + 1 >= items.length ? "Done" : "Next")}`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----></footer> <!---->`;
                {
                  let child = function($$payload6, { props }) {
                    $$payload6.out += `<div${spread_attributes(
                      {
                        class: clsx(cn("bg-popover z-50 size-2.5 rotate-45 rounded-[2px] border-r border-b", "data-[side=top]:translate-x-1/2 data-[side=top]:translate-y-[calc(-50%_+_2px)]", "data-[side=bottom]:-translate-x-1/2 data-[side=bottom]:-translate-y-[calc(-50%_+_1px)]", "data-[side=right]:translate-x-[calc(50%_+_2px)] data-[side=right]:translate-y-1/2", "data-[side=left]:-translate-y-[calc(50%_-_3px)]", arrowClasses)),
                        ...props
                      },
                      null
                    )}></div>`;
                  };
                  Arrow($$payload5, { child, $$slots: { child: true } });
                }
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!----> `;
            if (open) {
              $$payload4.out += "<!--[-->";
              $$payload4.out += `<div class="fixed inset-0 z-50 bg-black/50 transition-[clip-path]"${attr_style(scrimStyle)}></div>`;
            } else {
              $$payload4.out += "<!--[!-->";
            }
            $$payload4.out += `<!--]-->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { open });
  pop();
}
function App_sidebar($$payload, $$props) {
  push();
  let sessCtx = sessionCtx.get();
  let tools2 = socketCtx.get();
  let conn = sessCtx.session;
  let connecting = false;
  let error = null;
  let tourOpen = false;
  let createSessionOpen = false;
  const refreshAgents = async () => {
    if (!sessCtx.connection) return;
    try {
      connecting = true;
      error = null;
      sessCtx.registry = null;
      const agents = await fetch(`http://${sessCtx.connection.host}/api/v1/registry`).then((res) => res.json());
      sessCtx.registry = Object.fromEntries(agents.map((agent) => [agent.id, agent]));
      const sessions = await fetch(`http://${sessCtx.connection.host}/api/v1/sessions`).then((res) => res.json());
      sessCtx.sessions = sessions;
      connecting = false;
    } catch (e) {
      connecting = false;
      sessCtx.registry = null;
      error = `${e}`;
    }
  };
  let serverSwitcher = null;
  let sessionSwitcher = null;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    Create_session($$payload2, {
      agents: sessCtx.registry ?? {},
      get open() {
        return createSessionOpen;
      },
      set open($$value) {
        createSessionOpen = $$value;
        $$settled = false;
      }
    });
    $$payload2.out += `<!----> `;
    Tour($$payload2, {
      open: tourOpen,
      items: [
        {
          target: serverSwitcher,
          side: "right",
          text: "Welcome to Coral Studio!\n\nFirst, connect to your server here."
        },
        {
          target: sessionSwitcher,
          side: "right",
          text: "Then, once connected:\n\nCreate or connect to a session here."
        }
      ]
    });
    $$payload2.out += `<!----> <!---->`;
    Sidebar($$payload2, {
      children: ($$payload3) => {
        $$payload3.out += `<!---->`;
        Sidebar_header($$payload3, {
          children: ($$payload4) => {
            Server_switcher($$payload4, {
              onSelect: (host) => {
                sessCtx.connection = {
                  host,
                  appId: sessCtx.connection?.appId ?? "app",
                  privacyKey: sessCtx.connection?.privacyKey ?? "priv"
                };
                refreshAgents();
              },
              get ref() {
                return serverSwitcher;
              },
              set ref($$value) {
                serverSwitcher = $$value;
                $$settled = false;
              }
            });
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----> <!---->`;
        Sidebar_content($$payload3, {
          class: "gap-0",
          children: ($$payload4) => {
            $$payload4.out += `<!---->`;
            Sidebar_group($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->`;
                Sidebar_group_label($$payload5, {
                  class: "text-sidebar-foreground flex flex-row gap-1 pr-0 text-sm",
                  children: ($$payload6) => {
                    $$payload6.out += `<span class="text-muted-foreground font-sans font-medium tracking-wide select-none">Server</span> <!---->`;
                    Provider($$payload6, {
                      children: ($$payload7) => {
                        $$payload7.out += `<!---->`;
                        Root$6($$payload7, {
                          children: ($$payload8) => {
                            $$payload8.out += `<!---->`;
                            Tooltip_trigger($$payload8, {
                              disabled: error === null,
                              class: "flex-grow text-right ",
                              children: ($$payload9) => {
                                $$payload9.out += `<span${attr_class(clsx(cn("text-muted-foreground font-mono text-xs font-normal", error && "text-destructive")))}>`;
                                if (error) {
                                  $$payload9.out += "<!--[-->";
                                  $$payload9.out += `Error`;
                                } else if (sessCtx.registry) {
                                  $$payload9.out += "<!--[1-->";
                                  $$payload9.out += `${escape_html(Object.keys(sessCtx.registry).length)} agents`;
                                } else {
                                  $$payload9.out += "<!--[!-->";
                                }
                                $$payload9.out += `<!--]--></span>`;
                              },
                              $$slots: { default: true }
                            });
                            $$payload8.out += `<!----> <!---->`;
                            Tooltip_content($$payload8, {
                              children: ($$payload9) => {
                                $$payload9.out += `<p>${escape_html(error)}</p>`;
                              },
                              $$slots: { default: true }
                            });
                            $$payload8.out += `<!---->`;
                          },
                          $$slots: { default: true }
                        });
                        $$payload7.out += `<!---->`;
                      }
                    });
                    $$payload6.out += `<!----> `;
                    Button($$payload6, {
                      size: "icon",
                      variant: "ghost",
                      class: "size-7",
                      disabled: connecting,
                      onclick: () => refreshAgents(),
                      children: ($$payload7) => {
                        IconArrowsClockwiseRegular($$payload7, {
                          class: cn("size-4", connecting && "animate-spin")
                        });
                      },
                      $$slots: { default: true }
                    });
                    $$payload6.out += `<!---->`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> <!---->`;
                Sidebar_group_content($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->`;
                    Sidebar_menu($$payload6, {
                      children: ($$payload7) => {
                        Sidebar_link($$payload7, {
                          url: "/registry",
                          icon: IconPackageRegular,
                          title: "Agent Registry"
                        });
                        $$payload7.out += `<!----> `;
                        Sidebar_link($$payload7, {
                          url: "/logs",
                          icon: IconNotepadRegular,
                          title: "Logs"
                        });
                        $$payload7.out += `<!---->`;
                      },
                      $$slots: { default: true }
                    });
                    $$payload6.out += `<!---->`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!----> <!---->`;
            Sidebar_separator($$payload4, {});
            $$payload4.out += `<!----> <!---->`;
            Sidebar_group($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->`;
                Sidebar_group_label($$payload5, {
                  class: "text-muted-foreground",
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Session`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> <!---->`;
                Root$4($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->`;
                    {
                      let child = function($$payload7, { props }) {
                        $$payload7.out += `<!---->`;
                        Sidebar_menu_button($$payload7, spread_props([
                          props,
                          {
                            "aria-invalid": sessCtx.session === null || !sessCtx.session.connected,
                            class: "border-input ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive m-[0.5px] mb-1 aria-invalid:ring",
                            get ref() {
                              return sessionSwitcher;
                            },
                            set ref($$value) {
                              sessionSwitcher = $$value;
                              $$settled = false;
                            },
                            children: ($$payload8) => {
                              $$payload8.out += `<span class="truncate">${escape_html(sessCtx.session && sessCtx.session.connected ? sessCtx.session.session : "Select Session")}</span> `;
                              IconCaretDownRegular($$payload8, { class: "ml-auto" });
                              $$payload8.out += `<!---->`;
                            },
                            $$slots: { default: true }
                          }
                        ]));
                        $$payload7.out += `<!---->`;
                      };
                      Dropdown_menu_trigger($$payload6, { child, $$slots: { child: true } });
                    }
                    $$payload6.out += `<!----> <!---->`;
                    Dropdown_menu_content($$payload6, {
                      class: "w-(--bits-dropdown-menu-anchor-width)",
                      children: ($$payload7) => {
                        if (sessCtx.sessions && sessCtx.sessions.length > 0) {
                          $$payload7.out += "<!--[-->";
                          const each_array = ensure_array_like(sessCtx.sessions);
                          $$payload7.out += `<!--[-->`;
                          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                            let session = each_array[$$index];
                            $$payload7.out += `<!---->`;
                            Dropdown_menu_item($$payload7, {
                              onSelect: () => {
                                if (!sessCtx.connection) return;
                                sessCtx.session = new Session({ ...sessCtx.connection, session });
                              },
                              children: ($$payload8) => {
                                $$payload8.out += `<span class="truncate">${escape_html(session)}</span>`;
                              },
                              $$slots: { default: true }
                            });
                            $$payload7.out += `<!---->`;
                          }
                          $$payload7.out += `<!--]--> <!---->`;
                          Dropdown_menu_separator($$payload7, {});
                          $$payload7.out += `<!---->`;
                        } else {
                          $$payload7.out += "<!--[!-->";
                        }
                        $$payload7.out += `<!--]--> <!---->`;
                        Dropdown_menu_item($$payload7, {
                          onclick: () => {
                            createSessionOpen = true;
                          },
                          children: ($$payload8) => {
                            $$payload8.out += `<span>New session</span>`;
                          },
                          $$slots: { default: true }
                        });
                        $$payload7.out += `<!---->`;
                      },
                      $$slots: { default: true }
                    });
                    $$payload6.out += `<!---->`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> `;
                Nav_bundle($$payload5, {
                  items: [
                    {
                      title: "Threads",
                      icon: IconChatsRegular,
                      sumBadges: true,
                      items: conn ? Object.values(conn.threads).map((thread) => ({
                        id: thread.id,
                        title: thread.name,
                        url: `/thread/${thread.id}`,
                        badge: thread.unread
                      })) : []
                    },
                    {
                      title: "Agents",
                      icon: IconRobotRegular,
                      items: conn ? Object.keys(conn.agents).map((item) => ({ title: item, url: `/agent/${item}` })) : []
                    },
                    {
                      title: "Tools",
                      icon: IconToolboxRegular,
                      sumBadges: true,
                      items: [
                        {
                          title: "User Input",
                          url: "/tools/user-input",
                          badge: Object.values(tools2.userInput.requests).filter((req) => req.userQuestion === void 0).length
                        }
                      ]
                    }
                  ]
                });
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!---->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----> <!---->`;
        Sidebar_footer($$payload3, {
          children: ($$payload4) => {
            $$payload4.out += `<!---->`;
            Sidebar_menu($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->`;
                Sidebar_menu_item($$payload5, {
                  class: "flex justify-end",
                  children: ($$payload6) => {
                    Button($$payload6, {
                      onclick: toggleMode,
                      variant: "outline",
                      size: "icon",
                      children: ($$payload7) => {
                        IconSunRegular($$payload7, {
                          class: "h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
                        });
                        $$payload7.out += `<!----> `;
                        IconMoonRegular($$payload7, {
                          class: "absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
                        });
                        $$payload7.out += `<!----> <span class="sr-only">Toggle theme</span>`;
                      },
                      $$slots: { default: true }
                    });
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!---->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----> <!---->`;
        Sidebar_rail($$payload3, {});
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
export {
  App_sidebar as A,
  Breadcrumb as B,
  Context as C,
  Chevron_down as D,
  ENTER as E,
  Scroll_area as F,
  Button as G,
  tick as H,
  IconCaretRightRegular as I,
  Icon as J,
  snapshot as K,
  afterNavigate as L,
  useDebounce$1 as M,
  Input as N,
  Chevron_right as O,
  Presence_layer as P,
  RovingFocusGroup as R,
  Sidebar_provider as S,
  Sidebar_inset as a,
  Sidebar_trigger as b,
  Separator as c,
  Breadcrumb_list as d,
  Breadcrumb_item as e,
  Breadcrumb_link as f,
  attachRef as g,
  SPACE as h,
  afterTick as i,
  createBitsAttrs as j,
  getDataDisabled as k,
  getDataOrientation as l,
  getDataOpenClosed as m,
  getAriaDisabled as n,
  getAriaExpanded as o,
  page as p,
  createId as q,
  noop as r,
  box as s,
  mergeProps as t,
  getAriaOrientation as u,
  getDisabled as v,
  watch as w,
  getAriaSelected as x,
  getHidden as y,
  cn as z
};
