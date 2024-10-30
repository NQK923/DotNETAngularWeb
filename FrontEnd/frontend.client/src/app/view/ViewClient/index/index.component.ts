import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MangaService} from '../../../service/Manga/manga.service';
import {forkJoin, map, Observable} from 'rxjs';
import {MangaViewHistoryService} from "../../../service/MangaViewHistory/MangaViewHistory.service";
import {CategoriesService} from "../../../service/Categories/Categories.service";
import {CategoryDetailsService} from "../../../service/Category_details/Category_details.service";
import {MangaFavoriteService} from "../../../service/MangaFavorite/manga-favorite.service";
import {ChapterService} from "../../../service/Chapter/chapter.service";
import {switchMap} from "rxjs/operators";


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
  rated_num: number;
  categories: string[];
  follower: number;
  latestChapter: number;
}

interface Category {
  id_category: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {
  mangas: Manga[] = [];
  recentMangas: Manga[] = [];
  topMangas: Manga[] = [];
  popularMangas: Manga[] = [];
  topViewMangas: Manga[] = [];
  topRatedMangas: Manga[] = [];
  selectedTab: string = 'day';
  categories: Category[] = [];
  isLoading: boolean = true;

  constructor(private router: Router,
              private mangaService: MangaService,
              private mangaViewHistoryService: MangaViewHistoryService,
              private categoriesService: CategoriesService,
              private categoryDetailsService: CategoryDetailsService,
              private mangaFavoriteService: MangaFavoriteService,
              private chapterService: ChapterService,
  ) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    forkJoin({
      mangas: this.mangaService.getMangas(),
      categories: this.categoriesService.getAllCategories()
    }).pipe(
      map(({mangas, categories}) => {
        // @ts-ignore
        this.mangas = mangas.map(manga => {
          manga.totalViews = 0;
          manga.follower = 0;
          manga.latestChapter = 0;
          manga.categories = [];
          return manga;
        });
        this.categories = categories;
        return this.mangas;
      }),
      switchMap(mangas => {
        const mangaObservables = mangas.map(manga =>
          forkJoin({
            totalViews: this.mangaViewHistoryService.getAllView(manga.id_manga),
            followers: this.mangaFavoriteService.countFollower(manga.id_manga),
            latestChapter: this.chapterService.getLastedChapter(manga.id_manga)
          }).pipe(
            map(({totalViews, followers, latestChapter}) => {
              manga.totalViews = totalViews;
              manga.follower = followers;
              manga.latestChapter = latestChapter;
            })
          )
        );
        return forkJoin(mangaObservables);
      })
    ).subscribe(() => {
      this.sortMangas(this.mangas);
      this.setTab("day");
    });
  }

  sortMangas(mangas: Manga[]) {
    const sortedByDate = [...mangas].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    const sortedByFollowers = [...mangas].sort((a, b) => b.follower - a.follower);
    const sortedByViews = [...mangas].sort((a, b) => b.totalViews - a.totalViews);
    const sortedByRating = [...mangas].sort((a, b) => b.rating - a.rating);
    this.recentMangas = sortedByDate.slice(0, 10);
    const categoryObservables = this.recentMangas.map(manga =>
      this.getCategoriesForManga(manga.id_manga).pipe(
        map(categories => ({manga, categories}))
      )
    );
    forkJoin(categoryObservables).subscribe(results => {
      results.forEach(({manga, categories}) => {
        manga.categories = categories;
        this.isLoading = false;
      });
    });
    this.popularMangas = sortedByFollowers.slice(0, 8);
    this.topMangas = sortedByViews.slice(0, 8);
    this.topRatedMangas = sortedByRating.slice(0, 8);
  }

  setTab(tab: string) {
    this.selectedTab = tab;
    switch (tab) {
      case 'day':
        this.getTopMangasByDay();
        break;
      case 'week':
        this.getTopMangasByWeek();
        break;
      case 'month':
        this.getTopMangasByMonth();
        break;
    }
  }

  processTopMangas(list: Manga[]) {
    this.topViewMangas = list
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 8);
  }

  getTopMangas(viewFunction: (id_manga: number) => Observable<number>) {
    const list = this.mangas.map(manga => ({...manga}));
    let completedRequests = 0;
    list.forEach(manga => {
      viewFunction(manga.id_manga).subscribe(
        (views) => {
          manga.totalViews = views;
          completedRequests++;
          if (completedRequests === list.length) {
            this.processTopMangas(list);
          }
        },
        (error) => {
          console.error("Error fetching views for manga with id: " + manga.id_manga, error);
          completedRequests++;
          if (completedRequests === list.length) {
            this.processTopMangas(list);
          }
        }
      );
    });
  }

  getTopMangasByDay() {
    this.getTopMangas((id_manga: number) => this.mangaViewHistoryService.getViewByDay(id_manga));
  }

  getTopMangasByWeek() {
    this.getTopMangas((id_manga: number) => this.mangaViewHistoryService.getViewByWeek(id_manga));
  }

  getTopMangasByMonth() {
    this.getTopMangas((id_manga: number) => this.mangaViewHistoryService.getViewByMonth(id_manga));
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

  getCategoriesForManga(id_manga: number) {
    return forkJoin({
      categoryDetails: this.categoryDetailsService.getCategoriesByIdManga(id_manga),
      allCategories: this.categoriesService.getAllCategories()
    }).pipe(
      map(({categoryDetails, allCategories}) => {
        const detailSet = new Set(categoryDetails.map(detail => detail.id_category));
        return allCategories
          .filter(category => detailSet.has(category.id_category))
          .map(category => category.name);
      })
    );
  }

  trackByMangaId(index: number, manga: Manga): number {
    return manga.id_manga;
  }

  viewMangaDetails(id_manga: number) {
    this.router.navigate(['/titles', id_manga]);
  }

  goToRank() {
    this.router.navigate(['/rank']);
  }

  click(temp: string): void {
    window.open(temp);
  }

}
