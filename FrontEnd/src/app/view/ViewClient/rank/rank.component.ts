import {Component, OnInit} from '@angular/core';
import {forkJoin} from "rxjs";
import {Router} from "@angular/router";
import {MangaService} from "../../../service/Manga/manga.service";
import {MangaViewHistoryService} from "../../../service/MangaViewHistory/MangaViewHistory.service";


interface Manga {
  id_manga: number;
  name: string;
  author: string;
  num_of_chapter: number;
  rating: number;
  id_account: number;
  is_posted: boolean;
  cover_img: string;
  describe: string;
  updated_at: Date;
  totalViews: number
  viewsByDay: number;
  viewsByWeek: number;
  viewsByMonth: number;
  rated_num: number
}

@Component({
  selector: 'app-rank',
  templateUrl: './rank.component.html',
  styleUrls: ['./rank.component.css']
})
export class RankComponent implements OnInit {
  mangas: Manga[] = [];
  selectedOption: string = 'rating';
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(private router: Router, private mangaService: MangaService, private mangaViewHistoryService: MangaViewHistoryService) {
  }

  ngOnInit(): void {
    this.loadMangas();
  }

  loadMangas() {
    this.mangaService.getMangas().subscribe(mangas => {
      this.mangas = mangas;
      const observables = this.mangas.map(manga =>
        forkJoin({
          totalViews: this.mangaViewHistoryService.getAllView(manga.id_manga),
          viewsByDay: this.mangaViewHistoryService.getViewByDay(manga.id_manga),
          viewsByWeek: this.mangaViewHistoryService.getViewByWeek(manga.id_manga),
          viewsByMonth: this.mangaViewHistoryService.getViewByMonth(manga.id_manga),
        })
      );
      forkJoin(observables).subscribe(results => {
        results.forEach((result, index) => {
          this.mangas[index].totalViews = result.totalViews;
          this.mangas[index].viewsByDay = result.viewsByDay;
          this.mangas[index].viewsByWeek = result.viewsByWeek;
          this.mangas[index].viewsByMonth = result.viewsByMonth;
        });
        this.sortMangas(this.selectedOption);
      });
    });
  }

  sortMangas(option: string) {
    this.selectedOption = option;
    switch (option) {
      case 'rating':
        this.mangas.sort((a, b) => b.rating - a.rating);
        break;
      case 'day':
        this.mangas.sort((a, b) => b.viewsByDay - a.viewsByDay);
        break;
      case 'week':
        this.mangas.sort((a, b) => b.viewsByWeek - a.viewsByWeek);
        break;
      case 'month':
        this.mangas.sort((a, b) => b.viewsByMonth - a.viewsByMonth);
        break;
    }
  }


  trackByMangaId(index: number, manga: Manga): number {
    return manga.id_manga;
  }

  viewMangaDetails(id_manga: number) {
    this.router.navigate(['/titles', id_manga]);
  }

  //Pagination
  getPagedMangas(): any {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage + 3;
    const endIndex = startIndex + this.itemsPerPage;
    return this.mangas.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  totalPages(): number {
    return Math.ceil((this.mangas.length - 3) / this.itemsPerPage);
  }
}
