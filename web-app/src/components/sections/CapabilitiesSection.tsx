import { SectionHeader } from "@/components/ted/section-header";
import { Surface } from "@/components/ui/surface";

const experts = [
  { src: "/professional/person-1.jpg", name: "Liam Johnson", role: "AI Research Lead" },
  { src: "/professional/person-2.jpg", name: "Oliver Smith", role: "Machine Learning Engineer" },
  { src: "/professional/person-3.jpg", name: "Nguyễn Minh Quân", role: "Data Scientist" },
  { src: "/professional/person-4.jpg", name: "Nguyễn Tuệ Mẫn", role: "AI Solutions Architect" },
  { src: "/professional/person-5.jpg", name: "Lê Thùy Dương", role: "NLP Specialist" },
];

export function CapabilitiesSection() {
  return (
    <section className="w-full bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Đội ngũ chuyên gia"
          title="Mentor GATS"
          description="Những chuyên gia trực tiếp đồng hành và chia sẻ kinh nghiệm ứng dụng AI trong công việc thực tế."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experts.map((expert) => (
            <Surface key={expert.name} className="overflow-hidden">
              <img
                src={expert.src}
                alt={`Chân dung ${expert.name}`}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover object-top"
              />
              <div className="p-5">
                <h3 className="text-lg font-semibold">{expert.name}</h3>
                <p className="mt-1 text-sm font-medium text-brand-primary">{expert.role}</p>
              </div>
            </Surface>
          ))}
        </div>
      </div>
    </section>
  );
}
