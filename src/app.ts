import axios from "axios";
import { marked } from "marked";
import "./styles/main.less";
import { printStyleLog } from "./utils/util";

import { generateArticle2Xml } from "./convertor/xml";
import { ArticleStyleJson } from "./convertor/style";

window.onload = async () => {
  const source = await loadData("1.周纪/1-source.txt");
  const note = await loadData("1.周纪/1-note.txt");
  const translation = await loadData("1.周纪/1-translation.txt");
  const xml = generateArticle2Xml({
    source,
    note,
    translation,
  });
  const readMeHtml = marked(xml.xmlStr);
  console.log(xml.title);
  document.getElementById("article").innerHTML = readMeHtml;
};

function loadData(path: string) {
  path = path.replace(/\//g, ";");
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
