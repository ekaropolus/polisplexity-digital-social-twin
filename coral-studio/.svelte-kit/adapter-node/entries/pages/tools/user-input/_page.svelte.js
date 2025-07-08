import { y as copy_payload, z as assign_payload, e as pop, p as push, o as ensure_array_like, n as escape_html } from "../../../../chunks/index.js";
import { C as Card, a as Card_header, b as Card_content } from "../../../../chunks/card-header.js";
import "clsx";
import { S as Sidebar_provider, A as App_sidebar, a as Sidebar_inset, b as Sidebar_trigger, c as Separator, B as Breadcrumb, d as Breadcrumb_list, e as Breadcrumb_item, f as Breadcrumb_link, N as Input } from "../../../../chunks/app-sidebar.js";
import { B as Breadcrumb_separator, a as Breadcrumb_page } from "../../../../chunks/breadcrumb-page.js";
import { k as socketCtx } from "../../../../chunks/threads.js";
function _page($$payload, $$props) {
  push();
  let ctx = socketCtx.get();
  let userQuestions = {};
  let requests = Object.values(ctx.userInput.requests ?? {});
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Sidebar_provider($$payload2, {
      children: ($$payload3) => {
        App_sidebar($$payload3);
        $$payload3.out += `<!----> <!---->`;
        Sidebar_inset($$payload3, {
          children: ($$payload4) => {
            const each_array = ensure_array_like(requests);
            $$payload4.out += `<header class="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4"><!---->`;
            Sidebar_trigger($$payload4, { class: "-ml-1" });
            $$payload4.out += `<!----> `;
            Separator($$payload4, { orientation: "vertical", class: "mr-2 h-4" });
            $$payload4.out += `<!----> <!---->`;
            Breadcrumb($$payload4, {
              class: "flex-grow",
              children: ($$payload5) => {
                $$payload5.out += `<!---->`;
                Breadcrumb_list($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->`;
                    Breadcrumb_item($$payload6, {
                      class: "hidden md:block",
                      children: ($$payload7) => {
                        $$payload7.out += `<!---->`;
                        Breadcrumb_link($$payload7, {
                          children: ($$payload8) => {
                            $$payload8.out += `<!---->Tools`;
                          },
                          $$slots: { default: true }
                        });
                        $$payload7.out += `<!---->`;
                      },
                      $$slots: { default: true }
                    });
                    $$payload6.out += `<!----> <!---->`;
                    Breadcrumb_separator($$payload6, { class: "hidden md:block" });
                    $$payload6.out += `<!----> <!---->`;
                    Breadcrumb_item($$payload6, {
                      children: ($$payload7) => {
                        $$payload7.out += `<!---->`;
                        Breadcrumb_page($$payload7, {
                          children: ($$payload8) => {
                            $$payload8.out += `<!---->User Input Tool`;
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
            $$payload4.out += `<!----></header> <main class="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 lg:grid-cols-3">`;
            if (requests.length == 0) {
              $$payload4.out += "<!--[-->";
              $$payload4.out += `<p class="text-muted-foreground col-span-full text-center text-sm">No requests yet.</p>`;
            } else {
              $$payload4.out += "<!--[!-->";
            }
            $$payload4.out += `<!--]--> <!--[-->`;
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let request = each_array[$$index];
              $$payload4.out += `<!---->`;
              Card($$payload4, {
                children: ($$payload5) => {
                  $$payload5.out += `<!---->`;
                  Card_header($$payload5, {
                    children: ($$payload6) => {
                      $$payload6.out += `<h2 class="text-muted-foreground text-sm">${escape_html(request.sessionId)}</h2> <h1>'${escape_html(request.agentId)}' asks:</h1> <q>${escape_html(request.agentRequest)}</q>`;
                    },
                    $$slots: { default: true }
                  });
                  $$payload5.out += `<!----> <!---->`;
                  Card_content($$payload5, {
                    children: ($$payload6) => {
                      Input($$payload6, {
                        disabled: request.userQuestion !== void 0,
                        placeholder: "Enter your reply.",
                        onkeydown: (e) => {
                          if (e.key != "Enter") return;
                          ctx.userInput.respond(request.id, userQuestions[request.id]);
                        },
                        get value() {
                          return userQuestions[request.id];
                        },
                        set value($$value) {
                          userQuestions[request.id] = $$value;
                          $$settled = false;
                        }
                      });
                      $$payload6.out += `<!----> <p>${escape_html(request.agentAnswer)}</p>`;
                    },
                    $$slots: { default: true }
                  });
                  $$payload5.out += `<!---->`;
                },
                $$slots: { default: true }
              });
              $$payload4.out += `<!---->`;
            }
            $$payload4.out += `<!--]--></main>`;
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
export {
  _page as default
};
