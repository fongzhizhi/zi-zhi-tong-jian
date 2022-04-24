import { ArticleStyle } from "./constants";

/**文章样式集合 */
export const ArticleStyleJson: {
  /**默认样式 */
  default: ArticleStyle;
  [k: string]: ArticleStyle;
} = {
  default: {
    $background: "#f9f9f9",
    source: "color: #ff5722; font-size: 18px;",
    note: "color: #2196f3; font-size: 14px;",
    translation: "color: #25bb7f; font-size: 16px;",
  },
};
