import { Component, EventEmitter, Input, OnInit, inject } from '@angular/core'
import { AsyncPipe, Location, NgStyle } from '@angular/common'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { Observable, ReplaySubject, of } from 'rxjs'

import { SkeletonModule } from 'primeng/skeleton'

import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import {
  AngularRemoteComponentsModule,
  ocxRemoteComponent,
  ocxRemoteWebcomponent
} from '@onecx/angular-remote-components'
import { REMOTE_COMPONENT_CONFIG, RemoteComponentConfig } from '@onecx/angular-utils'

import { Configuration, RefType, UserAvatarAPIService } from 'src/app/shared/generated'
import { bffImageUrl } from 'src/app/shared/utils'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-avatar-image',
  standalone: true,
  imports: [
    AsyncPipe,
    NgStyle,
    AngularAcceleratorModule,
    AngularRemoteComponentsModule,
    RouterModule,
    SkeletonModule,
    TranslateModule
  ],
  providers: [
    {
      provide: REMOTE_COMPONENT_CONFIG,
      useValue: new ReplaySubject<RemoteComponentConfig>(1)
    }
  ],
  templateUrl: './avatar-image.component.html',
  styleUrls: ['./avatar-image.component.scss']
})
export class OneCXAvatarImageComponent implements ocxRemoteComponent, ocxRemoteWebcomponent {
  private readonly rcConfig = inject<ReplaySubject<RemoteComponentConfig>>(REMOTE_COMPONENT_CONFIG)
  private readonly avatarService = inject(UserAvatarAPIService)
  // input
  @Input() id: string | undefined = undefined
  @Input() styleClass: string | undefined = undefined // image container
  @Input() imageStyleClass: string | undefined = undefined // image
  @Input() imageStyle: string | undefined = undefined // image
  @Input() imageType: RefType = RefType.Small // image
  // output
  @Input() imageLoaded = new EventEmitter<boolean>()
  @Input() set ocxRemoteComponentConfig(config: RemoteComponentConfig) {
    this.ocxInitRemoteComponent(config)
  }

  public imagePath$ = of(bffImageUrl(this.avatarService.configuration.basePath, 'avatar', this.imageType))
  public placeHolderPath = ''
  public displayImage = false

  ocxInitRemoteComponent(config: RemoteComponentConfig) {
    this.rcConfig.next(config)
    this.placeHolderPath = Location.joinWithSlash(config.baseUrl, environment.DEFAULT_LOGO_PATH)
    this.avatarService.configuration = new Configuration({
      basePath: Location.joinWithSlash(config.baseUrl, environment.apiPrefix)
    })
  }

  public onImageError(): void {
    this.imagePath$ = of(this.placeHolderPath)
    this.imageLoaded.emit(false)
  }
  public onImageLoad(): void {
    this.imageLoaded.emit(true)
    this.displayImage = true
  }
}
