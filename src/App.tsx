import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, ChevronRight, ChevronLeft, Package, Palette,
  Lightbulb, Wrench, Truck, ShieldCheck, FileText, Receipt,
  Plus, Minus, Check, RotateCcw, Download, Box, Scale
} from 'lucide-react';
import {
  productTypes, materials, lightingTypes, additionalWorks,
  mountingOptions, deliveryZones, extraServices,
  type ProductType
} from './data/products';

type Step = 'product' | 'material' | 'dimensions' | 'lighting' | 'additional' | 'mounting' | 'delivery' | 'extras' | 'result';

const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'product', label: 'Изделие', icon: <Package size={16} /> },
  { id: 'material', label: 'Материал', icon: <Palette size={16} /> },
  { id: 'dimensions', label: 'Размеры', icon: <Calculator size={16} /> },
  { id: 'lighting', label: 'Подсветка', icon: <Lightbulb size={16} /> },
  { id: 'additional', label: 'Работы', icon: <Wrench size={16} /> },
  { id: 'mounting', label: 'Монтаж', icon: <FileText size={16} /> },
  { id: 'delivery', label: 'Доставка', icon: <Truck size={16} /> },
  { id: 'extras', label: 'Услуги', icon: <ShieldCheck size={16} /> },
  { id: 'result', label: 'Итог', icon: <Receipt size={16} /> },
];

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('product');
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('pvh-3');
  
  // Размеры
  const [width, setWidth] = useState<number>(200);
  const [height, setHeight] = useState<number>(80);
  const [depth, setDepth] = useState<number>(10); // глубина/толщина конструкции (см)
  const [letterCount, setLetterCount] = useState<number>(6);
  const [letterHeight, setLetterHeight] = useState<number>(40);
  const [letterDepth, setLetterDepth] = useState<number>(8); // глубина буквы (см)
  const [quantity, setQuantity] = useState<number>(1); // количество изделий
  
  // Подсветка
  const [selectedLighting, setSelectedLighting] = useState<string>('face');
  const [lightingColor, setLightingColor] = useState<string>('white');
  const [lightingMode, setLightingMode] = useState<string>('static');
  
  // Доп работы
  const [selectedAdditional, setSelectedAdditional] = useState<string[]>([]);
  
  // Монтаж
  const [selectedMounting, setSelectedMounting] = useState<string[]>(['basic']);
  const [mountingHeight, setMountingHeight] = useState<number>(3);
  const [surfaceType, setSurfaceType] = useState<string>('wall');
  const [anchorsCount, setAnchorsCount] = useState<number>(4);
  
  // Доставка
  const [selectedDelivery, setSelectedDelivery] = useState<string>('city');
  const [deliveryDistance, setDeliveryDistance] = useState<number>(15);
  const [needLift, setNeedLift] = useState<boolean>(false);
  const [liftFloor, setLiftFloor] = useState<number>(1);
  
  // Доп услуги
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const goNext = () => {
    const nextIdx = currentStepIndex + 1;
    if (nextIdx < steps.length) setCurrentStep(steps[nextIdx].id);
  };

  const goPrev = () => {
    const prevIdx = currentStepIndex - 1;
    if (prevIdx >= 0) setCurrentStep(steps[prevIdx].id);
  };

  const resetAll = () => {
    setCurrentStep('product');
    setSelectedProduct(null);
    setSelectedMaterial('pvh-3');
    setWidth(200); setHeight(80); setDepth(10);
    setLetterCount(6); setLetterHeight(40); setLetterDepth(8);
    setQuantity(1);
    setSelectedLighting('face'); setLightingColor('white'); setLightingMode('static');
    setSelectedAdditional([]);
    setSelectedMounting(['basic']); setMountingHeight(3); setSurfaceType('wall'); setAnchorsCount(4);
    setSelectedDelivery('city'); setDeliveryDistance(15); setNeedLift(false); setLiftFloor(1);
    setSelectedExtras([]);
  };

  const toggleArrayItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    if (arr.includes(item)) setter(arr.filter(i => i !== item));
    else setter([...arr, item]);
  };

  // Расчёт габаритов и веса для доставки
  const cargoParams = useMemo(() => {
    if (!selectedProduct) return { volume: 0, weight: 0, area: 0, length: 0, width: 0, height: 0 };
    
    let length = 0, w = 0, h = 0, area = 0;
    
    if (selectedProduct.hasDimensions) {
      length = width / 100; // м
      w = height / 100; // м
      h = depth / 100; // м
      area = length * w;
    } else if (selectedProduct.hasLetterHeight) {
      // Для букв: общая длина = количество × высота × 0.7 (коэффициент заполнения)
      length = letterCount * letterHeight * 0.7 / 100;
      w = letterHeight / 100;
      h = letterDepth / 100;
      area = length * w;
    } else {
      length = 0.5; w = 0.5; h = 0.1;
      area = 0.25;
    }

    // Объём с упаковкой (коэффициент 1.3)
    const volume = length * w * h * 1.3 * quantity;
    
    // Вес
    const material = materials.find(m => m.id === selectedMaterial);
    const productWeightPerSqm = selectedProduct.weightPerSqm || 10;
    const materialDensityFactor = material?.density ? material.density / 5 : 1;
    const weight = area * productWeightPerSqm * materialDensityFactor * quantity;
    
    return { volume: Math.round(volume * 1000) / 1000, weight: Math.round(weight * 10) / 10, area: Math.round(area * 100) / 100, length, width: w, height: h };
  }, [selectedProduct, selectedMaterial, width, height, depth, letterCount, letterHeight, letterDepth, quantity]);

  // Полный расчёт стоимости
  const calculation = useMemo(() => {
    if (!selectedProduct) return { total: 0, breakdown: [], materialsCost: 0, workCost: 0, mountingCost: 0, deliveryCost: 0, powerConsumption: 0 };

    const breakdown: { category: string; label: string; amount: number; detail?: string }[] = [];
    let total = 0;
    let materialsCost = 0;
    let workCost = 0;
    let mountingCost = 0;
    let deliveryCost = 0;
    let powerConsumption = 0;

    // 1. Базовая стоимость изделия
    let baseCost = 0;
    if (selectedProduct.hasDimensions) {
      const area = (width / 100) * (height / 100);
      baseCost = selectedProduct.basePricePerUnit * area * quantity;
      breakdown.push({ category: 'Изготовление', label: `${selectedProduct.name}`, amount: baseCost, detail: `${(width/100).toFixed(2)}×${(height/100).toFixed(2)} м = ${area.toFixed(2)} м² × ${formatPrice(selectedProduct.basePricePerUnit)}/м²${quantity > 1 ? ` × ${quantity} шт` : ''}` });
    } else if (selectedProduct.hasLetterHeight) {
      baseCost = selectedProduct.basePricePerUnit * letterHeight * letterCount * quantity;
      breakdown.push({ category: 'Изготовление', label: `${selectedProduct.name}`, amount: baseCost, detail: `${letterCount} букв × ${letterHeight} см × ${formatPrice(selectedProduct.basePricePerUnit)}/см${quantity > 1 ? ` × ${quantity} компл` : ''}` });
    } else {
      baseCost = selectedProduct.basePricePerUnit * quantity;
      breakdown.push({ category: 'Изготовление', label: selectedProduct.name, amount: baseCost, detail: `${formatPrice(selectedProduct.basePricePerUnit)} × ${quantity} шт` });
    }
    total += baseCost;
    materialsCost += baseCost;

    // 2. Материал (коэффициент)
    const material = materials.find(m => m.id === selectedMaterial);
    if (material && material.priceMultiplier !== 1.0) {
      const materialExtra = baseCost * (material.priceMultiplier - 1);
      breakdown.push({ category: 'Материалы', label: `${material.name}`, amount: materialExtra, detail: `Коэффициент ×${material.priceMultiplier} к базовой стоимости` });
      total += materialExtra;
      materialsCost += materialExtra;
    }

    // 3. Подсветка
    const lighting = lightingTypes.find(l => l.id === selectedLighting);
    if (lighting && lighting.pricePerUnit > 0) {
      let lightCost = 0;
      let lightDetail = '';
      if (selectedProduct.hasDimensions) {
        const area = (width / 100) * (height / 100);
        lightCost = lighting.pricePerUnit * area * quantity;
        lightDetail = `${area.toFixed(2)} м² × ${formatPrice(lighting.pricePerUnit)}/м²`;
        if (lighting.powerConsumption) powerConsumption += lighting.powerConsumption * area * quantity;
      } else if (selectedProduct.hasLetterHeight) {
        lightCost = lighting.pricePerUnit * letterCount * quantity;
        lightDetail = `${letterCount} букв × ${formatPrice(lighting.pricePerUnit)}/букву`;
        if (lighting.powerConsumption) powerConsumption += lighting.powerConsumption * (letterHeight * letterCount / 10000) * quantity;
      } else {
        lightCost = lighting.pricePerUnit * quantity;
        lightDetail = `${formatPrice(lighting.pricePerUnit)} × ${quantity}`;
      }
      
      let colorLabel = '';
      if (lightingColor === 'warm') colorLabel = ' (тёплый 3000K)';
      else if (lightingColor === 'cold') colorLabel = ' (холодный 6500K)';
      else if (lightingColor === 'neutral') colorLabel = ' (нейтральный 4500K)';
      else if (lightingColor === 'red') colorLabel = ' (красный)';
      else if (lightingColor === 'blue') colorLabel = ' (синий)';
      else if (lightingColor === 'green') colorLabel = ' (зелёный)';
      
      let modeLabel = '';
      if (lightingMode === 'dynamic') modeLabel = ' + динамический контроллер (+2500₽)';
      else if (lightingMode === 'rgb-controller') modeLabel = ' + RGB контроллер (+1800₽)';
      
      let extraLightCost = 0;
      if (lightingMode === 'dynamic') extraLightCost = 2500;
      else if (lightingMode === 'rgb-controller') extraLightCost = 1800;
      
      const totalLightCost = lightCost + extraLightCost;
      breakdown.push({ category: 'Светотехника', label: `${lighting.name}${colorLabel}`, amount: totalLightCost, detail: lightDetail + modeLabel });
      total += totalLightCost;
      materialsCost += totalLightCost;
    }

    // 4. Дополнительные работы
    selectedAdditional.forEach(addId => {
      const add = additionalWorks.find(a => a.id === addId);
      if (add) {
        let addCost = 0;
        let addDetail = '';
        switch (add.priceType) {
          case 'fixed':
            addCost = add.price * quantity;
            addDetail = `${formatPrice(add.price)}${quantity > 1 ? ` × ${quantity}` : ''}`;
            break;
          case 'per-meter': {
            const perimeter = selectedProduct.hasDimensions
              ? 2 * ((width + height) / 100)
              : (letterHeight * letterCount * 0.7) / 100;
            addCost = add.price * perimeter * quantity;
            addDetail = `${perimeter.toFixed(2)} м.п. × ${formatPrice(add.price)}/м`;
            break;
          }
          case 'per-unit':
            const units = selectedProduct.hasDimensions
              ? Math.ceil(2 * (width + height) / 20) * quantity
              : letterCount * 4 * quantity;
            addCost = add.price * units;
            addDetail = `${units} шт × ${formatPrice(add.price)}/шт`;
            break;
          case 'per-sqm': {
            const area = selectedProduct.hasDimensions
              ? (width / 100) * (height / 100)
              : (letterHeight * letterCount * 0.7 / 10000);
            addCost = add.price * area * quantity;
            addDetail = `${area.toFixed(2)} м² × ${formatPrice(add.price)}/м²`;
            break;
          }
        }
        breakdown.push({ category: 'Доп. работы', label: add.name, amount: addCost, detail: addDetail });
        total += addCost;
        workCost += addCost;
      }
    });

    // 5. Монтаж
    selectedMounting.forEach(mId => {
      const m = mountingOptions.find(o => o.id === mId);
      if (m) {
        let mCost = 0;
        let mDetail = '';
        if (m.priceType === 'fixed') {
          mCost = m.price;
          mDetail = 'фиксированная стоимость';
        } else if (m.priceType === 'percentage') {
          mCost = total * (m.price / 100);
          mDetail = `+${m.price}% от текущей суммы`;
        } else if (m.priceType === 'per-unit') {
          mCost = m.price * anchorsCount;
          mDetail = `${anchorsCount} шт × ${formatPrice(m.price)}`;
        } else if (m.priceType === 'per-kg') {
          const overWeight = Math.max(0, cargoParams.weight - 50);
          mCost = m.price * overWeight;
          mDetail = `${overWeight.toFixed(1)} кг (свыше 50кг) × ${formatPrice(m.price)}/кг`;
        }
        breakdown.push({ category: 'Монтаж', label: m.name, amount: mCost, detail: mDetail });
        total += mCost;
        mountingCost += mCost;
      }
    });

    // 6. Доставка (математический расчёт от объёма и веса)
    const zone = deliveryZones.find(d => d.id === selectedDelivery);
    if (zone && zone.id !== 'self') {
      const distanceCost = zone.pricePerKm * deliveryDistance;
      const volumeCost = zone.pricePerCbm * cargoParams.volume;
      const weightCost = zone.pricePerKg * cargoParams.weight;
      const totalDeliveryCost = zone.basePrice + distanceCost + volumeCost + weightCost;
      
      breakdown.push({ category: 'Доставка', label: `${zone.name} (база)`, amount: zone.basePrice, detail: 'Фиксированная базовая ставка' });
      breakdown.push({ category: 'Доставка', label: `Расстояние ${deliveryDistance} км`, amount: distanceCost, detail: `${deliveryDistance} км × ${formatPrice(zone.pricePerKm)}/км` });
      breakdown.push({ category: 'Доставка', label: `Объём ${cargoParams.volume} м³`, amount: volumeCost, detail: `${cargoParams.volume} м³ × ${formatPrice(zone.pricePerCbm)}/м³` });
      breakdown.push({ category: 'Доставка', label: `Вес ${cargoParams.weight} кг`, amount: weightCost, detail: `${cargoParams.weight} кг × ${formatPrice(zone.pricePerKg)}/кг` });
      
      if (needLift && liftFloor > 1) {
        const liftCost = liftFloor * 200 * Math.max(cargoParams.weight, 5);
        breakdown.push({ category: 'Доставка', label: `Подъём на ${liftFloor} этаж`, amount: liftCost, detail: `${liftFloor} эт × ${formatPrice(200)} × ${Math.max(cargoParams.weight, 5).toFixed(1)} кг` });
        total += liftCost;
        deliveryCost += totalDeliveryCost + liftCost;
      } else {
        deliveryCost += totalDeliveryCost;
      }
      
      total += totalDeliveryCost;
    }

    // 7. Дополнительные услуги
    selectedExtras.forEach(eId => {
      const e = extraServices.find(s => s.id === eId);
      if (e) {
        let eCost = 0;
        let eDetail = '';
        if (e.isPercentage && e.percentage) {
          eCost = total * (e.percentage / 100);
          eDetail = `+${e.percentage}% от суммы = ${formatPrice(eCost)}`;
        } else {
          eCost = e.price;
          eDetail = 'фиксированная стоимость';
        }
        breakdown.push({ category: 'Услуги', label: e.name, amount: eCost, detail: eDetail });
        total += eCost;
        workCost += eCost;
      }
    });

    return { total: Math.round(total), breakdown, materialsCost: Math.round(materialsCost), workCost: Math.round(workCost), mountingCost: Math.round(mountingCost), deliveryCost: Math.round(deliveryCost), powerConsumption: Math.round(powerConsumption) };
  }, [selectedProduct, selectedMaterial, width, height, depth, letterCount, letterHeight, letterDepth, quantity, selectedLighting, lightingColor, lightingMode, selectedAdditional, selectedMounting, mountingHeight, surfaceType, anchorsCount, selectedDelivery, deliveryDistance, needLift, liftFloor, selectedExtras, cargoParams]);

  const availableLighting = lightingTypes.filter(l =>
    l.applicableFor.includes('all') || (selectedProduct && l.applicableFor.includes(selectedProduct.id))
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(price)) + ' ₽';
  };

  const categoryTotals = useMemo(() => {
    const cats: Record<string, number> = {};
    calculation.breakdown.forEach(item => {
      cats[item.category] = (cats[item.category] || 0) + item.amount;
    });
    return cats;
  }, [calculation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-slate-900/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Calculator size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                РекламаКальк
              </h1>
              <p className="text-[10px] text-slate-400">Полный расчёт рекламных конструкций</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={resetAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:bg-slate-700 transition-colors">
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Сброс</span>
            </button>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => { if (idx <= currentStepIndex || step.id === 'product') setCurrentStep(step.id); }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                step.id === currentStep
                  ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/50'
                  : idx < currentStepIndex
                  ? 'bg-green-500/15 text-green-300 border border-green-500/30'
                  : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'
              }`}
            >
              {idx < currentStepIndex ? <Check size={12} /> : step.icon}
              <span className="hidden md:inline">{step.label}</span>
              {idx < steps.length - 1 && <ChevronRight size={10} className="text-slate-600 mx-0.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-5 sm:p-6"
              >
                {/* PRODUCT TYPE */}
                {currentStep === 'product' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Тип изделия</h2>
                    <p className="text-slate-400 text-sm mb-5">Выберите рекламную конструкцию для расчёта</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {productTypes.map(product => (
                        <button key={product.id} onClick={() => setSelectedProduct(product)}
                          className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.01] ${
                            selectedProduct?.id === product.id ? 'bg-indigo-500/20 border-indigo-500/50 ring-2 ring-indigo-500/30' : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                          }`}>
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{product.icon}</span>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm">{product.name}</h3>
                              <p className="text-[11px] text-slate-400 mt-0.5">{product.description}</p>
                              <p className="text-[11px] text-indigo-300 mt-1.5">от {formatPrice(product.basePricePerUnit)} {product.unit}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* MATERIAL */}
                {currentStep === 'material' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Материал основы</h2>
                    <p className="text-slate-400 text-sm mb-5">Материал влияет на вес, долговечность и стоимость</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {materials.map(mat => (
                        <button key={mat.id} onClick={() => setSelectedMaterial(mat.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            selectedMaterial === mat.id ? 'bg-indigo-500/20 border-indigo-500/50 ring-2 ring-indigo-500/30' : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                          }`}>
                          <h3 className="font-semibold text-sm">{mat.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{mat.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">×{mat.priceMultiplier}</span>
                            {mat.density && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">{mat.density} г/см³</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* DIMENSIONS */}
                {currentStep === 'dimensions' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Размеры и параметры</h2>
                    <p className="text-slate-400 text-sm mb-5">Укажите габариты — они влияют на вес и стоимость доставки</p>
                    
                    {selectedProduct?.hasDimensions && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                            <label className="block text-xs font-medium text-slate-300 mb-2">Ширина (см)</label>
                            <input type="range" min="20" max="1000" step="10" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full mb-2" />
                            <input type="number" value={width} onChange={e => setWidth(Math.max(20, Number(e.target.value)))} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-center text-sm" />
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                            <label className="block text-xs font-medium text-slate-300 mb-2">Высота (см)</label>
                            <input type="range" min="10" max="500" step="5" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full mb-2" />
                            <input type="number" value={height} onChange={e => setHeight(Math.max(10, Number(e.target.value)))} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-center text-sm" />
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                            <label className="block text-xs font-medium text-slate-300 mb-2">Глубина/толщина (см)</label>
                            <input type="range" min="3" max="50" step="1" value={depth} onChange={e => setDepth(Number(e.target.value))} className="w-full mb-2" />
                            <input type="number" value={depth} onChange={e => setDepth(Math.max(3, Number(e.target.value)))} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-center text-sm" />
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                            <label className="block text-xs font-medium text-slate-300 mb-2">Количество (шт)</label>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-600"><Minus size={14} /></button>
                              <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-center" />
                              <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-600"><Plus size={14} /></button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="p-2.5 bg-slate-700/50 rounded-lg text-center">
                            <p className="text-[10px] text-slate-400">Площадь</p>
                            <p className="text-sm font-bold">{((width/100) * (height/100)).toFixed(2)} м²</p>
                          </div>
                          <div className="p-2.5 bg-slate-700/50 rounded-lg text-center">
                            <p className="text-[10px] text-slate-400">Объём</p>
                            <p className="text-sm font-bold">{cargoParams.volume} м³</p>
                          </div>
                          <div className="p-2.5 bg-slate-700/50 rounded-lg text-center">
                            <p className="text-[10px] text-slate-400">Вес (≈)</p>
                            <p className="text-sm font-bold">{cargoParams.weight} кг</p>
                          </div>
                          <div className="p-2.5 bg-slate-700/50 rounded-lg text-center">
                            <p className="text-[10px] text-slate-400">Периметр</p>
                            <p className="text-sm font-bold">{(2 * (width + height) / 100).toFixed(2)} м</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedProduct?.hasLetterHeight && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                            <label className="block text-xs font-medium text-slate-300 mb-2">Количество символов</label>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setLetterCount(Math.max(1, letterCount - 1))} className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-600"><Minus size={14} /></button>
                              <input type="number" value={letterCount} onChange={e => setLetterCount(Math.max(1, Number(e.target.value)))} className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-center" />
                              <button onClick={() => setLetterCount(letterCount + 1)} className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-600"><Plus size={14} /></button>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                            <label className="block text-xs font-medium text-slate-300 mb-2">Высота буквы (см)</label>
                            <input type="range" min="10" max="200" step="5" value={letterHeight} onChange={e => setLetterHeight(Number(e.target.value))} className="w-full mb-2" />
                            <input type="number" value={letterHeight} onChange={e => setLetterHeight(Math.max(10, Number(e.target.value)))} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-center text-sm" />
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                            <label className="block text-xs font-medium text-slate-300 mb-2">Глубина буквы (см)</label>
                            <input type="range" min="3" max="30" step="1" value={letterDepth} onChange={e => setLetterDepth(Number(e.target.value))} className="w-full mb-2" />
                            <input type="number" value={letterDepth} onChange={e => setLetterDepth(Math.max(3, Number(e.target.value)))} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-center text-sm" />
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                            <label className="block text-xs font-medium text-slate-300 mb-2">Количество комплектов</label>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-600"><Minus size={14} /></button>
                              <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-center" />
                              <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-600"><Plus size={14} /></button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="p-2.5 bg-slate-700/50 rounded-lg text-center">
                            <p className="text-[10px] text-slate-400">Общая длина</p>
                            <p className="text-sm font-bold">{(letterCount * letterHeight * 0.7 / 100).toFixed(2)} м</p>
                          </div>
                          <div className="p-2.5 bg-slate-700/50 rounded-lg text-center">
                            <p className="text-[10px] text-slate-400">Объём</p>
                            <p className="text-sm font-bold">{cargoParams.volume} м³</p>
                          </div>
                          <div className="p-2.5 bg-slate-700/50 rounded-lg text-center">
                            <p className="text-[10px] text-slate-400">Вес (≈)</p>
                            <p className="text-sm font-bold">{cargoParams.weight} кг</p>
                          </div>
                          <div className="p-2.5 bg-slate-700/50 rounded-lg text-center">
                            <p className="text-[10px] text-slate-400">Площадь</p>
                            <p className="text-sm font-bold">{cargoParams.area} м²</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* LIGHTING */}
                {currentStep === 'lighting' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Подсветка</h2>
                    <p className="text-slate-400 text-sm mb-5">Выберите тип, цвет и режим освещения</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                      {availableLighting.map(light => (
                        <button key={light.id} onClick={() => setSelectedLighting(light.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            selectedLighting === light.id ? 'bg-indigo-500/20 border-indigo-500/50 ring-2 ring-indigo-500/30' : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                          }`}>
                          <h3 className="font-semibold text-sm">{light.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{light.description}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {light.pricePerUnit > 0 && <span className="text-[10px] text-yellow-300">+{formatPrice(light.pricePerUnit)}/ед</span>}
                            {light.powerConsumption ? <span className="text-[10px] text-blue-300">{light.powerConsumption} Вт/м²</span> : null}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Цвет подсветки */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-slate-300 mb-2">Цвет свечения</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'white', label: 'Белый', color: 'bg-white' },
                          { id: 'warm', label: 'Тёплый', color: 'bg-amber-300' },
                          { id: 'cold', label: 'Холодный', color: 'bg-blue-200' },
                          { id: 'neutral', label: 'Нейтральный', color: 'bg-gray-200' },
                          { id: 'red', label: 'Красный', color: 'bg-red-500' },
                          { id: 'blue', label: 'Синий', color: 'bg-blue-500' },
                          { id: 'green', label: 'Зелёный', color: 'bg-green-500' },
                        ].map(c => (
                          <button key={c.id} onClick={() => setLightingColor(c.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                              lightingColor === c.id ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                            }`}>
                            <span className={`w-3 h-3 rounded-full ${c.color}`}></span>
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Режим */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">Режим работы</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'static', label: 'Статичный', desc: 'Постоянное свечение' },
                          { id: 'rgb-controller', label: 'RGB контроллер', desc: '+1 800 ₽' },
                          { id: 'dynamic', label: 'Динамический', desc: '+2 500 ₽' },
                        ].map(m => (
                          <button key={m.id} onClick={() => setLightingMode(m.id)}
                            className={`px-3 py-2 rounded-lg text-xs border transition-all text-left ${
                              lightingMode === m.id ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                            }`}>
                            <span className="font-medium">{m.label}</span>
                            <span className="block text-[10px] text-slate-400">{m.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {calculation.powerConsumption > 0 && (
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-xs text-blue-300">⚡ Потребляемая мощность: <strong>≈{calculation.powerConsumption} Вт</strong></p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Рекомендуемый блок питания: {Math.ceil(calculation.powerConsumption / 100) * 100}W</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ADDITIONAL WORKS */}
                {currentStep === 'additional' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Дополнительные работы</h2>
                    <p className="text-slate-400 text-sm mb-5">Выберите необходимые работы при изготовлении</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {additionalWorks.map(work => (
                        <button key={work.id} onClick={() => toggleArrayItem(selectedAdditional, work.id, setSelectedAdditional)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            selectedAdditional.includes(work.id) ? 'bg-green-500/15 border-green-500/40 ring-1 ring-green-500/30' : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                          }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm">{work.name}</h3>
                              <p className="text-[11px] text-slate-400 mt-0.5">{work.description}</p>
                            </div>
                            {selectedAdditional.includes(work.id) && <Check size={14} className="text-green-400 shrink-0 mt-0.5" />}
                          </div>
                          <p className="text-[11px] text-amber-300 mt-1.5">
                            {work.priceType === 'fixed' && formatPrice(work.price)}
                            {work.priceType === 'per-meter' && `${formatPrice(work.price)}/м.п.`}
                            {work.priceType === 'per-unit' && `${formatPrice(work.price)}/шт`}
                            {work.priceType === 'per-sqm' && `${formatPrice(work.price)}/м²`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* MOUNTING */}
                {currentStep === 'mounting' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Монтаж</h2>
                    <p className="text-slate-400 text-sm mb-5">Параметры установки конструкции</p>
                    
                    {/* Параметры монтажа */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                      <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                        <label className="block text-xs font-medium text-slate-300 mb-2">Высота монтажа (м)</label>
                        <input type="range" min="1" max="30" step="1" value={mountingHeight} onChange={e => setMountingHeight(Number(e.target.value))} className="w-full mb-2" />
                        <input type="number" value={mountingHeight} onChange={e => setMountingHeight(Math.max(1, Number(e.target.value)))} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-center text-sm" />
                      </div>
                      <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                        <label className="block text-xs font-medium text-slate-300 mb-2">Тип поверхности</label>
                        <select value={surfaceType} onChange={e => setSurfaceType(e.target.value)} className="w-full px-2 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm">
                          <option value="wall">Стена (кирпич/бетон)</option>
                          <option value="facade">Вентилируемый фасад</option>
                          <option value="composite">АКП/композит</option>
                          <option value="roof">Крыша</option>
                          <option value="ground">Грунт/фундамент</option>
                        </select>
                      </div>
                      <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                        <label className="block text-xs font-medium text-slate-300 mb-2">Кол-во анкеров</label>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setAnchorsCount(Math.max(2, anchorsCount - 1))} className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-600"><Minus size={12} /></button>
                          <span className="flex-1 text-center text-sm font-medium">{anchorsCount} шт</span>
                          <button onClick={() => setAnchorsCount(anchorsCount + 1)} className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-600"><Plus size={12} /></button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {mountingOptions.map(opt => (
                        <button key={opt.id} onClick={() => toggleArrayItem(selectedMounting, opt.id, setSelectedMounting)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            selectedMounting.includes(opt.id) ? 'bg-green-500/15 border-green-500/40 ring-1 ring-green-500/30' : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                          }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm">{opt.name}</h3>
                              <p className="text-[11px] text-slate-400 mt-0.5">{opt.description}</p>
                            </div>
                            {selectedMounting.includes(opt.id) && <Check size={14} className="text-green-400 shrink-0 mt-0.5" />}
                          </div>
                          <p className="text-[11px] text-amber-300 mt-1.5">
                            {opt.priceType === 'fixed' && formatPrice(opt.price)}
                            {opt.priceType === 'percentage' && `+${opt.price}%`}
                            {opt.priceType === 'per-unit' && `${formatPrice(opt.price)}/шт`}
                            {opt.priceType === 'per-kg' && `${formatPrice(opt.price)}/кг`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* DELIVERY */}
                {currentStep === 'delivery' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Доставка</h2>
                    <p className="text-slate-400 text-sm mb-5">Расчёт от объёма, веса и расстояния</p>
                    
                    {/* Параметры груза */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                        <Box size={16} className="mx-auto text-indigo-400 mb-1" />
                        <p className="text-[10px] text-slate-400">Объём</p>
                        <p className="text-sm font-bold">{cargoParams.volume} м³</p>
                      </div>
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                        <Scale size={16} className="mx-auto text-amber-400 mb-1" />
                        <p className="text-[10px] text-slate-400">Вес</p>
                        <p className="text-sm font-bold">{cargoParams.weight} кг</p>
                      </div>
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                        <p className="text-[10px] text-slate-400">Габарит</p>
                        <p className="text-sm font-bold">{(width).toFixed(0)}×{(height).toFixed(0)}×{(depth).toFixed(0)} см</p>
                      </div>
                      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                        <p className="text-[10px] text-slate-400">Кол-во</p>
                        <p className="text-sm font-bold">{quantity} шт</p>
                      </div>
                    </div>

                    {/* Зона доставки */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                      {deliveryZones.map(zone => (
                        <button key={zone.id} onClick={() => setSelectedDelivery(zone.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            selectedDelivery === zone.id ? 'bg-indigo-500/20 border-indigo-500/50 ring-2 ring-indigo-500/30' : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                          }`}>
                          <h3 className="font-semibold text-sm">{zone.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{zone.description}</p>
                          {zone.id !== 'self' && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">база {formatPrice(zone.basePrice)}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">{formatPrice(zone.pricePerKm)}/км</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">{formatPrice(zone.pricePerCbm)}/м³</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">{formatPrice(zone.pricePerKg)}/кг</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Доп параметры доставки */}
                    {selectedDelivery !== 'self' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                          <label className="block text-xs font-medium text-slate-300 mb-2">Расстояние (км)</label>
                          <input type="range" min="1" max="100" step="1" value={deliveryDistance} onChange={e => setDeliveryDistance(Number(e.target.value))} className="w-full mb-2" />
                          <input type="number" value={deliveryDistance} onChange={e => setDeliveryDistance(Math.max(1, Number(e.target.value)))} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-center text-sm" />
                        </div>
                        <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-300 mb-2 cursor-pointer">
                            <input type="checkbox" checked={needLift} onChange={e => setNeedLift(e.target.checked)} className="rounded" />
                            Нужен подъём на этаж
                          </label>
                          {needLift && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-slate-400">Этаж:</span>
                              <button onClick={() => setLiftFloor(Math.max(1, liftFloor - 1))} className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-600"><Minus size={10} /></button>
                              <span className="text-sm font-medium w-8 text-center">{liftFloor}</span>
                              <button onClick={() => setLiftFloor(liftFloor + 1)} className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-600"><Plus size={10} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* EXTRAS */}
                {currentStep === 'extras' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Дополнительные услуги</h2>
                    <p className="text-slate-400 text-sm mb-5">Согласование, срочность, гарантия и сервис</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {extraServices.map(srv => (
                        <button key={srv.id} onClick={() => toggleArrayItem(selectedExtras, srv.id, setSelectedExtras)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            selectedExtras.includes(srv.id) ? 'bg-green-500/15 border-green-500/40 ring-1 ring-green-500/30' : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                          }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm">{srv.name}</h3>
                              <p className="text-[11px] text-slate-400 mt-0.5">{srv.description}</p>
                            </div>
                            {selectedExtras.includes(srv.id) && <Check size={14} className="text-green-400 shrink-0 mt-0.5" />}
                          </div>
                          <p className="text-[11px] text-amber-300 mt-1.5">
                            {srv.isPercentage ? `+${srv.percentage}% к стоимости` : formatPrice(srv.price)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* RESULT */}
                {currentStep === 'result' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Итоговый расчёт</h2>
                    <p className="text-slate-400 text-sm mb-5">Детальная смета проекта</p>
                    
                    {/* Параметры груза */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                        <p className="text-[10px] text-slate-400">Объём груза</p>
                        <p className="text-sm font-bold">{cargoParams.volume} м³</p>
                      </div>
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                        <p className="text-[10px] text-slate-400">Вес груза</p>
                        <p className="text-sm font-bold">{cargoParams.weight} кг</p>
                      </div>
                      <div className="p-2.5 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                        <p className="text-[10px] text-slate-400">Мощность</p>
                        <p className="text-sm font-bold">{calculation.powerConsumption} Вт</p>
                      </div>
                      <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                        <p className="text-[10px] text-slate-400">Площадь</p>
                        <p className="text-sm font-bold">{cargoParams.area} м²</p>
                      </div>
                    </div>

                    {/* Итоги по категориям */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                      <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                        <p className="text-[10px] text-blue-300">Материалы</p>
                        <p className="text-xs font-bold text-blue-200">{formatPrice(calculation.materialsCost)}</p>
                      </div>
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                        <p className="text-[10px] text-amber-300">Работы</p>
                        <p className="text-xs font-bold text-amber-200">{formatPrice(calculation.workCost)}</p>
                      </div>
                      <div className="p-2.5 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                        <p className="text-[10px] text-green-300">Монтаж</p>
                        <p className="text-xs font-bold text-green-200">{formatPrice(calculation.mountingCost)}</p>
                      </div>
                      <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                        <p className="text-[10px] text-purple-300">Доставка</p>
                        <p className="text-xs font-bold text-purple-200">{formatPrice(calculation.deliveryCost)}</p>
                      </div>
                    </div>

                    {/* Детализация */}
                    <div className="space-y-1">
                      {Object.entries(categoryTotals).map(([category, catTotal]) => (
                        <div key={category} className="mb-3">
                          <div className="flex justify-between items-center mb-1 px-2 py-1 bg-slate-700/30 rounded-lg">
                            <span className="text-xs font-semibold text-slate-200">{category}</span>
                            <span className="text-xs font-bold text-slate-300">{formatPrice(catTotal)}</span>
                          </div>
                          {calculation.breakdown.filter(b => b.category === category).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start py-1 px-4 ml-2 border-l-2 border-slate-700/50">
                              <div>
                                <span className="text-[11px] text-slate-300">{item.label}</span>
                                {item.detail && <p className="text-[9px] text-slate-500 mt-0.5">{item.detail}</p>}
                              </div>
                              <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap ml-2">{formatPrice(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* ИТОГО */}
                    <div className="mt-5 p-5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-slate-300">ИТОГО:</span>
                          <p className="text-[10px] text-slate-500 mt-0.5">Включая материалы, работы, монтаж и доставку</p>
                        </div>
                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                          {formatPrice(calculation.total)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2.5 bg-slate-700/50 rounded-xl text-center">
                        <p className="text-[10px] text-slate-400">Срок</p>
                        <p className="text-xs font-bold">{selectedExtras.includes('urgent') ? '1-2 дня' : '5-10 дней'}</p>
                      </div>
                      <div className="p-2.5 bg-slate-700/50 rounded-xl text-center">
                        <p className="text-[10px] text-slate-400">Гарантия</p>
                        <p className="text-xs font-bold">{selectedExtras.includes('warranty-premium') ? '5 лет' : selectedExtras.includes('warranty-ext') ? '3 года' : '1 год'}</p>
                      </div>
                      <div className="p-2.5 bg-slate-700/50 rounded-xl text-center">
                        <p className="text-[10px] text-slate-400">Потребление</p>
                        <p className="text-xs font-bold">{calculation.powerConsumption} Вт</p>
                      </div>
                      <div className="p-2.5 bg-slate-700/50 rounded-xl text-center">
                        <p className="text-[10px] text-slate-400">НДС</p>
                        <p className="text-xs font-bold">Включён</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                      <button className="flex-1 py-3 px-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2">
                        <FileText size={16} /> Отправить заявку
                      </button>
                      <button className="py-3 px-5 bg-slate-700 rounded-xl font-semibold hover:bg-slate-600 transition-colors text-sm flex items-center justify-center gap-2">
                        <Download size={16} /> Скачать PDF
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-5">
              <button onClick={goPrev} disabled={currentStepIndex === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600/50 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors text-sm">
                <ChevronLeft size={16} /> Назад
              </button>
              {currentStepIndex < steps.length - 1 ? (
                <button onClick={goNext} disabled={!selectedProduct && currentStepIndex === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity font-medium text-sm">
                  Далее <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={resetAll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 transition-opacity font-medium text-sm">
                  <RotateCcw size={16} /> Новый расчёт
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-indigo-500/20 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt size={16} className="text-indigo-400" />
                  <h3 className="text-sm font-bold">Текущая стоимость</h3>
                </div>
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  {selectedProduct ? formatPrice(calculation.total) : '— ₽'}
                </div>
                {selectedProduct && <p className="text-[10px] text-slate-500 mt-1">Ориентировочная стоимость</p>}
              </div>

              {/* Cargo info */}
              {selectedProduct && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                  <h3 className="text-xs font-bold mb-2 flex items-center gap-2">
                    <Box size={12} className="text-indigo-400" /> Параметры груза
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-1.5 bg-slate-700/30 rounded-lg">
                      <p className="text-[9px] text-slate-500">Объём</p>
                      <p className="text-[11px] font-bold">{cargoParams.volume} м³</p>
                    </div>
                    <div className="text-center p-1.5 bg-slate-700/30 rounded-lg">
                      <p className="text-[9px] text-slate-500">Вес</p>
                      <p className="text-[11px] font-bold">{cargoParams.weight} кг</p>
                    </div>
                    <div className="text-center p-1.5 bg-slate-700/30 rounded-lg">
                      <p className="text-[9px] text-slate-500">Площадь</p>
                      <p className="text-[11px] font-bold">{cargoParams.area} м²</p>
                    </div>
                    <div className="text-center p-1.5 bg-slate-700/30 rounded-lg">
                      <p className="text-[9px] text-slate-500">Мощность</p>
                      <p className="text-[11px] font-bold">{calculation.powerConsumption} Вт</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
                <h3 className="text-xs font-bold mb-2 flex items-center gap-2">
                  <Package size={12} className="text-indigo-400" /> Конфигурация
                </h3>
                {selectedProduct ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between py-1 border-b border-slate-700/50">
                      <span className="text-[10px] text-slate-400">Изделие</span>
                      <span className="text-[10px] font-medium">{selectedProduct.icon} {selectedProduct.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/50">
                      <span className="text-[10px] text-slate-400">Материал</span>
                      <span className="text-[10px] font-medium">{materials.find(m => m.id === selectedMaterial)?.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/50">
                      <span className="text-[10px] text-slate-400">Размер</span>
                      <span className="text-[10px] font-medium">
                        {selectedProduct.hasDimensions ? `${width}×${height}×${depth} см` : `${letterCount}×${letterHeight} см`}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/50">
                      <span className="text-[10px] text-slate-400">Кол-во</span>
                      <span className="text-[10px] font-medium">{quantity} шт</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/50">
                      <span className="text-[10px] text-slate-400">Подсветка</span>
                      <span className="text-[10px] font-medium">{lightingTypes.find(l => l.id === selectedLighting)?.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/50">
                      <span className="text-[10px] text-slate-400">Доп. работы</span>
                      <span className="text-[10px] font-medium">{selectedAdditional.length > 0 ? `${selectedAdditional.length} поз.` : '—'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[10px] text-slate-400">Доставка</span>
                      <span className="text-[10px] font-medium">{deliveryZones.find(d => d.id === selectedDelivery)?.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Package size={28} className="mx-auto text-slate-600 mb-1" />
                    <p className="text-[10px] text-slate-500">Выберите тип изделия</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <p className="text-[10px] text-slate-500">© 2025 РекламаКальк • Расчёт предварительный. Точная стоимость — после проверки макета.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
