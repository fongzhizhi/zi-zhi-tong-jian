import axios from "axios";
import { marked } from "marked";
import "./styles/main.less";
import { printStyleLog } from "./utils/util";
import { source2Articlejson } from "./build/ArticleJson";
import { ArticleJson2XML } from "./build/xml";

window.onload = async () => {
  const source = await loadData('1.周纪/1-source.txt');
  const note = await loadData('1.周纪/1-note.txt');
  const translation = await loadData('1.周纪/1-translation.txt');
  const json = source2Articlejson({
    source,
    note,
    translation,
    style: {
      $background: '#f44336',
      source: "color: #ff5722; font-size: 18px;",
      note: "color: #2196f3; font-size: 14px;",
      translation: "color: #25bb7f; font-size: 16px;",
    }
  });
  const xml = ArticleJson2XML(json);

  const readMeHtml = marked(xml.xmlStr);
  document.getElementById("article").innerHTML = readMeHtml;
};

function loadData(path: string) {
  path = path.replace(/\//g, ';')
  return new Promise<string>((resolce, reject) => {
    axios
    .get("http://localhost:3030/datas/" + path)
    .then((res) => {
      resolce(res && res.data || '');
    })
    .catch((err) => {
      reject(err);
      printStyleLog("Server Error", err);
    });
  });  
}