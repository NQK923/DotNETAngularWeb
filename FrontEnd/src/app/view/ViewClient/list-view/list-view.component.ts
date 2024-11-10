import {Component, HostListener, OnInit} from '@angular/core';
import {forkJoin, map} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {MangaService} from "../../../service/Manga/manga.service";
import {MangaViewHistoryService} from "../../../service/MangaViewHistory/MangaViewHistory.service";
import {CategoriesService} from "../../../service/Categories/Categories.service";
import {CategoryDetailsService} from "../../../service/Category_details/Category_details.service";

interface Manga {
  IdManga: number;
  Name: string;
  Author: string;
  NumOfChapter: number;
  Rating: number;
  IdAccount: number;
  IsPosted: boolean;
  CoverImg: string;
  Describe: string;
  UpdatedAt: Date;
  TotalViews: number
  RatedNum: number;
}

interface Category {
  IdCategory: number;
  Name: string;
  Description: string;
}

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.css']
})
export class ListViewComponent implements OnInit {
  searchQuery: string = '';
  mangas: Manga[] = [];
  filteredMangas: Manga[] = [];
  categories: Category[] = [];
  selectedCategories: number[] = [];
  sortOption: string = 'newest';
  itemsPerPage: number = 10;
  page = 1;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private mangaService: MangaService,
              private mangaViewHistoryService: MangaViewHistoryService,
              private categoriesService: CategoriesService,
              private categoryDetailsService: CategoryDetailsService,) {
    this.updateItemsPerPage(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateItemsPerPage(event.target.innerWidth);
  }

  ngOnInit(): void {
    const mangas$ = this.mangaService.getMangas();
    const categories$ = this.categoriesService.getAllCategories();
    forkJoin([mangas$, categories$]).subscribe(([mangas, categories]) => {
      this.mangas = mangas;
      this.categories = categories;
      const observables = this.mangas.map(manga =>
        this.mangaViewHistoryService.getAllView(manga.IdManga).pipe(
          map(totalViews => ({id_manga: manga.IdManga, totalViews}))
        )
      );
      forkJoin(observables).subscribe(results => {
        results.forEach(result => {
          const manga = this.mangas.find(m => m.IdManga === result.id_manga);
          if (manga) {
            manga.TotalViews = result.totalViews;
          }
        });
        this.filteredMangas = [...this.mangas];
        this.initializeSearch()
      });
      this.route.queryParams.subscribe(params => {
        this.searchQuery = params['search'] || '';
        this.searchMangas();
      });
    });
    this.searchMangas();
  }

  toggleCategorySelection(id_category: number) {
    if (this.selectedCategories.includes(id_category)) {
      this.selectedCategories = this.selectedCategories.filter(id => id !== id_category);
    } else {
      this.selectedCategories.push(id_category);
    }
  }

  searchMangas() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
    });
    let filteredByQuery = this.searchQuery.trim()
      ? this.mangas.filter(manga =>
        manga.Name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
      : [...this.mangas];
    this.filteredMangas = filteredByQuery;
    if (this.selectedCategories.length > 0) {
      this.categoryDetailsService.getIdMangaByCategories(this.selectedCategories).subscribe(id_manga => {
        this.filteredMangas = filteredByQuery.filter(manga => id_manga.includes(manga.IdManga));
        this.applySorting();
      });
    } else {
      this.applySorting()
    }
  }

  initializeSearch() {
    this.sortOption = 'newest';
    this.searchMangas();
  }

  applySorting() {
    switch (this.sortOption) {
      case 'newest':
        this.filteredMangas.sort((a, b) => new Date(b.UpdatedAt).getTime() - new Date(a.UpdatedAt).getTime());
        break;
      case 'oldest':
        this.filteredMangas.sort((a, b) => new Date(a.UpdatedAt).getTime() - new Date(b.UpdatedAt).getTime());
        break;
      case 'viewsHigh':
        this.filteredMangas.sort((a, b) => b.TotalViews - a.TotalViews);
        break;
      case 'viewsLow':
        this.filteredMangas.sort((a, b) => a.TotalViews - b.TotalViews);
        break;
    }
  }

  viewMangaDetails(id_manga: number) {
    this.router.navigate(['/titles', id_manga]);
  }

  trackByMangaId(index: number, manga: Manga): number {
    return manga.IdManga;
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  getTimeDifference(updatedTime: string | Date): string {
    const updatedDate = typeof updatedTime === 'string' ? new Date(updatedTime) : updatedTime;
    const currentDate = new Date();

    const diffInMs = currentDate.getTime() - updatedDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7));
    const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else if (diffInDays < 30) {
      return `${diffInWeeks} tuần trước`;
    } else {
      return `${diffInMonths} tháng trước`;
    }
  }

  private updateItemsPerPage(width: number) {
    if (width >= 1280) {
      this.itemsPerPage = 10;
    } else {
      this.itemsPerPage = 9;
    }
  }
}
