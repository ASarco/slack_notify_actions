import * as core from '@actions/core'
import * as slack from '@slack/webhook'
import {MessageAttachment} from '@slack/types'
import {
  createAttachment,
  createIncomingWebhookSendArguments,
  replaceGitHubUsernameWithSlackUsername
} from './utils'
import {readEnvVariables} from './env_variables'

async function run(): Promise<void> {
  const {
    webhookURL,
    githubActor,
    githubRef,
    githubEvent,
    slackIconURL,
    slackGithubPairs,
    slackUsername,
    attachmentsTitle,
    attachmentsTitleURL,
    attachmentsBody,
    attachmentsColor,
    attachmentsMrkdn
  } = readEnvVariables()
  const title = replaceGitHubUsernameWithSlackUsername(
    attachmentsTitle ?? '',
    slackGithubPairs ?? ''
  )
  const body = replaceGitHubUsernameWithSlackUsername(
    attachmentsBody ?? '',
    slackGithubPairs ?? ''
  )

  const webhook = new slack.IncomingWebhook(webhookURL)
  const attachments: MessageAttachment = createAttachment({
    mrkdwnIn: attachmentsMrkdn ? ["text"] : [],
    color: attachmentsColor,
    authorName: githubActor,
    authorLink: `https://github.com/${githubActor}`,
    authorIcon: `https://github.com/${githubActor}.png`,
    title,
    titleLink: attachmentsTitleURL,
    text: body,
    fields: [
      {
        title: 'Ref',
        value: githubRef,
        short: true
      },
      {
        title: 'Event',
        value: githubEvent,
        short: true
      }
    ]
  })
  const args = createIncomingWebhookSendArguments({
    iconUrl: slackIconURL,
    username: slackUsername,
    attachments: [attachments]
  })
  core.info(body)
  core.setOutput("body", body);

  await webhook.send(args)

  try {
    core.info('done!')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run().catch(err => {
  core.setFailed(err.message)
})
