// Типы рекламных конструкций
export interface ProductType {
  id: string;
  name: string;
  icon: string;
  description: string;
  basePricePerUnit: number;
  unit: string;
  hasDimensions: boolean;
  hasLetterCount: boolean;
  hasLetterHeight: boolean;
}

export const productTypes: ProductType[] = [
  {
    id: 'volume-letters',
    name: 'Объёмные буквы',
    icon: '🔤',
    description: 'Световые объёмные буквы с лицевой, контурной или открытой подсветкой',
    basePricePerUnit: 850,
    unit: 'за см высоты',
    hasDimensions: false,
    hasLetterCount: true,
    hasLetterHeight: true,
  },
  {
    id: 'lightbox',
    name: 'Световой короб',
    icon: '💡',
    description: 'Лайтбокс с ПВХ/алюминиевым бортом, лицевой панелью и LED-подсветкой',
    basePricePerUnit: 4500,
    unit: 'за м²',
    hasDimensions: true,
    hasLetterCount: false,
    hasLetterHeight: false,
  },
  {
    id: 'banner',
    name: 'Баннер / Растяжка',
    icon: '🏴',
    description: 'Широкоформатная печать на баннерной ткани с обработкой края',
    basePricePerUnit: 650,
    unit: 'за м²',
    hasDimensions: true,
    hasLetterCount: false,
    hasLetterHeight: false,
  },
  {
    id: 'neon',
    name: 'Неоновая вывеска',
    icon: '✨',
    description: 'Вывеска из гибкого неона с подсветкой',
    basePricePerUnit: 1200,
    unit: 'за см длины',
    hasDimensions: false,
    hasLetterCount: true,
    hasLetterHeight: true,
  },
  {
    id: 'sign',
    name: 'Табличка',
    icon: '🪧',
    description: 'Информационная, адресная или офисная табличка',
    basePricePerUnit: 3500,
    unit: 'за м²',
    hasDimensions: true,
    hasLetterCount: false,
    hasLetterHeight: false,
  },
  {
    id: 'pylon',
    name: 'Пилон / Стела',
    icon: '🗼',
    description: 'Рекламный пилон или стела для установки на территории',
    basePricePerUnit: 45000,
    unit: 'за шт',
    hasDimensions: true,
    hasLetterCount: false,
    hasLetterHeight: false,
  },
  {
    id: 'roof',
    name: 'Крышная установка',
    icon: '🏢',
    description: 'Рекламная конструкция для установки на крыше здания',
    basePricePerUnit: 12000,
    unit: 'за м²',
    hasDimensions: true,
    hasLetterCount: false,
    hasLetterHeight: false,
  },
  {
    id: 'streetline',
    name: 'Стритлайн',
    icon: '🚶',
    description: 'Информационная конструкция вдоль дороги',
    basePricePerUnit: 8500,
    unit: 'за м²',
    hasDimensions: true,
    hasLetterCount: false,
    hasLetterHeight: false,
  },
  {
    id: 'led-screen',
    name: 'LED-экран',
    icon: '📺',
    description: 'Светодиодный уличный экран для динамической рекламы',
    basePricePerUnit: 85000,
    unit: 'за м²',
    hasDimensions: true,
    hasLetterCount: false,
    hasLetterHeight: false,
  },
  {
    id: 'console',
    name: 'Панель-кронштейн',
    icon: '📐',
    description: 'Консольная вывеска перпендикулярно фасаду',
    basePricePerUnit: 5500,
    unit: 'за м²',
    hasDimensions: true,
    hasLetterCount: false,
    hasLetterHeight: false,
  },
];

// Материалы основы
export interface Material {
  id: string;
  name: string;
  priceMultiplier: number;
  description: string;
}

export const materials: Material[] = [
  { id: 'pvh-3', name: 'ПВХ 3 мм', priceMultiplier: 1.0, description: 'Базовый пластик для небольших конструкций' },
  { id: 'pvh-5', name: 'ПВХ 5 мм', priceMultiplier: 1.15, description: 'Усиленный пластик для средних конструкций' },
  { id: 'pvh-10', name: 'ПВХ 10 мм', priceMultiplier: 1.35, description: 'Толстый пластик для крупных вывесок' },
  { id: 'acrylic-3', name: 'Акрил 3 мм', priceMultiplier: 1.5, description: 'Прозрачный/молочный для световых элементов' },
  { id: 'acrylic-5', name: 'Акрил 5 мм', priceMultiplier: 1.8, description: 'Усиленный акрил для лицевых панелей' },
  { id: 'akp-3', name: 'АКП 3 мм', priceMultiplier: 1.6, description: 'Алюмокомпозитная плита — прочная и лёгкая' },
  { id: 'akp-4', name: 'АКП 4 мм', priceMultiplier: 1.9, description: 'Усиленная алюмокомпозитная плита' },
  { id: 'metal', name: 'Металл (нержавейка)', priceMultiplier: 2.8, description: 'Премиум материал для статусных вывесок' },
  { id: 'aluminum', name: 'Алюминиевый профиль', priceMultiplier: 2.2, description: 'Для бортов объёмных букв' },
];

// Типы подсветки
export interface LightingType {
  id: string;
  name: string;
  pricePerUnit: number;
  description: string;
  applicableFor: string[];
}

export const lightingTypes: LightingType[] = [
  { id: 'none', name: 'Без подсветки', pricePerUnit: 0, description: 'Несветовая конструкция', applicableFor: ['all'] },
  { id: 'face', name: 'Лицевая подсветка', pricePerUnit: 350, description: 'Свет через лицевую панель (акрил)', applicableFor: ['volume-letters', 'lightbox', 'neon', 'roof', 'console'] },
  { id: 'backlight', name: 'Контражурная', pricePerUnit: 420, description: 'Подсветка на стену/подложку', applicableFor: ['volume-letters', 'neon'] },
  { id: 'side', name: 'Боковая подсветка', pricePerUnit: 280, description: 'Свет через боковой профиль', applicableFor: ['volume-letters'] },
  { id: 'open-neon', name: 'Открытый неон', pricePerUnit: 550, description: 'Гибкий неон без корпуса', applicableFor: ['volume-letters', 'neon'] },
  { id: 'led-modules', name: 'LED модули', pricePerUnit: 300, description: 'Светодиодные модули SMD 2835', applicableFor: ['lightbox', 'roof', 'pylon', 'streetline'] },
  { id: 'led-strip', name: 'LED лента', pricePerUnit: 200, description: 'Гибкая светодиодная лента', applicableFor: ['lightbox', 'console', 'sign'] },
];

// Дополнительные работы при изготовлении
export interface AdditionalWork {
  id: string;
  name: string;
  priceType: 'fixed' | 'per-meter' | 'per-unit' | 'percentage';
  price: number;
  description: string;
}

export const additionalWorks: AdditionalWork[] = [
  { id: 'design', name: 'Разработка дизайна', priceType: 'fixed', price: 5000, description: 'Создание макета вывески' },
  { id: 'film-oracal', name: 'Накатка плёнки Oracal', priceType: 'per-meter', price: 850, description: 'Аппликация цветной плёнкой Oracal 641' },
  { id: 'film-3m', name: 'Накатка плёнки 3M', priceType: 'per-meter', price: 1400, description: 'Премиум плёнка 3M с печатью' },
  { id: 'printing', name: 'Широкоформатная печать', priceType: 'per-meter', price: 1200, description: 'Печать изображения на плёнке/баннере' },
  { id: 'putty', name: 'Шпаклёвка стен', priceType: 'per-meter', price: 650, description: 'Подготовка поверхности фасада' },
  { id: 'painting', name: 'Покраска конструкции', priceType: 'per-meter', price: 900, description: 'Порошковая или полиуретановая покраска' },
  { id: 'frame', name: 'Изготовление каркаса/рамы', priceType: 'fixed', price: 8500, description: 'Металлическая рама для конструкции' },
  { id: 'luvers', name: 'Люверсы', priceType: 'per-unit', price: 45, description: 'Установка люверсов по периметру' },
  { id: 'pockets', name: 'Карманы для баннера', priceType: 'per-meter', price: 120, description: 'Прошивка карманов для крепления' },
  { id: 'power-supply', name: 'Блок питания', priceType: 'fixed', price: 3500, description: 'Герметичный блок питания IP67' },
  { id: 'timer', name: 'Таймер вкл/выкл', priceType: 'fixed', price: 2800, description: 'Автоматическое управление подсветкой' },
  { id: 'acrylic-glue', name: 'Накатка на акрил', priceType: 'per-meter', price: 1100, description: 'Приклейка плёнки на акриловую поверхность' },
];

// Монтаж
export interface MountingOption {
  id: string;
  name: string;
  priceType: 'fixed' | 'per-meter-height' | 'percentage';
  price: number;
  description: string;
}

export const mountingOptions: MountingOption[] = [
  { id: 'basic', name: 'Базовый монтаж (до 3м)', priceType: 'fixed', price: 6500, description: 'Установка на высоте до 3 метров' },
  { id: 'height-3-7', name: 'Монтаж 3-7 метров', priceType: 'fixed', price: 12000, description: 'Работа на высоте с лестниц/лесов' },
  { id: 'height-7-15', name: 'Монтаж 7-15 метров', priceType: 'fixed', price: 22000, description: 'Работа с автовышки' },
  { id: 'height-15+', name: 'Монтаж выше 15м', priceType: 'fixed', price: 38000, description: 'Промышленный альпинизм / кран' },
  { id: 'autocrane', name: 'Автовышка', priceType: 'fixed', price: 8500, description: 'Аренда автовышки на день' },
  { id: 'electrician', name: 'Подключение электрики', priceType: 'fixed', price: 4500, description: 'Прокладка кабеля и подключение' },
  { id: 'dismantle', name: 'Демонтаж старой вывески', priceType: 'fixed', price: 5500, description: 'Демонтаж и утилизация' },
  { id: 'night-work', name: 'Ночные работы', priceType: 'percentage', price: 40, description: 'Надбавка +40% за ночное время' },
  { id: 'scaffolding', name: 'Установка лесов', priceType: 'fixed', price: 7500, description: 'Монтаж/демонтаж строительных лесов' },
];

// Доставка
export interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

export const deliveryOptions: DeliveryOption[] = [
  { id: 'self', name: 'Самовывоз', price: 0, description: 'Забираете сами с производства' },
  { id: 'city', name: 'Доставка по городу', price: 3500, description: 'Доставка в пределах города' },
  { id: 'suburb', name: 'Доставка до 30 км', price: 6500, description: 'Доставка в пригород' },
  { id: 'far', name: 'Доставка до 100 км', price: 12000, description: 'Доставка на дальнее расстояние' },
  { id: 'region', name: 'Межгород / регион', price: 25000, description: 'Доставка в другой город/регион' },
];

// Согласование и прочее
export interface ExtraService {
  id: string;
  name: string;
  price: number;
  description: string;
  isPercentage?: boolean;
  percentage?: number;
}

export const extraServices: ExtraService[] = [
  { id: 'approval', name: 'Согласование вывески', price: 30000, description: 'Получение разрешения на размещение' },
  { id: 'urgent', name: 'Срочное изготовление', price: 0, description: 'Изготовление за 1-2 дня (+50% к стоимости)', isPercentage: true, percentage: 50 },
  { id: 'warranty-ext', name: 'Расширенная гарантия', price: 8000, description: 'Гарантия 3 года вместо 1 года' },
  { id: 'photo-report', name: 'Фотоотчёт монтажа', price: 2500, description: 'Фото и видео процесса монтажа' },
  { id: 'measuring', name: 'Выезд замерщика', price: 3000, description: 'Замер на объекте с рекомендациями' },
];
