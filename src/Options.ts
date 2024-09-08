document.addEventListener('DOMContentLoaded', async () => {
	const { githubPAT, githubRepo } = await chrome.storage.local.get(['githubPAT', 'githubRepo']);
	(document.getElementById('github_pat') as HTMLInputElement)!.value = githubPAT ?? '';
	(document.getElementById('github_repo') as HTMLInputElement)!.value = githubRepo ?? '';
});

const saveOptions = () => {
	const githubPAT = (document.getElementById('github_pat') as HTMLInputElement)!.value;
	const githubRepo = (document.getElementById('github_repo') as HTMLInputElement)!.value;
	chrome.storage.local.set({ githubPAT, githubRepo }, () => {
		const status = document.getElementById('save_status')!;
		status.style.display = 'block';
		setTimeout(() => {
			status.style.display = 'none';
		}, 1000);
	});
};

document.getElementById('save')!.addEventListener('click', saveOptions);
