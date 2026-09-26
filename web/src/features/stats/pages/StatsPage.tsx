import { useQuery } from '@tanstack/react-query';
import { EmptyState, ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { formatDate, formatRating } from '../../../shared/utils/format';
import { getStats } from '../services/statsApi';
import { BarChart } from '../components/BarChart';

export function StatsPage() {
  const statsQuery = useQuery({ queryKey: ['stats'], queryFn: getStats });

  if (statsQuery.isPending) return <Loading label="Carregando estatísticas…" />;
  if (statsQuery.isError) {
    return <ErrorState message={getErrorMessage(statsQuery.error)} onRetry={() => statsQuery.refetch()} />;
  }

  const stats = statsQuery.data;

  return (
    <>
      <h1 className="page-title">Estatísticas</h1>

      {stats.totalReviews === 0 ? (
        <EmptyState>Avalie alguns álbuns para ver suas estatísticas aqui.</EmptyState>
      ) : (
        <>
          <div className="stat-tiles">
            <div className="stat-tile">
              <span className="stat-tile__value">{stats.totalReviews}</span>
              <span className="stat-tile__label">{stats.totalReviews === 1 ? 'avaliação' : 'avaliações'}</span>
            </div>
            <div className="stat-tile">
              <span className="stat-tile__value">{stats.totalListens}</span>
              <span className="stat-tile__label">{stats.totalListens === 1 ? 'audição' : 'audições'}</span>
            </div>
            <div className="stat-tile">
              <span className="stat-tile__value">
                {stats.averageRating !== null ? formatRating(stats.averageRating) : '—'}
              </span>
              <span className="stat-tile__label">nota média</span>
            </div>
            <div className="stat-tile">
              <span className="stat-tile__value stat-tile__value--small">{formatDate(stats.memberSince)}</span>
              <span className="stat-tile__label">ouvindo desde</span>
            </div>
          </div>

          <section className="section">
            <h2 className="section__title">Notas que você dá</h2>
            <BarChart data={stats.ratingDistribution.map((r) => ({ label: formatRating(r.rating), value: r.count }))} />
          </section>

          {stats.topArtists.length > 0 && (
            <section className="section">
              <h2 className="section__title">Artistas mais avaliados</h2>
              <BarChart
                orientation="horizontal"
                data={stats.topArtists.map((a) => ({ label: a.artistName, value: a.count }))}
              />
            </section>
          )}

          {stats.albumsByDecade.length > 0 && (
            <section className="section">
              <h2 className="section__title">Álbuns por década</h2>
              <BarChart data={stats.albumsByDecade.map((d) => ({ label: `${d.decade}s`, value: d.count }))} />
            </section>
          )}
        </>
      )}
    </>
  );
}
