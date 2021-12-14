# EAS Build Alert

A GitHub action for automating changelogs.

Every commit starting with a specified prefix (e.g. `changelog: add new feature`) gets added to your changelog file. You can then use the [update changelog version action](https://github.com/blackbullion/update-changelog-version) to group commits by the version they were released in.

## Inputs

| Input        | Required    | Description
| ------------ | ----------- | -----------
| easOutput    | yes         | Output of the EAS build command
| slackWebhook | yes         | The webhook URL of your Slack app

## Example

```
name: EAS Build
on:
  push:
    branches:
      - develop

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      // setup node, install deps, etc...

      - name: Build on EAS
        id: build
        run: |
          npx eas-cli build --non-interactive | tee eas.log
          echo "::set-output name=log::$(cat eas.log)"

      - name: Notify
        uses: blackbullion/eas-notify@main
        with:
          easOutput: steps.build.outputs.log
          slackWebhook: ${{ secrets.SLACK_WEBHOOK }}

```