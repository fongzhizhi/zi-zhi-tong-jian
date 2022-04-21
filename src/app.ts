import "./styles/main.less";
import { printStyleLog } from "./utils/util";
import axios from "axios";
import { marked } from "marked";
import { source2ArticleItems } from "./build/ArticleJson";
import { ArticleParagraph2XmlInfo } from "./build/xml";

window.onload = () => {
  loadReadme();
  window['toJson'] = function(pStr: string, toString?: boolean) {
    const AJson = source2ArticleItems(pStr);
    printStyleLog('ArticleJson', AJson);
    AJson.forEach(item => {
      const xmlInfo = ArticleParagraph2XmlInfo(item, toString);
      printStyleLog('XmlInfo', xmlInfo);
    })
  }
};

function loadReadme() {
  axios
    .get("http://localhost:3030/readme")
    .then((res) => {
      if (res && res.data) {
        const readMeHtml = marked(res.data);
        document.getElementById("readme").innerHTML = readMeHtml;
      }
    })
    .catch((err) => {
      printStyleLog("Server Error", err);
    });
}

function doSomething() {
  // print something
  printStyleLog(
    "Jinx",
    {
      name: "Jinx",
      age: 21,
    },
    {
      color: "#41b883",
    }
  );
}
