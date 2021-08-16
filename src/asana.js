const asana = require('asana');
const client = asana.Client.create({
    defaultHeaders: { 'asana-enable': 'new-sections,string_ids' },
    logAsanaChangeWarnings: false
  }).useAccessToken(process.env.ASANA_TOKEN);

async function findIssue(taskId){
    return await client.tasks.findById(taskId);
}

async function asanaComment(taskId, taskComment){
    return await client.tasks.addComment(taskId, {
        text: taskComment
    });
}

async function asanaCreateTicket(title, prURL){
    const data = { 
        "data": {
            "assignee": "christian.orgs@shop-fabrik.net",
            "completed": false,
            "html_notes": `<body>${prURL}</body>`,
            "name": `PR: ${title}`,
            "projects": [process.env.ASANA_PR_PROJECT_ID],
            "resource_subtype": "default_task"
        }
    }

    
}





module.exports = {
    asanaComment,
    asanaCreateTicket
}


