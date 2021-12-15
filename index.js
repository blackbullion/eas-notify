const core = require('@actions/core')
const fs = require('fs').promises
const axios = require('axios')

const blocksConfig = {
	blocks: [
    {
      type: 'header',
			text: {
				type: 'plain_text',
				text: '🚨 New app builds'
			}
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: 'Scan the QR codes to install them.'
			}
		},
		{
			type: 'divider'
		},
		{
			type: 'image',
			image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=$ANDROID_LINK',
			alt_text: 'Android app build',
			title: {
				type: 'plain_text',
				text: '🤖 Android'
			}
		},
		{
			type: 'divider'
		},
		{
			type: 'image',
			image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=$IOS_LINK',
			alt_text: 'iOS app build',
			title: {
				type: 'plain_text',
				text: '🍎 iOS'
			}
		}
	]
}

const main = async () => {
  try {
    const content = (await fs.readFile(core.getInput('easOutputFile'), 'utf8')).split('\n')

    const androidBuild = content.find((line) => line.startsWith('🤖 Android build details:')).split(': ')[1]
    const iosBuild = content.find((line) => line.startsWith('🍎 iOS build details:')).split(': ')[1]
    
    const blocks = JSON.stringify(blocksConfig)
      .replace('$ANDROID_BUILD', androidBuild)
      .replace('$IOS_BUILD', iosBuild)

    await axios.post(core.getInput('slackWebhook'), blocks, {
      Headers: {
        Accept: 'application/json'
      }
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

main()
