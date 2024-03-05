// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

// import { PrivacySettingsComponent } from './privacy-settings.component'
// import { HttpClientTestingModule } from '@angular/common/http/testing'
// import { HttpClient } from '@angular/common/http'
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
// import { HttpLoaderFactory } from '../../shared/shared.module'
// import { AUTH_SERVICE } from '@onecx/portal-integration-angular'
// import { NO_ERRORS_SCHEMA } from '@angular/core'
// import { By } from '@angular/platform-browser'

// describe('PrivacySettingsComponent', () => {
//   let component: PrivacySettingsComponent
//   let fixture: ComponentFixture<PrivacySettingsComponent>

//   const authServiceSpy = jasmine.createSpyObj('AUTH_SERVICE', ['hasPermission'])

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule({
//       declarations: [PrivacySettingsComponent],
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
//       providers: [{ provide: AUTH_SERVICE, useValue: authServiceSpy }]
//     }).compileComponents()
//     authServiceSpy.hasPermission.and.returnValue(true)
//   }))

//   beforeEach(() => {
//     fixture = TestBed.createComponent(PrivacySettingsComponent)
//     component = fixture.componentInstance
//     fixture.detectChanges()
//   })

//   it('should create', () => {
//     expect(component).toBeTruthy()
//     expect(component.formGroup.value['hideMyProfile']).toBeNull()
//     expect(component.formGroup.get('hideMyProfile')?.disabled).toBeFalse()
//   })

//   it('should have hideMyProfile disabled if no permissions', () => {
//     authServiceSpy.hasPermission.and.returnValue(false)

//     component.ngOnInit()

//     expect(component.formGroup.get('hideMyProfile')?.disabled).toBeTrue()
//   })

//   it('should emit true on applyChange', () => {
//     const applyChangesSpy = spyOn(component.applyChanges, 'emit')
//     component.applyChange()

//     expect(applyChangesSpy).toHaveBeenCalledOnceWith(true)
//   })

//   it('should emit formGroup value on saveMenuMode', () => {
//     let privacySettingsRefreshButtonDebugEl = fixture.debugElement.query(By.css('#up_privacy_settings_refresh'))
//     expect(privacySettingsRefreshButtonDebugEl).toBeNull()

//     const privacySettingsChangeSpy = spyOn(component.privacySettingsChange, 'emit')
//     const newFormValue = {
//       hideMyProfile: 'true'
//     }
//     component.formGroup.patchValue(newFormValue)

//     component.savePrivacySettings()
//     fixture.detectChanges()

//     expect(privacySettingsChangeSpy).toHaveBeenCalledOnceWith(newFormValue)
//     privacySettingsRefreshButtonDebugEl = fixture.debugElement.query(By.css('#up_privacy_settings_refresh'))
//     expect(privacySettingsRefreshButtonDebugEl).toBeTruthy()
//   })
// })
