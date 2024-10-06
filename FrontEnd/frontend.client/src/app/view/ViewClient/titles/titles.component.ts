import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChapterService } from '../../../service/Chapter/get_chapter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MangaDetailsService } from '../../../service/Manga/manga_details.service';

interface Chapter {
  id_chapter: number;
  title: string;
  id_manga: number;
  view: number;
  created_at: Date;
  index: number;
}

@Component({
  selector: 'app-titles',
  templateUrl: './titles.component.html',
  styleUrls: ['./titles.component.css']
})
export class TitlesComponent implements OnInit {
  id_manga!: number;
  chapters: Chapter[] = [];
  mangaDetails: any = {};
  selectedRatingValue: number = 0;

  @ViewChild('ratingSection') ratingSection!: ElementRef;

  constructor(private chapterService: ChapterService, private route: ActivatedRoute, private mangaDetailsService: MangaDetailsService, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id_manga = +params['id_manga'];
      this.getMangaDetails(this.id_manga);
      this.chapterService.getChaptersByMangaId(this.id_manga).subscribe(
        (data: Chapter[]) => {
          this.chapters = data;
        },
        (error) => {
          console.error('Error fetching chapters', error);
        }
      );
    });
  }

  getMangaDetails(id: number): void {
    this.mangaDetailsService.getMangaById(id).subscribe(
      (data) => {
        this.mangaDetails = data;
      },
      (error) => {
        console.error('Error fetching manga details', error);
      }
    );
  }

  goToChapter(index: number, id_chapter: number): void {
    this.chapterService.incrementChapterView(id_chapter).subscribe(updatedChapter => {
      const chapter = this.chapters.find(c => c.id_chapter === id_chapter);
      if (chapter) {
        chapter.view = updatedChapter.view;
      }
      console.log(`Chapter ${index} view updated to: ${chapter?.view}`);
      this.router.navigate([`/manga/${this.id_manga}/chapter/${index}`]);
      console.log(this.id_manga);
    });

  }
  toggleRatingSection() {
    this.ratingSection.nativeElement.classList.toggle('hidden');
  }

  confirmRating() {
    this.ratingSection.nativeElement.classList.add('hidden');
  }

  selectRating(value: number) {
    this.selectedRatingValue = value;
  }
}
