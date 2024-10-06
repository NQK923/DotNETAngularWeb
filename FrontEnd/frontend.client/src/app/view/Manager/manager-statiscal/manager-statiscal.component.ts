import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manager-statiscal',
  templateUrl: './manager-statiscal.component.html',
  styleUrls: ['./manager-statiscal.component.css']
})

export class ManagerStatiscalComponent implements OnInit {

  constructor(private router: Router) {}
  goToIndex() {
    this.router.navigate(['/']);
  }
  goToacount() {
    this.router.navigate(['/manager-account']);
  }
  goTostatiscal() {
    this.router.navigate(['/manager-statiscal']);
  }
  goTomanager() {
    this.router.navigate(['/manager']);
  }
  goToComment() {
    this.router.navigate(['/manager-comment']);
  }
  goToBanner() {
    this.router.navigate(['/manager-banner']);
  }
  ngOnInit(): void {
    // Thêm logic Angular nếu có
    const comboBox = document.getElementById('myComboBox') as HTMLSelectElement;
    const yearSelection = document.getElementById('yearSelection') as HTMLElement;
    const monthSelection = document.getElementById('monthSelection') as HTMLElement;
    const weekSelection = document.getElementById('weekSelection') as HTMLElement;
    const typeSelection = document.getElementById('typeSelection') as HTMLElement;

    comboBox.addEventListener('change', function () {
      yearSelection.classList.add('hidden');
      monthSelection.classList.add('hidden');
      weekSelection.classList.add('hidden');
      typeSelection.classList.add('hidden');

      if (this.value === 'year') {
        yearSelection.classList.remove('hidden');
      } else if (this.value === 'month') {
        monthSelection.classList.remove('hidden');
      } else if (this.value === 'week') {
        weekSelection.classList.remove('hidden');
      } else if (this.value === 'type') {
        typeSelection.classList.remove('hidden');
      }
    });
  }
}
