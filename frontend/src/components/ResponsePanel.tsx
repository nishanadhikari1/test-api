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

export default function ResponsePanel({ response, activeTab, setActiveTab, title }: ResponsePanelProps) {
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center gap-4 px-3 py-2 bg-[#1a1a1a] border-b border-gray-700">
        {title && <span className="text-xs text-gray-400">{title}</span>}
        <span className={`text-xs font-bold ${STATUS_COLOR(response.statusCode)}`}>{response.statusCode ?? "Error"}</span>
        {response.responseTimeMs != null && <span className="text-xs text-gray-400">{response.responseTimeMs}ms</span>}
        {response.responseBody !== null && response.responseBody !== undefined && <span className="text-xs text-gray-400">{JSON.stringify(response.responseBody).length} B</span>}
        <div className="flex gap-0 ml-auto">
          {(["body", "headers", "cookies"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-2 py-1 text-xs capitalize transition-colors ${activeTab === tab ? "text-orange-400 border-b border-orange-400" : "text-gray-500 hover:text-gray-300"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "body" && <pre className="text-xs font-mono text-gray-300 p-3 bg-[#1a1a1a] overflow-x-auto max-h-64 whitespace-pre-wrap break-words">{JSON.stringify(response.responseBody, null, 2)}</pre>}
      {activeTab === "headers" && (
        <div className="p-3 bg-[#1a1a1a] max-h-64 overflow-y-auto">
          {!response.responseHeaders || Object.keys(response.responseHeaders).length === 0 ? <p className="text-xs text-gray-500">No headers</p> : (
            <table className="w-full text-xs">
              <tbody>
                {Object.entries(response.responseHeaders).map(([k, v]) => (
                  <tr key={k} className="border-b border-gray-800">
                    <td className="py-1 pr-4 text-orange-400 font-mono font-medium w-1/3">{k}</td>
                    <td className="py-1 text-gray-300 font-mono break-all">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {activeTab === "cookies" && (
        <div className="p-3 bg-[#1a1a1a] max-h-64 overflow-y-auto">
          {response.responseHeaders?.["set-cookie"] ? <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">{response.responseHeaders["set-cookie"]}</pre> : <p className="text-xs text-gray-500">No cookies in response</p>}
        </div>
      )}
    </div>
  );
}
