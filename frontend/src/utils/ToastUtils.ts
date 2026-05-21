import Swal from 'sweetalert2';

/**
 * Hiển thị thông báo toast thành công với cấu hình mặc định.
 * @param title Tiêu đề của thông báo.
 * @param timer Thời gian hiển thị thông báo (mặc định 1500ms).
 */
export const showSuccessToast = (title: string, timer: number = 1500) => {
    return Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: title,
        timer: timer,
        showConfirmButton: false,
        width: 'auto',
        padding: '0.5em 1em',
        customClass: {
            popup: 'mb-6 rounded-full shadow-lg border border-gray-100 flex items-center',
            title: 'text-sm font-bold text-gray-700 whitespace-nowrap',
        }
    });
};

/**
 * Hiển thị thông báo toast lỗi với cấu hình mặc định.
 * @param title Tiêu đề của thông báo.
 * @param timer Thời gian hiển thị thông báo (mặc định 2500ms).
 */
export const showErrorToast = (title: string, timer: number = 2500) => {
    return Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: title,
        timer: timer,
        showConfirmButton: false,
        width: 'auto',
        padding: '0.5em 1em',
        customClass: {
            popup: 'mb-6 rounded-full shadow-lg border border-gray-100 flex items-center',
            title: 'text-sm font-bold text-gray-700 whitespace-nowrap',
        }
    });
};