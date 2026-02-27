(() => {
	// Main action
	const action = new PlugIn.Action(async function stopTogglTimerAction() {
		const { getCurrentTogglTimer, stopTogglTimer, getAuthHeader, classifyError, resetTasks, log } =
			this.common;

		try {
			const authHeader = await getAuthHeader();
			const currentTimer = await getCurrentTogglTimer(authHeader);
			if (currentTimer) {
				const r = await stopTogglTimer(
					authHeader,
					currentTimer.workspace_id,
					currentTimer.id,
				);
				console.log('Timer stopped successfully', JSON.stringify(r));
			}
			resetTasks();
		} catch (e) {
			if (e && e.type === 'http') {
				await log(classifyError(e.statusCode, false), 'Timer Error');
			} else if (e && e.type === 'network') {
				await log(classifyError(null, true), 'Timer Error');
			} else {
				await log(e.message || 'An unexpected error occurred.', 'Timer Error');
			}
			console.log('Stop timer error:', JSON.stringify(e, null, 2));
		}
	});

	action.validate = function startTogglTimerValidate() {
		// selection options: tasks, projects, folders, tags
		return true;
	};

	return action;
})();
