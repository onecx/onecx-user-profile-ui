import { Component, Input, OnChanges } from '@angular/core'
import { Location } from '@angular/common'
import { HttpErrorResponse } from '@angular/common/http'
import { catchError, map, Observable, of } from 'rxjs'
import { NgxImageCompressService } from 'ngx-image-compress'

import { PortalMessageService, UserService } from '@onecx/portal-integration-angular'

import { RefType, UserAvatarAdminAPIService, UserAvatarAPIService } from 'src/app/shared/generated'
import { bffImageUrl } from 'src/app/shared/utils'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnChanges {
  @Input() adminView: boolean = false
  @Input() userProfileId: string | undefined = undefined
  public showAvatarDeleteDialog = false
  public previewSrc: string | undefined
  public imageUrl$: Observable<any> | undefined
  protected placeHolderPath = 'onecx-portal-lib/assets/images/default_avatar.png'
  public editPermission: string = ''

  imageLoadError: boolean | undefined
  imageUrl: string | undefined

  bffImagePath = this.avatarService.configuration.basePath

  constructor(
    private readonly avatarAdminService: UserAvatarAdminAPIService,
    private readonly avatarService: UserAvatarAPIService,
    private readonly location: Location,
    private readonly user: UserService,
    private readonly msgService: PortalMessageService,
    private readonly imageCompress: NgxImageCompressService
  ) {}

  public ngOnChanges(): void {
    this.imageUrl = undefined
    if (this.userProfileId) {
      this.getUserAvatarImage()
      if (this.user.hasPermission('USERPROFILE#ADMIN_EDIT')) this.editPermission = 'USERPROFILE#ADMIN_EDIT'
    } else {
      this.imageUrl = bffImageUrl(this.bffImagePath, 'avatar', RefType.Large)
      if (this.user.hasPermission('PROFILE_AVATAR#EDIT')) this.editPermission = 'PROFILE_AVATAR#EDIT'
    }
  }

  private getUserAvatarImage() {
    this.imageLoadError = false
    this.avatarAdminService
      .getUserAvatarById({ id: this.userProfileId!, refType: RefType.Large })
      .pipe(
        map((data) => {
          if (data) this.imageUrl = URL.createObjectURL(data)
          else this.imageLoadError = true
        }),
        catchError((error) => {
          console.error('getUserAvatarById', error)
          return of(new Blob([]))
        })
      )
      .subscribe()
  }
  public onDeleteAvatarImage(): void {
    this.showAvatarDeleteDialog = false
    this.imageUrl = ''
    this.imageLoadError = false
    if (this.userProfileId) {
      this.avatarAdminService.deleteUserAvatarById({ id: this.userProfileId }).subscribe({
        next: () => {
          this.imageLoadError = true
          this.msgService.success({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
        },
        error: (error) => {
          console.error('deleteUserAvatarById()', error)
          this.msgService.error({ summaryKey: 'AVATAR.MSG.REMOVE_ERROR' })
        }
      })
    } else {
      this.avatarService.deleteUserAvatar().subscribe({
        next: () => {
          this.imageLoadError = true
          this.msgService.success({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
          if (!this.adminView) this.reloadPage()
        },
        error: (error) => {
          console.error('deleteUserAvatar()', error)
          this.msgService.error({ summaryKey: 'AVATAR.MSG.REMOVE_ERROR' })
        }
      })
    }
  }

  onFileUpload() {
    this.imageCompress.uploadFile().then(({ image }) => {
      this.imageCompress.compressFile(image, 0, 100, 100).then(async (compressedImage) => {
        let bytes = this.imageCompress.byteCount(compressedImage)
        let img = compressedImage
        // Large
        if (bytes > environment.AVATAR_SIZE_LARGE) {
          img = await this.compressByRatio(img, environment.AVATAR_SIZE_LARGE) // limit by service: 110.000
          bytes = this.imageCompress.byteCount(img)
        }
        this.sendImage(img, RefType.Large)
        // Medium
        if (bytes > environment.AVATAR_SIZE_MEDIUM) {
          img = await this.compressByRatio(img, environment.AVATAR_SIZE_MEDIUM)
          bytes = this.imageCompress.byteCount(img)
        }
        this.sendImage(img, RefType.Medium)
        // Small (topbar icon)
        if (bytes > environment.AVATAR_SIZE_SMALL) {
          img = await this.compressByRatio(img, environment.AVATAR_SIZE_SMALL) // below 3000 the image has too low quality
        }
        this.sendImage(img, RefType.Small)
      })
    })
  }

  /* Rescale the image by suitable scale factor in a few steps */
  private async compressByRatio(image: string, limit: number): Promise<string> {
    const ratio = this.calculateRatio(this.imageCompress.byteCount(image), limit)
    const img = await this.imageCompress.compressFile(image, 0, ratio, 100)
    if (this.imageCompress.byteCount(img) > limit) {
      return this.compressByRatio(img, limit)
    } else return img
  }
  /* Calculate the scale factor to avoid to many compression steps */
  private calculateRatio(bytes: number, targetSize: number): number {
    const proportion = parseFloat(parseFloat('' + bytes / targetSize).toFixed(1))
    const ratio = Math.round(100 / proportion)
    return ratio >= 100 ? 97 : ratio // a change by compression is mandatory
  }

  /* Send compressed images to avatar service */
  public sendImage(image: string, refType: RefType): void {
    const base64Png = image.split(',').at(1) ?? ''
    const decodedData = atob(base64Png)
    const uint8Array = new Uint8Array(decodedData.length)
    for (let i = 0; i < decodedData.length; ++i) {
      uint8Array[i] = decodedData.charCodeAt(i)
    }
    const blob = new Blob([uint8Array], { type: 'image/*' })

    this.imageUrl = undefined
    if (this.userProfileId) {
      // admin perspective: upload only, refresh large image
      this.avatarAdminService.uploadAvatarById({ id: this.userProfileId, refType, body: blob }).subscribe({
        next: () => {
          if (refType === RefType.Large) {
            localStorage.removeItem('tkit_user_profile')
            this.msgService.success({ summaryKey: 'AVATAR.MSG.UPLOAD_SUCCESS' })
            this.getUserAvatarImage()
          }
        },
        error: (error: HttpErrorResponse) => {
          this.imageLoadError = true
          if (error.error?.errorCode === 'WRONG_CONTENT_TYPE') {
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
    } else {
      // user perspective: upload and reload
      this.avatarService.uploadAvatar({ refType: refType, body: blob }).subscribe({
        next: () => {
          if (refType === RefType.Large) {
            localStorage.removeItem('tkit_user_profile')
            this.msgService.success({ summaryKey: 'AVATAR.MSG.UPLOAD_SUCCESS' })
            this.imageUrl = URL.createObjectURL(blob)
          }
          if (refType === RefType.Small) this.reloadPage()
        },
        error: (error: HttpErrorResponse) => {
          if (error.error?.errorCode === 'WRONG_CONTENT_TYPE') {
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
  }

  public onImageError(value: boolean): void {
    this.imageLoadError = value
  }

  public reloadPage() {
    this.location.historyGo(0) // load current page = reload (trick for code coverage)
  }
}
