import {Component, ElementRef, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MangaService} from "../../../service/Manga/manga.service";
import {ChapterService} from "../../../service/Chapter/chapter.service";
import {CategoryDetailsService} from "../../../service/Category_details/Category_details.service";
import {FormControl, NgForm} from "@angular/forms";
import {ModelNotification} from "../../../Model/ModelNotification";
import {ModelNotificationMangaAccount} from "../../../Model/ModelNotificationMangaAccount";
import {NotificationService} from "../../../service/notification/notification.service";
import {
  NotificationMangaAccountService
} from "../../../service/notificationMangaAccount/notification-manga-account.service";
import {CategoriesService} from "../../../service/Categories/Categories.service";
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {ConfirmationService, MessageService} from "primeng/api";

interface Manga {
  id_manga: number;
  name: string;
  author: string;
  num_of_chapter: number;
  id_account: number;
  cover_img: string;
  describe: string;
  is_posted: boolean;
}

interface Chapter {
  id_chapter: number;
  title: string;
  id_manga: number;
  view: number;
  created_at: Date;
  index: number;
}

interface Category {
  id_category: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit {
  allMangas: Manga[] = [];
  myManga: Manga[] = [];
  searchControl = new FormControl();
  filteredMyMangas: Manga[] = [];
  filteredAllMangas: Manga[] = [];
  unPostedManga: Manga[] = [];
  selectedIdManga: string = '';
  selectedMangaName: string = '';
  selectedCategories: number[] = [];
  chapters: Chapter[] = [];
  selectedChapter: number = 1;
  chapterImages: string[] = [];
  selectedFile: File | null = null;
  option: number = 0;
  mangas: Manga[] = [];
  selectedFiles: FileList | null = null;
  chapterName: string = '';
  chapterIndex: string = '';
  isAddingChapter: boolean = false;
  categories: Category[] = [];
  isHidden: boolean = true;
  selectedOption: string = 'option1';
  selectedTab: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 8;
  mangaDetails: Manga = {
    id_manga: 0,
    id_account: 0,
    num_of_chapter: 0,
    cover_img: '',
    name: '',
    author: '',
    describe: '',
    is_posted: false,
  };
  listMangas: Manga[] = [];
  infoManga: Manga | null = null;
  returnNotification: ModelNotification | null = null;
  url: string | null = null;
  name: string | null = null;
  email: string | null = null;

  constructor(private el: ElementRef,
              private router: Router,
              private mangaService: MangaService,
              private chapterService: ChapterService,
              private categoryDetailsService: CategoryDetailsService,
              private notificationService: NotificationService,
              private notificationMangaAccountService: NotificationMangaAccountService,
              private categoriesService: CategoriesService,
              private confirmationService: ConfirmationService,
              private messageService: MessageService) {
  }

  ngOnInit() {
    const userId = Number(localStorage.getItem('userId'));
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filterMangas(searchTerm);
    });
    this.loadMangas(userId);
    this.categoriesService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });

    this.setupEventListeners();
    this.applyTailwindClasses();
  }

  async loadMangas(userId: number) {
    this.myManga = await this.mangaService.getMangasByUser(userId).toPromise();
    this.allMangas = await this.mangaService.getPostedManga().toPromise();
    this.filteredMyMangas = this.myManga;
    this.filteredAllMangas = this.allMangas;
    this.unPostedManga = await this.mangaService.getUnPostedManga().toPromise();
  }

  filterMangas(searchTerm: string): void {
    if (searchTerm) {
      this.filteredMyMangas = this.myManga.filter(manga =>
        manga.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.filteredAllMangas = this.allMangas.filter(manga =>
        manga.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.currentPage = 1;
    } else {
      this.filteredMyMangas = this.myManga;
      this.filteredAllMangas = this.allMangas;
    }
  }

// Xác nhận duyệt manga
  confirmBrowseManga(manga: Manga) {
    this.confirmAction(
      `Bạn có chắc chắn muốn duyệt manga "${manga.name}"?`,
      () => this.browseManga(manga),
      () => console.log('Duyệt manga bị hủy') // Hoặc bất kỳ hành động nào bạn muốn khi hủy
    );
  }

  async browseManga(manga: Manga) {
    try {
      await this.mangaService.changeStatus(manga.id_manga).toPromise();
      this.messageService.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Duyệt thành công'
      });
      this.removeFromList(manga.id_manga);
      this.allMangas.push(manga);

      const userId = Number(localStorage.getItem('userId'));
      if (manga.id_account === userId) {
        this.myManga.push(manga);
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Thất bại',
        detail: 'Thất bại, vui lòng thử lại!'
      });
      console.error(error);
    }
  }

// Xác nhận xóa manga chưa duyệt
  confirmDeleteUnPostedManga(manga: Manga) {
    this.confirmAction(
      `Bạn có chắc chắn muốn xoá manga "${manga.name}"?`,
      () => this.deleteUnPostedManga(manga),
      () => console.log('Xóa manga chưa duyệt bị hủy') // Hoặc hành động khác khi hủy
    );
  }

  async deleteUnPostedManga(manga: Manga) {
    try {
      await this.mangaService.deleteMangaById(manga.id_manga).toPromise();
      const categories = await this.categoryDetailsService.getCategoriesByIdManga(manga.id_manga).toPromise();
      // @ts-ignore
      const categoriesToDelete = [manga.id_manga, ...categories.map(c => c.id_category)];
      await this.categoryDetailsService.deleteCategoriesDetails(categoriesToDelete).toPromise();
      this.removeFromList(manga.id_manga);
      this.messageService.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Xoá thành công'
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Thất bại',
        detail: 'Xoá thất bại, vui lòng thử lại!'
      });
      console.error(error);
    }
  }

// Ẩn manga
  hideManga(manga: Manga) {
    this.confirmAction(
      `Bạn có chắc chắn muốn ẩn manga "${manga.name}"?`,
      () => {
        this.mangaService.changeStatus(manga.id_manga).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Ẩn thành công'
            });
            this.unPostedManga.push(manga);
            this.allMangas = this.allMangas.filter(mg => mg.id_manga !== manga.id_manga);
            this.myManga = this.myManga.filter(mg => mg.id_manga !== manga.id_manga);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Thất bại',
              detail: 'Ẩn manga thất bại, vui lòng thử lại!'
            });
            console.error(error);
          }
        });
      },
      () => {}
    );
  }

// Xóa manga khỏi danh sách
  removeFromList(id: number) {
    this.unPostedManga = this.unPostedManga.filter(manga => manga.id_manga !== id);
  }


//add new manga
  onSubmit(addForm: any) {
    if (this.selectedFile && addForm.controls.name.value && addForm.controls.author.value) {
      const formData = this.buildFormData(addForm.controls);
      this.uploadOrUpdateManga(formData, 'upload');
    } else {
      this.messageService.add({severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng nhập đủ thông tin!'});
    }
  }

  //update manga
  onSubmitUpdate(form: NgForm): void {
    if (!form.valid) {
      return;
    }
    const formData = this.buildFormData(form.value);
    this.uploadOrUpdateManga(formData, 'update', Number(this.selectedIdManga));
    this.categoryDetailsService.updateCategoriesDetails(this.selectedCategories).subscribe();
  }

  buildFormData(controls: any): FormData {
    const formData = new FormData();
    formData.append('name', controls.name.value);
    formData.append('author', controls.author.value);
    formData.append('describe', controls.describe.value);
    formData.append('categories', this.selectedCategories.join(','));
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }
    return formData;
  }

  uploadOrUpdateManga(formData: FormData, action: 'upload' | 'update', mangaId?: number) {
    const id_user = localStorage.getItem('userId');
    const userId = Number(id_user);

    const mangaServiceMethod = action === 'upload'
      ? this.mangaService.uploadManga(formData, userId)
      : this.mangaService.updateManga(formData, mangaId!);

    mangaServiceMethod.subscribe(
      () => this.handleSuccess(action),
      (error) => this.handleError(action, error)
    );
  }

  handleSuccess(action: 'upload' | 'update') {
    const message = action === 'upload' ? 'Thêm truyện thành công!' : 'Cập nhật thành công!';
    alert(message);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  handleError(action: 'upload' | 'update', error: any) {
    const message = action === 'upload' ? 'Thêm truyện thất bại, vui lòng thử lại!' : 'Cập nhật thất bại, vui lòng thử lại!';
    alert(message);
    console.error(`${action === 'upload' ? 'Upload' : 'Update'} failed:`, error);
  }

//selected category change
  onCategoryChange(event: any, categoryId: number) {
    if (event.target.checked) {
      if (!this.selectedCategories.includes(categoryId)) {
        this.selectedCategories = [...this.selectedCategories, categoryId];
      }
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    }
  }

  //selected file for add manga
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = new File([file], 'Cover' + file.name.substring(file.name.lastIndexOf('.')), {
        type: file.type,
      });
    }
  }

//selected file for add chapter
  onFileChange(event: any) {
    this.selectedFiles = event.target.files;
  }

//add new chapter
  addChapter() {
    if (!this.chapterIndex || !this.chapterName || !this.selectedFiles) {
      this.messageService.add({severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng nhập đủ thông tin'});
      return;
    }
    this.isAddingChapter = true;
    const formData = this.createFormData();
    this.chapterService.addChapter(formData).subscribe(
      () => {
        this.messageService.add({severity: 'success', summary: 'Thành công', detail: 'Thêm chương thành công!'});
        this.finalizeAddChapter(formData);
      },
      error => this.handleAddChapterError(error, formData)
    );
  }

  createFormData(): FormData {
    const formData = new FormData();
    // @ts-ignore
    const filesArray = Array.from(this.selectedFiles);
    filesArray.forEach((file, idx) => {
      const renamedFile = new File([file], `${idx + 1}.${file.name.split('.').pop()}`, {type: file.type});
      formData.append('files', renamedFile);
    });
    formData.append('id_manga', this.selectedIdManga.toString());
    formData.append('index', this.chapterIndex.toString());
    formData.append('title', this.chapterName);
    return formData;
  }

  finalizeAddChapter(formData: FormData) {
    this.isAddingChapter = false;
    const idManga = formData.get('id_manga');
    const nameChap = formData.get('title');

    this.addNotification(idManga, nameChap);
    this.mangaService.updateTimeManga(Number(this.selectedIdManga)).subscribe();
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  handleAddChapterError(error: any, formData: FormData) {
    if (error.status === 409) {
      const existingChapter = error.error.existingChapter;
      this.confirmAction(
        `Chương ${this.chapterIndex} đã tồn tại. Bạn có muốn cập nhật không?`,
        () => this.updateChapter(existingChapter.id_chapter),
        () => {
          this.isAddingChapter = false;
        }
      );
    } else {
      console.error(error);
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Xảy ra lỗi! Vui lòng thử lại!'});
      this.isAddingChapter = false;
    }
  }


  updateChapter(chapterId: number) {
    const formData = this.createFormData();

    this.chapterService.updateChapter(chapterId, formData).subscribe(
      () => {
        this.finalizeUpdateChapter();
      },
      error => this.handleUpdateChapterError(error)
    );
  }

  finalizeUpdateChapter() {
    this.isAddingChapter = false;
    this.messageService.add({severity: 'success', summary: 'Thành công', detail: 'Cập nhật thành công!'});
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  handleUpdateChapterError(error: any) {
    this.isAddingChapter = false;
    this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Xảy ra lỗi! Vui lòng thử lại!'});
    console.error(error);
  }

  //change chapter in update chapter
  onChapterChange(): void {
    this.loadChapterImages(this.selectedChapter);
  }

//delete selected chapter
  deleteChapter(index: number): void {
    this.confirmAction(
      'Bạn có chắc chắn muốn xóa chương này không? Sau khi xóa không thể hoàn tác.',
      () => {
        this.chapterService.deleteSelectedChapter(Number(this.selectedIdManga), index).subscribe(
          () => {
            this.messageService.add({severity: 'success', summary: 'Thành công', detail: 'Xoá thành công!'});
            this.getAllChapters(Number(this.selectedIdManga));
          },
          (error) => {
            this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Xoá thất bại, vui lòng thử lại!'});
            console.error('Chapter deletion failed:', error);
          }
        );
      },
      () => {
      }
    );
  }

//check selected option
  checkOption(event: any, imageUri: string) {
    this.selectedOption = event.target.value;
    this.isHidden = this.selectedOption === 'option1';
    switch (this.selectedOption) {
      case 'option2':
        this.messageService.add({severity: 'info', summary: 'Thông báo', detail: 'Hãy chọn ảnh để thay thế'});
        break;
      case 'option3':
      case 'option4':
        this.showAddImageAlert();
        break;
      case 'option5':
        this.confirmAndDeleteImage(imageUri);
        break;
      default:
        this.resetSelection();
        break;
    }
  }

  showAddImageAlert() {
    this.messageService.add({severity: 'info', summary: 'Thông báo', detail: 'Hãy chọn ảnh cần thêm'});
  }

  confirmAndDeleteImage(imageUri: string) {
    this.confirmAction(
      'Bạn có chắc chắn muốn xóa ảnh này không? Sau khi xóa không thể hoàn tác.',
      () => {
        this.chapterService.deleteSingleImg(imageUri).subscribe(
          () => this.handleDeleteSuccess(imageUri),
          (error) => this.handleDeleteError(error)
        );
      },
      () => {
        this.resetSelection();
      }
    );
  }

  handleDeleteSuccess(imageUri: string) {
    this.messageService.add({severity: 'success', summary: 'Thành công', detail: 'Xoá hình ảnh thành công!'});
    const index = this.chapterImages.indexOf(imageUri);
    if (index !== -1) {
      this.chapterImages.splice(index, 1);
    }
  }

  handleDeleteError(error: any) {
    this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Xoá hình ảnh thất bại, vui lòng thử lại!'});
    console.error(error);
  }

  resetSelection() {
    this.selectedOption = 'option1';
    this.isHidden = true;
  }

  // select img for update chapter
  onImgSelected(event: any, uri: string) {
    const file: File = event.target.files[0];
    if (!file) return;
    const resetSelection = () => {
      this.selectedOption = 'option1';
      this.isHidden = true;
    };
    switch (this.selectedOption) {
      case 'option2':
        this.confirmAction(
          'Bạn có chắc chắn muốn thay thế ảnh hiện tại không?',

          () => this.replaceImg(file, uri),
          resetSelection
        );
        break;
      case 'option3':
        this.confirmAction(
          'Bạn có chắc chắn muốn thêm ảnh vừa chọn vào trước ảnh hiện tại không?',
          () => this.addPreImg(file, uri),
          resetSelection
        );
        break;
      case 'option4':
        this.confirmAction(
          'Bạn có chắc chắn muốn thêm ảnh vừa chọn vào sau ảnh hiện tại không?',
          () => this.addAfterImg(file, uri),
          resetSelection
        );
        break;
      default:
        resetSelection();
    }
  }

  confirmAction = (message: string, onConfirm: () => void, onCancel: () => void) => {
    this.confirmationService.confirm({
      message: message,
      header: 'Xác nhận',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: onConfirm,
      reject: onCancel
    });
  }

  //replace img in chapter
  replaceImg(file: File, uri: string) {
    const fileExtension = file.name.split('.').pop();
    const currentNumber = parseFloat(uri.match(/\/(\d+(\.\d+)?)\.\w+$/)?.[1] || '0');
    this.selectedFile = new File([file], `${currentNumber}.${fileExtension}`, {
      type: file.type,
    });
    const formData = new FormData();
    formData.append('files', this.selectedFile);
    formData.append('id_manga', this.selectedIdManga.toString());
    formData.append('index', this.selectedChapter.toString());
    this.chapterService.deleteSingleImg(uri).subscribe(() => {
      const index = this.chapterImages.indexOf(uri);
      if (index !== -1) {
        this.chapterImages.splice(index, 1);
      }
      this.chapterService.uploadSingleImg(formData).subscribe(() => {
        this.messageService.add({severity: 'success', summary: 'Thành công', detail: 'Thêm hình ảnh thành công!'});
        const timestamp = new Date().getTime();
        const newUri = uri.replace(/\/(\d+(\.\d+)?)\.\w+$/, `/${this.selectedFile?.name}?timestamp=${timestamp}`);
        this.chapterImages.splice(index, 0, newUri);
        this.selectedOption = 'option1';
        this.isHidden = true;
      }, error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Thêm hình ảnh thất bại, vui lòng thử lại!'
        });
        console.error(error);
        this.selectedOption = 'option1';
        this.isHidden = true;
      });
    }, error => {
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Xóa hình ảnh thất bại, vui lòng thử lại!'});
      console.error(error);
      this.selectedOption = 'option1';
      this.isHidden = true;
    });
  }

//Add a new img before the selected img
  addPreImg(file: File, uri: string) {
    const fileExtension = file.name.split('.').pop();
    const currentIndex = this.chapterImages.indexOf(uri);
    if (currentIndex !== -1) {
      let newNumber: number;
      if (currentIndex == 0) {
        const currentNumber = parseFloat(uri.match(/\/(\d+(\.\d+)?)\.\w+$/)?.[1] || '0');
        newNumber = currentNumber / 2;
      } else {
        const preImage = this.chapterImages[currentIndex - 1];
        const currentNumber = parseFloat(uri.match(/\/(\d+(\.\d+)?)\.\w+$/)?.[1] || '0');
        const preNumber = parseFloat(preImage.match(/\/(\d+\.\d+)\.\w+$/)?.[1] || '0');
        newNumber = (currentNumber + preNumber) / 2;
      }
      const newFileName = `${newNumber}.${fileExtension}`;
      const newUri = uri.replace((/\/(\d+(\.\d+)?)\.\w+$/), `/${newFileName}`);
      this.selectedFile = new File([file], newFileName, {
        type: file.type,
      });
      const formData = new FormData();
      formData.append('files', this.selectedFile);
      formData.append('id_manga', this.selectedIdManga.toString());
      formData.append('index', this.selectedChapter.toString());
      this.chapterService.uploadSingleImg(formData).subscribe(() => {
        this.messageService.add({severity: 'success', summary: 'Thành công', detail: 'Thêm hình ảnh thành công!'});
        this.chapterImages.splice(currentIndex, 0, newUri);
        this.selectedOption = 'option1';
        this.isHidden = true;
      }, error => {
        this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Thêm chương thất bại, vui lòng thử lại!'});
        console.log(error);
        this.selectedOption = 'option1';
        this.isHidden = true;
      });
    }
  }

  addAfterImg(file: File, uri: string) {
    const fileExtension = file.name.split('.').pop();
    const currentIndex = this.chapterImages.indexOf(uri);
    if (currentIndex !== -1) {
      let newNumber: number;
      if (currentIndex == this.chapterImages.length - 1) {
        const currentNumber = parseFloat(uri.match(/\/(\d+(\.\d+)?)\.\w+$/)?.[1] || '0');
        newNumber = +currentNumber + 1;
      } else {
        const nextImage = this.chapterImages[currentIndex + 1];
        const currentNumber = parseFloat(uri.match(/\/(\d+(\.\d+)?)\.\w+$/)?.[1] || '0');
        const nextNumber = parseFloat(nextImage.match(/\/(\d+\.\d+)\.\w+$/)?.[1] || '0');
        newNumber = (currentNumber + nextNumber) / 2;
      }
      const newFileName = `${newNumber}.${fileExtension}`;
      const newUri = uri.replace((/\/(\d+(\.\d+)?)\.\w+$/), `/${newFileName}`);
      this.selectedFile = new File([file], newFileName, {
        type: file.type,
      });
      const formData = new FormData();
      formData.append('files', this.selectedFile);
      formData.append('id_manga', this.selectedIdManga.toString());
      formData.append('index', this.selectedChapter.toString());
      this.chapterService.uploadSingleImg(formData).subscribe(() => {
        this.messageService.add({severity: 'success', summary: 'Thành công', detail: 'Thêm hình ảnh thành công!'});
        this.chapterImages.splice(currentIndex + 1, 0, newUri);
        this.selectedOption = 'option1';
        this.isHidden = true;
      }, error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Thêm hình ảnh thất bại, vui lòng thử lại!'
        });
        console.log(error);
        this.selectedOption = 'option1';
        this.isHidden = true;
      });
    }
  }


//delete manga
  deleteManga(manga: Manga): void {
    this.confirmAction(
      `Bạn có chắc chắn muốn xoá manga: ${manga.name} không? Sau khi xoá không thể hoàn tác!`,
      () => {
        this.mangaService.deleteMangaById(manga.id_manga).subscribe(
          () => {
            this.deleteRelatedData(manga.id_manga);
            this.messageService.add({severity: 'success', summary: 'Thành công', detail: 'Xoá manga thành công!'});
          },
          (error) => {
            this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Xoá thất bại, vui lòng thử lại!'});
            console.error("Manga deletion failed:", error);
          }
        );
      },
      () => {

      }
    );
  }

  deleteRelatedData(mangaId: number): void {
    this.chapterService.deleteAllChapter(mangaId).subscribe(
      () => {
        this.handleDeleteMangaSuccess(mangaId);
      },
      (error) => {
        if (error.status === 404) {
          this.handleDeleteMangaSuccess(mangaId);
        } else {
          this.handleDeleteMangaError(error);
        }
      }
    );
    this.categoryDetailsService.getCategoriesByIdManga(mangaId).subscribe(categories => {
      const categoriesToDelete = [mangaId, ...categories.map(c => c.id_category)];
      this.categoryDetailsService.deleteCategoriesDetails(categoriesToDelete).subscribe();
    });
  }

  handleDeleteMangaSuccess(id: number): void {
    this.messageService.add({severity: 'success', summary: 'Thành công', detail: 'Xoá thành công!'});
    this.updateUIAfterDelete(id);
  }

  handleDeleteMangaError(error: any): void {
    this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Xoá thất bại, vui lòng thử lại!'});
    console.error("Error during deletion:", error);
  }

  updateUIAfterDelete(id: number): void {
    this.mangas = this.mangas.filter(m => m.id_manga !== id);
  }


//get all chapter by manga id
  getAllChapters(id: number) {
    this.chapterService.getChaptersByMangaId(id).subscribe((data: Chapter[]) => {
      this.chapters = data;
    });
  }

//load all chapter by mangaId
  loadChapters(): void {
    this.chapterService.getChaptersByMangaId(Number(this.selectedIdManga)).subscribe(chapters => {
      this.chapters = chapters;
      this.selectedChapter = this.chapters[0]?.index || 1;
      this.loadChapterImages(this.selectedChapter);
    });
  }

//load all chapter img
  loadChapterImages(index: number): void {
    this.chapterService.getImagesByMangaIdAndIndex(Number(this.selectedIdManga), index).subscribe(images => {
      this.chapterImages = images;
    });
  }

//add notification
  addNotification(id_manga: any, text: any) {
    const userId = localStorage.getItem('userId');
    const yourId = userId !== null ? parseInt(userId, 10) : 0;
    this.mangaService.getMangaById(id_manga).subscribe({
      next: (manga: Manga) => {
        this.infoManga=manga;
        this.infoManga = manga;
        const textNotification = "Truyện vừa được thêm chương " + text;
        const timestamp = Date.now();
        const typeNoti = "Đã thêm 1 chương mới";
        const time = new Date(timestamp);
        const notification: ModelNotification = {
          content: textNotification,
          isRead: false,
          time: time,
          type_Noti: typeNoti
        };
        this.notificationService.addNotification(notification).subscribe({
          next: (response) => {
            this.returnNotification = response;
            const infoNotification: ModelNotificationMangaAccount = {
              id_Notification: this.returnNotification?.id_Notification,
              id_manga: Number(id_manga),
              id_account: yourId,
              isGotNotification: true,
              is_read: false,
            };
            this.notificationMangaAccountService.addInfoNotification(infoNotification).subscribe({
              next: () => {
              },
              error: (error) => {
                console.error('Error adding detailed notification:', error);
              }
            });
          },
          error: (error) => {
            console.error('Error adding notification:', error);
          }
        });
      }
    })
  }

  setupEventListeners() {
    const button = this.el.nativeElement.querySelector('#buttonAdd');
    const overlay = this.el.nativeElement.querySelector('#overlay');
    const out = this.el.nativeElement.querySelector('#out');

    if (out) {
      out.addEventListener('click', () => {
        overlay.classList.toggle('hidden');
      });
    }

    if (button) {
      button.addEventListener('click', () => {
        overlay.classList.toggle('hidden');
      });
    }

    const buttons = this.el.nativeElement.querySelector('#buttonBrowser');
    const browse = this.el.nativeElement.querySelector('#browse');
    const outs = this.el.nativeElement.querySelector('#outs');

    if (outs) {
      outs.addEventListener('click', () => {
        browse.classList.toggle('hidden');
      });
    }

    if (buttons) {
      buttons.addEventListener('click', () => {
        browse.classList.toggle('hidden');
      });
    }
  }

  applyTailwindClasses() {
    const manageStories = this.el.nativeElement.querySelector('#manageStories');
    if (manageStories) {
      manageStories.classList.add('border-yellow-500', 'text-yellow-500');
    }
  }

  goToIndex() {
    this.router.navigate(['/']);
  }

  goToManager() {
    this.router.navigate(['/manager']);
  }

  goToAccount() {
    this.router.navigate(['/manager-account']);
  }

  goToStatiscal() {
    this.router.navigate(['/manager-statiscal']);
  }

  goToComment() {
    this.router.navigate(['/manager-comment']);
  }

  toggleAddChap(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    const addChapElement = document.getElementById('AddChap');
    if (addChapElement) {
      addChapElement.classList.toggle('hidden');
    }
  }

  toggleDeleteChap(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    const deleteChapElement = document.getElementById('deleteChapter');
    if (id != 0) {
      this.getAllChapters(id);
    } else {
      this.chapters = []
    }
    if (deleteChapElement) {
      deleteChapElement.classList.toggle('hidden');
    }
  }

  toggleUpdateChap(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    const updateChapElement = document.getElementById('updateChapter');
    if (id != 0) {
      this.loadChapters();
    }
    if (updateChapElement) {
      updateChapElement.classList.toggle('hidden');
    }
  }

  toggleUpdateManga(id: number, name: string): void {
    this.selectedIdManga = id.toString();
    this.selectedMangaName = name;
    if (id != 0) {
      this.selectedCategories.push(id);
      this.mangaService.getMangaById(id).subscribe(data => {
        this.mangaDetails = data;
      });
      this.categoryDetailsService.getCategoriesByIdManga(id).subscribe(categories => {
        for (const category of categories) {
          this.selectedCategories.push(category.id_category);
        }
      })
    } else {
      this.selectedCategories = [];
    }
    const addChapElement = document.getElementById('updateManga');
    if (addChapElement) {
      addChapElement.classList.toggle('hidden');
    }
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
    this.currentPage = 1;
  }

  //Pagination
  getPagedMangas(list: Manga[]): Manga[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return list.slice(startIndex, endIndex);
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
    if (this.selectedTab === 'my') {
      return Math.ceil(this.filteredMyMangas.length / this.itemsPerPage);
    } else {
      return Math.ceil(this.filteredAllMangas.length / this.itemsPerPage);
    }
  }

}
