import { Component, OnInit, Input } from '@angular/core';
import { BuyNowBoxData } from 'src/app/core/models/forms-and-components/buy-now-box-data.model';
import { IconPaths } from 'src/app/core/models/routes-and-paths/icon-paths.model';

@Component({
  selector: 'app-buy-now-box',
  templateUrl: './buy-now-box.component.html',
  styleUrls: ['./buy-now-box.component.scss']
})
export class BuyNowBoxComponent implements OnInit {

  @Input() buyNowData: BuyNowBoxData;

  iconPaths = IconPaths;

  title: string;
  subtitle: string;
  buttonText: string;

  constructor() { }

  ngOnInit() {

    this.initializeInputData();
  }

  private initializeInputData() {
    this.title = this.buyNowData.title;
    this.subtitle = this.buyNowData.subtitle;
    this.buttonText = this.buyNowData.buttonText;
  }

}
