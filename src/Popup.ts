const checkStatus = async () => {
	const { githubPAT, githubRepo } = await chrome.storage.local.get(['githubPAT', 'githubRepo']);

	const githubPATBtn = document.getElementById('github_pat_btn')!;
	if (githubPAT && githubPAT.length) {
		const res = await fetch('https://api.github.com/user', {
			method: 'GET',
			headers: {
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
				Authorization: `Bearer ${githubPAT}`,
			},
		});
		const data = await res.json();
		if (data.login) {
			githubPATBtn.innerHTML = `${data.login}`;
			githubPATBtn.addEventListener('click', () => {
				chrome.tabs.create({ url: data.html_url });
			});
		} else {
			githubPATBtn.innerHTML = 'Invalid GitHub PAT. Click Here To Set Again';
			githubPATBtn.addEventListener('click', () => {
				chrome.tabs.create({ url: '/options.html' });
			});
		}
	} else {
		githubPATBtn.innerHTML = 'Click Here To Set GitHub PAT';
		githubPATBtn.addEventListener('click', () => {
			chrome.tabs.create({ url: '/options.html' });
		});
	}

	const githubRepoBtn = document.getElementById('github_repo_btn')!;
	if (githubRepo && githubRepo.length) {
		const [_, githubRepoOwner, githubRepoName] = new URL(githubRepo).pathname.split('/');
		githubRepoBtn.innerHTML = `${githubRepoOwner}/${githubRepoName}`;
		githubRepoBtn.addEventListener('click', () => {
			chrome.tabs.create({
				url: githubRepo,
			});
		});
	} else {
		githubRepoBtn.innerHTML = 'Click Here To Set GitHub Repository';
		githubRepoBtn.addEventListener('click', () => {
			chrome.tabs.create({ url: '/options.html' });
		});
	}
};

document.addEventListener('DOMContentLoaded', checkStatus);

chrome.storage.local.onChanged.addListener(() => {
	checkStatus();
});

document.getElementById('settings_btn')!.addEventListener('click', () => {
	chrome.tabs.create({ url: '/options.html' });
});
