import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { UserProfileSearchComponent } from './user-profile-search.component'
import { RouterTestingModule } from '@angular/router/testing'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { UserProfileAdminAPIService, UserProfilePageResult } from 'src/app/shared/generated'

describe('UserProfileSearchComponent', () => {
  let component: UserProfileSearchComponent
  let fixture: ComponentFixture<UserProfileSearchComponent>

  const apiServiceSpy = {
    searchUserProfile: jasmine.createSpy('searchUserProfile').and.returnValue(of({}))
  }

  let userProfilepageResult: UserProfilePageResult = {
    totalElements: 5,
    number: 0,
    size: 10,
    totalPages: 1,
    stream: [
      {
        id: '19d3f099-b403-4a41-bf0a-5656c6c674de',
        modificationCount: 27,
        creationDate: '2024-04-24T09:36:40.439905Z',
        creationUser: '359298f8-716e-459b-8962-7669bcb1faa7',
        modificationDate: '2024-04-25T16:14:08.961755Z',
        modificationUser: '359298f8-716e-459b-8962-7669bcb1faa7',
        userId: '359298f8-716e-459b-8962-7669bcb1faa7',
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
      },
      {
        id: '5b9ea1c5-0add-44b6-bdc1-0a76421a4b47',
        modificationCount: 0,
        creationDate: '2024-04-03T13:25:48.378482Z',
        creationUser: '8472e391-4c11-49c2-8df0-100ec571c7fa',
        modificationDate: '2024-04-03T13:25:48.378482Z',
        modificationUser: '8472e391-4c11-49c2-8df0-100ec571c7fa',
        userId: '8472e391-4c11-49c2-8df0-100ec571c7fa',
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
    ]
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserProfileSearchComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      providers: [{ provide: UserProfileAdminAPIService, useValue: apiServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()
  })

  beforeEach(async () => {
    fixture = TestBed.createComponent(UserProfileSearchComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should search user profiles - successful found', () => {
    apiServiceSpy.searchUserProfile.and.returnValue(
      of({ stream: userProfilepageResult.stream } as UserProfilePageResult)
    )

    component.search()
    expect(component.resultData$.getValue()?.length).toEqual(userProfilepageResult.stream!.length)
    expect(component.resultData$.getValue()?.at(0)?.['firstName']).toEqual(
      userProfilepageResult.stream!.at(0)?.person?.firstName
    )
    expect(component.resultData$.getValue()?.at(1)?.['firstName']).toEqual(
      userProfilepageResult.stream!.at(1)?.person?.firstName
    )

    expect(apiServiceSpy.searchUserProfile).toHaveBeenCalled()
  })

  it('should filter user profiles correctly by input (case insensitive)', () => {
    apiServiceSpy.searchUserProfile.and.returnValue(
      of({ stream: userProfilepageResult.stream } as UserProfilePageResult)
    )

    component.search()
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

  // it('should sort user profiles correctly by sorted parameter', (done) => {

  // })

  // it('should allow switch between grid and table', (done) => {
  // })
})
