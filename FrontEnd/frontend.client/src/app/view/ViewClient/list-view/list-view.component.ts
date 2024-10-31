import {Component, HostListener, OnInit} from '@angular/core';
import {forkJoin, map} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {MangaService} from "../../../service/Manga/manga.service";
import {MangaViewHistoryService} from "../../../service/MangaViewHistory/MangaViewHistory.service";
import {CategoriesService} from "../../../service/Categories/Categories.service";
import {CategoryDetailsService} from "../../../service/Category_details/Category_details.service";

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
  rated_num: number
}

interface Category {
  id_category: number;
  name: string;
  description: string;
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
        this.mangaViewHistoryService.getAllView(manga.id_manga).pipe(
          map(totalViews => ({id_manga: manga.id_manga, totalViews}))
        )
      );
      forkJoin(observables).subscribe(results => {
        results.forEach(result => {
          const manga = this.mangas.find(m => m.id_manga === result.id_manga);
          if (manga) {
            manga.totalViews = result.totalViews;
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
        manga.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
      : [...this.mangas];
    this.filteredMangas = filteredByQuery;
    if (this.selectedCategories.length > 0) {
      this.categoryDetailsService.getIdMangaByCategories(this.selectedCategories).subscribe(id_manga => {
        this.filteredMangas = filteredByQuery.filter(manga => id_manga.includes(manga.id_manga));
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
        this.filteredMangas.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      case 'oldest':
        this.filteredMangas.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
        break;
      case 'viewsHigh':
        this.filteredMangas.sort((a, b) => b.totalViews - a.totalViews);
        break;
      case 'viewsLow':
        this.filteredMangas.sort((a, b) => a.totalViews - b.totalViews);
        break;
    }
  }

  viewMangaDetails(id_manga: number) {
    this.router.navigate(['/titles', id_manga]);
  }

  trackByMangaId(index: number, manga: Manga): number {
    return manga.id_manga;
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
