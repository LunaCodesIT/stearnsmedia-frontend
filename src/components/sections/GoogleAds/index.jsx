import { useGoogleAds } from '@/hooks/useGoogleAds';
import { ServiceSection } from '@/components/ui/ServiceSection';
import { SectionModel } from '@/components/three/SectionModel';

export function GoogleAds() {
  const { title, paragraphs, loading } = useGoogleAds();

  return (
    <ServiceSection
      id="google-ads-section"
      label="Paid Search"
      title={title || 'Google Ads'}
      paragraphs={paragraphs}
      loading={loading}
    >
      <SectionModel
        src="/models/Google_Ads.fbx"
        className="h-[300px] sm:h-[380px] lg:h-[480px]"
      />
    </ServiceSection>
  );
}
