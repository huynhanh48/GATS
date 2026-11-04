import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Shared Components
import RouteRobots from '@/shared/components/RouteRobots';
import BookFinLoading from '@/shared/components/BookFinLoading';
import NotFound from '@/shared/components/NotFound';
import { ToastContainer } from '@/shared/components/Toast';

// Auth Module
import { AuthModal } from '@/modules/auth';
const ForgotPassword = lazy(() => import('@/modules/auth').then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('@/modules/auth').then((m) => ({ default: m.ResetPassword })));
const VerifyEmail = lazy(() => import('@/modules/auth').then((m) => ({ default: m.VerifyEmail })));

// Home / Landing Module
import { LandingPage } from '@/modules/home';
const Home = lazy(() => import('@/modules/home').then((m) => ({ default: m.Home })));

// Shop Module
const Product = lazy(() => import('@/modules/shop').then((m) => ({ default: m.Product })));
const Shop = lazy(() => import('@/modules/shop').then((m) => ({ default: m.Shop })));
const Cart = lazy(() => import('@/modules/shop').then((m) => ({ default: m.Cart })));
const Checkout = lazy(() => import('@/modules/shop').then((m) => ({ default: m.Checkout })));
const CheckoutSuccess = lazy(() => import('@/modules/shop').then((m) => ({ default: m.CheckoutSuccess })));
const PaymentVerify = lazy(() => import('@/modules/shop').then((m) => ({ default: m.PaymentVerify })));

// Blog Module
const Blog = lazy(() => import('@/modules/blog').then((m) => ({ default: m.Blog })));
const Post = lazy(() => import('@/modules/blog').then((m) => ({ default: m.Post })));

// Real Estate Module
const RealEstate = lazy(() => import('@/modules/real-estate').then((m) => ({ default: m.RealEstate })));

// Course Module (Dedicated Module Router)
const CourseRoutes = lazy(() => import('@/modules/course').then((m) => ({ default: m.CourseRoutes })));
const CoursePlayerPage = lazy(() => import('@/modules/course').then((m) => ({ default: m.CoursePlayerPage })));
const MyCourses = lazy(() => import('@/modules/course').then((m) => ({ default: m.MyCourses })));
const RoadmapPage = lazy(() => import('@/modules/course').then((m) => ({ default: m.RoadmapPage })));

// Features Module
const SkillsPage = lazy(() => import('@/modules/skills').then((m) => ({ default: m.SkillsPage })));
const McpPage = lazy(() => import('@/modules/mcp/pages/mcp/McpPage'));
const ApiPage = lazy(() => import('@/modules/api/pages/api/ApiPage'));
const ToolsPage = lazy(() => import('@/modules/tools/pages/tools/ToolsPage'));
const PromptsPage = lazy(() => import('@/modules/prompts').then((m) => ({ default: m.PromptsPage })));
const StemPage = lazy(() => import('@/modules/stem').then((m) => ({ default: m.StemPage })));

// Account Module
import { AccountLayout } from '@/modules/account';
const Profile = lazy(() => import('@/modules/account').then((m) => ({ default: m.Profile })));
const Orders = lazy(() => import('@/modules/account').then((m) => ({ default: m.Orders })));
const OrderDetail = lazy(() => import('@/modules/account').then((m) => ({ default: m.OrderDetail })));
const Notifications = lazy(() => import('@/modules/account').then((m) => ({ default: m.Notifications })));
const Wishlist = lazy(() => import('@/modules/account').then((m) => ({ default: m.Wishlist })));

// Admin Module
import { AdminLayout } from '@/modules/admin';
const AdminDashboard = lazy(() => import('@/modules/admin').then((m) => ({ default: m.AdminDashboard })));
const CourseManagement = lazy(() => import('@/modules/admin').then((m) => ({ default: m.CourseManagement })));
const EnrollmentManagement = lazy(() => import('@/modules/admin').then((m) => ({ default: m.EnrollmentManagement })));
const ProductManagement = lazy(() => import('@/modules/admin').then((m) => ({ default: m.ProductManagement })));
const OrderManagement = lazy(() => import('@/modules/admin').then((m) => ({ default: m.OrderManagement })));
const ContactManagement = lazy(() => import('@/modules/admin').then((m) => ({ default: m.ContactManagement })));
const PostManagement = lazy(() => import('@/modules/admin').then((m) => ({ default: m.PostManagement })));
const CategoryManagement = lazy(() => import('@/modules/admin').then((m) => ({ default: m.CategoryManagement })));
const AdminMedia = lazy(() => import('@/modules/admin').then((m) => ({ default: m.AdminMedia })));
const UserManagement = lazy(() => import('@/modules/admin').then((m) => ({ default: m.UserManagement })));
const VoucherManagement = lazy(() => import('@/modules/admin').then((m) => ({ default: m.VoucherManagement })));
const AdminLogs = lazy(() => import('@/modules/admin').then((m) => ({ default: m.AdminLogs })));
const SearchLog = lazy(() => import('@/modules/admin').then((m) => ({ default: m.SearchLog })));
const ShippingConfig = lazy(() => import('@/modules/admin').then((m) => ({ default: m.ShippingConfig })));
const WarehouseManagement = lazy(() => import('@/modules/admin').then((m) => ({ default: m.WarehouseManagement })));
const RevenueDashboard = lazy(() => import('@/modules/admin').then((m) => ({ default: m.RevenueDashboard })));
const NewsletterManagement = lazy(() => import('@/modules/admin').then((m) => ({ default: m.NewsletterManagement })));
const ReportManagement = lazy(() => import('@/modules/admin').then((m) => ({ default: m.ReportManagement })));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <RouteRobots />
      <ToastContainer />
      <AuthModal />
      <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
            <BookFinLoading />
          </div>
        }
      >
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Phòng học trực tuyến chuyên dụng (Fullscreen Learning Classroom) */}
          <Route path="/courses/learn/:slug/:lessonId?" element={<CoursePlayerPage />} />

          <Route element={<LandingPage />}>
            <Route path="/" element={<Home />} />
            <Route path="/product/:identifier" element={<Product />} />
            <Route path="/post/:slug" element={<Post />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/shop/:category?" element={<Shop />} />
            <Route path="/real-estate" element={<RealEstate />} />
            {/* Course Module Dedicated Routes */}
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/courses/*" element={<CourseRoutes />} />
            <Route path="/course-carousel" element={<Navigate to="/courses" replace />} />

            {/* Feature Routes */}
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/prompts" element={<PromptsPage />} />
            <Route path="/mcp" element={<McpPage />} />
            <Route path="/api" element={<ApiPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/stem" element={<StemPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/payment/verify" element={<PaymentVerify />} />

            {/* User Dashboard & Wishlist Routes (Shared persistent sidebar Layout) */}
            <Route element={<AccountLayout />}>
              <Route path="/account" element={<Navigate to="/account/profile" replace />} />
              <Route path="/account/profile" element={<Profile />} />
              <Route path="/account/orders" element={<Orders />} />
              <Route path="/account/my-courses" element={<MyCourses />} />
              <Route path="/account/orders/:id" element={<OrderDetail />} />
              <Route path="/account/notifications" element={<Notifications />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Route>

            {/* Admin Management Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="courses" element={<CourseManagement />} />
              <Route path="enrollments" element={<EnrollmentManagement />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="contacts" element={<ContactManagement />} />
              <Route path="posts" element={<PostManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="vouchers" element={<VoucherManagement />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="search-logs" element={<SearchLog />} />
              <Route path="shipping" element={<ShippingConfig />} />
              <Route path="warehouse" element={<WarehouseManagement />} />
              <Route path="revenue" element={<RevenueDashboard />} />
              <Route path="newsletter" element={<NewsletterManagement />} />
              <Route path="reports" element={<ReportManagement />} />
              <Route path="hero-slides" element={<Navigate to="/admin/media?tab=hero-slides" replace />} />
            </Route>

            {/* Catch-all route for 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
