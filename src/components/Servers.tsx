import { Play, Square, RotateCcw, Users, Cpu, HardDrive, Map, Gamepad2, Copy } from 'lucide-react';
import { useServerStore } from '../store/serverStore';

export default function Servers() {
  const { servers, selectedServer, setSelectedServer, updateServerStatus, addConsoleLog } = useServerStore();

  const handleStart = (id: string) => {
    updateServerStatus(id, 'starting');
    addConsoleLog({ type: 'info', message: 'Starting server...' });
    setTimeout(() => {
      updateServerStatus(id, 'online');
      addConsoleLog({ type: 'success', message: 'Server started successfully!' });
    }, 2000);
  };

  const handleStop = (id: string) => {
    updateServerStatus(id, 'stopping');
    addConsoleLog({ type: 'warning', message: 'Stopping server...' });
    setTimeout(() => {
      updateServerStatus(id, 'offline');
      addConsoleLog({ type: 'info', message: 'Server stopped.' });
    }, 1500);
  };

  const handleRestart = (id: string) => {
    updateServerStatus(id, 'stopping');
    addConsoleLog({ type: 'warning', message: 'Restarting server...' });
    setTimeout(() => {
      updateServerStatus(id, 'starting');
      setTimeout(() => {
        updateServerStatus(id, 'online');
        addConsoleLog({ type: 'success', message: 'Server restarted successfully!' });
      }, 2000);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Управление серверами</h2>
          <p className="text-gray-400">Запуск, остановка и мониторинг серверов</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2">
          <Gamepad2 className="w-5 h-5" />
          Создать сервер
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {servers.map((server) => (
            <div
              key={server.id}
              onClick={() => setSelectedServer(server)}
              className={`bg-gray-800/50 border rounded-xl p-4 cursor-pointer transition-all ${
                selectedServer?.id === server.id 
                  ? 'border-orange-500 ring-1 ring-orange-500/50' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    server.status === 'online' ? 'bg-green-500' : 
                    server.status === 'offline' ? 'bg-gray-500' :
                    'bg-yellow-500 animate-pulse'
                  }`}></div>
                  <span className="font-medium text-white">{server.name}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  server.status === 'online' ? 'bg-green-500/20 text-green-400' :
                  server.status === 'offline' ? 'bg-gray-500/20 text-gray-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {server.status === 'online' ? 'Онлайн' : 
                   server.status === 'offline' ? 'Оффлайн' :
                   server.status === 'starting' ? 'Запуск...' : 'Остановка...'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {server.players}/{server.maxPlayers}
                </span>
                <span className="flex items-center gap-1">
                  <Map className="w-4 h-4" />
                  {server.gamemode}
                </span>
              </div>
            </div>
          ))}
        </div>

        {selectedServer && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedServer.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-400">{selectedServer.ip}:{selectedServer.port}</span>
                    <button 
                      onClick={() => copyToClipboard(`${selectedServer.ip}:${selectedServer.port}`)}
                      className="text-gray-500 hover:text-white transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedServer.status === 'offline' ? (
                    <button 
                      onClick={() => handleStart(selectedServer.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Запустить
                    </button>
                  ) : selectedServer.status === 'online' ? (
                    <>
                      <button 
                        onClick={() => handleStop(selectedServer.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                      >
                        <Square className="w-5 h-5" />
                        Остановить
                      </button>
                      <button 
                        onClick={() => handleRestart(selectedServer.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Рестарт
                      </button>
                    </>
                  ) : (
                    <button disabled className="bg-gray-600 text-gray-400 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 animate-spin" />
                      Подождите...
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    Игроки
                  </div>
                  <p className="text-xl font-bold text-white">{selectedServer.players}/{selectedServer.maxPlayers}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Cpu className="w-4 h-4" />
                    CPU
                  </div>
                  <p className="text-xl font-bold text-white">{selectedServer.cpu}%</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <HardDrive className="w-4 h-4" />
                    RAM
                  </div>
                  <p className="text-xl font-bold text-white">{selectedServer.ram}/{selectedServer.ramMax} MB</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Map className="w-4 h-4" />
                    Карта
                  </div>
                  <p className="text-sm font-bold text-white truncate">{selectedServer.map}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">Gamemode</span>
                  <span className="text-white font-medium">{selectedServer.gamemode}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">Tickrate</span>
                  <span className="text-white font-medium">{selectedServer.tickrate}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-white font-medium">{Math.floor(selectedServer.uptime / 3600)} часов</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">Подключение</span>
                  <div className="flex items-center gap-2">
                    <code className="text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                      connect {selectedServer.ip}:{selectedServer.port}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(`connect ${selectedServer.ip}:${selectedServer.port}`)}
                      className="text-gray-500 hover:text-white transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
