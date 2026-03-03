import { Server } from '../App';

interface Props {
  server: Server | null;
}

export function Players({ server }: Props) {
  if (!server) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center h-full">
        <div className="text-7xl mb-6">👥</div>
        <h2 className="text-2xl font-bold text-white mb-3">Игроки</h2>
        <p className="text-zinc-500">Выберите сервер для просмотра игроков</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Игроки</h1>
        <p className="text-zinc-500 text-lg">{server.name}</p>
      </div>

      <div className="card-static overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Онлайн игроки</h2>
            <p className="text-zinc-500 text-sm mt-1">Список подключенных игроков</p>
          </div>
          <div className="badge badge-info">0 / {server.maxPlayers}</div>
        </div>

        {!server.running ? (
          <div className="p-16 text-center">
            <div className="text-6xl mb-4">🔴</div>
            <h3 className="text-xl font-bold text-white mb-2">Сервер остановлен</h3>
            <p className="text-zinc-500">Запустите сервер для просмотра игроков</p>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-white mb-2">Нет игроков</h3>
            <p className="text-zinc-500">Когда игроки подключатся, они появятся здесь</p>
          </div>
        )}
      </div>

      <div className="mt-6 card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Быстрые команды</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="btn-secondary text-sm">
            📢 Объявление всем
          </button>
          <button className="btn-secondary text-sm">
            🔄 Сменить карту
          </button>
          <button className="btn-secondary text-sm">
            🚪 Кикнуть всех
          </button>
          <button className="btn-secondary text-sm">
            🔒 Закрыть сервер
          </button>
        </div>
      </div>
    </div>
  );
}
