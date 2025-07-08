import "clsx";
import { S as Sidebar_provider, A as App_sidebar, a as Sidebar_inset, b as Sidebar_trigger, c as Separator, B as Breadcrumb, d as Breadcrumb_list, e as Breadcrumb_item, f as Breadcrumb_link } from "../../../chunks/app-sidebar.js";
import { I as IconCraneRegular } from "../../../chunks/IconCraneRegular.js";
function _page($$payload) {
  Sidebar_provider($$payload, {
    children: ($$payload2) => {
      App_sidebar($$payload2);
      $$payload2.out += `<!----> `;
      Sidebar_inset($$payload2, {
        children: ($$payload3) => {
          $$payload3.out += `<header class="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">`;
          Sidebar_trigger($$payload3, { class: "-ml-1" });
          $$payload3.out += `<!----> `;
          Separator($$payload3, { orientation: "vertical", class: "mr-2 h-4" });
          $$payload3.out += `<!----> `;
          Breadcrumb($$payload3, {
            class: "flex-grow",
            children: ($$payload4) => {
              Breadcrumb_list($$payload4, {
                children: ($$payload5) => {
                  Breadcrumb_item($$payload5, {
                    class: "hidden md:block",
                    children: ($$payload6) => {
                      Breadcrumb_link($$payload6, {
                        children: ($$payload7) => {
                          $$payload7.out += `<!---->Agent Registry`;
                        },
                        $$slots: { default: true }
                      });
                    },
                    $$slots: { default: true }
                  });
                },
                $$slots: { default: true }
              });
            },
            $$slots: { default: true }
          });
          $$payload3.out += `<!----></header> <main class="flex grow flex-col items-center justify-center">`;
          IconCraneRegular($$payload3, { class: "size-14" });
          $$payload3.out += `<!----> <h2 class="text-xl">This page is under construction!</h2></main>`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!---->`;
    },
    $$slots: { default: true }
  });
}
export {
  _page as default
};
