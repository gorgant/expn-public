import { Injectable } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { Country } from '../models/forms-and-components/geography/country.model';
import { take, map, catchError } from 'rxjs/operators';
import { CountryData } from '../models/forms-and-components/geography/country-data.model';
import { GeographicData } from '../models/forms-and-components/geography/geographic-data.model';

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

  fetchCountryList(): Observable<Country[]> {
    const countryDataDoc = this.afs.collection('publicResources').doc<CountryData>('countryData');

    return countryDataDoc.valueChanges()
      .pipe(
        take(1),
        map(countryData => {
          console.log('Fetched country list', countryData);
          return countryData.countryList;
        }),
        catchError(error => {
          this.uiService.showSnackBar(error, null, 5000);
          return throwError(error);
        })
      );
  }

  fetchGeographicData(): Observable<GeographicData> {
    const geographicDataDoc = this.afs.collection('publicResources').doc<GeographicData>('geographicData');

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
