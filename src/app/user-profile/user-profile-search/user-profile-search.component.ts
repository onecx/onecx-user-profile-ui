import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core'
import { finalize, map } from 'rxjs/operators'
import {
  ColumnType,
  DataTableColumn,
  PortalMessageService,
  DiagramType,
  ExportDataService,
  RowListGridData,
  DiagramColumn,
  Filter,
  DataViewControlTranslations,
  InteractiveDataViewComponent
} from '@onecx/portal-integration-angular'
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'
import { getDateFormat, getTooltipContent } from 'src/app/shared/utils'
import { SelectItem } from 'primeng/api'
import { ActivatedRoute, Router } from '@angular/router'
import { UserProfileAdminAPIService } from 'src/app/shared/generated'
import { BehaviorSubject, combineLatest } from 'rxjs'

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

  /* ocx-data-view-controls settings*/
  @ViewChild(InteractiveDataViewComponent) dataView: InteractiveDataViewComponent | undefined
  // public viewMode = 'grid'
  public quickFilterValue = 'ALL'
  public quickFilterItems: SelectItem[] = []
  public filterValue: string | undefined
  public filterValueDefault = 'displayName,firstName,lastName'
  public filterBy = this.filterValueDefault
  public filterDataView: string | undefined
  public sortOrder = 1
  public defaultSortField = 'displayName'
  public dataViewControlsTranslations: DataViewControlTranslations = {}

  columns: DataTableColumn[] = [
    {
      columnType: ColumnType.STRING,
      id: 'displayName',
      nameKey: 'USERPROFILE_SEARCH.COLUMN_HEADER_NAME.DISPLAYNAME',
      filterable: true,
      sortable: true,
      predefinedGroupKeys: [
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.DEFAULT',
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.EXTENDED',
        'USERPROFILE_SEARCH.PREDEFINED_GROUP.FULL'
      ]
    },
    {
      columnType: ColumnType.STRING,
      id: 'firstName',
      nameKey: 'USERPROFILE_SEARCH.COLUMN_HEADER_NAME.FIRSTNAME',
      filterable: true,
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
      filterable: true,
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
  sortField: string = ''
  filter: Filter[] = []
  getTooltipContent = getTooltipContent
  supportedDiagramTypes: DiagramType[] = [DiagramType.PIE, DiagramType.HORIZONTAL_BAR, DiagramType.VERTICAL_BAR]

  constructor(
    private userProfileAdminService: UserProfileAdminAPIService,
    private fb: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private portalMessageService: PortalMessageService,
    private readonly exportDataService: ExportDataService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.criteriaGroup = this.fb.group({
      firstName: null,
      lastName: null,
      email: null,
      size: 50
    })
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
                return value && value.toString().toLowerCase().includes(lowerCaseFilter)
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
        },
        error: () => {
          console.error('Subscription failed')
        }
      })
  }

  search() {
    let userPersonCriteria = this.criteriaGroup.value
    let criteria = {
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
        next: (data) => {
          if (data.length === 0) {
            this.portalMessageService.success({
              summaryKey: 'USERPROFILE_SEARCH.MESSAGE.SUCCESS',
              detailKey: 'USERPROFILE_SEARCH.MESSAGE.NO_RESULTS'
            })
          }
          clearTimeout(clearTable)
          data = data.map((row: any) => ({
            ...row,
            lastName: row.person.lastName,
            firstName: row.person.firstName,
            displayName: row.person.displayName,
            email: row.person.email
          }))
          this.resultData$.next(data)
          this.filteredData$.next(data)
          this.searchError = false
        },
        error: () => {
          this.searchError = true
        }
      })
  }

  /**
   * UI EVENTS
   */
  public onFilterChange(filter: string): void {
    this.filterData = filter
    this.resultData$.next(this.resultData$.value)
  }

  // public onBack() {
  //   this.router.navigate(['../'], { relativeTo: this.route })
  // }

  // public onGotoProduct(ev: any, product: string) {
  //   ev.stopPropagation()
  //   this.router.navigate(['../', product], { relativeTo: this.route })
  // }
}
