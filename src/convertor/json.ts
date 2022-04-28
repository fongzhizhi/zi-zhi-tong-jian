import {
  ArticleClass,
  ArticleJson,
  ArticleParagraph,
  ArticleSource,
} from "./constants";
import { defayltClass } from "./style";

/**
 * 源文本转文章json格式
 */
export function source2Articlejson(opts: ArticleSource): ArticleJson {
  const json: ArticleJson = {
    paragraphs: {
      source: source2ArticleItems(opts.source),
      note: source2ArticleItems(opts.note),
      translation: source2ArticleItems(opts.translation, {
        defaultSentenceTag: "p",
      }),
    },
    class: Object.assign({}, defayltClass, opts.class),
    style: opts.style,
  };
  return json;
}

/**
 * 源文本转文章段集合
 * @param dataStr 源文本
 */
export function source2ArticleItems(
  dataStr: string,
  opt?: Partial<{
    defaultSentenceTag: string;
  }>
): ArticleParagraph[] {
  /**段分隔符 */
  const ParagraphSplit = "\n";
  /**段开始标记 */
  const ParagraphStart = "<";
  /**段结束标记 */
  const ParagraphEnd = ">";

  opt = opt || {};
  const dataArr = dataStr.split(ParagraphSplit);
  /**段合并标记 */
  let beginMerge = false;
  /**文章段结合 */
  const paragraphs: ArticleParagraph[] = [];

  /**文章段 */
  let paragraph: ArticleParagraph = [];
  dataArr.forEach((p) => {
    p = p.trim();
    if (!beginMerge && p.startsWith(ParagraphStart)) {
      p = p.substring(ParagraphStart.length);
      beginMerge = true;
    }
    // 段合并
    if (beginMerge) {
      beginMerge = !p.endsWith(ParagraphEnd);
      if (!beginMerge) {
        p = p.substring(0, p.length - ParagraphEnd.length - 1);
      }
      const pJson = paragraph2Json(p);
      if (isNoneParagraph(pJson)) {
        return;
      }
      pJson.forEach((s) => paragraph.push(s));
      paragraph[paragraph.length - 1];

      if (!beginMerge) {
        // 合并结束
        paragraphs.push(paragraph);
        paragraph = [];
      }
      return;
    }
    // 普通段读取
    paragraph = paragraph2Json(p, opt.defaultSentenceTag);
    if (isNoneParagraph(paragraph)) {
      return;
    }
    paragraphs.push(paragraph);
    paragraph = [];
  });
  return paragraphs;
}

/**
 * 段源码解析为文章段Json格式
 */
export function paragraph2Json(
  p: string,
  defaultSentenceTag = "span"
): ArticleParagraph {
  /**脚本起始符 */
  const scriptStart = "{";
  /**脚本结束符 */
  const scriptEnd = "}";

  const json: ArticleParagraph = [];

  /**记录配置信息 */
  let readScript = false;
  /**段中句文本 */
  let centenceText = "";
  for (const c of p) {
    if (c === scriptStart) {
      readScript = true;
      centenceText = centenceText.trim();
      centenceText &&
        json.push({
          text: centenceText,
          options: {
            tag: defaultSentenceTag,
          },
        });
      centenceText = "";
      continue;
    }
    if (readScript && c === scriptEnd) {
      // 提取配置信息
      try {
        const options = script2Json(centenceText);
        const len = json.length;
        const lastItem = len > 0 && json[len - 1];
        if (lastItem) {
          lastItem.options = Object.assign(lastItem.options, options);
        }
      } catch (e) {
        console.error(e);
      }
      readScript = false;
      centenceText = "";
      continue;
    }
    centenceText += c;
  }
  centenceText = centenceText.trim();
  centenceText &&
    json.push({
      text: centenceText,
      options: {
        tag: defaultSentenceTag,
      },
    });
  return json;

  function script2Json(script: string) {
    const json: {
      [k: string]: string | boolean;
    } = {};
    script.split(",").forEach((item) => {
      item = item.trim();
      if (!item) {
        return;
      }
      const itemArr = item.split(":");
      const key = itemArr[0].trim();
      const val = itemArr.length > 1 ? itemArr[1].trim() : true;
      json[key] = val;
    });
    return json;
  }
}

/**
 * 是否为空段
 * @description 有些段落无信息，只是为了占位
 */
function isNoneParagraph(p: ArticleParagraph) {
  let isNone = true;
  p.some((innerP) => {
    if (innerP.text) {
      isNone = false;
      return true;
    }
    return false;
  });
  return isNone;
}
