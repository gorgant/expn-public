import { Injectable } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { take, map, catchError } from 'rxjs/operators';
import { GeographicData } from '../models/forms-and-components/geography/geographic-data.model';
import { FbCollectionPaths } from '../models/routes-and-paths/fb-collection-paths';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  sideNavSignal$ = new Subject<void>();

  constructor(
    private snackbar: MatSnackBar,
    private afs: AngularFirestore,
    private uiService: UiService
  ) { }

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
    const geographicDataDoc = this.afs.collection(FbCollectionPaths.PUBLIC_RESOURCES).doc<GeographicData>('geographicData');

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


}
