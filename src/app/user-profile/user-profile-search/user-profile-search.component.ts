import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { finalize, map } from 'rxjs/operators'
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'

import {
  Action,
  ColumnType,
  DataTableColumn,
  DataViewControlTranslations,
  InteractiveDataViewComponent,
  PortalMessageService,
  RowListGridData,
  UserService
} from '@onecx/portal-integration-angular'
import { UserProfileAdminAPIService } from 'src/app/shared/generated'

@Component({
  selector: 'app-user-profile-search',
  templateUrl: './user-profile-search.component.html',
  styleUrls: ['./user-profile-search.component.scss']
})
export class UserProfileSearchComponent implements OnInit {
  public actions$: Observable<Action[]> | undefined
  private filterData = ''
  public filteredData$ = new BehaviorSubject<RowListGridData[]>([])
  public resultData$ = new BehaviorSubject<RowListGridData[]>([])
  public criteriaGroup: UntypedFormGroup
  public selectedUserName: string | undefined //used in deletion dialog

  /* ocx-data-view-controls settings */
  @ViewChild(InteractiveDataViewComponent) dataView: InteractiveDataViewComponent | undefined
  public userProfile: RowListGridData | undefined
  public filterValue: string | undefined
  public filterBy = 'firstName,lastName,email'
  public filterDataView: string | undefined
  public dataViewControlsTranslations: DataViewControlTranslations = {}
  public dateFormat: string
  public displayDeleteDialog = false
  public displayDetailDialog = false

  public columns: DataTableColumn[]
  public searchInProgress = true
  public searchError = false

  constructor(
    private readonly userProfileAdminService: UserProfileAdminAPIService,
    private readonly user: UserService,
    private readonly fb: UntypedFormBuilder,
    private readonly portalMessageService: PortalMessageService,
    @Inject(LOCALE_ID) public readonly locale: string
  ) {
    this.criteriaGroup = this.fb.group({
      firstName: null,
      lastName: null,
      email: null,
      userId: null,
      size: 50
    })
    this.dateFormat = this.user.lang$.getValue() === 'de' ? 'dd.MM.yyyy HH:mm' : 'M/d/yy, h:mm a'
    this.columns = [
      {
        columnType: ColumnType.STRING,
        id: 'firstName',
        nameKey: 'USER_PROFILE.FIRST_NAME',
        filterable: false,
        sortable: true,
        predefinedGroupKeys: [
          'ACTIONS.SEARCH.PREDEFINED_GROUP.DEFAULT',
          'ACTIONS.SEARCH.PREDEFINED_GROUP.EXTENDED',
          'ACTIONS.SEARCH.PREDEFINED_GROUP.FULL'
        ]
      },
      {
        columnType: ColumnType.STRING,
        id: 'lastName',
        nameKey: 'USER_PROFILE.LAST_NAME',
        filterable: false,
        sortable: true,
        predefinedGroupKeys: [
          'ACTIONS.SEARCH.PREDEFINED_GROUP.DEFAULT',
          'ACTIONS.SEARCH.PREDEFINED_GROUP.EXTENDED',
          'ACTIONS.SEARCH.PREDEFINED_GROUP.FULL'
        ]
      },
      {
        columnType: ColumnType.STRING,
        id: 'email',
        nameKey: 'USER_PROFILE.EMAIL',
        filterable: false,
        sortable: true,
        predefinedGroupKeys: ['ACTIONS.SEARCH.PREDEFINED_GROUP.DEFAULT', 'ACTIONS.SEARCH.PREDEFINED_GROUP.EXTENDED']
      },
      {
        columnType: ColumnType.STRING,
        id: 'tenantId',
        nameKey: 'USER_PROFILE.TENANT',
        filterable: false,
        sortable: true,
        predefinedGroupKeys: ['ACTIONS.SEARCH.PREDEFINED_GROUP.DEFAULT', 'ACTIONS.SEARCH.PREDEFINED_GROUP.EXTENDED']
      },
      {
        columnType: ColumnType.STRING,
        id: 'userId',
        nameKey: 'USER_PROFILE.USER_ID',
        filterable: false,
        sortable: true,
        predefinedGroupKeys: ['ACTIONS.SEARCH.PREDEFINED_GROUP.EXTENDED']
      },
      {
        columnType: ColumnType.DATE,
        id: 'creationDate',
        nameKey: 'INTERNAL.CREATION_DATE',
        filterable: true,
        sortable: true,
        predefinedGroupKeys: ['ACTIONS.SEARCH.PREDEFINED_GROUP.DEFAULT', 'ACTIONS.SEARCH.PREDEFINED_GROUP.EXTENDED']
      },
      {
        columnType: ColumnType.DATE,
        id: 'modificationDate',
        nameKey: 'INTERNAL.MODIFICATION_DATE',
        filterable: true,
        sortable: true,
        predefinedGroupKeys: ['ACTIONS.SEARCH.PREDEFINED_GROUP.DEFAULT', 'ACTIONS.SEARCH.PREDEFINED_GROUP.EXTENDED']
      }
    ]
  }

  ngOnInit() {
    this.initFilter()
    this.onSearch()
  }

  initFilter() {
    this.resultData$
      .pipe(
        map((array) => {
          if (this.filterData.trim()) {
            const lowerCaseFilter = this.filterData.toLowerCase()
            return array.filter((item) => {
              return ['firstName', 'lastName', 'email'].some((key) => {
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
    this.searchInProgress = true
    const userPersonCriteria = this.criteriaGroup.value
    const criteria = {
      userPersonCriteria: userPersonCriteria
    }
    const clearTable = setTimeout(() => {
      this.resultData$.next([])
    }, 500)

    this.userProfileAdminService
      .searchUserProfile(criteria)
      .pipe(
        finalize(() => {
          this.searchInProgress = false
        }),
        map((data: any) => data.stream)
      )
      .subscribe({
        next: (stream) => {
          if (stream.length === 0) {
            this.portalMessageService.success({
              summaryKey: 'ACTIONS.SEARCH.MESSAGE.SUCCESS',
              detailKey: 'ACTIONS.SEARCH.MESSAGE.NO_PROFILES'
            })
          }
          clearTimeout(clearTable)
          stream = stream.map((row: any) => ({
            ...row,
            lastName: row.person.lastName,
            firstName: row.person.firstName,
            displayName: row.person.displayName,
            email: row.person.email
          }))
          this.resultData$.next(stream)
          this.filteredData$.next(stream)
          this.searchError = false
        },
        error: () => {
          this.searchError = true
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

  public onDetail(ev: RowListGridData) {
    this.resultData$
      .pipe(
        map((results) => {
          results.forEach((result) => {
            if (result.id === ev.id) this.userProfile = result
          })
        })
      )
      .subscribe()
    this.displayDetailDialog = true
  }
  public onCloseDetail(): void {
    this.displayDetailDialog = false
  }

  public onDelete(ev: any): void {
    this.selectedUserName = ev.displayName
    this.resultData$
      .pipe(
        map((results) => {
          results.forEach((result) => {
            if (result.id === ev.id) this.userProfile = result
          })
        })
      )
      .subscribe()
    this.displayDeleteDialog = true
  }
  public onDeleteConfirmation(): void {
    const id: any = this.userProfile?.['userId']
    if (id) {
      this.userProfileAdminService.deleteUserProfile({ id: id?.toString() }).subscribe({
        next: () => {
          this.displayDeleteDialog = false
          this.userProfile = undefined
          this.selectedUserName = undefined
          this.portalMessageService.success({ summaryKey: 'ACTIONS.DELETE.MESSAGE.OK' })
        },
        error: () => this.portalMessageService.error({ summaryKey: 'ACTIONS.DELETE.MESSAGE.NOK' })
      })
    }
    this.onSearch()
  }
}
