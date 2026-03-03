import { useState, useEffect } from 'react';
import { Server } from '../App';

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
}

interface Props {
  server: Server | null;
}

export function FileManager({ server }: Props) {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingFile, setEditingFile] = useState<{ path: string; content: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState<'file' | 'folder' | null>(null);
  const [newName, setNewName] = useState('');

  const loadFiles = async (path: string = '') => {
    if (!server) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/servers/${server.id}/files?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.type === 'directory') {
          setItems(data.items);
          setCurrentPath(path);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (server) {
      loadFiles('');
    }
  }, [server?.id]);

  const openItem = async (item: FileItem) => {
    const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
    
    if (item.type === 'directory') {
      loadFiles(itemPath);
    } else {
      try {
        const res = await fetch(`/api/servers/${server!.id}/files?path=${encodeURIComponent(itemPath)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.type === 'file') {
            setEditingFile({ path: itemPath, content: data.content });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const goBack = () => {
    const parts = currentPath.split('/');
    parts.pop();
    loadFiles(parts.join('/'));
  };

  const saveFile = async () => {
    if (!editingFile || !server) return;
    
    setSaving(true);
    try {
      await fetch(`/api/servers/${server.id}/files`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: editingFile.path, content: editingFile.content })
      });
      setEditingFile(null);
    } catch (e) {
      console.error(e);
      alert('Ошибка сохранения файла');
    } finally {
      setSaving(false);
    }
  };

  const createItem = async () => {
    if (!newName.trim() || !server) return;
    
    const itemPath = currentPath ? `${currentPath}/${newName}` : newName;
    
    try {
      await fetch(`/api/servers/${server.id}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: itemPath, content: '', isDirectory: creating === 'folder' })
      });
      setCreating(null);
      setNewName('');
      loadFiles(currentPath);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteItem = async (item: FileItem) => {
    if (!confirm(`Удалить ${item.name}?`)) return;
    
    const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
    
    try {
      await fetch(`/api/servers/${server!.id}/files?path=${encodeURIComponent(itemPath)}`, {
        method: 'DELETE'
      });
      loadFiles(currentPath);
    } catch (e) {
      console.error(e);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getFileIcon = (name: string, type: string) => {
    if (type === 'directory') return '📁';
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'lua': return '🟡';
      case 'txt': return '📄';
      case 'cfg': return '⚙️';
      case 'json': return '📋';
      case 'mdl': return '🎭';
      case 'vtf': case 'vmt': return '🖼️';
      case 'wav': case 'mp3': return '🔊';
      default: return '📄';
    }
  };

  if (!server) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center h-full">
        <div className="text-7xl mb-6">📁</div>
        <h2 className="text-2xl font-bold text-white mb-3">Файловый менеджер</h2>
        <p className="text-zinc-500">Выберите сервер для просмотра файлов</p>
      </div>
    );
  }

  if (editingFile) {
    return (
      <div className="animate-fade-in h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Редактирование файла</h1>
            <p className="text-zinc-500">{editingFile.path}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setEditingFile(null)} className="btn-secondary">
              Отмена
            </button>
            <button onClick={saveFile} disabled={saving} className="btn-primary">
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
        <textarea
          value={editingFile.content}
          onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
          className="flex-1 input-field console-text resize-none"
          spellCheck={false}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Файлы</h1>
          <p className="text-zinc-500 text-lg">{server.name}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setCreating('folder')} className="btn-secondary">
            📁 Новая папка
          </button>
          <button onClick={() => setCreating('file')} className="btn-primary">
            📄 Новый файл
          </button>
        </div>
      </div>

      {creating && (
        <div className="modal-overlay" onClick={() => setCreating(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">
              {creating === 'folder' ? 'Новая папка' : 'Новый файл'}
            </h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={creating === 'folder' ? 'Название папки' : 'Название файла'}
              className="input-field mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setCreating(null)} className="btn-secondary flex-1">
                Отмена
              </button>
              <button onClick={createItem} className="btn-primary flex-1">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card-static overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
          <button
            onClick={goBack}
            disabled={!currentPath}
            className={`p-2 rounded-lg transition-colors ${currentPath ? 'hover:bg-white/5 text-white' : 'text-zinc-600'}`}
          >
            ⬅️
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">📁</span>
            <span className="text-white font-medium">{currentPath || '/'}</span>
          </div>
          <button onClick={() => loadFiles(currentPath)} className="ml-auto p-2 rounded-lg hover:bg-white/5 text-zinc-400">
            🔄
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full mx-auto" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            {server.installed ? 'Папка пуста' : 'Сервер не установлен. Установите сервер для доступа к файлам.'}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {items.map(item => (
              <div
                key={item.name}
                className="file-item group"
                onClick={() => openItem(item)}
              >
                <span className="text-xl">{getFileIcon(item.name, item.type)}</span>
                <span className="flex-1 text-white">{item.name}</span>
                <span className="text-sm text-zinc-600">{item.type === 'file' ? formatSize(item.size) : ''}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteItem(item); }}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
