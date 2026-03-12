import { useNotification } from '../context/NotificationContext';

/**
 * Hook for common notification scenarios in the app
 */
export function useAppNotifications() {
  const { showNotification } = useNotification();

  const showAnalysisStart = () => {
    showNotification({
      type: 'info',
      title: 'เริ่มวิเคราะห์รูปภาพ',
      message: 'กำลังส่งข้อมูลไปยัง AI...',
      duration: 2000,
    });
  };

  const showAnalysisSuccess = (foodType: string) => {
    showNotification({
      type: 'success',
      title: 'วิเคราะห์เสร็จสิ้น',
      message: `${foodType} พร้อมแสดงผลแล้ว`,
      duration: 3000,
    });
  };

  const showAnalysisError = (error?: string) => {
    showNotification({
      type: 'error',
      title: 'วิเคราะห์ล้มเหลว',
      message: error || 'เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่',
      duration: 4000,
    });
  };

  const showOfflineMode = () => {
    showNotification({
      type: 'warning',
      title: 'โหมดออฟไลน์',
      message: 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต รูปภาพจะถูกบันทึกและวิเคราะห์ภายหลัง',
      duration: 4000,
    });
  };

  const showSavedToHistory = () => {
    showNotification({
      type: 'success',
      title: 'บันทึกแล้ว',
      message: 'ผลการวิเคราะห์ถูกบันทึกในประวัติแล้ว',
      duration: 2000,
    });
  };

  const showFeedbackSubmitted = () => {
    showNotification({
      type: 'success',
      title: 'ส่ง Feedback แล้ว',
      message: 'ขอบคุณสำหรับ Feedback ที่จะช่วยปรับปรุง AI',
      duration: 3000,
    });
  };

  const showLocationPermissionRequired = () => {
    showNotification({
      type: 'warning',
      title: 'ต้องการสิทธิ์ตำแหน่ง',
      message: 'กรุณาเปิดสิทธิ์ตำแหน่งเพื่อบันทึกตำแหน่งที่สแกน',
      duration: 3000,
    });
  };

  return {
    showAnalysisStart,
    showAnalysisSuccess,
    showAnalysisError,
    showOfflineMode,
    showSavedToHistory,
    showFeedbackSubmitted,
    showLocationPermissionRequired,
  };
}
