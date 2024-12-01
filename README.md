
-USER SERVICE LE TRUNG NGUYEN-
-Đăng nhập :
+ Xử lý đăng nhập bằng tài khoản google, facebook, tài khoản hệ thống
+ Xử lý chuyển trang sau đăng nhập, không vào trang đăng nhập khi đã đăng nhập, không vào được trang thông tin cá nhân khi chưa đăng nhập
+ Xử lý lưu thông tin tài khoản sau đăng nhập bằng cookie có mã hóa JWT
+ Xử lý không đăng nhập được khi khóa tài khoản có thông báo cho người dùng, và mở tài khoản khi thời gian khóa hết hạn
-Đăng ký :
+ Xử lý chuyển sang đăng nhập đối với các tài khoản google, facebook đã tồn tại
+ Xử lý báo lỗi các trường dữ liệu nhập chưa hợp lệ, kiểm tra email xác thực có tồn tại thật sự hay không và đều hiện thông báo lỗi
-Thông tin cá nhân :
+ Tạo thông tin cá nhân cho người dùng khi lần đầu đăng ký, đối với tài khoản google và facebook sẽ lấy tên và hình ảnh từ tài khoản đó.
+ Cập nhật tên, hình ảnh, email ( email muốn đổi được thì kiểm tra email xác thực có tồn tại thật sự hay không ), thông báo thành công hoặc thất bại
