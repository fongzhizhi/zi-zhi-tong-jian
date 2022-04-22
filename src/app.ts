import "./styles/main.less";
import { printStyleLog } from "./utils/util";
import axios from "axios";
import { marked } from "marked";
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
  });
  printStyleLog('ArticleJson', json);
  const xml = ArticleJson2XML(json);
  printStyleLog('xml', xml.xmlStr);

  const readMeHtml = marked(xml.xmlStr);
  document.getElementById("readme").innerHTML = readMeHtml;
};

function loadReadme() {
  axios
    .get("http://localhost:3030/datas/1.周纪;1-source.txt")
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