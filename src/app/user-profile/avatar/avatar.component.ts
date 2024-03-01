import { Component, ElementRef, Inject, OnInit, Optional, ViewChild } from '@angular/core'
import { HttpErrorResponse } from '@angular/common/http'

import {
  AUTH_SERVICE,
  AvatarInfo,
  IAuthService,
  MFE_INFO,
  MfeInfo,
  PortalMessageService
} from '@onecx/portal-integration-angular'

import { UserProfileService } from '../user-profile.service'
import { AvatarUploadService } from '../../shared/avatar-upload.service'
import { environment } from '../../../environments/environment'

@Component({
  selector: 'up-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {
  @ViewChild('selectedFileInput') selectedFileInput: ElementRef | undefined
  public selectedFile: File | undefined
  public userAvatar: AvatarInfo | undefined
  public showAvatarDeleteDialog = false
  public previewSrc: string | undefined
  public imageUrl?: string
  public apiPrefix = environment.BASE_PATH
  public placeHolderPath = 'onecx-portal-lib/assets/images/default_avatar.png'

  @ViewChild('avatarImage', { read: ElementRef, static: true })
  public avatarImage!: ElementRef

  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService,
    @Optional() @Inject(MFE_INFO) private readonly mfeInfo: MfeInfo,
    private readonly upService: UserProfileService,
    private readonly avatarService: AvatarUploadService,
    private msgService: PortalMessageService
  ) {}

  public ngOnInit(): void {
    this.userAvatar = this.authService.getCurrentUser()?.avatar
    this.prepareAvatarImageUrl()
  }

  private prepareAvatarImageUrl(): void {
    // if image URL does not start with a http, then it stored in the backend. So we need to put prefix in front
    if (this.userAvatar?.imageUrl && !this.userAvatar.imageUrl.match(/^(http|https)/g)) {
      this.imageUrl = this.apiPrefix + this.userAvatar.imageUrl
    } else {
      this.imageUrl = this.userAvatar?.imageUrl
        ? this.userAvatar.imageUrl
        : // this.mfeInfo is available only in non standalone mode
          (this.mfeInfo?.remoteBaseUrl ? this.mfeInfo.remoteBaseUrl : './') + this.placeHolderPath
    }
  }

  public onDeleteAvatarImage(): void {
    this.userAvatar = undefined
    this.showAvatarDeleteDialog = false
    this.upService.removeAvatar().subscribe({
      next: () => {
        this.msgService.success({ summaryKey: 'AVATAR.MSG.REMOVE_SUCCESS' })
        this.reloadWindow()
      },
      error: () => {
        this.msgService.error({ summaryKey: 'AVATAR.MSG.REMOVE_ERROR' })
      }
    })
    this.imageUrl = (this.mfeInfo?.remoteBaseUrl ? this.mfeInfo.remoteBaseUrl : './') + this.placeHolderPath
  }

  public reloadWindow(): void {
    window.location.reload()
  }

  /* Displays latest image in UI */
  private updateImage(): void {
    if (this.selectedFile) {
      const reader = new FileReader()
      reader.readAsDataURL(this.selectedFile)
      reader.onload = (): void => {
        if (reader.result) {
          this.userAvatar = {
            smallImageUrl: reader.result.toString(),
            imageUrl: reader.result.toString()
          }
        }
      }
    }
  }

  private checkDimension(file: File): void {
    const reader = new FileReader()
    const img = new Image()

    reader.onload = (e: any) => {
      img.src = e.target.result.toString()

      img.onload = () => {
        const elem = document.createElement('canvas')
        elem.width = 400
        elem.height = 400
        const ctx = elem.getContext('2d')
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ctx!.drawImage(img, 0, 0, 400, 400)
        elem.toBlob((blob) => {
          if (blob) {
            this.selectedFile = new File([blob], 'untitled', { type: blob.type })
          }
        })
        this.previewSrc = elem.toDataURL()
      }
    }
    reader.readAsDataURL(file)
  }

  // Extract image file(s)
  onFileUpload(ev: Event): void {
    if (ev.target && (ev.target as HTMLInputElement).files) {
      const files = (ev.target as HTMLInputElement).files
      if (files) {
        // this.selectedFile
        Array.from(files).forEach((file) => {
          this.selectedFile = file
          this.checkDimension(this.selectedFile)
          this.uploadImage()
        })
      }
    }
  }

  public showUploadSuccess(): void {
    this.msgService.success({ summaryKey: 'AVATAR.MSG.UPLOAD_SUCCESS' })
  }

  public uploadImage(): void {
    if (this.authService.getAuthProviderName().toLowerCase().includes('mock')) {
      this.updateImage()
      this.showUploadSuccess()
      return
    }
    // revert to userProfileService once BFF is fixed
    this.selectedFile &&
      this.avatarService.setUserAvatar(this.selectedFile).subscribe(
        (data) => {
          this.showUploadSuccess()
          localStorage.removeItem('tkit_user_profile')
          this.reloadWindow()

          this.userAvatar = data
          this.prepareAvatarImageUrl()
        },
        (error: HttpErrorResponse) => {
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
      )
  }
}
