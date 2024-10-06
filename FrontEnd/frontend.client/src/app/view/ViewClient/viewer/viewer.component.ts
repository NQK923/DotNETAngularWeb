import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ChapterService } from '../../../service/Chapter/get_chapter.service';
import {ChapterDetailsService} from '../../../service/Chapter/chapter_details.service'

interface Chapter {
  id_chapter: number;
  title: string;
  id_manga: number;
  view: number;
  created_at: Date;
  index: number;
}
@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements OnInit {
  id_manga!: number;
  index!: number;
  images: string[] = [];
  chapters: Chapter[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private chapterService: ChapterService,
    private router: Router,
    private chapterDetailsService: ChapterDetailsService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id_manga = params['id_manga'];
      this.chapterService.getChaptersByMangaId(this.id_manga).subscribe(
        (data: Chapter[]) => {
          this.chapters = data;
          this.route.params.subscribe(newParams => {
            this.index = newParams['index'];
            this.loadImages();
          });
        },
        (error) => {
          console.error('Error fetching chapters', error);
        }
      );
    });
  }
  loadImages(): void {
    this.chapterDetailsService.getImagesByMangaIdAndIndex(this.id_manga, this.index).subscribe(
      (images: string[]) => {
        this.images = images;
      },
      (error) => {
        console.error('Error fetching images', error);
      }
    );
  }
  goToChapter(index: number): void {
    
    if (index >= 1 && index <= this.chapters.length) {
      this.index = index;
      this.images = [];
      const selectedChapter = this.chapters.find(chapter => chapter.index === index);

      if (selectedChapter) {
        this.chapterService.incrementChapterView(selectedChapter.id_chapter).subscribe(() => {
        });
        this.router.navigate([`/manga/${this.id_manga}/chapter/${index}`]).then(() => {
          this.loadImages();
          console.log('Navigated to chapter:', this.index);
        });
      }
    }
  }
  hasPreviousChapter(): boolean {
    return this.index > 1;
  }
  hasNextChapter(): boolean {
    return this.index < this.chapters.length;
  }
}