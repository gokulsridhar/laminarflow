import rake from 'node-rake';
import stopwords from "./config/stopwords.json" assert { type: "json"};


export function generateScenes(content) {
    const sentenses = generateLines(content);
    return sentenses.map((text, id) => {
        let keywords = rake.generate(text, { stopwords });
        keywords = keywords.map(k => k.split(',')[0])
            .filter(k => k && k.length > 3);
        return {
            id,
            text,
            keywords
        }
    })

}

function generateLines(content) {
    const contentLength = 240;
    let text = content.split('.');
    text = text.filter(s => !!s);
    const lines = [];
    let cursor = '';
    text.forEach(l => {
        if (cursor.length + l.length <= contentLength)
            cursor += encodeLine(l);
        else {
            lines.push(cursor.trim());
            cursor = encodeLine(l);
        }
    });
    if (cursor.length && cursor.trim().length)
    lines.push(cursor.trim());
    return lines;
}
const encodeLine = (line) => line.replaceAll(':','').replaceAll(/["]/g,"\u201D").replaceAll(/[,]/g, "\u002C").replaceAll(/[']/g, "\u2019") + '.';