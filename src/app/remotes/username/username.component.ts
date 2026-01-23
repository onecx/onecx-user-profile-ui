import { CommonModule } from '@angular/common'
import { Component, inject, Input } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { map, Observable, ReplaySubject } from 'rxjs'

import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import { UserService, ConfigurationService } from '@onecx/angular-integration-interface'
import {
  AngularRemoteComponentsModule,
  ocxRemoteComponent,
  ocxRemoteWebcomponent
} from '@onecx/angular-remote-components'
import { REMOTE_COMPONENT_CONFIG, RemoteComponentConfig } from '@onecx/angular-utils'

@Component({
  selector: 'app-ocx-username',
  templateUrl: './username.component.html',
  standalone: true,
  imports: [AngularRemoteComponentsModule, CommonModule, AngularAcceleratorModule],
  providers: [{ provide: REMOTE_COMPONENT_CONFIG, useValue: new ReplaySubject<string>(1) }]
})
@UntilDestroy()
export class OneCXUsernameComponent implements ocxRemoteComponent, ocxRemoteWebcomponent {
  private readonly rcConfig = inject<ReplaySubject<RemoteComponentConfig>>(REMOTE_COMPONENT_CONFIG)
  public readonly config = inject(ConfigurationService)
  public readonly userService = inject(UserService)

  @Input() set ocxRemoteComponentConfig(rcConfig: RemoteComponentConfig) {
    this.ocxInitRemoteComponent(rcConfig)
  }

  public username$: Observable<string | undefined> = this.userService.profile$.pipe(
    map((profile) => {
      const username = profile.person?.displayName
      return username
    })
  )

  public ocxInitRemoteComponent(rcConfig: RemoteComponentConfig) {
    this.rcConfig.next(rcConfig)
  }
}
