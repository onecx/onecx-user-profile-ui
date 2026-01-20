import { CommonModule } from '@angular/common'
import { Component, inject, Input } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import {
  AngularRemoteComponentsModule,
  ocxRemoteComponent,
  ocxRemoteWebcomponent,
  REMOTE_COMPONENT_CONFIG,
  RemoteComponentConfig
} from '@onecx/angular-remote-components'
import { ReplaySubject } from 'rxjs'

@Component({
  selector: 'app-ocx-language-switch',
  standalone: true,
  templateUrl: './language-switch.component.html',
  styleUrl: './language-switch.component.scss',
  imports: [AngularRemoteComponentsModule, CommonModule, AngularAcceleratorModule],
  providers: [{ provide: REMOTE_COMPONENT_CONFIG, useValue: new ReplaySubject<string>(1) }]
})
@UntilDestroy()
export class OneCXLanguageSwitchComponent implements ocxRemoteComponent, ocxRemoteWebcomponent {
  private readonly rcConfig = inject<ReplaySubject<RemoteComponentConfig>>(REMOTE_COMPONENT_CONFIG)

  @Input() set ocxRemoteComponentConfig(conf: RemoteComponentConfig) {
    this.ocxInitRemoteComponent(conf)
  }

  ocxInitRemoteComponent(config: RemoteComponentConfig): void {
    this.rcConfig.next(config)
  }
}
