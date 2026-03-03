import { Server, Users, Cpu, HardDrive, Activity, Clock, Zap } from 'lucide-react';
import { useServerStore } from '../store/serverStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const cpuData = [
  { time: '00:00', value: 35 },
  { time: '04:00', value: 28 },
  { time: '08:00', value: 45 },
  { time: '12:00', value: 62 },
  { time: '16:00', value: 78 },
  { time: '20:00', value: 55 },
  { time: '24:00', value: 42 },
];

const playersData = [
  { time: '00:00', value: 12 },
  { time: '04:00', value: 5 },
  { time: '08:00', value: 18 },
  { time: '12:00', value: 45 },
  { time: '16:00', value: 58 },
  { time: '20:00', value: 64 },
  { time: '24:00', value: 36 },
];

export default function Dashboard() {
  const { servers } = useServerStore();
  
  const totalPlayers = servers.reduce((acc, s) => acc + s.players, 0);
  const totalMaxPlayers = servers.reduce((acc, s) => acc + s.maxPlayers, 0);
  const onlineServers = servers.filter(s => s.status === 'online').length;
  const avgCpu = servers.filter(s => s.status === 'online').reduce((acc, s) => acc + s.cpu, 0) / (onlineServers || 1);
  const totalRam = servers.filter(s => s.status === 'online').reduce((acc, s) => acc + s.ram, 0);

  const stats = [
    { icon: Server, label: 'Серверов онлайн', value: `${onlineServers}/${servers.length}`, color: 'from-green-500 to-emerald-600' },
    { icon: Users, label: 'Игроков онлайн', value: `${totalPlayers}/${totalMaxPlayers}`, color: 'from-blue-500 to-cyan-600' },
    { icon: Cpu, label: 'Средняя нагрузка CPU', value: `${avgCpu.toFixed(0)}%`, color: 'from-orange-500 to-red-600' },
    { icon: HardDrive, label: 'Используется RAM', value: `${(totalRam / 1024).toFixed(1)} GB`, color: 'from-purple-500 to-pink-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Дашборд</h2>
          <p className="text-gray-400">Обзор всех ваших серверов</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">Все системы работают</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-orange-400" />
            Нагрузка CPU
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cpuData}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="value" stroke="#f97316" fill="url(#cpuGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Онлайн игроков
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={playersData}>
              <defs>
                <linearGradient id="playersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#playersGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Активные серверы</h3>
        <div className="space-y-3">
          {servers.map((server) => (
            <div key={server.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${server.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <div>
                  <p className="font-medium text-white">{server.name}</p>
                  <p className="text-sm text-gray-400">{server.ip}:{server.port}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{server.players}/{server.maxPlayers}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Activity className="w-4 h-4" />
                  <span>{server.cpu}%</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Zap className="w-4 h-4" />
                  <span>{server.tickrate} tick</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{Math.floor(server.uptime / 3600)}h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
