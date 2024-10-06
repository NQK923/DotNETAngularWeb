import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BannerService } from '../../../service/Banner/banner.service';
import { ModelBanner } from '../../../Model/ModelBanner';
import { MangaService } from '../../../service/Manga/get_manga.service';
import { ChapterService } from '../../../service/Chapter/get_chapter.service';
import { forkJoin, map } from 'rxjs';

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
  totalViews:number
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
  topRatedMangas: Manga[]=[];
  banners: ModelBanner[] = [];
  threebanners: ModelBanner[] = [];
  twobanners: ModelBanner[] = [];
  constructor(private router: Router, private mangaService: MangaService, private chapterService: ChapterService, private bannerService: BannerService) { }

  ngOnInit(): void {
    this.mangaService.getMangas().subscribe(mangas => {
      this.mangas = mangas;
      const observables = this.mangas.map(manga =>
        this.chapterService.getTotalViewsByMangaId(manga.id_manga).pipe(
          map(result => {
            manga.totalViews = result.totalViews;
            return manga;
          })
        )
      );
      forkJoin(observables).subscribe(updatedMangas => {
        this.sortMangas(updatedMangas);
      });
    });
    this.loadBanners();
  }

  sortMangas(mangas: Manga[]) {

    this.recentMangas = mangas
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 12);

    this.topMangas = mangas
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 12);

      this.topRatedMangas = mangas
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  }

  loadBanners(): void {
    this.bannerService.getBanner().subscribe(
      (data: ModelBanner[]) => {
        this.banners = data;
        this.threebanners = this.banners.slice(2, 5);
        this.twobanners = this.banners.slice(0, 2);

        console.log('Banners fetched:', this.banners);
        console.log('Three banners:', this.threebanners);
      },
      error => {
        console.error('Lỗi khi lấy banner', error);
      }
    );
  }


  viewMangaDetails(id_manga: number) {
    this.router.navigate(['/titles', id_manga]);
  }

  goToViewer(): void {
    this.router.navigate(['/viewer']);
  }

  click(termp: string): void {
    window.open(termp);
  }
}
