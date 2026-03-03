import { useState, useEffect } from 'react'

interface Server {
  id: string
  name: string
  map: string
  gamemode: string
  maxPlayers: number
  tickrate: number
  port: number
  rconPassword: string
  svPassword: string
  status: 'online' | 'offline' | 'starting'
  players: number
  cpu: number
  ram: number
  uptime: number
}

interface ConsoleLog {
  time: string
  type: 'info' | 'warn' | 'error' | 'success'
  message: string
}

const defaultServers: Server[] = []

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

function getRandomPort() {
  return 27015 + Math.floor(Math.random() * 100)
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [servers, setServers] = useState<Server[]>(() => {
    const saved = localStorage.getItem('gmod_servers')
    return saved ? JSON.parse(saved) : defaultServers
  })
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const [consoleInput, setConsoleInput] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newServer, setNewServer] = useState({
    name: '',
    map: 'gm_flatgrass',
    gamemode: 'sandbox',
    maxPlayers: 32,
    tickrate: 66,
    rconPassword: '',
    svPassword: ''
  })

  useEffect(() => {
    localStorage.setItem('gmod_servers', JSON.stringify(servers))
  }, [servers])

  useEffect(() => {
    const interval = setInterval(() => {
      setServers(prev => prev.map(s => {
        if (s.status === 'online') {
          return {
            ...s,
            players: Math.min(s.maxPlayers, Math.max(0, s.players + Math.floor(Math.random() * 3) - 1)),
            cpu: Math.min(100, Math.max(5, s.cpu + Math.floor(Math.random() * 10) - 5)),
            ram: Math.min(100, Math.max(10, s.ram + Math.floor(Math.random() * 6) - 3)),
            uptime: s.uptime + 1
          }
        }
        return s
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const createServer = () => {
    if (!newServer.name.trim()) return
    const server: Server = {
      id: generateId(),
      name: newServer.name,
      map: newServer.map || 'gm_flatgrass',
      gamemode: newServer.gamemode || 'sandbox',
      maxPlayers: newServer.maxPlayers || 32,
      tickrate: newServer.tickrate || 66,
      port: getRandomPort(),
      rconPassword: newServer.rconPassword || 'changeme',
      svPassword: newServer.svPassword,
      status: 'offline',
      players: 0,
      cpu: 0,
      ram: 0,
      uptime: 0
    }
    setServers([...servers, server])
    setShowCreateModal(false)
    setNewServer({ name: '', map: 'gm_flatgrass', gamemode: 'sandbox', maxPlayers: 32, tickrate: 66, rconPassword: '', svPassword: '' })
    addLog('success', `Сервер "${server.name}" успешно создан`)
  }

  const startServer = (id: string) => {
    setServers(prev => prev.map(s => {
      if (s.id === id) {
        addLog('info', `Запуск сервера "${s.name}"...`)
        setTimeout(() => {
          addLog('success', `Сервер "${s.name}" успешно запущен на порту ${s.port}`)
        }, 2000)
        return { ...s, status: 'starting' as const }
      }
      return s
    }))
    setTimeout(() => {
      setServers(prev => prev.map(s => s.id === id ? { ...s, status: 'online', uptime: 0, cpu: 15, ram: 25 } : s))
    }, 2000)
  }

  const stopServer = (id: string) => {
    setServers(prev => prev.map(s => {
      if (s.id === id) {
        addLog('warn', `Сервер "${s.name}" остановлен`)
        return { ...s, status: 'offline', players: 0, cpu: 0, ram: 0, uptime: 0 }
      }
      return s
    }))
  }

  const restartServer = (id: string) => {
    const server = servers.find(s => s.id === id)
    if (server) {
      addLog('info', `Перезапуск сервера "${server.name}"...`)
      stopServer(id)
      setTimeout(() => startServer(id), 1000)
    }
  }

  const deleteServer = (id: string) => {
    const server = servers.find(s => s.id === id)
    if (server && confirm(`Удалить сервер "${server.name}"?`)) {
      setServers(prev => prev.filter(s => s.id !== id))
      if (selectedServer?.id === id) setSelectedServer(null)
      addLog('warn', `Сервер "${server.name}" удален`)
    }
  }

  const addLog = (type: ConsoleLog['type'], message: string) => {
    const now = new Date()
    const time = now.toLocaleTimeString('ru-RU')
    setConsoleLogs(prev => [...prev.slice(-99), { time, type, message }])
  }

  const sendCommand = () => {
    if (!consoleInput.trim()) return
    addLog('info', `> ${consoleInput}`)
    const cmd = consoleInput.toLowerCase()
    if (cmd === 'status') {
      addLog('info', `Активных серверов: ${servers.filter(s => s.status === 'online').length}`)
      addLog('info', `Всего игроков: ${servers.reduce((a, s) => a + s.players, 0)}`)
    } else if (cmd === 'help') {
      addLog('info', 'Доступные команды: status, help, clear, servers')
    } else if (cmd === 'clear') {
      setConsoleLogs([])
    } else if (cmd === 'servers') {
      servers.forEach(s => addLog('info', `${s.name} - ${s.status} - ${s.players}/${s.maxPlayers}`))
    } else {
      addLog('warn', `Команда "${consoleInput}" выполнена`)
    }
    setConsoleInput('')
  }

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const totalPlayers = servers.reduce((a, s) => a + s.players, 0)
  const totalMaxPlayers = servers.reduce((a, s) => a + s.maxPlayers, 0)
  const onlineServers = servers.filter(s => s.status === 'online').length

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <aside className="w-64 bg-[#0f0f18] border-r border-[#1a1a2e] flex flex-col">
        <div className="p-5 border-b border-[#1a1a2e]">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            GMod Panel
          </h1>
          <p className="text-xs text-gray-500 mt-1">Управление серверами</p>
        </div>
        <nav className="flex-1 p-3">
          {[
            { id: 'dashboard', icon: '📊', label: 'Дашборд' },
            { id: 'servers', icon: '🖥️', label: 'Серверы' },
            { id: 'console', icon: '💻', label: 'Консоль' },
            { id: 'files', icon: '📁', label: 'Файлы' },
            { id: 'players', icon: '👥', label: 'Игроки' },
            { id: 'settings', icon: '⚙️', label: 'Настройки' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                page === item.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-400 hover:bg-[#1a1a2e] hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#1a1a2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              A
            </div>
            <div>
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-gray-500">Администратор</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        {page === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Дашборд</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#12121a] rounded-xl p-5 border border-[#1a1a2e]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Серверов онлайн</p>
                    <p className="text-3xl font-bold mt-1">{onlineServers}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-2xl">
                    🟢
                  </div>
                </div>
              </div>
              <div className="bg-[#12121a] rounded-xl p-5 border border-[#1a1a2e]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Всего серверов</p>
                    <p className="text-3xl font-bold mt-1">{servers.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center text-2xl">
                    🖥️
                  </div>
                </div>
              </div>
              <div className="bg-[#12121a] rounded-xl p-5 border border-[#1a1a2e]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Игроков онлайн</p>
                    <p className="text-3xl font-bold mt-1">{totalPlayers}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-2xl">
                    👥
                  </div>
                </div>
              </div>
              <div className="bg-[#12121a] rounded-xl p-5 border border-[#1a1a2e]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Макс. слотов</p>
                    <p className="text-3xl font-bold mt-1">{totalMaxPlayers}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-2xl">
                    📊
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#12121a] rounded-xl border border-[#1a1a2e] overflow-hidden">
              <div className="p-4 border-b border-[#1a1a2e] flex justify-between items-center">
                <h3 className="font-semibold">Мои серверы</h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm transition-colors"
                >
                  + Создать сервер
                </button>
              </div>
              {servers.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p className="text-4xl mb-4">🖥️</p>
                  <p>У вас пока нет серверов</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm text-white transition-colors"
                  >
                    Создать первый сервер
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#1a1a2e]">
                  {servers.map(server => (
                    <div key={server.id} className="p-4 hover:bg-[#1a1a2e]/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            server.status === 'online' ? 'bg-green-500' : 
                            server.status === 'starting' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'
                          }`} />
                          <div>
                            <h4 className="font-medium">{server.name}</h4>
                            <p className="text-sm text-gray-500">
                              {server.map} • {server.gamemode} • Порт: {server.port}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm">{server.players}/{server.maxPlayers} игроков</p>
                            <p className="text-xs text-gray-500">CPU: {server.cpu}% • RAM: {server.ram}%</p>
                          </div>
                          <div className="flex gap-2">
                            {server.status === 'offline' ? (
                              <button
                                onClick={() => startServer(server.id)}
                                className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                title="Запустить"
                              >
                                ▶️
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => restartServer(server.id)}
                                  className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                                  title="Перезапустить"
                                >
                                  🔄
                                </button>
                                <button
                                  onClick={() => stopServer(server.id)}
                                  className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                  title="Остановить"
                                >
                                  ⏹️
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {page === 'servers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Серверы</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                + Создать сервер
              </button>
            </div>
            
            {servers.length === 0 ? (
              <div className="bg-[#12121a] rounded-xl border border-[#1a1a2e] p-12 text-center">
                <p className="text-6xl mb-4">🖥️</p>
                <h3 className="text-xl font-semibold mb-2">Нет серверов</h3>
                <p className="text-gray-500 mb-6">Создайте свой первый сервер Garry's Mod</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Создать сервер
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {servers.map(server => (
                  <div key={server.id} className="bg-[#12121a] rounded-xl border border-[#1a1a2e] p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${
                          server.status === 'online' ? 'bg-green-500 glow-green' : 
                          server.status === 'starting' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'
                        }`} />
                        <div>
                          <h3 className="text-xl font-semibold">{server.name}</h3>
                          <p className="text-gray-500">ID: {server.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {server.status === 'offline' ? (
                          <button
                            onClick={() => startServer(server.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                          >
                            ▶️ Запустить
                          </button>
                        ) : server.status === 'starting' ? (
                          <button disabled className="px-4 py-2 bg-yellow-600 rounded-lg flex items-center gap-2 opacity-50">
                            ⏳ Запуск...
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => restartServer(server.id)}
                              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors flex items-center gap-2"
                            >
                              🔄 Рестарт
                            </button>
                            <button
                              onClick={() => stopServer(server.id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                            >
                              ⏹️ Стоп
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteServer(server.id)}
                          className="px-4 py-2 bg-red-900 hover:bg-red-800 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div className="bg-[#0a0a0f] rounded-lg p-3">
                        <p className="text-xs text-gray-500">Карта</p>
                        <p className="font-medium truncate">{server.map}</p>
                      </div>
                      <div className="bg-[#0a0a0f] rounded-lg p-3">
                        <p className="text-xs text-gray-500">Режим</p>
                        <p className="font-medium">{server.gamemode}</p>
                      </div>
                      <div className="bg-[#0a0a0f] rounded-lg p-3">
                        <p className="text-xs text-gray-500">Порт</p>
                        <p className="font-medium">{server.port}</p>
                      </div>
                      <div className="bg-[#0a0a0f] rounded-lg p-3">
                        <p className="text-xs text-gray-500">Игроки</p>
                        <p className="font-medium">{server.players}/{server.maxPlayers}</p>
                      </div>
                      <div className="bg-[#0a0a0f] rounded-lg p-3">
                        <p className="text-xs text-gray-500">Tickrate</p>
                        <p className="font-medium">{server.tickrate}</p>
                      </div>
                      <div className="bg-[#0a0a0f] rounded-lg p-3">
                        <p className="text-xs text-gray-500">Аптайм</p>
                        <p className="font-medium">{formatUptime(server.uptime)}</p>
                      </div>
                    </div>

                    {server.status === 'online' && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">CPU</span>
                            <span>{server.cpu}%</span>
                          </div>
                          <div className="h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                              style={{ width: `${server.cpu}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">RAM</span>
                            <span>{server.ram}%</span>
                          </div>
                          <div className="h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                              style={{ width: `${server.ram}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 p-3 bg-[#0a0a0f] rounded-lg flex items-center justify-between">
                      <code className="text-sm text-gray-400">
                        connect {window.location.hostname}:{server.port}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`connect ${window.location.hostname}:${server.port}`)
                          addLog('success', 'IP скопирован!')
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-sm transition-colors"
                      >
                        Копировать
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {page === 'console' && (
          <div className="space-y-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold">Консоль</h2>
            <div className="flex-1 bg-[#12121a] rounded-xl border border-[#1a1a2e] flex flex-col min-h-[500px]">
              <div className="p-3 border-b border-[#1a1a2e] flex gap-2">
                <button
                  onClick={() => addLog('info', 'Status: OK')}
                  className="px-3 py-1 bg-[#1a1a2e] hover:bg-[#2a2a3e] rounded text-sm transition-colors"
                >
                  status
                </button>
                <button
                  onClick={() => setConsoleLogs([])}
                  className="px-3 py-1 bg-[#1a1a2e] hover:bg-[#2a2a3e] rounded text-sm transition-colors"
                >
                  clear
                </button>
                <button
                  onClick={() => addLog('info', 'Available commands: status, help, clear, servers')}
                  className="px-3 py-1 bg-[#1a1a2e] hover:bg-[#2a2a3e] rounded text-sm transition-colors"
                >
                  help
                </button>
              </div>
              <div className="flex-1 p-4 overflow-auto font-mono text-sm space-y-1 bg-[#0a0a0f]">
                {consoleLogs.length === 0 ? (
                  <p className="text-gray-600">Консоль пуста. Введите команду...</p>
                ) : (
                  consoleLogs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-gray-600">[{log.time}]</span>
                      <span className={
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'warn' ? 'text-yellow-400' :
                        log.type === 'success' ? 'text-green-400' :
                        'text-gray-300'
                      }>{log.message}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-[#1a1a2e] flex gap-2">
                <input
                  type="text"
                  value={consoleInput}
                  onChange={e => setConsoleInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendCommand()}
                  placeholder="Введите команду..."
                  className="flex-1 px-4 py-2 bg-[#0a0a0f] rounded-lg text-sm"
                />
                <button
                  onClick={sendCommand}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm transition-colors"
                >
                  Отправить
                </button>
              </div>
            </div>
          </div>
        )}

        {page === 'files' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Файловый менеджер</h2>
            <div className="bg-[#12121a] rounded-xl border border-[#1a1a2e]">
              <div className="p-3 border-b border-[#1a1a2e] flex items-center gap-2">
                <span className="text-gray-500">📁</span>
                <span className="text-sm">/home/gmod/server/</span>
              </div>
              <div className="divide-y divide-[#1a1a2e]">
                {[
                  { name: 'garrysmod', type: 'folder', size: '-' },
                  { name: 'cfg', type: 'folder', size: '-' },
                  { name: 'addons', type: 'folder', size: '-' },
                  { name: 'lua', type: 'folder', size: '-' },
                  { name: 'maps', type: 'folder', size: '-' },
                  { name: 'server.cfg', type: 'file', size: '2.4 KB' },
                  { name: 'autoexec.cfg', type: 'file', size: '1.1 KB' },
                  { name: 'srcds_run', type: 'file', size: '45 KB' },
                ].map((item, i) => (
                  <div key={i} className="p-3 flex items-center justify-between hover:bg-[#1a1a2e]/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span>{item.type === 'folder' ? '📁' : '📄'}</span>
                      <span>{item.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{item.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {page === 'players' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Игроки онлайн</h2>
            {servers.filter(s => s.status === 'online' && s.players > 0).length === 0 ? (
              <div className="bg-[#12121a] rounded-xl border border-[#1a1a2e] p-12 text-center">
                <p className="text-6xl mb-4">👥</p>
                <h3 className="text-xl font-semibold mb-2">Нет игроков онлайн</h3>
                <p className="text-gray-500">Запустите сервер чтобы увидеть игроков</p>
              </div>
            ) : (
              servers.filter(s => s.status === 'online').map(server => (
                <div key={server.id} className="bg-[#12121a] rounded-xl border border-[#1a1a2e]">
                  <div className="p-4 border-b border-[#1a1a2e]">
                    <h3 className="font-semibold">{server.name}</h3>
                    <p className="text-sm text-gray-500">{server.players} игроков</p>
                  </div>
                  <div className="divide-y divide-[#1a1a2e]">
                    {Array.from({ length: server.players }).map((_, i) => (
                      <div key={i} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            {String.fromCharCode(65 + i)}
                          </div>
                          <div>
                            <p className="font-medium">Player_{1000 + i}</p>
                            <p className="text-sm text-gray-500">STEAM_0:1:{Math.floor(Math.random() * 999999999)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">{Math.floor(Math.random() * 100)}ms</span>
                          <button className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm transition-colors">
                            Kick
                          </button>
                          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors">
                            Ban
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {page === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Настройки</h2>
            {servers.length === 0 ? (
              <div className="bg-[#12121a] rounded-xl border border-[#1a1a2e] p-12 text-center">
                <p className="text-6xl mb-4">⚙️</p>
                <h3 className="text-xl font-semibold mb-2">Нет серверов</h3>
                <p className="text-gray-500">Создайте сервер чтобы настроить его</p>
              </div>
            ) : (
              <>
                <div className="flex gap-2 flex-wrap">
                  {servers.map(server => (
                    <button
                      key={server.id}
                      onClick={() => setSelectedServer(server)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedServer?.id === server.id
                          ? 'bg-indigo-600'
                          : 'bg-[#1a1a2e] hover:bg-[#2a2a3e]'
                      }`}
                    >
                      {server.name}
                    </button>
                  ))}
                </div>
                
                {selectedServer && (
                  <div className="bg-[#12121a] rounded-xl border border-[#1a1a2e] p-6">
                    <h3 className="text-lg font-semibold mb-6">Настройки: {selectedServer.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Название сервера</label>
                        <input
                          type="text"
                          value={selectedServer.name}
                          onChange={e => {
                            const updated = { ...selectedServer, name: e.target.value }
                            setSelectedServer(updated)
                            setServers(prev => prev.map(s => s.id === updated.id ? updated : s))
                          }}
                          className="w-full px-4 py-3 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Карта</label>
                        <input
                          type="text"
                          value={selectedServer.map}
                          onChange={e => {
                            const updated = { ...selectedServer, map: e.target.value }
                            setSelectedServer(updated)
                            setServers(prev => prev.map(s => s.id === updated.id ? updated : s))
                          }}
                          className="w-full px-4 py-3 rounded-lg"
                          placeholder="gm_flatgrass, gm_construct..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Gamemode</label>
                        <input
                          type="text"
                          value={selectedServer.gamemode}
                          onChange={e => {
                            const updated = { ...selectedServer, gamemode: e.target.value }
                            setSelectedServer(updated)
                            setServers(prev => prev.map(s => s.id === updated.id ? updated : s))
                          }}
                          className="w-full px-4 py-3 rounded-lg"
                          placeholder="sandbox, darkrp, ttt..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Tickrate</label>
                        <input
                          type="number"
                          value={selectedServer.tickrate}
                          onChange={e => {
                            const updated = { ...selectedServer, tickrate: parseInt(e.target.value) || 66 }
                            setSelectedServer(updated)
                            setServers(prev => prev.map(s => s.id === updated.id ? updated : s))
                          }}
                          className="w-full px-4 py-3 rounded-lg"
                          placeholder="33, 66, 100..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Максимум игроков</label>
                        <input
                          type="number"
                          value={selectedServer.maxPlayers}
                          onChange={e => {
                            const updated = { ...selectedServer, maxPlayers: parseInt(e.target.value) || 32 }
                            setSelectedServer(updated)
                            setServers(prev => prev.map(s => s.id === updated.id ? updated : s))
                          }}
                          className="w-full px-4 py-3 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Порт</label>
                        <input
                          type="number"
                          value={selectedServer.port}
                          onChange={e => {
                            const updated = { ...selectedServer, port: parseInt(e.target.value) || 27015 }
                            setSelectedServer(updated)
                            setServers(prev => prev.map(s => s.id === updated.id ? updated : s))
                          }}
                          className="w-full px-4 py-3 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">RCON пароль</label>
                        <input
                          type="password"
                          value={selectedServer.rconPassword}
                          onChange={e => {
                            const updated = { ...selectedServer, rconPassword: e.target.value }
                            setSelectedServer(updated)
                            setServers(prev => prev.map(s => s.id === updated.id ? updated : s))
                          }}
                          className="w-full px-4 py-3 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Пароль сервера</label>
                        <input
                          type="password"
                          value={selectedServer.svPassword}
                          onChange={e => {
                            const updated = { ...selectedServer, svPassword: e.target.value }
                            setSelectedServer(updated)
                            setServers(prev => prev.map(s => s.id === updated.id ? updated : s))
                          }}
                          className="w-full px-4 py-3 rounded-lg"
                          placeholder="Оставьте пустым если не нужен"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => addLog('success', `Настройки сервера "${selectedServer.name}" сохранены`)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={() => restartServer(selectedServer.id)}
                        className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                      >
                        Применить и перезапустить
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] rounded-2xl border border-[#1a1a2e] w-full max-w-lg">
            <div className="p-6 border-b border-[#1a1a2e] flex justify-between items-center">
              <h3 className="text-xl font-semibold">Создать сервер</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Название сервера *</label>
                <input
                  type="text"
                  value={newServer.name}
                  onChange={e => setNewServer({ ...newServer, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg"
                  placeholder="Мой GMod сервер"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Карта</label>
                  <input
                    type="text"
                    value={newServer.map}
                    onChange={e => setNewServer({ ...newServer, map: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg"
                    placeholder="gm_flatgrass"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Gamemode</label>
                  <input
                    type="text"
                    value={newServer.gamemode}
                    onChange={e => setNewServer({ ...newServer, gamemode: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg"
                    placeholder="sandbox"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Макс. игроков</label>
                  <input
                    type="number"
                    value={newServer.maxPlayers}
                    onChange={e => setNewServer({ ...newServer, maxPlayers: parseInt(e.target.value) || 32 })}
                    className="w-full px-4 py-3 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tickrate</label>
                  <input
                    type="number"
                    value={newServer.tickrate}
                    onChange={e => setNewServer({ ...newServer, tickrate: parseInt(e.target.value) || 66 })}
                    className="w-full px-4 py-3 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">RCON пароль</label>
                <input
                  type="password"
                  value={newServer.rconPassword}
                  onChange={e => setNewServer({ ...newServer, rconPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg"
                  placeholder="Пароль для удаленного управления"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Пароль сервера (опционально)</label>
                <input
                  type="password"
                  value={newServer.svPassword}
                  onChange={e => setNewServer({ ...newServer, svPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg"
                  placeholder="Для приватного сервера"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#1a1a2e] flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 bg-[#1a1a2e] hover:bg-[#2a2a3e] rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={createServer}
                disabled={!newServer.name.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
