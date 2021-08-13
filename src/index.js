const core = require('@actions/core');
const {
    preview,
    deploy,
    previewDelete,
    backup
  } = require('./actions');


async function run() {
  try {
    const task = process.env.TASK;

    console.log(`Preparing themekit action: ${task}`);

    if(task === "PREVIEW"){
        await preview()
    } else if(task === "DEPLOY"){
        await deploy()
    } else if(task === "BACKUP"){
        await backup()
    } else if(task === "PREVIEW_DELETE"){
        await previewDelete()
    } else {
        core.setFailed(`Error, unknown action ${task}`);
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run()