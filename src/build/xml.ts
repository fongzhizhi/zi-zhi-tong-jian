import { ArticleJson, ArticleParagraph, ParagraphSentence, SentenceOption, XmlInfo } from "./constants";

/**
 * 文章json格式转xml格式
 * @param json 文章json
 * @param opts 参数
 */
export function ArticleJson2XML(json: ArticleJson, opts?: Partial<{
    /**忽略样式 */
    ignoreStyle: true,   
}>): {
    /**文章名 */
    title: string,
    /**xml源码 */
    xmlStr: string,
} {
    opts = opts || {};
    const paragraphs = json.paragraphs;
    const articleClass = json.class;
    const {source, note, translation} = paragraphs;    
    const sourceSentenceClass = articleClass.sourceSentence;
    const noteSentenceClass = articleClass.noteSentence;
    const sourceAndNoteParagraphClass = [sourceSentenceClass, noteSentenceClass].join('-');
    const translationSentenceClass= articleClass.translationSentence;
    const articleStyle = opts.ignoreStyle ? {} : json.style || {};
    
    let title = '';
    let xmlStr = '';
    // 以原文为蓝本
    source.forEach((sourceParagraph, pIndex) => {
        const noteParagraph = note[pIndex] || [];
        let noteSentenceIndex = 0;
        const translationParagraph = translation[pIndex] || [];

        // 原文 + 注解合并
        let sourceAndNoteStr = '';
        sourceParagraph.forEach((sourceSentence) => {
            const isTitle = isTitleType(sourceSentence.options.tag) || sourceSentence.options.tag.startsWith('h');
            if(!title && ['#', 'h1'].includes(sourceSentence.options.tag)) {
                title = sourceSentence.text;
            }
            // 原文段中句
            const sourceStr = paragraphSentence2Xml(sourceSentence, isTitle ? sourceSentenceClass + ' ' + 'title': sourceSentenceClass, isTitle ? '' : articleStyle[sourceSentenceClass]);
            // 注解段中句
            const noteStr = paragraphSentence2Xml(noteParagraph[noteSentenceIndex++], noteSentenceClass, articleStyle[noteSentenceClass]);
            // 合并
            sourceAndNoteStr += sourceStr + noteStr;
        });
        sourceAndNoteStr = getTagHtml({
            tag: 'div',
            class: sourceAndNoteParagraphClass,
            text: sourceAndNoteStr,
        }) as string;
        // 译文
        let translationStr = '';
        translationParagraph.forEach((translationSentence) => {
            // 译文段中句
            translationStr += paragraphSentence2Xml(translationSentence, translationSentenceClass, articleStyle[translationSentenceClass]);
        });
        translationStr = getTagHtml({
            tag: 'div',
            class: translationSentenceClass,
            text: translationStr,
        });

        // 三段合并
        xmlStr += getTagHtml({
            tag: 'div',
            text: sourceAndNoteStr + translationStr,
            class: articleClass.merge,
            style: articleStyle[articleClass.merge],
        });
    });
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
        return opt.text ? `<${opt.tag} ${getClassStr(opt.extendClass, opt?.options?.class, true)} ${getStyleStr(opt?.options?.style)}>${opt.text}</${opt.tag}>` : '';
    }
}

/**
 * 段中句转xml
 */
function paragraphSentence2Xml(s: ParagraphSentence, extendClass?: string, extendStyle?: string): string {
    if(!s) {
        return '';
    }
    const {text, options} = s;
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
    const classSplit = ' ';
    const base = (baseClass || '').split(classSplit);
    const extend = (extendClass || '').split(classSplit);
    const classArr = [];
    base.concat(extend).forEach(item => {
        item && !classArr.includes(item) && classArr.push(item);
    });
    const classStr = classArr.join(classSplit);
    return htmlStr && classStr ? `class="${classStr}"` : classStr;
}

/**获取style文本 */
function getStyleStr(baseStyle: string, extendStyle?: string, htmlStr = false) {
    const styleSplit = ';';
    const obj: {[k: string]: string;} = {};
    const base = (baseStyle || '').split(styleSplit);
    const extend = (extendStyle || '').split(styleSplit);
    base.concat(extend).forEach(item => {
        const styleItem = item.split(':');
        const k = styleItem[0].trim();
        if(!k) {
            return;
        }
        obj[k] = (styleItem[1] || '').trim();
    });
    const srtleArr: string[] = [];
    for(const k in obj) {
        srtleArr.push([k, obj[k]].join(': '));
    }
    const styleStr = srtleArr.join(styleSplit);
    return htmlStr && styleStr ? `style="${styleStr}"` : styleStr;
}

/**
 * 判断标签类型是否为标题
 * @param type string
 */
function isTitleType(type: string) {
    return type && !type.replace(/\#/g, '');
}

/**获取标签拼接源码 */
function getTagHtml(opt: {
    tag: string,
    text: string;
    class?: string,
    style?: string,
}): string {
    const isTitle = isTitleType(opt.tag);
    let pre = '';
    let tag = '';
    if(isTitle) {
        tag = 'h' + opt.tag.length;
    } else {
        tag = opt.tag || 'div';
    }
    pre = `<${tag}`;
    if(opt.class) {
        pre += ` class="${opt.class}"`;
    }
    if(opt.style) {
        pre += ` style="${opt.style}"`;
    }
    pre += '>';
    const suffix = `</${tag}>`;
    // 占位
    if(opt.text === '""') {
        opt.text = '';
    }
    return opt.text ? pre + opt.text + suffix : '';
}