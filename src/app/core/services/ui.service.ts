import { Injectable } from '@angular/core';
import { Subject, Observable, throwError, BehaviorSubject } from 'rxjs';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { take, map, catchError } from 'rxjs/operators';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { GeographicData } from 'shared-models/forms-and-components/geography/geographic-data.model';
import { SharedCollectionPaths } from 'shared-models/routes-and-paths/fb-collection-paths';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  sideNavSignal$ = new Subject<void>();
  screenIsMobile$ = new BehaviorSubject(true);

  constructor(
    private snackbar: MatSnackBar,
    private afs: AngularFirestore,
    private uiService: UiService,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.monitorScreenSize();
   }

  dispatchSideNavClick() {
    this.sideNavSignal$.next();
  }

  showSnackBar(message, action, duration: number) {
    const config = new MatSnackBarConfig();
    config.duration = duration;
    config.panelClass = ['custom-snack-bar']; // CSS managed in global styles.css

    const snackBarRef = this.snackbar.open(message, action, config);
  }

  fetchGeographicData(): Observable<GeographicData> {
    const geographicDataDoc = this.afs.collection(SharedCollectionPaths.PUBLIC_RESOURCES).doc<GeographicData>('geographicData');

    return geographicDataDoc.valueChanges()
      .pipe(
        take(1),
        map(geographicData => {
          console.log('Fetched geographic data', geographicData);
          return geographicData;
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, null, 5000);
          return throwError(error);
        })
      );
  }

  monitorScreenSize() {
    this.breakpointObserver.observe(['(max-width: 959px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          console.log('Mobile screen detected');
          this.screenIsMobile$.next(true);
        } else {
          console.log('Desktop screen detected');
          this.screenIsMobile$.next(false);
        }
      });

  }

  // Remove spaces from url string
  removeSpacesFromString(stringWithSpaces: string): string {
    return stringWithSpaces.replace(/\s/g, '');
  }

  // Replace spaces with dashes and set lower case
  convertToFriendlyUrlFormat(stringWithSpaces: string): string {
    return stringWithSpaces.split(' ').join('-').toLowerCase();
  }


}
