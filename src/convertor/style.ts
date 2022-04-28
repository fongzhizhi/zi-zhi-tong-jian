import { ArticleClass, ArticleStyle } from "./constants";

/**默认类名表 */
export const defayltClass: ArticleClass = {
  article: "article",
  merge: "merge",
  sourceSentence: "source",
  noteSentence: "note",
  translationSentence: "translation",
};

/**文章样式集合 */
export const ArticleStyleJson: {
  /**默认样式 */
  default: ArticleStyle;
  [k: string]: ArticleStyle;
} = {
  default: {
    article:
      "background-color: #f1f1f1; margin: 20px; padding: 20px; padding-top: 0; border: solid 1px #d8d8d8;",
    merge: "text-indent: 2em;",
    source: "color: #ff1a09; font-size: 16px;",
    note: "color: #03a9f4; font-size: 14px;",
    translation: "color: #25bb7f; font-size: 15px;",
  },
};

/**style标签Id */
export const styleId = "article-style";
