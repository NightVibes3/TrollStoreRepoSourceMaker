import React, { useState, useEffect } from 'react';
import { Repo, Deployment, processRepoForExport } from '../types';
import { Cloud, Check, Copy, AlertCircle, Loader2, Server, Github, Globe, Lock, X, Filter, Layers, History, ShieldAlert } from 'lucide-react';

interface PublishManagerProps {
    repo: Repo;
    onClose: () => void;
}

export const PublishManager: React.FC<PublishManagerProps> = ({ repo, onClose }) => {
    const [token, setToken] = useState('');
    const [deployType, setDeployType] = useState<'public' | 'secret'>('public');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<Deployment[]>([]);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    // Export Config State (Matching App.tsx)
    const [exportConfig, setExportConfig] = useState({
        deduplicate: true, 
        filterIncompatible: true 
    });

    useEffect(() => {
        const savedToken = localStorage.getItem('gh_token');
        if (savedToken) setToken(savedToken);

        const savedHistory = localStorage.getItem('deploy_history');
        if (savedHistory) setHistory(JSON.parse(savedHistory));
    }, []);

    const handleDeploy = async () => {
        if (!token) {
            setError("GitHub Personal Access Token is required.");
            return;
        }

        setLoading(true);
        setError(null);
        localStorage.setItem('gh_token', token);

        // Process the repo based on current config (filters out dupes/incompatible)
        const finalRepo = processRepoForExport(repo, exportConfig);

        try {
            const response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: `TrollApps Repo: ${finalRepo.name} (Generated via Repo Gen)`,
                    public: deployType === 'public',
                    files: {
                        'repo.json': {
                            content: JSON.stringify(finalRepo, null, 4)
                        }
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const rawUrl = data.files['repo.json'].raw_url;

            const newDeployment: Deployment = {
                id: data.id,
                url: rawUrl,
                createdAt: new Date().toISOString(),
                type: deployType,
                name: finalRepo.name
            };

            const newHistory = [newDeployment, ...history];
            setHistory(newHistory);
            localStorage.setItem('deploy_history', JSON.stringify(newHistory));

        } catch (err: any) {
            setError(err.message || "Failed to deploy.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <div className="flex items-center gap-2 text-white">
                        <Cloud className="text-blue-500" />
                        <h2 className="font-bold text-lg">Cloud Hosting</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    
                    <div className="space-y-4">
                        <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-lg">
                            <p className="text-sm text-blue-200 leading-relaxed">
                                Host your repo JSON directly on GitHub Gists. This creates a stable URL ("Server") that you can add to SideStore, AltStore, or TrollStore.
                            </p>
                        </div>

                        {/* Export Config Section - ADDED HERE */}
                        <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                             <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                                    <Filter size={12} /> Export Version
                                </h3>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <button onClick={() => setExportConfig(c => ({ ...c, deduplicate: true }))} className={`flex-1 py-1.5 px-2 rounded text-xs font-medium border ${exportConfig.deduplicate ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50' : 'bg-slate-900 text-slate-500 border-transparent'}`}>
                                        <div className="flex items-center justify-center gap-1.5"><Layers size={12} /> Latest Only</div>
                                    </button>
                                    <button onClick={() => setExportConfig(c => ({ ...c, deduplicate: false }))} className={`flex-1 py-1.5 px-2 rounded text-xs font-medium border ${!exportConfig.deduplicate ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50' : 'bg-slate-900 text-slate-500 border-transparent'}`}>
                                        <div className="flex items-center justify-center gap-1.5"><History size={12} /> Archive All</div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800" onClick={() => setExportConfig(c => ({ ...c, filterIncompatible: !c.filterIncompatible }))}>
                                    <div className="cursor-pointer">
                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><ShieldAlert size={12} /> Filter Jailbreak Apps</div>
                                    </div>
                                    <div className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${exportConfig.filterIncompatible ? 'bg-green-600' : 'bg-slate-700'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${exportConfig.filterIncompatible ? 'left-4.5' : 'left-0.5'}`} style={{ left: exportConfig.filterIncompatible ? '18px' : '2px' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Token Input */}
                        <div className="space-y-2 pt-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                GitHub Personal Access Token (Classic)
                            </label>
                            <div className="relative">
                                <Github className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                <input 
                                    type="password" 
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-md py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <p className="text-[10px] text-slate-500">
                                Requires 'gist' permission. <a href="https://github.com/settings/tokens/new?scopes=gist&description=TrollAppsRepoGen" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Generate Token Here</a>
                            </p>
                        </div>

                        {/* Server Options */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                Server Type (Duration)
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setDeployType('public')}
                                    className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${deployType === 'public' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    <Globe size={20} />
                                    <span className="text-sm font-medium">Public (Years)</span>
                                    <span className="text-[10px] opacity-70">Visible to everyone</span>
                                </button>
                                <button
                                    onClick={() => setDeployType('secret')}
                                    className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${deployType === 'secret' ? 'bg-amber-600/20 border-amber-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    <Lock size={20} />
                                    <span className="text-sm font-medium">Secret (Temp)</span>
                                    <span className="text-[10px] opacity-70">Hidden from search</span>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-900/30 border border-red-900/50 rounded text-xs text-red-200 flex items-start gap-2">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleDeploy}
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Server size={18} />}
                            {loading ? 'Deploying Server...' : 'Deploy Server'}
                        </button>
                    </div>

                    {/* History */}
                    {history.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-slate-800">
                            <h3 className="text-xs font-bold text-slate-400 uppercase">Active Deployments</h3>
                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                                {history.map((dep) => (
                                    <div key={dep.id} className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between group">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${dep.type === 'public' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                                <p className="text-sm font-medium text-slate-300 truncate">{dep.name}</p>
                                            </div>
                                            <p className="text-[10px] text-slate-600 font-mono truncate max-w-[200px]">{dep.url}</p>
                                        </div>
                                        <button 
                                            onClick={() => copyToClipboard(dep.url)}
                                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                                            title="Copy Link"
                                        >
                                            {copiedUrl === dep.url ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};