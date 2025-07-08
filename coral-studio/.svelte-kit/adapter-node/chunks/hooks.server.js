import { io } from "socket.io-client";
let questions = {};
const toolCalls = {
  "user-input-request": ({ sessionId, agentId, getSock, body }) => {
    const sock = getSock();
    const id = crypto.randomUUID();
    const q = {
      id,
      sessionId,
      agentId,
      agentRequest: body?.message,
      userQuestion: void 0,
      agentAnswer: void 0
    };
    questions[`${sessionId}-${agentId}`] = q;
    sock.emit("agent_request", q);
    return new Promise((res) => {
      sock.on("user_response", ({ id: resId, value }) => {
        questions[`${sessionId}-${agentId}`].userQuestion = value;
        console.log("user_response", { id, resId, value });
        if (resId !== id) return;
        res(new Response(value));
      });
    });
  },
  "user-input-respond": ({ sessionId, agentId, getSock, body }) => {
    const q = questions[`${sessionId}-${agentId}`];
    if (!q)
      return new Response(
        "Cannot respond to the last question, since no user question has been asked!",
        {
          status: 404
        }
      );
    q.agentAnswer = body?.response;
    const sock = getSock();
    sock.emit("agent_answer", { id: q.id, answer: q.agentAnswer });
    return new Response(q.agentAnswer);
  }
};
const handle$1 = async ({ event }) => {
  const [tool, sessionId, agentId, ...extra] = event.url.pathname.split("/").slice(3).reduce((acc, part) => part.length > 0 ? [...acc, part] : acc, []);
  console.log({ tool, sessionId, agentId, extra });
  const body = await event.request.json().catch((err) => null);
  if (!tool || !sessionId || !agentId || extra.length > 0)
    return new Response("Not found", { status: 404 });
  if (!(tool in toolCalls)) return new Response(`Tool '${tool}' not found.`, { status: 404 });
  const getSock = () => {
    return io(`${event.url.origin}/socket.io/${tool}`, {
      auth: { secret: globalThis.socketSecret, tool }
    });
  };
  return toolCalls[tool]({ event, sessionId, agentId, getSock, body });
};
const handle = async (params) => {
  const { event, resolve } = params;
  if (event.url.pathname.startsWith("/api/mcp-tools/")) {
    return handle$1(params);
  }
  const response = await resolve(event);
  return response;
};
export {
  handle
};
