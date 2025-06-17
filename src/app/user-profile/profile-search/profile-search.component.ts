import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'
import { BehaviorSubject, catchError, finalize, map, of, Observable } from 'rxjs'
import { TranslateService } from '@ngx-translate/core'
import { PrimeIcons } from 'primeng/api'

import { SlotService } from '@onecx/angular-remote-components'
import { DataAction, DataTableColumn, RowListGridData, InteractiveDataViewComponent } from '@onecx/angular-accelerator'
import { PortalMessageService, UserService } from '@onecx/angular-integration-interface'
import { ColumnType, DataViewControlTranslations, PortalDialogService } from '@onecx/portal-integration-angular'

import { UserProfileAdminAPIService, UserProfile } from 'src/app/shared/generated'
import { UserPermissionsAdminComponent } from './user-permissions-admin/user-permissions-admin.component'

@Component({
  selector: 'app-profile-search',
  templateUrl: './profile-search.component.html',
  styleUrls: ['./profile-search.component.scss']
})
export class ProfileSearchComponent implements OnInit {
  public loading = false
  public exceptionKey: string | undefined
  public criteriaGroup: UntypedFormGroup
  public columns: DataTableColumn[] = []
  public additionalActions: DataAction[] = []

  public resultData$ = new BehaviorSubject<(RowListGridData & UserProfile)[]>([])
  public filteredData$ = new BehaviorSubject<(RowListGridData & UserProfile)[]>([])
  public filterValue: string | undefined
  public filterBy = 'firstName,lastName,email,creationDate,modificationDate'
  private filterData = ''

  /* ocx-data-view-controls settings */
  @ViewChild(InteractiveDataViewComponent) dataView: InteractiveDataViewComponent | undefined

  public dataViewControlsTranslations: DataViewControlTranslations = {}
  public dateFormat: string
  public userProfile: UserProfile | undefined
  public displayPersonalDataDialog = false
  public displayDeleteDialog = false
  public hasEditPermission = false
  public hasViewPermission = false
  public adminViewPermissionsSlotName = 'onecx-user-profile-admin-view-permissions'
  public isUserRolesAndPermissionsComponentDefined$: Observable<boolean>

  constructor(
    private readonly userProfileAdminService: UserProfileAdminAPIService,
    private readonly user: UserService,
    private readonly fb: UntypedFormBuilder,
    private readonly portalMessageService: PortalMessageService,
    private readonly portalDialogService: PortalDialogService,
    private readonly slotService: SlotService,
    private readonly userService: UserService,
    private readonly translate: TranslateService,
    @Inject(LOCALE_ID) public readonly locale: string
  ) {
    if (this.userService.hasPermission('USERPROFILE#ADMIN_EDIT')) this.hasEditPermission = true
    if (this.userService.hasPermission('USERPROFILE#ADMIN_VIEW')) this.hasViewPermission = true
    this.criteriaGroup = this.fb.group({
      firstName: null,
      lastName: null,
      email: null,
      userId: null,
      size: 50
    })
    this.dateFormat = this.user.lang$.getValue() === 'de' ? 'dd.MM.yyyy HH:mm' : 'M/d/yy, h:mm a'
    this.isUserRolesAndPermissionsComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(
      this.adminViewPermissionsSlotName
    )
    const commoneColumnSelectionKeys = [
      'ACTIONS.SEARCH.PREDEFINED_GROUP.DEFAULT',
      'ACTIONS.SEARCH.PREDEFINED_GROUP.EXTENDED',
      'ACTIONS.SEARCH.PREDEFINED_GROUP.FULL'
    ]

    this.columns = [
      {
        columnType: ColumnType.STRING,
        id: 'firstName',
        nameKey: 'USER_PROFILE.FIRST_NAME',
        filterable: false,
        sortable: true,
        predefinedGroupKeys: commoneColumnSelectionKeys
      },
      {
        columnType: ColumnType.STRING,
        id: 'lastName',
        nameKey: 'USER_PROFILE.LAST_NAME',
        filterable: false,
        sortable: true,
        predefinedGroupKeys: commoneColumnSelectionKeys
      },
      {
        columnType: ColumnType.STRING,
        id: 'email',
        nameKey: 'USER_PROFILE.EMAIL',
        filterable: false,
        sortable: true,
        predefinedGroupKeys: commoneColumnSelectionKeys
      },
      {
        columnType: ColumnType.STRING,
        id: 'tenantId',
        nameKey: 'USER_PROFILE.TENANT',
        filterable: false,
        sortable: true,
        predefinedGroupKeys: ['ACTIONS.SEARCH.PREDEFINED_GROUP.EXTENDED', 'ACTIONS.SEARCH.PREDEFINED_GROUP.FULL']
      },
      {
        columnType: ColumnType.STRING,
        id: 'userId',
        nameKey: 'USER_PROFILE.USER_ID',
        filterable: false,
        sortable: true,
        predefinedGroupKeys: ['ACTIONS.SEARCH.PREDEFINED_GROUP.EXTENDED', 'ACTIONS.SEARCH.PREDEFINED_GROUP.FULL']
      },
      {
        columnType: ColumnType.DATE,
        id: 'creationDate',
        nameKey: 'INTERNAL.CREATION_DATE',
        filterable: false,
        sortable: true,
        predefinedGroupKeys: commoneColumnSelectionKeys
      },
      {
        columnType: ColumnType.DATE,
        id: 'modificationDate',
        nameKey: 'INTERNAL.MODIFICATION_DATE',
        filterable: false,
        sortable: true,
        predefinedGroupKeys: commoneColumnSelectionKeys
      }
    ]
  }

  ngOnInit() {
    this.initFilter()
    this.prepareActionButtons()
    this.onSearch()
  }

  public initFilter(): void {
    this.resultData$
      .pipe(
        map((array) => {
          if (this.filterData.trim()) {
            const lowerCaseFilter = this.filterData.toLowerCase()
            return array.filter((item) => {
              return ['firstName', 'lastName', 'email', 'creationDate', 'modificationDate'].some((key) => {
                const value = item[key]
                return value?.toString().toLowerCase().includes(lowerCaseFilter)
              })
            })
          } else {
            return array
          }
        })
      )
      .subscribe({
        next: (filteredData) => {
          this.filteredData$.next(filteredData)
        }
      })
  }

  public onSearch(): void {
    this.loading = true
    this.exceptionKey = undefined
    const userPersonCriteria = this.criteriaGroup.value
    const criteria = { userPersonCriteria: userPersonCriteria }
    this.userProfileAdminService
      .searchUserProfile(criteria)
      .pipe(
        map((data: any) => data.stream),
        catchError((err) => {
          this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PROFILES'
          console.error('searchUserProfile', err)
          return of([])
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (stream) => {
          if (stream?.length === 0) {
            this.portalMessageService.success({
              summaryKey: 'ACTIONS.SEARCH.MESSAGE.SUCCESS',
              detailKey: 'ACTIONS.SEARCH.MESSAGE.NO_PROFILES'
            })
          }
          stream = stream?.map((row: any) => ({
            ...row,
            lastName: row.person.lastName,
            firstName: row.person.firstName,
            displayName: row.person.displayName,
            email: row.person.email
          }))
          this.resultData$.next(stream)
          this.filteredData$.next(stream)
        }
      })
  }

  public onResetCriteria(): void {
    this.criteriaGroup.reset()
  }

  /**
   * UI EVENTS
   */
  public onFilterChange(filter: string): void {
    this.filterData = filter
    this.resultData$.next(this.resultData$.value)
  }

  public onDetail(ev: any) {
    this.userProfile = { id: ev.id.toString(), userId: ev.userId, person: { displayName: ev['person.displayName'] } }
    this.displayPersonalDataDialog = true
  }
  public onCloseDetail(): void {
    this.userProfile = undefined
    this.displayPersonalDataDialog = false
    this.displayDeleteDialog = false
  }

  public onDelete(ev: any): void {
    // update person data after the GET fired implizitely by interactive-data-view
    this.resultData$
      .pipe(
        map((data) => {
          data.forEach((up) => {
            if (up.id === ev.id) {
              this.userProfile = { id: up.id, userId: up.userId, person: up.person }
              this.displayDeleteDialog = true
            }
          })
        })
      )
      .subscribe()
  }

  public onDeleteConfirmation(): void {
    if (this.userProfile?.id) {
      this.userProfileAdminService.deleteUserProfile({ id: this.userProfile?.id }).subscribe({
        next: () => {
          this.userProfile = undefined
          this.displayDeleteDialog = false
          this.portalMessageService.success({ summaryKey: 'ACTIONS.DELETE.MESSAGE.OK' })
        },
        error: (err) => {
          console.error('deleteUserProfile', err)
          this.portalMessageService.error({ summaryKey: 'ACTIONS.DELETE.MESSAGE.NOK' })
        }
      })
    }
    this.onSearch()
  }

  public onUserPermissions(ev: any) {
    this.portalDialogService
      .openDialog(
        'ACTIONS.VIEW.PERMISSIONS',
        {
          type: UserPermissionsAdminComponent,
          inputs: { id: ev['id'], userId: ev['userId'], displayName: ev['displayName'] }
        },
        {
          id: 'up_user_permissions_action_close',
          key: 'ACTIONS.GENERAL.CLOSE',
          icon: PrimeIcons.TIMES,
          tooltipKey: 'ACTIONS.GENERAL.CLOSE.TOOLTIP',
          tooltipPosition: 'top'
        },
        undefined,
        {
          modal: true,
          draggable: true,
          resizable: true,
          dismissableMask: true,
          maximizable: true,
          width: '900px'
        }
      )
      .subscribe(() => {})
  }

  public prepareActionButtons(): void {
    if (!this.hasViewPermission) return
    this.additionalActions = [
      {
        id: 'view-n-edit',
        labelKey: 'ACTIONS.VIEW.PERSONAL_DATA',
        icon: this.hasEditPermission ? 'pi pi-pencil' : 'pi pi-eye',
        permission: this.hasEditPermission ? 'USERPROFILE#ADMIN_EDIT' : 'USERPROFILE#ADMIN_VIEW',
        callback: (event) => this.onDetail(event)
      },
      {
        id: 'permissions',
        labelKey: 'ACTIONS.VIEW.PERMISSIONS',
        icon: 'pi pi-lock',
        permission: 'ROLES_PERMISSIONS#ADMIN_VIEW',
        callback: (event) => this.onUserPermissions(event)
      },
      {
        id: 'delete',
        labelKey: 'ACTIONS.DELETE.USER.TOOLTIP',
        icon: 'pi pi-trash',
        classes: ['danger-action-text'],
        permission: 'USERPROFILE#ADMIN_DELETE',
        callback: (event) => this.onDelete(event)
      }
    ]
  }
}
