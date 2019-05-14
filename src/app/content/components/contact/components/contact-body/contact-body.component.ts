import { Component, OnInit } from '@angular/core';
import { CONTACT_VALIDATION_MESSAGES } from 'src/app/core/models/forms-and-components/validation-messages.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-body',
  templateUrl: './contact-body.component.html',
  styleUrls: ['./contact-body.component.scss']
})
export class ContactBodyComponent implements OnInit {

  contactForm: FormGroup;
  formValidationMessages = CONTACT_VALIDATION_MESSAGES;

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required]]
    });
  }

  onSubmit() {
    console.log('Contact form submitted', this.contactForm.value);
  }

  // This handles a weird error related to lastpass form detection when pressing enter
  // From: https://github.com/KillerCodeMonkey/ngx-quill/issues/351#issuecomment-476017960
  textareaEnterPressed($event: KeyboardEvent) {
    $event.preventDefault();
    $event.stopPropagation();
  }

  // These getters are used for easy access in the HTML template
  get name() { return this.contactForm.get('name'); }
  get email() { return this.contactForm.get('email'); }
  get message() { return this.contactForm.get('message'); }

}
