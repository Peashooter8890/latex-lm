function renderLatex() {
	// Process the entire document's text nodes
	const textWalker = document.createTreeWalker(
		document.body,
		NodeFilter.SHOW_TEXT,
		null,
		false
	);

	// Collect all text nodes that might contain LaTeX
	const textNodes = [];
	let currentNode;

	while ((currentNode = textWalker.nextNode())) {
		if (currentNode.nodeValue.includes('$')) {
			textNodes.push(currentNode);
		}
	}

	// Process collected nodes
	textNodes.forEach(processNode);
}

function processNode(textNode) {
	const parent = textNode.parentNode;

	// Skip if parent is already KaTeX or a script/style tag
	if (
		parent.classList.contains('katex') ||
		parent.tagName === 'SCRIPT' ||
		parent.tagName === 'STYLE'
	) {
		return;
	}

	const text = textNode.nodeValue;

	// Process block LaTeX: $$...$$
	const blockRegex = /\$\$([\s\S]*?)\$\$/g;
	// Process inline LaTeX: $...$
	const inlineRegex = /\$([^\$]+?)\$/g;

	let html = text;
	let hasLatex = false;

	// Replace block LaTeX
	html = html.replace(blockRegex, function (match, latex) {
		hasLatex = true;
		try {
			return `<div class="katex-block">${katex.renderToString(latex, {
				displayMode: true,
			})}</div>`;
		} catch (e) {
			console.error('LaTeX rendering error:', e);
			return match; // Keep original on error
		}
	});

	// Replace inline LaTeX
	html = html.replace(inlineRegex, function (match, latex) {
		hasLatex = true;
		try {
			return katex.renderToString(latex, { displayMode: false });
		} catch (e) {
			console.error('LaTeX rendering error:', e);
			return match; // Keep original on error
		}
	});

	// Only replace the node if we found and rendered LaTeX
	if (hasLatex) {
		const span = document.createElement('span');
		span.innerHTML = html;
		parent.replaceChild(span, textNode);
	}
}

// Add styles for block LaTeX
const style = document.createElement('style');
style.textContent = `
    .katex-block {
      display: block;
      margin: 1em 0;
      text-align: center;
    }
  `;
document.head.appendChild(style);

// Initial render
renderLatex();

// Set up a MutationObserver to detect changes in the DOM
const observer = new MutationObserver(function (mutations) {
	renderLatex();
});

// Start observing the document
observer.observe(document.body, {
	childList: true,
	subtree: true,
	characterData: true,
});

// Also check periodically for dynamic content
setInterval(renderLatex, 2000);
console.log('LaTeX Renderer for NotebookLM loaded.');
