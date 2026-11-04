import {AdminPageHeader} from "@/components/Layouts/admin-surface";import {SkillForm} from "../_components/skill-form";
export default function Page(){return <div className="space-y-4"><AdminPageHeader eyebrow="Công cụ AI / Skills" title="Tạo Skill mới" description="Đăng gói hướng dẫn Markdown hoặc ZIP cho người dùng."/><SkillForm/></div>}
