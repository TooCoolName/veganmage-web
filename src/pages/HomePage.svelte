<script lang="ts">
    import { ArrowRight, Brain, Zap, Users } from "lucide-svelte";
    import { link } from "svelte-routing";
    import { fly, fade } from "svelte/transition";
    import { onMount } from "svelte";

    let visible = $state(false);

    onMount(() => {
        visible = true;
    });

    const itemTransition = { y: 20, duration: 600, delay: 200 };
</script>

{#if visible}
    <div in:fade={{ duration: 400 }} class="space-y-24 pb-20">
        <!-- Hero Section -->
        <div
            class="hero min-h-[70vh] rounded-3xl bg-base-200/30 overflow-hidden relative border border-base-content/5"
        >
            <div class="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
            <div
                class="hero-content text-center max-w-4xl relative z-10 px-6 py-12"
            >
                <div class="flex flex-col items-center">
                    <div
                        class="mb-8 relative transition-transform hover:scale-105 hover:rotate-5 cursor-default"
                    >
                        <div
                            class="w-32 h-32 md:w-40 md:h-40 p-1 bg-gradient-to-tr from-primary to-secondary rounded-full shadow-2xl"
                        >
                            <div
                                class="w-full h-full bg-base-100 rounded-full flex items-center justify-center overflow-hidden p-1 pt-5"
                            >
                                <img
                                    src="/icon330.png"
                                    alt="Vegan Mage Mascot"
                                    class="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                        <div
                            class="absolute -bottom-2 -right-2 badge badge-primary badge-lg shadow-lg rotate-12"
                        >
                            v1.0
                        </div>
                    </div>

                    <h1
                        in:fly={itemTransition}
                        class="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-sm"
                    >
                        AI Meets Veganism
                    </h1>

                    <p
                        in:fly={{ ...itemTransition, delay: 400 }}
                        class="text-xl md:text-2xl opacity-80 mb-10 max-w-2xl text-balance leading-relaxed"
                    >
                        A powerful fusion of Artificial Intelligence and vegan
                        activism.
                        <span class="font-semibold text-primary block mt-2"
                            >Empowering advocates to help every animal.</span
                        >
                    </p>

                    <div
                        in:fly={{ ...itemTransition, delay: 600 }}
                        class="flex flex-col sm:flex-row gap-4"
                    >
                        <a
                            href="/mages"
                            use:link
                            class="btn btn-primary btn-lg shadow-xl hover:shadow-primary/50 hover:-translate-y-1 transition-all rounded-full px-8"
                        >
                            Meet the Mages <ArrowRight size={20} />
                        </a>
                    </div>
                </div>
            </div>

            <!-- Decorative Elements -->
            <div
                class="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow"
            ></div>
            <div
                class="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow delay-1000"
            ></div>
        </div>

        <!-- Core Concepts Section -->
        <div
            class="flex flex-col md:flex-row gap-12 items-center max-w-6xl mx-auto px-4"
        >
            <div
                in:fly={{ ...itemTransition, delay: 800 }}
                class="flex-1 space-y-6"
            >
                <div class="badge badge-secondary badge-outline mb-2">
                    The Vision
                </div>
                <h2 class="text-4xl font-bold">Empowering Advocates</h2>
                <p class="text-lg opacity-80 leading-relaxed">
                    Vegan Mage is the merge of <span
                        class="text-primary font-semibold"
                        >Artificial Intelligence</span
                    > with vegan activism. We exist to empower vegan advocates via
                    different tools, evolving constantly to enhance human potential
                    and help every animal.
                </p>

                <ul class="space-y-4 pt-4">
                    <li class="flex items-start gap-3">
                        <div
                            class="mt-1 bg-primary/10 p-2 rounded-full text-primary"
                        >
                            <Zap size={20} />
                        </div>
                        <div>
                            <h3 class="font-bold">The Browser Extension</h3>
                            <p class="text-sm opacity-70">
                                Your digital companion that brings advocacy
                                tools directly to your browsing experience.
                            </p>
                        </div>
                    </li>
                    <li class="flex items-start gap-3">
                        <div
                            class="mt-1 bg-secondary/10 p-2 rounded-full text-secondary"
                        >
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 class="font-bold">Circle of Mages</h3>
                            <p class="text-sm opacity-70">
                                Access a diverse circle of specialized AI
                                agents, each designed for specific advocacy
                                scenarios.
                            </p>
                        </div>
                    </li>
                    <li class="flex items-start gap-3">
                        <div
                            class="mt-1 bg-accent/10 p-2 rounded-full text-accent"
                        >
                            <Brain size={20} />
                        </div>
                        <div>
                            <h3 class="font-bold">Constant Evolution</h3>
                            <p class="text-sm opacity-70">
                                Always changing and improving to provide the
                                most effective support for the animals.
                            </p>
                        </div>
                    </li>
                </ul>
            </div>

            <div
                in:fly={{ ...itemTransition, delay: 1000 }}
                class="flex-1 relative"
            >
                <div
                    class="card bg-base-100 shadow-2xl border border-base-content/5 overflow-hidden relative"
                >
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 z-0"
                    ></div>
                    <div
                        class="card-body p-10 relative z-10 flex flex-col items-center text-center space-y-6"
                    >
                        <div
                            class="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1 shadow-xl"
                        >
                            <div
                                class="w-full h-full bg-base-100 rounded-full flex items-center justify-center"
                            >
                                <Brain size={48} class="text-primary" />
                            </div>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold mb-2">
                                The Circle of Mages
                            </h3>
                            <p class="opacity-70">
                                Choose your guide: diverse specialized
                                intelligences ready to assist your advocacy.
                            </p>
                        </div>
                        <div class="flex gap-2 justify-center pt-4">
                            <div class="badge badge-lg badge-primary">
                                Logic
                            </div>
                            <div class="badge badge-lg badge-secondary">
                                Empathy
                            </div>
                            <div class="badge badge-lg badge-accent">Facts</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- CTA Section -->
        <div
            in:fly={{ ...itemTransition, delay: 1200 }}
            class="bg-primary text-primary-content rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
        >
            <div class="relative z-10 max-w-3xl mx-auto space-y-8">
                <h2 class="text-4xl md:text-5xl font-bold">Ready to Evolve?</h2>
                <p class="text-xl md:text-2xl opacity-90">
                    Join the Mage today. The animals need your voice, and we
                    need your mind.
                </p>
                <div class="flex justify-center">
                    <a
                        href="/mages"
                        use:link
                        class="btn btn-secondary btn-lg shadow-lg border-none hover:bg-white hover:text-primary transition-colors text-lg px-10 rounded-full"
                    >
                        Infuse your browser with Mage
                    </a>
                </div>
            </div>

            <!-- Background Pattern -->
            <div class="absolute top-0 left-0 w-full h-full opacity-10">
                <svg
                    width="100%"
                    height="100%"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern
                            id="grid"
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 40 0 L 0 0 0 40"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>
        </div>
    </div>
{/if}
