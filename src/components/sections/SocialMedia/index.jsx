import { useSocialMedia } from '@/hooks/useSocialMedia';
import { ServiceSection } from '@/components/ui/ServiceSection';
import { SocialLogoCluster } from '@/components/three/SocialLogoCluster';

export function SocialMedia() {
  const { title, paragraphs, loading } = useSocialMedia();

  return (
    <ServiceSection
      id="social-media-section"
      label="Social Media Marketing"
      title={title || 'Social Media'}
      paragraphs={paragraphs}
      loading={loading}
      reverse
      heroBackground
      to="/services/social-media"
    >
      <SocialLogoCluster className="h-[300px] sm:h-[380px] lg:h-[480px]" />
    </ServiceSection>
  );
}
