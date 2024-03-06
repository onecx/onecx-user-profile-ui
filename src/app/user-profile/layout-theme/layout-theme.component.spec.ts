// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
// import { HttpClientTestingModule } from '@angular/common/http/testing'
// import { HttpClient } from '@angular/common/http'
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
// import { HttpLoaderFactory } from '../../shared/shared.module'
// import { AUTH_SERVICE, UserProfileAccountSettingsLayoutAndThemeSettings } from '@onecx/portal-integration-angular'

// import { LayoutThemeComponent } from './layout-theme.component'
// import { NO_ERRORS_SCHEMA } from '@angular/core'
// import { By } from '@angular/platform-browser'

// describe('LayoutThemeComponent', () => {
//   let component: LayoutThemeComponent
//   let fixture: ComponentFixture<LayoutThemeComponent>

//   const defaultLayoutAndTheme: UserProfileAccountSettingsLayoutAndThemeSettings = {
//     menuMode: 'HORIZONTAL',
//     colorScheme: 'LIGHT'
//   }

//   const authServiceSpy = jasmine.createSpyObj('AUTH_SERVICE', ['hasPermission'])

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule({
//       declarations: [LayoutThemeComponent],
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
//     authServiceSpy.hasPermission
//       .withArgs('ACCOUNT_SETTINGS_LAYOUT_MENU#EDIT')
//       .and.returnValue(true)
//       .withArgs('ACCOUNT_SETTINGS_COLOR_SCHEME#EDIT')
//       .and.returnValue(true)
//       .withArgs('ACCOUNT_SETTINGS_BREADCRUMBS#EDIT')
//       .and.returnValue(true)
//   }))

//   beforeEach(() => {
//     fixture = TestBed.createComponent(LayoutThemeComponent)
//     component = fixture.componentInstance
//     component.formGroup.patchValue(defaultLayoutAndTheme)
//     fixture.detectChanges()
//   })

//   it('should create', () => {
//     expect(component).toBeTruthy()
//     expect(component.formGroup.value['menuMode']).toBe(defaultLayoutAndTheme.menuMode)
//     expect(component.formGroup.get('menuMode')?.disabled).toBe(false)
//     expect(component.formGroup.value['colorScheme']).toBe(defaultLayoutAndTheme.colorScheme)
//     expect(component.formGroup.get('colorScheme')?.disabled).toBe(false)
//     expect(component.formGroup.value['breadcrumbs']).toBeNull()
//     expect(component.formGroup.get('breadcrumbs')?.disabled).toBe(false)
//   })

//   it('should disable menuMode edit if user has no permissions', () => {
//     authServiceSpy.hasPermission.withArgs('ACCOUNT_SETTINGS_LAYOUT_MENU#EDIT').and.returnValue(false)

//     component.ngOnInit()

//     expect(component.formGroup.get('menuMode')?.disabled).toBe(true)
//     expect(component.formGroup.get('colorScheme')?.disabled).toBe(false)
//     expect(component.formGroup.get('breadcrumbs')?.disabled).toBe(false)
//   })

//   it('should disable colorScheme edit if user has no permissions', () => {
//     authServiceSpy.hasPermission.withArgs('ACCOUNT_SETTINGS_COLOR_SCHEME#EDIT').and.returnValue(false)

//     component.ngOnInit()

//     expect(component.formGroup.get('menuMode')?.disabled).toBe(false)
//     expect(component.formGroup.get('colorScheme')?.disabled).toBe(true)
//     expect(component.formGroup.get('breadcrumbs')?.disabled).toBe(false)
//   })

//   it('should disable breadcrumbs edit if user has no permissions', () => {
//     authServiceSpy.hasPermission.withArgs('ACCOUNT_SETTINGS_BREADCRUMBS#EDIT').and.returnValue(false)

//     component.ngOnInit()

//     expect(component.formGroup.get('menuMode')?.disabled).toBe(false)
//     expect(component.formGroup.get('colorScheme')?.disabled).toBe(false)
//     expect(component.formGroup.get('breadcrumbs')?.disabled).toBe(true)
//   })

//   it('should use layoutAndTheme input if provided', () => {
//     const newLayoutAndTheme: UserProfileAccountSettingsLayoutAndThemeSettings = {
//       menuMode: 'STATIC',
//       colorScheme: 'AUTO'
//     }
//     component.layoutAndTheme = newLayoutAndTheme

//     component.ngOnInit()

//     expect(component.formGroup.value['menuMode']).toBe(newLayoutAndTheme.menuMode)
//     expect(component.formGroup.value['colorScheme']).toBe(newLayoutAndTheme.colorScheme)
//     expect(component.formGroup.value['breadcrumbs']).toBeNull()
//   })

//   it('should emit formGroup value on saveMenuMode', () => {
//     let menuModeRefreshButtonDebugEl = fixture.debugElement.query(By.css('#up_layout_theme_menu_mode_refresh'))
//     expect(menuModeRefreshButtonDebugEl).toBeNull()

//     const layoutAndThemeChangeSpy = spyOn(component.layoutAndThemeChange, 'emit')
//     const layoutAndTheme: UserProfileAccountSettingsLayoutAndThemeSettings = {
//       menuMode: 'SLIM',
//       colorScheme: defaultLayoutAndTheme.colorScheme
//     }
//     const newFormValue = {
//       ...layoutAndTheme,
//       breadcrumbs: null
//     }
//     component.formGroup.patchValue(newFormValue)

//     component.saveMenuMode()
//     fixture.detectChanges()

//     expect(layoutAndThemeChangeSpy).toHaveBeenCalledOnceWith(newFormValue)
//     menuModeRefreshButtonDebugEl = fixture.debugElement.query(By.css('#up_layout_theme_menu_mode_refresh'))
//     expect(menuModeRefreshButtonDebugEl).toBeTruthy()
//   })

//   it('should emit formGroup value on saveColorScheme', () => {
//     let colorSchemeRefreshButtonDebugEl = fixture.debugElement.query(By.css('#up_layout_theme_color_scheme_refresh'))
//     expect(colorSchemeRefreshButtonDebugEl).toBeNull()

//     const layoutAndThemeChangeSpy = spyOn(component.layoutAndThemeChange, 'emit')
//     const layoutAndTheme: UserProfileAccountSettingsLayoutAndThemeSettings = {
//       menuMode: defaultLayoutAndTheme.menuMode,
//       colorScheme: 'DARK'
//     }
//     const newFormValue = {
//       ...layoutAndTheme,
//       breadcrumbs: null
//     }
//     component.formGroup.patchValue(newFormValue)

//     component.saveColorScheme()
//     fixture.detectChanges()

//     expect(layoutAndThemeChangeSpy).toHaveBeenCalledOnceWith(newFormValue)
//     colorSchemeRefreshButtonDebugEl = fixture.debugElement.query(By.css('#up_layout_theme_color_scheme_refresh'))
//     expect(colorSchemeRefreshButtonDebugEl).toBeTruthy()
//   })

//   it('should emit formGroup value on saveBreadcrumbs', () => {
//     let breadcrumbsRefreshButtonDebugEl = fixture.debugElement.query(By.css('#up_layout_theme_breadcrumbs_refresh'))
//     expect(breadcrumbsRefreshButtonDebugEl).toBeNull()

//     const layoutAndThemeChangeSpy = spyOn(component.layoutAndThemeChange, 'emit')
//     const newFormValue = {
//       ...defaultLayoutAndTheme,
//       breadcrumbs: true
//     }
//     component.formGroup.patchValue(newFormValue)

//     component.saveBreadcrumbs()
//     fixture.detectChanges()

//     expect(layoutAndThemeChangeSpy).toHaveBeenCalledOnceWith(newFormValue)
//     breadcrumbsRefreshButtonDebugEl = fixture.debugElement.query(By.css('#up_layout_theme_breadcrumbs_refresh'))
//     expect(breadcrumbsRefreshButtonDebugEl).toBeTruthy()
//   })

//   it('should emit true on applyChange', () => {
//     const applyChangesSpy = spyOn(component.applyChanges, 'emit')
//     component.applyChange()

//     expect(applyChangesSpy).toHaveBeenCalledOnceWith(true)
//   })
// })
