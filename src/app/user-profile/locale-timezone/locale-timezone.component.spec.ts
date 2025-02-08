import { LOCALE_ID, NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { By } from '@angular/platform-browser'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, throwError } from 'rxjs'

import { UserService } from '@onecx/angular-integration-interface'
import { ConfigurationService } from '@onecx/portal-integration-angular'

import { LocalAndTimezoneService } from './service/localAndTimezone.service'
import { LocaleTimezoneComponent } from './locale-timezone.component'

describe('LocaleTimezoneComponent', () => {
  let component: LocaleTimezoneComponent
  let fixture: ComponentFixture<LocaleTimezoneComponent>

  const defaultLanguageItems = [
    { label: 'LANGUAGE.EN', value: 'en' },
    { label: 'LANGUAGE.DE', value: 'de' }
  ]
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

  it('should using default languages', () => {
    configServiceSpy.getProperty.and.returnValue(null)

    component.ngOnChanges()

    expect(component.localeSelectItems).toEqual(defaultLanguageItems)
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
  const userServiceSpy = { hasPermission: jasmine.createSpy('hasPermission').and.returnValue(true) }
  const localeAndTimezoneServiceSpy = { getTimezoneData: jasmine.createSpy('getTimezoneData').and.returnValue(of({})) }

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
        { provide: LocalAndTimezoneService, useValue: localeAndTimezoneServiceSpy },
        { provide: LOCALE_ID, useValue: 'de=DE' }
      ]
    }).compileComponents()
    configServiceSpy.getProperty.and.returnValue('en, de')
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LocaleTimezoneComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    userServiceSpy.hasPermission.calls.reset()
    userServiceSpy.hasPermission.and.returnValue(true)
  })

  it('should throw a timezone error', () => {
    const errorResponse = { status: 404, statusText: 'Not Found' }
    localeAndTimezoneServiceSpy.getTimezoneData.and.returnValue(throwError(() => errorResponse))
    spyOn(console, 'error')

    component.ngOnChanges()

    expect(component.timezoneSelectItems).toEqual([])
    expect(console.error).toHaveBeenCalledWith('getTimezoneData', errorResponse)
  })
})
