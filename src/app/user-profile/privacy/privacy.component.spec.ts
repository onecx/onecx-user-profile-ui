import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateTestingModule } from 'ngx-translate-testing'

import { UserService } from '@onecx/angular-integration-interface'

import { PrivacyComponent } from './privacy.component'

describe('PrivacyComponent', () => {
  let component: PrivacyComponent
  let fixture: ComponentFixture<PrivacyComponent>

  const authServiceSpy = jasmine.createSpyObj('AUTH_SERVICE', ['hasPermission'])
  const mockUserService = {
    lang$: {
      getValue: jasmine.createSpy('getValue').and.returnValue('en')
    },
    hasPermission: jasmine.createSpy('hasPermission').and.callFake((permission) => {
      return ['ACCOUNT_SETTINGS_PRIVACY#EDIT'].includes(permission)
    })
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PrivacyComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideHttpClientTesting(), provideHttpClient(), { provide: UserService, useValue: mockUserService }]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyComponent)
    component = fixture.componentInstance
  })

  afterEach(() => {
    authServiceSpy.hasPermission.calls.reset()
    authServiceSpy.hasPermission.and.returnValue(true)
  })

  it('should create with permissions', () => {
    fixture.detectChanges()
    expect(component).toBeTruthy()
  })

  it('should create without permissions', () => {
    mockUserService.hasPermission.and.returnValue(false)
    fixture = TestBed.createComponent(PrivacyComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    expect(component).toBeTruthy()
  })

  it('should save privacy settings', () => {
    component.savePrivacySettings()

    expect(component.changedPrivacySettings).toBeTruthy()
  })

  it('should emit applyChange', () => {
    spyOn(component.applyChanges, 'emit')
    component.applyChange()

    expect(component.applyChanges.emit).toHaveBeenCalledWith(true)
  })

  it('should initialize form group', () => {
    component.hideMyProfile = true

    component.ngOnChanges()

    expect(component.formGroup.get('hideMyProfile')?.value).toBeTrue()
  })
})
