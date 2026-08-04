import { Component, Inject, Input, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
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
  imports: [AngularRemoteComponentsModule, CommonModule, AngularAcceleratorModule, TranslateModule],
  providers: [
    {
      provide: REMOTE_COMPONENT_CONFIG,
      useValue: new ReplaySubject<RemoteComponentConfig>(1)
    }
  ]
})
@UntilDestroy()
export class OneCXUsernameComponent implements ocxRemoteComponent, ocxRemoteWebcomponent {
  public readonly config = inject(ConfigurationService)
  public readonly userService = inject(UserService)

  constructor(
    @Inject(REMOTE_COMPONENT_CONFIG)
    private readonly remoteComponentConfig$: ReplaySubject<RemoteComponentConfig>,
    private readonly translateService: TranslateService
  ) {
    this.userService.lang$.subscribe((lang) => this.translateService.use(lang))
  }

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
    this.remoteComponentConfig$.next(rcConfig)
  }
}
