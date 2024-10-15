import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { UserProfileAccountSettingsLayoutAndThemeSettings, UserService } from '@onecx/portal-integration-angular'

import { LayoutThemeComponent } from './layout-theme.component'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of } from 'rxjs'
import { ColorScheme, MenuMode } from 'src/app/shared/generated'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'

describe('LayoutThemeComponent', () => {
  let component: LayoutThemeComponent
  let fixture: ComponentFixture<LayoutThemeComponent>

  const defaultLayoutAndTheme: UserProfileAccountSettingsLayoutAndThemeSettings = {
    menuMode: 'HORIZONTAL',
    colorScheme: 'LIGHT'
  }

  const userServiceSpy = {
    hasPermission: jasmine.createSpy('hasPermission').and.returnValue(of())
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LayoutThemeComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideHttpClientTesting(), provideHttpClient(), { provide: UserService, useValue: userServiceSpy }]
    }).compileComponents()
    userServiceSpy.hasPermission.and.returnValue(true)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutThemeComponent)
    component = fixture.componentInstance
    component.formGroup.patchValue(defaultLayoutAndTheme)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(component.formGroup.value['menuMode']).toBe(defaultLayoutAndTheme.menuMode)
    expect(component.formGroup.value['colorScheme']).toBe(defaultLayoutAndTheme.colorScheme)
    expect(component.formGroup.value['breadcrumbs']).toBeUndefined()
  })

  it('should not disable menuMode edit if user has no permissions', () => {
    component.ngOnInit()

    expect(component.formGroup.get('menuMode')?.disabled).toBe(false)
    expect(component.formGroup.get('colorScheme')?.disabled).toBe(false)
    expect(component.formGroup.get('breadcrumbs')?.disabled).toBe(true)
  })
})

describe('LayoutThemeComponent', () => {
  let component: LayoutThemeComponent
  let fixture: ComponentFixture<LayoutThemeComponent>

  const defaultLayoutAndTheme: UserProfileAccountSettingsLayoutAndThemeSettings = {
    menuMode: 'HORIZONTAL',
    colorScheme: 'LIGHT'
  }

  const userServiceSpy = {
    hasPermission: jasmine.createSpy('hasPermission').and.returnValue(of())
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LayoutThemeComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideHttpClientTesting(), provideHttpClient(), { provide: UserService, useValue: userServiceSpy }]
    }).compileComponents()
    userServiceSpy.hasPermission.and.returnValue(false)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutThemeComponent)
    component = fixture.componentInstance
    component.formGroup.patchValue(defaultLayoutAndTheme)
    fixture.detectChanges()
  })

  it('should disable menuMode edit if user has no permissions', () => {
    userServiceSpy.hasPermission.and.returnValue(false)

    component.ngOnInit()

    expect(component.formGroup.get('menuMode')?.disabled).toBe(true)
    expect(component.formGroup.get('colorScheme')?.disabled).toBe(true)
    expect(component.formGroup.get('breadcrumbs')?.disabled).toBe(true)
  })

  describe('OnChanges', () => {
    it('should test changes', () => {
      component.colorScheme = ColorScheme.Dark
      component.menuMode = MenuMode.Slimplus
      component.ngOnChanges()

      expect(component.formGroup.get('colorScheme')?.value).toBe(ColorScheme.Dark)
      expect(component.formGroup.get('menuMode')?.value).toBe(MenuMode.Slimplus)
    })

    it('should saveMenuMode', () => {
      spyOn(component.menuModeChange, 'emit')
      component.changedMenuMode = false
      component.colorScheme = ColorScheme.Dark
      component.menuMode = MenuMode.Slimplus
      component.saveMenuMode()

      expect(component.changedMenuMode).toBe(true)
      expect(component.menuModeChange.emit).toHaveBeenCalled()
    })

    it('should saveColorScheme', () => {
      spyOn(component.colorSchemeChange, 'emit')
      component.changedColorScheme = false
      component.colorScheme = ColorScheme.Dark
      component.menuMode = MenuMode.Slimplus
      component.saveColorScheme()

      expect(component.changedColorScheme).toBe(true)
      expect(component.colorSchemeChange.emit).toHaveBeenCalled()
    })

    it('should saveBreadcrumbs', () => {
      spyOn(component.breadcrumbsChange, 'emit')
      component.changedBreadcrumbs = false
      component.colorScheme = ColorScheme.Dark
      component.menuMode = MenuMode.Slimplus
      component.saveBreadcrumbs()

      expect(component.changedBreadcrumbs).toBe(true)
      expect(component.breadcrumbsChange.emit).toHaveBeenCalled()
    })

    it('should applyChange', () => {
      spyOn(component.applyChanges, 'emit')
      component.applyChange()

      expect(component.applyChanges.emit).toHaveBeenCalledWith(true)
    })
  })
})
