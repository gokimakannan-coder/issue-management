import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, FolderKanban, Edit2, Trash2, Shield, User } from 'lucide-react';
import { teamService } from '../services/teamService';
import { userService } from '../services/userService';
import { Team, User as UserType } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const TeamManagementPage: React.FC = () => {
  const { isAdmin, isManager } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [teamList, userList] = await Promise.all([
        teamService.getTeams(),
        userService.getUsers(),
      ]);
      setTeams(teamList);
      setUsers(userList);
    } catch (error) {
      console.error('Failed to load teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingTeam(null);
    setName('');
    setDescription('');
    setManagerId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (team: Team) => {
    setEditingTeam(team);
    setName(team.name);
    setDescription(team.description || '');
    setManagerId(team.managerId || '');
    setIsModalOpen(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingTeam) {
        await teamService.updateTeam(editingTeam.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          managerId: managerId || null,
        });
        toast.success('Team updated successfully');
      } else {
        await teamService.createTeam({
          name: name.trim(),
          description: description.trim() || undefined,
          managerId: managerId || null,
        });
        toast.success('Team created successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await teamService.deleteTeam(deleteTarget.id);
      toast.success('Team removed');
      setDeleteTarget(null);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete team');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Team Management"
        description="Organize functional engineering and operational groups, assign managers, and view member rosters."
      >
        {(isAdmin || isManager) && (
          <Button size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
            Create Team
          </Button>
        )}
      </PageHeader>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <CardHeader className="space-y-1">
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                  <FolderKanban className="w-5 h-5" />
                </div>
                {(isAdmin || isManager) && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(team)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit Team"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteTarget(team)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete Team"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <CardTitle className="pt-2">{team.name}</CardTitle>
              <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                {team.description || 'No description provided.'}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Manager */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Manager:</span>
                <div className="flex items-center gap-2">
                  <img
                    src={
                      team.manager?.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        team.manager?.name || 'Manager'
                      )}`
                    }
                    alt=""
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="font-semibold text-slate-800">
                    {team.manager?.name || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Members Preview */}
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Members ({team.members?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {team.members && team.members.length > 0 ? (
                    team.members.map((m) => (
                      <div
                        key={m.id}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-700"
                        title={`${m.name} (${m.role})`}
                      >
                        <img
                          src={
                            m.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              m.name
                            )}`
                          }
                          alt=""
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="text-[11px] font-medium">{m.name}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No members assigned yet</span>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="justify-between text-xs text-slate-500">
              <span>{team._count?.issues ?? 0} active tickets</span>
              <span>{team._count?.members ?? 0} staff</span>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeam ? 'Edit Team' : 'Create New Team'}
        description="Configure team metadata and appoint an engineering manager."
      >
        <form onSubmit={handleSaveTeam} className="space-y-4">
          <Input
            label="Team Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Frontend Engineering"
          />

          <div className="space-y-1.5">
            <label htmlFor="team-desc" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Description
            </label>
            <textarea
              id="team-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Team mission, core systems maintained, and responsibilities..."
              className="w-full p-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Select
            label="Appoint Team Manager"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
          >
            <option value="">No Manager Appointed</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingTeam ? 'Save Changes' : 'Create Team'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTeam}
        title="Delete Team"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Assigned members will not be deleted.`}
        confirmLabel="Delete Team"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
