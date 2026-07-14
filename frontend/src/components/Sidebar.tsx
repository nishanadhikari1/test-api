import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import type { Collection, RequestItem } from "../types/app";

type SidebarProps = {
  collections: Collection[] | null;
  collectionsLoading: boolean;
  collectionsError: string;
  newCollectionName: string;
  setNewCollectionName: (value: string) => void;
  creating: boolean;
  onCreateCollection: (e: React.FormEvent) => void;
  expandedIds: Set<string>;
  onToggleCollection: (id: string) => void;
  requestsByCollection: Record<string, RequestItem[]>;
  loadingRequestsFor: Set<string>;
  selectedCollectionId: string | undefined;
  selectedRequestId: string | null;
  onSelectRequest: (collectionId: string, request: RequestItem) => void;
  editingCollectionId: string | null;
  collectionDraftName: string;
  setCollectionDraftName: (value: string) => void;
  onStartEditCollection: (collection: Collection) => void;
  onSaveCollection: (collectionId: string) => void;
  onCancelEditCollection: () => void;
  onDeleteCollection: (collectionId: string) => void;
  onDeleteRequest: (requestId: string) => void;
  onStartNewRequest: (collectionId: string) => void;
};

export default function Sidebar({
  collections,
  collectionsLoading,
  collectionsError,
  newCollectionName,
  setNewCollectionName,
  creating,
  onCreateCollection,
  expandedIds,
  onToggleCollection,
  requestsByCollection,
  loadingRequestsFor,
  selectedCollectionId,
  selectedRequestId,
  onSelectRequest,
  editingCollectionId,
  collectionDraftName,
  setCollectionDraftName,
  onStartEditCollection,
  onSaveCollection,
  onCancelEditCollection,
  onDeleteCollection,
  onDeleteRequest,
  onStartNewRequest,
}: SidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-700 bg-[#181818] flex flex-col flex-shrink-0">
      <div className="p-3 border-b border-gray-700">
        <form onSubmit={onCreateCollection} className="flex flex-col gap-2">
          <input value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="New collection name" className="w-full px-2 py-1.5 bg-[#2a2a2a] border border-gray-600 rounded text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-400" />
          <button type="submit" disabled={creating} className="w-full px-2 py-1.5 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors">
            {creating ? "Creating..." : "+ New Collection"}
          </button>
        </form>
        {collectionsError && <p className="text-xs text-red-400 mt-2">{collectionsError}</p>}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {collectionsLoading ? (
          <p className="text-xs text-gray-500 px-3 py-2">Loading...</p>
        ) : !collections || collections.length === 0 ? (
          <p className="text-xs text-gray-500 px-3 py-2">No collections yet.</p>
        ) : (
          <ul>
            {collections.map((collection) => {
              const isExpanded = expandedIds.has(collection.id);
              const isLoadingReqs = loadingRequestsFor.has(collection.id);
              const collReqs = requestsByCollection[collection.id];
              const isEditing = editingCollectionId === collection.id;

              return (
                <li key={collection.id}>
                  <div className={`flex items-center ${selectedCollectionId === collection.id ? "bg-[#2d2d2d]" : "hover:bg-[#252525]"}`}>
                    <button onClick={() => onToggleCollection(collection.id)} className="flex-1 flex items-center gap-1.5 text-left px-3 py-1.5 text-xs font-medium transition-colors text-gray-300">
                      <ChevronRight size={12} className={`text-gray-400 flex-shrink-0 transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`} />
                      <span className="truncate">{collection.name}</span>
                    </button>
                    <div className="flex items-center gap-1 pr-2">
                      <button type="button" onClick={() => onStartNewRequest(collection.id)} className="text-gray-400 hover:text-orange-400" title="New request">
                        <Plus size={11} />
                      </button>
                      <button type="button" onClick={() => onStartEditCollection(collection)} className="text-gray-400 hover:text-orange-400">
                        <Pencil size={11} />
                      </button>
                      <button type="button" onClick={() => onDeleteCollection(collection.id)} className="text-gray-400 hover:text-red-400">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="px-3 pb-2 flex items-center gap-2">
                      <input value={collectionDraftName} onChange={(e) => setCollectionDraftName(e.target.value)} className="flex-1 px-2 py-1 bg-[#2a2a2a] border border-gray-600 rounded text-xs text-gray-100" />
                      <button type="button" onClick={() => onSaveCollection(collection.id)} className="text-xs text-orange-400">Save</button>
                      <button type="button" onClick={onCancelEditCollection} className="text-xs text-gray-400">Cancel</button>
                    </div>
                  )}

                  {isExpanded && (
                    <ul className="ml-4 border-l border-gray-700">
                      {isLoadingReqs ? (
                        <li className="text-xs text-gray-500 px-3 py-1">Loading...</li>
                      ) : !collReqs || collReqs.length === 0 ? (
                        <li className="text-xs text-gray-500 px-3 py-1">No requests</li>
                      ) : (
                        collReqs.map((req) => (
                          <li key={req.id} className="flex items-center">
                            <button onClick={() => onSelectRequest(collection.id, req)} className={`flex-1 flex items-center gap-2 text-left px-3 py-1 text-xs transition-colors ${selectedRequestId === req.id ? "bg-[#2d2d2d] text-white" : "hover:bg-[#252525] text-gray-300"}`}>
                              <span className={`font-mono font-bold text-[10px] ${req.method === "GET" ? "text-green-400" : req.method === "DELETE" ? "text-red-400" : req.method === "POST" ? "text-yellow-400" : "text-blue-400"}`}>{req.method}</span>
                              <span className="truncate">{req.name}</span>
                            </button>
                            <button type="button" onClick={() => onDeleteRequest(req.id)} className="pr-2 text-gray-400 hover:text-red-400">
                              <Trash2 size={10} />
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
