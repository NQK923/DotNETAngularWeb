<p align="center">
  <img src="https://dotnetmangaimg.blob.core.windows.net/assets/logo4.png" alt="MAS Logo" width="50%">
</p>

<h1 align="center">WEB ĐỌC TRUYỆN TRANH SỬ DỤNG .NET MICROSERVICE</h1>

<p align="center">Cho phép người dùng có thể đọc, đăng tải và quản lý truyện tranh 1 cách nhanh chóng, tiện lợi và hiệu quả.</p>

<hr>
  
## Download / How to use it?

### Bước 1 - Tải về Docker

1.   Tải phiên bản docker phù hợp với máy của bạn tại trang chủ [Docker](https://www.docker.com/).
2.   Tiến hành cài đặt và khởi chạy Docker. Video tham khảo: [Hướng dẫn cài đặt Docker](https://www.youtube.com/watch?v=Ic48-WLhtHg&list=PLncHg6Kn2JT4kLKJ_7uy0x4AdNrCHbe0n&index=2)
3.   Sau khi cài đặt thành công docker sẽ khởi chạy như hình dưới
   ![image](https://github.com/user-attachments/assets/6cb4594c-c46f-4509-9db9-9e53f7f66b35)
---
> [!NOTE]
>
> - Nếu gặp lỗi khi cài đặt Docker, hãy sao chép mã lỗi và tìm kiếm cách giải quyết trên Google hoặc Stack Overflow.
> - Nếu có thắc mắc trong quá trình cài đặt, bạn có thể liên hệ qua [Discord](https://discord.gg/cKxnjsxM) để nhận giải đáp.
---

### Bước 2 - Clone Project

1.   Mở CMD bằng cách chuột phải vào biểu tượng Windows và chọn Terminal.
2.   Copy dòng lệnh dưới đây và nhấn Enter
```
git clone https://github.com/NQK923/DotNETAngularWeb.git
```
3.   Nếu clone thành công sẽ có kết quả như hình dưới.
![image](https://github.com/user-attachments/assets/dee2cbae-4aac-47d3-9d91-f672a55cafa4)

### Bước 3 - Containerization

1.   Mở Terminal và di chuyển đến folder root của Project vừa clone về bằng lệnh dưới đây:
```
cd <your_path>
```
2.   Giả sử folder của bạn có đường dẫn là: C:\Users\NQK\DotNETAngularWeb thì lệnh sẽ là:
```
cd C:\Users\NQK\DotNETAngularWeb
```
---
> [!NOTE]
>
> - Bạn cần khởi chạy Docker trước khi sử dụng lệnh này.
---
3.   Sau khi đã hoàn thành bước trên bạn có thể tiến hành đóng gói ứng dụn bằng docker compose như sau:
```
docker-compose up
```
4.   Đợi cho Docker tiến hành đóng gói Project(thường sẽ mất từ 1-2 phút)
5.   Nếu thành công sẽ có kết quả như hình dưới
![image](https://github.com/user-attachments/assets/f00c25b6-326f-4828-89c1-8227fc185c30)
![image](https://github.com/user-attachments/assets/867b211d-83e4-4e8f-ae81-6bb02acbbd2c)
6.   Kiểm tra đường dẫn bên dưới nếu có kết quả như hình thì tức là đã thành công.
```
http://localhost:4200/
```
![image](https://github.com/user-attachments/assets/abe87516-65dd-4297-b423-88300d6e4be4)

### Bước 4 - Cấu hình nginx và tiến hành sử dụng trang web
1.   Trong ứng dụng docker chọn vào container có tên `dotnetangularweb`.
2.   Trong container chọn vào image có tên `frontend`.
![image](https://github.com/user-attachments/assets/edfc9353-b7a7-47a7-aba7-629186102396)
3.   Trong frontend chọn vào mục `Files` sau đó tìm kiếm trong thư mục `/etc/nginx/conf.d/default.conf`
4.   Chuột phải và chọn `Edit file`
5.   Sửa dòng `root   /usr/share/nginx/html;` thành
```
root   /usr/share/nginx/html/browser;
```
6.   Nhấn tổ hợp phím `Ctrl + S` và sau đó Restart lại container.
![image](https://github.com/user-attachments/assets/1dc9d44c-b1a9-41b5-8baf-5a07258aa176)
7.   Kiểm tra lại bằng cách truy cập vào đường dẫn `http://localhost:4200/`, nếu kết quả như hình dưới thì tức là đã thành công.
![image](https://github.com/user-attachments/assets/21a70c18-c354-480b-b974-e46aed1693f7)
---
> [!NOTE]
>
> - Nếu bạn muốn sử dụng trên mạng LAN, có thể thay `localhost` bằng địa chỉ IPv4 của bạn.
> - Nếu bạn không biết địa chỉ IPv4 của mình, có thể tham khảo hướng dẫn [tại đây](https://support.microsoft.com/en-us/windows/find-your-ip-address-in-windows-f21a9bbc-c582-55cd-35e0-73431160a1b9).
---
<div align="center">
  
[![1.1]][1]
[![1.2]][2]

</div>

[1.1]: https://massgrave.dev/img/logo_discord.png
[1.2]: https://massgrave.dev/img/logo_github.png

[1]: [https://discord.gg/tVFN4N84PP](https://discord.gg/cKxnjsxM)
[2]: https://github.com/NQK923/DotNETAngularWeb
