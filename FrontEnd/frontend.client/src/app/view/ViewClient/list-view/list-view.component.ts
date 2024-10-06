import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.css']
})

export class ListViewComponent implements OnInit {
  selectedValue: string = '';

  constructor() {}

  ngOnInit(): void {}

  onSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement; // Assert type
    this.selectedValue = target.value; // Access value safely
  }

  isVisible(option: string): boolean {
    return this.selectedValue === option;
  }
}