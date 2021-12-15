const core = require('@actions/core')
const fs = require('fs').promises
const axios = require('axios')

const main = async () => {
  try {
    const content = (await fs.readFile(core.getInput('easOutputFile'), 'utf8')).split('\n')

    const androidBuild = content.find((line) => line.startsWith('🤖 Android build details:')).split(': ')[1]
    const iosBuild = content.find((line) => line.startsWith('🍎 iOS build details:')).split(': ')[1]
    
    const blocks = (await fs.readFile('blocks.json', 'utf8'))
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
