import { useState } from 'react';
import { Folder, File, ChevronRight, Home, Upload, Plus, Download, Trash2, Edit, RefreshCw } from 'lucide-react';
import { useServerStore } from '../store/serverStore';

export default function FileManager() {
  const { files, currentPath, setCurrentPath } = useServerStore();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Файловый менеджер</h2>
          <p className="text-gray-400">Управление файлами сервера</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Обновить
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Загрузить
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Создать
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="bg-gray-900/50 px-4 py-3 border-b border-gray-700 flex items-center gap-2">
          <button 
            onClick={() => setCurrentPath('/')}
            className="text-gray-400 hover:text-white transition"
          >
            <Home className="w-5 h-5" />
          </button>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <span className="text-gray-400">garrysmod</span>
          {pathParts.map((part, i) => (
            <div key={i} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-600" />
              <button 
                onClick={() => setCurrentPath('/' + pathParts.slice(0, i + 1).join('/'))}
                className="text-orange-400 hover:text-orange-300 transition"
              >
                {part}
              </button>
            </div>
          ))}
        </div>

        <div className="divide-y divide-gray-700/50">
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-900/30 text-sm text-gray-500">
            <div className="col-span-6">Имя</div>
            <div className="col-span-2">Размер</div>
            <div className="col-span-3">Изменен</div>
            <div className="col-span-1">Действия</div>
          </div>
          
          {currentPath !== '/' && (
            <div 
              onClick={() => setCurrentPath(currentPath.split('/').slice(0, -1).join('/') || '/')}
              className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-700/30 cursor-pointer transition"
            >
              <div className="col-span-6 flex items-center gap-3">
                <Folder className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-300">..</span>
              </div>
              <div className="col-span-2 text-gray-500">-</div>
              <div className="col-span-3 text-gray-500">-</div>
              <div className="col-span-1"></div>
            </div>
          )}

          {files.map((file) => (
            <div 
              key={file.path}
              onClick={() => {
                if (file.type === 'folder') {
                  setCurrentPath(file.path);
                } else {
                  setSelectedFile(file.path);
                }
              }}
              className={`grid grid-cols-12 gap-4 px-4 py-3 cursor-pointer transition ${
                selectedFile === file.path ? 'bg-orange-500/10' : 'hover:bg-gray-700/30'
              }`}
            >
              <div className="col-span-6 flex items-center gap-3">
                {file.type === 'folder' ? (
                  <Folder className="w-5 h-5 text-yellow-500" />
                ) : (
                  <File className="w-5 h-5 text-blue-400" />
                )}
                <span className="text-white">{file.name}</span>
              </div>
              <div className="col-span-2 text-gray-500">{file.size || '-'}</div>
              <div className="col-span-3 text-gray-500">{file.modified || '-'}</div>
              <div className="col-span-1 flex items-center gap-1">
                {file.type === 'file' && (
                  <>
                    <button className="p-1 text-gray-500 hover:text-white transition">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-white transition">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-red-400 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Быстрые действия</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="bg-gray-900/50 hover:bg-gray-700 border border-gray-700 rounded-lg p-3 text-left transition">
            <File className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-white font-medium">server.cfg</p>
            <p className="text-xs text-gray-500">Настройки сервера</p>
          </button>
          <button className="bg-gray-900/50 hover:bg-gray-700 border border-gray-700 rounded-lg p-3 text-left transition">
            <File className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white font-medium">autoexec.cfg</p>
            <p className="text-xs text-gray-500">Автозапуск</p>
          </button>
          <button className="bg-gray-900/50 hover:bg-gray-700 border border-gray-700 rounded-lg p-3 text-left transition">
            <Folder className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-white font-medium">addons</p>
            <p className="text-xs text-gray-500">Аддоны сервера</p>
          </button>
          <button className="bg-gray-900/50 hover:bg-gray-700 border border-gray-700 rounded-lg p-3 text-left transition">
            <Folder className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white font-medium">lua</p>
            <p className="text-xs text-gray-500">Lua скрипты</p>
          </button>
        </div>
      </div>
    </div>
  );
}
