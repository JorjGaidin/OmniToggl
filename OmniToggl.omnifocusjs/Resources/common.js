/* eslint-disable no-bitwise, no-plusplus */

(() => {
	// Credentials must be instantiated at IIFE load time (not inside handlers)
	const credentials = new Credentials();
	const CREDENTIAL_SERVICE = 'toggl-api-token';

	// Name of the tag we use to assign what you're working on
	// (this makes it easier to reset the changes made to the name)
	const TRACKING_TAG_NAME = 'working-on';
	// this is the name prefix so it's easy to identify what you're working on.
	// Replace this if you would like something different
	const TRACKING_NAME_PREFIX = '🎯';

	const TOGGL_URL = 'https://api.track.toggl.com/api/v9';

	// the following is a pollyfill for base64 taken from https://github.com/MaxArt2501/base64-js/blob/master/base64.js
	function btoa(stringParam) {
		const b64 =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
		const string = String(stringParam);
		let result = '';
		const rest = string.length % 3; // To determine the final padding

		for (let i = 0; i < string.length; ) {
			const a = string.charCodeAt(i++);
			const b = string.charCodeAt(i++);
			const c = string.charCodeAt(i++);
			if (a > 255 || b > 255 || c > 255) {
				throw new Error(
					"Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.",
				);
			}

			// eslint-disable-next-line no-bitwise
			const bitmap = (a << 16) | (b << 8) | c;
			result +=
				b64.charAt((bitmap >> 18) & 63) +
				b64.charAt((bitmap >> 12) & 63) +
				b64.charAt((bitmap >> 6) & 63) +
				b64.charAt(bitmap & 63);
		}
		// If there's need of padding, replace the last 'A's with equal signs
		return rest ? result.slice(0, rest - 3) + '==='.substring(rest) : result;
	}

	function buildAuthHeader(token) {
		return 'Basic ' + btoa(token + ':api_token');
	}

	function classifyError(statusCode, isNetwork) {
		if (isNetwork === true) {
			return 'Could not connect to Toggl. Check your internet connection.';
		}
		if (statusCode === 403) {
			return 'Authentication failed. Check your API token.';
		}
		if (statusCode === 429) {
			return 'Too many requests. Wait a moment and try again.';
		}
		if (statusCode >= 500) {
			return 'Toggl service error. Try again later.';
		}
		return 'An unexpected error occurred with Toggl.';
	}

	async function fetchWithRetry(fetchRequest) {
		let lastError;
		for (let attempt = 0; attempt < 2; attempt++) {
			try {
				const r = await fetchRequest.fetch();
				if (r.statusCode >= 200 && r.statusCode < 300) {
					return r;
				}
				if (r.statusCode >= 400 && r.statusCode < 500) {
					// Client errors — no retry
					throw { type: 'http', statusCode: r.statusCode, body: r.bodyString };
				}
				// 5xx — save and retry
				lastError = { type: 'http', statusCode: r.statusCode, body: r.bodyString };
			} catch (err) {
				// Re-throw client HTTP errors immediately
				if (err && err.type === 'http' && err.statusCode >= 400 && err.statusCode < 500) {
					throw err;
				}
				// Network error — save and retry
				lastError = { type: 'network', message: err.message || String(err) };
			}
		}
		throw lastError;
	}

	const dependencyLibrary = new PlugIn.Library(new Version('1.0'));

	dependencyLibrary.getAuthToken = async function getAuthToken() {
		const stored = credentials.read(CREDENTIAL_SERVICE);
		if (stored && stored.password) {
			return stored.password;
		}

		// First run — prompt user for token
		const form = new Form();
		form.addField(new Form.Field.Password('token', 'Toggl API Token', null));
		try {
			await form.show('Toggl Setup', 'Save Token');
		} catch (e) {
			throw new Error('Token setup cancelled');
		}

		const token = form.values.token;
		if (!token) {
			throw new Error('No token provided');
		}

		credentials.write(CREDENTIAL_SERVICE, 'toggl', token);
		return token;
	};

	dependencyLibrary.getAuthHeader = async function getAuthHeader() {
		const token = await dependencyLibrary.getAuthToken();
		return buildAuthHeader(token);
	};

	dependencyLibrary.clearAuthToken = function clearAuthToken() {
		credentials.remove(CREDENTIAL_SERVICE);
	};

	dependencyLibrary.classifyError = classifyError;

	dependencyLibrary.startTogglTimer = async function startTogglTimer(
		authHeader,
		timeEntry,
	) {
		const fetchRequest = new URL.FetchRequest();
		// modified to json data format
		fetchRequest.bodyData = Data.fromString(JSON.stringify(timeEntry));
		fetchRequest.method = 'POST';
		fetchRequest.headers = {
			Authorization: authHeader,
			'Content-Type': 'application/json',
		};
		fetchRequest.url = URL.fromString(
			`${TOGGL_URL}/workspaces/${timeEntry.workspace_id}/time_entries`,
		);
		const r = await fetchWithRetry(fetchRequest);

		// modified to cut '.data' from the return value
		return JSON.parse(r.bodyString);
	};

	dependencyLibrary.getCurrentTogglTimer =
		async function getCurrentTogglTimer(authHeader) {
			const fetchRequest = new URL.FetchRequest();

			fetchRequest.method = 'GET';
			fetchRequest.headers = {
				Authorization: authHeader,
				'Content-Type': 'application/json',
			};
			fetchRequest.url = URL.fromString(`${TOGGL_URL}/me/time_entries/current`);
			const r = await fetchWithRetry(fetchRequest);

			// modified to cut '.data' from the return value
			return JSON.parse(r.bodyString);
		};

	dependencyLibrary.stopTogglTimer = async function stopTogglTimer(
		authHeader,
		workspaceId,
		id,
	) {
		const fetchRequest = new URL.FetchRequest();

		fetchRequest.method = 'PATCH';
		fetchRequest.headers = {
			Authorization: authHeader,
			'Content-Type': 'application/json',
		};
		fetchRequest.url = URL.fromString(
			`${TOGGL_URL}/workspaces/${workspaceId}/time_entries/${id}/stop`,
		);
		const r = await fetchWithRetry(fetchRequest);

		// modified to cut '.data' from the return value
		return JSON.parse(r.bodyString);
	};

	dependencyLibrary.createTogglProject = async function createTogglProject(
		authHeader,
		workspaceId,
		name,
	) {
		const fetchRequest = new URL.FetchRequest();
		fetchRequest.bodyData = Data.fromString(
			JSON.stringify({ active: true, name }),
		);
		fetchRequest.method = 'POST';
		fetchRequest.headers = {
			Authorization: authHeader,
			'Content-Type': 'application/json',
		};
		fetchRequest.url = URL.fromString(
			`${TOGGL_URL}/workspaces/${workspaceId}/projects`,
		);
		const r = await fetchWithRetry(fetchRequest);

		// modified to cut '.data' from the return value
		return JSON.parse(r.bodyString);
	};

	dependencyLibrary.getTogglProjects = async function getTogglProjects(authHeader) {
		const fetchRequest = new URL.FetchRequest();
		fetchRequest.method = 'GET';
		fetchRequest.headers = {
			Authorization: authHeader,
			'Content-Type': 'application/json',
		};
		fetchRequest.url = URL.fromString(`${TOGGL_URL}/me?with_related_data=true`);
		const r = await fetchWithRetry(fetchRequest);

		// modified to cut '.data' from the return value
		// return JSON.parse(r.bodyString).projects;
		return JSON.parse(r.bodyString);
	};

	dependencyLibrary.log = async function log(message, title = 'Log') {
		const a = new Alert(title, message);
		a.addOption('OK');
		await a.show();
	};

	const config = {
		TRACKING_TAG_NAME,
		TRACKING_NAME_PREFIX,
	};

	dependencyLibrary.resetTasks = () => {
		let trackingTag = flattenedTags.find((t) => t.name === TRACKING_TAG_NAME);

		if (!trackingTag) {
			trackingTag = new Tag(TRACKING_TAG_NAME);
		}

		trackingTag.tasks.forEach((task) => {
			if (task.name.startsWith(TRACKING_NAME_PREFIX)) {
				task.name = task.name.replace(TRACKING_NAME_PREFIX, '');
			}
			task.removeTag(trackingTag);
		});
	};

	dependencyLibrary.config = config;

	return dependencyLibrary;
})();
