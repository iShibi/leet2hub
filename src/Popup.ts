const checkStatus = async () => {
	const { githubPAT, githubRepo } = await chrome.storage.local.get(['githubPAT', 'githubRepo']);
	const tokenStatus = document.getElementById('get_started')!;
	if (!githubPAT || githubPAT.length === 0 || !githubRepo || githubRepo.length === 0) {
		tokenStatus.textContent = 'Set GitHub Personal Access Token and Repository';
	} else {
		tokenStatus.textContent = 'Ready';
	}
};

document.addEventListener('DOMContentLoaded', checkStatus);

chrome.storage.local.onChanged.addListener(() => {
	checkStatus();
});
