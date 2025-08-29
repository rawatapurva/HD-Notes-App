import { useEffect, useState } from "react";
import axios from "axios";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { useNavigate } from "react-router-dom";
import image from "../../image/logo.png";
import { Trash2 } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const api = import.meta.env.VITE_API_URL;
  const [user] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: "", body: "" });
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const client = axios.create({
    baseURL: api,
    headers: { Authorization: `Bearer ${token}` }
  });

  async function loadNotes() {
    try {
      const res = await client.get("/notes");
      setNotes(res.data.notes);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load notes");
    }
  }

  useEffect(() => { loadNotes(); }, []);

  async function createNote() {
    setError("");
    try {
      if (!form.title.trim()) { setError("Title is required"); return; }
      const res = await client.post("/notes", form);
      setNotes([res.data.note, ...notes]);
      setForm({ title: "", body: "" });
    } catch (e) {
      setError(e.response?.data?.error || "Failed to create note");
    }
  }

  async function deleteNote(id) {
    try {
      await client.delete(`/notes/${id}`);
      setNotes(notes.filter(n => n._id !== id));
    } catch (e) {
      setError(e.response?.data?.error || "Failed to delete note");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between">
        <div className=" gap-12 mb-6">
          <img 
          src={image}
          alt="Logo" 
          className="h-[79] w-[32] object-cover rounded-full" 
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        <button
          onClick={logout}
          className="text-sm text-blue-600 font-medium hover:underline mt-3 sm:mt-0"
        >
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {/* Welcome card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow mb-6">
          <h2 className="text-lg sm:text-xl font-bold">Welcome, {user?.name || "User"}!</h2>
          <p className="text-gray-600 text-sm mt-1">Email: {user?.email}</p>
        </div>

        {/* Create Note */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow mb-6">
          <h3 className="font-semibold mb-4 text-base sm:text-lg">Create Note</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Title" value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} />
            <Input placeholder="Body" value={form.body} onChange={(e)=>setForm({...form, body: e.target.value})} />
            <Button onClick={createNote}>Create Note</Button>
          </div>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        {/* Notes List */}
        <h3 className="font-semibold mb-3 text-base sm:text-lg">Notes</h3>
        <div className="space-y-3">
          {notes.map(n => (
            <div key={n._id} className="bg-white rounded-xl p-4 shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="font-medium">{n.title}</h4>
                {n.body && <p className="text-gray-600 text-sm mt-1">{n.body}</p>}
                <p className="text-xs text-gray-400 mt-1">Created {new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => deleteNote(n._id)}
                title="Delete"
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {notes.length === 0 && (
            <p className="text-gray-500 text-sm">You have no notes yet. Create your first one above!</p>
          )}
        </div>
      </main>
    </div>
  );
}
