import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, ReplaySubject, shareReplay, switchMapTo, tap } from 'rxjs'
import {
  AvatarInfo,
  UserPerson,
  UserProfile,
  UserProfileAccountSettings,
  UserProfilePreference
} from '@onecx/portal-integration-angular'

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private url = './portal-api/v1/userProfile/me'
  private personUrl = './portal-api/v1/userProfile/me/userPerson'
  private avatarUrl = './portal-api/v1/userProfile/me/avatar'
  private settingsUrl = './portal-api/v1/userProfile/me/settings'
  private preferencesUrl = './portal-api/v1/userProfile/me/preferences'
  private preferenceUrl = './portal-api/v1/userProfile/me/preference'

  private refreshProfile$ = new ReplaySubject<void>(1)
  private currentAvatar$ = new ReplaySubject<AvatarInfo | undefined>(1)

  private currentUser$: Observable<UserProfile> = this.refreshProfile$.pipe(
    switchMapTo(this.http.get<UserProfile>(this.url)),
    shareReplay(1)
  )

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<UserProfile> {
    return this.currentUser$
  }

  getUpdatedAvatar(): Observable<AvatarInfo | undefined> {
    return this.currentAvatar$
  }

  updatePersonalInfo(person: UserPerson): Observable<UserPerson> {
    return this.http.put(this.personUrl, person)
    // .pipe(tap(() => this.refreshProfile()));
  }

  setUserAvatar(file: File): Observable<AvatarInfo> {
    const formData = new FormData()
    formData.append('file', file)
    return this.http.put<AvatarInfo>(this.avatarUrl, formData).pipe(tap((avatar) => this.currentAvatar$.next(avatar)))
  }

  removeAvatar() {
    return this.http.delete(this.avatarUrl).pipe(tap(() => this.currentAvatar$.next(undefined)))
  }

  updateUserSettings(settings: UserProfileAccountSettings): Observable<UserPerson> {
    return this.http.patch(this.settingsUrl, settings)
  }

  refreshProfile() {
    this.refreshProfile$.next(undefined)
  }

  getUserSettings(): Observable<UserProfileAccountSettings> {
    return this.http.get<UserProfileAccountSettings>(this.settingsUrl)
  }

  getUserPreferences(): Observable<UserProfilePreference[]> {
    return this.http.get<UserProfilePreference[]>(this.preferencesUrl)
  }

  updateUserPreference(preferenceId: string, value: string): Observable<UserProfilePreference> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.patch<UserProfilePreference>(`${this.preferenceUrl}/${preferenceId}`, value, { headers: headers })
  }

  deleteUserPreference(preferenceId: string): Observable<UserProfilePreference[]> {
    return this.http.delete<UserProfilePreference[]>(`${this.preferenceUrl}/${preferenceId}`)
  }

  getCurrentUserFromBE(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.url)
  }
}
