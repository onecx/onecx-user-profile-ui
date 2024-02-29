import { AvatarUploadService } from './avatar-upload.service'
import { UserProfileService } from '../user-profile/user-profile.service'
import { of } from 'rxjs'
import { AvatarInfo } from '@onecx/portal-integration-angular'

let avatarUploadService: AvatarUploadService
let userProfileService: UserProfileService

describe('AvatarUploadService', () => {
  // get is mocked to allow currentUser$ variable in userProfileService to be initialized
  const httpClientSpy = jasmine.createSpyObj('HttpClient', ['put', 'get'])

  beforeEach(async () => {
    userProfileService = new UserProfileService(httpClientSpy)
    avatarUploadService = new AvatarUploadService(httpClientSpy, userProfileService)
    httpClientSpy.put.calls.reset()
  })

  it('should return AvatarInfo on setUserAvatar', (done: DoneFn) => {
    const avatar: AvatarInfo = {
      userUploaded: true,
      lastUpdateTime: new Date(),
      imageUrl: 'image_url',
      smallImageUrl: 'small_image_url'
    }
    httpClientSpy.put.and.returnValue(of(avatar))
    const file: File = new File([''], 'file_name')

    avatarUploadService.setUserAvatar(file).subscribe({
      next: (avatarInfo) => {
        expect(avatarInfo).toEqual(avatar)
        userProfileService.getUpdatedAvatar().subscribe({
          next: (upAvatarInfo) => {
            expect(upAvatarInfo).toEqual(avatar)
          },
          error: done.fail
        })
        done()
      },
      error: done.fail
    })

    const formData = new FormData()
    formData.append('file', file)
    expect(httpClientSpy.put).toHaveBeenCalledOnceWith('./portal-api/v1/userProfile/me/avatar', formData)
  })
})
