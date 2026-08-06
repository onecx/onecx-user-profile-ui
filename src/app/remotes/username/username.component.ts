import { Component, DestroyRef, Input, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { AsyncPipe } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { map, Observable, ReplaySubject } from 'rxjs'

import { TooltipModule } from 'primeng/tooltip'

import {
  AngularRemoteComponentsModule,
  ocxRemoteComponent,
  ocxRemoteWebcomponent
} from '@onecx/angular-remote-components'
import { REMOTE_COMPONENT_CONFIG, RemoteComponentConfig } from '@onecx/angular-utils'
import { UserService } from '@onecx/angular-integration-interface'

@Component({
  selector: 'app-ocx-username',
  standalone: true,
  imports: [AsyncPipe, AngularRemoteComponentsModule, TooltipModule, TranslateModule],
  providers: [
    {
      provide: REMOTE_COMPONENT_CONFIG,
      useValue: new ReplaySubject<RemoteComponentConfig>(1)
    }
  ],
  templateUrl: './username.component.html'
})
export class OneCXUsernameComponent implements ocxRemoteComponent, ocxRemoteWebcomponent {
  private readonly remoteComponentConfig = inject<ReplaySubject<RemoteComponentConfig>>(REMOTE_COMPONENT_CONFIG)
  private readonly userService = inject(UserService)
  private readonly destroyRef = inject(DestroyRef)

  @Input() set ocxRemoteComponentConfig(rcConfig: RemoteComponentConfig) {
    this.ocxInitRemoteComponent(rcConfig)
  }

  public ocxInitRemoteComponent(config: RemoteComponentConfig) {
    this.remoteComponentConfig.next(config)
  }

  public username$: Observable<string | undefined> = this.userService.profile$.pipe(
    map((profile) => {
      const username = profile.person?.displayName
      return username
    }),
    takeUntilDestroyed(this.destroyRef)
  )
}
