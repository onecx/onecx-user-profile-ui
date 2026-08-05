import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core'
import { AsyncPipe } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { catchError, map, Observable, of, tap } from 'rxjs'
import { TranslateModule, TranslateService } from '@ngx-translate/core'

import { PortalMessageService } from '@onecx/angular-integration-interface'
import { Action, AngularAcceleratorModule } from '@onecx/angular-accelerator'
import { PortalPageComponent } from '@onecx/angular-utils'

import {
  UserProfileAPIService,
  UserPerson,
  UserProfile,
  UpdateUserPersonContactRequest
} from 'src/app/shared/generated'

import { PersonalDataComponent } from 'src/app/shared/personal-data/personal-data.component'

@Component({
  selector: 'app-personal-data-user',
  standalone: true,
  imports: [AsyncPipe, AngularAcceleratorModule, PortalPageComponent, TranslateModule, PersonalDataComponent],
  templateUrl: './personal-data-user.component.html'
})
export class PersonalDataUserComponent implements AfterViewInit {
  public readonly translate = inject(TranslateService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly userProfileService = inject(UserProfileAPIService)
  private readonly msgService = inject(PortalMessageService)
  private readonly cdRef = inject(ChangeDetectorRef)
  // input
  @Input() public displayPersonalDataDialog = false
  @Input() public userProfileId: any
  @Output() public hideDialog = new EventEmitter<boolean>()

  public exceptionKey: string | undefined = undefined
  public actions$: Observable<Action[]> | undefined
  public messages: { [key: string]: string } = {}
  public componentInUse = false
  public userProfile$ = this.userProfileService.getMyUserProfile().pipe(
    tap(() => {
      this.prepareActionButtons()
    }),
    catchError((err) => {
      this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PROFILE'
      console.error('getMyUserProfile', err)
      return of({})
    })
  )

  public ngAfterViewInit() {
    this.componentInUse = true
    this.cdRef.detectChanges()
  }

  public onPersonUpdate(person: UserPerson, profile: UserProfile): void {
    const updatePayload: UpdateUserPersonContactRequest = {
      modificationCount: profile.modificationCount!,
      address: person.address,
      phone: person.phone
    }
    this.userProfileService.updateMyUserProfileContact({ updateUserPersonContactRequest: updatePayload }).subscribe({
      next: (updatedProfile) => {
        this.showMessage('success')
        this.userProfile$ = new Observable((prof) => prof.next({ ...updatedProfile }))
      },
      error: (err) => {
        this.showMessage('error')
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PROFILE'
        console.error('updateMyUserProfileContact', err)
      }
    })
  }

  public showMessage(severity: 'success' | 'error'): void {
    severity === 'success'
      ? this.msgService.success({ summaryKey: 'USER_PROFILE.MSG.SAVE_SUCCESS' })
      : this.msgService.error({ summaryKey: 'USER_PROFILE.MSG.SAVE_ERROR' })
  }

  private prepareActionButtons(): void {
    this.actions$ = this.translate
      .get([
        'SETTINGS.NAVIGATION.LABEL',
        'SETTINGS.NAVIGATION.TOOLTIP',
        'USER_PERMISSIONS.NAVIGATION.LABEL',
        'USER_PERMISSIONS.NAVIGATION.TOOLTIP'
      ])
      .pipe(
        map((data) => {
          return [
            {
              label: data['SETTINGS.NAVIGATION.LABEL'],
              title: data['SETTINGS.NAVIGATION.TOOLTIP'],
              actionCallback: () => this.router.navigate(['./account'], { relativeTo: this.route }),
              permission: 'ACCOUNT_SETTINGS#VIEW',
              icon: 'pi pi-cog',
              show: 'always'
            },
            {
              label: data['USER_PERMISSIONS.NAVIGATION.LABEL'],
              title: data['USER_PERMISSIONS.NAVIGATION.TOOLTIP'],
              actionCallback: () => this.router.navigate(['./permissions'], { relativeTo: this.route }),
              permission: 'ROLES_PERMISSIONS#VIEW',
              icon: 'pi pi-lock',
              show: 'always'
            }
          ]
        })
      )
  }
}
