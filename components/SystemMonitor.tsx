import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, UploadCloud, Users, Server, Zap, ChevronDown, ChevronUp, Wifi } from 'lucide-react';

const SystemMonitor: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [stats, setStats] = useState({
        cpu: 0,
        gpu: 0,
        ram: 0,
        upload: 0,
        visitors: 1240,
        ping: 0
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                cpu: Math.floor(Math.random() * 25) + 5,
                gpu: Math.floor(Math.random() * 15) + 2,
                ram: 420 + Math.floor(Math.random() * 50),
                upload: Number((Math.random() * 2.5).toFixed(1)),
                visitors: prev.visitors + (Math.random() > 0.95 ? 1 : 0),
                ping: Math.floor(Math.random() * 20) + 10
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed top-4 left-4 z-[60] font-mono text-[10px]">
            {/* Compact Button View */}
            <div className="relative">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-[0_0_15px_rgba(0,255,65,0.15)] transition-all duration-300 hover:bg-black/80 ${
                        isExpanded 
                        ? 'bg-black/90 border-system-neon text-system-neon' 
                        : 'bg-black/60 backdrop-blur-md border-system-neon/50 text-system-neon/90 hover:border-system-neon'
                    }`}
                >
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-system-neon led-pulse"></div>
                        <div className="absolute inset-0 rounded-full bg-system-neon animate-ping opacity-20"></div>
                    </div>
                    <span className="font-bold tracking-tight">SERVER: ALL OK</span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {/* Expanded Dropdown Details */}
                {isExpanded && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-black/90 backdrop-blur-xl border border-system-neon/30 rounded-lg shadow-2xl p-3 text-system-neon animate-fade-in origin-top-left">
                        <div className="flex items-center justify-between mb-3 border-b border-system-neon/20 pb-2">
                            <span className="flex items-center gap-1.5 font-bold"><Server size={12} /> VinaGames Core</span>
                            <span className="text-[9px] bg-system-neon/10 px-1.5 py-0.5 rounded text-system-neon">STABLE</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center group">
                                <div className="flex items-center gap-2 text-gray-400 group-hover:text-system-neon transition-colors">
                                    <Wifi size={10} /> <span>PING</span>
                                </div>
                                <span className="font-bold">{stats.ping}ms</span>
                            </div>

                            <div className="flex justify-between items-center group">
                                <div className="flex items-center gap-2 text-gray-400 group-hover:text-system-neon transition-colors">
                                    <Cpu size={10} /> <span>CPU LOAD</span>
                                </div>
                                <span className="font-bold">{stats.cpu}%</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-system-neon to-green-400 h-full transition-all duration-1000" style={{ width: `${stats.cpu}%` }}></div>
                            </div>

                            <div className="flex justify-between items-center group mt-1">
                                <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-400 transition-colors">
                                    <Zap size={10} /> <span>GPU LOAD</span>
                                </div>
                                <span className="font-bold text-blue-400">{stats.gpu}%</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${stats.gpu}%` }}></div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-system-neon/10 mt-1">
                                <div className="bg-gray-800/50 p-1.5 rounded flex flex-col items-center">
                                    <HardDrive size={10} className="mb-1 text-gray-400"/>
                                    <span className="font-bold">{stats.ram} MB</span>
                                </div>
                                <div className="bg-gray-800/50 p-1.5 rounded flex flex-col items-center">
                                    <Users size={10} className="mb-1 text-gray-400"/>
                                    <span className="font-bold">{stats.visitors.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div className="text-[8px] text-center text-gray-500 mt-1 italic">
                                System integrity verified.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemMonitor;