import { Component, OnInit } from '@angular/core'
import { HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs'
import { NgxImageCompressService } from 'ngx-image-compress'

import { UserService, AppStateService, PortalMessageService } from '@onecx/portal-integration-angular'

import { RefType, UserAvatarAPIService } from 'src/app/shared/generated'
import { bffImageUrl } from 'src/app/shared/utils'

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {
  public showAvatarDeleteDialog = false
  public previewSrc: string | undefined
  public imageUrl$: Observable<any> | undefined
  protected placeHolderPath = 'onecx-portal-lib/assets/images/default_avatar.png'

  imageLoadError: boolean | undefined
  imageUrl: string | undefined

  bffImagePath = this.avatarService.configuration.basePath!

  constructor(
    private avatarService: UserAvatarAPIService,
    private msgService: PortalMessageService,
    private userService: UserService,
    private appStateService: AppStateService,
    private imageCompress: NgxImageCompressService
  ) {}

  public ngOnInit(): void {
    this.imageLoadError = false
    this.imageUrl = bffImageUrl(this.bffImagePath, 'avatar', RefType.Large)
  }

  public onDeleteAvatarImage(): void {
    this.showAvatarDeleteDialog = false
    this.avatarService.deleteUserAvatar().subscribe({
      next: () => {
        this.msgService.success({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
        this.windowReload()
      },
      error: () => {
        this.msgService.error({ summaryKey: 'AVATAR.MSG.REMOVE_ERROR' })
      }
    })
  }

  onFileUpload() {
    this.imageCompress.uploadFile().then(({ image }) => {
      this.imageCompress.compressFile(image, 0, 100, 100).then(async (compressedImage) => {
        let bytes = this.imageCompress.byteCount(compressedImage)
        let img = compressedImage
        if (bytes > 100000) {
          img = await this.compressBelowThreshold(img, 100000, 100)
          bytes = this.imageCompress.byteCount(img)
        }
        this.sendImage(img, RefType.Large)
        if (bytes > 10000) {
          img = await this.compressBelowThreshold(img, 10000, 100)
          bytes = this.imageCompress.byteCount(img)
        }
        this.sendImage(img, RefType.Medium)
        if (bytes > 1000) {
          img = await this.compressBelowThreshold(img, 1100, 100)
          bytes = this.imageCompress.byteCount(img)
        }
        this.sendImage(img, RefType.Small)
      })
    })
  }

  private async compressBelowThreshold(image: string, limit: number, quality: number): Promise<string> {
    const img = await this.imageCompress.compressFile(image, 0, quality * 0.95, 100)
    if (this.imageCompress.byteCount(img) > limit) return this.compressBelowThreshold(img, limit, quality * 0.95)
    return img
  }

  /** Send compressed images to avatar ser */
  public sendImage(image: string, refType: RefType): void {
    let base64Png = image.split(',').at(1)!
    const decodedData = atob(base64Png)
    const uint8Array = new Uint8Array(decodedData.length)
    for (let i = 0; i < decodedData.length; ++i) {
      uint8Array[i] = decodedData.charCodeAt(i)
    }
    const blob = new Blob([uint8Array], { type: 'image/*' })

    this.avatarService.uploadAvatar({ refType: refType, body: blob }).subscribe({
      next: (data: any) => {
        if (refType === RefType.Small) {
          localStorage.removeItem('tkit_user_profile')
          this.showUploadSuccess()
          this.windowReload()
        }
      },
      error: (error: HttpErrorResponse) => {
        if (error.error?.errorCode === 'WRONG_AVATAR_CONTENT_TYPE') {
          this.msgService.error({
            summaryKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.SUMMARY',
            detailKey: 'AVATAR.MSG.WRONG_CONTENT_TYPE.DETAIL'
          })
        } else {
          this.msgService.error({
            summaryKey: 'AVATAR.MSG.UPLOAD_ERROR.SUMMARY',
            detailKey: 'AVATAR.MSG.UPLOAD_ERROR.DETAIL'
          })
        }
      }
    })
  }

  public showUploadSuccess(): void {
    this.msgService.success({ summaryKey: 'AVATAR.MSG.UPLOAD_SUCCESS' })
  }

  public onImageError(value: boolean): void {
    this.imageLoadError = value
  }

  public windowReload() {
    window.location.reload()
  }
}
