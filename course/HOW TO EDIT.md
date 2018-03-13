# How to Edit this Course

## Streaming Media

YouTube is used for videos - enter the video code in the extra information when editing content to include it in the class.

SoundCloud is used for audio only content - use the `share` -> `embed` button and paste the code into your content.

## Course Content

Located in the `content\{language}` directory. This can be configured in any way, however the advised method is using a `folder` per `class`.

Edit content in `Markdown`, using the editor provided.

New folders can be added by selecting `new file` and editing the filename with the appropriate new folder location.

## Course Configuration

Located in the `config` directory are three files. These should be edited carefully to tell the Connected Academy platform specific things about your course, including the location of video content, related hashtags and timings.

### spec.yaml

This file defines the structure of the course, including what content is available to the participant and when.

### hubs.yaml

This file defines which `hubs` or situated classes are happening, and their relationship to social media and language.

### questions.yaml

This file defines the analytics, legal releases and specific questions to be asked as part of registration and throughout the course.

### Customised Branding

All aspects of the UI can be overridden by placing files within the `branding` directory. Overidden files are based on files in https://github.com/connectedacademy/elevator/src.

**Changing the brand color**

Create a file called `customise.styl` in `branding\stylus`. `$color-primary = #C6002D` and `$color-homework = #107598` are key variables.

