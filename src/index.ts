if (process.env.USE_DOT_ENV === 'true') {
  require('dotenv').config();
}

import { App } from '@slack/bolt';

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.message('hello', async ({ say }) => {
  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Hey there!`,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Click Me',
          },
          action_id: 'button_click',
        },
      },
    ],
    text: `Hey there!`,
  });
});

app.command('/oncall', async ({ command, ack, say }) => {
  await ack();
  await say(command.text);
});

app.event('app_mention', async (event) => {
  if (event.body.event.text.indexOf('!help') >= 0) {
    await event.say({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `body - ${JSON.stringify(event.body)}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `context - ${JSON.stringify(event.context)}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `\`WhosOnCall\` - tell you who's on call!`,
          },
        },
      ],
      text: `Here are all our commands!`,
    });

    const res = await event.client.channels
      .info({
        channel: event.body.event.channel,
      })
      .catch((e) => {
        event.say({
          text: JSON.stringify(e),
        });
        return 'An error occurred';
      });

    event.say({
      text: JSON.stringify(res),
    });
  } else {
    await event.say({
      text: `Hey there! Give me a command or see all my commands with "!help"`,
    });
  }
});

app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

(async () => {
  await app.start(Number.parseInt(process.env.PORT || '3000'));

  console.log('⚡️ Bolt app is running!');
})();
