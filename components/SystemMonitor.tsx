import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, UploadCloud, Users, Server, Zap, ChevronDown, ChevronUp } from 'lucide-react';

const SystemMonitor: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [stats, setStats] = useState({
        cpu: 0,
        gpu: 0,
        ram: 0,
        upload: 0,
        visitors: 1240,
        uptime: 0
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                cpu: Math.floor(Math.random() * 15) + 5, // 5-20%
                gpu: Math.floor(Math.random() * 10) + 2, // 2-12%
                ram: 420 + Math.floor(Math.random() * 50), // 420-470MB
                upload: Number((Math.random() * 2.5).toFixed(1)),
                visitors: prev.visitors + (Math.random() > 0.95 ? 1 : 0),
                uptime: prev.uptime + 1
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h}h ${m}m ${sec}s`;
    };

    return (
        <div className="fixed bottom-14 left-4 z-[60] font-mono text-[10px] text-system-neon">
            <div className={`bg-black/90 backdrop-blur-xl border border-system-neon/40 rounded-lg shadow-[0_0_20px_rgba(0,255,65,0.2)] transition-all duration-300 ${isExpanded ? 'w-52 p-3' : 'w-32 p-2'}`}>
                <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-1.5">
                        <Server size={12} className="animate-pulse" />
                        <span className="font-bold uppercase tracking-tighter">System</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-system-neon led-pulse"></div>
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                    </div>
                </div>

                {isExpanded ? (
                    <div className="space-y-1.5 mt-2 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <Cpu size={10} /> <span>CPU</span>
                            </div>
                            <span>{stats.cpu}%</span>
                        </div>
                        <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                            <div className="bg-system-neon h-full transition-all duration-1000" style={{ width: `${stats.cpu}%` }}></div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <Zap size={10} /> <span>GPU</span>
                            </div>
                            <span>{stats.gpu}%</span>
                        </div>
                        <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${stats.gpu}%` }}></div>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-system-neon/10">
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <HardDrive size={10} /> <span>RAM</span>
                            </div>
                            <span>{stats.ram}MB</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <UploadCloud size={10} /> <span>UP</span>
                            </div>
                            <span>{stats.upload}Mb/s</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <Users size={10} /> <span>VISIT</span>
                            </div>
                            <span>{stats.visitors.toLocaleString()}</span>
                        </div>

                        <div className="mt-2 text-[8px] text-gray-500 flex items-center gap-1 border-t border-system-neon/10 pt-1">
                            <Activity size={8} />
                            <span>UP: {formatUptime(stats.uptime)}</span>
                        </div>
                    </div>
                ) : (
                    <div className="mt-1 flex justify-between text-[9px]">
                        <span className="text-gray-400">CPU: {stats.cpu}%</span>
                        <span className="text-gray-400">RAM: {stats.ram}M</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemMonitor;