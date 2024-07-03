import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { PrivacySettingsComponent } from './privacy-settings.component'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { HttpClient } from '@angular/common/http'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { AUTH_SERVICE, AppStateService, createTranslateLoader } from '@onecx/portal-integration-angular'
import { NO_ERRORS_SCHEMA } from '@angular/core'

describe('PrivacySettingsComponent', () => {
  let component: PrivacySettingsComponent
  let fixture: ComponentFixture<PrivacySettingsComponent>

  const authServiceSpy = jasmine.createSpyObj('AUTH_SERVICE', ['hasPermission'])

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PrivacySettingsComponent],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          isolate: true,
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient, AppStateService]
          }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: AUTH_SERVICE, useValue: authServiceSpy }]
    }).compileComponents()
    authServiceSpy.hasPermission.and.returnValue(true)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacySettingsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    // expect(component.formGroup.value['hideMyProfile']).toBeNull()
    // expect(component.formGroup.get('hideMyProfile')?.disabled).toBeFalse()
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
})
