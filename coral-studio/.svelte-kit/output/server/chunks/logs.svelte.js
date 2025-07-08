import "clsx";
import { C as Context } from "./threads.js";
class AgentLogs {
  socket;
  connected = false;
  logs = [];
  constructor({ host, appId, privacyKey, session }, agentId) {
    this.socket = new WebSocket(`http://${host}/debug/${appId}/${privacyKey}/${session}/${agentId}/logs`);
    this.socket.onopen = () => {
      this.connected = true;
    };
    this.socket.onerror = () => {
      this.connected = false;
      this.socket.close();
    };
    this.socket.onclose = (e) => {
      this.logs = [];
      this.connected = false;
    };
    this.socket.onmessage = (ev) => {
      let data = null;
      try {
        data = JSON.parse(ev.data);
      } catch (e) {
        console.log("??", e);
        return;
      }
      data && this.logs.push(data);
    };
  }
}
const logContext = new Context("agentLogs");
export {
  AgentLogs as A,
  logContext as l
};
