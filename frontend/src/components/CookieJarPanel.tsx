import { useEffect, useState, useCallback } from "react";
import { Cookie, Trash2, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { apiFetch } from "../lib/api";
import type { CookieJarByDomain, StoredCookie } from "../types/app";

type Props = {
  refreshKey: number;
};

export default function CookieJarPanel({ refreshKey }: Props) {
  const [jar, setJar] = useState<CookieJarByDomain>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [expandedCookies, setExpandedCookies] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiFetch("/cookiejar", { method: "GET" });
      setJar(result as CookieJarByDomain);
      setExpandedDomains(new Set(Object.keys(result as CookieJarByDomain)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function clearDomain(domain: string) {
    if (!window.confirm(`Clear all cookies for ${domain}?`)) return;
    try {
      await apiFetch(`/cookiejar/${encodeURIComponent(domain)}`, { method: "DELETE" });
      setJar((prev) => {
        const next = { ...prev };
        delete next[domain];
        return next;
      });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function clearAll() {
    if (!window.confirm("Clear all cookies in the jar?")) return;
    try {
      await apiFetch("/cookiejar", { method: "DELETE" });
      setJar({});
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function deleteCookie(domain: string, cookie: StoredCookie) {
    try {
      await apiFetch(`/cookiejar/cookies/${cookie.id}`, { method: "DELETE" });
      setJar((prev) => {
        const domainCookies = (prev[domain] ?? []).filter((c) => c.id !== cookie.id);
        if (domainCookies.length === 0) {
          const next = { ...prev };
          delete next[domain];
          return next;
        }
        return { ...prev, [domain]: domainCookies };
      });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function toggleDomain(domain: string) {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      next.has(domain) ? next.delete(domain) : next.add(domain);
      return next;
    });
  }

  function toggleCookie(id: string) {
    setExpandedCookies((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const domains = Object.keys(jar);
  const totalCount = domains.reduce((n, d) => n + jar[d].length, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Cookie size={13} className="text-orange-400" />
          <span className="text-xs font-medium text-gray-300">Cookie Jar</span>
          {totalCount > 0 && (
            <span className="text-[10px] bg-orange-500 text-white rounded-full px-1.5 py-0.5 font-medium">
              {totalCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={load} disabled={loading} title="Refresh" className="p-1 text-gray-400 hover:text-gray-200 disabled:opacity-40">
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          </button>
          {totalCount > 0 && (
            <button onClick={clearAll} title="Clear all cookies" className="p-1 text-gray-400 hover:text-red-400">
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error && <p className="text-xs text-red-400 px-3 py-2">{error}</p>}

        {!loading && domains.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <Cookie size={20} className="text-gray-600 mb-2" />
            <p className="text-xs text-gray-500">No cookies yet.</p>
            <p className="text-[11px] text-gray-600 mt-1">
              Cookies from API responses are stored here and sent automatically with future requests to the same domain.
            </p>
          </div>
        )}

        {domains.map((domain) => {
          const cookies = jar[domain];
          const isDomainExpanded = expandedDomains.has(domain);

          return (
            <div key={domain} className="border-b border-gray-800">
              <div className="flex items-center gap-1 px-2 py-1.5 hover:bg-[#252525]">
                <button onClick={() => toggleDomain(domain)} className="flex-1 flex items-center gap-1.5 text-left">
                  {isDomainExpanded
                    ? <ChevronDown size={11} className="text-gray-500 flex-shrink-0" />
                    : <ChevronRight size={11} className="text-gray-500 flex-shrink-0" />
                  }
                  <span className="text-xs font-medium text-gray-300 truncate">{domain}</span>
                  <span className="text-[10px] text-gray-500 ml-1">
                    {cookies.length} cookie{cookies.length !== 1 ? "s" : ""}
                  </span>
                </button>
                <button onClick={() => clearDomain(domain)} title={`Clear cookies for ${domain}`} className="p-0.5 text-gray-500 hover:text-red-400 flex-shrink-0">
                  <Trash2 size={10} />
                </button>
              </div>

              {isDomainExpanded && (
                <div className="ml-4 border-l border-gray-800">
                  {cookies.map((cookie) => {
                    const isCookieExpanded = expandedCookies.has(cookie.id);
                    return (
                      <div key={cookie.id} className="border-b border-gray-800 last:border-0">
                        <div
                          onClick={() => toggleCookie(cookie.id)}
                          className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#252525] cursor-pointer group"
                        >
                          {isCookieExpanded
                            ? <ChevronDown size={10} className="text-gray-600 flex-shrink-0" />
                            : <ChevronRight size={10} className="text-gray-600 flex-shrink-0" />
                          }
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-mono text-orange-400 font-medium truncate">{cookie.name}</span>
                              {cookie.httpOnly && (
                                <span className="text-[9px] bg-gray-700 text-gray-400 rounded px-1 flex-shrink-0">HttpOnly</span>
                              )}
                            </div>
                            {!isCookieExpanded && (
                              <p className="text-[10px] font-mono text-gray-500 truncate mt-0.5">
                                {cookie.value || <span className="italic text-gray-600">empty</span>}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteCookie(domain, cookie); }}
                            className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 flex-shrink-0"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>

                        {isCookieExpanded && (
                          <div className="mx-3 mb-2 rounded border border-gray-700 overflow-hidden">
                            <table className="w-full text-[11px]">
                              <tbody>
                                {([
                                  ["Name", cookie.name],
                                  ["Value", cookie.value || "(empty)"],
                                  ["Domain", domain],
                                  ["Path", cookie.path],
                                  ["Expires", cookie.expires ? new Date(cookie.expires).toUTCString() : "Session"],
                                  ["HttpOnly", cookie.httpOnly ? "Yes" : "No"],
                                ] as [string, string][]).map(([label, val], idx) => (
                                  <tr key={label} className={idx % 2 === 0 ? "bg-[#1e1e1e]" : "bg-[#252525]"}>
                                    <td className="px-2 py-1 text-gray-500 font-medium w-20 whitespace-nowrap">{label}</td>
                                    <td className="px-2 py-1 text-gray-300 font-mono break-all">{val}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}