import { Directive, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';


// Courtesy of Fireship: https://angularfirebase.com/lessons/infinite-scroll-firestore-angular/
@Directive({
  selector: '[appScrollable]'
})
export class ScrollableDirective {

  @Output() scrollPosition = new EventEmitter();

  constructor(
    public el: ElementRef,
    ) { }

  @HostListener('scroll', ['$event'])
  onScroll(event) {
    // Direct access to the DOM will cause errors if compiling Angular for platform-server or web-worker
    // Thus, wrap DOM access code in a try-catch block and provide a fallback for users, such as a clickable button to load more items.
    try {

      const top = event.target.scrollTop;
      const height = this.el.nativeElement.scrollHeight;
      const offset = this.el.nativeElement.offsetHeight;

      // emit bottom event
      if (top > height - offset - 1) {
        this.scrollPosition.emit('bottom');
      }

      // emit top event
      if (top === 0) {
        this.scrollPosition.emit('top');
      }

    } catch (err) {
      console.log('Error with scroll handler', err);
    }
  }

}
