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
 * @returns 
 */
async function asanaCreateTicket(title, prURL, html){
    const data = { 
        "assignee": `${process.env.ASANA_PR_ASSIGNEE}`,
        "completed": false,
        "html_notes": `<body><a href="${prURL}">${prURL}</a></body>`,
        "name": `PR: ${title}`,
        "projects": [`${process.env.ASANA_PR_PROJECT_ID}`],
        "resource_subtype": "default_task"
    }
    return await client.tasks.create(data);
}



module.exports = {
    asanaComment,
    asanaCreateTicket
}


