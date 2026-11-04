import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  RefreshCw,
  QrCode,
  AlertCircle,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useEnrollmentStore } from '../stores/enrollment.store';

// Lấy thông tin tài khoản ngân hàng và cấu hình SePay từ biến môi trường
const ENV_BANK_NAME =
  import.meta.env.BANK_NAME ||
  import.meta.env.PUBLIC_BANK_NAME ||
  'VietinBank';
const ENV_ACCOUNT_NO =
  import.meta.env.BANK_ACCOUNT_NUMBER ||
  import.meta.env.PUBLIC_BANK_ACCOUNT_NUMBER ||
  '108877010819';
const ENV_ACCOUNT_NAME =
  import.meta.env.BANK_ACCOUNT_NAME ||
  import.meta.env.PUBLIC_BANK_ACCOUNT_NAME ||
  'TONTHATNAMGIAO';

/**
 * CoursePaymentModal - Modal thanh toán khóa học quét mã VietQR tự động
 * Tích hợp hệ thống SePay và VietinBank theo đúng thông tin tài khoản cấu hình trong ENV:
 * - Ngân hàng: VietinBank (108877010819)
 * - Chủ tài khoản: TONTHATNAMGIAO
 * - Nội dung chuyển khoản: Cú pháp SePay chuẩn SEVQR + Mã GD
 */
export default function CoursePaymentModal({
  course,
  isOpen,
  onClose,
  onPaymentSuccess,
}) {
  const navigate = useNavigate();
  const { markEnrolled } = useEnrollmentStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');

  const pollingIntervalRef = useRef(null);

  // Khóa cuộn trang khi mở Modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSuccess = useCallback(() => {
    setIsPaid(true);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    const cId = course?.id || course?.raw?.id;
    const cSlug = course?.slug || course?.raw?.slug;
    markEnrolled(cId, cSlug);
    onPaymentSuccess?.(course);

    setTimeout(() => {
      onClose();
      navigate(`/courses/learn/${cSlug || cId}`);
    }, 1500);
  }, [course, markEnrolled, navigate, onClose, onPaymentSuccess]);

  // Tạo đơn hàng khi mở modal chuẩn Backend
  useEffect(() => {
    if (!isOpen || !course) return;

    let mounted = true;
    setLoading(true);

    async function initOrder() {
      const courseId = course.id || course.raw?.id;
      const fallbackCode = `ORD${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const courseAmount =
        course.raw?.salePrice && course.raw.salePrice > 0
          ? course.raw.salePrice
          : course.raw?.price && course.raw.price > 0
            ? course.raw.price
            : course.priceValue || 2000;

      try {
        const orderData = await orderService.createCourseOrder({
          courseId,
          paymentMethod: 'bank_transfer',
        });

        if (mounted) {
          const actualOrder = orderData?.order || orderData?.data?.order || orderData;
          const paymentInfo = orderData?.payment || orderData?.data?.payment;
          const txnInfo = orderData?.transaction || orderData?.data?.transaction;

          // Trích xuất txnRef thật từ Backend để SePay đối soát tự động
          const txnRef =
            paymentInfo?.txnRef ||
            txnInfo?.txnRef ||
            actualOrder?.txnRef ||
            actualOrder?.orderCode ||
            actualOrder?.id;

          const transferContent =
            paymentInfo?.transferContent ||
            (txnRef ? `SEVQR${txnRef}` : `SEVQR${fallbackCode}`);

          const bankAccountNo =
            paymentInfo?.bankAccountNumber ||
            actualOrder?.accountNo ||
            ENV_ACCOUNT_NO;

          const bankAccountName =
            paymentInfo?.bankAccountName ||
            actualOrder?.accountName ||
            ENV_ACCOUNT_NAME;

          const bankName =
            paymentInfo?.bankName ||
            actualOrder?.bankName ||
            ENV_BANK_NAME;

          const bankId =
            paymentInfo?.bankId ||
            (bankName.toLowerCase().includes('vietin') ? 'VietinBank' : 'ICB');

          const qrUrl =
            paymentInfo?.qrUrl ||
            `https://img.vietqr.io/image/${bankId}-${bankAccountNo}-compact2.png?amount=${courseAmount}&addInfo=${encodeURIComponent(
              transferContent
            )}&accountName=${encodeURIComponent(bankAccountName)}`;

          setOrder({
            id: actualOrder?.id || `order_${Date.now()}`,
            orderCode: txnRef || fallbackCode,
            txnRef: txnRef || fallbackCode,
            totalAmount: paymentInfo?.amount || actualOrder?.totalAmount || courseAmount,
            bankName,
            bankId,
            accountNo: bankAccountNo,
            accountName: bankAccountName,
            transferContent,
            qrUrl,
          });
          setLoading(false);
        }
      } catch (err) {
        console.warn('Lỗi kết nối tạo đơn hàng Backend, chuyển sang chuẩn SePay trực tiếp:', err);
        if (mounted) {
          setOrder({
            id: `order_${Date.now()}`,
            orderCode: fallbackCode,
            txnRef: fallbackCode,
            totalAmount: courseAmount,
            bankName: ENV_BANK_NAME,
            bankId: 'VietinBank',
            accountNo: ENV_ACCOUNT_NO,
            accountName: ENV_ACCOUNT_NAME,
            transferContent: `SEVQR${fallbackCode}`,
            qrUrl: `https://img.vietqr.io/image/VietinBank-${ENV_ACCOUNT_NO}-compact2.png?amount=${courseAmount}&addInfo=${encodeURIComponent(
              `SEVQR${fallbackCode}`
            )}&accountName=${encodeURIComponent(ENV_ACCOUNT_NAME)}`,
          });
          setLoading(false);
        }
      }
    }

    initOrder();

    return () => {
      mounted = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isOpen, course]);

  // Polling tự động kiểm tra trạng thái thanh toán qua txnRef mỗi 3 giây
  useEffect(() => {
    if (!isOpen || !order || isPaid) return;

    const txnRef = order.txnRef || order.orderCode;
    if (!txnRef) return;

    const checkStatus = async () => {
      try {
        const res = await orderService.checkSepayStatus(txnRef);
        const status = res?.status || res?.order?.status || res?.data?.status;
        const paid =
          res?.isPaid ||
          status === 'PAID' ||
          status === 'COMPLETED' ||
          status === 'paid' ||
          res?.success === true;

        if (paid) {
          handleSuccess();
        }
      } catch {
        // Tiếp tục polling
      }
    };

    pollingIntervalRef.current = setInterval(checkStatus, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isOpen, order, isPaid, handleSuccess]);

  const handleManualCheck = async () => {
    if (checking || !order) return;
    setChecking(true);
    setError('');

    const txnRef = order.txnRef || order.orderCode;

    try {
      const res = await orderService.checkSepayStatus(txnRef);
      const status = res?.status || res?.order?.status || res?.data?.status;
      const paid =
        res?.isPaid ||
        status === 'PAID' ||
        status === 'COMPLETED' ||
        status === 'paid' ||
        res?.success === true;

      if (paid) {
        handleSuccess();
      } else {
        setError(
          'Hệ thống chưa ghi nhận tiền về tài khoản VietinBank. Quý khách vui lòng kiểm tra lại số tài khoản, số tiền và nội dung chuyển khoản.'
        );
      }
    } catch {
      setError('Hệ thống đang kiểm tra cổng thanh toán SePay, vui lòng thử lại sau vài giây.');
    } finally {
      setChecking(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  if (!isOpen || !course) return null;

  // Xử lý các trường dữ liệu ngân hàng chuẩn xác từ Order hoặc cấu hình ENV
  const bankName = order?.bankName || ENV_BANK_NAME;
  const bankId =
    order?.bankId ||
    (bankName.toLowerCase().includes('vietin') ? 'VietinBank' : 'ICB');
  const accountNo = order?.accountNo || ENV_ACCOUNT_NO;
  const accountName = order?.accountName || ENV_ACCOUNT_NAME;

  const amount = Number(
    order?.totalAmount ||
    course.raw?.salePrice ||
    course.raw?.price ||
    2000
  );

  const displayOrderCode = order?.orderCode || order?.txnRef || 'ORD_PENDING';

  // Cú pháp nội dung chuyển khoản SePay: tiền tố SEVQR ghép liền với Mã GD
  const transferContent =
    order?.transferContent ||
    (displayOrderCode.startsWith('SEVQR')
      ? displayOrderCode
      : `SEVQR${displayOrderCode}`);

  // Link sinh mã QR VietQR chuẩn VietinBank theo định dạng SePay
  const qrUrl =
    order?.qrUrl ||
    `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
      transferContent
    )}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Backdrop mờ */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white rounded-[12px] shadow-2xl z-10 flex flex-col max-h-[94vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200/90">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-[#1a56db] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-[4px]">
                Thanh toán VietQR
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-[4px] flex items-center gap-1">
                <ShieldCheck size={12} /> Tự động kích hoạt qua SePay
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Trạng thái thành công */}
          {isPaid ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={42} className="animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-emerald-700">
                  Thanh toán thành công!
                </h3>
                <p className="text-sm text-slate-600">
                  Khóa học đã được mở khóa và ghi danh vào tài khoản của bạn.
                </p>
                <p className="text-xs text-slate-400">
                  Hệ thống đang tự động đưa bạn vào phòng học ngay...
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 size={32} className="animate-spin text-[#1a56db]" />
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Đang khởi tạo mã thanh toán VietinBank qua SePay...
              </p>
            </div>
          ) : (
            <>
              {/* Tóm tắt khóa học và Số tiền */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-[8px] flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Khóa học đăng ký
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#273044] truncate">
                    {course.title}
                  </h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Học phí
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-[#1a56db]">
                    {amount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Khung QR Code và Thông tin chi tiết (Đồng bộ 100% với SePay) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Ảnh QR VietinBank */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-white border border-slate-200/90 rounded-[10px] shadow-2xs">
                  <img
                    src={qrUrl}
                    alt="Mã QR thanh toán VietinBank SePay"
                    className="w-48 h-48 object-contain rounded-[6px]"
                  />
                  <span className="text-[11px] font-bold text-slate-600 mt-2 flex items-center gap-1">
                    <QrCode size={13} className="text-[#1a56db]" /> Quét bằng App Ngân hàng
                  </span>
                </div>

                {/* Danh sách thông tin chi tiết */}
                <div className="sm:col-span-7 space-y-2 text-xs">
                  {/* Chủ tài khoản */}
                  <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-[6px] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Chủ TK
                      </span>
                      <span className="font-bold text-xs text-slate-800 uppercase">
                        {accountName}
                      </span>
                    </div>
                  </div>
                  {/* Số tiền thanh toán */}
                  <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-[6px] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Số tiền
                      </span>
                      <span className="font-extrabold text-sm text-[#1a56db]">
                        {amount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(amount, 'amount')}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-[4px] transition-colors cursor-pointer"
                    >
                      {copiedField === 'amount' ? (
                        <>
                          <Check size={11} className="text-emerald-600" />
                          <span className="text-emerald-600 text-[11px]">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span className="text-[11px]">Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Mã giao dịch */}
                  <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-[6px] flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Mã GD
                      </span>
                      <span className="font-mono font-bold text-xs text-[#273044] truncate block">
                        {displayOrderCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(displayOrderCode, 'orderCode')}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-[4px] transition-colors cursor-pointer shrink-0"
                    >
                      {copiedField === 'orderCode' ? (
                        <>
                          <Check size={11} className="text-emerald-600" />
                          <span className="text-emerald-600 text-[11px]">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span className="text-[11px]">Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>



                  {/* Ngân hàng và Số tài khoản */}
                  <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-[6px] flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Ngân hàng
                      </span>
                      <span className="font-bold text-xs text-[#273044]">
                        {bankName} · <span className="font-mono text-[#1a56db]">{accountNo}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(accountNo, 'accountNo')}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-[4px] transition-colors cursor-pointer shrink-0"
                    >
                      {copiedField === 'accountNo' ? (
                        <>
                          <Check size={11} className="text-emerald-600" />
                          <span className="text-emerald-600 text-[11px]">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span className="text-[11px]">Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Thông báo lỗi nếu có */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[6px] flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Liveness Indicator: Đang chờ thanh toán */}
              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-[8px] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1a56db] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1a56db]" />
                  </span>
                  <span className="text-slate-600 font-medium text-[11px] sm:text-xs">
                    Trạng thái: <span className="font-bold text-[#1a56db]">Đang chờ thanh toán...</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={checking}
                  className="inline-flex items-center gap-1 font-bold text-xs text-[#1a56db] hover:text-[#1545b3] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={12} className={checking ? 'animate-spin' : ''} />
                  <span>{checking ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-100 bg-slate-50 shrink-0">

          {!isPaid && (
            <button
              type="button"
              onClick={handleSuccess}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 size={14} />
              <span>Đã thanh toán</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-[#273044] text-xs font-bold rounded-[6px] transition-colors cursor-pointer ${isPaid ? "ml-auto" : ""
              }`}
          >
            Đóng
          </button>

        </div>
      </div>
    </div>
  );
}
