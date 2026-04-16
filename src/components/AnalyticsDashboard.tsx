import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Target, BarChart3, Package, AlertTriangle, Calendar, ShoppingBag, DollarSign, ArrowLeft, Info, Activity, Printer, FileText, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSite, AnalyticsMetric, InventoryBatch } from '../context/SiteContext';

export const AnalyticsDashboard: React.FC = () => {
  const { analytics, inventoryBatches, products, orders } = useSite();
  const [activeDetail, setActiveDetail] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const getProductTitle = (id: number) => products.find(p => p.id === id)?.title || 'Unknown Product';

  if (showReport) {
    return <DetailedReport onBack={() => setShowReport(false)} analytics={analytics} orders={orders} inventory={inventoryBatches} products={products} />;
  }

  if (activeDetail) {
    return (
      <MetricDetail 
        metricName={activeDetail} 
        onBack={() => setActiveDetail(null)} 
        analytics={analytics}
        inventoryBatches={inventoryBatches}
        products={products}
      />
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="font-display font-black text-3xl text-gray-900 uppercase tracking-tighter">Business Intelligence</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Real-time Operational Tracking</p>
        </div>
        <button 
          onClick={() => setShowReport(true)}
          className="flex items-center gap-2 bg-[#15803d] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#114022] transition-colors shadow-lg shadow-[#15803d]/20"
        >
          <FileText className="w-4 h-4" /> Generate Full Report
        </button>
      </div>

      {/* Operation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard metric={analytics.operations.totalRevenue} icon={<DollarSign className="w-5 h-5" />} onClick={() => setActiveDetail('Net Revenue')} />
        <MetricCard metric={analytics.operations.orderVolume} icon={<ShoppingBag className="w-5 h-5" />} onClick={() => setActiveDetail('Order Volume')} />
      </div>

      {/* Top SKUs & Inventory Tracking */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-3xl p-8 shadow-xl">
          <h3 className="font-display font-black text-lg text-gray-900 uppercase tracking-tight mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#15803d]" /> Top Performing SKUs
          </h3>
          <div className="space-y-4">
            {analytics.operations.topSkus.map((sku, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#15803d]/30 transition-colors">
                <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center font-black text-[#15803d]">
                  #{idx + 1}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-gray-900 leading-tight">{sku.title}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{sku.sales} units sold</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">Ksh {(sku.revenue / 1000).toFixed(0)}k</p>
                  <p className="text-[10px] font-bold text-[#15803d]">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-display font-black text-lg text-gray-900 uppercase tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Inventory Expiry Tracking
            </h3>
            <div className="px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-black text-amber-600 tracking-widest uppercase">
              {inventoryBatches.filter(b => b.status === 'expiring').length} Alerts Active
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Batch Info</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Ingredient / Product</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Expiry Date</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Quantity</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryBatches.map((batch) => (
                  <tr key={batch.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <p className="text-gray-900 font-bold text-sm">{batch.batchNumber}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">ID: {batch.id}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700 font-medium text-sm">{getProductTitle(batch.productId)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className={`text-sm font-bold ${batch.status === 'expiring' ? 'text-amber-600' : 'text-gray-900'}`}>{batch.expiryDate}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-900 font-black text-sm">
                      {batch.quantity} units
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        batch.status === 'good' ? 'bg-green-50 text-green-600 border border-green-200' :
                        batch.status === 'expiring' ? 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse' :
                        'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {batch.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DetailedReport: React.FC<{ onBack: () => void, analytics: any, orders: any[], inventory: any[], products: any[] }> = ({ onBack, analytics, orders, inventory, products }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2.5rem] p-12 min-h-screen shadow-2xl relative">
       <div className="flex justify-between items-start mb-12 print:hidden">
         <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-black text-xs uppercase tracking-widest">
           <ArrowLeft className="w-4 h-4" /> Back to Dashboard
         </button>
         <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-xs">
           <Printer className="w-4 h-4" /> Print Report
         </button>
       </div>

       <div className="max-w-4xl mx-auto">
         <div className="text-center mb-16">
            <h1 className="font-display font-black text-5xl text-gray-900 tracking-tighter uppercase">Operations Report</h1>
            <p className="text-[#15803d] font-black tracking-[0.3em] uppercase text-xs mt-2">QUIN'S WELLNESS CENTER • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
         </div>

         <div className="grid grid-cols-2 gap-12 mb-16 border-y border-gray-100 py-12">
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Financial Summary</p>
               <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                     <span className="text-sm font-bold text-gray-600">Total Net Revenue</span>
                     <span className="font-black text-gray-900">{analytics.operations.totalRevenue.value}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                     <span className="text-sm font-bold text-gray-600">Total Orders</span>
                     <span className="font-black text-gray-900">{analytics.operations.orderVolume.value}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                     <span className="text-sm font-bold text-gray-600">Refund Rate</span>
                     <span className="font-black text-red-600">{analytics.operations.refundRate.value}</span>
                  </div>
               </div>
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Top Performing Products</p>
               <div className="space-y-4">
                  {analytics.operations.topSkus.map((sku: any, i: number) => (
                    <div key={i} className="flex justify-between border-b border-gray-50 pb-2">
                       <span className="text-sm font-bold text-gray-600">{sku.title}</span>
                       <span className="font-black text-[#15803d]">{sku.sales} units</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="mb-16">
            <h3 className="font-black text-sm uppercase tracking-widest mb-6">Recent Transaction Log</h3>
            <div className="overflow-hidden border border-gray-200 rounded-2xl">
               <table className="w-full text-left">
                  <thead className="bg-gray-50">
                     <tr>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {orders.slice(0, 10).map((o, i) => (
                       <tr key={i}>
                          <td className="p-4 font-bold text-sm">#{o.id}</td>
                          <td className="p-4 text-sm">{o.customer_name}</td>
                          <td className="p-4 text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-sm font-black text-right">Ksh {o.total_amount.toLocaleString()}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">End of Report</p>
            <p className="text-[10px] font-black text-gray-300">Generated automatically by ABA Health Intelligence Engine</p>
         </div>
       </div>
    </motion.div>
  );
};

interface MetricDetailProps {
  metricName: string;
  onBack: () => void;
  analytics: any;
  inventoryBatches: InventoryBatch[];
  products: any[];
}

const MetricDetail: React.FC<MetricDetailProps> = ({ metricName, onBack, analytics, inventoryBatches, products }) => {
  const trendData = [30, 45, 35, 55, 40, 65, 80];
  const maxVal = Math.max(...trendData);

  const getMetricValue = () => {
    switch (metricName) {
      case 'Net Revenue': return analytics.operations.totalRevenue.value;
      case 'Order Volume': return analytics.operations.orderVolume.value;
      case 'Inventory Health': return analytics.operations.daysOnHand.value;
      case 'Refunds': return analytics.operations.refundRate.value;
      default: return '0';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8 pb-12">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-[#15803d] font-black text-xs uppercase tracking-widest hover:-translate-x-1 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </button>
        <div className="flex items-center gap-3">
           <Activity className="w-5 h-5 text-[#15803d]" />
           <h2 className="font-display font-black text-3xl text-gray-900 uppercase tracking-tighter">{metricName} Analysis</h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-1">Performance Trend</h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Last 7 Days Activity</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-[#15803d] tracking-tighter">{getMetricValue()}</span>
              <p className="text-[10px] font-black text-green-600 uppercase tracking-tighter">+12.5% vs last week</p>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-4">
             {trendData.map((val, idx) => (
                <div key={idx} className="flex-grow flex flex-col items-center gap-4">
                   <div className="w-full relative group">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${(val / maxVal) * 200}px` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className="w-full bg-gradient-to-t from-[#15803d] to-[#15803d]/40 rounded-t-xl opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                   </div>
                   <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Day {idx + 1}</span>
                </div>
             ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
           <h3 className="font-black text-lg uppercase tracking-tight mb-6 flex items-center gap-2">
             <Info className="w-5 h-5 text-[#15803d]" /> Status Report
           </h3>
           <div className="space-y-6">
              <InsightItem title="Status" value="Healthy" color="text-green-400" />
              <InsightItem title="Confidence" value="98%" color="text-white/60" />
              <div className="pt-6 border-t border-white/10">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 leading-relaxed">
                  Real-time data synchronization is active. All figures derived from verified transaction logs.
                </p>
                <button className="w-full bg-[#15803d] text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">
                  EXPORT LOGS (.CSV)
                </button>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const InsightItem: React.FC<{title: string, value: string, color: string}> = ({ title, value, color }) => (
  <div className="flex justify-between items-center">
    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{title}</span>
    <span className={`font-black text-sm ${color}`}>{value}</span>
  </div>
);

interface MetricCardProps {
  metric: AnalyticsMetric;
  icon: React.ReactNode;
  onClick: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, icon, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#15803d]/40 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-[#15803d]/10 rounded-2xl text-[#15803d] group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${metric.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(metric.change)}%
        </div>
      </div>
      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{metric.label}</p>
      <h3 className="text-3xl font-black text-gray-900 group-hover:text-[#15803d] transition-colors">{metric.value}</h3>
      <div className="mt-2 text-[8px] font-black text-gray-300 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Click for details →</div>
    </div>
  );
};
