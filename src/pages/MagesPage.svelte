<script lang="ts">
    import { Sparkles, Search, User } from "lucide-svelte";
    import { link } from "svelte-routing";
    import { fade, scale } from "svelte/transition";
    import { flip } from "svelte/animate";
    import { getMages } from "../lib/mages";

    let filter = $state("");
    const mages = getMages();

    let filteredMages = $derived(
        mages.filter(
            (mage) =>
                mage.data.meta?.title
                    ?.toLowerCase()
                    .includes(filter.toLowerCase()) ||
                mage.data.meta?.description
                    ?.toLowerCase()
                    .includes(filter.toLowerCase()) ||
                mage.data.meta?.author
                    ?.toLowerCase()
                    .includes(filter.toLowerCase()),
        ),
    );
</script>

<div class="space-y-8 max-w-7xl mx-auto px-4">
    <div
        class="flex flex-col md:flex-row justify-between items-center gap-4 bg-base-200 p-6 rounded-2xl shadow-sm"
    >
        <div>
            <h1 class="text-3xl font-bold flex items-center gap-2">
                <Sparkles class="text-primary w-8 h-8" />
                The Circle of Mages
            </h1>
            <p class="text-base-content/70 mt-1">
                Discover the entities guiding the evolution.
            </p>
        </div>

        <div class="relative w-full md:w-96">
            <input
                type="text"
                placeholder="Search mages..."
                class="input input-bordered w-full pl-10 bg-base-100 focus:input-primary transition-all"
                bind:value={filter}
            />
            <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 w-5 h-5"
            />
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredMages as mage (mage.id)}
            <div
                animate:flip={{ duration: 400 }}
                in:scale={{ duration: 200, start: 0.9 }}
                out:fade={{ duration: 200 }}
                class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 group border border-base-200 hover:border-primary/20 overflow-hidden h-full"
            >
                <div
                    class="h-24 bg-gradient-to-br from-primary/20 to-secondary/20 relative"
                >
                    <div
                        class="absolute -bottom-6 left-6 w-12 h-12 bg-base-100 rounded-full shadow-lg flex items-center justify-center border border-base-200 group-hover:scale-110 transition-transform duration-300"
                    >
                        <Sparkles class="w-6 h-6 text-primary" />
                    </div>
                </div>
                <div class="card-body pt-10">
                    <h2
                        class="card-title text-primary group-hover:text-primary-focus transition-colors"
                    >
                        {mage.data.meta?.title || mage.id}
                    </h2>
                    {#if mage.data.meta?.author}
                        <div
                            class="text-xs text-base-content/60 flex items-center gap-1 mb-2"
                        >
                            <User class="w-3 h-3" />
                            {mage.data.meta.author}
                        </div>
                    {/if}
                    <p
                        class="text-base-content/80 text-sm leading-relaxed line-clamp-3"
                    >
                        {mage.data.meta?.description}
                    </p>
                    <div class="card-actions justify-end mt-auto pt-4">
                        <a
                            href="/mages/{mage.id}"
                            use:link
                            class="btn btn-sm btn-ghost hover:bg-primary/10 hover:text-primary group-hover:translate-x-1 transition-all"
                        >
                            View Details
                        </a>
                    </div>
                </div>
            </div>
        {/each}
    </div>

    {#if filteredMages.length === 0}
        <div class="text-center py-20 opacity-50">
            <p class="text-xl">No mages found matching your search.</p>
        </div>
    {/if}
</div>
