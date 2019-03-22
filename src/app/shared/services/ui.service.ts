import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  sideNavSignal$ = new Subject<void>();

  constructor() { }

  dispatchSideNavClick() {
    this.sideNavSignal$.next();
  }
}
