import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { NewCourseForm } from "../_components/new-course-form";

export const metadata: Metadata = {
  title: "Thêm khóa học mới",
};

export default function NewCoursePage() {
  return (
    <>
      <div className="mx-auto w-full">
        <NewCourseForm />
      </div>
    </>
  );
}
