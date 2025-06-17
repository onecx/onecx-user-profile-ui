import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { provideRouter } from '@angular/router'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { BehaviorSubject, of, throwError } from 'rxjs'

import { RowListGridData } from '@onecx/angular-accelerator'
import { PortalMessageService, UserService } from '@onecx/angular-integration-interface'
import { PortalDialogService } from '@onecx/portal-integration-angular'

import { UserProfile, UserProfileAdminAPIService, UserProfilePageResult } from 'src/app/shared/generated'
import { ProfileSearchComponent } from './profile-search.component'

const userProfile1: UserProfile = {
  id: 'id1',
  modificationCount: 27,
  creationDate: '2024-04-24T09:36:40.439905Z',
  creationUser: '359298f8-716e-459b-8962-7669bcb1faa7',
  modificationDate: '2024-04-25T16:14:08.961755Z',
  modificationUser: '359298f8-716e-459b-8962-7669bcb1faa7',
  userId: 'userId1',
  identityProvider: 'keycloak',
  identityProviderId: '',
  organization: '',
  person: {
    modificationCount: 27,
    firstName: 'Admin',
    lastName: 'Keycloak',
    displayName: 'Admin Keycloak',
    email: 'onecx@gm.com'
  },
  accountSettings: {
    modificationCount: 27,
    hideMyProfile: false,
    locale: '',
    timezone: ''
  }
}
const userProfile2: UserProfile = {
  id: 'id2',
  modificationCount: 0,
  creationDate: '2024-04-03T13:25:48.378482Z',
  creationUser: '8472e391-4c11-49c2-8df0-100ec571c7fa',
  modificationDate: '2024-04-03T13:25:48.378482Z',
  modificationUser: '8472e391-4c11-49c2-8df0-100ec571c7fa',
  userId: 'userId2',
  identityProvider: 'keycloak',
  identityProviderId: '',
  organization: '',
  person: {
    modificationCount: 0,
    firstName: 'Max',
    lastName: 'Admin',
    displayName: 'Max Admin',
    email: 'onecx@gm.com'
  },
  accountSettings: {
    modificationCount: 27,
    hideMyProfile: false,
    locale: '',
    timezone: ''
  }
}
const userProfilepageResult: UserProfilePageResult = {
  totalElements: 5,
  number: 0,
  size: 10,
  totalPages: 1,
  stream: [userProfile1, userProfile2]
}

describe('ProfileSearchComponent', () => {
  let component: ProfileSearchComponent
  let fixture: ComponentFixture<ProfileSearchComponent>

  const apiServiceSpy = {
    searchUserProfile: jasmine.createSpy('searchUserProfile').and.returnValue(of({})),
    deleteUserProfile: jasmine.createSpy('deleteUserProfile').and.returnValue(of({}))
  }
  const msgServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['success', 'error', 'info'])
  const mockUserService = {
    lang$: { getValue: jasmine.createSpy('getValue') },
    hasPermission: jasmine.createSpy('hasPermission').and.returnValue(of())
  }
  const mockDialogService = { openDialog: jasmine.createSpy('openDialog').and.returnValue(of({})) }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileSearchComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '', component: ProfileSearchComponent }]),
        { provide: UserProfileAdminAPIService, useValue: apiServiceSpy },
        { provide: PortalMessageService, useValue: msgServiceSpy },
        { provide: UserService, useValue: mockUserService },
        { provide: PortalDialogService, useValue: mockDialogService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()
  })

  beforeEach(async () => {
    fixture = TestBed.createComponent(ProfileSearchComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    msgServiceSpy.success.calls.reset()
    msgServiceSpy.error.calls.reset()
    apiServiceSpy.searchUserProfile.calls.reset()
    apiServiceSpy.deleteUserProfile.calls.reset()
    mockUserService.lang$.getValue.and.returnValue('de')
    mockUserService.hasPermission.and.returnValue(true)
    apiServiceSpy.searchUserProfile.and.returnValue(of({}) as any)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('actions', () => {
    it('should perform page actions', () => {
      spyOn(component, 'onDetail')
      component.additionalActions[0].callback({})
      expect(component.onDetail).toHaveBeenCalled()
      expect(component.additionalActions[0].permission).toEqual('USERPROFILE#ADMIN_EDIT')

      spyOn(component, 'onUserPermissions')
      component.additionalActions[1].callback({})
      expect(component.onUserPermissions).toHaveBeenCalled()

      spyOn(component, 'onDelete')
      component.additionalActions[2].callback({})
      expect(component.onDelete).toHaveBeenCalled()

      expect(component.hasEditPermission).toBeTrue()
      component.hasEditPermission = false
      component.prepareActionButtons()
      expect(component.additionalActions[0].permission).toEqual('USERPROFILE#ADMIN_VIEW')
    })

    it('should not set array for table actions if user does not have view permissions', () => {
      component.additionalActions = []
      component.hasViewPermission = false

      component.prepareActionButtons()

      expect(component.additionalActions).toEqual([])
    })
  })

  describe('simple searching', () => {
    it('should search user profiles - successfully found', () => {
      apiServiceSpy.searchUserProfile.and.returnValue(
        of({ stream: userProfilepageResult.stream } as UserProfilePageResult)
      )

      component.onSearch()

      if (userProfilepageResult.stream) {
        expect(component.resultData$.getValue()?.length).toEqual(userProfilepageResult.stream.length)
        expect(component.resultData$.getValue()?.at(0)?.['firstName']).toEqual(userProfile1?.person?.firstName)
        expect(component.resultData$.getValue()?.at(1)?.['firstName']).toEqual(userProfile2.person?.firstName)
      }
      expect(apiServiceSpy.searchUserProfile).toHaveBeenCalled()
    })

    it('should search user profiles - successful empty stream ', () => {
      apiServiceSpy.searchUserProfile.and.returnValue(of({ stream: [] } as UserProfilePageResult))

      component.onSearch()
      expect(component.resultData$.getValue()?.length).toEqual(0)

      expect(apiServiceSpy.searchUserProfile).toHaveBeenCalled()
      expect(msgServiceSpy.success).toHaveBeenCalledWith({
        summaryKey: 'ACTIONS.SEARCH.MESSAGE.SUCCESS',
        detailKey: 'ACTIONS.SEARCH.MESSAGE.NO_PROFILES'
      })
    })

    it('should search user profiles failed', () => {
      const errorResponse = { status: 403, statusText: 'No permission' }
      apiServiceSpy.searchUserProfile.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.onSearch()

      expect(apiServiceSpy.searchUserProfile).toHaveBeenCalled()
      expect(component.exceptionKey).toEqual('EXCEPTIONS.HTTP_STATUS_' + errorResponse.status + '.PROFILES')
      expect(console.error).toHaveBeenCalledWith('searchUserProfile', errorResponse)
    })

    it('should reset search criteria', () => {
      spyOn(component.criteriaGroup, 'reset')

      component.onResetCriteria()

      expect(component.criteriaGroup.reset).toHaveBeenCalled()
    })
  })

  /**
   * UI EVENTS
   */
  describe('filtering', () => {
    it('should filter user profiles correctly by input (case insensitive)', () => {
      apiServiceSpy.searchUserProfile.and.returnValue(
        of({ stream: userProfilepageResult.stream } as UserProfilePageResult)
      )

      component.onSearch()
      expect(component.filteredData$.getValue()?.length).toEqual(2)

      component.onFilterChange('Admin')
      expect(component.filteredData$.getValue()?.length).toEqual(2)

      component.onFilterChange('admin')
      expect(component.filteredData$.getValue()?.length).toEqual(2)

      component.onFilterChange('Max')
      expect(component.filteredData$.getValue()?.length).toEqual(1)

      component.onFilterChange('Does_not_exist')
      expect(component.filteredData$.getValue()?.length).toEqual(0)
    })
  })

  describe('detail', () => {
    it('should display detail dialog', () => {
      const mockEvent = {
        id: 'id',
        userId: 'userId',
        'person.displayName': 'person.displayName',
        imagePath: ''
      } as RowListGridData

      component.onDetail(mockEvent)

      expect(component.userProfile).toEqual({
        id: 'id',
        userId: 'userId',
        person: { displayName: 'person.displayName' }
      })
      expect(component.displayPersonalDataDialog).toBeTrue()
    })

    it('should close detail dialog', () => {
      component.displayPersonalDataDialog = true

      component.onCloseDetail()

      expect(component.displayPersonalDataDialog).toBeFalse()
    })
  })

  describe('onUserPermission', () => {
    it('should display permission dialog', () => {
      mockDialogService.openDialog.and.returnValue(of({}))
      const mockEvent = {
        id: 'id',
        userId: 'userId',
        'person.displayName': 'displayName',
        imagePath: ''
      } as any

      component.onUserPermissions(mockEvent)

      expect(mockDialogService.openDialog).toHaveBeenCalled()
    })
  })

  describe('delete dialog', () => {
    it('should open dialogue and set userProfile when id match', () => {
      const mockEvent = {
        id: 'id',
        userId: 'uid2',
        'person.displayName': 'person.displayName',
        imagePath: ''
      } as any
      const mockResults: any = [
        { id: '123', userId: 'uid1', person: {}, imagePath: '' },
        { id: 'id', userId: 'uid2', person: {}, imagePath: '' }
      ]
      component.resultData$ = new BehaviorSubject(mockResults)

      component.onDelete(mockEvent)

      expect(component.userProfile).toEqual({ id: 'id', userId: 'uid2', person: {} })
      expect(component.displayDeleteDialog).toBeTrue()
    })

    it('should not open dialogue and set userProfile when id does not match', () => {
      const mockEvent = {
        id: 'id',
        userId: 'userId',
        'person.displayName': 'person.displayName',
        imagePath: ''
      } as any
      const mockResults: any = [
        { id: '123', userId: 'uid1', person: {}, imagePath: '' },
        { id: '456', userId: 'uid2', person: {}, imagePath: '' }
      ]
      component.resultData$ = new BehaviorSubject(mockResults)
      component.userProfile = undefined

      component.onDelete(mockEvent)

      expect(component.userProfile).toBeUndefined()
      expect(component.displayDeleteDialog).toBeFalse()
    })
  })

  describe('deletion', () => {
    it('should delete a user profile successfully', () => {
      apiServiceSpy.deleteUserProfile.and.returnValue(of({}))
      component.userProfile = userProfile1
      component.displayDeleteDialog = true

      component.onDeleteConfirmation()

      expect(component.userProfile).toBeUndefined()
      expect(msgServiceSpy.success).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.DELETE.MESSAGE.OK' })
    })

    it('should display error', () => {
      const errorResponse = { status: 400, statusText: 'Bad Request' }
      apiServiceSpy.deleteUserProfile.and.returnValue(throwError(() => errorResponse))
      component.userProfile = userProfile1
      spyOn(console, 'error')

      component.onDeleteConfirmation()

      expect(msgServiceSpy.error).toHaveBeenCalledWith({ summaryKey: 'ACTIONS.DELETE.MESSAGE.NOK' })
      expect(console.error).toHaveBeenCalledWith('deleteUserProfile', errorResponse)
    })
  })

  /**
   * Language tests
   */
  describe('various', () => {
    it('should set a German date format', () => {
      expect(component.dateFormat).toEqual('dd.MM.yyyy HH:mm')
    })

    it('should set default date format', () => {
      mockUserService.lang$.getValue.and.returnValue('en')
      fixture = TestBed.createComponent(ProfileSearchComponent)
      component = fixture.componentInstance
      fixture.detectChanges()
      expect(component.dateFormat).toEqual('M/d/yy, h:mm a')
    })
  })
})
