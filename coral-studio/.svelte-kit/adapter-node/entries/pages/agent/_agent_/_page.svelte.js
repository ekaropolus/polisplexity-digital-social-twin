import { v as derived, p as push, w as props_id, q as spread_attributes, x as bind_props, e as pop, y as copy_payload, z as assign_payload, m as spread_props, j as attr_class, l as clsx, o as ensure_array_like, n as escape_html } from "../../../../chunks/index.js";
import { C as Context, g as attachRef, h as SPACE, E as ENTER, w as watch, i as afterTick, R as RovingFocusGroup, j as createBitsAttrs, k as getDataDisabled, l as getDataOrientation, m as getDataOpenClosed, n as getAriaDisabled, o as getAriaExpanded, q as createId, r as noop, s as box, t as mergeProps, P as Presence_layer, u as getAriaOrientation, v as getDisabled, x as getAriaSelected, y as getHidden, z as cn, D as Chevron_down, F as Scroll_area, p as page, S as Sidebar_provider, A as App_sidebar, a as Sidebar_inset, b as Sidebar_trigger, c as Separator, B as Breadcrumb, d as Breadcrumb_list, e as Breadcrumb_item, f as Breadcrumb_link, I as IconCaretRightRegular, G as Button } from "../../../../chunks/app-sidebar.js";
import "clsx";
import { B as Breadcrumb_separator, a as Breadcrumb_page } from "../../../../chunks/breadcrumb-page.js";
import "style-to-object";
import { n as SvelteMap, i as sessionCtx } from "../../../../chunks/threads.js";
import { l as logContext } from "../../../../chunks/logs.svelte.js";
const accordionAttrs = createBitsAttrs({
  component: "accordion",
  parts: [
    "root",
    "trigger",
    "content",
    "item",
    "header"
  ]
});
const AccordionRootContext = new Context("Accordion.Root");
const AccordionItemContext = new Context("Accordion.Item");
class AccordionBaseState {
  opts;
  rovingFocusGroup;
  attachment;
  constructor(opts) {
    this.opts = opts;
    this.rovingFocusGroup = new RovingFocusGroup({
      rootNode: this.opts.ref,
      candidateAttr: accordionAttrs.trigger,
      loop: this.opts.loop,
      orientation: this.opts.orientation
    });
    this.attachment = attachRef(this.opts.ref);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    "data-orientation": getDataOrientation(this.opts.orientation.current),
    "data-disabled": getDataDisabled(this.opts.disabled.current),
    [accordionAttrs.root]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class AccordionSingleState extends AccordionBaseState {
  opts;
  isMulti = false;
  constructor(opts) {
    super(opts);
    this.opts = opts;
    this.includesItem = this.includesItem.bind(this);
    this.toggleItem = this.toggleItem.bind(this);
  }
  includesItem(item) {
    return this.opts.value.current === item;
  }
  toggleItem(item) {
    this.opts.value.current = this.includesItem(item) ? "" : item;
  }
}
class AccordionMultiState extends AccordionBaseState {
  #value;
  isMulti = true;
  constructor(props) {
    super(props);
    this.#value = props.value;
    this.includesItem = this.includesItem.bind(this);
    this.toggleItem = this.toggleItem.bind(this);
  }
  includesItem(item) {
    return this.#value.current.includes(item);
  }
  toggleItem(item) {
    this.#value.current = this.includesItem(item) ? this.#value.current.filter((v) => v !== item) : [...this.#value.current, item];
  }
}
class AccordionRootState {
  static create(props) {
    const { type, ...rest } = props;
    const rootState = type === "single" ? new AccordionSingleState(rest) : new AccordionMultiState(rest);
    return AccordionRootContext.set(rootState);
  }
}
class AccordionItemState {
  static create(props) {
    return AccordionItemContext.set(new AccordionItemState({
      ...props,
      rootState: AccordionRootContext.get()
    }));
  }
  opts;
  root;
  #isActive = derived(() => this.root.includesItem(this.opts.value.current));
  get isActive() {
    return this.#isActive();
  }
  set isActive($$value) {
    return this.#isActive($$value);
  }
  #isDisabled = derived(() => this.opts.disabled.current || this.root.opts.disabled.current);
  get isDisabled() {
    return this.#isDisabled();
  }
  set isDisabled($$value) {
    return this.#isDisabled($$value);
  }
  attachment;
  constructor(opts) {
    this.opts = opts;
    this.root = opts.rootState;
    this.updateValue = this.updateValue.bind(this);
    this.attachment = attachRef(this.opts.ref);
  }
  updateValue() {
    this.root.toggleItem(this.opts.value.current);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    "data-state": getDataOpenClosed(this.isActive),
    "data-disabled": getDataDisabled(this.isDisabled),
    "data-orientation": getDataOrientation(this.root.opts.orientation.current),
    [accordionAttrs.item]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class AccordionTriggerState {
  opts;
  itemState;
  #root;
  #isDisabled = derived(() => this.opts.disabled.current || this.itemState.opts.disabled.current || this.#root.opts.disabled.current);
  attachment;
  constructor(opts, itemState) {
    this.opts = opts;
    this.itemState = itemState;
    this.#root = itemState.root;
    this.onclick = this.onclick.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
    this.attachment = attachRef(this.opts.ref);
  }
  static create(props) {
    return new AccordionTriggerState(props, AccordionItemContext.get());
  }
  onclick(e) {
    if (this.#isDisabled() || e.button !== 0) {
      e.preventDefault();
      return;
    }
    this.itemState.updateValue();
  }
  onkeydown(e) {
    if (this.#isDisabled()) return;
    if (e.key === SPACE || e.key === ENTER) {
      e.preventDefault();
      this.itemState.updateValue();
      return;
    }
    this.#root.rovingFocusGroup.handleKeydown(this.opts.ref.current, e);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    disabled: this.#isDisabled(),
    "aria-expanded": getAriaExpanded(this.itemState.isActive),
    "aria-disabled": getAriaDisabled(this.#isDisabled()),
    "data-disabled": getDataDisabled(this.#isDisabled()),
    "data-state": getDataOpenClosed(this.itemState.isActive),
    "data-orientation": getDataOrientation(this.#root.opts.orientation.current),
    [accordionAttrs.trigger]: "",
    tabindex: 0,
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
class AccordionContentState {
  opts;
  item;
  attachment;
  #originalStyles = void 0;
  #isMountAnimationPrevented = false;
  #dimensions = { width: 0, height: 0 };
  #open = derived(() => this.opts.forceMount.current || this.item.isActive);
  get open() {
    return this.#open();
  }
  set open($$value) {
    return this.#open($$value);
  }
  constructor(opts, item) {
    this.opts = opts;
    this.item = item;
    this.#isMountAnimationPrevented = this.item.isActive;
    this.attachment = attachRef(this.opts.ref);
    watch([() => this.open, () => this.opts.ref.current], this.#updateDimensions);
  }
  static create(props) {
    return new AccordionContentState(props, AccordionItemContext.get());
  }
  #updateDimensions = ([_, node]) => {
    if (!node) return;
    afterTick(() => {
      const element = this.opts.ref.current;
      if (!element) return;
      this.#originalStyles ??= {
        transitionDuration: element.style.transitionDuration,
        animationName: element.style.animationName
      };
      element.style.transitionDuration = "0s";
      element.style.animationName = "none";
      const rect = element.getBoundingClientRect();
      this.#dimensions = { width: rect.width, height: rect.height };
      if (!this.#isMountAnimationPrevented && this.#originalStyles) {
        element.style.transitionDuration = this.#originalStyles.transitionDuration;
        element.style.animationName = this.#originalStyles.animationName;
      }
    });
  };
  #snippetProps = derived(() => ({ open: this.item.isActive }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    "data-state": getDataOpenClosed(this.item.isActive),
    "data-disabled": getDataDisabled(this.item.isDisabled),
    "data-orientation": getDataOrientation(this.item.root.opts.orientation.current),
    [accordionAttrs.content]: "",
    style: {
      "--bits-accordion-content-height": `${this.#dimensions.height}px`,
      "--bits-accordion-content-width": `${this.#dimensions.width}px`
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
class AccordionHeaderState {
  opts;
  item;
  attachment;
  constructor(opts, item) {
    this.opts = opts;
    this.item = item;
    this.attachment = attachRef(this.opts.ref);
  }
  static create(props) {
    return new AccordionHeaderState(props, AccordionItemContext.get());
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: "heading",
    "aria-level": this.opts.level.current,
    "data-heading-level": this.opts.level.current,
    "data-state": getDataOpenClosed(this.item.isActive),
    "data-orientation": getDataOrientation(this.item.root.opts.orientation.current),
    [accordionAttrs.header]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Accordion$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    disabled = false,
    children,
    child,
    type,
    value = void 0,
    ref = null,
    id = createId(uid),
    onValueChange = noop,
    loop = true,
    orientation = "vertical",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  function handleDefaultValue() {
    if (value !== void 0) return;
    value = type === "single" ? "" : [];
  }
  handleDefaultValue();
  watch.pre(() => value, () => {
    handleDefaultValue();
  });
  const rootState = AccordionRootState.create({
    type,
    value: box.with(() => value, (v) => {
      value = v;
      onValueChange(v);
    }),
    id: box.with(() => id),
    disabled: box.with(() => disabled),
    loop: box.with(() => loop),
    orientation: box.with(() => orientation),
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
  bind_props($$props, { value, ref });
  pop();
}
function Accordion_item$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  const defaultId = createId(uid);
  let {
    id = defaultId,
    disabled = false,
    value = defaultId,
    children,
    child,
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const itemState = AccordionItemState.create({
    value: box.with(() => value),
    disabled: box.with(() => disabled),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
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
function Accordion_header($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    level = 2,
    children,
    child,
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const headerState = AccordionHeaderState.create({
    id: box.with(() => id),
    level: box.with(() => level),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, headerState.props);
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
function Accordion_trigger$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    disabled = false,
    ref = null,
    id = createId(uid),
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = AccordionTriggerState.create({
    disabled: box.with(() => disabled),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, triggerState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes({ type: "button", ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Accordion_content$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    child,
    ref = null,
    id = createId(uid),
    forceMount = false,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = AccordionContentState.create({
    forceMount: box.with(() => forceMount),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  {
    let presence = function($$payload2, { present }) {
      const mergedProps = mergeProps(restProps, contentState.props, { hidden: forceMount ? void 0 : !present });
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, {
          props: mergedProps,
          ...contentState.snippetProps
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
      open: contentState.open,
      ref: contentState.opts.ref,
      presence
    });
  }
  bind_props($$props, { ref });
  pop();
}
const tabsAttrs = createBitsAttrs({
  component: "tabs",
  parts: ["root", "list", "trigger", "content"]
});
const TabsRootContext = new Context("Tabs.Root");
class TabsRootState {
  static create(opts) {
    return TabsRootContext.set(new TabsRootState(opts));
  }
  opts;
  attachment;
  rovingFocusGroup;
  triggerIds = [];
  // holds the trigger ID for each value to associate it with the content
  valueToTriggerId = new SvelteMap();
  // holds the content ID for each value to associate it with the trigger
  valueToContentId = new SvelteMap();
  constructor(opts) {
    this.opts = opts;
    this.attachment = attachRef(opts.ref);
    this.rovingFocusGroup = new RovingFocusGroup({
      candidateAttr: tabsAttrs.trigger,
      rootNode: this.opts.ref,
      loop: this.opts.loop,
      orientation: this.opts.orientation
    });
  }
  registerTrigger(id, value) {
    this.triggerIds.push(id);
    this.valueToTriggerId.set(value, id);
    return () => {
      this.triggerIds = this.triggerIds.filter((triggerId) => triggerId !== id);
      this.valueToTriggerId.delete(value);
    };
  }
  registerContent(id, value) {
    this.valueToContentId.set(value, id);
    return () => {
      this.valueToContentId.delete(value);
    };
  }
  setValue(v) {
    this.opts.value.current = v;
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    "data-orientation": getDataOrientation(this.opts.orientation.current),
    [tabsAttrs.root]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class TabsListState {
  static create(opts) {
    return new TabsListState(opts, TabsRootContext.get());
  }
  opts;
  root;
  attachment;
  #isDisabled = derived(() => this.root.opts.disabled.current);
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(opts.ref);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: "tablist",
    "aria-orientation": getAriaOrientation(this.root.opts.orientation.current),
    "data-orientation": getDataOrientation(this.root.opts.orientation.current),
    [tabsAttrs.list]: "",
    "data-disabled": getDataDisabled(this.#isDisabled()),
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class TabsTriggerState {
  static create(opts) {
    return new TabsTriggerState(opts, TabsRootContext.get());
  }
  opts;
  root;
  attachment;
  #tabIndex = 0;
  #isActive = derived(() => this.root.opts.value.current === this.opts.value.current);
  #isDisabled = derived(() => this.opts.disabled.current || this.root.opts.disabled.current);
  #ariaControls = derived(() => this.root.valueToContentId.get(this.opts.value.current));
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(opts.ref);
    watch(
      [
        () => this.opts.id.current,
        () => this.opts.value.current
      ],
      ([id, value]) => {
        return this.root.registerTrigger(id, value);
      }
    );
    this.onfocus = this.onfocus.bind(this);
    this.onclick = this.onclick.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
  }
  #activate() {
    if (this.root.opts.value.current === this.opts.value.current) return;
    this.root.setValue(this.opts.value.current);
  }
  onfocus(_) {
    if (this.root.opts.activationMode.current !== "automatic" || this.#isDisabled()) return;
    this.#activate();
  }
  onclick(_) {
    if (this.#isDisabled()) return;
    this.#activate();
  }
  onkeydown(e) {
    if (this.#isDisabled()) return;
    if (e.key === SPACE || e.key === ENTER) {
      e.preventDefault();
      this.#activate();
      return;
    }
    this.root.rovingFocusGroup.handleKeydown(this.opts.ref.current, e);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: "tab",
    "data-state": getTabDataState(this.#isActive()),
    "data-value": this.opts.value.current,
    "data-orientation": getDataOrientation(this.root.opts.orientation.current),
    "data-disabled": getDataDisabled(this.#isDisabled()),
    "aria-selected": getAriaSelected(this.#isActive()),
    "aria-controls": this.#ariaControls(),
    [tabsAttrs.trigger]: "",
    disabled: getDisabled(this.#isDisabled()),
    tabindex: this.#tabIndex,
    //
    onclick: this.onclick,
    onfocus: this.onfocus,
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
class TabsContentState {
  static create(opts) {
    return new TabsContentState(opts, TabsRootContext.get());
  }
  opts;
  root;
  attachment;
  #isActive = derived(() => this.root.opts.value.current === this.opts.value.current);
  #ariaLabelledBy = derived(() => this.root.valueToTriggerId.get(this.opts.value.current));
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(opts.ref);
    watch(
      [
        () => this.opts.id.current,
        () => this.opts.value.current
      ],
      ([id, value]) => {
        return this.root.registerContent(id, value);
      }
    );
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: "tabpanel",
    hidden: getHidden(!this.#isActive()),
    tabindex: 0,
    "data-value": this.opts.value.current,
    "data-state": getTabDataState(this.#isActive()),
    "aria-labelledby": this.#ariaLabelledBy(),
    "data-orientation": getDataOrientation(this.root.opts.orientation.current),
    [tabsAttrs.content]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function getTabDataState(condition) {
  return condition ? "active" : "inactive";
}
function Tabs$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    value = "",
    onValueChange = noop,
    orientation = "horizontal",
    loop = true,
    activationMode = "automatic",
    disabled = false,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = TabsRootState.create({
    id: box.with(() => id),
    value: box.with(() => value, (v) => {
      value = v;
      onValueChange(v);
    }),
    orientation: box.with(() => orientation),
    loop: box.with(() => loop),
    activationMode: box.with(() => activationMode),
    disabled: box.with(() => disabled),
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
  bind_props($$props, { ref, value });
  pop();
}
function Tabs_content$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    children,
    child,
    id = createId(uid),
    ref = null,
    value,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = TabsContentState.create({
    value: box.with(() => value),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, contentState.props);
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
function Tabs_list$1($$payload, $$props) {
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
  const listState = TabsListState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, listState.props);
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
function Tabs_trigger$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    child,
    children,
    disabled = false,
    id = createId(uid),
    type = "button",
    value,
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = TabsTriggerState.create({
    id: box.with(() => id),
    disabled: box.with(() => disabled ?? false),
    value: box.with(() => value),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, triggerState.props, { type });
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
function Tabs($$payload, $$props) {
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
    Tabs$1($$payload2, spread_props([
      {
        "data-slot": "tabs",
        class: cn("flex flex-col gap-2", className)
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
function Tabs_content($$payload, $$props) {
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
    Tabs_content$1($$payload2, spread_props([
      {
        "data-slot": "tabs-content",
        class: cn("flex-1 outline-none", className)
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
function Tabs_list($$payload, $$props) {
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
    Tabs_list$1($$payload2, spread_props([
      {
        "data-slot": "tabs-list",
        class: cn("bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]", className)
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
function Tabs_trigger($$payload, $$props) {
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
    Tabs_trigger$1($$payload2, spread_props([
      {
        "data-slot": "tabs-trigger",
        class: cn("data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-2 py-1 text-sm font-medium transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)
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
function Accordion($$payload, $$props) {
  push();
  let {
    ref = null,
    value = void 0,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Accordion$1($$payload2, spread_props([
      { "data-slot": "accordion" },
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
function Accordion_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Accordion_content$1($$payload2, spread_props([
      {
        "data-slot": "accordion-content",
        class: "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
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
          $$payload3.out += `<div${attr_class(clsx(cn("pb-4 pt-0", className)))}>`;
          children?.($$payload3);
          $$payload3.out += `<!----></div>`;
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
function Accordion_item($$payload, $$props) {
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
    Accordion_item$1($$payload2, spread_props([
      {
        "data-slot": "accordion-item",
        class: cn("border-b last:border-b-0", className)
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
function Accordion_trigger($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    level = 3,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Accordion_header($$payload2, {
      level,
      class: "flex",
      children: ($$payload3) => {
        $$payload3.out += `<!---->`;
        Accordion_trigger$1($$payload3, spread_props([
          {
            "data-slot": "accordion-trigger",
            class: cn("focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium outline-none transition-all hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180", className)
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
              $$payload4.out += `<!----> `;
              Chevron_down($$payload4, {
                class: "text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200"
              });
              $$payload4.out += `<!---->`;
            },
            $$slots: { default: true }
          }
        ]));
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
  bind_props($$props, { ref });
  pop();
}
function IconArrowsOutRegular($$payload, $$props) {
  let { class: class_ } = $$props;
  $$payload.out += `<svg${attr_class(clsx(class_))} data-phosphor-icon="arrows-out" aria-hidden="true" width="1em" height="1em" pointer-events="none" display="inline-block" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M216 48v48a8 8 0 0 1-16 0V67.31l-42.34 42.35a8 8 0 0 1-11.32-11.32L188.69 56H160a8 8 0 0 1 0-16h48a8 8 0 0 1 8 8M98.34 146.34 56 188.69V160a8 8 0 0 0-16 0v48a8 8 0 0 0 8 8h48a8 8 0 0 0 0-16H67.31l42.35-42.34a8 8 0 0 0-11.32-11.32M208 152a8 8 0 0 0-8 8v28.69l-42.34-42.35a8 8 0 0 0-11.32 11.32L188.69 200H160a8 8 0 0 0 0 16h48a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8M67.31 56H96a8 8 0 0 0 0-16H48a8 8 0 0 0-8 8v48a8 8 0 0 0 16 0V67.31l42.34 42.35a8 8 0 0 0 11.32-11.32Z"></path></svg>`;
}
function Logs($$payload, $$props) {
  push();
  let { logs, class: className } = $$props;
  const ts_fmt = (d) => `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  Scroll_area($$payload, {
    class: className,
    children: ($$payload2) => {
      const each_array = ensure_array_like(logs);
      $$payload2.out += `<ul class="min-h-0 text-sm"><!--[-->`;
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let log = each_array[$$index];
        const timestamp = log.timestamp ? new Date(log.timestamp) : null;
        $$payload2.out += `<li${attr_class(clsx(cn("flex flex-row gap-x-2", "hover:bg-primary/10 rounded-sm px-1 ", log.kind === "STDERR" ? "text-destructive" : "")))}><span class="opacity-40">${escape_html(timestamp ? ts_fmt(timestamp) : "")}</span><span>${escape_html(log.message)}</span></li>`;
      }
      $$payload2.out += `<!--]--></ul>`;
    },
    $$slots: { default: true }
  });
  pop();
}
function _page($$payload, $$props) {
  push();
  let ctx = sessionCtx.get();
  let logCtx = logContext.get();
  let conn = ctx.session;
  let threads = conn?.threads ?? {};
  let agents = conn?.agents ?? {};
  let agentName = page.params["agent"];
  let agent = agents[agentName];
  let memberThreads = Object.values(threads).filter((thread) => thread.participants.indexOf(agentName) !== -1);
  let logs = logCtx.logs[agentName];
  $$payload.out += `<!---->`;
  Sidebar_provider($$payload, {
    children: ($$payload2) => {
      App_sidebar($$payload2);
      $$payload2.out += `<!----> <!---->`;
      Sidebar_inset($$payload2, {
        children: ($$payload3) => {
          $$payload3.out += `<header class="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4"><!---->`;
          Sidebar_trigger($$payload3, { class: "-ml-1" });
          $$payload3.out += `<!----> `;
          Separator($$payload3, { orientation: "vertical", class: "mr-2 h-4" });
          $$payload3.out += `<!----> <!---->`;
          Breadcrumb($$payload3, {
            class: "flex-grow",
            children: ($$payload4) => {
              $$payload4.out += `<!---->`;
              Breadcrumb_list($$payload4, {
                children: ($$payload5) => {
                  $$payload5.out += `<!---->`;
                  Breadcrumb_item($$payload5, {
                    class: "hidden md:block",
                    children: ($$payload6) => {
                      $$payload6.out += `<!---->`;
                      Breadcrumb_link($$payload6, {
                        children: ($$payload7) => {
                          $$payload7.out += `<!---->Agents`;
                        },
                        $$slots: { default: true }
                      });
                      $$payload6.out += `<!---->`;
                    },
                    $$slots: { default: true }
                  });
                  $$payload5.out += `<!----> <!---->`;
                  Breadcrumb_separator($$payload5, { class: "hidden md:block" });
                  $$payload5.out += `<!----> <!---->`;
                  Breadcrumb_item($$payload5, {
                    children: ($$payload6) => {
                      $$payload6.out += `<!---->`;
                      Breadcrumb_page($$payload6, {
                        children: ($$payload7) => {
                          $$payload7.out += `<!---->${escape_html(page.params["agent"] ?? "")} ${escape_html(agent?.agentType ?? "")}`;
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
          $$payload3.out += `<!----></header> `;
          if (agent !== void 0) {
            $$payload3.out += "<!--[-->";
            $$payload3.out += `<main class="h-full p-4"><!---->`;
            Tabs($$payload3, {
              value: "main",
              class: "h-full",
              children: ($$payload4) => {
                $$payload4.out += `<!---->`;
                Tabs_list($$payload4, {
                  children: ($$payload5) => {
                    $$payload5.out += `<!---->`;
                    Tabs_trigger($$payload5, {
                      value: "main",
                      children: ($$payload6) => {
                        $$payload6.out += `<!---->Overview`;
                      },
                      $$slots: { default: true }
                    });
                    $$payload5.out += `<!----> <!---->`;
                    Tabs_trigger($$payload5, {
                      value: "logs",
                      children: ($$payload6) => {
                        $$payload6.out += `<!---->Logs`;
                      },
                      $$slots: { default: true }
                    });
                    $$payload5.out += `<!---->`;
                  },
                  $$slots: { default: true }
                });
                $$payload4.out += `<!----> <!---->`;
                Tabs_content($$payload4, {
                  value: "main",
                  children: ($$payload5) => {
                    $$payload5.out += `<h1 class="text-3xl font-bold">${escape_html(agentName)}</h1> <!---->`;
                    Accordion($$payload5, {
                      type: "single",
                      class: "w-full sm:max-w-[70%]",
                      value: "threads",
                      children: ($$payload6) => {
                        $$payload6.out += `<!---->`;
                        Accordion_item($$payload6, {
                          value: "threads",
                          children: ($$payload7) => {
                            $$payload7.out += `<!---->`;
                            Accordion_trigger($$payload7, {
                              children: ($$payload8) => {
                                $$payload8.out += `<!---->Threads`;
                              },
                              $$slots: { default: true }
                            });
                            $$payload7.out += `<!----> <!---->`;
                            Accordion_content($$payload7, {
                              class: "flex flex-col gap-4 text-balance",
                              children: ($$payload8) => {
                                const each_array = ensure_array_like(memberThreads);
                                $$payload8.out += `<ul class="pl-4">`;
                                if (memberThreads.length === 0) {
                                  $$payload8.out += "<!--[-->";
                                  $$payload8.out += `<li class="text-muted-foreground text-sm">Not a member of any threads.</li>`;
                                } else {
                                  $$payload8.out += "<!--[!-->";
                                }
                                $$payload8.out += `<!--]--> <!--[-->`;
                                for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
                                  let thread = each_array[$$index_1];
                                  const each_array_1 = ensure_array_like(thread.participants);
                                  $$payload8.out += `<li class="flex items-center">`;
                                  IconCaretRightRegular($$payload8, { class: "size-4" });
                                  $$payload8.out += `<!----> `;
                                  Button($$payload8, {
                                    variant: "link",
                                    href: `/thread/${thread.id}`,
                                    class: "font-bold",
                                    children: ($$payload9) => {
                                      $$payload9.out += `<!---->${escape_html(thread.name)}`;
                                      IconArrowsOutRegular($$payload9, { class: "size-3" });
                                      $$payload9.out += `<!---->`;
                                    },
                                    $$slots: { default: true }
                                  });
                                  $$payload8.out += `<!----> <span>with: <!--[-->`;
                                  for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
                                    let part = each_array_1[$$index];
                                    if (part !== agentName) {
                                      $$payload8.out += "<!--[-->";
                                      Button($$payload8, {
                                        variant: "link",
                                        href: `/agent/${part}`,
                                        class: "m-0 px-2",
                                        children: ($$payload9) => {
                                          $$payload9.out += `<!---->${escape_html(part)}`;
                                        },
                                        $$slots: { default: true }
                                      });
                                    } else {
                                      $$payload8.out += "<!--[!-->";
                                    }
                                    $$payload8.out += `<!--]-->`;
                                  }
                                  $$payload8.out += `<!--]--></span></li>`;
                                }
                                $$payload8.out += `<!--]--></ul>`;
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
                    $$payload5.out += `<!---->`;
                  },
                  $$slots: { default: true }
                });
                $$payload4.out += `<!----> <!---->`;
                Tabs_content($$payload4, {
                  value: "logs",
                  class: "h-full min-h-0 basis-0",
                  children: ($$payload5) => {
                    Logs($$payload5, {
                      logs: logs?.logs ?? [],
                      class: "h-full max-h-full"
                    });
                  },
                  $$slots: { default: true }
                });
                $$payload4.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload3.out += `<!----></main>`;
          } else {
            $$payload3.out += "<!--[!-->";
            $$payload3.out += `<p class="text-muted-foreground mt-4 text-center text-sm">Agent not found.</p>`;
          }
          $$payload3.out += `<!--]-->`;
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
export {
  _page as default
};
