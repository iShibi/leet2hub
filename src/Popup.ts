const checkStatus = async () => {
	const { githubPAT } = await chrome.storage.local.get('githubPAT');
	const tokenStatus = document.getElementById('get_started')!;
	if (!githubPAT || githubPAT.length === 0) {
		tokenStatus.textContent = 'Set GitHub Personal Access Token';
	} else {
		tokenStatus.textContent = 'Ready';
	}
};

document.addEventListener('DOMContentLoaded', checkStatus);

chrome.storage.local.onChanged.addListener(() => {
	checkStatus();
});
