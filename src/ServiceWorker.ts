console.log('[BACKGROUND] Leet2Hub Chrome Extension.');

async function getGitHubPAT() {
	const { githubPAT } = await chrome.storage.local.get('githubPAT');
	return githubPAT;
}

async function getGithubRepoDetails() {
	const { githubRepo } = await chrome.storage.local.get('githubRepo');
	if (typeof githubRepo !== 'string') throw Error('No GitHub Repo Found');
	// https://github.com/iShibi/leet2hub --> ['', 'iShibi', 'leet2hub']
	const [_, githubRepoOwner, githubRepoName] = new URL(githubRepo).pathname.split('/');
	return { githubRepoOwner, githubRepoName };
}

interface MutationEventMsg {
	action: 'accepted';
}

chrome.runtime.onMessage.addListener(async function (message: MutationEventMsg) {
	if (message.action === 'accepted') {
		const { submission } = await chrome.storage.local.get('submission');
		const { submissionId } = await chrome.storage.local.get('submissionId');
		const submissionIdFromTabUrl = await getSubmissionIdFromTabUrl();
		chrome.storage.local.remove(['submission', 'submissionId']);
		if (submission && submissionId === submissionIdFromTabUrl) {
			uploadToGitHub(submission.lang, submission.problemName, submission.typedCode);
		}
	}
});

function parseRequestBody(requestBody: chrome.webRequest.WebRequestBody) {
	if (!requestBody || !requestBody.raw || !requestBody.raw.length || !requestBody.raw[0].bytes) return null;
	// Convert raw request body buffer to string
	const decodedString = new TextDecoder('utf-8').decode(new Uint8Array(requestBody.raw[0].bytes));
	try {
		return JSON.parse(decodedString);
	} catch (e) {
		console.error('Failed to parse request body as JSON:', e);
		return null;
	}
}

//Listen for outgoing GraphQL requests
chrome.webRequest.onBeforeRequest.addListener(
	// @ts-expect-error TS warns not to use async function but it works during runtime
	async function (details) {
		if (details.method === 'POST' && details.url.includes('/submit')) {
			if (!details.requestBody) throw Error('Request body not found');
			const requestBody = parseRequestBody(details.requestBody) as LeetCodeSubmitRequestBody;
			if (requestBody) {
				const { lang, typed_code } = requestBody;
				const problemName = await getProblemName();
				const submission = { lang, problemName, typedCode: typed_code };
				chrome.storage.local.set({ submission });
			}
		} else if (details.method === 'GET' && details.url.includes('/check')) {
			// https://leetcode.com/submissions/detail/123/check/ --> ['', 'submissions', 'detail', '123', 'check', '']
			const submissionId = new URL(details.url).pathname.split('/')[3];
			chrome.storage.local.set({ submissionId });
		}
		return {}; // Allow the request to proceed as normal
	},
	{ urls: ['https://leetcode.com/*'] },
	['requestBody'], // Needed to access and modify the request body
);

async function getShaOfExistingFile(
	githubRepoOwner: string,
	githubRepoName: string,
	filePath: string,
	accessToken: string,
) {
	const url = `https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/contents/${filePath}`;
	const res = await fetch(url, {
		method: 'GET',
		headers: {
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
	});
	const data: { sha: string } = await res.json();
	if (data.sha) return data.sha;
	return null;
}

interface BodyParams {
	message: string;
	content: string;
	sha?: string;
}

async function uploadToGitHub(lang: SuportedLang, problemName: string, typedCode: string) {
	const body: BodyParams = {
		message: `feat: add ${lang} solution for ${problemName}`,
		content: btoa(typedCode),
	};
	const filePath = `${problemName}/${problemName}.${getLangExtension(lang)}`;
	const accessToken = await getGitHubPAT();
	const { githubRepoOwner, githubRepoName } = await getGithubRepoDetails();
	const sha = await getShaOfExistingFile(githubRepoOwner, githubRepoName, filePath, accessToken);
	if (sha) {
		body.sha = sha;
		body.message = `feat: update ${lang} solution for ${problemName}`;
	}
	const url = `https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/contents/${filePath}`;
	const res = await fetch(url, {
		method: 'PUT',
		headers: {
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
	const data = await res.json();
	console.log(data);
}

async function getProblemName() {
	const queryOptions = { active: true, lastFocusedWindow: true };
	const [tab] = await chrome.tabs.query(queryOptions);
	if (!tab.url) throw Error('Tab URL not found');
	const problemName = new URL(tab.url).pathname.split('/')[2];
	return problemName;
}

async function getSubmissionIdFromTabUrl() {
	const queryOptions = { active: true, lastFocusedWindow: true };
	const [tab] = await chrome.tabs.query(queryOptions);
	if (!tab.url) throw Error('Tab URL not found');
	// https://leetcode.com/problems/two-sum/submissions/123/ --> ['', 'problems', 'two-sum', 'submissions', '123', '']
	const submissionId = new URL(tab.url).pathname.split('/')[4];
	return submissionId;
}

function getLangExtension(lang: SuportedLang): string {
	const langExtension = SUPPORTED_LANG_EXTENSIONS[lang];
	if (langExtension) return langExtension;
	throw new Error('Unsupported Language Found');
}

const SUPPORTED_LANG_EXTENSIONS = {
	cpp: 'cpp',
	java: 'java',
	python: 'py',
	python3: 'py',
	c: 'c',
	csharp: 'cs',
	javascript: 'js',
	typescript: 'ts',
	php: 'php',
	swift: 'swift',
	kotlin: 'kt',
	dart: 'dart',
	golang: 'go',
	ruby: 'rb',
	scala: 'scala',
	rust: 'rs',
	racket: 'rkt',
	erlang: 'erl',
	elixir: 'ex',
};

interface LeetCodeSubmitRequestBody {
	lang: SuportedLang;
	typed_code: string;
}

type SuportedLang = keyof typeof SUPPORTED_LANG_EXTENSIONS;
