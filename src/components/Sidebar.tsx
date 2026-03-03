import { Server, LayoutDashboard, Terminal, FolderOpen, Package, Users, Settings, CreditCard, Download, Shield } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { id: 'servers', icon: Server, label: 'Серверы' },
  { id: 'console', icon: Terminal, label: 'Консоль' },
  { id: 'files', icon: FolderOpen, label: 'Файлы' },
  { id: 'addons', icon: Package, label: 'Аддоны' },
  { id: 'players', icon: Users, label: 'Игроки' },
  { id: 'settings', icon: Settings, label: 'Настройки' },
  { id: 'install', icon: Download, label: 'Установка' },
  { id: 'tariffs', icon: CreditCard, label: 'Тарифы' },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">GMod Host</h1>
            <p className="text-xs text-gray-500">Panel v2.0</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive 
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-3 border border-orange-500/30">
          <p className="text-xs text-orange-300 font-medium">Текущий тариф</p>
          <p className="text-white font-bold">Premium</p>
          <p className="text-xs text-gray-400 mt-1">3 сервера активно</p>
        </div>
      </div>
    </aside>
  );
}
