<script lang="ts">
    import { link } from "svelte-routing";
    import { ArrowLeft, Download, Code, User, Globe } from "lucide-svelte";
    import { getMageById } from "../lib/mages";

    interface Props {
        id: string;
    }
    let { id }: Props = $props();

    let mageRes = $derived(getMageById(id || ""));

    function handleDownload() {
        if (!mageRes) return;
        const jsonContent = JSON.stringify(mageRes.data, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
</script>

{#if !mageRes}
    <div
        class="flex flex-col items-center justify-center min-h-[50vh] space-y-4"
    >
        <h2 class="text-2xl font-bold">Mage not found</h2>
        <a href="/mages" use:link class="btn btn-primary">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Back to Mages
        </a>
    </div>
{:else}
    {@const mage = mageRes.data}
    {@const jsonContent = JSON.stringify(mage, null, 2)}
    <div class="space-y-8 max-w-5xl mx-auto px-4 py-8">
        <!-- Header -->
        <div
            class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
            <div class="space-y-2">
                <div class="flex items-center gap-3">
                    <a
                        href="/mages"
                        use:link
                        class="btn btn-circle btn-ghost btn-sm"
                    >
                        <ArrowLeft class="w-5 h-5" />
                    </a>
                    <h1 class="text-4xl font-bold text-primary">
                        {mage.meta.title || id}
                    </h1>
                </div>
                <div
                    class="flex flex-wrap items-center gap-4 text-sm text-base-content/70 pl-12"
                >
                    {#if mage.meta.author}
                        <span class="flex items-center gap-1.5">
                            <User class="w-4 h-4" />
                            {mage.meta.author}
                        </span>
                    {/if}
                    {#if mage.meta.link}
                        <a
                            href={mage.meta.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex items-center gap-1.5 hover:text-primary transition-colors"
                        >
                            <Globe class="w-4 h-4" />
                            Link
                        </a>
                    {/if}
                </div>
            </div>

            <button onclick={handleDownload} class="btn btn-primary">
                <Download class="w-4 h-4 mr-2" />
                Download Config
            </button>
        </div>

        <!-- Description -->
        {#if mage.meta.description}
            <div
                class="prose max-w-none bg-base-200 p-6 rounded-2xl border border-base-300"
            >
                <h3 class="text-lg font-semibold mb-2">Description</h3>
                <p class="text-base-content/80 leading-relaxed text-lg">
                    {mage.meta.description}
                </p>
            </div>
        {/if}

        <!-- Config Preview -->
        <div class="space-y-4">
            <div class="flex items-center gap-2 text-xl font-bold">
                <Code class="w-6 h-6 text-secondary" />
                <h2>Configuration Preview</h2>
            </div>

            <div
                class="mockup-code bg-base-300 text-base-content overflow-hidden shadow-lg"
            >
                <pre class="max-h-[600px] overflow-y-auto custom-scrollbar p-6">
          <code>{jsonContent}</code>
        </pre>
            </div>
        </div>
    </div>
{/if}
