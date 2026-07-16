import { useState } from "react";
import type { RunLogResult, ResponseCookie } from "../types/app";

type Props = {
  response: RunLogResult;
  activeTab: "body" | "headers" | "cookies";
  setActiveTab: (value: "body" | "headers" | "cookies") => void;
  title?: string;
};

const STATUS_COLOR = (code: number | null) => {
  if (!code) return "text-gray-500";
  if (code < 300) return "text-green-600";
  if (code < 400) return "text-blue-600";
  if (code < 500) return "text-amber-600";
  return "text-red-600";
};

function CookieRow({ cookie }: { cookie: ResponseCookie }) {
  const [expanded, setExpanded] = useState(false);

  const rows: [string, string][] = [
    ["Name", cookie.name],
    ["Value", cookie.value || "(empty)"],
    ["Domain", cookie.domain],
    ["Path", cookie.path],
    ["Expires", cookie.expires ? new Date(cookie.expires).toUTCString() : "Session"],
    ["HttpOnly", cookie.httpOnly ? "Yes" : "No"],
    ["Secure", cookie.secure ? "Yes" : "No"],
  ];

  return (
    <>
      <tr
        onClick={() => setExpanded((v) => !v)}
        className="border-b border-gray-800 hover:bg-[#252525] cursor-pointer"
      >
        <td className="px-3 py-1.5 text-orange-400 font-mono font-medium whitespace-nowrap">{cookie.name}</td>
        <td className="px-3 py-1.5 text-gray-300 font-mono max-w-[100px] truncate">
          {cookie.value || <span className="text-gray-600 italic">empty</span>}
        </td>
        <td className="px-3 py-1.5 text-gray-400 font-mono whitespace-nowrap">{cookie.domain || "—"}</td>
        <td className="px-3 py-1.5 text-gray-400 font-mono">{cookie.path}</td>
        <td className="px-3 py-1.5 text-gray-400 whitespace-nowrap">
          {cookie.expires ? new Date(cookie.expires).toUTCString() : "Session"}
        </td>
        <td className="px-3 py-1.5 text-center">
          {cookie.httpOnly ? <span className="text-green-500">✓</span> : <span className="text-gray-600">—</span>}
        </td>
        <td className="px-3 py-1.5 text-center">
          {cookie.secure ? <span className="text-green-500">✓</span> : <span className="text-gray-600">—</span>}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-gray-800 bg-[#252525]">
          <td colSpan={7} className="px-4 py-2">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {rows.map(([label, val]) => (
                <div key={label} className="flex gap-2 text-[11px]">
                  <span className="text-gray-500 w-20 flex-shrink-0">{label}</span>
                  <span className="text-gray-300 font-mono break-all">{val}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function ResponsePanel({ response, activeTab, setActiveTab, title }: Props) {
  const cookies: ResponseCookie[] = response.setCookies ?? [];

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center gap-4 px-3 py-2 bg-[#1a1a1a] border-b border-gray-700">
        {title && <span className="text-xs text-gray-400">{title}</span>}
        <span className={`text-xs font-bold ${STATUS_COLOR(response.statusCode)}`}>
          {response.statusCode ?? "Error"}
        </span>
        {response.responseTimeMs != null && (
          <span className="text-xs text-gray-400">{response.responseTimeMs}ms</span>
        )}
        {response.responseBody !== null && response.responseBody !== undefined && (
          <span className="text-xs text-gray-400">{JSON.stringify(response.responseBody).length} B</span>
        )}
        <div className="flex gap-0 ml-auto">
          {(["body", "headers", "cookies"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-1 text-xs capitalize transition-colors ${
                activeTab === tab ? "text-orange-400 border-b border-orange-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab}
              {tab === "cookies" && cookies.length > 0 && (
                <span className="ml-1 text-[9px] bg-orange-500 text-white rounded-full px-1">{cookies.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "body" && (
        <pre className="text-xs font-mono text-gray-300 p-3 bg-[#1a1a1a] overflow-x-auto max-h-64 whitespace-pre-wrap break-words">
          {JSON.stringify(response.responseBody, null, 2)}
        </pre>
      )}

      {activeTab === "headers" && (
        <div className="p-3 bg-[#1a1a1a] max-h-64 overflow-y-auto">
          {!response.responseHeaders || Object.keys(response.responseHeaders).length === 0 ? (
            <p className="text-xs text-gray-500">No headers</p>
          ) : (
            <table className="w-full text-xs">
              <tbody>
                {Object.entries(response.responseHeaders).map(([k, v]) => (
                  <tr key={k} className="border-b border-gray-800">
                    <td className="py-1 pr-4 text-orange-400 font-mono font-medium w-1/3 align-top">{k}</td>
                    <td className="py-1 text-gray-300 font-mono break-all">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "cookies" && (
        <div className="bg-[#1a1a1a] max-h-64 overflow-y-auto">
          {cookies.length === 0 ? (
            <p className="text-xs text-gray-500 p-3">No cookies in response</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-700 text-gray-500 text-[10px] uppercase tracking-wider">
                  <th className="text-left px-3 py-1.5 font-medium">Name</th>
                  <th className="text-left px-3 py-1.5 font-medium">Value</th>
                  <th className="text-left px-3 py-1.5 font-medium">Domain</th>
                  <th className="text-left px-3 py-1.5 font-medium">Path</th>
                  <th className="text-left px-3 py-1.5 font-medium">Expires</th>
                  <th className="text-left px-3 py-1.5 font-medium">HttpOnly</th>
                  <th className="text-left px-3 py-1.5 font-medium">Secure</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((c) => (
                  <CookieRow key={c.id} cookie={c} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}