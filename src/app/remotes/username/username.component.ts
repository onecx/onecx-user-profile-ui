import { Component, Inject, inject, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { map, Observable, ReplaySubject } from 'rxjs'

import { AngularAcceleratorModule, createRemoteComponentTranslateLoader } from '@onecx/angular-accelerator'
import { UserService, ConfigurationService } from '@onecx/angular-integration-interface'
import {
  AngularRemoteComponentsModule,
  BASE_URL,
  ocxRemoteComponent,
  ocxRemoteWebcomponent,
  provideTranslateServiceForRoot
} from '@onecx/angular-remote-components'
import { REMOTE_COMPONENT_CONFIG, RemoteComponentConfig } from '@onecx/angular-utils'

@Component({
  selector: 'app-ocx-username',
  templateUrl: './username.component.html',
  standalone: true,
  imports: [AngularRemoteComponentsModule, CommonModule, AngularAcceleratorModule, TranslateModule],
  providers: [
    { provide: REMOTE_COMPONENT_CONFIG, useValue: new ReplaySubject<string>(1) },
    {
      provide: BASE_URL,
      useValue: new ReplaySubject<string>(1)
    },
    provideTranslateServiceForRoot({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createRemoteComponentTranslateLoader,
        deps: [HttpClient, BASE_URL]
      }
    })
  ]
})
@UntilDestroy()
export class OneCXUsernameComponent implements ocxRemoteComponent, ocxRemoteWebcomponent {
  private readonly rcConfig = inject<ReplaySubject<RemoteComponentConfig>>(REMOTE_COMPONENT_CONFIG)
  public readonly config = inject(ConfigurationService)
  public readonly userService = inject(UserService)

  constructor(
    @Inject(BASE_URL) private readonly baseUrl: ReplaySubject<string>,
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
    this.baseUrl.next(rcConfig.baseUrl)
    this.rcConfig.next(rcConfig)
  }
}
