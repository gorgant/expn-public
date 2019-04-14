import { Component, OnInit, Input } from '@angular/core';
import { TestamonialData } from 'src/app/core/models/forms-and-components/testamonial-data.model';

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
