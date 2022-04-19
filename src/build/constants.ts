/**
 * 文章段配置
 */
export interface ArticleParagraphOptions {
    /**段类型 */
    type: string;
    /**段内注释 */
    '*': boolean;
    /**段注释 */
    '**': boolean;
    /**换行标记 */
    newline: boolean;
    /**附加类 */
    class: string;
    /**附加样式 */
    style: string;
}

/**
 * 文章段格式
 */
export interface ArticleParagraph {
    /**内容 */
    content: string[] | ArticleParagraph[];
    /**配置 */
    options?: Partial<ArticleParagraphOptions>;
}

/**
 * 文章样式表
 * @key 类名
 * @value css object
*/
export interface ArticleStyle {
    [className: string]: {[csskey: string]: string},
}

/**
 * 文章Json结构
 */
export interface ArticleJson {
    /**文章标题 */
    title: string;
    /**文章段集合 */
    paras: {
        /**原文 */
        source: ArticleParagraph,
        /**注解 */
        note: ArticleParagraph,
        /**译文 */
        trnslation: ArticleParagraph,
    }[];
    /**文章样式 */
    style?: ArticleStyle;
}