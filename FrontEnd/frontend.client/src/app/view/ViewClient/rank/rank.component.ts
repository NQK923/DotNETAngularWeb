import {Component, HostListener, OnInit} from '@angular/core';
import {forkJoin, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {MangaService} from '../../../service/Manga/manga.service';
import {MangaViewHistoryService} from '../../../service/MangaViewHistory/MangaViewHistory.service';
import {MangaFavoriteService} from "../../../service/MangaFavorite/manga-favorite.service";

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
  totalViews: number;
  viewsByDay?: number;
  viewsByWeek?: number;
  viewsByMonth?: number;
  follows?: number;
  rated_num: number;
}

@Component({
  selector: 'app-rank',
  templateUrl: './rank.component.html',
  styleUrls: ['./rank.component.css']
})
export class RankComponent implements OnInit {
  mangas: Manga[] = [];
  selectedOption: string = 'rating';
  page: number = 1;
  itemsPerPage: number = 10;
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private mangaService: MangaService,
    private mangaViewHistoryService: MangaViewHistoryService,
    private mangaFavoriteService: MangaFavoriteService,
    private route: ActivatedRoute,
  ) {
    this.updateItemsPerPage(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateItemsPerPage(event.target.innerWidth);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedOption = params['selectedOption'] || this.selectedOption;
    });
    this.loadMangas();
  }

  loadMangas() {
    this.mangaService.getMangas().subscribe((mangas) => {
      this.mangas = mangas;
      this.isLoading = false;
      this.sortMangas(this.selectedOption);
    });
  }

  sortMangas(option: string) {
    this.selectedOption = option;
    let loadViews$ = of(this.mangas);
    switch (option) {
      case 'follows':
        // @ts-ignore
        loadViews$ = forkJoin(
          this.mangas.map((manga) =>
            manga.follows != null
              ? of(manga.follows)
              : this.mangaFavoriteService.countFollower(manga.id_manga)
          )
        );
        break;
      case 'day':
        // @ts-ignore
        loadViews$ = forkJoin(
          this.mangas.map((manga) =>
            manga.viewsByDay != null
              ? of(manga.viewsByDay)
              : this.mangaViewHistoryService.getViewByDay(manga.id_manga)
          )
        );
        break;
      case 'week':
        // @ts-ignore
        loadViews$ = forkJoin(
          this.mangas.map((manga) =>
            manga.viewsByWeek != null
              ? of(manga.viewsByWeek)
              : this.mangaViewHistoryService.getViewByWeek(manga.id_manga)
          )
        );
        break;
      case 'month':
        // @ts-ignore
        loadViews$ = forkJoin(
          this.mangas.map((manga) =>
            manga.viewsByMonth != null
              ? of(manga.viewsByMonth)
              : this.mangaViewHistoryService.getViewByMonth(manga.id_manga)
          )
        );
        break;
    }

    loadViews$.pipe(
      switchMap((views: any[]) => {
        views.forEach((view, index) => {
          if (option === 'day') this.mangas[index].viewsByDay = view;
          if (option === 'week') this.mangas[index].viewsByWeek = view;
          if (option === 'month') this.mangas[index].viewsByMonth = view;
          if (option==='follows') this.mangas[index].follows = view;
        });
        return of(this.mangas);
      })
    ).subscribe(() => {
      switch (option) {
        case 'rating':
          this.mangas.sort((a, b) => b.rating - a.rating);
          break;
        case 'follows':
          this.mangas.sort((a, b) => (b.follows ?? 0) - (a.follows??0));
          break;
        case 'day':
          this.mangas.sort((a, b) => (b.viewsByDay ?? 0) - (a.viewsByDay ?? 0));
          break;
        case 'week':
          this.mangas.sort((a, b) => (b.viewsByWeek ?? 0) - (a.viewsByWeek ?? 0));
          break;
        case 'month':
          this.mangas.sort((a, b) => (b.viewsByMonth ?? 0) - (a.viewsByMonth ?? 0));
          break;
      }
    });
  }

  trackByMangaId(index: number, manga: Manga): number {
    return manga.id_manga;
  }

  viewMangaDetails(id_manga: number) {
    this.router.navigate(['/titles', id_manga]);
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  private updateItemsPerPage(width: number) {
    this.itemsPerPage = width >= 1280 ? 10 : 9;
  }
}
