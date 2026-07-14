import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send, Play } from "lucide-react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import RequestBuilder from "../components/RequestBuilder";
import ResponsePanel from "../components/ResponsePanel";
import type { Collection, KeyValuePair, RequestItem, RunLogResult } from "../types/app";

const DEFAULT_HEADER_PRESETS: KeyValuePair[] = [
  { key: "Accept", value: "application/json", enabled: true },
  { key: "Accept-Language", value: "en-US,en;q=0.9", enabled: true },
  { key: "Cache-Control", value: "no-cache", enabled: true },
  { key: "Content-Type", value: "application/json", enabled: true },
  { key: "User-Agent", value: "API-Workspace/1.0", enabled: true },
];

function createEmptyPair(): KeyValuePair {
  return { key: "", value: "", enabled: true };
}

function normalizeHeaders(headers: unknown): KeyValuePair[] {
  if (!headers || typeof headers !== "object") {
    return [createEmptyPair()];
  }

  const entries = Object.entries(headers as Record<string, unknown>);
  if (entries.length === 0) {
    return [createEmptyPair()];
  }

  return entries.map(([key, value]) => ({
    key,
    value: typeof value === "string" ? value : JSON.stringify(value),
    enabled: true,
  }));
}

function parseQueryParams(url: string): KeyValuePair[] {
  try {
    const parsedUrl = new URL(url);
    const params = Array.from(parsedUrl.searchParams.entries());
    if (params.length === 0) return [createEmptyPair()];
    return params.map(([key, value]) => ({ key, value, enabled: true }));
  } catch {
    const queryIndex = url.indexOf("?");
    if (queryIndex === -1) return [createEmptyPair()];

    const query = url.slice(queryIndex + 1);
    const pairs = query
      .split("&")
      .filter(Boolean)
      .map((part) => {
        const [key = "", value = ""] = part.split("=");
        return { key: decodeURIComponent(key), value: decodeURIComponent(value), enabled: true };
      });

    return pairs.length > 0 ? pairs : [createEmptyPair()];
  }
}

function isJsonLike(value: unknown): value is Record<string, unknown> | unknown[] {
  return typeof value === "object" && value !== null;
}

export default function Homepage() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [collections, setCollections] = useState<Collection[] | null>(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [collectionsError, setCollectionsError] = useState("");
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [collectionDraftName, setCollectionDraftName] = useState("");

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [requestsByCollection, setRequestsByCollection] = useState<Record<string, RequestItem[]>>({});
  const [loadingRequestsFor, setLoadingRequestsFor] = useState<Set<string>>(new Set());

  const [name, setName] = useState("");
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [requestTab, setRequestTab] = useState<"params" | "headers" | "body" | "auth">("headers");
  const [params, setParams] = useState<KeyValuePair[]>([createEmptyPair()]);
  const [reqHeaders, setReqHeaders] = useState<KeyValuePair[]>(DEFAULT_HEADER_PRESETS.map((item) => ({ ...item })));
  const [bodyType, setBodyType] = useState<"none" | "json" | "form">("none");
  const [bodyRaw, setBodyRaw] = useState("");
  const [authType, setAuthType] = useState<"none" | "bearer">("none");
  const [authToken, setAuthToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const [sendingRequestId, setSendingRequestId] = useState<string | null>(null);
  const [responsesByRequest, setResponsesByRequest] = useState<Record<string, RunLogResult>>({});
  const [responseTab, setResponseTab] = useState<Record<string, "body" | "headers" | "cookies">>({});
  const [sendingDirect, setSendingDirect] = useState(false);
  const [directResponse, setDirectResponse] = useState<RunLogResult | null>(null);
  const [directResponseTab, setDirectResponseTab] = useState<"body" | "headers" | "cookies">("body");

  useEffect(() => {
    async function loadCollections() {
      try {
        const result = await apiFetch("/collections", { method: "GET" });
        setCollections(result as Collection[]);
      } catch (err) {
        setCollectionsError((err as Error).message);
      } finally {
        setCollectionsLoading(false);
      }
    }

    loadCollections();
  }, []);

  useEffect(() => {
    if (!collectionId) {
      resetBuilder();
    }
  }, [collectionId]);

  function resetBuilder() {
    setName("");
    setMethod("GET");
    setUrl("");
    setRequestTab("headers");
    setParams([createEmptyPair()]);
    setReqHeaders(DEFAULT_HEADER_PRESETS.map((item) => ({ ...item })));
    setBodyType("none");
    setBodyRaw("");
    setAuthType("none");
    setAuthToken("");
    setSelectedRequestId(null);
    setCreateError("");
    setDirectResponse(null);
  }

  function populateRequestForm(request: RequestItem) {
    setName(request.name);
    setMethod((request.method || "GET").toUpperCase());
    setUrl(request.url || "");
    setRequestTab("headers");
    setParams(parseQueryParams(request.url));
    setReqHeaders(normalizeHeaders(request.headers));
    setBodyType("none");
    setBodyRaw("");
    setAuthType("none");
    setAuthToken("");

    const headersObj = (request.headers as Record<string, string> | undefined) ?? {};
    const authHeader = headersObj.Authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      setAuthType("bearer");
      setAuthToken(authHeader.replace("Bearer ", ""));
    }

    if (request.body !== undefined && request.body !== null) {
      if (typeof request.body === "string") {
        setBodyType("json");
        setBodyRaw(request.body);
      } else if (isJsonLike(request.body)) {
        setBodyType("json");
        setBodyRaw(JSON.stringify(request.body, null, 2));
      }
    }
  }

  async function toggleCollection(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    if (!requestsByCollection[id]) {
      setLoadingRequestsFor((prev) => new Set(prev).add(id));
      try {
        const result = await apiFetch(`/collections/${id}/requests`, { method: "GET" });
        setRequestsByCollection((prev) => ({ ...prev, [id]: result as RequestItem[] }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRequestsFor((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }
  }

  async function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCollectionsError("");
    try {
      const newCollection = await apiFetch("/collections", {
        method: "POST",
        body: JSON.stringify({ name: newCollectionName }),
      });
      setCollections((prev) => (prev ? [...prev, newCollection as Collection] : [newCollection as Collection]));
      setNewCollectionName("");
      navigate(`/collections/${(newCollection as Collection).id}`);
    } catch (err) {
      setCollectionsError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateCollection(collectionIdToUpdate: string) {
    try {
      const updated = await apiFetch(`/collections/${collectionIdToUpdate}`, {
        method: "PATCH",
        body: JSON.stringify({ name: collectionDraftName }),
      });
      setCollections((prev) => (prev ? prev.map((item) => (item.id === collectionIdToUpdate ? (updated as Collection) : item)) : prev));
      setEditingCollectionId(null);
      setCollectionDraftName("");
    } catch (err) {
      setCollectionsError((err as Error).message);
    }
  }

  async function handleDeleteCollection(collectionIdToDelete: string) {
    if (!window.confirm("Delete this collection and all its requests?")) return;
    try {
      await apiFetch(`/collections/${collectionIdToDelete}`, { method: "DELETE" });
      setCollections((prev) => prev?.filter((item) => item.id !== collectionIdToDelete) ?? null);
      if (collectionId === collectionIdToDelete) {
        navigate("/");
      }
    } catch (err) {
      setCollectionsError((err as Error).message);
    }
  }

  function handleStartNewRequest(collectionIdValue: string) {
    resetBuilder();
    setSelectedRequestId(null);
    navigate(`/collections/${collectionIdValue}`);
  }

  function handleSelectRequest(collectionIdValue: string, request: RequestItem) {
    populateRequestForm(request);
    setSelectedRequestId(request.id);
    navigate(`/collections/${collectionIdValue}`);
  }

  async function handleCreateOrUpdateRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!collectionId) return;
    setSaving(true);
    setCreateError("");

    try {
      const headersObj: Record<string, string> = {};
      reqHeaders
        .filter((h) => h.enabled && h.key)
        .forEach((h) => {
          headersObj[h.key] = h.value;
        });
      if (authType === "bearer" && authToken) {
        headersObj.Authorization = `Bearer ${authToken}`;
      }

      const enabledParams = params.filter((p) => p.enabled && p.key);
      let finalUrl = url;
      if (enabledParams.length > 0) {
        const qs = enabledParams.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join("&");
        finalUrl = finalUrl.includes("?") ? `${finalUrl}&${qs}` : `${finalUrl}?${qs}`;
      }

      let parsedBody: unknown = undefined;
      if (bodyType === "json" && bodyRaw.trim()) {
        try {
          parsedBody = JSON.parse(bodyRaw);
        } catch {
          setCreateError("Body is not valid JSON");
          setSaving(false);
          return;
        }
      } else if (bodyType === "form") {
        const formEntries = params.filter((p) => p.enabled && p.key);
        if (formEntries.length > 0) {
          parsedBody = Object.fromEntries(formEntries.map((p) => [p.key, p.value]));
        }
      }

      const payload = {
        name,
        method,
        url: finalUrl,
        headers: Object.keys(headersObj).length ? headersObj : undefined,
        body: parsedBody,
      };

      const endpoint = selectedRequestId ? `/collections/${collectionId}/requests/${selectedRequestId}` : `/collections/${collectionId}/requests`;
      const savedRequest = await apiFetch(endpoint, {
        method: selectedRequestId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      setRequestsByCollection((prev) => {
        const nextCollection = prev[collectionId] ?? [];
        if (selectedRequestId) {
          return { ...prev, [collectionId]: nextCollection.map((item) => (item.id === selectedRequestId ? (savedRequest as RequestItem) : item)) };
        }
        return { ...prev, [collectionId]: [...nextCollection, savedRequest as RequestItem] };
      });

      setSelectedRequestId((savedRequest as RequestItem).id);
      populateRequestForm(savedRequest as RequestItem);
      setCreateError("");
    } catch (err) {
      setCreateError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      navigate("/login");
    }
  }

  async function handleDeleteRequest(requestId: string) {
    if (!collectionId) return;
    if (!window.confirm("Delete this request?")) return;
    try {
      await apiFetch(`/collections/${collectionId}/requests/${requestId}`, { method: "DELETE" });
      setRequestsByCollection((prev) => ({
        ...prev,
        [collectionId]: (prev[collectionId] ?? []).filter((item) => item.id !== requestId),
      }));
      if (selectedRequestId === requestId) {
        resetBuilder();
      }
    } catch (err) {
      setCreateError((err as Error).message);
    }
  }

  async function handleSendRequest(requestId: string) {
    if (!collectionId) return;
    setSendingRequestId(requestId);
    try {
      const result = await apiFetch(`/collections/${collectionId}/requests/${requestId}/send`, { method: "POST" });
      setResponsesByRequest((prev) => ({ ...prev, [requestId]: result as RunLogResult }));
      setResponseTab((prev) => ({ ...prev, [requestId]: "body" }));
    } catch (err) {
      setResponsesByRequest((prev) => ({
        ...prev,
        [requestId]: {
          statusCode: null,
          responseTimeMs: null,
          responseHeaders: null,
          responseBody: { error: (err as Error).message },
        },
      }));
    } finally {
      setSendingRequestId(null);
    }
  }

  async function handleSendDirectly() {
    if (!collectionId) return;
    setSendingDirect(true);
    setCreateError("");

    try {
      const headersObj: Record<string, string> = {};
      reqHeaders
        .filter((h) => h.enabled && h.key)
        .forEach((h) => {
          headersObj[h.key] = h.value;
        });
      if (authType === "bearer" && authToken) {
        headersObj.Authorization = `Bearer ${authToken}`;
      }

      const enabledParams = params.filter((p) => p.enabled && p.key);
      let finalUrl = url;
      if (enabledParams.length > 0) {
        const qs = enabledParams.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join("&");
        finalUrl = finalUrl.includes("?") ? `${finalUrl}&${qs}` : `${finalUrl}?${qs}`;
      }

      if (!finalUrl) {
        throw new Error("Enter a URL first");
      }

      let parsedBody: unknown = undefined;
      if (bodyType === "json" && bodyRaw.trim()) {
        try {
          parsedBody = JSON.parse(bodyRaw);
        } catch {
          throw new Error("Body is not valid JSON");
        }
      } else if (bodyType === "form") {
        const formEntries = params.filter((p) => p.enabled && p.key);
        if (formEntries.length > 0) {
          parsedBody = Object.fromEntries(formEntries.map((p) => [p.key, p.value]));
        }
      }

      const result = await apiFetch(`/collections/${collectionId}/requests/send`, {
        method: "POST",
        body: JSON.stringify({
          name: name || "Untitled request",
          method,
          url: finalUrl,
          headers: Object.keys(headersObj).length ? headersObj : undefined,
          body: parsedBody,
        }),
      });

      setDirectResponse(result as RunLogResult);
      setDirectResponseTab("body");
    } catch (err) {
      setDirectResponse({
        statusCode: null,
        responseTimeMs: null,
        responseHeaders: null,
        responseBody: { error: (err as Error).message },
      });
    } finally {
      setSendingDirect(false);
    }
  }

  const currentRequests = collectionId ? (requestsByCollection[collectionId] ?? []) : [];

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-gray-100">
      <header className="border-b border-gray-700 bg-[#1e1e1e] flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-white">API Workspace</h1>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded border border-gray-600 hover:border-gray-400 transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          collections={collections}
          collectionsLoading={collectionsLoading}
          collectionsError={collectionsError}
          newCollectionName={newCollectionName}
          setNewCollectionName={setNewCollectionName}
          creating={creating}
          onCreateCollection={handleCreateCollection}
          expandedIds={expandedIds}
          onToggleCollection={(id) => {
            toggleCollection(id);
            if (collectionId !== id) {
              navigate(`/collections/${id}`);
            }
          }}
          requestsByCollection={requestsByCollection}
          loadingRequestsFor={loadingRequestsFor}
          selectedCollectionId={collectionId}
          selectedRequestId={selectedRequestId}
          onSelectRequest={handleSelectRequest}
          editingCollectionId={editingCollectionId}
          collectionDraftName={collectionDraftName}
          setCollectionDraftName={setCollectionDraftName}
          onStartEditCollection={(collection) => {
            setEditingCollectionId(collection.id);
            setCollectionDraftName(collection.name);
          }}
          onSaveCollection={handleUpdateCollection}
          onCancelEditCollection={() => {
            setEditingCollectionId(null);
            setCollectionDraftName("");
          }}
          onDeleteCollection={handleDeleteCollection}
          onDeleteRequest={handleDeleteRequest}
          onStartNewRequest={handleStartNewRequest}
        />

        <main className="flex-1 overflow-y-auto bg-[#1e1e1e]">
          {!collectionId ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">No collection selected</p>
                <p className="text-gray-600 text-xs">Create or select a collection to start building requests</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <RequestBuilder
                name={name}
                setName={setName}
                method={method}
                setMethod={setMethod}
                url={url}
                setUrl={setUrl}
                requestTab={requestTab}
                setRequestTab={setRequestTab}
                params={params}
                setParams={setParams}
                reqHeaders={reqHeaders}
                setReqHeaders={setReqHeaders}
                bodyType={bodyType}
                setBodyType={setBodyType}
                bodyRaw={bodyRaw}
                setBodyRaw={setBodyRaw}
                authType={authType}
                setAuthType={setAuthType}
                authToken={authToken}
                setAuthToken={setAuthToken}
                saving={saving}
                selectedRequestId={selectedRequestId}
                onSave={handleCreateOrUpdateRequest}
                onSendNow={handleSendDirectly}
                sendingDirect={sendingDirect}
                error={createError}
              />

              {directResponse && (
                <div className="mx-4 mt-4">
                  <ResponsePanel title="Direct response" response={directResponse} activeTab={directResponseTab} setActiveTab={setDirectResponseTab} />
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Saved Requests ({currentRequests.length})</p>
                {currentRequests.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-xs text-gray-600">No requests yet. Save one above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentRequests.map((req) => {
                      const response = responsesByRequest[req.id];
                      const isSending = sendingRequestId === req.id;
                      const activeResTab = responseTab[req.id] ?? "body";

                      return (
                        <div key={req.id} className="border border-gray-700 rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between px-3 py-2 bg-[#252525]">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${req.method === "GET" ? "text-green-600 bg-green-50" : req.method === "DELETE" ? "text-red-600 bg-red-50" : req.method === "POST" ? "text-amber-600 bg-amber-50" : "text-blue-600 bg-blue-50"}`}>
                                {req.method}
                              </span>
                              <span className="text-xs font-medium text-gray-100 truncate">{req.name}</span>
                              <span className="text-xs text-gray-500 font-mono truncate hidden sm:block">{req.url}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <button onClick={() => handleSelectRequest(collectionId, req)} className="text-gray-400 hover:text-orange-400">
                                <Play size={10} />
                              </button>
                              <button onClick={() => handleDeleteRequest(req.id)} className="text-gray-400 hover:text-red-400">
                                <Send size={10} />
                              </button>
                              <button onClick={() => handleSendRequest(req.id)} disabled={isSending} className="flex items-center gap-1.5 px-3 py-1 bg-orange-500 text-white rounded text-xs font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors">
                                <Send size={10} />
                                {isSending ? "Sending..." : "Send"}
                              </button>
                            </div>
                          </div>

                          {response && (
                            <div className="mt-2 px-3 pb-3">
                              <ResponsePanel
                                response={response}
                                activeTab={activeResTab}
                                setActiveTab={(tab) => setResponseTab((prev) => ({ ...prev, [req.id]: tab }))}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
