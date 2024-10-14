import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core'
import { BehaviorSubject, combineLatest, Observable } from 'rxjs'
import { finalize, map } from 'rxjs/operators'
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'
import { getDateFormat, getTooltipContent } from 'src/app/shared/utils'
import { SelectItem } from 'primeng/api'

import {
  ColumnType,
  DataTableColumn,
  PortalMessageService,
  DiagramType,
  RowListGridData,
  DiagramColumn,
  Filter,
  DataViewControlTranslations,
  InteractiveDataViewComponent,
  Action,
  UserService
} from '@onecx/portal-integration-angular'
import { UserProfileAdminAPIService } from 'src/app/shared/generated'

@Component({
  selector: 'app-user-profile-search',
  templateUrl: './user-profile-search.component.html'
})
export class UserProfileSearchComponent implements OnInit {
  resultData$ = new BehaviorSubject<RowListGridData[]>([])
  filteredData$ = new BehaviorSubject<RowListGridData[]>([])
  filterData = ''
  combined$ = combineLatest([this.resultData$, this.filteredData$])
  filterValueSubject = new BehaviorSubject<string>('')
  diagramColumn: DiagramColumn | undefined
  criteriaGroup: UntypedFormGroup
  sumKey = 'USERPROFILE_SEARCH.DIAGRAM.SUM'
  subtitleLineIds: string[] = ['firstName', 'lastName', 'email']
  public actions$: Observable<Action[]> | undefined

  /* ocx-data-view-controls settings*/
  @ViewChild(InteractiveDataViewComponent) dataView: InteractiveDataViewComponent | undefined
  public userProfile: RowListGridData | undefined
  public quickFilterValue = 'ALL'
  public quickFilterItems: SelectItem[] = []
  public filterValue: string | undefined
  public filterValueDefault = 'displayName,firstName,lastName'
  public filterBy = this.filterValueDefault
  public filterDataView: string | undefined
  public sortOrder = 1
  public defaultSortField = 'displayName'
  public dataViewControlsTranslations: DataViewControlTranslations = {}
  public dateFormat: string
  public displayDeleteDialog = false
  public displayDetailDialog = false

  columns: DataTableColumn[] = [
    {
      columnType: ColumnType.STRING,
      id: 'firstName',
      nameKey: 'USERPROFILE_SEARCH.COLUMN_HEADER_NAME.FIRSTNAME',
      filterable: false,
      sortable: true,
      predefinedGroupKeys: [
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.DEFAULT',
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.EXTENDED',
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.FULL'
      ]
    },
    {
      columnType: ColumnType.STRING,
      id: 'lastName',
      nameKey: 'USERPROFILE_SEARCH.COLUMN_HEADER_NAME.LASTNAME',
      filterable: false,
      sortable: true,
      predefinedGroupKeys: [
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.DEFAULT',
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.EXTENDED',
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.FULL'
      ]
    },
    {
      columnType: ColumnType.STRING,
      id: 'email',
      nameKey: 'USERPROFILE_SEARCH.COLUMN_HEADER_NAME.EMAIL',
      filterable: false,
      sortable: true,
      predefinedGroupKeys: [
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.DEFAULT',
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.EXTENDED'
      ]
    },
    {
      columnType: ColumnType.STRING,
      id: 'userId',
      nameKey: 'USERPROFILE_SEARCH.COLUMN_HEADER_NAME.ID',
      filterable: false,
      sortable: true,
      predefinedGroupKeys: [
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.DEFAULT',
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.EXTENDED'
      ]
    },
    {
      columnType: ColumnType.DATE,
      id: 'creationDate',
      nameKey: 'USERPROFILE_SEARCH.COLUMN_HEADER_NAME.CREATION_DATE',
      filterable: true,
      sortable: true,
      predefinedGroupKeys: [
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.DEFAULT',
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.EXTENDED'
      ]
    },
    {
      columnType: ColumnType.DATE,
      id: 'modificationDate',
      nameKey: 'USERPROFILE_SEARCH.COLUMN_HEADER_NAME.MODIFICATION_DATE',
      filterable: true,
      sortable: true,
      predefinedGroupKeys: [
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.DEFAULT',
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.EXTENDED'
      ]
    }
  ]

  createDialogVisible = false
  searchExecuted = false
  searchError = false
  getDateFormat = getDateFormat
  statusOptions!: any[]
  selectedStatus: SelectItem[] | undefined
  deleteDialogVisible: boolean | undefined
  deleteEventId: string | undefined
  deleteEventName: string | undefined
  selectedStatusOptions: SelectItem[] = []
  columnId = 'status'
  column = this.columns.find((e) => e.id === this.columnId)
  sortField = ''
  filter: Filter[] = []
  getTooltipContent = getTooltipContent
  supportedDiagramTypes: DiagramType[] = [DiagramType.PIE, DiagramType.HORIZONTAL_BAR, DiagramType.VERTICAL_BAR]

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
  }

  ngOnInit() {
    this.sortField = 'displayName'
    this.filter = [
      {
        columnId: 'displayName',
        value: 'displayName'
      }
    ]
    this.statusOptions = []
    this.search()
    this.initFilter()
  }

  initFilter() {
    this.resultData$
      .pipe(
        map((array) => {
          if (this.filterData.trim()) {
            const lowerCaseFilter = this.filterData.toLowerCase()
            return array.filter((item) => {
              return ['firstName', 'lastName', 'displayName', 'email'].some((key) => {
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

  search() {
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
          this.searchExecuted = true
        }),
        map((data: any) => data.stream)
      )
      .subscribe({
        next: (stream) => {
          if (stream.length === 0) {
            this.portalMessageService.success({
              summaryKey: 'USERPROFILE_SEARCH.MESSAGE.SUCCESS',
              detailKey: 'USERPROFILE_SEARCH.MESSAGE.NO_RESULTS'
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

  public resetCriteria(): void {
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

  public onDelete(ev: RowListGridData): void {
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
          this.portalMessageService.success({ summaryKey: 'ACTIONS.DELETE.MESSAGE.OK' })
        },
        error: () => this.portalMessageService.error({ summaryKey: 'ACTIONS.DELETE.MESSAGE.NOK' })
      })
    }
    this.search()
  }
}
