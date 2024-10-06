import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manager-account',
  templateUrl: './manager-account.component.html',
  styleUrls: ['./manager-account.component.css']
})

export class  ManagerAccountComponent implements OnInit {
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
    this.setupEventListeners();
    this.applyTailwindClasses();
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

    const update = this.el.nativeElement.querySelector('#update');
    const viewupdate = this.el.nativeElement.querySelector('#viewupdate');
    const outs = this.el.nativeElement.querySelector('#outs');

    if (outs) {
      outs.addEventListener('click', () => {
        viewupdate.classList.toggle('hidden');
      });
    }

    if (update) {
      update.addEventListener('click', () => {
        viewupdate.classList.toggle('hidden');
      });
    }
  }

  applyTailwindClasses() {
    const manageStories = this.el.nativeElement.querySelector('#manageStories1');
    if (manageStories) {
      manageStories.classList.add('border-yellow-500', 'text-yellow-500');
    }
  }
}