import React, { useState } from 'react';
import { SlideOverPanel } from '../ui/SlideOverPanel';
import { workspaceRepository } from '../../repositories/workspaceRepository';
import { useAuthContext } from '../../auth/providers/AuthProvider';
import { Calendar, ListTodo, AlertTriangle, User, Hash } from 'lucide-react';

interface CreateTaskPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const CreateTaskPanel: React.FC<CreateTaskPanelProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const { authUser } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignee_id: '',
    estimate: '',
    github_issue: '',
    due_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || !projectId) return;

    setIsSubmitting(true);
    try {
      await workspaceRepository.createProjectTask({
        project_id: projectId,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assignee_id: formData.assignee_id || undefined,
        actor_id: authUser.id,
      });
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        assignee_id: '',
        estimate: '',
        github_issue: '',
        due_date: ''
      });
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SlideOverPanel isOpen={isOpen} onClose={onClose} title="New Engineering Task">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase text-[#0B3027]/60 mb-2">
            Task Title
          </label>
          <div className="relative">
            <ListTodo className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B3027]/40" />
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white border border-[#0B3027]/10 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold text-[#0B3027] focus:outline-none focus:border-[#C9A56A]/50 focus:ring-1 focus:ring-[#C9A56A]/50"
              placeholder="e.g. Implement authentication flow"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold uppercase text-[#0B3027]/60 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-white border border-[#0B3027]/10 rounded-xl py-3 px-4 text-sm text-[#0B3027] focus:outline-none focus:border-[#C9A56A]/50 focus:ring-1 focus:ring-[#C9A56A]/50 min-h-[120px] resize-y custom-scrollbar"
            placeholder="Detailed description or acceptance criteria..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-[#0B3027]/60 mb-2">
              Priority
            </label>
            <div className="relative">
              <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B3027]/40" />
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-white border border-[#0B3027]/10 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold text-[#0B3027] focus:outline-none focus:border-[#C9A56A]/50 appearance-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-[#0B3027]/60 mb-2">
              Assignee
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B3027]/40" />
              <select
                value={formData.assignee_id}
                onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                className="w-full bg-white border border-[#0B3027]/10 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold text-[#0B3027] focus:outline-none focus:border-[#C9A56A]/50 appearance-none"
              >
                <option value="">Unassigned</option>
                {/* Normally we'd map active workspace users here */}
                <option value={authUser?.id}>Me</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-[#0B3027]/60 mb-2">
              Due Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B3027]/40" />
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full bg-white border border-[#0B3027]/10 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold text-[#0B3027] focus:outline-none focus:border-[#C9A56A]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-[#0B3027]/60 mb-2">
              GitHub Issue
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B3027]/40" />
              <input
                type="text"
                value={formData.github_issue}
                onChange={(e) => setFormData({ ...formData, github_issue: e.target.value })}
                className="w-full bg-white border border-[#0B3027]/10 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold text-[#0B3027] focus:outline-none focus:border-[#C9A56A]/50"
                placeholder="#123"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#0B3027]/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-[#0B3027] hover:bg-[#0B3027]/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-full bg-[#0B3027] hover:bg-[#0E3A2F] disabled:opacity-50 text-white font-semibold text-xs shadow-[0_4px_16px_rgba(11,48,39,0.25)] transition-all flex items-center justify-center min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-[#C9A56A]/30 border-t-[#C9A56A] rounded-full animate-spin" />
            ) : (
              'Create Task'
            )}
          </button>
        </div>
      </form>
    </SlideOverPanel>
  );
};
