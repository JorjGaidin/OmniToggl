(() => {
	// Main action
	const action = new PlugIn.Action(async function startTogglTimerAction(
		selection,
	) {
		const {
			config: { TRACKING_TAG_NAME, TRACKING_NAME_PREFIX },
			startTogglTimer,
			createTogglProject,
			getTogglProjects,
			getAuthHeader,
			classifyError,
			resetTasks,
			log,
		} = this.common;

		let trackingTag = flattenedTags.find((t) => t.name === TRACKING_TAG_NAME);
		if (!trackingTag) {
			trackingTag = new Tag(TRACKING_TAG_NAME);
		}

		try {
			resetTasks();

			const authHeader = await getAuthHeader();

			let projects = [];
			let results = [];

			try {
				results = await getTogglProjects(authHeader);
			} catch (e) {
				if (e && e.type === 'http') {
					await log(classifyError(e.statusCode, false), 'Timer Error');
				} else if (e && e.type === 'network') {
					await log(classifyError(null, true), 'Timer Error');
				} else {
					await log('An unexpected error occurred.', 'Timer Error');
				}
				console.log('Get projects error:', JSON.stringify(e, null, 2));
				return;
			}

			let workspaceId = results.default_workspace_id;
			projects = results.projects;

			const source = selection.tasks[0] || selection.projects[0];
			let projectName = '';
			if (source instanceof Task) {
				if (source.containingProject) {
					projectName = source.containingProject.name;
				}
			} else {
				projectName = source.name;
			}

			const toggleProject = (projects || []).find(
				(p) => p.name.trim().toLowerCase() === projectName.trim().toLowerCase(),
			);

			const taskName = source.name;
			let pid;
			if (!projectName) {
				pid = null;
			} else if (!toggleProject) {
				console.log(`project not found creating new ${projectName} project`);
				try {
					const r = await createTogglProject(authHeader, workspaceId, projectName);
					console.log(`project created id: ${r.id}`);
					pid = r.id;
				} catch (e) {
					if (e && e.type === 'http') {
						await log(classifyError(e.statusCode, false), 'Timer Error');
					} else if (e && e.type === 'network') {
						await log(classifyError(null, true), 'Timer Error');
					} else {
						await log('An unexpected error occurred.', 'Timer Error');
					}
					console.log(`Error creating project ${projectName}:`, JSON.stringify(e, null, 2));
					return;
				}
			} else {
				pid = toggleProject.id;
				workspaceId = toggleProject.workspace_id;
			}

			const taskTags = source.tags.map((t) => t.name);

			try {
				const r = await startTogglTimer(authHeader, {
					description: taskName,
					created_with: 'omnifocus',
					tags: taskTags,
					project_id: pid,
					workspace_id: workspaceId,
					start: new Date().toISOString(),
					duration: -1,
				});
				const isTask = source instanceof Task;
				if (isTask) {
					source.name = TRACKING_NAME_PREFIX + source.name;
				}
				source.addTag(trackingTag);
				console.log('Timer started successfully', JSON.stringify(r));
			} catch (e) {
				if (e && e.type === 'http') {
					await log(classifyError(e.statusCode, false), 'Timer Error');
				} else if (e && e.type === 'network') {
					await log(classifyError(null, true), 'Timer Error');
				} else {
					await log('An unexpected error occurred.', 'Timer Error');
				}
				console.log('Start timer error:', JSON.stringify(e, null, 2));
			}
		} catch (e) {
			if (e && e.type === 'http') {
				await log(classifyError(e.statusCode, false), 'Timer Error');
			} else if (e && e.type === 'network') {
				await log(classifyError(null, true), 'Timer Error');
			} else {
				await log(e.message || 'An unexpected error occurred.', 'Timer Error');
			}
			console.log('Start timer action error:', JSON.stringify(e, null, 2));
		}
	});

	action.validate = function startTogglTimerValidate(selection) {
		// selection options: tasks, projects, folders, tags
		const taskSelected = selection.tasks.length === 1;
		const projectSelected = selection.projects.length === 1;

		return taskSelected || projectSelected;
	};

	return action;
})();
