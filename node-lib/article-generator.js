const fs = require('fs');
const path = require('path');
const { generateArticle2Xml } = require('../dist/lib.umd.js');

/**是否使用行内样式 */
const innerStyle = false;

/**
 * 生成 markdown 格式文章
 * @param {ArticleSource} source
 * @param {{path: string;fileTitle?: string;}} opts
 */
 function generateArticle2Markdown(source, opts) {
    try {     
        const xml = generateArticle2Xml(source, {
            innerStyle,
        });
        const fileName = (opts.fileTitle || xml.title || new Date().toString()) + '.html'
        const filePath = path.resolve(opts.path || 'datas/temporary', fileName);
        fs.writeFileSync(filePath, xml.xmlStr);
        console.log('generating article success!', filePath);
    } catch (err) {
        console.error(err);
    }
}

/**
 * 从指定目录生成文章
 * @param {string} dir 目录
 * @param {?any} opt 参数
 */
function generaArticlesFromDir(dir, opt) {
    try {
        opt = opt || {};
        const fileNames = fs.readdirSync(dir);
        const files = {};
        const types = ['source', 'note', 'translation'];
        fileNames.forEach(fileName => {
            const fileArr = fileName.split('.')[0].split('-');
            const fileIndex = +fileArr[0];
            const fileType = fileArr[1];
            if(!Number.isNaN(fileIndex) && fileType && types.includes(fileType)) {
                if(!files[fileIndex]) {
                    files[fileIndex] = {};
                }
                files[fileIndex][fileType] = fs.readFileSync(path.resolve(dir, fileName), 'utf8')
            }
        });
        for(const index in files) {
            const item = files[index];
            generateArticle2Markdown({
                source: item.source || '',
                note: item.note || '',
                translation: item.translation || '',
                class: opt.class,
                style: opt.style,
            }, {
                path: dir,
                fileTitle: index,
            });
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * 遍历目录生成所有文章
 * @param {?Partial< {class: Partial<ArticleClass>;style: ArticleStyle;}>} opt 参数
 */
function genetatingAllArticles(baseDir, opt) {
    try {
        const baseStat = fs.statSync(baseDir);
        if(baseStat.isDirectory()) {
            const dirs = fs.readdirSync(baseDir);
            dirs.forEach(dir => {
                dir = path.resolve(baseDir, dir);
                const stat = fs.statSync(dir);
                if(stat.isDirectory()) {
                    // 解析当前目录
                    generaArticlesFromDir(dir, opt);
                    // 深度遍历当前目录
                    genetatingAllArticles(dir, opt);
                }
            });
        }
    } catch (err) {
        console.error(err);
    }
}

// 解析datas目录
genetatingAllArticles('datas');