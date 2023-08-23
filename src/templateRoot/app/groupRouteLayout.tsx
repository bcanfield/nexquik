import "./globals.css";
import Link from "next/link";
import { Roboto } from "next/font/google";
import Image from "next/image";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={`${roboto.className} dark [--scroll-mt:9.875rem] lg:[--scroll-mt:6.3125rem] js-focus-visible`}
    >
      <body className="antialiased text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        Nested Group route layout
        {/* Start Backdrop Blur */}
        <div className="absolute z-20 top-0 inset-x-0 flex justify-center overflow-hidden pointer-events-none">
          <div className="w-[108rem] flex-none flex justify-end">
            <Image
              src="/backdrop2.png"
              width={500}
              height={500}
              className="w-[90rem] flex-none max-w-none hidden dark:block"
              alt="Picture of the author"
            />
          </div>
        </div>
        {/* End Backdrop Blur */}
        {/* Navbar */}
        <div className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white supports-backdrop-blur:bg-white/95 dark:bg-transparent">
          <div className="max-w-8xl mx-auto">
            <div className="py-4 border-b border-slate-900/10 lg:px-8 lg:border-0 dark:border-slate-300/10 mx-4 lg:mx-0">
              <div className="relative flex items-center">
                <a className="flex items-center justify-between">
                  <span className="box-sizing: border-box; display: inline-block; overflow: hidden; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; position: relative; max-width: 100%;">
                    <Image
                      alt="Nexquik Logo"
                      src="/logo.png"
                      width="35"
                      height="35"
                    ></Image>
                  </span>
                  <span className="self-center ml-3 text-2xl font-semibold whitespace-nowrap dark:text-white">
                    Nexquik
                  </span>
                </a>

                <div className="relative hidden lg:flex items-center ml-auto">
                  <nav className="text-sm leading-6 font-semibold text-slate-700 dark:text-slate-200">
                    <ul className="flex space-x-8">
                      <li>
                        <a
                          className="hover:text-sky-500 dark:hover:text-sky-400"
                          href="https://nextjs.org/docs"
                        >
                          Next.js
                        </a>
                      </li>
                      <li>
                        <a
                          className="hover:text-sky-500 dark:hover:text-sky-400"
                          href="https://tailwindcss.com/docs/installation"
                        >
                          Tailwind CSS
                        </a>
                      </li>
                      <li>
                        <a
                          className="hover:text-sky-500 dark:hover:text-sky-400"
                          href="https://www.prisma.io/docs"
                        >
                          Prisma
                        </a>
                      </li>
                    </ul>
                  </nav>
                  <div className="flex items-center border-l border-slate-200 ml-6 pl-6 dark:border-slate-800">
                    <a
                      href="https://github.com/bcanfield/nexquik/stargazers"
                      className="block text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
                    >
                      <span className="sr-only">Nexquik on GitHub</span>
                      <svg
                        viewBox="0 0 22 20"
                        className="w-5 h-5"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          className="fill-slate-400 dark:fill-slate-500"
                          d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"
                        />{" "}
                      </svg>
                    </a>
                    <a
                      href="https://github.com/bcanfield/nexquik"
                      className="ml-6 block text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
                    >
                      <span className="sr-only">Nexquik on GitHub</span>
                      <svg
                        viewBox="0 0 16 16"
                        className="w-5 h-5"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 h-px -mt-px bg-slate-200 dark:bg-slate-400/20"></div>
        </div>
        {/* End Navbar */}
        {/* Page Content Start*/}
        <div className="w-full px-4 mx-auto max-w-8xl ">
          <div className="lg:flex">
            {/* Side Nav */}

            <aside className="fixed inset-0 z-20 flex-none hidden h-full w-72 lg:static lg:h-auto lg:overflow-y-visible lg:pt-0 lg:w-[17rem] lg:block">
              <div
                id="navWrapper"
                className="overflow-y-auto z-20 h-full bg-white scrolling-touch max-w-2xs lg:h-[calc(100vh-3rem)] lg:block lg:sticky top:24  dark:bg-slate-900 lg:mr-0 "
              >
                <nav
                  id="nav"
                  className="pt-16 px-1 pl-3 lg:pl-0 lg:pt-2 font-normal text-base lg:text-sm pb-10 lg:pb-20 sticky?lg:h-(screen-18)"
                >
                  <ul className="mb-0 list-unstyled">
                    <li className=" dark:border-slate-400/20 mt-8">
                      <h2 className="pl-2 mb-4 lg:mb-1 font-semibold text-sm uppercase text-slate-900 dark:text-slate-200">
                        Models
                      </h2>
                    </li>
                    {/* //@nexquik routeSidebar start */}
                    {/* //@nexquik routeSidebar stop */}
                  </ul>
                </nav>
              </div>
            </aside>
            <div
              id="sidebarBackdrop"
              className="fixed inset-0 z-10 hidden bg-gray-900/50 dark:bg-gray-900/60"
            ></div>
            {/* End Side Nav */}

            <main
              id="content-wrapper"
              className="flex-auto w-full min-w-0 lg:static lg:max-h-full lg:overflow-visible "
            >
              {/* CHILDREN START */}

              <div className="flex w-full ">{children}</div>
              {/* CHILDREN END */}
            </main>

            {/* </div> */}
          </div>
        </div>
        {/* Page Content End*/}
        <footer className="text-sm leading-6 mt-16">
          <div className="pt-10 pb-28 border-t border-slate-200 sm:flex justify-between text-slate-500 dark:border-slate-200/5 px-4">
            <div className="mb-6 sm:mb-0 sm:flex">
              <p>Generated by Nexquik</p>
              <p className="sm:ml-4 sm:pl-4 sm:border-l sm:border-slate-200 dark:sm:border-slate-200/5">
                <a
                  className="hover:text-slate-900 dark:hover:text-slate-400"
                  href="https://apache.org/licenses/LICENSE-2.0"
                >
                  License
                </a>
              </p>
            </div>
            <div className="flex space-x-10 text-slate-400 dark:text-slate-500">
              <a
                href="https://github.com/bcanfield/nexquik"
                className="hover:text-slate-500 dark:hover:text-slate-400"
              >
                <span className="sr-only">GitHub</span>
                <svg width="25" height="24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.846 0c-6.63 0-12 5.506-12 12.303 0 5.445 3.435 10.043 8.205 11.674.6.107.825-.262.825-.585 0-.292-.015-1.261-.015-2.291-3.015.569-3.795-.754-4.035-1.446-.135-.354-.72-1.446-1.23-1.738-.42-.23-1.02-.8-.015-.815.945-.015 1.62.892 1.845 1.261 1.08 1.86 2.805 1.338 3.495 1.015.105-.8.42-1.338.765-1.645-2.67-.308-5.46-1.37-5.46-6.075 0-1.338.465-2.446 1.23-3.307-.12-.308-.54-1.569.12-3.26 0 0 1.005-.323 3.3 1.26.96-.276 1.98-.415 3-.415s2.04.139 3 .416c2.295-1.6 3.3-1.261 3.3-1.261.66 1.691.24 2.952.12 3.26.765.861 1.23 1.953 1.23 3.307 0 4.721-2.805 5.767-5.475 6.075.435.384.81 1.122.81 2.276 0 1.645-.015 2.968-.015 3.383 0 .323.225.707.825.585a12.047 12.047 0 0 0 5.919-4.489 12.537 12.537 0 0 0 2.256-7.184c0-6.798-5.37-12.304-12-12.304Z"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
