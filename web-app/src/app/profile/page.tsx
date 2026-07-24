"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  User, Camera, BookOpen, Award, 
  Settings, Clock, PlayCircle, 
  ShieldCheck, Mail, LogOut, ChevronRight, Activity, CreditCard
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { changePasswordRequest } from "@/lib/auth/api";
import { orderApi } from "@/lib/cart/api";
import { fetchMyCertificates, type MyCertificate } from "@/lib/certificates/api";
import { PathApi } from "@/constants/PathApi";
import Link from "next/link";
import { Course } from "@/types/course";
import { toast } from "sonner";

const VN_TZ = "Asia/Ho_Chi_Minh";

type OrderStatusFilter =
  | "all"
  | "pending"
  | "paid"
  | "cancelled"
  | "refund_pending"
  | "refunded";

const ORDER_STATUS_FILTERS: { value: OrderStatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ thanh toán" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "refund_pending", label: "Đang hoàn tiền" },
  { value: "refunded", label: "Đã hoàn tiền" },
];

function formatVnDate(value: string) {
  try {
    return new Date(value).toLocaleString("vi-VN", {
      timeZone: VN_TZ,
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

export default function ProfilePage() {
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<MyCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "certificates" | "settings" | "orders">("overview");
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatusFilter>("all");
  const [userName, setUserName] = useState(user?.userName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [progressByCourseId, setProgressByCourseId] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      if (tab === "orders") {
        setActiveTab("orders");
      }
      const status = urlParams.get("status");
      if (
        status === "pending" ||
        status === "paid" ||
        status === "cancelled" ||
        status === "refund_pending" ||
        status === "refunded"
      ) {
        setOrderStatusFilter(status);
      }
    }
  }, []);

  useEffect(() => {
    if (status === "anonymous") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        apiClient.get(PathApi.enrollment.listMine),
        orderApi.listOrders(),
        fetchMyCertificates().catch(() => []),
      ])
        .then(async ([enrollRes, ordersRes, certs]: any) => {
          const list = Array.isArray(enrollRes?.data) ? enrollRes.data : [];
          if (list.length) setEnrollments(list);
          if (ordersRes.data) setOrders(ordersRes.data);
          setCertificates(Array.isArray(certs) ? certs : []);

          const progressEntries = await Promise.all(
            list.map(async (enr: any) => {
              const courseId = enr?.course?.id || enr?.courseId;
              if (!courseId) return null;
              try {
                const prog: any = await apiClient.get(
                  PathApi.progress.course(courseId),
                );
                const percent = Number(prog?.data?.percent ?? 0);
                return [courseId, Number.isFinite(percent) ? percent : 0] as const;
              } catch {
                return [courseId, 0] as const;
              }
            }),
          );

          const map: Record<string, number> = {};
          for (const entry of progressEntries) {
            if (entry) map[entry[0]] = entry[1];
          }
          setProgressByCourseId(map);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center font-bold text-foreground">Đang tải...</div>;
  }

  if (!user) return null;

  const profilePhoto = null; 
  const coverPhoto = "/auth-bg.jpg";

  const orderCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    paid: orders.filter((o) => o.status === "paid").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    refund_pending: orders.filter((o) => o.status === "refund_pending").length,
    refunded: orders.filter((o) => o.status === "refunded").length,
  };

  const filteredOrders =
    orderStatusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === orderStatusFilter);

  const openOrdersTab = (status: OrderStatusFilter = "all") => {
    setOrderStatusFilter(status);
    setActiveTab("orders");
    if (typeof window !== "undefined") {
      const params = new URLSearchParams();
      params.set("tab", "orders");
      if (status !== "all") params.set("status", status);
      window.history.replaceState(null, "", `?${params.toString()}`);
    }
  };



  return (
    <main className="min-h-screen bg-background relative pt-24 pb-16">
      <Header />
      
      {/* Cover Photo */}
      <div className="w-full h-48 md:h-64 relative bg-muted mt-4 max-w-7xl mx-auto rounded-3xl overflow-hidden px-4 md:px-8 shadow-sm">
        <Image
          src={coverPhoto}
          alt="profile cover"
          className="h-full w-full object-cover object-center absolute inset-0 rounded-3xl"
          width={1200}
          height={300}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute right-8 bottom-6 z-10">
          <button className="flex items-center justify-center gap-2 rounded-xl bg-black/40 backdrop-blur-md px-4 py-2.5 text-sm font-medium text-white hover:bg-black/60 transition border border-white/10">
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Thay đổi ảnh bìa</span>
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-8 -mt-16 md:-mt-20 relative z-20 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-1/3 xl:w-1/4">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm sticky top-24">
            <div className="relative mx-auto h-32 w-32 rounded-full bg-card p-1 shadow-md border border-border mb-4">
              <div className="relative flex items-center justify-center h-full w-full bg-muted rounded-full overflow-hidden">
                {profilePhoto ? (
                  <Image
                    src={profilePhoto}
                    fill
                    className="object-cover"
                    alt={`${user.userName} profile`}
                  />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg border-2 border-card hover:bg-primary/90 transition">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-1">{user.userName}</h1>
              <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-muted/50 p-3 rounded-2xl text-center border border-border/50">
                <div className="text-xl font-bold text-foreground">{enrollments.length}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase mt-0.5">Khóa học</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-2xl text-center border border-border/50">
                <div className="text-xl font-bold text-foreground">{certificates.length}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase mt-0.5">Chứng chỉ</div>
              </div>
            </div>

            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "overview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <Activity className="w-5 h-5" />
                Tổng quan
              </button>
              <button 
                onClick={() => setActiveTab("courses")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "courses" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <BookOpen className="w-5 h-5" />
                Khóa học của tôi
              </button>
              <button 
                onClick={() => setActiveTab("certificates")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "certificates" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <Award className="w-5 h-5" />
                Chứng chỉ
              </button>
              <button 
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "orders" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <CreditCard className="w-5 h-5" />
                Lịch sử giao dịch
              </button>
              <button 
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "settings" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <Settings className="w-5 h-5" />
                Cài đặt tài khoản
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="w-full lg:w-2/3 xl:w-3/4 mt-8 lg:mt-24 pb-12">
          
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-foreground">Tổng quan học tập</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-black text-foreground mb-1">0</div>
                  <div className="text-sm text-muted-foreground font-medium">Giờ học tập</div>
                </div>
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-black text-foreground mb-1">0</div>
                  <div className="text-sm text-muted-foreground font-medium">Bài học hoàn thành</div>
                </div>
                <button
                  type="button"
                  onClick={() => openOrdersTab("all")}
                  className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center hover:border-primary/40 hover:shadow-md transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-black text-foreground mb-1">{orderCounts.all}</div>
                  <div className="text-sm text-muted-foreground font-medium">Đơn hàng</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {orderCounts.pending} chờ thanh toán · {orderCounts.paid} đã thanh toán
                  </div>
                </button>
              </div>

              {enrollments.length > 0 && (
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-foreground">Tiếp tục học</h3>
                    <button onClick={() => setActiveTab("courses")} className="text-sm font-medium text-primary hover:underline flex items-center">
                      Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                  
                  {/* Show the most recent course */}
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="relative w-full sm:w-64 aspect-video rounded-2xl overflow-hidden bg-muted shrink-0 shadow-md">
                      <Image 
                        src={enrollments[0]?.course?.thumbnail || "/auth-bg.jpg"} 
                        alt="Course"
                        fill
                        className="bg-muted p-2 object-contain"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <PlayCircle className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      <h4 className="font-bold text-lg text-foreground line-clamp-2">
                        {enrollments[0]?.course?.title}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-muted-foreground">Tiến độ</span>
                          <span className="text-primary font-bold">
                            {progressByCourseId[enrollments[0]?.course?.id] ?? 0}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{
                              width: `${progressByCourseId[enrollments[0]?.course?.id] ?? 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <Link href={`/learn/${enrollments[0]?.course?.slug}`} className="inline-block">
                        <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
                          Học tiếp
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="text-2xl font-bold text-foreground">Lịch sử giao dịch</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredOrders.length}/{orderCounts.all} đơn
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {ORDER_STATUS_FILTERS.map((filter) => {
                  const count = orderCounts[filter.value];
                  const active = orderStatusFilter === filter.value;
                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => openOrdersTab(filter.value)}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                    >
                      {filter.label} ({count})
                    </button>
                  );
                })}
              </div>
              
              {orders.length === 0 ? (
                <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <CreditCard className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Chưa có giao dịch nào</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Bạn chưa thực hiện bất kỳ giao dịch mua khóa học nào. Khám phá các khóa học ngay hôm nay!
                  </p>
                  <Link href="/courses">
                    <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/25">
                      Khám phá khóa học
                    </button>
                  </Link>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-card border border-border rounded-3xl p-10 text-center shadow-sm">
                  <h3 className="text-lg font-bold mb-2">Không có đơn ở trạng thái này</h3>
                  <p className="text-muted-foreground mb-6">
                    Thử chọn bộ lọc khác để xem toàn bộ lịch sử giao dịch.
                  </p>
                  <button
                    type="button"
                    onClick={() => openOrdersTab("all")}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Xem tất cả đơn hàng
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 md:items-center">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <h4 className="font-bold text-lg text-foreground">
                              Đơn hàng #{(order.txnRef || order.id).slice(0, 12).toUpperCase()}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {formatVnDate(order.paidAt || order.createdAt)} • {order.paymentMethod === "bank_transfer" ? "Chuyển khoản" : order.paymentMethod}
                            </p>
                          </div>
                          <div className="shrink-0">
                            {order.status === "pending" && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">Chờ thanh toán</span>}
                            {order.status === "paid" && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">Đã thanh toán</span>}
                            {order.status === "cancelled" && <span className="bg-destructive/10 text-destructive text-xs font-bold px-3 py-1 rounded-full border border-destructive/20">Đã hủy</span>}
                            {order.status === "refund_pending" && <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">Đang hoàn tiền</span>}
                            {order.status === "refunded" && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">Đã hoàn tiền</span>}
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm py-1 gap-4">
                              <span className="text-foreground">{item.courseName}</span>
                              <span className="text-muted-foreground shrink-0">{item.price.toLocaleString("vi-VN")} đ</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between font-bold pt-2">
                          <span>Tổng cộng:</span>
                          <span className="text-primary">{order.totalAmount.toLocaleString("vi-VN")} đ</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-foreground mb-6">Khóa học của tôi</h2>
              
              {enrollments.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border rounded-3xl shadow-sm">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Chưa có khóa học nào</h3>
                  <p className="text-muted-foreground mb-6">Bạn chưa tham gia khóa học nào trên hệ thống.</p>
                  <Link href="/courses">
                    <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors">
                      Khám phá ngay
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrollments.map((enr: any) => {
                    const c: Course = enr.course;
                    const percent = progressByCourseId[c?.id] ?? 0;
                    return (
                      <div key={enr.id} className="border border-border rounded-3xl overflow-hidden bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                        <div className="relative aspect-video w-full bg-muted overflow-hidden">
                          <Image 
                            src={c.thumbnail || "/auth-bg.jpg"} 
                            alt={c.title} 
                            fill 
                            className="bg-muted p-2 object-contain"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <PlayCircle className="w-12 h-12 text-white" />
                          </div>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h5 className="font-bold text-foreground line-clamp-2 mb-4 group-hover:text-primary transition-colors">
                            {c.title}
                          </h5>
                          
                          <div className="mt-auto space-y-4">
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-muted-foreground">Đã hoàn thành</span>
                                <span className="text-primary">{percent}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: `${percent}%` }}></div>
                              </div>
                            </div>
                            
                            <Link href={`/learn/${c.slug}`} className="block">
                              <button className="w-full bg-muted/50 text-foreground hover:bg-primary hover:text-primary-foreground font-bold py-2.5 rounded-xl transition-colors">
                                {percent > 0 ? "Học tiếp" : "Bắt đầu học"}
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Certificates Tab */}
          {activeTab === "certificates" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-foreground mb-6">Chứng chỉ</h2>

              {certificates.length === 0 ? (
                <div className="text-center py-20 bg-card border border-border rounded-3xl shadow-sm">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Bạn chưa có chứng chỉ nào</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Hoàn thành 100% các bài học trong một khóa học để nhận được chứng nhận hoàn thành từ GATS Academy.
                  </p>
                  <Link
                    href="/learning"
                    className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                  >
                    Tiếp tục học ngay
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className={`relative overflow-hidden rounded-3xl border p-6 shadow-sm ${
                        cert.status === "revoked"
                          ? "border-border bg-muted/40 opacity-70"
                          : "border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Award className="w-6 h-6" />
                        </div>
                        {cert.status === "revoked" ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                            Đã thu hồi
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Đã hoàn thành
                          </span>
                        )}
                      </div>
                      <h4 className="mt-4 font-bold text-lg text-foreground line-clamp-2">
                        {cert.courseTitle ?? "Khóa học"}
                      </h4>
                      <p className="mt-1 text-xs font-mono text-muted-foreground">
                        Số hiệu: {cert.certificateNumber}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Cấp ngày {new Date(cert.issuedAt).toLocaleDateString("vi-VN")}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {cert.courseSlug ? (
                          <Link
                            href={`/courses/${cert.courseSlug}`}
                            className="text-sm font-semibold text-primary hover:underline"
                          >
                            Xem khóa học
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-foreground mb-6">Cài đặt tài khoản</h2>
              
              <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" /> Thông tin cá nhân
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">Họ và tên hiển thị</label>
                        <input 
                          type="text" 
                          value={userName} 
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">Email</label>
                        <input type="email" defaultValue={user.email} disabled className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-muted-foreground cursor-not-allowed opacity-70" />
                        <p className="text-xs text-muted-foreground">Không thể thay đổi email đã đăng ký.</p>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        try {
                          setIsSaving(true);
                          await apiClient.put(PathApi.auth.updateMe, { userName });
                          window.location.reload();
                        } catch (err) {
                          alert("Lưu thông tin thất bại");
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving || !userName}
                      className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? "Đang lưu..." : "Lưu thông tin"}
                    </button>
                  </div>
                </div>

                <div className="pt-8 border-t border-border">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" /> Đổi mật khẩu
                  </h3>
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-muted-foreground">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-muted-foreground">Mật khẩu mới</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-muted-foreground">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isChangingPassword}
                      onClick={async () => {
                        if (!currentPassword || !newPassword) {
                          toast.error("Vui lòng nhập đủ mật khẩu");
                          return;
                        }
                        if (newPassword !== confirmPassword) {
                          toast.error("Mật khẩu xác nhận không khớp");
                          return;
                        }
                        try {
                          setIsChangingPassword(true);
                          await changePasswordRequest(currentPassword, newPassword);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                          toast.success("Đã cập nhật mật khẩu");
                        } catch (err: any) {
                          toast.error(err?.message || "Cập nhật mật khẩu thất bại");
                        } finally {
                          setIsChangingPassword(false);
                        }
                      }}
                      className="bg-foreground text-background px-6 py-2.5 rounded-xl font-bold hover:bg-foreground/90 transition-colors disabled:opacity-50"
                    >
                      {isChangingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      Quên mật khẩu hiện tại?{" "}
                      <Link href="/forgot-password" className="text-primary font-semibold hover:underline">
                        Đặt lại qua email
                      </Link>
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
      
      <Footer />
    </main>
  );
}
