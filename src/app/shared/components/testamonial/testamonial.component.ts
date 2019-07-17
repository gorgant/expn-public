import { Component, OnInit, Input } from '@angular/core';
import { TestamonialData } from 'shared-models/forms-and-components/testamonial-data.model';

@Component({
  selector: 'app-testamonial',
  templateUrl: './testamonial.component.html',
  styleUrls: ['./testamonial.component.scss']
})
export class TestamonialComponent implements OnInit {

  @Input() testamonialData: TestamonialData;

  constructor() { }

  ngOnInit() {
  }

}
