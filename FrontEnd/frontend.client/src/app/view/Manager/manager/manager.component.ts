import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent {
  
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
 
  ngOnInit() {
    this.setupEventListeners();
    this.applyTailwindClasses();
  }
  goToBanner() {
    this.router.navigate(['/manager-banner']);
  }


  setupEventListeners() {
    const button = this.el.nativeElement.querySelector('#buttonAdd');
    const overlay = this.el.nativeElement.querySelector('#overlay');
    const out = this.el.nativeElement.querySelector('#out');

    if (out) {
      out.addEventListener('click', () => {
        overlay.classList.toggle('hidden');
      });
    }

    if (button) {
      button.addEventListener('click', () => {
        overlay.classList.toggle('hidden');
      });
    }

    const buttons = this.el.nativeElement.querySelector('#buttonbrowse');
    const browse = this.el.nativeElement.querySelector('#browse');
    const outs = this.el.nativeElement.querySelector('#outs');

    if (outs) {
      outs.addEventListener('click', () => {
        browse.classList.toggle('hidden');
      });
    }

    if (buttons) {
      buttons.addEventListener('click', () => {
        browse.classList.toggle('hidden');
      });
    }

    const buttonchap = this.el.nativeElement.querySelector('#addchapter');
    const Addchapter = this.el.nativeElement.querySelector('#AddChap');
    const outchap = this.el.nativeElement.querySelector('#outchap');

    if (outchap) {
      outchap.addEventListener('click', () => {
        Addchapter.classList.toggle('hidden');
      });
    }

    if (buttonchap) {
      buttonchap.addEventListener('click', () => {
        Addchapter.classList.toggle('hidden');
      });
    }

    const deletechap = this.el.nativeElement.querySelector('#DeleteChap');
    const deletechapter = this.el.nativeElement.querySelector('#deletechapter');
    const outdelete = this.el.nativeElement.querySelector('#outdeletechapter');

    if (outdelete) {
      outdelete.addEventListener('click', () => {
        deletechapter.classList.toggle('hidden');
      });
    }

    if (deletechap) {
      deletechap.addEventListener('click', () => {
        deletechapter.classList.toggle('hidden');
      });
    }
  }

  applyTailwindClasses() {
    const manageStories = this.el.nativeElement.querySelector('#manageStories');
    if (manageStories) {
      manageStories.classList.add('border-yellow-500', 'text-yellow-500');
    }
  }
}