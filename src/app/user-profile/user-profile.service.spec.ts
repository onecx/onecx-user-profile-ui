import { AvatarInfo } from '@onecx/portal-integration-angular'
import { UserProfileService } from '../user-profile/user-profile.service'
import { of } from 'rxjs'

let userprofileService: UserProfileService

describe('UserProfileService', () => {
  const httpClientSpy = jasmine.createSpyObj('HttpClient', ['put', 'get', 'delete', 'post'])

  const avatarData: AvatarInfo = {}

  beforeEach(async () => {
    userprofileService = new UserProfileService(httpClientSpy)
    httpClientSpy.put.calls.reset()
    httpClientSpy.get.calls.reset()
    httpClientSpy.delete.calls.reset()
    httpClientSpy.post.calls.reset()
  })

  it('should update avatar on removeAvatar', (done: DoneFn) => {
    httpClientSpy.delete.and.returnValue(of({}))

    userprofileService.removeAvatar().subscribe({
      next: () => {
        userprofileService.getUpdatedAvatar().subscribe({
          next: (avatarInfo) => {
            expect(avatarInfo).toBe(undefined)
            done()
          },
          error: done.fail
        })
      }
    })
  })

  it('should update avatar on setUserAvatar', (done: DoneFn) => {
    httpClientSpy.put.and.returnValue(of(avatarData))

    userprofileService.setUserAvatar(new File([''], '')).subscribe({
      next: () => {
        userprofileService.getUpdatedAvatar().subscribe({
          next: (avatarInfo) => {
            expect(avatarInfo).toBe(avatarData)
            done()
          },
          error: done.fail
        })
      }
    })
  })
})
