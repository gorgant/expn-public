import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @HostBinding('class.component-body') fullWidth = true;

  // @HostBinding('class.component-body') fullWidth = false;

  constructor() { }

  ngOnInit() {
    // this.fullWidth = true;
  }

}
