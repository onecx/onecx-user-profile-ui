// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

// import { LocaleTimezoneComponent } from './locale-timezone.component'
// import { HttpClientTestingModule } from '@angular/common/http/testing'
// import { HttpClient } from '@angular/common/http'
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
// import { HttpLoaderFactory } from '../../shared/shared.module'
// import { AUTH_SERVICE, UserProfileAccountSettingsLocaleAndTimeSettings } from '@onecx/portal-integration-angular'
// import { ConfigurationService } from '@onecx/portal-integration-angular'
// import { LocalAndTimezoneService } from './service/localAndTimezone.service'
// import { LOCALE_ID, NO_ERRORS_SCHEMA } from '@angular/core'
// import { By } from '@angular/platform-browser'
// import { registerLocaleData } from '@angular/common'
// import localeDe from '@angular/common/locales/de'

// describe('LocaleTimezoneComponent', () => {
//   let component: LocaleTimezoneComponent
//   let fixture: ComponentFixture<LocaleTimezoneComponent>

//   const configServiceSpy = jasmine.createSpyObj(ConfigurationService, ['getProperty'])

//   const authServiceSpy = jasmine.createSpyObj('AUTH_SERVICE', ['hasPermission'])
//   registerLocaleData(localeDe)

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule({
//       declarations: [LocaleTimezoneComponent],
//       imports: [
//         HttpClientTestingModule,
//         TranslateModule.forRoot({
//           loader: {
//             provide: TranslateLoader,
//             useFactory: HttpLoaderFactory,
//             deps: [HttpClient]
//           }
//         })
//       ],
//       schemas: [NO_ERRORS_SCHEMA],
//       providers: [
//         { provide: AUTH_SERVICE, useValue: authServiceSpy },
//         { provide: ConfigurationService, useValue: configServiceSpy },
//         LocalAndTimezoneService,
//         { provide: LOCALE_ID, useValue: 'de=DE' }
//       ]
//     }).compileComponents()
//     authServiceSpy.hasPermission
//       .withArgs('ACCOUNT_SETTINGS_LANGUAGE#EDIT')
//       .and.returnValue(true)
//       .withArgs('ACCOUNT_SETTINGS_TIMEZONE#EDIT')
//       .and.returnValue(true)
//     configServiceSpy.getProperty.and.returnValue('en, de')
//   }))

//   beforeEach(() => {
//     fixture = TestBed.createComponent(LocaleTimezoneComponent)
//     component = fixture.componentInstance
//     fixture.detectChanges()
//   })

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

//   it('should use localeTimezone if provided', () => {
//     const localeTimezoneInput: UserProfileAccountSettingsLocaleAndTimeSettings = {
//       locale: 'de',
//       timezone: 'Europe/London'
//     }
//     component.localeTimezone = localeTimezoneInput

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

//   it('should emit formGroup value on saveLocale', () => {
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

//   it('should emit formGroup value on saveTimezone', () => {
//     let timezoneRefreshButtonDebugEl = fixture.debugElement.query(By.css('#up_account_timezone_refresh'))
//     expect(timezoneRefreshButtonDebugEl).toBeNull()

//     const localeTimezoneChangeSpy = spyOn(component.localeTimezoneChange, 'emit')
//     const localeTimezoneValue: UserProfileAccountSettingsLocaleAndTimeSettings = {
//       locale: 'en',
//       timezone: 'Europe/Warsaw'
//     }
//     component.formGroup.patchValue(localeTimezoneValue)

//     component.saveTimezone()
//     fixture.detectChanges()

//     expect(component.timezone).toBe(localeTimezoneValue.timezone!)
//     expect(localeTimezoneChangeSpy).toHaveBeenCalledOnceWith(localeTimezoneValue)
//     timezoneRefreshButtonDebugEl = fixture.debugElement.query(By.css('#up_account_timezone_refresh'))
//     expect(timezoneRefreshButtonDebugEl).toBeTruthy()
//   })

//   it('should emit true on applyChange', () => {
//     const applyChangesSpy = spyOn(component.applyChanges, 'emit')
//     component.applyChange()

//     expect(applyChangesSpy).toHaveBeenCalledOnceWith(true)
//   })
// })
