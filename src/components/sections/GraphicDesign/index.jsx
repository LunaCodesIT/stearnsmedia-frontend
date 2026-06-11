import { useGraphicDesign } from '@/hooks/useGraphicDesign';
import { ServiceSection } from '@/components/ui/ServiceSection';
import { SectionModel } from '@/components/three/SectionModel';

export function GraphicDesign() {
  const { title, paragraphs, loading } = useGraphicDesign();

  return (
    <ServiceSection
      id="graphic-design-section"
      label="Creative Studio"
      title={title || 'Graphic Design'}
      paragraphs={paragraphs}
      loading={loading}
    >
      {/* Layered composition: paint brushes behind, laptop in front */}
      <div className="relative h-[300px] sm:h-[380px] lg:h-[480px]">
        <SectionModel
          src="/models/Graphic_Design_Brush.glb"
          fit={2.1}
          rotation={[0.1, 0.45, 0]}
          className="absolute inset-0"
        />
        <SectionModel
          src="/models/Graphics_Laptop.glb"
          fit={1.4}
          rotation={[0.15, -0.35, 0]}
          className="absolute inset-0 z-10"
        />
      </div>
    </ServiceSection>
  );
}
