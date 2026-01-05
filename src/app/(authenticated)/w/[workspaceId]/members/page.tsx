"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  UserPlus,
  MoreVertical,
  Trash2,
  Clock,
  X,
  Crown,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { getAvatarColor } from "@/lib/utils";
import type { Database } from "@/types/database";

type WorkspaceRole = Database["public"]["Enums"]["workspace_role"];

interface Workspace {
  id: string;
  name: string;
  role: WorkspaceRole;
  member_count: number;
  created_at: string;
}

interface Member {
  user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: WorkspaceRole;
  joined_at: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: WorkspaceRole;
  invited_by: string;
  invited_by_email: string;
  invited_by_name: string | null;
  created_at: string;
  expires_at: string;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function WorkspaceMembersPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Invite dialog state
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("member");
  const [isInviting, startInviting] = useTransition();
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Remove member dialog state
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [isRemoving, startRemoving] = useTransition();

  // Cancel invitation dialog state
  const [invitationToCancel, setInvitationToCancel] = useState<PendingInvitation | null>(null);
  const [isCanceling, startCanceling] = useTransition();

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  async function loadData() {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }

    // Get workspace info
    const { data: workspaces } = await supabase.rpc("get_user_workspaces");
    const ws = workspaces?.find((w) => w.id === workspaceId);

    if (!ws) {
      router.push("/workspaces");
      return;
    }

    setWorkspace(ws);

    // Get members
    const { data: membersData } = await supabase.rpc("get_workspace_members", {
      p_workspace_id: workspaceId,
    });
    setMembers(membersData || []);

    // Get pending invitations (only owners)
    if (ws.role === "owner") {
      const { data: invitationsData } = await supabase.rpc(
        "get_workspace_pending_invitations",
        { p_workspace_id: workspaceId }
      );
      setPendingInvitations(invitationsData || []);
    }

    setIsLoading(false);
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) return;

    setInviteError(null);

    startInviting(async () => {
      try {
        const response = await fetch("/api/invitations/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            email: inviteEmail.trim().toLowerCase(),
            role: inviteRole,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setInviteError(result.error || t("members.inviteError"));
          return;
        }

        setIsInviteDialogOpen(false);
        setInviteEmail("");
        setInviteRole("member");
        loadData();
      } catch (error) {
        console.error("Error inviting member:", error);
        setInviteError(t("members.inviteError"));
      }
    });
  }

  async function handleRemoveMember(member: Member) {
    startRemoving(async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc("remove_workspace_member", {
        p_workspace_id: workspaceId,
        p_user_id: member.user_id,
      });

      if (error) {
        console.error("Error removing member:", error);
        return;
      }

      setMemberToRemove(null);
      loadData();
    });
  }

  async function handleCancelInvitation(invitation: PendingInvitation) {
    startCanceling(async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc("cancel_workspace_invitation", {
        p_invitation_id: invitation.id,
      });

      if (error) {
        console.error("Error canceling invitation:", error);
        return;
      }

      setInvitationToCancel(null);
      loadData();
    });
  }

  async function handleChangeRole(member: Member, newRole: WorkspaceRole) {
    const supabase = createClient();
    const { error } = await supabase.rpc("update_member_role", {
      p_workspace_id: workspaceId,
      p_user_id: member.user_id,
      p_new_role: newRole,
    });

    if (error) {
      console.error("Error changing role:", error);
      if (error.message.includes("last owner")) {
        alert(t("workspace.leaveLastOwnerError"));
      }
      return;
    }

    loadData();
  }

  const isOwner = workspace?.role === "owner";

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!workspace) return null;

  return (
    <div className="flex-1 flex flex-col">
      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {t("members.title")}
            </h1>
            {isOwner && (
              <Button onClick={() => setIsInviteDialogOpen(true)}>
                <UserPlus className="w-4 h-4" />
                {t("members.invite")}
              </Button>
            )}
          </div>
          {/* Members List */}
          <section>
            <h2
              className="text-sm font-medium uppercase tracking-wider mb-4"
              style={{ color: "var(--text-tertiary)" }}
            >
              {t("members.list")} ({members.length})
            </h2>
            <div
              className="border rounded-lg divide-y"
              style={{ borderColor: "var(--border)" }}
            >
              {members.map((member) => (
                <div key={member.user_id} className="p-4 flex items-center gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback
                      className="text-white text-sm font-medium"
                      style={{ backgroundColor: getAvatarColor(member.user_id) }}
                    >
                      {getInitials(member.display_name, member.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="font-medium truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {member.display_name || member.email}
                      </p>
                      {member.user_id === currentUserId && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: "var(--muted)",
                            color: "var(--text-tertiary)",
                          }}
                        >
                          {t("members.you")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                      {member.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                      style={{
                        backgroundColor:
                          member.role === "owner" ? "var(--info-soft)" : "var(--muted)",
                        color:
                          member.role === "owner"
                            ? "var(--info-text)"
                            : "var(--text-tertiary)",
                      }}
                    >
                      {member.role === "owner" ? (
                        <Crown className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {member.role === "owner"
                        ? t("workspace.roleOwner")
                        : t("workspace.roleMember")}
                    </span>
                    {isOwner && member.user_id !== currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeRole(
                                member,
                                member.role === "owner" ? "member" : "owner"
                              )
                            }
                          >
                            {member.role === "owner" ? (
                              <>
                                <User className="w-4 h-4 mr-2" />
                                {t("members.changeRole")} → {t("workspace.roleMember")}
                              </>
                            ) : (
                              <>
                                <Crown className="w-4 h-4 mr-2" />
                                {t("members.changeRole")} → {t("workspace.roleOwner")}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setMemberToRemove(member)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t("members.remove")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pending Invitations (Owner only) */}
          {isOwner && (
            <section>
              <h2
                className="text-sm font-medium uppercase tracking-wider mb-4"
                style={{ color: "var(--text-tertiary)" }}
              >
                {t("members.pending")} ({pendingInvitations.length})
              </h2>
              {pendingInvitations.length === 0 ? (
                <div
                  className="border rounded-lg p-8 text-center"
                  style={{ borderColor: "var(--border)" }}
                >
                  <p style={{ color: "var(--text-secondary)" }}>
                    {t("members.pendingEmpty")}
                  </p>
                </div>
              ) : (
                <div
                  className="border rounded-lg divide-y"
                  style={{ borderColor: "var(--border)" }}
                >
                  {pendingInvitations.map((invitation) => (
                    <div key={invitation.id} className="p-4 flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "var(--warning-soft)" }}
                      >
                        <Clock className="w-5 h-5" style={{ color: "var(--warning)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {invitation.email}
                        </p>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          {t("members.pendingExpires", {
                            date: formatDate(invitation.expires_at),
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: "var(--muted)",
                            color: "var(--text-tertiary)",
                          }}
                        >
                          {invitation.role === "owner"
                            ? t("workspace.roleOwner")
                            : t("workspace.roleMember")}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setInvitationToCancel(invitation)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("members.inviteTitle")}</DialogTitle>
            <DialogDescription>{t("members.inviteDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">{t("members.inviteEmail")}</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder={t("members.inviteEmailPlaceholder")}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">{t("members.inviteRole")}</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as WorkspaceRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">{t("workspace.roleMember")}</SelectItem>
                  <SelectItem value="owner">{t("workspace.roleOwner")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {inviteError && (
              <p className="text-sm text-destructive">{inviteError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsInviteDialogOpen(false);
                setInviteEmail("");
                setInviteError(null);
              }}
              disabled={isInviting}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim() || isInviting}>
              {isInviting ? t("common.loading") : t("members.inviteSend")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("members.remove")}</DialogTitle>
            <DialogDescription>{t("members.removeConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMemberToRemove(null)}
              disabled={isRemoving}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => memberToRemove && handleRemoveMember(memberToRemove)}
              disabled={isRemoving}
            >
              {isRemoving ? t("common.loading") : t("members.remove")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Invitation Dialog */}
      <Dialog open={!!invitationToCancel} onOpenChange={() => setInvitationToCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("members.cancelInvite")}</DialogTitle>
            <DialogDescription>{t("members.cancelInviteConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInvitationToCancel(null)}
              disabled={isCanceling}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => invitationToCancel && handleCancelInvitation(invitationToCancel)}
              disabled={isCanceling}
            >
              {isCanceling ? t("common.loading") : t("members.cancelInvite")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
