import axios from "axios";
import "./styles/main.less";
import { printStyleLog } from "./utils/util";

window.onload = async () => {
  const source = await loadData("1.周纪/1.html");
  document.getElementById("article").innerHTML = source;
};

/**读取datas目录下的文件 */
function loadData(path: string) {
  path = path.replace(/\//g, ";");
  console.log("loadData from", path);
  return new Promise<string>((resolce, reject) => {
    axios
      .get("http://localhost:3030/datas/" + path)
      .then((res) => {
        resolce((res && res.data) || "");
      })
      .catch((err) => {
        reject(err);
        printStyleLog("Server Error", err);
      });
  });
}
