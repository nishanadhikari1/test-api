import { useMemo } from "react";
import { Play, Plus, X } from "lucide-react";
import type { KeyValuePair } from "../types/app";

type RequestBuilderProps = {
  name: string;
  setName: (value: string) => void;
  method: string;
  setMethod: (value: string) => void;
  url: string;
  setUrl: (value: string) => void;
  requestTab: "params" | "headers" | "body" | "auth";
  setRequestTab: (value: "params" | "headers" | "body" | "auth") => void;
  params: KeyValuePair[];
  setParams: (value: KeyValuePair[]) => void;
  reqHeaders: KeyValuePair[];
  setReqHeaders: (value: KeyValuePair[]) => void;
  bodyType: "none" | "json" | "form";
  setBodyType: (value: "none" | "json" | "form") => void;
  bodyRaw: string;
  setBodyRaw: (value: string) => void;
  authType: "none" | "bearer";
  setAuthType: (value: "none" | "bearer") => void;
  authToken: string;
  setAuthToken: (value: string) => void;
  saving: boolean;
  selectedRequestId: string | null;
  onSave: (e: React.FormEvent) => void;
  onSendNow: () => void;
  sendingDirect: boolean;
  error: string;
};

const DEFAULT_HEADER_PRESETS: KeyValuePair[] = [
  { key: "Accept", value: "application/json", enabled: true },
  { key: "Accept-Language", value: "en-US,en;q=0.9", enabled: true },
  { key: "Cache-Control", value: "no-cache", enabled: true },
  { key: "Content-Type", value: "application/json", enabled: true },
  { key: "User-Agent", value: "API-Workspace/1.0", enabled: true },
  { key: "X-Requested-With", value: "XMLHttpRequest", enabled: true },
  { key: "X-Api-Key", value: "", enabled: false },
  { key: "X-Correlation-ID", value: "", enabled: false },
];

function createEmptyPair(): KeyValuePair {
  return { key: "", value: "", enabled: true };
}

function KeyValueEditor({
  pairs,
  onChange,
  placeholder = "Key",
}: {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  placeholder?: string;
}) {
  function update(index: number, field: keyof KeyValuePair, value: string | boolean) {
    const next = [...pairs];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  }

  function addRow() {
    onChange([...pairs, createEmptyPair()]);
  }

  function removeRow(index: number) {
    onChange(pairs.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-1">
      {pairs.map((pair, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="checkbox" checked={pair.enabled} onChange={(e) => update(i, "enabled", e.target.checked)} className="flex-shrink-0 accent-orange-400" />
          <input value={pair.key} onChange={(e) => update(i, "key", e.target.value)} placeholder={placeholder} className="flex-1 px-2 py-1.5 border border-gray-600 bg-[#2a2a2a] rounded text-xs font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-400" />
          <input value={pair.value} onChange={(e) => update(i, "value", e.target.value)} placeholder="Value" className="flex-1 px-2 py-1.5 border border-gray-600 bg-[#2a2a2a] rounded text-xs font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-400" />
          <button type="button" onClick={() => removeRow(i)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
            <X size={12} />
          </button>
        </div>
      ))}
      <button type="button" onClick={addRow} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 mt-1">
        <Plus size={12} /> Add row
      </button>
    </div>
  );
}

export default function RequestBuilder({
  name,
  setName,
  method,
  setMethod,
  url,
  setUrl,
  requestTab,
  setRequestTab,
  params,
  setParams,
  reqHeaders,
  setReqHeaders,
  bodyType,
  setBodyType,
  bodyRaw,
  setBodyRaw,
  authType,
  setAuthType,
  authToken,
  setAuthToken,
  saving,
  selectedRequestId,
  onSave,
  onSendNow,
  sendingDirect,
  error,
}: RequestBuilderProps) {
  const headerCount = useMemo(() => reqHeaders.filter((item) => item.enabled && item.key).length, [reqHeaders]);
  const paramCount = useMemo(() => params.filter((item) => item.enabled && item.key).length, [params]);

  function addPresetHeader(preset: KeyValuePair) {
    if (reqHeaders.some((item) => item.key.toLowerCase() === preset.key.toLowerCase())) {
      return;
    }
    setReqHeaders([...reqHeaders, { ...preset }]);
  }

  return (
    <div className="border-b border-gray-700 bg-[#1e1e1e] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">{selectedRequestId ? "Editing saved request" : "Create a request"}</p>
      </div>
      <form onSubmit={onSave}>
        <div className="flex gap-2 mb-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Request name" className="w-40 px-2 py-1.5 bg-[#2a2a2a] border border-gray-600 rounded text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-400" />
          <select value={method} onChange={(e) => setMethod(e.target.value)} className={`px-2 py-1.5 bg-[#2a2a2a] border border-gray-600 rounded text-xs font-bold focus:outline-none focus:border-orange-400 ${method === "GET" ? "text-green-400" : method === "DELETE" ? "text-red-400" : method === "POST" ? "text-yellow-400" : "text-blue-400"}`}>
            {['GET','POST','PUT','PATCH','DELETE'].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" className="flex-1 px-3 py-1.5 bg-[#2a2a2a] border border-gray-600 rounded text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-400 font-mono" />
          <button type="submit" disabled={saving} className="px-4 py-1.5 bg-orange-500 text-white rounded text-xs font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : selectedRequestId ? "Update" : "Save"}
          </button>
          <button type="button" onClick={onSendNow} disabled={sendingDirect} className="px-4 py-1.5 bg-[#2d2d2d] text-gray-100 rounded text-xs font-semibold hover:bg-[#363636] disabled:opacity-50 transition-colors flex items-center gap-1.5">
            <Play size={10} />
            {sendingDirect ? "Sending..." : "Send now"}
          </button>
        </div>

        <div className="flex gap-0 border-b border-gray-700 mb-3">
          {(["params", "headers", "body", "auth"] as const).map((tab) => (
            <button key={tab} type="button" onClick={() => setRequestTab(tab)} className={`px-3 py-1.5 text-xs capitalize transition-colors border-b-2 -mb-px ${requestTab === tab ? "border-orange-400 text-orange-400" : "border-transparent text-gray-400 hover:text-gray-200"}`}>
              {tab}
              {tab === "params" && paramCount > 0 && <span className="ml-1 text-orange-400">·</span>}
              {tab === "headers" && headerCount > 0 && <span className="ml-1 text-orange-400">·</span>}
              {tab === "body" && bodyRaw && <span className="ml-1 text-orange-400">·</span>}
              {tab === "auth" && authType !== "none" && <span className="ml-1 text-orange-400">·</span>}
            </button>
          ))}
        </div>

        <div className="min-h-[80px]">
          {requestTab === "params" && <KeyValueEditor pairs={params} onChange={setParams} placeholder="Parameter" />}
          {requestTab === "headers" && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {DEFAULT_HEADER_PRESETS.map((preset) => (
                  <button key={preset.key} type="button" onClick={() => addPresetHeader(preset)} className="px-2 py-1 border border-gray-700 rounded text-[11px] text-gray-300 hover:border-orange-400 hover:text-orange-400">
                    + {preset.key}
                  </button>
                ))}
              </div>
              <KeyValueEditor pairs={reqHeaders} onChange={setReqHeaders} placeholder="Header" />
            </div>
          )}
          {requestTab === "body" && (
            <div className="space-y-2">
              <div className="flex gap-3">
                {(["none", "json", "form"] as const).map((t) => (
                  <label key={t} className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                    <input type="radio" name="bodyType" value={t} checked={bodyType === t} onChange={() => setBodyType(t)} className="accent-orange-400" />
                    {t === "none" ? "none" : t === "json" ? "raw JSON" : "form-data"}
                  </label>
                ))}
              </div>
              {bodyType === "json" && <textarea value={bodyRaw} onChange={(e) => setBodyRaw(e.target.value)} placeholder='{"key": "value"}' rows={4} className="w-full px-2 py-1.5 bg-[#2a2a2a] border border-gray-600 rounded text-xs font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-400" />}
              {bodyType === "form" && <KeyValueEditor pairs={params} onChange={setParams} placeholder="Field" />}
            </div>
          )}
          {requestTab === "auth" && (
            <div className="space-y-2">
              <div className="flex gap-3">
                {(["none", "bearer"] as const).map((t) => (
                  <label key={t} className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                    <input type="radio" name="authType" value={t} checked={authType === t} onChange={() => setAuthType(t)} className="accent-orange-400" />
                    {t === "none" ? "No auth" : "Bearer token"}
                  </label>
                ))}
              </div>
              {authType === "bearer" && <input value={authToken} onChange={(e) => setAuthToken(e.target.value)} placeholder="Your bearer token" className="w-full px-2 py-1.5 bg-[#2a2a2a] border border-gray-600 rounded text-xs font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-400" />}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </form>
    </div>
  );
}
