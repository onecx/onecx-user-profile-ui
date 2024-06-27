import { ComponentHarness } from '@angular/cdk/testing'

export class OneCXAvatarImageComponentHarness extends ComponentHarness {
  static readonly hostSelector = 'app-avatar-image'

  //   getUserAvatarImage = this.locatorFor('#user-avatar-image')

  async getUserAvatarImage() {
    return await (await this.locatorFor('#user-avatar-image')()).getProperty('user$')
  }
}
