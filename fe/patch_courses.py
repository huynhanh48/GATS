import re

with open("src/app/courses/page.tsx", "r") as f:
    content = f.read()

# 1. Add imports
content = content.replace('import {', 'import { Course, CourseCategory, PaginationData } from "@/types/course";\nimport { PathApi } from "@/constants/PathApi";\nimport {', 1)

# 2. Remove coursesData mock
content = re.sub(r'const coursesData = \[.*?\];', '', content, flags=re.DOTALL)

# 3. Replace component body logic
new_logic = """
export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [productTypeFilter, setProductTypeFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isLoading, setIsLoading] = useState(true);

  // Accordion Toggles
  const [openAccordion, setOpenAccordion] = useState<Record<string, boolean>>({
    level: true,
    productType: true,
    price: true,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordion(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + PathApi.courses.categories)
      .then(res => res.json())
      .then(res => {
         if(res.data) setCategories(res.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(itemsPerPage),
    });
    
    if (levelFilter !== "all") params.append("level", levelFilter);
    if (productTypeFilter !== "all") params.append("category", productTypeFilter);
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL}${PathApi.courses.list}?${params.toString()}`)
      .then(res => res.json())
      .then(res => {
        if (res.data) {
           // Apply local sorting and price filtering if needed, but since API paginates, 
           // we should ideally let backend handle it. For now we just render.
           setCourses(res.data);
        }
        if (res.pagination) setPagination(res.pagination);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [levelFilter, productTypeFilter, currentPage]);

  const formatPrice = (value: number) => {
    return value.toLocaleString("vi-VN") + "đ";
  };

  const getUIProps = (course: Course) => {
    const cat = course.category?.slug || '';
    let imageGradient = 'from-[#0070EB]/80 to-[#0070EB]/30';
    let glowColor = 'rgba(0, 112, 235, 0.15)';
    if(cat === 'bootcamp') {
       imageGradient = 'from-[#F59E0B]/70 to-[#D946EF]/35';
       glowColor = 'rgba(245, 158, 11, 0.15)';
    } else if (cat === 'template') {
       imageGradient = 'from-[#D946EF]/80 to-[#D946EF]/30';
       glowColor = 'rgba(217, 70, 239, 0.15)';
    }

    let levelLabel = 'Cơ bản';
    if(course.level === 'intermediate') levelLabel = 'Trung cấp';
    if(course.level === 'advanced') levelLabel = 'Nâng cao';

    return { imageGradient, glowColor, levelLabel };
  };
"""

content = re.sub(r'export default function CoursesPage\(\) \{.*?(?=  return \()', new_logic, content, flags=re.DOTALL)

# 4. Replace product type options to use dynamic categories
dynamic_categories = """
                    {[ 
                      { id: "all", name: "Tất cả" },
                      ...categories
                    ].map(opt => (
                      <label key={opt.id} className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer py-1">
                        <input
                          type="radio"
                          name="productType"
                          checked={productTypeFilter === (opt.slug || opt.id)}
                          onChange={() => {
                             setProductTypeFilter(opt.slug || opt.id);
                             setCurrentPage(1);
                          }}
                          className="accent-primary w-4 h-4"
                        />
                        <span>{opt.name} {opt.courseCount ? `(${opt.courseCount})` : ''}</span>
                      </label>
                    ))}
"""

content = re.sub(r'\{\[\s*\{ id: "all".*?\]\.map\(opt => \(.*?\)\)\}', dynamic_categories, content, flags=re.DOTALL)

# 5. Fix level filter to reset page
content = content.replace('onChange={() => setLevelFilter(opt.id)}', 'onChange={() => { setLevelFilter(opt.id); setCurrentPage(1); }}')

# 6. Replace courses grid rendering mapping
grid_start = content.find('{filteredCourses.slice(')
if grid_start != -1:
    grid_end = content.find('</div>', grid_start)
    
    new_grid = """
              {isLoading ? (
                <div className="col-span-full py-20 text-center text-muted-foreground">Đang tải dữ liệu...</div>
              ) : courses.map((course, idx) => {
                const ui = getUIProps(course);
                return (
                <Link href={`/courses/${course.slug}`} key={course.id} className="block group/link cursor-pointer">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="group flex flex-col rounded-2xl border border-border/40 bg-[#ffffff]/[0.02] backdrop-blur-md hover:border-primary/50 transition-all duration-300 overflow-hidden shadow-lg h-full"
                    style={{
                      boxShadow: `0 0 30px -10px ${ui.glowColor}`
                    }}
                  >
                    {/* Visual Top Container */}
                    <div className={`relative w-full aspect-square bg-gradient-to-br ${ui.imageGradient} p-6 flex flex-col justify-between overflow-hidden border-b border-border/40`}>
                      {course.thumbnail && (
                        <img src={course.thumbnail} alt={course.title} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:scale-110 transition-transform duration-500" />
                      )}
                      {/* Glow animation overlay */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)] opacity-80 group-hover:scale-110 transition-transform duration-500" />

                      {/* Header: Discount & Logo */}
                      <div className="flex items-center justify-between w-full relative z-10">
                        {course.salePrice && course.price > course.salePrice ? (
                          <div className="px-2.5 py-1 rounded bg-[#F59E0B] text-black text-[11px] font-bold shadow-md uppercase">
                            Giảm đến {formatPrice(course.price - course.salePrice)}
                          </div>
                        ) : <div />}
                        <div className="text-[10px] font-bold text-white/80 tracking-widest uppercase bg-black/35 backdrop-blur-sm px-2 py-0.5 rounded border border-white/5">
                          GATS Academy
                        </div>
                      </div>

                      {/* Middle: Title & Desc in Banner */}
                      <div className="my-auto text-center relative z-10 max-w-[90%] mx-auto">
                        <h4 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md uppercase line-clamp-3">
                          {course.title}
                        </h4>
                        <p className="text-[11px] font-bold text-yellow-300 mt-1 uppercase tracking-wider drop-shadow">
                          {course.category?.name || 'Khóa học'}
                        </p>
                      </div>

                      {/* Bottom: Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-auto relative z-10">
                        <span className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm text-white text-[9px] font-semibold border border-white/10">
                          {ui.levelLabel}
                        </span>
                      </div>
                    </div>

                    {/* Card Info Bottom */}
                    <div className="p-5 flex-1 flex flex-col justify-between bg-card text-card-foreground">
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                            {ui.levelLabel} • {course.category?.name || 'Khóa học'}
                          </span>
                        </div>

                        <h3 className="font-bold text-base leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                      </div>

                      {/* Price and Action */}
                      <div className="pt-4 border-t border-border/40 mt-4 flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                          {course.salePrice && course.price > course.salePrice ? (
                            <>
                              <span className="text-[10px] text-muted-foreground line-through">
                                {formatPrice(course.price)}
                              </span>
                              <span className="text-lg font-black text-[#F59E0B]">
                                {formatPrice(course.salePrice)}
                              </span>
                            </>
                          ) : (
                             <span className="text-lg font-black text-[#F59E0B]">
                                {formatPrice(course.price)}
                             </span>
                          )}
                        </div>

                        <button className="h-8 px-4 rounded-full bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow shadow-primary/25 cursor-pointer">
                          Đăng ký
                        </button>
                      </div>
                    </div>

                  </motion.div>
                </Link>
              )})}
"""
    content = content[:grid_start] + new_grid + content[grid_end:]

# 7. Fix pagination logic
pag_start = content.find('{Math.ceil(filteredCourses.length / itemsPerPage) > 1 && (')
if pag_start != -1:
    pag_end = content.find(')}', pag_start) + 2
    new_pag = """
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center gap-6 bg-background/80 border border-border/40 backdrop-blur-md px-6 py-2 rounded-full shadow-md select-none">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-sm font-semibold text-foreground">
                    {currentPage} / {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                    disabled={currentPage === pagination.totalPages}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
"""
    content = content[:pag_start] + new_pag + content[pag_end:]

# 8. Fix empty state
content = content.replace('{filteredCourses.length === 0 && (', '{!isLoading && courses.length === 0 && (')
content = content.replace('Tìm thấy <span className="text-foreground font-semibold">{filteredCourses.length}</span>', 'Tìm thấy <span className="text-foreground font-semibold">{pagination?.total || 0}</span>')

with open("src/app/courses/page.tsx", "w") as f:
    f.write(content)
