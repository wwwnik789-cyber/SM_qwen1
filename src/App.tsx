import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, ChevronRight, ChevronLeft, Package, Palette,
  Lightbulb, Wrench, Truck, ShieldCheck, FileText, Receipt,
  Plus, Minus, Check, RotateCcw, Download
} from 'lucide-react';
import {
  productTypes, materials, lightingTypes, additionalWorks,
  mountingOptions, deliveryOptions, extraServices,
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
  const [width, setWidth] = useState<number>(200);
  const [height, setHeight] = useState<number>(80);
  const [letterCount, setLetterCount] = useState<number>(6);
  const [letterHeight, setLetterHeight] = useState<number>(40);
  const [selectedLighting, setSelectedLighting] = useState<string>('face');
  const [selectedAdditional, setSelectedAdditional] = useState<string[]>([]);
  const [selectedMounting, setSelectedMounting] = useState<string[]>(['basic']);
  const [selectedDelivery, setSelectedDelivery] = useState<string>('city');
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
    setWidth(200);
    setHeight(80);
    setLetterCount(6);
    setLetterHeight(40);
    setSelectedLighting('face');
    setSelectedAdditional([]);
    setSelectedMounting(['basic']);
    setSelectedDelivery('city');
    setSelectedExtras([]);
  };

  const toggleArrayItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter(i => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  // Расчёт стоимости
  const calculation = useMemo(() => {
    if (!selectedProduct) return { total: 0, breakdown: [], materialsCost: 0, workCost: 0, mountingCost: 0, deliveryCost: 0 };

    const breakdown: { category: string; label: string; amount: number }[] = [];
    let total = 0;
    let materialsCost = 0;
    let workCost = 0;
    let mountingCost = 0;
    let deliveryCost = 0;

    // Базовая стоимость изделия
    let baseCost = 0;
    if (selectedProduct.hasDimensions) {
      const area = (width / 100) * (height / 100);
      baseCost = selectedProduct.basePricePerUnit * area;
      breakdown.push({ category: 'Изготовление', label: `${selectedProduct.name} (${(width/100).toFixed(1)}×${(height/100).toFixed(1)} м = ${area.toFixed(2)} м²)`, amount: baseCost });
    } else if (selectedProduct.hasLetterHeight) {
      baseCost = selectedProduct.basePricePerUnit * letterHeight * letterCount;
      breakdown.push({ category: 'Изготовление', label: `${selectedProduct.name} (${letterCount} шт × ${letterHeight} см)`, amount: baseCost });
    } else {
      baseCost = selectedProduct.basePricePerUnit;
      breakdown.push({ category: 'Изготовление', label: selectedProduct.name, amount: baseCost });
    }
    total += baseCost;
    materialsCost += baseCost;

    // Материал
    const material = materials.find(m => m.id === selectedMaterial);
    if (material && material.priceMultiplier !== 1.0) {
      const materialExtra = baseCost * (material.priceMultiplier - 1);
      breakdown.push({ category: 'Материалы', label: `${material.name} (×${material.priceMultiplier})`, amount: materialExtra });
      total += materialExtra;
      materialsCost += materialExtra;
    }

    // Подсветка
    const lighting = lightingTypes.find(l => l.id === selectedLighting);
    if (lighting && lighting.pricePerUnit > 0) {
      let lightCost = 0;
      if (selectedProduct.hasDimensions) {
        const area = (width / 100) * (height / 100);
        lightCost = lighting.pricePerUnit * area;
      } else if (selectedProduct.hasLetterHeight) {
        lightCost = lighting.pricePerUnit * letterCount;
      } else {
        lightCost = lighting.pricePerUnit;
      }
      breakdown.push({ category: 'Светотехника', label: lighting.name, amount: lightCost });
      total += lightCost;
      materialsCost += lightCost;
    }

    // Дополнительные работы
    selectedAdditional.forEach(addId => {
      const add = additionalWorks.find(a => a.id === addId);
      if (add) {
        let addCost = 0;
        switch (add.priceType) {
          case 'fixed':
            addCost = add.price;
            break;
          case 'per-meter': {
            const perimeter = selectedProduct.hasDimensions
              ? 2 * ((width + height) / 100)
              : (letterHeight * letterCount) / 100;
            addCost = add.price * Math.max(perimeter, 1);
            break;
          }
          case 'per-unit':
            addCost = add.price * (selectedProduct.hasDimensions
              ? Math.ceil(2 * (width + height) / 20)
              : letterCount * 4);
            break;
        }
        breakdown.push({ category: 'Доп. работы', label: add.name, amount: addCost });
        total += addCost;
        workCost += addCost;
      }
    });

    // Монтаж
    selectedMounting.forEach(mId => {
      const m = mountingOptions.find(o => o.id === mId);
      if (m) {
        let mCost = 0;
        if (m.priceType === 'fixed') {
          mCost = m.price;
        } else if (m.priceType === 'percentage') {
          mCost = total * (m.price / 100);
        }
        breakdown.push({ category: 'Монтаж', label: m.name, amount: mCost });
        total += mCost;
        mountingCost += mCost;
      }
    });

    // Доставка
    const delivery = deliveryOptions.find(d => d.id === selectedDelivery);
    if (delivery && delivery.price > 0) {
      breakdown.push({ category: 'Доставка', label: delivery.name, amount: delivery.price });
      total += delivery.price;
      deliveryCost += delivery.price;
    }

    // Дополнительные услуги
    selectedExtras.forEach(eId => {
      const e = extraServices.find(s => s.id === eId);
      if (e) {
        let eCost = 0;
        if (e.isPercentage && e.percentage) {
          eCost = total * (e.percentage / 100);
        } else {
          eCost = e.price;
        }
        breakdown.push({ category: 'Услуги', label: e.name, amount: eCost });
        total += eCost;
        workCost += eCost;
      }
    });

    return { total: Math.round(total), breakdown, materialsCost: Math.round(materialsCost), workCost: Math.round(workCost), mountingCost: Math.round(mountingCost), deliveryCost: Math.round(deliveryCost) };
  }, [selectedProduct, selectedMaterial, width, height, letterCount, letterHeight, selectedLighting, selectedAdditional, selectedMounting, selectedDelivery, selectedExtras]);

  const availableLighting = lightingTypes.filter(l =>
    l.applicableFor.includes('all') || (selectedProduct && l.applicableFor.includes(selectedProduct.id))
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
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
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Сброс</span>
            </button>
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-medium border border-indigo-500/30">
              v2.0
            </span>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => {
                if (idx <= currentStepIndex || step.id === 'product') {
                  setCurrentStep(step.id);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                step.id === currentStep
                  ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/50 shadow-sm shadow-indigo-500/20'
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
          {/* Calculator Area */}
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
                {/* Step: Product Type */}
                {currentStep === 'product' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Тип изделия</h2>
                    <p className="text-slate-400 text-sm mb-5">Выберите рекламную конструкцию для расчёта</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {productTypes.map(product => (
                        <button
                          key={product.id}
                          onClick={() => setSelectedProduct(product)}
                          className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
                            selectedProduct?.id === product.id
                              ? 'bg-indigo-500/20 border-indigo-500/50 ring-2 ring-indigo-500/30'
                              : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{product.icon}</span>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm">{product.name}</h3>
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{product.description}</p>
                              <p className="text-[11px] text-indigo-300 mt-1.5">от {formatPrice(product.basePricePerUnit)} {product.unit}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step: Material */}
                {currentStep === 'material' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Материал основы</h2>
                    <p className="text-slate-400 text-sm mb-5">Материал определяет долговечность и внешний вид</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {materials.map(mat => (
                        <button
                          key={mat.id}
                          onClick={() => setSelectedMaterial(mat.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            selectedMaterial === mat.id
                              ? 'bg-indigo-500/20 border-indigo-500/50 ring-2 ring-indigo-500/30'
                              : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                          }`}
                        >
                          <h3 className="font-semibold text-sm">{mat.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{mat.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">×{mat.priceMultiplier}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step: Dimensions */}
                {currentStep === 'dimensions' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Размеры</h2>
                    <p className="text-slate-400 text-sm mb-5">Укажите габариты конструкции</p>
                    
                    {selectedProduct?.hasDimensions && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                            <label className="block text-xs font-medium text-slate-300 mb-3">Ширина (см)</label>
                            <input
                              type="range"
                              min="20"
                              max="1000"
                              step="10"
                              value={width}
                              onChange={e => setWidth(Number(e.target.value))}
                              className="w-full mb-2"
                            />
                            <div className="flex items-center justify-between">
                              <input
                                type="number"
                                value={width}
                                onChange={e => setWidth(Math.max(20, Number(e.target.value)))}
                                className="w-20 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-center text-sm"
                              />
                              <span className="text-xs text-slate-400">= {(width/100).toFixed(2)} м</span>
                            </div>
                          </div>
                          <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                            <label className="block text-xs font-medium text-slate-300 mb-3">Высота (см)</label>
                            <input
                              type="range"
                              min="10"
                              max="500"
                              step="5"
                              value={height}
                              onChange={e => setHeight(Number(e.target.value))}
                              className="w-full mb-2"
                            />
                            <div className="flex items-center justify-between">
                              <input
                                type="number"
                                value={height}
                                onChange={e => setHeight(Math.max(10, Number(e.target.value)))}
                                className="w-20 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-center text-sm"
                              />
                              <span className="text-xs text-slate-400">= {(height/100).toFixed(2)} м</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Visual Preview */}
                        <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                          <p className="text-xs text-slate-400 mb-3">Превью пропорций:</p>
                          <div className="flex items-center justify-center h-32">
                            <div 
                              className="border-2 border-indigo-400/50 bg-indigo-500/10 rounded-lg flex items-center justify-center transition-all duration-300"
                              style={{
                                width: `${Math.min(Math.max(width / 10, 30), 200)}px`,
                                height: `${Math.min(Math.max(height / 10, 20), 120)}px`,
                              }}
                            >
                              <span className="text-[10px] text-indigo-300">{width}×{height} см</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                            <p className="text-[10px] text-slate-400">Площадь</p>
                            <p className="text-sm font-bold">{((width/100) * (height/100)).toFixed(2)} м²</p>
                          </div>
                          <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                            <p className="text-[10px] text-slate-400">Периметр</p>
                            <p className="text-sm font-bold">{(2 * (width + height) / 100).toFixed(2)} м</p>
                          </div>
                          <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                            <p className="text-[10px] text-slate-400">Диагональ</p>
                            <p className="text-sm font-bold">{(Math.sqrt(width*width + height*height) / 100).toFixed(2)} м</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedProduct?.hasLetterHeight && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                            <label className="block text-xs font-medium text-slate-300 mb-3">Количество символов</label>
                            <div className="flex items-center gap-3">
                              <button onClick={() => setLetterCount(Math.max(1, letterCount - 1))} className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-600 transition-colors">
                                <Minus size={14} />
                              </button>
                              <input
                                type="number"
                                value={letterCount}
                                onChange={e => setLetterCount(Math.max(1, Number(e.target.value)))}
                                className="w-16 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-center"
                              />
                              <button onClick={() => setLetterCount(letterCount + 1)} className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-600 transition-colors">
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                            <label className="block text-xs font-medium text-slate-300 mb-3">Высота буквы (см)</label>
                            <input
                              type="range"
                              min="10"
                              max="200"
                              step="5"
                              value={letterHeight}
                              onChange={e => setLetterHeight(Number(e.target.value))}
                              className="w-full mb-2"
                            />
                            <div className="flex items-center justify-between">
                              <input
                                type="number"
                                value={letterHeight}
                                onChange={e => setLetterHeight(Math.max(10, Number(e.target.value)))}
                                className="w-16 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-center text-sm"
                              />
                              <span className="text-xs text-slate-400">= {(letterHeight/100).toFixed(2)} м</span>
                            </div>
                          </div>
                        </div>

                        {/* Visual Preview */}
                        <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                          <p className="text-xs text-slate-400 mb-3">Превью букв:</p>
                          <div className="flex items-end justify-center gap-1 h-24">
                            {Array.from({ length: Math.min(letterCount, 10) }).map((_, i) => (
                              <div
                                key={i}
                                className="bg-indigo-500/20 border border-indigo-400/40 rounded flex items-center justify-center transition-all"
                                style={{
                                  width: `${Math.min(Math.max(letterHeight * 0.7, 20), 50)}px`,
                                  height: `${Math.min(Math.max(letterHeight, 25), 90)}px`,
                                }}
                              >
                                <span className="text-[9px] text-indigo-300">A</span>
                              </div>
                            ))}
                            {letterCount > 10 && <span className="text-xs text-slate-500 ml-1">+{letterCount - 10}</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step: Lighting */}
                {currentStep === 'lighting' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Подсветка</h2>
                    <p className="text-slate-400 text-sm mb-5">Выберите тип освещения конструкции</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {availableLighting.map(light => (
                        <button
                          key={light.id}
                          onClick={() => setSelectedLighting(light.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            selectedLighting === light.id
                              ? 'bg-indigo-500/20 border-indigo-500/50 ring-2 ring-indigo-500/30'
                              : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                          }`}
                        >
                          <h3 className="font-semibold text-sm">{light.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{light.description}</p>
                          {light.pricePerUnit > 0 && (
                            <p className="text-[11px] text-yellow-300 mt-1.5">+{formatPrice(light.pricePerUnit)} / ед.</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step: Additional Works */}
                {currentStep === 'additional' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Дополнительные работы</h2>
                    <p className="text-slate-400 text-sm mb-5">Выберите необходимые работы (можно несколько)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {additionalWorks.map(work => (
                        <button
                          key={work.id}
                          onClick={() => toggleArrayItem(selectedAdditional, work.id, setSelectedAdditional)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            selectedAdditional.includes(work.id)
                              ? 'bg-green-500/15 border-green-500/40 ring-1 ring-green-500/30'
                              : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm">{work.name}</h3>
                              <p className="text-[11px] text-slate-400 mt-0.5">{work.description}</p>
                            </div>
                            {selectedAdditional.includes(work.id) && (
                              <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
                            )}
                          </div>
                          <p className="text-[11px] text-amber-300 mt-1.5">
                            {work.priceType === 'fixed' && formatPrice(work.price)}
                            {work.priceType === 'per-meter' && `${formatPrice(work.price)}/м.п.`}
                            {work.priceType === 'per-unit' && `${formatPrice(work.price)}/шт`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step: Mounting */}
                {currentStep === 'mounting' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Монтаж</h2>
                    <p className="text-slate-400 text-sm mb-5">Параметры установки конструкции</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {mountingOptions.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => toggleArrayItem(selectedMounting, opt.id, setSelectedMounting)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            selectedMounting.includes(opt.id)
                              ? 'bg-green-500/15 border-green-500/40 ring-1 ring-green-500/30'
                              : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm">{opt.name}</h3>
                              <p className="text-[11px] text-slate-400 mt-0.5">{opt.description}</p>
                            </div>
                            {selectedMounting.includes(opt.id) && (
                              <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
                            )}
                          </div>
                          <p className="text-[11px] text-amber-300 mt-1.5">
                            {opt.priceType === 'fixed' && formatPrice(opt.price)}
                            {opt.priceType === 'percentage' && `+${opt.price}% к стоимости`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step: Delivery */}
                {currentStep === 'delivery' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Доставка</h2>
                    <p className="text-slate-400 text-sm mb-5">Способ доставки готовой конструкции</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {deliveryOptions.map(del => (
                        <button
                          key={del.id}
                          onClick={() => setSelectedDelivery(del.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            selectedDelivery === del.id
                              ? 'bg-indigo-500/20 border-indigo-500/50 ring-2 ring-indigo-500/30'
                              : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                          }`}
                        >
                          <h3 className="font-semibold text-sm">{del.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{del.description}</p>
                          <p className="text-[11px] text-amber-300 mt-1.5">
                            {del.price === 0 ? '✓ Бесплатно' : formatPrice(del.price)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step: Extras */}
                {currentStep === 'extras' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Дополнительные услуги</h2>
                    <p className="text-slate-400 text-sm mb-5">Согласование, срочность и сервис</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {extraServices.map(srv => (
                        <button
                          key={srv.id}
                          onClick={() => toggleArrayItem(selectedExtras, srv.id, setSelectedExtras)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            selectedExtras.includes(srv.id)
                              ? 'bg-green-500/15 border-green-500/40 ring-1 ring-green-500/30'
                              : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm">{srv.name}</h3>
                              <p className="text-[11px] text-slate-400 mt-0.5">{srv.description}</p>
                            </div>
                            {selectedExtras.includes(srv.id) && (
                              <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
                            )}
                          </div>
                          <p className="text-[11px] text-amber-300 mt-1.5">
                            {srv.isPercentage ? `+${srv.percentage}% к стоимости` : formatPrice(srv.price)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step: Result */}
                {currentStep === 'result' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Итоговый расчёт</h2>
                    <p className="text-slate-400 text-sm mb-5">Детальная смета вашего проекта</p>
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                        <p className="text-[10px] text-blue-300">Материалы</p>
                        <p className="text-sm font-bold text-blue-200">{formatPrice(calculation.materialsCost)}</p>
                      </div>
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                        <p className="text-[10px] text-amber-300">Работы</p>
                        <p className="text-sm font-bold text-amber-200">{formatPrice(calculation.workCost)}</p>
                      </div>
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                        <p className="text-[10px] text-green-300">Монтаж</p>
                        <p className="text-sm font-bold text-green-200">{formatPrice(calculation.mountingCost)}</p>
                      </div>
                      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                        <p className="text-[10px] text-purple-300">Доставка</p>
                        <p className="text-sm font-bold text-purple-200">{formatPrice(calculation.deliveryCost)}</p>
                      </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="space-y-1.5">
                      {Object.entries(categoryTotals).map(([category, catTotal]) => (
                        <div key={category} className="mb-3">
                          <div className="flex justify-between items-center mb-1.5 px-2">
                            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{category}</span>
                            <span className="text-xs font-medium text-slate-400">{formatPrice(catTotal)}</span>
                          </div>
                          {calculation.breakdown.filter(b => b.category === category).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-1.5 px-4 border-l-2 border-slate-700/50 ml-2">
                              <span className="text-xs text-slate-400">{item.label}</span>
                              <span className="text-xs font-medium text-slate-300">{formatPrice(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="mt-5 p-5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-slate-300">ИТОГО:</span>
                          <p className="text-[10px] text-slate-500 mt-0.5">Включая все работы и доставку</p>
                        </div>
                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                          {formatPrice(calculation.total)}
                        </span>
                      </div>
                    </div>

                    {/* Info Cards */}
                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <div className="p-3 bg-slate-700/50 rounded-xl">
                        <p className="text-[10px] text-slate-400">Срок изготовления</p>
                        <p className="text-sm font-bold mt-0.5">
                          {selectedExtras.includes('urgent') ? '1-2 дня' : '5-10 дней'}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-700/50 rounded-xl">
                        <p className="text-[10px] text-slate-400">Гарантия</p>
                        <p className="text-sm font-bold mt-0.5">
                          {selectedExtras.includes('warranty-ext') ? '3 года' : '1 год'}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-700/50 rounded-xl col-span-2 sm:col-span-1">
                        <p className="text-[10px] text-slate-400">НДС</p>
                        <p className="text-sm font-bold mt-0.5">Включён</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
                      <button className="flex-1 py-3 px-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2">
                        <FileText size={16} />
                        Отправить заявку на расчёт
                      </button>
                      <button className="py-3 px-5 bg-slate-700 rounded-xl font-semibold hover:bg-slate-600 transition-colors text-sm flex items-center justify-center gap-2">
                        <Download size={16} />
                        Скачать PDF
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-5">
              <button
                onClick={goPrev}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600/50 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors text-sm"
              >
                <ChevronLeft size={16} />
                Назад
              </button>
              {currentStepIndex < steps.length - 1 ? (
                <button
                  onClick={goNext}
                  disabled={!selectedProduct && currentStepIndex === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity font-medium text-sm"
                >
                  Далее
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={resetAll}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 transition-opacity font-medium text-sm"
                >
                  <RotateCcw size={16} />
                  Новый расчёт
                </button>
              )}
            </div>
          </div>

          {/* Sidebar - Live Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Price Card */}
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-indigo-500/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Receipt size={16} className="text-indigo-400" />
                  <h3 className="text-sm font-bold">Текущая стоимость</h3>
                </div>
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  {selectedProduct ? formatPrice(calculation.total) : '— ₽'}
                </div>
                {selectedProduct && (
                  <p className="text-[10px] text-slate-500 mt-1">Ориентировочная стоимость</p>
                )}
              </div>

              {/* Configuration Summary */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Package size={14} className="text-indigo-400" />
                  Конфигурация
                </h3>

                {selectedProduct ? (
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                      <span className="text-[11px] text-slate-400">Изделие</span>
                      <span className="text-[11px] font-medium">{selectedProduct.icon} {selectedProduct.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                      <span className="text-[11px] text-slate-400">Материал</span>
                      <span className="text-[11px] font-medium">{materials.find(m => m.id === selectedMaterial)?.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                      <span className="text-[11px] text-slate-400">Размер</span>
                      <span className="text-[11px] font-medium">
                        {selectedProduct.hasDimensions
                          ? `${width}×${height} см`
                          : `${letterCount}×${letterHeight} см`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                      <span className="text-[11px] text-slate-400">Подсветка</span>
                      <span className="text-[11px] font-medium">{lightingTypes.find(l => l.id === selectedLighting)?.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                      <span className="text-[11px] text-slate-400">Доп. работы</span>
                      <span className="text-[11px] font-medium">{selectedAdditional.length > 0 ? `${selectedAdditional.length} поз.` : '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                      <span className="text-[11px] text-slate-400">Монтаж</span>
                      <span className="text-[11px] font-medium">{selectedMounting.length} опц.</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-[11px] text-slate-400">Доставка</span>
                      <span className="text-[11px] font-medium">{deliveryOptions.find(d => d.id === selectedDelivery)?.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Package size={36} className="mx-auto text-slate-600 mb-2" />
                    <p className="text-[11px] text-slate-500">Выберите тип изделия<br/>для начала расчёта</p>
                  </div>
                )}
              </div>

              {/* Quick Tips */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                <h3 className="text-sm font-bold mb-2">💡 Подсказка</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {currentStep === 'product' && 'Объёмные буквы — самый популярный тип вывески. Идеально для фасадов магазинов и офисов.'}
                  {currentStep === 'material' && 'Акрил — лучший выбор для световых элементов. АКП — для больших конструкций.'}
                  {currentStep === 'dimensions' && 'Стандартная высота букв для фасада — 40-80 см. Для крыши — от 100 см.'}
                  {currentStep === 'lighting' && 'Лицевая подсветка — самая яркая. Контражур — стильный и экономичный вариант.'}
                  {currentStep === 'additional' && 'Накатка плёнки Oracal — бюджетный вариант. 3M — премиум с печатью.'}
                  {currentStep === 'mounting' && 'Монтаж до 3м — базовый. Выше 7м — требуется автовышка.'}
                  {currentStep === 'delivery' && 'При самовывозе убедитесь, что габариты конструкции позволяют транспортировку.'}
                  {currentStep === 'extras' && 'Срочное изготовление увеличивает стоимость на 50%, но сокращает срок до 1-2 дней.'}
                  {currentStep === 'result' && 'Для точного расчёта отправьте заявку с фото фасада и пожеланиями.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">© 2025 РекламаКальк — Калькулятор рекламных конструкций</p>
          <p className="text-[11px] text-slate-500">⚠️ Расчёт предварительный. Точная стоимость — после проверки макета и условий монтажа.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
