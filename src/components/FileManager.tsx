import { useState, useEffect } from 'react';
import { Server } from '../App';
import { api } from '../api';

interface Props {
  server: Server | null;
}

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
}

export function FileManager({ server }: Props) {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [creating, setCreating] = useState<'file' | 'directory' | null>(null);
  const [newName, setNewName] = useState('');

  const loadFiles = async () => {
    if (!server) return;
    setLoading(true);
    try {
      const data = await api.getFiles(server.id, currentPath);
      if (data.type === 'directory') {
        setItems(data.items);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [server?.id, currentPath]);

  const openFile = async (item: FileItem) => {
    if (item.type === 'directory') {
      setCurrentPath(currentPath ? `${currentPath}/${item.name}` : item.name);
    } else {
      try {
        const data = await api.getFiles(server!.id, currentPath ? `${currentPath}/${item.name}` : item.name);
        if (data.type === 'file') {
          setFileContent(data.content);
          setEditingFile(currentPath ? `${currentPath}/${item.name}` : item.name);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const goBack = () => {
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  const saveFile = async () => {
    if (!editingFile || !server) return;
    try {
      await api.updateFile(server.id, editingFile, fileContent);
      setEditingFile(null);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteItem = async (item: FileItem) => {
    if (!confirm(`Удалить ${item.name}?`)) return;
    if (!server) return;
    
    try {
      const path = currentPath ? `${currentPath}/${item.name}` : item.name;
      await api.deleteFile(server.id, path);
      loadFiles();
    } catch (e) {
      console.error(e);
    }
  };

  const createItem = async () => {
    if (!newName || !server || !creating) return;
    
    try {
      const path = currentPath ? `${currentPath}/${newName}` : newName;
      await api.createFile(server.id, path, '', creating === 'directory');
      setCreating(null);
      setNewName('');
      loadFiles();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !server) return;
    
    try {
      await api.uploadFile(server.id, currentPath, file);
      loadFiles();
    } catch (err) {
      console.error(err);
    }
    e.target.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getIcon = (item: FileItem) => {
    if (item.type === 'directory') return '📁';
    if (item.name.endsWith('.lua')) return '📜';
    if (item.name.endsWith('.cfg')) return '⚙️';
    if (item.name.endsWith('.txt')) return '📄';
    if (item.name.endsWith('.json')) return '📋';
    if (item.name.endsWith('.vmt') || item.name.endsWith('.vtf')) return '🖼️';
    if (item.name.endsWith('.mdl')) return '🎭';
    if (item.name.endsWith('.wav') || item.name.endsWith('.mp3')) return '🔊';
    return '📄';
  };

  if (!server) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-white mb-2">Выберите сервер</h3>
          <p className="text-zinc-500">Выберите сервер для управления файлами</p>
        </div>
      </div>
    );
  }

  if (editingFile) {
    return (
      <div className="animate-fade-in h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Редактор</h1>
            <p className="text-zinc-500">{editingFile}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setEditingFile(null)}
              className="px-4 py-2 bg-zinc-800 rounded-xl text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={saveFile}
              className="px-4 py-2 bg-green-600 rounded-xl text-white hover:bg-green-500 transition-colors"
            >
              💾 Сохранить
            </button>
          </div>
        </div>

        <div className="flex-1 glass rounded-2xl border border-zinc-800/50 overflow-hidden">
          <textarea
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            className="w-full h-full p-4 bg-transparent resize-none font-mono text-sm text-zinc-300 outline-none"
            spellCheck={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Файлы</h1>
          <p className="text-zinc-500">{server.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCreating('directory')}
            className="px-4 py-2 bg-zinc-800 rounded-xl text-zinc-300 hover:bg-zinc-700 transition-colors text-sm"
          >
            📁 Папка
          </button>
          <button
            onClick={() => setCreating('file')}
            className="px-4 py-2 bg-zinc-800 rounded-xl text-zinc-300 hover:bg-zinc-700 transition-colors text-sm"
          >
            📄 Файл
          </button>
          <label className="px-4 py-2 bg-blue-600 rounded-xl text-white hover:bg-blue-500 transition-colors text-sm cursor-pointer">
            📤 Загрузить
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>

      {creating && (
        <div className="mb-4 glass rounded-xl p-4 border border-zinc-800/50 flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={creating === 'directory' ? 'Имя папки' : 'Имя файла'}
            className="flex-1"
            autoFocus
          />
          <button
            onClick={createItem}
            className="px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-500"
          >
            Создать
          </button>
          <button
            onClick={() => { setCreating(null); setNewName(''); }}
            className="px-4 py-2 bg-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-600"
          >
            Отмена
          </button>
        </div>
      )}

      <div className="glass rounded-2xl border border-zinc-800/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center gap-2 bg-zinc-900/50">
          <button
            onClick={goBack}
            disabled={!currentPath}
            className="p-2 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ⬅️
          </button>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-zinc-500">📂</span>
            <span className="text-zinc-400">/</span>
            {currentPath.split('/').filter(Boolean).map((part, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-zinc-300">{part}</span>
                {i < arr.length - 1 && <span className="text-zinc-600">/</span>}
              </span>
            ))}
          </div>
          <button
            onClick={loadFiles}
            className="ml-auto p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            🔄
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            {server.installed ? 'Папка пуста' : 'Сервер не установлен. Перейдите в раздел "Установка".'}
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/30 cursor-pointer transition-colors group"
                onClick={() => openFile(item)}
              >
                <span className="text-xl">{getIcon(item)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-zinc-200 truncate">{item.name}</div>
                  <div className="text-xs text-zinc-500">
                    {item.type === 'file' && formatSize(item.size)}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.type === 'file' && (
                    <a
                      href={api.getDownloadUrl(server.id, currentPath ? `${currentPath}/${item.name}` : item.name)}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
                    >
                      ⬇️
                    </a>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteItem(item); }}
                    className="p-1.5 rounded-lg bg-zinc-700 hover:bg-red-600 text-zinc-300"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
