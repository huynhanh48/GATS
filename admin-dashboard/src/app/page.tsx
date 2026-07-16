"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frameCount = 300;
    const currentFrame = (index: number) =>
      `/scroll-animations/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

    const images: HTMLImageElement[] = [];

    // Preload frames
    for (let i = 1; i <= frameCount; i++) {
      const img = new window.Image();
      img.src = currentFrame(i);
      images.push(img);
    }

    // Draw first frame immediately when it loads
    images[0].onload = () => {
      ctx.drawImage(images[0], 0, 0, 3328, 2488);
    };

    const handleScroll = () => {
      if (!sectionRef.current) return;

      const { top, height } = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const scrollableDistance = height - windowHeight;
      let progress = -top / scrollableDistance;

      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      const frameIndex = Math.min(
        Math.floor(progress * frameCount),
        frameCount - 1
      );

      if (images[frameIndex] && images[frameIndex].complete) {
        requestAnimationFrame(() => {
          ctx.drawImage(images[frameIndex], 0, 0, 3328, 2488);
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Trigger initially
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-[center_20%] pointer-events-none z-0 opacity-60"
        >
          <source src="/videos/video-pingpong.mp4" type="video/mp4" />
        </video>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-center md:justify-between px-8 py-6 text-sm text-gray-400">
          <div className="hidden md:flex gap-8">
            <Link href="#" className="hover:text-white transition-colors">Home</Link>
            <Link href="#" className="hover:text-white transition-colors">Product</Link>
            <Link href="#" className="hover:text-white transition-colors">Solution</Link>
          </div>
          <div className="font-bold tracking-widest text-white uppercase">
            GATS ACADEMY
          </div>
          <div className="hidden md:flex gap-8">
            <Link href="#" className="hover:text-white transition-colors">Resource</Link>
            <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-white transition-colors">About</Link>
          </div>
        </nav>

        {/* Next Project Video Transition Button */}
        <button className="absolute top-24 right-8 md:right-12 z-20 flex items-center gap-4 text-white/80 hover:text-white transition-colors font-mono text-xs md:text-sm tracking-[0.2em] group cursor-pointer">
          <span>1/01</span>
          <div className="w-12 md:w-20 h-[1px] bg-white/30 relative overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-1/3 bg-white group-hover:w-full transition-all duration-500"></div>
          </div>
          <span>NEXT PROJECT</span>
        </button>

        {/* Main Content Center */}
        <main className="relative z-10 flex-1 flex flex-col justify-center items-center overflow-hidden">
          {/* <h1 
          className="hidden md:block text-[11vw] leading-none font-bold text-gray-200 tracking-[-0.04em] select-none whitespace-nowrap"
          style={{ transform: "scaleY(1.5)" }}
        >
          GATS ACADEMY
        </h1> */}
        </main>

        {/* Bottom Section */}
        <footer className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 px-8 pb-12 items-end">

          {/* Bottom Left */}
          <div className="flex flex-col gap-10">
            <p className="text-gray-400 max-w-sm text-base leading-relaxed">
              GATS Academy delivers next-generation learning solutions that detect skill gaps, automate operations, and empower students with intelligent education.
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/auth/sign-in"
                className="rounded-full border border-gray-600 px-6 py-2 hover:bg-white hover:text-black transition-all duration-300 font-medium uppercase text-sm tracking-wide"
              >
                Get Started
              </Link>
              <Link
                href="/admin"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 hover:bg-white hover:text-black transition-all duration-300"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <div className="flex -space-x-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-black bg-gray-300"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-400">
                Trusted by 10,000+<br />students worldwide
              </p>
            </div>
          </div>

          {/* Bottom Right */}
          <div className="hidden md:flex justify-end text-right">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] tracking-tight">
              Intelligence<br />
              That Powers<br />
              Your Future
            </h2>
          </div>
        </footer>
      </section>

      {/* Second Section */}
      <section ref={sectionRef} className="relative w-full h-[400vh] bg-black">
        <div className="sticky top-0 w-full h-screen overflow-y-auto md:overflow-hidden flex flex-col md:flex-row items-center py-6 lg:py-12">

          {/* Left Robot Image Sequence */}
          <div className="relative md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 w-full md:w-[50%] lg:w-[45%] 2xl:w-[50%] aspect-[4/3] pointer-events-none opacity-100 z-0 shrink-0 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={3328}
              height={2488}
              className="w-full h-full object-contain object-center md:object-right"
            />
          </div>

          {/* Vertical Text (Hidden on smaller screens) */}
          <div className="absolute left-[48%] top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 z-20">
            <div className="w-[1px] h-24 bg-[#f97316]"></div>
            <div className="text-[#f97316] font-bold text-sm tracking-[0.2em] [writing-mode:vertical-rl] rotate-180">
              THE FUTURE STARTS NOW
            </div>
            <div className="w-[1px] h-24 bg-[#f97316]"></div>
          </div>

          {/* Content Container - Constrained to Right Side */}
          <div className="w-full max-w-[90rem] mx-auto px-6 md:px-8 lg:px-12 relative z-10 flex justify-center md:justify-end min-w-0 mt-4 md:mt-0">
            <div className="w-full md:w-[65%] lg:w-[50%] xl:w-[45%] flex flex-col gap-6 xl:gap-8 min-w-0">

              {/* Top Right Header */}
              <div className="w-full hidden md:block">
                <h2 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-[4.5rem] font-bold text-right leading-[1.1] tracking-tight break-words">
                  Revolutionizing the <br />
                  <span className="text-[#f97316]">Future of Robotics</span> <br />
                  with Artificial <br />
                  Intelligence
                </h2>
              </div>

              {/* Middle Cards */}
              <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8 w-full mt-4">

                {/* Left Card */}
                <div className="flex flex-col border border-[#f97316]/50 rounded-[2rem] p-6 relative overflow-hidden bg-gradient-to-b from-black to-[#f97316]/10 h-[16rem] lg:h-[18rem] 2xl:h-[22rem]">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#f97316] text-[10px] font-bold tracking-widest opacity-80 [writing-mode:vertical-rl] rotate-180">
                    REVOLUTIONARY
                  </div>
                  <div className="flex-1"></div> {/* Placeholder for Helmet Image */}
                  <div className="mt-auto relative z-10">
                    <p className="text-sm font-medium text-gray-200 mb-4 pr-6 leading-relaxed">
                      The Design of an AI-Powered<br />Revolutionary Helmet
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">July 16, 2024</span>
                      <button className="bg-[#f97316] text-black text-xs font-bold px-5 py-2 rounded-full hover:bg-orange-600 transition-colors">
                        Read More
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Card */}
                <div className="flex flex-col items-center border border-[#f97316]/50 rounded-[2rem] p-6 relative overflow-hidden bg-gradient-to-b from-black to-[#f97316]/10 h-[16rem] lg:h-[18rem] 2xl:h-[22rem]">
                  <div className="flex-1 w-full rounded-2xl bg-gray-900/30 mb-4"></div> {/* Placeholder for Robot Head Image */}
                  <div className="flex flex-col items-center gap-2 mt-auto">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#f97316]"></div>
                      <div className="w-1.5 h-1.5 rounded-full border border-gray-400"></div>
                      <div className="w-1.5 h-1.5 rounded-full border border-gray-400"></div>
                    </div>
                    <span className="font-bold text-xl tracking-wide text-white">
                      Titan<span className="text-[#f97316]">X</span><span className="text-xs text-gray-400 ml-0.5 align-top">680</span>
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom Text & Explore Now */}
              <div className="flex flex-col gap-4 xl:gap-6 items-end text-right ml-auto max-w-[28rem] mt-2 xl:mt-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  Empowers businesses to integrate AI-driven robots, enhancing automation, precision, and efficiency across industries
                </p>
                <button className="flex items-center gap-3 bg-[#f97316] text-black text-sm font-bold pl-1.5 pr-6 py-1.5 rounded-full hover:bg-orange-600 transition-colors">
                  <span className="flex items-center justify-center bg-[#ffedd5] rounded-full w-8 h-8">
                    <ArrowUpRight className="h-4 w-4 text-black" />
                  </span>
                  Explore Now
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. About Us Section */}
      <section className="relative w-full bg-black px-8 py-24 flex flex-col items-center">
        <div className="max-w-6xl w-full flex flex-col gap-16">
          <div className="text-center flex flex-col gap-4">
            <span className="text-gray-400 text-sm tracking-widest uppercase">About Us</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-200">
              Driven by Intelligence,<br />Designed for Impact
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
            <div className="flex flex-col gap-4 pr-0 md:pr-12">
              <h3 className="text-2xl font-bold text-white">Smart Solutions</h3>
              <p className="text-gray-400 text-sm leading-relaxed text-justify">
                At AI.Now, we believe in the power of artificial intelligence to unravel complex solutions, automate workflows, and drive meaningful growth. Our mission is to empower organizations of all sizes to harness the potential of AI, resulting in smarter, faster, and more efficient operations.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-12">
              <div className="flex flex-col gap-2 items-center text-center">
                <h4 className="text-lg font-bold text-white">Future</h4>
                <p className="text-gray-400 text-xs leading-relaxed">Built for the future to be tomorrow</p>
              </div>
              <div className="flex flex-col gap-2 items-center text-center">
                <h4 className="text-lg font-bold text-white">Strategy</h4>
                <p className="text-gray-400 text-xs leading-relaxed">In-driven strategies that fuel innovation</p>
              </div>
              <div className="flex flex-col gap-2 col-span-2 items-center text-center">
                <h4 className="text-lg font-bold text-white">Workflow</h4>
                <p className="text-gray-400 text-xs leading-relaxed">Absolutely able to boost<br />maximum output</p>
              </div>
              <div className="flex flex-col gap-2 items-center text-center">
                <h4 className="text-lg font-bold text-white">Intelligence</h4>
                <p className="text-gray-400 text-xs leading-relaxed">Smarter operations<br />Sharper Moves</p>
              </div>
              <div className="flex flex-col gap-2 items-center text-center">
                <h4 className="text-lg font-bold text-white">Human AI</h4>
                <p className="text-gray-400 text-xs leading-relaxed">AI means more time<br />for better output</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Services Section */}
      <section className="relative w-full bg-black px-8 py-24 flex flex-col items-center overflow-hidden">
        {/* Background Orange Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/20 blur-[120px] pointer-events-none rounded-full"></div>

        <div className="relative max-w-6xl w-full flex flex-col gap-16 z-10">
          <div className="text-center flex flex-col items-center gap-6">
            <span className="border border-orange-900/50 bg-[#3a1a08]/50 text-gray-300 text-sm px-6 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
              Services
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-orange-500 max-w-2xl leading-tight">
              Empower Your Business<br />with Our AI Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {/* Card 1 */}
            <div className="relative h-[480px] rounded-[2rem] overflow-hidden border border-gray-700 hover:border-orange-500/50 transition-colors group">
              <Image
                src="/images/langdingpage/empower-1.png"
                alt="AI Express Processes"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

              <div className="absolute bottom-0 w-full p-8 flex flex-col gap-3">
                <h3 className="text-xl font-bold text-white">AI Express Processes</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Automate billing, customer service, or orders in 30 days, fast, measurable, scalable.
                </p>
                <div className="self-end mt-2">
                  <button className="flex items-center gap-2 bg-[#111]/80 hover:bg-[#222] text-gray-300 px-4 py-2 rounded-full text-xs font-medium border border-gray-700 transition-colors backdrop-blur-md">
                    See Details
                    <span className="flex items-center justify-center bg-gray-800 rounded-full w-5 h-5">
                      <ChevronRight className="w-3 h-3 text-white" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative h-[480px] rounded-[2rem] overflow-hidden border border-gray-700 hover:border-orange-500/50 transition-colors group">
              <Image
                src="/images/langdingpage/empower-2.png"
                alt="Predictive PMO with AI"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

              <div className="absolute bottom-0 w-full p-8 flex flex-col gap-3">
                <h3 className="text-xl font-bold text-white">Predictive PMO with AI</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Anticipate risks, control budgets, and gain real-time visibility without bureaucracy.
                </p>
                <div className="self-end mt-2">
                  <button className="flex items-center gap-2 bg-[#111]/80 hover:bg-[#222] text-gray-300 px-4 py-2 rounded-full text-xs font-medium border border-gray-700 transition-colors backdrop-blur-md">
                    See Details
                    <span className="flex items-center justify-center bg-gray-800 rounded-full w-5 h-5">
                      <ChevronRight className="w-3 h-3 text-white" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative h-[480px] rounded-[2rem] overflow-hidden border border-gray-700 hover:border-orange-500/50 transition-colors group">
              <Image
                src="/images/langdingpage/empower-3.png"
                alt="Specialized AI Agent"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

              <div className="absolute bottom-0 w-full p-8 flex flex-col gap-3">
                <h3 className="text-xl font-bold text-white">Specialized AI Agent</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  24/7 virtual assistant trained on your knowledge base, support customers, employees instantly.
                </p>
                <div className="self-end mt-2">
                  <button className="flex items-center gap-2 bg-[#111]/80 hover:bg-[#222] text-gray-300 px-4 py-2 rounded-full text-xs font-medium border border-gray-700 transition-colors backdrop-blur-md">
                    See Details
                    <span className="flex items-center justify-center bg-gray-800 rounded-full w-5 h-5">
                      <ChevronRight className="w-3 h-3 text-white" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Client Testimonials Section */}
      <section className="relative w-full bg-black px-8 py-24 flex flex-col items-center">
        <div className="max-w-6xl w-full flex flex-col gap-16 items-center">
          <div className="text-center flex flex-col gap-4">
            <span className="text-gray-400 text-sm tracking-widest uppercase">Client Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-200">
              What our Clients Says
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full mt-8">
            {[
              { name: "Michael T. Carry", role: "CEO, Tech Corp", text: "AI.Now helped us automate over 50% of our manual tasks. Their insights helped us grow fast and efficiently." },
              { name: "Calvin Nain", role: "Accountant", text: "Automation is here, over 30% of our manual tasks are now fully automated, ensuring both speed and accuracy." },
              { name: "Josh Henry", role: "Developer", text: "We've automated more than 50% of our manual code with active AI, and the results speak for themselves." }
            ].map((t, i) => (
              <div key={i} className="flex flex-col gap-4 relative text-center items-center">
                <span className="text-6xl text-gray-800 font-serif absolute -top-8 left-4">"</span>
                <div className="flex flex-col z-10 items-center">
                  <h4 className="font-bold text-white text-lg">{t.name}</h4>
                  <span className="text-xs text-gray-500">{t.role}</span>
                </div>
                <p className="text-gray-400 text-sm z-10 mt-4 leading-relaxed max-w-[200px]">{t.text}</p>
                <span className="text-6xl text-gray-800 font-serif absolute -bottom-10 right-4 rotate-180">"</span>
              </div>
            ))}
          </div>

          <button className="flex items-center gap-2 bg-[#222] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-gray-700 transition-colors mt-8">
            View More
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 6. Contact Us Section */}
      <section className="relative w-full bg-black px-8 py-24 flex flex-col items-center">
        <div className="max-w-2xl w-full flex flex-col gap-12">
          <div className="text-center flex flex-col gap-4">
            <span className="text-gray-400 text-sm tracking-widest uppercase">Contact Us</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-200">
              Tell Us Your Goals
            </h2>
          </div>

          <form className="flex flex-col gap-5 w-full items-center mt-4">
            <input type="text" placeholder="Name" className="w-full bg-transparent border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gray-500 placeholder-gray-600" />
            <input type="email" placeholder="Your email" className="w-full bg-transparent border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gray-500 placeholder-gray-600" />
            <input type="tel" placeholder="Mobile number" className="w-full bg-transparent border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gray-500 placeholder-gray-600" />
            <textarea placeholder="Additional Message" rows={5} className="w-full bg-transparent border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gray-500 resize-none placeholder-gray-600"></textarea>

            <button type="button" className="flex items-center gap-2 bg-[#222] text-white text-sm font-medium px-8 py-2.5 rounded-full hover:bg-gray-700 transition-colors mt-4">
              Submit
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* 7. Newsletter & Footer */}
      <footer className="relative w-full bg-black px-8 pt-24 pb-12 flex flex-col items-center">
        <div className="max-w-6xl w-full flex flex-col gap-24">

          <div className="flex flex-col items-center gap-6 text-center">
            <h3 className="text-xl font-bold text-white tracking-widest uppercase">Newsletter</h3>
            <p className="text-gray-400 text-sm">Subscribe to our newsletter for the latest updates and offers.</p>
            <div className="flex w-full max-w-sm mt-2">
              <input type="email" placeholder="Your Email" className="flex-1 bg-[#222] border-none rounded-full px-6 py-3.5 text-sm text-white focus:outline-none placeholder-gray-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 w-full">
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-bold text-white tracking-tighter">AI.Now</h2>
              <div className="flex gap-4 mt-2">
                {/* Social icons placeholders */}
                <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-xs text-white">f</div>
                <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-xs text-white">in</div>
                <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-xs text-white">x</div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-2">Quick Link</h4>
              <Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Home</Link>
              <Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Portfolio</Link>
              <Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Service</Link>
              <Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Blogs</Link>
              <Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Contact Us</Link>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-2">Contact Us</h4>
              <p className="text-gray-500 text-sm">100 000 089 00</p>
              <p className="text-gray-500 text-sm">ainow@gmail.com</p>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-2">Location</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                41 neq Old, 22 Abroation Ave. San,<br />Francisco, CA
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-900 text-xs text-gray-500">
            <p>© 2024 AI.Now All rights reserved</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
