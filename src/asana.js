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
async function asanaCreateTicket(title, prURL, previewURL){
    const data = { 
        "assignee": `toni.meuschke@shop-fabrik.net`,
        "completed": false,
        "html_notes": `<body>Pull Request: <a href="${prURL}">${prURL}</a>\nPreview: <a href="${previewURL}">${previewURL}</a></body>`,
        "name": `PR: ${title}`,
        "projects": ["1200085901584356"],
        "resource_subtype": "default_task"
    }
    return await client.tasks.create(data);
}



module.exports = {
    asanaComment,
    asanaCreateTicket
}


