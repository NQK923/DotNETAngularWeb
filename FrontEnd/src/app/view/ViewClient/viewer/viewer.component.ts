import {Component, ElementRef, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ChapterService} from '../../../service/Chapter/chapter.service';
import {CommentService} from "../../../service/Comment/comment.service";
import {InfoAccountService} from '../../../service/InfoAccount/info-account.service';
import {MangaHistoryService} from "../../../service/MangaHistory/manga_history.service";
import {MangaViewHistoryService} from "../../../service/MangaViewHistory/MangaViewHistory.service";
import {AccountService} from "../../../service/Account/account.service";
import {forkJoin, map} from "rxjs";
import {MangaService} from "../../../service/Manga/manga.service";
import {ConfirmationService, MessageService} from "primeng/api";

interface Chapter {
  idChapter: number;
  title: string;
  idManga: number;
  createdAt: Date;
  index: number;
}

export interface ModelComment {
  idComment?: number;
  idChapter: number;
  idAccount: number;
  content: string;
  isReported: boolean;
  time: Date;
}

export interface  ModelInfoAccount {
  id_infoAccount : number,
  id_account:number,
  name: string,
  email: string,
  cover_img: string,
}
export  interface ModelAccount{
  id_account?: number;
  username: string;
  password: string;
  banDate?: Date
  role?: boolean;
  status?: boolean;
  banComment?: boolean;

}

export class CommentData {
  Comment: ModelComment | null;
  InfoAccount: ModelInfoAccount | null;

  constructor(
    comment: ModelComment | null,
    infoAccount: ModelInfoAccount | null
  ) {
    this.Comment = comment;
    this.InfoAccount = infoAccount;
  }
}

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements OnInit {
  id_manga!: number;
  chapter_index: number = 0;
  images: string[] = [];
  chapters: Chapter[] = [];
  comment: ModelComment[] = [];
  comments: ModelComment[] = [];
  listInfoAccount: ModelInfoAccount[] = [];
  listDataComment: CommentData[] = [];
  listYourComment: CommentData[] = [];
  yourId: number = -1;
  yourAc: ModelAccount | null = null;
  chapterId: number = -1;
  NoLoggin: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private chapterService: ChapterService,
    private router: Router,
    private infoAccountService: InfoAccountService,
    private el: ElementRef,
    private commentService: CommentService,
    private mangaHistoryService: MangaHistoryService,
    private mangaViewHistoryService: MangaViewHistoryService,
    private accountService: AccountService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id_manga = params['id_manga'];
      if (this.chapter_index !== +params['index']) {
        this.chapter_index = +params['index'];
      }
      this.loadImages();
      this.chapterService.getChaptersByMangaId(this.id_manga).subscribe(
        (data: Chapter[]) => {
          this.chapters = data;
          this.chapterService.getIdChapter(this.id_manga, this.chapter_index).subscribe((chapter) => {
            this.chapterId = chapter;
            this.loadAllComment(this.chapterId);
          })

        },
        (error) => {
          console.error('Error fetching chapters', error);
        }
      );
    });

  }


  loadImages(): void {
    this.chapterService.getImagesByMangaIdAndIndex(this.id_manga, this.chapter_index).subscribe(
      (images: string[]) => {
        this.images = images;
      },
      (error) => {
        console.error('Error fetching images', error);
      }
    );
  }

  async goToChapter(index: any): Promise<void> {
    const numericIndex = +index;
    if (numericIndex >= 1 && numericIndex <= this.chapters.length) {
      this.images = [];
      const selectedChapter = this.chapters.find(chapter => chapter.index === numericIndex);
      if (selectedChapter) {
        this.mangaViewHistoryService.createHistory(this.id_manga).subscribe(
          () => {
          },
          (error) => {
            console.error('Error: ', error);
          }
        )
        if (selectedChapter && selectedChapter.idChapter !== undefined) {
          localStorage.setItem('id_chapter', selectedChapter.idChapter.toString());
          if (await this.isLoggedIn()) {
            const cookie = await this.accountService.getAccountCookie();
            const userId = cookie.id_account;
            this.mangaHistoryService.addMangaHistory(userId, this.id_manga, numericIndex).subscribe(
              () => {
              },
              (error) => {
                console.error('Error:', error);
              }
            );
          }
        }
        this.chapter_index = numericIndex;
        this.router.navigate([`/manga/${this.id_manga}/chapter/${this.chapter_index}`]).then(() => {
          this.loadImages();
        });
      }
    }
  }

  hasPreviousChapter(): boolean {
    return this.chapter_index > 1;
  }

  hasNextChapter(): boolean {
    return this.chapter_index < this.chapters.length;
  }

  async isLoggedIn(): Promise<boolean> {
    const cookie = await this.accountService.getAccountCookie();
    const id_user = cookie.id_account;
    return !!(id_user && Number(id_user) != -1);
  }

  async loadAllComment(chapterId: number) {
    this.listDataComment = []
    this.listYourComment = []
    const cookie = await this.accountService.getAccountCookie();
    const id_user = cookie.id_account;
    this.yourId = id_user;
    this.loadComment()
      .then(() => this.loadInfoAccount())
      .then(() => this.takeData())
      .catch(error => console.error('Error loading data:', error));
    this.loadComment()
      .then(() => this.loadAccount())
      .then(() => this.loadInfoAccount())
      .then(() => this.takeYourData())
      .catch(error => console.error('Error loading data:', error));
  }

  loadAccount(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.accountService.getAccountByid(Number(this.yourId)).subscribe(
        (data: ModelAccount) => {
          {
            this.yourAc = data
            resolve()
          }
          reject(new Error('Account not found'));
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  deleteComment(id_cm: any) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa bình luận này?',
      header: 'Xác nhận',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      accept: () => {
        this.commentService.deleteBanner(id_cm).subscribe(
          () => {
            this.loadAllComment(this.chapterId);
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Xóa bình luận thành công!'
            });
          },
          (error) => {
            console.error(error);
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Xóa bình luận thất bại!'
            });
          }
        );
      },
    });
  }


  updateComment(id_cm: any) {
    const textUpdate = this.el.nativeElement.querySelector(`#text${id_cm}`);
    const id = this.yourId;
    if (!textUpdate.value.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng nhập nội dung bình luận trước khi cập nhật.'
      });
      return;
    }
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn cập nhật bình luận này?',
      header: 'Xác nhận',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      accept: () => {
        const comment: ModelComment = {
          idComment: id_cm,
          idChapter: this.chapterId,
          idAccount: id,
          content: textUpdate.value,
          isReported: false,
          time: new Date()
        };

        this.commentService.updateComment(comment).subscribe(
          () => {
            this.loadAllComment(this.chapterId);
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Cập nhật bình luận thành công!'
            });
          },
          (error) => {
            console.error(error);
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Cập nhật bình luận thất bại!'
            });
          }
        );
      },
    });
  }


  addComment() {
    const text = this.el.nativeElement.querySelector('#textComment');
    const id = this.yourId;
    if (id==null){
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Đăng nhập để thêm bình luận' });
      return;
    }
    if (this.yourAc && this.yourAc.banComment === true) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Tài khoản bị cấm bình luận' });
      return;
    }
    console.log("mo",this.yourAc)
    const comment: ModelComment = {
      idChapter: this.chapterId,
      idAccount: id,
      content: text.value,
      isReported: false,
      time: new Date()
    }
    this.commentService.addComment(comment).subscribe(
      () => {
        this.loadAllComment(this.chapterId);
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Bình luận đã được thêm.' });
      },
      (error) => {
        console.error(error);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Thêm bình luận thất bại.' });
      }
    );
  }

  takeData() {
    for (let i = 0; i < this.comments.length; i++) {
      const comment = this.comments[i];
      const existsInList = this.listDataComment.some(item => item.Comment?.idComment === comment.idComment);
      if (existsInList) {
        continue;
      }
      if (comment.idChapter === this.chapterId && comment.idAccount !== this.yourId) {
        this.infoAccountService.getInfoAccountByIdTN(Number(comment.idAccount)).subscribe(
          (data: ModelInfoAccount) => {
            this.listDataComment.push(new CommentData(comment, data));
          }
        );
      }
    }
  }

  takeYourData() {
    const existingCommentIds = new Set(this.listYourComment.map(comment => comment.Comment?.idComment));
    const relevantComments = this.comments.filter(comment =>
      comment.idChapter === this.chapterId &&
      comment.idAccount === this.yourId &&
      !existingCommentIds.has(comment.idComment)
    );
    const accountRequests = relevantComments.map(comment =>
      this.infoAccountService.getInfoAccountByIdTN(Number(comment.idAccount)).pipe(
        map((data: ModelInfoAccount) => new CommentData(comment, data))
      )
    );
    forkJoin(accountRequests).subscribe(
      (dataComments: CommentData[]) => {
        this.listYourComment.push(...dataComments);
      },
      (error) => {
        console.error('Error fetching account info:', error);
      }
    );
  }

  loadComment(): Promise<void> {
    this.accountService.getAccountByid(this.yourId).subscribe(
      (data: ModelAccount) => {
        this.yourAc = data;
      },
      (error) => {
        console.error('Error fetching info accounts', error);
      }
    );
    if(this.yourId==undefined){
      this.NoLoggin = true;
    }
    return new Promise((resolve) => {
        this.commentService.getCommnet().subscribe(
          (data: ModelComment[]) => {
            this.comments = data;
            resolve();
          },
          error => {
            console.error('Lỗi ', error);
          }
        );
      }
    )
  }

  loadInfoAccount(): Promise<void> {
    return new Promise((resolve) => {
      this.infoAccountService.getAllInfoAccount().subscribe(
        (data: ModelInfoAccount[]) => {
          this.listInfoAccount = data;
          resolve();
        },
        (error) => {
          console.error('Error fetching info accounts', error);
        }
      );
    })
  }

  addReport(idComment: any, idChap: any, id: any, text: any) {
    const comment: ModelComment = {
      idComment: idComment,
      idChapter: idChap,
      idAccount: id,
      content: text,
      isReported: true,
      time: new Date()
    };
    this.commentService.updateComment(comment).subscribe(
      () => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Báo cáo thành công.' });
      },
      (error) => {
        console.error(error);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Báo cáo thất bại.' });
      }
    );
  }

  trackByChapterIndex(index: number,chapter: Chapter): number {
    return chapter.index;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onUpdate() {
    const text = this.el.nativeElement.querySelector('#buttonUndate');
    text.classList.remove('hidden');
  }
}
