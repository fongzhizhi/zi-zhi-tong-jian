import { source2Articlejson } from "./json";
import {
  ArticleClass,
  ArticleJson,
  ArticleSource,
  ArticleStyle,
  ParagraphSentence,
  SentenceOption,
  XMLConfig,
} from "./constants";
import { ArticleStyleJson, styleId } from "./style";

/**
 * 文章json格式转xml格式
 * @param json 文章json
 * @param opts 参数
 */
export function ArticleJson2XML(
  json: ArticleJson,
  opts?: Partial<XMLConfig>
): {
  /**文章名 */
  title: string;
  /**xml源码 */
  xmlStr: string;
} {
  opts = opts || {};
  const paragraphs = json.paragraphs;
  const articleClass = json.class;
  const { source, note, translation } = paragraphs;
  const sourceSentenceClass = articleClass.sourceSentence;
  const noteSentenceClass = articleClass.noteSentence;
  const sourceAndNoteParagraphClass = [
    sourceSentenceClass,
    noteSentenceClass,
  ].join("-");
  const translationSentenceClass = articleClass.translationSentence;
  if (!json.style) {
    json.style = ArticleStyleJson.default;
  }
  const articleStyle: ArticleStyle = !opts.innerStyle ? {} : json.style || {};

  let title = "";
  let xmlStr = "";
  let cls = "";
  // 以原文为蓝本
  source.forEach((sourceParagraph, pIndex) => {
    const noteParagraph = note[pIndex] || [];
    let noteSentenceIndex = 0;
    const translationParagraph = translation[pIndex] || [];

    // 原文 + 注解合并
    let sourceAndNoteStr = "";
    let isTitle = false;
    sourceParagraph.forEach((sourceSentence) => {
      isTitle =
        isTitleType(sourceSentence.options.tag) ||
        sourceSentence.options.tag.startsWith("h");
      if (!title && ["#", "h1"].includes(sourceSentence.options.tag)) {
        title = sourceSentence.text;
      }
      // 原文段中句
      const sourceStr = paragraphSentence2Xml(
        sourceSentence,
        isTitle ? "title" : sourceSentenceClass,
        isTitle ? "" : articleStyle.source || articleStyle[sourceSentenceClass]
      );
      // 注解段中句
      const noteStr = paragraphSentence2Xml(
        noteParagraph[noteSentenceIndex++],
        noteSentenceClass,
        articleStyle.note || articleStyle[noteSentenceClass]
      );
      // 合并
      sourceAndNoteStr += sourceStr + noteStr;
    });
    sourceAndNoteStr = getTagHtml({
      tag: "div",
      class: isTitle
        ? "title-" + sourceAndNoteParagraphClass
        : sourceAndNoteParagraphClass,
      text: sourceAndNoteStr,
    }) as string;
    // 译文
    let translationStr = "";
    translationParagraph.forEach((translationSentence) => {
      // 译文段中句
      translationStr += paragraphSentence2Xml(
        translationSentence,
        translationSentenceClass,
        articleStyle.translation || articleStyle[translationSentenceClass]
      );
    });
    translationStr = getTagHtml({
      tag: "div",
      class: translationSentenceClass,
      text: translationStr,
    });

    // 三段合并
    cls = isTitle ? "title-" + articleClass.merge : articleClass.merge;
    xmlStr += getTagHtml({
      tag: "div",
      text: sourceAndNoteStr + translationStr,
      class: cls,
      style: articleStyle[cls],
    });
  });

  cls = articleClass.article;
  xmlStr = getTagHtml({
    tag: "div",
    text: xmlStr,
    class: cls,
    style: articleStyle[cls],
  });

  // style样式
  if (!opts.innerStyle) {
    const style: {
      [className: string]: string;
    } = Object.assign({}, json.style);
    xmlStr = style2Xml(style) + xmlStr;
  }

  return {
    title,
    xmlStr,
  };

  function getHtmlStr(opt: {
    text: string;
    tag: string;
    extendClass: string;
    options?: Partial<SentenceOption>;
  }) {
    return opt.text
      ? `<${opt.tag} ${getClassStr(
          opt.extendClass,
          opt?.options?.class,
          true
        )} ${getStyleStr(opt?.options?.style)}>${opt.text}</${opt.tag}>`
      : "";
  }
}

/**
 * 生成 xml 格式文章
 */
export function generateArticle2Xml(
  opts: ArticleSource,
  xmlConfig?: Partial<XMLConfig>
) {
  const articleJson = source2Articlejson(opts);
  const xml = ArticleJson2XML(articleJson, xmlConfig);
  return xml;
}

/**
 * 段中句转xml
 */
function paragraphSentence2Xml(
  s: ParagraphSentence,
  extendClass?: string,
  extendStyle?: string
): string {
  if (!s) {
    return "";
  }
  const { text, options } = s;
  const classStr = getClassStr(options.class, extendClass);
  const styleStr = getStyleStr(options.style, extendStyle);
  return getTagHtml({
    tag: options.tag,
    class: classStr,
    style: styleStr,
    text,
  });
}

/**获取class文本 */
function getClassStr(baseClass: string, extendClass?: string, htmlStr = false) {
  const classSplit = " ";
  const base = (baseClass || "").split(classSplit);
  const extend = (extendClass || "").split(classSplit);
  const classArr = [];
  base.concat(extend).forEach((item) => {
    item && !classArr.includes(item) && classArr.push(item);
  });
  const classStr = classArr.join(classSplit);
  return htmlStr && classStr ? `class="${classStr}"` : classStr;
}

/**获取style文本 */
function getStyleStr(baseStyle: string, extendStyle?: string, htmlStr = false) {
  const styleSplit = ";";
  const obj: { [k: string]: string } = {};
  const base = (baseStyle || "").split(styleSplit);
  const extend = (extendStyle || "").split(styleSplit);
  base.concat(extend).forEach((item) => {
    const styleItem = item.split(":");
    const k = styleItem[0].trim();
    if (!k) {
      return;
    }
    obj[k] = (styleItem[1] || "").trim();
  });
  const srtleArr: string[] = [];
  for (const k in obj) {
    srtleArr.push([k, obj[k]].join(": "));
  }
  const styleStr = srtleArr.join(styleSplit);
  return htmlStr && styleStr ? `style="${styleStr}"` : styleStr;
}

/**
 * 判断标签类型是否为标题
 * @param type string
 */
function isTitleType(type: string) {
  return type && !type.replace(/\#/g, "");
}

/**获取标签拼接源码 */
function getTagHtml(opt: {
  tag: string;
  text: string;
  class?: string;
  style?: string;
  attrs?: { [attrName: string]: string };
}): string {
  const isTitle = isTitleType(opt.tag);
  let pre = "";
  let tag = "";
  if (isTitle) {
    tag = "h" + opt.tag.length;
  } else {
    tag = opt.tag || "div";
  }
  pre = `<${tag}`;
  if (opt.class) {
    pre += ` class="${opt.class}"`;
  }
  if (opt.style) {
    pre += ` style="${opt.style}"`;
  }
  if (opt.attrs) {
    for (let k in opt.attrs) {
      const v = opt.attrs[k];
      pre += ` ${k}="${v}"`;
    }
  }
  pre += ">";
  const suffix = `</${tag}>`;
  // 占位
  if (opt.text === '""') {
    opt.text = "";
  }
  return opt.text ? pre + opt.text + suffix : "";
}

/**
 * style样式表源码
 */
function style2Xml(style: { [className: string]: string }) {
  style = style || {};
  let styleXml = "";
  for (const className in style) {
    const cssStr = style[className];
    styleXml += `.${className}{${cssStr}}`;
  }
  return getTagHtml({
    tag: "style",
    text: styleXml,
    attrs: { id: styleId },
  });
}
