import Subject from "../utils/subject";
import log from "../utils/streamLog";
var sub=Subject();
var subMulticast=sub.multicast();
subMulticast.plug=sub.plug.bind(sub);
subMulticast.push=sub.push.bind(sub);
subMulticast.map(a => a.toJS()).observe(log("actionStream"));
export default subMulticast;