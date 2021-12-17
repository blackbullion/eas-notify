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
		}
	]
}

const androidBuildBlock = {
	type: 'image',
	image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=$ANDROID_LINK',
	alt_text: 'Android app build',
	title: {
		type: 'plain_text',
		text: '🤖 Android'
	}
}

const iosBuildBlock = {
	type: 'image',
	image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=$IOS_LINK',
	alt_text: 'iOS app build',
	title: {
		type: 'plain_text',
		text: '🍎 iOS'
	}
}

const androidLinkSearch = '🤖 Android build details: '
const iosLinkSearch = '🍎 iOS build details: '

const androidCancelledSearch = '🤖 Android build was canceled'
const iosCancelledSearch = '🍎 iOS build was canceled'

const main = async () => {
  try {
    const content = (await fs.readFile(core.getInput('easOutputFile'), 'utf8')).split('\n')

    const androidLink = content.find((line) => line.includes(androidLinkSearch)).split(androidLinkSearch)[1]
    const iosLink = content.find((line) => line.includes(iosLinkSearch)).split(iosLinkSearch)[1]

		const androidBuilt = androidLink && !content.find((line) => line.includes(androidCancelledSearch))
		const iosBuilt = iosLink && !content.find((line) => line.includes(iosCancelledSearch))

		if (!androidBuilt && !iosBuilt) {
			core.info('No builds were completed. Skipping message.')
			return
		}

		if (androidBuilt) {
			blocksConfig.blocks = [...blocksConfig.blocks, androidBuildBlock]
		}
		if (iosBuilt) {
			if (androidBuilt) blocksConfig.blocks = [...blocksConfig.blocks, { type: 'divider' }]
			blocksConfig.blocks = [...blocksConfig.blocks, iosBuildBlock]
		}
    
    const blocks = JSON.stringify(blocksConfig)
      .replace('$ANDROID_LINK', androidLink)
      .replace('$IOS_LINK', iosLink)

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
