import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhosphorIcon } from '../../components/PhosphorIcon';
import { EmptyState } from '../../components/EmptyState';
import { Alert } from '../../components/Alert';
import { LoadingState } from '../../components/LoadingState';
import { useAsync } from '../../core/hooks/useAsync';
import { useAuth } from '../../core/auth/AuthContext';
import { useToast } from '../../core/toast/ToastContext';
import { networkApi } from '../../core/api/endpoints/network';
import { companiesApi } from '../../core/api/endpoints/companies';
import type { NetworkCompanyCard, NetworkPerson, NetworkSidebar } from '../../core/types';
import { PeopleGrid } from './components/PeopleGrid';
import { NetworkSidebarCard } from './components/NetworkSidebar';

type TabKey = 'suggested' | 'connections' | 'requests' | 'following';

const messagesPathFor = (role: string | undefined): string =>
  role === 'EMPLOYER' ? '/employer/messages' : '/student/messages';

export const NetworkPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('suggested');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyCompanyId, setBusyCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    if (q.trim()) setActiveTab('suggested');
  }, [q]);

  const searching = debouncedQ.length > 0;

  const results = useAsync<NetworkPerson[]>(
    () => (searching ? networkApi.search(debouncedQ) : networkApi.suggested(30)),
    [debouncedQ, searching],
  );

  const connections = useAsync<NetworkPerson[]>(() => networkApi.connections(), []);
  const requests = useAsync<NetworkPerson[]>(() => networkApi.requests(), []);
  const following = useAsync<NetworkPerson[]>(() => networkApi.following(), []);
  const sidebar = useAsync<NetworkSidebar>(() => networkApi.sidebar(), []);

  const refreshAll = () => {
    results.reload();
    connections.reload();
    requests.reload();
    following.reload();
    sidebar.reload();
  };

  const run = async (action: () => Promise<unknown>, onError: (err: unknown) => string) => {
    try {
      await action();
      refreshAll();
      return true;
    } catch (err) {
      addToast('error', onError(err));
      return false;
    }
  };

  const handleConnect = async (person: NetworkPerson) => {
    setBusyId(person.id);
    const ok = await run(
      () => networkApi.connect(person.id),
      (err) => (err instanceof Error ? err.message : 'Could not send an invitation. Please try again.'),
    );
    if (ok) addToast('success', `Invitation sent to ${person.name}`);
    setBusyId(null);
  };

  const handleAccept = async (person: NetworkPerson) => {
    if (!person.connectionId) return;
    setBusyId(person.id);
    const ok = await run(
      () => networkApi.acceptRequest(person.connectionId as string),
      (err) => (err instanceof Error ? err.message : 'Could not accept the invitation. Please try again.'),
    );
    if (ok) addToast('success', `You are now connected with ${person.name}`);
    setBusyId(null);
  };

  const handleDecline = async (person: NetworkPerson) => {
    if (!person.connectionId) return;
    setBusyId(person.id);
    const ok = await run(
      () => networkApi.declineRequest(person.connectionId as string),
      (err) => (err instanceof Error ? err.message : 'Could not decline the invitation. Please try again.'),
    );
    if (ok) addToast('success', `Invitation from ${person.name} declined`);
    setBusyId(null);
  };

  const handleRemove = async (person: NetworkPerson) => {
    setBusyId(person.id);
    const ok = await run(
      () => networkApi.removeConnection(person.id),
      (err) => (err instanceof Error ? err.message : 'Could not remove the connection. Please try again.'),
    );
    if (ok) addToast('success', `Connection with ${person.name} removed`);
    setBusyId(null);
  };

  const handleToggleFollow = async (person: NetworkPerson) => {
    setBusyId(person.id);
    const target = person.followed ? 'unfollowed' : 'followed';
    const ok = await run(
      () => (person.followed ? networkApi.unfollow(person.id) : networkApi.follow(person.id)),
      (err) => (err instanceof Error ? err.message : 'Could not update the follow. Please try again.'),
    );
    if (ok) addToast('success', `You ${target} ${person.name}`);
    setBusyId(null);
  };

  const handleToggleCompanyFollow = async (company: NetworkCompanyCard) => {
    setBusyCompanyId(company.id);
    const target = company.followed ? 'unfollowed' : 'followed';
    const ok = await run(
      () => (company.followed ? companiesApi.unfollow(company.id) : companiesApi.follow(company.id)),
      (err) => (err instanceof Error ? err.message : 'Could not update the follow. Please try again.'),
    );
    if (ok) addToast('success', `You ${target} ${company.name}`);
    setBusyCompanyId(null);
  };

  const handleMessage = () => {
    navigate(messagesPathFor(user?.role));
  };

  const peopleByTab: Record<TabKey, NetworkPerson[]> = {
    suggested: results.data ?? [],
    connections: connections.data ?? [],
    requests: requests.data ?? [],
    following: following.data ?? [],
  };

  const loadingByTab: Record<TabKey, boolean> = {
    suggested: results.loading,
    connections: connections.loading,
    requests: requests.loading,
    following: following.loading,
  };

  const errorByTab: Record<TabKey, string | null> = {
    suggested: results.error,
    connections: connections.error,
    requests: requests.error,
    following: following.error,
  };

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'suggested', label: searching ? 'Results' : 'Suggested' },
    { key: 'connections', label: 'Connections', count: connections.data?.length ?? 0 },
    { key: 'requests', label: 'Requests', count: requests.data?.length ?? 0 },
    { key: 'following', label: 'Following', count: following.data?.length ?? 0 },
  ];

  const people = peopleByTab[activeTab];
  const loading = loadingByTab[activeTab];
  const error = errorByTab[activeTab];

  const cardHandlers = {
    onConnect: handleConnect,
    onAccept: handleAccept,
    onDecline: handleDecline,
    onRemove: handleRemove,
    onToggleFollow: handleToggleFollow,
    onMessage: handleMessage,
  };

  const emptyMessages: Record<TabKey, { title: string; text: string }> = {
    suggested: searching
      ? { title: 'No results found', text: 'No people matched your search. Try a different name, skill, or company.' }
      : { title: 'No suggestions right now', text: 'We could not find anyone new to connect with yet. Check back soon.' },
    connections: { title: 'No connections yet', text: 'Connect with people to start building your professional network.' },
    requests: { title: 'No pending requests', text: 'When someone invites you to connect, it will show up here.' },
    following: { title: 'Not following anyone yet', text: 'Follow people to see their activity in your feed.' },
  };

  return (
    <div className="page fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">Grow your network</h1>
          <p className="page-subtitle">
            Discover professionals, connect with peers, and expand your opportunities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <div className="card p-4">
            <div className="hero-search">
              <div className="hero-search__field">
                <PhosphorIcon name="MagnifyingGlass" size={18} className="text-text-secondary" />
                <input
                  className="hero-search__input"
                  type="search"
                  placeholder="Search people by name, title, skill, or company…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search people"
                />
              </div>
              {q.trim() && (
                <button
                  type="button"
                  className="btn btn--sm btn--ghost flex-shrink-0"
                  onClick={() => setQ('')}
                  aria-label="Clear search"
                >
                  <PhosphorIcon name="X" size={14} />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`badge cursor-pointer ${activeTab === tab.key ? 'badge--primary' : 'badge--muted'}`}
                onClick={() => setActiveTab(tab.key)}
                aria-pressed={activeTab === tab.key}
                data-testid={`tab-${tab.key}`}
              >
                {tab.label}
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className="ml-1" data-testid={`tab-count-${tab.key}`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {error && (
            <Alert>
              {error}{' '}
              <button type="button" className="link" onClick={refreshAll}>
                Retry
              </button>
            </Alert>
          )}

          {loading ? (
            <div className="card p-8">
              <LoadingState label="Loading people…" />
            </div>
          ) : people.length === 0 ? (
            <EmptyState
              className="card p-8"
              icon={searching ? 'MagnifyingGlass' : 'UsersThree'}
              title={emptyMessages[activeTab].title}
              text={emptyMessages[activeTab].text}
              action={
                searching ? (
                  <button type="button" className="btn btn--sm" onClick={() => setQ('')}>
                    Show suggestions
                  </button>
                ) : undefined
              }
            />
          ) : (
            <PeopleGrid people={people} busyId={busyId} handlers={cardHandlers} />
          )}
        </div>

        <NetworkSidebarCard
          sidebar={{
            peopleYouMayKnow: sidebar.data?.peopleYouMayKnow ?? [],
            companiesToFollow: sidebar.data?.companiesToFollow ?? [],
            popularSkills: sidebar.data?.popularSkills ?? [],
          }}
          busyPersonId={busyId}
          busyCompanyId={busyCompanyId}
          onConnect={handleConnect}
          onToggleCompanyFollow={handleToggleCompanyFollow}
        />
      </div>
    </div>
  );
};