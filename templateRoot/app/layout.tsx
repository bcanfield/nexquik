import "./globals.css";
import Link from "next/link";
import { Roboto } from "next/font/google";

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
        {/* Navbar */}
        <div className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white supports-backdrop-blur:bg-white/95 dark:bg-slate-900/75">
          <div className="max-w-8xl mx-auto">
            <div className="py-4 border-b border-slate-900/10 lg:px-8 lg:border-0 dark:border-slate-300/10 mx-4 lg:mx-0">
              <div className="relative flex items-center">
                <Link
                  className="text-3xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200"
                  href="/"
                >
                  Nexquik
                </Link>

                <div className="relative hidden lg:flex items-center ml-auto">
                  <nav className="text-sm leading-6 font-semibold text-slate-700 dark:text-slate-200">
                    <ul className="flex space-x-8">
                      <li>
                        <a
                          className="hover:text-sky-500 dark:hover:text-sky-400"
                          href="/docs/installation"
                        >
                          Docs 1
                        </a>
                      </li>
                      <li>
                        <a
                          className="hover:text-sky-500 dark:hover:text-sky-400"
                          href="/docs/installation"
                        >
                          Docs 2
                        </a>
                      </li>
                      <li>
                        <a
                          className="hover:text-sky-500 dark:hover:text-sky-400"
                          href="/docs/installation"
                        >
                          Docs 3
                        </a>
                      </li>
                    </ul>
                  </nav>
                  <div className="flex items-center border-l border-slate-200 ml-6 pl-6 dark:border-slate-800">
                    <button
                      type="button"
                      id="headlessui-listbox-button-:R19kcr6:"
                      aria-haspopup="true"
                      aria-expanded="false"
                      data-headlessui-state=""
                      aria-labelledby="headlessui-listbox-label-:Rpkcr6: headlessui-listbox-button-:R19kcr6:"
                    >
                      <span className="dark:hidden">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-6 h-6"
                        >
                          <path
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            className="stroke-slate-400 dark:stroke-slate-500"
                          ></path>
                          <path
                            d="M12 4v1M17.66 6.344l-.828.828M20.005 12.004h-1M17.66 17.664l-.828-.828M12 20.01V19M6.34 17.664l.835-.836M3.995 12.004h1.01M6 6l.835.836"
                            className="stroke-slate-400 dark:stroke-slate-500"
                          ></path>
                        </svg>
                      </span>
                      <span className="hidden dark:inline">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="w-6 h-6"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M17.715 15.15A6.5 6.5 0 0 1 9 6.035C6.106 6.922 4 9.645 4 12.867c0 3.94 3.153 7.136 7.042 7.136 3.101 0 5.734-2.032 6.673-4.853Z"
                            className="fill-transparent"
                          ></path>
                          <path
                            d="m17.715 15.15.95.316a1 1 0 0 0-1.445-1.185l.495.869ZM9 6.035l.846.534a1 1 0 0 0-1.14-1.49L9 6.035Zm8.221 8.246a5.47 5.47 0 0 1-2.72.718v2a7.47 7.47 0 0 0 3.71-.98l-.99-1.738Zm-2.72.718A5.5 5.5 0 0 1 9 9.5H7a7.5 7.5 0 0 0 7.5 7.5v-2ZM9 9.5c0-1.079.31-2.082.845-2.93L8.153 5.5A7.47 7.47 0 0 0 7 9.5h2Zm-4 3.368C5 10.089 6.815 7.75 9.292 6.99L8.706 5.08C5.397 6.094 3 9.201 3 12.867h2Zm6.042 6.136C7.718 19.003 5 16.268 5 12.867H3c0 4.48 3.588 8.136 8.042 8.136v-2Zm5.725-4.17c-.81 2.433-3.074 4.17-5.725 4.17v2c3.552 0 6.553-2.327 7.622-5.537l-1.897-.632Z"
                            className="fill-slate-400 dark:fill-slate-500"
                          ></path>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M17 3a1 1 0 0 1 1 1 2 2 0 0 0 2 2 1 1 0 1 1 0 2 2 2 0 0 0-2 2 1 1 0 1 1-2 0 2 2 0 0 0-2-2 1 1 0 1 1 0-2 2 2 0 0 0 2-2 1 1 0 0 1 1-1Z"
                            className="fill-slate-400 dark:fill-slate-500"
                          ></path>
                        </svg>
                      </span>
                    </button>

                    <a
                      href="https://github.com/tailwindlabs/tailwindcss"
                      className="ml-6 block text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
                    >
                      <span className="sr-only">Tailwind CSS on GitHub</span>
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

        <div className="w-full px-4 mx-auto max-w-7xl border-solid border-2 border-red-500">
          <div className="lg:flex">
            {/* Side Nav */}

            <aside class="fixed inset-0 z-20 flex-none hidden h-full w-72 lg:static lg:h-auto lg:overflow-y-visible lg:pt-0 lg:w-48 lg:block">
              <div
                id="navWrapper"
                className="overflow-y-auto z-20 h-full bg-white scrolling-touch max-w-2xs lg:h-[calc(100vh-3rem)] lg:block lg:sticky top:24  dark:bg-gray-900 lg:mr-0 border-solid border-2 border-green-500"
              >
                <nav
                  id="nav"
                  className="pt-16 px-1 pl-3 lg:pl-0 lg:pt-2 font-normal text-base lg:text-sm pb-10 lg:pb-20 sticky?lg:h-(screen-18)"
                >
                  <ul className="mb-0 list-unstyled">
                    <li className="border-b border-slate-200 dark:border-slate-400/20 mt-2">
                      <h2 className="pl-2 mb-8 lg:mb-1 font-semibold text-lg text-slate-900 dark:text-slate-200">
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
              className="flex-auto w-full min-w-0 lg:static lg:max-h-full lg:overflow-visible border-solid border-2 border-green-500"
            >
              {/* CHILDREN START */}

              {children}
              {/* CHILDREN END */}
            </main>

            {/* </div> */}
          </div>
        </div>
        {/* Page Content End*/}
        <footer className="text-sm leading-6 mt-16">
          <div className="pt-10 pb-28 border-t border-slate-200 sm:flex justify-between text-slate-500 dark:border-slate-200/5 px-4">
            <div className="mb-6 sm:mb-0 sm:flex">
              <p>Copyright © 2023 Tailwind Labs Inc.</p>
              <p className="sm:ml-4 sm:pl-4 sm:border-l sm:border-slate-200 dark:sm:border-slate-200/5">
                <a
                  className="hover:text-slate-900 dark:hover:text-slate-400"
                  href="/brand"
                >
                  Trademark Policy
                </a>
              </p>
            </div>
            <div className="flex space-x-10 text-slate-400 dark:text-slate-500">
              <a
                href="https://github.com/tailwindlabs/tailwindcss"
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
              <a
                href="/discord"
                className="hover:text-slate-500 dark:hover:text-slate-400"
              >
                <span className="sr-only">Discord</span>
                <svg width="23" height="24" fill="currentColor">
                  <path d="M9.555 9.23c-.74 0-1.324.624-1.324 1.385S8.827 12 9.555 12c.739 0 1.323-.624 1.323-1.385.013-.761-.584-1.385-1.323-1.385Zm4.737 0c-.74 0-1.324.624-1.324 1.385S13.564 12 14.292 12c.74 0 1.324-.624 1.324-1.385s-.584-1.385-1.324-1.385Z"></path>
                  <path d="M20.404 0H3.442c-.342 0-.68.065-.995.19a2.614 2.614 0 0 0-.843.536 2.46 2.46 0 0 0-.562.801c-.13.3-.197.62-.196.944v16.225c0 .324.066.645.196.944.13.3.321.572.562.801.241.23.527.412.843.537.315.124.653.189.995.19h14.354l-.67-2.22 1.62 1.428 1.532 1.344L23 24V2.472c0-.324-.066-.644-.196-.944a2.46 2.46 0 0 0-.562-.8A2.614 2.614 0 0 0 21.4.19a2.726 2.726 0 0 0-.995-.19V0Zm-4.886 15.672s-.456-.516-.836-.972c1.659-.444 2.292-1.428 2.292-1.428a7.38 7.38 0 0 1-1.456.707 8.67 8.67 0 0 1-1.836.517 9.347 9.347 0 0 1-3.279-.012 11.074 11.074 0 0 1-1.86-.516 7.621 7.621 0 0 1-.924-.409c-.039-.023-.076-.035-.113-.06-.027-.011-.04-.023-.052-.035-.228-.12-.354-.204-.354-.204s.608.96 2.215 1.416c-.38.456-.848.996-.848.996-2.797-.084-3.86-1.824-3.86-1.824 0-3.864 1.822-6.996 1.822-6.996 1.823-1.296 3.557-1.26 3.557-1.26l.127.145c-2.278.623-3.33 1.57-3.33 1.57s.279-.143.747-.347c1.355-.564 2.43-.72 2.873-.756.077-.012.14-.024.216-.024a10.804 10.804 0 0 1 6.368 1.129s-1.001-.9-3.153-1.526l.178-.19s1.735-.037 3.557 1.259c0 0 1.823 3.133 1.823 6.996 0 0-1.076 1.74-3.874 1.824Z"></path>
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
