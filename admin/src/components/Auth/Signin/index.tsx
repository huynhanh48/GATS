import { Suspense } from "react";
import SigninWithPassword from "../SigninWithPassword";

export default function Signin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <SigninWithPassword />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Chỉ dành cho quản trị viên và mentor đã được phân công khóa học.
      </p>
    </Suspense>
  );
}
