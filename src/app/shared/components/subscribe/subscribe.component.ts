import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SUBSCRIBE_VALIDATION_MESSAGES } from '../../models/validation-messages.model';

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit {

  subscribeForm: FormGroup;
  formValidationMessages = SUBSCRIBE_VALIDATION_MESSAGES;
  emailSubmitted;

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.subscribeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    console.log('Subscribe email submitted');
    this.emailSubmitted = true;
  }

  // These getters are used for easy access in the HTML template
  get email() { return this.subscribeForm.get('email'); }

}
