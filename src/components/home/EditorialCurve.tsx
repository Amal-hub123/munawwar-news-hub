import { cn } from "@/lib/utils";

interface EditorialCurveProps {
  className?: string;
  flip?: boolean;
}

export const EditorialCurve = ({ className, flip = false }: EditorialCurveProps) => (
  <svg
    viewBox="0 0 1200 180"
    preserveAspectRatio="none"
    aria-hidden="true"
    className={cn("editorial-curve", flip && "-scale-x-100", className)}
  >
    <path
      pathLength="1"
      d="M-40 132 C160 12 338 22 498 102 C672 190 824 190 1240 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

export default EditorialCurve;