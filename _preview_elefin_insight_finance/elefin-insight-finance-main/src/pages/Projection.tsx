import { useMemo, useState } from 'react';
import { Pencil, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import DashboardHeader from '@/components/DashboardHeader';
import ProjectionInlineForm from '@/components/projection/ProjectionInlineForm';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useProjectionTemplates } from '@/hooks/useProjectionTemplates';
import AuthPage from '@/pages/Auth';
import { GROUP_LABELS, GroupType, ProjectionTemplate } from '@/types/finance';

const Projection = () => {
  const { session, loading: authLoading, signOut } = useAuth();
  const userId = session?.user.id;
  const { data: categories = [], isLoading: categoriesLoading } = useCategories(userId);
  const { templates, addTemplate, updateTemplate, deleteTemplate, toggleTemplateActive } = useProjectionTemplates(userId);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProjectionTemplate | null>(null);

  const groupedTemplates = useMemo(() => {
    const groups: Record<GroupType, ProjectionTemplate[]> = {
      essenciais: [],
      desejos: [],
      prioridades: [],
    };

    templates.forEach((template) => {
      groups[template.group_type].push(template);
    });

    return groups;
  }, [templates]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-2xl">Elefin</div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background pb-24">
      <DashboardHeader onSignOut={signOut} title="Projecao de Gastos" />

      <div className="px-4 pb-6 pt-2">
        <ProjectionInlineForm
          categories={categories}
          template={editingTemplate}
          open={formOpen}
          onOpenChange={setFormOpen}
          onCancelEdit={() => setEditingTemplate(null)}
          onSave={(input) => {
            if (editingTemplate) {
              updateTemplate(editingTemplate.id, input);
              toast.success('Projecao atualizada');
              setEditingTemplate(null);
            } else {
              addTemplate(input);
              toast.success('Conta fixa adicionada a projecao');
            }
          }}
        />

        <section className="mt-4 rounded-[28px] border border-border/70 bg-white px-4 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Projecao dos Proximos meses</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              As contas pre programadas aparecerao aqui nessa aba.
            </p>
          </div>

          {categoriesLoading ? (
            <div className="mt-5 space-y-3">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
          ) : templates.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-border/80 px-4 py-10 text-center text-sm text-muted-foreground">
              Voce ainda nao tem contas fixas cadastradas.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {(Object.keys(groupedTemplates) as GroupType[]).map((groupType) => {
                const templatesByGroup = groupedTemplates[groupType];
                if (templatesByGroup.length === 0) return null;

                return (
                  <div key={groupType} className="rounded-2xl border border-border/70">
                    <div className="border-b border-border/70 px-4 py-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {GROUP_LABELS[groupType]}
                      </p>
                    </div>

                    <div className="divide-y divide-border/70">
                      {templatesByGroup.map((template) => (
                        <div key={template.id} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold text-foreground">{template.account_name}</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                  template.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {template.is_active ? 'Ativa' : 'Pausada'}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{template.category_name}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-foreground">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                template.default_amount,
                              )}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                onClick={() => {
                                  setEditingTemplate(template);
                                  setFormOpen(true);
                                }}
                                aria-label="Editar projecao"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                onClick={() => {
                                  toggleTemplateActive(template.id, !template.is_active);
                                  toast.success(template.is_active ? 'Conta pausada' : 'Conta reativada');
                                }}
                                aria-label="Pausar ou reativar projecao"
                              >
                                <Power className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => {
                                  deleteTemplate(template.id);
                                  toast.success('Conta removida da projecao');
                                  if (editingTemplate?.id === template.id) {
                                    setEditingTemplate(null);
                                    setFormOpen(false);
                                  }
                                }}
                                aria-label="Excluir projecao"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Projection;
