import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of } from 'rxjs'

import { UserService } from '@onecx/angular-integration-interface'
import { UserProfileAccountSettingsLayoutAndThemeSettings } from '@onecx/portal-integration-angular'

import { ColorScheme, MenuMode } from 'src/app/shared/generated'

import { LayoutThemeComponent } from './layout-theme.component'

describe('LayoutThemeComponent', () => {
  let component: LayoutThemeComponent
  let fixture: ComponentFixture<LayoutThemeComponent>

  const defaultLayoutAndTheme: UserProfileAccountSettingsLayoutAndThemeSettings = {
    menuMode: 'HORIZONTAL',
    colorScheme: 'LIGHT'
  }
  const mockUserService = jasmine.createSpyObj('UserService', ['hasPermission'])
  mockUserService.hasPermission.and.callFake((permission: string) => {
    return ['ACCOUNT_SETTINGS_LAYOUT_MENU#EDIT', 'ACCOUNT_SETTINGS_COLOR_SCHEME#EDIT'].includes(permission)
  })

  function setUp() {
    const fixture = TestBed.createComponent(LayoutThemeComponent)
    const component = fixture.componentInstance
    fixture.detectChanges()
    return { fixture, component }
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
      providers: [provideHttpClientTesting(), provideHttpClient(), { provide: UserService, useValue: mockUserService }]
    }).compileComponents()

    mockUserService.hasPermission.and.returnValue(true)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutThemeComponent)
    component = fixture.componentInstance
    component.formGroup.patchValue(defaultLayoutAndTheme)
    fixture.detectChanges()
  })

  it('should disable menuMode edit if user has no permissions', () => {
    mockUserService.hasPermission.and.returnValue(false)
    const { component } = setUp()

    component.ngOnInit()

    expect(component.formGroup.get('menuMode')?.disabled).toBe(true)
    expect(component.formGroup.get('colorScheme')?.disabled).toBe(true)
    expect(component.formGroup.get('breadcrumbs')?.disabled).toBe(true)

    component.menuModeOptions$.subscribe()
    component.colorSchemeOptions$.subscribe()
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
