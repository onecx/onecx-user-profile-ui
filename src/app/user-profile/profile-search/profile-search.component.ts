import { Component, inject, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core'
import { AsyncPipe, DatePipe } from '@angular/common'
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { BehaviorSubject, catchError, finalize, map, of, Observable } from 'rxjs'

import { PrimeIcons } from 'primeng/api'
import { ButtonModule } from 'primeng/button'
import { DialogModule } from 'primeng/dialog'
import { FloatLabelModule } from 'primeng/floatlabel'
import { InputGroupModule } from 'primeng/inputgroup'
import { InputGroupAddonModule } from 'primeng/inputgroupaddon'
import { InputSwitchModule } from 'primeng/inputswitch'
import { InputTextModule } from 'primeng/inputtext'
import { MessageModule } from 'primeng/message'
import { RippleModule } from 'primeng/ripple'
import { SelectButtonModule } from 'primeng/selectbutton'
import { TooltipModule } from 'primeng/tooltip'

import { SlotService } from '@onecx/angular-remote-components'
import {
  AngularAcceleratorModule,
  ColumnType,
  DataAction,
  DataSortDirection,
  DataTableColumn,
  Filter,
  InteractiveDataViewComponent,
  PortalDialogService,
  RowListGridData
} from '@onecx/angular-accelerator'
import { PortalMessageService, UserService } from '@onecx/angular-integration-interface'
import { PortalPageComponent } from '@onecx/angular-utils'

import { UserProfileAdminAPIService, UserProfile } from 'src/app/shared/generated'

import { PersonalDataAdminComponent } from './personal-data-admin/personal-data-admin.component'
import { UserPermissionsAdminComponent } from './user-permissions-admin/user-permissions-admin.component'

@Component({
  selector: 'app-profile-search',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    AngularAcceleratorModule,
    ButtonModule,
    DialogModule,
    FloatLabelModule,
    FormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputSwitchModule,
    InputTextModule,
    MessageModule,
    RippleModule,
    SelectButtonModule,
    ReactiveFormsModule,
    TooltipModule,
    TranslateModule,
    // components
    PortalPageComponent,
    PersonalDataAdminComponent
  ],
  templateUrl: './profile-search.component.html',
  styleUrls: ['./profile-search.component.scss']
})
export class ProfileSearchComponent implements OnInit {
  private readonly user: UserService = inject(UserService)
  private readonly slotService: SlotService = inject(SlotService)
  private readonly fb: UntypedFormBuilder = inject(UntypedFormBuilder)
  private readonly userProfileAdminService = inject(UserProfileAdminAPIService)
  private readonly portalMessageService: PortalMessageService = inject(PortalMessageService)
  private readonly portalDialogService: PortalDialogService = inject(PortalDialogService)
  private readonly translate: TranslateService = inject(TranslateService)
  // data
  public loading = false
  public exceptionKey: string | undefined
  public criteriaGroup: UntypedFormGroup
  public columns: DataTableColumn[] = []
  public additionalActions: DataAction[] = []

  public resultData$ = new BehaviorSubject<(RowListGridData & UserProfile)[]>([])
  public tableFilter = ''
  public sortField = ''
  public sortDirection: DataSortDirection = DataSortDirection.NONE
  public layout: 'grid' | 'list' | 'table' = 'table'
  public displayedColumnKeys: string[] = []
  private allResultData: (RowListGridData & UserProfile)[] = []

  @ViewChild(InteractiveDataViewComponent) dataView: InteractiveDataViewComponent | undefined
  public dateFormat: string
  public userProfile: UserProfile | undefined
  public displayPersonalDataDialog = false
  public displayDeleteDialog = false
  public hasEditPermission = false
  public hasViewPermission = false
  public adminViewPermissionsSlotName = 'onecx-user-profile-admin-view-permissions'
  public isUserRolesAndPermissionsComponentDefined$: Observable<boolean>

  constructor(@Inject(LOCALE_ID) public readonly locale: string) {
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
        nameKey: 'USER_PROFILE.INTERN.TENANT',
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

  ngOnInit(): void {
    void this.initializePermissionsAndSearch()
  }

  private async initializePermissionsAndSearch(): Promise<void> {
    this.hasEditPermission = await this.user.hasPermission('USERPROFILE#ADMIN_EDIT')
    this.hasViewPermission = await this.user.hasPermission('USERPROFILE#ADMIN_VIEW')
    this.prepareActionButtons()
    this.onSearch()
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
          } else
            stream = stream?.map((row: any) => ({
              ...row,
              lastName: row.person.lastName,
              firstName: row.person.firstName,
              displayName: row.person.displayName,
              email: row.person.email
            }))
          this.allResultData = stream ?? []
          this.applyGlobalFilter()
        }
      })
  }

  public onResetCriteria(): void {
    this.criteriaGroup.reset()
  }

  /**
   * UI EVENTS
   */
  public onGlobalFilter(value: string): void {
    this.tableFilter = value ?? ''
    this.applyGlobalFilter()
  }

  public onClearGlobalFilter(filterInput: HTMLInputElement): void {
    this.tableFilter = ''
    filterInput.value = ''
    this.applyGlobalFilter()
  }

  public onSorted(event: { sortColumn: string; sortDirection: DataSortDirection }): void {
    this.sortField = event.sortColumn
    this.sortDirection = event.sortDirection
  }

  public onDataViewLayoutChange(layout: 'grid' | 'list' | 'table'): void {
    this.layout = layout
  }

  public onDisplayedColumnKeysChange(displayedColumnKeys: string[]): void {
    this.displayedColumnKeys = displayedColumnKeys
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
          inputs: { id: ev['id'], userId: ev['userId'], displayName: ev['displayName'], issuer: ev['issuer'] }
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
        classes: ['p-button-danger'],
        permission: 'USERPROFILE#ADMIN_DELETE',
        callback: (event) => this.onDelete(event)
      }
    ]
  }

  private applyGlobalFilter(): void {
    const normalizedFilter = this.tableFilter.trim().toLocaleLowerCase()
    if (!normalizedFilter) {
      this.resultData$.next(this.allResultData)
      return
    }

    const filteredData = this.allResultData.filter((row) => {
      const filterValues = [
        row['firstName'],
        row['lastName'],
        row['email'],
        row['userId'],
        row['tenantId'],
        row.person?.displayName
      ]
      return filterValues.some((value) => {
        if (value == null) return false
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          return value.toString().toLocaleLowerCase().includes(normalizedFilter)
        }
        return false
      })
    })

    this.resultData$.next(filteredData)
  }
}
