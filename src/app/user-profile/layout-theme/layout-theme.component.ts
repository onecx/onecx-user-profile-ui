import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms'
import { SelectItem } from 'primeng/api'
import { MenuModeEnum } from './models/menu-mode'
import { ColorSchemeEnum } from './models/color-scheme'
import { UserProfileAccountSettingsLayoutAndThemeSettings, UserService } from '@onecx/portal-integration-angular'

@Component({
  selector: 'app-layout-theme',
  templateUrl: './layout-theme.component.html'
})
export class LayoutThemeComponent implements OnInit {
  @Input() layoutAndTheme: UserProfileAccountSettingsLayoutAndThemeSettings | undefined
  @Output() layoutAndThemeChange = new EventEmitter<UserProfileAccountSettingsLayoutAndThemeSettings>()
  @Output() public applyChanges = new EventEmitter<boolean>()

  public changedMenuMode = false
  public changedColorScheme = false
  public changedBreadcrumbs = false
  public formGroup: UntypedFormGroup
  public menuModeSelectItems: SelectItem[]
  public colorSchemeSelectItems: SelectItem[]

  constructor(private userService: UserService) {
    this.menuModeSelectItems = [
      { label: 'LAYOUT_THEME.MENU_MODES.HORIZONTAL', value: MenuModeEnum.HORIZONTAL },
      { label: 'LAYOUT_THEME.MENU_MODES.STATIC', value: MenuModeEnum.STATIC },
      { label: 'LAYOUT_THEME.MENU_MODES.OVERLAY', value: MenuModeEnum.OVERLAY },
      { label: 'LAYOUT_THEME.MENU_MODES.SLIM', value: MenuModeEnum.SLIM }
      //{ label: 'LAYOUT_THEME.MENU_MODES.SLIMPLUS', value: MenuModeEnum.SLIMPLUS },
    ]
    this.colorSchemeSelectItems = [
      { label: 'LAYOUT_THEME.COLOR_SCHEMES.AUTO', value: ColorSchemeEnum.AUTO },
      { label: 'LAYOUT_THEME.COLOR_SCHEMES.LIGHT', value: ColorSchemeEnum.LIGHT },
      { label: 'LAYOUT_THEME.COLOR_SCHEMES.DARK', value: ColorSchemeEnum.DARK }
    ]
    this.formGroup = new UntypedFormGroup({
      menuMode: new UntypedFormControl(),
      colorScheme: new UntypedFormControl(),
      breadcrumbs: new UntypedFormControl()
    })
  }

  public ngOnInit(): void {
    if (!this.userService.hasPermission('ACCOUNT_SETTINGS_LAYOUT_MENU#EDIT'))
      // no edit permission
      this.formGroup.get('menuMode')?.disable()
    if (!this.userService.hasPermission('ACCOUNT_SETTINGS_COLOR_SCHEME#EDIT'))
      this.formGroup.get('colorScheme')?.disable() // UI is not ready to offer it
    if (!this.userService.hasPermission('ACCOUNT_SETTINGS_BREADCRUMBS#EDIT'))
      this.formGroup.get('breadcrumbs')?.disable()

    if (this.layoutAndTheme) {
      this.formGroup.patchValue(this.layoutAndTheme)
    }
  }

  public saveMenuMode(): void {
    this.changedMenuMode = true
    this.layoutAndThemeChange.emit(this.formGroup.value)
  }
  public saveColorScheme(): void {
    this.changedColorScheme = true
    this.layoutAndThemeChange.emit(this.formGroup.value)
  }
  public saveBreadcrumbs(): void {
    this.changedBreadcrumbs = true
    this.layoutAndThemeChange.emit(this.formGroup.value)
  }

  public applyChange() {
    this.applyChanges.emit(true)
  }
}
