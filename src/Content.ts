console.log('[Content] Leet2Hub Chrome Extension.');

const observerForAcceptedSubmmission = new MutationObserver(() => {
	const result = document.querySelector("[data-e2e-locator='submission-result']");
	if (result) {
		if (result.textContent === 'Accepted') {
			const message = { action: 'accepted' };
			chrome.runtime.sendMessage(message);
		}
	}
});

// Try to change the target node to more specific node to decrease event count
observerForAcceptedSubmmission.observe(document.body, {
	childList: true,
	subtree: true,
});
