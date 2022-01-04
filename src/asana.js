const asana = require('asana');
const client = asana.Client.create({
    defaultHeaders: { 'asana-enable': 'new-sections,string_ids' },
    logAsanaChangeWarnings: false
  }).useAccessToken(process.env.ASANA_TOKEN);

/**
 * Will find a task by its task id
 * @param {*} taskId 
 * @returns 
 */
async function findIssue(taskId){
    return await client.tasks.findById(taskId);
}

/**
 * Will create a comment in a task by task id
 * @param {*} taskId 
 * @param {*} taskComment 
 * @returns 
 */
async function asanaComment(taskId, taskComment){
    return await client.tasks.addComment(taskId, {
        text: taskComment
    });
}

/**
 * Will create a new issue in a specific project 
 * @param {*} title 
 * @param {*} prURL 
 * @param {*} html 
 * @param {*} prID
 * @returns 
 */
async function asanaCreateTicket(title, prURL, previewURL, prID){
    let dueDate = new Date()
    // We add 48hrs to due date
    dueDate.setDate(dueDate.getDate() + 2);
    dueDate.toISOString().split('T')[0]
    const data = { 
        "assignee": `${process.env.ASANA_PR_ASSIGNEE}`,
        "completed": false,
        "html_notes": `<body>Pull Request: <a href="${prURL}">${prURL}</a>\nPreview: <a href="${previewURL}">${previewURL}</a></body>`,
        "name": `PR: ${title} - ${prID}`,
        "projects": [`${process.env.ASANA_PR_PROJECT_ID}`],
        "resource_subtype": "default_task",
        "due_on": dueDate
    }
    return await client.tasks.create(data);
}


/**
 * Check if task exists
 * @param {*} title 
 * @param {*} prID
 * @returns 
 */
async function asanaGetTicket(title, prID){
    
    const nameToSearch = `PR: ${title} - ${prID}`;
    try {
        const tasks = await client.tasks.getTasksForProject(process.env.ASANA_PR_PROJECT_ID);
        return tasks.data.find(task => task.name === nameToSearch);
    } catch {
        return null
    }
}

/**
 * Complete task
 * @param {*} ticketId 
 * @returns 
 */
 async function asanaCompleteTicket(ticketId){
    try {
        return await client.tasks.updateTask(ticketId, {
            "completed": true
        });
    } catch {
        return null
    }
}



module.exports = {
    asanaComment,
    asanaCreateTicket,
    asanaGetTicket,
    asanaCompleteTicket
}


