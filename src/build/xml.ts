import { ArticleJson, ArticleParagraph, ArticleParagraphOptions, XmlInfo } from "./constants";

/**
 * 文章json转markdown源码
 * @param json 文章json对象
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
    const { paragraphs } = json;
    const style = opts.ignoreStyle ? null : json.style;
    const {source, note, translation} = paragraphs;
    opts = opts || {};
    
    let title = '';
    let xmlStr = '';
    source.forEach((sourceItem, index) => {
        const noteItem = note[index];
        const translationItem = translation[index];

        const content = sourceItem.content;
        const options = sourceItem.options;
        if(!title && options && options.tag === '#') {
            title = content[0].toString();
        }

        // 段落内容：原文 + 注解 + 译文
        const sourceInfo = ArticleParagraph2XmlInfo(sourceItem) as XmlInfo;
        const noteInfo = ArticleParagraph2XmlInfo(noteItem) as XmlInfo;
        const translationInfo = ArticleParagraph2XmlInfo(translationItem) as XmlInfo;
        if(!sourceInfo) {
            return;
        }
        // 原文和注解的拼接
        const sourceOptionIndexMap = sourceInfo.optionIndexMap || [];
        const noteInfoOptionIndexMap = noteInfo.optionIndexMap || [];
        let sourceAndNoteStr = '';
        sourceInfo.arr.forEach((source_one, oneIndex) => {
            const sourceOption = sourceOptionIndexMap[oneIndex];
            const noteOption = noteInfoOptionIndexMap[oneIndex];
            const note_one = noteInfo && noteInfo.arr[oneIndex];
            const sourceTag = sourceOption && sourceOption.newline ? 'p' : 'span';
            const source_str = getHtmlStr({
                text: source_one,
                tag: sourceTag,
                extendClass: 'source',
                options: sourceOption,
            });
            const noteTag = sourceOption && sourceOption["**"] ? 'p' : 'span';
            const note_str = getHtmlStr({
                text: note_one,
                tag: noteTag,
                extendClass: 'note',
                options: noteOption,
            });
            sourceAndNoteStr += source_str;
            sourceAndNoteStr += note_str;
        });
        if(!sourceInfo.pType.pre) {
            sourceInfo.pType = getPType(sourceItem.options, 'div');
        }
        sourceAndNoteStr = sourceInfo.pType.pre + sourceAndNoteStr + sourceInfo.pType.suffix;
        // 译文
        let translationStr = '';
        translationInfo.arr.forEach((tran_one, index) => {
            const tranOption = sourceOptionIndexMap[index];
            const tranTag = tranOption && tranOption.newline ? 'p' : 'span';
            translationStr += getHtmlStr({
                text: tran_one,
                tag: tranTag,
                extendClass: 'translation',
                options: tranOption,
            });
        });
        if(!translationInfo.pType.pre) {
            translationInfo.pType = getPType(sourceItem.options, 'div');
        }
        translationStr = translationInfo.pType.pre + sourceAndNoteStr + translationInfo.pType.suffix;
        // 三文聚合
        const mergeType = getPType({
            class: 'merge'
        }, 'div');
        xmlStr += mergeType.pre + sourceAndNoteStr + translationStr + mergeType.suffix;
    });
    return {
        title,
        xmlStr,
    };

    function getHtmlStr(opt: {
        text: string;
        tag: string;
        extendClass: string;
        options?: Partial<ArticleParagraphOptions>;
    }) {
        return opt.text ? `<${opt.tag} ${getClassStr(opt.extendClass, opt?.options?.class, true)} ${getStyleStr(opt?.options?.style)}>${opt.text}</${opt.tag}>` : '';
    }
}

function getClassStr(baseClass: string, extendClass?: string, htmlStr = false) {
    const classStr = (baseClass || '' + ' ' + extendClass || '').trim()
    return htmlStr && classStr ? `class=${classStr}` : classStr;
}

function getStyleStr(style: string, extendStyle?: string, htmlStr = false) {
    const split = style.endsWith(';') ? '' : ';';
    const styleStr = (style + split + extendStyle || '').trim()
    return htmlStr && styleStr ? `style=${styleStr}` : styleStr;
}

/**
 * 判断段类型是否为标题
 * @param type string
 */
function isTitleType(type: string) {
    return type && !type.replace(/\#/g, '');
}

/**获取段前缀后缀 */
function getPType(opt?: Partial<ArticleParagraphOptions>, defaultTag?: string): {
    pre: string;
    suffix: string;
} {
    opt = opt || {};
    const isTitle = isTitleType(opt.tag);
    if(isTitle && !opt.class && !opt.style) {
        return {
            pre: opt.tag + ' ',
            suffix: '',
        };
    }
    let pre = '';
    let tag = '';
    if(isTitle) {
        tag = 'h' + opt.tag.length;
    } else {
        tag = opt.tag || defaultTag;
    }
    if(!tag) {
        return {
            pre,
            suffix: '',
        };
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
    return {
        pre,
        suffix,
    };
}

/**
 * 段json转换(不包含样式)
 */
export function ArticleParagraph2XmlInfo(p: ArticleParagraph, toString = false, inner = false): string | XmlInfo {
    if(!p) {
        return '';
    }
    const pType = getPType(p.options, '');
    const arr: string[] = [];
    const optionIndexMap: Partial<ArticleParagraphOptions>[] = [];
    p.content.forEach((item: ArticleParagraph | string) => {
        if(typeof item === 'string') {
            arr.push(item);
        } else {
            const itemStr = ArticleParagraph2XmlInfo(item, true, true) as string;
            arr.push(itemStr);
            optionIndexMap.push(item.options);
        }
    });
    if(toString) {
        let pStr = arr.join(' ');
        return pStr ? pType.pre + pStr + pType.suffix : '';
    }
    return {
        pType,
        arr,
        optionIndexMap,
    };
}