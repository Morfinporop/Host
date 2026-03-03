import { useState } from 'react';
import { Download, CheckCircle, Circle, Loader2, Server, HardDrive, Package, Play } from 'lucide-react';

interface InstallStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'progress' | 'completed';
  progress?: number;
}

export default function Install() {
  const [installing, setInstalling] = useState(false);
  const [steps, setSteps] = useState<InstallStep[]>([
    { id: '1', title: 'Инициализация SteamCMD', description: 'Загрузка и настройка SteamCMD', status: 'pending' },
    { id: '2', title: 'Авторизация Steam', description: 'Подключение к серверам Steam', status: 'pending' },
    { id: '3', title: 'Загрузка Garry\'s Mod', description: 'Скачивание файлов сервера (~4.5 GB)', status: 'pending' },
    { id: '4', title: 'Установка CSS контента', description: 'Counter-Strike: Source материалы', status: 'pending' },
    { id: '5', title: 'Настройка сервера', description: 'Создание конфигурационных файлов', status: 'pending' },
    { id: '6', title: 'Запуск сервера', description: 'Первый запуск и проверка', status: 'pending' },
  ]);

  const startInstallation = () => {
    setInstalling(true);
    let currentStep = 0;
    
    const processStep = () => {
      if (currentStep >= steps.length) {
        setInstalling(false);
        return;
      }
      
      setSteps(prev => prev.map((step, i) => {
        if (i === currentStep) return { ...step, status: 'progress', progress: 0 };
        return step;
      }));

      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          setSteps(prev => prev.map((step, i) => {
            if (i === currentStep) return { ...step, status: 'completed', progress: 100 };
            return step;
          }));
          
          currentStep++;
          setTimeout(processStep, 500);
        } else {
          setSteps(prev => prev.map((step, i) => {
            if (i === currentStep) return { ...step, progress };
            return step;
          }));
        }
      }, 200);
    };
    
    processStep();
  };

  const getStepIcon = (step: InstallStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'progress':
        return <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />;
      default:
        return <Circle className="w-6 h-6 text-gray-600" />;
    }
  };

  const allCompleted = steps.every(s => s.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Установка сервера</h2>
          <p className="text-gray-400">Автоматическая установка Garry's Mod сервера</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Процесс установки</h3>
              {!installing && !allCompleted && (
                <button 
                  onClick={startInstallation}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Начать установку
                </button>
              )}
              {allCompleted && (
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Запустить сервер
                </button>
              )}
            </div>

            <div className="space-y-4">
              {steps.map((step) => (
                <div 
                  key={step.id}
                  className={`p-4 rounded-lg border transition-all ${
                    step.status === 'completed' ? 'bg-green-500/10 border-green-500/30' :
                    step.status === 'progress' ? 'bg-orange-500/10 border-orange-500/30' :
                    'bg-gray-900/50 border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {getStepIcon(step)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">{step.title}</p>
                        {step.status === 'progress' && step.progress !== undefined && (
                          <span className="text-sm text-orange-400">{Math.round(step.progress)}%</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{step.description}</p>
                      {step.status === 'progress' && step.progress !== undefined && (
                        <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                            style={{ width: `${step.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {allCompleted && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-12 h-12 text-green-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Установка завершена!</h3>
                  <p className="text-gray-400">Сервер готов к запуску. Перейдите в раздел "Серверы" для управления.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Информация</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                <Server className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Версия</p>
                  <p className="text-white font-medium">Garry's Mod</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                <HardDrive className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Требуется места</p>
                  <p className="text-white font-medium">~8 GB</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                <Package className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-sm text-gray-400">App ID</p>
                  <p className="text-white font-medium">4020</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">SteamCMD Команды</h3>
            <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
              <p className="text-gray-500"># Login</p>
              <p className="text-green-400">login anonymous</p>
              <p className="text-gray-500 mt-2"># Install GMod</p>
              <p className="text-green-400">app_update 4020 validate</p>
              <p className="text-gray-500 mt-2"># Install CSS</p>
              <p className="text-green-400">app_update 232330 validate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
