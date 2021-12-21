import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

/** A hero's name can't match the given regular expression */
export function forbiddenNameValidator(): ValidatorFn {
  return (nameControl: AbstractControl): ValidationErrors | null => {

    const formValue = nameControl.value;

    if (!formValue) {
      return null;
    }

    const hasInvalidPunctuation = /[.,\/#!$%\^&\*;:{}=\-_`~()]+/.test(formValue); // + matches one or more instances of the preceding character(s)

    if (hasInvalidPunctuation) {
      console.log('Name has invalid punctuation');
    }  
    return hasInvalidPunctuation ? {forbiddenName: true}: null;
  };
}

export function forbiddenEmailValidator(): ValidatorFn {
  return (emailControl: AbstractControl): ValidationErrors | null => {

    const formValue = emailControl.value;

    if (!formValue) {
      return null;
    }

    const hasInvalidEmail = /qq.com/.test(formValue);

    if (hasInvalidEmail) {
      console.log('Name has invalid punctuation');
    }  
    return hasInvalidEmail ? {forbiddenEmail: true}: null;
  };
}