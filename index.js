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

    const androidLink = content.find((line) => line.includes(androidLinkSearch))?.split(androidLinkSearch)[1]
    const iosLink = content.find((line) => line.includes(iosLinkSearch))?.split(iosLinkSearch)[1]

		const androidBuilt = Boolean(androidLink && !content.find((line) => line.includes(androidCancelledSearch)))
		const iosBuilt = Boolean(iosLink && !content.find((line) => line.includes(iosCancelledSearch)))

		if (!androidBuilt && !iosBuilt) {
			core.info('No builds were completed. Skipping message.')
			return
		}

		let blocks = blocksConfig.blocks

		if (androidBuilt) blocks = [...blocks, androidBuildBlock]
		if (iosBuilt) {
			if (androidBuilt) blocks = [...blocks, { type: 'divider' }]
			blocks = [...blocks, iosBuildBlock]
		}
    
    const data = JSON.stringify({ blocks })
      .replace('$ANDROID_LINK', androidLink)
      .replace('$IOS_LINK', iosLink)

    await axios.post(core.getInput('slackWebhook'), data, {
      Headers: {
        Accept: 'application/json'
      }
    })
  } catch (error) {
		console.error(error)
    core.setFailed(error.message)
  }
}

if (process.env.CI) { // ignore in tests
	main()
}

module.exports = main
