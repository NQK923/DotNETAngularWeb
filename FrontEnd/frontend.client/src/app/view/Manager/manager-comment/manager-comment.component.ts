import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manager-comment',
  templateUrl: './manager-comment.component.html',
  styleUrls: ['./manager-comment.component.css']
})
  export class ManagerCommentComponent  {
    
    constructor(private el: ElementRef ,private router: Router) {}
    goToIndex() {
      this.router.navigate(['/']);
    }
    goTomanager() {
      this.router.navigate(['/manager']);
    }
    goToacount() {
      this.router.navigate(['/manager-account']);
    }
    goTostatiscal() {
      this.router.navigate(['/manager-statiscal']);
    }
    goToComment() {
      this.router.navigate(['/manager-comment']);
    }
    goToBanner() {
      this.router.navigate(['/manager-banner']);
    }
   
    ngOnInit() {
     
      this.applyTailwindClasses();
    }
  
   
  
    applyTailwindClasses() {
      const manageStories = this.el.nativeElement.querySelector('#manageStories2');
      if (manageStories) {
        manageStories.classList.add('border-yellow-500', 'text-yellow-500');
      }
    }
  }