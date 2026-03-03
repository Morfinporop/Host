import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Download, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useServerStore } from '../store/serverStore';

export default function Console() {
  const { consoleLogs, addConsoleLog, selectedServer } = useServerStore();
  const [command, setCommand] = useState('');
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const handleSendCommand = () => {
    if (!command.trim()) return;
    
    addConsoleLog({ type: 'info', message: `> ${command}` });
    
    setTimeout(() => {
      if (command.toLowerCase() === 'status') {
        addConsoleLog({ type: 'success', message: `Server Status: Online | Players: ${selectedServer?.players || 0}/${selectedServer?.maxPlayers || 0}` });
      } else if (command.toLowerCase() === 'help') {
        addConsoleLog({ type: 'info', message: 'Available commands: status, help, map, kick, ban, say, changelevel, sv_password' });
      } else if (command.toLowerCase().startsWith('say ')) {
        addConsoleLog({ type: 'success', message: `Console: ${command.substring(4)}` });
      } else if (command.toLowerCase().startsWith('changelevel ')) {
        addConsoleLog({ type: 'warning', message: `Changing level to: ${command.substring(12)}...` });
        setTimeout(() => {
          addConsoleLog({ type: 'success', message: 'Level changed successfully!' });
        }, 1500);
      } else {
        addConsoleLog({ type: 'info', message: `Command executed: ${command}` });
      }
    }, 100);
    
    setCommand('');
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Консоль сервера</h2>
          <p className="text-gray-400">
            {selectedServer ? `${selectedServer.name} - ${selectedServer.ip}:${selectedServer.port}` : 'Выберите сервер'}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
            <Download className="w-5 h-5" />
            Скачать логи
          </button>
          <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Очистить
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm text-gray-400">srcds_console</span>
        </div>
        
        <div 
          ref={consoleRef}
          className="h-[500px] overflow-y-auto p-4 font-mono text-sm space-y-1"
        >
          {consoleLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2">
              <span className="text-gray-500">[{log.time}]</span>
              {getLogIcon(log.type)}
              <span className={getLogColor(log.type)}>{log.message}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-700 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()}
              placeholder="Введите команду..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
            <button 
              onClick={handleSendCommand}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Отправить
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            {['status', 'help', 'changelevel gm_construct', 'say Hello!'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => setCommand(cmd)}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-2 py-1 rounded transition"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
