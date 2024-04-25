import Log from "../../../shared/log/Log"; // problem is up here i guess
import { PROTO_PREFIX, STRUCT_PREFIX } from "../../../shared/log/LogUtil";
import LoggableType from "../../../shared/log/LoggableType";
import CustomSchemas from "../schema/CustomSchemas";
import { open } from "rosbag";
// const { open } = require('rosbag');
self.onmessage = (event) => {
  // WORKER SETUP
  let { id, payload } = event.data;
  function resolve(result: any) {
    self.postMessage({ id: id, payload: result });
  }
  function progress(percent: number) {
    self.postMessage({ id: id, progress: percent });
  }
  function reject() {
    self.postMessage({ id: id });
  }

  // MAIN LOGIC
  
  // Run worker
  let log = new Log(false); // No timestamp set cache for efficiency
  console.log("Opening rosbag at path", payload[0])
  open(payload[0]).then((bag) => {
    console.log("Opened rosbag")
    bag.readMessages({ topics: ['/tf'] }, (result) => {
      // topic is the topic the data record was in
      // in this case it will be either '/foo' or '/bar'
      console.log(result.topic);

      // message is the parsed payload
      // this payload will likely differ based on the topic
      console.log(result.message);
    });
    resolve(log.toSerialized());
  })

  console.log("Running rosbag worker");
  
  progress(1);
  setTimeout(() => {
    // Allow progress message to get through first
    resolve(log.toSerialized());
  }, 0);
};
