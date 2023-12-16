let zenReadEnabled = false;
const originalTextMap = new Map();

const observer = new MutationObserver(mutations => {
    if (zenReadEnabled) {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    applyBionicReadingToNode(node);
                }
            });
        });
    }
});

function applyBionicReading(text) {
    return text.split(' ').map(word => {
        const mid = Math.floor(word.length / 2);
        return `<b>${word.substring(0, mid)}</b>${word.substring(mid)}`;
    }).join(' ');
}

function applyBionicReadingToNode(node) {
    if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE'].includes(node.nodeName)) {
        return;
    }

    Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === 3 && child.nodeValue.trim() !== '') {
            const span = document.createElement('span');
            originalTextMap.set(span, child.nodeValue); // Save original text
            span.innerHTML = applyBionicReading(child.nodeValue);
            child.replaceWith(span);
        } else if (child.nodeType === 1) {
            applyBionicReadingToNode(child);
        }
    });
}

function revertBionicReading(node) {
    if (node.nodeType === 1) {
        Array.from(node.childNodes).forEach(child => {
            if (child.nodeType === 1 && originalTextMap.has(child)) {
                const originalText = originalTextMap.get(child);
                child.innerHTML = originalText; // Restore the original HTML
            } else if (child.nodeType === 1) {
                revertBionicReading(child);
            }
        });
    }
}

function toggleBionicReading() {
    zenReadEnabled = !zenReadEnabled;
    if (zenReadEnabled) {
        applyBionicReadingToNode(document.body);
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        observer.disconnect();
        revertBionicReading(document.body);
        originalTextMap.clear();
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleZenRead') {
        toggleBionicReading();
        sendResponse({zenReadEnabled: zenReadEnabled});
    } else if (message.action === 'getState') {
        sendResponse({zenReadEnabled: zenReadEnabled});
    }
});


//  Apply Bionic Reading on page load
toggleBionicReading();
