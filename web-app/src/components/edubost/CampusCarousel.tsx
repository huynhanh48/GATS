"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CampusCarousel.module.css";

const asset = (path: string) => `/edubost-reference/img/${path}`;
const slides = [
  ["campus/campus-img01.png", "Workshop Thực Chiến"],
  ["campus/campus-img02.png", "Cộng Đồng Đồng Hành"],
  ["campus/campus-img03.png", "Chứng Nhận EDUGATS"],
] as const;

export function CampusCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const resetTimerRef = useRef<number | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [trackIndex, setTrackIndex] = useState(3);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const loopSlides = useMemo(() => [...slides, ...slides, ...slides], []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const update = () => {
      const width = viewport.clientWidth;
      setViewportWidth(width);
      setVisibleCount(width < 576 ? 1 : width < 1200 ? 2 : 3);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    const interval = window.setInterval(() => setTrackIndex((current) => current + 1), 6000);
    return () => window.clearInterval(interval);
  }, [paused]);

  useEffect(() => () => {
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
  }, []);

  const gap = visibleCount === 1 ? 18 : visibleCount === 2 ? 24 : 30;
  const slideWidth = viewportWidth > 0 ? (viewportWidth - gap * (visibleCount - 1)) / visibleCount : 0;
  const step = slideWidth + gap;
  const translateX = viewportWidth / 2 - (trackIndex * step + slideWidth / 2);
  const activeIndex = ((trackIndex - 3) % slides.length + slides.length) % slides.length;

  const handleTransitionEnd = () => {
    if (trackIndex < 6) return;
    setAnimate(false);
    setTrackIndex(trackIndex - 3);
    resetTimerRef.current = window.setTimeout(() => setAnimate(true), 30);
  };

  const goTo = (index: number) => {
    setAnimate(true);
    setTrackIndex(3 + index);
  };

  return <section className={styles.section} style={{ backgroundImage: `url(${asset("bg/campus-bg.jpg")})` }}>
    <div className={styles.heading}><span className="sub-title">Trải Nghiệm Học Tập</span><h2 className="title">Học Để Làm Được Việc</h2></div>
    <div ref={viewportRef} className={styles.viewport} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className={`${styles.track} ${animate ? styles.animated : ""}`} style={{ gap, transform: `translate3d(${translateX}px,0,0)` }} onTransitionEnd={handleTransitionEnd}>
        {loopSlides.map(([image, title], index) => <div key={`${title}-${index}`} className={styles.slide} style={{ width: slideWidth || undefined }} aria-hidden={index !== trackIndex}>
          <article className={styles.card}>
            <div className={styles.image}><img src={asset(image)} alt={title} /></div>
            <div className={styles.content}><h3>{title}</h3><Link href="/courses" tabIndex={index === trackIndex ? 0 : -1}>Tìm hiểu thêm <i className="far fa-arrow-up-right" /></Link></div>
          </article>
        </div>)}
      </div>
    </div>
    <div className={styles.pagination} role="tablist" aria-label="Chọn trải nghiệm học tập">
      {slides.map(([, title], index) => <button key={title} type="button" className={index === activeIndex ? styles.activeBullet : styles.bullet} aria-label={`Hiển thị ${title}`} aria-selected={index === activeIndex} role="tab" onClick={() => goTo(index)} />)}
    </div>
  </section>;
}
