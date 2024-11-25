import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { PrivacySettingsComponent } from './privacy-settings.component'
import { HttpClient, provideHttpClient } from '@angular/common/http'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { AppStateService, createTranslateLoader } from '@onecx/portal-integration-angular'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'

describe('PrivacySettingsComponent', () => {
  let component: PrivacySettingsComponent
  let fixture: ComponentFixture<PrivacySettingsComponent>

  const authServiceSpy = jasmine.createSpyObj('AUTH_SERVICE', ['hasPermission'])

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PrivacySettingsComponent],
      imports: [
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
      providers: [provideHttpClientTesting(), provideHttpClient()]
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
