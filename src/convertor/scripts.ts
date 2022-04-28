import { ArticleClass } from "./constants";

export function pageAction() {}

/**dom选择器 */
function $$$(selectors: string, scope?: Element) {
  return (scope || document).querySelector(selectors);
}

/**dom选择器 */
function $$$All(selectors: string, scope?: Element) {
  return (scope || document).querySelectorAll(selectors);
}

/**
 * 类选择器
 */
function classSelector(className: string, tag?: string) {
  return (tag || "") + "." + className;
}

/**文章DOM选择器 */
class ArticleSelector {
  /**文章选择器 */
  private _scope: Element;
  /**文章类名表 */
  private _class: ArticleClass;

  constructor(articleClass: ArticleClass, scope?: Element | string) {
    this._class = articleClass;
    if (scope) {
      this._scope = typeof scope === "string" ? $$$(scope) : scope;
    }
  }

  /**查询单个元素 */
  query(className: string, tag?: string) {
    return $$$(classSelector(className, tag), this._scope);
  }

  /**查询所有元素 */
  queryAll(className: string, tag?: string) {
    return $$$All(classSelector(className, tag), this._scope);
  }

  /**
   * 查询合并段
   * @description 原文、注解和译文的合并段
   */
  queryParagraphs() {
    return this.queryAll(this._class.merge);
  }

  /**查询标题 */
  queryTitles() {
    return this.queryAll("title");
  }

  /**查询原文 */
  querySources() {
    return this.queryAll(this._class.sourceSentence);
  }

  /**查询注解 */
  queryNotes() {
    return this.queryAll(this._class.noteSentence);
  }

  /**查询译文 */
  queryTranslations() {
    return this.queryAll(this._class.translationSentence, "div");
  }
}
