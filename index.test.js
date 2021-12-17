const fs = require('fs').promises
const axios = require('axios')
const action = require('./index')

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue('')
  }
}))

jest.mock('axios')
axios.post.mockResolvedValue({ data: { result: 'OK' }})

const headers = { 'Headers': { 'Accept': 'application/json' } }

describe('EAS Build Alert', () => {
  it('should correctly find and replace ios and android links', async () => {
    fs.readFile.mockResolvedValue(`
      2021-12-15T10:02:59.2552837Z 🤖 Android build details: https://expo.dev/bb/android-build
      2021-12-15T10:02:59.2560145Z 🍎 iOS build details: https://expo.dev/bb/ios-build
    `)

    await action()

    expect(axios.post).toHaveBeenCalledWith('', JSON.stringify({
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
          image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://expo.dev/bb/android-build',
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
          image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://expo.dev/bb/ios-build',
          alt_text: 'iOS app build',
          title: {
            type: 'plain_text',
            text: '🍎 iOS'
          }
        }
      ]
    }), headers)
  })

  it('should correctly exclude android if no build was started', async () => {
    fs.readFile.mockResolvedValue(`
      2021-12-15T10:02:59.2560145Z 🍎 iOS build details: https://expo.dev/bb/ios-build
    `)

    await action()

    expect(axios.post).toHaveBeenCalledWith('', JSON.stringify({
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
          image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://expo.dev/bb/ios-build',
          alt_text: 'iOS app build',
          title: {
            type: 'plain_text',
            text: '🍎 iOS'
          }
        }
      ]
    }), headers)
  })

  it('should correctly exclude ios if no build was started', async () => {
    fs.readFile.mockResolvedValue(`
      2021-12-15T10:02:59.2552837Z 🤖 Android build details: https://expo.dev/bb/android-build
    `)

    await action()

    expect(axios.post).toHaveBeenCalledWith('', JSON.stringify({
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
          image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://expo.dev/bb/android-build',
          alt_text: 'Android app build',
          title: {
            type: 'plain_text',
            text: '🤖 Android'
          }
        }
      ]
    }), headers)
  })

  it('should correctly exclude android if the build was cancelled', async () => {
    fs.readFile.mockResolvedValue(`
      2021-12-15T10:02:59.2560145Z 🤖 Android build was canceled
      2021-12-15T10:02:59.2560145Z 🍎 iOS build details: https://expo.dev/bb/ios-build
    `)

    await action()

    expect(axios.post).toHaveBeenCalledWith('', JSON.stringify({
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
          image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://expo.dev/bb/ios-build',
          alt_text: 'iOS app build',
          title: {
            type: 'plain_text',
            text: '🍎 iOS'
          }
        }
      ]
    }), headers)
  })

  it('should correctly exclude ios if the build was cancelled', async () => {
    fs.readFile.mockResolvedValue(`
      2021-12-15T10:02:59.2552837Z 🤖 Android build details: https://expo.dev/bb/android-build
      2021-12-15T10:02:59.2560145Z 🍎 iOS build was canceled
    `)

    await action()

    expect(axios.post).toHaveBeenCalledWith('', JSON.stringify({
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
          image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://expo.dev/bb/android-build',
          alt_text: 'Android app build',
          title: {
            type: 'plain_text',
            text: '🤖 Android'
          }
        }
      ]
    }), headers)
  })

  it('should skip sending a notification if both builds were cancelled', async () => {
    fs.readFile.mockResolvedValue(`
      2021-12-15T10:02:59.2552837Z 🤖 Android build was canceled
      2021-12-15T10:02:59.2560145Z 🍎 iOS build was canceled
    `)

    await action()

    expect(axios.post).not.toHaveBeenCalled()
  })
})