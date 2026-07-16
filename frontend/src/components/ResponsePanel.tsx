import { useState } from "react";
import type { RunLogResult } from "../types/app";

type ResponsePanelProps = {
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

type ParsedCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: string;
};

function parseSetCookieString(raw: string): ParsedCookie {
  const parts = raw.split(";").map((p) => p.trim());
  const [nameRaw, ...attrs] = parts;
  const eqIdx = (nameRaw ?? "").indexOf("=");
  const name = eqIdx !== -1 ? nameRaw!.slice(0, eqIdx).trim() : nameRaw ?? "";
  const value = eqIdx !== -1 ? nameRaw!.slice(eqIdx + 1).trim() : "";

  let domain = "";
  let path = "/";
  let expires = "Session";
  let httpOnly = false;
  let secure = false;
  let sameSite = "";

  for (const attr of attrs) {
    const lower = attr.toLowerCase();
    if (lower === "httponly") httpOnly = true;
    else if (lower === "secure") secure = true;
    else if (lower.startsWith("domain=")) domain = attr.slice(7);
    else if (lower.startsWith("path=")) path = attr.slice(5) || "/";
    else if (lower.startsWith("samesite=")) sameSite = attr.slice(9);
    else if (lower.startsWith("expires=")) {
      const d = new Date(attr.slice(8));
      if (!isNaN(d.getTime())) expires = d.toUTCString();
    } else if (lower.startsWith("max-age=")) {
      const s = parseInt(attr.slice(8), 10);
      if (!isNaN(s)) expires = new Date(Date.now() + s * 1000).toUTCString();
    }
  }

  return { name, value, domain, path, expires, httpOnly, secure, sameSite };
}

function parseCookiesFromHeaders(headers: Record<string, string> | null): ParsedCookie[] {
  if (!headers) return [];
  const raw = headers["set-cookie"];
  if (!raw) return [];
  const entries = raw.split(/,\s*(?=[^;,=\s]+=[^;,]*)/);
  return entries.map(parseSetCookieString);
}

export default function ResponsePanel({ response, activeTab, setActiveTab, title }: ResponsePanelProps) {
  const [expandedCookie, setExpandedCookie] = useState<string | null>(null);
  const cookies = parseCookiesFromHeaders(response.responseHeaders);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center gap-4 px-3 py-2 bg-[#1a1a1a] border-b border-gray-700">
        {title && <span className="text-xs text-gray-400">{title}</span>}
        <span className={`text-xs font-bold ${STATUS_COLOR(response.statusCode)}`}>{response.statusCode ?? "Error"}</span>
        {response.responseTimeMs != null && <span className="text-xs text-gray-400">{response.responseTimeMs}ms</span>}
        {response.responseBody !== null && response.responseBody !== undefined && (
          <span className="text-xs text-gray-400">{JSON.stringify(response.responseBody).length} B</span>
        )}
        <div className="flex gap-0 ml-auto">
          {(["body", "headers", "cookies"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-1 text-xs capitalize transition-colors ${activeTab === tab ? "text-orange-400 border-b border-orange-400" : "text-gray-500 hover:text-gray-300"}`}
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
                  <th className="text-left px-3 py-1.5 font-medium">SameSite</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((c, i) => (
                  <>
                    <tr
                      key={`row-${i}`}
                      onClick={() => setExpandedCookie(expandedCookie === `${c.name}-${i}` ? null : `${c.name}-${i}`)}
                      className="border-b border-gray-800 hover:bg-[#252525] cursor-pointer"
                    >
                      <td className="px-3 py-1.5 text-orange-400 font-mono font-medium whitespace-nowrap">{c.name}</td>
                      <td className="px-3 py-1.5 text-gray-300 font-mono max-w-[100px] truncate">
                        {c.value || <span className="text-gray-600 italic">empty</span>}
                      </td>
                      <td className="px-3 py-1.5 text-gray-400 font-mono whitespace-nowrap">{c.domain || "—"}</td>
                      <td className="px-3 py-1.5 text-gray-400 font-mono">{c.path}</td>
                      <td className="px-3 py-1.5 text-gray-400 whitespace-nowrap">{c.expires}</td>
                      <td className="px-3 py-1.5 text-center">{c.httpOnly ? <span className="text-green-500">✓</span> : <span className="text-gray-600">—</span>}</td>
                      <td className="px-3 py-1.5 text-center">{c.secure ? <span className="text-green-500">✓</span> : <span className="text-gray-600">—</span>}</td>
                      <td className="px-3 py-1.5 text-gray-400">{c.sameSite || "—"}</td>
                    </tr>
                    {expandedCookie === `${c.name}-${i}` && (
                      <tr key={`expanded-${i}`} className="border-b border-gray-800 bg-[#252525]">
                        <td colSpan={8} className="px-4 py-2">
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                            {([
                              ["Name", c.name],
                              ["Value", c.value || "(empty)"],
                              ["Domain", c.domain || "(from request)"],
                              ["Path", c.path],
                              ["Expires", c.expires],
                              ["HttpOnly", c.httpOnly ? "Yes" : "No"],
                              ["Secure", c.secure ? "Yes" : "No"],
                              ["SameSite", c.sameSite || "(not set)"],
                            ] as [string, string][]).map(([label, val]) => (
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}