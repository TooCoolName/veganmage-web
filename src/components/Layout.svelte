<script lang="ts">
    import type { Snippet } from "svelte";
    import { link } from "svelte-routing";
    import { onMount } from "svelte";
    import { Moon, Sun, Menu, Heart } from "lucide-svelte";
    // Note: AnimatePresence-like behavior in Svelte is usually handled with transitions
    // For now, we'll keep it simple or use Svelte transitions.

    let theme = $state(
        typeof localStorage !== "undefined"
            ? localStorage.getItem("theme") || "custom-light"
            : "custom-light",
    );
    let isMenuOpen = $state(false);
    let currentPath = $state(
        typeof window !== "undefined" ? window.location.pathname : "/",
    );

    $effect(() => {
        if (typeof document !== "undefined") {
            document.documentElement.setAttribute("data-theme", theme);
            localStorage.setItem("theme", theme);
        }
    });

    function toggleTheme() {
        theme = theme === "custom-light" ? "custom-dark" : "custom-light";
    }

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }

    const navLinks = [
        { path: "/", label: "Home" },
        { path: "/mages", label: "Circle of Mages" },
    ];

    let { children }: { children: Snippet } = $props();

    onMount(() => {
        const handlePopState = () => {
            currentPath = window.location.pathname;
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    });
</script>

<div
    class="min-h-screen flex flex-col bg-base-200/50 font-sans selection:bg-primary selection:text-primary-content transition-colors duration-300"
>
    <!-- Floating Navbar -->
    <div class="sticky top-0 z-50 w-full mb-4">
        <div
            class="navbar bg-base-100/80 backdrop-blur-xl shadow-lg border-b border-base-content/5 w-full transition-all duration-300 px-4"
        >
            <div class="navbar-start">
                <a
                    href="/"
                    use:link
                    class="btn btn-ghost text-xl font-bold flex items-center gap-2 hover:bg-transparent"
                >
                    <div class="avatar placeholder">
                        <div
                            class="text-neutral-content rounded-full w-10 shadow-lg ring ring-primary ring-offset-base-100 ring-offset-2 p-1.5 bg-base-100"
                        >
                            <img
                                src="/icon128.png"
                                alt="Logo"
                                class="opacity-90 object-contain"
                            />
                        </div>
                    </div>
                    <span
                        class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-extrabold tracking-tight hidden sm:inline-block"
                    >
                        Vegan Mage
                    </span>
                </a>
            </div>

            <div class="navbar-center hidden lg:flex">
                <ul
                    class="menu menu-horizontal px-1 gap-2 bg-base-200/50 rounded-full p-1.5 backdrop-blur-sm border border-base-content/5"
                >
                    {#each navLinks as navItem}
                        <li>
                            <a
                                href={navItem.path}
                                use:link
                                class="rounded-full px-6 font-medium transition-all duration-200 {currentPath ===
                                navItem.path
                                    ? 'bg-primary text-primary-content shadow-md'
                                    : 'hover:bg-base-300 hover:text-primary'}"
                            >
                                {navItem.label}
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>

            <div class="navbar-end gap-2">
                <button
                    onclick={toggleTheme}
                    class="btn btn-circle btn-ghost hover:scale-110 active:scale-95 transition-transform"
                    aria-label="Toggle Theme"
                >
                    <div class="swap swap-rotate">
                        <input
                            type="checkbox"
                            checked={theme === "custom-dark"}
                            readonly
                        />
                        <Sun
                            class="swap-on fill-current w-6 h-6 text-warning"
                        />
                        <Moon
                            class="swap-off fill-current w-6 h-6 text-primary"
                        />
                    </div>
                </button>
                <div class="lg:hidden">
                    <button
                        tabindex="0"
                        class="btn btn-ghost btn-circle"
                        onclick={toggleMenu}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile Menu Dropdown -->
        {#if isMenuOpen}
            <div class="lg:hidden absolute top-full right-4 z-40 mt-2">
                <ul
                    class="menu bg-base-100 rounded-box shadow-xl border border-base-content/5 p-2 gap-2"
                >
                    {#each navLinks as navItem}
                        <li>
                            <a
                                href={navItem.path}
                                use:link
                                class={currentPath === navItem.path
                                    ? "active font-bold"
                                    : ""}
                                onclick={() => (isMenuOpen = false)}
                            >
                                {navItem.label}
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
    </div>

    <main
        class="flex-grow container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-7xl"
    >
        {@render children()}
    </main>

    <footer
        class="relative mt-auto bg-base-100/80 backdrop-blur-md border-t border-base-content/5 pt-12 pb-8"
    >
        <div class="container mx-auto px-4">
            <div class="flex flex-col items-center text-center gap-8">
                <!-- Brand Section -->
                <div class="flex flex-col items-center gap-4">
                    <a href="/" use:link class="group relative">
                        <div
                            class="w-16 h-16 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-full flex items-center justify-center transform transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300 border border-base-content/5 p-3"
                        >
                            <img
                                src="/icon128.png"
                                alt="Vegan Mage Logo"
                                class="w-full h-full opacity-90 object-contain"
                            />
                        </div>
                        <div
                            class="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                        ></div>
                    </a>
                    <div>
                        <h3
                            class="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                        >
                            Vegan Mage
                        </h3>
                        <p
                            class="text-sm text-base-content/60 mt-2 max-w-xs mx-auto leading-relaxed"
                        >
                            Using technology to alleviate suffering and
                            cultivate compassion.
                        </p>
                    </div>
                </div>

                <!-- Navigation Links -->
                <nav
                    class="flex flex-wrap justify-center gap-8 text-sm font-medium"
                >
                    <a
                        href="/"
                        use:link
                        class="hover:text-primary transition-colors relative group"
                    >
                        Home
                        <span
                            class="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full opacity-50"
                        ></span>
                    </a>
                    <a
                        href="/mages"
                        use:link
                        class="hover:text-primary transition-colors relative group"
                    >
                        The Circle
                        <span
                            class="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full opacity-50"
                        ></span>
                    </a>
                </nav>

                <!-- Divider -->
                <div
                    class="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent"
                ></div>

                <!-- Copyright -->
                <div
                    class="flex flex-col items-center gap-2 text-xs text-base-content/40 font-medium"
                >
                    <p>
                        &copy; {new Date().getFullYear()} Vegan Mage. All rights
                        reserved.
                    </p>
                    <p class="flex items-center gap-1.5 mt-1">
                        Made with <Heart
                            class="w-3.5 h-3.5 text-error fill-current animate-pulse"
                        /> for all beings
                    </p>
                </div>
            </div>
        </div>
    </footer>
</div>
