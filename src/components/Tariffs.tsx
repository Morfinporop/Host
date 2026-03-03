import { Check, Zap, Crown, Rocket } from 'lucide-react';
import { Tariff } from '../types';

const tariffs: Tariff[] = [
  {
    id: '1',
    name: 'Starter',
    price: 199,
    slots: 16,
    ram: 2048,
    cpu: 2,
    storage: 10,
    features: [
      '16 слотов',
      '2 GB RAM',
      '2 vCPU',
      '10 GB SSD',
      'Базовая защита от DDoS',
      'Панель управления',
      'Поддержка 24/7',
    ]
  },
  {
    id: '2',
    name: 'Standard',
    price: 399,
    slots: 32,
    ram: 4096,
    cpu: 4,
    storage: 25,
    popular: true,
    features: [
      '32 слота',
      '4 GB RAM',
      '4 vCPU',
      '25 GB SSD NVMe',
      'Продвинутая защита от DDoS',
      'FastDL включен',
      'Автобекапы',
      'Приоритетная поддержка',
    ]
  },
  {
    id: '3',
    name: 'Premium',
    price: 699,
    slots: 64,
    ram: 8192,
    cpu: 6,
    storage: 50,
    features: [
      '64 слота',
      '8 GB RAM',
      '6 vCPU',
      '50 GB SSD NVMe',
      'Максимальная защита от DDoS',
      'FastDL + CDN',
      'Автобекапы каждый час',
      'VIP поддержка',
      'Бесплатный домен',
    ]
  },
  {
    id: '4',
    name: 'Enterprise',
    price: 1299,
    slots: 128,
    ram: 16384,
    cpu: 8,
    storage: 100,
    features: [
      '128 слотов',
      '16 GB RAM',
      '8 vCPU',
      '100 GB SSD NVMe',
      'Выделенный IP',
      'Полная защита от DDoS',
      'FastDL + CDN + Edge',
      'Бекапы в реальном времени',
      'Персональный менеджер',
      'SLA 99.9%',
    ]
  }
];

export default function Tariffs() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Тарифные планы</h2>
        <p className="text-gray-400 mt-2">Выберите подходящий тариф для вашего сервера</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tariffs.map((tariff) => (
          <div 
            key={tariff.id}
            className={`relative bg-gray-800/50 border rounded-2xl p-6 flex flex-col ${
              tariff.popular 
                ? 'border-orange-500 ring-2 ring-orange-500/20' 
                : 'border-gray-700'
            }`}
          >
            {tariff.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ПОПУЛЯРНЫЙ
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4 ${
                tariff.id === '1' ? 'bg-blue-500/20' :
                tariff.id === '2' ? 'bg-orange-500/20' :
                tariff.id === '3' ? 'bg-purple-500/20' :
                'bg-yellow-500/20'
              }`}>
                {tariff.id === '1' && <Zap className="w-7 h-7 text-blue-400" />}
                {tariff.id === '2' && <Rocket className="w-7 h-7 text-orange-400" />}
                {tariff.id === '3' && <Crown className="w-7 h-7 text-purple-400" />}
                {tariff.id === '4' && <Crown className="w-7 h-7 text-yellow-400" />}
              </div>
              <h3 className="text-xl font-bold text-white">{tariff.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-white">{tariff.price}</span>
                <span className="text-gray-400"> ₽/мес</span>
              </div>
            </div>

            <div className="flex-1 space-y-3 mb-6">
              {tariff.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <button className={`w-full py-3 rounded-xl font-medium transition ${
              tariff.popular
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}>
              Выбрать
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white">Нужно больше ресурсов?</h3>
            <p className="text-gray-400 mt-2">
              Свяжитесь с нами для индивидуального предложения. Мы подберем оптимальное решение под ваши задачи.
            </p>
          </div>
          <button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-xl font-bold transition whitespace-nowrap">
            Связаться с нами
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🌍</div>
          <h4 className="text-lg font-semibold text-white">Глобальная сеть</h4>
          <p className="text-sm text-gray-400 mt-2">Серверы в 12+ локациях по всему миру</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🛡️</div>
          <h4 className="text-lg font-semibold text-white">DDoS защита</h4>
          <p className="text-sm text-gray-400 mt-2">Защита от атак до 1 Tbps включена</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">⚡</div>
          <h4 className="text-lg font-semibold text-white">Моментальная активация</h4>
          <p className="text-sm text-gray-400 mt-2">Сервер готов через 60 секунд после оплаты</p>
        </div>
      </div>
    </div>
  );
}
