import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, Subject } from 'rxjs'
import { tap } from 'rxjs/operators'

import { AvatarInfo } from '@onecx/portal-integration-angular'
import { UserProfileService } from '../user-profile/user-profile.service'

@Injectable({
  providedIn: 'root'
})
export class AvatarUploadService {
  private readonly avatarUrl = './portal-api/v1/userProfile/me/avatar'

  constructor(private readonly http: HttpClient, private readonly userProfileService: UserProfileService) {}

  public setUserAvatar(file: File): Observable<AvatarInfo> {
    const formData = new FormData()
    formData.append('file', file)
    return this.http.put<AvatarInfo>(this.avatarUrl, formData).pipe(
      tap((avatar) => {
        ;(this.userProfileService.getUpdatedAvatar() as Subject<AvatarInfo>).next(avatar)
      })
    )
  }
}
