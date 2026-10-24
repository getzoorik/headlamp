import { Loader, SectionBox, SimpleTable } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import {
  modeText,
  podsText,
  Recommendation,
  RecommendationData,
  rolloutText,
  targetText,
} from './recommendation';
import { loadError, NotInstalled } from './states';

export function RecommendationList() {
  const [items, error] = Recommendation.useList();
  const failure = loadError(error);

  if (error?.status === 404) {
    return (
      <SectionBox title="Coral">
        <NotInstalled />
      </SectionBox>
    );
  }
  if (!items && !error) {
    return <Loader title="Reading Coral recommendations" />;
  }

  const rows = (items ?? []).map(item => item.jsonData as RecommendationData);

  return (
    <SectionBox title="Coral recommendations">
      <SimpleTable
        errorMessage={failure}
        emptyMessage="No recommendations yet. Coral writes the first ones about 30 to 40 minutes after it connects."
        defaultSortingColumn={1}
        columns={[
          { label: 'Workload', getter: (row: RecommendationData) => targetText(row.spec) },
          { label: 'Namespace', getter: (row: RecommendationData) => row.metadata.namespace },
          {
            label: 'Policy',
            getter: (row: RecommendationData) => row.spec?.policyName ?? 'Not available',
          },
          { label: 'Mode', getter: (row: RecommendationData) => modeText(row.spec) },
          {
            label: 'Pods at the new size',
            getter: (row: RecommendationData) => podsText(row.status),
          },
          { label: 'Rollout', getter: (row: RecommendationData) => rolloutText(row.status) },
        ]}
        data={rows}
      />
    </SectionBox>
  );
}
