/**
 * 文章Json结构
 */
 export interface ArticleJson {
    /**文章段集合 */
    paragraphs: {
        /**原文 */
        source: ArticleParagraph[],
        /**注解 */
        note: ArticleParagraph[],
        /**译文 */
        translation: ArticleParagraph[],
    };
    /**文章类名表 */
    class: ArticleClass,
    /**文章样式 */
    style?: ArticleStyle;
}

/**
 * 文章段格式
 */
export type ArticleParagraph = ParagraphSentence[];

/**段中句 */
export interface ParagraphSentence {
    /**文本 */
    text: string;
    /**参数 */
    options: SentenceOption;
}

/**
 * 段中句参数
 */
export interface SentenceOption {
    /**标签名 */
    tag: string;
    /**附加类 */
    class?: string;
    /**附加样式 */
    style?: string;
}

/**
 * 文章类名表
 */
export interface ArticleClass {
    /**段合并类名 */
    merge: string;
    /**原文段中句类名 */
    sourceSentence: string;
    /**注解段中句类名 */
    noteSentence: string;
    /**译文段中句类名 */
    translationSentence: string;
}
/**
 * 文章样式表
 * @key 类名
 * @value css object
*/
export interface ArticleStyle {
    /**背景色 */
    $background: string;
    /**类名 - 样式 */
    [className: string]: string;
}

export interface XmlInfo {
    pType: {
        /**段前缀 */
        pre: string;
        /**段后缀 */
        suffix: string;
    };
    /**段分割内容 */
    arr: string[];
    /**段分割附带选项 */
    optionIndexMap?: Partial<SentenceOption>[];
}