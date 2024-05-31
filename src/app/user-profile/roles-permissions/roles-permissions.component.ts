import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { MenuItem } from 'primeng/api'
import { Table } from 'primeng/table'

import { Membership, PortalMessageService, UserService } from '@onecx/portal-integration-angular'
import { UserProfileAPIService, UserPerson } from 'src/app/shared/generated'
import { PermissionRowitem } from './models/permissionRowItem'
import { environment } from '../../../environments/environment'
import { Observable, map } from 'rxjs'

@Component({
  selector: 'app-roles-permissions',
  templateUrl: './roles-permissions.component.html',
  styleUrls: ['./roles-permissions.component.scss']
})
export class RolesPermissionsComponent implements OnInit {
  public personalInfo$: Observable<UserPerson>
  public memberships: Membership[] = []
  public roles: string[] = []
  environment = environment
  public myPermissions = new Array<string>() // permissions of the user

  public permissionItems: PermissionRowitem[] = []
  public items: MenuItem[] = []
  public cols = [{}]
  public selectedColumns = [{}]
  public sortValue = ''
  public visibility = false
  public activeItem: MenuItem | undefined
  public infoMessage: string | undefined
  public errorMessage: string | undefined
  @ViewChild('permissionTable') permissionTable: Table | undefined
  @ViewChild('permissionTableFilterInput') permissionTableFilter: ElementRef | undefined

  constructor(
    private readonly router: Router,
    private userService: UserService,
    private readonly userProfileService: UserProfileAPIService,
    private msgService: PortalMessageService
  ) {
    this.personalInfo$ = this.userProfileService.getMyUserProfile().pipe(map((profile) => profile.person || {}))
    if (userService.hasPermission('ROLES_PERMISSIONS#VIEW')) this.myPermissions.push('ROLES_PERMISSIONS#VIEW')
  }

  public ngOnInit(): void {
    this.loadProfileData()
    this.sortValue = 'ROLE_PERMISSIONS.APPLICATION'
    this.cols = [
      { field: 'name', header: 'ROLE_PERMISSIONS.NAME' },
      { field: 'resource', header: 'ROLE_PERMISSIONS.RESOURCE' },
      { field: 'action', header: 'ROLE_PERMISSIONS.ACTION' },
      { field: 'role', header: 'ROLE_PERMISSIONS.ROLE' },
      { field: 'application', header: 'ROLE_PERMISSIONS.APPLICATION' }
    ]
    this.items = [
      { label: 'ROLE_PERMISSIONS.TABS.PERMISSIONS', icon: 'fa-calendar', id: 'tabPerm' },
      { label: 'ROLE_PERMISSIONS.TABS.ROLES', icon: 'fa-bar-chart', id: 'tabRole' }
    ]
    this.activeItem = this.items[0]
    this.selectedColumns = this.cols
  }

  public loadProfileData(): void {
    // const userMemberships = this.authService.getCurrentUser()?.memberships
    // if (userMemberships) {
    //   this.memberships = userMemberships
    // }
    this.roles = []
    // = this.authService.getUserRoles().sort()
    this.createPermissionData()
  }

  public createPermissionData(): void {
    const result: PermissionRowitem[] = []

    this.memberships.forEach((m) => {
      m.roleMemberships &&
        m.roleMemberships.forEach((r) => {
          r.permissions?.forEach((p) => {
            result.push({
              name: p.name,
              key: p.key,
              resource: p.resource,
              action: p.action,
              role: r.role,
              application: m.application
            })
          })
        })
    })
    this.permissionItems = result.sort(this.sortPermissionRowitemByName)
  }

  private sortPermissionRowitemByName(a: PermissionRowitem, b: PermissionRowitem): number {
    return (a.name ? (a.name as string).toUpperCase() : '').localeCompare(
      b.name ? (b.name as string).toUpperCase() : ''
    )
  }

  public applyGlobalFilter($event: Event, primengTable: Table): void {
    primengTable.filterGlobal(($event.target as HTMLInputElement).value, 'contains')
  }

  public refresh(): void {
    if (this.environment.production) {
      // this.userProfileService.getCurrentUserFromBE().subscribe(
      //   () => {
      //     //TODO what is this ?
      //     // ;(this.authService as KeycloakAuthService).userProfile = profileData
      //     // localStorage.setItem('tkit_user_profile', JSON.stringify(profileData))
      //     // ;(this.authService as KeycloakAuthService)['updateUserFromUserProfile'](
      //     //   (this.authService as KeycloakAuthService).userProfile
      //     // )
      //     this.loadProfileData()
      //     this.msgService.info({ summaryKey: 'ROLE_PERMISSIONS.MSG.PERMISSIONS_REFRESH_INFO' })
      //   },
      //   (err: any) => {
      //     this.msgService.error({ summaryKey: 'ROLE_PERMISSIONS.MSG.PERMISSIONS_REFRESH_ERROR' })
      //     console.error(err)
      //   }
      // )
    } else {
      console.error('Cannot refresh in non production mode')
    }
  }

  public close(): void {
    void this.router.navigateByUrl('/')
  }

  public onClearFilterPermissionTable(): void {
    if (this.permissionTableFilter) {
      this.permissionTableFilter.nativeElement.value = ''
    }
    this.permissionTable?.clear()
    this.loadProfileData()
  }
}
