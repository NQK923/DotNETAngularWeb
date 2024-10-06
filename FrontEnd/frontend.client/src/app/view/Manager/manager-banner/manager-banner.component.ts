import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModelBanner } from '../../../Model/ModelBanner';
import { BannerService } from '../../../service/Banner/banner.service';

@Component({
  selector: 'app-manager-banner',
  templateUrl: './manager-banner.component.html',
  styleUrls: ['./manager-banner.component.css']
})
export class ManagerBannerComponent implements OnInit {

      banners: ModelBanner[] = [];


      constructor(private el: ElementRef ,private router: Router,private bannerService: BannerService) {}
      goToIndex() {
        this.router.navigate(['/']);
      }
      goTomanager() {
        this.router.navigate(['/manager']);
      }
      goToacount() {
        this.router.navigate(['/manager-account']);
      }
      goTostatiscal() {
        this.router.navigate(['/manager-statiscal']);
      }
      goToComment() {
        this.router.navigate(['/manager-comment']);
      }
      ngOnInit() {

        this.applyTailwindClasses();
        this.loadBanners();
      }

      applyTailwindClasses() {
        const manageStories = this.el.nativeElement.querySelector('#manageStories4');
        if (manageStories) {
          manageStories.classList.add('border-yellow-500', 'text-yellow-500');
        }
      }

      loadBanners(): void {
        this.bannerService.getBanner().subscribe(
          (data: ModelBanner[]) => {
            this.banners = data;
            console.log('Banners fetched:', this.banners);
          },
          error => {
            console.error('Lỗi khi lấy banner', error);
          }
        );
        this.setupEventListeners();
      }

      @ViewChild('dataurl') urlInput!: ElementRef;
      @ViewChild('dataurlimg') imageInput!: ElementRef;

      adddata() {
        const url_mangas = this.urlInput.nativeElement.value;
        const dataurlimgs = this.imageInput.nativeElement.files[0];

        // Chỉ định các thuộc tính cần thiết mà không có id_Banner
        const newBanner: ModelBanner = {
            url_manga: url_mangas,
            image_banner: '', // Placeholder cho URL hình ảnh
            datePosted: new Date() // Sử dụng ngày giờ hiện tại
        };

        // Nếu có tệp hình ảnh được chọn, đọc nó dưới dạng Data URL
        if (dataurlimgs) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
                newBanner.image_banner = event.target.result; // Thiết lập dữ liệu hình ảnh
                this.submitBanner(newBanner); // Gửi banner với hình ảnh
            };
            reader.readAsDataURL(dataurlimgs); // Đọc tệp dưới dạng Data URL
        } else {
            this.submitBanner(newBanner); // Gửi mà không có hình ảnh
        }
    }

    private submitBanner(newBanner: ModelBanner) {
      this.bannerService.addBanner(newBanner).subscribe(response => {
          if (response) {
              alert('Banner added successfully!'); // Hiển thị alert nếu thêm thành công
          } else {
              alert('Failed to add banner.'); // Hiển thị alert nếu thất bại
          }
      }, error => {
          console.error('Error adding banner:', error);
          alert('An error occurred while adding the banner.'); // Thông báo lỗi nếu có lỗi
      });
  }
  delete(id: number): void {
    // Hiển thị hộp thoại xác nhận
    if (confirm('Bạn có chắc chắn muốn xóa banner này?')) {
        this.bannerService.deleteBanner(id).subscribe(
            response => {
                alert(response ? 'Banner đã được xóa thành công!' : 'Có lỗi xảy ra khi xóa banner.');
                this.loadBanners(); // Tải lại danh sách banner
            },
            error => {
                console.error('Lỗi khi xóa banner', error);
                alert('Có lỗi xảy ra khi xóa banner.');
            }
        );
    }
}
  setupEventListeners() {
    const addBannerModal = this.el.nativeElement.querySelector('#AddBanner');
    const addBannerButton = this.el.nativeElement.querySelector('#addBannerButton');
    const outBanner = this.el.nativeElement.querySelector('#outbanner');

    // Kiểm tra xem phần tử outBanner có tồn tại không
    if (outBanner) {
        outBanner.addEventListener('click', () => {
            addBannerModal.classList.add('hidden'); // Ẩn khi nhấn thoát
        });
    }

    // Kiểm tra xem phần tử addBannerButton có tồn tại không
    if (addBannerButton) {
        addBannerButton.addEventListener('click', () => {
            addBannerModal.classList.remove('hidden'); // Hiển thị khi nhấn nút thêm banner
        });
    }
    }



    }
