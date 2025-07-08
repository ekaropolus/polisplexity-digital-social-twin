import { q as spread_attributes, l as clsx, x as bind_props, e as pop, p as push } from "./index.js";
import { z as cn, O as Chevron_right } from "./app-sidebar.js";
function Breadcrumb_separator($$payload, $$props) {
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
      "data-slot": "breadcrumb-separator",
      role: "presentation",
      "aria-hidden": "true",
      class: clsx(cn("[&>svg]:size-3.5", className)),
      ...restProps
    },
    null
  )}>`;
  if (children) {
    $$payload.out += "<!--[-->";
    children?.($$payload);
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    Chevron_right($$payload, {});
  }
  $$payload.out += `<!--]--></li>`;
  bind_props($$props, { ref });
  pop();
}
function Breadcrumb_page($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<span${spread_attributes(
    {
      "data-slot": "breadcrumb-page",
      role: "link",
      "aria-disabled": "true",
      "aria-current": "page",
      class: clsx(cn("text-foreground font-normal", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></span>`;
  bind_props($$props, { ref });
  pop();
}
export {
  Breadcrumb_separator as B,
  Breadcrumb_page as a
};
