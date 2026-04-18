import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  LogOut,
  FolderOpen,
  ChevronRight,
  Clock3,
  Edit,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const baseUserName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "estudante";

  const [userName, setUserName] = useState(baseUserName);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  const handleSaveName = async () => {
    if (!newName.trim()) return;

    const cleanedName = newName.trim();

    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: cleanedName,
      },
    });

    if (error) {
      console.error(error);
      return;
    }

    setUserName(cleanedName);
    setEditing(false);
    setNewName("");
  };

  return (
    <div className="min-h-screen bg-hero text-hero-foreground">
      <header className="border-b border-white/10 glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
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
              {t("common.logout")}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">
              {t("dash.welcome")}, <span className="text-primary">{userName}</span>
            </h1>

            <button
              onClick={() => setEditing(!editing)}
              className="rounded-lg bg-white/10 p-2 hover:bg-white/20"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>

          {editing && (
            <div className="mt-4 flex gap-2">
              <Input
                placeholder={t("dash.newName")}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Button onClick={handleSaveName}>{t("common.save")}</Button>
            </div>
          )}

          <p className="mt-2 text-hero-muted">{t("dash.subtitle")}</p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Brain className="h-8 w-8 text-primary" />
              </div>

              <div>
                <p className="text-xs uppercase text-hero-muted">
                  {t("dash.continueStudying")}
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Anatomia &gt; Sistema Nervoso
                </h2>

                <p className="mt-1 flex items-center gap-2 text-sm text-hero-muted">
                  <Clock3 className="h-4 w-4" />
                  {t("dash.lastAccess")}
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/folders")}
              className="bg-gradient-primary text-primary-foreground"
            >
              {t("common.continue")}
            </Button>
          </div>
        </motion.section>

        <section className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            onClick={() => navigate("/folders")}
            className="w-full max-w-3xl cursor-pointer rounded-[36px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-10 shadow-[0_25px_90px_rgba(0,0,0,0.45)] transition hover:bg-white/10"
          >
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/25 bg-primary/15">
                <FolderOpen className="h-10 w-10 text-primary" />
              </div>

              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.22em] text-hero-muted">
                  {t("dash.mainArea")}
                </p>

                <h2 className="mt-2 text-4xl font-bold text-hero-foreground">
                  {t("dash.myMaterials")}
                </h2>

                <p className="mt-4 text-lg leading-relaxed text-hero-muted">
                  {t("dash.materialsDescription")}
                </p>

                <div className="mt-8 flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-hero-muted">
                    {t("dash.enterSystem")}
                  </span>

                  <ChevronRight className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
