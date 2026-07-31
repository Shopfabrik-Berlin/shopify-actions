const asana = require('asana');
const axios = require('axios');

const client = asana.Client.create({
    defaultHeaders: { 'asana-enable': 'new-sections,string_ids' },
    logAsanaChangeWarnings: false
  }).useAccessToken(process.env.ASANA_TOKEN);

const ASANA_API_BASE = 'https://app.asana.com/api/1.0';
const PREVIEW_ATTACHMENT_PREFIX = 'Theme Preview - PR #';

function getAsanaHeaders() {
    return {
        Authorization: `Bearer ${process.env.ASANA_TOKEN}`,
        'Content-Type': 'application/json',
    };
}

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
 * Will get a list of comments (stories) by task id
 * @param {*} taskId 
 * @param {*} taskComment 
 * @returns 
 */
 async function asanaGetComments(taskId){
    return await client.tasks.stories(taskId);
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


/**
 * Check if task already includes deploy comment
 * @param {*} ticketId 
 * @returns 
 */
 async function asanaHasDeployComment(ticketId){
    const comments = await asanaGetComments(ticketId) || []
    const found = comments.data.find(comment => {
       if(comment.text.indexOf('Deployed successfully to') !== -1){
        return true
       }
    })
    return found ? true : false
}

/**
 * List external attachments on a task
 * @param {*} taskId
 * @returns
 */
async function asanaGetTaskAttachments(taskId) {
    const response = await axios.get(`${ASANA_API_BASE}/tasks/${taskId}/attachments`, {
        headers: getAsanaHeaders(),
        params: {
            opt_fields: 'name,resource_subtype,permanent_url,view_url',
        },
    });
    return response.data.data || [];
}

/**
 * Delete an attachment by gid
 * @param {*} attachmentGid
 */
async function asanaDeleteAttachment(attachmentGid) {
    await axios.delete(`${ASANA_API_BASE}/attachments/${attachmentGid}`, {
        headers: getAsanaHeaders(),
    });
}

/**
 * Attach an external URL to a task (modern Asana API)
 * @param {*} taskId
 * @param {*} url
 * @param {*} name
 * @returns
 */
async function asanaAttachExternalUrl(taskId, url, name) {
    const response = await axios.post(
        `${ASANA_API_BASE}/attachments`,
        {
            data: {
                resource_subtype: 'external',
                parent: `${taskId}`,
                url,
                name,
            },
        },
        { headers: getAsanaHeaders() }
    );
    return response.data.data;
}

/**
 * Create or refresh the preview theme external attachment on an Asana task.
 * Replaces an existing preview attachment for the same PR when the URL changes.
 * @param {*} taskId
 * @param {*} previewURL
 * @param {*} prID
 * @returns
 */
async function asanaUpsertPreviewAttachment(taskId, previewURL, prID) {
    const attachmentName = `${PREVIEW_ATTACHMENT_PREFIX}${prID}`;
    const attachments = await asanaGetTaskAttachments(taskId);
    const existing = attachments.find(
        (attachment) =>
            attachment.resource_subtype === 'external' &&
            attachment.name === attachmentName
    );

    if (existing) {
        const existingUrl = existing.permanent_url || existing.view_url || '';
        if (existingUrl === previewURL) {
            console.log(`Preview attachment already up to date for PR #${prID}`);
            return existing;
        }
        console.log(`Replacing outdated preview attachment for PR #${prID}`);
        await asanaDeleteAttachment(existing.gid);
    }

    return await asanaAttachExternalUrl(taskId, previewURL, attachmentName);
}



module.exports = {
    asanaHasDeployComment,
    asanaGetComments,
    asanaComment,
    asanaCreateTicket,
    asanaGetTicket,
    asanaCompleteTicket,
    asanaAttachExternalUrl,
    asanaUpsertPreviewAttachment,
}


