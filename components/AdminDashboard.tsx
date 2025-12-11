
import React, { useState, useEffect, useRef } from 'react';
import { Product, Order, ShippingTemplate, Coupon, Member, StoreConfig, ProductVariant } from '../types';
import { CATEGORY_NAMES, MOCK_MEMBERS } from '../constants';
import { geminiService } from '../services/geminiService';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  shippingTemplates: ShippingTemplate[];
  coupons: Coupon[];
  storeConfig: StoreConfig; 
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrder: (order: Order) => void;
  onCreateCoupon: (coupon: Coupon) => void;
  onUpdateStoreConfig: (config: StoreConfig) => void; 
  onExit: () => void;
  onResetData?: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void; 
}

type Tab = 'home' | 'products' | 'orders' | 'marketing' | 'members' | 'settings';
type OrderFilter = 'all' | 'pending' | 'shipped' | 'completed';
type ProductFilter = 'all' | 'fish' | 'crab_shrimp' | 'shell';

// --- Sub-Components ---
const QuickPriceInput: React.FC<{ price: number; onSave: (val: number) => void }> = ({ price, onSave }) => {
    const [val, setVal] = useState(price.toString());
    const [isEditing, setIsEditing] = useState(false);
    const [justSaved, setJustSaved] = useState(false);

    useEffect(() => { if (!isEditing) setVal(price.toString()); }, [price, isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        const num = parseFloat(val);
        if (!isNaN(num) && num !== price) {
            onSave(num);
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 1500);
        } else {
            setVal(price.toString());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
    };

    return (
        <div className={`relative rounded-lg p-2 flex flex-col justify-center items-center border h-16 w-full group transition-all duration-300 ${justSaved ? 'bg-green-900/30 border-green-500/50' : 'bg-ocean-800 border-ocean-700 hover:border-gold-500/50 focus-within:border-gold-500'}`}>
            <label className={`text-[10px] absolute top-1 left-2 transition-colors ${justSaved ? 'text-green-400' : 'text-gray-500 group-focus-within:text-gold-500'}`}>
                {justSaved ? '已更新' : '价格 Price'}
            </label>
            <div className="flex items-center justify-center w-full mt-3 relative">
                <span className={`text-sm font-bold mr-1 ${isEditing ? 'text-gold-500' : 'text-gray-400'}`}>¥</span>
                <input 
                    type="number" 
                    value={val} 
                    onFocus={() => setIsEditing(true)} 
                    onChange={(e) => setVal(e.target.value)} 
                    onBlur={handleBlur} 
                    onKeyDown={handleKeyDown} 
                    className="bg-transparent text-white font-bold text-lg w-20 text-center focus:outline-none p-0 appearance-none" 
                    placeholder="0.00"
                />
                {justSaved && (
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 animate-scale-in">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                )}
            </div>
        </div>
    );
};

const QuickStockInput: React.FC<{ stock: number; onSave: (val: number) => void }> = ({ stock, onSave }) => {
    const [val, setVal] = useState(stock.toString());
    const [isEditing, setIsEditing] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { if (!isEditing) setVal(stock.toString()); }, [stock, isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        const num = parseInt(val);
        if (!isNaN(num) && num !== stock) {
            onSave(Math.max(0, num));
            triggerSaveAnim();
        } else {
            setVal(stock.toString());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
    };

    const triggerSaveAnim = () => {
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 1500);
    }

    const updateStockDebounced = (newVal: number) => {
        const num = Math.max(0, newVal);
        setVal(num.toString()); 
        setIsEditing(true);
        
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => { 
            onSave(num); 
            setIsEditing(false); 
            triggerSaveAnim();
        }, 600); 
    };

    return (
        <div className={`relative rounded-lg p-2 flex flex-col justify-center items-center border h-16 w-full group transition-all duration-300 ${justSaved ? 'bg-green-900/30 border-green-500/50' : 'bg-ocean-800 border-ocean-700 hover:border-gold-500/50 focus-within:border-gold-500'}`}>
            <label className={`text-[10px] absolute top-1 left-2 transition-colors ${justSaved ? 'text-green-400' : 'text-gray-500 group-focus-within:text-gold-500'}`}>
                {justSaved ? '已更新' : '库存 Stock'}
            </label>
            <div className="flex items-center justify-between w-full mt-3 px-1">
                 <button 
                    onClick={(e) => {e.stopPropagation(); updateStockDebounced((parseInt(val)||0) - 1);}} 
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-ocean-700 rounded-full active:bg-ocean-600 transition-colors active:scale-90"
                 >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M18 12H6"></path></svg>
                </button>
                <div className="relative">
                    <input 
                        type="number" 
                        value={val} 
                        onFocus={() => setIsEditing(true)} 
                        onChange={(e) => setVal(e.target.value)} 
                        onBlur={handleBlur} 
                        onKeyDown={handleKeyDown} 
                        className={`w-12 text-center bg-transparent text-lg font-bold focus:outline-none appearance-none m-0 transition-colors ${parseInt(val) === 0 ? 'text-red-500' : 'text-white'}`}
                    />
                    {justSaved && <div className="absolute inset-0 border-b-2 border-green-500 animate-pulse"></div>}
                </div>
                <button 
                    onClick={(e) => {e.stopPropagation(); updateStockDebounced((parseInt(val)||0) + 1);}} 
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-ocean-700 rounded-full active:bg-ocean-600 transition-colors active:scale-90"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v12m6-6H6"></path></svg>
                </button>
            </div>
        </div>
    );
};

const ReceiptModal: React.FC<{ order: Order | null; pickingList?: {name: string, quantity: number, variant?: string}[]; onClose: () => void; onPrint: () => void }> = ({ order, pickingList, onClose, onPrint }) => {
    if (!order && !pickingList) return null;
    
    // Jagged edge using CSS gradient
    const jaggedEdgeStyle = {
        background: `
            linear-gradient(-45deg, transparent 8px, #fffdf0 8px) 0 100%,
            linear-gradient(45deg, transparent 8px, #fffdf0 8px) 0 100%
        `,
        backgroundSize: '16px 16px',
        backgroundRepeat: 'repeat-x',
        height: '16px',
        width: '100%',
        position: 'absolute' as 'absolute',
        bottom: '-16px',
        left: 0
    };

    // Calculate total order count for picking list via prop if possible, or just length of unique items
    // (In a real app, we'd pass meta info. Here we infer or just show list)
    const pickingListCount = pickingList ? pickingList.length : 0;

    return (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-[#fffdf0] w-full max-w-xs shadow-2xl relative animate-scale-in flex flex-col max-h-[80vh] text-black" onClick={e => e.stopPropagation()} style={{filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.5))'}}>
                <div className="p-4 border-b border-dashed border-gray-300 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">{pickingList ? '批量配货清单' : '发货单预览'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-black">✕</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed relative">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-black mb-1 tracking-wider text-black">魏来海鲜</h2>
                        <p className="uppercase text-[10px] tracking-[0.2em] text-gray-600">Wei Lai Premium Seafood</p>
                        <p className="mt-3 text-gray-400">--------------------------------</p>
                    </div>

                    {pickingList ? (
                        /* BATCH PICKING LIST VIEW */
                        <>
                            <div className="mb-4">
                                <p className="font-bold text-sm">【汇总拣货单】</p>
                                <p>打印时间: {new Date().toLocaleString()}</p>
                                <p>商品品类数: {pickingListCount}</p>
                            </div>
                            <div className="mb-4 border-t-2 border-black py-2">
                                <div className="flex justify-between font-bold mb-2 text-sm"><span>商品名称</span><span>总需数量</span></div>
                                {pickingList.map((item, i) => (
                                    <div key={i} className="flex justify-between mb-2 items-center border-b border-gray-200 pb-1 last:border-0">
                                        <div className="w-2/3">
                                            <span className="block font-bold">{item.name}</span>
                                            {item.variant && <span className="text-[10px] text-gray-500 block">规格: {item.variant}</span>}
                                        </div>
                                        <span className="font-black text-xl">x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-8 border-2 border-black p-2 font-bold transform -rotate-2">
                                请核对库存后发货
                            </div>
                        </>
                    ) : (
                        /* SINGLE ORDER RECEIPT VIEW */
                        order && <>
                            <div className="mb-4 space-y-1.5 font-bold text-gray-800">
                                <p>订单号: <span className="font-normal">{order.id}</span></p>
                                <p>时间: <span className="font-normal">{order.date}</span></p>
                                <p>收件人: <span className="font-normal">{order.customerName}</span></p>
                                <p>支付方式: <span className="font-normal">{order.paymentMethod === 'balance' ? '会员余额' : '微信支付'}</span></p>
                            </div>
                            <div className="mb-4 border-t-2 border-black border-dashed py-2">
                                <div className="flex justify-between font-bold mb-2"><span>商品</span><span>金额</span></div>
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between mb-1.5">
                                        <span className="w-2/3">
                                            {item.name} 
                                            {item.variantName && <span className="text-[10px] text-gray-600 block">[{item.variantName}]</span>}
                                            <span className="font-bold ml-1">x{item.quantity}</span>
                                        </span>
                                        <span>{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between font-bold text-sm mb-6 border-t border-black pt-2">
                                <span>实付金额:</span>
                                <span className="text-lg">¥{order.total}</span>
                            </div>
                            {order.note && (
                                <div className="mb-6 border border-black p-2 relative">
                                    <span className="absolute -top-2 left-2 bg-[#fffdf0] px-1 text-[10px] font-bold">备注</span>
                                    <p className="font-bold">{order.note}</p>
                                </div>
                            )}
                            <div className="text-center space-y-1 text-[10px] text-gray-500">
                                <p>********************************</p>
                                <p>感谢您的惠顾 · 生鲜请即刻签收</p>
                                <p>官方客服热线: 400-888-6666</p>
                            </div>
                        </>
                    )}
                </div>
                
                {/* Jagged Bottom Edge */}
                <div style={jaggedEdgeStyle}></div>

                <div className="p-4 pt-6 bg-[#f8f6e9] flex gap-3 relative z-10">
                    <button onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:text-black transition-colors">取消</button>
                    <button onClick={onPrint} className="flex-[2] bg-black text-white font-bold py-3 rounded shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                        确认打印
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  shippingTemplates,
  coupons,
  storeConfig,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrder,
  onCreateCoupon,
  onUpdateStoreConfig,
  onExit,
  onResetData,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiInputText, setAiInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [couponForm, setCouponForm] = useState<Partial<Coupon>>({ type: 'fixed', minOrderAmount: 0 });
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [dailyReport, setDailyReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showLowStockList, setShowLowStockList] = useState(false); 
  
  // Batch Mode States
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  
  // Product Filter State
  const [productFilter, setProductFilter] = useState<ProductFilter>('all');
  
  // Shipping Modal State
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  
  // Receipt/Picking List Modal State
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [pickingList, setPickingList] = useState<{name: string, quantity: number, variant?: string}[] | undefined>(undefined);

  // Store Config State
  const [configForm, setConfigForm] = useState<StoreConfig>(storeConfig);

  const [formData, setFormData] = useState<Partial<Product>>({});
  const [tagInput, setTagInput] = useState('');
  
  // Variant Edit State
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const todayRevenue = orders
    .filter(o => o.status !== 'cancelled' && o.date === new Date().toLocaleDateString())
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  
  const lowStockProducts = products.filter(p => {
      // Check total stock for variant items too
      const total = p.variants && p.variants.length > 0 
          ? p.variants.reduce((acc, v) => acc + v.stock, 0) 
          : p.stock;
      return total < 5;
  });
  const lowStockCount = lowStockProducts.length;

  const filteredOrders = orders.filter(o => {
      if (orderFilter === 'all') return true;
      if (orderFilter === 'completed') return o.status === 'completed' || o.status === 'cancelled';
      return o.status === orderFilter;
  });

  const filteredProducts = products.filter(p => {
      if (productFilter === 'all') return true;
      return p.category === productFilter;
  });

  // Dynamic Sales Trend Calculation
  const getSalesTrendData = () => {
      const days = 7;
      const data = new Array(days).fill(0);
      const today = new Date();
      const labels: string[] = [];

      for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - (days - 1 - i)); // -6, -5, ... 0
          const dateStr = date.toLocaleDateString();
          // Use 'Mon', 'Tue' or just number for simplicity
          const dayName = ['日','一','二','三','四','五','六'][date.getDay()];
          labels.push(dayName);

          const dailyTotal = orders
              .filter(o => o.date === dateStr && o.status !== 'cancelled')
              .reduce((sum, o) => sum + o.total, 0);
          
          data[i] = dailyTotal;
      }
      
      const maxVal = Math.max(...data, 100); // Avoid divide by zero
      return { data: data.map(v => v / maxVal), labels, rawData: data };
  };
  
  const salesTrend = getSalesTrendData();


  // Calculate Top Sellers for Dashboard
  const soldMap: Record<string, number> = {};
  orders.filter(o => o.status !== 'cancelled').forEach(o => {
      o.items.forEach(i => {
          soldMap[i.productId] = (soldMap[i.productId] || 0) + i.quantity;
      });
  });
  const topSellers = Object.entries(soldMap)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, qty]) => {
          const prod = products.find(p => p.id === id);
          return prod ? { ...prod, soldQty: qty } : null;
      })
      .filter(Boolean);


  const handleEditClick = (product: Product) => { 
      setEditingProduct(product); 
      setFormData(product); 
      setTagInput(product.tags.join(', ')); 
      setVariants(product.variants || []);
      setIsFormOpen(true); 
  };
  
  const handleAddNewClick = () => { 
      setEditingProduct(null); 
      setFormData({ category: 'fish', stock: 10, unit: '件', tags: [], image: `https://picsum.photos/id/${Math.floor(Math.random() * 500)}/800/600` }); 
      setTagInput(''); 
      setVariants([]);
      setIsFormOpen(true); 
  };

  const handleAIGenerate = async () => {
      if (!aiInputText.trim()) return;
      setIsGenerating(true);
      try {
          const result = await geminiService.parseProductInfo(aiInputText);
          setEditingProduct(null);
          setFormData({ ...formData, ...result, image: `https://picsum.photos/id/${Math.floor(Math.random() * 500)}/800/600` });
          setTagInput(result.tags ? result.tags.join(', ') : '');
          setVariants([]); // AI doesn't generate variants yet in this simple version
          setIsAIModalOpen(false); setAiInputText(''); setIsFormOpen(true);
      } catch (error) { showToast("AI 解析失败，请重试", 'error'); } finally { setIsGenerating(false); }
  };

  const handleGenerateReport = async () => {
      setIsGeneratingReport(true);
      const report = await geminiService.generateBusinessReport(orders, products);
      setDailyReport(report);
      setIsGeneratingReport(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    const tags = tagInput.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    const productToSave = { 
        ...formData, 
        tags: tags, 
        stock: variants.length > 0 ? variants.reduce((a,b) => a+b.stock, 0) : (formData.stock || 0), 
        price: variants.length > 0 ? Math.min(...variants.map(v=>v.price)) : (formData.price || 0),
        unit: formData.unit || '件', 
        category: formData.category || 'fish',
        variants: variants
    };
    if (editingProduct) onUpdateProduct({ ...editingProduct, ...productToSave } as Product);
    else onAddProduct({ ...productToSave, id: `prod-${Date.now()}` } as Product);
    setIsFormOpen(false);
  };

  // Variant Helpers
  const addVariant = () => {
      setVariants([...variants, { id: `var-${Date.now()}`, name: '', price: formData.price || 0, stock: 10 }]);
  };
  const removeVariant = (idx: number) => {
      setVariants(variants.filter((_, i) => i !== idx));
  };
  const updateVariant = (idx: number, field: keyof ProductVariant, value: any) => {
      const newVars = [...variants];
      newVars[idx] = { ...newVars[idx], [field]: value };
      setVariants(newVars);
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(couponForm.name && couponForm.value) {
          onCreateCoupon({ id: `CP-${Date.now()}`, name: couponForm.name!, type: couponForm.type || 'fixed', value: Number(couponForm.value), minOrderAmount: Number(couponForm.minOrderAmount || 0), description: couponForm.description || '' });
          setIsCouponFormOpen(false); setCouponForm({ type: 'fixed', minOrderAmount: 0 });
      }
  };

  const openShipModal = (orderId: string) => {
      setShippingOrderId(orderId);
      setTrackingInput(`SF${Date.now().toString().slice(-10)}`); // pre-fill suggestion
      setIsShippingModalOpen(true);
  };

  const confirmShipOrder = () => {
      if (shippingOrderId && trackingInput) {
          const order = orders.find(o => o.id === shippingOrderId);
          if (order) {
              onUpdateOrder({ ...order, status: 'shipped', trackingNumber: trackingInput });
              setIsShippingModalOpen(false);
              setShippingOrderId(null);
          }
      }
  };

  const handleDeleteClick = (e: React.MouseEvent, productId: string) => {
      e.stopPropagation();
      if (window.confirm('确定要删除这个商品吗？删除后无法恢复。')) onDeleteProduct(productId);
  };

  const handleSendGift = (member: Member) => {
      showToast(`已向会员【${member.name}】发送了一张 ¥100 优惠券！`, 'success');
  };

  const copyAddress = (order: Order) => {
      const info = `订单: ${order.id}\n客户: ${order.customerName}\n备注: ${order.note || '无'}`;
      navigator.clipboard.writeText(info).then(() => showToast('订单信息已复制', 'success'));
  };
  
  const handlePrintOrder = (order: Order) => {
      setReceiptOrder(order);
      setPickingList(undefined);
  };
  
  const confirmPrint = () => {
      showToast(pickingList ? '配货单打印指令已发送' : '小票打印指令已发送', 'success');
      setReceiptOrder(null);
      setPickingList(undefined);
      if (pickingList) {
          setIsBatchMode(false); 
          setSelectedOrderIds([]);
      }
  };

  const handleConfigSave = () => {
      onUpdateStoreConfig(configForm);
  };

  const handleQuickRestock = (product: Product) => {
      onUpdateProduct({ ...product, stock: product.stock + 10 });
      showToast(`${product.name} 补货 +10 成功`, 'success');
  }

  // --- Batch Logic ---
  const toggleBatchMode = () => {
      setIsBatchMode(!isBatchMode);
      setSelectedOrderIds([]); // Clear selections when toggling
  };

  const toggleSelectOrder = (orderId: string) => {
      setSelectedOrderIds(prev => 
          prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
      );
  };

  const handleSelectAll = () => {
      const allIds = filteredOrders.map(o => o.id);
      const allSelected = allIds.every(id => selectedOrderIds.includes(id));
      
      if (allSelected) {
          setSelectedOrderIds([]);
      } else {
          setSelectedOrderIds(allIds);
      }
  };

  const handleBatchPrint = () => {
      if (selectedOrderIds.length === 0) return;
      
      // Aggregate Items for Picking List
      const aggregatedItems: Record<string, {name: string, quantity: number, variant?: string}> = {};
      
      selectedOrderIds.forEach(id => {
          const order = orders.find(o => o.id === id);
          if (order) {
              order.items.forEach(item => {
                  // Key logic: Group by product ID + variant (if exists)
                  const key = item.variantName ? `${item.productId}-${item.variantName}` : item.productId;
                  
                  if (!aggregatedItems[key]) {
                      aggregatedItems[key] = { 
                          name: item.name, 
                          quantity: 0,
                          variant: item.variantName 
                      };
                  }
                  aggregatedItems[key].quantity += item.quantity;
              });
          }
      });

      const pickingArray = Object.values(aggregatedItems).sort((a,b) => a.name.localeCompare(b.name));
      
      // Pass order count for modal display
      (pickingArray as any)._countOrder = selectedOrderIds.length;

      setPickingList(pickingArray);
      setReceiptOrder(null);
  };

  const handleReset = () => {
      if(onResetData) onResetData();
      sessionStorage.clear(); // Clear 'coupon_shown' flag too
  };

  const handleBatchShip = () => {
      if (selectedOrderIds.length === 0) return;
      if (window.confirm(`确定将选中的 ${selectedOrderIds.length} 个订单标记为发货吗？\n(将自动生成同城配送单号)`)) {
          selectedOrderIds.forEach(id => {
              const order = orders.find(o => o.id === id);
              if (order && order.status === 'pending') {
                  onUpdateOrder({ ...order, status: 'shipped', trackingNumber: `LOCAL${Date.now()}` });
              }
          });
          showToast(`批量发货完成`, 'success');
          setIsBatchMode(false);
          setSelectedOrderIds([]);
      }
  };

  const renderHeader = (title: string, action?: React.ReactNode) => (
    <div className="bg-ocean-900 border-b border-ocean-800 px-4 py-3 sticky top-0 z-20 flex justify-between items-center shadow-md pt-[calc(env(safe-area-inset-top)+20px)]">
        <h2 className="text-lg font-serif text-white font-medium tracking-wide">{title}</h2>
        {action}
    </div>
  );

  const TAB_ITEMS = [
      { id: 'home', label: '工作台', icon: <><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></> },
      { id: 'products', label: '商品', icon: <><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22v-10" /></> },
      { id: 'orders', label: '订单', icon: <><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></> },
      { id: 'members', label: '会员', icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
      { id: 'marketing', label: '营销', icon: <><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M9 9h.01" /><path d="M15 15h.01" /><path d="M15 9l-6 6" /></> },
      { id: 'settings', label: '设置', icon: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></> }
  ];

  return (
    <div className="flex flex-col h-full bg-ocean-900 text-slate-100 font-sans overflow-hidden relative">
      <div className="flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom))] bg-ocean-900 scroll-smooth">
        {/* ... (Home Tab and other tabs remain unchanged) ... */}
        {activeTab === 'home' && (
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-gold-600 to-gold-500 p-6 pt-[calc(env(safe-area-inset-top)+24px)] pb-10 rounded-b-3xl shadow-lg shadow-gold-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05 1.18 1.91 2.53 1.91 1.29 0 2.13-.72 2.13-1.71 0-3.69-5.71-2.9-5.71-7.18 0-1.72 1.27-3.17 3.36-3.53V2h2.67v1.9c1.55.33 2.82 1.34 3.09 3.06h-2.02c-.22-1.02-1.12-1.63-2.31-1.63-1.11 0-2 .67-2 1.57 0 3.38 5.76 2.56 5.76 7.15 0 1.83-1.37 3.34-3.52 3.61z"/></svg></div>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>
                             <span className="font-bold text-ocean-900">魏来海鲜店长</span>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={handleReset} className="text-ocean-900 bg-white/20 px-3 py-1 rounded-full text-xs font-medium hover:bg-white/30 transition-colors">重置数据</button>
                             <button onClick={onExit} className="text-ocean-900 bg-white/20 px-3 py-1 rounded-full text-xs font-medium hover:bg-white/30 transition-colors">退出</button>
                        </div>
                    </div>
                    <div><p className="text-ocean-900/70 text-sm font-medium mb-1">今日营收 (元)</p><h1 className="text-4xl font-serif text-ocean-900 font-bold tracking-tight">{todayRevenue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</h1></div>
                </div>
                
                {/* Stats */}
                <div className="px-4 grid grid-cols-2 gap-4">
                    <div onClick={() => setActiveTab('orders')} className="bg-ocean-800 p-4 rounded-xl border border-ocean-700 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform">
                        <span className="text-gray-400 text-xs">待发货订单</span>
                        <span className="text-2xl font-bold text-white">{pendingOrdersCount}</span>
                    </div>
                    <div onClick={() => setShowLowStockList(!showLowStockList)} className="bg-ocean-800 p-4 rounded-xl border border-ocean-700 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform relative">
                        <span className="text-gray-400 text-xs">库存预警商品</span>
                        <span className="text-2xl font-bold text-red-500">{lowStockCount}</span>
                        {showLowStockList && <div className="absolute -bottom-2 w-3 h-3 bg-ocean-800 rotate-45 border-r border-b border-ocean-700 z-10"></div>}
                    </div>
                </div>

                {/* Low Stock List (Toggleable) */}
                {showLowStockList && (
                    <div className="mx-4 mt-2 bg-red-900/20 border border-red-500/30 rounded-xl p-3 animate-fade-in-down">
                        <h4 className="text-red-400 text-xs font-bold mb-2 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            需要补货
                        </h4>
                        <div className="space-y-2">
                            {lowStockProducts.map(p => (
                                <div key={p.id} className="flex justify-between items-center text-xs">
                                    <span className="text-gray-300 truncate w-2/3">{p.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-red-500 font-bold">{p.stock}</span>
                                        <button onClick={() => handleQuickRestock(p)} className="bg-ocean-900 text-gray-400 px-2 py-0.5 rounded hover:text-white border border-ocean-700 transition-colors">+10</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sales Trend Chart (CSS Bar Chart) */}
                <div className="bg-ocean-800 p-4 rounded-xl border border-ocean-700 mx-4">
                    <h3 className="text-white font-bold mb-4 text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                        近7日销售趋势
                    </h3>
                    <div className="flex items-end justify-between h-32 gap-2">
                        {salesTrend.data.map((val, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group cursor-default">
                                <div className="w-full bg-ocean-700 rounded-t-sm relative h-full flex items-end overflow-hidden group-hover:bg-ocean-600 transition-colors">
                                    <div 
                                        className="w-full bg-gold-500 transition-all duration-1000 ease-out relative group-hover:bg-gold-400" 
                                        style={{ height: `${val * 100}%` }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1.5 py-0.5 rounded transition-opacity whitespace-nowrap shadow-lg border border-white/10 z-10">
                                            ¥{salesTrend.rawData[idx]}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[9px] text-gray-500">{salesTrend.labels[idx]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Sellers List */}
                <div className="px-4">
                    <h3 className="text-white font-bold mb-3 text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                        热销榜单 TOP 3
                    </h3>
                    <div className="space-y-3">
                        {topSellers.length === 0 ? <p className="text-gray-500 text-xs text-center py-4">暂无销售数据</p> : topSellers.map((item, idx) => (
                            <div key={item.id} className="flex items-center gap-3 bg-ocean-800 p-3 rounded-lg border border-ocean-700 shadow-sm">
                                <div className={`w-6 h-6 flex items-center justify-center rounded font-bold text-xs ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : 'bg-orange-700 text-white'}`}>
                                    {idx + 1}
                                </div>
                                <img src={item.image} className="w-10 h-10 rounded object-cover bg-ocean-900 border border-ocean-600" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-white text-sm truncate font-medium">{item.name}</div>
                                    <div className="text-gray-500 text-[10px]">库存: {item.stock}</div>
                                </div>
                                <div className="text-gold-500 font-bold text-sm">{item.soldQty}件</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'products' && (
            <div>
                {renderHeader('商品管理', (
                    <div className="flex items-center gap-2">
                         <button onClick={() => setIsAIModalOpen(true)} className="bg-gradient-to-r from-gold-600 to-amber-600 text-ocean-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-gold-500/20 active:opacity-90">AI上架</button>
                        <button onClick={handleAddNewClick} className="bg-ocean-800 border border-ocean-700 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 active:bg-ocean-700">手动</button>
                    </div>
                ))}
                
                {/* Product Filters */}
                <div className="px-4 py-2 border-b border-ocean-800 bg-ocean-900/50 flex gap-2 overflow-x-auto no-scrollbar">
                    {(['all', 'fish', 'crab_shrimp', 'shell'] as ProductFilter[]).map(filter => (
                        <button 
                            key={filter}
                            onClick={() => setProductFilter(filter)}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${productFilter === filter ? 'bg-gold-500 text-ocean-900' : 'bg-ocean-800 text-gray-400'}`}
                        >
                            {filter === 'all' ? '全部' : CATEGORY_NAMES[filter].split(' · ')[1] || filter}
                        </button>
                    ))}
                </div>

                <div className="p-4 space-y-4">
                    {filteredProducts.map(product => {
                        const totalStock = product.variants && product.variants.length > 0 
                            ? product.variants.reduce((acc, v) => acc + v.stock, 0) 
                            : product.stock;
                        const minPrice = product.variants && product.variants.length > 0 
                            ? Math.min(...product.variants.map(v => v.price))
                            : product.price;

                        return (
                        <div key={product.id} className="bg-ocean-800 rounded-xl overflow-hidden border border-ocean-700 shadow-sm" onClick={() => handleEditClick(product)}>
                            <div className="p-3 flex gap-3 relative">
                                <img src={product.image} alt="" className="w-20 h-20 rounded-lg object-cover bg-ocean-900 flex-shrink-0" />
                                {product.isLive && ( <div className="absolute top-1 left-1 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full z-10 animate-pulse">🔥 热推</div> )}
                                <button onClick={(e) => handleDeleteClick(e, product.id)} className="absolute top-2 right-2 bg-ocean-900/80 p-1.5 rounded-full text-gray-400 hover:text-red-500 transition-colors z-20"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                    <div className="flex justify-between items-start pr-8">
                                        <h3 className="text-white font-medium text-base truncate">{product.name}</h3>
                                    </div>
                                    <p className="text-gray-400 text-xs mt-1 truncate">{CATEGORY_NAMES[product.category]}</p>
                                    <div className="flex items-end gap-2 mt-1">
                                        <span className="text-gold-500 font-bold">¥{minPrice}</span>
                                        {product.variants && product.variants.length > 0 && <span className="text-xs text-gray-500">起</span>}
                                        <span className="text-xs text-gray-500 ml-auto">库存 {totalStock}</span>
                                    </div>
                                </div>
                            </div>
                            {!product.variants || product.variants.length === 0 ? (
                                <div className="bg-ocean-900/40 p-2 grid grid-cols-2 gap-2 border-t border-ocean-700/50" onClick={e => e.stopPropagation()}>
                                    <QuickPriceInput price={product.price} onSave={(val) => onUpdateProduct({ ...product, price: val })} />
                                    <QuickStockInput stock={product.stock} onSave={(val) => onUpdateProduct({ ...product, stock: val })} />
                                </div>
                            ) : (
                                <div className="bg-ocean-900/40 p-2 text-center text-xs text-gray-500 border-t border-ocean-700/50">
                                    多规格商品请进入编辑页修改库存
                                </div>
                            )}
                        </div>
                    )})}
                </div>
            </div>
        )}

        {/* ... (Orders Tab and other tabs remain unchanged) ... */}
        {activeTab === 'orders' && (
            <div>
                {/* ... (Order list code) ... */}
                {renderHeader('订单管理', (
                    <button 
                        onClick={toggleBatchMode} 
                        className={`text-xs px-3 py-1.5 rounded-full border font-bold transition-all ${isBatchMode ? 'bg-gold-500 text-ocean-900 border-gold-500' : 'bg-ocean-800 text-gray-400 border-ocean-700'}`}
                    >
                        {isBatchMode ? '完成' : '批量管理'}
                    </button>
                ))}
                {/* ... existing order list code ... */}
                <div className="p-4 space-y-4 pb-32">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">暂无相关订单</div>
                    ) : (
                        filteredOrders.map(order => {
                            const isSelected = selectedOrderIds.includes(order.id);
                            return (
                            <div 
                                key={order.id} 
                                onClick={isBatchMode ? () => toggleSelectOrder(order.id) : undefined}
                                className={`bg-ocean-800 rounded-xl p-4 border shadow-sm transition-all relative overflow-hidden ${isBatchMode && isSelected ? 'border-gold-500 bg-gold-500/5' : 'border-ocean-700'}`}
                            >
                                {/* SKEUOMORPHIC STAMP FOR SHIPPED/COMPLETED ORDERS */}
                                {(order.status === 'shipped' || order.status === 'completed') && (
                                    <div className="absolute top-2 right-4 z-10 opacity-70 pointer-events-none select-none animate-scale-in" style={{animationTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'}}>
                                        <div className="border-[3px] border-red-500/60 rounded-lg p-1 px-2 transform rotate-[-15deg] bg-red-900/10">
                                            <div className="border border-red-500/60 px-2 py-0.5 text-red-500 font-black text-xs tracking-widest uppercase text-center">
                                                {order.status === 'shipped' ? '已发货' : '已完成'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3 relative z-0">
                                    {isBatchMode && (
                                        <div className={`w-5 h-5 rounded border mt-1 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-gold-500 border-gold-500' : 'border-gray-500'}`}>
                                            {isSelected && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-3 border-b border-ocean-700 pb-3">
                                            <div className="flex items-center gap-2"> 
                                                <span className="bg-blue-500 w-1 h-4 rounded-full"></span> 
                                                <h4 className="text-white font-medium">{order.customerName}</h4> 
                                                <button onClick={(e) => { e.stopPropagation(); copyAddress(order); }} className="text-gray-500 hover:text-gold-500"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></button>
                                                <button onClick={(e) => { e.stopPropagation(); handlePrintOrder(order); }} className="text-gray-500 hover:text-gold-500 ml-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                                                </button>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded font-medium ${order.status === 'completed' ? 'bg-green-500/10 text-green-400' : order.status === 'pending' ? 'bg-gold-500/10 text-gold-500' : 'bg-blue-500/10 text-blue-400'}`}>{order.status === 'pending' ? '待发货' : order.status === 'shipped' ? '已发货' : '已完成'}</span>
                                        </div>
                                        <div className="bg-ocean-900/50 rounded-lg p-3 mb-3 flex gap-2 overflow-x-auto no-scrollbar">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="relative flex-shrink-0">
                                                    <img src={item.image || 'https://via.placeholder.com/64'} className="w-10 h-10 rounded object-cover" alt={item.name} />
                                                    {item.variantName && <span className="absolute -bottom-1 -right-1 bg-ocean-800 text-[8px] text-gray-300 px-1 rounded border border-ocean-600">规</span>}
                                                </div>
                                            ))}
                                            <div className="flex flex-col justify-center text-xs text-gray-400">
                                                <span>共{order.items.length}件</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-1 border-t border-ocean-700/50 mt-2">
                                            <div> <span className="text-xs text-gray-500">合计:</span> <span className="text-white font-bold text-lg ml-1">¥{order.total}</span> </div>
                                            {!isBatchMode && order.status === 'pending' && ( <button onClick={() => openShipModal(order.id)} className="bg-gold-600 text-ocean-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-gold-600/20 active:scale-95 transition-transform">一键发货</button> )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )})
                    )}
                </div>

                {/* Batch Action Bar */}
                {isBatchMode && (
                    <div className="absolute bottom-[80px] left-0 w-full px-4 pb-4 z-40 animate-slide-in-up">
                        <div className="bg-ocean-800 border border-gold-500/30 shadow-2xl rounded-2xl p-4 flex items-center justify-between">
                            <div 
                                className="flex items-center gap-2 cursor-pointer group"
                                onClick={handleSelectAll}
                            >
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length ? 'bg-gold-500 border-gold-500' : 'border-gray-500 group-hover:border-gold-500'}`}>
                                    {selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                </div>
                                <span className="text-sm font-bold text-white">全选 ({selectedOrderIds.length})</span>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleBatchPrint}
                                    disabled={selectedOrderIds.length === 0}
                                    className="bg-ocean-700 text-white px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50 hover:bg-ocean-600 transition-colors"
                                >
                                    打印配货单
                                </button>
                                <button 
                                    onClick={handleBatchShip}
                                    disabled={selectedOrderIds.length === 0}
                                    className="bg-gold-600 text-ocean-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:bg-gold-500 disabled:opacity-50 transition-colors"
                                >
                                    批量发货
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
        
        {/* ... (Other Tabs: members, marketing, settings remain unchanged) ... */}
        {activeTab === 'members' && (<div>{renderHeader('会员管理')}<div className="p-4 space-y-4">{MOCK_MEMBERS.map(member => (<div key={member.id} className="bg-ocean-800 rounded-xl p-4 border border-ocean-700 flex justify-between items-center"><div className="flex items-center gap-3"><div className="relative"><img src={member.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-ocean-700" /><div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border border-ocean-800 flex items-center justify-center text-[10px] ${member.level === 'black_gold' ? 'bg-gold-500 text-black' : member.level === 'diamond' ? 'bg-blue-400 text-white' : 'bg-gray-400 text-white'}`}>{member.level === 'black_gold' ? '👑' : member.level === 'diamond' ? '💎' : '⭐'}</div></div><div><h4 className="text-white font-bold text-sm">{member.name}</h4><p className="text-gray-400 text-xs">消费总额: <span className="text-gold-500">¥{member.totalSpent.toLocaleString()}</span></p></div></div><button onClick={() => handleSendGift(member)} className="bg-ocean-700 hover:bg-ocean-600 text-gold-500 text-xs border border-gold-500/30 px-3 py-1.5 rounded-full transition-colors">赠送优惠券</button></div>))}</div></div>)}
        {activeTab === 'marketing' && (<div>{renderHeader('营销中心', <button onClick={() => setIsCouponFormOpen(true)} className="bg-ocean-800 border border-ocean-700 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 active:bg-ocean-700">新建优惠券</button>)}<div className="p-4 space-y-4">{coupons.map(coupon => (<div key={coupon.id} className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-500/30 rounded-xl p-4 flex justify-between items-center"><div> <h3 className="text-red-100 font-bold">{coupon.name}</h3> <p className="text-xs text-red-300 mt-2">{coupon.type === 'fixed' ? `减免 ¥${coupon.value}` : `${coupon.value * 10} 折`} · 满 ¥{coupon.minOrderAmount} 可用</p> </div></div>))}</div></div>)}
        {activeTab === 'settings' && (<div className="pb-20">{renderHeader('店铺设置', <button onClick={handleConfigSave} className="text-gold-500 font-bold text-sm">保存</button>)}<div className="p-4 space-y-6"><div className="space-y-3"><h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>直播引流承接配置</h3><div className="bg-ocean-800 rounded-xl border border-ocean-700 p-4 space-y-5"><div className="flex items-start justify-between"><div><span className="text-white text-sm font-bold block">同步直播间活动氛围</span><span className="text-xs text-gray-500 mt-1 block leading-relaxed">开启后，首页将显示"直播特惠"公告条及倒计时，<br/>方便承接来自抖音直播间的流量。</span></div><button onClick={() => setConfigForm(prev => ({...prev, isLiveMode: !prev.isLiveMode}))} className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 mt-1 ${configForm.isLiveMode ? 'bg-gold-600' : 'bg-ocean-700'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${configForm.isLiveMode ? 'left-7' : 'left-1'}`}></div></button></div><div className="border-t border-ocean-700/50 pt-4"><label className="text-xs text-gray-400 block mb-2 font-medium">接待公告文案 (首页顶部)</label><div className="relative"><textarea value={configForm.liveAnnouncement} onChange={e => setConfigForm({...configForm, liveAnnouncement: e.target.value})} placeholder="例如：🔥 欢迎抖音家人们！帝王蟹限时 5 折，拍下立减！" className="w-full bg-ocean-900 text-white text-sm p-3 rounded-lg border border-ocean-700 outline-none focus:border-gold-500 h-20 placeholder-gray-600 resize-none"/><div className="absolute bottom-2 right-2 text-[10px] text-gray-600">滚动播放</div></div></div><div><label className="text-xs text-gray-400 block mb-2 font-medium">本场特惠截止时间 (倒计时)</label><input type="datetime-local" value={configForm.flashSaleEndTime.substring(0, 16)} onChange={e => setConfigForm({...configForm, flashSaleEndTime: new Date(e.target.value).toISOString()})} className="w-full bg-ocean-900 text-white text-sm p-3 rounded-lg border border-ocean-700 outline-none focus:border-gold-500"/></div></div></div><div className="text-center text-xs text-gray-600 pt-10">魏来海鲜 v1.3.0 Build 20240522</div></div></div>)}
      </div>

      <div className="bg-ocean-900 border-t border-ocean-800 flex justify-around items-center h-[calc(60px+env(safe-area-inset-bottom))] pb-safe-bottom z-30 shadow-[0_-5px_10px_rgba(0,0,0,0.2)] absolute bottom-0 left-0 w-full">
          {TAB_ITEMS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform ${activeTab === tab.id ? 'text-gold-500' : 'text-gray-500'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     {tab.icon}
                 </svg>
                 <span className="text-[10px] font-medium capitalize">{tab.label}</span>
              </button>
          ))}
      </div>

      {/* Product Form */}
      {isFormOpen && (
        <div className="absolute inset-0 z-50 bg-ocean-900 flex flex-col animate-slide-in-up">
            <div className="bg-ocean-900 border-b border-ocean-800 px-4 py-3 flex items-center justify-between shadow-md pt-safe-top">
                <button onClick={() => setIsFormOpen(false)} className="text-gray-400 font-medium">取消</button>
                <h2 className="text-white font-serif font-bold">{editingProduct ? '编辑商品' : '发布新品'}</h2>
                <button onClick={handleFormSubmit} className="text-gold-500 font-bold">保存</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-xs text-gold-500 uppercase tracking-wider font-bold">基本信息</h3>
                        <div className="bg-ocean-800 p-4 rounded-xl border border-ocean-700 space-y-4">
                            <div><label className="text-xs text-gray-400 block mb-1">商品名称</label><input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-ocean-900 text-white p-3 rounded-lg border border-ocean-700 focus:border-gold-500 outline-none" placeholder="例如：阿拉斯加帝王蟹" /></div>
                            
                            {/* Variants Toggle */}
                            <div className="flex justify-between items-center py-2 border-b border-ocean-700/50">
                                <span className="text-sm text-white">多规格模式</span>
                                <div onClick={() => setVariants(variants.length > 0 ? [] : [{id: `var-${Date.now()}`, name: '默认规格', price: formData.price || 0, stock: formData.stock || 0}])} className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${variants.length > 0 ? 'bg-gold-600' : 'bg-ocean-700'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${variants.length > 0 ? 'left-7' : 'left-1'}`}></div>
                                </div>
                            </div>

                            {variants.length > 0 ? (
                                <div className="space-y-3">
                                    {variants.map((v, idx) => (
                                        <div key={v.id} className="bg-ocean-900 p-3 rounded-lg flex items-center gap-2 border border-ocean-700">
                                            <input type="text" placeholder="规格名 (如:大号)" value={v.name} onChange={e => updateVariant(idx, 'name', e.target.value)} className="w-1/3 bg-transparent text-sm text-white border-b border-ocean-600 focus:border-gold-500 outline-none pb-1" />
                                            <input type="number" placeholder="价格" value={v.price} onChange={e => updateVariant(idx, 'price', Number(e.target.value))} className="w-1/4 bg-transparent text-sm text-white border-b border-ocean-600 focus:border-gold-500 outline-none pb-1" />
                                            <input type="number" placeholder="库存" value={v.stock} onChange={e => updateVariant(idx, 'stock', Number(e.target.value))} className="w-1/4 bg-transparent text-sm text-white border-b border-ocean-600 focus:border-gold-500 outline-none pb-1" />
                                            <button type="button" onClick={() => removeVariant(idx)} className="text-red-500 ml-auto"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addVariant} className="text-gold-500 text-xs font-bold flex items-center gap-1">+ 添加规格</button>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <div className="flex-1"><label className="text-xs text-gray-400 block mb-1">价格 (¥)</label><input type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-ocean-900 text-white p-3 rounded-lg border border-ocean-700 focus:border-gold-500 outline-none" /></div>
                                    <div className="flex-1"><label className="text-xs text-gray-400 block mb-1">库存</label><input type="number" value={formData.stock || ''} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full bg-ocean-900 text-white p-3 rounded-lg border border-ocean-700 focus:border-gold-500 outline-none" /></div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <div className="flex-1"><label className="text-xs text-gray-400 block mb-1">单位</label><input type="text" value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full bg-ocean-900 text-white p-3 rounded-lg border border-ocean-700 focus:border-gold-500 outline-none" placeholder="件/kg" /></div>
                                <div className="flex-1"><label className="text-xs text-gray-400 block mb-1">分类</label><select value={formData.category || 'fish'} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full bg-ocean-900 text-white p-3 rounded-lg border border-ocean-700 focus:border-gold-500 outline-none"><option value="fish">鱼类</option><option value="crab_shrimp">虾蟹</option><option value="shell">贝类</option></select></div>
                            </div>
                        </div>
                    </div>
                    {/* ... (Other form sections remain unchanged) ... */}
                    {/* Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs text-gold-500 uppercase tracking-wider font-bold">详细信息</h3>
                        <div className="bg-ocean-800 p-4 rounded-xl border border-ocean-700 space-y-4">
                            <div><label className="text-xs text-gray-400 block mb-1">产地</label><input type="text" value={formData.origin || ''} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full bg-ocean-900 text-white p-3 rounded-lg border border-ocean-700 focus:border-gold-500 outline-none" /></div>
                            <div><label className="text-xs text-gray-400 block mb-1">商品描述</label><textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-ocean-900 text-white p-3 rounded-lg border border-ocean-700 focus:border-gold-500 outline-none h-24" /></div>
                            <div><label className="text-xs text-gray-400 block mb-1">标签 (逗号分隔)</label><input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} className="w-full bg-ocean-900 text-white p-3 rounded-lg border border-ocean-700 focus:border-gold-500 outline-none" placeholder="新鲜, 刺身, 送礼" /></div>
                        </div>
                    </div>
                    {/* Extended Info */}
                    <div className="space-y-4">
                        <h3 className="text-xs text-gold-500 uppercase tracking-wider font-bold">内容种草 (AI 自动生成/手动)</h3>
                        <div className="bg-ocean-800 p-4 rounded-xl border border-ocean-700 space-y-4">
                            <div><label className="text-xs text-gray-400 block mb-1">烹饪建议</label><textarea value={formData.cookingMethod || ''} onChange={e => setFormData({...formData, cookingMethod: e.target.value})} className="w-full bg-ocean-900 text-white p-3 rounded-lg border border-ocean-700 focus:border-gold-500 outline-none h-20" /></div>
                            <div><label className="text-xs text-gray-400 block mb-1">营养价值</label><textarea value={formData.nutrition || ''} onChange={e => setFormData({...formData, nutrition: e.target.value})} className="w-full bg-ocean-900 text-white p-3 rounded-lg border border-ocean-700 focus:border-gold-500 outline-none h-20" /></div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Shipping Modal */}
      {isShippingModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-ocean-900 w-full max-w-xs rounded-2xl border border-gold-500/30 shadow-2xl p-6 animate-scale-in">
                  <h3 className="text-white font-bold text-lg mb-2 text-center">发货处理</h3>
                  <p className="text-gray-400 text-xs text-center mb-6">请输入顺丰或冷链物流单号</p>
                  
                  <input 
                    type="text" 
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="w-full bg-ocean-800 border border-ocean-700 rounded-xl p-3 text-white text-center mb-4 focus:border-gold-500 outline-none font-mono"
                    placeholder="SF..."
                  />

                  <div className="flex gap-3">
                      <button onClick={() => setIsShippingModalOpen(false)} className="flex-1 py-2.5 text-gray-400 text-sm hover:text-white transition-colors">取消</button>
                      <button onClick={confirmShipOrder} className="flex-1 bg-gold-600 text-ocean-900 rounded-full font-bold text-sm hover:bg-gold-500 shadow-lg">确认发货</button>
                  </div>
              </div>
          </div>
      )}
      
      {/* Receipt/Picking Modal */}
      <ReceiptModal 
          order={receiptOrder}
          pickingList={pickingList} 
          onClose={() => { setReceiptOrder(null); setPickingList(undefined); }} 
          onPrint={confirmPrint} 
      />

      {isAIModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-ocean-900 w-full max-w-sm rounded-2xl border border-gold-500/30 shadow-2xl p-4">
                  <h3 className="text-white font-bold mb-2">AI 智能上架</h3>
                  <textarea className="w-full h-32 bg-ocean-800 border border-ocean-700 rounded-xl p-3 text-white" value={aiInputText} onChange={(e) => setAiInputText(e.target.value)} placeholder="粘贴商品信息 (如：澳洲大龙虾，1000元，非常新鲜...)" />
                  <div className="flex gap-2 mt-4">
                      <button onClick={() => setIsAIModalOpen(false)} className="flex-1 py-2 text-gray-400">取消</button>
                      <button onClick={handleAIGenerate} className="flex-1 bg-gold-600 text-ocean-900 rounded-lg font-bold">{isGenerating ? '分析中...' : '生成'}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
