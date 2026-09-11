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
  weightPerSqm?: number; // кг на м² для расчёта доставки
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
    weightPerSqm: 8,
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
    weightPerSqm: 12,
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
    weightPerSqm: 0.4,
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
    weightPerSqm: 3,
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
    weightPerSqm: 5,
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
    weightPerSqm: 45,
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
    weightPerSqm: 25,
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
    weightPerSqm: 18,
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
    weightPerSqm: 35,
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
    weightPerSqm: 10,
  },
];

// Материалы основы
export interface Material {
  id: string;
  name: string;
  priceMultiplier: number;
  description: string;
  density?: number; // плотность для расчёта веса
}

export const materials: Material[] = [
  { id: 'pvh-3', name: 'ПВХ 3 мм', priceMultiplier: 1.0, description: 'Базовый пластик для небольших конструкций', density: 1.4 },
  { id: 'pvh-5', name: 'ПВХ 5 мм', priceMultiplier: 1.15, description: 'Усиленный пластик для средних конструкций', density: 1.4 },
  { id: 'pvh-10', name: 'ПВХ 10 мм', priceMultiplier: 1.35, description: 'Толстый пластик для крупных вывесок', density: 1.4 },
  { id: 'acrylic-3', name: 'Акрил 3 мм', priceMultiplier: 1.5, description: 'Прозрачный/молочный для световых элементов', density: 1.18 },
  { id: 'acrylic-5', name: 'Акрил 5 мм', priceMultiplier: 1.8, description: 'Усиленный акрил для лицевых панелей', density: 1.18 },
  { id: 'akp-3', name: 'АКП 3 мм', priceMultiplier: 1.6, description: 'Алюмокомпозитная плита — прочная и лёгкая', density: 5.5 },
  { id: 'akp-4', name: 'АКП 4 мм', priceMultiplier: 1.9, description: 'Усиленная алюмокомпозитная плита', density: 5.5 },
  { id: 'metal', name: 'Металл (нержавейка)', priceMultiplier: 2.8, description: 'Премиум материал для статусных вывесок', density: 7.9 },
  { id: 'aluminum', name: 'Алюминиевый профиль', priceMultiplier: 2.2, description: 'Для бортов объёмных букв', density: 2.7 },
];

// Типы подсветки (расширенный список)
export interface LightingType {
  id: string;
  name: string;
  pricePerUnit: number;
  description: string;
  applicableFor: string[];
  powerConsumption?: number; // Вт на м²
}

export const lightingTypes: LightingType[] = [
  { id: 'none', name: 'Без подсветки', pricePerUnit: 0, description: 'Несветовая конструкция', applicableFor: ['all'], powerConsumption: 0 },
  { id: 'face', name: 'Лицевая подсветка', pricePerUnit: 350, description: 'Свет через лицевую панель (акрил)', applicableFor: ['volume-letters', 'lightbox', 'neon', 'roof', 'console'], powerConsumption: 80 },
  { id: 'backlight', name: 'Контражурная', pricePerUnit: 420, description: 'Подсветка на стену/подложку', applicableFor: ['volume-letters', 'neon'], powerConsumption: 60 },
  { id: 'side', name: 'Боковая (торцевая)', pricePerUnit: 280, description: 'Свет через боковой алюминиевый профиль', applicableFor: ['volume-letters'], powerConsumption: 50 },
  { id: 'open-neon', name: 'Открытый неон', pricePerUnit: 550, description: 'Гибкий неон без корпуса', applicableFor: ['volume-letters', 'neon'], powerConsumption: 40 },
  { id: 'led-modules', name: 'LED модули SMD', pricePerUnit: 300, description: 'Светодиодные модули SMD 2835', applicableFor: ['lightbox', 'roof', 'pylon', 'streetline'], powerConsumption: 70 },
  { id: 'led-strip', name: 'LED лента', pricePerUnit: 200, description: 'Гибкая светодиодная лента', applicableFor: ['lightbox', 'console', 'sign'], powerConsumption: 45 },
  { id: 'rgb', name: 'RGB подсветка', pricePerUnit: 650, description: 'Многоцветная RGB с пультом управления', applicableFor: ['volume-letters', 'lightbox', 'neon', 'led-screen'], powerConsumption: 90 },
  { id: 'rgbw', name: 'RGBW подсветка', pricePerUnit: 750, description: 'RGB + белый канал для более чистых цветов', applicableFor: ['volume-letters', 'lightbox', 'neon'], powerConsumption: 100 },
  { id: 'dynamic', name: 'Динамическая (бегущая)', pricePerUnit: 850, description: 'Бегущие огни, эффекты, анимация', applicableFor: ['volume-letters', 'lightbox', 'neon', 'led-screen'], powerConsumption: 110 },
  { id: 'combined-face-back', name: 'Комбинированная (лицо+контражур)', pricePerUnit: 680, description: 'Одновременно лицевая и контражурная подсветка', applicableFor: ['volume-letters'], powerConsumption: 120 },
  { id: 'combined-face-side', name: 'Комбинированная (лицо+торец)', pricePerUnit: 580, description: 'Лицевая + боковая подсветка', applicableFor: ['volume-letters'], powerConsumption: 100 },
  { id: 'warm-white', name: 'Тёплый белый (3000K)', pricePerUnit: 320, description: 'Тёплый белый свет 3000K', applicableFor: ['volume-letters', 'lightbox', 'neon'], powerConsumption: 75 },
  { id: 'cold-white', name: 'Холодный белый (6500K)', pricePerUnit: 320, description: 'Холодный белый свет 6500K', applicableFor: ['volume-letters', 'lightbox', 'neon'], powerConsumption: 75 },
  { id: 'daylight', name: 'Дневной свет (4500K)', pricePerUnit: 320, description: 'Нейтральный белый 4500K', applicableFor: ['volume-letters', 'lightbox', 'neon'], powerConsumption: 75 },
  { id: 'colored', name: 'Цветная (одна)', pricePerUnit: 450, description: 'Один цвет: красный, синий, зелёный, жёлтый', applicableFor: ['volume-letters', 'lightbox', 'neon'], powerConsumption: 65 },
  { id: 'pixel', name: 'Пиксельная (адресная)', pricePerUnit: 1200, description: 'Адресные пиксели с индивидуальным управлением', applicableFor: ['volume-letters', 'led-screen'], powerConsumption: 150 },
  { id: 'laser', name: 'Лазерная проекция', pricePerUnit: 2500, description: 'Лазерный проектор логотипа на поверхность', applicableFor: ['volume-letters', 'pylon'], powerConsumption: 200 },
];

// Дополнительные работы при изготовлении
export interface AdditionalWork {
  id: string;
  name: string;
  priceType: 'fixed' | 'per-meter' | 'per-unit' | 'percentage' | 'per-sqm';
  price: number;
  description: string;
}

export const additionalWorks: AdditionalWork[] = [
  { id: 'design', name: 'Разработка дизайна', priceType: 'fixed', price: 5000, description: 'Создание макета вывески' },
  { id: 'design-3d', name: '3D-визуализация', priceType: 'fixed', price: 8000, description: '3D-модель и рендер на фасаде' },
  { id: 'film-oracal', name: 'Накатка плёнки Oracal', priceType: 'per-meter', price: 850, description: 'Аппликация цветной плёнкой Oracal 641' },
  { id: 'film-3m', name: 'Накатка плёнки 3M', priceType: 'per-meter', price: 1400, description: 'Премиум плёнка 3M с печатью' },
  { id: 'film-translucent', name: 'Транслюцентная плёнка', priceType: 'per-meter', price: 1800, description: 'Светопропускающая плёнка для лайтбоксов' },
  { id: 'printing', name: 'Широкоформатная печать', priceType: 'per-meter', price: 1200, description: 'Печать изображения на плёнке/баннере' },
  { id: 'printing-uv', name: 'UV-печать', priceType: 'per-meter', price: 2200, description: 'УФ-печать с повышенной стойкостью' },
  { id: 'putty', name: 'Шпаклёвка стен', priceType: 'per-meter', price: 650, description: 'Подготовка поверхности фасада' },
  { id: 'painting', name: 'Покраска конструкции', priceType: 'per-meter', price: 900, description: 'Порошковая или полиуретановая покраска' },
  { id: 'frame', name: 'Изготовление каркаса/рамы', priceType: 'fixed', price: 8500, description: 'Металлическая рама для конструкции' },
  { id: 'frame-complex', name: 'Сложный каркас', priceType: 'fixed', price: 18000, description: 'Каркас с фермами и растяжками' },
  { id: 'luvers', name: 'Люверсы', priceType: 'per-unit', price: 45, description: 'Установка люверсов по периметру' },
  { id: 'pockets', name: 'Карманы для баннера', priceType: 'per-meter', price: 120, description: 'Прошивка карманов для крепления' },
  { id: 'power-supply', name: 'Блок питания', priceType: 'fixed', price: 3500, description: 'Герметичный блок питания IP67' },
  { id: 'power-supply-outdoor', name: 'Блок питания уличный', priceType: 'fixed', price: 5500, description: 'Уличный блок питания IP67 200W' },
  { id: 'timer', name: 'Таймер вкл/выкл', priceType: 'fixed', price: 2800, description: 'Автоматическое управление подсветкой' },
  { id: 'photo-sensor', name: 'Фотодатчик', priceType: 'fixed', price: 3200, description: 'Авто-включение по датчику освещённости' },
  { id: 'acrylic-glue', name: 'Накатка на акрил', priceType: 'per-meter', price: 1100, description: 'Приклейка плёнки на акриловую поверхность' },
  { id: 'cnc-cutting', name: 'Фрезеровка ЧПУ', priceType: 'per-meter', price: 450, description: 'Фрезерная резка на станке ЧПУ' },
  { id: 'laser-cutting', name: 'Лазерная резка', priceType: 'per-meter', price: 650, description: 'Точная лазерная резка металла/акрила' },
  { id: 'bending', name: 'Гибка бортов', priceType: 'per-meter', price: 350, description: 'Формовка бортов на бортогибочном станке' },
  { id: 'welding', name: 'Сварочные работы', priceType: 'fixed', price: 4500, description: 'Сварка металлического каркаса' },
  { id: 'polishing', name: 'Полировка', priceType: 'per-meter', price: 280, description: 'Полировка акрила или металла' },
];

// Монтаж
export interface MountingOption {
  id: string;
  name: string;
  priceType: 'fixed' | 'per-meter-height' | 'percentage' | 'per-kg' | 'per-unit';
  price: number;
  description: string;
}

export const mountingOptions: MountingOption[] = [
  { id: 'basic', name: 'Базовый монтаж (до 3м)', priceType: 'fixed', price: 6500, description: 'Установка на высоте до 3 метров' },
  { id: 'height-3-7', name: 'Монтаж 3-7 метров', priceType: 'fixed', price: 12000, description: 'Работа на высоте с лестниц/лесов' },
  { id: 'height-7-15', name: 'Монтаж 7-15 метров', priceType: 'fixed', price: 22000, description: 'Работа с автовышки' },
  { id: 'height-15+', name: 'Монтаж выше 15м', priceType: 'fixed', price: 38000, description: 'Промышленный альпинизм / кран' },
  { id: 'autocrane', name: 'Автовышка', priceType: 'fixed', price: 8500, description: 'Аренда автовышки на день' },
  { id: 'crane', name: 'Автокран', priceType: 'fixed', price: 25000, description: 'Аренда автокрана для тяжёлых конструкций' },
  { id: 'electrician', name: 'Подключение электрики', priceType: 'fixed', price: 4500, description: 'Прокладка кабеля и подключение' },
  { id: 'electrician-complex', name: 'Сложное подключение', priceType: 'fixed', price: 9500, description: 'Прокладка с заземлением, автоматы' },
  { id: 'dismantle', name: 'Демонтаж старой вывески', priceType: 'fixed', price: 5500, description: 'Демонтаж и утилизация' },
  { id: 'night-work', name: 'Ночные работы', priceType: 'percentage', price: 40, description: 'Надбавка +40% за ночное время' },
  { id: 'scaffolding', name: 'Установка лесов', priceType: 'fixed', price: 7500, description: 'Монтаж/демонтаж строительных лесов' },
  { id: 'anchors', name: 'Химические анкеры', priceType: 'per-unit', price: 350, description: 'Крепление на химические анкеры' },
  { id: 'brackets', name: 'Монтажные кронштейны', priceType: 'per-unit', price: 450, description: 'Изготовление и установка кронштейнов' },
  { id: 'weight-mount', name: 'Монтаж тяжёлой конструкции', priceType: 'per-kg', price: 85, description: 'Надбавка за вес свыше 50 кг' },
];

// Доставка (математический расчёт от объёма и веса)
export interface DeliveryZone {
  id: string;
  name: string;
  basePrice: number;
  pricePerKm: number;
  pricePerCbm: number; // цена за м³
  pricePerKg: number; // цена за кг
  maxDistance: number; // км
  description: string;
}

export const deliveryZones: DeliveryZone[] = [
  { id: 'self', name: 'Самовывоз', basePrice: 0, pricePerKm: 0, pricePerCbm: 0, pricePerKg: 0, maxDistance: 0, description: 'Забираете сами с производства' },
  { id: 'city', name: 'По городу', basePrice: 1500, pricePerKm: 25, pricePerCbm: 800, pricePerKg: 15, maxDistance: 30, description: 'Доставка в пределах города (до 30 км)' },
  { id: 'suburb', name: 'Пригород (30-100 км)', basePrice: 3000, pricePerKm: 35, pricePerCbm: 1000, pricePerKg: 20, maxDistance: 100, description: 'Доставка в пригород' },
  { id: 'region', name: 'Регион (100-500 км)', basePrice: 8000, pricePerKm: 45, pricePerCbm: 1500, pricePerKg: 30, maxDistance: 500, description: 'Доставка в другой регион' },
  { id: 'far', name: 'Межгород (500+ км)', basePrice: 20000, pricePerKm: 55, pricePerCbm: 2500, pricePerKg: 45, maxDistance: 3000, description: 'Доставка на дальнее расстояние' },
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
  { id: 'approval-complex', name: 'Сложное согласование', price: 55000, description: 'Согласование в историческом центре' },
  { id: 'urgent', name: 'Срочное изготовление', price: 0, description: 'Изготовление за 1-2 дня (+50% к стоимости)', isPercentage: true, percentage: 50 },
  { id: 'warranty-ext', name: 'Расширенная гарантия', price: 8000, description: 'Гарантия 3 года вместо 1 года' },
  { id: 'warranty-premium', name: 'Премиум гарантия', price: 15000, description: 'Гарантия 5 лет с обслуживанием' },
  { id: 'photo-report', name: 'Фотоотчёт монтажа', price: 2500, description: 'Фото и видео процесса монтажа' },
  { id: 'video-report', name: 'Видеоотчёт', price: 5000, description: 'Профессиональное видео монтажа' },
  { id: 'measuring', name: 'Выезд замерщика', price: 3000, description: 'Замер на объекте с рекомендациями' },
  { id: 'measuring-3d', name: '3D-замер', price: 8000, description: '3D-сканирование фасада' },
  { id: 'maintenance', name: 'Годовое обслуживание', price: 12000, description: 'Обслуживание и мелкий ремонт 1 год' },
];
