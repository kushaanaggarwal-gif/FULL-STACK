import { useEffect, useState } from "react";

const storageKey = "post-drafts";

function getSavedDrafts() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function fakeSave(draft) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const drafts = getSavedDrafts();
      const index = drafts.findIndex((item) => item.id === draft.id);
      if (index >= 0) drafts[index] = draft;
      else drafts.unshift(draft);
      localStorage.setItem(storageKey, JSON.stringify(drafts));
      resolve(drafts);
    }, 400);
  });
}

function fakeDelete(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const drafts = getSavedDrafts().filter((draft) => draft.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(drafts));
      resolve(drafts);
    }, 300);
  });
}

function fakePublish(ids) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const drafts = getSavedDrafts().filter((draft) => !ids.includes(draft.id));
      localStorage.setItem(storageKey, JSON.stringify(drafts));
      resolve(drafts);
    }, 400);
  });
}

function App() {
  const [drafts, setDrafts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDrafts(getSavedDrafts());
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  async function saveDraft(event) {
    event.preventDefault();
    if (!content.trim()) {
      setMessage("Please write something before saving.");
      return;
    }

    setLoading(true);
    const draft = {
      id: editingId || Date.now(),
      title: title.trim() || "Untitled draft",
      content: content.trim(),
      updatedAt: new Date().toLocaleString(),
    };
    const updatedDrafts = await fakeSave(draft);
    setDrafts(updatedDrafts);
    clearEditor();
    setLoading(false);
    setMessage("Draft saved successfully.");
  }

  async function removeDraft(id) {
    setLoading(true);
    const updatedDrafts = await fakeDelete(id);
    setDrafts(updatedDrafts);
    setSelectedIds((ids) => ids.filter((selectedId) => selectedId !== id));
    if (editingId === id) clearEditor();
    setLoading(false);
    setMessage("Draft deleted.");
  }

  function toggleDraft(id) {
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((selectedId) => selectedId !== id) : [...ids, id]
    );
  }

  async function publishSelected() {
    if (selectedIds.length === 0) {
      setMessage("Select at least one draft to publish.");
      return;
    }

    setLoading(true);
    const updatedDrafts = await fakePublish(selectedIds);
    setDrafts(updatedDrafts);
    setSelectedIds([]);
    setLoading(false);
    setMessage("Selected drafts published successfully.");
  }

  function editDraft(draft) {
    setEditingId(draft.id);
    setTitle(draft.title);
    setContent(draft.content);
    setMessage("Editing selected draft.");
  }

  function clearEditor() {
    setEditingId(null);
    setTitle("");
    setContent("");
  }

  return (
    <main className="page">
      <header>
        <h1>Post Draft Manager</h1>
        <p>Save your social media ideas and finish them later.</p>
      </header>

      <section className="layout">
        <form className="editor" onSubmit={saveDraft}>
          <h2>{editingId ? "Edit draft" : "Create a draft"}</h2>
          <label>
            Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: Weekend announcement"
            />
          </label>
          <label>
            Post content
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write your post here..."
              rows="8"
            />
          </label>
          <p className="count">Characters: {content.length}</p>
          <div className="actions">
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update draft" : "Save draft"}
            </button>
            {editingId && (
              <button type="button" className="secondary" onClick={clearEditor}>
                Cancel
              </button>
            )}
          </div>
          {message && <p className="message">{message}</p>}
        </form>

        <section className="drafts">
          <div className="draft-heading">
            <h2>Saved drafts</h2>
            <span>{drafts.length}</span>
          </div>
          <div className="publish-row">
            <span>{selectedIds.length} selected</span>
            <button onClick={publishSelected} disabled={loading || selectedIds.length === 0}>
              Publish selected
            </button>
          </div>
          {loading && drafts.length === 0 && <p>Loading drafts...</p>}
          {!loading && drafts.length === 0 && <p>No drafts saved yet.</p>}
          {drafts.map((draft) => (
            <article className="draft" key={draft.id}>
              <label className="draft-check">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(draft.id)}
                  onChange={() => toggleDraft(draft.id)}
                />
                <h3>{draft.title}</h3>
              </label>
              <small>Last updated: {draft.updatedAt}</small>
              <div className="draft-actions">
                <button onClick={() => editDraft(draft)}>Edit</button>
                <button className="delete" onClick={() => removeDraft(draft.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

export default App;
