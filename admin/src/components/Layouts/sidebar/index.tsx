"use client";

import { Logo } from "@/components/logo";
import { hasAdminRole, isInstructorOnly } from "@/lib/auth/access";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuIcon } from "../header/icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";

function isPathActive(pathname: string, url: string) {
  if (url === "/") return pathname === url;
  return pathname === url || pathname.startsWith(`${url}/`);
}

function isGroupActive(
  pathname: string,
  item: (typeof NAV_DATA)[number]["items"][number],
) {
  if (!item.items.length && "url" in item && typeof item.url === "string") {
    return isPathActive(pathname, item.url);
  }

  return item.items.some((subItem) =>
    isPathActive(pathname, subItem.url ?? ""),
  );
}

function getBestActiveUrl(pathname: string, items: Array<{ url?: string }>) {
  return items
    .map((item) => item.url ?? "")
    .filter((url) => url && isPathActive(pathname, url))
    .sort((a, b) => b.length - a.length)[0];
}

function isInstructorNavigationUrl(url?: string) {
  return (
    url === "/course" ||
    url === "/course/new" ||
    url === "/course/quiz" ||
    url === "/course/flashcards"
  );
}

export function Sidebar({ roles = [] }: { roles?: string[] }) {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const isAdmin = hasAdminRole(roles);
  const instructorOnly = isInstructorOnly(roles);

  const navData = useMemo(
    () =>
      NAV_DATA.map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if ("adminOnly" in item && item.adminOnly && !isAdmin) return false;
          if (!instructorOnly) return true;
          return item.items.some((subItem) =>
            isInstructorNavigationUrl(subItem.url),
          );
        }),
      })).filter((section) => section.items.length > 0),
    [instructorOnly, isAdmin],
  );

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));
  };

  useEffect(() => {
    for (const section of navData) {
      const active = section.items.find(
        (item) => item.items.length && isGroupActive(pathname, item),
      );
      if (active) {
        setExpandedItems((prev) =>
          prev.includes(active.title) ? prev : [active.title],
        );
        return;
      }
    }
  }, [pathname, navData]);

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "max-w-[290px] shrink-0 overflow-hidden border-r border-slate-200 bg-white transition-width duration-200 ease-linear dark:border-slate-800 dark:bg-[#07111f]",
          isMobile ? "fixed top-0 bottom-0 z-50" : "sticky top-0 h-screen",
          isOpen ? "w-full" : "w-0",
        )}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="flex h-full flex-col py-8 pr-3 pl-5">
          <div className="flex items-center justify-between pr-2">
            <Link
              href={instructorOnly ? "/course" : "/"}
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 py-2.5 min-[850px]:py-0"
            >
              <Logo />
            </Link>

            <button
              type="button"
              onClick={toggleSidebar}
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070EB] dark:border-slate-700 dark:bg-[#0f172a] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Thu nhỏ thanh điều hướng"
              title="Thu nhỏ sidebar"
            >
              <MenuIcon />
            </button>
          </div>

          <div className="custom-scrollbar mt-8 flex-1 overflow-y-auto pr-2">
            {navData.map((section) => (
              <div key={section.label} className="mb-7">
                <h2 className="mb-3 px-3 text-[11px] font-black tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">
                  {section.label}
                </h2>

                <nav role="navigation" aria-label={section.label}>
                  <ul className="space-y-1.5">
                    {section.items.map((item) => {
                      const visibleSubItems = instructorOnly
                        ? item.items.filter((subItem) =>
                            isInstructorNavigationUrl(subItem.url),
                          )
                        : item.items;
                      const active = isGroupActive(pathname, item);
                      const activeSubItemUrl = visibleSubItems.length
                        ? getBestActiveUrl(pathname, visibleSubItems)
                        : undefined;

                      return (
                        <li key={item.title}>
                          {visibleSubItems.length ? (
                            <div>
                              <MenuItem
                                isActive={active}
                                isExpanded={expandedItems.includes(item.title)}
                                onClick={() => toggleExpanded(item.title)}
                              >
                                <item.icon
                                  className="size-5 shrink-0"
                                  aria-hidden="true"
                                />

                                <span>{item.title}</span>

                                <ChevronUp
                                  className={cn(
                                    "ml-auto rotate-180 transition-transform duration-200",
                                    expandedItems.includes(item.title) &&
                                      "rotate-0",
                                  )}
                                  aria-hidden="true"
                                />
                              </MenuItem>

                              {expandedItems.includes(item.title) && (
                                <ul
                                  className="mr-0 ml-9 space-y-1.5 pt-2 pr-0 pb-3"
                                  role="menu"
                                >
                                  {visibleSubItems.map((subItem) => (
                                    <li key={subItem.title} role="none">
                                      <MenuItem
                                        as="link"
                                        href={subItem.url ?? "#"}
                                        isActive={
                                          subItem.url === activeSubItemUrl
                                        }
                                      >
                                        <span>{subItem.title}</span>
                                      </MenuItem>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ) : (
                            "url" in item &&
                            typeof item.url === "string" && (
                              <MenuItem
                                className="flex items-center gap-3 py-3"
                                as="link"
                                href={item.url}
                                isActive={active}
                              >
                                <item.icon
                                  className="size-5 shrink-0"
                                  aria-hidden="true"
                                />

                                <span>{item.title}</span>
                              </MenuItem>
                            )
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
