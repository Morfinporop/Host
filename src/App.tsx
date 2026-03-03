import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Servers } from './components/Servers';
import { Console } from './components/Console';
import { FileManager } from './components/FileManager';
import { Players } from './components/Players';
import { Settings } from './components/Settings';
import { Install } from './components/Install';

export interface Server {
  id: string;
  name: string;
  port: number;
  maxPlayers: number;
  gamemode: string;
  map: string;
  tickrate: number;
  running: boolean;
  installed: boolean;
  hostname?: string;
  rconPassword?: string;
  svPassword?: string;
  gslt?: string;
  workshopCollection?: string;
  fastdl?: string;
  loadingUrl?: string;
}

export type Page = 'dashboard' | 'servers' | 'console' | 'files' | 'players' | 'settings' | 'install';

const API_URL = '';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/servers`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setServers(data);
      if (data.length > 0 && !selectedServer) {
        setSelectedServer(data[0].id);
      }
      setError(null);
    } catch (e) {
      console.error('Failed to load servers:', e);
      setError('Не удалось подключиться к серверу');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServers();
    const interval = setInterval(loadServers, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentServer = servers.find(s => s.id === selectedServer) || null;

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard servers={servers} onSelectServer={(id) => { setSelectedServer(id); setPage('console'); }} />;
      case 'servers':
        return <Servers servers={servers} selectedServer={selectedServer} onSelect={setSelectedServer} onRefresh={loadServers} />;
      case 'console':
        return <Console server={currentServer} />;
      case 'files':
        return <FileManager server={currentServer} />;
      case 'players':
        return <Players server={currentServer} />;
      case 'settings':
        return <Settings server={currentServer} onUpdate={loadServers} />;
      case 'install':
        return <Install server={currentServer} onComplete={loadServers} />;
      default:
        return <Dashboard servers={servers} onSelectServer={(id) => { setSelectedServer(id); setPage('console'); }} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar 
        currentPage={page} 
        onNavigate={setPage} 
        servers={servers}
        selectedServer={selectedServer}
        onSelectServer={setSelectedServer}
      />
      
      <main className="flex-1 ml-80 p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
            <p className="text-zinc-400">Загрузка...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-6xl">⚠️</div>
            <h2 className="text-2xl font-bold text-white">{error}</h2>
            <p className="text-zinc-400">Убедитесь что бэкенд сервер запущен</p>
            <button onClick={loadServers} className="btn-primary mt-4">
              Повторить попытку
            </button>
          </div>
        ) : (
          renderPage()
        )}
      </main>
    </div>
  );
}
