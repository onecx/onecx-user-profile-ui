import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core'
import { map } from 'rxjs'
import { Location } from '@angular/common'

import { AppStateService } from '@onecx/angular-integration-interface'
import { environment } from 'src/environments/environment'

/**
 * This component displays the image with given imageURL.
 * A default image is displayed (stored in assets/images), if
 *   - the image URL was not provided
 *   - the image was not found (http status: 404)
 */
@Component({
  selector: 'app-image-container',
  templateUrl: './image-container.component.html'
})
export class ImageContainerComponent implements OnChanges {
  @Input() public id = ''
  @Input() public title = ''
  @Input() public small = false
  @Input() public imageUrl: string | undefined
  @Input() public styleClass: string | undefined
  @Output() imageLoadError = new EventEmitter<boolean>()

  public displayImageUrl: string | undefined
  public defaultImageUrl = ''
  public displayDefaultLogo = false

  constructor(private appState: AppStateService) {
    appState.currentMfe$
      .pipe(
        map((mfe) => {
          this.defaultImageUrl = Location.joinWithSlash(mfe.remoteBaseUrl, environment.DEFAULT_LOGO_PATH)
          this.displayImageUrl = this.imageUrl
        })
      )
      .subscribe()
  }

  public onImageError(): void {
    this.displayDefaultLogo = true
    this.imageLoadError.emit(true)
    this.displayImageUrl = undefined
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.displayDefaultLogo = false
    if (changes['imageUrl']) {
      if (this.imageUrl) this.displayImageUrl = this.imageUrl
      else this.displayDefaultLogo = true
    }
  }
}
