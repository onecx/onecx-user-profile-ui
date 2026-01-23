import { ComponentHarness } from '@angular/cdk/testing'

export class OneCXAvatarImageComponentHarness extends ComponentHarness {
  static readonly hostSelector = 'app-avatar-image'

  async getAvatarImageClass() {
    return await (await this.locatorFor('.user-avatar-image')()).getAttribute('class')
  }

  async getAvatarImageURL() {
    return await (await this.locatorFor('.user-avatar-image')()).getProperty('ocxSrc')
  }
}
