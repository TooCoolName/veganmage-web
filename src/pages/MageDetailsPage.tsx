
import { useParams, Link } from 'react-router-dom';
import { getMageById } from '../lib/mages';
import { ArrowLeft, Download, Code, User, Globe } from 'lucide-react';

export function MageDetailsPage() {
    const { id } = useParams<{ id: string }>();
    // Use `id` directly, without fallback. If `id` is undefined, `getMageById` will just return undefined.
    const mageRes = getMageById(id || '');

    if (!mageRes) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold">Mage not found</h2>
                <Link to="/mages" className="btn btn-primary">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Mages
                </Link>
            </div>
        );
    }

    const { data: mage } = mageRes;
    const jsonContent = JSON.stringify(mage, null, 2);

    const handleDownload = () => {
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Link to="/mages" className="btn btn-circle btn-ghost btn-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-4xl font-bold text-primary">{mage.meta.title || id}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70 pl-12">
                        {mage.meta.author && (
                            <span className="flex items-center gap-1.5">
                                <User className="w-4 h-4" />
                                {mage.meta.author}
                            </span>
                        )}
                        {mage.meta.link && (
                            <a
                                href={mage.meta.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 hover:text-primary transition-colors"
                            >
                                <Globe className="w-4 h-4" />
                                Link
                            </a>
                        )}
                    </div>
                </div>

                <button onClick={handleDownload} className="btn btn-primary">
                    <Download className="w-4 h-4 mr-2" />
                    Download Config
                </button>
            </div>

            {/* Description */}
            {mage.meta.description && (
                <div className="prose max-w-none bg-base-200 p-6 rounded-2xl border border-base-300">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-base-content/80 leading-relaxed text-lg">
                        {mage.meta.description}
                    </p>
                </div>
            )}

            {/* Config Preview */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-xl font-bold">
                    <Code className="w-6 h-6 text-secondary" />
                    <h2>Configuration Preview</h2>
                </div>

                <div className="mockup-code bg-base-300 text-base-content overflow-hidden shadow-lg">
                    <pre className="max-h-[600px] overflow-y-auto custom-scrollbar p-6">
                        <code>{jsonContent}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}
