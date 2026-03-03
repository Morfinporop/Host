import { Server, Page } from '../App';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  servers: Server[];
  selectedServer: string | null;
  onSelectServer: (id: string) => void;
}

const menuItems: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Дашборд', icon: '📊' },
  { id: 'servers', label: 'Серверы', icon: '🖥️' },
  { id: 'console', label: 'Консоль', icon: '💻' },
  { id: 'files', label: 'Файлы', icon: '📁' },
  { id: 'players', label: 'Игроки', icon: '👥' },
  { id: 'settings', label: 'Настройки', icon: '⚙️' },
  { id: 'install', label: 'Установка', icon: '📥' },
];

export function Sidebar({ currentPage, onNavigate, servers, selectedServer, onSelectServer }: Props) {
  const runningCount = servers.filter(s => s.running).length;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-80 bg-gradient-to-b from-[#1a1a2e] to-[#16162a] border-r border-white/5 flex flex-col z-50">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20">
            🎮
          </div>
          <div>
            <h1 className="font-bold text-xl text-white">GMod Panel</h1>
            <p className="text-sm text-zinc-500">Game Server Hosting</p>
          </div>
        </div>
      </div>

      {servers.length > 0 && (
        <div className="p-5 border-b border-white/5">
          <label className="text-xs text-zinc-500 uppercase tracking-wider mb-3 block font-semibold">Активный сервер</label>
          <select
            value={selectedServer || ''}
            onChange={(e) => onSelectServer(e.target.value)}
            className="input-field text-sm"
          >
            {servers.map(server => (
              <option key={server.id} value={server.id}>
                {server.running ? '🟢' : '⚫'} {server.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`sidebar-item w-full ${currentPage === item.id ? 'active' : ''}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-5 border-t border-white/5">
        <div className="card-static p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-400">Статус системы</span>
            <div className="status-online" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Серверов онлайн</span>
            <span className="text-white font-semibold">{runningCount} / {servers.length}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
