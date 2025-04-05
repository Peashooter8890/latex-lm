"use strict";
function renderLatex() {
    const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    let currentNode;
    while ((currentNode = textWalker.nextNode())) {
        if (currentNode.nodeValue && currentNode.nodeValue.includes('$')) {
            textNodes.push(currentNode);
        }
    }
    textNodes.forEach(processNode);
}
function processNode(textNode) {
    if (!textNode.nodeValue)
        return;
    const parent = textNode.parentNode;
    // skip if parent is already KaTeX or if it's a script/style tag 
    if (!parent ||
        (parent instanceof HTMLElement && parent.classList.contains('katex')) ||
        parent.nodeName === 'SCRIPT' ||
        parent.nodeName === 'STYLE') {
        return;
    }
    const text = textNode.nodeValue;
    const blockRegex = /\$\$([\s\S]*?)\$\$/g;
    const inlineRegex = /\$([^\$]+?)\$/g;
    let html = text;
    let hasLatex = false;
    html = html.replace(blockRegex, function (match, latex) {
        hasLatex = true;
        try {
            return `<div class="katex-block">${katex.renderToString(latex, {
                displayMode: true,
            })}</div>`;
        }
        catch (e) {
            console.error('LaTeX rendering error:', e);
            return match; // keep original if there is an error
        }
    });
    html = html.replace(inlineRegex, function (match, latex) {
        hasLatex = true;
        try {
            return katex.renderToString(latex, { displayMode: false });
        }
        catch (e) {
            console.error('LaTeX rendering error:', e);
            return match;
        }
    });
    // only replace node if latex was found
    if (hasLatex) {
        const span = document.createElement('span');
        span.innerHTML = html;
        parent.replaceChild(span, textNode);
    }
}
const style = document.createElement('style');
style.textContent = `
    .katex-block {
      display: block;
      margin: 1em 0;
      text-align: center;
    }
  `;
document.head.appendChild(style);
renderLatex();
const observer = new MutationObserver(function (mutations) {
    renderLatex();
});
observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
});
setInterval(renderLatex, 2000);
console.log('LaTeX Renderer for NotebookLM loaded.');
//# sourceMappingURL=content.js.map