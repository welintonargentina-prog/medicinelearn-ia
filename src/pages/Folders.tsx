// 👇 IMPORTS (igual ao teu)
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

// 👇 TIPAGEM
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

// ✅ AQUI FOI A MUDANÇA PRINCIPAL
const defaultFolders: FolderItem[] = []; // ← vazio

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

const Folders = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(folderColors[0]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setFolders(JSON.parse(saved));
        return;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // ✅ NÃO CRIA MAIS NADA AUTOMÁTICO
    setFolders([]);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
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
    setShowCreate(false);
  };

  return (
    <div className="min-h-screen bg-hero text-hero-foreground">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/dashboard")}>
              <ChevronLeft />
            </button>

            <Link to="/dashboard" className="flex items-center gap-2">
              <Brain />
              <span>MedLearn AI</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              <LogOut />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Minhas Pastas</h1>

          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus /> Nova pasta
          </Button>
        </div>

        {showCreate && (
          <div className="mb-6">
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nome"
            />
            <Button onClick={createFolder}>Salvar</Button>
          </div>
        )}

        {folders.length === 0 ? (
          <div className="text-center">
            <p>Você ainda não criou nenhuma pasta</p>
          </div>
        ) : (
          folders.map((folder) => (
            <div key={folder.id}>
              <h3>{folder.name}</h3>
              <Link to={`/folders/${folder.id}`}>Abrir</Link>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default Folders;
