import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  LogOut,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronLeft,
  Plus,
  Pencil,
  Check,
  X,
  Palette,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export type FolderItem = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  materialsCount: number;
  createdAt: string;
};

export const STORAGE_KEY = "medlearn_folders";

const defaultFolders: FolderItem[] = [
  {
    id: "1",
    name: "Clínica Médica",
    description: "Casos, resumos e materiais gerais de clínica.",
    color: "#2563eb",
    icon: "📘",
    materialsCount: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Anatomia",
    description: "Mapas mentais, resumos e revisões anatômicas.",
    color: "#10b981",
    icon: "🧠",
    materialsCount: 8,
    createdAt: new Date().toISOString(),
  },
];

const folderColors = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const Folders = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(folderColors[0]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState(folderColors[0]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as FolderItem[];
        setFolders(parsed);
        return;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setFolders(defaultFolders);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultFolders));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  }, [folders]);

  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => a.name.localeCompare(b.name));
  }, [folders]);

  const createFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: FolderItem = {
      id: crypto.randomUUID(),
      name: newFolderName.trim(),
      description:
        newFolderDescription.trim() || "Pasta criada para organizar seus materiais.",
      color: newFolderColor,
      icon: "📁",
      materialsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setFolders((prev) => [newFolder, ...prev]);
    setNewFolderName("");
    setNewFolderDescription("");
    setNewFolderColor(folderColors[0]);
    setShowCreate(false);
  };

  const startEdit = (folder: FolderItem) => {
    setEditingId(folder.id);
    setEditingName(folder.name);
    setEditingColor(folder.color);
  };

  const saveEdit = () => {
    if (!editingId || !editingName.trim()) return;

    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === editingId
          ? { ...folder, name: editingName.trim(), color: editingColor }
          : folder
      )
    );

    setEditingId(null);
    setEditingName("");
    setEditingColor(folderColors[0]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingColor(folderColors[0]);
  };

  const deleteFolder = (id: string) => {
    setFolders((prev) => prev.filter((folder) => folder.id !== id));
    localStorage.removeItem(`folder_${id}_subfolders`);
  };

  return (
    <div className="min-h-screen bg-hero text-hero-foreground">
      <header className="border-b border-white/10 glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <button
  onClick={() => navigate("/dashboard")}
  className="p-2 rounded-lg hover:bg-white/10 transition"
>
  <ChevronLeft className="h-5 w-5 text-hero-muted hover:text-white" />
</button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">MedLearn AI</span>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="text-hero-muted hover:bg-white/10 hover:text-hero-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Minhas Pastas</h1>
              <p className="text-sm text-hero-muted">
                Organize seus materiais por tema, disciplina ou assunto.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowCreate((prev) => !prev)}
            className="bg-gradient-primary text-primary-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova pasta
          </Button>
        </div>

        {showCreate && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
            <h2 className="text-lg font-semibold">Criar pasta</h2>

            <div className="grid gap-4">
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nome da pasta"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-primary"
              />

              <textarea
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="Descrição da pasta"
                className="min-h-[100px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-primary"
              />

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-hero-muted">
                  <Palette className="h-4 w-4" />
                  Escolha uma cor
                </div>
                <div className="flex flex-wrap gap-3">
                  {folderColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewFolderColor(color)}
                      className={`h-8 w-8 rounded-full border-2 transition ${
                        newFolderColor === color
                          ? "border-white scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={createFolder} className="bg-gradient-primary text-primary-foreground">
                  Salvar pasta
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {sortedFolders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
            <h3 className="text-lg font-semibold">Você ainda não criou nenhuma pasta</h3>
            <p className="mt-2 text-sm text-hero-muted">
              Crie sua primeira pasta para começar a organizar seus materiais.
            </p>
          </div>
        ) : (
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {sortedFolders.map((folder) => {
              const isEditing = editingId === folder.id;

              return (
                <motion.div key={folder.id} variants={item}>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:shadow-glow">
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                        style={{ backgroundColor: `${folder.color}22`, border: `1px solid ${folder.color}55` }}
                      >
                        {folder.icon}
                      </div>

                      {!isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(folder)}
                            className="text-hero-muted hover:bg-white/10 hover:text-hero-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteFolder(folder.id)}
                            className="text-red-400 hover:bg-white/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={saveEdit}
                            className="text-emerald-400 hover:bg-white/10"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEdit}
                            className="text-red-400 hover:bg-white/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {!isEditing ? (
                      <>
                        <h3 className="mt-4 text-lg font-semibold">{folder.name}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-hero-muted">
                          {folder.description}
                        </p>

                        <div className="mt-4 flex items-center gap-1 text-xs text-hero-muted">
                          <FileText className="h-3 w-3" />
                          {folder.materialsCount} materiais
                        </div>

                        <Link
                          to={`/folders/${folder.id}`}
                          className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10"
                        >
                          Abrir pasta
                          <ChevronRight className="h-4 w-4 text-hero-muted" />
                        </Link>
                      </>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Nome da pasta"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-primary"
                        />

                        <div>
                          <div className="mb-2 text-xs text-hero-muted">Cor da pasta</div>
                          <div className="flex flex-wrap gap-2">
                            {folderColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setEditingColor(color)}
                                className={`h-7 w-7 rounded-full border-2 transition ${
                                  editingColor === color
                                    ? "border-white scale-110"
                                    : "border-transparent"
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Folders;
