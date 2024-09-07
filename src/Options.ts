const saveOptions = () => {
	const githubPAT = (document.getElementById('github_pat') as HTMLInputElement)!.value;
	chrome.storage.local.set({ githubPAT }, () => {
		const status = document.getElementById('status')!;
		status.textContent = 'Option Saved';
		setTimeout(() => {
			status.textContent = '';
		}, 1000);
	});
};

document.getElementById('save')!.addEventListener('click', saveOptions);
