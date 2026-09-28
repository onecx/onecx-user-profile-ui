import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { of, throwError } from 'rxjs'
import { TranslateTestingModule } from 'ngx-translate-testing'

import { PortalMessageService } from '@onecx/angular-integration-interface'

import { UserProfileAdminAPIService } from 'src/app/shared/generated'
import { ProfileDeleteComponent } from './profile-delete.component'

describe('ProfileDeleteComponent', () => {
  let component: ProfileDeleteComponent
  let fixture: ComponentFixture<ProfileDeleteComponent>
  let hideDialogSpy: jasmine.Spy
  let deleteDoneSpy: jasmine.Spy

  const adminServiceSpy = {
    deleteUserProfile: jasmine.createSpy('deleteUserProfile').and.returnValue(of({}))
  }
  const messageServiceMock: jasmine.SpyObj<PortalMessageService> = jasmine.createSpyObj<PortalMessageService>(
    'PortalMessageService',
    ['success', 'error']
  )

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProfileDeleteComponent,
        TranslateTestingModule.withTranslations({
          de: require('/src/assets/i18n/de.json'),
          en: require('/src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PortalMessageService, useValue: messageServiceMock },
        { provide: UserProfileAdminAPIService, useValue: adminServiceSpy }
      ]
    })
      .overrideComponent(ProfileDeleteComponent, {
        set: {
          template: '',
          imports: []
        }
      })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileDeleteComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    hideDialogSpy = spyOn(component.hideDialog, 'emit')
    deleteDoneSpy = spyOn(component.deleteDone, 'emit')
  })

  afterEach(() => {
    adminServiceSpy.deleteUserProfile.calls.reset()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should not show the dialog by default', () => {
    expect(component.displayDeleteDialog).toBeFalse()
  })

  it('should close the dialog and notify the caller', () => {
    component.onCloseDialog()

    expect(hideDialogSpy).toHaveBeenCalled()
  })

  describe('delete confirmation', () => {
    it('should delete the user profile successfully', () => {
      component.userProfileId = 'id1'
      adminServiceSpy.deleteUserProfile.and.returnValue(of({}))

      component.onDeleteConfirmation()

      expect(adminServiceSpy.deleteUserProfile).toHaveBeenCalledWith({ id: 'id1' })
      expect(hideDialogSpy).toHaveBeenCalled()
      expect(messageServiceMock.success).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.DELETE.MESSAGE.OK' })
      expect(deleteDoneSpy).toHaveBeenCalled()
    })

    it('should show an error message if the deletion failed', () => {
      component.userProfileId = 'id1'
      const errorResponse = { status: 400, statusText: 'Bad Request' }
      adminServiceSpy.deleteUserProfile.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.onDeleteConfirmation()

      expect(adminServiceSpy.deleteUserProfile).toHaveBeenCalledWith({ id: 'id1' })
      expect(messageServiceMock.error).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.DELETE.MESSAGE.NOK' })
      expect(console.error).toHaveBeenCalledWith('deleteUserProfile', errorResponse)
      expect(deleteDoneSpy).toHaveBeenCalled()
    })

    it('should not call the api if no profile id is set but still trigger the refresh', () => {
      component.userProfileId = undefined

      component.onDeleteConfirmation()

      expect(adminServiceSpy.deleteUserProfile).not.toHaveBeenCalled()
      expect(hideDialogSpy).not.toHaveBeenCalled()
      expect(deleteDoneSpy).toHaveBeenCalled()
    })
  })
})
