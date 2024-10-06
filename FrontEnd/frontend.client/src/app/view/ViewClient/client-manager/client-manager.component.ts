import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MangaService } from '../../../service/Manga/get_manga.service';
import { MangaUploadService } from '../../../service/Manga/manga_upload.service';

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
  selector: 'app-client-manager',
  templateUrl: './client-manager.component.html',
  styleUrls: ['./client-manager.component.css']
})
export class ClientManagerComponent implements OnInit{
  selectedFile: File | null = null;
  mangas: Manga[] = [];

  constructor(private el: ElementRef ,private router: Router, private mangaUploadService: MangaUploadService, private mangaService: MangaService) {

  }
  ngOnInit(): void {
    this.mangaService.getMangasByUser(1).subscribe(mangas => {
      this.mangas = mangas;
    });
    this.setupEventListeners();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const renamedFile = new File([file], 'Cover' + file.name.substring(file.name.lastIndexOf('.')), {
        type: file.type,
      });
      this.selectedFile = renamedFile;
      console.log(this.selectedFile);
    }
  }

  onSubmit(form: any) {
    console.log('Form data:', form);
    console.log('Selected file:', this.selectedFile);
    if (this.selectedFile && form.controls.name.value && form.controls.author.value) {
      const formData = new FormData();
      formData.append('name', form.controls.name.value);
      formData.append('author', form.controls.author.value);
      formData.append('describe',form.controls.describe.value);
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.mangaUploadService.uploadManga(formData).subscribe(
        (response) => {
          console.log('Upload successful:', response);
        },
        (error) => {
          console.error('Upload failed:', error);
        }
      );
    } else {
      console.error('Form is incomplete');
    }
  }

  goToIndex() {
    this.router.navigate(['/']);
  }

  setupEventListeners() {
    const buttonAdd = this.el.nativeElement.querySelector('#buttonAdd');
    const overlay = this.el.nativeElement.querySelector('#overlay');
    const out = this.el.nativeElement.querySelector('#out');

    if (out) {
      out.addEventListener('click', () => {
        overlay.classList.toggle('hidden');
      });
    }

    if (buttonAdd) {
      buttonAdd.addEventListener('click', () => {
        overlay.classList.toggle('hidden');
      });
    }

    const btupdatechapter = this.el.nativeElement.querySelector('#updatechapter');
    const viewupdatechapter = this.el.nativeElement.querySelector('#viewupdatechapter');
    const outupdatechapter = this.el.nativeElement.querySelector('#outupdatechapter');
    if (btupdatechapter) {
      btupdatechapter.addEventListener('click', () => {
        viewupdatechapter.classList.toggle('hidden');
      });
    }
    if (outupdatechapter) {
      outupdatechapter.addEventListener('click', () => {
        viewupdatechapter.classList.toggle('hidden');
      });
    }


    const addChapterButton = this.el.nativeElement.querySelector('#addchapter');
    const addChapterOverlay = this.el.nativeElement.querySelector('#AddChap');
    const outChap = this.el.nativeElement.querySelector('#outchap');

    if (outChap) {
      outChap.addEventListener('click', () => {
        addChapterOverlay.classList.toggle('hidden');
      });
    }

    if (addChapterButton) {
      addChapterButton.addEventListener('click', () => {
        addChapterOverlay.classList.toggle('hidden');
      });
    }

    const deleteChapButton = this.el.nativeElement.querySelector('#DeleteChap');
    const deleteChapterOverlay = this.el.nativeElement.querySelector('#deletechapter');
    const outDelete = this.el.nativeElement.querySelector('#outdeletechapter');

    if (outDelete) {
      outDelete.addEventListener('click', () => {
        deleteChapterOverlay.classList.toggle('hidden');
      });
    }

    if (deleteChapButton) {
      deleteChapButton.addEventListener('click', () => {
        deleteChapterOverlay.classList.toggle('hidden');
      });
    }

    const userupdate =this.el.nativeElement.querySelector('#userupdate');
        userupdate.addEventListener('click', () => {
          userOverlay.classList.remove('hidden');
          updateUserOverlay.classList.add('hidden');
        });

    const userButton = this.el.nativeElement.querySelector('#manageStories1');
    const userOverlay = this.el.nativeElement.querySelector('#user');
    const outUser = this.el.nativeElement.querySelector('#outuser');


    if (outUser) {
      outUser.addEventListener('click', () => {
        userOverlay.classList.toggle('hidden');
      });
    }

    if (userButton) {
      userButton.addEventListener('click', () => {
        userOverlay.classList.toggle('hidden');
      });
    }

    const updateUserButton = this.el.nativeElement.querySelector('#updates');
    const updateUserOverlay = this.el.nativeElement.querySelector('#updateuser');
    const outUpdateUser = this.el.nativeElement.querySelector('#outupdateuser');

    if (outUpdateUser) {
      outUpdateUser.addEventListener('click', () => {
        updateUserOverlay.classList.toggle('hidden');
        userOverlay.classList.add('hidden');
      });
    }

    if (updateUserButton) {
      updateUserButton.addEventListener('click', () => {
        updateUserOverlay.classList.toggle('hidden');
        userOverlay.classList.add('hidden');
      });
    }
  }


}
