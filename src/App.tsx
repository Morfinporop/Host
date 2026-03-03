import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Servers } from './components/Servers';
import { Console } from './components/Console';
import { FileManager } from './components/FileManager';
import { Players } from './components/Players';
import { Settings } from './components/Settings';
import { Install } from './components/Install';
import { api } from './api';

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

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadServers = async () => {
    try {
      const data = await api.getServers();
      setServers(data);
      if (data.length > 0 && !selectedServer) {
        setSelectedServer(data[0].id);
      }
    } catch (e) {
      console.error('Failed to load servers:', e);
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
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <Sidebar 
        currentPage={page} 
        onNavigate={setPage} 
        servers={servers}
        selectedServer={selectedServer}
        onSelectServer={setSelectedServer}
      />
      <main className="flex-1 ml-72 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          renderPage()
        )}
      </main>
    </div>
  );
}
