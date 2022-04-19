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
        title: '',
        paras: [],
        style: opts.style,
    };
    const source = source2ArticleItems(opts.source);
    return json;
}

/**
 * 源文本转文章段集合
 * @param dataStr 源文本
 */
export function source2ArticleItems(dataStr: string): ArticleParagraph[] {
    /**段分隔符 */
    const ParagraphSplit = '\r\n';
    /**段开始标记 */
    const ParagraphStart = '<';
    /**段结束标记 */
    const ParagraphEnd = '\>';

    const dataArr = dataStr.split(ParagraphSplit);
    let beginMerge = false; // 段合并标记
    let paragraphMerge: string[] = [];
    const paragraphs: ArticleParagraph[] = [];
    const merges: ArticleParagraph[] = [];
    let item: ArticleParagraph = null;
    dataArr.forEach(p => {
        if(!beginMerge && p.startsWith(ParagraphStart)) {
            p = p.substring(ParagraphStart.length);
            beginMerge = true;
        }
        // 段合并
        if(beginMerge) {
            paragraphMerge.push(p);
            beginMerge = !p.endsWith(ParagraphEnd);
            if(!beginMerge) {
                p = p.substring(0, p.length - ParagraphEnd.length);
            }
            item = paragraph2Json(p);
            merges.push({
                content: [item],
                options: {
                    newline: true,
                },
            });

            if(!beginMerge) {
                paragraphs.push({
                    content: merges,
                });
                merges.length = 0; 
            }
            return;
        }
        item = paragraph2Json(p);
        paragraphs.push({
            content: [item],
        });
    });
    return paragraphs;
}

/**
 * 段源码解析未段json格式
 */
export function paragraph2Json(p: string): ArticleParagraph {
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