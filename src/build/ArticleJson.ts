import { ArticleJson, ArticleParagraph, ArticleStyle } from "./constants";

/**
 * 源文本转文章json格式
 */
export function source2Articlejson(opts: {
    /**原文源码 */
    source: string;
    /**注解源码 */
    note: string;
    /**译文源码 */
    translation: string;
    /**样式表 */
    style: ArticleStyle;
}): ArticleJson {
    const json: ArticleJson = {
        paragraphs: {
            source: source2ArticleItems(opts.source),
            note: source2ArticleItems(opts.note),
            translation: source2ArticleItems(opts.translation),
        },
        style: opts.style,
    };
    return json;
}

/**
 * 源文本转文章段集合
 * @param dataStr 源文本
 */
export function source2ArticleItems(dataStr: string): ArticleParagraph[] {
    /**段分隔符 */
    const ParagraphSplit = '\n';
    /**段开始标记 */
    const ParagraphStart = '<';
    /**段结束标记 */
    const ParagraphEnd = '\>';
    
    const dataArr = dataStr.split(ParagraphSplit);
    let beginMerge = false; // 段合并标记
    const paragraphs: ArticleParagraph[] = [];
    const merges: ArticleParagraph[] = [];
    let item: ArticleParagraph | string = null;
    dataArr.forEach(p => {
        if(!beginMerge && p.startsWith(ParagraphStart)) {
            p = p.substring(ParagraphStart.length);
            beginMerge = true;
        }
        // 开始段合并
        if(beginMerge) {
            beginMerge = !p.endsWith(ParagraphEnd);
            if(!beginMerge) {
                p = p.substring(0, p.length - ParagraphEnd.length - 1);
            }
            item = paragraph2Json(p);
            merges.push({
                content: [item],
                options: {
                    newline: true,
                },
            });

            if(!beginMerge) {
                // 结束合并
                paragraphs.push({
                    content: [...merges],
                });
                merges.length = 0;
            }
            return;
        }
        item = paragraph2Json(p);
        if(typeof item === 'string') {
            paragraphs.push({
                content: [item],
            });
        } else {
            paragraphs.push(item);
        }
    });
    return paragraphs;
}

/**
 * 段源码解析为文章段json格式
 */
export function paragraph2Json(p: string): ArticleParagraph | string {
    /** */
    const scriptStart = '{';
    const scriptEnd = '}';
    
    const json: ArticleParagraph = {
        content: [],
    }
    
    let readScript = false; // 记录配置信息标记
    let item = '';
    for(const c of p) {
        if(c === scriptStart) {
            readScript = true;
            if(item) {
                (json.content as ArticleParagraph[]).push({
                    content: [item],
                });
            }
            item = '';
            continue;
        }
        if(readScript && c === scriptEnd) {
            // 提取配置信息
            try {
                const options = script2Json(item);
                const len = json.content.length;
                const lastItem = len > 0 && json.content[len - 1];
                if(lastItem && typeof lastItem != 'string') {
                    lastItem.options = options;
                }
            } catch (e) {
                console.error(e);
            }
            readScript = false;
            item = '';
            continue;
        }
        item += c;
    }
    if(item) {
        (json.content as string[]).push(item);
    }
    if(!json.options && json.content.length === 1) {
        return json.content.pop();
    }
    return json;

    function script2Json(script: string) {
        const json: {
            [k: string]: string | boolean;
        } = {};
        script.split(',').forEach(item => {
            item = item.trim();
            if(!item) {
                return;
            }
            const itemArr = item.split(':');
            const key = itemArr[0].trim();
            const val = itemArr.length > 1 ? itemArr[1].trim() : true;
            json[key] = val;
        });
        return json;
    }
}