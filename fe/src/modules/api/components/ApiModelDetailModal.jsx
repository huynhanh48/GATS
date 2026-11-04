import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Globe,
  ChevronDown,
  Layers,
  Loader2,
} from 'lucide-react';
import { aiToolsService } from '@/shared/services/aiToolsService';
import { generateApiCodeExample } from '../utils/apiCodeExamples';

/**
 * ApiModelDetailModal - Modal xem chi tiết API Provider và sinh mã tích hợp đa ngôn ngữ
 * Đồng bộ trực tiếp với các API:
 * - GET /api/ai-tools-config/api_provider/:itemKey (Chi tiết provider, endpointUrl và payload.models[])
 * - GET /api/ai-tools-config/api/:itemKey/models (Danh sách models dropdown)
 */
export default function ApiModelDetailModal({
  model,
  isOpen,
  onClose,
}) {
  const [detailedModel, setDetailedModel] = useState(model);
  const [dropdownModels, setDropdownModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [activeCodeTab, setActiveCodeTab] = useState('curl');
  const [copied, setCopied] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  // Khóa cuộn màn hình khi mở Modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Nạp chi tiết Provider và danh sách Model cho Dropdown
  useEffect(() => {
    if (!isOpen || !model?.itemKey) return;

    let mounted = true;
    setLoadingDetails(true);

    async function fetchData() {
      try {
        // 1. GET chi tiết Provider: /api/ai-tools-config/api_provider/:itemKey
        const detailPromise = aiToolsService.getItemDetail('api_provider', model.itemKey);

        // 2. GET models cho dropdown: /api/ai-tools-config/api/:itemKey/models
        const modelsPromise = aiToolsService.getApiProviderModels(model.itemKey);

        const [detailRes, modelsRes] = await Promise.all([detailPromise, modelsPromise]);

        if (mounted) {
          const merged = detailRes ? { ...model, ...detailRes } : model;
          setDetailedModel(merged);

          // Hợp nhất danh sách models từ API dropdown hoặc từ payload.models
          const apiModels = Array.isArray(modelsRes?.models) && modelsRes.models.length > 0
            ? modelsRes.models
            : Array.isArray(merged.models) && merged.models.length > 0
              ? merged.models
              : [];

          setDropdownModels(apiModels);

          // Đặt model mặc định được chọn (ưu tiên model đang active đầu tiên)
          const firstActive = apiModels.find((m) => m.isActive !== false) || apiModels[0];
          const defaultId = firstActive ? (firstActive.id || firstActive) : (merged.models?.[0]?.id || merged.itemKey);
          setSelectedModelId(defaultId || '');
        }
      } catch (err) {
        console.warn('Lỗi tải thông tin API Provider:', err);
        if (mounted) {
          setDetailedModel(model);
          const fallbackModels = Array.isArray(model.models) ? model.models : [];
          setDropdownModels(fallbackModels);
          setSelectedModelId(fallbackModels[0]?.id || fallbackModels[0] || model.itemKey);
        }
      } finally {
        if (mounted) setLoadingDetails(false);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [isOpen, model]);

  if (!isOpen || !model) return null;

  const currentModelData = detailedModel || model;
  const endpointToDisplay =
    currentModelData.endpointUrl ||
    currentModelData.websiteUrl ||
    'https://openrouter.ai/api/v1';

  // Sinh mã tích hợp tự động dựa trên Model được chọn trong Dropdown
  const activeModelStr = selectedModelId || currentModelData.models?.[0]?.id || 'gpt-4.1';

  const currentCode = generateApiCodeExample({
    providerKey: currentModelData.itemKey,
    endpoint: endpointToDisplay,
    model: activeModelStr,
    language: activeCodeTab,
    platform: typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent)
      ? 'powershell'
      : 'bash',
  });

  const handleCopyCode = () => {
    if (!currentCode) return;
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-[12px] shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200/80">
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 bg-white shrink-0">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#1a56db] uppercase tracking-wider">
                {currentModelData.provider}
              </span>
              {currentModelData.badge &&
                currentModelData.badge.toLowerCase() !== (currentModelData.price || '').toLowerCase() &&
                currentModelData.badge.toLowerCase() !== 'miễn phí' &&
                currentModelData.badge.toLowerCase() !== 'free' && (
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
                    {currentModelData.badge}
                  </span>
                )}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentModelData.isFree
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                }`}
              >
                {currentModelData.price}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#273044] leading-snug">
              {currentModelData.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Ảnh banner 16:9 full width */}
          <div className="w-full aspect-video max-h-56 sm:max-h-64 rounded-[8px] overflow-hidden bg-slate-900 shrink-0 shadow-2xs">
            <img
              src={currentModelData.image}
              alt={currentModelData.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mô tả nhà cung cấp và giải pháp API
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {currentModelData.description}
            </p>
          </div>

          {/* Đường dẫn Endpoint API (Full-width với label và nút sao chép) */}
          {endpointToDisplay && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Đường dẫn Endpoint API
              </label>
              <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-[8px] w-full">
                <div className="pl-2 text-slate-400">
                  <Globe size={15} />
                </div>
                <input
                  type="text"
                  readOnly
                  value={endpointToDisplay}
                  className="flex-1 bg-transparent text-xs text-slate-800 font-mono outline-none truncate select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(endpointToDisplay);
                    setCopiedEndpoint(true);
                    setTimeout(() => setCopiedEndpoint(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-[#1a56db] text-xs font-bold rounded-[6px] transition-colors cursor-pointer shrink-0"
                >
                  {copiedEndpoint ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span className="text-emerald-600">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
                <a
                  href={endpointToDisplay}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-[#1a56db] hover:bg-slate-100 rounded-[6px] transition-colors shrink-0"
                  title="Mở liên kết trong tab mới"
                >
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          )}

          {/* DROPDOWN CHỌN MODEL ĐỂ TẠO MÃ TÍCH HỢP (GET /api/ai-tools-config/api/:itemKey/models) */}
          <div className="space-y-2 bg-blue-50/50 p-4 rounded-[8px] border border-blue-100/80">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1a56db] flex items-center gap-1.5">
                <Layers size={15} />
                <span>Chọn Model để tạo mã tích hợp</span>
              </label>
              {loadingDetails && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> Đang cập nhật...
                </span>
              )}
            </div>

            <div className="relative">
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200/90 rounded-[8px] px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db] cursor-pointer shadow-2xs pr-10"
              >
                {dropdownModels.length > 0 ? (
                  dropdownModels.map((m) => {
                    const mId = m.id || m;
                    const isActive = m.isActive !== false;
                    return (
                      <option key={mId} value={mId}>
                        {mId} {isActive ? '(Đang hoạt động)' : '(Tạm dừng)'}
                      </option>
                    );
                  })
                ) : (
                  <option value={currentModelData.itemKey}>
                    {currentModelData.itemKey} (Mặc định)
                  </option>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown size={16} />
              </div>
            </div>

            <span className="text-[11px] text-slate-500 block">
              Mã ví dụ (cURL, Python, Node.js) bên dưới sẽ tự động cập nhật theo Model bạn vừa chọn.
            </span>
          </div>

          {/* Mã mẫu tích hợp API */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-slate-100 rounded-[6px] p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('curl')}
                  className={`px-2.5 py-1 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
                    activeCodeTab === 'curl'
                      ? 'bg-white text-[#1a56db] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  cURL
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('python')}
                  className={`px-2.5 py-1 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
                    activeCodeTab === 'python'
                      ? 'bg-white text-[#1a56db] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Python
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('node')}
                  className={`px-2.5 py-1 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
                    activeCodeTab === 'node'
                      ? 'bg-white text-[#1a56db] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Node.js
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1a56db] hover:text-[#1545b3] transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-600">Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Sao chép mã</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 bg-slate-900 text-slate-100 font-mono text-xs rounded-[8px] leading-relaxed whitespace-pre-wrap select-all max-h-56 overflow-y-auto shadow-inner">
              {currentCode}
            </div>
          </div>

          {/* Danh sách các mô hình trong hệ thống (Tất cả Model IDs) */}
          {dropdownModels.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Toàn bộ mô hình hỗ trợ ({dropdownModels.length} models)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {dropdownModels.map((m) => {
                  const mId = m.id || m;
                  const isCurrent = mId === selectedModelId;
                  const isActive = m.isActive !== false;
                  return (
                    <button
                      key={mId}
                      type="button"
                      onClick={() => setSelectedModelId(mId)}
                      className={`font-mono text-xs px-2.5 py-1 rounded-[6px] border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-[#1a56db] text-white border-[#1a56db] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200/90 hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? 'bg-emerald-400' : 'bg-slate-400'
                        }`}
                      />
                      <span>{mId}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-100 bg-slate-50 shrink-0">
          <a
            href={currentModelData.websiteUrl || 'https://openrouter.ai'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a56db] hover:text-[#1545b3] transition-colors"
          >
            <ExternalLink size={14} />
            <span>Trang tài liệu chính thức</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-[#273044] text-xs font-bold rounded-[6px] transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
