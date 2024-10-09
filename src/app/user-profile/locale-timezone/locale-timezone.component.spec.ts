import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { LocaleTimezoneComponent } from './locale-timezone.component'
import { ConfigurationService, UserService } from '@onecx/portal-integration-angular'
import { LOCALE_ID, NO_ERRORS_SCHEMA } from '@angular/core'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { LocalAndTimezoneService } from './service/localAndTimezone.service'
import { of, throwError } from 'rxjs'
import { HttpErrorResponse, HttpEventType, HttpHeaders, provideHttpClient } from '@angular/common/http'
import { By } from '@angular/platform-browser'
import { provideHttpClientTesting, HttpClientTestingModule } from '@angular/common/http/testing'

describe('LocaleTimezoneComponent', () => {
  let component: LocaleTimezoneComponent
  let fixture: ComponentFixture<LocaleTimezoneComponent>

  const configServiceSpy = jasmine.createSpyObj(ConfigurationService, ['getProperty'])

  const userServiceSpy = {
    hasPermission: jasmine.createSpy('hasPermission').and.returnValue(true)
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LocaleTimezoneComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClientTesting(),
        provideHttpClient(),
        { provide: ConfigurationService, useValue: configServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: LOCALE_ID, useValue: 'de=DE' }
      ]
    }).compileComponents()

    configServiceSpy.getProperty.and.returnValue('en, de')
  }))

  beforeEach(() => {
    userServiceSpy.hasPermission.calls.reset()
    userServiceSpy.hasPermission.and.returnValue(true)
    fixture = TestBed.createComponent(LocaleTimezoneComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(component.locale).toBe('en')
    expect(component.timezone).toBe('Europe/Berlin')

    expect(component.editLanguage).toBe(true)
    expect(component.editTimezone).toBe(true)
  })

  it('should apply Changes', () => {
    component.localeInput = 'gb'
    component.timezoneInput = 'HST'
    component.ngOnChanges()
    expect(component.formGroup.value['locale']).toEqual('gb')
    expect(component.formGroup.value['timezone']).toEqual('HST')
  })

  it('should saveLocale', () => {
    component.localeInput = 'gb'
    component.timezoneInput = 'HST'
    component.ngOnChanges()
    component.saveLocale()

    expect(component.locale).toEqual('gb')
    expect(component.changedLanguage).toEqual(true)
  })

  it('should saveTimezone', () => {
    component.timezoneInput = 'HST'
    component.ngOnChanges()
    component.saveTimezone()

    expect(component.timezone).toEqual('HST')
    expect(component.changedTimezone).toEqual(true)
  })

  it('should applyChange', () => {
    spyOn(component.applyChanges, 'emit')
    component.ngOnChanges()
    component.applyChange()

    expect(component.applyChanges.emit).toHaveBeenCalled()
  })

  //   it('should create', () => {
  //     expect(component).toBeTruthy()
  //     expect(component.locale).toBe('en')
  //     expect(component.timezone).toBe('Europe/Berlin')
  //     expect(component.localeSelectItems).toEqual([
  //       {
  //         label: 'LANGUAGE.' + 'EN',
  //         value: 'en'
  //       },
  //       {
  //         label: 'LANGUAGE.' + 'DE',
  //         value: 'de'
  //       }
  //     ])
  //     expect(component.timezoneUTC).toBe('GMT +1')
  //     const editableLanguageElement = fixture.debugElement.query(By.css('#up_account_language_editable'))
  //     expect(editableLanguageElement).toBeTruthy()
  //     const uneditableLanguageElement = fixture.debugElement.query(By.css('#up_account_language_uneditable'))
  //     expect(uneditableLanguageElement).toBeFalsy()
  //     const editableTimezoneElement = fixture.debugElement.query(By.css('#up_account_timezone_editable'))
  //     expect(editableTimezoneElement).toBeTruthy()
  //     const uneditableTimezoneElement = fixture.debugElement.query(By.css('#up_account_timezone_uneditable'))
  //     expect(uneditableTimezoneElement).toBeFalsy()
  //   })

  //   xit('should use localeTimezone if provided', () => {
  //     const localeTimezoneInput: UserProfileAccountSettingsLocaleAndTimeSettings = {
  //       locale: 'de',
  //       timezone: 'Europe/London'
  //     }
  //     component.timezone = localeTimezoneInput

  //     component.ngOnInit()

  //     expect(component.locale).toBe(localeTimezoneInput.locale!)
  //     expect(component.timezone).toBe(localeTimezoneInput.timezone!)
  //     expect(component.timezoneUTC).toBe('GMT +0')
  //   })

  //   it('should allow to select other languages based on configuration', () => {
  //     configServiceSpy.getProperty.and.returnValue('pr, pl')

  //     component.ngOnInit()

  //     expect(component.localeSelectItems).toEqual([
  //       {
  //         label: 'LANGUAGE.' + 'PR',
  //         value: 'pr'
  //       },
  //       {
  //         label: 'LANGUAGE.' + 'PL',
  //         value: 'pl'
  //       }
  //     ])
  //   })

  //   it('when has no edit language permissions', () => {
  //     authServiceSpy.hasPermission.withArgs('ACCOUNT_SETTINGS_LANGUAGE#EDIT').and.returnValue(false)

  //     component.ngOnInit()
  //     fixture.detectChanges()

  //     const editableLanguageElement = fixture.debugElement.query(By.css('#up_account_language_editable'))
  //     expect(editableLanguageElement).toBeFalsy()
  //     const uneditableLanguageElement = fixture.debugElement.query(By.css('#up_account_language_uneditable'))
  //     expect(uneditableLanguageElement).toBeTruthy()
  //   })

  //   it('when has no edit timezone permissions', () => {
  //     authServiceSpy.hasPermission.withArgs('ACCOUNT_SETTINGS_TIMEZONE#EDIT').and.returnValue(false)

  //     component.ngOnInit()
  //     fixture.detectChanges()

  //     const editableTimezoneElement = fixture.debugElement.query(By.css('#up_account_timezone_editable'))
  //     expect(editableTimezoneElement).toBeFalsy()
  //     const uneditableTimezoneElement = fixture.debugElement.query(By.css('#up_account_timezone_uneditable'))
  //     expect(uneditableTimezoneElement).toBeTruthy()
  //   })

  //   xit('should emit formGroup value on saveLocale', () => {
  //     let localeRefreshButtonDebugEl = fixture.debugElement.query(By.css('#up_account_locale_refresh'))
  //     expect(localeRefreshButtonDebugEl).toBeNull()

  //     const localeTimezoneChangeSpy = spyOn(component.localeTimezoneChange, 'emit')
  //     const localeTimezoneValue: UserProfileAccountSettingsLocaleAndTimeSettings = {
  //       locale: 'de',
  //       timezone: 'Europe/Berlin'
  //     }
  //     component.formGroup.patchValue(localeTimezoneValue)

  //     component.saveLocale()
  //     fixture.detectChanges()

  //     expect(component.locale).toBe(localeTimezoneValue.locale!)
  //     expect(localeTimezoneChangeSpy).toHaveBeenCalledOnceWith(localeTimezoneValue)
  //     localeRefreshButtonDebugEl = fixture.debugElement.query(By.css('#up_account_locale_refresh'))
  //     expect(localeRefreshButtonDebugEl).toBeTruthy()
  //   })

  it('should emit formGroup value on saveTimezone', () => {
    const timezoneRefreshButtonDebugEl = fixture.debugElement.query(By.css('#up_account_timezone_refresh'))
    expect(timezoneRefreshButtonDebugEl).toBeNull()

    const localeTimezoneChangeSpy = spyOn(component.timezoneChange, 'emit')
    const localeTimezoneValue = {
      locale: 'en',
      timezone: 'Europe/Warsaw'
    }
    component.formGroup.patchValue(localeTimezoneValue)

    component.saveTimezone()
    fixture.detectChanges()

    expect(component.timezone).toBe(localeTimezoneValue.timezone)
    expect(localeTimezoneChangeSpy).toHaveBeenCalled()
    expect(component.changedTimezone).toBeTrue()
  })
})

describe('LocaleTimezoneComponent Error', () => {
  let component: LocaleTimezoneComponent
  let fixture: ComponentFixture<LocaleTimezoneComponent>

  const configServiceSpy = jasmine.createSpyObj(ConfigurationService, ['getProperty'])

  const userServiceSpy = {
    hasPermission: jasmine.createSpy('hasPermission').and.returnValue(true)
  }

  const localeAndTimezoneServiceSpy = {
    getTimezoneData: jasmine.createSpy('getTimezoneData').and.returnValue(of({}))
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LocaleTimezoneComponent],
      imports: [
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ConfigurationService, useValue: configServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: LocalAndTimezoneService, useValue: localeAndTimezoneServiceSpy },
        { provide: LOCALE_ID, useValue: 'de=DE' }
      ]
    }).compileComponents()
    configServiceSpy.getProperty.and.returnValue('en, de')
  }))

  beforeEach(() => {
    userServiceSpy.hasPermission.calls.reset()
    userServiceSpy.hasPermission.and.returnValue(true)

    fixture = TestBed.createComponent(LocaleTimezoneComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should throw a timezone error', () => {
    const updateErrorResponse: HttpErrorResponse = {
      status: 404,
      statusText: 'Not Found',
      name: 'HttpErrorResponse',
      message: '',
      error: undefined,
      ok: false,
      headers: new HttpHeaders(),
      url: null,
      type: HttpEventType.ResponseHeader
    }

    localeAndTimezoneServiceSpy.getTimezoneData.and.returnValue(throwError(() => updateErrorResponse))

    component.ngOnChanges()
    expect(component.timezoneSelectItems).toEqual([])
  })
})
