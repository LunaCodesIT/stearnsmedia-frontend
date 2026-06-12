import { useAnalytics } from '@/hooks/useAnalytics';
import { ServiceSection } from '@/components/ui/ServiceSection';
import { SectionModel } from '@/components/three/SectionModel';

export function Analytics() {
  const { title, paragraphs, loading } = useAnalytics();

  return (
    <ServiceSection
      id="analytics-section"
      label="Analytics & Conversion Tracking"
      title={title || 'Analytics & Conversion Tracking'}
      paragraphs={paragraphs}
      loading={loading}
      heroBackground
      to="/services/analytics-conversion-tracking"
    >
      <SectionModel
        src="/models/Google_Analytics.glb"
        rotation={[0.1, 0.3, 0]}
        yOffset={0.21}
        className="h-[300px] sm:h-[380px] lg:h-[480px]"
      />
    </ServiceSection>
  );
}
