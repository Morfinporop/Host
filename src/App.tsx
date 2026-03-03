import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Servers from './components/Servers';
import Console from './components/Console';
import FileManager from './components/FileManager';
import Addons from './components/Addons';
import Players from './components/Players';
import Settings from './components/Settings';
import Install from './components/Install';
import Tariffs from './components/Tariffs';
import { Bell, User, Search } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'servers': return <Servers />;
      case 'console': return <Console />;
      case 'files': return <FileManager />;
      case 'addons': return <Addons />;
      case 'players': return <Players />;
      case 'settings': return <Settings />;
      case 'install': return <Install />;
      case 'tariffs': return <Tariffs />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Поиск..."
                className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 w-64"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Admin</p>
                <p className="text-xs text-gray-500">Premium</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
